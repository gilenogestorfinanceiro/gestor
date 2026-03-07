# Diário de Bordo — Gileno Gestão Financeira
**Última atualização:** 07/03/2026  
**Versão atual:** v2.9.14

---

## Estado atual do app

- **Repositório:** gilenogestorfinanceiro.github.io
- **Firebase projeto:** gestor-financeiro-pessoa-90a13
- **authDomain:** gestor-financeiro-pessoa-90a13.firebaseapp.com (NUNCA alterar)
- **Login:** `signInWithPopup` simples — funciona no Mac e iPhone

---

## Funcionalidades implementadas (acumulado)

- Faturas na agenda automáticas ao abrir o app (`sincronizarFaturasEmAberto`)
- Fatura aparece no extrato da conta como **agendado** (tx com `faturaAgendada:true`)
- Pagar fatura pela agenda com um clique (abre `payFatura` direto)
- Confirmar qualquer compromisso pela bolinha com modal
- Trocar conta de um lançamento
- Instruções visuais nos cards da agenda
- Backup automático (2h) + manual via painel admin
- Compartilhamento social no header
- Estorno de cartão de crédito (`↩ Estorno`, `v` negativo, `estorno:true`)
- Edição de recorrentes/parcelados: "Somente este / Este e os próximos"
- Login Google funcionando no Safari iOS (fix na 404.html)

---

## Arquivos no repositório
| Arquivo | Descrição |
|---------|-----------|
| `index.html` | App principal v2.9.14 |
| `sw.js` | Service Worker v2.9.14 |
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

---

## Sincronização Fatura/Agenda/Extrato (v2.9.14)

**Lógica da `sincronizarFaturasEmAberto()`:**
- Remove todos os eventos de fatura `done:false` (não pagos) para recriar com valores atualizados
- Remove todos os `D.tx` com `faturaAgendada:true` (não confirmados)
- Recria evento `D.ag` com `isFaturaEvent:true` e `txId` apontando para o tx
- Recria `D.tx` com `st:'agendado'` e `faturaAgendada:true` — aparece no extrato como agendado
- Ao pagar: remove tx agendado, cria tx real com `pgtoFatura:true`, marca `agEv.done=true`
- IDs fixos: `agfat_NomeCartao_mes_ano` e `agfat_tx_NomeCartao_mes_ano`

---

## Estrutura de dados relevante

```js
// Evento de fatura na agenda (D.ag)
{ id:'agfat_Sicredi_Mossoro_2_2026', title:'Fatura Sicredi Mossoró',
  date:'2026-03-08', type:'pagamento', valor:3050.67,
  cartao:'Sicredi Mossoró', banco:'BTG Pactual',
  isFaturaEvent:true, done:false, txId:'agfat_tx_Sicredi_Mossoro_2_2026' }

// Tx agendado no extrato (D.tx)
{ id:'agfat_tx_Sicredi_Mossoro_2_2026', st:'agendado',
  faturaAgendada:true, pgtoFatura:true, pgtoCard:'Sicredi Mossoró' }

// Tx real após pagamento (D.tx)
{ id:'uid...', st:'efetivado', pgtoFatura:true, pgtoCard:'Sicredi Mossoró' }
```

---

## Pendências

- [ ] Testar edição de recorrentes/parcelados em produção (v2.9.5)
- [ ] Posts Instagram — POST01 Feed/Stories criados, faltam POST02 a POST06
- [ ] Gestão Saúde — app companheiro planejado, mesma arquitetura

---

## v2.9.15 — Correção duplicatas agenda + conta errada no extrato

**Problemas corrigidos:**

### Duplicatas na agenda (Bug 1)
- Causa raiz: eventos legados tinham IDs com formato diferente (ex: espaços no nome do cartão)  
- Fix: filtro agora remove por **título** também (`fatTitulos.includes(e.title)`) além do ID exato
- Isso garante remoção de qualquer versão legada do evento de fatura

### Conta errada no extrato (Bug 2)  
- Causa raiz: tx legados (versão anterior) criados com `pgtoFatura:true, st:'agendado'` mas sem `faturaAgendada:true` não eram removidos na ressincronização
- Fix: filtro de tx ampliado para também remover `pgtoFatura && st==='agendado' && !pgtoFaturaConfirmado`
- Também garantido que `banco` do tx e do evento agenda usa explicitamente `D.ca[card]` (conta que paga o cartão)

### Resumo do fluxo correto após v2.9.15:
- `sincronizarFaturasEmAberto()` remove TODOS eventos fatura não-pagos (por ID E por título)
- Remove TODOS tx agendados de fatura não-confirmados (por faturaAgendada E por pgtoFatura+agendado)
- Recria com `bancoFatura = D.ca[card]` — sempre a conta correta configurada pelo usuário

---

## v2.9.16 — FIX DEFINITIVO: legados persistidos no Firestore

### Causa raiz real descoberta
A função `sincronizarFaturasEmAberto()` rodava no `loadFromCloud()` mas **sem `save()` depois**.
Resultado: a limpeza acontecia apenas em memória. Na próxima carga, o Firestore devolvia os dados legados intactos. O problema se repetia infinitamente.

### Correção 1 — save() no loadFromCloud
```js
D=migrateData(doc.data().data||{});
sincronizarFaturasEmAberto();
save(); // ← ADICIONADO — persiste limpeza no Firestore
```

### Correção 2 — Limpeza nuclear na sincronização
Critérios anteriores dependiam de ID exato ou título exato — falhavam com encodings diferentes (espaço, acento, formato legado).

Nova lógica remove **qualquer** fatura não-paga por dois critérios amplos:
- `e.isFaturaEvent === true` (flag nova)
- `e.title.startsWith('Fatura ')` (qualquer evento com esse prefixo)
- `t.pgtoFatura && t.st === 'agendado'` (qualquer tx de pagamento agendado)
- `t.faturaAgendada === true` (flag nova)

Isso elimina absolutamente qualquer legado independente de formato de ID ou encoding do nome.

### Na primeira carga após este deploy:
1. App carrega dados do Firestore (com legados)
2. `sincronizarFaturasEmAberto()` faz limpeza nuclear
3. `save()` persiste os dados limpos no Firestore
4. Nas próximas cargas, nenhum legado sobrevive

---

## v2.9.17 — FIX: debounce cancelava o save da sincronização

### Causa raiz encontrada (nível 3)
O `save()` usa debounce de 1 segundo. No fluxo do `onAuthStateChanged`:
1. `await loadFromCloud()` → chama `sincronizarFaturasEmAberto()` → chama `save()` → inicia timer 1s
2. Retorna para `onAuthStateChanged`
3. `if(!D.userName){D.userName=currentUser;save()}` → **cancela o timer anterior** com `clearTimeout`!
4. O save da sincronização nunca executa no Firestore

### Correção
Adicionada `saveImmediate()` — save direto sem debounce, cancela qualquer timer pendente:
```js
async function saveImmediate(){
    if(!currentUid)return;
    if(saveTimeout){clearTimeout(saveTimeout);saveTimeout=null;}
    await db.collection('users').doc(currentUid).set({data:..., updated:...}, {merge:true});
}
```
`loadFromCloud()` agora usa `await saveImmediate()` após a sincronização.

### Debug adicionado
`console.log('[Sync] ag: X→Y | tx: X→Y')` no início da sincronização para confirmar quantos eventos são removidos/criados.

### Verificar no console do browser após deploy:
- Deve aparecer `[Sync] ag: 4→0 | tx: X→0` (removeu os 4 legados)
- Em seguida recria 2 (um por mês) para cada cartão com fatura aberta
