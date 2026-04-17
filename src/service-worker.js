Je vais implémenter le système PWA complet. Voici tous les fichiers :

---

FILE: src/service-worker.js

const CACHE_VERSION = 'v1.2.0';
const STATIC_CACHE = `trackr-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `trackr-dynamic-${CACHE_VERSION}`;
const API_CACHE = `trackr-api-${CACHE_VERSION}`;
const OFFLINE_QUEUE_KEY = 'trackr-offline-queue';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html',
];

const API_PATTERNS = [
  /\/api\//,
  /supabase\.co/,
  /firebase\.com/,
];

const STATIC_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.svg$/,
  /\.ico$/,
];

self.addEventListener('install', (event) => {
  console.log('[SW] Install event - version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Some assets failed to cache:', err);
        return Promise.resolve();
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name.startsWith('trackr-') &&
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== API_CACHE
            );
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET' && request.method !== 'POST') {
    return;
  }

  if (url.protocol === 'chrome-extension:') {
    return;
  }

  const isAPI = API_PATTERNS.some((pattern) => pattern.test(request.url));
  const isStatic = STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname));
  const isNavigation = request.mode === 'navigate';

  if (isAPI) {
    event.respondWith(networkFirstStrategy(request));
  } else if (isStatic) {
    event.respondWith(cacheFirstStrategy(request));
  } else if (isNavigation) {
    event.respondWith(navigationStrategy(request));
  } else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

async function cacheFirstStrategy(request) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Cache hit (static):', request.url);
      return cached;
    }

    const response = await fetch(request.clone());
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    console.warn('[SW] Cache first failed:', err);
    const cached = await caches.match(request);
    if (cached) return cached;
    return new Response('Asset not available offline', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function networkFirstStrategy(request) {
  const isPost = request.method === 'POST';

  if (isPost) {
    try {
      const response = await fetch(request.clone());
      return response;
    } catch (err) {
      console.warn('[SW] Network failed for POST, queuing:', request.url);
      await queueOfflineRequest(request);
      return new Response(
        JSON.stringify({
          offline: true,
          queued: true,
          message: 'Request queued for sync when online',
          timestamp: Date.now(),
        }),
        {
          status: 202,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }

  try {
    const response = await Promise.race([
      fetch(request.clone()),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      ),
    ]);

    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }

    return response;
  } catch (err) {
    console.warn('[SW] Network first failed, trying cache:', request.url);
    const cached = await caches.match(request);
    if (cached) {
      const cachedResponse = cached.clone();
      const body = await cachedResponse.json().catch(() => ({}));
      return new Response(
        JSON.stringify({ ...body, fromCache: true, offline: true }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({
        offline: true,
        error: 'No cached data available',
        timestamp: Date.now(),
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request.clone())
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);

  return cached || fetchPromise || new Response('Not available', { status: 503 });
}

async function navigationStrategy(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(DYNAMIC_CACHE);
    cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached = await caches.match(request);
    if (cached) return cached;

    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;

    const indexPage = await caches.match('/');
    if (indexPage) return indexPage;

    return new Response(
      `<!DOCTYPE html>
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Trackr - Offline</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              background: #1a1a1a;
              color: #ffffff;
              font-family: 'Inter', system-ui, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 20px;
            }
            .container {
              text-align: center;
              max-width: 400px;
            }
            .icon {
              font-size: 64px;
              margin-bottom: 24px;
              animation: pulse 2s infinite;
            }
            h1 {
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 12px;
              color: #ffffff;
            }
            p {
              font-size: 16px;
              color: #888888;
              line-height: 1.6;
              margin-bottom: 32px;
            }
            .badge {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: #ef4444;
              color: white;
              padding: 8px 16px;
              border-radius: 999px;
              font-size: 14px;
              font-weight: 600;
            }
            .dot {
              width: 8px;
              height: 8px;
              background: white;
              border-radius: 50%;
              animation: pulse 1.5s infinite;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; transform: scale(1); }
              50% { opacity: 0.5; transform: scale(0.95); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">📡</div>
            <h1>Mode Hors-ligne</h1>
            <p>Trackr est en mode hors-ligne. Vos données sont sauvegardées localement et se synchroniseront automatiquement à la reconnexion.</p>
            <div class="badge">
              <div class="dot"></div>
              Hors-ligne
            </div>
          </div>
        </body>
      </html>`,
      {
        status: 200,
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

async function queueOfflineRequest(request) {
  try {
    const body = await request.clone().text().catch(() => '');
    const queuedRequest = {
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body,
      timestamp: Date.now(),
      retries: 0,
    };

    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: 'QUEUE_REQUEST',
        payload: queuedRequest,
      });
    });

    console.log('[SW] Request queued:', queuedRequest.id);
  } catch (err) {
    console.error('[SW] Failed to queue request:', err);
  }
}

self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync event:', event.tag);

  if (event.tag === 'trackr-sync-queue') {
    event.waitUntil(syncOfflineQueue());
  }

  if (event.tag === 'trackr-tracking-sync') {
    event.waitUntil(syncTrackingData());
  }
});

async function syncOfflineQueue() {
  const clients = await self.clients.matchAll();

  return new Promise((resolve) => {
    if (clients.length === 0) {
      resolve();
      return;
    }

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = async (event) => {
      const { queue } = event.data;
      if (!queue || queue.length === 0) {
        resolve();
        return;
      }

      console.log('[SW] Syncing', queue.length, 'queued requests');

      const results = await Promise.allSettled(
        queue.map(async (item) => {
          try {
            const response = await fetch(item.url, {
              method: item.method,
              headers: item.headers,
              body: item.body || undefined,
            });

            return { id: item.id, success: response.ok, status: response.status };
          } catch (err) {
            return { id: item.id, success: false, error: err.message };
          }
        })
      );

      clients.forEach((client) => {
        client.postMessage({
          type: 'SYNC_COMPLETE',
          results: results.map((r) => r.value || r.reason),
        });
      });

      resolve();
    };

    clients[0].postMessage({ type: 'GET_QUEUE' }, [messageChannel.port2]);
    setTimeout(resolve, 10000);
  });
}

async function syncTrackingData() {
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_TRACKING_DATA' });
  });
}

self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (type === 'GET_CACHE_INFO') {
    getCacheInfo().then((info) => {
      event.ports[0]?.postMessage({ type: 'CACHE_INFO', info });
    });
  }

  if (type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0]?.postMessage({ type: 'CACHE_CLEARED' });
    });
  }

  if (type === 'PREFETCH') {
    const { urls } = payload || {};
    if (urls && Array.isArray(urls)) {
      prefetchUrls(urls);
    }
  }
});

async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {};

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    info[name] = {
      count: keys.length,
      urls: keys.map((req) => req.url),
    };
  }

  return info;
}

async function clearAllCaches() {
  const cacheNames = await caches.keys();
  await Promise.all(cacheNames.map((name) => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

async function prefetchUrls(urls) {
  const cache = await caches.open(DYNAMIC_CACHE);
  await Promise.allSettled(
    urls.map(async (url) => {
      try {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
          console.log('[SW] Prefetched:', url);
        }
      } catch (err) {
        console.warn('[SW] Prefetch failed:', url, err);
      }
    })
  );
}

self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json().catch(() => ({
    title: 'Trackr',
    body: 'Nouvelle notification',
  }));

  event.waitUntil(
    data.then((payload) => {
      return self.registration.showNotification(payload.title || 'Trackr', {
        body: payload.body || '',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: payload.tag || 'trackr-notification',
        data: payload.data || {},
        actions: payload.actions || [],
        vibrate: [100, 50, 100],
      });
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        const existingClient = clients.find((c) => c.url === url);
        if (existingClient) {
          return existingClient.focus();
        }
        return self.clients.openWindow(url);
      })
  );
});

console.log('[SW] Trackr Service Worker loaded - version:', CACHE_VERSION);

---

FILE: src/hooks/useNetworkStatus.ts

import { useState, useEffect, useCallback, useRef } from 'react';

export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
  retries: number;
}

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  connectionType: string | null;
  effectiveType: string | null;
  downlink: number | null;
  rtt: number | null;
  offlineQueue: QueuedRequest[];
  queueCount: number;
  lastOnlineAt: number | null;
  lastOfflineAt: number | null;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  addToQueue: (request: Omit<QueuedRequest, 'id' | 'timestamp' | 'retries'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  syncQueue: () => Promise<void>;
  triggerSync: () => void;
}

const QUEUE_STORAGE_KEY = 'trackr-offline-queue';
const NETWORK_STATUS_KEY = 'trackr-network-status';

function getConnectionInfo() {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  if (!connection) {
    return {
      connectionType: null,
      effectiveType: null,
      downlink: null,
      rtt: null,
    };
  }

  return {
    connectionType: connection.type || null,
    effectiveType: connection.effectiveType || null,
    downlink: connection.downlink || null,
    rtt: connection.rtt || null,
  };
}

function loadQueue(): QueuedRequest[] {
  try {
    const stored = localStorage.getItem(QUEUE_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveQueue(queue: QueuedRequest[]): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
  } catch (err) {
    console.warn('[useNetworkStatus] Failed to save queue to localStorage:', err);
  }
}

function generateId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState<boolean>(() => navigator.onLine);
  const [wasOffline, setWasOffline] = useState<boolean>(false);
  const [connectionInfo, setConnectionInfo] = useState(getConnectionInfo);
  const [offlineQueue, setOfflineQueue] = useState<QueuedRequest[]>(loadQueue);
  const [lastOnlineAt, setLastOnlineAt] = useState<number | null>(() => {
    try {