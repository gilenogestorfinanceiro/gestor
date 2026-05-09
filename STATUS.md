# STATUS — Gestor Financeiro

**Última atualização:** 09/05/2026
**Documento canônico do estado do projeto.** Para histórico completo ver
`DIARIO.md`. Para procedimento de deploy ver `RELEASE_CHECKLIST.md`.

---

## ESTADO ATUAL

| Item | Valor |
|---|---|
| Versão produção | **v2.9.62** |
| Versão admin | **v1.3.0** |
| URL produção | https://gilenogestorfinanceiro.github.io/gestor/ |
| URL admin | https://gilenogestorfinanceiro.github.io/gestor/admin.html |
| Repositório | https://github.com/gilenogestorfinanceiro/gestor (público) |
| Stack | HTML/CSS/JS puro + Firebase Firestore + GitHub Pages + Service Worker |
| Firebase produção | `gestor-financeiro-pessoa-90a13` (plano Blaze) |
| Usuários totais | 35 |
| Usuários ativos (semana) | 7 (23 mobile + 12 desktop no total) |
| Backup mais recente | 06/05/2026 15:26 — `~/Downloads/backup_dados_2026-05-06.json` |

---

## BUGS ABERTOS

| # | Bug | Prioridade | Notas |
|---|---|---|---|
| — | `sincronizarFaturasEmAberto()` só verifica 3 meses | Alta | Requer refactor upsert (v2.10.0); ver Débito Técnico |
| — | SW de produção intercepta `/beta/` no iPhone | Média | **Relacionado à investigação do beta abandonado** — possível vetor do incidente original |
| — | Sugestão Patricio Mackson — recebimento parcial | Baixa | Feature request, não bug stricto |

> Bug 3 (catch silencioso em `loadFromCloud()`) foi resolvido em v2.9.62 (09/05/2026).
> Bug 4 (CACHE_VERSION dessincronizado) foi resolvido em v2.9.61 (06/05/2026).
> Bug 1, Bug 2 e demais bugs históricos estão fechados ou foram absorvidos no DIARIO.md sem numeração persistente.

---

## DÉBITO TÉCNICO

### v2.10.0 — refactor `sincronizarFaturasEmAberto()` (Regra 4 anti-cascata)

Função atual: "apaga tudo e recria". Refactor obrigatório para upsert por
chave antes de qualquer expansão de range. v2.9.50 já provou que expandir
sem refatorar gera duplicatas e foi revertido.

**Risco:** corrupção de dados em escala (35 usuários reais).
**Sessão:** dedicada, com backup recente, dry-run, confirmação dupla por etapa.

### Beta abandonado em v2.9.46 — NÃO REATIVAR sem investigação completa

`beta/index.html` e `beta/sw.js` estão 14 versões atrás de produção
(v2.9.46 vs v2.9.61). Foi abandonado após incidente histórico em que
usuários reais cadastraram dados no projeto Firebase de beta em vez de
produção. Causa raiz não investigada, destino dos dados não documentado.

**Reativar a Regra 6 só com TODOS os pré-requisitos cumpridos** —
ver `RELEASE_CHECKLIST.md` seção "Quando reativar a Regra 6".

### Service Worker — colisão de cache prod/beta

O bug "SW de produção intercepta `/beta/` no iPhone" sugere que o
`gestor-cache-vX.Y.Z` pode estar atendendo requisições destinadas ao beta.
Investigar se há colisão de escopo entre os dois SWs. **Diagnóstico
obrigatório** antes de qualquer reativação do beta — pode ser parte da
causa raiz do incidente original.

---

## INVESTIGAÇÕES PENDENTES (sessão futura)

Bloqueiam reativação do beta e da Regra 6. Recomendado em sessão dedicada
única (todas relacionadas).

1. **Causa raiz do incidente do beta** — como usuários reais migraram da
   produção para o beta? Link compartilhado? Cache do SW (ver bug acima)?
   Bookmark antigo? Push notification mal direcionada?
2. **Auditoria do projeto Firebase `gestor-financeiro-beta`** — quantos
   usuários, quais dados, decisão sobre destino (migrar para produção ou
   descartar formalmente).
3. **Plano de mitigação para reativação** — barreira no `beta/index.html`
   (banner permanente, confirmação ao login, redirect se UID conhecido) e
   cache name distinto no `beta/sw.js`.

---

## ROADMAP

### Curto prazo
- Exportar `Roadmap_Migracao_NextJS_Supabase.md` do knowledge do Projeto
  no claude.ai para o repositório (hoje só existe fora do repo, dificulta
  rastreabilidade).

### Médio prazo
- Migração Next.js + Supabase (plano detalhado em chat dedicado do GG;
  pendente exportar para repo em sessão futura).
- Sessão de investigação do beta (3 itens em "Investigações Pendentes" acima).
- Refactor `sincronizarFaturasEmAberto()` → upsert (v2.10.0).

### Longo prazo
- Decisão final sobre destino do beta (reativar com mitigações ou descontinuar).
- Migração concluída para Next.js + Supabase.

---

## ARQUIVOS DE REFERÊNCIA

| Arquivo | Função |
|---|---|
| `DIARIO.md` | Histórico completo de versões, sessões e decisões |
| `RELEASE_CHECKLIST.md` | Checklist obrigatório para todo deploy em produção |
| `STATUS.md` | Este arquivo — estado canônico do projeto |
| `index.html` | App de produção |
| `sw.js` | Service Worker de produção |
| `admin.html` | Painel administrativo |
| `beta/index.html`, `beta/sw.js` | Beta abandonado em v2.9.46 — não tocar sem investigação |

---

## HISTÓRICO DESTE DOCUMENTO

| Data | Versão | Mudança |
|---|---|---|
| 06/05/2026 | v1.0 | Criação na sessão de fix Bug 4 + correção sistêmica de processo (sessão GG Opus 4.7.3 + Claude Code Desktop) |
| 09/05/2026 | v1.1 | Bug 3 fechado em v2.9.62 (catch silencioso em `loadFromCloud()`); versão produção atualizada |
