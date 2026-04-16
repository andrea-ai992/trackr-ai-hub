src/utils/tokenManager.js

import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.CSRF_SECRET || 'trackr-csrf-secret-dev-2024';
const TOKEN_EXPIRY = 3600000; // 1 hour in ms
const RATE_LIMIT_WINDOW = 60000; // 1 minute in ms
const MAX_REQUESTS = 100;

const rateLimitStore = new Map();
const tokenBlacklist = new Set();
const suspiciousActivityLog = [];

export const generateCSRFToken = (sessionId = 'anonymous') => {
  const timestamp = Date.now();
  const nonce = CryptoJS.lib.WordArray.random(16).toString();
  const payload = JSON.stringify({ sessionId, timestamp, nonce });
  const signature = CryptoJS.HmacSHA256(payload, SECRET_KEY).toString();
  const token = CryptoJS.enc.Base64.stringify(
    CryptoJS.enc.Utf8.parse(`${payload}::${signature}`)
  );
  return token;
};

export const validateCSRFToken = (token, sessionId = 'anonymous') => {
  if (!token) {
    return { valid: false, reason: 'TOKEN_MISSING' };
  }

  if (tokenBlacklist.has(token)) {
    return { valid: false, reason: 'TOKEN_BLACKLISTED' };
  }

  try {
    const decoded = CryptoJS.enc.Base64.parse(token).toString(CryptoJS.enc.Utf8);
    const lastDoubleColon = decoded.lastIndexOf('::');
    if (lastDoubleColon === -1) {
      return { valid: false, reason: 'TOKEN_MALFORMED' };
    }

    const payloadStr = decoded.substring(0, lastDoubleColon);
    const providedSignature = decoded.substring(lastDoubleColon + 2);
    const expectedSignature = CryptoJS.HmacSHA256(payloadStr, SECRET_KEY).toString();

    if (providedSignature !== expectedSignature) {
      return { valid: false, reason: 'TOKEN_SIGNATURE_INVALID' };
    }

    const payload = JSON.parse(payloadStr);

    if (Date.now() - payload.timestamp > TOKEN_EXPIRY) {
      tokenBlacklist.add(token);
      return { valid: false, reason: 'TOKEN_EXPIRED' };
    }

    if (payload.sessionId !== sessionId) {
      return { valid: false, reason: 'SESSION_MISMATCH' };
    }

    return { valid: true, payload };
  } catch (err) {
    return { valid: false, reason: 'TOKEN_PARSE_ERROR', error: err.message };
  }
};

export const revokeToken = (token) => {
  tokenBlacklist.add(token);
};

export const checkRateLimit = (identifier) => {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    rateLimitStore.set(identifier, { count: 1, windowStart: now, blocked: false });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  if (now - record.windowStart > RATE_LIMIT_WINDOW) {
    rateLimitStore.set(identifier, { count: 1, windowStart: now, blocked: false });
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW };
  }

  record.count += 1;
  rateLimitStore.set(identifier, record);

  const remaining = Math.max(0, MAX_REQUESTS - record.count);
  const resetAt = record.windowStart + RATE_LIMIT_WINDOW;

  if (record.count > MAX_REQUESTS) {
    logSuspiciousActivity({
      type: 'RATE_LIMIT_EXCEEDED',
      identifier,
      count: record.count,
      timestamp: now,
    });
    return { allowed: false, remaining: 0, resetAt, retryAfter: Math.ceil((resetAt - now) / 1000) };
  }

  return { allowed: true, remaining, resetAt };
};

export const logSuspiciousActivity = (entry) => {
  const logEntry = {
    ...entry,
    id: CryptoJS.lib.WordArray.random(8).toString(),
    timestamp: entry.timestamp || Date.now(),
    environment: process.env.VERCEL_ENV || 'development',
  };

  suspiciousActivityLog.push(logEntry);

  if (suspiciousActivityLog.length > 1000) {
    suspiciousActivityLog.splice(0, suspiciousActivityLog.length - 1000);
  }

  const severity = getSeverity(entry.type);
  const prefix = severity === 'HIGH' ? '[SECURITY-HIGH]' : '[SECURITY]';

  console.warn(`${prefix} ${JSON.stringify(logEntry)}`);

  return logEntry;
};

const getSeverity = (type) => {
  const highSeverityTypes = [
    'TOKEN_SIGNATURE_INVALID',
    'SESSION_MISMATCH',
    'RATE_LIMIT_EXCEEDED',
    'TOKEN_BLACKLISTED',
    'CSRF_ATTACK_SUSPECTED',
  ];
  return highSeverityTypes.includes(type) ? 'HIGH' : 'MEDIUM';
};

export const getSuspiciousActivityLog = (limit = 50) => {
  return suspiciousActivityLog.slice(-limit);
};

export const cleanupExpiredRateLimits = () => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW * 2) {
      rateLimitStore.delete(key);
    }
  }
};

export const cleanupBlacklist = () => {
  tokenBlacklist.clear();
};

if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredRateLimits, RATE_LIMIT_WINDOW * 5);
}

export default {
  generateCSRFToken,
  validateCSRFToken,
  revokeToken,
  checkRateLimit,
  logSuspiciousActivity,
  getSuspiciousActivityLog,
  cleanupExpiredRateLimits,
  cleanupBlacklist,
};