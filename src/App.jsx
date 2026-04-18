Je vais implémenter le lazy loading avec Suspense pour les pages lourdes et créer des composants de fallback dédiés. Voici les modifications pour `src/App.jsx` :

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
const Sneakers = lazy(() => import('./pages/Sneakers'))
const Watches = lazy(() => import('./pages/Watches'))
const RealEstate = lazy(() => import('./pages/RealEstate'))
const BusinessPlan = lazy(() => import('./pages/BusinessPlan'))
const Patterns = lazy(() => import('./pages/Patterns'))
const ChartAnalysis = lazy(() => import('./pages/ChartAnalysis'))

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

Et voici le CSS à ajouter dans `index.css` pour le composant de fallback :

```css
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
```

Ces modifications :
1. Implémentent le lazy loading pour toutes les pages lourdes (Sports, Markets, ChartAnalysis et les autres pages du sous-routeur /more)
2. Créent un composant de fallback générique avec une animation de spinner
3. Mainiennent le fonctionnement existant tout en améliorant les performances de chargement initial
4. Respectent le design system avec les variables CSS
5. Sont mobiles-first par défaut