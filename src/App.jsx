import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import BottomNav from './components/BottomNav'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Finance = lazy(() => import('./pages/Finance'))
const Crypto = lazy(() => import('./pages/Crypto'))
const Sports = lazy(() => import('./pages/Sports'))
const AI = lazy(() => import('./pages/AI'))
const Settings = lazy(() => import('./pages/Settings'))
const Login = lazy(() => import('./pages/Login'))

function PageLoader() {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0a0a0f',
    }}>
      <div style={{
        width: 32,
        height: 32,
        border: '3px solid rgba(102,0,234,0.2)',
        borderTop: '3px solid #6600ea',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function ProtectedLayout({ Page }) {
  return (
    <ProtectedRoute>
      <Suspense fallback={<PageLoader />}>
        <Page />
      </Suspense>
      <BottomNav />
    </ProtectedRoute>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <Suspense fallback={<PageLoader />}>
              <Login />
            </Suspense>
          }
        />
        <Route path="/" element={<ProtectedLayout Page={Dashboard} />} />
        <Route path="/finance" element={<ProtectedLayout Page={Finance} />} />
        <Route path="/crypto" element={<ProtectedLayout Page={Crypto} />} />
        <Route path="/sports" element={<ProtectedLayout Page={Sports} />} />
        <Route path="/ai" element={<ProtectedLayout Page={AI} />} />
        <Route path="/settings" element={<ProtectedLayout Page={Settings} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}