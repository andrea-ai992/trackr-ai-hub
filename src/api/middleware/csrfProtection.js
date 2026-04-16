src/api/middleware/csrfProtection.js

const CryptoJS = require('crypto-js');

const CSRF_SECRET = process.env.CSRF_SECRET || 'trackr-csrf-secret-key-2024-change-in-prod';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 100;
const SUSPICIOUS_THRESHOLD = 10;

// In-memory stores (use Redis in production)
const rateLimitStore = new Map();
const suspiciousIpStore = new Map();
const tokenBlacklist = new Set();

// ─── Logging ────────────────────────────────────────────────────────────────

function logSuspiciousActivity(type, details) {
  const entry = {
    timestamp: new Date().toISOString(),
    type,
    ...details,
  };
  console.warn('[CSRF SECURITY ALERT]', JSON.stringify(entry));

  // Track suspicious IPs
  const ip = details.ip || 'unknown';
  const current = suspiciousIpStore.get(ip) || { count: 0, firstSeen: Date.now() };
  current.count += 1;
  current.lastSeen = Date.now();
  suspiciousIpStore.set(ip, current);

  if (current.count >= SUSPICIOUS_THRESHOLD) {
    console.error('[CSRF BLOCK] IP flagged as malicious:', ip, '| Count:', current.count);
  }
}

function logRequest(method, path, ip, status) {
  console.log(
    `[CSRF] ${new Date().toISOString()} | ${method} ${path} | IP: ${ip} | Status: ${status}`
  );
}

// ─── Token Generation & Validation ──────────────────────────────────────────

function generateCsrfToken(sessionId) {
  const payload = {
    sessionId: sessionId || 'anonymous',
    timestamp: Date.now(),
    nonce: CryptoJS.lib.WordArray.random(16).toString(),
  };

  const payloadStr = JSON.stringify(payload);
  const signature = CryptoJS.HmacSHA256(payloadStr, CSRF_SECRET).toString();
  const token = Buffer.from(JSON.stringify({ payload: payloadStr, signature })).toString('base64');

  return token;
}

function validateCsrfToken(token, sessionId) {
  if (!token || typeof token !== 'string') {
    return { valid: false, reason: 'Token missing or invalid type' };
  }

  if (tokenBlacklist.has(token)) {
    return { valid: false, reason: 'Token has been revoked' };
  }

  let decoded;
  try {
    decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf8'));
  } catch (e) {
    return { valid: false, reason: 'Token decode failed' };
  }

  const { payload: payloadStr, signature } = decoded;

  if (!payloadStr || !signature) {
    return { valid: false, reason: 'Token structure invalid' };
  }

  // Verify signature
  const expectedSignature = CryptoJS.HmacSHA256(payloadStr, CSRF_SECRET).toString();
  if (signature !== expectedSignature) {
    return { valid: false, reason: 'Signature mismatch' };
  }

  let payload;
  try {
    payload = JSON.parse(payloadStr);
  } catch (e) {
    return { valid: false, reason: 'Payload parse failed' };
  }

  // Check expiry
  if (Date.now() - payload.timestamp > TOKEN_EXPIRY_MS) {
    return { valid: false, reason: 'Token expired' };
  }

  // Optionally validate sessionId binding
  if (sessionId && payload.sessionId !== sessionId && payload.sessionId !== 'anonymous') {
    return { valid: false, reason: 'Session mismatch' };
  }

  return { valid: true, payload };
}

function revokeToken(token) {
  tokenBlacklist.add(token);
  // Cleanup old entries periodically
  if (tokenBlacklist.size > 10000) {
    const entries = Array.from(tokenBlacklist);
    entries.slice(0, 5000).forEach((t) => tokenBlacklist.delete(t));
  }
}

// ─── Rate Limiting ───────────────────────────────────────────────────────────

function checkRateLimit(ip) {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
  }

  record.count += 1;
  rateLimitStore.set(ip, record);

  const remaining = Math.max(0, RATE_LIMIT_MAX_REQUESTS - record.count);
  const resetAt = record.windowStart + RATE_LIMIT_WINDOW_MS;

  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt };
  }

  return { allowed: true, remaining, resetAt };
}

// Periodic cleanup of rate limit store
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitStore.entries()) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS * 2) {
      rateLimitStore.delete(ip);
    }
  }
  for (const [ip, record] of suspiciousIpStore.entries()) {
    if (now - record.lastSeen > 24 * 60 * 60 * 1000) {
      suspiciousIpStore.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// ─── IP Extraction ───────────────────────────────────────────────────────────

function extractIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

// ─── Origin Validation ───────────────────────────────────────────────────────

const ALLOWED_ORIGINS = [
  'https://trackr-app-nu.vercel.app',
  'https://trackr-staging.vercel.app',
  process.env.ALLOWED_ORIGIN,
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:5173', 'http://localhost:3000'] : []),
].filter(Boolean);

function validateOrigin(req) {
  const origin = req.headers['origin'];
  const referer = req.headers['referer'];

  if (!origin && !referer) {
    // Allow same-origin requests without Origin header (e.g., direct API calls)
    return { valid: true, reason: 'No origin header (same-origin assumed)' };
  }

  const checkValue = origin || (referer ? new URL(referer).origin : null);

  if (checkValue && ALLOWED_ORIGINS.includes(checkValue)) {
    return { valid: true };
  }

  return { valid: false, reason: `Origin not allowed: ${checkValue}` };
}

// ─── Safe Methods (no CSRF check needed) ─────────────────────────────────────

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

// ─── Main Middleware ──────────────────────────────────────────────────────────

function csrfProtection(options = {}) {
  const {
    skipRoutes = [],
    requireToken = true,
    enforceOrigin = true,
  } = options;

  return function csrfMiddleware(req, res, next) {
    const ip = extractIp(req);
    const method = req.method?.toUpperCase();
    const path = req.url || req.path || '/';

    // Set security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // ── Rate Limit Check ──
    const rateResult = checkRateLimit(ip);
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
    res.setHeader('X-RateLimit-Remaining', rateResult.remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(rateResult.resetAt / 1000));

    if (!rateResult.allowed) {
      logSuspiciousActivity('RATE_LIMIT_EXCEEDED', { ip, method, path });
      logRequest(method, path, ip, 429);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: 'Rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((rateResult.resetAt - Date.now()) / 1000),
      });
    }

    // ── Skip Routes ──
    if (skipRoutes.some((route) => path.startsWith(route))) {
      logRequest(method, path, ip, 'SKIP');
      return next();
    }

    // ── OPTIONS Preflight ──
    if (method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-CSRF-Token, Authorization');
      res.setHeader('Access-Control-Max-Age', '86400');
      logRequest(method, path, ip, 204);
      return res.status(204).end();
    }

    // ── Origin Check (for all non-safe methods) ──
    if (enforceOrigin && !SAFE_METHODS.has(method)) {
      const originResult = validateOrigin(req);
      if (!originResult.valid) {
        logSuspiciousActivity('INVALID_ORIGIN', { ip, method, path, reason: originResult.reason });
        logRequest(method, path, ip, 403);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Request origin not permitted.',
        });
      }
    }

    // ── CSRF Token Check (for non-safe methods) ──
    if (requireToken && !SAFE_METHODS.has(method)) {
      const token =
        req.headers['x-csrf-token'] ||
        req.headers['x-xsrf-token'] ||
        req.body?._csrf ||
        req.query?._csrf;

      if (!token) {
        logSuspiciousActivity('MISSING_CSRF_TOKEN', { ip, method, path });
        logRequest(method, path, ip, 403);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'CSRF token missing.',
          hint: 'Include X-CSRF-Token header with a valid token.',
        });
      }

      const sessionId = req.headers['x-session-id'] || req.session?.id;
      const tokenResult = validateCsrfToken(token, sessionId);

      if (!tokenResult.valid) {
        logSuspiciousActivity('INVALID_CSRF_TOKEN', {
          ip,
          method,
          path,
          reason: tokenResult.reason,
          tokenPrefix: token.substring(0, 20) + '...',
        });
        logRequest(method, path, ip, 403);
        return res.status(403).json({
          error: 'Forbidden',
          message: 'CSRF token invalid or expired.',
          reason: tokenResult.reason,
        });
      }

      // Attach token info to request
      req.csrfPayload = tokenResult.payload;
    }

    // ── Suspicious IP Check ──
    const suspiciousRecord = suspiciousIpStore.get(ip);
    if (suspiciousRecord && suspiciousRecord.count >= SUSPICIOUS_THRESHOLD) {
      logSuspiciousActivity('BLOCKED_SUSPICIOUS_IP', { ip, method, path, strikes: suspiciousRecord.count });
      logRequest(method, path, ip, 403);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied due to suspicious activity.',
      });
    }

    logRequest(method, path, ip, 'PASS');
    return next();
  };
}

// ─── Token Endpoint Handler ───────────────────────────────────────────────────

function handleTokenRequest(req, res) {
  const ip = extractIp(req);
  const method = req.method?.toUpperCase();

  if (method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const rateResult = checkRateLimit(ip);
  if (!rateResult.allowed) {
    logSuspiciousActivity('RATE_LIMIT_TOKEN_ENDPOINT', { ip });
    return res.status(429).json({ error: 'Too Many Requests' });
  }

  const sessionId = req.headers['x-session-id'] || req.query?.sessionId || 'anonymous';
  const token = generateCsrfToken(sessionId);

  console.log(`[CSRF] Token issued for session: ${sessionId} | IP: ${ip}`);

  return res.status(200).json({
    token,
    expiresIn: TOKEN_EXPIRY_MS / 1000,
    issuedAt: new Date().toISOString(),
  });
}

// ─── Exports ──────────────────────────────────────────────────────────────────

module.exports = {
  csrfProtection,
  generateCsrfToken,
  validateCsrfToken,
  revokeToken,
  handleTokenRequest,
  checkRateLimit,
  extractIp,
  validateOrigin,
  // Expose stores for testing
  _stores: { rateLimitStore, suspiciousIpStore, tokenBlacklist },
};