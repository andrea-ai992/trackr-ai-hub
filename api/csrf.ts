api/csrf.ts

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { subtle, getRandomValues } from 'crypto';

const SECRET = process.env.CSRF_SECRET ?? 'changeme-set-CSRF_SECRET-in-env';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

async function getSecretKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = encoder.encode(SECRET);
  return subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

export async function generateCsrfToken(): Promise<string> {
  const randomBytes = new Uint8Array(32);
  getRandomValues(randomBytes);
  const random = Buffer.from(randomBytes).toString('hex');
  const expires = Date.now() + TOKEN_EXPIRY_MS;
  const payload = `${random}.${expires}`;

  const key = await getSecretKey();
  const encoder = new TextEncoder();
  const signature = await subtle.sign('HMAC', key, encoder.encode(payload));
  const sigHex = Buffer.from(signature).toString('hex');

  return `${payload}.${sigHex}`;
}

export async function verifyCsrfToken(token: string): Promise<boolean> {
  if (!token || typeof token !== 'string') return false;

  const parts = token.split('.');
  if (parts.length !== 3) return false;

  const [random, expiresStr, sigHex] = parts;
  const expires = parseInt(expiresStr, 10);

  if (isNaN(expires) || Date.now() > expires) return false;

  const payload = `${random}.${expiresStr}`;
  const key = await getSecretKey();
  const encoder = new TextEncoder();

  let signatureBuffer: ArrayBuffer;
  try {
    signatureBuffer = Buffer.from(sigHex, 'hex');
  } catch {
    return false;
  }

  try {
    const valid = await subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(payload)
    );
    return valid;
  } catch {
    return false;
  }
}

function serializeCookie(name: string, value: string, options: {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
  maxAge?: number;
  path?: string;
}): string {
  let cookie = `${name}=${encodeURIComponent(value)}`;
  if (options.httpOnly) cookie += '; HttpOnly';
  if (options.secure) cookie += '; Secure';
  if (options.sameSite) cookie += `; SameSite=${options.sameSite}`;
  if (options.maxAge !== undefined) cookie += `; Max-Age=${options.maxAge}`;
  if (options.path) cookie += `; Path=${options.path}`;
  return cookie;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN ?? '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const token = await generateCsrfToken();
    const isProduction = process.env.NODE_ENV === 'production';

    const cookieHeader = serializeCookie('csrf_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'Strict',
      maxAge: Math.floor(TOKEN_EXPIRY_MS / 1000),
      path: '/',
    });

    res.setHeader('Set-Cookie', cookieHeader);
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    res.status(200).json({
      token,
      expiresIn: TOKEN_EXPIRY_MS / 1000,
    });
  } catch (error) {
    console.error('[CSRF] Token generation failed:', error);
    res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
}