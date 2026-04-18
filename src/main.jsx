import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Lazy load heavy pages
const Sports = lazy(() => import('./pages/Sports.jsx'))
const Markets = lazy(() => import('./pages/Markets.jsx'))
const CryptoTrader = lazy(() => import('./pages/CryptoTrader.jsx'))
const BrainExplorer = lazy(() => import('./pages/BrainExplorer.jsx'))

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: 'var(--bg)',
    color: 'var(--t1)'
  }}>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem'
    }}>
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
      </svg>
      <span style={{ color: 'var(--t2)' }}>Loading...</span>
    </div>
  </div>
)

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
  // Handle SW navigation messages
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data?.type === 'NAVIGATE' && e.data.url) {
      window.location.href = e.data.url
    }
  })
}

const CSP = `
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' https://trackr-app-nu.vercel.app;
  frame-src 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  block-all-mixed-content;
  upgrade-insecure-requests;
`

const meta = document.createElement('meta')
meta.httpEquiv = 'Content-Security-Policy'
meta.content = CSP
document.head.appendChild(meta)

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<LoadingFallback />}>
      <App />
    </Suspense>
  </StrictMode>,
)