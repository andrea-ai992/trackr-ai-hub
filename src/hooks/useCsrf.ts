// api/csrf.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SECRET = process.env.CSRF_SECRET ?? 'fallback-secret-change-in-prod';

async function generateToken(): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(SECRET);

  // FIX: capturer le timestamp une seule fois
  const now = Date.now();
  const msgData = encoder.encode(now.toString());

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
  const hashArray = Array.from(new Uint8Array(signature));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

  // FIX: utiliser `now` capturé — pas un second Date.now()
  const payload = `${now}.${hashHex}`;
  return Buffer.from(payload).toString('base64url');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = await generateToken();
    const oneHourInSeconds = 3600;
    const expires = new Date(Date.now() + oneHourInSeconds * 1000).toUTCString();
    const isProduction = process.env.NODE_ENV === 'production';

    // FIX: cookie NON-HttpOnly pour que le JS puisse le lire et le mettre en header
    // (Double-submit cookie pattern : cookie lisible par JS + header X-CSRF-Token)
    // HttpOnly empêcherait useCsrf.ts de lire le cookie pour construire le header.
    // La protection vient de la vérification header === cookie côté serveur.
    res.setHeader(
      'Set-Cookie',
      `csrf_token=${token}; SameSite=Strict; Path=/; Expires=${expires};${
        isProduction ? ' Secure;' : ''
      }`
    );

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.setHeader('Pragma', 'no-cache');

    // Retourner aussi le token en JSON pour initialisation explicite dans useCsrf
    return res.status(200).json({ csrfToken: token });
  } catch (error) {
    console.error('[CSRF] Token generation failed:', error);
    return res.status(500).json({ error: 'Failed to generate CSRF token' });
  }
}

// api/middleware/validateCsrf.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

const SECRET = process.env.CSRF_SECRET ?? 'fallback-secret-change-in-prod';
const TOKEN_MAX_AGE_MS = 3600 * 1000;

async function verifyToken(token: string): Promise<boolean> {
  try {
    const decoded = Buffer.from(token, 'base64url').toString('utf-8');
    const [timestampStr, receivedHex] = decoded.split('.');

    if (!timestampStr || !receivedHex) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    if (Date.now() - timestamp > TOKEN_MAX_AGE_MS) return false;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(SECRET);
    const msgData = encoder.encode(timestampStr);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, msgData);
    const hashArray = Array.from(new Uint8Array(signature));
    const expectedHex = hashArray
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    if (receivedHex.length !== expectedHex.length) return false;

    // Comparaison en temps constant pour éviter les timing attacks
    let diff = 0;
    for (let i = 0; i < expectedHex.length; i++) {
      diff |= expectedHex.charCodeAt(i) ^ receivedHex.charCodeAt(i);
    }

    return diff === 0;
  } catch {
    return false;
  }
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce(
    (acc, pair) => {
      const [key, ...val] = pair.trim().split('=');
      if (key) acc[key.trim()] = val.join('=').trim();
      return acc;
    },
    {} as Record<string, string>
  );
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

export async function validateCsrf(
  req: VercelRequest,
  res: VercelResponse
): Promise<boolean> {
  const method = req.method?.toUpperCase() ?? '';

  if (!MUTATING_METHODS.has(method)) return true;

  // FIX: normaliser explicitement — Node HTTP headers sont déjà en minuscules
  const headerToken = req.headers['x-csrf-token'] as string | undefined;
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies['csrf_token'];

  if (!headerToken || !cookieToken) {
    res.status(403).json({
      error: 'CSRF token missing',
      code: 'CSRF_TOKEN_MISSING',
    });
    return false;
  }

  // Double-submit pattern : header doit correspondre au cookie
  if (headerToken !== cookieToken) {
    res.status(403).json({
      error: 'CSRF token mismatch',
      code: 'CSRF_TOKEN_MISMATCH',
    });
    return false;
  }

  // Vérification HMAC + expiry
  const isValid = await verifyToken(headerToken);

  if (!isValid) {
    res.status(403).json({
      error: 'CSRF token invalid or expired',
      code: 'CSRF_TOKEN_INVALID',
    });
    return false;
  }

  return true;
}

export function withCsrf(
  handler: (req: VercelRequest, res: VercelResponse) => Promise<void> | void
) {
  return async (req: VercelRequest, res: VercelResponse) => {
    const valid = await validateCsrf(req, res);
    if (!valid) return;
    return handler(req, res);
  };
}

// src/hooks/useCsrf.ts
import { useCallback, useEffect, useRef, useState } from 'react';

interface CsrfState {
  token: string | null;
  loading: boolean;
  error: string | null;
}

interface FetchOptions extends RequestInit {
  skipCsrf?: boolean;
}

const CSRF_ENDPOINT = '/api/csrf';
// Rafraîchissement à 55min (token expire à 60min côté serveur)
const TOKEN_TTL_MS = 55 * 60 * 1000;

// Singleton module-level pour partager le token entre instances du hook
let globalToken: string | null = null;
let globalTokenExpiry: number | null = null;
// FIX: promise de déduplication — conservée jusqu'à résolution/rejet
let globalFetchPromise: Promise<string> | null = null;

async function fetchCsrfToken(): Promise<string> {
  // FIX: si une requête est déjà en cours, attendre son résultat
  // sans créer une nouvelle promise — la nettoyer APRÈS que tous les
  // awaiters aient reçu le résultat (dans le catch/then de l'appelant)
  if (globalFetchPromise) return globalFetchPromise;

  globalFetchPromise = (async (): Promise<string> => {
    const response = await fetch(CSRF_ENDPOINT, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CSRF token: ${response.status}`);
    }

    const data: unknown = await response.json();

    if (
      !data ||
      typeof data !== 'object' ||
      !('csrfToken' in data) ||
      typeof (data as Record<string, unknown>).csrfToken !== 'string'
    ) {
      throw new Error('Invalid CSRF token response');
    }

    const token = (data as { csrfToken: string }).csrfToken;
    globalToken = token;
    globalTokenExpiry = Date.now() + TOKEN_TTL_MS;
    return token;
  })();

  // FIX: nettoyer globalFetchPromise après résolution ou rejet
  // pour permettre un prochain fetch en cas d'erreur
  return globalFetchPromise.finally(() => {
    globalFetchPromise = null;
  });
}

function isTokenExpired(): boolean {
  if (!globalToken || !globalTokenExpiry) return true;
  return Date.now() >= globalTokenExpiry;
}

async function getValidToken(): Promise<string> {
  if (!isTokenExpired() && globalToken) {
    return globalToken;
  }
  return fetchCsrfToken();
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'DELETE', 'PATCH']);

function isMutatingMethod(method: string | undefined): boolean {
  return MUTATING_METHODS.has((method ?? 'GET').toUpperCase());
}

export function useCsrf() {
  const [state, setState] = useState<CsrfState>({
    token: globalToken,
    loading: false,
    error: null,
  });

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Pré-charger le token au montage si absent ou expiré
  useEffect(() => {
    if (isTokenExpired()) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      getValidToken()
        .then((token) => {
          if (mountedRef.current) {
            setState({ token, loading: false, error: null });
          }
        })
        .catch((err: unknown) => {
          const message =
            err instanceof Error ? err.message : 'Unknown CSRF error';
          if (mountedRef.current) {
            setState((prev) => ({ ...prev, loading: false, error: message }));
          }
        });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const refreshToken = useCallback(async (): Promise<string> => {
    if (mountedRef.current) {
      setState((prev) => ({ ...prev, loading: true, error: null }));
    }

    try {
      // Invalider le token courant pour forcer un nouveau fetch
      globalToken = null;
      globalTokenExpiry = null;
      const token = await fetchCsrfToken();

      if (mountedRef.current) {
        setState({ token, loading: false, error: null });
      }

      return token;
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unknown CSRF error';

      if (mountedRef.current) {
        setState((prev) => ({ ...prev, loading: false, error: message }));
      }

      throw err;
    }
  }, []);

  const csrfFetch = useCallback(
    async (url: string, options: FetchOptions = {}): Promise<Response> => {
      const { skipCsrf = false, ...fetchOptions } = options;
      const method = fetchOptions.method ?? 'GET';

      // Requêtes non-mutantes : pas besoin de token CSRF
      if (skipCsrf || !isMutatingMethod(method)) {
        return fetch(url, { ...fetchOptions, credentials: 'same-origin' });
      }

      let token: string;
      try {
        token = await getValidToken();
      } catch (err) {
        console.error('[useCsrf] Failed to get CSRF token:', err);
        throw err;
      }

      const buildHeaders = (
        base: HeadersInit | undefined,
        csrfToken: string
      ): Headers => {
        const headers = new Headers(base);
        // FIX: utiliser le nom de header exact attendu par validateCsrf.ts
        headers.set('x-csrf-token', csrfToken);
        if (
          !headers.has('Content-Type') &&
          !(fetchOptions.body instanceof FormData)
        ) {
          headers.set('Content-Type', 'application/json');
        }
        return headers;
      };

      const response = await fetch(url, {
        ...fetchOptions,
        headers: buildHeaders(fetchOptions.headers, token),
        credentials: 'same-origin',
      });

      // Retry automatique si le token CSRF est rejeté (expiré, mismatch, absent)
      if (response.status === 403) {
        const cloned = response.clone();
        try {
          const data: unknown = await cloned.json();
          const csrfCodes = new Set([
            'CSRF_TOKEN_INVALID',
            'CSRF_TOKEN_MISMATCH',
            'CSRF_TOKEN_MISSING',
          ]);
          if (
            data &&
            typeof data === 'object' &&
            'code' in data &&
            csrfCodes.has((data as { code: string }).code)
          ) {
            console.warn('[useCsrf] CSRF token rejected, refreshing...');
            const newToken = await refreshToken();

            return fetch(url, {
              ...fetchOptions,
              headers: buildHeaders(fetchOptions.headers, newToken),
              credentials: 'same-origin',
            });
          }
        } catch {
          // Réponse non-JSON ou autre erreur 403 — retourner telle quelle
        }
      }

      return response;
    },
    [refreshToken]
  );

  // Wrapper POST typé pour usage courant
  const post = useCallback(
    async <T = unknown>(
      url: string,
      body: T,
      options: Omit<FetchOptions, 'method' | 'body'> = {}
    ): Promise<Response> => {
      return csrfFetch(url, {
        ...options,
        method: 'POST',
        body: JSON.stringify(body),
      });
    },
    [csrfFetch]
  );

  // Wrapper PUT typé
  const put = useCallback(
    async <T = unknown>(
      url: string,
      body: T,
      options: Omit<FetchOptions, 'method' | 'body'> = {}
    ): Promise<Response> => {
      return csrfFetch(url, {
        ...options,
        method: 'PUT',
        body: JSON.stringify(body),
      });
    },
    [csrfFetch]
  );

  // Wrapper DELETE
  const del = useCallback(
    async (
      url: string,
      options: Omit<FetchOptions, 'method'> = {}
    ): Promise<Response> => {
      return csrfFetch(url, { ...options, method: 'DELETE' });
    },
    [csrfFetch]
  );

  return {
    token: state.token,
    loading: state.loading,
    error: state.error,
    csrfFetch,
    refreshToken,
    post,
    put,
    del,
  };
}