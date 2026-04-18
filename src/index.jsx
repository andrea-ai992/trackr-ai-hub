// src/index.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

// src/App.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Markets from './pages/Markets';
import BottomNav from './components/BottomNav';

const App = () => {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/markets" element={<Markets />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App;

// src/styles.css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  margin: 0;
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

// src/pages/Dashboard.jsx
import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <div className="hero-portfolio">
        {/* Hero Portfolio Component */}
      </div>
      <div className="sparkline">
        {/* Sparkline SVG for 7 days */}
      </div>
      <div className="top-movers">
        {/* Top Movers Component - horizontal scroll */}
      </div>
      <div className="fear-greed-gauge">
        {/* Fear & Greed Gauge SVG */}
      </div>
      <div className="news-feed">
        {/* News Feed Component */}
      </div>
      <div className="quick-actions">
        {/* Quick Actions 2x2 */}
      </div>
    </div>
  );
};

export default Dashboard;

// src/pages/Dashboard.css
.dashboard {
  max-width: 520px;
  padding: env(safe-area-inset);
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  animation: fadeUp 0.6s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// src/components/BottomNav.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import './BottomNav.css';

const BottomNav = () => {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className="nav-item">
        Dashboard
      </NavLink>
      <NavLink to="/markets" className="nav-item">
        Markets
      </NavLink>
      {/* Add more nav items as needed */}
    </nav>
  );
};

export default BottomNav;

// src/components/BottomNav.css
.bottom-nav {
  display: flex;
  justify-content: space-around;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  border-radius: 25px;
  padding: 10px;
}

.nav-item {
  color: var(--t1);
  text-align: center;
}

.nav-item.active {
  color: var(--green);
}

// src/pages/Markets.jsx
import React from 'react';
import './Markets.css';

const Markets = () => {
  return (
    <div className="markets">
      <div className="market-list">
        {/* Fluid list of markets with animated prices */}
      </div>
      <div className="filters">
        {/* Filters as chips with horizontal scroll */}
      </div>
    </div>
  );
};

export default Markets;

// src/pages/Markets.css
.markets {
  max-width: 520px;
  padding: env(safe-area-inset);
  backdrop-filter: blur(12px);
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  animation: fadeUp 0.6s ease-out;
}

// src/components/SkeletonLoader.jsx
import React from 'react';
import './SkeletonLoader.css';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      {/* Skeleton loader implementation */}
    </div>
  );
};

export default SkeletonLoader;

// src/components/SkeletonLoader.css
.skeleton-loader {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}