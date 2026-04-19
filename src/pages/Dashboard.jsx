// src/pages/Dashboard.jsx

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { BsArrowClockwise } from 'lucide-react';
import { supabase } from '../utils/supabase';

const Dashboard = () => {
  const location = useLocation();
  const [data, setData] = useState({
    portfolioValue: 0,
    pnl24h: 0,
    movers: [],
    news: [],
    fearGreed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: portfolio } = await supabase
          .from('portfolio')
          .select('value, pnl24h');
        const { data: movers } = await supabase
          .from('movers')
          .select('symbol, price, percentage_change');
        const { data: news } = await supabase
          .from('news')
          .select('title, source, timestamp');
        const { data: fearGreed } = await supabase
          .from('fear_greed')
          .select('value');
        setData({
          portfolioValue: portfolio[0]?.value || 0,
          pnl24h: portfolio[0]?.pnl24h || 0,
          movers: movers.map((m) => ({
            symbol: m.symbol,
            price: m.price,
            percentage_change: m.percentage_change,
          })),
          news: news.slice(-3).map((n) => ({
            title: n.title,
            source: n.source,
            timestamp: n.timestamp,
          })),
          fearGreed: fearGreed[0]?.value || 0,
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    await fetchDashboardData();
    setLoading(false);
  };

  const renderMovers = () => {
    return data.movers.map((mover, index) => (
      <div key={index} className="mover">
        <span className="symbol">{mover.symbol}</span>
        <span className="price">{mover.price}</span>
        <span className="percentage_change">
          {mover.percentage_change > 0 ? '+' : '-'}
          {Math.abs(mover.percentage_change).toFixed(2)}%
        </span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 1.5L1.5 10M18.5 10L10 18.5"
            stroke="var(--neon)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ));
  };

  const renderNews = () => {
    return data.news.map((newsItem, index) => (
      <div key={index} className="news-item">
        <span className="title">{newsItem.title}</span>
        <span className="source">{newsItem.source}</span>
        <span className="timestamp">
          {new Date(newsItem.timestamp).toLocaleString()}
        </span>
      </div>
    ));
  };

  const renderQuickActions = () => {
    return [
      {
        label: 'Markets',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1.5L1.5 10M18.5 10L10 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
        to: '/markets',
      },
      {
        label: 'Sports',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1.5L1.5 10M18.5 10L10 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
        to: '/sports',
      },
      {
        label: 'Flights',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1.5L1.5 10M18.5 10L10 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
        to: '/flights',
      },
      {
        label: 'AnDy',
        icon: <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 1.5L1.5 10M18.5 10L10 18.5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>,
        to: '/andy',
      },
    ].map((action, index) => (
      <Link key={index} to={action.to} className="quick-action">
        {action.icon}
        <span className="label">{action.label}</span>
      </Link>
    ));
  };

  return (
    <div className="dashboard">
      <Helmet>
        <title>Trackr</title>
      </Helmet>
      <header className="header">
        <div className="salutation">
          <span className="greeting">Bonjour</span>
          <span className="date">{new Date().toLocaleString()}</span>
        </div>
        <div className="refresh">
          <button onClick={refreshData}>
            <BsArrowClockwise />
          </button>
        </div>
      </header>
      <main className="main">
        <section className="hero">
          <div className="card">
            <div className="value">
              <span className="amount">{data.portfolioValue}</span>
              <span className="label">Total Value</span>
            </div>
            <div className="pnl">
              <span className="amount">{data.pnl24h}</span>
              <span className="label">24h P&L</span>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 1.5L1.5 10M18.5 10L10 18.5"
                  stroke={data.pnl24h > 0 ? 'var(--neon)' : '#ff0000'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </section>
        <section className="movers">
          <div className="scroll-container">
            <div className="scroll-content">
              {renderMovers()}
            </div>
          </div>
        </section>
        <section className="fear-greed">
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M50 1.5L1.5 50M98.5 50L50 98.5"
              stroke="#ff0000"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M50 1.5L1.5 50M98.5 50L50 98.5"
              stroke="#00ff88"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={data.fearGreed / 100}
            />
          </svg>
          <span className="label">Fear & Greed Index</span>
          <span className="value">{data.fearGreed}%</span>
        </section>
        <section className="news">
          <h2 className="title">News</h2>
          <div className="news-list">
            {renderNews()}
          </div>
        </section>
        <section className="quick-actions">
          <div className="grid">
            {renderQuickActions()}
          </div>
        </section>
      </main>
      {loading && (
        <div className="skeleton-loader">
          <div className="skeleton-box" />
          <div className="skeleton-box" />
          <div className="skeleton-box" />
        </div>
      )}
    </div>
  );
};

export default Dashboard;