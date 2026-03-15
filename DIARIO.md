# Diário de Bordo Técnico — Gileno Gestão Financeira
**Atualizado em:** 15/03/2026 — 09:00  
**Versão atual:** Beta v2.9.44 | Produção v2.9.43

---

## 🗂 INFORMAÇÕES DO PROJETO

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
| GitHub PAT | *(armazenado localmente — não commitar)* |

---

## SESSÃO 15/03/2026 — Promoção + Reset + v2.9.44

### O que foi feito

1. **Beta v2.9.43 promovido para produção** ✅
2. **Dados do Gileno zerados em produção** (tx, cp, bs) — categorias mantidas ✅
3. **v2.9.44 desenvolvida no beta** com duas correções críticas ✅

---

## O QUE MUDOU — v2.9.44 vs v2.9.43

### 1. Backup automático para TODOS os usuários ✅
**Antes:** backup automático rodava apenas para o admin (Gileno).
**Depois:** todos os usuários têm backup automático a cada 2h.

### 2. Backup isolado por UID ✅
**Antes:** todos os backups salvavam no mesmo path `backups/backup_auto` — um usuário sobrescrevia o do outro.
**Depois:** cada usuário salva em `backups/{uid}/auto/meta` e `backups/{uid}/auto/chunk_X`.
Estrutura:
```
backups/
├── {uid_gileno}/auto/meta + chunk_0...
├── {uid_usuario2}/auto/meta + chunk_0...
└── {uid_usuario3}/auto/meta + chunk_0...
```

### 3. Botão "Responder" sempre visível no painel admin ✅
**Antes:** botão só aparecia se a sugestão tinha email cadastrado.
**Depois:** botão aparece sempre — admin pode responder qualquer sugestão.

---

## BUGS RESOLVIDOS ACUMULADOS

| Bug | Versão | Status |
|---|---|---|
| Tela preta (páginas além do Painel) | v2.9.41 | ✅ Resolvido |
| Botão ✏️ explícito na Agenda | v2.9.42 | ✅ Resolvido |
| debounce 1s→2s + flush beforeunload | v2.9.42 | ✅ Resolvido |
| sincronizarFaturasEmAberto flag userEdited | v2.9.42 | ✅ Resolvido |
| saveAgenda sincroniza tx vinculada | v2.9.42 | ✅ Resolvido |
| confirmarEfetivar atualiza tx.m e tx.y | v2.9.42 | ✅ Resolvido |
| Auto-update SW com postMessage NEW_VERSION | v2.9.42 | ✅ Resolvido |
| importJSON sem confirmação | v2.9.43 | ✅ Resolvido |
| importJSON sem validação de estrutura | v2.9.43 | ✅ Resolvido |
| SW cacheando index.html (ciclo vicioso) | v2.9.43 | ✅ Resolvido |
| Flash com dados antigos no Dashboard | v2.9.43 | ✅ Resolvido |
| Backup só para admin | v2.9.44 | ✅ Resolvido |
| Backup sem isolamento por UID | v2.9.44 | ✅ Resolvido |
| Botão "Responder" ausente em sugestões | v2.9.44 | ✅ Resolvido |

---

## BUGS PENDENTES

| Bug | Prioridade |
|---|---|
| SW de produção intercepta /beta/ no iPhone | Média |
| Sugestão Patricio Mackson (recebimento parcial) | Baixa |
| Backup "Baixar" exporta HTML em vez de JSON | Média |

---

## DÉBITO TÉCNICO — v2.10.0 (planejado)

Refatorar `sincronizarFaturasEmAberto()` de "apaga tudo e recria" para **upsert por chave**.  
Impacto alto — requer versão dedicada com testes completos.  
**Nunca tocar nessa função sem dry-run e confirmação dupla.**

---

## PRÓXIMOS PASSOS

1. Testar v2.9.44 no beta (backup automático para todos, botão responder)
2. Promover v2.9.44 para produção
3. Gileno relança dados manualmente a partir de janeiro/2026
4. Corrigir bug "Baixar" backup (exporta HTML em vez de JSON)
5. Responder sugestão Patricio Mackson

---

## COMO FAZER DEPLOY

### Beta
```bash
cd ~/gestor
git pull
cp ~/Downloads/index.html beta/index.html
cp ~/Downloads/sw.js beta/sw.js
cp ~/Downloads/DIARIO.md DIARIO.md
git add beta/index.html beta/sw.js DIARIO.md
git commit -m "descrição - vX.X.XX-BETA"
git push
```

### Produção (promoção do beta)
```bash
cd ~/gestor
git pull
cp beta/index.html index.html
cp beta/sw.js sw.js
git add index.html sw.js DIARIO.md
git commit -m "promover vX.X.XX para producao"
git push
```

### Admin (quando mudar)
```bash
git add admin.html
git commit -m "fix admin - descrição"
git push
```

**Checklist obrigatório:**
- SEMPRE mudar `CACHE_VERSION` no `sw.js` junto com a versão
- NUNCA cachear `index.html` no SW (`cache: 'no-store'`)
- `skipWaiting()` fora do `.then()` na instalação
- Testar no beta ANTES de promover para produção
- NUNCA commitar tokens/secrets no DIARIO.md

---

## REGRAS ANTI-CASCATA

- NUNCA operações destrutivas sem dry-run e confirmação dupla
- NUNCA `save()` dentro de funções que iteram arrays
- SEMPRE flags de proteção antes de limpar dados (`userEdited`, `done`)
- SEMPRE sincronizar campos derivados (`m`, `y`) ao alterar datas
- NUNCA editar direto em produção — sempre passar pelo beta

---

## ARQUITETURA RESUMIDA

- Stack: HTML/CSS/JS puro, Firebase Firestore, GitHub Pages, Service Worker
- Arquivo único: `beta/index.html` (sem frameworks)
- Dados centralizados no objeto `D`, persistido no Firestore
- Funções principais: `goPage()`, `refresh()`, `rDash()`, `rExt()`, `rAgenda()`, `rCard()`, `loadFromCloud()`, `save()`
- Páginas: `page-dash`, `page-ext`, `page-add`, `page-agenda`, `page-card`, `page-cfg`, `page-invest`, `page-sobre`, `page-sug`

---

## Firebase Beta Credentials

```javascript
apiKey: "AIzaSyDPt3PE5a6XHNKfNDlfVvWqwT66_55hOF0"
authDomain: "gestor-financeiro-beta.firebaseapp.com"
projectId: "gestor-financeiro-beta"
```
