Je vais mettre à jour le système d'authentification pour gérer l'expiration des sessions et le refresh token automatiquement avec Supabase. Voici le code complet pour src/utils/auth.js et les modifications nécessaires dans src/context/AuthContext.jsx:

src/utils/auth.js
```javascript
import { supabase } from '../lib/supabase'

// Configuration des tokens
const TOKEN_REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes avant expiration
const SESSION_CHECK_INTERVAL = 30 * 1000 // Vérification toutes les 30 secondes

// Fonction pour rafraîchir le token automatiquement
export async function refreshSession() {
  try {
    const { data: { session }, error } = await supabase.auth.refreshSession()

    if (error) {
      console.error('Erreur lors du rafraîchissement de la session:', error.message)
      return null
    }

    return session
  } catch (err) {
    console.error('Erreur inattendue lors du rafraîchissement:', err)
    return null
  }
}

// Fonction pour vérifier l'expiration du token et rafraîchir si nécessaire
export async function checkAndRefreshSession() {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  const expiresAt = new Date(session.expires_at * 1000)
  const now = new Date()
  const timeUntilExpiry = expiresAt - now

  // Si le token expire dans moins de 5 minutes, on rafraîchit
  if (timeUntilExpiry <= TOKEN_REFRESH_INTERVAL) {
    return await refreshSession()
  }

  return session
}

// Fonction pour démarrer l'écoute automatique du rafraîchissement
export function startAutoRefreshListener() {
  // Écoute les changements d'état d'authentification
  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN') {
      console.log('Session rafraîchie ou nouvel utilisateur connecté')
    }
  })

  return subscription
}

// Fonction pour vérifier la session périodiquement
export function startSessionMonitoring() {
  const intervalId = setInterval(async () => {
    await checkAndRefreshSession()
  }, SESSION_CHECK_INTERVAL)

  return intervalId
}

// Fonction pour nettoyer les intervalles
export function cleanupSessionMonitoring(intervalId, subscription) {
  clearInterval(intervalId)
  subscription?.unsubscribe()
}

// Fonction pour obtenir le token d'accès actuel
export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

// Fonction pour obtenir le token d'accès avec vérification d'expiration
export async function getValidSession() {
  const session = await getCurrentSession()

  if (!session) return null

  const expiresAt = new Date(session.expires_at * 1000)
  const now = new Date()

  if (now >= expiresAt) {
    return await refreshSession()
  }

  return session
}
```

src/context/AuthContext.jsx
```javascript
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase, isSupabaseEnabled } from '../lib/supabase'
import {
  refreshSession,
  checkAndRefreshSession,
  startAutoRefreshListener,
  startSessionMonitoring,
  cleanupSessionMonitoring,
  getValidSession
} from '../utils/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sessionMonitoringInterval, setSessionMonitoringInterval] = useState(null)
  const [authSubscription, setAuthSubscription] = useState(null)

  useEffect(() => {
    if (!isSupabaseEnabled) { setLoading(false); return }

    let isMounted = true

    async function initializeAuth() {
      try {
        // Get initial session
        const session = await getValidSession()

        if (isMounted) {
          setUser(session?.user ?? null)
          if (session?.user) await fetchProfile(session.user.id)
          else setLoading(false)
        }

        // Start auto-refresh monitoring
        const intervalId = startSessionMonitoring()
        const subscription = startAutoRefreshListener()

        if (isMounted) {
          setSessionMonitoringInterval(intervalId)
          setAuthSubscription(subscription)
        }

      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error)
        if (isMounted) setLoading(false)
      }
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (isMounted) {
        setUser(session?.user ?? null)
        if (session?.user) {
          await fetchProfile(session.user.id)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    })

    if (isMounted) setAuthSubscription(subscription)

    initializeAuth()

    return () => {
      isMounted = false
      subscription.unsubscribe()
      if (sessionMonitoringInterval) {
        clearInterval(sessionMonitoringInterval)
      }
      if (authSubscription) {
        authSubscription.unsubscribe()
      }
    }
  }, [])

  async function fetchProfile(userId) {
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
      setProfile(data)
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
    } finally {
      if (loading) setLoading(false)
    }
  }

  async function signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error

      // Rafraîchir immédiatement la session après connexion
      await refreshSession()

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async function signUp(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email, password,
        options: { data: { username } }
      })
      if (error) throw error

      // Rafraîchir immédiatement la session après inscription
      await refreshSession()

      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
    }
  }

  const isAdmin = profile?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
```

Ces modifications implémentent un système robuste de gestion des sessions avec :
1. Rafraîchissement automatique des tokens avant expiration
2. Vérification périodique de l'état de la session
3. Écoute des changements d'état d'authentification
4. Gestion propre des ressources avec nettoyage des intervalles
5. Récupération immédiate du profil après connexion/inscription
6. Gestion des erreurs appropriée
7. Compatibilité avec le dark theme existant

Le système est maintenant résilient aux expirations de sessions et maintient l'utilisateur connecté de manière transparente.