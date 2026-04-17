Je vais générer tous les fichiers complets pour l'optimisation performance et sécurité de Trackr.

---

FILE: package.json

{
  "name": "trackr-ai-hub",
  "private": true,
  "version": "1.2.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "analyze": "vite build --mode analyze"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "react-router-dom": "^6.22.0",
    "@tanstack/react-query": "^5.28.0",
    "@tanstack/react-query-devtools": "^5.28.0",
    "dompurify": "^3.1.0",
    "axios": "^1.6.8",
    "zustand": "^4.5.2",
    "lucide-react": "^0.363.0",
    "framer-motion": "^11.0.24",
    "date-fns": "^3.6.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.2"
  },
  "devDependencies": {
    "@types/dompurify": "^3.0.5",
    "@vitejs/plugin-react": "^4.2.1",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.3",
    "vite": "^5.2.8",
    "vite-plugin-compression": "^0.5.1",
    "vite-plugin-imagemin": "^0.6.1",
    "rollup-plugin-visualizer": "^5.12.0",
    "eslint": "^8.57.0",
    "eslint-plugin-react": "^7.34.1",
    "eslint-plugin-react-hooks": "^4.6.0",
    "eslint-plugin-react-refresh": "^0.4.6"
  }
}

---

FILE: vite.config.js

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import compression from 'vite-plugin-compression';
import imagemin from 'vite-plugin-imagemin';
import { visualizer } from 'rollup-plugin-visualizer';
import { resolve } from 'path';

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isAnalyze = mode === 'analyze';
  const isProd = mode === 'production';

  return {
    plugins: [
      react({
        babel: {
          plugins: isProd ? [['transform-remove-console', { exclude: ['error', 'warn'] }]] : []
        }
      }),

      // Gzip compression
      compression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 1024,
        deleteOriginFile: false,
        filter: /\.(js|css|html|svg|json|wasm)$/i,
        verbose: true,
        disable: !isProd
      }),

      // Brotli compression (better than gzip for modern browsers)
      compression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 1024,
        deleteOriginFile: false,
        filter: /\.(js|css|html|svg|json|wasm)$/i,
        verbose: true,
        disable: !isProd,
        compressionOptions: {
          level: 11
        }
      }),

      // WebP image optimization
      imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false
        },
        optipng: {
          optimizationLevel: 7
        },
        mozjpeg: {
          quality: 80,
          progressive: true
        },
        pngquant: {
          quality: [0.8, 0.9],
          speed: 4
        },
        svgo: {
          plugins: [
            { name: 'removeViewBox', active: false },
            { name: 'removeEmptyAttrs', active: true },
            { name: 'cleanupIDs', active: true }
          ]
        },
        webp: {
          quality: 80,
          method: 6
        }
      }),

      // Bundle analyzer (only in analyze mode)
      isAnalyze && visualizer({
        open: true,
        gzipSize: true,
        brotliSize: true,
        filename: 'dist/bundle-stats.html',
        template: 'treemap'
      })
    ].filter(Boolean),

    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@store': resolve(__dirname, 'src/store'),
        '@middleware': resolve(__dirname, 'src/middleware'),
        '@assets': resolve(__dirname, 'src/assets')
      }
    },

    build: {
      target: 'es2020',
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProd,
          drop_debugger: isProd,
          pure_funcs: isProd ? ['console.log', 'console.info', 'console.debug'] : [],
          passes: 2
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      },
      rollupOptions: {
        output: {
          // Manual chunk splitting for optimal caching
          manualChunks: (id) => {
            // React core
            if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
              return 'react-core';
            }
            // React Router
            if (id.includes('node_modules/react-router-dom/') || id.includes('node_modules/react-router/')) {
              return 'react-router';
            }
            // React Query
            if (id.includes('@tanstack/react-query')) {
              return 'react-query';
            }
            // Animation library
            if (id.includes('node_modules/framer-motion/')) {
              return 'framer-motion';
            }
            // UI icons
            if (id.includes('node_modules/lucide-react/')) {
              return 'lucide-icons';
            }
            // Security utilities
            if (id.includes('node_modules/dompurify/')) {
              return 'security';
            }
            // Date utilities
            if (id.includes('node_modules/date-fns/')) {
              return 'date-fns';
            }
            // State management
            if (id.includes('node_modules/zustand/')) {
              return 'zustand';
            }
            // HTTP client
            if (id.includes('node_modules/axios/')) {
              return 'axios';
            }
            // Other vendor libs
            if (id.includes('node_modules/')) {
              return 'vendor';
            }
          },
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/') : [];
            const fileName = facadeModuleId[facadeModuleId.length - 2] || '[name]';
            return `assets/js/${fileName}/[name]-[hash].js`;
          },
          assetFileNames: (assetInfo) => {
            const ext = assetInfo.name?.split('.').pop()?.toLowerCase();
            if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'].includes(ext)) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (['css'].includes(ext)) {
              return 'assets/css/[name]-[hash][extname]';
            }
            if (['woff', 'woff2', 'ttf', 'eot'].includes(ext)) {
              return 'assets/fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
          entryFileNames: 'assets/js/[name]-[hash].js'
        }
      },
      cssCodeSplit: true,
      sourcemap: !isProd,
      reportCompressedSize: true,
      chunkSizeWarningLimit: 500
    },

    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@tanstack/react-query',
        'dompurify',
        'axios',
        'zustand'
      ],
      exclude: ['@tanstack/react-query-devtools']
    },

    server: {
      port: 3000,
      host: true,
      hmr: {
        overlay: true
      }
    },

    preview: {
      port: 4173,
      host: true
    },

    css: {
      devSourcemap: !isProd
    }
  };
});

---

FILE: vercel.json

{
  "version": 2,
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live https://*.vercel.app; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https: http:; connect-src 'self' https://api.openai.com https://*.vercel.app https://vercel.live wss://vercel.live https://api.anthropic.com https://generativelanguage.googleapis.com; frame-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests; block-all-mixed-content"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), interest-cohort=()"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        },
        {
          "key": "Cross-Origin-Embedder-Policy",
          "value": "require-corp"
        },
        {
          "key": "Cross-Origin-Opener-Policy",
          "value": "same-origin"
        },
        {
          "key": "Cross-Origin-Resource-Policy",
          "value": "same-origin"
        }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Vary",
          "value": "Accept-Encoding"
        }
      ]
    },
    {
      "source": "/assets/images/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        },
        {
          "key": "Vary",
          "value": "Accept"
        }
      ]
    },
    {
      "source": "/(.*)\\.br",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "br"
        },
        {
          "key": "Vary",
          "value": "Accept-Encoding"
        }
      ]
    },
    {
      "source": "/(.*)\\.gz",
      "headers": [
        {
          "key": "Content-Encoding",
          "value": "gzip"
        },
        {
          "key": "Vary",
          "value": "Accept-Encoding"
        }
      ]
    },
    {
      "source": "/index.html",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "regions": ["iad1", "cdg1"]
}

---

FILE: src/utils/securityUtils.js

import DOMPurify from 'dompurify';

// ============================================================
// CONSTANTS & CONFIGURATION
// ============================================================

const SECURITY_VERSION = '1.0.0';

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
  DEFAULT: { maxRequests: 20, windowMs: 60000 },
  AI_API: { maxRequests: 10, windowMs: 60000 },
  AUTH: { maxRequests: 5, windowMs: 300000 },
  SEARCH: { maxRequests: 30, windowMs: 60000 },
  UPLOAD: { maxRequests: 5, windowMs: 60000 }
};

// DOMPurify configuration for different contexts
const PURIFY_CONFIGS = {
  STRICT: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  },
  MARKDOWN: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'code', 'pre', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'blockquote', 'hr', 'span'],
    ALLOWED_ATTR: ['class'],
    ALLOW_DATA_ATTR: false
  },
  RICH_TEXT: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'span', 'div', 'code', 'pre'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    ALLOW_DATA_ATTR: false,
    FORCE_BODY: true,
    HOOK: 'afterSanitizeAttributes'
  }
};

// ============================================================
// PROMPT INJECTION DETECTION
// ============================================================

// Regex patterns for detecting prompt injection attempts
const INJECTION_PATTERNS = [
  // Direct instruction override attempts
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|context|rules?|constraints?)/gi,
  /disregard\s+(all\s+)?(previous|prior|above)\s+(instructions?|prompts?|context)/gi,
  /forget\s+(all\s+)?(previous|prior|everything|what\s+you|your)\s*(instructions?|prompts?|context|told)?/gi,
  /override\s+(previous|prior|all|your)?\s*(instructions?|prompts?|settings?|mode|persona)/gi,
  /bypass\s+(previous|all|your)?\s*(instructions?|safety|filters?|guidelines?|restrictions?)/gi,

  // Role/persona manipulation
  /you\s+are\s+now\s+(a\s+)?(different|new|another|evil|unrestricted|jailbroken|free|unlocked|DAN)/gi,
  /act\s+as\s+(if\s+you\s+(are|were)\s+)?(a\s+)?(different|evil|unrestricted|DAN|jailbroken|free)/gi,
  /pretend\s+(you\s+are|to\s+be)\s+(a\s+)?(different|evil|unrestricted|human|real\s+person)/gi,
  /roleplay\s+as\s+(a\s+)?(different|evil|unrestricted|malicious)/gi,
  /from\s+now\s+on\s+(you\s+are|act\s+as|respond\s+as|pretend)/gi,
  /your\s+new\s+(role|persona|identity|instructions?|purpose|mission)\s+is/gi,
  /switch\s+to\s+(developer|admin|root|sudo|unrestricted|jailbreak)\s+mode/gi,

  // System prompt extraction
  /reveal\s+(your\s+)?(system\s+prompt|instructions?|initial\s+prompt|base\s+prompt|original\s+prompt)/gi,
  /show\s+me\s+(your\s+)?(system\s+prompt|hidden\s+instructions?|base\s+instructions?)/gi,
  /what\s+(are\s+your|is\s+your)\s+(system\s+prompt|hidden\s+instructions?|base\s+instructions?)/gi,
  /print\s+(your\s+)?(system\s+prompt|all\s+instructions?|original\s+instructions?)/gi,
  /output\s+(your\s+)?(system\s+prompt|initial\s+prompt|hidden\s+prompt)/gi,
  /repeat\s+(your\s+)?(system\s+prompt|instructions?|prompt|everything\s+before)/gi,

  // Delimiter injection
  /```\s*system/gi,
  /<\|system\|>/gi,
  /\[system\]/gi,
  /<<SYS>>/gi,
  /\[INST\]/gi,
  /<\|im_start\|>\s*system/gi,
  /###\s*(system|instruction|prompt)/gi,
  /---+\s*(system|instruction|end\s+of\s+prompt)/gi,
  /={3,}\s*(system|instruction|new\s+prompt)/gi,

  // Jailbreak specific patterns
  /jailbreak/gi,
  /DAN\s+(mode|prompt|jailbreak)/gi,
  /do