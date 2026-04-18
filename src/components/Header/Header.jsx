import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './Dashboard.css';
import Header from '../components/Header/Header';

const Dashboard = () => {
  const [portfolioValue, setPortfolioValue] = useState(24830);
  const [portfolioChange, setPortfolioChange] = useState(2.4);
  const [topMovers, setTopMovers] = useState([]);
  const [fearGreed, setFearGreed] = useState(50);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data for portfolio, top movers, fear & greed, and news
    const fetchData = async () => {
      // Simulated fetch calls
      setLoading(true);
      setTimeout(() => {
        setTopMovers([
          { symbol: 'AAPL', price: 150, change: -1.2 },
          { symbol: 'BTC', price: 40000, change: 3.5 },
          { symbol: 'TSLA', price: 700, change: 1.8 },
        ]);
        setFearGreed(60);
        setNews([
          { title: 'Market hits all-time high', source: 'CNBC', time: '2min' },
          { title: 'Crypto regulations on the rise', source: 'Bloomberg', time: '5min' },
          { title: 'Tech stocks rally', source: 'Reuters', time: '10min' },
        ]);
        setLoading(false);
      }, 1000);
    };

    fetchData();
  }, []);

  const renderTopMovers = () => {
    return topMovers.map((mover, index) => (
      <div key={index} className="top-mover-card">
        <div className="top-mover-logo">{mover.symbol}</div>
        <div className="top-mover-price">${mover.price.toFixed(2)}</div>
        <div className={`top-mover-change ${mover.change >= 0 ? 'green' : 'red'}`}>
          {mover.change >= 0 ? '+' : ''}
          {mover.change}%
        </div>
      </div>
    ));
  };

  return (
    <div className="dashboard">
      <Header />
      <div className="hero-card">
        <h1 className="portfolio-value">${portfolioValue.toLocaleString()}</h1>
        <div className={`portfolio-change ${portfolioChange >= 0 ? 'green' : 'red'}`}>
          {portfolioChange >= 0 ? '+' : ''}
          {portfolioChange}%
        </div>
        <svg className="sparkline" width="100" height="20">
          {/* SVG sparkline data */}
        </svg>
      </div>
      <div className="top-movers-section">
        <h2>Top Movers</h2>
        <div className="top-movers-scroll">
          {loading ? <div className="skeleton shimmer" /> : renderTopMovers()}
        </div>
      </div>
      <div className="fear-greed-gauge">
        <svg width="100" height="50">
          {/* SVG gauge data */}
        </svg>
        <div className="fear-greed-value">{fearGreed}</div>
      </div>
      <div className="news-feed">
        {loading ? (
          <div className="skeleton shimmer" />
        ) : (
          news.map((item, index) => (
            <div key={index} className="news-item">
              <span className={`news-source ${item.source.toLowerCase()}`}>{item.source}</span>
              <span className="news-title">{item.title}</span>
              <span className="news-time">{item.time}</span>
            </div>
          ))
        )}
      </div>
      <div className="quick-actions">
        <div className="quick-action-card">Markets</div>
        <div className="quick-action-card">Portfolio</div>
        <div className="quick-action-card">Signals</div>
        <div className="quick-action-card">AnDy</div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import './Header.css';

const Header = () => {
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="header">
      <h1>Bonjour Andrea</h1>
      <span className="current-time">{currentTime}</span>
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
  border-radius: 8px;
  margin-bottom: 16px;
}

.portfolio-value {
  font-family: 'Inter', sans-serif;
  font-weight: bold;
  font-size: 32px;
}

.portfolio-change {
  font-size: 16px;
}

.green {
  color: var(--green);
}

.red {
  color: red;
}

.top-movers-section {
  margin-bottom: 16px;
}

.top-movers-scroll {
  display: flex;
  overflow-x: auto;
}

.top-mover-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 8px;
  border-radius: 8px;
  margin-right: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fear-greed-gauge {
  margin-bottom: 16px;
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

.quick-action-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 16px;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.current-time {
  font-size: 16px;
}

.live-badge {
  background-color: var(--green);
  color: #fff;
  padding: 4px 8px;
  border-radius: 12px;
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
  border-radius: 4px;
}

.shimmer {
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