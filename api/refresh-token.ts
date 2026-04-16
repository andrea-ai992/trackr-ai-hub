```typescript
// src/lib/supabaseAuth.ts
import { createClient, Session, AuthChangeEvent } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('[supabaseAuth] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    // autoRefreshToken ENABLED — Supabase gère le refresh natif,
    // notre layer ajoute uniquement la persistance cookie Edge + retry
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'trackr-auth-token',
  },
});

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const REFRESH_RETRY_LIMIT = 3;
const REFRESH_RETRY_DELAY_MS = 2000;

let refreshTimer: ReturnType<typeof setTimeout> | null = null;
let isRefreshing = false;
let edgePersistInFlight = false;

// ─── Timer helpers ────────────────────────────────────────────────────────────

export function clearRefreshTimer(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

// ─── Token expiry ─────────────────────────────────────────────────────────────

export function getTokenExpiresInMs(session: Session): number {
  if (!session.expires_at) return Infinity; // pas d'expiry connue → ne pas forcer refresh
  return session.expires_at * 1000 - Date.now();
}

// ─── Edge cookie helpers ──────────────────────────────────────────────────────

async function persistRefreshTokenViaEdge(refreshToken: string): Promise<void> {
  if (edgePersistInFlight) return; // éviter les appels concurrents
  edgePersistInFlight = true;
  try {
    const response = await fetch('/api/refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      console.error('[supabaseAuth] Edge persist failed:', errorBody);
    }
  } catch (err) {
    console.error('[supabaseAuth] Edge persist network error:', err);
  } finally {
    edgePersistInFlight = false;
  }
}

async function revokeEdgeCookie(): Promise<void> {
  try {
    await fetch('/api/refresh-token', {
      method: 'DELETE',
      credentials: 'include',
    });
  } catch (err) {
    console.warn('[supabaseAuth] Failed to revoke edge cookie:', err);
  }
}

// ─── Refresh logic ────────────────────────────────────────────────────────────

async function attemptRefreshWithRetry(
  retries: number = REFRESH_RETRY_LIMIT
): Promise<Session | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn(
          `[supabaseAuth] Refresh attempt ${attempt}/${retries} failed:`,
          error.message
        );
        if (attempt < retries) {
          await delay(REFRESH_RETRY_DELAY_MS * attempt);
          continue;
        }
        return null;
      }
      if (data?.session) return data.session;
      return null;
    } catch (err) {
      console.error(`[supabaseAuth] Refresh attempt ${attempt} threw:`, err);
      if (attempt < retries) await delay(REFRESH_RETRY_DELAY_MS * attempt);
    }
  }
  return null;
}

export async function triggerSilentRefresh(): Promise<void> {
  if (isRefreshing) {
    console.info('[supabaseAuth] Refresh already in progress — skipping');
    return;
  }
  isRefreshing = true;
  console.info('[supabaseAuth] Starting silent token refresh');
  try {
    const newSession = await attemptRefreshWithRetry();
    if (!newSession) {
      console.error('[supabaseAuth] All refresh attempts exhausted — redirecting to login');
      redirectToLogin('Votre session a expiré. Veuillez vous reconnecter.');
      return;
    }
    console.info('[supabaseAuth] Token refreshed successfully');
    if (newSession.refresh_token) {
      await persistRefreshTokenViaEdge(newSession.refresh_token);
    }
    scheduleRefresh(newSession);
  } finally {
    isRefreshing = false;
  }
}

export function scheduleRefresh(session: Session): void {
  clearRefreshTimer();

  const expiresInMs = getTokenExpiresInMs(session);

  if (expiresInMs === Infinity) {
    console.info('[supabaseAuth] No expires_at on session — skipping schedule');
    return;
  }

  if (expiresInMs <= 0) {
    console.warn('[supabaseAuth] Session already expired — triggering immediate refresh');
    // Defer pour éviter appel synchrone depuis scheduleRefresh → triggerSilentRefresh → scheduleRefresh
    setTimeout(() => triggerSilentRefresh(), 0);
    return;
  }

  // Si déjà dans la fenêtre de refresh, déclencher immédiatement (différé)
  if (expiresInMs <= REFRESH_THRESHOLD_MS) {
    console.info('[supabaseAuth] Within refresh threshold — triggering deferred refresh');
    setTimeout(() => triggerSilentRefresh(), 0);
    return;
  }

  const delay = expiresInMs - REFRESH_THRESHOLD_MS;
  console.info(
    `[supabaseAuth] Scheduling refresh in ${Math.round(delay / 1000)}s ` +
      `(expires in ${Math.round(expiresInMs / 1000)}s)`
  );
  refreshTimer = setTimeout(() => triggerSilentRefresh(), delay);
}

// ─── Redirect ─────────────────────────────────────────────────────────────────

export function redirectToLogin(message?: string): void {
  clearRefreshTimer();
  const url = new URL('/login', window.location.origin);
  if (message) url.searchParams.set('error', message);
  window.location.replace(url.toString());
}

// ─── Session manager ──────────────────────────────────────────────────────────

export function initSessionManager(): () => void {
  let edgeSyncedForCurrentSession = false;

  const { data: authListener } = supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      console.info(`[supabaseAuth] Auth event: ${event}`);

      switch (event) {
        case 'SIGNED_IN': {
          edgeSyncedForCurrentSession = false; // reset sur nouvelle session
          if (session?.refresh_token && !edgeSyncedForCurrentSession) {
            edgeSyncedForCurrentSession = true;
            await persistRefreshTokenViaEdge(session.refresh_token);
          }
          if (session) scheduleRefresh(session);
          break;
        }

        case 'TOKEN_REFRESHED': {
          // autoRefreshToken=true peut déclencher cet event — on sync le cookie
          if (session?.refresh_token) {
            await persistRefreshTokenViaEdge(session.refresh_token);
          }
          if (session) scheduleRefresh(session);
          break;
        }

        case 'SIGNED_OUT': {
          clearRefreshTimer();
          // revokeEdgeCookie appelée ici uniquement (signOut() ne l'appelle plus)
          await revokeEdgeCookie();
          break;
        }

        case 'USER_UPDATED': {
          if (session) scheduleRefresh(session);
          break;
        }

        case 'PASSWORD_RECOVERY': {
          clearRefreshTimer();
          break;
        }

        default:
          break;
      }
    }
  );

  // Initialisation : vérifier la session existante au démarrage
  supabase.auth.getSession().then(({ data }) => {
    if (data?.session) {
      const expiresInMs = getTokenExpiresInMs(data.session);
      if (expiresInMs <= 0 || expiresInMs <= REFRESH_THRESHOLD_MS) {
        setTimeout(() => triggerSilentRefresh(), 0);
      } else {
        scheduleRefresh(data.session);
      }
    }
  });

  return () => {
    clearRefreshTimer();
    authListener.subscription.unsubscribe();
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function signOut(): Promise<void> {
  clearRefreshTimer();
  // Ne PAS appeler revokeEdgeCookie ici — onAuthStateChange(SIGNED_OUT) le fera
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error('[supabaseAuth] Sign out error:', error.message);
    // Forcer le nettoyage même en cas d'erreur Supabase
    await revokeEdgeCookie();
  }
  redirectToLogin();
}

export async function getCurrentSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('[supabaseAuth] getSession error:', error.message);
    return null;
  }
  return data?.session ?? null;
}

// ─── Utils ────────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

```typescript
// api/refresh-token.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import { serialize, parse } from 'cookie';

// ─── Config ───────────────────────────────────────────────────────────────────

const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const COOKIE_NAME = 'trackr_refresh_token';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 jours
const IS_PRODUCTION = process.env.VERCEL_ENV === 'production';

const ALLOWED_ORIGINS = [
  'https://trackr-app-nu.vercel.app',
  'http://localhost:5173',
  'http://localhost:4173',
];

// Fail-fast au démarrage du worker
if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('[refresh-token] FATAL: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
}

// ─── Admin client (instancié par requête pour éviter le state partagé) ────────

function createAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// ─── CORS ─────────────────────────────────────────────────────────────────────

function resolveAllowedOrigin(req: VercelRequest): string {
  const origin = (req.headers.origin as string) ?? '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://trackr-app-nu.vercel.app';
}

function setCorsHeaders(req: VercelRequest, res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', resolveAllowedOrigin(req));
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// ─── Cookie helpers ───────────────────────────────────────────────────────────

function setCookieHeader(res: VercelResponse, value: string, maxAge: number): void {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, value, {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'strict',
      path: '/',
      maxAge,
    })
  );
}

function clearCookieHeader(res: VercelResponse): void {
  res.setHeader(
    'Set-Cookie',
    serialize(COOKIE_NAME, '', {
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'strict',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    })
  );
}

// ─── Handlers ─────────────────────────────────────────────────────────────────

/**
 * POST /api/refresh-token
 * Body: { refresh_token: string }
 * Persiste le refresh_token dans un cookie httpOnly sécurisé.
 */
async function handlePost(req: VercelRequest, res: VercelResponse): Promise<void> {
  const body = req.body as Record<string, unknown> | undefined;
  const refreshToken = body?.refresh_token;

  if (typeof refreshToken !== 'string' || refreshToken.trim() === '') {
    res.status(400).json({ error: 'Missing or invalid refresh_token in request body' });
    return;
  }

  setCookieHeader(res, refreshToken.trim(), COOKIE_MAX_AGE_SECONDS);
  res.status(200).json({ success: true, message: 'Refresh token persisted securely' });
}

/**
 * GET /api/refresh-token
 * Lit le cookie, échange via Supabase admin, retourne la nouvelle session.
 * Met à jour le cookie avec le nouveau refresh_token.
 */
async function handleGet(req: VercelRequest, res: VercelResponse): Promise<void> {
  const cookies = parse((req.headers.cookie as string) ?? '');
  const storedToken = cookies[COOKIE_NAME];

  if (!storedToken) {
    res.status(401).json({
      error: 'No refresh token cookie found',
      redirect: '/login',
      errorMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
    });
    return;
  }

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    res.status(500).json({ error: 'Server misconfiguration' });
    return;
  }

  const adminClient = createAdminClient();
  const { data, error } = await adminClient.auth.refreshSession({
    refresh_token: storedToken,
  });

  if (error || !data?.session) {
    clearCookieHeader(res);
    res.status(401).json({
      error: 'Session refresh failed',
      detail: error?.message ?? 'No session returned',
      redirect: '/login',
      errorMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
    });
    return;
  }

  // Rotation du refresh_token — mettre à jour le cookie avec le nouveau token
  if (data.session.refresh_token) {
    setCookieHeader(res, data.session.refresh_token, COOKIE_MAX_AGE_SECONDS);
  }

  res.status(200).json({
    success: true,
    access_token: data.session.access_token,
    expires_at: data.session.expires_at,
    user: {
      id: data.session.user.id,
      email: data.session.user.email,
    },
  });
}

/**
 * DELETE /api/refresh-token
 * Révoque le cookie (logout côté Edge).
 */
async function handleDelete(_req: VercelRequest, res: VercelResponse): Promise<void> {
  clearCookieHeader(res);
  res.status(200).json({ success: true, message: 'Refresh token cookie cleared' });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  setCorsHeaders(req, res);

  // Preflight OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  try {
    switch (req.method) {
      case 'POST':
        await handlePost(req, res);
        break;
      case 'GET':
        await handleGet(req, res);
        break;
      case 'DELETE':
        await handleDelete(req, res);
        break;
      default:
        res.setHeader('Allow', 'GET, POST, DELETE, OPTIONS');
        res.status(405).json({ error: `Method ${req.method} not allowed` });
    }
  } catch (err) {
    console.error('[refresh-token] Unhandled error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
}