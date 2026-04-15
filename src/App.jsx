import { useState, useRef } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { SettingsProvider } from './context/SettingsContext'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import SearchOverlay from './components/SearchOverlay'
import Dashboard from './pages/Dashboard'
import Markets from './pages/Markets'
import StockDetail from './pages/StockDetail'
import CryptoDetail from './pages/CryptoDetail'
import News from './pages/News'
import FlightTracker from './pages/FlightTracker'
import More from './pages/More'
import Translator from './pages/Translator'
import Settings from './pages/Settings'
import CategoryPage from './pages/CategoryPage'
import Sneakers from './pages/Sneakers'
import Portfolio from './pages/Portfolio'
import Widget from './pages/Widget'
import Sports from './pages/Sports'
import Andy from './pages/Andy'
import { useAlerts } from './hooks/useAlerts'
import { useNewsAlerts } from './hooks/useNewsAlerts'
import { Search } from 'lucide-react'
import VoiceAssistant from './components/VoiceAssistant'

function AlertWatcher() {
  useAlerts()
  useNewsAlerts()
  return null
}

// ── Determine animation direction ────────────────────────────────────────────
function getTabIndex(path) {
  if (path === '/') return 0
  if (path.startsWith('/sports')) return 1
  if (path.startsWith('/markets')) return 2
  if (path.startsWith('/news')) return 3
  if (
    path.startsWith('/more') || path.startsWith('/translator') ||
    path.startsWith('/settings') || path.startsWith('/sneakers') ||
    path.startsWith('/portfolio') || path.startsWith('/category') ||
    path.startsWith('/flights')
  ) return 4
  return -1
}

const DETAIL_PREFIXES = ['/stocks/', '/crypto/', '/translator', '/settings', '/sneakers', '/portfolio', '/category/', '/flights', '/andy']

// Module-level so it persists across PageTransition renders without remounting
let _prevPath = '/'

function PageTransition({ children }) {
  const location = useLocation()

  // Compute animation class synchronously during render
  let animClass = 'page-enter-right'
  if (location.pathname !== _prevPath) {
    const isDetail = DETAIL_PREFIXES.some(p => location.pathname.startsWith(p))
    if (isDetail) {
      animClass = 'page-enter-up'
    } else {
      const prevIdx = getTabIndex(_prevPath)
      const nextIdx = getTabIndex(location.pathname)
      if (prevIdx === -1 || nextIdx === -1 || prevIdx === nextIdx) {
        animClass = 'page-enter-right'
      } else {
        animClass = nextIdx > prevIdx ? 'page-enter-right' : 'page-enter-left'
      }
    }
    _prevPath = location.pathname
  }

  return (
    <div key={location.key} className={animClass} style={{ willChange: 'transform' }}>
      {children}
    </div>
  )
}

// ── Global search button (hidden on /flights which has its own search) ────────
function GlobalSearchButton({ onOpen }) {
  const location = useLocation()
  if (location.pathname.startsWith('/flights')) return null
  if (location.pathname.startsWith('/widget')) return null
  if (location.pathname.startsWith('/andy')) return null

  return (
    <button
      onClick={onOpen}
      className="press-scale"
      style={{
        position: 'fixed',
        top: 'max(12px, env(safe-area-inset-top, 0px))',
        right: 16,
        zIndex: 900,
        width: 40,
        height: 40,
        borderRadius: 14,
        background: 'rgba(11,19,35,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#9ca3af',
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      }}
    >
      <Search size={16} />
    </button>
  )
}

// ── Inner app (needs Router context) ─────────────────────────────────────────
function AppInner() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <AlertWatcher />
      <Toast />
      <GlobalSearchButton onOpen={() => setSearchOpen(true)} />
      <VoiceAssistant />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <div style={{ minHeight: '100dvh', background: '#0b1323', color: '#dbe2f8' }}>
        {/* Aurora background blobs (Stitch / Celestial AI style) */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div className="aurora-blob" style={{ top: '-15%', left: '-10%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, #6600ea 0%, transparent 70%)' }} />
          <div className="aurora-blob aurora-blob-2" style={{ bottom: '-15%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, #00e5ff 0%, transparent 70%)' }} />
          <div className="aurora-blob" style={{ top: '40%', right: '20%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, #cf5cff 0%, transparent 70%)', animationDelay: '-3s', animationDuration: '18s' }} />
        </div>
        <main style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 8px)', position: 'relative', zIndex: 1 }}>
          <PageTransition>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/flights" element={<FlightTracker />} />
              <Route path="/markets" element={<Markets />} />
              <Route path="/stocks/:id" element={<StockDetail />} />
              <Route path="/crypto/:id" element={<CryptoDetail />} />
              <Route path="/news" element={<News />} />
              <Route path="/more" element={<More />} />
              <Route path="/translator" element={<Translator />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/sneakers" element={<Sneakers />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/category/:id" element={<CategoryPage />} />
              <Route path="/sports" element={<Sports />} />
              <Route path="/widget" element={<Widget />} />
              <Route path="/andy" element={<Andy />} />
            </Routes>
          </PageTransition>
        </main>
        <BottomNav />
      </div>
    </>
  )
}

export default function App() {
  return (
    <SettingsProvider>
      <AppProvider>
        <BrowserRouter>
          <AppInner />
        </BrowserRouter>
      </AppProvider>
    </SettingsProvider>
  )
}
