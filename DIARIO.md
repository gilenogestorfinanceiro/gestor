# Diário de Bordo Técnico — Gileno Gestão Financeira
**Atualizado em:** 12/03/2026  
**Versão atual:** Beta v2.9.43 | Produção v2.9.37

---

## INFORMAÇÕES DO PROJETO

| Item | Valor |
|---|---|
| Repositório GitHub | https://github.com/gilenogestorfinanceiro/gestor |
| Repositório local Mac | `~/gestor` |
| URL Produção | https://gilenogestorfinanceiro.github.io/gestor/ |
| URL Beta | https://gilenogestorfinanceiro.github.io/gestor/beta/ |
| Firebase Produção | `gestor-financeiro-pessoa-90a13` (Blaze) |
| Firebase Beta | `gestor-financeiro-beta` (Spark) |
| UID Gileno Beta | `WPt1n2dZSGNxpOA2azPWgpRWk5u1` |

---

## CORREÇÕES v2.9.43-BETA

### Fix 1 — importJSON: confirmação dupla antes de sobrescrever dados (SEGURANÇA)
- Antes: clicava no arquivo e dados eram substituídos instantaneamente sem aviso
- Agora: mostra quantos lançamentos serão perdidos + exige 2 confirmações
- Mensagem 1: "X lançamentos e Y compras serão perdidos. Confirma?"
- Mensagem 2: "SEGUNDA CONFIRMAÇÃO: Tem certeza absoluta?"

### Fix 2 — importJSON: validação de estrutura mínima (SEGURANÇA)
- Antes: qualquer .json era aceito, podendo corromper D silenciosamente
- Agora: valida que o arquivo tem pelo menos tx, cp ou bs antes de prosseguir
- Arquivo inválido exibe: "Arquivo inválido: não é um backup do Gestor Financeiro"

---

## CORREÇÕES v2.9.42-BETA

### Fix 1 — Botão lápis explícito na Agenda
### Fix 2 — Perda de dados por debounce (1s → 2s + flush beforeunload)
### Fix 3 — sincronizarFaturasEmAberto protegia edições com userEdited + _doneMap
### Fix 4 — Edição de evento sincroniza tx vinculada
### Fix 5 — confirmarEfetivar com nova data atualiza tx.m e tx.y
### Fix 6 — Auto-update sem ?v=XXXX (Service Worker com postMessage NEW_VERSION)

---

## AUTO-UPDATE — COMO FUNCIONA (IMPORTANTE)

```
1. Você sobe nova versão no GitHub (index.html + sw.js com CACHE_VERSION nova)
2. Usuário abre o app → SW detecta versão diferente no servidor
3. SW baixa os arquivos novos em background (Network-first)
4. SW envia mensagem { type: 'NEW_VERSION' } para o app
5. App recarrega automaticamente após 1 segundo
6. Usuário vê a versão nova sem fazer nada
```

REGRA OBRIGATÓRIA: sempre mudar CACHE_VERSION no sw.js junto com a versão do index.html.

---

## ANÁLISE DE SEGURANÇA — PRODUÇÃO (12/03/2026)

| Vulnerabilidade | Severidade | Status |
|---|---|---|
| importJSON sem confirmação | CRÍTICO | ✅ Corrigido v2.9.43 |
| importJSON sem validação de estrutura | MÉDIO | ✅ Corrigido v2.9.43 |
| API Key Firebase visível no código | INFO | ✅ Normal Firebase — protegido pelas Rules |
| sincronizarFaturasEmAberto limpeza nuclear | MÉDIO | ✅ Mitigado v2.9.42 — refactor planejado v2.10.0 |
| clearAll sem confirmação | CRÍTICO | ✅ Já tinha dupla confirmação |

---

## DÉBITO TÉCNICO — v2.10.0 (planejado)

Refatorar sincronizarFaturasEmAberto de "apaga tudo e recria" para upsert por chave.
Impacto alto — requer versão dedicada com testes completos.

---

## BUGS RESOLVIDOS

| Bug | Versão | Status |
|---|---|---|
| Tela preta nas páginas | v2.9.41 | ✅ OK |
| FirebaseError userActivity | v2.9.41 | ✅ OK |
| API Key Firebase Beta exposta | v2.9.41 | ✅ OK |
| Botão lápis sumiu da Agenda | v2.9.42 | ✅ OK |
| Atualizações perdidas (debounce) | v2.9.42 | ✅ OK |
| sincronizar() apagava edições | v2.9.42 | ✅ OK |
| Edição de evento não atualizava tx | v2.9.42 | ✅ OK |
| confirmarEfetivar perdia m/y | v2.9.42 | ✅ OK |
| Cache manual ?v=XXXX necessário | v2.9.42 | ✅ OK — auto-update |
| importJSON sem confirmação | v2.9.43 | ✅ OK |
| importJSON sem validação | v2.9.43 | ✅ OK |

---

## PRÓXIMOS PASSOS

1. Testes completos no beta v2.9.43
2. Validar fluxo: Cartão → Agenda → Efetivar → Extrato
3. Validar edição de evento de agenda
4. Validar auto-update (subir versão e ver se recarrega sozinho)
5. Responder sugestão Patricio Mackson (recebimento parcial)
6. Corrigir bug botão Responder em sugestões não lidas
7. Quando testes OK → promover para produção v2.9.43 (produção atual: v2.9.37)
8. Planejar v2.10.0 com refatoração do sincronizarFaturasEmAberto

---

## COMO FAZER DEPLOY

```bash
cd ~/gestor
git pull
cp ~/Downloads/index.html beta/index.html
cp ~/Downloads/sw.js beta/sw.js
cp ~/Downloads/DIARIO.md DIARIO.md
git add beta/index.html beta/sw.js DIARIO.md
git commit -m "descricao - vX.X.XX-BETA"
git push
```

---

## REGRAS ANTI-CASCATA

- NUNCA operações destrutivas sem dry-run e confirmação dupla
- NUNCA save() dentro de funções que iteram arrays
- SEMPRE flags de proteção antes de limpar dados (userEdited, done)
- SEMPRE sincronizar campos derivados (m, y) ao alterar datas
- SEMPRE mudar CACHE_VERSION no sw.js junto com a versão do index.html
- NUNCA editar direto em produção — sempre passar pelo beta
