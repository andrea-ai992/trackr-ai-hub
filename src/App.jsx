Je vais ajouter les transitions de page à 340ms en utilisant react-router-dom et les CSS vars existants. Voici les modifications nécessaires :

src/App.jsx:
```jsx
import { useState, useEffect, Suspense, lazy } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { Home, TrendingUp, Newspaper, MoreHorizontal, Brain, Users, ShoppingBag, Clock, Plane, Gem, Watch, Home as HomeIcon } from 'lucide-react'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import News from './pages/News'
import More from './pages/More'
import Andy from './pages/Andy'
import SettingsPanel from './components/SettingsPanel'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

// Lazy load des pages lourdes
const Sports = lazy(() => import('./pages/Sports'))
const Markets = lazy(() => import('./pages/Markets'))
const Agents = lazy(() => import('./pages/Agents'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const CryptoTrader = lazy(() => import('./pages/CryptoTrader'))
const Signals = lazy(() => import('./pages/Signals'))
const BrainExplorer = lazy(() => import('./pages/BrainExplorer'))
const FlightTracker = lazy(() => import('./pages/FlightTracker'))
const Sneakers from './pages/Sneakers'
const Watches from './pages/Watches'
const RealEstate from './pages/RealEstate'
const BusinessPlan from './pages/BusinessPlan')
const Patterns from './pages/Patterns')
const ChartAnalysis from './pages/ChartAnalysis')

const AppContent = () => {
  const [showSettings, setShowSettings] = useState(false)
  const location = useLocation()
  const [outletContext] = useOutletContext() || [null]

  // Composant de fallback générique pour les pages lourdes
  const LoadingFallback = () => (
    <div className="loading-fallback">
      <div className="spinner"></div>
      <p>Chargement en cours...</p>
    </div>
  )

  return (
    <div className="app-container">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route
          path="/sports"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Sports />
            </Suspense>
          }
        />
        <Route
          path="/markets"
          element={
            <Suspense fallback={<LoadingFallback />}>
              <Markets />
            </Suspense>
          }
        />
        <Route path="/news" element={<News />} />
        <Route path="/more" element={<More setShowSettings={setShowSettings} />}>
          <Route index element={<div>Plus</div>} />
          <Route path="andy" element={<Andy />} />
          <Route
            path="agents"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Agents />
              </Suspense>
            }
          />
          <Route
            path="portfolio"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Portfolio />
              </Suspense>
            }
          />
          <Route
            path="cryptotrader"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <CryptoTrader />
              </Suspense>
            }
          />
          <Route
            path="signals"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <Signals />
              </Suspense>
            }
          />
          <Route
            path="brainexplorer"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <BrainExplorer />
              </Suspense>
            }
          />
          <Route
            path="flighttracker"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <FlightTracker />
              </Suspense>
            }
          />
          <Route path="sneakers" element={<Sneakers />} />
          <Route path="watches" element={<Watches />} />
          <Route path="realestate" element={<RealEstate />} />
          <Route path="businessplan" element={<BusinessPlan />} />
          <Route path="patterns" element={<Patterns />} />
          <Route
            path="chartanalysis"
            element={
              <Suspense fallback={<LoadingFallback />}>
                <ChartAnalysis />
              </Suspense>
            }
          />
        </Route>
      </Routes>

      <BottomNav />

      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <SettingsPanel onClose={() => setShowSettings(false)} />
        </div>
      )}
    </div>
  )
}

const App = () => {
  return (
    <SettingsProvider>
      <Router>
        <AppContent />
      </Router>
    </SettingsProvider>
  )
}

export default App
```

src/styles/index.css:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(0, 255, 136, 0.2);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --transition-speed: 340ms;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  font-size: 16px;
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  min-height: 100vh;
  transition: background-color var(--transition-speed) ease;
}

.app-container {
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container > div {
  transition: opacity var(--transition-speed) ease, transform var(--transition-speed) ease;
}

.app-container > div[style*="opacity: 0"] {
  position: absolute;
  width: 100%;
  opacity: 0;
  transform: translateY(20px);
  pointer-events: none;
}

.app-container > div[style*="opacity: 1"] {
  position: relative;
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.loading-fallback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Media queries pour mobile-first */
@media (min-width: 768px) {
  :root {
    font-size: 18px;
  }
}

@media (min-width: 1024px) {
  :root {
    font-size: 20px;
  }
}