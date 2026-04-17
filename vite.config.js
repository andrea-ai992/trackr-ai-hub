Je vais générer tous les fichiers complets et production-ready.

---

FICHIER 1: vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'
import { compression } from 'vite-plugin-compression2'

export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      babel: {
        plugins: [
          ['babel-plugin-react-compiler', {}],
        ],
      },
    }),
    tailwindcss(),
    compression({
      algorithm: 'brotliCompress',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
    compression({
      algorithm: 'gzip',
      exclude: [/\.(br)$/, /\.(gz)$/],
      threshold: 1024,
    }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,webp,avif}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v4',
              networkTimeoutSeconds: 10,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'images-cache-v4',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache-v4',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /\.(?:js|css)$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'static-assets-v4',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets-v4',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts-v4',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/vercel\.live\/.*/i,
            handler: 'NetworkOnly',
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        sourcemap: false,
        inlineWorkboxRuntime: false,
      },
      manifest: {
        name: 'Trackr AI Hub',
        short_name: 'Trackr',
        description: 'Trackr AI Hub — Your personal AI assistant for productivity and insights',
        theme_color: '#0f172a',
        background_color: '#080808',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        orientation: 'portrait',
        scope: '/',
        start_url: '/?source=pwa',
        lang: 'en',
        dir: 'ltr',
        categories: ['productivity', 'utilities'],
        screenshots: [
          {
            src: '/screenshots/mobile-home.png',
            sizes: '390x844',
            type: 'image/png',
            form_factor: 'narrow',
            label: 'Trackr Dashboard',
          },
        ],
        icons: [
          { src: '/icons/icon-72x72.png', sizes: '72x72', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-96x96.png', sizes: '96x96', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      devOptions: {
        enabled: false,
        type: 'module',
      },
    }),
    mode === 'analyze' &&
      visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/bundle-report.html',
        template: 'treemap',
      }),
  ].filter(Boolean),

  build: {
    target: ['esnext', 'chrome90', 'firefox88', 'safari14'],
    minify: 'esbuild',
    cssMinify: 'esbuild',
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 400,
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        tryCatchDeoptimization: false,
      },
      output: {
        experimentalMinChunkSize: 8000,
        compact: true,
        generatedCode: {
          preset: 'es2015',
          constBindings: true,
          arrowFunctions: true,
          objectShorthand: true,
          symbols: false,
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom')) return 'vendor-react-dom'
            if (
              id.includes('react/') ||
              id.includes('react-is') ||
              id.includes('scheduler')
            ) return 'vendor-react'
            if (id.includes('react-router')) return 'vendor-router'
            if (
              id.includes('recharts') ||
              id.includes('d3-') ||
              id.includes('victory')
            ) return 'vendor-charts'
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (
              id.includes('@radix-ui') ||
              id.includes('lucide-react')
            ) return 'vendor-ui'
            if (
              id.includes('firebase') ||
              id.includes('@firebase')
            ) return 'vendor-firebase'
            if (
              id.includes('openai') ||
              id.includes('anthropic') ||
              id.includes('cohere')
            ) return 'vendor-ai'
            if (
              id.includes('date-fns') ||
              id.includes('dayjs') ||
              id.includes('luxon')
            ) return 'vendor-date'
            if (
              id.includes('zustand') ||
              id.includes('jotai') ||
              id.includes('redux')
            ) return 'vendor-state'
            if (id.includes('web-vitals')) return 'vendor-vitals'
            return 'vendor-misc'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(name ?? ''))
            return 'assets/images/[name]-[hash][extname]'
          if (/\.(woff2)$/i.test(name ?? ''))
            return 'assets/fonts/[name]-[hash][extname]'
          if (/\.css$/i.test(name ?? ''))
            return 'assets/css/[name]-[hash][extname]'
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    esbuild: {
      legalComments: 'none',
      drop: ['console', 'debugger'],
      target: 'esnext',
      treeShaking: true,
      minifyIdentifiers: true,
      minifySyntax: true,
      minifyWhitespace: true,
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react/jsx-runtime',
      'web-vitals',
    ],
    exclude: ['@vite/client', '@vite/env'],
    esbuildOptions: {
      target: 'esnext',
    },
  },

  server: {
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: 'https://trackr-app-nu.vercel.app',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path,
      },
    },
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  },

  preview: {
    port: 4173,
    strictPort: false,
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  },

  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@hooks': '/src/hooks',
      '@utils': '/src/utils',
      '@store': '/src/store',
      '@assets': '/src/assets',
      '@server': '/src/server',
      '@services': '/src/services',
    },
  },

  esbuild: {
    legalComments: 'none',
    treeShaking: true,
  },
}))

---

FICHIER 2: src/services/analyticsService.js

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals'

const IS_PROD = import.meta.env.PROD
const ANALYTICS_ENDPOINT = import.meta.env.VITE_ANALYTICS_ENDPOINT ?? null
const SAMPLE_RATE = Number(import.meta.env.VITE_ANALYTICS_SAMPLE_RATE ?? 1.0)

const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },
  FID: { good: 100, needsImprovement: 300 },
  INP: { good: 200, needsImprovement: 500 },
  CLS: { good: 0.1, needsImprovement: 0.25 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
}

function getRating(name, value) {
  const t = THRESHOLDS[name]
  if (!t) return 'unknown'
  if (value <= t.good) return 'good'
  if (value <= t.needsImprovement) return 'needs-improvement'
  return 'poor'
}

function shouldSample() {
  return Math.random() < SAMPLE_RATE
}

function buildPayload(metric) {
  const rating = getRating(metric.name, metric.value)
  return {
    name: metric.name,
    value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
    rating,
    delta: Math.round(metric.delta),
    id: metric.id,
    navigationType: metric.navigationType ?? 'unknown',
    url: location.href,
    userAgent: navigator.userAgent,
    connection: navigator?.connection?.effectiveType ?? 'unknown',
    deviceMemory: navigator?.deviceMemory ?? 'unknown',
    hardwareConcurrency: navigator?.hardwareConcurrency ?? 'unknown',
    timestamp: Date.now(),
    environment: IS_PROD ? 'production' : 'development',
  }
}

async function sendToEndpoint(payload) {
  if (!ANALYTICS_ENDPOINT) return
  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' })
      navigator.sendBeacon(ANALYTICS_ENDPOINT, blob)
    } else {
      await fetch(ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      })
    }
  } catch {
    // silent fail — analytics must never break the app
  }
}

function logToConsole(payload) {
  if (IS_PROD) return
  const emoji =
    payload.rating === 'good' ? '✅' :
    payload.rating === 'needs-improvement' ? '⚠️' : '❌'
  const unit = payload.name === 'CLS' ? '' : 'ms'
  const displayValue =
    payload.name === 'CLS'
      ? (payload.value / 1000).toFixed(4)
      : payload.value
  console.groupCollapsed(
    `%c[Web Vitals] ${emoji} ${payload.name}: ${displayValue}${unit} (${payload.rating})`,
    `color: ${payload.rating === 'good' ? '#22c55e' : payload.rating === 'needs-improvement' ? '#f59e0b' : '#ef4444'}; font-weight: bold;`
  )
  console.table({
    value: `${displayValue}${unit}`,
    rating: payload.rating,
    delta: `${payload.delta}${unit}`,
    navigationType: payload.navigationType,
    connection: payload.connection,
    url: payload.url,
  })
  console.groupEnd()
}

function handleMetric(metric) {
  if (!shouldSample()) return
  const payload = buildPayload(metric)
  logToConsole(payload)
  sendToEndpoint(payload)
}

let initialized = false

export function initWebVitals() {
  if (initialized) return
  initialized = true
  try {
    onLCP(handleMetric, { reportAllChanges: false })
    onFID(handleMetric)
    onCLS(handleMetric, { reportAllChanges: false })
    onINP(handleMetric, { reportAllChanges: false })
    onFCP(handleMetric)
    onTTFB(handleMetric)
  } catch {
    // web-vitals not supported in this environment
  }
}

export function measureCustomMetric(name, value, attributes = {}) {
  if (!shouldSample()) return
  const payload = {
    name,
    value: Math.round(value),
    rating: 'custom',
    delta: 0,
    id: `custom-${name}-${Date.now()}`,
    navigationType: 'custom',
    url: location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    environment: IS_PROD ? 'production' : 'development',
    ...attributes,
  }
  logToConsole(payload)
  sendToEndpoint(payload)
}

export function measureRouteChange(from, to, duration) {
  measureCustomMetric('route-change', duration, {
    from,
    to,
    rating: duration < 200 ? 'good' : duration < 500 ? 'needs-improvement' : 'poor',
  })
}

---

FICHIER 3: src/App.jsx

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  NavLink,
  useLocation,
  ScrollRestoration,
} from 'react-router-dom'
import {
  Suspense,
  lazy,
  useEffect,
  useRef,
  startTransition,
  useCallback,
} from 'react'
import { initWebVitals, measureRouteChange } from '@services/analyticsService'

// ─── Eager-loaded: shell visible instantly ────────────────────────────────────
import ErrorBoundary from '@components/ErrorBoundary'
import BottomNav from '@components/BottomNav'
import TopBar from '@components/