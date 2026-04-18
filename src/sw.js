src/sw.js
```javascript
const CACHE_NAME = 'trackr-v1';
const OFFLINE_URL = '/offline.html';
const FALLBACK_IMAGE = '/fallback.svg';

// Liste des assets statiques à mettre en cache lors de l'installation
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/assets/favicon.ico',
  '/assets/favicon-16x16.png',
  '/assets/favicon-32x32.png',
  '/assets/apple-touch-icon.png',
  '/assets/splash-192x192.png',
  '/assets/splash-512x512.png',
  '/assets/fonts/Inter-Regular.woff2',
  '/assets/fonts/Inter-Bold.woff2',
  OFFLINE_URL,
  FALLBACK_IMAGE,
  '/css/styles.css',
  '/css/tokens.css',
  '/js/main.js',
  '/js/analytics.js'
];

// Installation du service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .catch((error) => {
        console.error('Erreur lors du cache des assets:', error);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Stratégie de cache dynamique pour les requêtes
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Ignorer les requêtes non-GET ou vers des APIs externes
  if (request.method !== 'GET' || request.url.startsWith('http://') || request.url.startsWith('https://')) {
    return;
  }

  // Gérer les requêtes pour les assets statiques
  if (ASSETS_TO_CACHE.includes(new URL(request.url).pathname)) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          return response || fetch(request);
        })
    );
    return;
  }

  // Stratégie cache-first pour les requêtes dynamiques
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Si la réponse est en cache, la retourner
        if (response) {
          return response;
        }

        // Sinon, faire une requête réseau
        return fetch(request)
          .then((networkResponse) => {
            // Si la réponse est valide, la mettre en cache
            if (networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch(() => {
            // En cas d'échec réseau, retourner la page offline
            if (request.headers.get('Accept').includes('text/html')) {
              return caches.match(OFFLINE_URL);
            }
            // Retourner l'image fallback pour les images
            if (request.headers.get('Accept').includes('image/')) {
              return caches.match(FALLBACK_IMAGE);
            }
            return new Response('Service indisponible', { status: 503 });
          });
      })
  );
});

// Gestion des erreurs de cache
self.addEventListener('error', (event) => {
  console.error('Erreur dans le service worker:', event.error);
});

// Gestion des messages du service worker
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Pré-caching des assets critiques
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  if (data?.action === 'precache') {
    event.waitUntil(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.addAll(data.assets);
        })
    );
  }
});