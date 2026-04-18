**public/manifest.json**

```json
{
  "name": "Trackr",
  "short_name": "Trackr",
  "description": "Une application de suivi de sports et de marché",
  "theme_color": "#00ff88",
  "background_color": "#080808",
  "display": "standalone",
  "orientation": "portrait",
  "start_url": "/",
  "scope": "/",
  "shortcuts": [
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Accéder au tableau de bord",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ],
      "actions": [
        {
          "action": "open",
          "title": "Ouvrir le tableau de bord"
        }
      ]
    },
    {
      "name": "Markets",
      "short_name": "Markets",
      "description": "Accéder aux marchés",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ],
      "actions": [
        {
          "action": "open",
          "title": "Ouvrir les marchés"
        }
      ]
    },
    {
      "name": "Sports",
      "short_name": "Sports",
      "description": "Accéder aux sports",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ],
      "actions": [
        {
          "action": "open",
          "title": "Ouvrir les sports"
        }
      ]
    },
    {
      "name": "AnDy",
      "short_name": "AnDy",
      "description": "Accéder à AnDy",
      "icons": [
        {
          "src": "/icon-192.png",
          "sizes": "192x192",
          "type": "image/png"
        }
      ],
      "actions": [
        {
          "action": "open",
          "title": "Ouvrir AnDy"
        }
      ]
    }
  ]
}
```

**public/sw.js**

```javascript
// Trackr Service Worker — smart news notifications
const CACHE_NAME = 'trackr-v2'
const STATIC = ['/', '/index.html', '/manifest.json', '/apple-touch-icon.png']
const API_URL = 'https://api.trackr.io'

// ─── Install: cache shell ─────────────────────────────────────────────────────
self.addEventListener('install', e => {
  self.skipWaiting()
  e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC).catch(() => {})))
})

// ─── Activate: clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// ─── Fetch: cache-first for static assets, network-first for API calls ───────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  // Cache static assets
  if (STATIC.includes(url.pathname)) {
    e.respondWith(caches.match(url).then(r => r || fetch(url).catch(() => Promise.resolve())))
  }
  // Network-first for API calls
  else if (url.origin.includes(API_URL)) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)))
  }
  // Fallback to cache for other requests
  else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).catch(() => Promise.resolve())))
  }
})

// ─── Push: receive server-push notification ───────────────────────────────────
self.addEventListener('push', e => {
  if (!e.data) return
  const data = e.data.json()
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'trackr-news',
      data: { url: data.url || '/' },
      requireInteraction: data.urgent || false,
    })
  )
})

// ─── Message: show notification triggered from the app ───────────────────────
self.addEventListener('message', e => {
  if (e.data?.type === 'SHOW_NOTIFICATION') {
    const { title, body, url, urgent, tag } = e.data
    self.registration.showNotification(title, {
      body,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: tag || 'trackr-news',
      silent: false,
      data: { url: url || '/news' },
      requireInteraction: urgent || false,
      actions: [
        { action: 'open', title: 'Voir' },
        { action: 'dismiss', title: 'Ignorer' },
      ],
    })
  }
})

// ─── Notification click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', e => {
  e.notification.close()
  if (e.action === 'dismiss') return
  const url = e.notification.data?.url || '/news'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(self.location.origin))
      if (existing) {
        existing.focus()
        existing.postMessage({ type: 'NAVIGATE', url })
      } else {
        clients.openWindow(self.location.origin + url)
      }
    })
  )
})

// ─── Offline page ───────────────────────────────────────────────────────────
self.addEventListener('fetch', e => {
  if (e.request.url === '/offline') {
    e.respondWith(new Response(`
      <html>
        <head>
          <title>Page non disponible</title>
          <style>
            body {
              background-color: var(--bg);
              color: var(--t1);
              font-family: Inter;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <h1>Page non disponible</h1>
          <p>Veuillez réessayer plus tard.</p>
        </body>
      </html>
    `, { headers: { 'Content-Type': 'text/html' } }))
  }
})
```

**index.html**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Trackr</title>
  <link rel="manifest" href="/manifest.json">
  <link rel="icon" type="image/png" href="/icon-192.png">
  <link rel="apple-touch-icon" type="image/png" href="/apple-touch-icon.png">
  <link rel="stylesheet" href="/styles.css">
  <meta name="theme-color" content="#00ff88">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="display" content="standalone">
</head>
<body>
  <!-- Contenu de la page -->
  <script src="/script.js"></script>
</body>
</html>
```

**styles.css**

```css
body {
  background-color: var(--bg);
  color: var(--t1);
  font-family: Inter;
  text-align: center;
}

/* Ajoutez vos styles ici */
```

**script.js**

```javascript
// Ajoutez vos scripts ici
```

**package.json**

```json
{
  "name": "trackr",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "lucide-react": "^1.0.0",
    "@supabase/supabase-js": "^1.4.0"
  },
  "devDependencies": {
    "vite": "^4.1.0"
  }
}
```

**Vite configuration**

```javascript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'public',
    manifest: true,
    rollupOptions: {
      input: 'src/index.html',
    },
  },
});
```

**service worker registration**

```javascript
// src/index.js
import { register } from 'register-service-worker';

register('/sw.js', {
  ready() {
    console.log('Service worker ready');
  },
  registered() {
    console.log('Service worker registered');
  },
  cached() {
    console.log('Service worker cached');
  },
  updated() {
    console.log('Service worker updated');
  },
  offline() {
    console.log('Service worker offline');
  },
  error(error) {
    console.error('Service worker error:', error);
  },
});
```

Assurez-vous de mettre à jour votre fichier `package.json` pour inclure les dépendances nécessaires pour le service worker et les manifestes.