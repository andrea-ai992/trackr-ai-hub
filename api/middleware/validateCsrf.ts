api/middleware/validateCsrf.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';

const CSRF_SECRET = process.env.CSRF_SECRET || 'fallback-secret-change-in-prod';
const CSRF_COOKIE_NAME = '__Host-csrf-token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const MUTATION_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

async function importKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

async function signToken(payload: string, secret: string): Promise<string> {
  const key = await importKey(secret);
  const encoder = new TextEncoder();
  const data = encoder.encode(payload);
  const signature = await crypto.subtle.sign('HMAC', key, data);
  const signatureArray = Array.from(new Uint8Array(signature));
  const signatureHex = signatureArray
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `${payload}.${signatureHex}`;
}

async function verifyToken(token: string, secret: string): Promise<boolean> {
  try {
    const lastDot = token.lastIndexOf('.');
    if (lastDot === -1) return false;

    const payload = token.substring(0, lastDot);
    const providedSig = token.substring(lastDot + 1);

    const key = await importKey(secret);
    const encoder = new TextEncoder();
    const data = encoder.encode(payload);
    const signature = await crypto.subtle.sign('HMAC', key, data);
    const signatureArray = Array.from(new Uint8Array(signature));
    const expectedSig = signatureArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSig.length !== providedSig.length) return false;

    let mismatch = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      mismatch |= expectedSig.charCodeAt(i) ^ providedSig.charCodeAt(i);
    }

    if (mismatch !== 0) return false;

    const parts = payload.split(':');
    if (parts.length < 2) return false;
    const expiry = parseInt(parts[parts.length - 1], 10);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    return true;
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce(
    (acc, pair) => {
      const idx = pair.indexOf('=');
      if (idx === -1) return acc;
      const key = pair.substring(0, idx).trim();
      const value = pair.substring(idx + 1).trim();
      acc[key] = decodeURIComponent(value);
      return acc;
    },
    {} as Record<string, string>
  );
}

export async function validateCsrf(
  req: VercelRequest,
  res: VercelResponse
): Promise<boolean> {
  const method = (req.method || 'GET').toUpperCase();

  if (!MUTATION_METHODS.has(method)) {
    return true;
  }

  const cookieHeader = req.headers['cookie'] as string | undefined;
  const cookies = parseCookies(cookieHeader);
  const cookieToken = cookies[CSRF_COOKIE_NAME];

  if (!cookieToken) {
    res.status(403).json({
      error: 'CSRF validation failed',
      message: 'Missing CSRF cookie',
      code: 'CSRF_COOKIE_MISSING',
    });
    return false;
  }

  const headerToken = req.headers[CSRF_HEADER_NAME] as string | undefined;

  if (!headerToken) {
    res.status(403).json({
      error: 'CSRF validation failed',
      message: `Missing ${CSRF_HEADER_NAME} header`,
      code: 'CSRF_HEADER_MISSING',
    });
    return false;
  }

  if (cookieToken !== headerToken) {
    res.status(403).json({
      error: 'CSRF validation failed',
      message: 'CSRF token mismatch between cookie and header',
      code: 'CSRF_TOKEN_MISMATCH',
    });
    return false;
  }

  const isValid = await verifyToken(cookieToken, CSRF_SECRET);

  if (!isValid) {
    res.status(403).json({
      error: 'CSRF validation failed',
      message: 'CSRF token is invalid or expired',
      code: 'CSRF_TOKEN_INVALID',
    });
    return false;
  }

  return true;
}

export async function generateCsrfToken(): Promise<string> {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  const randomHex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  const expiry = Date.now() + 60 * 60 * 1000;
  const payload = `${randomHex}:${expiry}`;
  return signToken(payload, CSRF_SECRET);
}

export function setCsrfCookie(res: VercelResponse, token: string): void {
  const cookieOptions = [
    `${CSRF_COOKIE_NAME}=${encodeURIComponent(token)}`,
    'HttpOnly',
    'SameSite=Strict',
    'Secure',
    'Path=/',
    'Max-Age=3600',
  ].join('; ');

  const existing = res.getHeader('Set-Cookie');
  if (Array.isArray(existing)) {
    res.setHeader('Set-Cookie', [...existing, cookieOptions]);
  } else if (typeof existing === 'string') {
    res.setHeader('Set-Cookie', [existing, cookieOptions]);
  } else {
    res.setHeader('Set-Cookie', cookieOptions);
  }
}

export function withCsrfProtection(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void> | void
) {
  return async (req: VercelRequest, res: VercelResponse): Promise<void> => {
    const isValid = await validateCsrf(req, res);
    if (!isValid) return;
    await handler(req, res);
  };
}