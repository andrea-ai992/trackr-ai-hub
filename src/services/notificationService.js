src/services/notificationService.js

const NOTIFICATION_SERVICE_VERSION = '1.0.0';
const DB_NAME = 'trackr-notifications';
const DB_VERSION = 1;
const STORE_NAME = 'notifications';
const MAX_NOTIFICATIONS = 100;
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';

class NotificationService {
  constructor() {
    this.db = null;
    this.swRegistration = null;
    this.pushSubscription = null;
    this.listeners = new Map();
    this.isInitialized = false;
    this.permissionState = 'default';
    this.audioContext = null;
    this.notificationQueue = [];
    this.isProcessingQueue = false;
    this.badgeCount = 0;
    this.version = NOTIFICATION_SERVICE_VERSION;
  }

  async init() {
    if (this.isInitialized) return this;

    try {
      await this._initIndexedDB();
      await this._initServiceWorker();
      await this._checkPermissionState();
      await this._syncBadgeCount();
      this._setupMessageListener();
      this._setupVisibilityListener();
      this.isInitialized = true;
      this._emit('initialized', { version: this.version });
      return this;
    } catch (error) {
      console.error('[NotificationService] Init failed:', error);
      this._emit('error', { type: 'init', error });
      throw error;
    }
  }

  _initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: false,
          });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('read', 'read', { unique: false });
          store.createIndex('dismissed', 'dismissed', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        reject(new Error(`IndexedDB error: ${event.target.error}`));
      };
    });
  }

  async _initServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.warn('[NotificationService] Service Worker not supported');
      return;
    }

    try {
      const registrations = await navigator.serviceWorker.getRegistrations();
      let registration = registrations.find(r =>
        r.active && r.active.scriptURL.includes('service-worker.js')
      );

      if (!registration) {
        registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
          updateViaCache: 'none',
        });
      }

      this.swRegistration = registration;

      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            this._emit('swUpdated', { registration });
          }
        });
      });

      if (registration.waiting) {
        this._emit('swUpdated', { registration });
      }

      await navigator.serviceWorker.ready;
    } catch (error) {
      console.error('[NotificationService] SW registration failed:', error);
    }
  }

  async _checkPermissionState() {
    if (!('Notification' in window)) {
      this.permissionState = 'unsupported';
      return;
    }

    this.permissionState = Notification.permission;

    if ('permissions' in navigator) {
      try {
        const status = await navigator.permissions.query({ name: 'notifications' });
        this.permissionState = status.state;
        status.addEventListener('change', () => {
          this.permissionState = status.state;
          this._emit('permissionChanged', { state: status.state });
        });
      } catch (e) {
        this.permissionState = Notification.permission;
      }
    }
  }

  _setupMessageListener() {
    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('message', (event) => {
      const { type, payload } = event.data || {};

      switch (type) {
        case 'NOTIFICATION_CLICKED':
          this._handleNotificationClick(payload);
          break;
        case 'NOTIFICATION_CLOSED':
          this._handleNotificationClose(payload);
          break;
        case 'PUSH_RECEIVED':
          this._handlePushReceived(payload);
          break;
        case 'ACTION_CLICKED':
          this._handleActionClick(payload);
          break;
        default:
          break;
      }
    });
  }

  _setupVisibilityListener() {
    document.addEventListener('visibilitychange', async () => {
      if (document.visibilityState === 'visible') {
        await this._syncBadgeCount();
        this._emit('visibilityVisible', {});
      }
    });
  }

  async requestPermission(options = {}) {
    const { silent = false } = options;

    if (!('Notification' in window)) {
      return { granted: false, reason: 'unsupported' };
    }

    if (Notification.permission === 'granted') {
      this.permissionState = 'granted';
      await this._initPushSubscription();
      return { granted: true, reason: 'already_granted' };
    }

    if (Notification.permission === 'denied') {
      this.permissionState = 'denied';
      return { granted: false, reason: 'denied' };
    }

    if (!silent) {
      this._emit('permissionRequesting', {});
    }

    try {
      const permission = await Notification.requestPermission();
      this.permissionState = permission;
      this._emit('permissionChanged', { state: permission });

      if (permission === 'granted') {
        await this._initPushSubscription();
        return { granted: true, reason: 'user_granted' };
      }

      return { granted: false, reason: 'user_denied' };
    } catch (error) {
      console.error('[NotificationService] Permission request failed:', error);
      return { granted: false, reason: 'error', error };
    }
  }

  async _initPushSubscription() {
    if (!this.swRegistration || !VAPID_PUBLIC_KEY) return null;

    try {
      const existingSubscription = await this.swRegistration.pushManager.getSubscription();

      if (existingSubscription) {
        this.pushSubscription = existingSubscription;
        return existingSubscription;
      }

      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });

      this.pushSubscription = subscription;
      this._emit('pushSubscribed', { subscription });
      return subscription;
    } catch (error) {
      console.error('[NotificationService] Push subscription failed:', error);
      return null;
    }
  }

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  async show(options = {}) {
    const notification = this._buildNotification(options);

    await this._saveNotification(notification);
    await this._incrementBadge();

    if (document.visibilityState === 'visible' && !options.forceSystem) {
      this._emit('notification', notification);
      if (options.sound !== false) {
        this._playSound(options.soundType || 'default');
      }
      return notification;
    }

    if (this.permissionState === 'granted' && this.swRegistration) {
      await this._showSystemNotification(notification);
    }

    return notification;
  }

  _buildNotification(options) {
    return {
      id: options.id || this._generateId(),
      title: options.title || 'Trackr',
      body: options.body || '',
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      image: options.image || null,
      tag: options.tag || null,
      data: options.data || {},
      actions: options.actions || [],
      type: options.type || 'default',
      priority: options.priority || 'normal',
      timestamp: options.timestamp || Date.now(),
      read: false,
      dismissed: false,
      silent: options.silent || false,
      requireInteraction: options.requireInteraction || false,
      vibrate: options.vibrate || [200, 100, 200],
      renotify: options.renotify || false,
    };
  }

  async _showSystemNotification(notification) {
    if (!this.swRegistration) return;

    try {
      const controller = navigator.serviceWorker.controller;

      if (controller) {
        controller.postMessage({
          type: 'SHOW_NOTIFICATION',
          payload: notification,
        });
      } else {
        await this.swRegistration.showNotification(notification.title, {
          body: notification.body,
          icon: notification.icon,
          badge: notification.badge,
          image: notification.image,
          tag: notification.tag,
          data: { id: notification.id, ...notification.data },
          actions: notification.actions,
          timestamp: notification.timestamp,
          silent: notification.silent,
          requireInteraction: notification.requireInteraction,
          vibrate: notification.vibrate,
          renotify: notification.renotify,
        });
      }
    } catch (error) {
      console.error('[NotificationService] Show system notification failed:', error);
    }
  }

  async _saveNotification(notification) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(notification);

      request.onsuccess = () => resolve(notification);
      request.onerror = () => reject(request.error);

      transaction.oncomplete = () => this._pruneOldNotifications();
    });
  }

  async _pruneOldNotifications() {
    if (!this.db) return;

    const all = await this.getAll();
    if (all.length <= MAX_NOTIFICATIONS) return;

    const toDelete = all
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(0, all.length - MAX_NOTIFICATIONS);

    const transaction = this.db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);

    toDelete.forEach(n => store.delete(n.id));
  }

  async getAll(filters = {}) {
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        let results = request.result || [];

        if (filters.type) {
          results = results.filter(n => n.type === filters.type);
        }
        if (filters.read !== undefined) {
          results = results.filter(n => n.read === filters.read);
        }
        if (filters.dismissed !== undefined) {
          results = results.filter(n => n.dismissed === filters.dismissed);
        }

        results.sort((a, b) => b.timestamp - a.timestamp);

        if (filters.limit) {
          results = results.slice(0, filters.limit);
        }

        resolve(results);
      };

      request.onerror = () => reject(request.error);
    });
  }

  async getUnread() {
    return this.getAll({ read: false, dismissed: false });
  }

  async markAsRead(id) {
    return this._updateNotification(id, { read: true });
  }

  async markAllAsRead() {
    const unread = await this.getUnread();
    const promises = unread.map(n => this.markAsRead(n.id));
    await Promise.all(promises);
    await this._syncBadgeCount();
    this._emit('allRead', {});
  }

  async dismiss(id) {
    await this._updateNotification(id, { dismissed: true, read: true });
    await this._syncBadgeCount();
    this._emit('dismissed', { id });
  }

  async dismissAll() {
    const all = await this.getAll({ dismissed: false });
    const promises = all.map(n => this.dismiss(n.id));
    await Promise.all(promises);
    this._emit('allDismissed', {});
  }

  async delete(id) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => {
        this._syncBadgeCount();
        this._emit('deleted', { id });
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async clearAll() {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onsuccess = () => {
        this._resetBadge();
        this._emit('cleared', {});
        resolve();
      };

      request.onerror = () => reject(request.error);
    });
  }

  async _updateNotification(id, updates) {
    if (!this.db) return;

    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(id);

      getRequest.onsuccess = () => {
        const notification = getRequest.result;
        if (!notification) {
          resolve(null);
          return;
        }

        const updated = { ...notification, ...updates, updatedAt: Date.now() };
        const putRequest = store.put(updated);

        putRequest.onsuccess = () => {
          this._emit('updated', updated);
          resolve(updated);
        };

        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  async getUnreadCount() {
    const unread = await this.getUnread();
    return unread.length;
  }

  async _syncBadgeCount() {
    const count = await this.getUnreadCount();
    this.badgeCount = count;
    await this._updateBadge(count);
    this._emit('badgeUpdated', { count });
    return count;
  }

  async _incrementBadge() {
    this.badgeCount += 1;
    await this._updateBadge(this.badgeCount);
    this._emit('badgeUpdated', { count: this.badgeCount });
  }

  async _updateBadge(count) {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await navigator.setAppBadge(count);
        } else {
          await navigator.clearAppBadge();
        }
      } catch (e) {
        console.warn('[NotificationService] Badge update failed:', e);
      }
    }
  }

  async _resetBadge() {
    this.badgeCount = 0;
    if ('clearAppBadge' in navigator) {
      try {
        await navigator.clearAppBadge();
      } catch (e) {}
    }
    this._emit('badgeUpdated', { count: 0 });
  }

  _initAudioContext() {
    if (this.audioContext) return this.audioContext;

    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass();
      }
    } catch (e) {
      console.warn('[NotificationService] AudioContext not available');
    }

    return this.audioContext;
  }

  _playSound(type = 'default') {
    try {
      const ctx = this._initAudioContext();
      if (!ctx) return;

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      const sounds = {
        default: { freq: 520, duration: 0.15, wave: 'sine', gain: 0.08 },
        success: { freq: 660, duration: 0.2, wave: 'sine', gain: 0.06 },
        warning: { freq: 440, duration: 0.25, wave: 'triangle', gain: 0.07 },
        error: { freq: 220, duration: 0.3, wave: 'sawtooth', gain: 0.05 },
        message: { freq: 880, duration: 0.1, wave: 'sine', gain: 0.06 },
        achievement: { freq: 1047, duration: 0.3, wave: 'sine', gain: 0.08 },
      };

      const config = sounds[type] || sounds.default;
      const now = ctx.currentTime;

      oscillator.type = config.wave;
      oscillator.frequency.setValueAtTime(config.freq, now);

      if (type === 'achievement') {
        oscillator.frequency.setValueAtTime(config.freq, now);
        oscillator.frequency.setValueAtTime(config.freq * 1.25, now + 0.1);
        oscillator.frequency.setValueAtTime(config.freq * 1.5, now + 0.2);
      }

      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(config.gain,