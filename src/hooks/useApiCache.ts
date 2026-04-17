src/hooks/useApiCache.ts

import useSWR, { SWRConfiguration, mutate as globalMutate } from 'swr';
import { useCallback, useEffect, useRef, useState } from 'react';

const CACHE_VERSION = 'trackr_v1';
const CACHE_TTL_DEFAULT = 5 * 60 * 1000; // 5 minutes
const STALE_WHILE_REVALIDATE = 30 * 1000; // 30 seconds

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  version: string;
  key: string;
}

interface UseApiCacheOptions<T> extends SWRConfiguration {
  ttl?: number;
  localStorageKey?: string;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  optimisticData?: T;
  revalidateOnMount?: boolean;
  dedupingInterval?: number;
  fallbackData?: T;
  shouldRetryOnError?: boolean;
  errorRetryCount?: number;
  errorRetryInterval?: number;
  kvSync?: boolean;
  tags?: string[];
}

interface UseApiCacheReturn<T> {
  data: T | undefined;
  error: Error | undefined;
  isLoading: boolean;
  isValidating: boolean;
  isStale: boolean;
  lastUpdated: Date | undefined;
  mutate: (data?: T, options?: { revalidate?: boolean }) => Promise<T | undefined>;
  invalidate: () => Promise<void>;
  prefetch: (url: string) => Promise<void>;
  clearCache: () => void;
  cacheHit: boolean;
}

function getLocalStorageKey(key: string): string {
  return `${CACHE_VERSION}_${key}`;
}

function readFromLocalStorage<T>(key: string): CacheEntry<T> | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(getLocalStorageKey(key));
    if (!stored) return null;
    const entry: CacheEntry<T> = JSON.parse(stored);
    if (entry.version !== CACHE_VERSION) {
      localStorage.removeItem(getLocalStorageKey(key));
      return null;
    }
    return entry;
  } catch {
    return null;
  }
}

function writeToLocalStorage<T>(key: string, data: T, ttl: number): void {
  if (typeof window === 'undefined') return;
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: CACHE_VERSION,
      key,
    };
    localStorage.setItem(getLocalStorageKey(key), JSON.stringify(entry));
  } catch (e) {
    console.warn('[TrackrCache] localStorage write failed:', e);
  }
}

function removeFromLocalStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(getLocalStorageKey(key));
  } catch {}
}

function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < entry.ttl;
}

function isCacheStale<T>(entry: CacheEntry<T>): boolean {
  const age = Date.now() - entry.timestamp;
  return age >= entry.ttl && age < entry.ttl + STALE_WHILE_REVALIDATE;
}

async function fetcher<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Trackr-Client': 'web',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}: ${response.statusText}`);
    (error as any).status = response.status;
    (error as any).info = await response.json().catch(() => ({}));
    throw error;
  }

  return response.json();
}

async function syncToKV(key: string, data: unknown, ttl: number): Promise<void> {
  try {
    await fetch('/api/cache-control', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, data, ttl }),
    });
  } catch (e) {
    console.warn('[TrackrCache] KV sync failed:', e);
  }
}

async function fetchFromKV<T>(key: string): Promise<T | null> {
  try {
    const response = await fetch(`/api/cache-control?key=${encodeURIComponent(key)}`);
    if (!response.ok) return null;
    const result = await response.json();
    return result.data ?? null;
  } catch {
    return null;
  }
}

const prefetchCache = new Map<string, Promise<unknown>>();

export function useApiCache<T = unknown>(
  url: string | null,
  options: UseApiCacheOptions<T> = {}
): UseApiCacheReturn<T> {
  const {
    ttl = CACHE_TTL_DEFAULT,
    localStorageKey,
    onSuccess,
    onError,
    optimisticData,
    revalidateOnMount,
    dedupingInterval = 2000,
    fallbackData,
    shouldRetryOnError = true,
    errorRetryCount = 3,
    errorRetryInterval = 5000,
    kvSync = false,
    tags = [],
    ...swrOptions
  } = options;

  const cacheKey = localStorageKey || url || '';
  const [cacheHit, setCacheHit] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | undefined>(undefined);
  const [isStale, setIsStale] = useState(false);
  const initialDataRef = useRef<T | undefined>(undefined);
  const isMountedRef = useRef(false);

  // Hydrate from localStorage before SWR fetch
  useEffect(() => {
    if (!cacheKey) return;
    const cached = readFromLocalStorage<T>(cacheKey);
    if (cached) {
      if (isCacheValid(cached)) {
        initialDataRef.current = cached.data;
        setCacheHit(true);
        setLastUpdated(new Date(cached.timestamp));
        setIsStale(false);
      } else if (isCacheStale(cached)) {
        initialDataRef.current = cached.data;
        setCacheHit(true);
        setIsStale(true);
        setLastUpdated(new Date(cached.timestamp));
      }
    }
  }, [cacheKey]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const swrFetcher = useCallback(
    async (key: string): Promise<T> => {
      // Try KV store first if enabled
      if (kvSync) {
        const kvData = await fetchFromKV<T>(key);
        if (kvData !== null) {
          writeToLocalStorage(cacheKey, kvData, ttl);
          return kvData;
        }
      }

      const data = await fetcher<T>(key);

      // Persist to localStorage
      writeToLocalStorage(cacheKey, data, ttl);

      // Sync to KV if enabled
      if (kvSync) {
        syncToKV(cacheKey, data, ttl);
      }

      return data;
    },
    [cacheKey, ttl, kvSync]
  );

  const cachedEntry = cacheKey ? readFromLocalStorage<T>(cacheKey) : null;
  const validFallback =
    cachedEntry && isCacheValid(cachedEntry) ? cachedEntry.data : fallbackData;

  const {
    data,
    error,
    isLoading,
    isValidating,
    mutate: swrMutate,
  } = useSWR<T, Error>(url, swrFetcher, {
    fallbackData: validFallback,
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    revalidateOnMount: revalidateOnMount ?? !cacheHit,
    dedupingInterval,
    shouldRetryOnError,
    errorRetryCount,
    errorRetryInterval,
    onSuccess: (freshData) => {
      if (!isMountedRef.current) return;
      writeToLocalStorage(cacheKey, freshData, ttl);
      setCacheHit(false);
      setLastUpdated(new Date());
      setIsStale(false);

      if (kvSync) {
        syncToKV(cacheKey, freshData, ttl);
      }

      if (tags.length > 0) {
        tags.forEach((tag) => {
          writeToLocalStorage(`tag_${tag}`, cacheKey, CACHE_TTL_DEFAULT);
        });
      }

      onSuccess?.(freshData);
    },
    onError: (err) => {
      if (!isMountedRef.current) return;
      onError?.(err);
    },
    ...swrOptions,
  });

  const mutate = useCallback(
    async (
      newData?: T,
      mutateOptions: { revalidate?: boolean } = {}
    ): Promise<T | undefined> => {
      if (newData !== undefined) {
        writeToLocalStorage(cacheKey, newData, ttl);
        setLastUpdated(new Date());
      }
      return swrMutate(newData, mutateOptions);
    },
    [swrMutate, cacheKey, ttl]
  );

  const invalidate = useCallback(async (): Promise<void> => {
    removeFromLocalStorage(cacheKey);
    setCacheHit(false);
    setIsStale(false);

    if (kvSync && url) {
      try {
        await fetch('/api/cache-control', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: cacheKey }),
        });
      } catch {}
    }

    await swrMutate();
  }, [swrMutate, cacheKey, kvSync, url]);

  const prefetch = useCallback(
    async (prefetchUrl: string): Promise<void> => {
      if (prefetchCache.has(prefetchUrl)) return;

      const promise = fetcher<T>(prefetchUrl).then((result) => {
        writeToLocalStorage(prefetchUrl, result, ttl);
        globalMutate(prefetchUrl, result, false);
        prefetchCache.delete(prefetchUrl);
        return result;
      });

      prefetchCache.set(prefetchUrl, promise);
      await promise;
    },
    [ttl]
  );

  const clearCache = useCallback((): void => {
    if (typeof window === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(CACHE_VERSION)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
    setCacheHit(false);
    setIsStale(false);
    setLastUpdated(undefined);
  }, []);

  return {
    data,
    error,
    isLoading,
    isValidating,
    isStale,
    lastUpdated,
    mutate,
    invalidate,
    prefetch,
    clearCache,
    cacheHit,
  };
}

// Specialized hooks for Trackr domain

export function useAthletes(options?: UseApiCacheOptions<unknown[]>) {
  return useApiCache<unknown[]>('/api/athletes', {
    ttl: 3 * 60 * 1000,
    localStorageKey: 'athletes_list',
    kvSync: true,
    tags: ['athletes'],
    dedupingInterval: 5000,
    ...options,
  });
}

export function useAthlete(id: string | null, options?: UseApiCacheOptions<unknown>) {
  return useApiCache<unknown>(id ? `/api/athletes/${id}` : null, {
    ttl: 5 * 60 * 1000,
    localStorageKey: id ? `athlete_${id}` : undefined,
    kvSync: true,
    tags: ['athletes', `athlete_${id}`],
    ...options,
  });
}

export function useMarkets(options?: UseApiCacheOptions<unknown[]>) {
  return useApiCache<unknown[]>('/api/markets', {
    ttl: 60 * 1000, // 1 minute — markets change fast
    localStorageKey: 'markets_list',
    kvSync: true,
    tags: ['markets'],
    dedupingInterval: 10000,
    revalidateOnMount: true,
    ...options,
  });
}

export function usePortfolio(userId: string | null, options?: UseApiCacheOptions<unknown>) {
  return useApiCache<unknown>(userId ? `/api/portfolio/${userId}` : null, {
    ttl: 2 * 60 * 1000,
    localStorageKey: userId ? `portfolio_${userId}` : undefined,
    kvSync: false,
    tags: ['portfolio'],
    ...options,
  });
}

export function useNotifications(userId: string | null, options?: UseApiCacheOptions<unknown[]>) {
  return useApiCache<unknown[]>(userId ? `/api/notifications/${userId}` : null, {
    ttl: 30 * 1000, // 30 seconds — notifications are time-sensitive
    localStorageKey: userId ? `notifications_${userId}` : undefined,
    kvSync: false,
    tags: ['notifications'],
    revalidateOnMount: true,
    errorRetryCount: 5,
    ...options,
  });
}

export function invalidateByTag(tag: string): void {
  if (typeof window === 'undefined') return;
  try {
    const tagKey = getLocalStorageKey(`tag_${tag}`);
    const cacheKey = localStorage.getItem(tagKey);
    if (cacheKey) {
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(tagKey);
    }
  } catch {}
}

export function invalidateAllCache(): void {
  if (typeof window === 'undefined') return;
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_VERSION)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((k) => localStorage.removeItem(k));
}

export function getCacheStats(): {
  entries: number;
  validEntries: number;
  staleEntries: number;
  expiredEntries: number;
  totalSizeBytes: number;
} {
  if (typeof window === 'undefined') {
    return { entries: 0, validEntries: 0, staleEntries: 0, expiredEntries: 0, totalSizeBytes: 0 };
  }

  let entries = 0;
  let validEntries = 0;
  let staleEntries = 0;
  let expiredEntries = 0;
  let totalSizeBytes = 0;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(CACHE_VERSION)) continue;
    entries++;
    const value = localStorage.getItem(key) || '';
    totalSizeBytes += value.length * 2;
    try {
      const entry: CacheEntry<unknown> = JSON.parse(value);
      if (isCacheValid(entry)) {
        validEntries++;
      } else if (isCacheStale(entry)) {
        staleEntries++;
      } else {
        expiredEntries++;
      }
    } catch {
      expiredEntries++;
    }
  }

  return { entries, validEntries, staleEntries, expiredEntries, totalSizeBytes };
}

export { fetcher };
export type { UseApiCacheOptions, UseApiCacheReturn, CacheEntry };