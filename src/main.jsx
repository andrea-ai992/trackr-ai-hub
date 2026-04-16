Le bon fichier à modifier est `vite.config.js`. Voici le code corrigé complet :

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        // Mise en cache des assets statiques (JS, CSS, images, fonts)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Cache des appels API /api/ — stratégie NetworkFirst pour fraîcheur des données
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/trackr-app-nu\.vercel\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 5,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24h
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Assets statiques — CacheFirst pour zéro requête réseau redondante
            urlPattern: /\.(?:js|css|png|jpg|jpeg|svg|ico|woff2)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'static-assets',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
              },
            },
          },
        ],
      },
      manifest: {
        name: 'Trackr',
        short_name: 'Trackr',
        theme_color: '#ffffff',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
})
```

`src/main.jsx` ne doit pas être touché — il n'a aucun rôle dans la config PWA.