const CACHE_VERSION = 'v2.9.41';
const CACHE_NAME = `gestor-cache-${CACHE_VERSION}`;

const ASSETS = [
  './',
  './index.html',
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Não interceptar requisições do Firebase
  if (e.request.url.includes('firestore') || e.request.url.includes('firebase')) return;
  
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
