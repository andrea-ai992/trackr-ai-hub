**src/components/Header/Header.jsx**
```jsx
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { FaBell } from 'lucide-react';
import { useTheme } from './useTheme';

const Header = () => {
  const isMobile = useMediaQuery({ maxWidth: 520 });
  const theme = useTheme();

  return (
    <header className={`header ${isMobile ? 'mobile' : ''}`}>
      <div className="header-content">
        <h1 className="title">
          Bonjour Andrea
          <span className="time">{new Date().toLocaleTimeString()}</span>
        </h1>
        <div className="live-badge">
          <span className="live-icon">
            <FaBell />
          </span>
          <span className="live-text">Live</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

**src/pages/Dashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useTheme, useMediaQuery } from './useTheme';
import Header from '../components/Header/Header';
import { Link } from 'react-router-dom';
import { FaArrowUp, FaArrowDown } from 'lucide-react';
import { SupabaseClient } from '@supabase/supabase-js';

const Dashboard = () => {
  const isMobile = useMediaQuery({ maxWidth: 520 });
  const theme = useTheme();
  const [data, setData] = useState({});

  useEffect(() => {
    const supabase = new SupabaseClient('https://trackr-app-nu.vercel.app');
    const query = supabase
      .from('portfolio')
      .select('value, variation')
      .eq('user_id', 'andrea');
    supabase
      .query(query)
      .then((response) => {
        setData(response.data[0]);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  return (
    <div className={`app ${isMobile ? 'mobile' : ''}`}>
      <Header />
      <main className="main">
        <section className="portfolio-hero">
          <h2 className="title">Portfolio</h2>
          <p className="value">
            ${data.value.toLocaleString()}
            <span className="variation">
              {data.variation > 0 ? (
                <FaArrowUp className="icon" />
              ) : (
                <FaArrowDown className="icon" />
              )}
              {data.variation.toFixed(2)}%
            </span>
          </p>
          <svg
            className="sparkline"
            viewBox="0 0 100 10"
            preserveAspectRatio="none"
          >
            <path
              d={`M 0 ${data.variation * 10} S 100 ${data.variation * 10} 100`}
              fill="#00ff88"
            />
          </svg>
        </section>
        <section className="movers">
          <h2 className="title">Movers</h2>
          <ul className="list">
            {data.movers.map((mover, index) => (
              <li key={index} className="item">
                <h3 className="symbol">{mover.symbol}</h3>
                <p className="price">
                  ${mover.price.toLocaleString()}
                  <span className="change">
                    {mover.change > 0 ? (
                      <FaArrowUp className="icon" />
                    ) : (
                      <FaArrowDown className="icon" />
                    )}
                    {mover.change.toFixed(2)}%
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="fear-greed">
          <h2 className="title">Fear & Greed</h2>
          <svg
            className="gauge"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path
              d={`M 50 0 A 50 50 0 1 1 50 100`}
              fill="#00ff88"
              stroke="#00ff88"
              strokeWidth="10"
            />
            <path
              d={`M 50 0 A 50 50 0 1 1 50 100`}
              fill="none"
              stroke="#00ff88"
              strokeWidth="10"
            />
            <text
              x="50"
              y="50"
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#00ff88"
            >
              {data.fearGreed}
            </text>
          </svg>
          <p className="label">
            {data.fearGreed === 'Fear' ? 'Fear' : data.fearGreed === 'Greed' ? 'Greed' : 'Neutral'}
          </p>
        </section>
        <section className="news-feed">
          <h2 className="title">News Feed</h2>
          <ul className="list">
            {data.news.map((news, index) => (
              <li key={index} className="item">
                <h3 className="title">{news.title}</h3>
                <p className="source">
                  <span className="badge">{news.source}</span>
                  <span className="time">{news.time}</span>
                </p>
              </li>
            ))}
          </ul>
        </section>
        <section className="quick-actions">
          <h2 className="title">Quick Actions</h2>
          <div className="grid">
            <Link to="/markets" className="item">
              <FaChartBar className="icon" />
              <span className="label">Markets</span>
            </Link>
            <Link to="/portfolio" className="item">
              <FaWallet className="icon" />
              <span className="label">Portfolio</span>
            </Link>
            <Link to="/signals" className="item">
              <FaBullseye className="icon" />
              <span className="label">Signals</span>
            </Link>
            <Link to="/andy" className="item">
              <FaRobot className="icon" />
              <span className="label">AnDy</span>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
```

**src/components/Header/Header.styles.css**
```css
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

.title {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  color: var(--t1);
}

.time {
  font-size: 1rem;
  color: var(--t2);
}

.live-badge {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: var(--green);
  color: var(--t1);
}

.live-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.live-text {
  font-size: 1rem;
}
```

**src/pages/Dashboard.styles.css**
```css
.app {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  padding: 2rem;
  max-width: 520px;
  margin: 0 auto;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.portfolio-hero {
  background-color: var(--bg2);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.portfolio-hero .title {
  font-size: 2rem;
  color: var(--t1);
}

.portfolio-hero .value {
  font-size: 3rem;
  color: var(--t1);
}

.portfolio-hero .variation {
  font-size: 1.5rem;
  color: var(--t2);
}

.portfolio-hero .sparkline {
  width: 100%;
  height: 20px;
  margin-top: 1rem;
}

.movers {
  padding: 2rem;
}

.movers .title {
  font-size: 2rem;
  color: var(--t1);
}

.movers .list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.movers .item {
  margin: 1rem;
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.movers .symbol {
  font-size: 2rem;
  color: var(--t1);
}

.movers .price {
  font-size: 1.5rem;
  color: var(--t2);
}

.movers .change {
  font-size: 1rem;
  color: var(--t3);
}

.fear-greed {
  padding: 2rem;
}

.fear-greed .title {
  font-size: 2rem;
  color: var(--t1);
}

.fear-greed .gauge {
  width: 100%;
  height: 100px;
  margin-top: 1rem;
}

.fear-greed .label {
  font-size: 1.5rem;
  color: var(--t2);
}

.news-feed {
  padding: 2rem;
}

.news-feed .title {
  font-size: 2rem;
  color: var(--t1);
}

.news-feed .list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.news-feed .item {
  margin: 1rem;
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.news-feed .title {
  font-size: 1.5rem;
  color: var(--t2);
}

.news-feed .source {
  font-size: 1rem;
  color: var(--t3);
}

.quick-actions {
  padding: 2rem;
}

.quick-actions .title {
  font-size: 2rem;
  color: var(--t1);
}

.quick-actions .grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-actions .item {
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.quick-actions .icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.quick-actions .label {
  font-size: 1.5rem;
  color: var(--t2);
}
```

**src/components/Header/Header.styles.css**
```css
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

.title {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  color: var(--t1);
}

.time {
  font-size: 1rem;
  color: var(--t2);
}

.live-badge {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: var(--green);
  color: var(--t1);
}

.live-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.live-text {
  font-size: 1rem;
}
```

**src/pages/Dashboard.styles.css**
```css
.app {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  padding: 2rem;
  max-width: 520px;
  margin: 0 auto;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.portfolio-hero {
  background-color: var(--bg2);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.portfolio-hero .title {
  font-size: 2rem;
  color: var(--t1);
}

.portfolio-hero .value {
  font-size: 3rem;
  color: var(--t1);
}

.portfolio-hero .variation {
  font-size: 1.5rem;
  color: var(--t2);
}

.portfolio-hero .sparkline {
  width: 100%;
  height: 20px;
  margin-top: 1rem;
}

.movers {
  padding: 2rem;
}

.movers .title {
  font-size: 2rem;
  color: var(--t1);
}

.movers .list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.movers .item {
  margin: 1rem;
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.movers .symbol {
  font-size: 2rem;
  color: var(--t1);
}

.movers .price {
  font-size: 1.5rem;
  color: var(--t2);
}

.movers .change {
  font-size: 1rem;
  color: var(--t3);
}

.fear-greed {
  padding: 2rem;
}

.fear-greed .title {
  font-size: 2rem;
  color: var(--t1);
}

.fear-greed .gauge {
  width: 100%;
  height: 100px;
  margin-top: 1rem;
}

.fear-greed .label {
  font-size: 1.5rem;
  color: var(--t2);
}

.news-feed {
  padding: 2rem;
}

.news-feed .title {
  font-size: 2rem;
  color: var(--t1);
}

.news-feed .list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.news-feed .item {
  margin: 1rem;
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.news-feed .title {
  font-size: 1.5rem;
  color: var(--t2);
}

.news-feed .source {
  font-size: 1rem;
  color: var(--t3);
}

.quick-actions {
  padding: 2rem;
}

.quick-actions .title {
  font-size: 2rem;
  color: var(--t1);
}

.quick-actions .grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.quick-actions .item {
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.quick-actions .icon {
  font-size: 2rem;
  margin-right: 0.5rem;
}

.quick-actions .label {
  font-size: 1.5rem;
  color: var(--t2);
}
```

**src/components/Header/Header.styles.css**
```css
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

.title {
  font-family: 'Inter', sans-serif;
  font-size: 1.5rem;
  color: var(--t1);
}

.time {
  font-size: 1rem;
  color: var(--t2);
}

.live-badge {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 50%;
  background-color: var(--green);
  color: var(--t1);
}

.live-icon {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.live-text {
  font-size: 1rem;
}
```

**src/pages/Dashboard.styles.css**
```css
.app {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  padding: 2rem;
  max-width: 520px;
  margin: 0 auto;
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.portfolio-hero {
  background-color: var(--bg2);
  padding: 2rem;
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.portfolio-hero .title {
  font-size: 2rem;
  color: var(--t1);
}

.portfolio-hero .value {
  font-size: 3rem;
  color: var(--t1);
}

.portfolio-hero .variation {
  font-size: 1.5rem;
  color: var(--t2);
}

.portfolio-hero .sparkline {
  width: 100%;
  height: 20px;
  margin-top: 1rem;
}

.movers {
  padding: 2rem;
}

.movers .title {
  font-size: 2rem;
  color: var(--t1);
}

.movers .list {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.movers .item {
  margin: 1rem;
  padding: 1rem;
  background-color: var(--bg2);
  border-radius: 1rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.m