src/middleware/rateLimiter.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { track } from '@vercel/analytics/server';

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blocked: boolean;
  blockExpiry: number;
}

interface RateLimiterOptions {
  windowMs?: number;
  maxRequests?: number;
  blockDurationMs?: number;
  skipSuccessfulRequests?: boolean;
  keyGenerator?: (req: VercelRequest) => string;
  onLimitReached?: (req: VercelRequest, res: VercelResponse, key: string) => void;
}

const DEFAULT_OPTIONS: Required<Omit<RateLimiterOptions, 'keyGenerator' | 'onLimitReached'>> = {
  windowMs: 60 * 1000,
  maxRequests: 100,
  blockDurationMs: 5 * 60 * 1000,
  skipSuccessfulRequests: false,
};

const store = new Map<string, RateLimitEntry>();

const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupExpiredEntries(windowMs: number): void {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  for (const [key, entry] of store.entries()) {
    if (
      now - entry.windowStart > windowMs * 2 &&
      (!entry.blocked || now > entry.blockExpiry)
    ) {
      store.delete(key);
    }
  }
}

function getClientIp(req: VercelRequest): string {
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(',')[0];
    return ips.trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  return req.socket?.remoteAddress ?? 'unknown';
}

function defaultKeyGenerator(req: VercelRequest): string {
  const ip = getClientIp(req);
  const path = req.url?.split('?')[0] ?? '/';
  return `${ip}:${path}`;
}

async function trackRateLimitEvent(
  req: VercelRequest,
  key: string,
  entry: RateLimitEntry,
  options: Required<Omit<RateLimiterOptions, 'keyGenerator' | 'onLimitReached'>>
): Promise<void> {
  try {
    await track('rate_limit_exceeded', {
      key: key.replace(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/g, '[IP]'),
      path: req.url?.split('?')[0] ?? '/',
      method: req.method ?? 'GET',
      count: entry.count,
      windowMs: options.windowMs,
      maxRequests: options.maxRequests,
      timestamp: new Date().toISOString(),
    });
  } catch {
    // Analytics tracking is non-critical — swallow silently
  }
}

function buildRetryAfterSeconds(
  entry: RateLimitEntry,
  options: Required<Omit<RateLimiterOptions, 'keyGenerator' | 'onLimitReached'>>
): number {
  const now = Date.now();
  if (entry.blocked && entry.blockExpiry > now) {
    return Math.ceil((entry.blockExpiry - now) / 1000);
  }
  return Math.ceil((entry.windowStart + options.windowMs - now) / 1000);
}

function setRateLimitHeaders(
  res: VercelResponse,
  entry: RateLimitEntry,
  options: Required<Omit<RateLimiterOptions, 'keyGenerator' | 'onLimitReached'>>,
  retryAfter: number
): void {
  const remaining = Math.max(0, options.maxRequests - entry.count);
  res.setHeader('X-RateLimit-Limit', options.maxRequests);
  res.setHeader('X-RateLimit-Remaining', remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil((entry.windowStart + options.windowMs) / 1000));
  res.setHeader('Retry-After', retryAfter);
  res.setHeader('X-RateLimit-Window-Ms', options.windowMs);
}

export type RateLimiterMiddleware = (
  req: VercelRequest,
  res: VercelResponse
) => Promise<boolean>;

export function createRateLimiter(options: RateLimiterOptions = {}): RateLimiterMiddleware {
  const config = {
    windowMs: options.windowMs ?? DEFAULT_OPTIONS.windowMs,
    maxRequests: options.maxRequests ?? DEFAULT_OPTIONS.maxRequests,
    blockDurationMs: options.blockDurationMs ?? DEFAULT_OPTIONS.blockDurationMs,
    skipSuccessfulRequests: options.skipSuccessfulRequests ?? DEFAULT_OPTIONS.skipSuccessfulRequests,
  };

  const keyGenerator = options.keyGenerator ?? defaultKeyGenerator;

  return async function rateLimiter(
    req: VercelRequest,
    res: VercelResponse
  ): Promise<boolean> {
    cleanupExpiredEntries(config.windowMs);

    const key = keyGenerator(req);
    const now = Date.now();

    let entry = store.get(key);

    if (!entry) {
      entry = {
        count: 0,
        windowStart: now,
        blocked: false,
        blockExpiry: 0,
      };
      store.set(key, entry);
    }

    // Check if currently in block period
    if (entry.blocked) {
      if (now < entry.blockExpiry) {
        const retryAfter = buildRetryAfterSeconds(entry, config);
        setRateLimitHeaders(res, entry, config, retryAfter);

        await trackRateLimitEvent(req, key, entry, config);

        if (options.onLimitReached) {
          options.onLimitReached(req, res, key);
          return false;
        }

        res.status(429).json({
          error: 'Too Many Requests',
          message: 'You have exceeded the rate limit. Please try again later.',
          code: 'RATE_LIMIT_EXCEEDED',
          retryAfter,
          retryAfterMs: retryAfter * 1000,
          limit: config.maxRequests,
          windowMs: config.windowMs,
          details: {
            blocked: true,
            blockExpiresAt: new Date(entry.blockExpiry).toISOString(),
          },
        });
        return false;
      } else {
        // Block period expired — reset
        entry.blocked = false;
        entry.blockExpiry = 0;
        entry.count = 0;
        entry.windowStart = now;
      }
    }

    // Check if window has expired — reset if so
    if (now - entry.windowStart > config.windowMs) {
      entry.count = 0;
      entry.windowStart = now;
    }

    entry.count += 1;
    store.set(key, entry);

    const retryAfterOnLimit = buildRetryAfterSeconds(entry, config);

    if (entry.count > config.maxRequests) {
      // Trigger block period
      entry.blocked = true;
      entry.blockExpiry = now + config.blockDurationMs;
      store.set(key, entry);

      const retryAfter = Math.ceil(config.blockDurationMs / 1000);
      setRateLimitHeaders(res, entry, config, retryAfter);

      await trackRateLimitEvent(req, key, entry, config);

      if (options.onLimitReached) {
        options.onLimitReached(req, res, key);
        return false;
      }

      res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Your IP has been temporarily blocked.',
        code: 'RATE_LIMIT_BLOCKED',
        retryAfter,
        retryAfterMs: retryAfter * 1000,
        limit: config.maxRequests,
        windowMs: config.windowMs,
        details: {
          blocked: true,
          blockDurationMs: config.blockDurationMs,
          blockExpiresAt: new Date(entry.blockExpiry).toISOString(),
        },
      });
      return false;
    }

    // Within limit — set informational headers
    const remaining = Math.max(0, config.maxRequests - entry.count);
    res.setHeader('X-RateLimit-Limit', config.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader(
      'X-RateLimit-Reset',
      Math.ceil((entry.windowStart + config.windowMs) / 1000)
    );
    res.setHeader('X-RateLimit-Window-Ms', config.windowMs);

    return true;
  };
}

// Pre-built instances for common use cases
export const defaultRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 100,
  blockDurationMs: 5 * 60 * 1000,
});

export const strictRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 20,
  blockDurationMs: 15 * 60 * 1000,
});

export const relaxedRateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 300,
  blockDurationMs: 2 * 60 * 1000,
});

export { getClientIp };
export type { RateLimiterOptions, RateLimitEntry };