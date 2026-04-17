Je vais analyser le repo et générer tous les fichiers nécessaires.

**Plan d'exécution:**
1. `package.json` — ajouter swr + @vercel/kv
2. `src/lib/kvStore.ts` — abstraction cache localStorage + Vercel KV
3. `src/hooks/useApiCache.ts` — hook SWR intelligent avec fallback
4. `src/pages/api/cache-control.ts` — API route Vercel KV
5. Composants skeleton loader

---

**FILE: package.json**

{
  "name": "trackr-ai-hub",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  },
  "dependencies": {
    "@vercel/kv": "^1.0.1",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.22.0",
    "swr": "^2.2.5"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@typescript-eslint/eslint-plugin": "^6.14.0",
    "@typescript-eslint/parser": "^6.14.0",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.55.0",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.5",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "typescript": "^5.2.2",
    "vite": "^5.0.8"
  }
}

---

**FILE: src/lib/kvStore.ts**

import { createClient } from '@vercel/kv';

const KV_PREFIX = 'trackr:';
const DEFAULT_TTL = 300;
const LOCAL_STORAGE_PREFIX = 'trackr_cache_';
const LOCAL_STORAGE_META_PREFIX = 'trackr_meta_';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
}

interface CacheMeta {
  timestamp: number;
  ttl: number;
  version: string;
  hits: number;
}

const CACHE_VERSION = '1.0.0';

function isServer(): boolean {
  return typeof window === 'undefined';
}

function isVercelKVAvailable(): boolean {
  return !!(
    process.env.KV_REST_API_URL &&
    process.env.KV_REST_API_TOKEN
  );
}

let kvClient: ReturnType<typeof createClient> | null = null;

function getKVClient() {
  if (!isVercelKVAvailable()) return null;
  if (!kvClient) {
    kvClient = createClient({
      url: process.env.KV_REST_API_URL!,
      token: process.env.KV_REST_API_TOKEN!,
    });
  }
  return kvClient;
}

function buildKey(key: string): string {
  return `${KV_PREFIX}${key}`;
}

function buildLocalKey(key: string): string {
  return `${LOCAL_STORAGE_PREFIX}${key}`;
}

function buildLocalMetaKey(key: string): string {
  return `${LOCAL_STORAGE_META_PREFIX}${key}`;
}

function isExpired(timestamp: number, ttl: number): boolean {
  return Date.now() - timestamp > ttl * 1000;
}

export function getFromLocalStorage<T>(key: string): T | null {
  if (isServer()) return null;
  try {
    const raw = localStorage.getItem(buildLocalKey(key));
    const metaRaw = localStorage.getItem(buildLocalMetaKey(key));
    if (!raw || !metaRaw) return null;
    const meta: CacheMeta = JSON.parse(metaRaw);
    if (meta.version !== CACHE_VERSION) {
      removeFromLocalStorage(key);
      return null;
    }
    if (isExpired(meta.timestamp, meta.ttl)) {
      removeFromLocalStorage(key);
      return null;
    }
    const entry: CacheEntry<T> = JSON.parse(raw);
    meta.hits = (meta.hits || 0) + 1;
    localStorage.setItem(buildLocalMetaKey(key), JSON.stringify(meta));
    return entry.data;
  } catch {
    return null;
  }
}

export function setToLocalStorage<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): void {
  if (isServer()) return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
    };
    const meta: CacheMeta = {
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
      hits: 0,
    };
    localStorage.setItem(buildLocalKey(key), JSON.stringify(entry));
    localStorage.setItem(buildLocalMetaKey(key), JSON.stringify(meta));
  } catch (err) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      pruneLocalStorageCache();
      try {
        const entry: CacheEntry<T> = {
          data,
          timestamp: Date.now(),
          ttl,
          version: CACHE_VERSION,
        };
        localStorage.setItem(buildLocalKey(key), JSON.stringify(entry));
      } catch {
        // silent
      }
    }
  }
}

export function removeFromLocalStorage(key: string): void {
  if (isServer()) return;
  try {
    localStorage.removeItem(buildLocalKey(key));
    localStorage.removeItem(buildLocalMetaKey(key));
  } catch {
    // silent
  }
}

export function pruneLocalStorageCache(): void {
  if (isServer()) return;
  try {
    const toDelete: Array<{ key: string; score: number }> = [];
    for (let i = 0; i < localStorage.length; i++) {
      const rawKey = localStorage.key(i);
      if (!rawKey?.startsWith(LOCAL_STORAGE_META_PREFIX)) continue;
      const cacheKey = rawKey.replace(LOCAL_STORAGE_META_PREFIX, '');
      const metaRaw = localStorage.getItem(rawKey);
      if (!metaRaw) continue;
      const meta: CacheMeta = JSON.parse(metaRaw);
      const score = isExpired(meta.timestamp, meta.ttl)
        ? Infinity
        : (meta.hits || 0);
      toDelete.push({ key: cacheKey, score });
    }
    toDelete.sort((a, b) => a.score - b.score);
    const half = Math.ceil(toDelete.length / 2);
    toDelete.slice(0, half).forEach(({ key }) => removeFromLocalStorage(key));
  } catch {
    // silent
  }
}

export async function getFromKV<T>(key: string): Promise<T | null> {
  const kv = getKVClient();
  if (!kv) return null;
  try {
    const raw = await kv.get<CacheEntry<T>>(buildKey(key));
    if (!raw) return null;
    if (isExpired(raw.timestamp, raw.ttl)) {
      await kv.del(buildKey(key));
      return null;
    }
    return raw.data;
  } catch {
    return null;
  }
}

export async function setToKV<T>(
  key: string,
  data: T,
  ttl: number = DEFAULT_TTL
): Promise<void> {
  const kv = getKVClient();
  if (!kv) return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
    };
    await kv.set(buildKey(key), entry, { ex: ttl });
  } catch {
    // silent
  }
}

export async function removeFromKV(key: string): Promise<void> {
  const kv = getKVClient();
  if (!kv) return;
  try {
    await kv.del(buildKey(key));
  } catch {
    // silent
  }
}

export async function getFromKVByPattern(pattern: string): Promise<string[]> {
  const kv = getKVClient();
  if (!kv) return [];
  try {
    return await kv.keys(`${KV_PREFIX}${pattern}*`);
  } catch {
    return [];
  }
}

export async function flushKVByPattern(pattern: string): Promise<number> {
  const kv = getKVClient();
  if (!kv) return 0;
  try {
    const keys = await kv.keys(`${KV_PREFIX}${pattern}*`);
    if (keys.length === 0) return 0;
    await kv.del(...keys);
    return keys.length;
  } catch {
    return 0;
  }
}

export interface UnifiedCacheOptions {
  ttl?: number;
  localOnly?: boolean;
  kvOnly?: boolean;
  revalidate?: boolean;
}

export async function cacheGet<T>(
  key: string,
  options: UnifiedCacheOptions = {}
): Promise<T | null> {
  const { localOnly = false, kvOnly = false } = options;

  if (!kvOnly) {
    const local = getFromLocalStorage<T>(key);
    if (local !== null) return local;
  }

  if (!localOnly) {
    const kv = await getFromKV<T>(key);
    if (kv !== null) {
      if (!kvOnly) {
        setToLocalStorage(key, kv, options.ttl ?? DEFAULT_TTL);
      }
      return kv;
    }
  }

  return null;
}

export async function cacheSet<T>(
  key: string,
  data: T,
  options: UnifiedCacheOptions = {}
): Promise<void> {
  const { ttl = DEFAULT_TTL, localOnly = false, kvOnly = false } = options;

  if (!kvOnly) {
    setToLocalStorage(key, data, ttl);
  }

  if (!localOnly) {
    await setToKV(key, data, ttl);
  }
}

export async function cacheDelete(
  key: string,
  options: UnifiedCacheOptions = {}
): Promise<void> {
  const { localOnly = false, kvOnly = false } = options;

  if (!kvOnly) {
    removeFromLocalStorage(key);
  }

  if (!localOnly) {
    await removeFromKV(key);
  }
}

export function getCacheStats(): {
  localEntries: number;
  localSize: number;
  expiredEntries: number;
} {
  if (isServer()) {
    return { localEntries: 0, localSize: 0, expiredEntries: 0 };
  }
  let localEntries = 0;
  let localSize = 0;
  let expiredEntries = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(LOCAL_STORAGE_PREFIX)) continue;
      localEntries++;
      const val = localStorage.getItem(key) || '';
      localSize += val.length * 2;
      const cacheKey = key.replace(LOCAL_STORAGE_PREFIX, '');
      const metaRaw = localStorage.getItem(buildLocalMetaKey(cacheKey));
      if (metaRaw) {
        const meta: CacheMeta = JSON.parse(metaRaw);
        if (isExpired(meta.timestamp, meta.ttl)) expiredEntries++;
      }
    }
  } catch {
    // silent
  }
  return { localEntries, localSize, expiredEntries };
}

export const kvStore = {
  get: cacheGet,
  set: cacheSet,
  delete: cacheDelete,
  getLocal: getFromLocalStorage,
  setLocal: setToLocalStorage,
  removeLocal: removeFromLocalStorage,
  getKV: getFromKV,
  setKV: setToKV,
  removeKV: removeFromKV,
  flushByPattern: flushKVByPattern,
  pruneLocal: pruneLocalStorageCache,
  stats: getCacheStats,
};

export default kvStore;

---

**FILE: src/hooks/useApiCache.ts**

import useSWR, {
  SWRConfiguration,
  mutate as globalMutate,
  SWRResponse,
} from 'swr';
import {
  getFromLocalStorage,
  setToLocalStorage,
  cacheGet,
  cacheSet,
  pruneLocalStorageCache,
} from '../lib/kvStore';

export type CacheNamespace =
  | 'athletes'
  | 'markets'
  | 'notifications'
  | 'portfolio'
  | 'user'
  | 'stats';

interface ApiCacheOptions<T> extends SWRConfiguration<T> {
  namespace?: CacheNamespace;
  ttl?: number;
  localOnly?: boolean;
  suspense?: boolean;
  revalidateOnFocus?: boolean;
  revalidateOnReconnect?: boolean;
  dedupingInterval?: number;
  fallbackData?: T;
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (err: Error) => void;
}

const NAMESPACE_TTL: Record<CacheNamespace, number> = {
  athletes: 300,
  markets: 60,
  notifications: 30,
  portfolio: 120,
  user: 600,
  stats: 180,
};

const NAMESPACE_DEDUP: Record<CacheNamespace, number> = {
  athletes: 5000,
  markets: 2000,
  notifications: 1000,
  portfolio: 3000,
  user: 10000,
  stats: 5000,
};

function buildCacheKey(namespace: CacheNamespace, key: string): string {
  return `${namespace}:${key}`;
}

async function apiFetcher<T>(
  url: string,
  cacheKey: string,
  ttl: number,
  localOnly: boolean
): Promise<T> {
  if (!localOnly) {
    const cached = await cacheGet<T>(cacheKey, { ttl });
    if (cached !== null) return cached;
  } else {
    const local = getFromLocalStorage<T>(cacheKey);
    if (local !== null) return local;
  }

  const res = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache',
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  }

  const data: T = await res.json();

  if (!localOnly) {
    await cacheSet(cacheKey, data, { ttl });
  } else {
    setToLocalStorage(cacheKey, data, ttl);
  }

  return data;
}

export function useApiCache<T>(
  key: string | null,
  url: string | null,
  options: ApiCacheOptions<T> = {}
): SWRResponse<T, Error> & {
  isHydrating: boolean;
  isCacheHit: boolean;
  invalidate: () => Promise<void>;
  prefetch: () => Promise<void>;
} {
  const {
    namespace = 'athletes',
    ttl = NAMESPACE_TTL[namespace],
    localOnly = false,
    revalidateOnFocus = false,
    revalidateOnReconnect = true,
    dedupingInterval = NAMESPACE_DEDUP[namespace],
    fallbackData,
    enabled = true,
    onSuccess,
    onError,
    ...swrOptions
  } = options;

  const cacheKey = key ? buildCacheKey(namespace, key) : null;

  const localFallback = cacheKey
    ? (getFromLocalStorage<T>(cacheKey) ?? fallbackData)
    : fallbackData;

  const swrKey = enabled && cacheKey && url ? [url, cacheKey] : null;

  const fetcher = async ([fetchUrl, ck]: [string, string]) => {
    return apiFetcher<T>(fetchUrl, ck, ttl, localOnly);
  };

  const swr = useSWR<T, Error>(swrKey, fetcher, {
    fallbackData: localFallback,
    revalidateOnFocus,
    revalidateOnReconnect,
    dedupingInterval,
    revalidateIfStale: true,
    keepPreviousData: true,
    onSuccess: (data) => {
      onSuccess?.(data);
    },
    onError: (err) => {
      onError?.(err);
    },
    ...swrOptions,
  });

  const isHydrating = swr.isLoading && localFallback !== undefined;
  const isCacheHit = !swr.isLoading && localFallback !== undefined;

  const invalidate = async () => {
    if (cacheKey) {
      if (!localOnly) {
        await cacheSet(cacheKey, null as unknown as T, { ttl: 0 });
      }
      setToLocalStorage(cacheKey, null as unknown as T, 0);
    }
    await swr.mutate();
  };

  const prefetch = async () => {
    if (!url || !cacheKey) return;
    try {
      const data = await apiFetcher<T>(url, cacheKey, ttl, localOnly);
      await globalMutate([url, cacheKey], data, false);
    } catch {
      // silent
    }
  };

  return {
    ...swr,
    isHydrating,
    isCacheHit,
    invalidate,
    prefetch,
  };
}

export function useAthletes<T = unknown>(
  key: string | null,
  url: string | null,
  options: Omit<ApiCacheOptions<T>, 'namespace'> = {}
) {
  return useApiCache<T>(key, url, { ...options, namespace: 'athletes', ttl: NAMESPACE_TTL.athletes });
}

export function useMarkets<T = unknown>(
  key: string | null,
  url: string | null,
  options: Omit<ApiCacheOptions<T>, 'namespace'> = {}
) {
  return useApiCache<T>(key, url, { ...options, namespace: 'markets', ttl: NAMESPACE_TTL.markets });
}

export function useNotifications<T = unknown>(
  key