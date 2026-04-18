src/components/Header/Header.jsx
```jsx
import React from 'react';
import { Clock, User } from 'lucide-react';

const Header = () => {
  const currentTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const greeting = `Bonjour Andrea, ${currentTime}`;

  return (
    <header className="header">
      <div className="header-content">
        <div className="greeting">{greeting}</div>
        <div className="live-badge">
          <span className="live-badge-text">Live</span>
          <span className="live-badge-pulse"></span>
        </div>
      </div>
      <style jsx>{`
        .header {
          background-color: var(--bg);
          padding: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header-content {
          display: flex;
          align-items: center;
        }
        .greeting {
          font-size: 1.2rem;
          color: var(--t1);
          margin-right: 1rem;
        }
        .live-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 50%;
          background-color: var(--green);
          color: var(--bg);
          font-size: 0.8rem;
          position: relative;
        }
        .live-badge-text {
          z-index: 1;
        }
        .live-badge-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: var(--green);
          opacity: 0.5;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
```
src/pages/Dashboard.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Header from '../components/Header/Header';
import PortfolioHero from '../components/PortfolioHero/PortfolioHero';
import Movers from '../components/Movers/Movers';
import FearGreed from '../components/FearGreed/FearGreed';
import NewsFeed from '../components/NewsFeed/NewsFeed';
import QuickActions from '../components/QuickActions/QuickActions';

const Dashboard = () => {
  // existing hooks and data

  return (
    <div className="dashboard">
      <Header />
      <div className="dashboard-content">
        <PortfolioHero />
        <Movers />
        <FearGreed />
        <NewsFeed />
        <QuickActions />
      </div>
      <style jsx>{`
        .dashboard {
          background-color: var(--bg);
          max-width: 520px;
          margin: 0 auto;
          padding: 1rem;
        }
        .dashboard-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;
```
Note: Les autres composants (PortfolioHero, Movers, FearGreed, NewsFeed, QuickActions) devront être créés séparément en suivant les mêmes règles et conventions.