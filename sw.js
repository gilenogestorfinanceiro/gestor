// Gileno - Gestão Financeira | Service Worker
// Atualizar este número a cada nova versão do app
const CACHE_VERSION = '2.9.4';
const CACHE_NAME = 'gileno-gf-' + CACHE_VERSION;

const FILES_TO_CACHE = [
    './',
    './index.html',
    './admin.html'
];

// Instalação — faz cache dos arquivos principais
self.addEventListener('install', event => {
    console.log('[SW] Instalando versão', CACHE_VERSION);
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        }).then(() => {
            // Força ativação imediata sem esperar fechar as abas
            return self.skipWaiting();
        })
    );
});

// Ativação — remove caches antigos automaticamente
self.addEventListener('activate', event => {
    console.log('[SW] Ativando versão', CACHE_VERSION);
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name.startsWith('gileno-gf-') && name !== CACHE_NAME)
                    .map(name => {
                        console.log('[SW] Removendo cache antigo:', name);
                        return caches.delete(name);
                    })
            );
        }).then(() => {
            // Toma controle de todas as abas abertas imediatamente
            return self.clients.claim();
        }).then(() => {
            // Notifica todas as abas que há uma nova versão
            return self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({type: 'NEW_VERSION', version: CACHE_VERSION});
                });
            });
        })
    );
});

// Fetch — Network first, fallback para cache
self.addEventListener('fetch', event => {
    // Ignora requisições externas (Firebase, Google Fonts, etc)
    if (!event.request.url.includes('gilenogestorfinanceiro.github.io') && 
        !event.request.url.includes('localhost')) {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then(response => {
                // Atualiza o cache com a versão mais recente da rede
                if (response.ok) {
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseClone);
                    });
                }
                return response;
            })
            .catch(() => {
                // Se offline, usa o cache
                return caches.match(event.request);
            })
    );
});
