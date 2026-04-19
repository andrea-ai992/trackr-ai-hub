import { useState, Suspense, lazy } from 'react'
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
import Sports from './pages/Sports'
import Andy from './pages/Andy'
import Portfolio from './pages/Portfolio'
import Widget from './pages/Widget'
import Agents from './pages/Agents'
import BrainStatus from './pages/BrainStatus'
import AIControl from './pages/AIControl'
import Login from './pages/Login'
import SkeletonPage from './components/SkeletonPage'
import { useAlerts } from './hooks/useAlerts'
import { useNewsAlerts } from './hooks/useNewsAlerts'
import { Search } from 'lucide-react'
import VoiceAssistant from './components/VoiceAssistant'

const FlightTracker = lazy(() => import('./pages/FlightTracker'))
const ChartAnalysis = lazy(() => import('./pages/ChartAnalysis'))
const Patterns = lazy(() => import('./pages/Patterns'))
const CryptoTrader = lazy(() => import('./pages/CryptoTrader'))
const Signals = lazy(() => import('./pages/Signals'))
const RealEstate = lazy(() => import('./pages/RealEstate'))
const BusinessPlan = lazy(() => import('./pages/BusinessPlan'))
const Admin = lazy(() => import('./pages/Admin'))
const Sneakers = lazy(() => import('./pages/Sneakers'))
const Watches = lazy(() => import('./pages/Watches'))
const Translator = lazy(() => import('./pages/Translator'))
const BrainExplorer = lazy(() => import('./pages/BrainExplorer'))

function AlertWatcher() {
  useAlerts()
  useNewsAlerts()
  return null
}

function getTabIndex(path) {
  if (path === '/' || path === '/dashboard') return 0
  if (path.startsWith('/markets') || path.startsWith('/stocks/') || path.startsWith('/crypto/') || path.startsWith('/news')) return 1
  if (path.startsWith('/ai') || path.startsWith('/brain') || path.startsWith('/agents') || path.startsWith('/andy')) return 2
  if (path.startsWith('/more') || path.startsWith('/sports') || path.startsWith('/flights') || path.startsWith('/portfolio') ||
    path.startsWith('/translator') || path.startsWith('/sneakers') || path.startsWith('/watches') ||
    path.startsWith('/real-estate') || path.startsWith('/business') || path.startsWith('/patterns')
  ) return 3
  return -1
}

const DETAIL_PREFIXES = ['/stocks/', '/crypto/', '/translator', '/settings', '/sneakers', '/watches', '/real-estate', '/business', '/portfolio', '/category/', '/flights', '/admin', '/patterns']

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
      animClass = 'page-enter-up'
    } else if (!isDetail && wasDetail) {
      animClass = 'page-enter-fade'
    } else if (currTabIdx !== -1 && prevTabIdx !== -1 && currTabIdx !== prevTabIdx) {
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
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text-primary)', fontFamily: 'JetBrains Mono, monospace' }}>
        <main style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 8px)', position: 'relative', zIndex: 1 }}>
          <PageTransition>
            <Suspense fallback={<SkeletonPage />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/markets" element={<ProtectedRoute><Markets /></ProtectedRoute>} />
                <Route path="/stocks/:id" element={<ProtectedRoute><StockDetail /></ProtectedRoute>} />
                <Route path="/crypto/:id" element={<ProtectedRoute><CryptoDetail /></ProtectedRoute>} />
                <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
                <Route path="/sports" element={<ProtectedRoute><Sports /></ProtectedRoute>} />
                <Route path="/more" element={<ProtectedRoute><More /></ProtectedRoute>} />
                <Route path="/andy" element={<ProtectedRoute><Andy /></ProtectedRoute>} />
                <Route path="/portfolio" element={<ProtectedRoute><Portfolio /></ProtectedRoute>} />
                <Route path="/widget" element={<ProtectedRoute><Widget /></ProtectedRoute>} />
                <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
                <Route path="/brain" element={<ProtectedRoute><BrainStatus /></ProtectedRoute>} />
                <Route path="/ai" element={<ProtectedRoute><AIControl /></ProtectedRoute>} />

                <Route path="/flights" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><FlightTracker /></Suspense></ProtectedRoute>} />
                <Route path="/charts" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><ChartAnalysis /></Suspense></ProtectedRoute>} />
                <Route path="/patterns" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><Patterns /></Suspense></ProtectedRoute>} />
                <Route path="/translator" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><Translator /></Suspense></ProtectedRoute>} />
                <Route path="/sneakers" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><Sneakers /></Suspense></ProtectedRoute>} />
                <Route path="/watches" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><Watches /></Suspense></ProtectedRoute>} />
                <Route path="/real-estate" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><RealEstate /></Suspense></ProtectedRoute>} />
                <Route path="/business" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><BusinessPlan /></Suspense></ProtectedRoute>} />
                <Route path="/crypto-trader" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><CryptoTrader /></Suspense></ProtectedRoute>} />
                <Route path="/signals" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><Signals /></Suspense></ProtectedRoute>} />
                <Route path="/brain-explorer" element={<ProtectedRoute><Suspense fallback={<SkeletonPage />}><BrainExplorer /></Suspense></ProtectedRoute>} />

                <Route path="/admin" element={<AdminRoute><Suspense fallback={<SkeletonPage />}><Admin /></Suspense></AdminRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/category/:id" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
              </Routes>
            </Suspense>
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