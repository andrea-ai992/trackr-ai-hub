src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import BottomNav from './components/BottomNav';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/markets" element={<Markets />} />
        </Routes>
        <BottomNav />
      </div>
    </Router>
  );
};

export default App;

src/pages/Dashboard.jsx

import React from 'react';
import { useEffect, useState } from 'react';
import './Dashboard.css';
import NewsFeed from '../components/NewsFeed';
import QuickActions from '../components/QuickActions';
import Sparkline from '../components/Sparkline';
import TopMovers from '../components/TopMovers';
import FearGreedGauge from '../components/FearGreedGauge';

const Dashboard = () => {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching portfolio value
    setTimeout(() => {
      setPortfolioValue(10000); // Example value
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="dashboard">
      <div className="hero">
        {loading ? (
          <div className="skeleton shimmer" />
        ) : (
          <h1 className="portfolio-value">${portfolioValue}</h1>
        )}
      </div>
      <Sparkline />
      <TopMovers />
      <FearGreedGauge />
      <NewsFeed />
      <QuickActions />
    </div>
  );
};

export default Dashboard;

src/pages/Markets.jsx

import React from 'react';
import './Markets.css';

const Markets = () => {
  return (
    <div className="markets">
      <h2>Markets</h2>
      {/* Fluid list of market items */}
    </div>
  );
};

export default Markets;

src/components/BottomNav.jsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <div className="bottom-nav">
      <NavLink to="/" className="nav-item">
        Dashboard
      </NavLink>
      <NavLink to="/markets" className="nav-item">
        Markets
      </NavLink>
      {/* Add other nav items here */}
    </div>
  );
};

export default BottomNav;

src/components/NewsFeed.jsx

import React from 'react';
import './NewsFeed.css';

const NewsFeed = () => {
  return (
    <div className="news-feed">
      {/* Render news items here */}
    </div>
  );
};

export default NewsFeed;

src/components/QuickActions.jsx

import React from 'react';
import './QuickActions.css';

const QuickActions = () => {
  return (
    <div className="quick-actions">
      {/* Render quick action buttons here */}
    </div>
  );
};

export default QuickActions;

src/components/Sparkline.jsx

import React from 'react';
import './Sparkline.css';

const Sparkline = () => {
  return (
    <div className="sparkline">
      {/* Render sparkline SVG here */}
    </div>
  );
};

export default Sparkline;

src/components/TopMovers.jsx

import React from 'react';
import './TopMovers.css';

const TopMovers = () => {
  return (
    <div className="top-movers">
      {/* Render top movers here */}
    </div>
  );
};

export default TopMovers;

src/components/FearGreedGauge.jsx

import React from 'react';
import './FearGreedGauge.css';

const FearGreedGauge = () => {
  return (
    <div className="fear-greed-gauge">
      {/* Render gauge SVG here */}
    </div>
  );
};

export default FearGreedGauge;

src/App.css

:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

.app {
  background-color: var(--bg);
  color: var(--t1);
  max-width: 520px;
  margin: auto;
  padding: 16px;
}

.dashboard {
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
}

.hero {
  font-family: 'Inter', sans-serif;
}

.portfolio-value {
  font-size: 2rem;
  color: var(--green);
}

.bottom-nav {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 10px;
  backdrop-filter: blur(12px);
}

.nav-item {
  color: var(--t1);
  text-decoration: none;
}

.nav-item.active {
  color: var(--green);
}

.skeleton {
  height: 20px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}