Je vais créer les deux fichiers nécessaires pour implémenter le rate-limiting anti-brute-force.

**Fichier 1: api/middleware/rateLimiter.js**

const attempts = new Map();

const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const BLOCK_DURATION_MS = 15 * 60 * 1000;

function getClientIP(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return (
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, data] of attempts.entries()) {
    if (now - data.firstAttempt > WINDOW_MS && !data.blocked) {
      attempts.delete(ip);
    } else if (data.blocked && now - data.blockedAt > BLOCK_DURATION_MS) {
      attempts.delete(ip);
      console.log(`[RateLimiter] IP unblocked after TTL: ${ip}`);
    }
  }
}

setInterval(cleanupExpiredEntries, 60 * 1000);

export function rateLimiter(req, res) {
  const ip = getClientIP(req);
  const now = Date.now();

  cleanupExpiredEntries();

  const record = attempts.get(ip);

  if (record) {
    if (record.blocked) {
      const elapsed = now - record.blockedAt;
      if (elapsed < BLOCK_DURATION_MS) {
        const retryAfterSeconds = Math.ceil((BLOCK_DURATION_MS - elapsed) / 1000);
        console.warn(`[RateLimiter] Blocked IP attempt: ${ip} | retryAfter=${retryAfterSeconds}s`);
        res.setHeader('Retry-After', retryAfterSeconds);
        res.setHeader('X-RateLimit-Limit', MAX_ATTEMPTS);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Reset', Math.ceil((record.blockedAt + BLOCK_DURATION_MS) / 1000));
        res.status(429).json({
          error: 'Too Many Requests',
          message: `Too many failed attempts. Try again in ${Math.ceil(retryAfterSeconds / 60)} minute(s).`,
          retryAfter: retryAfterSeconds,
        });
        return false;
      } else {
        attempts.delete(ip);
        console.log(`[RateLimiter] IP auto-unblocked: ${ip}`);
      }
    } else if (now - record.firstAttempt > WINDOW_MS) {
      attempts.delete(ip);
    }
  }

  return true;
}

export function recordFailedAttempt(req) {
  const ip = getClientIP(req);
  const now = Date.now();
  const record = attempts.get(ip);

  if (!record) {
    attempts.set(ip, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
      blocked: false,
      blockedAt: null,
    });
    console.log(`[RateLimiter] First failed attempt from IP: ${ip} (1/${MAX_ATTEMPTS})`);
    return;
  }

  record.count += 1;
  record.lastAttempt = now;

  if (record.count >= MAX_ATTEMPTS) {
    record.blocked = true;
    record.blockedAt = now;
    console.warn(`[RateLimiter] IP BLOCKED after ${record.count} failed attempts: ${ip}`);
  } else {
    console.log(`[RateLimiter] Failed attempt from IP: ${ip} (${record.count}/${MAX_ATTEMPTS})`);
  }

  attempts.set(ip, record);
}

export function recordSuccessfulAttempt(req) {
  const ip = getClientIP(req);
  if (attempts.has(ip)) {
    attempts.delete(ip);
    console.log(`[RateLimiter] Attempts reset after successful auth for IP: ${ip}`);
  }
}

export function getRateLimitInfo(req) {
  const ip = getClientIP(req);
  const record = attempts.get(ip);
  const now = Date.now();

  if (!record) {
    return {
      ip,
      attempts: 0,
      remaining: MAX_ATTEMPTS,
      blocked: false,
      retryAfter: null,
    };
  }

  const remaining = Math.max(0, MAX_ATTEMPTS - record.count);
  let retryAfter = null;

  if (record.blocked) {
    const elapsed = now - record.blockedAt;
    retryAfter = Math.max(0, Math.ceil((BLOCK_DURATION_MS - elapsed) / 1000));
  }

  return {
    ip,
    attempts: record.count,
    remaining,
    blocked: record.blocked,
    retryAfter,
    firstAttempt: record.firstAttempt,
    lastAttempt: record.lastAttempt,
  };
}

export default rateLimiter;

---

**Fichier 2: api/auth.js**

import { rateLimiter, recordFailedAttempt, recordSuccessfulAttempt } from './middleware/rateLimiter.js';

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  const allowed = rateLimiter(req, res);
  if (!allowed) {
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      error: 'Method Not Allowed',
      message: 'Only POST requests are accepted.',
    });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    recordFailedAttempt(req);
    return res.status(400).json({
      error: 'Bad Request',
      message: 'Email and password are required.',
    });
  }

  try {
    const isValidEmail = typeof email === 'string' && email.includes('@');
    const isValidPassword = typeof password === 'string' && password.length >= 6;

    if (!isValidEmail || !isValidPassword) {
      recordFailedAttempt(req);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials.',
      });
    }

    const VALID_EMAIL = process.env.AUTH_EMAIL || 'admin@trackr.app';
    const VALID_PASSWORD = process.env.AUTH_PASSWORD || 'changeme123';

    if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
      recordFailedAttempt(req);
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Invalid credentials.',
      });
    }

    recordSuccessfulAttempt(req);

    const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    return res.status(200).json({
      success: true,
      message: 'Authentication successful.',
      token,
      expiresIn: 3600,
    });

  } catch (error) {
    console.error(`[Auth] Internal error:`, error);
    recordFailedAttempt(req);
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'An unexpected error occurred.',
    });
  }
}