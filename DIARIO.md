# Diário de Bordo — Gileno Gestão Financeira
**Última atualização:** 07/03/2026  
**Versão atual:** v2.9.13

---

## Estado atual do app

- **Repositório:** gilenogestorfinanceiro.github.io
- **Firebase projeto:** gestor-financeiro-pessoa-90a13
- **authDomain:** gestor-financeiro-pessoa-90a13.firebaseapp.com (NUNCA alterar)
- **Login:** `signInWithPopup` simples — funciona no Mac e iPhone

---

## Funcionalidades implementadas (acumulado)

- Faturas na agenda automáticas ao abrir o app (`sincronizarFaturasEmAberto`)
- Pagar fatura pela agenda com um clique (abre `payFatura` direto)
- Confirmar qualquer compromisso pela bolinha com modal
- Trocar conta de um lançamento
- Instruções visuais nos cards da agenda
- Backup automático (2h) + manual via painel admin
- Compartilhamento social no header
- Estorno de cartão de crédito (`↩ Estorno`, `v` negativo, `estorno:true`)
- Edição de recorrentes/parcelados: "Somente este / Este e os próximos"
- Login Google funcionando no Safari iOS (fix na 404.html)
- Sincronização Fatura → Agenda → Extrato conta (agendado)

---

## Arquivos no repositório
| Arquivo | Descrição |
|---------|-----------|
| `index.html` | App principal v2.9.13 |
| `sw.js` | Service Worker v2.9.13 |
| `404.html` | Página de atualização + fix Firebase Auth `/__/` |
| `DIARIO.md` | Este arquivo |

---

## Lições aprendidas críticas

1. **404.html intercepta TUDO no GitHub Pages** — sempre manter redirect para `firebaseapp.com` nas rotas `/__/`:
```js
if (window.location.pathname.indexOf('/__/') === 0) {
    window.location.replace('https://gestor-financeiro-pessoa-90a13.firebaseapp.com' +
      window.location.pathname + window.location.search + window.location.hash);
}
```

2. **NUNCA alterar `authDomain`** para o domínio do GitHub Pages.

3. **`signInWithPopup` simples funciona** — não adicionar detecção de browser nem redirect.

4. **Ao exportar index.html, SEMPRE aplicar:**
   - Versão no rodapé: `re.sub(r'(© 2026 · )v[\d.]+', r'\g<1>vX.X.X', h)`
   - headerUser com versão (substituir `.textContent='👤 '+currentUser` por):
   ```js
   const _verMH=document.body.innerHTML.match(/·\s*v([\d.]+)/);
   const _appVerH=_verMH?'v'+_verMH[1]:'';
   document.getElementById('headerUser').innerHTML='👤 '+currentUser+
     (_appVerH?' <span style="font-size:10px;color:var(--text3)">'+_appVerH+'</span>':'');
   ```
   - sw.js: `re.sub(r"CACHE_VERSION = '[^']+'", "CACHE_VERSION = 'X.X.X'", sw)`

5. **`D.bs` nunca manipular diretamente** — saldo calculado por `bankBal()`.

6. **Ao restaurar index.html do upload**, reaplicar os 3 itens do ponto 4 acima.

---

## Sincronização Fatura/Agenda/Extrato (v2.9.13)

**Como funciona:**
- `sincronizarFaturasEmAberto()` roda no `loadFromCloud` e ao pagar/reabrir fatura
- Cria evento `D.ag` com `id:'agfat_NomeCartao_mes_ano'` e `isFaturaEvent:true`
- Cria `D.tx` com `id:'agfat_tx_NomeCartao_mes_ano'`, `st:'agendado'`, `faturaAgendada:true`
- Ao pagar: remove o tx agendado, cria tx real com `pgtoFatura:true`, marca agenda como `done:true`
- Eventos legados (sem `isFaturaEvent`) são removidos automaticamente na sincronização

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
{ id:'agfat_Sicredi_Mossoro_2_2026', title:'Fatura Sicredi Mossoró',
  date:'2026-03-08', type:'pagamento', valor:3050.67,
  cartao:'Sicredi Mossoró', banco:'BTG Pactual',
  isFaturaEvent:true, done:false, txId:'agfat_tx_Sicredi_Mossoro_2_2026' }

// Tx agendado no extrato (D.tx) — criado junto com o evento da agenda
{ id:'agfat_tx_Sicredi_Mossoro_2_2026', dt:'2026-03-08',
  desc:'Fatura Sicredi Mossoró', v:3050.67,
  tp:'Despesa', banco:'BTG Pactual', cat:'Cartão Crédito',
  st:'agendado', pgtoFatura:true, faturaAgendada:true }

// Estorno de cartão (D.cp)
{ id, dt, m, y, card, desc:'↩ Desc produto', v:-150.00,
  tipo:'Estorno', estorno:true, cat:'Estorno', st:'aberta' }
```

---

## Pendências

- [ ] Testar edição de recorrentes/parcelados em produção (v2.9.5)
- [ ] Posts Instagram — POST01 Feed/Stories criados, faltam POST02 a POST06
- [ ] Avaliar criação de posts via HTML→PNG (Canva descartado)
- [ ] Gestão Saúde — app companheiro planejado, mesma arquitetura
