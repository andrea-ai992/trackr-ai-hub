import { useState, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import { SettingsProvider } from './context/SettingsContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import BottomNav from './components/BottomNav'
import Toast from './components/Toast'
import SearchOverlay from './components/SearchOverlay'
import { useAlerts } from './hooks/useAlerts'
import { useNewsAlerts } from './hooks/useNewsAlerts'
import { Search } from 'lucide-react'
import VoiceAssistant from './components/VoiceAssistant'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Markets = lazy(() => import('./pages/Markets'))
const StockDetail = lazy(() => import('./pages/StockDetail'))
const CryptoDetail = lazy(() => import('./pages/CryptoDetail'))
const News = lazy(() => import('./pages/News'))
const FlightTracker = lazy(() => import('./pages/FlightTracker'))
const More = lazy(() => import('./pages/More'))
const Translator = lazy(() => import('./pages/Translator'))
const Settings = lazy(() => import('./pages/Settings'))
const CategoryPage = lazy(() => import('./pages/CategoryPage'))
const Sneakers = lazy(() => import('./pages/Sneakers'))
const Watches = lazy(() => import('./pages/Watches'))
const RealEstate = lazy(() => import('./pages/RealEstate'))
const BusinessPlan = lazy(() => import('./pages/BusinessPlan'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const Widget = lazy(() => import('./pages/Widget'))
const Sports = lazy(() => import('./pages/Sports'))
const Andy = lazy(() => import('./pages/Andy'))
const Agents = lazy(() => import('./pages/Agents'))
const BrainStatus = lazy(() => import('./pages/BrainStatus'))
const Login = lazy(() => import('./pages/Login'))
const ChartAnalysis = lazy(() => import('./pages/ChartAnalysis'))
const Admin = lazy(() => import('./pages/Admin'))
const Patterns = lazy(() => import('./pages/Patterns'))

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
let _prevTabIdx = 0

function PageTransition({ children }) {
  const location = useLocation()

  let animClass = 'page-enter-fade'

  if (location.pathname !== _prevPath) {
    const isDetail   = DETAIL_PREFIXES.some(p => location.pathname.startsWith(p))
    const wasDetail  = DETAIL_PREFIXES.some(p => _prevPath.startsWith(p))
    const currTabIdx = getTabIndex(location.pathname)
    const prevTabIdx = getTabIndex(_prevPath)

    if (isDetail && !wasDetail) {
      animClass = 'page-enter-up'
    } else if (!isDetail && wasDetail) {
      animClass = 'page-enter-fade'
    } else if (currTabIdx !== -1 && prevTabIdx !== -1 && currTabIdx !== prevTabIdx) {
      animClass = currTabIdx > prevTabIdx ? 'page-enter-right' : 'page-enter-left'
    } else {
      animClass = 'page-enter-fade'
    }

    _prevPath   = location.pathname
    _prevTabIdx = currTabIdx
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

const PageLoader = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    color: '#6600ea',
  }}>
    <div style={{
      width: 32,
      height: 32,
      borderRadius: '50%',
      border: '3px solid rgba(102,0,234,0.2)',
      borderTopColor: '#6600ea',
      animation: 'spin 0.7s linear infinite',
    }} />
  </div>
)

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
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
          <div className="aurora-blob" style={{ top: '-15%', left: '-10%', width: '55vw', height: '55vw', background: 'radial-gradient(circle, #6600ea 0%, transparent 70%)' }} />
          <div className="aurora-blob aurora-blob-2" style={{ bottom: '-15%', right: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, #00e5ff 0%, transparent 70%)' }} />
          <div className="aurora-blob" style={{ top: '40%', right: '20%', width: '30vw', height: '30vw', background: 'radial-gradient(circle, #cf5cff 0%, transparent 70%)', animationDelay: '-3s', animationDuration: '18s' }} />
        </div>
        <main style={{ paddingBottom: 'calc(88px + env(safe-area-inset-bottom, 0px) + 8px)', position: 'relative', zIndex: 1 }}>
          <PageTransition>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />

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
                <Route path="/charts" element={<ProtectedRoute><ChartAnalysis /></ProtectedRoute>} />
                <Route path="/agents" element={<ProtectedRoute><Agents /></ProtectedRoute>} />
                <Route path="/patterns" element={<ProtectedRoute><Patterns /></ProtectedRoute>} />
                <Route path="/brain" element={<ProtectedRoute><BrainStatus /></ProtectedRoute>} />

                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
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