Je vais générer tous les fichiers complets et les pousser sur GitHub.

**FICHIER 1: vite.config.js**

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssMinify: true,
    reportCompressedSize: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['react-router-dom'],
          'vendor-charts': ['recharts'],
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
})
```

---

**FICHIER 2: src/components/PageSkeleton.jsx**

```jsx
import { useEffect, useState } from 'react'

const keyframes = `
  @keyframes skeletonShimmer {
    0% { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }
`

function SkeletonBar({ width = '100%', height = 16, borderRadius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
        backgroundSize: '800px 100%',
        animation: 'skeletonShimmer 1.6s infinite linear',
        flexShrink: 0,
        ...style,
      }}
    />
  )
}

function SkeletonCircle({ size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'linear-gradient(90deg, #111 25%, #1a1a1a 50%, #111 75%)',
        backgroundSize: '800px 100%',
        animation: 'skeletonShimmer 1.6s infinite linear',
        flexShrink: 0,
      }}
    />
  )
}

function SkeletonCard() {
  return (
    <div
      style={{
        background: '#12121a',
        border: '1px solid rgba(102,0,234,0.12)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <SkeletonCircle size={40} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <SkeletonBar width="55%" height={14} />
          <SkeletonBar width="35%" height={11} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <SkeletonBar width={70} height={14} />
          <SkeletonBar width={50} height={20} borderRadius={6} />
        </div>
      </div>
      <SkeletonBar width="100%" height={52} borderRadius={8} />
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <SkeletonBar width="50%" height={10} />
            <SkeletonBar width="70%" height={12} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function PageSkeleton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <style>{keyframes}</style>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#080808',
          zIndex: 9999,
          overflowY: 'auto',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.2s ease',
        }}
      >
        <div
          style={{
            maxWidth: 480,
            margin: '0 auto',
            padding: '0 16px 100px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 0',
              marginBottom: 8,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <SkeletonBar width={140} height={20} />
              <SkeletonBar width={100} height={12} />
            </div>
            <SkeletonBar width={36} height={36} borderRadius={10} />
          </div>

          <div
            style={{
              display: 'flex',
              gap: 12,
              padding: '12px 16px',
              background: '#12121a',
              border: '1px solid rgba(102,0,234,0.12)',
              borderRadius: 12,
              marginBottom: 16,
            }}
          >
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <SkeletonBar width="60%" height={10} />
                <SkeletonBar width="80%" height={14} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[...Array(5)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>

        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            height: 72,
            background: 'rgba(8,8,8,0.95)',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-around',
            padding: '0 24px',
            backdropFilter: 'blur(20px)',
          }}
        >
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}
            >
              <SkeletonBar width={24} height={24} borderRadius={6} />
              <SkeletonBar width={32} height={8} borderRadius={4} />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
```

---

**FICHIER 3: src/App.jsx**

```jsx
import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PageSkeleton from './components/PageSkeleton'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const CryptoMarkets = lazy(() => import('./pages/CryptoMarkets'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Watchlist = lazy(() => import('./pages/Watchlist'))
const Settings = lazy(() => import('./pages/Settings'))

function SuspenseRoute({ children }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <SuspenseRoute>
              <Dashboard />
            </SuspenseRoute>
          }
        />
        <Route
          path="/markets"
          element={
            <SuspenseRoute>
              <CryptoMarkets />
            </SuspenseRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <SuspenseRoute>
              <Portfolio />
            </SuspenseRoute>
          }
        />
        <Route
          path="/watchlist"
          element={
            <SuspenseRoute>
              <Watchlist />
            </SuspenseRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <SuspenseRoute>
              <Settings />
            </SuspenseRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
```

---

**FICHIER 4: src/pages/CryptoMarkets.jsx**

```jsx
import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = {
  bg: '#0a0a0f',
  card: '#12121a',
  cardBorder: 'rgba(102,0,234,0.15)',
  purple: '#6600ea',
  purpleLight: '#8b33ff',
  purpleDim: 'rgba(102,0,234,0.12)',
  red: '#ff2d55',
  redDim: 'rgba(255,45,85,0.12)',
  green: '#30d158',
  greenDim: 'rgba(48,209,88,0.12)',
  gold: '#ffd60a',
  goldDim: 'rgba(255,214,10,0.12)',
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.55)',
  textDim: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.06)',
}

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd' +
  '&order=market_cap_desc' +
  '&per_page=20' +
  '&page=1' +
  '&sparkline=true' +
  '&price_change_percentage=24h'

const CACHE_KEY = 'trackr_crypto_markets'
const CACHE_TTL = 5 * 60 * 1000
const FETCH_TIMEOUT = 10000

const ANIM_STYLES = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
  .crypto-card {
    animation: fadeIn 0.3s ease forwards;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }
  .crypto-card:active {
    transform: scale(0.985);
  }
`

function getCachedData() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) {
      localStorage.removeItem(CACHE_KEY)
      return null
    }
    return data
  } catch {
    return null
  }
}

function setCachedData(data) {
  try {
    localStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    )
  } catch {
    // storage full or unavailable — ignore
  }
}

function fmt(n, decimals = 2) {
  if (n == null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (n >= 1e3) return `$${n.toLocaleString('en-US', { maximumFractionDigits: decimals })}`
  return `$${n.toFixed(decimals)}`
}

function fmtPrice(n) {
  if (n == null) return '—'
  if (n >= 1000) return `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`
  if (n >= 1) return `$${n.toFixed(2)}`
  if (n >= 0.01) return `$${n.toFixed(4)}`
  return `$${n.toFixed(6)}`
}

function SparklineChart({ data, color }) {
  if (!data || data.length === 0) return null
  const points = data.map((v, i) => ({ i, v }))
  return (
    <ResponsiveContainer width="100%" height={52}>
      <LineChart data={points} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={() => null}
          cursor={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

function CoinCard({ coin, rank, onClick }) {
  const change = coin.price_change_percentage_24h ?? 0
  const isUp = change >= 0
  const changeColor = isUp ? COLORS.green : COLORS.red
  const changeBg = isUp ? COLORS.greenDim : COLORS.redDim
  const sparkData = coin.sparkline_in_7d?.price ?? []

  return (
    <div
      className="crypto-card"
      onClick={() => onClick(coin)}
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 16,
        padding: '14px 16px',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        animationDelay: `${rank * 0.04}s`,
        opacity: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={coin.image}
            alt={coin.name}
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            style={{ borderRadius: '50%', display: 'block' }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -2,
              right: -2,
              width: 16,
              height: 16,
              borderRadius: '50%',
              background: COLORS.bg,
              border: `1px solid ${COLORS.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 8,
              color: COLORS.textDim,
              fontWeight: 700,
            }}
          >
            {rank}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: COLORS.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {coin.name}
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSub, marginTop: 2 }}>
            {coin.symbol.toUpperCase()}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>
            {fmtPrice(coin.current_price)}
          </div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              color: changeColor,
              background: changeBg,
              borderRadius: 6,
              padding: '2px 7px',
            }}
          >
            {isUp ? '+' : ''}{change.toFixed(2)}%
          </div>
        </div>
      </div>

      {sparkData.length > 0 && (
        <SparklineChart data={sparkData} color={changeColor} />
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '8px 12px',
          paddingTop: 8,
          borderTop: `1px solid ${COLORS.border}`,
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>Market Cap</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSub }}>
            {fmt(coin.market_cap)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>Volume 24h</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSub }}>
            {fmt(coin.total_volume)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>High 24h</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.green