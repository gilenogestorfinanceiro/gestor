# Diário de Bordo Técnico — Gestor Financeiro
**Atualizado em:** 06/05/2026 — sessão de fix Bug 4 + correção sistêmica de processo (sessão GG Opus 4.7.3 + Claude Code Desktop)  
**Versão atual:** Produção v2.9.61 | Admin v1.3.0  
**Status:** ✅ ESTÁVEL — Bug 4 (CACHE_VERSION dessincronizado) corrigido; processo de deploy reforçado

---

## SESSÃO 06/05/2026 — Fix Bug 4 + Correção Sistêmica de Processo

### v2.9.61 (06/05/2026) — fix Bug 4: ressincronizar CACHE_VERSION

**Problema:** o `sw.js` ficou em `v2.9.56` enquanto o `index.html` foi a v2.9.60.
4 versões de defasagem — usuários ativos podiam estar servindo HTML antigo
do cache do Service Worker mesmo após deploy. Bug detectado em sessão anterior
(03/05) e confirmado nesta sessão (06/05).

**Causa raiz (sintoma):** ausência de checklist obrigatório que force o
incremento conjunto do `CACHE_VERSION` no `sw.js` e da string de versão no
`index.html` no MESMO commit.

**Causa raiz (sistêmica):** processo de deploy informal — não havia
RELEASE_CHECKLIST.md no repo, e o DIARIO.md ficou 8 versões desatualizado
(parado em v2.9.52, código em v2.9.60). Esta sessão corrige ambos.

**Mudanças:**
- `sw.js`: `CACHE_VERSION = 'v2.9.61'` (era v2.9.56, salto de 5)
- `index.html`: 4 ocorrências de v2.9.60 → v2.9.61 (header L384, rodapé L891, backup rotativo L1141, backup manual L1180)
- `beta/` intocado (mantém v2.9.46 — abandonado, ver STATUS.md)
- DIARIO.md atualizado com histórico v2.9.53 → v2.9.61
- RELEASE_CHECKLIST.md criado (checklist obrigatório de deploy)
- STATUS.md criado (estado canônico do projeto)

**Violação consciente da Regra 6** (deploy beta antes de produção):
beta/ está em v2.9.46 e foi abandonado após incidente histórico em que
usuários reais cadastraram dados no beta em vez da produção. Causa raiz
não investigada. Mitigações substitutas adotadas neste deploy:
dry-run, validação técnica via diff, backup recente (06/05 15:26).

### Versões anteriores (v2.9.53 → v2.9.60) — reconstrução a partir do git log

DIARIO.md ficou parado em v2.9.52 (Regra 8 violada). Reconstrução honesta
abaixo, baseada em mensagens de commit — pode haver detalhes técnicos não
capturados.

| Versão | Data | Commit | O que fez |
|---|---|---|---|
| v2.9.53 | 22/03 | ab47126 | fix de 6 bugs de auditoria (delTx ag órfão, delCard sync, saveEdit ag, código morto, payFatura m/y, efetivar cp) |
| v2.9.54 | 22/03 | 57d29b9 | sincronizarFaturasEmAberto preserva tx faturaAgendada efetivadas |
| v2.9.55 | 23/03 | 7be43e1 | resultado real inclui cartões; gráfico de 3 barras (receita/despesa/cartões) |
| v2.9.56 | 23/03 | 1cbe25e | excluir recorrência em lote (esta / futuras / todas) com proteção de efetivadas |
| v2.9.57 | 26/03 | 2fe75b8 / bd376b3 | fix ações individuais brapi.dev (plano gratuito limita 1 ticker por request) |
| v2.9.58 | 27/03 | 9ba8abc | backup rotativo por dia da semana, intervalo 1h, regras Firestore corrigidas |
| v2.9.59 | 08/04 | b1a09d3 | fix bug de save em novos usuários (`_loadedFromCloud` não setado no primeiro acesso) |
| v2.9.60 | 08/04 | 3c646d9 | fix arredondamento de ponto flutuante em valores monetários (bankBal + saveTx) |

### Sprints admin concorrentes (v1.2.1 → v1.3.0, 27/03/2026)

| Versão admin | Commit | O que fez |
|---|---|---|
| v1.2.1 | ef2971a / f7be4e9 | seção de backup rotativo no painel admin |
| v1.2.2 | 85340df | fix de posicionamento de loadUserBackupStatus |
| v1.2.3 | 41c763f / a7c79d9 | mover loadUserBackupStatus para script principal |
| v1.3.0 | dd3b49d | backup rotativo + loadUserBackupStatus (inserção limpa) |

---

## SESSÃO 21/03/2026 — Sprints Admin Completos

### Sprint 1 — FUNCIONALIDADE (concluído ✅)

| # | Tarefa | Status |
|---|---|---|
| R1 | Botão "Exportar Dados dos Usuários (JSON)" no admin | ✅ Testado (24 usuários, JSON real) |
| R2 | Renomear botões "Baixar" para "Baixar Código-Fonte" | ✅ Testado |
| B1 | doDownloadFile() — resolvido via rename | ✅ Concluído |
| - | Forçar Backup Código-Fonte | ✅ Testado (v2.9.51, 259KB) |
| - | Baixar Código-Fonte (Manual) | ✅ Testado (HTML legítimo) |
| - | Baixar Código-Fonte (Auto) | ⚠️ Backup antigo contém dados, não código (auto-corrige no próximo ciclo) |

### Sprint 2 — SEGURANÇA (concluído ✅)

| # | Tarefa | Status |
|---|---|---|
| R3 | Verificação de UID fixo (ADMIN_UID) além do email | ✅ Testado (login OK) |
| B4 | Confirmação dupla ao excluir sugestão | ✅ Testado (2 confirms) |
| - | Versão visível no header do admin | ✅ "admin v1.2.0" |

**Commits Sprint 2:**
- 2c8367a: admin Sprint 2 - verificacao UID + confirmacao dupla
- f5434b4: admin v1.1.0 - fix ADMIN_UID, versao visivel no header

### Sprint 3 — MONITORAMENTO E CONFORMIDADE (concluído ✅)

**R5 — Log de acesso ao admin ✅**
- Função `logAdmin(action, details)` grava na coleção `admin_logs` do Firestore
- Registra: email, uid, action, details, userAgent, timestamp (serverTimestamp)
- Pontos de log: LOGIN, ACESSO_NEGADO, BACKUP_FORCADO, EXPORTAR_DADOS, EXCLUIR_SUGESTAO
- Nova aba "📋 Logs" no admin com tabela dos últimos 50 registros
- Firestore Rules atualizadas: `admin_logs` com read/write restrito ao admin email
- Testado: registro de LOGIN aparece corretamente na aba Logs

**R7 — Política de privacidade atualizada ✅**
- Nova seção "5. Acesso Administrativo e Tratamento de Dados" inserida no modal LGPD do index.html
- Cobre: acesso admin para suporte, não compartilhamento, log de auditoria, base legal LGPD Art. 7 IX
- Seções subsequentes renumeradas (5→6 Direitos, 6→7 Retenção, 7→8 Responsável, 8→9 Alterações)
- Deploy: v2.9.52 (index.html + sw.js)

**R4 — Avaliação das Firestore Rules ✅**
- Rules estão bem estruturadas, sem modo teste permissivo
- Cada usuário só acessa seus próprios dados (users/{uid})
- Admin tem leitura a todos os usuários (necessário para painel)
- Sugestões: create para qualquer autenticado, read/update/delete para admin
- Backups: restrito ao admin
- admin_logs: restrito ao admin (NOVA, publicada 21/03 11:50)
- Nenhuma correção necessária nas rules existentes

**Commits Sprint 3:**
- a74aa93: admin v1.2.0 - Sprint 3 R5 log de atividades com aba Logs
- 252d84d: admin - fix botao Logs na barra de abas
- 9a526de: v2.9.52 - LGPD secao Acesso Administrativo na politica de privacidade

---

## SESSÃO 18/03/2026 — Resolução do Incidente de Credenciais Firebase

### Versões deployadas em 18/03

| Versão | Commit | O que fez | Status |
|---|---|---|---|
| v2.9.47 | 39b7f60 | Corrigir credenciais Firebase, remover BETA do title/header | ✅ Ativo |
| v2.9.48 | a35f115 | Proteção anti-sobrescrita (_loadedFromCloud, _loadFailed), corrigir sendBeacon URL | ✅ Ativo |
| v2.9.49 | 095a37a | Guarda de projectId no onAuthStateChanged | ✅ Ativo |
| v2.9.50 | 6fce031 | sincronizarFaturasEmAberto desde janeiro (CAUSOU DUPLICATAS) | Revertido |
| v2.9.51 | 9aa2689 | Reverter v2.9.50 para 3 meses (estável) | ✅ Substituído por v2.9.52 |
| v2.9.52 | 9a526de | LGPD Acesso Administrativo na política de privacidade | ✅ Em produção |

### Proteções implementadas (v2.9.48-v2.9.49)
- window._loadedFromCloud — save() só executa se loadFromCloud() completou com sucesso
- window._loadFailed — se load falhar, save() é bloqueado na sessão inteira
- Guardas em save() e beforeunload
- sendBeacon URL corrigida de gestor-financeiro-beta para gestor-financeiro-pessoa-90a13
- Guarda de projectId no onAuthStateChanged: se projeto errado, signOut + limpa caches + reload

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

| Commit | Descrição | Arquivo(s) | Status |
|---|---|---|---|
| (pendente) | v2.9.61: fix Bug 4 ressincronizar CACHE_VERSION + DIARIO + RELEASE_CHECKLIST + STATUS | index.html, sw.js, DIARIO.md, RELEASE_CHECKLIST.md, STATUS.md | 🚧 Em deploy |
| 3c646d9 | v2.9.60: floating point rounding fix (bankBal + saveTx) | index.html, sw.js | ✅ Em produção |
| b1a09d3 | v2.9.59: fix new users save bug (_loadedFromCloud) | index.html, sw.js | Substituído por v2.9.60 |
| dd3b49d | admin v1.3.0: backup rotativo + loadUserBackupStatus | admin.html | ✅ Ativo |
| 9ba8abc | v2.9.58: backup rotativo + Firestore rules | index.html, sw.js, firestore.rules | Substituído |
| 2fe75b8 / bd376b3 | v2.9.57: fix ações individuais brapi.dev | index.html, sw.js | Substituído |
| 1cbe25e | v2.9.56: excluir recorrência em lote | index.html, sw.js | Substituído |
| 7be43e1 | v2.9.55: resultado real inclui cartões + gráfico 3 barras | index.html, sw.js | Substituído |
| 57d29b9 | v2.9.54: fix sincronizar preservar faturaAgendada efetivadas | index.html, sw.js | Substituído |
| ab47126 | v2.9.53: fix 6 bugs auditoria | index.html, sw.js | Substituído |
| 9a526de | v2.9.52: LGPD secao Acesso Administrativo | index.html, sw.js | Substituído |

---

## PLANO DE CORREÇÕES ADMIN — ESTADO FINAL

### Sprint 1 — FUNCIONALIDADE ✅ CONCLUÍDO
### Sprint 2 — SEGURANÇA ✅ CONCLUÍDO
### Sprint 3 — MONITORAMENTO ✅ CONCLUÍDO

---

## BUGS PENDENTES (index.html)

| Bug | Prioridade |
|---|---|
| sincronizarFaturasEmAberto() só verifica 3 meses — requer refactor upsert v2.10.0 | Alta |
| SW de produção intercepta /beta/ no iPhone | Média |
| Sugestão Patricio Mackson (recebimento parcial) | Baixa |
| Bug 3 — loadFromCloud catch silencioso (anotado para sessão futura) | Média |

### Bugs resolvidos nesta sessão (06/05/2026)
- **Bug 4** — CACHE_VERSION dessincronizado entre `sw.js` (v2.9.56) e `index.html` (v2.9.60). Ressincronizado em v2.9.61 com salto de 5 versões para forçar refresh em todos os clientes ativos.

---

## DÉBITO TÉCNICO — v2.10.0 (planejado)

Refatorar sincronizarFaturasEmAberto() de "apaga tudo e recria" para upsert por chave.
A v2.9.50 provou que expandir o range de meses sem refatorar gera duplicatas.
Nunca tocar nessa função sem dry-run e confirmação dupla.

---

## PRÓXIMOS PASSOS (ordem de prioridade)

1. Verificar política de privacidade no app (v2.9.52 — nova seção visível)
2. Refactor sincronizarFaturasEmAberto() para upsert (v2.10.0)
3. Responder sugestão Patricio Mackson
4. Gileno lançar dados manualmente a partir de janeiro/2026
5. Migração gradual Next.js + Supabase (planejamento)

---

## FIRESTORE RULES (publicadas 21/03/2026 11:50)

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && request.auth.token.email == 'gilenopaivalima@gmail.com';
    }
    match /userActivity/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
    match /sugestoes/{docId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && request.auth.token.email == 'gilenopaivalima@gmail.com';
    }
    match /backups/{docId} {
      allow read, write: if request.auth != null && request.auth.token.email == 'gilenopaivalima@gmail.com';
    }
    match /admin_logs/{docId} {
      allow read, write: if request.auth != null && request.auth.token.email == 'gilenopaivalima@gmail.com';
    }
  }
}
```

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
# Para produção direta:
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
- Painel admin: admin.html (admin v1.2.0, autenticação por ADMIN_EMAIL + ADMIN_UID)
- Dados centralizados no objeto D, persistido no Firestore
- Funções principais: goPage(), refresh(), rDash(), rExt(), rAgenda(), rCard(), loadFromCloud(), save()
- Proteções v2.9.48+: _loadedFromCloud, _loadFailed
- Guarda v2.9.49: verificação projectId no onAuthStateChanged
- Log admin v1.2.0: logAdmin() grava em admin_logs no Firestore

---

## DETALHES TÉCNICOS DO ADMIN.HTML (admin v1.2.0)

### Estrutura de autenticação
- ADMIN_EMAIL = 'gilenopaivalima@gmail.com'
- ADMIN_UID = '9NWXXOwHHUSrxEg7Ygw226zsuHj1'
- signInWithPopup verifica email + UID, signOut se diferente
- onAuthStateChanged verifica email + UID, mostra/esconde adminPanel

### Abas do admin
- Usuários | Sugestões | Métricas | Logs | Backup

### Funções do admin
- loadAll() → loadUsers(), loadSugestoes(), loadUserData()
- renderKPIs(), renderUsers(), renderSugestoes(), renderMetricas()
- downloadBackup('auto'/'manual') — baixa código-fonte do Firestore
- doDownloadFile(src, version) — cria blob HTML
- forceBackupNow() — fetch do index.html, salva em chunks no Firestore + logAdmin
- exportAllUsersData() — exporta coleção users completa como JSON + logAdmin
- delSug(id) — confirmação dupla + logAdmin
- logAdmin(action, details) — grava em admin_logs
- loadLogs() — carrega e renderiza últimos 50 logs

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
10. sed no zsh com ! e && falha — usar Python em arquivo para substituições complexas
11. Firestore Rules devem ser atualizadas ao criar novas coleções (admin_logs)
