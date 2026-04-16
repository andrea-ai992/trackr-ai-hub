I'll implement the rate-limiting middleware and auth endpoint. Let me create both files.

**File 1: api/middleware/rateLimiter.js**

const attempts = new Map();

const MAX_ATTEMPTS = 5;
const TTL_MS = 15 * 60 * 1000;

function cleanupExpired() {
  const now = Date.now();
  for (const [ip, data] of attempts.entries()) {
    if (now - data.firstAttempt > TTL_MS) {
      attempts.delete(ip);
    }
  }
}

setInterval(cleanupExpired, 60 * 1000);

export function rateLimiter(ip) {
  const now = Date.now();

  cleanupExpired();

  if (!attempts.has(ip)) {
    attempts.set(ip, {
      count: 1,
      firstAttempt: now,
      blocked: false,
      blockedAt: null,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfter: null };
  }

  const data = attempts.get(ip);
  const elapsed = now - data.firstAttempt;

  if (elapsed > TTL_MS) {
    attempts.set(ip, {
      count: 1,
      firstAttempt: now,
      blocked: false,
      blockedAt: null,
    });
    return { allowed: true, remaining: MAX_ATTEMPTS - 1, retryAfter: null };
  }

  if (data.blocked) {
    const retryAfter = Math.ceil((TTL_MS - elapsed) / 1000);
    console.warn(
      `[RateLimiter] BLOCKED IP: ${ip} | Retry-After: ${retryAfter}s | Attempts: ${data.count}`
    );
    return { allowed: false, remaining: 0, retryAfter };
  }

  data.count += 1;

  if (data.count >= MAX_ATTEMPTS) {
    data.blocked = true;
    data.blockedAt = now;
    const retryAfter = Math.ceil(TTL_MS / 1000);
    console.warn(
      `[RateLimiter] IP BLOCKED after ${data.count} failed attempts: ${ip} | Blocked until: ${new Date(now + TTL_MS).toISOString()}`
    );
    attempts.set(ip, data);
    return { allowed: false, remaining: 0, retryAfter };
  }

  attempts.set(ip, data);
  const remaining = MAX_ATTEMPTS - data.count;
  return { allowed: true, remaining, retryAfter: null };
}

export function resetAttempts(ip) {
  attempts.delete(ip);
}

export function getAttemptStats(ip) {
  if (!attempts.has(ip)) {
    return { count: 0, blocked: false, remaining: MAX_ATTEMPTS };
  }
  const data = attempts.get(ip);
  return {
    count: data.count,
    blocked: data.blocked,
    remaining: Math.max(0, MAX_ATTEMPTS - data.count),
    firstAttempt: data.firstAttempt,
    blockedAt: data.blockedAt,
  };
}

**File 2: api/auth.js**

import { rateLimiter, resetAttempts } from './middleware/rateLimiter.js';

const VALID_USERS = {
  'admin@trackr.app': {
    passwordHash: 'trackr_admin_2024',
    role: 'admin',
    id: 'usr_001',
  },
  'user@trackr.app': {
    passwordHash: 'trackr_user_2024',
    role: 'user',
    id: 'usr_002',
  },
};

function getClientIp(req) {
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

function validateCredentials(email, password) {
  if (!email || !password) return null;
  const user = VALID_USERS[email.toLowerCase().trim()];
  if (!user) return null;
  if (user.passwordHash !== password) return null;
  return { id: user.id, email: email.toLowerCase().trim(), role: user.role };
}

function generateSessionToken(userId, email) {
  const payload = {
    userId,
    email,
    iat: Date.now(),
    exp: Date.now() + 24 * 60 * 60 * 1000,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
      message: 'Only POST requests are accepted on this endpoint.',
    });
  }

  const clientIp = getClientIp(req);
  const { allowed, remaining, retryAfter } = rateLimiter(clientIp);

  if (!allowed) {
    console.error(
      `[Auth] 429 Too Many Requests | IP: ${clientIp} | Retry-After: ${retryAfter}s | Time: ${new Date().toISOString()}`
    );
    res.setHeader('Retry-After', String(retryAfter));
    res.setHeader('X-RateLimit-Limit', '5');
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('X-RateLimit-Reset', String(Date.now() + retryAfter * 1000));
    return res.status(429).json({
      success: false,
      error: 'Too Many Requests',
      message: `Too many failed login attempts. Please try again in ${Math.ceil(retryAfter / 60)} minute(s).`,
      retryAfter,
      retryAfterMinutes: Math.ceil(retryAfter / 60),
    });
  }

  let body = req.body;

  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Bad Request',
        message: 'Request body must be valid JSON.',
      });
    }
  }

  if (!body || typeof body !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'Bad Request',
      message: 'Request body is required.',
    });
  }

  const { email, password } = body;

  if (!email || typeof email !== 'string' || email.trim().length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Email is required and must be a non-empty string.',
    });
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Password is required.',
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Please provide a valid email address.',
    });
  }

  const user = validateCredentials(email, password);

  if (!user) {
    console.warn(
      `[Auth] Failed login attempt | IP: ${clientIp} | Email: ${email.trim()} | Remaining attempts: ${remaining - 1} | Time: ${new Date().toISOString()}`
    );
    res.setHeader('X-RateLimit-Limit', '5');
    res.setHeader('X-RateLimit-Remaining', String(Math.max(0, remaining - 1)));
    return res.status(401).json({
      success: false,
      error: 'Unauthorized',
      message: 'Invalid email or password.',
      attemptsRemaining: Math.max(0, remaining - 1),
    });
  }

  resetAttempts(clientIp);

  const token = generateSessionToken(user.id, user.email);

  console.info(
    `[Auth] Successful login | IP: ${clientIp} | User: ${user.email} | Role: ${user.role} | Time: ${new Date().toISOString()}`
  );

  res.setHeader('X-RateLimit-Limit', '5');
  res.setHeader('X-RateLimit-Remaining', '5');

  return res.status(200).json({
    success: true,
    message: 'Authentication successful.',
    token,
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    expiresIn: 86400,
  });
}