src/hooks/useAuthRefresh.js

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '../services/supabase';

const REFRESH_THRESHOLD_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

export function useAuthRefresh({ onSessionExpired, onRefreshError } = {}) {
  const intervalRef = useRef(null);
  const isRefreshingRef = useRef(false);

  const getSessionExpiresAt = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data?.session) return null;
      return data.session.expires_at;
    } catch {
      return null;
    }
  }, []);

  const refreshSession = useCallback(async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;

    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.error('[useAuthRefresh] Refresh error:', error.message);
        if (onRefreshError) onRefreshError(error);
        return false;
      }

      if (!data?.session) {
        console.warn('[useAuthRefresh] No session after refresh — logging out');
        await supabase.auth.signOut();
        if (onSessionExpired) onSessionExpired();
        return false;
      }

      console.info('[useAuthRefresh] Session refreshed successfully');
      return true;
    } catch (err) {
      console.error('[useAuthRefresh] Unexpected error during refresh:', err);
      if (onRefreshError) onRefreshError(err);
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [onRefreshError, onSessionExpired]);

  const checkAndRefresh = useCallback(async () => {
    const expiresAt = await getSessionExpiresAt();

    if (!expiresAt) {
      console.warn('[useAuthRefresh] No active session found');
      if (onSessionExpired) onSessionExpired();
      return;
    }

    const expiresAtMs = expiresAt * 1000;
    const now = Date.now();
    const timeUntilExpiry = expiresAtMs - now;

    console.debug(
      `[useAuthRefresh] Token expires in ${Math.round(timeUntilExpiry / 1000)}s`
    );

    if (timeUntilExpiry <= 0) {
      console.warn('[useAuthRefresh] Session already expired — logging out');
      await supabase.auth.signOut();
      if (onSessionExpired) onSessionExpired();
      return;
    }

    if (timeUntilExpiry <= REFRESH_THRESHOLD_MS) {
      console.info(
        '[useAuthRefresh] Token expiring soon — triggering refresh'
      );
      await refreshSession();
    }
  }, [getSessionExpiresAt, refreshSession, onSessionExpired]);

  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    checkAndRefresh();

    intervalRef.current = setInterval(() => {
      checkAndRefresh();
    }, CHECK_INTERVAL_MS);

    console.info(
      `[useAuthRefresh] Monitoring started (check every ${CHECK_INTERVAL_MS / 1000}s)`
    );
  }, [checkAndRefresh]);

  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      console.info('[useAuthRefresh] Monitoring stopped');
    }
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          startMonitoring();
        }

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          stopMonitoring();
          if (onSessionExpired) onSessionExpired();
        }

        if (event === 'TOKEN_REFRESHED' && session) {
          console.info('[useAuthRefresh] Token refreshed via Supabase event');
        }

        if (event === 'SESSION_EXPIRED') {
          stopMonitoring();
          if (onSessionExpired) onSessionExpired();
        }
      }
    );

    const initSession = async () => {
      const expiresAt = await getSessionExpiresAt();
      if (expiresAt) {
        startMonitoring();
      }
    };

    initSession();

    return () => {
      stopMonitoring();
      authListener?.subscription?.unsubscribe();
    };
  }, [startMonitoring, stopMonitoring, getSessionExpiresAt, onSessionExpired]);

  return {
    refreshSession,
    stopMonitoring,
    startMonitoring,
  };
}


src/services/supabase.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] Missing environment variables: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
  );
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
      'x-app-name': 'trackr-ai-hub',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export async function getValidSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('[Supabase] getValidSession error:', error.message);
    throw error;
  }

  if (!data?.session) {
    return null;
  }

  const expiresAt = data.session.expires_at * 1000;
  const now = Date.now();
  const BUFFER_MS = 5 * 60 * 1000;

  if (expiresAt - now < BUFFER_MS) {
    const { data: refreshData, error: refreshError } =
      await supabase.auth.refreshSession();

    if (refreshError) {
      console.error('[Supabase] Token refresh failed:', refreshError.message);
      throw refreshError;
    }

    return refreshData?.session ?? null;
  }

  return data.session;
}

export async function signInWithEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email, password, metadata = {}) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  );
  if (error) throw error;
}


src/context/AuthContext.jsx

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, signOut } from '../services/supabase';
import { useAuthRefresh } from '../hooks/useAuthRefresh';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  const handleSessionExpired = useCallback(() => {
    if (!mountedRef.current) return;
    setUser(null);
    setSession(null);
    setAuthError('Votre session a expiré. Veuillez vous reconnecter.');
    navigate('/login?reason=session_expired', { replace: true });
  }, [navigate]);

  const handleRefreshError = useCallback(
    (error) => {
      if (!mountedRef.current) return;
      console.error('[AuthContext] Refresh error:', error);
      setAuthError(
        "Impossible de renouveler votre session. Veuillez vous reconnecter."
      );
      navigate('/login?reason=refresh_error', { replace: true });
    },
    [navigate]
  );

  const { refreshSession, stopMonitoring, startMonitoring } = useAuthRefresh({
    onSessionExpired: handleSessionExpired,
    onRefreshError: handleRefreshError,
  });

  useEffect(() => {
    mountedRef.current = true;

    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthContext] Init session error:', error.message);
          setAuthError(error.message);
        } else if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected init error:', err);
        setAuthError(err.message);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    initAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (!mountedRef.current) return;

        console.info('[AuthContext] Auth state change:', event);

        switch (event) {
          case 'SIGNED_IN':
            setSession(newSession);
            setUser(newSession?.user ?? null);
            setAuthError(null);
            setLoading(false);
            break;

          case 'SIGNED_OUT':
            setSession(null);
            setUser(null);
            setLoading(false);
            break;

          case 'TOKEN_REFRESHED':
            setSession(newSession);
            setUser(newSession?.user ?? null);
            break;

          case 'USER_UPDATED':
            setUser(newSession?.user ?? null);
            break;

          case 'SESSION_EXPIRED':
            handleSessionExpired();
            break;

          case 'PASSWORD_RECOVERY':
            break;

          default:
            break;
        }
      }
    );

    return () => {
      mountedRef.current = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [handleSessionExpired]);

  const logout = useCallback(async () => {
    try {
      stopMonitoring();
      await signOut();
      setUser(null);
      setSession(null);
      setAuthError(null);
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
      setUser(null);
      setSession(null);
      navigate('/login', { replace: true });
    }
  }, [stopMonitoring, navigate]);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = {
    user,
    session,
    loading,
    authError,
    isAuthenticated: !!user && !!session,
    logout,
    refreshSession,
    clearAuthError,
    startMonitoring,
    stopMonitoring,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('[useAuth] Must be used within an AuthProvider');
  }
  return ctx;
}


src/components/AuthErrorBoundary.jsx

import React from 'react';

class AuthErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AuthErrorBoundary] Caught error:', error, errorInfo);
    this.setState({ errorInfo });

    const isAuthError =
      error?.message?.toLowerCase().includes('auth') ||
      error?.message?.toLowerCase().includes('jwt') ||
      error?.message?.toLowerCase().includes('token') ||
      error?.message?.toLowerCase().includes('session') ||
      error?.status === 401 ||
      error?.status === 403;

    if (isAuthError) {
      setTimeout(() => {
        window.location.href = '/login?reason=auth_error';
      }, 3000);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoToLogin = () => {
    window.location.href = '/login?reason=auth_error';
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const errorMessage =
      this.state.error?.message || 'Une erreur inattendue est survenue.';

    const isAuthError =
      errorMessage.toLowerCase().includes('auth') ||
      errorMessage.toLowerCase().includes('jwt') ||
      errorMessage.toLowerCase().includes('token') ||
      errorMessage.toLowerCase().includes('session');

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          backgroundColor: '#0f172a',
          color: '#f1f5f9',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '420px',
            width: '100%',
            backgroundColor: '#1e293b',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid #334155',
            boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: isAuthError ? '#7f1d1d' : '#1c1917',
                border: `2px solid ${isAuthError ? '#ef4444' : '#78716c'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                fontSize: '28px',
              }}
            >
              {isAuthError ? '🔐' : '⚠️'}
            </div>

            <h1
              style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#f1f5f9',
                margin: '0 0 8px',
              }}
            >
              {isAuthError ? 'Erreur d\'authentification' : 'Erreur inattendue'}
            </h1>

            <p
              style={{
                fontSize: '14px',
                color: '#94a3b8',
                margin: '0',
                lineHeight: '1.5',
              }}
            >
              {isAuthError
                ? 'Votre session semble invalide ou expirée. Vous allez être redirigé vers la page de connexion.'
                : "L'application a rencontré une erreur. Veuillez réessayer ou contacter le support."}
            </p>
          </div>

          <div
            style={{
              backgroundColor: '#0f172a',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px',
              border: '1px solid #334155',
            }}
          >
            <p
              style={{
                fontSize: '12px',
                fontFamily: 'monospace',
                color: '#ef4444',
                margin: '0',
                wordBreak: 'break-word',
              }}
            >
              {errorMessage}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
            <button
              onClick={this.handleGoToLogin}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = '#4f46e5')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = '#6366f1')}
            >
              Se reconnecter
            </button>

            {!isAuthError && (
              <button
                onClick={this.handleRetry}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: 'transparent',
                  color: '#94a3b8',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                Réessayer
              </button>
            )}
          </div>

          {isAuthError && (
            <p
              style={{
                textAlign: 'center',
                fontSize: '12px',
                color: '#64748b',
                margin: '16px 0 0',
              }}
            >
              Redirection automatique dans 3 secondes…
            </p>
          )}
        </div>
      </div>
    );
  }
}

export default AuthErrorBoundary;


src/pages/