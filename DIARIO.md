# Diário de Bordo — Gileno Gestão Financeira
**Última atualização:** 09/03/2026  
**Versão atual:** v2.9.36

---

## ⚡ PROTOCOLO DE INÍCIO DE SESSÃO (OBRIGATÓRIO)

> **Toda sessão começa aqui.** Antes de qualquer desenvolvimento, rodar o checklist abaixo no arquivo recebido.

```bash
for token in 'estornoModal' 'openEstornoModal' 'sincronizarFaturasEmAberto' 'isFaturaEvent' 'agFaturaMes' 'rExtConta' 'rExtBank' 'autoBackup' 'restoreAutoBackup' 'runManualBackup'; do
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
| Faturas na Agenda (sync) | `function sincronizarFaturasEmAberto()` | v2.9.x |
| Faturas flag isFaturaEvent | `isFaturaEvent` | v2.9.x |
| Mês da fatura na agenda | `id="agFaturaMes"` | v2.9.23 |
| Extrato por conta | `function rExtConta(` | v2.9.x |
| Extrato estilo banco | `function rExtBank(` | v2.9.x |
| Backup automático | `function runAutoBackup(` | v2.9.x |
| ✅ Backup salva JSON dos dados | `JSON.stringify(D)` no backup | v2.9.36 |
| ✅ Restaurar backup | `function restoreAutoBackup(` | v2.9.36 |
| ✅ Backup manual | `function runManualBackup(` | v2.9.36 |

---

## Estado atual do app

- **Repositório:** gilenogestorfinanceiro.github.io
- **Firebase projeto:** gestor-financeiro-pessoa-90a13
- **authDomain:** gestor-financeiro-pessoa-90a13.firebaseapp.com (NUNCA alterar)
- **Login:** `signInWithPopup` — funciona no Mac e iPhone
- **⚠️ DADOS PERDIDOS** em 09/03/2026 ~15:52 (incidente `corrigirDuplicatasFaturas`)

---

## ⚠️ INCIDENTE CRÍTICO — 09/03/2026

### O que aconteceu
1. Bug na função `corrigirDuplicatasFaturas()` apagou todos os dados do usuário Gileno
2. Backup automático existia mas salvava o **HTML do app**, não os dados (bug crítico)
3. Dados de D.tx e D.cp perdidos permanentemente

### Lição aprendida
- **NUNCA criar função de correção que chama save() sem dry-run e confirmação dupla**
- **Backup DEVE salvar `JSON.stringify(D)`, não `document.documentElement.outerHTML`**
- Qualquer botão destrutivo na Zona de Perigo precisa de **duas confirmações**

---

## Funcionalidades implementadas (acumulado v2.9.36)

- Faturas na agenda automáticas ao abrir o app (`sincronizarFaturasEmAberto`)
- Fatura aparece no extrato da conta como **agendado** (`faturaAgendada:true`)
- Pagar fatura pela agenda com um clique (abre `payFatura` direto)
- **↩ Estorno** de cartão de crédito (valor negativo em `D.cp`, aparece em verde)
- Trocar conta de um lançamento no modal de edição
- Backup automático (2h) salva **JSON dos dados D** no Firestore ✅ (fix v2.9.36)
- Backup manual via botão na aba Mais > Backup e Restauração ✅
- Restaurar backup automático com um clique ✅ (novo em v2.9.36)
- Confirmação dupla em todas as operações destrutivas da Zona de Perigo ✅
- Compartilhamento social no header (WhatsApp, nativo, copiar link)
- Lançamento de cartão pelo mês da fatura com seletor inteligente
- Extrato da conta por banco e estilo banco

---

## Arquitetura — Objetos principais

```js
// D.cp — compra de cartão
{ id, dt, card, desc, v, tipo, parc, cat, sub, m, y,
  st:'aberta'|'paga', paidDt?, paidConta?,
  estorno?:true
}

// D.tx — lançamento em conta
{ id, dt, m, y, desc, v, tp, banco, cat, sub, st,
  pgtoFatura?, pgtoCard?,
  faturaAgendada?,
  transf?, transfId?, transfOrigem?, transfDestino?
}

// D.ag — evento de agenda
{ id, title, date, time, type, valor, destino, banco, cartao,
  faturaMes?,
  isFaturaEvent?,txId?,
  done, color, repeat, notes
}

// D.bs — saldos iniciais por conta (NUNCA manipular diretamente)
// bankBal() calcula dinamicamente
```

---

## Regras críticas de desenvolvimento

1. **NUNCA manipular `D.bs` diretamente** — saldo é calculado por `bankBal()`
2. **SEMPRE usar `str_replace`** para editar o arquivo
3. **SEMPRE entregar os 3 arquivos juntos**: `index.html` + `sw.js` + `DIARIO.md`
4. **Cache-busting**: acessar com `?v=XXXX` após subir nova versão
5. **Recuperação via curl**: `curl -o index.html https://raw.githubusercontent.com/gilenogestorfinanceiro/gestor/main/index.html`
6. **`saveImmediate()`** para saves críticos (sem debounce)
7. **authDomain NUNCA muda**: `gestor-financeiro-pessoa-90a13.firebaseapp.com`
8. **NUNCA criar função destrutiva sem dry-run + confirmação dupla + preview**
9. **Backup SEMPRE salva `JSON.stringify(D)`** — nunca o HTML da página

---

## Arquivos no repositório

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | App principal — versão atual |
| `sw.js` | Service Worker — CACHE_VERSION deve bater com index.html |
| `404.html` | Fix Firebase Auth no Safari iOS |
| `DIARIO.md` | Este arquivo — contexto completo do projeto |

---

## Pendências

- [ ] Reintegrar `confirmAgModal` e `openConfirmAg` (perdidos com o incidente — estavam em versão posterior ao v2.9.31)
- [ ] Testar backup manual e restauração em produção
- [ ] Instagram posts POST02–POST06
- [ ] App Gestão Saúde (companion app — mesma arquitetura)

---

## Histórico de versões

### v2.9.36 — Fix crítico backup + restauração + segurança Zona de Perigo
- **Bug do backup corrigido**: `runAutoBackup()` agora salva `JSON.stringify(D)` em vez do HTML
- **Nova função `restoreAutoBackup()`**: restaura dados do último backup com confirmação
- **Nova função `runManualBackup()`**: backup manual sob demanda
- **Botão "Backup e Restauração"** adicionado na aba Mais (acima da Zona de Perigo)
- **Confirmação dupla** em todas as operações destrutivas da Zona de Perigo
- **Base**: v2.9.31 (versão no GitHub no momento do incidente)
- ⚠️ Nota: features `confirmAgModal` e `openConfirmAg` não presentes (foram implementadas entre v2.9.31 e o incidente — precisam ser reintegradas)
