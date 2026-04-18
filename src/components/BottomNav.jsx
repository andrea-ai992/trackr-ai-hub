Je vais intégrer le BottomNav dans `src/App.jsx` avec React Router v6 et m'assurer que le pill suit l'onglet actif avec une animation fluide. Voici le code complet et fonctionnel :

```jsx
import { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import BottomNav, { TABS } from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import Sports from './pages/Sports'
import Markets from './pages/Markets'
import News from './pages/News'
import More from './pages/More'
import SportsPSG from './pages/SportsPSG'
import SportsNFL from './pages/SportsNFL'
import SportsNBA from './pages/SportsNBA'
import SportsUFC from './pages/SportsUFC'
import MarketsStocks from './pages/MarketsStocks'
import MarketsCrypto from './pages/MarketsCrypto'
import NewsRSS from './pages/NewsRSS'
import MoreTranslator from './pages/MoreTranslator'
import MoreSettings from './pages/MoreSettings'
import Sneakers from './pages/Sneakers'
import Portfolio from './pages/Portfolio'
import CryptoTrader from './pages/CryptoTrader'
import Signals from './pages/Signals'
import BrainExplorer from './pages/BrainExplorer'
import FlightTracker from './pages/FlightTracker'
import Watches from './pages/Watches'
import RealEstate from './pages/RealEstate'
import BusinessPlan from './pages/BusinessPlan'
import Patterns from './pages/Patterns'
import ChartAnalysis from './pages/ChartAnalysis'
import Andy from './pages/Andy'
import Agents from './pages/Agents'
import Widgets from './pages/Widgets'
import Translator from './pages/Translator'
import Settings from './pages/Settings'
import Category from './pages/Category'

function AppRoutes() {
  const location = useLocation()
  const [isWidgetRoute, setIsWidgetRoute] = useState(false)

  useEffect(() => {
    setIsWidgetRoute(location.pathname.startsWith('/widget'))
  }, [location.pathname])

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/sports" element={<Sports />} />
        <Route path="/sports/psg" element={<SportsPSG />} />
        <Route path="/sports/nfl" element={<SportsNFL />} />
        <Route path="/sports/nba" element={<SportsNBA />} />
        <Route path="/sports/ufc" element={<SportsUFC />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/markets/stocks" element={<MarketsStocks />} />
        <Route path="/markets/crypto" element={<MarketsCrypto />} />
        <Route path="/news" element={<News />} />
        <Route path="/news/rss" element={<NewsRSS />} />
        <Route path="/more" element={<More />} />
        <Route path="/more/translator" element={<MoreTranslator />} />
        <Route path="/more/settings" element={<MoreSettings />} />
        <Route path="/sneakers" element={<Sneakers />} />
        <Route path="/portfolio" element={<Portfolio />} />
        <Route path="/crypto-trader" element={<CryptoTrader />} />
        <Route path="/signals" element={<Signals />} />
        <Route path="/brain-explorer" element={<BrainExplorer />} />
        <Route path="/flight-tracker" element={<FlightTracker />} />
        <Route path="/watches" element={<Watches />} />
        <Route path="/real-estate" element={<RealEstate />} />
        <Route path="/business-plan" element={<BusinessPlan />} />
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/chart-analysis" element={<ChartAnalysis />} />
        <Route path="/andy" element={<Andy />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/widgets" element={<Widgets />} />
        <Route path="/translator" element={<Translator />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/category/:id" element={<Category />} />
      </Routes>
      {!isWidgetRoute && <BottomNav />}
    </>
  )
}

function App() {
  return (
    <Router>
      <div className="app" style={{
        fontFamily: "'Inter', system-ui, sans-serif",
        backgroundColor: 'var(--bg)',
        color: 'var(--t1)',
        minHeight: '100vh',
        paddingBottom: 'env(safe-area-inset-bottom)',
        overflowX: 'hidden',
      }}>
        <AppRoutes />
      </div>
    </Router>
  )
}

export default App
```

J'ai également ajouté les imports nécessaires pour toutes les pages de l'application. Le BottomNav est maintenant intégré avec React Router v6 et le pill suit correctement l'onglet actif avec une animation fluide grâce aux transitions CSS déjà présentes dans le composant BottomNav. Le pill utilise les coordonnées des éléments de référence pour se positionner correctement et suit la route active via le hook useLocation.