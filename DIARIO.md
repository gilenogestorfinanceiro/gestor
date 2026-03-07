# Diário de Bordo — Gileno Gestão Financeira
**Última atualização:** 07/03/2026  
**Versão atual:** v2.9.12

---

## Estado atual do app

- **Repositório:** gilenogestorfinanceiro.github.io
- **Firebase projeto:** gestor-financeiro-pessoa-90a13
- **authDomain:** gestor-financeiro-pessoa-90a13.firebaseapp.com (manter assim)
- **Login:** signInWithPopup simples — funciona no Mac e iPhone

---

## O que foi feito nesta sessão (07/03/2026)

### v2.9.5 — Edição de recorrentes/parcelados
Ao alterar o **valor** de um lançamento recorrente ou parcelado, aparece modal:
- **✏️ Somente este lançamento**
- **⏩ Este e os próximos**

Se o valor não mudar (só categoria/descrição), vai direto sem perguntar.  
Funções: `_applyEdit(item, scope)`, modal `#editScopeModal`, `closeEditScopeModal()`.  
Cobre: recorrências de conta (`D.tx` com `recGroup`), parcelados de cartão (`parc`), recorrentes de cartão (`tipo=Recorrente`).

### v2.9.6~v2.9.10 — Login Google Safari/iOS (tentativas)
Várias abordagens falharam. Ver lição aprendida abaixo.

### v2.9.11 — Solução definitiva login iOS
**Problema raiz:** a `404.html` interceptava `/__/auth/handler` do Firebase e redirecionava para `/`, quebrando o OAuth do Safari iOS.  
**Solução:** 404.html detecta rotas `/__/` e redireciona para `firebaseapp.com`:
```js
if (window.location.pathname.indexOf('/__/') === 0) {
    window.location.replace(
      'https://gestor-financeiro-pessoa-90a13.firebaseapp.com' +
      window.location.pathname + window.location.search + window.location.hash
    );
}
```
`index.html` mantém `signInWithPopup` simples, sem detecção de browser.

### v2.9.12 — Sincronização Fatura/Agenda/Extrato restaurada
A função `sincronizarFaturasEmAberto()` havia sido perdida em restauração do arquivo.  
**Comportamento:**
- Ao carregar o app → cria eventos na agenda para faturas abertas (mês atual + próximo)
- Ao pagar/reabrir fatura → agenda sincronizada automaticamente
- Clicar no evento de fatura na agenda → abre direto o modal "Pagar Fatura"
- IDs fixos `agfat_NomeCartao_mes_ano` evitam duplicatas
- Flag `isFaturaEvent:true` identifica eventos gerados automaticamente

---

## Arquivos no repositório
| Arquivo | Descrição |
|---------|-----------|
| `index.html` | App principal v2.9.12 |
| `sw.js` | Service Worker v2.9.12 |
| `404.html` | Página de atualização + fix Firebase Auth |
| `DIARIO.md` | Este arquivo |

---

## Lições aprendidas críticas

1. **404.html intercepta TUDO no GitHub Pages** — incluindo rotas OAuth do Firebase (`/__/auth/*`). Sempre manter o redirect para `firebaseapp.com` nessas rotas.

2. **Nunca alterar `authDomain`** para o domínio do GitHub Pages — o handler OAuth não existe lá.

3. **`signInWithPopup` simples funciona** no Safari iOS desde que a 404.html não intercepte o retorno.

4. **Ao restaurar `index.html` do upload**, sempre reaplicar:
   - Versão no rodapé: `re.sub(r'(© 2026 · )v[\d.]+', r'\g<1>vX.X.X', h)`
   - headerUser com versão: substituir `.textContent='👤 '+currentUser` pela versão com `innerHTML` + span da versão
   - sw.js: `re.sub(r"CACHE_VERSION = '[^']+'", "CACHE_VERSION = 'X.X.X'", sw)`

5. **`D.bs` nunca manipular diretamente** — saldo calculado por `bankBal()`.

---

## Pendências

- [ ] Testar edição de recorrentes/parcelados em produção (v2.9.5)
- [ ] Posts Instagram — POST01 Feed/Stories criados, faltam POST02 a POST06
- [ ] Avaliar criação de posts via HTML→PNG (Canva descartado)
- [ ] Gestão Saúde — app companheiro planejado, mesma arquitetura

---

## Estrutura de dados relevante

```js
// Lançamento recorrente (D.tx)
{ id, dt, m, y, desc, v, tp, banco, cat, sub, st,
  rec:true, recGroup:'uid', recDur:12, recIdx:1, recFreq:'Mensal' }

// Compra cartão parcelada (D.cp)
{ id, dt, m, y, card, desc:'Nike (1/4)', v, tipo:'Parcelado',
  parc:'1/4', totalCompra, cat, sub, st }

// Compra cartão recorrente (D.cp)
{ id, dt, m, y, card, desc:'Netflix ♻️', v, tipo:'Recorrente',
  parc:'', recDur:12, cat, sub, st }

// Evento de fatura na agenda (D.ag)
{ id:'agfat_Sicredi_2_2026', title:'Fatura Sicredi', date:'2026-03-08',
  type:'pagamento', valor:3050.67, cartao:'Sicredi Mossoró',
  isFaturaEvent:true, done:false, txId:null }

// Estorno de cartão (D.cp)
{ id, dt, m, y, card, desc:'↩ Desc produto', v:-150.00,
  tipo:'Estorno', estorno:true, cat:'Estorno', st:'aberta' }
```
