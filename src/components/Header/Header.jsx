import React from 'react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import './Dashboard.css';
import Header from '../components/Header/Header';

const Dashboard = () => {
  const [portfolioValue, setPortfolioValue] = useState(24830);
  const [portfolioChange, setPortfolioChange] = useState(2.4);
  const [topMovers, setTopMovers] = useState([]);
  const [fearGreedIndex, setFearGreedIndex] = useState(60);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data logic here
    // Simulating data fetch
    setTimeout(() => {
      setTopMovers([
        { symbol: 'BTC', price: 45000, change: 5.2 },
        { symbol: 'ETH', price: 3000, change: -3.1 },
      ]);
      setNews([
        { title: 'Bitcoin hits new high', source: 'CoinDesk', time: '2 min ago' },
        { title: 'Ethereum upgrades', source: 'CryptoNews', time: '5 min ago' },
      ]);
      setLoading(false);
    }, 2000);
  }, []);

  const renderTopMovers = () => {
    return topMovers.map((mover, index) => (
      <div key={index} className="top-mover-card">
        <div className="top-mover-logo">{mover.symbol}</div>
        <div className="top-mover-price" style={{ color: mover.change > 0 ? 'var(--green)' : 'red' }}>
          ${mover.price.toLocaleString()} <span>{mover.change > 0 ? `+${mover.change}%` : `${mover.change}%`}</span>
        </div>
      </div>
    ));
  };

  const renderNewsFeed = () => {
    return news.map((item, index) => (
      <div key={index} className="news-item">
        <span className="news-source">{item.source}</span>
        <span className="news-title">{item.title}</span>
        <span className="news-time">{item.time}</span>
      </div>
    ));
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="hero-card">
        <h2 className="portfolio-value">${portfolioValue.toLocaleString()}</h2>
        <span className="portfolio-change" style={{ color: portfolioChange > 0 ? 'var(--green)' : 'red' }}>
          {portfolioChange > 0 ? `+${portfolioChange}%` : `${portfolioChange}%`}
        </span>
        <svg className="sparkline" width="100" height="20">
          {/* SVG sparkline here */}
        </svg>
      </div>
      <div className="top-movers">
        <h3>Top Movers</h3>
        <div className="top-movers-list">{renderTopMovers()}</div>
      </div>
      <div className="fear-greed">
        <h3>Fear & Greed Index</h3>
        <svg className="gauge" width="100" height="50">
          {/* SVG gauge here */}
        </svg>
        <span>{fearGreedIndex}</span>
      </div>
      <div className="news-feed">
        <h3>Latest News</h3>
        {loading ? <div className="skeleton" /> : renderNewsFeed()}
      </div>
      <div className="quick-actions">
        <div className="action-card">Markets</div>
        <div className="action-card">Portfolio</div>
        <div className="action-card">Signals</div>
        <div className="action-card">AnDy</div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import './Header.css';

const Header = () => {
  const currentTime = new Date();
  const formattedTime = `${currentTime.getHours()}:${currentTime.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="header">
      <h1>Bonjour Andrea</h1>
      <span className="time">{formattedTime}</span>
      <span className="live-badge">LIVE</span>
    </div>
  );
};

export default Header;

.dashboard {
  background-color: var(--bg);
  color: var(--t1);
  padding: 16px;
  max-width: 520px;
  margin: auto;
}

.hero-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 16px;
  margin-bottom: 16px;
}

.portfolio-value {
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  font-size: 24px;
}

.portfolio-change {
  font-size: 16px;
}

.top-movers {
  margin-bottom: 16px;
}

.top-mover-card {
  display: inline-block;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 8px;
  margin-right: 8px;
}

.news-feed {
  margin-bottom: 16px;
}

.news-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 16px;
  text-align: center;
  cursor: pointer;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.time {
  margin-left: 8px;
}

.live-badge {
  background-color: var(--green);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.skeleton {
  background: rgba(255, 255, 255, 0.1);
  height: 20px;
  margin-bottom: 8px;
}