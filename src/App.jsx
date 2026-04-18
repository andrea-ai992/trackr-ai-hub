// src/utils/auth.js
import { supabase } from '../lib/supabaseClient'

let refreshTimeout = null

// Configuration des tokens
const TOKEN_REFRESH_MARGIN = 30 * 1000 // 30 secondes avant expiration
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 seconde

// Vérifie si le token est expiré
const isTokenExpired = (session) => {
  if (!session?.expires_at) return true
  return Date.now() >= (session.expires_at * 1000) - TOKEN_REFRESH_MARGIN
}

// Rafraîchit le token automatiquement
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

// Démarre l'intervalle de rafraîchissement automatique
export const startTokenRefreshInterval = () => {
  if (refreshTimeout) clearTimeout(refreshTimeout)

  refreshSession().then(session => {
    if (session) {
      const expiresAt = session.expires_at * 1000
      const now = Date.now()
      const delay = Math.max(0, expiresAt - now - TOKEN_REFRESH_MARGIN)

      refreshTimeout = setTimeout(() => {
        startTokenRefreshInterval()
      }, delay)
    }
  })
}

// Arrête l'intervalle de rafraîchissement
export const stopTokenRefreshInterval = () => {
  if (refreshTimeout) {
    clearTimeout(refreshTimeout)
    refreshTimeout = null
  }
}

// Vérifie et rafraîchit le token si nécessaire
export const checkAndRefreshToken = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return null

  if (isTokenExpired(session)) {
    return await refreshSession()
  }

  return session
}

// Initialisation automatique
export const initAuth = () => {
  startTokenRefreshInterval()

  // Écoute les changements de session
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      startTokenRefreshInterval()
    } else if (event === 'SIGNED_OUT') {
      stopTokenRefreshInterval()
    }
  })
}
```

```css
/* src/styles/ModuleCard.css */
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(0, 255, 136, 0.3);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --transition-speed: 0.3s;
}

.module-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-speed) ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.module-card:hover {
  border-color: var(--green);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  position: relative;
  z-index: 2;
}

.card-icon {
  width: 48px;
  height: 48px;
  background-color: rgba(0, 255, 136, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
}

.card-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--t1);
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 3;
}

.badge-new,
.badge-live {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-new {
  background-color: rgba(0, 255, 136, 0.2);
  color: var(--green);
  border: 1px solid var(--green);
}

.badge-live {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff0000;
  border: 1px solid #ff0000;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 255, 136, 0.1) 0%,
    rgba(0, 255, 136, 0.05) 100%
  );
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
  pointer-events: none;
}

.card-overlay.visible {
  opacity: 1;
}

/* Responsive grid */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.modules-grid .module-card {
  min-height: 120px;
}

@media (min-width: 768px) {
  .modules-grid .module-card {
    min-height: 140px;
  }
}

@media (min-width: 1024px) {
  .modules-grid .module-card {
    min-height: 160px;
  }
}