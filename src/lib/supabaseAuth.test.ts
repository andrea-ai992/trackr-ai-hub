// src/lib/supabaseAuth.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ─── Env stubs AVANT tout import du module ───────────────────────────────────
vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');

// ─── Mock @supabase/supabase-js ───────────────────────────────────────────────
const mockUnsubscribe = vi.fn();
const mockAuth = {
  refreshSession: vi.fn(),
  getSession: vi.fn(),
  signOut: vi.fn(),
  onAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: mockUnsubscribe } },
  })),
};

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({ auth: mockAuth })),
}));

// ─── Import du module APRÈS les mocks ────────────────────────────────────────
import {
  persistRefreshTokenSecurely,
  clearRefreshTokenCookie,
  performSilentRefresh,
  scheduleProactiveRefresh,
  initAuthStateListener,
  ensureValidSession,
  getCurrentSession,
  signOut,
  setRedirectFn,
  getRedirectFn,
  REFRESH_TIMER_MAP,
  REFRESH_THRESHOLD_SECONDS,
} from './supabaseAuth';
import type { Session } from '@supabase/supabase-js';

// ─── Fetch global mock ────────────────────────────────────────────────────────
const fetchMock = vi.fn();
vi.stubGlobal('fetch', fetchMock);

// ─── window.location.href mock ────────────────────────────────────────────────
const hrefSetter = vi.fn();
Object.defineProperty(window, 'location', {
  value: { href: '' },
  writable: true,
});
Object.defineProperty(window.location, 'href', {
  get: () => '',
  set: hrefSetter,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function makeSession(overrides: {
  userId?: string;
  expiresAt?: number;
  refreshToken?: string;
} = {}): Session {
  const nowSeconds = Math.floor(Date.now() / 1000);
  return {
    user: {
      id: overrides.userId ?? 'user-123',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      created_at: '',
    },
    expires_at: overrides.expiresAt ?? nowSeconds + 3600,
    access_token: 'access-token',
    refresh_token: overrides.refreshToken ?? 'refresh-token',
    token_type: 'bearer',
  } as Session;
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe('supabaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    fetchMock.mockResolvedValue({ ok: true, text: async () => '' });
    REFRESH_TIMER_MAP.clear();
    // Réinitialise le redirect fn par défaut
    setRedirectFn((path, errorCode) => {
      const url = errorCode ? `${path}?error=${errorCode}` : path;
      window.location.href = url;
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    REFRESH_TIMER_MAP.clear();
  });

  // ── setRedirectFn / getRedirectFn ──────────────────────────────────────────
  describe('setRedirectFn / getRedirectFn', () => {
    it('returns the custom redirect function after setRedirectFn', () => {
      const customFn = vi.fn();
      setRedirectFn(customFn);
      expect(getRedirectFn()).toBe(customFn);
    });

    it('custom redirect fn is called with path and errorCode', () => {
      const customFn = vi.fn();
      setRedirectFn(customFn);
      getRedirectFn()('/login', 'REFRESH_FAILED');
      expect(customFn).toHaveBeenCalledWith('/login', 'REFRESH_FAILED');
    });
  });

  // ── persistRefreshTokenSecurely ───────────────────────────────────────────
  describe('persistRefreshTokenSecurely', () => {
    it('calls /api/auth/set-refresh-token with correct payload', async () => {
      await persistRefreshTokenSecurely('my-refresh-token');

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/set-refresh-token',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: 'my-refresh-token' }),
        })
      );
    });

    it('logs error but does not throw when API returns non-ok', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockResolvedValueOnce({ ok: false, text: async () => 'Unauthorized' });

      await expect(persistRefreshTokenSecurely('token')).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to persist refresh token'),
        expect.any(String)
      );
      consoleSpy.mockRestore();
    });

    it('logs error but does not throw on network failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockRejectedValueOnce(new Error('Network down'));

      await expect(persistRefreshTokenSecurely('token')).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network error persisting refresh token'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  // ── clearRefreshTokenCookie ───────────────────────────────────────────────
  describe('clearRefreshTokenCookie', () => {
    it('calls /api/auth/clear-refresh-token with POST and credentials', async () => {
      await clearRefreshTokenCookie();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/clear-refresh-token',
        expect.objectContaining({
          method: 'POST',
          credentials: 'include',
        })
      );
    });

    it('logs error but does not throw on network failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      fetchMock.mockRejectedValueOnce(new Error('Network down'));

      await expect(clearRefreshTokenCookie()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to clear refresh token cookie'),
        expect.any(Error)
      );
      consoleSpy.mockRestore();
    });
  });

  // ── performSilentRefresh ──────────────────────────────────────────────────
  describe('performSilentRefresh', () => {
    it('returns new session on successful refresh', async () => {
      const session = makeSession();
      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session },
        error: null,
      });

      const result = await performSilentRefresh();

      expect(result).toBe(session);
      expect(mockAuth.refreshSession).toHaveBeenCalledOnce();
    });

    it('persists refresh token after successful refresh', async () => {
      const session = makeSession({ refreshToken: 'new-refresh-token' });
      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session },
        error: null,
      });

      await performSilentRefresh();

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/set-refresh-token',
        expect.objectContaining({
          body: JSON.stringify({ refresh_token: 'new-refresh-token' }),
        })
      );
    });

    it('redirects to /login with REFRESH_FAILED when Supabase returns error', async () => {
      const redirectFn = vi.fn();
      setRedirectFn(redirectFn);

      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Token expired' },
      });

      const result = await performSilentRefresh();

      expect(result).toBeNull();
      expect(redirectFn).toHaveBeenCalledWith('/login', 'REFRESH_FAILED');
    });

    it('redirects to /login with SESSION_EXPIRED when session is null without error', async () => {
      const redirectFn = vi.fn();
      setRedirectFn(redirectFn);

      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const result = await performSilentRefresh();

      expect(result).toBeNull();
      expect(redirectFn).toHaveBeenCalledWith('/login', 'SESSION_EXPIRED');
    });

    it('redirects to /login with UNKNOWN_ERROR on unexpected throw', async () => {
      const redirectFn = vi.fn();
      setRedirectFn(redirectFn);

      mockAuth.refreshSession.mockRejectedValueOnce(new Error('Unexpected'));

      const result = await performSilentRefresh();

      expect(result).toBeNull();
      expect(redirectFn).toHaveBeenCalledWith('/login', 'UNKNOWN_ERROR');
    });
  });

  // ── scheduleProactiveRefresh ──────────────────────────────────────────────
  describe('scheduleProactiveRefresh', () => {
    it('schedules a timer for a session expiring in future', () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      scheduleProactiveRefresh(session);

      expect(REFRESH_TIMER_MAP.has('user-123')).toBe(true);
    });

    it('replaces existing timer when called again for same user', () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      scheduleProactiveRefresh(session);
      const firstTimer = REFRESH_TIMER_MAP.get('user-123');

      scheduleProactiveRefresh(session);
      const secondTimer = REFRESH_TIMER_MAP.get('user-123');

      expect(secondTimer).not.toBe(firstTimer);
      expect(REFRESH_TIMER_MAP.size).toBe(1);
    });

    it('triggers immediate refresh when session is within threshold', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      // expires in 2 minutes — within the 5-minute threshold
      const session = makeSession({ expiresAt: nowSeconds + 120 });
      const newSession = makeSession({ expiresAt: nowSeconds + 3600 });

      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session: newSession },
        error: null,
      });

      scheduleProactiveRefresh(session);
      await vi.runAllTimersAsync();

      expect(mockAuth.refreshSession).toHaveBeenCalled();
    });

    it('triggers refresh when timer fires and reschedules on success', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });
      const newSession = makeSession({ expiresAt: nowSeconds + 7200 });

      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session: newSession },
        error: null,
      });

      scheduleProactiveRefresh(session);

      // Advance time to just after the refresh point
      const refreshInMs = (3600 - REFRESH_THRESHOLD_SECONDS) * 1000;
      await vi.advanceTimersByTimeAsync(refreshInMs + 100);

      expect(mockAuth.refreshSession).toHaveBeenCalledOnce();
      // New timer should be scheduled for newSession
      expect(REFRESH_TIMER_MAP.has('user-123')).toBe(true);
    });

    it('does not reschedule after failed refresh', async () => {
      const redirectFn = vi.fn();
      setRedirectFn(redirectFn);

      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Refresh failed' },
      });

      scheduleProactiveRefresh(session);

      const refreshInMs = (3600 - REFRESH_THRESHOLD_SECONDS) * 1000;
      await vi.advanceTimersByTimeAsync(refreshInMs + 100);

      expect(REFRESH_TIMER_MAP.has('user-123')).toBe(false);
      expect(redirectFn).toHaveBeenCalledWith('/login', 'REFRESH_FAILED');
    });
  });

  // ── initAuthStateListener ─────────────────────────────────────────────────
  describe('initAuthStateListener', () => {
    it('registers onAuthStateChange listener and returns unsubscribe fn', () => {
      const cleanup = initAuthStateListener();

      expect(mockAuth.onAuthStateChange).toHaveBeenCalledOnce();
      expect(typeof cleanup).toBe('function');

      cleanup();
      expect(mockUnsubscribe).toHaveBeenCalledOnce();
    });

    it('schedules proactive refresh on SIGNED_IN event', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      initAuthStateListener();

      const callback = mockAuth.onAuthStateChange.mock.calls[0][0];
      await callback('SIGNED_IN', session);

      expect(REFRESH_TIMER_MAP.has('user-123')).toBe(true);
    });

    it('schedules proactive refresh on TOKEN_REFRESHED event', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      initAuthStateListener();

      const callback = mockAuth.onAuthStateChange.mock.calls[0][0];
      await callback('TOKEN_REFRESHED', session);

      expect(REFRESH_TIMER_MAP.has('user-123')).toBe(true);
    });

    it('persists refresh token on SIGNED_IN', async () => {
      const session = makeSession({ refreshToken: 'tok-signed-in' });

      initAuthStateListener();

      const callback = mockAuth.onAuthStateChange.mock.calls[0][0];
      await callback('SIGNED_IN', session);

      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/set-refresh-token',
        expect.objectContaining({
          body: JSON.stringify({ refresh_token: 'tok-signed-in' }),
        })
      );
    });

    it('clears timers and cookie on SIGNED_OUT', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      // Pre-populate a timer
      scheduleProactiveRefresh(session);
      expect(REFRESH_TIMER_MAP.size).toBe(1);

      initAuthStateListener();
      const callback = mockAuth.onAuthStateChange.mock.calls[0][0];
      await callback('SIGNED_OUT', null);

      expect(REFRESH_TIMER_MAP.size).toBe(0);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/clear-refresh-token',
        expect.objectContaining({ method: 'POST' })
      );
    });

    it('schedules proactive refresh on USER_UPDATED', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      initAuthStateListener();

      const callback = mockAuth.onAuthStateChange.mock.calls[0][0];
      await callback('USER_UPDATED', session);

      expect(REFRESH_TIMER_MAP.has('user-123')).toBe(true);
    });

    it('clears all timers on cleanup', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });

      scheduleProactiveRefresh(session);
      expect(REFRESH_TIMER_MAP.size).toBe(1);

      const cleanup = initAuthStateListener();
      cleanup();

      expect(REFRESH_TIMER_MAP.size).toBe(0);
    });
  });

  // ── getCurrentSession ─────────────────────────────────────────────────────
  describe('getCurrentSession', () => {
    it('returns session when Supabase returns one', async () => {
      const session = makeSession();
      mockAuth.getSession.mockResolvedValueOnce({ data: { session }, error: null });

      const result = await getCurrentSession();
      expect(result).toBe(session);
    });

    it('returns null and logs error on Supabase error', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'DB error' },
      });

      const result = await getCurrentSession();
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('getSession error'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });

    it('returns null when no session exists', async () => {
      mockAuth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });

      const result = await getCurrentSession();
      expect(result).toBeNull();
    });
  });

  // ── ensureValidSession ────────────────────────────────────────────────────
  describe('ensureValidSession', () => {
    it('returns session when valid and not near expiry', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });
      mockAuth.getSession.mockResolvedValueOnce({ data: { session }, error: null });

      const result = await ensureValidSession();
      expect(result).toBe(session);
    });

    it('redirects to /login when no session', async () => {
      const redirectFn = vi.fn();
      setRedirectFn(redirectFn);
      mockAuth.getSession.mockResolvedValueOnce({ data: { session: null }, error: null });

      const result = await ensureValidSession();
      expect(result).toBeNull();
      expect(redirectFn).toHaveBeenCalledWith('/login', 'SESSION_EXPIRED');
    });

    it('proactively refreshes when session is near expiry', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      // Expires in 2 minutes — within the 5-minute threshold
      const expiredSoon = makeSession({ expiresAt: nowSeconds + 120 });
      const newSession = makeSession({ expiresAt: nowSeconds + 3600 });

      mockAuth.getSession.mockResolvedValueOnce({ data: { session: expiredSoon }, error: null });
      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session: newSession },
        error: null,
      });

      const result = await ensureValidSession();
      expect(mockAuth.refreshSession).toHaveBeenCalledOnce();
      expect(result).toBe(newSession);
    });

    it('returns null and redirects when near-expiry refresh fails', async () => {
      const redirectFn = vi.fn();
      setRedirectFn(redirectFn);

      const nowSeconds = Math.floor(Date.now() / 1000);
      const expiredSoon = makeSession({ expiresAt: nowSeconds + 120 });

      mockAuth.getSession.mockResolvedValueOnce({ data: { session: expiredSoon }, error: null });
      mockAuth.refreshSession.mockResolvedValueOnce({
        data: { session: null },
        error: { message: 'Refresh failed' },
      });

      const result = await ensureValidSession();
      expect(result).toBeNull();
      expect(redirectFn).toHaveBeenCalledWith('/login', 'REFRESH_FAILED');
    });
  });

  // ── signOut ───────────────────────────────────────────────────────────────
  describe('signOut', () => {
    it('clears timers, calls clearRefreshTokenCookie and supabase.auth.signOut', async () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const session = makeSession({ expiresAt: nowSeconds + 3600 });
      scheduleProactiveRefresh(session);
      expect(REFRESH_TIMER_MAP.size).toBe(1);

      mockAuth.signOut.mockResolvedValueOnce({ error: null });

      await signOut();

      expect(REFRESH_TIMER_MAP.size).toBe(0);
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/auth/clear-refresh-token',
        expect.objectContaining({ method: 'POST' })
      );
      expect(mockAuth.signOut).toHaveBeenCalledOnce();
    });

    it('logs error but does not throw when supabase.auth.signOut fails', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockAuth.signOut.mockResolvedValueOnce({ error: { message: 'Sign out failed' } });

      await expect(signOut()).resolves.toBeUndefined();

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Sign out error'),
        expect.anything()
      );
      consoleSpy.mockRestore();
    });
  });
});