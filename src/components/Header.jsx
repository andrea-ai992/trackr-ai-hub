import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useFetchPortfolio, useFetchTopMovers, useFetchNews } from '../hooks';
import Header from '../components/Header';
import './Dashboard.css';

const Dashboard = () => {
  const { portfolioValue, portfolioChange } = useFetchPortfolio();
  const topMovers = useFetchTopMovers();
  const news = useFetchNews();
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(format(new Date(), 'HH:mm'));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard" style={{ backgroundColor: 'var(--bg)', padding: '16px' }}>
      <Header currentTime={currentTime} />
      <div className="hero-card">
        <h2 className="portfolio-value">
          ${portfolioValue.toLocaleString()}
          <span className={`change ${portfolioChange >= 0 ? 'positive' : 'negative'}`}>
            {portfolioChange >= 0 ? `+${portfolioChange}%` : `${portfolioChange}%`}
          </span>
        </h2>
        <svg className="sparkline" width="100%" height="20">
          {/* SVG sparkline implementation here */}
        </svg>
      </div>
      <div className="top-movers">
        {topMovers.map((mover) => (
          <div key={mover.symbol} className="mover-card">
            <div className="logo" style={{ backgroundColor: mover.color }}>
              {mover.symbol}
            </div>
            <div className="price">
              ${mover.price}
              <span className={`price-change ${mover.change >= 0 ? 'positive' : 'negative'}`}>
                {mover.change >= 0 ? `+${mover.change}%` : `${mover.change}%`}
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="fear-greed-gauge">
        {/* SVG gauge implementation here */}
      </div>
      <div className="news-feed">
        {news.map((item) => (
          <div key={item.id} className="news-item">
            <span className={`source-badge ${item.sourceColor}`}>{item.source}</span>
            <span className="news-title">{item.title}</span>
            <span className="time-ago">{item.timeAgo}</span>
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

// src/components/Header.jsx
import React from 'react';

const Header = ({ currentTime }) => {
  return (
    <header className="header">
      <h1>Bonjour Andrea</h1>
      <div className="time-badge">
        <span>{currentTime}</span>
        <span className="live-badge">LIVE</span>
      </div>
    </header>
  );
};

export default Header;

// Dashboard.css
.dashboard {
  max-width: 520px;
  margin: 0 auto;
  padding: 16px;
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
  color: var(--t1);
}

.change {
  margin-left: 8px;
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
  margin-bottom: 16px;
}

.mover-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 16px;
  margin-right: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}

.price {
  font-size: 1.2em;
}

.price-change {
  margin-left: 8px;
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

.source-badge {
  padding: 4px 8px;
  border-radius: 4px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.action-card {
  background: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 16px;
  text-align: center;
}