Je vais maintenant intégrer le BottomNav dans `src/App.jsx` avec React Router v6 et l'animation de pill qui suit l'onglet actif.

```jsx
import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Home, TrendingUp, Newspaper, MoreHorizontal, Brain, Users, ShoppingBag, Clock, Plane, Gem, Watch, Home as HomeIcon } from 'lucide-react'
import Dashboard from './pages/Dashboard'
import Sports from './pages/Sports'
import Markets from './pages/Markets'
import News from './pages/News'
import More from './pages/More'
import Andy from './pages/Andy'
import Agents from './pages/Agents'
import Portfolio from './pages/Portfolio'
import CryptoTrader from './pages/CryptoTrader'
import Signals from './pages/Signals'
import BrainExplorer from './pages/BrainExplorer'
import FlightTracker from './pages/FlightTracker'
import Sneakers from './pages/Sneakers'
import Watches from './pages/Watches'
import RealEstate from './pages/RealEstate'
import BusinessPlan from './pages/BusinessPlan'
import Patterns from './pages/Patterns'
import ChartAnalysis from './pages/ChartAnalysis'
import SettingsPanel from './components/SettingsPanel'
import { SettingsProvider } from './context/SettingsContext'
import './index.css'

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState(location.pathname)

  useEffect(() => {
    setActiveTab(location.pathname)
  }, [location.pathname])

  const navItems = [
    { path: '/', icon: Home, label: 'Accueil' },
    { path: '/sports', icon: TrendingUp, label: 'Sports' },
    { path: '/markets', icon: TrendingUp, label: 'Marchés' },
    { path: '/news', icon: Newspaper, label: 'Actualités' },
    { path: '/more', icon: MoreHorizontal, label: 'Plus' }
  ]

  return (
    <nav className="bottom-nav">
      <div className="nav-pill" style={{
        transform: `translateX(calc(${navItems.findIndex(item => item.path === activeTab) * 100}% + ${navItems.findIndex(item => item.path === activeTab) * 8}px))`,
        width: `calc(${100 / navItems.length}% - 8px)`
      }} />
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={`nav-item ${activeTab === item.path ? 'active' : ''}`}
          aria-label={item.label}
        >
          <item.icon size={20} />
        </button>
      ))}
    </nav>
  )
}

const AppContent = () => {
  const [showSettings, setShowSettings] = useState(false)

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/news" element={<News />} />
        <Route path="/more" element={<More />}>
          <Route index element={<div>Plus</div>} />
          <Route path="andy" element={<Andy />} />
          <Route path="agents" element={<Agents />} />
          <Route path="portfolio" element={<Portfolio />} />
          <Route path="cryptotrader" element={<CryptoTrader />} />
          <Route path="signals" element={<Signals />} />
          <Route path="brainexplorer" element={<BrainExplorer />} />
          <Route path="flighttracker" element={<FlightTracker />} />
          <Route path="sneakers" element={<Sneakers />} />
          <Route path="watches" element={<Watches />} />
          <Route path="realestate" element={<RealEstate />} />
          <Route path="businessplan" element={<BusinessPlan />} />
          <Route path="patterns" element={<Patterns />} />
          <Route path="chartanalysis" element={<ChartAnalysis />} />
        </Route>
      </Routes>

      <BottomNav />

      {showSettings && (
        <div className="settings-overlay">
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

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: var(--bg2);
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(10px);
}

.nav-pill {
  position: absolute;
  bottom: 8px;
  height: 44px;
  background-color: var(--green);
  border-radius: 22px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
}

.nav-item {
  position: relative;
  z-index: 2;
  background: transparent;
  border: none;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--t2);
  cursor: pointer;
  transition: color 0.2s ease;
}

.nav-item.active {
  color: var(--green);
}

.nav-item:hover {
  color: var(--green);
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.app-container {
  min-height: 100vh;
  padding-bottom: 60px;
  position: relative;
}