# Diário de Bordo Técnico — Gestor Financeiro
**Atualizado em:** 21/03/2026 — 10:30  
**Versão atual:** Produção v2.9.51 | Beta v2.9.46  
**Status:** ✅ ESTÁVEL — Sprint 1 do admin em andamento

---

## SESSÃO 21/03/2026 — Auditoria Admin + Sprint 1 Correções

### O que foi feito hoje

#### 1. Auditoria completa do admin.html (626 linhas)
Relatório PDF gerado e entregue à gerência com:
- 5 vulnerabilidades identificadas (V1-V5)
- 4 bugs funcionais (B1-B4)
- 7 recomendações priorizadas (R1-R7)
- Descoberta principal: sistema de backup do admin faz backup do CÓDIGO-FONTE (index.html), NÃO dos dados dos usuários

#### 2. Sprint 1 executado (parcialmente)
Três alterações no admin.html:

**[R2] Renomear botões — CONCLUÍDO ✅**
- "Baixar Automático" → "Baixar Código-Fonte (Auto)" (linha 175)
- "Baixar Manual" → "Baixar Código-Fonte (Manual)" (linha 178)
- "Forçar Backup Manual Agora" → "Forçar Backup Código-Fonte" (linha 184)

**[R1] Botão "Exportar Dados dos Usuários (JSON)" — CONCLUÍDO ✅**
- Botão vermelho inserido na seção Backup (linha 171, onclick="exportAllUsersData()")
- Função exportAllUsersData() inserida dentro do script (linha 631)
- Lê db.collection('users').get(), exporta todos docs como JSON
- Nomeia arquivo: backup_dados_YYYY-MM-DD.json
- Blob type: application/json

**Deploy:** Dois commits no admin.html:
- 733c315: "admin: renomear botoes backup, adicionar exportar dados JSON" (função no lugar errado)
- 468bfa1: "admin: fix exportAllUsersData dentro do script" (correção posicionamento)

#### 3. PENDENTE — Testar botão "Exportar Dados"
O botão foi deployado mas ainda NÃO foi testado no navegador. Na sessão anterior, a primeira versão mostrou código como texto (função fora do script). A correção (468bfa1) deve resolver. PRECISA TESTAR:
1. Abrir https://gilenogestorfinanceiro.github.io/gestor/admin.html
2. Logar com conta admin (gilenopaivalima@gmail.com)
3. Ir na aba Backup
4. Clicar no botão vermelho "Exportar Dados dos Usuários (JSON)"
5. Verificar se baixa arquivo backup_dados_2026-03-21.json com dados reais (não HTML)
6. Abrir o arquivo e confirmar que contém objetos com tx, cp, ag, bancos etc.

---

## SESSÃO 18/03/2026 — Resolução do Incidente de Credenciais Firebase

### Versões deployadas em 18/03

| Versão | Commit | O que fez | Status |
|---|---|---|---|
| v2.9.47 | 39b7f60 | Corrigir credenciais Firebase, remover BETA do title/header | ✅ Ativo |
| v2.9.48 | a35f115 | Proteção anti-sobrescrita (_loadedFromCloud, _loadFailed), corrigir sendBeacon URL | ✅ Ativo |
| v2.9.49 | 095a37a | Guarda de projectId no onAuthStateChanged | ✅ Ativo |
| v2.9.50 | 6fce031 | sincronizarFaturasEmAberto desde janeiro (CAUSOU DUPLICATAS) | Revertido |
| v2.9.51 | 9aa2689 | Reverter v2.9.50 para 3 meses (estável) | ✅ Em produção |

### Proteções implementadas (v2.9.48-v2.9.49)
- window._loadedFromCloud — save() só executa se loadFromCloud() completou com sucesso
- window._loadFailed — se load falhar, save() é bloqueado na sessão inteira
- Guardas em save() (linha 1303) e beforeunload (linha 1335)
- sendBeacon URL corrigida de gestor-financeiro-beta para gestor-financeiro-pessoa-90a13
- Guarda de projectId no onAuthStateChanged: se projeto errado, signOut + limpa caches + reload

### Migração Beta → Produção (concluída)
- 6 docs no Beta, 24 docs em Produção
- Apenas Gileno tinha dados reais no Beta (3 tx, 45 cp, 17 ag)
- Decisão gerencial: NÃO migrar em massa
- Dados do Gileno restaurados do backup: gs://gestor-financeiro-pessoa-90a13.firebasestorage.app/backups-manuais/backup_gileno_beta_20260318.json
- Luan confirmou 159 tx visíveis ✅

### Melhoria v2.9.46 (agenda desde janeiro) — PERDIDA
- sincronizarFaturasEmAberto() deveria varrer desde janeiro do ano corrente
- Melhoria estava no beta (v2.9.46) mas se perdeu quando produção foi sobrescrita no incidente
- Tentativa de reimplementar (v2.9.50) causou duplicatas de faturas
- Revertida na v2.9.51
- Requer refactor completo para upsert por chave (v2.10.0)

---

## 🗂 INFORMAÇÕES DO PROJETO

| Item | Valor |
|---|---|
| Repositório GitHub | https://github.com/gilenogestorfinanceiro/gestor |
| Repositório local Mac | ~/gestor |
| URL Produção | https://gilenogestorfinanceiro.github.io/gestor/ |
| URL Beta | https://gilenogestorfinanceiro.github.io/gestor/beta/ |
| URL Admin | https://gilenogestorfinanceiro.github.io/gestor/admin.html |
| Firebase Produção | gestor-financeiro-pessoa-90a13 (Blaze) |
| Firebase Beta | gestor-financeiro-beta (Spark) |
| UID Gileno Produção | 9NWXXOwHHUSrxEg7Ygw226zsuHj1 |
| UID Luan Produção | rwi6Ie1tLuhW17rZNn30Ywke9rk2 |
| ADMIN_EMAIL | gilenopaivalima@gmail.com |
| Cloud Shell | https://console.cloud.google.com/cloudshell?project=gestor-financeiro-pessoa-90a13 |
| Bucket backups | gs://gestor-financeiro-pessoa-90a13.firebasestorage.app/backups-manuais/ |

---

## COMMITS RECENTES

| Commit | Descrição | Arquivo | Status |
|---|---|---|---|
| 468bfa1 | fix exportAllUsersData dentro do script | admin.html | ✅ Testar |
| 733c315 | renomear botoes backup, adicionar exportar dados JSON | admin.html | Substituído por 468bfa1 |
| 9aa2689 | v2.9.51: reverter para 3 meses (estável) | index.html, sw.js | ✅ Em produção |
| 6fce031 | v2.9.50: desde janeiro (duplicatas) | index.html, sw.js | Revertido |
| 095a37a | v2.9.49: guarda projectId | index.html, sw.js | ✅ Ativo |
| a35f115 | v2.9.48: proteção anti-sobrescrita | index.html, sw.js | ✅ Ativo |
| 39b7f60 | v2.9.47: credenciais Firebase | index.html | ✅ Ativo |

---

## PLANO DE CORREÇÕES ADMIN — ESTADO ATUAL

### Sprint 1 — CRÍTICO (em andamento)
| # | Tarefa | Status |
|---|---|---|
| R1 | Botão "Exportar Dados (JSON)" no admin | ✅ Código pronto, TESTAR |
| R2 | Renomear botões "Baixar" para "Baixar Código-Fonte" | ✅ Concluído |
| B1 | doDownloadFile() — não precisa corrigir (é para código, rótulo resolve) | ✅ Resolvido via rename |

### Sprint 2 — SEGURANÇA (próximo)
| # | Tarefa | Status |
|---|---|---|
| R3 | Verificação de UID fixo além do email no admin | Pendente |
| B4 | Confirmação dupla ao excluir sugestão | Pendente |

### Sprint 3 — MONITORAMENTO (futuro)
| # | Tarefa | Status |
|---|---|---|
| R5 | Log de acesso ao admin | Pendente |
| R7 | Documentar acesso a dados na política de privacidade | Pendente |
| R4 | Avaliar Firestore Rules mais restritivas | Pendente |

---

## BUGS PENDENTES (index.html)

| Bug | Prioridade |
|---|---|
| sincronizarFaturasEmAberto() só verifica 3 meses — requer refactor upsert v2.10.0 | Alta |
| SW de produção intercepta /beta/ no iPhone | Média |
| Sugestão Patricio Mackson (recebimento parcial) | Baixa |

---

## DÉBITO TÉCNICO — v2.10.0 (planejado)

Refatorar sincronizarFaturasEmAberto() de "apaga tudo e recria" para upsert por chave.
A v2.9.50 provou que expandir o range de meses sem refatorar gera duplicatas.
Nunca tocar nessa função sem dry-run e confirmação dupla.

---

## PRÓXIMOS PASSOS (ordem de prioridade)

1. TESTAR botão "Exportar Dados" no admin (deploy 468bfa1)
2. Sprint 2 admin: verificação UID + confirmação dupla sugestão
3. Refactor sincronizarFaturasEmAberto() para upsert (v2.10.0)
4. Responder sugestão Patricio Mackson
5. Gileno lançar dados manualmente a partir de janeiro/2026

---

## REGRAS ANTI-CASCATA

- NUNCA operações destrutivas sem dry-run e confirmação dupla
- NUNCA save() dentro de funções que iteram arrays
- NUNCA saveImmediate() no loadFromCloud
- NUNCA alterar sincronizarFaturasEmAberto() sem versão dedicada e refactor completo
- NUNCA expandir range de meses sem refactor upsert (v2.9.50 comprovou duplicatas)
- SEMPRE flags de proteção antes de limpar dados (userEdited, done)
- NUNCA editar direto em produção (exceção: hotfix crítico documentado)
- Deploy NUNCA move dados — apenas código
- NUNCA promover beta para produção sem corrigir credenciais Firebase
- SEMPRE verificar projectId: grep "projectId" index.html
- SEMPRE verificar ausência de BETA: grep "BETA" index.html
- SEMPRE verificar sendBeacon URL: grep "gestor-financeiro-beta" index.html
- SEMPRE cd ~/gestor antes de qualquer comando git

---

## COMO FAZER DEPLOY

```bash
cd ~/gestor
git pull
# Para beta:
cp ~/Downloads/index.html beta/index.html
cp ~/Downloads/sw.js beta/sw.js
# Para produção direta (hotfix):
# editar index.html e sw.js no ~/gestor
cp ~/Downloads/DIARIO.md DIARIO.md
git add .
git commit -m "descrição"
git push
```

Checklist obrigatório:
- SEMPRE mudar CACHE_VERSION no sw.js junto com versão do index.html
- NUNCA cachear index.html no SW (cache: 'no-store')
- skipWaiting() fora do .then() na instalação
- SEMPRE corrigir credenciais Firebase ao promover beta para produção
- SEMPRE verificar: grep "projectId" index.html
- SEMPRE verificar: grep "BETA" index.html (deve retornar vazio)
- SEMPRE verificar: grep "gestor-financeiro-beta" index.html (deve retornar vazio)
- NUNCA commitar tokens/secrets no DIARIO.md

---

## ARQUITETURA

- Stack: HTML/CSS/JS puro, Firebase Firestore, GitHub Pages, Service Worker
- Arquivo principal: index.html (produção) e beta/index.html
- Painel admin: admin.html (626 linhas, autenticação por ADMIN_EMAIL)
- Dados centralizados no objeto D, persistido no Firestore
- Funções principais: goPage(), refresh(), rDash(), rExt(), rAgenda(), rCard(), loadFromCloud(), save()
- Proteções v2.9.48+: _loadedFromCloud, _loadFailed
- Guarda v2.9.49: verificação projectId no onAuthStateChanged

---

## Firebase Credentials (referência)

### Produção (para index.html raiz e admin.html)
```
apiKey: AIzaSyDNq64Kqr2kt1baYlgPduSo5LbTsfdxdWQ
projectId: gestor-financeiro-pessoa-90a13
```

### Beta (para beta/index.html)
```
apiKey: AIzaSyDPt3PE5a6XHNKfND1fVvWqwT66_55hOF0
projectId: gestor-financeiro-beta
```

---

## DETALHES TÉCNICOS DO ADMIN.HTML (para referência)

### Estrutura de autenticação
- Linha 187: ADMIN_EMAIL = 'gilenopaivalima@gmail.com'
- Linha 207: signInWithPopup verifica email === ADMIN_EMAIL, signOut se diferente
- Linha 220: onAuthStateChanged verifica email, mostra/esconde adminPanel
- Vulnerabilidade: verifica apenas email, não UID

### Funções do admin
- loadAll() → loadUsers(), loadSugestoes(), loadUserData()
- renderKPIs(), renderUsers(), renderSugestoes(), renderMetricas()
- downloadBackup('auto'/'manual') — baixa código-fonte do Firestore
- doDownloadFile(src, version) — cria blob HTML com extensão .html
- forceBackupNow() — fetch do index.html de produção, salva em chunks no Firestore
- exportAllUsersData() — NOVA: exporta coleção users completa como JSON

### Sistema de backup do admin (conceitual)
- "Backup" no admin = backup do CÓDIGO-FONTE (index.html) em chunks no Firestore
- NÃO é backup de dados dos usuários
- Backup de DADOS é feito por: exportJSON() no app principal, Firebase PITR, scheduled backups
- Novo botão exportAllUsersData() resolve a lacuna de exportar dados pelo admin

---

## LIÇÕES APRENDIDAS

1. NUNCA copiar beta para produção sem verificar credenciais
2. save() sem proteção é bomba-relógio — v2.9.48 implementou guardas
3. sendBeacon pode ter URL hardcoded errada — verificar em todo deploy
4. Backups salvam projetos — PITR + scheduled + manuais
5. Expandir range da sincronizarFaturasEmAberto() sem refactor gera duplicatas
6. Refactor para upsert por chave é obrigatório antes de qualquer melhoria nessa função
7. Backup no admin.html era de CÓDIGO, não de DADOS — confusão conceitual resolvida
8. sed com emojis no macOS falha — usar Python para manipular HTML com caracteres especiais
9. SEMPRE cd ~/gestor antes de git e python3 — o terminal pode mudar de diretório
