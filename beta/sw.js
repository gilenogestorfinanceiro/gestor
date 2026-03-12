// Gileno — Gestão Financeira | Service Worker
// ⚠️ IMPORTANTE: Sempre incrementar CACHE_VERSION junto com a versão do index.html
const CACHE_VERSION = 'v2.9.43';
const CACHE_NAME = `gestor-cache-${CACHE_VERSION}`;

const ASSETS = [
  './',
  './index.html',
];

// INSTALAÇÃO — faz cache dos arquivos e ativa imediatamente
self.addEventListener('install', e => {
  console.log('[SW] Instalando', CACHE_VERSION);
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting()) // força ativação sem esperar fechar abas
  );
});

// ATIVAÇÃO — remove caches antigos e notifica o app da nova versão
self.addEventListener('activate', e => {
  console.log('[SW] Ativando', CACHE_VERSION);
  e.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k.startsWith('gestor-cache-') && k !== CACHE_NAME)
            .map(k => {
              console.log('[SW] Removendo cache antigo:', k);
              return caches.delete(k);
            })
        )
      )
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'NEW_VERSION', version: CACHE_VERSION });
          });
        })
      )
  );
});

// FETCH — Network first, fallback para cache
self.addEventListener('fetch', e => {
  const url = e.request.url;
  if (
    url.includes('firestore') ||
    url.includes('firebase') ||
    url.includes('googleapis') ||
    url.includes('gstatic') ||
    url.includes('google.com')
  ) return;

  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(e.request))
  );
});
