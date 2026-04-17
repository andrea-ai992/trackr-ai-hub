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
              cacheName: 'api-cache-v5',
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
              cacheName: 'images-cache-v5',
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
              cacheName: 'fonts-cache-v5',
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
              cacheName: 'static-assets-v5',
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
              cacheName: 'google-fonts-stylesheets-v5',
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
              cacheName: 'google-fonts-webfonts-v5',
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
    minify: 'terser',
    cssMinify: 'lightningcss',
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 350,
    assetsInlineLimit: 2048,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
          'console.trace',
        ],
        passes: 3,
        unsafe: true,
        unsafe_arrows: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_methods: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        toplevel: true,
        dead_code: true,
        collapse_vars: true,
        reduce_vars: true,
        hoist_funs: true,
        hoist_vars: false,
        join_vars: true,
        loops: true,
        negate_iife: true,
        sequences: true,
        side_effects: true,
        switches: true,
        typeofs: true,
        keep_fargs: false,
        keep_infinity: true,
        booleans: true,
        comparisons: true,
        conditionals: true,
        evaluate: true,
        if_return: true,
        inline: 3,
        merge_vars: true,
        unused: true,
        global_defs: {
          'process.env.NODE_ENV': '"production"',
        },
      },
      mangle: {
        toplevel: true,
        safari10: false,
        keep_classnames: false,
        keep_fnames: false,
        properties: {
          regex: /^_private_/,
        },
      },
      format: {
        comments: false,
        ascii_only: true,
        ecma: 2020,
        wrap_iife: true,
        semicolons: false,
      },
      ecma: 2020,
      toplevel: true,
      nameCache: {},
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
        tryCatchDeoptimization: false,
        correctVarValueBeforeDeclaration: false,
        preset: 'recommended',
      },
      output: {
        experimentalMinChunkSize: 10000,
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
          if (id.includes('src/pages/')) {
            const match = id.match(/src\/pages\/([^/]+)/)
            if (match) {
              const pageName = match[1]
                .replace(/\.(jsx|tsx|js|ts)$/, '')
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '-')
              return `page-${pageName}`
            }
          }
          if (id.includes('src/components/')) {
            if (
              id.includes('components/ui/') ||
              id.includes('components/common/') ||
              id.includes('components/shared/')
            ) return 'common-ui'
            if (
              id.includes('components/chart') ||
              id.includes('components/graph') ||
              id.includes('components/widget')
            ) return 'common-charts'
          }
          if (
            id.includes('src/utils/') ||
            id.includes('src/lib/') ||
            id.includes('src/helpers/')
          ) return 'common-utils'
          if (
            id.includes('src/hooks/') ||
            id.includes('src/store/') ||
            id.includes('src/context/')
          ) return 'common-core'
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
      '@lib': '/src/lib',
      '@store': '/src/store',
      '@context': '/src/context',
      '@assets': '/src/assets',
      '@types': '/src/types',
    },
  },

  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: {
        chrome: 90,
        firefox: 88,
        safari: 14,
      },
      drafts: {
        nesting: true,
        customMedia: true,
      },
      nonStandard: {
        deepSelectorCombinator: true,
      },
      errorRecovery: true,
    },
    devSourcemap: false,
  },
}))

---

FICHIER 2: src/utils/performanceMetrics.ts

import type {
  CLSMetric,
  FCPMetric,
  FIDMetric,
  INPMetric,
  LCPMetric,
  TTFBMetric,
  Metric,
} from 'web-vitals'

export type MetricName = 'CLS' | 'FCP' | 'FID' | 'INP' | 'LCP' | 'TTFB'

export type MetricRating = 'good' | 'needs-improvement' | 'poor'

export interface PerformanceEntry {
  name: MetricName
  value: number
  rating: MetricRating
  delta: number
  id: string
  navigationType: string
  timestamp: number
  url: string
  userAgent: string
  connectionType: string
  deviceMemory: number | null
  hardwareConcurrency: number
}

export interface PerformanceHistory {
  entries: PerformanceEntry[]
  sessionId: string
  createdAt: number
  updatedAt: number
  version: string
}

export interface PerformanceSummary {
  averages: Record<MetricName, number | null>
  ratings: Record<MetricName, MetricRating | null>
  sampleCounts: Record<MetricName, number>
  lastUpdated: number
  sessionId: string
  overallScore: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
}

const STORAGE_KEY = 'trackr_perf_metrics_v3'
const SESSION_KEY = 'trackr_perf_session_v3'
const MAX_ENTRIES = 200
const HISTORY_TTL_MS = 7 * 24 * 60 * 60 * 1000
const VERSION = '3.0.0'

const THRESHOLDS: Record<MetricName, { good: number; poor: number }> = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  INP: { good: 200, poor: 500 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
}

const METRIC_WEIGHTS: Record<MetricName, number> = {
  LCP: 25,
  FID: 25,
  CLS: 25,
  INP: 15,
  FCP: 5,
  TTFB: 5,
}

function generateSessionId(): string {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 9)
  return `trackr_${timestamp}_${random}`
}

function getOrCreateSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY)
    if (existing) return existing
    const newId = generateSessionId()
    sessionStorage.setItem(SESSION_KEY, newId)
    return newId