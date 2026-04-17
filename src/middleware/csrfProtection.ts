Je vais générer tous les fichiers nécessaires pour cette tâche.

=== FILE: src/middleware/rateLimiter.ts ===

import { NextApiRequest, NextApiResponse } from 'next';
import { track } from '@vercel/analytics/server';

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitStore {
  [ip: string]: RateLimitEntry;
}

const store: RateLimitStore = {};
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;
const CLEANUP_INTERVAL = 5 * 60 * 1000;

setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((ip) => {
    if (store[ip] && now > store[ip].resetTime) {
      delete store[ip];
    }
  });
}, CLEANUP_INTERVAL);

function getClientIp(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0];
    return ips.trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }
  return req.socket?.remoteAddress || 'unknown';
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
  retryAfter?: number;
}

export function checkRateLimit(req: NextApiRequest): RateLimitResult {
  const ip = getClientIp(req);
  const now = Date.now();

  if (!store[ip] || now > store[ip].resetTime) {
    store[ip] = {
      count: 1,
      resetTime: now + WINDOW_MS,
      firstRequest: now,
    };
    return {
      success: true,
      limit: MAX_REQUESTS,
      remaining: MAX_REQUESTS - 1,
      reset: store[ip].resetTime,
    };
  }

  store[ip].count += 1;

  if (store[ip].count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((store[ip].resetTime - now) / 1000);
    return {
      success: false,
      limit: MAX_REQUESTS,
      remaining: 0,
      reset: store[ip].resetTime,
      retryAfter,
    };
  }

  return {
    success: true,
    limit: MAX_REQUESTS,
    remaining: MAX_REQUESTS - store[ip].count,
    reset: store[ip].resetTime,
  };
}

export function setRateLimitHeaders(res: NextApiResponse, result: RateLimitResult): void {
  res.setHeader('X-RateLimit-Limit', result.limit);
  res.setHeader('X-RateLimit-Remaining', result.remaining);
  res.setHeader('X-RateLimit-Reset', Math.ceil(result.reset / 1000));
  if (result.retryAfter !== undefined) {
    res.setHeader('Retry-After', result.retryAfter);
  }
}

export type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void;

export function withRateLimit(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const result = checkRateLimit(req);
    setRateLimitHeaders(res, result);

    if (!result.success) {
      const ip = getClientIp(req);
      const endpoint = req.url || 'unknown';

      try {
        await track('rate_limit_exceeded', {
          ip: ip.substring(0, 10) + '***',
          endpoint,
          timestamp: new Date().toISOString(),
        });
      } catch {
        // Analytics failure should not block the response
      }

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Maximum ${MAX_REQUESTS} requests per minute allowed.`,
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: result.retryAfter,
        resetAt: new Date(result.reset).toISOString(),
        details: {
          limit: result.limit,
          remaining: result.remaining,
          windowMs: WINDOW_MS,
        },
      });
    }

    return handler(req, res);
  };
}

export default withRateLimit;


=== FILE: src/middleware/csrfProtection.ts ===

import { NextApiRequest, NextApiResponse } from 'next';
import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { ApiHandler } from './rateLimiter';

const CSRF_SECRET = process.env.CSRF_SECRET || 'trackr-csrf-secret-change-in-production-32chars';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000;
const CSRF_HEADER_NAME = 'x-csrf-token';
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export interface CsrfTokenPayload {
  token: string;
  timestamp: number;
  signature: string;
}

export function generateCsrfToken(): string {
  const token = randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const payload = `${token}:${timestamp}`;
  const signature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');
  const fullToken = Buffer.from(JSON.stringify({ token, timestamp, signature })).toString('base64url');
  return fullToken;
}

export function validateCsrfToken(tokenString: string): { valid: boolean; reason?: string } {
  try {
    const decoded = Buffer.from(tokenString, 'base64url').toString('utf-8');
    const parsed: CsrfTokenPayload = JSON.parse(decoded);

    if (!parsed.token || !parsed.timestamp || !parsed.signature) {
      return { valid: false, reason: 'Malformed token structure' };
    }

    const now = Date.now();
    if (now - parsed.timestamp > TOKEN_EXPIRY_MS) {
      return { valid: false, reason: 'Token has expired' };
    }

    const payload = `${parsed.token}:${parsed.timestamp}`;
    const expectedSignature = createHmac('sha256', CSRF_SECRET).update(payload).digest('hex');

    const expectedBuffer = Buffer.from(expectedSignature, 'hex');
    const receivedBuffer = Buffer.from(parsed.signature, 'hex');

    if (expectedBuffer.length !== receivedBuffer.length) {
      return { valid: false, reason: 'Invalid token signature length' };
    }

    if (!timingSafeEqual(expectedBuffer, receivedBuffer)) {
      return { valid: false, reason: 'Invalid token signature' };
    }

    return { valid: true };
  } catch {
    return { valid: false, reason: 'Token parsing failed' };
  }
}

export function getCsrfTokenFromRequest(req: NextApiRequest): string | null {
  const headerToken = req.headers[CSRF_HEADER_NAME];
  if (headerToken) {
    return Array.isArray(headerToken) ? headerToken[0] : headerToken;
  }

  if (req.body && typeof req.body === 'object' && req.body._csrf) {
    return req.body._csrf;
  }

  const queryToken = req.query._csrf;
  if (queryToken) {
    return Array.isArray(queryToken) ? queryToken[0] : queryToken;
  }

  return null;
}

export function withCsrfProtection(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    if (req.method && SAFE_METHODS.includes(req.method.toUpperCase())) {
      const newToken = generateCsrfToken();
      res.setHeader('X-CSRF-Token', newToken);
      res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');
      return handler(req, res);
    }

    const origin = req.headers['origin'];
    const host = req.headers['host'];
    const referer = req.headers['referer'];

    const allowedOrigins = [
      `https://${host}`,
      'https://trackr-app-nu.vercel.app',
      process.env.NEXT_PUBLIC_APP_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    ].filter(Boolean);

    const isValidOrigin =
      !origin ||
      allowedOrigins.some((allowed) => allowed && origin.startsWith(allowed)) ||
      (process.env.NODE_ENV === 'development' && origin.startsWith('http://localhost'));

    if (!isValidOrigin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Request origin not allowed.',
        code: 'INVALID_ORIGIN',
        details: {
          receivedOrigin: origin,
        },
      });
    }

    if (referer) {
      const refererUrl = new URL(referer);
      const isValidReferer =
        allowedOrigins.some(
          (allowed) => allowed && referer.startsWith(allowed)
        ) ||
        (process.env.NODE_ENV === 'development' &&
          refererUrl.hostname === 'localhost');

      if (!isValidReferer) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'Request referer not allowed.',
          code: 'INVALID_REFERER',
        });
      }
    }

    const tokenString = getCsrfTokenFromRequest(req);

    if (!tokenString) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'CSRF token missing. Include X-CSRF-Token header.',
        code: 'CSRF_TOKEN_MISSING',
        hint: 'Perform a GET request first to obtain a CSRF token from the X-CSRF-Token response header.',
      });
    }

    const validation = validateCsrfToken(tokenString);

    if (!validation.valid) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'CSRF token validation failed.',
        code: 'CSRF_TOKEN_INVALID',
        reason: validation.reason,
        hint: 'Perform a GET request to obtain a fresh CSRF token.',
      });
    }

    const newToken = generateCsrfToken();
    res.setHeader('X-CSRF-Token', newToken);
    res.setHeader('Access-Control-Expose-Headers', 'X-CSRF-Token');

    return handler(req, res);
  };
}

export function withCsrfAndBearerAuth(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const authHeader = req.headers['authorization'];

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const validTokens = (process.env.API_BEARER_TOKENS || '').split(',').filter(Boolean);

      if (validTokens.length > 0 && validTokens.includes(token)) {
        return handler(req, res);
      }

      if (validTokens.length > 0) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Invalid Bearer token.',
          code: 'INVALID_BEARER_TOKEN',
        });
      }
    }

    return withCsrfProtection(handler)(req, res);
  };
}

export default withCsrfProtection;


=== FILE: src/pages/api/athletes.ts ===

import { NextApiRequest, NextApiResponse } from 'next';
import { withRateLimit } from '../../middleware/rateLimiter';
import { withCsrfAndBearerAuth } from '../../middleware/csrfProtection';

interface Athlete {
  id: string;
  name: string;
  sport: string;
  team: string;
  marketValue: number;
  performance: number;
  trend: 'up' | 'down' | 'stable';
  stats: {
    goals?: number;
    assists?: number;
    rating: number;
    gamesPlayed: number;
  };
  lastUpdated: string;
}

const mockAthletes: Athlete[] = [
  {
    id: 'ath-001',
    name: 'Kylian Mbappé',
    sport: 'Football',
    team: 'Real Madrid',
    marketValue: 180000000,
    performance: 92,
    trend: 'up',
    stats: { goals: 28, assists: 12, rating: 9.1, gamesPlayed: 34 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ath-002',
    name: 'Erling Haaland',
    sport: 'Football',
    team: 'Manchester City',
    marketValue: 170000000,
    performance: 90,
    trend: 'up',
    stats: { goals: 32, assists: 8, rating: 9.0, gamesPlayed: 33 },
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'ath-003',
    name: 'Vinícius Jr.',
    sport: 'Football',
    team: 'Real Madrid',
    marketValue: 150000000,
    performance: 89,
    trend: 'stable',
    stats: { goals: 21, assists: 18, rating: 8.8, gamesPlayed: 35 },
    lastUpdated: new Date().toISOString(),
  },
];

async function athletesHandler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');

  switch (req.method) {
    case 'GET': {
      const { id, sport, limit = '20', offset = '0' } = req.query;

      if (id) {
        const athlete = mockAthletes.find((a) => a.id === id);
        if (!athlete) {
          return res.status(404).json({
            error: 'Not Found',
            message: `Athlete with id '${id}' not found.`,
            code: 'ATHLETE_NOT_FOUND',
          });
        }
        return res.status(200).json({ data: athlete, meta: { timestamp: new Date().toISOString() } });
      }

      let filtered = [...mockAthletes];

      if (sport) {
        filtered = filtered.filter(
          (a) => a.sport.toLowerCase() === (sport as string).toLowerCase()
        );
      }

      const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
      const offsetNum = parseInt(offset as string, 10) || 0;
      const paginated = filtered.slice(offsetNum, offsetNum + limitNum);

      return res.status(200).json({
        data: paginated,
        meta: {
          total: filtered.length,
          limit: limitNum,
          offset: offsetNum,
          timestamp: new Date().toISOString(),
        },
      });
    }

    case 'POST': {
      const body = req.body;

      if (!body || !body.name || !body.sport || !body.team) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Missing required fields: name, sport, team.',
          code: 'MISSING_REQUIRED_FIELDS',
          required: ['name', 'sport', 'team'],
        });
      }

      const newAthlete: Athlete = {
        id: `ath-${Date.now()}`,
        name: String(body.name).substring(0, 100),
        sport: String(body.sport).substring(0, 50),
        team: String(body.team).substring(0, 100),
        marketValue: Number(body.marketValue) || 0,
        performance: Math.min(Math.max(Number(body.performance) || 0, 0), 100),
        trend: ['up', 'down', 'stable'].includes(body.trend) ? body.trend : 'stable',
        stats: {
          goals: Number(body.stats?.goals) || 0,
          assists: Number(body.stats?.assists) || 0,
          rating: Math.min(Math.max(Number(body.stats?.rating) || 0, 0), 10),
          gamesPlayed: Number(body.stats?.gamesPlayed) || 0,
        },
        lastUpdated: new Date().toISOString(),
      };

      return res.status(201).json({
        data: newAthlete,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    case 'PUT': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Athlete id is required for update.',
          code: 'MISSING_ATHLETE_ID',
        });
      }

      const existingIndex = mockAthletes.findIndex((a) => a.id === id);
      if (existingIndex === -1) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Athlete with id '${id}' not found.`,
          code: 'ATHLETE_NOT_FOUND',
        });
      }

      const updated = {
        ...mockAthletes[existingIndex],
        ...req.body,
        id: mockAthletes[existingIndex].id,
        lastUpdated: new Date().toISOString(),
      };

      return res.status(200).json({
        data: updated,
        meta: { timestamp: new Date().toISOString() },
      });
    }

    case 'DELETE': {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Athlete id is required for deletion.',
          code: 'MISSING_ATHLETE_ID',
        });
      }

      const exists = mockAthletes.some((a) => a.id === id);
      if (!exists) {
        return res.status(404).json({
          error: 'Not Found',
          message: `Athlete with id '${id}' not found.`,
          code: 'ATHLETE_NOT_FOUND',
        });
      }

      return res.status(200).json({
        data: { deleted: true, id },
        meta: { timestamp: new Date().toISOString() },
      });
    }

    default:
      res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
      return res.status(405).json({
        error: 'Method Not Allowed',
        message: `