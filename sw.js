// Gileno — Gestão Financeira | Service Worker
// ⚠️ IMPORTANTE: Sempre incrementar CACHE_VERSION junto com a versão do index.html
const CACHE_VERSION = 'v2.9.52';
const CACHE_NAME = `gestor-cache-${CACHE_VERSION}`;

// NUNCA cachear index.html e admin.html — sempre buscar da rede para garantir versão atual
const NEVER_CACHE = ['/', './index.html', '/gestor/beta/', '/gestor/beta/index.html', '/gestor/admin.html', 'admin.html'];

// INSTALAÇÃO — skipWaiting imediato, sem cachear index.html
self.addEventListener('install', e => {
  console.log('[SW] Instalando', CACHE_VERSION);
  self.skipWaiting();
  // Não faz cache de nada na instalação — network-first resolve tudo
});

// ATIVAÇÃO — remove TODOS os caches antigos sem exceção
self.addEventListener('activate', e => {
  console.log('[SW] Ativando', CACHE_VERSION);
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(k => {
        console.log('[SW] Deletando cache:', k);
        return caches.delete(k);
      })))
      .then(() => self.clients.claim())
      .then(() =>
        self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
          console.log('[SW] Notificando', clients.length, 'clientes — nova versão:', CACHE_VERSION);
          clients.forEach(client => {
            client.postMessage({ type: 'NEW_VERSION', version: CACHE_VERSION });
          });
        })
      )
  );
});

// FETCH — index.html SEMPRE da rede, resto network-first com cache fallback
self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Nunca interceptar Firebase
  if (url.includes('firestore') || url.includes('firebase') ||
      url.includes('googleapis') || url.includes('gstatic') ||
      url.includes('google.com')) return;

  // index.html — SEMPRE da rede, nunca do cache
  const isIndex = NEVER_CACHE.some(p => url.endsWith(p) || url.includes('index.html') || url.includes('admin.html'));
  if (isIndex) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .catch(() => caches.match(e.request)) // fallback offline
    );
    return;
  }

  // Outros assets — network-first com cache
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
