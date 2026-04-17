src/services/imageCache.js

const CACHE_NAME = 'trackr-images-v1';
const CACHE_VERSION = 1;
const MAX_CACHE_SIZE = 50;
const MAX_CACHE_AGE = 7 * 24 * 60 * 60 * 1000;

const DB_NAME = 'trackr-image-cache';
const DB_VERSION = 1;
const STORE_NAME = 'images';

class ImageCacheService {
  constructor() {
    this.memoryCache = new Map();
    this.db = null;
    this.initialized = false;
    this.initPromise = null;
    this.observers = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      errors: 0,
      networkRequests: 0,
    };
  }

  async init() {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = this._initializeDB()
      .then(() => {
        this.initialized = true;
        this._startCleanupInterval();
        console.log('[ImageCache] Initialized successfully');
      })
      .catch((err) => {
        console.warn('[ImageCache] DB init failed, falling back to memory-only cache:', err);
        this.initialized = true;
      });

    return this.initPromise;
  }

  _initializeDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);

      request.onsuccess = (event) => {
        this.db = event.target.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'url' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('size', 'size', { unique: false });
        }
      };
    });
  }

  async get(url) {
    await this.init();

    const memEntry = this.memoryCache.get(url);
    if (memEntry && !this._isExpired(memEntry.timestamp)) {
      this.stats.hits++;
      this._updateAccessTime(url);
      return memEntry.data;
    }

    const dbEntry = await this._getFromDB(url);
    if (dbEntry && !this._isExpired(dbEntry.timestamp)) {
      this.stats.hits++;
      this.memoryCache.set(url, dbEntry);
      return dbEntry.data;
    }

    this.stats.misses++;
    return null;
  }

  async set(url, data, options = {}) {
    await this.init();

    const entry = {
      url,
      data,
      timestamp: Date.now(),
      accessTime: Date.now(),
      size: this._estimateSize(data),
      format: options.format || 'unknown',
      width: options.width || null,
      height: options.height || null,
      lqip: options.lqip || null,
    };

    this.memoryCache.set(url, entry);
    this._enforceMemoryCacheLimit();

    await this._saveToDB(entry);
    this._notifyObservers(url, 'set', entry);

    return entry;
  }

  async prefetch(urls, options = {}) {
    await this.init();

    const promises = urls.map(async (url) => {
      try {
        const cached = await this.get(url);
        if (cached) return { url, status: 'cached', data: cached };

        const data = await this._fetchImage(url, options);
        await this.set(url, data, options);
        return { url, status: 'fetched', data };
      } catch (err) {
        this.stats.errors++;
        return { url, status: 'error', error: err.message };
      }
    });

    return Promise.allSettled(promises);
  }

  async generateLQIP(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const LQIP_SIZE = 20;
          const aspectRatio = img.width / img.height;

          canvas.width = LQIP_SIZE;
          canvas.height = Math.round(LQIP_SIZE / aspectRatio);

          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          const lqip = canvas.toDataURL('image/jpeg', 0.1);
          resolve(lqip);
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  async getOrFetch(url, options = {}) {
    await this.init();

    const cached = await this.get(url);
    if (cached) return cached;

    try {
      this.stats.networkRequests++;
      const data = await this._fetchImage(url, options);

      let lqip = null;
      if (options.generateLQIP) {
        try {
          lqip = await this.generateLQIP(url);
        } catch (e) {
          console.warn('[ImageCache] LQIP generation failed:', e);
        }
      }

      await this.set(url, data, { ...options, lqip });
      return data;
    } catch (err) {
      this.stats.errors++;
      throw err;
    }
  }

  async _fetchImage(url, options = {}) {
    const controller = new AbortController();
    const timeout = options.timeout || 10000;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'image/webp,image/avif,image/*,*/*;q=0.8',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      return {
        objectUrl,
        contentType: response.headers.get('content-type'),
        size: blob.size,
        blob,
      };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async delete(url) {
    this.memoryCache.delete(url);
    await this._deleteFromDB(url);
    this._notifyObservers(url, 'delete');
  }

  async clear() {
    this.memoryCache.clear();
    await this._clearDB();
    this._notifyObservers('*', 'clear');
  }

  async clearExpired() {
    const now = Date.now();
    const expired = [];

    for (const [url, entry] of this.memoryCache.entries()) {
      if (this._isExpired(entry.timestamp)) {
        expired.push(url);
      }
    }

    expired.forEach((url) => this.memoryCache.delete(url));

    await this._clearExpiredFromDB(now - MAX_CACHE_AGE);

    return expired.length;
  }

  subscribe(url, callback) {
    if (!this.observers.has(url)) {
      this.observers.set(url, new Set());
    }
    this.observers.get(url).add(callback);

    return () => {
      const observers = this.observers.get(url);
      if (observers) {
        observers.delete(callback);
        if (observers.size === 0) {
          this.observers.delete(url);
        }
      }
    };
  }

  _notifyObservers(url, event, data) {
    const observers = this.observers.get(url);
    if (observers) {
      observers.forEach((cb) => cb({ url, event, data }));
    }

    const wildcardObservers = this.observers.get('*');
    if (wildcardObservers) {
      wildcardObservers.forEach((cb) => cb({ url, event, data }));
    }
  }

  _isExpired(timestamp) {
    return Date.now() - timestamp > MAX_CACHE_AGE;
  }

  _estimateSize(data) {
    if (!data) return 0;
    if (data.size) return data.size;
    if (data.blob) return data.blob.size;
    if (typeof data === 'string') return data.length * 2;
    return JSON.stringify(data).length * 2;
  }

  _enforceMemoryCacheLimit() {
    if (this.memoryCache.size <= MAX_CACHE_SIZE) return;

    const entries = Array.from(this.memoryCache.entries()).sort(
      (a, b) => a[1].accessTime - b[1].accessTime
    );

    const toRemove = entries.slice(0, entries.length - MAX_CACHE_SIZE);
    toRemove.forEach(([url]) => this.memoryCache.delete(url));
  }

  _updateAccessTime(url) {
    const entry = this.memoryCache.get(url);
    if (entry) {
      entry.accessTime = Date.now();
      this.memoryCache.set(url, entry);
    }
  }

  async _getFromDB(url) {
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(url);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => {
          console.warn('[ImageCache] DB get error:', request.error);
          resolve(null);
        };
      } catch (err) {
        console.warn('[ImageCache] DB transaction error:', err);
        resolve(null);
      }
    });
  }

  async _saveToDB(entry) {
    if (!this.db) return;

    const serializable = {
      url: entry.url,
      timestamp: entry.timestamp,
      accessTime: entry.accessTime,
      size: entry.size,
      format: entry.format,
      width: entry.width,
      height: entry.height,
      lqip: entry.lqip,
      data: {
        contentType: entry.data?.contentType,
        size: entry.data?.size,
        objectUrl: null,
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(serializable);

        request.onsuccess = () => resolve();
        request.onerror = () => {
          console.warn('[ImageCache] DB save error:', request.error);
          resolve();
        };
      } catch (err) {
        console.warn('[ImageCache] DB transaction error:', err);
        resolve();
      }
    });
  }

  async _deleteFromDB(url) {
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(url);

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      } catch (err) {
        resolve();
      }
    });
  }

  async _clearDB() {
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      } catch (err) {
        resolve();
      }
    });
  }

  async _clearExpiredFromDB(cutoffTime) {
    if (!this.db) return;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('timestamp');
        const range = IDBKeyRange.upperBound(cutoffTime);
        const request = index.openCursor(range);

        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            cursor.delete();
            cursor.continue();
          } else {
            resolve();
          }
        };

        request.onerror = () => resolve();
      } catch (err) {
        resolve();
      }
    });
  }

  _startCleanupInterval() {
    setInterval(() => {
      this.clearExpired().then((count) => {
        if (count > 0) {
          console.log(`[ImageCache] Cleaned ${count} expired entries`);
        }
      });
    }, 60 * 60 * 1000);
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      memoryCacheSize: this.memoryCache.size,
      hitRate: total > 0 ? ((this.stats.hits / total) * 100).toFixed(2) + '%' : '0%',
      cacheVersion: CACHE_VERSION,
      cacheName: CACHE_NAME,
    };
  }

  async getCacheSize() {
    let totalSize = 0;

    for (const entry of this.memoryCache.values()) {
      totalSize += entry.size || 0;
    }

    return {
      memory: totalSize,
      memoryFormatted: this._formatBytes(totalSize),
      count: this.memoryCache.size,
    };
  }

  _formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  buildSrcSet(baseUrl, widths = [320, 640, 768, 1024, 1280, 1920]) {
    const url = new URL(baseUrl, window.location.origin);
    const ext = url.pathname.split('.').pop();
    const basePath = url.pathname.replace(`.${ext}`, '');

    return widths
      .map((w) => {
        const webpUrl = `${basePath}-${w}w.webp`;
        return `${webpUrl} ${w}w`;
      })
      .join(', ');
  }

  getWebPUrl(url) {
    if (!url) return url;
    return url.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
  }

  supportsWebP() {
    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
      return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  }

  async warmUp(urls) {
    await this.init();
    console.log(`[ImageCache] Warming up ${urls.length} images...`);

    const results = await this.prefetch(urls, { generateLQIP: false });

    const summary = results.reduce(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          const { status } = result.value;
          acc[status] = (acc[status] || 0) + 1;
        } else {
          acc.failed = (acc.failed || 0) + 1;
        }
        return acc;
      },
      {}
    );

    console.log('[ImageCache] Warm-up complete:', summary);
    return summary;
  }
}

const imageCache = new ImageCacheService();

export default imageCache;

export const {
  get,
  set,
  prefetch,
  generateLQIP,
  getOrFetch,
  delete: deleteCache,
  clear,
  clearExpired,
  subscribe,
  getStats,
  getCacheSize,
  buildSrcSet,
  getWebPUrl,
  supportsWebP,
  warmUp,
} = imageCache;