```typescript
// src/lib/supabaseAuth.ts
import { createClient, Session, AuthChangeEvent, User } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('[supabaseAuth] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: false,
    detectSessionInUrl: true,
    storageKey: 'trackr-auth-token',
  },
})

export const REFRESH_THRESHOLD_MS = 5 * 60 * 1000

let refreshTimer: ReturnType<typeof setTimeout> | null = null

function clearRefreshTimer(): void {
  if (refreshTimer !== null) {
    clearTimeout(refreshTimer)
    refreshTimer = null
  }
}

function getTokenExpiresInMs(session: Session): number {
  const expiresAt = session.expires_at
  if (!expiresAt) return 0
  return expiresAt * 1000 - Date.now()
}

async function persistRefreshTokenViaEdge(refreshToken: string): Promise<void> {
  try {
    const response = await fetch('/api/auth/set-refresh-token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refresh_token: refreshToken }),
    })
    if (!response.ok) {
      const body = await response.text()
      console.error('[supabaseAuth] Failed to persist refresh_token via Edge Function:', body)
    }
  } catch (err) {
    console.error('[supabaseAuth] Network error persisting refresh_token:', err)
  }
}

async function clearRefreshTokenViaEdge(): Promise<void> {
  try {
    await fetch('/api/auth/clear-refresh-token', {
      method: 'POST',
      credentials: 'include',
    })
  } catch (err) {
    console.error('[supabaseAuth] Error clearing refresh_token cookie:', err)
  }
}

export type AuthErrorCode =
  | 'REFRESH_FAILED'
  | 'SESSION_EXPIRED'
  | 'NETWORK_ERROR'
  | 'UNKNOWN'

export interface AuthRedirectOptions {
  code: AuthErrorCode
  message: string
}

function redirectToLogin(options: AuthRedirectOptions): void {
  clearRefreshTimer()
  const params = new URLSearchParams({
    error: options.code,
    message: options.message,
  })
  window.location.href = `/login?${params.toString()}`
}

export async function silentRefresh(currentSession?: Session | null): Promise<Session | null> {
  try {
    const { data, error } = await supabase.auth.refreshSession(
      currentSession?.refresh_token
        ? { refresh_token: currentSession.refresh_token }
        : undefined
    )

    if (error || !data.session) {
      console.warn('[supabaseAuth] Silent refresh failed:', error?.message)
      redirectToLogin({
        code: 'REFRESH_FAILED',
        message: error?.message ?? 'Your session could not be refreshed. Please sign in again.',
      })
      return null
    }

    const newSession = data.session
    if (newSession.refresh_token) {
      await persistRefreshTokenViaEdge(newSession.refresh_token)
    }

    scheduleRefresh(newSession)
    return newSession
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unexpected error during token refresh.'
    console.error('[supabaseAuth] Unexpected error during silent refresh:', message)
    redirectToLogin({
      code: 'NETWORK_ERROR',
      message,
    })
    return null
  }
}

export function scheduleRefresh(session: Session): void {
  clearRefreshTimer()

  const expiresInMs = getTokenExpiresInMs(session)
  const refreshInMs = expiresInMs - REFRESH_THRESHOLD_MS

  if (refreshInMs <= 0) {
    console.warn('[supabaseAuth] Session already expired or within threshold — refreshing immediately')
    void silentRefresh(session)
    return
  }

  console.info(`[supabaseAuth] Scheduling token refresh in ${Math.round(refreshInMs / 1000)}s`)
  refreshTimer = setTimeout(() => {
    void silentRefresh(session)
  }, refreshInMs)
}

export function initAuthStateListener(): () => void {
  // Bootstrap: schedule refresh for any existing session at startup
  void supabase.auth.getSession().then(({ data }) => {
    if (data.session) {
      scheduleRefresh(data.session)
    }
  })

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      console.info(`[supabaseAuth] Auth event: ${event}`)

      switch (event) {
        case 'SIGNED_IN':
        case 'TOKEN_REFRESHED': {
          if (!session) break
          if (session.refresh_token) {
            await persistRefreshTokenViaEdge(session.refresh_token)
          }
          scheduleRefresh(session)
          break
        }

        case 'SIGNED_OUT': {
          clearRefreshTimer()
          await clearRefreshTokenViaEdge()
          break
        }

        case 'USER_UPDATED': {
          if (!session) break
          scheduleRefresh(session)
          break
        }

        default:
          break
      }
    }
  )

  return () => {
    clearRefreshTimer()
    subscription.unsubscribe()
  }
}

export async function signOut(): Promise<void> {
  clearRefreshTimer()
  await clearRefreshTokenViaEdge()
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('[supabaseAuth] Sign out error:', error.message)
  }
}

export async function getUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser()
  if (error) {
    console.warn('[supabaseAuth] getUser error:', error.message)
    return null
  }
  return data.user
}

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) {
    console.warn('[supabaseAuth] getSession error:', error.message)
    return null
  }
  return data.session
}

// Exported only for unit testing — do not use in application code
export { clearRefreshTimer as __testOnly_clearRefreshTimer }
```

```typescript
// src/lib/supabaseAuth.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ─── Mocks must be declared before any import of the module under test ───────

const mockSubscription = { unsubscribe: vi.fn() }
const mockOnAuthStateChange = vi.fn(() => ({ data: { subscription: mockSubscription } }))
const mockRefreshSession = vi.fn()
const mockSignOut = vi.fn()
const mockGetUser = vi.fn()
const mockGetSession = vi.fn()

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      onAuthStateChange: mockOnAuthStateChange,
      refreshSession: mockRefreshSession,
      signOut: mockSignOut,
      getUser: mockGetUser,
      getSession: mockGetSession,
    },
  })),
}))

vi.stubGlobal('import.meta', {
  env: {
    VITE_SUPABASE_URL: 'https://fake.supabase.co',
    VITE_SUPABASE_ANON_KEY: 'fake-anon-key',
  },
})

const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

const mockLocation = { href: '' }
vi.stubGlobal('window', { location: mockLocation })

// ─── Helpers ─────────────────────────────────────────────────────────────────

import type { Session } from '@supabase/supabase-js'

function makeSession(
  overrides: Partial<{
    expires_at: number
    refresh_token: string
    access_token: string
  }> = {}
): Session {
  return {
    access_token: overrides.access_token ?? 'access-token-123',
    refresh_token: overrides.refresh_token ?? 'refresh-token-abc',
    expires_at: overrides.expires_at ?? Math.floor((Date.now() + 3600 * 1000) / 1000),
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-id-1',
      email: 'test@trackr.ai',
      aud: 'authenticated',
      role: 'authenticated',
      created_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
    },
  } as Session
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('supabaseAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
    mockFetch.mockResolvedValue({ ok: true, text: async () => 'ok' })
    mockLocation.href = ''
    // Default getSession returns null (no existing session at boot)
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // ── REFRESH_THRESHOLD_MS ───────────────────────────────────────────────────

  describe('REFRESH_THRESHOLD_MS', () => {
    it('should be 5 minutes in milliseconds', async () => {
      const { REFRESH_THRESHOLD_MS } = await import('./supabaseAuth')
      expect(REFRESH_THRESHOLD_MS).toBe(5 * 60 * 1000)
    })
  })

  // ── scheduleRefresh ────────────────────────────────────────────────────────

  describe('scheduleRefresh', () => {
    it('should schedule a refresh before token expiry', async () => {
      const { scheduleRefresh, supabase, REFRESH_THRESHOLD_MS } = await import('./supabaseAuth')

      const expiresAt = Math.floor((Date.now() + 10 * 60 * 1000) / 1000)
      const session = makeSession({ expires_at: expiresAt })

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: makeSession(), user: session.user },
        error: null,
      } as any)

      scheduleRefresh(session)

      const expectedDelay = 10 * 60 * 1000 - REFRESH_THRESHOLD_MS

      vi.advanceTimersByTime(expectedDelay - 100)
      await Promise.resolve()
      expect(supabase.auth.refreshSession).not.toHaveBeenCalled()

      vi.advanceTimersByTime(200)
      await Promise.resolve()
      await Promise.resolve()
      expect(supabase.auth.refreshSession).toHaveBeenCalledOnce()
    })

    it('should refresh immediately if session is already within threshold', async () => {
      const { scheduleRefresh, supabase } = await import('./supabaseAuth')

      const expiresAt = Math.floor((Date.now() + 2 * 60 * 1000) / 1000)
      const session = makeSession({ expires_at: expiresAt })

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: makeSession(), user: session.user },
        error: null,
      } as any)

      scheduleRefresh(session)

      await Promise.resolve()
      await Promise.resolve()
      expect(supabase.auth.refreshSession).toHaveBeenCalledOnce()
    })

    it('should cancel previous timer when called twice', async () => {
      const { scheduleRefresh, supabase, REFRESH_THRESHOLD_MS } = await import('./supabaseAuth')

      const session = makeSession({
        expires_at: Math.floor((Date.now() + 10 * 60 * 1000) / 1000),
      })

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: makeSession(), user: session.user },
        error: null,
      } as any)

      scheduleRefresh(session)
      scheduleRefresh(session) // second call cancels first

      vi.advanceTimersByTime(10 * 60 * 1000 - REFRESH_THRESHOLD_MS + 200)
      await Promise.resolve()
      await Promise.resolve()

      // Only one call despite two scheduleRefresh invocations
      expect(supabase.auth.refreshSession).toHaveBeenCalledOnce()
    })
  })

  // ── silentRefresh ──────────────────────────────────────────────────────────

  describe('silentRefresh', () => {
    it('should call refreshSession and persist refresh token on success', async () => {
      const { silentRefresh, supabase } = await import('./supabaseAuth')
      const session = makeSession()
      const newSession = makeSession({ refresh_token: 'new-refresh-token' })

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: newSession, user: newSession.user },
        error: null,
      } as any)

      const result = await silentRefresh(session)

      expect(result).toEqual(newSession)
      expect(supabase.auth.refreshSession).toHaveBeenCalledWith({
        refresh_token: session.refresh_token,
      })
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/set-refresh-token',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ refresh_token: 'new-refresh-token' }),
        })
      )
    })

    it('should redirect to /login on refresh failure', async () => {
      const { silentRefresh, supabase } = await import('./supabaseAuth')
      const session = makeSession()

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: null, user: null },
        error: { message: 'Token expired', name: 'AuthApiError', status: 401 },
      } as any)

      const result = await silentRefresh(session)

      expect(result).toBeNull()
      expect(mockLocation.href).toContain('/login')
      expect(mockLocation.href).toContain('REFRESH_FAILED')
    })

    it('should redirect with NETWORK_ERROR on thrown exception', async () => {
      const { silentRefresh, supabase } = await import('./supabaseAuth')
      const session = makeSession()

      vi.mocked(supabase.auth.refreshSession).mockRejectedValue(new Error('Network failure'))

      const result = await silentRefresh(session)

      expect(result).toBeNull()
      expect(mockLocation.href).toContain('NETWORK_ERROR')
      expect(mockLocation.href).toContain('Network+failure')
    })
  })

  // ── initAuthStateListener ──────────────────────────────────────────────────

  describe('initAuthStateListener', () => {
    it('should subscribe to auth state changes and return an unsubscribe function', async () => {
      const { initAuthStateListener } = await import('./supabaseAuth')

      const unsubscribe = initAuthStateListener()

      expect(mockOnAuthStateChange).toHaveBeenCalledOnce()
      expect(typeof unsubscribe).toBe('function')

      unsubscribe()
      expect(mockSubscription.unsubscribe).toHaveBeenCalledOnce()
    })

    it('should schedule refresh on SIGNED_IN event', async () => {
      const { initAuthStateListener, supabase, REFRESH_THRESHOLD_MS } = await import('./supabaseAuth')

      initAuthStateListener()

      const [[_event, callback]] = mockOnAuthStateChange.mock.calls as any
      const session = makeSession({
        expires_at: Math.floor((Date.now() + 10 * 60 * 1000) / 1000),
      })

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: makeSession(), user: session.user },
        error: null,
      } as any)

      await callback('SIGNED_IN', session)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/set-refresh-token',
        expect.objectContaining({ method: 'POST' })
      )

      vi.advanceTimersByTime(10 * 60 * 1000 - REFRESH_THRESHOLD_MS + 200)
      await Promise.resolve()
      await Promise.resolve()
      expect(supabase.auth.refreshSession).toHaveBeenCalledOnce()
    })

    it('should clear timer and cookie on SIGNED_OUT event', async () => {
      const { initAuthStateListener } = await import('./supabaseAuth')

      initAuthStateListener()

      const [[_event, callback]] = mockOnAuthStateChange.mock.calls as any
      await callback('SIGNED_OUT', null)

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/clear-refresh-token',
        expect.objectContaining({ method: 'POST' })
      )
    })

    it('should schedule refresh for existing session on boot', async () => {
      const existingSession = makeSession({
        expires_at: Math.floor((Date.now() + 10 * 60 * 1000) / 1000),
      })
      mockGetSession.mockResolvedValue({
        data: { session: existingSession },
        error: null,
      })

      const { initAuthStateListener, supabase, REFRESH_THRESHOLD_MS } = await import('./supabaseAuth')

      vi.mocked(supabase.auth.refreshSession).mockResolvedValue({
        data: { session: makeSession(), user: existingSession.user },
        error: null,
      } as any)

      initAuthStateListener()

      // Let the getSession promise resolve
      await Promise.resolve()
      await Promise.resolve()

      vi.advanceTimersByTime(10 * 60 * 1000 - REFRESH_THRESHOLD_MS + 200)
      await Promise.resolve()
      await Promise.resolve()

      expect(supabase.auth.refreshSession).toHaveBeenCalledOnce()
    })
  })

  // ── signOut ────────────────────────────────────────────────────────────────

  describe('signOut', () => {
    it('should clear cookie and call supabase.auth.signOut', async () => {
      const { signOut, supabase } = await import('./supabaseAuth')

      vi.mocked(supabase.auth.signOut).mockResolvedValue({ error: null })

      await signOut()

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/auth/clear-refresh-token',
        expect.objectContaining({ method: 'POST' })
      )
      expect(supabase.auth.signOut).toHaveBeenCalledOnce()
    })

    it('should log error but not throw if signOut fails', async () => {
      const { signOut, supabase } = await import('./supabaseAuth')
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(supabase.auth.signOut).mockResolvedValue({
        error: { message: 'Sign out error', name: 'AuthApiError', status: 500 },
      } as any)

      await expect(signOut()).resolves.toBeUndefined()
      expect(consoleSpy).toHaveBeenCalledWith(
        '[supabaseAuth] Sign out error:',
        'Sign out error'
      )
      consoleSpy.mockRestore()
    })
  })

  // ── getUser ────────────────────────────────────────────────────────────────

  describe('getUser', () => {
    it('should return user on success', async () => {
      const { getUser, supabase } = await import('./supabaseAuth')
      const user = makeSession().user

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user },
        error: null,
      } as any)

      const result = await getUser()
      expect(result).toEqual(user)
    })

    it('should return null and warn on error', async () => {
      const { getUser, supabase } = await import('./supabaseAuth')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated', name: 'AuthApiError', status: 401 },
      } as any)

      const result = await getUser()
      expect(result).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith('[supabaseAuth] getUser error:', 'Not authenticated')
      warnSpy.mockRestore()
    })
  })

  // ── getSession ─────────────────────────────────────────────────────────────

  describe('getSession', () => {
    it('should return session on success', async () => {
      const { getSession, supabase } = await import('./supabaseAuth')
      const session = makeSession()

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session },
        error: null,
      } as any)

      const result = await getSession()
      expect(result).toEqual(session)
    })

    it('should return null and warn on error', async () => {
      const { getSession, supabase } = await import('./supabaseAuth')
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

      vi.mocked(supabase.auth.getSession).mockResolvedValue({
        data: { session: null },
        error: { message: 'Session error', name: 'AuthApiError', status: 500 },
      } as any)

      const result = await getSession()
      expect(result).toBeNull()
      expect(warnSpy).toHaveBeenCalledWith('[supabaseAuth] getSession error:', 'Session error')
      warnSpy.mockRestore()
    })
  })
})