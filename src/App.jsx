// src/hooks/useSessionExpiry.js
import { useEffect, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import {
  startTokenRefreshInterval,
  stopTokenRefreshInterval,
  checkAndRefreshToken
} from '../utils/auth'

const TOKEN_REFRESH_MARGIN = 30 * 1000 // 30 secondes avant expiration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 seconde

const isTokenExpired = (session) => {
  if (!session?.expires_at) return true
  return Date.now() >= (session.expires_at * 1000) - TOKEN_REFRESH_MARGIN
}

const refreshSession = async (retries = 0) => {
  try {
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error || !session) {
      console.error('Erreur lors de la récupération de la session:', error?.message)
      return null
    }

    if (isTokenExpired(session)) {
      console.log('Token expiré, tentative de rafraîchissement...')
      const { data: { session: refreshedSession }, error: refreshError } = await supabase.auth.refreshSession()

      if (refreshError) {
        console.error('Erreur lors du rafraîchissement du token:', refreshError.message)
        return null
      }

      console.log('Token rafraîchi avec succès')
      return refreshedSession
    }

    return session
  } catch (err) {
    console.error('Erreur inattendue lors du rafraîchissement:', err)
    if (retries < MAX_RETRIES) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY))
      return refreshSession(retries + 1)
    }
    return null
  }
}

const useSessionExpiry = () => {
  const refreshTimeoutRef = useRef(null)
  const isInitializedRef = useRef(false)

  const scheduleRefresh = async () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
    }

    const session = await refreshSession()
    if (session) {
      const expiresAt = session.expires_at * 1000
      const now = Date.now()
      const delay = Math.max(0, expiresAt - now - TOKEN_REFRESH_MARGIN)

      refreshTimeoutRef.current = setTimeout(() => {
        scheduleRefresh()
      }, delay)
    }
  }

  const clearRefreshTimeout = () => {
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current)
      refreshTimeoutRef.current = null
    }
  }

  useEffect(() => {
    if (!isInitializedRef.current) {
      isInitializedRef.current = true
      startTokenRefreshInterval()

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          scheduleRefresh()
        } else if (event === 'SIGNED_OUT') {
          clearRefreshTimeout()
        }
      })

      return () => {
        clearRefreshTimeout()
        subscription?.unsubscribe()
      }
    }
  }, [])

  return {
    checkAndRefreshToken,
    scheduleRefresh,
    clearRefreshTimeout
  }
}

export default useSessionExpiry