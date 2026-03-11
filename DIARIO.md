# Diário de Bordo Técnico — Gileno Gestão Financeira
**Atualizado em:** 11/03/2026 — 16:50  
**Versão atual:** Beta v2.9.41 | Produção v2.9.37

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

## ✅ BUG CRÍTICO RESOLVIDO — v2.9.41-BETA

### Problema: Extrato, Agenda, Cartões e Mais não renderizavam

**Causa raiz encontrada:** Faltavam 2 `</div>` de fechamento no final do bloco `#page-dash`.

**Como foi diagnosticado:**
1. Console do navegador confirmou: `innerHTML.length: 1194`, `offsetHeight: 0`, `class: page active`
2. Script de debug percorreu ancestrais e encontrou: `#page-dash` com `display: none` como pai direto de `#page-ext`
3. Parser Python contou 51 `<div>` e apenas 49 `</div>` no bloco do `page-dash` — faltavam exatamente 2 fechamentos

**Correção aplicada (linha 442 do index.html):**
```html
<!-- ANTES (2 fechamentos) -->
</div>
</div>

<!-- DEPOIS (4 fechamentos — correto) -->
</div>
</div>
</div>
</div>
```

**Por que aconteceu:** As divs aninhadas dos cards do dashboard (Receitas por Categoria e Saldo das Contas) usavam um padrão de aninhamento que perdeu 2 fechamentos em alguma edição anterior.

---

## BUGS CONHECIDOS

### Bug 1 — ✅ RESOLVIDO: Páginas além do Painel com altura zero
**Versão:** v2.9.41-BETA

### Bug 2 — PENDENTE: FirebaseError userActivity
**Erro:** Missing or insufficient permissions em sincronizarFaturasEmAberto (beta:3743)  
**Solução:** Adicionar no Firestore beta (Console > Regras):
```
match /userActivity/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Bug 3 — PENDENTE: SW de produção intercepta /beta/ no iPhone
**Descrição:** Service Worker de produção bloqueia acesso ao beta no celular

---

## O QUE FOI FEITO NESTA SESSÃO (11/03/2026 — tarde)

### 1. Debug completo do bug de tela preta ✅
- Executado script de diagnóstico no console do Safari DevTools
- Identificada causa raiz: `#page-dash` sem 2 `</div>` de fechamento
- Todas as outras páginas estavam aninhadas dentro de `#page-dash`
- Quando `page-dash` ia para `display:none`, levava tudo junto

### 2. Correção do HTML — v2.9.41-BETA ✅
- Adicionados 2 `</div>` faltantes após o card `dashAgendaCard`
- Versão atualizada de v2.9.40 para v2.9.41

---

## PRÓXIMOS PASSOS

1. **[IMEDIATO]** Fazer deploy da v2.9.41-BETA e testar navegação entre todas as abas
2. Corrigir regras Firestore beta para userActivity (Bug 2)
3. Corrigir SW de produção para não interceptar /beta/ (Bug 3)
4. Testes completos de todas as funcionalidades no beta
5. Responder sugestão Patricio Mackson (recebimento parcial)
6. Corrigir bug botão "Responder" em sugestões não lidas
7. Quando testes OK → promover para produção v2.9.41

---

## COMO FAZER DEPLOY

```bash
cd ~/gestor
git pull
cp ~/Downloads/index.html beta/index.html
cp ~/Downloads/sw.js sw.js
git add beta/index.html sw.js DIARIO.md
git commit -m "fix: corrige tela preta - divs faltantes no page-dash - v2.9.41-BETA"
git push
```

**Regras:**
- SEMPRE git pull antes de push
- SEMPRE testar no BETA antes de produção
- NUNCA manipular D.bs diretamente (saldo calculado por bankBal())
- Usar str_replace para editar arquivos, nunca scripts Python

---

## ARQUITETURA RESUMIDA

- Stack: HTML/CSS/JS puro, Firebase Firestore, GitHub Pages, Service Worker
- Arquivo único: index.html (sem frameworks)
- Dados centralizados no objeto D, persistido no Firestore
- Funções principais: goPage(), refresh(), rDash(), rExt(), rAgenda(), rCard(), loadFromCloud(), save()
- Páginas: page-dash, page-ext, page-add, page-agenda, page-card, page-cfg, page-invest, page-sobre, page-sug
- CSS navegação: .page{display:none} .page.active{display:block}

## Firebase Beta Credentials
```javascript
apiKey: "AIzaSyDPt3PE5a6XHNKfNDlfVvWqwT66_55hOF0"
authDomain: "gestor-financeiro-beta.firebaseapp.com"
projectId: "gestor-financeiro-beta"
```
