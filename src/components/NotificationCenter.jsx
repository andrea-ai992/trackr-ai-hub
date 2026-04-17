Stack complet production-ready

### **1️⃣ src/services/notificationService.js** (nouveau)

```javascript
/**
 * Service de gestion des notifications PWA
 * Gère le cycle de vie, persistence, et synchronisation Service Worker
 */

class NotificationService {
  constructor() {
    this.subscriptions = new Set();
    this.notifications = new Map();
    this.soundEnabled = true;
    this.vibrateEnabled = true;
    this.initStorageKey = 'trackr_notifications';
  }

  /**
   * Initialise le service + enregistre le Service Worker
   */
  async init() {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker non supporté');
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      });

      // Écouter les messages du Service Worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      // Vérifier permission notifications
      if ('Notification' in window && Notification.permission === 'default') {
        await this.requestPermission();
      }

      // Synchroniser les notifications stockées
      this.loadNotifications();

      console.log('NotificationService initialisé ✓');
      return true;
    } catch (error) {
      console.error('Erreur initialisation NotificationService:', error);
      return false;
    }
  }

  /**
   * Demande la permission push
   */
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Erreur demande permission:', error);
      return false;
    }
  }

  /**
   * Envoie une notification PWA
   * @param {Object} options - {title, body, type, icon, tag, actions, data, ttl}
   */
  async notify(options = {}) {
    const {
      id = `notif_${Date.now()}`,
      title = 'Notification',
      body = '',
      type = 'default',
      icon = '/icons/icon-192x192.png',
      tag = 'trackr-notification',
      actions = [],
      data = {},
      ttl = 5000, // time-to-live en ms
      autoClose = true,
    } = options;

    const notification = {
      id,
      title,
      body,
      type,
      icon,
      tag,
      actions,
      data,
      timestamp: Date.now(),
      ttl,
      autoClose,
      dismissed: false,
    };

    // Stockage en mémoire
    this.notifications.set(id, notification);
    this.saveNotifications();

    // Notifier tous les subscribers (UI)
    this.subscriptions.forEach((callback) => callback(notification));

    // Push PWA si permission accordée
    if (Notification.permission === 'granted' && 'serviceWorker' in navigator) {
      this.sendToPushAPI(notification);
    }

    // Son & vibration
    this.playSound(type);
    this.vibrate(type);

    // Auto-close
    if (autoClose && ttl > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, ttl);
    }

    return notification;
  }

  /**
   * Envoie la notification au Service Worker via Push API
   */
  async sendToPushAPI(notification) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        console.log('Push subscription non disponible');
        return;
      }

      // Simulation: on envoie via postMessage au SW
      registration.active?.postMessage({
        type: 'SHOW_NOTIFICATION',
        payload: {
          title: notification.title,
          options: {
            body: notification.body,
            icon: notification.icon,
            tag: notification.tag,
            badge: '/icons/badge-72x72.png',
            data: notification.data,
            actions: notification.actions.map((a) => ({
              action: a.action || a,
              title: a.title || a,
            })),
            requireInteraction: notification.actions.length > 0,
            timestamp: notification.timestamp,
          },
        },
      });
    } catch (error) {
      console.error('Erreur envoi Push API:', error);
    }
  }

  /**
   * Gère les messages du Service Worker
   */
  handleServiceWorkerMessage(data) {
    const { type, payload } = data;

    switch (type) {
      case 'NOTIFICATION_CLICKED':
        this.handleNotificationClick(payload);
        break;
      case 'NOTIFICATION_CLOSED':
        this.dismiss(payload.notificationId);
        break;
      case 'ACTION_CLICKED':
        this.handleAction(payload);
        break;
      default:
        break;
    }
  }

  /**
   * Gère le clic sur une notification
   */
  handleNotificationClick(payload) {
    const { notificationId, data } = payload;
    const notification = this.notifications.get(notificationId);

    if (notification?.data?.onClickRoute) {
      window.location.href = notification.data.onClickRoute;
    }

    this.subscriptions.forEach((callback) => {
      callback({ ...notification, action: 'click' });
    });

    this.dismiss(notificationId);
  }

  /**
   * Gère les actions de notification (boutons)
   */
  handleAction(payload) {
    const { notificationId, action } = payload;
    const notification = this.notifications.get(notificationId);

    const actionDef = notification?.actions?.find((a) => a.action === action);

    if (actionDef?.callback) {
      actionDef.callback(notification);
    }

    this.subscriptions.forEach((callback) => {
      callback({ ...notification, action });
    });

    this.dismiss(notificationId);
  }

  /**
   * Rejette une notification
   */
  dismiss(notificationId) {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.dismissed = true;
      this.notifications.delete(notificationId);
      this.saveNotifications();
    }
  }

  /**
   * Souscrit aux changements de notification
   */
  subscribe(callback) {
    this.subscriptions.add(callback);
    return () => this.subscriptions.delete(callback);
  }

  /**
   * Récupère toutes les notifications
   */
  getAll() {
    return Array.from(this.notifications.values());
  }

  /**
   * Sauvegarde les notifications en localStorage
   */
  saveNotifications() {
    const notifs = Array.from(this.notifications.values()).filter((n) => !n.dismissed);
    localStorage.setItem(this.initStorageKey, JSON.stringify(notifs));
  }

  /**
   * Charge les notifications depuis localStorage
   */
  loadNotifications() {
    try {
      const stored = localStorage.getItem(this.initStorageKey);
      if (stored) {
        const notifs = JSON.parse(stored);
        notifs.forEach((n) => {
          // Ne restaurer que les notifications non expirées
          if (n.timestamp + n.ttl > Date.now()) {
            this.notifications.set(n.id, n);
          }
        });
      }
    } catch (error) {
      console.error('Erreur chargement notifications:', error);
    }
  }

  /**
   * Joue un son selon le type
   */
  playSound(type = 'default') {
    if (!this.soundEnabled) return;

    const sounds = {
      success: '🔊 success',
      warning: '🔊 warning',
      error: '🔊 error',
      default: '🔊 notification',
    };

    // Utiliser Web Audio API ou élément audio
    // Pour MVP, simulation
    console.log(`🔊 Son: ${sounds[type] || sounds.default}`);
  }

  /**
   * Vibration haptique
   */
  vibrate(type = 'default') {
    if (!this.vibrateEnabled || !navigator.vibrate) return;

    const patterns = {
      success: [50, 30, 50],
      warning: [100, 50, 100],
      error: [200, 100, 200],
      default: [50],
    };

    navigator.vibrate(patterns[type] || patterns.default);
  }

  /**
   * Configure les préférences
   */
  setPreferences({ sound = true, vibrate = true } = {}) {
    this.soundEnabled = sound;
    this.vibrateEnabled = vibrate;
    localStorage.setItem('trackr_notif_prefs', JSON.stringify({ sound, vibrate }));
  }

  /**
   * Nettoie toutes les notifications
   */
  clearAll() {
    this.notifications.clear();
    this.saveNotifications();
  }
}

// Instance singleton
export const notificationService = new NotificationService();
```

---

### **2️⃣ public/service-worker.js** (mis à jour)

```javascript
/**
 * Service Worker Trackr PWA
 * Gère les push notifications, cache, et événements offline
 */

const CACHE_NAME = 'trackr-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Installation
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache initialized');
      return cache.addAll(ASSETS_TO_CACHE).catch(() => {
        console.log('[SW] Some assets could not be cached');
      });
    })
  );
  self.skipWaiting();
});

// Activation
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log(`[SW] Suppression ancien cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch
self.addEventListener('fetch', (event) => {
  // Only GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request)
        .then((response) => {
          // Don't cache non-GET or non-200
          if (!response || response.status !== 200 || response.type === 'error') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Fallback offline
          return new Response('Offline - Veuillez vérifier votre connexion', {
            status: 503,
          });
        });
    })
  );
});

// Push notifications
self.addEventListener('push', (event) => {
  let notificationData = {
    title: 'Trackr Notification',
    body: 'Nouvelle mise à jour',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
  };

  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      notificationData.body = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      tag: notificationData.tag || 'trackr',
      data: notificationData.data || {},
      actions: notificationData.actions || [],
      requireInteraction: (notificationData.actions || []).length > 0,
      timestamp: notificationData.timestamp || Date.now(),
    })
  );
});

// Message du client (showNotification via postMessage)
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;

  if (type === 'SHOW_NOTIFICATION') {
    const { title, options } = payload;
    self.registration.showNotification(title, {
      ...options,
      data: { ...options.data, notificationId: options.data?.id || Date.now() },
    });
  }
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  const action = event.action;

  if (action) {
    // Action spécifique (bouton)
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: 'ACTION_CLICKED',
          payload: {
            notificationId: notificationData.notificationId,
            action,
            data: notificationData,
          },
        });
      });
    });
  } else {
    // Clic sur la notification
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        // Chercher un client existant
        for (const client of clientList) {
          if (client.url === '/' && 'focus' in client) {
            client.focus();
            client.postMessage({
              type: 'NOTIFICATION_CLICKED',
              payload: {
                notificationId: notificationData.notificationId,
                data: notificationData,
              },
            });
            return;
          }
        }

        // Ouvrir une nouvelle fenêtre
        if (clients.openWindow) {
          return clients.openWindow(notificationData.onClickRoute || '/').then((client) => {
            if (client) {
              client.postMessage({
                type: 'NOTIFICATION_CLICKED',
                payload: {
                  notificationId: notificationData.notificationId,
                  data: notificationData,
                },
              });
            }
          });
        }
      })
    );
  }
});

// Notification close
self.addEventListener('notificationclose', (event) => {
  const notificationData = event.notification.data;
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({
        type: 'NOTIFICATION_CLOSED',
        payload: {
          notificationId: notificationData.notificationId,
        },
      });
    });
  });
});

console.log('[Service Worker] Trackr PWA Ready');
```

---

### **3️⃣ src/components/NotificationCenter.jsx** (complet & corrigé)

```javascript
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { notificationService } from '../services/notificationService';

const NOTIFICATION_ICONS = {
  default: '🔔',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  info: 'ℹ️',
  task: '📋',
  reminder: '⏰',
  update: '🔄',
};

const NOTIFICATION_COLORS = {
  default: { bg: '#1a1a2e', accent: '#6c63ff', text: '#e0e0e0' },
  success: { bg: '#0d2818', accent: '#00c853', text: '#e0e0e0' },
  warning: { bg: '#2d1f00', accent: '#ffab00', text: '#e0e0e0' },
  error: { bg: '#2d0d0d', accent: '#ff1744', text: '#e0e0e0' },
  info: { bg: '#0d1f2d', accent: '#00b0ff', text: '#e0e0e0' },
  task: { bg: '#1a1a2e', accent: '#7c4dff', text: '#e0e0e0' },
  reminder: { bg: '#1a2d1a', accent: '#69f0ae', text: '#e0e0e0' },
  update: { bg: '#1a1f2d', accent: '#40c4ff', text: '#e0e0e0' },
};

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return 'À l\'instant';
  if (minutes < 60) return `Il y a ${minutes}min`;
  if (hours < 24) return `Il y a ${hours}h`;
  if (days === 1) return 'Hier';
  return `Il y a ${days}j`;
}

function NotificationItem({ notification, onDismiss, onAction, index }) {
  const [isExiting, setIsExiting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [swipeX, setSwipeX] = useState(0);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const itemRef = useRef(null);

  const colors = NOTIFICATION_COLORS[notification.type] || NOTIFICATION_COLORS.default;
  const icon = NOTIFICATION_ICONS[notification.type] || NOTIFICATION_ICONS.default;

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(notification.id);
    }, 300);
  }, [notification.id, onDismiss]);

  const handleAction = useCallback((actionId) => {
    onAction(notification.id, actionId);
    handleDismiss();
  }, [notification.id,