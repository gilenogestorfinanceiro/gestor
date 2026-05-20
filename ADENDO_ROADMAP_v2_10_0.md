# ADENDO AO ROADMAP_v2.10.0

**Data:** 2026-05-20
**Origem:** Pessoal GG 4.7.9 (alinhamento pós-auditoria CC)
**Documento mãe:** ROADMAP_v2.10.0.md
**Documento de auditoria que motivou este adendo:** AUDITORIA_V2_10_0_20260520.md
**Status:** Decisões cravadas, aguardando data da Sessão A.

---

## CONTEXTO

A auditoria CC de 20/05/2026 (75min, read-only) identificou que o ROADMAP_v2.10.0 estava **correto no espírito mas incompleto no escopo**. A função `sincronizarFaturasEmAberto()` tem 5 bugs latentes, e o refactor "upsert por chave" sozinho **não resolve o bug principal** (Achado #1 — faturas futuras de parcelamento longo invisíveis).

Este adendo registra as decisões executivas tomadas pelo Gileno em alinhamento com Pessoal GG estratégico, em resposta às 5 perguntas em aberto da §6 da auditoria.

---

## RESPOSTAS ÀS 5 PERGUNTAS EM ABERTO

### Pergunta 1 — Patch pré-refactor para Bug #5 (reopen→duplicata)?

**Decisão: NÃO. Esperar refactor v2.10.0.**

Justificativa:
- Operação de reopen é rara; chance pequena de algum dos 7 usuários ativos acionar nos ~10 dias até refactor.
- Patch cirúrgico em `index.html:2974` fora de sessão dedicada rompe a Regra 4 ("não tocar na função fora de v2.10.0"), criada justamente para evitar acidente em função-tabu.
- Cada release tem custo operacional (CACHE_VERSION, validação Mac+iPhone, anti-Luan-Muniz).
- Tradeoff favorável: 10 dias de exposição mínima vs disciplina de não fragmentar.

---

### Pergunta 2 — Script read-only para mapear eventos "Fatura ..." de usuário (Bug #2)?

**Decisão: SIM. Rodar script antes ou no início da Sessão A.**

Justificativa:
- Resultado binário muda escopo: 0 ocorrências = bug teórico (sem ação); ≥1 = migração de dados necessária no refactor.
- 30min de read-only é trivial e produz informação concreta vs aposta.
- Pode rodar como tarefa preparatória da Sessão A ou como sessão CC curta independente.

**Escopo do script:**
- Read-only no Firestore.
- Para cada uma das 35 contas: listar eventos onde `title.startsWith('Fatura ')` E NÃO tem `isFaturaEvent=true`.
- Output: contagem + IDs (sem expor dados sensíveis).
- Se ≥1 ocorrência, anexar lista de IDs ao plano de migração legacy.

---

### Pergunta 3 — Range derivado de `D.cp` vs janela fixa expandida?

**Decisão: Range derivado COM cap em `max(24 meses retroativos, oldest cp.st!=='paga')`.**

Justificativa:
- Range derivado puro tem worst case patológico se houver cp órfão antigo (2024+).
- Janela fixa ignora o "fim natural" do range (a fatura existe ou não existe).
- Solução híbrida pega o melhor:
  - Cobre 99% dos casos reais com range derivado.
  - Limita worst case com cap em 24 meses retroativos.
  - Cap só aciona em casos patológicos (cp esquecido de 2+ anos).

**Pseudo-código da regra:**
```
oldestCpAberto = min(D.cp.filter(c => c.st !== 'paga').map(c => Date(c.y, c.m, 1)))
cap24m = today - 24 months
rangeStart = max(oldestCpAberto, cap24m)
rangeEnd = max(D.cp.filter(c => c.st !== 'paga').map(c => Date(c.y, c.m, 1)))
```

---

### Pergunta 4 — Migração legacy `venc_*`: separada em v2.9.64 ou incluída em v2.10.0?

**Decisão: INCLUIR em v2.10.0. Não fragmentar release.**

Justificativa (discorda do CC, que sugeriu separar):
- Escopo v2.10.0 já é 10-13h; +1h de migração legacy é 10% de incremento, aceitável.
- Fragmentar em duas releases custa duas validações Mac+iPhone, duas anti-Luan-Muniz, dois CACHE_VERSION bumps.
- Releases agregam mudanças relacionadas; migração legacy resolve Bug #3 do mesmo problema raiz que o refactor.
- Migração legacy é one-shot com flag de idempotência → risco zero de re-execução.
- Mantém disciplina da Regra 4 (uma única release toca na função).

**Implementação:**
- Adicionar passo em `migrateData` ([index.html:1038](index.html:1038)).
- Flag `_legacyFaturasCleaned=true` no `D` para garantir idempotência.
- Mapeia `venc_*` para nova chave `(card, m, y)` preservando `done=true` quando aplicável.

---

### Pergunta 5 — Telemetria mínima durante shadow mode?

**Decisão: SIM. Implementar logging de diffs no Firestore com TTL de 30 dias.**

Justificativa:
- "Logar manualmente no console" para 7 usuários ativos × 5-7 dias é frágil:
  - Esquecimento de abrir console.
  - Diff perdido entre sessões do usuário.
  - Visibilidade apenas parcial.
- 1h de implementação vs cobertura confiável de 5-7 dias = ROI altíssimo.
- Document Firestore `diagnostics/sincronizar_v2/{userId}/{timestamp}` com TTL 30 dias = zero overhead operacional.
- Reduz risco de release ruim para produção.

**Escopo do logging:**
- Para cada call de `sincronizarFaturasEmAbertoV2` em paralelo com V1, calcular diff entre estado resultante V1 e V2.
- Se diff não-trivial, gravar:
  - `userId`, `timestamp`, `callSite` (1-8), `diffSummary` (counts), `diffDetails` (sample limitado).
- Document com TTL configurado para auto-delete em 30 dias.
- Custo de leitura no shadow: zero (V1 continua sendo source of truth).

---

## AJUSTES AO ESCOPO E ESTIMATIVA

### Mudanças vs ROADMAP_v2.10.0 original

| Item | ROADMAP original | Após auditoria + decisões |
|---|---|---|
| Escopo Sessão A | Definir chave + V2 paralela + script de validação | **+** range derivado + dedupe pré-push + eliminar match por título + telemetria Firestore |
| Migração legacy `venc_*` | Indefinido | Incluído em v2.10.0 (+1h) |
| Telemetria shadow mode | Manual via console | Firestore TTL 30 dias (+1h) |
| Script Bug #2 mapping | Não previsto | +30min (antes ou início Sessão A) |
| Patch pré-v2.10.0 | Não previsto | **Não terá** (decisão P1) |
| Total CC ativo | 9-13h em 3 sessões | **11-14h em 3-4 sessões** |
| Tempo calendário | ~10 dias | **~10 dias** (shadow mode continua sendo o gargalo) |

### Distribuição revisada por sessão

| Sessão | Trabalho | Estimativa CC |
|---|---|---|
| **A.0** (prep) | Script read-only mapeamento Bug #2 + análise resultado | **30min-1h** |
| **A** | Definir chave + V2 paralela + range derivado + dedupe + migração legacy + telemetria Firestore + script de validação contra dump local | **4-5h** |
| **B** | Shadow mode: integrar V2 nas 8 call sites em paralelo, deploy v2.9.65-shadow | **2-3h** |
| **C** | Analisar logs do Firestore shadow, ajustar V2 se necessário, switch para V2 source-of-truth, remover V1, deploy v2.10.0 | **3-5h** |
| **D** | Rollout canário (Gileno → Luan → resto), monitoramento | **2h ativos + acompanhamento passivo** |

**Total revisado:** 11-14h CC ativo em 3-4 sessões / ~10 dias calendário.

---

## INVARIANTES E REGRAS QUE PERMANECEM

1. **Regra 4: não tocar em `sincronizarFaturasEmAberto()` fora desta release.** Mantida.
2. **Shadow mode obrigatório.** Não-negociável.
3. **Backup fresh** minutos antes do switch V2 source-of-truth.
4. **Rollback** praticado ao menos uma vez antes do canário.
5. **Canário humano:** Gileno → Luan → resto. 24h por degrau.
6. **Anti-Luan-Muniz** em qualquer commit que toque `index.html`.
7. **CACHE_VERSION bump coerente** sw.js + index.html em todo release.
8. **DIARIO.md + STATUS.md + RELEASE_CHECKLIST.md** atualizados a cada release intermediária (v2.9.65-shadow, v2.10.0).

---

## DECISÕES PENDENTES (para fechar antes de marcar Sessão A)

- [ ] **Data da Sessão A.0 (script Bug #2)** — pode ser sessão CC curta autônoma, antes ou no início da Sessão A.
- [ ] **Data da Sessão A** — pré-requisitos: Yuri estabilizado (alta + 48h sem intercorrência), janela de 4-5h dedicadas, sem outras frentes urgentes ativas.
- [ ] **Backup fresh** — confirmar que backup automático está rodando na data marcada; rodar backup manual minutos antes da Sessão A.

---

## PRÓXIMO PASSO

Quando o Gileno tiver janela mental + tempo CC + Yuri estável → marcar Sessão A.0 (curta, autônoma) seguida de Sessão A.

Não há trabalho intermediário sobre `sincronizarFaturasEmAberto()` enquanto isso. Função fica intocada até a sessão dedicada.

---

**Fim do adendo.**
