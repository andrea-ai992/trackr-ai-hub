// Trackr Service Worker — smart news notifications
const CACHE_NAME = 'trackr-v2'
const STATIC = ['/', '/index.html', '/manifest.json', '/apple-touch-icon.png']

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

// ─── Fetch: network first, fallback to cache ─────────────────────────────────
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url)
  // Don't cache API calls or external resources
  if (!url.origin.includes(self.location.origin)) return
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  )
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
