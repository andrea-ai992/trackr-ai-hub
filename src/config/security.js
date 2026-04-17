Je vais créer le système de rate-limiting complet. Voici les 4 fichiers :

---

**FILE: src/config/security.js**

const security = {
  rateLimiting: {
    windowMs: 5 * 60 * 1000,
    maxAttempts: 10,
    blacklistDurationMs: 15 * 60 * 1000,
    cleanupIntervalMs: 60 * 1000,
    skipSuccessfulRequests: false,
    trustProxy: true,
  },
  redis: {
    enabled: process.env.REDIS_URL ? true : false,
    url: process.env.REDIS_URL || null,
    keyPrefix: 'trackr:ratelimit:',
    blacklistPrefix: 'trackr:blacklist:',
    ttlBuffer: 10,
  },
  logging: {
    enabled: true,
    logLevel: process.env.LOG_LEVEL || 'warn',
    attackThreshold: 5,
    logToConsole: true,
    logToFile: process.env.LOG_TO_FILE === 'true',
    logFilePath: process.env.LOG_FILE_PATH || './logs/security.log',
  },
  headers: {
    addRateLimitHeaders: true,
    addRetryAfterHeader: true,
  },
  whitelist: (process.env.IP_WHITELIST || '')
    .split(',')
    .map((ip) => ip.trim())
    .filter(Boolean),
  blacklistOnExceed: true,
  messages: {
    rateLimitExceeded:
      'Trop de tentatives. Veuillez réessayer dans 5 minutes.',
    blacklisted:
      'Votre adresse IP a été temporairement bloquée pour activité suspecte.',
    serverError: 'Erreur interne du serveur.',
  },
};

module.exports = security;

---

**FILE: middleware/rateLimiter.js**

'use strict';

const securityConfig = require('../src/config/security');

let redis = null;
let redisAvailable = false;

if (securityConfig.redis.enabled) {
  try {
    const { createClient } = require('redis');
    redis = createClient({ url: securityConfig.redis.url });
    redis.on('error', (err) => {
      redisAvailable = false;
      _log('warn', 'Redis error — falling back to in-memory store', {
        error: err.message,
      });
    });
    redis.on('ready', () => {
      redisAvailable = true;
      _log('info', 'Redis connected for rate-limiting');
    });
    redis.connect().catch((err) => {
      redisAvailable = false;
      _log('warn', 'Redis connection failed — using in-memory store', {
        error: err.message,
      });
    });
  } catch (err) {
    redisAvailable = false;
    _log('warn', 'Redis module not available — using in-memory store', {
      error: err.message,
    });
  }
}

const inMemoryStore = new Map();
const inMemoryBlacklist = new Map();

function _log(level, message, meta = {}) {
  if (!securityConfig.logging.enabled) return;
  const levels = { error: 0, warn: 1, info: 2, debug: 3 };
  const configLevel = levels[securityConfig.logging.logLevel] ?? 1;
  const msgLevel = levels[level] ?? 2;
  if (msgLevel > configLevel) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    service: 'RateLimiter',
    message,
    ...meta,
  };

  if (securityConfig.logging.logToConsole) {
    const fn =
      level === 'error'
        ? console.error
        : level === 'warn'
        ? console.warn
        : console.log;
    fn(JSON.stringify(entry));
  }

  if (securityConfig.logging.logToFile) {
    _writeLogToFile(entry);
  }
}

function _writeLogToFile(entry) {
  try {
    const fs = require('fs');
    const path = require('path');
    const dir = path.dirname(securityConfig.logging.logFilePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.appendFileSync(
      securityConfig.logging.logFilePath,
      JSON.stringify(entry) + '\n',
      'utf8'
    );
  } catch (err) {
    console.error('Failed to write security log:', err.message);
  }
}

function _getClientIp(req) {
  if (securityConfig.rateLimiting.trustProxy) {
    const forwardedFor = req.headers['x-forwarded-for'];
    if (forwardedFor) {
      const ips = forwardedFor.split(',').map((ip) => ip.trim());
      return ips[0];
    }
    const realIp =
      req.headers['x-real-ip'] ||
      req.headers['cf-connecting-ip'] ||
      req.headers['x-client-ip'];
    if (realIp) return realIp;
  }
  return (
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    '0.0.0.0'
  );
}

function _cleanupInMemoryStore() {
  const now = Date.now();

  for (const [key, data] of inMemoryStore.entries()) {
    if (now > data.resetTime) {
      inMemoryStore.delete(key);
    }
  }

  for (const [ip, expiry] of inMemoryBlacklist.entries()) {
    if (now > expiry) {
      inMemoryBlacklist.delete(ip);
      _log('info', 'IP removed from blacklist', { ip });
    }
  }
}

const cleanupTimer = setInterval(
  _cleanupInMemoryStore,
  securityConfig.rateLimiting.cleanupIntervalMs
);

if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

async function _isBlacklisted(ip) {
  if (redisAvailable && redis) {
    try {
      const key = securityConfig.redis.blacklistPrefix + ip;
      const val = await redis.get(key);
      return val !== null;
    } catch (err) {
      _log('warn', 'Redis blacklist check failed', { ip, error: err.message });
    }
  }
  const expiry = inMemoryBlacklist.get(ip);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    inMemoryBlacklist.delete(ip);
    return false;
  }
  return true;
}

async function _addToBlacklist(ip) {
  const durationMs = securityConfig.rateLimiting.blacklistDurationMs;
  const expiry = Date.now() + durationMs;

  if (redisAvailable && redis) {
    try {
      const key = securityConfig.redis.blacklistPrefix + ip;
      const ttlSeconds =
        Math.ceil(durationMs / 1000) + securityConfig.redis.ttlBuffer;
      await redis.setEx(key, ttlSeconds, '1');
      _log('warn', 'IP blacklisted (Redis)', {
        ip,
        durationMs,
        expiresAt: new Date(expiry).toISOString(),
      });
      return;
    } catch (err) {
      _log('warn', 'Redis blacklist write failed — using in-memory', {
        ip,
        error: err.message,
      });
    }
  }

  inMemoryBlacklist.set(ip, expiry);
  _log('warn', 'IP blacklisted (in-memory)', {
    ip,
    durationMs,
    expiresAt: new Date(expiry).toISOString(),
  });
}

async function _getAttemptData(ip) {
  const windowMs = securityConfig.rateLimiting.windowMs;

  if (redisAvailable && redis) {
    try {
      const key = securityConfig.redis.keyPrefix + ip;
      const [countStr, ttlMs] = await Promise.all([
        redis.get(key),
        redis.pTTL(key),
      ]);

      if (countStr === null) {
        return { count: 0, resetTime: Date.now() + windowMs };
      }

      return {
        count: parseInt(countStr, 10) || 0,
        resetTime: Date.now() + Math.max(ttlMs, 0),
      };
    } catch (err) {
      _log('warn', 'Redis get attempt data failed', { ip, error: err.message });
    }
  }

  const now = Date.now();
  const data = inMemoryStore.get(ip);
  if (!data || now > data.resetTime) {
    return { count: 0, resetTime: now + windowMs };
  }
  return data;
}

async function _incrementAttempt(ip) {
  const windowMs = securityConfig.rateLimiting.windowMs;

  if (redisAvailable && redis) {
    try {
      const key = securityConfig.redis.keyPrefix + ip;
      const multi = redis.multi();
      multi.incr(key);
      multi.pExpire(key, windowMs);
      const results = await multi.exec();
      const count = results[0];
      const ttlMs = await redis.pTTL(key);
      return {
        count,
        resetTime: Date.now() + Math.max(ttlMs, 0),
      };
    } catch (err) {
      _log('warn', 'Redis increment failed — using in-memory', {
        ip,
        error: err.message,
      });
    }
  }

  const now = Date.now();
  let data = inMemoryStore.get(ip);

  if (!data || now > data.resetTime) {
    data = { count: 0, resetTime: now + windowMs };
  }

  data.count += 1;
  inMemoryStore.set(ip, data);
  return data;
}

async function _resetAttempts(ip) {
  if (redisAvailable && redis) {
    try {
      const key = securityConfig.redis.keyPrefix + ip;
      await redis.del(key);
      return;
    } catch (err) {
      _log('warn', 'Redis reset failed — using in-memory', {
        ip,
        error: err.message,
      });
    }
  }
  inMemoryStore.delete(ip);
}

function _isWhitelisted(ip) {
  return securityConfig.whitelist.includes(ip);
}

async function rateLimiterMiddleware(req, res, next) {
  const ip = _getClientIp(req);
  const { maxAttempts } = securityConfig.rateLimiting;
  const { addRateLimitHeaders, addRetryAfterHeader } = securityConfig.headers;

  try {
    if (_isWhitelisted(ip)) {
      return next();
    }

    const blacklisted = await _isBlacklisted(ip);
    if (blacklisted) {
      _log('warn', 'Blocked request from blacklisted IP', {
        ip,
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
      });

      if (addRateLimitHeaders) {
        res.setHeader('X-RateLimit-Limit', maxAttempts);
        res.setHeader('X-RateLimit-Remaining', 0);
      }
      if (addRetryAfterHeader) {
        const retryAfterSeconds = Math.ceil(
          securityConfig.rateLimiting.blacklistDurationMs / 1000
        );
        res.setHeader('Retry-After', retryAfterSeconds);
      }

      return res.status(403).json({
        success: false,
        error: 'BLACKLISTED',
        message: securityConfig.messages.blacklisted,
      });
    }

    const updatedData = await _incrementAttempt(ip);
    const { count, resetTime } = updatedData;
    const remaining = Math.max(maxAttempts - count, 0);
    const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000);

    if (addRateLimitHeaders) {
      res.setHeader('X-RateLimit-Limit', maxAttempts);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(resetTime / 1000)
      );
    }

    if (count >= securityConfig.logging.attackThreshold) {
      _log('warn', 'High rate of auth attempts detected', {
        ip,
        count,
        maxAttempts,
        path: req.path,
        method: req.method,
        userAgent: req.headers['user-agent'],
        referer: req.headers['referer'] || 'none',
      });
    }

    if (count > maxAttempts) {
      if (securityConfig.blacklistOnExceed) {
        await _addToBlacklist(ip);
        _log('error', 'IP blacklisted after exceeding rate limit', {
          ip,
          count,
          maxAttempts,
          path: req.path,
        });
      }

      if (addRetryAfterHeader) {
        res.setHeader('Retry-After', retryAfterSeconds);
      }

      return res.status(429).json({
        success: false,
        error: 'RATE_LIMIT_EXCEEDED',
        message: securityConfig.messages.rateLimitExceeded,
        retryAfter: retryAfterSeconds,
      });
    }

    res.locals.rateLimitData = { count, remaining, resetTime, ip };

    next();
  } catch (err) {
    _log('error', 'RateLimiter middleware error', {
      ip,
      error: err.message,
      stack: err.stack,
    });
    next();
  }
}

async function resetIpAttempts(ip) {
  await _resetAttempts(ip);
  _log('info', 'Rate limit reset for IP', { ip });
}

async function getIpStatus(ip) {
  const blacklisted = await _isBlacklisted(ip);
  const data = await _getAttemptData(ip);
  return {
    ip,
    blacklisted,
    attempts: data.count,
    remaining: Math.max(securityConfig.rateLimiting.maxAttempts - data.count, 0),
    resetTime: data.resetTime,
    whitelisted: _isWhitelisted(ip),
  };
}

function getInMemoryStats() {
  return {
    tracked: inMemoryStore.size,
    blacklisted: inMemoryBlacklist.size,
    redisAvailable,
    timestamp: new Date().toISOString(),
  };
}

async function destroy() {
  clearInterval(cleanupTimer);
  inMemoryStore.clear();
  inMemoryBlacklist.clear();
  if (redis) {
    try {
      await redis.quit();
    } catch (_) {}
  }
}

module.exports = {
  rateLimiterMiddleware,
  resetIpAttempts,
  getIpStatus,
  getInMemoryStats,
  destroy,
  _getClientIp,
  _isBlacklisted,
  _addToBlacklist,
  _getAttemptData,
  _incrementAttempt,
  _resetAttempts,
  _isWhitelisted,
  _cleanupInMemoryStore,
};

---

**FILE: src/api/auth.js**

'use strict';

const express = require('express');
const router = express.Router();

const {
  rateLimiterMiddleware,
  resetIpAttempts,
  getIpStatus,
} = require('../../middleware/rateLimiter');

function _validateLoginPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['Corps de la requête invalide.'];
  }
  if (!body.email || typeof body.email !== 'string') {
    errors.push('Email requis.');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('Format email invalide.');
  }
  if (!body.password || typeof body.password !== 'string') {
    errors.push('Mot de passe requis.');
  } else if (body.password.length < 6) {
    errors.push('Le mot de passe doit contenir au moins 6 caractères.');
  }
  return errors;
}

async function _authenticateUser(email, password) {
  const DEMO_USER = {
    id: '1',
    email: process.env.DEMO_EMAIL || 'admin@trackr.app',
    passwordHash: process.env.DEMO_PASSWORD_HASH || 'demo-hash',
    name: 'Admin Trackr',
    role: 'admin',
  };

  if (
    email === DEMO_USER.email &&
    (password === (process.env.DEMO_PASSWORD || 'TrackrDemo2024!') ||
      password === DEMO_USER.passwordHash)
  ) {
    return {
      success: true,
      user: {
        id: DEMO_USER.id,
        email: DEMO_USER.email,
        name: DEMO_USER.name,
        role: DEMO_USER.role,
      },
    };
  }
  return { success: false };
}

function _generateToken(user) {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
  };

  if (process.env.JWT_SECRET) {
    try {
      const jwt = require('jsonwebtoken');
      return jwt.sign(payload, process.env.JWT_SECRET, { algorithm: 'HS256' });
    } catch (_) {}
  }

  const base64 = (obj) =>
    Buffer.from(JSON.stringify(obj))
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

  const header = base64({ alg: 'HS256', typ: 'JWT' });
  const body = base64(payload);
  const signature = base64({
    sig: `${payload.sub}-${payload.iat}-trackr-fallback`,
  });
  return `${header}.${body}.${signature}`;
}

router.post('/login', rateLimiterMiddleware, async (req, res) => {
  const ip = res.locals.rateLimitData?.ip || req.ip;

  try {
    const validationErrors = _validateLoginPayload(req.body);
    if (validationErrors.length > 0) {
      return res.status(400).json