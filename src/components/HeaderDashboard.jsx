**src/pages/Dashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import HeaderDashboard from './HeaderDashboard';
import HeroCard from './HeroCard';
import Movers from './Movers';
import FearGreedGauge from './FearGreedGauge';
import News from './News';
import QuickActions from './QuickActions';
import SkeletonLoader from './SkeletonLoader';

const Dashboard = () => {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [pnl24h, setPnl24h] = useState(0);
  const [movers, setMovers] = useState([]);
  const [news, setNews] = useState([]);
  const [fearGreed, setFearGreed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      const { data, error } = await supabase
        .from('portfolio')
        .select('value, pnl_24h')
        .eq('user_id', supabase.auth.user().id);
      if (error) console.error(error);
      setPortfolioValue(data[0].value);
      setPnl24h(data[0].pnl_24h);
    };
    const fetchMovers = async () => {
      const { data, error } = await supabase
        .from('movers')
        .select('symbol, price, percentage_change')
        .limit(5);
      if (error) console.error(error);
      setMovers(data);
    };
    const fetchNews = async () => {
      const { data, error } = await supabase
        .from('news')
        .select('title, source, timestamp')
        .limit(3);
      if (error) console.error(error);
      setNews(data);
    };
    const fetchFearGreed = async () => {
      const { data, error } = await supabase
        .from('fear_greed')
        .select('index')
        .limit(1);
      if (error) console.error(error);
      setFearGreed(data[0].index);
    };
    Promise.all([fetchPortfolio, fetchMovers, fetchNews, fetchFearGreed]).then(() => setLoading(false));
  }, []);

  return (
    <div className="container">
      <HeaderDashboard />
      <HeroCard portfolioValue={portfolioValue} pnl24h={pnl24h} />
      <Movers movers={movers} />
      <FearGreedGauge fearGreed={fearGreed} />
      <News news={news} />
      <QuickActions />
      {loading && <SkeletonLoader />}
    </div>
  );
};

export default Dashboard;
```

**src/components/HeaderDashboard.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';

const HeaderDashboard = () => {
  const date = new Date();
  const formattedDate = date.toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <header className="header-dashboard">
      <div className="header-dashboard__container">
        <h1 className="header-dashboard__title">Bonjour, {supabase.auth.user().username}!</h1>
        <p className="header-dashboard__date">{formattedDate}</p>
        <button className="header-dashboard__refresh" onClick={() => window.location.reload()}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
            <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default HeaderDashboard;
```

**src/components/HeroCard.jsx**
```jsx
import React from 'react';
import { supabase } from '../supabaseClient';

const HeroCard = ({ portfolioValue, pnl24h }) => {
  const formattedPnl24h = pnl24h > 0 ? `+${pnl24h.toFixed(2)}%` : `${pnl24h.toFixed(2)}%`;

  return (
    <div className="hero-card">
      <h2 className="hero-card__title">Portfolio</h2>
      <p className="hero-card__value">{portfolioValue.toFixed(2)}€</p>
      <p className="hero-card__pnl">{formattedPnl24h}</p>
      <div className="hero-card__border">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
          <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
        </svg>
      </div>
    </div>
  );
};

export default HeroCard;
```

**src/components/Movers.jsx**
```jsx
import React from 'react';
import { supabase } from '../supabaseClient';

const Movers = ({ movers }) => {
  return (
    <div className="movers">
      <h2 className="movers__title">Movers</h2>
      <ul className="movers__list">
        {movers.map((mover, index) => (
          <li key={index} className="movers__item">
            <span className="movers__symbol">{mover.symbol}</span>
            <span className="movers__price">{mover.price.toFixed(2)}€</span>
            <span className="movers__percentage">{mover.percentage_change.toFixed(2)}%</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
              <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
              <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Movers;
```

**src/components/FearGreedGauge.jsx**
```jsx
import React from 'react';
import { supabase } from '../supabaseClient';

const FearGreedGauge = ({ fearGreed }) => {
  return (
    <div className="fear-greed-gauge">
      <h2 className="fear-greed-gauge__title">Fear & Greed</h2>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
        <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
      </svg>
      <span className="fear-greed-gauge__value">{fearGreed}%</span>
    </div>
  );
};

export default FearGreedGauge;
```

**src/components/News.jsx**
```jsx
import React from 'react';
import { supabase } from '../supabaseClient';

const News = ({ news }) => {
  return (
    <div className="news">
      <h2 className="news__title">News</h2>
      <ul className="news__list">
        {news.map((item, index) => (
          <li key={index} className="news__item">
            <span className="news__title">{item.title}</span>
            <span className="news__source">{item.source}</span>
            <span className="news__timestamp">{item.timestamp}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default News;
```

**src/components/QuickActions.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
  return (
    <div className="quick-actions">
      <h2 className="quick-actions__title">Quick Actions</h2>
      <div className="quick-actions__grid">
        <div className="quick-actions__item">
          <Link to="/markets">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
              <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span>Markets</span>
          </Link>
        </div>
        <div className="quick-actions__item">
          <Link to="/sports">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
              <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span>Sports</span>
          </Link>
        </div>
        <div className="quick-actions__item">
          <Link to="/flights">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
              <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span>Flights</span>
          </Link>
        </div>
        <div className="quick-actions__item">
          <Link to="/andy">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 4H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H5V6h14v14z" />
              <path d="M14 2H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
            </svg>
            <span>AnDy</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
```

**src/components/SkeletonLoader.jsx**
```jsx
import React from 'react';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
      <div className="skeleton-loader__item" />
    </div>
  );
};

export default SkeletonLoader;
```

**styles.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.header-dashboard {
  position: sticky;
  top: 0;
  background-color: var(--bg);
  padding: 20px;
  text-align: center;
}

.header-dashboard__container {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-dashboard__title {
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
}

.header-dashboard__