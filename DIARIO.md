# Diário de Bordo — Gileno Gestão Financeira
**Última atualização:** 09/03/2026  
**Versão atual:** v2.9.31

---

## ⚡ PROTOCOLO DE INÍCIO DE SESSÃO (OBRIGATÓRIO)

> **Toda sessão começa aqui.** Antes de qualquer desenvolvimento, rodar o checklist abaixo no arquivo recebido.

```bash
for token in 'estornoModal' 'openEstornoModal' 'sincronizarFaturasEmAberto' 'isFaturaEvent' 'agFaturaMes' 'rExtConta' 'rExtBank' 'autoBackup' 'confirmAgModal' 'openConfirmAg'; do
  [ $(grep -c "$token" index.html) -gt 0 ] && echo "✅ $token" || echo "❌ PERDIDO: $token"
done
```

Se qualquer linha retornar ❌, **parar tudo** e reintegrar a feature antes de continuar.

---

## ✅ Checklist de Features Críticas

| Feature | Token de verificação | Desde |
|---------|---------------------|-------|
| ↩ Estorno no Cartão | `id="estornoModal"` | v2.9.4 |
| ↩ Estorno funções JS | `function openEstornoModal()` | v2.9.4 |
| ↩ Estorno valor verde | `isEst?'positive':'negative'` | v2.9.31 |
| Faturas na Agenda (sync) | `function sincronizarFaturasEmAberto()` | v2.9.x |
| Faturas flag isFaturaEvent | `isFaturaEvent` | v2.9.x |
| Faturas flag faturaAgendada | `faturaAgendada` | v2.9.x |
| Mês da fatura na agenda | `id="agFaturaMes"` | v2.9.23 |
| setAgDestino meses | `function setAgDestino(` | v2.9.23 |
| Confirmação agenda modal | `id="confirmAgModal"` | v2.9.x |
| Confirmação agenda função | `function openConfirmAg(` | v2.9.x |
| Extrato por conta | `function rExtConta(` | v2.9.x |
| Extrato estilo banco | `function rExtBank(` | v2.9.x |
| Backup automático | `function autoBackup(` | v2.9.x |
| Agendados criam evento agenda | `ag_tx_` | v2.9.30 |
| Efetivar marca agenda done | `agEv.done=true` | v2.9.30 |

---

## Estado atual do app

- **Repositório:** gilenogestorfinanceiro.github.io
- **Firebase projeto:** gestor-financeiro-pessoa-90a13
- **authDomain:** gestor-financeiro-pessoa-90a13.firebaseapp.com (NUNCA alterar)
- **Login:** `signInWithPopup` — funciona no Mac e iPhone

---

## Funcionalidades implementadas (acumulado)

- Faturas na agenda automáticas ao abrir o app (`sincronizarFaturasEmAberto`)
- Fatura aparece no extrato da conta como **agendado** (`faturaAgendada:true`)
- Pagar fatura pela agenda com um clique (abre `payFatura` direto)
- Confirmar qualquer compromisso pela bolinha com modal de conta + data
- **↩ Estorno** de cartão de crédito (valor negativo em `D.cp`, aparece em verde)
- Trocar conta de um lançamento no modal de edição
- Instruções visuais nos cards da agenda (○ bolinha = confirmar / ✏️ = editar)
- Backup automático (2h) + manual via painel admin (chunks ~900KB)
- Compartilhamento social no header (WhatsApp, nativo, copiar link)
- Edição de recorrentes/parcelados: "Somente este / Este e os próximos"
- Login Google funcionando no Safari iOS (fix na 404.html)
- Lançamento de cartão pelo mês da fatura com seletor inteligente
- Lançamentos agendados pelo botão + criam evento na agenda automaticamente
- Efetivar tx marca evento de agenda como done (e vice-versa)
- Painel: total das contas + total despesas/receitas por categoria
- Gráfico pizza: paleta de cores com máximo contraste + clearRect correto
- Extrato da conta: valor do tx agendado de fatura sempre atualizado após novo lançamento

---

## Arquitetura — Objetos principais

```js
// D.cp — compra de cartão
{ id, dt, card, desc, v, tipo, parc, cat, sub, m, y,
  st:'aberta'|'paga', paidDt?, paidConta?,
  estorno?:true  // ← estorno tem v negativo
}

// D.tx — lançamento em conta
{ id, dt, m, y, desc, v, tp, banco, cat, sub, st,
  pgtoFatura?, pgtoCard?,   // ← pagamento de fatura
  faturaAgendada?,          // ← tx agendado criado pelo sincronizar
  transf?, transfId?, transfOrigem?, transfDestino?
}

// D.ag — evento de agenda
{ id, title, date, time, type, valor, destino, banco, cartao,
  faturaMes?,    // ← mês da fatura (formato "m_y")
  isFaturaEvent?,txId?,
  done, color, repeat, notes
}

// D.ca — mapeamento cartão → conta que paga
// D.ca['C6 Bank'] = 'BTG Pactual'

// D.bs — saldos iniciais por conta (NUNCA manipular diretamente)
// bankBal() calcula dinamicamente — NUNCA alterar D.bs direto
```

---

## Regras críticas de desenvolvimento

1. **NUNCA manipular `D.bs` diretamente** — saldo é calculado por `bankBal()`
2. **SEMPRE usar `str_replace`** para editar o arquivo — Python com write completo causa truncamento
3. **SEMPRE entregar os 3 arquivos juntos**: `index.html` + `sw.js` + `DIARIO.md`
4. **Cache-busting**: acessar com `?v=XXXX` após subir nova versão
5. **Recuperação via curl**: `curl -o index.html https://raw.githubusercontent.com/gilenogestorfinanceiro/gestor/main/index.html` — rodar checklist logo depois
6. **`saveImmediate()`** para saves críticos (sem debounce) — `save()` tem delay
7. **authDomain NUNCA muda**: `gestor-financeiro-pessoa-90a13.firebaseapp.com`

---

## Arquivos no repositório

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | App principal — versão atual |
| `sw.js` | Service Worker — CACHE_VERSION deve bater com index.html |
| `404.html` | Fix Firebase Auth no Safari iOS |
| `DIARIO.md` | Este arquivo — contexto completo do projeto |

---

## Lições aprendidas

- **404.html intercepta TUDO no GitHub Pages** — manter redirect para `firebaseapp.com` nas rotas `/__/`
- **`[].every(fn)` retorna `true`** em JS — sempre checar `length > 0` antes
- **Canvas não limpa sozinho** — sempre `clearRect` antes de redesenhar o gráfico pizza
- **`sincronizarFaturasEmAberto()`** deve ser chamada após qualquer novo lançamento de cartão
- **Features se perdem** quando arquivo é recuperado do GitHub sem checklist — daí este protocolo

---

## Pendências

- [ ] Confirmar fix C6 Bank (v2.9.22) funcionando em produção
- [ ] Instagram posts POST02–POST06
- [ ] App Gestão Saúde (companion app — mesma arquitetura)
- [ ] Avaliar remoção dos botões de diagnóstico da Zona de Perigo

---

## Histórico de versões desta sessão (09/03/2026)

### v2.9.28 — Fix extrato conta valor errado após novo lançamento cartão
- `sincronizarFaturasEmAberto()` adicionado em `saveAgenda()` e `saveTx()`

### v2.9.29 — Painel: totalizadores + cores gráfico pizza
- Total das Contas, Total Despesas, Total Receitas no painel
- Paleta de cores com maior contraste entre categorias

### v2.9.30 — Fix cores pizza + agendados não apareciam na agenda
- `clearRect` no `drawPie` (canvas não limpava entre meses)
- `saveTx` agendado cria evento em `D.ag` com `txId` vinculado
- `confirmarEfetivar` marca `D.ag` como `done:true`

### v2.9.31 — Reintegração Estorno + Fix valor verde + Checklist
- Estorno perdido em atualização anterior — reintegrado completamente
- Fix: estorno aparecia em vermelho com `-` — agora verde com `+`
- Criado protocolo de checklist incorporado neste DIARIO.md


---

## v2.9.32 — Fix: efetivar fatura pelo extrato não marcava compras como pagas

### Problema
Ao clicar "✅ Efetivar" no extrato da conta (nas faturas agendadas "Fatura Sicredi" / "Fatura C6 Bank"),
o tx era marcado como `efetivado` — mas as compras em `D.cp` continuavam com `st:'aberta'`.
Ao recarregar o app, `sincronizarFaturasEmAberto()` via as compras ainda abertas e recriava
os eventos/tx agendados, fazendo a fatura "voltar" para aberta.

### Causa raiz
`confirmarEfetivar(id)` só alterava `tx.st='efetivado'` — não sabia que aquele tx
representava o pagamento de uma fatura de cartão e que precisava marcar o `D.cp`.

### Fix
Em `confirmarEfetivar`, quando `tx.faturaAgendada===true && tx.pgtoCard`:
1. Busca todas as compras do cartão no mesmo `m/y` ainda com `st:'aberta'`
2. Marca cada uma como `st:'paga'`, `paidDt` e `paidConta`
3. Chama `sincronizarFaturasEmAberto()` para limpar os eventos de agenda da fatura
4. Toast específico: "✅ Fatura paga e compras marcadas como pagas!"

### Adicionado ao checklist
Token: `tx.faturaAgendada && tx.pgtoCard` — garantia de que o fix está presente.

### Versão atual: v2.9.32

---

## v2.9.33 — Reintegração: modal confirmação na agenda (○ bolinha)

### Funcionalidade restaurada
O clique na ○ bolinha do card da agenda abria um modal de confirmação
com campos de conta e data antes de efetivar — esse comportamento havia
sido perdido (toggleAgDone efetivava direto, sem perguntar nada).

### O que foi reintegrado
- **Modal `#confirmAgModal`**: título dinâmico (pagamento/recebimento/fatura), descrição, select conta, campo data
- **`toggleAgDone(id)` reformulado**:
  - Se já done → desfaz direto (sem modal)
  - Se lembrete/destino nenhum → marca direto
  - Caso contrário → abre `confirmAgModal`
- **`doConfirmAg()`**: efetiva tx, atualiza data/conta, e se `faturaAgendada` marca compras como pagas + chama `sincronizarFaturasEmAberto()`
- **`closeConfirmAg()`**: fecha e limpa `_confirmAgId`
- **Dica visual** no card: "○ Bolinha = confirmar · ✏️ Texto = editar" (visível só em eventos pendentes não-lembrete)

### Nota importante
O fix do v2.9.32 (`confirmarEfetivar` marcando compras como pagas) também foi preservado —
agora os dois caminhos (extrato e agenda) fazem o mesmo trabalho correto.

### Versão atual: v2.9.33

---

## v2.9.34 — Fix crítico: sincronizarFaturasEmAberto apagava tx efetivado

### Problema
Ao efetivar fatura pelo extrato (botão "✅ Efetivar"):
1. `confirmarEfetivar` marcava compras em D.cp como pagas ✅
2. Chamava `sincronizarFaturasEmAberto()` 
3. O nuclear cleanup removia **todo tx com `faturaAgendada:true`** — inclusive o recém-efetivado
4. Resultado: tx sumia do extrato, cartão voltava como "Aberta", agenda mostrava como pago (D.ag.done=true mas tx sumiu)

### Causa raiz
Nuclear cleanup tinha: `if(t.faturaAgendada) return false` — sem verificar se estava efetivado.

### Fixes aplicados
1. **Nuclear cleanup**: `if(t.faturaAgendada && t.st!=='efetivado') return false` — preserva efetivados
2. **Recriação de faturas**: antes de criar novo tx/ag, verifica se já existe `tx.faturaAgendada && st==='efetivado'` para aquele cartão/m/y — se sim, pula (não recria)

### Versão atual: v2.9.34

---

## v2.9.35 — Fix duplicatas de faturas + botão de correção

### Problema identificado via diagnóstico
O C6 Bank tinha dois eventos com o mesmo `id=agfat_C6_Bank_2_2026`:
- `[1]` done=true (pago pela agenda)
- `[2]` done=false (recriado pelo sincronizar após o pagamento)

O `sincronizarFaturasEmAberto` limpava os `agfat_*` com `done=false`, mas ao recriar
não verificava se já existia um `agfat_*` com `done=true` e mesmo id — criando duplicata.

### Fixes
1. Nuclear cleanup: guarda Set de `_agFatPagas` (ids com done=true) antes de limpar
2. Recriação: pula se `agId` já está em `_agFatPagas`
3. Botão **"🔧 Corrigir Duplicatas de Faturas"** na Zona de Perigo
4. Função `corrigirDuplicatasFaturas()`: remove duplicatas de D.ag e D.tx agendados redundantes

### Como usar para corrigir estado atual
Zona de Perigo → "🔧 Corrigir Duplicatas de Faturas" → vai limpar o C6 Bank corrompido

### Versão atual: v2.9.35
