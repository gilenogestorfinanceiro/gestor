# ROADMAP v2.10.0 — Refactor `sincronizarFaturasEmAberto()`

**Status:** rascunho, aguardando revisão. Não commitar até validação do Gileno.
**Origem:** sessão de 09/05/2026 (Claude Code Desktop, Opus 4.7).
**Objetivo:** trocar o padrão "apaga tudo e recria" por upsert por chave determinística, sem corromper os dados dos 35 usuários reais.

---

## Contexto

A função `sincronizarFaturasEmAberto()` no `index.html` hoje apaga e recria faturas em aberto. v2.9.50 já provou que expandir o range de meses sem refatorar gera duplicatas (foi revertida em v2.9.51). O refactor para upsert por chave é pré-requisito de qualquer melhoria nessa função, e está marcado como Débito Técnico no `STATUS.md`.

**Risco:** corrupção de dados financeiros em escala (35 usuários reais, 7 ativos por semana).

---

## Os 3 cuidados críticos (em ordem cronológica obrigatória)

### 1. Chave de upsert determinística — e validada antes do deploy

Coração técnico do refactor. Se a chave que define "este registro é o mesmo que aquele" usar campos voláteis (índice de array, timestamp de criação, ID gerado em runtime), a v2 duplica ou sobrescreve igual a v1 e o refactor não serve pra nada.

A chave precisa vir de campos imutáveis do domínio (composição provável: cartão + mês + ano de referência). Antes de qualquer escrita, rodar um script contra um dump do Firestore que prove pros 35 usuários: a chave produz N entradas únicas, sem colisão e sem órfão.

### 2. Shadow mode antes do switch destrutivo

Não substituir a função antiga. Escrever `sincronizarFaturasEmAbertoV2()` separada e rodar em modo read-only — só calcula e loga o diff vs. estado atual, não escreve. Por alguns dias em produção, com os 7 ativos exercitando a função naturalmente. Só depois do diff bater limpo é que vira escrita.

Evidência empírica > teste local, especialmente em estado real que ninguém previu.

### 3. Canário humano + rollback praticado

Backup fresh minutos antes do deploy (não o backup do dia anterior). Restore precisa ter sido testado UMA VEZ antes de precisar — backup que ninguém praticou restaurar é teatro.

Ativação em ordem: Gileno (1 usuário, conta com olho calibrado) → Luan (UID conhecido, pessoa avisável) → resto. Em cada degrau, validar antes de avançar.

---

## Estimativas

Chutes calibrados — função ainda não foi lida em detalhe. Podem variar conforme a forma real do dado.

| Item | Trabalho ativo | Calendário |
|---|---|---|
| 1. Chave de upsert + validação | 3-4h | 1 sessão |
| 2. Shadow mode (escrever + deploy) | 3-4h | 1 sessão |
| 2b. Observação do shadow + análise do diff | 1-2h | 2-7 dias passivos |
| 3. Restore praticado + canário (setup + rollout) | 2-3h ativos + acompanhamento | 1 sessão de setup + 3-7 dias de rollout |

---

## Veredito: 3 sessões, não 1

Não cabe numa sessão única. Quebra em **3 sessões espalhadas em 1-2 semanas de calendário.**

- **Sessão A** — Item 1 inteiro. Gate pro resto. Se a chave não fechar limpa nos 35 usuários, não passa daqui. Risco de spiral: encontrar usuário com dado histórico bagunçado e ter que decidir se conserta os dados ou ajusta a chave.
- **Sessão B** — Item 2 setup. Deploy do shadow mode em produção. Fim de sessão — depois disso é tempo de calendário aguardando os 7 ativos exercitarem a função.
- **Sessão C** — analisar diffs do shadow + Item 3 (praticar restore, montar canário, ativar pra Gileno). Rollout pro Luan e resto fica fora da sessão, é acompanhamento de minutos por dia.

**Onde pode estourar pra 4 sessões:** se o shadow mode revelar que a chave está errada em algum caso real, volta pra Sessão A com mais informação. Isso é bom — é exatamente pra isso que o shadow existe.

---

## Calendário sugerido

| Dia | Sessão | Trabalho |
|---|---|---|
| Segunda (D+0) | A | Definir chave + validar contra dump dos 35 usuários |
| Terça (D+1) | B | Escrever shadow mode + deploy em produção |
| Quarta-domingo (D+2 a D+6) | — | Observação passiva do shadow (zero trabalho ativo) |
| Segunda (D+7) | C | Analisar diffs + praticar restore + canário em Gileno |
| Terça-domingo (D+8 a D+13) | — | Rollout Luan → resto, acompanhamento de minutos por dia |

**Total:** ~10 dias do "decidi fazer" até "v2.10.0 ativa pros 35 usuários".

---

## Pré-requisitos antes de iniciar Sessão A

- Backup fresh feito minutos antes da Sessão A (não reusar backup antigo).
- Sessão dedicada exclusiva — não misturar com outros bugs/features.
- Dump do Firestore disponível localmente para o script de validação da chave.
- `RELEASE_CHECKLIST.md` revisado e na cabeça.
- Comunicação rollout silencioso confirmada com Gileno (decisão consciente, não esquecimento).

---

## Riscos não cobertos por este plano (assumidos como aceitáveis)

- Janela de manutenção: com 7 ativos/semana, não vale parar o app — risco residual aceitável.
- Comunicação aos usuários: rollout é silencioso, sem notificação prévia. Se o canário detectar problema, ninguém além de Gileno e Luan foi exposto.
- Migração simultânea pro Next.js + Supabase: explicitamente fora de escopo. v2.10.0 é refactor cirúrgico no app atual, não substituição.
