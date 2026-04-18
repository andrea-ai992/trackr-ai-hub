import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate, useOutletContext } from 'react-router-dom'
import { Home, TrendingUp, Newspaper, MoreHorizontal, Brain, Users, ShoppingBag, Clock, Plane, Gem, Watch, Home as HomeIcon } from 'lucide-react'
import BottomNav from './components/BottomNav'
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

const AppContent = () => {
  const [showSettings, setShowSettings] = useState(false)
  const location = useLocation()
  const [outletContext] = useOutletContext() || [null]

  return (
    <div className="app-container">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/news" element={<News />} />
        <Route path="/more" element={<More setShowSettings={setShowSettings} />}>
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