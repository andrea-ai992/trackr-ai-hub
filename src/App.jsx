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

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Dashboard />
              <BottomNav />
            </ProtectedRoute>
          } />
          <Route path="/finance" element={
            <ProtectedRoute>
              <Finance />
              <BottomNav />
            </ProtectedRoute>
          } />
          <Route path="/crypto" element={
            <ProtectedRoute>
              <Crypto />
              <BottomNav />
            </ProtectedRoute>
          } />
          <Route path="/sports" element={
            <ProtectedRoute>
              <Sports />
              <BottomNav />
            </ProtectedRoute>
          } />
          <Route path="/ai" element={
            <ProtectedRoute>
              <AI />
              <BottomNav />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
              <BottomNav />
            </ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}