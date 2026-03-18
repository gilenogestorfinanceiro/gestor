# Diário de Bordo Técnico — Gileno Gestão Financeira
**Atualizado em:** 18/03/2026 — 12:10  
**Versão atual:** Produção v2.9.49 | Beta v2.9.43  
**Status:** ✅ ESTÁVEL — Incidente de credenciais encerrado

---

## SESSÃO 18/03/2026 — Resolução do Incidente de Credenciais Firebase

### Resumo
Incidente de credenciais Firebase trocadas (Beta no lugar de Produção) totalmente resolvido. Três versões deployadas: v2.9.47 (credenciais), v2.9.48 (proteção anti-sobrescrita), v2.9.49 (guarda projectId). Dados do Luan confirmados intactos (159 tx). Dados do Gileno restaurados do backup do Beta.

### Versões deployadas hoje

#### v2.9.47 — Correção de credenciais (commit 39b7f60)
- apiKey corrigida de Beta para Produção
- "BETA" removido do title, meta og:title e header do app
- Barra debug removida
- Zero referências a gestor-financeiro-beta no código

#### v2.9.48 — Proteção anti-sobrescrita (commit a35f115)
- Flag window._loadedFromCloud — save() só executa se loadFromCloud() completou com sucesso
- Flag window._loadFailed — se load falhar, save() é bloqueado na sessão inteira
- Guardas em save() (linha 1303) e beforeunload (linha 1335)
- URL do sendBeacon corrigida de gestor-financeiro-beta para gestor-financeiro-pessoa-90a13

#### v2.9.49 — Guarda de projectId (commit 095a37a)
- Verificação de projectId no onAuthStateChanged, logo após if(user)
- Se projectId errado: alerta, signOut, limpa caches, reload
- Rede de segurança passiva — nunca dispara em condições normais

### Migração Beta → Produção
- Etapa 1 (backup): 6 docs Beta, 24 docs Produção — salvos em Cloud Shell
- Etapa 2 (mapeamento): 6 emails mapeados, zero órfãos
- Achado principal: apenas 1 de 6 usuários (Gileno) tinha dados reais no Beta
- Decisão gerencial: NÃO migrar em massa, Opção C (backup JSON)
- Backup Gileno: gs://gestor-financeiro-pessoa-90a13.firebasestorage.app/backups-manuais/backup_gileno_beta_20260318.json

### Restauração dos dados do Gileno
- Backup do Beta restaurado no documento users/9NWXXOwHHUSrxEg7Ygw226zsuHj1
- Verificação: tx=3, cp=45, ag=17, bancos=7 — tudo restaurado
- Gileno confirmou dados visíveis no app

### Confirmação do Luan
- Luan limpou cache e abriu o app — 159 transações visíveis ✅
- Proteção v2.9.48 garantiu que nenhum save vazio sobrescreveu dados

### Melhoria da agenda (v2.9.46) — Esclarecimento
- sincronizarFaturasEmAberto() expandida para verificar todos os meses desde janeiro
- rDash() lista itens vencidos individualmente
- NÃO teve relação com o problema do Luan — causa raiz foi 100% credenciais trocadas
- Melhoria presente e funcional no código atual (v2.9.49)

---

## 🗂 INFORMAÇÕES DO PROJETO

| Item | Valor |
|---|---|
| Repositório GitHub | https://github.com/gilenogestorfinanceiro/gestor |
| Repositório local Mac | ~/gestor |
| URL Produção | https://gilenogestorfinanceiro.github.io/gestor/ |
| URL Beta | https://gilenogestorfinanceiro.github.io/gestor/beta/ |
| Firebase Produção | gestor-financeiro-pessoa-90a13 (Blaze) |
| Firebase Beta | gestor-financeiro-beta (Spark) |
| UID Gileno Produção | 9NWXXOwHHUSrxEg7Ygw226zsuHj1 |
| UID Gileno Beta | WPt1n2dZSGNxpOA2azPWgpRWk5u1 |
| UID Luan Produção | rwi6Ie1tLuhW17rZNn30Ywke9rk2 |
| Bucket backups | gs://gestor-financeiro-pessoa-90a13.firebasestorage.app/backups-manuais/ |

---

## COMMITS RECENTES EM PRODUÇÃO

| Commit | Descrição | Status |
|---|---|---|
| 095a37a | v2.9.49: guarda projectId no onAuthStateChanged | ✅ Em produção |
| a35f115 | v2.9.48: proteção contra save com dados vazios | ✅ Em produção |
| 39b7f60 | v2.9.47: corrigir credenciais Firebase, remover BETA | ✅ Em produção |

---

## BUGS RESOLVIDOS ACUMULADOS

| Bug | Versão | Status |
|---|---|---|
| Tela preta (páginas além do Painel) | v2.9.41 | ✅ |
| Botão explícito na Agenda | v2.9.42 | ✅ |
| debounce 1s a 2s + flush beforeunload | v2.9.42 | ✅ |
| sincronizarFaturasEmAberto flag userEdited | v2.9.42 | ✅ |
| saveAgenda sincroniza tx vinculada | v2.9.42 | ✅ |
| confirmarEfetivar atualiza tx.m e tx.y | v2.9.42 | ✅ |
| Auto-update SW com postMessage NEW_VERSION | v2.9.42 | ✅ |
| importJSON sem confirmação | v2.9.43 | ✅ |
| importJSON sem validação de estrutura | v2.9.43 | ✅ |
| SW cacheando index.html (ciclo vicioso) | v2.9.43 | ✅ |
| Backup só para admin | v2.9.44 | ✅ |
| Backup sem isolamento por UID | v2.9.44 | ✅ |
| SyntaxError regex admin.html Safari | v2.9.45 | ✅ |
| admin.html cacheado pelo SW | v2.9.45 | ✅ |
| sincronizarFaturasEmAberto limitada a 2 meses | v2.9.46 | ✅ |
| rDash não lista vencidos individualmente | v2.9.46 | ✅ |
| Credenciais Firebase Beta em produção | v2.9.47 | ✅ |
| sendBeacon URL apontava para Beta | v2.9.48 | ✅ |
| save() sem proteção contra dados vazios | v2.9.48 | ✅ |
| Sem guarda de projectId no auth | v2.9.49 | ✅ |

---

## BUGS PENDENTES

| Bug | Prioridade |
|---|---|
| SW de produção intercepta /beta/ no iPhone | Média |
| Backup "Baixar" exporta HTML em vez de JSON | Média |
| Sugestão Patricio Mackson (recebimento parcial) | Baixa |

---

## DÉBITO TÉCNICO — v2.10.0 (planejado)

Refatorar sincronizarFaturasEmAberto() de "apaga tudo e recria" para upsert por chave.  
Impacto alto — requer versão dedicada com testes completos.  
Nunca tocar nessa função sem dry-run e confirmação dupla.

---

## PRÓXIMOS PASSOS

1. ~~Corrigir credenciais Firebase~~ ✅ (v2.9.47)
2. ~~Proteção anti-sobrescrita~~ ✅ (v2.9.48)
3. ~~Guarda de projectId~~ ✅ (v2.9.49)
4. ~~Restaurar dados do Gileno~~ ✅
5. ~~Confirmação do Luan~~ ✅
6. Corrigir bug "Baixar" backup (exporta HTML em vez de JSON)
7. Responder sugestão Patricio Mackson
8. Criar processo de deploy que corrige credenciais automaticamente
9. Gileno lançar dados manualmente a partir de janeiro/2026

---

## REGRAS ANTI-CASCATA (ATUALIZADO 18/03/2026)

- NUNCA operações destrutivas sem dry-run e confirmação dupla
- NUNCA save() dentro de funções que iteram arrays
- NUNCA saveImmediate() no loadFromCloud
- NUNCA alterar sincronizarFaturasEmAberto() sem versão dedicada
- SEMPRE flags de proteção antes de limpar dados (userEdited, done)
- NUNCA editar direto em produção (exceção: hotfix crítico documentado)
- Deploy NUNCA move dados — apenas código
- NUNCA promover beta para produção sem corrigir credenciais Firebase
- SEMPRE verificar projectId após promoção: grep "projectId" index.html
- SEMPRE verificar ausência de BETA: grep "BETA" index.html
- SEMPRE verificar sendBeacon URL: grep "gestor-financeiro-beta" index.html

---

## COMO FAZER DEPLOY

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

Checklist obrigatório:
- SEMPRE mudar CACHE_VERSION no sw.js junto com a versão
- NUNCA cachear index.html no SW (cache: 'no-store')
- skipWaiting() fora do .then() na instalação
- Testar no beta ANTES de promover para produção
- SEMPRE corrigir credenciais Firebase ao promover beta para produção
- SEMPRE verificar: grep "projectId" index.html
- SEMPRE verificar: grep "BETA" index.html (deve retornar vazio)
- SEMPRE verificar: grep "gestor-financeiro-beta" index.html (deve retornar vazio)
- NUNCA commitar tokens/secrets no DIARIO.md

---

## ARQUITETURA RESUMIDA

- Stack: HTML/CSS/JS puro, Firebase Firestore, GitHub Pages, Service Worker
- Arquivo único: beta/index.html (sem frameworks)
- Dados centralizados no objeto D, persistido no Firestore
- Funções principais: goPage(), refresh(), rDash(), rExt(), rAgenda(), rCard(), loadFromCloud(), save()
- Páginas: page-dash, page-ext, page-add, page-agenda, page-card, page-cfg, page-invest, page-sobre, page-sug
- Proteções v2.9.48+: _loadedFromCloud, _loadFailed — save bloqueado se load não completou
- Guarda v2.9.49: verificação de projectId no onAuthStateChanged

---

## Firebase Credentials (referência)

### Produção (para index.html raiz)
```
apiKey: AIzaSyDNq64Kqr2kt1baYlgPduSo5LbTsfdxdWQ
projectId: gestor-financeiro-pessoa-90a13
```

### Beta (para beta/index.html)
```
apiKey: AIzaSyDPt3PE5a6XHNKfND1fVvWqwT66_55hOF0
projectId: gestor-financeiro-beta
```
