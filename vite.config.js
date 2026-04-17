Je vais générer tous les fichiers complets et production-ready.

---

FICHIER 1: vite.config.js

import { defineConfig, splitVendorChunkPlugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { visualizer } from 'rollup-plugin-visualizer'

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
    splitVendorChunkPlugin(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,ttf,eot,webp,avif}'],
        globIgnores: ['**/node_modules/**/*', 'sw.js', 'workbox-*.js'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache-v2',
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
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache-v2',
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
              cacheName: 'fonts-cache-v2',
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets',
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
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxEntries: 30,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        sourcemap: false,
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
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
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
            src: '/icons/icon-maskable-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
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
    cssMinify: true,
    sourcemap: false,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 500,
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    modulePreload: {
      polyfill: true,
    },
    rollupOptions: {
      treeshake: {
        moduleSideEffects: false,
        propertyReadSideEffects: false,
        unknownGlobalSideEffects: false,
      },
      output: {
        experimentalMinChunkSize: 10000,
        compact: true,
        generatedCode: {
          preset: 'es2015',
          constBindings: true,
        },
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react-dom') || id.includes('react/')) {
              return 'vendor-react'
            }
            if (id.includes('react-router')) {
              return 'vendor-router'
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('victory')) {
              return 'vendor-charts'
            }
            if (id.includes('@radix-ui') || id.includes('lucide-react') || id.includes('framer-motion')) {
              return 'vendor-ui'
            }
            if (id.includes('firebase') || id.includes('@firebase')) {
              return 'vendor-firebase'
            }
            if (id.includes('openai') || id.includes('anthropic') || id.includes('cohere')) {
              return 'vendor-ai'
            }
            if (id.includes('date-fns') || id.includes('dayjs') || id.includes('luxon')) {
              return 'vendor-date'
            }
            if (id.includes('zustand') || id.includes('jotai') || id.includes('redux')) {
              return 'vendor-state'
            }
            return 'vendor-misc'
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: ({ name }) => {
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico|webp|avif)$/i.test(name)) {
            return 'assets/images/[name]-[hash][extname]'
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return 'assets/fonts/[name]-[hash][extname]'
          }
          if (/\.css$/i.test(name)) {
            return 'assets/css/[name]-[hash][extname]'
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    esbuild: {
      legalComments: 'none',
      drop: ['console', 'debugger'],
      target: 'esnext',
      treeShaking: true,
    },
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react-router-dom',
      'react/jsx-runtime',
    ],
    exclude: ['@vite/client', '@vite/env'],
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
    },
  },

  esbuild: {
    jsxInject: undefined,
    legalComments: 'none',
    treeShaking: true,
  },
}))

---

FICHIER 2: src/server/middleware/securityHeaders.js

'use strict'

const ALLOWED_ORIGINS = [
  'https://trackr-app-nu.vercel.app',
  'https://trackr-ai-hub.vercel.app',
  ...(process.env.NODE_ENV === 'development'
    ? ['http://localhost:5173', 'http://localhost:4173', 'http://127.0.0.1:5173']
    : []),
  ...(process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim()) : []),
]

const CSP_DIRECTIVES = {
  'default-src': ["'self'"],

  'script-src': [
    "'self'",
    "'strict-dynamic'",
    'https://apis.google.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    "'wasm-unsafe-eval'",
  ],

  'style-src': [
    "'self'",
    'https://fonts.googleapis.com',
    "'unsafe-inline'",
  ],

  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:',
  ],

  'img-src': [
    "'self'",
    'data:',
    'blob:',
    'https:',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com',
    'https://avatars.githubusercontent.com',
    'https://lh3.googleusercontent.com',
    'https://trackr-app-nu.vercel.app',
  ],

  'connect-src': [
    "'self'",
    'https://trackr-app-nu.vercel.app',
    'https://api.openai.com',
    'https://generativelanguage.googleapis.com',
    'https://firebaseinstallations.googleapis.com',
    'https://identitytoolkit.googleapis.com',
    'https://securetoken.googleapis.com',
    'https://www.google-analytics.com',
    'https://analytics.google.com',
    'wss://trackr-app-nu.vercel.app',
    ...(process.env.NODE_ENV === 'development'
      ? ['http://localhost:5173', 'ws://localhost:5173', 'http://localhost:4173']
      : []),
  ],

  'media-src': ["'self'", 'blob:', 'data:'],

  'object-src': ["'none'"],

  'frame-src': ["'none'"],

  'frame-ancestors': ["'none'"],

  'base-uri': ["'self'"],

  'form-action': ["'self'"],

  'manifest-src': ["'self'"],

  'worker-src': ["'self'", 'blob:'],

  'child-src': ["'self'", 'blob:'],

  'upgrade-insecure-requests': [],

  'block-all-mixed-content': [],
}

function buildCSP(directives, nonce) {
  const parts = []

  for (const [directive, sources] of Object.entries(directives)) {
    if (sources.length === 0) {
      parts.push(directive)
    } else {
      let sourcesWithNonce = [...sources]

      if (
        directive === 'script-src' &&
        nonce &&
        !sourcesWithNonce.includes("'strict-dynamic'")
      ) {
        sourcesWithNonce.unshift(`'nonce-${nonce}'`)
      } else if (directive === 'script-src' && nonce) {
        sourcesWithNonce.unshift(`'nonce-${nonce}'`)
      }

      parts.push(`${directive} ${sourcesWithNonce.join(' ')}`)
    }
  }

  return parts.join('; ')
}

function generateNonce() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return Buffer.from(crypto.randomUUID().replace(/-/g, ''), 'hex').toString('base64')
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

function isOriginAllowed(origin) {
  if (!origin) return false
  return ALLOWED_ORIGINS.includes(origin)
}

function securityHeaders(options = {}) {
  const {
    enableHSTS = true,
    hstsMaxAge = 31536000,
    hstsIncludeSubDomains = true,
    hstsPreload = true,
    enableCSP = true,
    enableCORS = true,
    enableNonce = false,
    reportUri = null,
    permissionsPolicy = true,
  } = options

  return function securityHeadersMiddleware(req, res, next) {
    const nonce = enableNonce ? generateNonce() : null

    if (nonce) {
      res.locals.cspNonce = nonce
    }

    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')

    res.setHeader('X-Content-Type-Options', 'nosniff')

    res.setHeader('X-Frame-Options', 'DENY')

    res.setHeader('X-XSS-Protection', '0')

    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')

    if (enableHSTS && req.secure) {
      let hstsValue = `max-age=${hstsMaxAge}`
      if (hstsIncludeSubDomains) hstsValue += '; includeSubDomains'
      if (hstsPreload) hstsValue += '; preload'
      res.setHeader('Strict-Transport-Security', hstsValue)
    } else if (enableHSTS) {
      let hstsValue = `max-age=${hstsMaxAge}`
      if (hstsIncludeSubDomains) hstsValue += '; includeSubDomains'
      if (hstsPreload) hstsValue += '; preload'
      res.setHeader('Strict-Transport-Security', hstsValue)
    }

    if (enableCSP) {
      const directives = { ...CSP_DIRECTIVES }

      if (reportUri) {
        directives['report-uri'] = [reportUri]
        directives['report-to'] = ['default']
      }

      const cspValue = buildCSP(directives, nonce)
      res.setHeader('Content-Security-Policy', cspValue)
    }

    if (permissionsPolicy) {
      res.setHeader(
        'Permissions-Policy',
        [
          'accelerometer=()',
          'ambient-light-sensor=()',
          'autoplay=(self)',
          'battery=()',
          'camera=()',
          'cross-origin-isolated=()',
          'display-capture=()',
          'document-domain=()',
          'encrypted-media=()',
          'execution-while-not-rendered=()',
          'execution-while-out-of-viewport=()',
          'fullscreen=(self)',
          'geolocation=()',
          'gyroscope=()',
          'keyboard-map=()',
          'magnetometer=()',
          'microphone=()',
          'midi=()',
          'navigation-override=()',
          'payment=()',
          'picture-in-picture=()',
          'publickey-credentials-get=()',
          'screen-wake-lock=()',
          'sync-xhr=(