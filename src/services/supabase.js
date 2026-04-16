import os
import base64
import requests
import json

GITHUB_TOKEN = os.environ.get('GITHUB_TOKEN')
REPO = 'andrea-ai992/trackr-ai-hub'
HEADERS = {
    'Authorization': f'token {GITHUB_TOKEN}',
    'Accept': 'application/vnd.github.v3+json'
}

def get_file_sha(path):
    url = f'https://api.github.com/repos/{REPO}/contents/{path}'
    response = requests.get(url, headers=HEADERS)
    if response.status_code == 200:
        return response.json().get('sha')
    return None

def push_file(path, content, message):
    url = f'https://api.github.com/repos/{REPO}/contents/{path}'
    sha = get_file_sha(path)
    
    data = {
        'message': message,
        'content': base64.b64encode(content.encode('utf-8')).decode('utf-8')
    }
    if sha:
        data['sha'] = sha
    
    response = requests.put(url, headers=HEADERS, json=data)
    return response.status_code, response.json()

# ============================================================
# src/services/supabase.js
# ============================================================
supabase_service = '''import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Trackr] Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'trackr-auth-token',
    storage: window.localStorage,
    flowType: 'pkce',
  },
  global: {
    headers: {
      'x-application-name': 'trackr-ai-hub',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

/**
 * Get the current session with fresh token validation
 */
export async function getValidSession() {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) throw error
  if (!session) return null

  const expiresAt = session.expires_at * 1000
  const now = Date.now()
  const fiveMinutes = 5 * 60 * 1000

  if (expiresAt - now < fiveMinutes) {
    const { data: { session: refreshed }, error: refreshError } =
      await supabase.auth.refreshSession()
    if (refreshError) throw refreshError
    return refreshed
  }

  return session
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })
  if (error) throw error
  return data
}

/**
 * Sign up with email and password
 */
export async function signUpWithEmail(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: metadata,
    },
  })
  if (error) throw error
  return data
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Send password reset email
 */
export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  )
  if (error) throw error
}

/**
 * Update user password
 */
export async function updatePassword(newPassword) {
  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  })
  if (error) throw error
  return data
}

/**
 * Get current user profile from profiles table
 */
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

/**
 * Upsert user profile
 */
export async function upsertUserProfile(profile) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
    .select()
    .single()
  if (error) throw error
  return data
}

export default supabase
'''

# ============================================================
# src/hooks/useAuthRefresh.js
# ============================================================
use_auth_refresh = '''import { useEffect, useRef, useCallback } from 'react'
import { supabase } from '../services/supabase'

const REFRESH_INTERVAL_MS = 60 * 1000      // check every 60 seconds
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000 // refresh 5 min before expiry
const LOGOUT_THRESHOLD_MS = 30 * 1000      // force logout if < 30 sec left

/**
 * useAuthRefresh
 *
 * Monitors the active Supabase session and:
 *  - Proactively refreshes the token 5 minutes before expiration
 *  - Forces logout if the token is about to expire (< 30 seconds)
 *  - Cleans up the interval on unmount or when the session ends
 *
 * @param {Function} onSessionExpired - callback invoked when logout is forced
 * @param {Function} onRefreshError   - callback invoked on refresh failure
 */
export function useAuthRefresh(onSessionExpired, onRefreshError) {
  const intervalRef = useRef(null)
  const isRefreshingRef = useRef(false)

  const checkAndRefreshSession = useCallback(async () => {
    if (isRefreshingRef.current) return
    isRefreshingRef.current = true

    try {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession()

      if (sessionError) {
        console.error('[useAuthRefresh] Session read error:', sessionError)
        onRefreshError?.(sessionError)
        return
      }

      if (!session) {
        // No active session — nothing to refresh
        return
      }

      const expiresAtMs = session.expires_at * 1000
      const now = Date.now()
      const timeLeft = expiresAtMs - now

      if (timeLeft <= LOGOUT_THRESHOLD_MS) {
        // Token is critically close to expiry — force logout
        console.warn('[useAuthRefresh] Token critically close to expiry. Logging out.')
        await supabase.auth.signOut()
        onSessionExpired?.('Session expired. Please log in again.')
        return
      }

      if (timeLeft <= REFRESH_THRESHOLD_MS) {
        // Proactively refresh the token
        console.info('[useAuthRefresh] Refreshing token proactively...')
        const { error: refreshError } = await supabase.auth.refreshSession()

        if (refreshError) {
          console.error('[useAuthRefresh] Token refresh failed:', refreshError)
          onRefreshError?.(refreshError)

          // If refresh failed and time is almost up, force logout
          if (timeLeft <= LOGOUT_THRESHOLD_MS * 2) {
            await supabase.auth.signOut()
            onSessionExpired?.('Session refresh failed. Please log in again.')
          }
        } else {
          console.info('[useAuthRefresh] Token refreshed successfully.')
        }
      }
    } catch (err) {
      console.error('[useAuthRefresh] Unexpected error:', err)
      onRefreshError?.(err)
    } finally {
      isRefreshingRef.current = false
    }
  }, [onSessionExpired, onRefreshError])

  useEffect(() => {
    // Run immediately on mount
    checkAndRefreshSession()

    // Then check on every interval
    intervalRef.current = setInterval(checkAndRefreshSession, REFRESH_INTERVAL_MS)

    // Also listen to Supabase auth state changes to reset interval when needed
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
          // Clear and restart the interval to align with the new session state
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
          }
          if (session) {
            intervalRef.current = setInterval(checkAndRefreshSession, REFRESH_INTERVAL_MS)
          }
        }

        if (event === 'SIGNED_OUT') {
          onSessionExpired?.('You have been signed out.')
        }
      }
    )

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      subscription.unsubscribe()
    }
  }, [checkAndRefreshSession, onSessionExpired])
}

export default useAuthRefresh
'''

# ============================================================
# src/context/AuthContext.jsx
# ============================================================
auth_context = '''import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase, signInWithEmail, signUpWithEmail, signOut as supabaseSignOut } from '../services/supabase'
import { useAuthRefresh } from '../hooks/useAuthRefresh'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [sessionMessage, setSessionMessage] = useState(null)
  const navigate = useNavigate()
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  // ── Bootstrap: load existing session on mount ──────────────────────────────
  useEffect(() => {
    async function loadSession() {
      try {
        const { data: { session: existingSession }, error } =
          await supabase.auth.getSession()

        if (error) throw error

        if (mountedRef.current) {
          setSession(existingSession)
          setUser(existingSession?.user ?? null)
        }
      } catch (err) {
        console.error('[AuthContext] Failed to load session:', err)
        if (mountedRef.current) {
          setAuthError(err.message)
        }
      } finally {
        if (mountedRef.current) {
          setLoading(false)
        }
      }
    }

    loadSession()
  }, [])

  // ── Listen to Supabase auth state changes ─────────────────────────────────
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mountedRef.current) return

        console.info('[AuthContext] Auth event:', event)

        setSession(newSession)
        setUser(newSession?.user ?? null)
        setAuthError(null)

        if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true })
        }

        if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password', { replace: true })
        }

        if (event === 'TOKEN_REFRESHED') {
          console.info('[AuthContext] Token refreshed via Supabase event.')
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])

  // ── Session expiry callbacks for useAuthRefresh ────────────────────────────
  const handleSessionExpired = useCallback((message) => {
    if (!mountedRef.current) return
    setSessionMessage(message || 'Your session has expired. Please log in again.')
    setUser(null)
    setSession(null)
    navigate('/login', { replace: true, state: { sessionExpired: true, message } })
  }, [navigate])

  const handleRefreshError = useCallback((error) => {
    if (!mountedRef.current) return
    console.error('[AuthContext] Refresh error:', error)
    setAuthError(error?.message || 'Authentication error occurred.')
  }, [])

  // ── Activate proactive token refresh ──────────────────────────────────────
  useAuthRefresh(handleSessionExpired, handleRefreshError)

  // ── Auth actions ───────────────────────────────────────────────────────────
  const login = useCallback(async (email, password) => {
    setAuthError(null)
    setLoading(true)
    try {
      const data = await signInWithEmail(email, password)
      return { success: true, data }
    } catch (err) {
      const message = err.message || 'Login failed. Please check your credentials.'
      setAuthError(message)
      return { success: false, error: message }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  const register = useCallback(async (email, password, metadata) => {
    setAuthError(null)
    setLoading(true)
    try {
      const data = await signUpWithEmail(email, password, metadata)
      return { success: true, data }
    } catch (err) {
      const message = err.message || 'Registration failed. Please try again.'
      setAuthError(message)
      return { success: false, error: message }
    } finally {
      if (mountedRef.current) setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setAuthError(null)
    try {
      await supabaseSignOut()
      setSessionMessage(null)
    } catch (err) {
      console.error('[AuthContext] Logout error:', err)
      // Force local clear even if remote signout fails
      setUser(null)
      setSession(null)
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const clearError = useCallback(() => setAuthError(null), [])
  const clearMessage = useCallback(() => setSessionMessage(null), [])

  const value = {
    user,
    session,
    loading,
    authError,
    sessionMessage,
    isAuthenticated: !!user && !!session,
    login,
    register,
    logout,
    clearError,
    clearMessage,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
'''

# ============================================================
# src/pages/Login.jsx
# ============================================================
login_page = '''import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [showPassword, setShowPassword] = useState(false)

  const { login, isAuthenticated, authError, clearError, sessionMessage, clearMessage } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = location.state?.from?.pathname || '/dashboard'
  const expiredMessage = location.state?.message

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true })
    }
  }, [isAuthenticated, navigate, from])

  useEffect(() => {
    return () => {
      clearError()
    }
  }, [clearError])

  const validateForm = () => {
    if (!email.trim()) return 'Email is required.'
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) return 'Please enter a valid email.'
    if (!password) return 'Password is required.'
    if (password.length < 6) return 'Password must be at least 6 characters.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLocalError(null)
    clearError()

    const validationError = validateForm()
    if (validationError) {
      setLocalError(validationError)
      return
    }

    setIsSubmitting(true)
    try {
      const result = await login(email, password)
      if (result.success) {
        clearMessage()
        navigate(from, { replace: true })
      } else {
        setLocalError(result.error)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const displayError = localError || authError
  const displayMessage = expiredMessage || sessionMessage

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2