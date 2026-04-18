import React from 'react';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [topMovers, setTopMovers] = useState([]);
  const [fearGreedIndex, setFearGreedIndex] = useState(50);
  const [news, setNews] = useState([]);

  useEffect(() => {
    // Fetch data logic here
  }, []);

  return (
    <div className="dashboard">
      <Header />
      <div className="hero-card">
        <h1 className="portfolio-value">${portfolioValue.toLocaleString()}</h1>
        <span className={`portfolio-change ${portfolioValue >= 0 ? 'positive' : 'negative'}`}>
          {portfolioValue >= 0 ? '+' : ''}{portfolioValue.toFixed(2)}%
        </span>
        <svg className="sparkline" width="100" height="20">
          {/* SVG Sparkline here */}
        </svg>
      </div>
      <div className="top-movers">
        {topMovers.map((mover) => (
          <div key={mover.symbol} className="mover-card">
            <span className={`mover-logo ${mover.type}`}>{mover.logo}</span>
            <span className="mover-price">${mover.price.toFixed(2)}</span>
            <span className={`mover-change ${mover.change >= 0 ? 'positive' : 'negative'}`}>
              {mover.change >= 0 ? '+' : ''}{mover.change.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
      <div className="fear-greed-gauge">
        <svg width="200" height="100">
          {/* SVG Gauge here */}
        </svg>
        <span className="gauge-value">{fearGreedIndex}</span>
      </div>
      <div className="news-feed">
        {news.map((item) => (
          <div key={item.id} className="news-item">
            <span className={`news-source ${item.sourceColor}`}>{item.source}</span>
            <span className="news-title">{item.title}</span>
            <span className="news-time">{item.time}</span>
          </div>
        ))}
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
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import './Header.css';

const Header = () => {
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(format(now, 'HH:mm'));
    };
    updateTime();
    const intervalId = setInterval(updateTime, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="header">
      <h1>Bonjour Andrea</h1>
      <span className="current-time">{currentTime}</span>
      <span className="live-badge">LIVE</span>
    </header>
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
  border: 1px solid var(--border);
  padding: 16px;
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

.positive {
  color: var(--green);
}

.negative {
  color: red;
}

.top-movers {
  display: flex;
  overflow-x: auto;
}

.mover-card {
  background: rgba(255, 255, 255, 0.04);
  margin-right: 16px;
  padding: 16px;
  border: 1px solid var(--border);
}

.fear-greed-gauge {
  display: flex;
  align-items: center;
}

.gauge-value {
  margin-left: 16px;
}

.news-feed {
  margin-top: 16px;
}

.news-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.action-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  padding: 16px;
  text-align: center;
} 

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.current-time {
  color: var(--t2);
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