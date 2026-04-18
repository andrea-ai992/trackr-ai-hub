import React, { useEffect, useState } from 'react';
import { fetchPortfolioData, fetchMoversData, fetchNewsData } from '../api'; // Assume these functions are defined in your API module
import StickyHeader from '../components/Header/StickyHeader';
import './Dashboard.css'; // Assuming you have a separate CSS file for styling

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [movers, setMovers] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const portfolioData = await fetchPortfolioData();
      const moversData = await fetchMoversData();
      const newsData = await fetchNewsData();
      setPortfolio(portfolioData);
      setMovers(moversData);
      setNews(newsData);
      setLoading(false);
    };
    fetchData();
  }, []);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <div className="dashboard" style={{ backgroundColor: 'var(--bg)' }}>
      <StickyHeader date={formatDate(new Date())} onRefresh={() => fetchData()} />
      <div className="hero-card">
        {loading ? (
          <div className="skeleton-loader" />
        ) : (
          <>
            <h1 style={{ color: 'var(--t1)' }}>Total Value: ${portfolio.totalValue}</h1>
            <p style={{ color: portfolio.pnl24h >= 0 ? 'var(--green)' : 'red' }}>
              P&L 24h: {portfolio.pnl24h}%
            </p>
          </>
        )}
      </div>
      <div className="movers">
        <h2 style={{ color: 'var(--t1)' }}>Movers</h2>
        <div className="movers-scroll">
          {movers.map((mover) => (
            <div className="mover" key={mover.symbol}>
              <span style={{ color: 'var(--t1)' }}>{mover.symbol}</span>
              <span style={{ color: 'var(--t2)' }}>${mover.price}</span>
              <span style={{ color: mover.change >= 0 ? 'var(--green)' : 'red' }}>
                {mover.change}%
              </span>
              <svg className="sparkline" width="100" height="20">
                {/* SVG logic for sparkline */}
              </svg>
            </div>
          ))}
        </div>
      </div>
      <div className="fear-greed-gauge">
        {/* SVG for Fear & Greed gauge */}
      </div>
      <div className="news-section">
        <h2 style={{ color: 'var(--t1)' }}>Latest News</h2>
        {news.slice(0, 3).map((newsItem) => (
          <div className="news-item" key={newsItem.id}>
            <span style={{ color: 'var(--t2)' }}>{newsItem.title}</span>
            <span style={{ color: 'var(--t3)' }}>{newsItem.source}</span>
            <span style={{ color: 'var(--t3)' }}>{newsItem.timeAgo}</span>
          </div>
        ))}
      </div>
      <div className="quick-actions">
        <div className="action" onClick={() => {/* Navigate to Markets */}}>Markets ↗</div>
        <div className="action" onClick={() => {/* Navigate to Sports */}}>Sports 🏆</div>
        <div className="action" onClick={() => {/* Navigate to Flights */}}>Flights ✈</div>
        <div className="action" onClick={() => {/* Open AnDy chat */}}>AnDy ◈</div>
      </div>
    </div>
  );
};

export default Dashboard;

import React from 'react';
import './StickyHeader.css';

const StickyHeader = ({ date, onRefresh }) => {
  return (
    <header className="sticky-header" style={{ backgroundColor: 'var(--bg2)' }}>
      <div className="header-content">
        <h1 style={{ color: 'var(--t1)' }}>Hello, User</h1>
        <span style={{ color: 'var(--t2)' }}>{date}</span>
        <button onClick={onRefresh} style={{ color: 'var(--green)' }}>
          Refresh
        </button>
      </div>
    </header>
  );
};

export default StickyHeader; 

/* Dashboard.css */
.dashboard {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.hero-card {
  border: 2px solid var(--green);
  padding: 20px;
  margin-bottom: 20px;
}

.movers {
  margin-bottom: 20px;
}

.movers-scroll {
  display: flex;
  overflow-x: auto;
}

.mover {
  margin-right: 10px;
}

.fear-greed-gauge {
  margin-bottom: 20px;
}

.news-section {
  margin-bottom: 20px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.action {
  background-color: var(--bg2);
  padding: 10px;
  text-align: center;
  border: 1px solid var(--border);
  color: var(--t1);
}

/* StickyHeader.css */
.sticky-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  padding: 10px;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}