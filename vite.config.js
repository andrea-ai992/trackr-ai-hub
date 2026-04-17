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
              cacheName: 'api-cache-v3',
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
              cacheName: 'images-cache-v3',
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
              cacheName: 'fonts-cache-v3',
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
              cacheName: 'static-assets-v3',
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
              cacheName: 'google-fonts-stylesheets-v3',
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
              cacheName: 'google-fonts-webfonts-v3',
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
            if (id.includes('react/') || id.includes('react-is') || id.includes('scheduler')) return 'vendor-react'
            if (id.includes('react-router')) return 'vendor-router'
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) return 'vendor-charts'
            if (id.includes('framer-motion')) return 'vendor-motion'
            if (id.includes('@radix-ui') || id.includes('lucide-react')) return 'vendor-ui'
            if (id.includes('firebase') || id.includes('@firebase')) return 'vendor-firebase'
            if (id.includes('openai') || id.includes('anthropic') || id.includes('cohere')) return 'vendor-ai'
            if (id.includes('date-fns') || id.includes('dayjs') || id.includes('luxon')) return 'vendor-date'
            if (id.includes('zustand') || id.includes('jotai') || id.includes('redux')) return 'vendor-state'
            if (id.includes('web-vitals')) return 'vendor-vitals'
            return 'vendor-misc'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(name ?? '')) return 'assets/images/[name]-[hash][extname]'
          if (/\.(woff2)$/i.test(name ?? '')) return 'assets/fonts/[name]-[hash][extname]'
          if (/\.css$/i.test(name ?? '')) return 'assets/css/[name]-[hash][extname]'
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
const IS_DEV = import.meta.env.DEV

const THRESHOLDS = {
  LCP: { good: 1200, needsImprovement: 2500 },
  FID: { good: 100, needsImprovement: 300 },
  CLS: { good: 0.05, needsImprovement: 0.1 },
  FCP: { good: 1800, needsImprovement: 3000 },
  TTFB: { good: 800, needsImprovement: 1800 },
  INP: { good: 200, needsImprovement: 500 },
}

const SESSION_ID = (() => {
  try {
    const stored = sessionStorage.getItem('trackr_session_id')
    if (stored) return stored
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    sessionStorage.setItem('trackr_session_id', id)
    return id
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
  }
})()

const getNetworkInfo = () => {
  try {
    const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection
    if (!conn) return { effectiveType: 'unknown', rtt: null, downlink: null, saveData: false }
    return {
      effectiveType: conn.effectiveType || 'unknown',
      rtt: conn.rtt ?? null,
      downlink: conn.downlink ?? null,
      saveData: conn.saveData || false,
    }
  } catch {
    return { effectiveType: 'unknown', rtt: null, downlink: null, saveData: false }
  }
}

const getDeviceInfo = () => {
  try {
    return {
      devicePixelRatio: window.devicePixelRatio || 1,
      screenWidth: window.screen?.width || 0,
      screenHeight: window.screen?.height || 0,
      viewportWidth: window.innerWidth || 0,
      viewportHeight: window.innerHeight || 0,
      memoryGB: navigator.deviceMemory || null,
      hardwareConcurrency: navigator.hardwareConcurrency || null,
      isMobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent),
      touchSupport: navigator.maxTouchPoints > 0,
    }
  } catch {
    return {}
  }
}

const getRating = (metricName, value) => {
  const threshold = THRESHOLDS[metricName]
  if (!threshold) return 'unknown'
  if (value <= threshold.good) return 'good'
  if (value <= threshold.needsImprovement) return 'needs-improvement'
  return 'poor'
}

const metricsBuffer = []
let flushScheduled = false

const scheduleFlush = () => {
  if (flushScheduled) return
  flushScheduled = true
  if ('scheduler' in window && 'postTask' in window.scheduler) {
    window.scheduler.postTask(flushMetrics, { priority: 'background' })
  } else if ('requestIdleCallback' in window) {
    window.requestIdleCallback(flushMetrics, { timeout: 5000 })
  } else {
    setTimeout(flushMetrics, 2000)
  }
}

const flushMetrics = async () => {
  flushScheduled = false
  if (metricsBuffer.length === 0) return

  const batch = metricsBuffer.splice(0, metricsBuffer.length)

  if (IS_DEV) {
    batch.forEach((m) => {
      const rating = getRating(m.name, m.value)
      const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌'
      console.group(`[Trackr Analytics] ${emoji} ${m.name}`)
      console.log('Value:', m.name === 'CLS' ? m.value.toFixed(4) : `${Math.round(m.value)}ms`)
      console.log('Rating:', rating)
      console.log('Full payload:', m)
      console.groupEnd()
    })
  }

  if (!IS_PROD) return

  try {
    await sendToVercelAnalytics(batch)
  } catch (err) {
    if (IS_DEV) console.warn('[Trackr Analytics] Vercel send failed:', err)
    try {
      await sendViaBeacon(batch)
    } catch (beaconErr) {
      if (IS_DEV) console.warn('[Trackr Analytics] Beacon fallback failed:', beaconErr)
    }
  }
}

const sendToVercelAnalytics = async (batch) => {
  if (typeof window.__va === 'function') {
    batch.forEach((metric) => {
      window.__va('event', {
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
        url: metric.url,
        sessionId: metric.sessionId,
        deviceInfo: metric.deviceInfo,
        networkInfo: metric.networkInfo,
      })
    })
    return
  }

  if ('sendBeacon' in navigator) {
    const payload = JSON.stringify({ metrics: batch, timestamp: Date.now() })
    const blob = new Blob([payload], { type: 'application/json' })
    navigator.sendBeacon('/_vercel/insights/vitals', blob)
    return
  }

  const response = await fetch('/_vercel/insights/vitals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metrics: batch, timestamp: Date.now() }),
    keepalive: true,
  })

  if (!response.ok) throw new Error(`HTTP ${response.status}`)
}

const sendViaBeacon = async (batch) => {
  const payload = JSON.stringify({ metrics: batch, source: 'beacon-fallback', timestamp: Date.now() })
  const blob = new Blob([payload], { type: 'application/json' })
  if ('sendBeacon' in navigator) {
    navigator.sendBeacon('/api/vitals', blob)
  }
}

const createMetricPayload = (metric) => {
  const network = getNetworkInfo()