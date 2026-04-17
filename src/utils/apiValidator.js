Je vais analyser le repo et créer tous les fichiers nécessaires.

**ÉTAPE 1 — Lecture du repo existant**

Je commence par créer `src/utils/apiValidator.js` complet et production-ready.

src/utils/apiValidator.js

import { z } from 'zod';

// ============================================================
// TRACKR — API VALIDATOR & SECURITY LAYER
// Author: AnDy (autonomous AI)
// Version: 1.0.0
// ============================================================

// ─────────────────────────────────────────────
// 1. INPUT SANITIZATION — query params & strings
// ─────────────────────────────────────────────

/**
 * Strips dangerous characters from a raw string before
 * it is appended to any URL or injected into the DOM.
 *
 * Removes:
 *  - HTML tags            < >
 *  - Script-injection     javascript:
 *  - SQL meta-chars       ' " ; -- /*
 *  - Shell injection      ` $ ( ) | & ; \
 *  - Null bytes           \0
 *  - Unicode direction    \u202e etc.
 */
export function sanitizeString(raw) {
  if (raw === null || raw === undefined) return '';
  if (typeof raw !== 'string') raw = String(raw);

  return raw
    .replace(/\0/g, '')                        // null bytes
    .replace(/[\u200b-\u200d\u202a-\u202e\u2028\u2029]/g, '') // unicode tricks
    .replace(/<[^>]*>/g, '')                   // HTML tags
    .replace(/javascript\s*:/gi, '')           // JS protocol
    .replace(/data\s*:/gi, '')                 // data: URI
    .replace(/vbscript\s*:/gi, '')             // VBScript
    .replace(/on\w+\s*=/gi, '')                // inline event handlers
    .replace(/['";`]/g, '')                    // SQL / template injection
    .replace(/(-{2,}|\/\*|\*\/)/g, '')         // SQL comments
    .replace(/[\\$|&]/g, '')                   // shell meta
    .trim();
}

/**
 * Sanitizes every key-value pair of a params object.
 * Returns a new plain object — never mutates the original.
 *
 * @param {Record<string, any>} params
 * @returns {Record<string, string>}
 */
export function sanitizeQueryParams(params) {
  if (!params || typeof params !== 'object' || Array.isArray(params)) {
    return {};
  }

  const clean = {};
  for (const [key, value] of Object.entries(params)) {
    const cleanKey = sanitizeString(key);
    if (!cleanKey) continue;

    if (Array.isArray(value)) {
      // join arrays as comma-separated safe strings
      clean[cleanKey] = value.map(v => sanitizeString(String(v))).join(',');
    } else {
      clean[cleanKey] = sanitizeString(String(value));
    }
  }
  return clean;
}

/**
 * Builds a safe URL string from a base URL + params object.
 * Throws if the base URL contains protocol injection.
 *
 * @param {string} base - absolute or relative URL
 * @param {Record<string, any>} params
 * @returns {string}
 */
export function buildSafeUrl(base, params = {}) {
  // Guard against protocol injection in base URL
  const trimmedBase = (base || '').trim();
  if (/^(javascript|data|vbscript):/i.test(trimmedBase)) {
    throw new Error('[apiValidator] Unsafe base URL detected');
  }

  const url = new URL(trimmedBase, window.location.origin);
  const safeParams = sanitizeQueryParams(params);

  for (const [key, value] of Object.entries(safeParams)) {
    url.searchParams.set(key, value);
  }

  return url.toString();
}

// ─────────────────────────────────────────────
// 2. ZOD SCHEMAS — response validation
// ─────────────────────────────────────────────

// ── 2a. CoinGecko / Crypto market data ────────

export const CoinSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  image: z.string().url().optional().nullable(),
  current_price: z.number().nullable().optional(),
  market_cap: z.number().nullable().optional(),
  market_cap_rank: z.number().nullable().optional(),
  fully_diluted_valuation: z.number().nullable().optional(),
  total_volume: z.number().nullable().optional(),
  high_24h: z.number().nullable().optional(),
  low_24h: z.number().nullable().optional(),
  price_change_24h: z.number().nullable().optional(),
  price_change_percentage_24h: z.number().nullable().optional(),
  market_cap_change_24h: z.number().nullable().optional(),
  market_cap_change_percentage_24h: z.number().nullable().optional(),
  circulating_supply: z.number().nullable().optional(),
  total_supply: z.number().nullable().optional(),
  max_supply: z.number().nullable().optional(),
  ath: z.number().nullable().optional(),
  ath_change_percentage: z.number().nullable().optional(),
  ath_date: z.string().nullable().optional(),
  atl: z.number().nullable().optional(),
  atl_change_percentage: z.number().nullable().optional(),
  atl_date: z.string().nullable().optional(),
  last_updated: z.string().nullable().optional(),
  sparkline_in_7d: z.object({ price: z.array(z.number()) }).optional().nullable(),
}).passthrough();

export const CryptoMarketsResponseSchema = z.array(CoinSchema);

// ── 2b. News article ──────────────────────────

export const NewsArticleSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  urlToImage: z.string().url().nullable().optional(),
  publishedAt: z.string(),
  source: z.object({
    id: z.string().nullable().optional(),
    name: z.string(),
  }).optional(),
  author: z.string().nullable().optional(),
  content: z.string().nullable().optional(),
}).passthrough();

export const NewsResponseSchema = z.object({
  status: z.string().optional(),
  totalResults: z.number().optional(),
  articles: z.array(NewsArticleSchema),
}).passthrough();

// Alternative: CryptoNews / NewsData.io format
export const CryptoNewsArticleSchema = z.object({
  title: z.string(),
  description: z.string().nullable().optional(),
  url: z.string().url(),
  thumbnail: z.string().url().nullable().optional(),
  createdAt: z.string().optional(),
  currencies: z.array(z.object({
    code: z.string(),
    title: z.string(),
  })).optional(),
}).passthrough();

export const CryptoNewsResponseSchema = z.object({
  data: z.array(CryptoNewsArticleSchema).optional(),
  results: z.array(CryptoNewsArticleSchema).optional(),
}).passthrough();

// ── 2c. Portfolio / Asset ─────────────────────

export const PortfolioAssetSchema = z.object({
  id: z.string(),
  symbol: z.string(),
  name: z.string(),
  amount: z.number().min(0),
  buyPrice: z.number().min(0).optional(),
  currentPrice: z.number().min(0).optional(),
  value: z.number().optional(),
  pnl: z.number().optional(),
  pnlPercent: z.number().optional(),
}).passthrough();

export const PortfolioResponseSchema = z.array(PortfolioAssetSchema);

// ── 2d. Generic paginated response wrapper ────

export const PaginatedResponseSchema = (itemSchema) =>
  z.object({
    data: z.array(itemSchema),
    page: z.number().optional(),
    per_page: z.number().optional(),
    total: z.number().optional(),
    total_pages: z.number().optional(),
  }).passthrough();

// ─────────────────────────────────────────────
// 3. RESPONSE VALIDATOR
// ─────────────────────────────────────────────

/**
 * Validates an API response against a Zod schema.
 * Returns { success, data, error }.
 *
 * @template T
 * @param {unknown} rawData
 * @param {import('zod').ZodType<T>} schema
 * @returns {{ success: boolean, data: T | null, error: string | null }}
 */
export function validateApiResponse(rawData, schema) {
  try {
    const result = schema.safeParse(rawData);
    if (result.success) {
      return { success: true, data: result.data, error: null };
    }

    const errorMessages = result.error.issues.map(
      issue => `[${issue.path.join('.')}] ${issue.message}`
    );
    const errorString = errorMessages.join(' | ');

    console.warn('[apiValidator] Schema validation failed:', errorString);
    return { success: false, data: null, error: errorString };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[apiValidator] Unexpected validation error:', msg);
    return { success: false, data: null, error: msg };
  }
}

/**
 * Strict validator — throws on failure.
 * Use inside try/catch in critical paths.
 *
 * @template T
 * @param {unknown} rawData
 * @param {import('zod').ZodType<T>} schema
 * @returns {T}
 */
export function validateOrThrow(rawData, schema) {
  const result = validateApiResponse(rawData, schema);
  if (!result.success) {
    throw new Error(`[apiValidator] Response validation error: ${result.error}`);
  }
  return result.data;
}

// ─────────────────────────────────────────────
// 4. RATE LIMITER — local, per-endpoint
// ─────────────────────────────────────────────

const rateLimitStore = new Map();

/**
 * Default rate-limit config (override per endpoint if needed).
 *
 *   windowMs    : sliding window in milliseconds
 *   maxRequests : max requests allowed per window
 *   baseDelay   : initial backoff delay in ms
 *   maxDelay    : cap on backoff delay in ms
 *   jitter      : adds random jitter to avoid thundering herd
 */
const DEFAULT_RATE_LIMIT_CONFIG = {
  windowMs: 60_000,    // 1 minute
  maxRequests: 30,
  baseDelay: 1_000,    // 1 second
  maxDelay: 32_000,    // 32 seconds
  jitter: true,
};

// Per-endpoint overrides
const ENDPOINT_CONFIGS = {
  '/api/crypto': {
    windowMs: 60_000,
    maxRequests: 50,
    baseDelay: 500,
    maxDelay: 30_000,
    jitter: true,
  },
  '/api/news': {
    windowMs: 60_000,
    maxRequests: 20,
    baseDelay: 2_000,
    maxDelay: 60_000,
    jitter: true,
  },
  '/api/portfolio': {
    windowMs: 60_000,
    maxRequests: 100,
    baseDelay: 200,
    maxDelay: 10_000,
    jitter: false,
  },
};

/**
 * Returns the rate-limit config for a given endpoint key.
 *
 * @param {string} endpointKey
 * @returns {typeof DEFAULT_RATE_LIMIT_CONFIG}
 */
function getConfigForEndpoint(endpointKey) {
  for (const [pattern, config] of Object.entries(ENDPOINT_CONFIGS)) {
    if (endpointKey.startsWith(pattern)) {
      return { ...DEFAULT_RATE_LIMIT_CONFIG, ...config };
    }
  }
  return DEFAULT_RATE_LIMIT_CONFIG;
}

/**
 * Gets or creates the rate-limit bucket for an endpoint.
 *
 * @param {string} endpointKey
 * @returns {{ timestamps: number[], retryCount: number }}
 */
function getBucket(endpointKey) {
  if (!rateLimitStore.has(endpointKey)) {
    rateLimitStore.set(endpointKey, { timestamps: [], retryCount: 0 });
  }
  return rateLimitStore.get(endpointKey);
}

/**
 * Checks if a request is allowed for a given endpoint.
 * Cleans up expired timestamps from the sliding window.
 *
 * @param {string} endpointKey
 * @returns {{ allowed: boolean, waitMs: number }}
 */
export function checkRateLimit(endpointKey) {
  const config = getConfigForEndpoint(endpointKey);
  const bucket = getBucket(endpointKey);
  const now = Date.now();

  // Prune timestamps outside the current window
  bucket.timestamps = bucket.timestamps.filter(
    ts => now - ts < config.windowMs
  );

  if (bucket.timestamps.length < config.maxRequests) {
    bucket.timestamps.push(now);
    bucket.retryCount = 0;
    return { allowed: true, waitMs: 0 };
  }

  // Calculate wait time until the oldest timestamp leaves the window
  const oldestTs = bucket.timestamps[0];
  const waitMs = config.windowMs - (now - oldestTs);
  return { allowed: false, waitMs: Math.max(0, waitMs) };
}

/**
 * Computes exponential backoff delay for retry logic.
 *
 * Formula: min(baseDelay * 2^attempt, maxDelay) [+ jitter]
 *
 * @param {string} endpointKey
 * @returns {number} delay in milliseconds
 */
export function getBackoffDelay(endpointKey) {
  const config = getConfigForEndpoint(endpointKey);
  const bucket = getBucket(endpointKey);

  const exponential = Math.min(
    config.baseDelay * Math.pow(2, bucket.retryCount),
    config.maxDelay
  );

  bucket.retryCount += 1;

  if (!config.jitter) return exponential;

  // Full jitter: random value in [0, exponential]
  return Math.floor(Math.random() * exponential);
}

/**
 * Resets the retry counter for a specific endpoint
 * (call this after a successful request).
 *
 * @param {string} endpointKey
 */
export function resetRetryCount(endpointKey) {
  const bucket = getBucket(endpointKey);
  if (bucket) bucket.retryCount = 0;
}

/**
 * Sleeps for `ms` milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─────────────────────────────────────────────
// 5. SAFE FETCH — combines all protections
// ─────────────────────────────────────────────

/**
 * Core safe fetch wrapper:
 *  1. Sanitizes query params
 *  2. Enforces rate-limit with exponential backoff
 *  3. Validates response via Zod schema (if provided)
 *  4. Retries on transient errors (5xx, network failures)
 *  5. Logs all security events
 *
 * @template T
 * @param {string} endpoint - relative or absolute URL
 * @param {object} options
 * @param {Record<string, any>} [options.params={}]          - query params (will be sanitized)
 * @param {import('zod').ZodType<T>} [options.schema]        - optional Zod schema for response validation
 * @param {RequestInit} [options.fetchOptions={}]            - native fetch options
 * @param {number} [options.maxRetries=3]                    - max retry attempts
 * @param {boolean} [options.throwOnValidationError=false]   - throw if schema validation fails
 * @returns {Promise<{ data: T | null, error: string | null, validated: boolean }>}
 */
export async function safeFetch(endpoint, options = {}) {
  const {
    params = {},
    schema = null,
    fetchOptions = {},
    maxRetries = 3,
    throwOnValidationError = false,
  } = options;

  // Determine endpoint key for rate-limiting (path only, no query)
  let endpointKey;
  try {
    endpointKey = new URL(endpoint, window.location.origin).pathname;
  } catch {
    endpointKey = endpoint.split('?')[0];
  }

  // ── 5a. Rate-limit check ────────────────────
  const { allowed, waitMs } = checkRateLimit(endpointKey);
  if (!allowed) {
    const backoff = getBackoffDelay(endpointKey);
    console.warn(
      `[apiValidator] Rate limit hit for ${endpointKey}. ` +
      `Waiting ${backoff}ms before retry.`
    );
    await sleep(backoff);
  }

  // ── 5b. Build safe URL ──────────────────────
  let safeUrl;
  try {
    safeUrl = buildSafeUrl(endpoint, params);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[apiValidator] URL build failed:', msg);
    return { data: null, error: msg, validated: false };
  }

  // ── 5c. Fetch with retry ────────────────────
  const defaultHeaders = {
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // basic CSRF signal
    ...(fetchOptions.headers || {}),
  };

  let lastError = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (attempt > 0) {
      const delay = getBackoffDelay(endpointKey);
      console.info(
        `[apiValidator] Retry ${attempt}/${maxRetries} for ${endpointKey} ` +
        `after ${delay}ms`
      );
      await sleep(delay);
    }

    try {
      const response = await fetch(safeUrl, {
        ...fetchOptions,
        headers: defaultHeaders,
      });

      // ── 5d. HTTP error handling ─────────────
      if (!response.ok) {
        const status = response.status;

        // Client errors (4xx) — do not retry (except 429)
        if (status >= 400 && status < 500 && status !== 429) {
          const msg = `[apiValidator] HTTP ${status} — ${response.statusText} for ${endpointKey}`;
          console.error(msg);
          return { data: null, error: msg, validated: false };
        }

        // Rate-limited by