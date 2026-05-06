# RELEASE CHECKLIST — Gestor Financeiro

Documento operacional obrigatório para todo deploy em produção
(`https://gilenogestorfinanceiro.github.io/gestor/`).

Criado em 06/05/2026 após Bug 4 (CACHE_VERSION dessincronizado por 4 versões).
Objetivo: forçar consistência de versão e evitar regressões silenciosas.

> **Estado canônico do projeto:** ver `STATUS.md`.
> **Histórico de mudanças:** ver `DIARIO.md`.

---

## ANTES DO COMMIT

### 1. Bump de versão — três lugares, MESMO commit

Toda mudança que altera comportamento do app exige incremento de versão. Os
três pontos abaixo TÊM que subir juntos no mesmo commit:

- [ ] `sw.js` linha 3 — `const CACHE_VERSION = 'v2.9.XX';`
- [ ] `index.html` header — `<span style="font-size:10px">v2.9.XX</span>` (~linha 384)
- [ ] `index.html` rodapé — `Gileno - Gestão Financeira © 2026 · v2.9.XX` (~linha 891)

Verificação rápida:
```bash
grep -c "v2\.9\.XX" sw.js index.html
# esperado: sw.js:1  index.html:>=4
grep "v2\.9\.YY" sw.js index.html  # YY = versão anterior
# esperado: vazio (zero ocorrências residuais)
```

### 2. Strings de versão em backups (Firestore)

Se o commit toca `index.html`, conferir também:

- [ ] `index.html` linha ~1141 — `bkRef.set({version:'v2.9.XX', ...})` (backup rotativo)
- [ ] `index.html` linha ~1180 — `bkRef.set({version:'v2.9.XX', ...})` (backup manual)

Estas strings rotulam o backup gravado no Firestore. Devem refletir a
versão do código que produziu o backup.

### 3. DIARIO.md atualizado no MESMO commit

Regra 8: nada de "atualizo o DIARIO depois". Se a versão sobe, o DIARIO sobe.

- [ ] Nova entrada em `## SESSÃO DD/MM/AAAA` no topo do arquivo
- [ ] Cabeçalho atualizado (data + versão atual)
- [ ] Tabela `COMMITS RECENTES` reflete o commit pendente
- [ ] Bug resolvido movido de `BUGS PENDENTES` para "Bugs resolvidos nesta sessão"

### 4. Verificação anti-Luan Muniz (referência ao incidente do beta vazado)

Antes de qualquer deploy em produção, rodar os 3 greps. NENHUM pode retornar
configuração de beta no `index.html` da raiz:

```bash
grep -n "projectId" index.html
# esperado: APENAS gestor-financeiro-pessoa-90a13

grep -n "BETA" index.html
# esperado: vazio (sem rotulagem visual de beta)

grep -n "gestor-financeiro-beta" index.html
# esperado: vazio (sem URL/projectId de beta)
```

Se qualquer um retornar configuração de beta no `index.html` raiz, ABORTAR
o deploy. O incidente original promoveu beta para produção sem corrigir
credenciais e usuários reais cadastraram dados no projeto Firebase errado.

### 5. Diff técnico

- [ ] `git diff --stat` revisado — só os arquivos esperados foram tocados
- [ ] `git diff` lido linha por linha — nenhuma mudança não intencional
- [ ] `sincronizarFaturasEmAberto()` NÃO foi tocada (Regra 4 — débito técnico v2.10.0)

---

## COMMIT

- [ ] Mensagem segue padrão: `fix|feat|refactor: vX.Y.Z - descrição curta`
- [ ] Mensagem cita causa raiz se for fix
- [ ] Bug 4 nunca mais: a mensagem documenta os 3 pontos de versão tocados

---

## PUSH E DEPLOY

- [ ] `git push origin main`
- [ ] GitHub Pages publica em ~1-2 minutos
- [ ] **Validação pós-deploy** (mitigação para Regra 6 suspensa):
  - [ ] Hard refresh em https://gilenogestorfinanceiro.github.io/gestor/
  - [ ] Login com conta de teste OU verificação pelo admin.html
  - [ ] Header e rodapé mostram a nova versão
  - [ ] Console do navegador: `[SW] Ativando v2.9.XX` (nova versão)
  - [ ] Sem erros vermelhos no console nas operações principais (dashboard, agenda, cartões)

---

## REGRA 6 — DEPLOY BETA ANTES DE PRODUÇÃO

**STATUS: SUSPENSA desde 06/05/2026.**

### Por quê está suspensa

`beta/` está em v2.9.46, abandonado após incidente histórico em que usuários
reais cadastraram dados no beta em vez da produção. A causa raiz do
incidente NÃO foi investigada e o destino dos dados que ficaram no beta
NÃO foi documentado. Reativar a Regra 6 sem investigação reintroduz o
risco. Detalhes em `STATUS.md`.

### Mitigações substitutas (obrigatórias enquanto Regra 6 suspensa)

1. **Dry-run obrigatório** — antes de cada edição, descrever:
   o que muda, em quais arquivos, quais riscos, se afeta `CACHE_VERSION`.
2. **Validação pós-deploy** — checklist da seção "PUSH E DEPLOY" acima.
3. **Backup recente** — backup completo dos dados (admin.html → Exportar Dados)
   feito nas últimas 24h antes de qualquer mudança de alto risco.
4. **Sessão dedicada para alto risco** — refactors grandes
   (ex: `sincronizarFaturasEmAberto()` → upsert) em sessão isolada com
   confirmação dupla por etapa.

### Quando reativar a Regra 6

A Regra 6 só volta a vigorar quando TODOS os itens abaixo estiverem feitos:

- [ ] Investigação documentada da causa raiz do incidente do beta
      (como usuários chegaram lá? link compartilhado? cache do SW?)
- [ ] Auditoria do projeto Firebase `gestor-financeiro-beta`:
      quantos usuários, quais dados, decisão sobre destino (migrar/descartar)
- [ ] Mecanismo de barreira no `beta/index.html`:
      banner permanente, confirmação ao login, ou redirect se UID conhecido
- [ ] `beta/sw.js` com cache name distinto que não colide com produção
- [ ] Decisão registrada em `STATUS.md` e `DIARIO.md` reativando a Regra 6

Até lá: deploy direto em produção, com as 4 mitigações acima.

---

## REGRAS ANTI-CASCATA (resumo — versão completa em DIARIO.md)

- NUNCA tocar `sincronizarFaturasEmAberto()` sem refactor completo (v2.10.0)
- NUNCA `save()` dentro de loops
- NUNCA `saveImmediate()` dentro de `loadFromCloud()`
- NUNCA expandir range de meses sem refactor para upsert
- SEMPRE `cd ~/gestor` antes de comando git
- NUNCA commitar tokens/secrets

---

## HISTÓRICO DESTE DOCUMENTO

| Data | Mudança |
|---|---|
| 06/05/2026 | Criação após Bug 4 — Regra 6 suspensa, mitigações substitutas adotadas |
