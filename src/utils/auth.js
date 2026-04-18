Voici le code mis à jour pour gérer l'expiration des sessions et le refresh token automatiquement avec @supabase/supabase-js :

```javascript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Supabase URL and Anon Key must be provided in environment variables')
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

let refreshInterval = null
let sessionExpiryTimeout = null

const calculateRefreshDelay = (expiresAt) => {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = expiresAt - now
  const refreshDelay = Math.max(0, expiresIn - 300) * 1000
  return refreshDelay
}

const scheduleTokenRefresh = (session) => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (sessionExpiryTimeout) clearTimeout(sessionExpiryTimeout)

  const expiresAt = session.expires_at
  const refreshDelay = calculateRefreshDelay(expiresAt)

  if (refreshDelay <= 0) {
    logout()
    return
  }

  refreshInterval = setInterval(async () => {
    try {
      const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession()
      if (error) {
        console.error('Token refresh failed:', error)
        logout()
        return
      }
      if (refreshedSession) {
        scheduleTokenRefresh(refreshedSession)
      }
    } catch (err) {
      console.error('Error during token refresh:', err)
      logout()
    }
  }, refreshDelay)

  sessionExpiryTimeout = setTimeout(() => {
    logout()
  }, refreshDelay + 300000)
}

export const login = async (email, password) => {
  const { data: { session }, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error
  if (session) scheduleTokenRefresh(session)
  return session
}

export const signup = async (email, password) => {
  const { data: { session }, error } = await supabase.auth.signUp({
    email,
    password
  })

  if (error) throw error
  if (session) scheduleTokenRefresh(session)
  return session
}

export const logout = async () => {
  if (refreshInterval) clearInterval(refreshInterval)
  if (sessionExpiryTimeout) clearTimeout(sessionExpiryTimeout)

  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (err) {
    console.error('Error during logout:', err)
    throw err
  }
}

export const getSession = async () => {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) scheduleTokenRefresh(session)
    return session
  } catch (err) {
    console.error('Error getting session:', err)
    throw err
  }
}

export const getUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (err) {
    console.error('Error getting user:', err)
    throw err
  }
}

export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session) scheduleTokenRefresh(session)
    callback(event, session)
  })
}

export default {
  login,
  signup,
  logout,
  getSession,
  getUser,
  onAuthStateChange
}