# Diário de Bordo Técnico — Gileno Gestão Financeira
**Atualizado em:** 12/03/2026  
**Versão atual:** Beta v2.9.42 | Produção v2.9.37

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
| UID Gileno Produção | `9NWXXOwHHUSrxEg7Ygw226zsuHj1` |
| UID Gileno Beta | `WPt1n2dZSGNxpOA2azPWgpRWk5u1` |
| GitHub PAT | *(armazenado localmente — nao commitar)* |

---

## CORRECOES v2.9.42-BETA

### Fix 1 — Botao lapis explicito na Agenda
- Adicionado botao visivel em cada evento
- Faturas mostram 💳 (abre pagamento), eventos comuns mostram ✏️ (abre edicao)

### Fix 2 — Perda de dados por debounce
- Debounce 1s -> 2s
- Adicionado beforeunload: flush do save pendente antes de fechar a pagina
- Operacoes rapidas em sequencia nao perdem mais dados

### Fix 3 — sincronizarFaturasEmAberto apagava edicoes manuais
- Flag userEdited=true protege eventos editados pelo usuario
- _doneMap preserva status done ao recriar eventos de fatura

### Fix 4 — Edicao de evento nao atualizava tx vinculada
- Salvar edicao agora sincroniza valor, data, desc, cat, sub, banco na tx

### Fix 5 — confirmarEfetivar com data diferente perdia mes/ano
- Atualiza tx.m e tx.y ao confirmar com nova data

### Fix 6 — Auto-update sem ?v=XXXX manual (DEFINITIVO)
- sw.js reescrito com estrategia Network-first + notificacao de versao
- Ao ativar nova versao, SW envia mensagem NEW_VERSION para todas as abas
- index.html ouve essa mensagem e recarrega automaticamente apos 1s
- Daqui pra frente: subir nova versao no GitHub = app atualiza sozinho
- Nao precisa mais de ?v=XXXX no celular, desktop ou PWA instalado

---

## COMO FUNCIONA O AUTO-UPDATE (IMPORTANTE)

```
1. Voce sobe nova versao no GitHub (index.html + sw.js com CACHE_VERSION nova)
2. Usuario abre o app -> SW detecta versao diferente no servidor
3. SW baixa os arquivos novos em background (Network-first)
4. SW envia mensagem { type: 'NEW_VERSION' } para o app
5. App recarrega automaticamente apos 1 segundo
6. Usuario ve a versao nova sem fazer nada
```

REGRA OBRIGATORIA: sempre mudar CACHE_VERSION no sw.js junto com a versao do index.html.
Se esquecer de mudar o sw.js, o auto-update NAO dispara.

---

## DEBITO TECNICO — v2.10.0 (planejado)

### Refatorar sincronizarFaturasEmAberto para upsert por chave
Problema atual: a funcao apaga tudo e recria (limpeza nuclear), chamada em 5 lugares.
Solucao planejada: upsert por agId — so atualiza o que mudou, nunca apaga dados validos.
Isso eliminara de vez o risco de cascata na sincronizacao de faturas.
Impacto: alto. Requer versao dedicada e testes completos antes de produzir.

---

## BUGS RESOLVIDOS

| Bug | Versao | Status |
|---|---|---|
| Tela preta nas paginas | v2.9.41 | OK |
| FirebaseError userActivity | v2.9.41 | OK |
| API Key Firebase Beta exposta | v2.9.41 | OK |
| Botao lapis sumiu da Agenda | v2.9.42 | OK |
| Atualizacoes perdidas (debounce) | v2.9.42 | OK |
| sincronizar() apagava edicoes | v2.9.42 | OK |
| Edicao de evento nao atualizava tx | v2.9.42 | OK |
| confirmarEfetivar perdia m/y | v2.9.42 | OK |
| Cache manual ?v=XXXX necessario | v2.9.42 | OK — auto-update implementado |

---

## PROXIMOS PASSOS

1. Testes completos no beta v2.9.42
2. Validar fluxo: Cartao -> Agenda -> Efetivar -> Extrato
3. Validar edicao de evento de agenda
4. Validar auto-update (subir versao e ver se recarrega sozinho)
5. Responder sugestao Patricio Mackson (recebimento parcial)
6. Corrigir bug botao Responder em sugestoes nao lidas
7. Quando testes OK -> promover para producao v2.9.42
8. Planejar v2.10.0 com refatoracao do sincronizarFaturasEmAberto

---

## ESTRATEGIA DE DEPLOY SEM ERRO EM CASCATA

### Regra de Ouro
BETA -> Testes -> Aprovacao -> Producao (nunca editar direto em producao)

### Versionamento
v2.MAJOR.MINOR-BETA
  MAJOR: mudancas estruturais (novo modulo, refactor)
  MINOR: fixes e melhorias incrementais
  -BETA: sufixo obrigatorio ate aprovacao

### Checklist obrigatorio antes de qualquer deploy
- git pull antes de qualquer edicao
- Toda mudanca via str_replace (nunca reescrever arquivo inteiro)
- Verificar balanco de divs apos edicao HTML
- SEMPRE atualizar CACHE_VERSION no sw.js junto com a versao
- Testar no beta ANTES de promover para producao
- DIARIO.md sempre atualizado com o que foi feito

### Regras anti-cascata
- NUNCA operacoes destrutivas sem dry-run e confirmacao dupla
- NUNCA save() dentro de funcoes que iteram arrays (risco de loop)
- SEMPRE flags de protecao antes de limpar dados (userEdited, done)
- SEMPRE sincronizar campos derivados (m, y) ao alterar datas
- NUNCA editar direto em producao — sempre passar pelo beta

---

## COMO FAZER DEPLOY

```bash
cd ~/gestor
git pull
cp ~/Downloads/index.html beta/index.html
cp ~/Downloads/sw.js sw.js
cp ~/Downloads/DIARIO.md DIARIO.md
git add beta/index.html sw.js DIARIO.md
git commit -m "descricao clara do que foi feito - vX.X.XX-BETA"
git push
```

---

## ARQUITETURA RESUMIDA

- Stack: HTML/CSS/JS puro, Firebase Firestore, GitHub Pages, Service Worker
- Arquivo unico: index.html (sem frameworks)
- Dados em objeto D, persistido no Firestore com debounce de 2s
- Funcoes: goPage(), refresh(), rDash(), rExt(), rAgenda(), rCard(), loadFromCloud(), save()
- Paginas: page-dash, page-ext, page-add, page-agenda, page-card, page-cfg, page-invest, page-sobre, page-sug
- SW: estrategia Network-first com auto-update por postMessage

## Firebase Beta Credentials
```javascript
apiKey: "AIzaSyDPt3PE5a6XHNKfNDlfVvWqwT66_55hOF0"
authDomain: "gestor-financeiro-beta.firebaseapp.com"
projectId: "gestor-financeiro-beta"
```
