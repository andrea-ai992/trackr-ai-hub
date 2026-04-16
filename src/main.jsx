Je vais implémenter la gestion sécurisée des sessions Supabase dans `src/lib/supabaseClient.js`.

## Analyse et plan

1. **`src/lib/supabaseClient.js`** — Client Supabase avec sessionStorage, autoRefresh, listener auth
2. **`src/hooks/useAuthSession.js`** — Hook React pour consommer la session
3. **`src/main.jsx`** — Mise à jour pour intégrer le listener au démarrage

---

### Fichier 1: `src/lib/supabaseClient.js`

```js
/**
 * @module supabaseClient
 * @description Client Supabase avec gestion sécurisée des sessions.
 *
 * Sécurité:
 * - Sessions stockées UNIQUEMENT en sessionStorage (jamais localStorage)
 * - autoRefreshToken: true — renouvellement automatique avant expiration
 * - persistSession: true — survie aux rechargements de page (même onglet)
 * - Détection TOKEN_REFRESHED et SIGNED_OUT via onAuthStateChange
 * - Logout forcé + redirect /login si refresh token expiré ou révoqué
 * - Aucune donnée sensible loggée en production
 *
 * Usage:
 *   import { supabase, initAuthListener, getSession } from '@/lib/supabaseClient'
 */

import { createClient } from '@supabase/supabase-js'
import { getSupabaseUrl, getSupabaseAnonKey, isProduction } from '@/config/apiConfig'

// ---------------------------------------------------------------------------
// Constantes internes
// ---------------------------------------------------------------------------

const SESSION_STORAGE_KEY = 'trackr_auth_session'
const REDIRECT_PATH_LOGIN = '/login'

/**
 * Codes d'erreur Supabase indiquant un refresh token invalide/révoqué.
 * Source: https://supabase.com/docs/reference/javascript/auth-error-codes
 */
const REVOKED_TOKEN_ERROR_CODES = [
  'refresh_token_not_found',
  'refresh_token_already_used',
  'token_expired',
  'invalid_refresh_token',
  'session_not_found',
]

/**
 * Messages d'erreur (sous-chaînes) indiquant un token révoqué ou expiré.
 */
const REVOKED_TOKEN_MESSAGES = [
  'refresh_token_not_found',
  'Token has expired',
  'Refresh Token Not Found',
  'Invalid Refresh Token',
  'Already Used',
  'refresh token',
]

// ---------------------------------------------------------------------------
// SessionStorage adapter — remplace localStorage par sessionStorage
// Conforme à l'interface SupportedStorage de Supabase JS v2
// ---------------------------------------------------------------------------

/**
 * Adaptateur sessionStorage pour Supabase.
 * Supabase attend une interface { getItem, setItem, removeItem }.
 * sessionStorage est scopé à l'onglet — fermé = session détruite.
 *
 * @type {import('@supabase/supabase-js').SupportedStorage}
 */
const sessionStorageAdapter = {
  /**
   * @param {string} key
   * @returns {string | null}
   */
  getItem(key) {
    try {
      return window.sessionStorage.getItem(key)
    } catch (err) {
      // sessionStorage peut être bloqué (mode privé strict, iframe sandbox)
      _logDebug('[supabaseClient] sessionStorage.getItem failed:', err)
      return null
    }
  },

  /**
   * @param {string} key
   * @param {string} value
   */
  setItem(key, value) {
    try {
      window.sessionStorage.setItem(key, value)
    } catch (err) {
      _logDebug('[supabaseClient] sessionStorage.setItem failed:', err)
    }
  },

  /**
   * @param {string} key
   */
  removeItem(key) {
    try {
      window.sessionStorage.removeItem(key)
    } catch (err) {
      _logDebug('[supabaseClient] sessionStorage.removeItem failed:', err)
    }
  },
}

// ---------------------------------------------------------------------------
// Logging sécurisé — aucune donnée sensible en production
// ---------------------------------------------------------------------------

/**
 * Log de debug — désactivé en production.
 * @param {...any} args
 */
function _logDebug(...args) {
  if (!isProduction()) {
    console.debug(...args)
  }
}

/**
 * Log d'info — désactivé en production.
 * @param {...any} args
 */
function _logInfo(...args) {
  if (!isProduction()) {
    console.info(...args)
  }
}

/**
 * Log d'erreur — toujours actif, sans données sensibles.
 * @param {string} message
 * @param {Error|null} [err]
 */
function _logError(message, err = null) {
  if (err) {
    // En production: ne log que le message, pas le stack
    const safeErr = isProduction()
      ? { message: err.message, code: err.code ?? 'UNKNOWN' }
      : err
    console.error(message, safeErr)
  } else {
    console.error(message)
  }
}

// ---------------------------------------------------------------------------
// Validation de la configuration Supabase
// ---------------------------------------------------------------------------

/**
 * Valide que les variables Supabase sont présentes avant de créer le client.
 * @throws {Error} Si VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY sont manquantes
 */
function _validateSupabaseConfig() {
  const url = getSupabaseUrl()
  const key = getSupabaseAnonKey()

  const errors = []

  if (!url || url.trim() === '') {
    errors.push('VITE_SUPABASE_URL est manquante ou vide')
  } else {
    try {
      new URL(url)
    } catch {
      errors.push(`VITE_SUPABASE_URL est invalide: "${url}"`)
    }
  }

  if (!key || key.trim() === '') {
    errors.push('VITE_SUPABASE_ANON_KEY est manquante ou vide')
  }

  if (errors.length > 0) {
    throw new Error(
      `[supabaseClient] Configuration invalide:\n${errors.map((e) => `  → ${e}`).join('\n')}`
    )
  }
}

// ---------------------------------------------------------------------------
// Création du client Supabase
// ---------------------------------------------------------------------------

// Validation au module load — bloque si config invalide
_validateSupabaseConfig()

/**
 * Client Supabase singleton avec:
 * - sessionStorage comme store (isolation par onglet)
 * - autoRefreshToken: true (renouvellement proactif)
 * - persistSession: true (survie aux rechargements)
 * - detectSessionInUrl: true (OAuth callback handling)
 * - flowType: 'pkce' (recommandé pour apps SPA)
 *
 * @type {import('@supabase/supabase-js').SupabaseClient}
 */
export const supabase = createClient(
  getSupabaseUrl(),
  getSupabaseAnonKey(),
  {
    auth: {
      // -----------------------------------------------------------------------
      // STOCKAGE: sessionStorage uniquement — jamais localStorage
      // sessionStorage est scopé à l'onglet → fermé = session détruite
      // -----------------------------------------------------------------------
      storage: sessionStorageAdapter,
      storageKey: SESSION_STORAGE_KEY,

      // -----------------------------------------------------------------------
      // REFRESH: renouvelle automatiquement le token avant expiration
      // Supabase envoie un nouveau token ~60s avant l'expiration
      // -----------------------------------------------------------------------
      autoRefreshToken: true,

      // -----------------------------------------------------------------------
      // PERSISTANCE: survie aux rechargements de page (F5) dans le même onglet
      // Désactivé = l'utilisateur est déconnecté à chaque rechargement
      // -----------------------------------------------------------------------
      persistSession: true,

      // -----------------------------------------------------------------------
      // DÉTECTION URL: gère les tokens dans l'URL (OAuth, magic link)
      // -----------------------------------------------------------------------
      detectSessionInUrl: true,

      // -----------------------------------------------------------------------
      // PKCE: recommandé pour les SPAs (protection CSRF)
      // -----------------------------------------------------------------------
      flowType: 'pkce',
    },
  }
)

_logInfo(
  '%c[Trackr] ✓ Client Supabase initialisé (sessionStorage, PKCE, autoRefresh)',
  'color: #22c55e; font-weight: bold;'
)

// ---------------------------------------------------------------------------
// Détection d'un refresh token expiré ou révoqué
// ---------------------------------------------------------------------------

/**
 * Détermine si une erreur Supabase correspond à un token révoqué/expiré.
 * @param {import('@supabase/supabase-js').AuthError | Error | null} error
 * @returns {boolean}
 */
function _isRevokedTokenError(error) {
  if (!error) return false

  const message = error.message?.toLowerCase() ?? ''
  const code = error.code?.toLowerCase() ?? ''
  const status = error.status ?? 0

  // Vérification par code d'erreur Supabase
  if (REVOKED_TOKEN_ERROR_CODES.some((c) => code.includes(c.toLowerCase()))) {
    return true
  }

  // Vérification par message d'erreur
  if (REVOKED_TOKEN_MESSAGES.some((m) => message.includes(m.toLowerCase()))) {
    return true
  }

  // HTTP 401 lors d'un refresh = token invalide
  if (status === 401) {
    return true
  }

  return false
}

// ---------------------------------------------------------------------------
// Gestion du logout forcé
// ---------------------------------------------------------------------------

/**
 * Indicateur interne pour éviter les boucles de logout.
 * @type {boolean}
 */
let _isLoggingOut = false

/**
 * Force la déconnexion complète et redirige vers /login.
 * Nettoie sessionStorage, révoque la session côté Supabase si possible.
 *
 * @param {string} [reason] - Raison du logout (pour logging)
 * @returns {Promise<void>}
 */
async function _forceLogout(reason = 'UNKNOWN') {
  // Guard: évite les appels multiples simultanés
  if (_isLoggingOut) {
    _logDebug('[supabaseClient] forceLogout déjà en cours, ignoré')
    return
  }

  _isLoggingOut = true
  _logInfo(`[supabaseClient] Force logout — raison: ${reason}`)

  try {
    // Tentative de signOut côté Supabase (révocation serveur)
    // On ignore les erreurs car le token est peut-être déjà invalide
    const { error } = await supabase.auth.signOut({ scope: 'local' })
    if (error) {
      _logDebug('[supabaseClient] signOut warning (ignoré):', error.message)
    }
  } catch (err) {
    // Ignore les erreurs réseau lors du logout forcé
    _logDebug('[supabaseClient] signOut exception (ignorée):', err)
  } finally {
    // Nettoyage forcé du sessionStorage
    _purgeSessionStorage()

    // Redirect vers /login
    _redirectToLogin(reason)

    // Reset du guard après un délai (sécurité)
    setTimeout(() => {
      _isLoggingOut = false
    }, 2000)
  }
}

/**
 * Purge toutes les données de session dans sessionStorage.
 */
function _purgeSessionStorage() {
  try {
    // Suppression de la clé Supabase spécifique
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)

    // Suppression de toutes les clés Supabase (format: sb-*-auth-token)
    const keysToRemove = []
    for (let i = 0; i < window.sessionStorage.length; i++) {
      const key = window.sessionStorage.key(i)
      if (key && (key.startsWith('sb-') || key.startsWith('supabase'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((key) => window.sessionStorage.removeItem(key))

    _logDebug('[supabaseClient] sessionStorage purgé')
  } catch (err) {
    _logDebug('[supabaseClient] Erreur purge sessionStorage:', err)
  }
}

/**
 * Redirige vers la page de login avec un paramètre de raison.
 * Utilise window.location pour un rechargement propre (reset état React).
 *
 * @param {string} reason
 */
function _redirectToLogin(reason) {
  const reasonMap = {
    TOKEN_EXPIRED: 'session_expired',
    TOKEN_REVOKED: 'session_revoked',
    SIGNED_OUT: 'signed_out',
    AUTH_ERROR: 'auth_error',
    UNKNOWN: 'unknown',
  }

  const reasonParam = reasonMap[reason] ?? 'unknown'
  const redirectUrl = `${REDIRECT_PATH_LOGIN}?reason=${reasonParam}`

  _logDebug(`[supabaseClient] Redirect → ${redirectUrl}`)

  // window.location.replace: évite d'empiler une entrée dans l'historique
  // L'utilisateur ne peut pas revenir en arrière sur une session invalide
  if (window.location.pathname !== REDIRECT_PATH_LOGIN) {
    window.location.replace(redirectUrl)
  }
}

// ---------------------------------------------------------------------------
// Listener onAuthStateChange — cœur de la gestion de session
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} AuthListenerHandle
 * @property {Function} unsubscribe - Désabonne le listener
 * @property {Function} getStatus - Retourne le statut courant du listener
 */

/**
 * Initialise le listener onAuthStateChange.
 * Doit être appelé UNE SEULE FOIS au démarrage de l'application (main.jsx).
 *
 * Événements gérés:
 * - SIGNED_IN: session établie (login, OAuth callback, token refresh initial)
 * - TOKEN_REFRESHED: token renouvelé avec succès
 * - SIGNED_OUT: déconnexion (manuelle, token expiré, révoqué)
 * - USER_UPDATED: données utilisateur modifiées
 * - PASSWORD_RECOVERY: flux de récupération de mot de passe
 * - INITIAL_SESSION: état initial au chargement
 *
 * @returns {AuthListenerHandle}
 */
export function initAuthListener() {
  _logInfo('[supabaseClient] Initialisation du listener onAuthStateChange')

  let _listenerActive = true
  let _lastEvent = null
  let _lastEventTime = null

  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange(async (event, session) => {
    if (!_listenerActive) return

    _lastEvent = event
    _lastEventTime = new Date().toISOString()

    _logDebug(`[supabaseClient] Auth event: ${event}`, {
      hasSession: !!session,
      // En production: ne log jamais les tokens
      ...(isProduction()
        ? {}
        : {
            userId: session?.user?.id ?? null,
            expiresAt: session?.expires_at ?? null,
          }),
    })

    switch (event) {
      // -----------------------------------------------------------------------
      // TOKEN_REFRESHED — token renouvelé avec succès
      // -----------------------------------------------------------------------
      case 'TOKEN_REFRESHED': {
        if (!session) {
          // Refresh signalé mais session null = token invalide
          _logError('[supabaseClient] TOKEN_REFRESHED reçu sans session — logout forcé')
          await _forceLogout('TOKEN_REVOKED')
          break
        }

        _logInfo('[supabaseClient] ✓ Token rafraîchi avec succès')

        // Vérification de cohérence: session non-expirée
        const expiresAt = session.expires_at
        if (expiresAt) {
          const now = Math.floor(Date.now() / 1000)
          if (expiresAt < now) {
            _logError('[supabaseClient] Session expirée après TOKEN_REFRESHED — logout forcé')
            await _forceLogout('TOKEN_EXPIRED')
          }
        }
        break
      }

      // -----------------------------------------------------------------------
      // SIGNED_OUT — déconnexion (manuelle, token expiré/révoqué, autre onglet)
      // -----------------------------------------------------------------------
      case 'SIGNED_OUT': {
        _logInfo('[supabaseClient] SIGNED_OUT détecté — nettoyage session')

        // Nettoyage du sessionStorage (peut être déjà fait par Supabase)
        _purgeSessionStorage()

        // Si on n'est pas déjà sur /login, redirect
        if (window.location.pathname !== REDIRECT_PATH_LOGIN) {
          _redirectToLogin('SIGNED_OUT')
        }
        break
      }

      // -----------------------------------------------------------------------
      // SIGNED_IN — session établie
      // -----------------------------------------------------------------------
      case 'SIGNED_IN': {
        if (!session) {
          _logError('[supabaseClient] SIGNED_IN sans session — incohérence')
          break
        }
        _logInfo('[supabaseClient] ✓ Utilisateur connecté')
        break
      }

      // -----------------------------------------------------------------------
      // INITIAL_SESSION — état initial au chargement de la page
      // -----------------------------------------------------------------------
      case 'INITIAL_SESSION': {
        if (!session) {
          _logDebug('[supabaseClient] Pas de session active au chargement')
          // Pas de redirect ici — laisse le router gérer les routes protégées
        } else {
          _logDebug('[supabaseClient] Session restaurée depuis sessionStorage')
        }
        break
      }

      // -----------------------------------------------------------------------
      // USER_UPDATED — mise à jour des données utilisateur
      // -----------------------------------------------------------------------
      case 'USER_UPDATED': {
        _logInfo('[supabaseClient] Données utilisateur mises à jour')
        break
      }

      // -----------------------------------------------------------------------
      // PASSWORD_RECOVERY — flux de récupération de mot de passe
      // -----------------------------------------------------------------------
      case 'PASSWORD_RECOVERY': {
        _logInfo('[supabaseClient] Flux de récupération de mot de passe détecté')
        break
      }

      default: {
        _logDebug(`[supabaseClient] Événement auth non géré: ${event}`)
        break
      }
    }
  })

  // Gestion des erreurs de token révoqué/expiré via le client Supabase
  // Supabase v2 émet des erreurs de refresh dans onAuthStateChange (SIGNED_OUT)
  // mais on ajoute un handler sur les erreurs de réseau pour robustesse
  _setupTokenErrorInterceptor()

  return {
    /**
     * Désabonne le listener (cleanup).
     * Appeler dans useEffect cleanup ou au démontage de l'app.
     */
    unsubscribe() {
      _listenerActive = false
      subscription.unsub