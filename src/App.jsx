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
import More from './pages/More'
import Translator from './pages/Translator'
import Settings from './pages/Settings'
import CategoryPage from './pages/CategoryPage'
import Sports from './pages/Sports'
import Andy from './pages/Andy'
import Agents from './pages/Agents'
import BrainStatus from './pages/BrainStatus'
import Login from './pages/Login'
import Portfolio from './pages/Portfolio'
import Widget from './pages/Widget'
import { useAlerts } from './hooks/useAlerts'
import { useNewsAlerts } from './hooks/useNewsAlerts'
import { Search } from 'lucide-react'
import VoiceAssistant from './components/VoiceAssistant'

const FlightTracker = React.lazy(() => import('./pages/FlightTracker'))
const ChartAnalysis = React.lazy(() => import('./pages/ChartAnalysis'))
const Patterns = React.lazy(() => import('./pages/Patterns'))
const CryptoTrader = React.lazy(() => import('./pages/CryptoTrader'))
const Signals = React.lazy(() => import('./pages/Signals'))
const RealEstate = React.lazy(() => import('./pages/RealEstate'))
const BusinessPlan = React.lazy(() => import('./pages/BusinessPlan'))
const Admin = React.lazy(() => import('./pages/Admin'))
const Sneakers = React.lazy(() => import('./pages/Sneakers'))
const Watches = React.lazy(() => import('./pages/Watches'))
const BrainExplorer = React.lazy(() => import('./pages/BrainExplorer'))
const Tasks = React.lazy(() => import('./pages/Tasks'))

function AlertWatcher() {
  useAlerts()
  useNewsAlerts()
  return null
}

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
    path.startsWith('/flights') || path.startsWith('/patterns')
  ) return 4
  return -1
}

const DETAIL_PREFIXES = ['/stocks/', '/crypto/', '/translator', '/settings', '/sneakers', '/watches', '/real-estate', '/business', '/portfolio', '/category/', '/flights', '/andy', '/agents', '/brain', '/admin', '/patterns']

let _prevPath = '/'

function PageTransition({ children }) {
  const location = useLocation()

  let animClass = 'page-enter-fade'

  if (location.pathname !== _prevPath) {
    const isDetail     = DETAIL_PREFIXES.some(p => location.pathname.startsWith(p))
    const wasDetail    = DETAIL_PREFIXES.some(p => _prevPath.startsWith(p))
    const currTabIdx   = getTabIndex(location.pathname)
    const prevTabIdx   = getTabIndex(_prevPath)

    if (isDetail && !wasDetail) {
      animClass = 'page-enter-up'
    } else if (!isDetail && wasDetail) {
      animClass = 'page-enter-fade'
    } else if (currTabIdx !== -1 && prevTabIdx !== -1 && currTabIdx !== prevTabIdx) {
      animClass = currTabIdx > prevTabIdx ? 'page-enter-right' : 'page-enter-left'
    } else {
      animClass = 'page-enter-fade'
    }

    _prevPath = location.pathname
  }

  return (
    <div key={location.key} className={animClass} style={{ willChange: 'transform, opacity' }}>
      {children}
    </div>
  )
}

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

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (!import.meta.env.VITE_SUPABASE_URL) return children
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (!import.meta.env.VITE_SUPABASE_URL) return children
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (!isAdmin) return <Navigate to="/" replace />
  return children
}

function AppInner() {
  const [searchOpen, setSearchOpen] = useState(false)

  return (
    <>
      <AlertWatcher />
      <Toast />
      <GlobalSearchButton onOpen={() => setSearchOpen(true)} />
      <VoiceAssistant />
      {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--t1)' }}>
        <main style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 8px)', position: 'relative', zIndex: 1 }}>
          <PageTransition>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route
                path="/flights"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><FlightTracker /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
              <Route path="/stocks/:id" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
              <Route path="/crypto/:id" element={<ProtectedRoute><CryptoDetail /></ProtectedRoute>} />
              <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
              <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
              <Route path="/translator" element={<ProtectedRoute><Translator /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route
                path="/sneakers"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><Sneakers /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route
                path="/watches"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><Watches /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route
                path="/real-estate"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><RealEstate /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route
                path="/business"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><BusinessPlan /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
              <Route path="/category/:id" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
              <Route path="/sports" element={<ProtectedRoute><Sports /></ProtectedRoute>} />
              <Route path="/widget" element={<ProtectedRoute><Widget /></ProtectedRoute>} />
              <Route path="/andy" element={<ProtectedRoute><Andy /></ProtectedRoute>} />
              <Route
                path="/charts"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><ChartAnalysis /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
              <Route
                path="/patterns"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><Patterns /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route path="/brain" element={<ProtectedRoute><BrainStatus /></ProtectedRoute>} />
              <Route
                path="/crypto-trader"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><CryptoTrader /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route
                path="/signals"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><Signals /></ProtectedRoute>
                  </React.Suspense>
                }
              />
              <Route
                path="/brain-explorer"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><BrainExplorer /></ProtectedRoute>
                  </React.Suspense>
                }
              />

              <Route
                path="/tasks"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <ProtectedRoute><Tasks /></ProtectedRoute>
                  </React.Suspense>
                }
              />

              <Route
                path="/admin"
                element={
                  <React.Suspense fallback={
                    <div style={{ height: 200, background: 'var(--bg2)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', animation: 'shimmer 2s infinite' }} />
                  }>
                    <AdminRoute><Admin /></AdminRoute>
                  </React.Suspense>
                }
              />
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