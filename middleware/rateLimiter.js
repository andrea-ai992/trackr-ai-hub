middleware/rateLimiter.js

const SECURITY_CONFIG = {
  MAX_ATTEMPTS: 10,
  WINDOW_MS: 5 * 60 * 1000,
  BLACKLIST_DURATION_MS: 15 * 60 * 1000,
  CLEANUP_INTERVAL_MS: 60 * 1000,
  REDIS_KEY_PREFIX: 'trackr:ratelimit:',
  BLACKLIST_KEY_PREFIX: 'trackr:blacklist:',
  ATTACK_LOG_MAX_SIZE: 1000,
};

class InMemoryStore {
  constructor() {
    this.attempts = new Map();
    this.blacklist = new Map();
    this.attackLogs = [];
    this._startCleanup();
  }

  _startCleanup() {
    this._cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, data] of this.attempts.entries()) {
        if (now - data.windowStart > SECURITY_CONFIG.WINDOW_MS) {
          this.attempts.delete(key);
        }
      }
      for (const [ip, expiry] of this.blacklist.entries()) {
        if (now > expiry) {
          this.blacklist.delete(ip);
        }
      }
    }, SECURITY_CONFIG.CLEANUP_INTERVAL_MS);

    if (this._cleanupInterval.unref) {
      this._cleanupInterval.unref();
    }
  }

  async getAttempts(ip) {
    const data = this.attempts.get(ip);
    const now = Date.now();
    if (!data || now - data.windowStart > SECURITY_CONFIG.WINDOW_MS) {
      return { count: 0, windowStart: now };
    }
    return data;
  }

  async incrementAttempts(ip) {
    const now = Date.now();
    const existing = this.attempts.get(ip);
    if (!existing || now - existing.windowStart > SECURITY_CONFIG.WINDOW_MS) {
      const newData = { count: 1, windowStart: now };
      this.attempts.set(ip, newData);
      return newData;
    }
    existing.count += 1;
    this.attempts.set(ip, existing);
    return existing;
  }

  async resetAttempts(ip) {
    this.attempts.delete(ip);
  }

  async isBlacklisted(ip) {
    const expiry = this.blacklist.get(ip);
    if (!expiry) return false;
    if (Date.now() > expiry) {
      this.blacklist.delete(ip);
      return false;
    }
    return true;
  }

  async addToBlacklist(ip) {
    const expiry = Date.now() + SECURITY_CONFIG.BLACKLIST_DURATION_MS;
    this.blacklist.set(ip, expiry);
    return expiry;
  }

  async getBlacklistExpiry(ip) {
    return this.blacklist.get(ip) || null;
  }

  async logAttack(entry) {
    this.attackLogs.push(entry);
    if (this.attackLogs.length > SECURITY_CONFIG.ATTACK_LOG_MAX_SIZE) {
      this.attackLogs.shift();
    }
  }

  async getAttackLogs(limit = 100) {
    return this.attackLogs.slice(-limit);
  }

  destroy() {
    if (this._cleanupInterval) {
      clearInterval(this._cleanupInterval);
    }
  }
}

class RedisStore {
  constructor(redisClient) {
    this.client = redisClient;
  }

  _attemptsKey(ip) {
    return `${SECURITY_CONFIG.REDIS_KEY_PREFIX}${ip}`;
  }

  _blacklistKey(ip) {
    return `${SECURITY_CONFIG.BLACKLIST_KEY_PREFIX}${ip}`;
  }

  async getAttempts(ip) {
    try {
      const raw = await this.client.get(this._attemptsKey(ip));
      if (!raw) return { count: 0, windowStart: Date.now() };
      return JSON.parse(raw);
    } catch {
      return { count: 0, windowStart: Date.now() };
    }
  }

  async incrementAttempts(ip) {
    try {
      const key = this._attemptsKey(ip);
      const raw = await this.client.get(key);
      const now = Date.now();
      let data;
      if (!raw) {
        data = { count: 1, windowStart: now };
      } else {
        data = JSON.parse(raw);
        if (now - data.windowStart > SECURITY_CONFIG.WINDOW_MS) {
          data = { count: 1, windowStart: now };
        } else {
          data.count += 1;
        }
      }
      const ttlMs = SECURITY_CONFIG.WINDOW_MS - (now - data.windowStart);
      await this.client.set(key, JSON.stringify(data), 'PX', Math.max(ttlMs, 1000));
      return data;
    } catch (err) {
      return { count: 0, windowStart: Date.now() };
    }
  }

  async resetAttempts(ip) {
    try {
      await this.client.del(this._attemptsKey(ip));
    } catch {}
  }

  async isBlacklisted(ip) {
    try {
      const val = await this.client.get(this._blacklistKey(ip));
      return val !== null;
    } catch {
      return false;
    }
  }

  async addToBlacklist(ip) {
    try {
      const expiry = Date.now() + SECURITY_CONFIG.BLACKLIST_DURATION_MS;
      await this.client.set(
        this._blacklistKey(ip),
        expiry.toString(),
        'PX',
        SECURITY_CONFIG.BLACKLIST_DURATION_MS
      );
      return expiry;
    } catch {
      return Date.now() + SECURITY_CONFIG.BLACKLIST_DURATION_MS;
    }
  }

  async getBlacklistExpiry(ip) {
    try {
      const val = await this.client.get(this._blacklistKey(ip));
      return val ? parseInt(val, 10) : null;
    } catch {
      return null;
    }
  }

  async logAttack(entry) {
    try {
      await this.client.lpush('trackr:attack_logs', JSON.stringify(entry));
      await this.client.ltrim('trackr:attack_logs', 0, SECURITY_CONFIG.ATTACK_LOG_MAX_SIZE - 1);
    } catch {}
  }

  async getAttackLogs(limit = 100) {
    try {
      const logs = await this.client.lrange('trackr:attack_logs', 0, limit - 1);
      return logs.map((l) => JSON.parse(l));
    } catch {
      return [];
    }
  }

  destroy() {}
}

function getClientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return (
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );
}

function sanitizeIp(ip) {
  if (!ip || typeof ip !== 'string') return 'unknown';
  return ip.replace(/[^a-fA-F0-9.:]/g, '').substring(0, 45);
}

let storeInstance = null;

function initStore(redisClient = null) {
  if (redisClient) {
    storeInstance = new RedisStore(redisClient);
    console.log('[RateLimiter] Using Redis store');
  } else {
    storeInstance = new InMemoryStore();
    console.log('[RateLimiter] Using in-memory store (fallback)');
  }
  return storeInstance;
}

function getStore() {
  if (!storeInstance) {
    storeInstance = new InMemoryStore();
  }
  return storeInstance;
}

async function logAttackEvent(store, ip, req, reason, attemptCount) {
  const entry = {
    timestamp: new Date().toISOString(),
    ip,
    reason,
    attemptCount,
    method: req.method,
    path: req.path || req.url,
    userAgent: req.headers['user-agent'] || 'unknown',
    referer: req.headers['referer'] || '',
  };

  await store.logAttack(entry);

  console.warn(
    `[RateLimiter] ATTACK DETECTED | IP: ${ip} | Reason: ${reason} | Attempts: ${attemptCount} | Path: ${entry.path} | UA: ${entry.userAgent}`
  );

  return entry;
}

function createRateLimiter(options = {}) {
  const config = {
    maxAttempts: options.maxAttempts || SECURITY_CONFIG.MAX_ATTEMPTS,
    windowMs: options.windowMs || SECURITY_CONFIG.WINDOW_MS,
    blacklistDurationMs: options.blacklistDurationMs || SECURITY_CONFIG.BLACKLIST_DURATION_MS,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    keyGenerator: options.keyGenerator || null,
    onRateLimit: options.onRateLimit || null,
    onBlacklist: options.onBlacklist || null,
  };

  return async function rateLimiterMiddleware(req, res, next) {
    const store = getStore();
    const rawIp = getClientIp(req);
    const ip = sanitizeIp(rawIp);

    const key = config.keyGenerator ? config.keyGenerator(req) : ip;

    try {
      const blacklisted = await store.isBlacklisted(key);
      if (blacklisted) {
        const expiry = await store.getBlacklistExpiry(key);
        const remainingMs = expiry ? Math.max(0, expiry - Date.now()) : config.blacklistDurationMs;
        const remainingSec = Math.ceil(remainingMs / 1000);

        await logAttackEvent(store, key, req, 'BLACKLISTED_IP_ACCESS', -1);

        if (config.onBlacklist) {
          return config.onBlacklist(req, res, remainingSec);
        }

        res.set({
          'Retry-After': remainingSec,
          'X-RateLimit-Blocked': 'true',
          'X-RateLimit-Reset': expiry ? new Date(expiry).toISOString() : '',
        });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Your IP has been temporarily blocked due to suspicious activity.',
          retryAfter: remainingSec,
          blockedUntil: expiry ? new Date(expiry).toISOString() : null,
          code: 'IP_BLACKLISTED',
        });
      }

      const attemptData = await store.incrementAttempts(key);
      const { count, windowStart } = attemptData;

      const windowElapsedMs = Date.now() - windowStart;
      const windowRemainingMs = Math.max(0, config.windowMs - windowElapsedMs);
      const windowRemainingSec = Math.ceil(windowRemainingMs / 1000);
      const remaining = Math.max(0, config.maxAttempts - count);

      res.set({
        'X-RateLimit-Limit': config.maxAttempts,
        'X-RateLimit-Remaining': remaining,
        'X-RateLimit-Reset': new Date(windowStart + config.windowMs).toISOString(),
        'X-RateLimit-Window': Math.ceil(config.windowMs / 1000),
      });

      if (count > config.maxAttempts) {
        const blacklistExpiry = await store.addToBlacklist(key);
        const blockedUntil = new Date(blacklistExpiry).toISOString();

        await logAttackEvent(store, key, req, 'RATE_LIMIT_EXCEEDED_BLACKLISTED', count);

        if (config.onRateLimit) {
          return config.onRateLimit(req, res, windowRemainingSec);
        }

        res.set({
          'Retry-After': Math.ceil(config.blacklistDurationMs / 1000),
          'X-RateLimit-Blocked': 'true',
        });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: 'Rate limit exceeded. You have been temporarily blocked.',
          retryAfter: Math.ceil(config.blacklistDurationMs / 1000),
          blockedUntil,
          code: 'RATE_LIMIT_BLACKLISTED',
        });
      }

      if (count >= config.maxAttempts) {
        await logAttackEvent(store, key, req, 'RATE_LIMIT_REACHED', count);

        if (config.onRateLimit) {
          return config.onRateLimit(req, res, windowRemainingSec);
        }

        res.set({
          'Retry-After': windowRemainingSec,
          'X-RateLimit-Remaining': 0,
        });

        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Rate limit exceeded. Maximum ${config.maxAttempts} attempts per ${Math.ceil(config.windowMs / 60000)} minutes.`,
          retryAfter: windowRemainingSec,
          attemptsUsed: count,
          limit: config.maxAttempts,
          code: 'RATE_LIMIT_EXCEEDED',
        });
      }

      if (count >= Math.floor(config.maxAttempts * 0.8)) {
        await logAttackEvent(store, key, req, 'RATE_LIMIT_WARNING', count);
      }

      if (config.skipSuccessfulRequests) {
        const originalJson = res.json.bind(res);
        res.json = function (body) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            store.resetAttempts(key).catch(() => {});
          }
          return originalJson(body);
        };
      }

      req.rateLimitInfo = {
        ip: key,
        count,
        remaining,
        limit: config.maxAttempts,
        windowStart,
        windowMs: config.windowMs,
      };

      return next();
    } catch (err) {
      console.error('[RateLimiter] Middleware error:', err.message);
      return next();
    }
  };
}

const authRateLimiter = createRateLimiter({
  maxAttempts: SECURITY_CONFIG.MAX_ATTEMPTS,
  windowMs: SECURITY_CONFIG.WINDOW_MS,
  blacklistDurationMs: SECURITY_CONFIG.BLACKLIST_DURATION_MS,
  skipSuccessfulRequests: false,
});

async function getAttackLogs(limit = 100) {
  return getStore().getAttackLogs(limit);
}

async function resetIpAttempts(ip) {
  return getStore().resetAttempts(sanitizeIp(ip));
}

async function blacklistIp(ip) {
  const store = getStore();
  const sanitized = sanitizeIp(ip);
  return store.addToBlacklist(sanitized);
}

async function removeFromBlacklist(ip) {
  const store = getStore();
  const sanitized = sanitizeIp(ip);
  if (store instanceof InMemoryStore) {
    store.blacklist.delete(sanitized);
  } else if (store instanceof RedisStore) {
    try {
      await store.client.del(store._blacklistKey(sanitized));
    } catch {}
  }
}

async function getIpStatus(ip) {
  const store = getStore();
  const sanitized = sanitizeIp(ip);
  const [blacklisted, attemptData, blacklistExpiry] = await Promise.all([
    store.isBlacklisted(sanitized),
    store.getAttempts(sanitized),
    store.getBlacklistExpiry(sanitized),
  ]);

  return {
    ip: sanitized,
    blacklisted,
    blacklistExpiry: blacklistExpiry ? new Date(blacklistExpiry).toISOString() : null,
    attempts: attemptData.count,
    windowStart: attemptData.windowStart ? new Date(attemptData.windowStart).toISOString() : null,
    limit: SECURITY_CONFIG.MAX_ATTEMPTS,
    remaining: Math.max(0, SECURITY_CONFIG.MAX_ATTEMPTS - attemptData.count),
  };
}

function destroyStore() {
  if (storeInstance) {
    storeInstance.destroy();
    storeInstance = null;
  }
}

module.exports = {
  authRateLimiter,
  createRateLimiter,
  initStore,
  getStore,
  getAttackLogs,
  resetIpAttempts,
  blacklistIp,
  removeFromBlacklist,
  getIpStatus,
  destroyStore,
  InMemoryStore,
  RedisStore,
  SECURITY_CONFIG,
};