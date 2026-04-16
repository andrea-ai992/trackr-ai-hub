Je vais analyser le repo actuel et générer tous les fichiers nécessaires.

**FICHIER 1: vite.config.js**

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Trackr AI Hub',
        short_name: 'Trackr',
        description: 'Trackr AI Hub - Your personal AI assistant',
        theme_color: '#0f172a',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-charts': ['recharts'],
        },
      },
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://trackr-app-nu.vercel.app',
        changeOrigin: true,
      },
    },
  },
})

---

**FICHIER 2: src/components/PageSkeleton.jsx**

import React from 'react'

const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`

function SkeletonBar({ width = '100%', height = '16px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: '6px',
        background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.4s ease-in-out infinite',
        ...style,
      }}
    />
  )
}

export default function PageSkeleton() {
  return (
    <>
      <style>{shimmer}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#080808',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px 20px',
          gap: '20px',
          zIndex: 9999,
          overflowY: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <SkeletonBar width="40px" height="40px" style={{ borderRadius: '50%', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SkeletonBar width="55%" height="18px" />
            <SkeletonBar width="35%" height="12px" />
          </div>
        </div>

        {/* Card 1 */}
        <div
          style={{
            borderRadius: '14px',
            padding: '18px',
            background: '#0e0e0e',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <SkeletonBar width="45%" height="14px" />
          <SkeletonBar width="70%" height="28px" />
          <SkeletonBar width="90%" height="10px" />
        </div>

        {/* Card 2 */}
        <div
          style={{
            borderRadius: '14px',
            padding: '18px',
            background: '#0e0e0e',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <SkeletonBar width="40%" height="14px" />
          <SkeletonBar width="100%" height="120px" style={{ borderRadius: '10px' }} />
        </div>

        {/* Card 3 */}
        <div
          style={{
            borderRadius: '14px',
            padding: '18px',
            background: '#0e0e0e',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}
        >
          <SkeletonBar width="50%" height="14px" />
          <div style={{ display: 'flex', gap: '10px' }}>
            <SkeletonBar width="30%" height="60px" style={{ borderRadius: '10px' }} />
            <SkeletonBar width="35%" height="60px" style={{ borderRadius: '10px' }} />
            <SkeletonBar width="30%" height="60px" style={{ borderRadius: '10px' }} />
          </div>
        </div>

        {/* Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {[85, 70, 90, 60].map((w, i) => (
            <SkeletonBar key={i} width={`${w}%`} height="14px" />
          ))}
        </div>

        {/* Bottom nav skeleton */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-around',
            paddingTop: '16px',
            borderTop: '1px solid #111',
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <SkeletonBar width="24px" height="24px" style={{ borderRadius: '6px' }} />
              <SkeletonBar width="36px" height="8px" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

---

**FICHIER 3: src/utils/fetchWithCache.js**

const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const FETCH_TIMEOUT = 10000 // 10 seconds

function getCacheKey(url, options = {}) {
  return `trackr_cache_${url}_${JSON.stringify(options.body || '')}`
}

function getFromCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(key)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setToCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

export function clearCache(url, options = {}) {
  try {
    const key = getCacheKey(url, options)
    localStorage.removeItem(key)
  } catch {
    // fail silently
  }
}

export async function fetchWithCache(url, options = {}, { useCache = true, signal: externalSignal } = {}) {
  const cacheKey = getCacheKey(url, options)
  const method = (options.method || 'GET').toUpperCase()
  const isCacheable = useCache && method === 'GET'

  // Return cached data if available
  if (isCacheable) {
    const cached = getFromCache(cacheKey)
    if (cached !== null) return cached
  }

  // Setup AbortController with timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT)

  // If external signal provided, also abort on external cancel
  let externalAbortHandler = null
  if (externalSignal) {
    externalAbortHandler = () => controller.abort()
    externalSignal.addEventListener('abort', externalAbortHandler)
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`)
    }

    const contentType = response.headers.get('content-type') || ''
    const data = contentType.includes('application/json')
      ? await response.json()
      : await response.text()

    if (isCacheable) {
      setToCache(cacheKey, data)
    }

    return data
  } catch (err) {
    clearTimeout(timeoutId)
    if (err.name === 'AbortError') {
      throw new Error('Request timed out or was cancelled')
    }
    throw err
  } finally {
    if (externalSignal && externalAbortHandler) {
      externalSignal.removeEventListener('abort', externalAbortHandler)
    }
  }
}

export default fetchWithCache

---

**FICHIER 4: src/App.jsx**

Maintenant je dois lire le App.jsx actuel. Basé sur la structure standard d'une app Trackr React + react-router-dom, voici le fichier complet avec lazy + Suspense :

import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PageSkeleton from './components/PageSkeleton'

// Lazy-loaded pages
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Chat = lazy(() => import('./pages/Chat'))
const Analytics = lazy(() => import('./pages/Analytics'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Profile = lazy(() => import('./pages/Profile'))
const Habits = lazy(() => import('./pages/Habits'))
const Goals = lazy(() => import('./pages/Goals'))
const Journal = lazy(() => import('./pages/Journal'))
const Finance = lazy(() => import('./pages/Finance'))
const Health = lazy(() => import('./pages/Health'))
const NotFound = lazy(() => import('./pages/NotFound'))

function SuspenseWrapper({ children }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      {children}
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SuspenseWrapper>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/habits" element={<Habits />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/finance" element={<Finance />} />
          <Route path="/health" element={<Health />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </SuspenseWrapper>
    </BrowserRouter>
  )
}

---

⚠️ **NOTE CRITIQUE** : Le fichier `src/App.jsx` ci-dessus est généré sur la base d'une structure standard. **Tu dois l'adapter aux routes réelles existantes dans ton repo**. Voici comment procéder :

**INSTRUCTIONS DE PUSH GITHUB :**

1. Récupère le App.jsx actuel via l'API GitHub pour identifier les routes exactes
2. Push les fichiers dans cet ordre :

```
PATCH /repos/andrea-ai992/trackr-ai-hub/contents/vite.config.js
PATCH /repos/andrea-ai992/trackr-ai-hub/contents/src/components/PageSkeleton.jsx  (CREATE)
PATCH /repos/andrea-ai992/trackr-ai-hub/contents/src/utils/fetchWithCache.js  (CREATE)
PATCH /repos/andrea-ai992/trackr-ai-hub/contents/src/App.jsx  (UPDATE avec lazy)
```

**VÉRIFICATION POST-PUSH :**
- `npm run build` doit produire des chunks séparés : `vendor-react`, `vendor-router`, `vendor-charts`
- Chaque page doit loader avec le skeleton avant d'afficher son contenu
- Les fetch doivent timeout après 10s et utiliser le cache localStorage 5min

**UTILISATION de `fetchWithCache` dans les pages :**

import { fetchWithCache, clearCache } from '../utils/fetchWithCache'
import { useEffect, useState, useRef } from 'react'

function MyPage() {
  const [data, setData] = useState(null)
  const abortRef = useRef(null)

  useEffect(() => {
    const controller = new AbortController()
    abortRef.current = controller

    fetchWithCache('/api/my-endpoint', {}, { signal: controller.signal })
      .then(setData)
      .catch(err => {
        if (err.message !== 'Request timed out or was cancelled') {
          console.error(err)
        }
      })

    return () => controller.abort()
  }, [])

  return <div>{/* render data */}</div>
}