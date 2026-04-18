import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

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
    <App />
  </StrictMode>,
)