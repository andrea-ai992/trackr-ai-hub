import { useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { SettingsProvider } from './context/SettingsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
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
import Watches from './pages/Watches'
import RealEstate from './pages/RealEstate'
import BusinessPlan from './pages/BusinessPlan'
import Portfolio from './pages/Portfolio'
import Widget from './pages/Widget'
import Sports from './pages/Sports'
import Andy from './pages/Andy'
import Agents from './pages/Agents'
import BrainStatus from './pages/BrainStatus'
import Login from './pages/Login'
import Admin from './pages/Admin'
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
    path.startsWith('/settings') || path.startsWith('/sneakers') || path.startsWith('/watches') ||
    path.startsWith('/real-estate') || path.startsWith('/business') ||
    path.startsWith('/portfolio') || path.startsWith('/category') ||
    path.startsWith('/flights')
  ) return 4
  return -1
}

const DETAIL_PREFIXES = ['/stocks/', '/crypto/', '/translator', '/settings', '/sneakers', '/watches', '/real-estate', '/business', '/portfolio', '/category/', '/flights', '/andy', '/agents', '/brain', '/admin']

// Module-level so it persists across PageTransition renders without remounting
let _prevPath = '/'
let _prevTabIdx = 0

function PageTransition({ children }) {
  const location = useLocation()

  let animClass = 'page-enter-fade'

  if (location.pathname !== _prevPath) {
    const isDetail     = DETAIL_PREFIXES.some(p => location.pathname.startsWith(p))
    const wasDetail    = DETAIL_PREFIXES.some(p => _prevPath.startsWith(p))
    const currTabIdx   = getTabIndex(location.pathname)
    const prevTabIdx   = getTabIndex(_prevPath)

    if (isDetail && !wasDetail) {
      // Drilling into a detail page — slide up
      animClass = 'page-enter-up'
    } else if (!isDetail && wasDetail) {
      // Returning to a tab — fade scale in
      animClass = 'page-enter-fade'
    } else if (currTabIdx !== -1 && prevTabIdx !== -1 && currTabIdx !== prevTabIdx) {
      // Switching between main tabs — slide directionally
      animClass = currTabIdx > prevTabIdx ? 'page-enter-right' : 'page-enter-left'
    } else {
      animClass = 'page-enter-fade'
    }

    _prevPath    = location.pathname
    _prevTabIdx  = currTabIdx
  }

  return (
    <div key={location.key} className={animClass} style={{ willChange: 'transform, opacity' }}>
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

// ── Protected route — bypasses auth if Supabase not configured ───────────────
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  // If Supabase not set up yet, let everyone through
  if (!import.meta.env.VITE_SUPABASE_URL) return children
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

// ── Admin-only route ──────────────────────────────────────────────────────────
function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (!import.meta.env.VITE_SUPABASE_URL) return children
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
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
              {/* Public */}
              <Route path="/login" element={<Login />} />

              {/* App routes — open if Supabase not configured, protected otherwise */}
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/flights" element={<ProtectedRoute><FlightTracker /></ProtectedRoute>} />
              <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
              <Route path="/stocks/:id" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
              <Route path="/crypto/:id" element={<ProtectedRoute><CryptoDetail /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
              <Route path="/translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/sneakers" element={<ProtectedRoute><Sneakers /></ProtectedRoute>} />
              <Route path="/watches" element={<ProtectedRoute><Watches /></ProtectedRoute>} />
              <Route path="/real-estate" element={<ProtectedRoute><RealEstate /></ProtectedRoute>} />
              <Route path="/business" element={<ProtectedRoute><BusinessPlan /></ProtectedRoute>} />
              <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
              <Route path="/category/:id" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
              <Route path="/sports" element={<ProtectedRoute><Sports /></ProtectedRoute>} />
              <Route path="/widget" element={<ProtectedRoute><Widget /></ProtectedRoute>} />
              <Route path="/andy" element={<ProtectedRoute><Andy /></ProtectedRoute>} />
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route path="/brain" element={<ProtectedRoute><BrainStatus /></ProtectedRoute>} />

              {/* Admin only */}
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
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
          <AuthProvider>
            <AppInner />
          </AuthProvider>
        </BrowserRouter>
      </AppProvider>
    </SettingsProvider>
  )
}
