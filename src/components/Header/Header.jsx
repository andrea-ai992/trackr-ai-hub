**src/pages/Dashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import Header from '../components/Header/Header';
import HeroCard from '../components/HeroCard/HeroCard';
import TopMovers from '../components/TopMovers/TopMovers';
import FearAndGreed from '../components/FearAndGreed/FearAndGreed';
import NewsFeed from '../components/NewsFeed/NewsFeed';
import QuickActions from '../components/QuickActions/QuickActions';
import { getPortfolioValue, getTopMovers, getNewsFeed, getFearAndGreed } from '../utils/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [topMovers, setTopMovers] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);
  const [fearAndGreed, setFearAndGreed] = useState({ value: 0, label: '' });

  useEffect(() => {
    const fetchPortfolioValue = async () => {
      const { data, error } = await getPortfolioValue();
      if (error) {
        console.error(error);
      } else {
        setPortfolioValue(data.value);
      }
    };
    const fetchTopMovers = async () => {
      const { data, error } = await getTopMovers();
      if (error) {
        console.error(error);
      } else {
        setTopMovers(data.topMovers);
      }
    };
    const fetchNewsFeed = async () => {
      const { data, error } = await getNewsFeed();
      if (error) {
        console.error(error);
      } else {
        setNewsFeed(data.newsFeed);
      }
    };
    const fetchFearAndGreed = async () => {
      const { data, error } = await getFearAndGreed();
      if (error) {
        console.error(error);
      } else {
        setFearAndGreed({ value: data.value, label: data.label });
      }
    };
    fetchPortfolioValue();
    fetchTopMovers();
    fetchNewsFeed();
    fetchFearAndGreed();
  }, []);

  return (
    <div className="page-container">
      <Header />
      <div className="skeleton-container" style={{ opacity: 0 }}>
        <HeroCard
          value={portfolioValue}
          variation={2.4}
          sparklineData={[
            { x: 1, y: 100 },
            { x: 2, y: 120 },
            { x: 3, y: 110 },
            { x: 4, y: 130 },
            { x: 5, y: 120 },
            { x: 6, y: 110 },
            { x: 7, y: 130 },
          ]}
        />
        <TopMovers topMovers={topMovers} />
        <FearAndGreed fearAndGreed={fearAndGreed} />
        <NewsFeed newsFeed={newsFeed} />
        <QuickActions />
      </div>
      <div className="content-container">
        <HeroCard
          value={portfolioValue}
          variation={2.4}
          sparklineData={[
            { x: 1, y: 100 },
            { x: 2, y: 120 },
            { x: 3, y: 110 },
            { x: 4, y: 130 },
            { x: 5, y: 120 },
            { x: 6, y: 110 },
            { x: 7, y: 130 },
          ]}
        />
        <TopMovers topMovers={topMovers} />
        <FearAndGreed fearAndGreed={fearAndGreed} />
        <NewsFeed newsFeed={newsFeed} />
        <QuickActions />
      </div>
    </div>
  );
};

export default Dashboard;
```

**src/components/Header/Header.jsx**
```jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '../utils/supabase';

const Header = () => {
  const location = useLocation();
  const [currentTime, setCurrentTime] = React.useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-title">Bonjour Andrea</h1>
        <p className="header-time">{currentTime}</p>
        <button className="header-badge live-badge">
          LIVE
        </button>
      </div>
    </header>
  );
};

export default Header;
```

**src/components/HeroCard/HeroCard.jsx**
```jsx
import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const HeroCard = ({ value, variation, sparklineData }) => {
  return (
    <div className="hero-card">
      <div className="hero-card-content">
        <h1 className="hero-card-title">
          {value.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
        </h1>
        <p className="hero-card-variation">
          {variation > 0 ? `+${variation}%` : variation < 0 ? `${variation}%` : '0%'}
          <svg
            className="hero-card-variation-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 11a7 7 0 1 0-9.3 6.17L5 18l.3-1.8a2 2 0 0 1 2.41-.35L11 13.83l4.57-4.57a2 2 0 0 1 2.6.64l-.94 1.94c-.4.39-.78.73-1.13 1a7 7 0 0 1-9.65 0"
            />
          </svg>
        </p>
        <svg
          className="hero-card-sparkline"
          viewBox="0 0 100 10"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
        >
          {sparklineData.map((data, index) => (
            <line
              key={index}
              x1={data.x}
              y1={5}
              x2={data.x}
              y2={data.y}
              stroke="#00ff88"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    </div>
  );
};

export default HeroCard;
```

**src/components/TopMovers/TopMovers.jsx**
```jsx
import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const TopMovers = ({ topMovers }) => {
  return (
    <div className="top-movers">
      <h2 className="top-movers-title">Top Movers</h2>
      <div className="top-movers-container">
        {topMovers.map((topMover, index) => (
          <div key={index} className="top-movers-card">
            <div className="top-movers-card-content">
              <h3 className="top-movers-card-title">{topMover.name}</h3>
              <p className="top-movers-card-price">
                {topMover.price.toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
              </p>
              <p className="top-movers-card-variation">
                {topMover.variation > 0 ? `+${topMover.variation}%` : topMover.variation < 0 ? `${topMover.variation}%` : '0%'}
                <svg
                  className="top-movers-card-variation-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 11a7 7 0 1 0-9.3 6.17L5 18l.3-1.8a2 2 0 0 1 2.41-.35L11 13.83l4.57-4.57a2 2 0 0 1 2.6.64l-.94 1.94c-.4.39-.78.73-1.13 1a7 7 0 0 1-9.65 0"
                  />
                </svg>
              </p>
            </div>
            <div className="top-movers-card-badge">
              <svg
                className="top-movers-card-badge-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 11a7 7 0 1 0-14 0a7 7 0 0 0 14 0z"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopMovers;
```

**src/components/FearAndGreed/FearAndGreed.jsx**
```jsx
import React from 'react';

const FearAndGreed = ({ fearAndGreed }) => {
  return (
    <div className="fear-and-greed">
      <h2 className="fear-and-greed-title">Fear & Greed</h2>
      <div className="fear-and-greed-container">
        <svg
          className="fear-and-greed-gauge"
          viewBox="0 0 100 100"
          fill="none"
          stroke="#00ff88"
          strokeWidth="2"
        >
          <circle
            cx="50"
            cy="50"
            r="45"
            stroke="#00ff88"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M 50 50 L 50 100 L 70 100 L 70 50 L 50 50"
            stroke="#00ff88"
            strokeWidth="2"
          />
          <text
            x="50"
            y="50"
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="24"
            fill="#00ff88"
          >
            {fearAndGreed.value}
          </text>
        </svg>
        <p className="fear-and-greed-label">{fearAndGreed.label}</p>
      </div>
    </div>
  );
};

export default FearAndGreed;
```

**src/components/NewsFeed/NewsFeed.jsx**
```jsx
import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const NewsFeed = ({ newsFeed }) => {
  return (
    <div className="news-feed">
      <h2 className="news-feed-title">News Feed</h2>
      <div className="news-feed-container">
        {newsFeed.map((news, index) => (
          <div key={index} className="news-feed-card">
            <div className="news-feed-card-content">
              <h3 className="news-feed-card-title">{news.title}</h3>
              <p className="news-feed-card-source">{news.source}</p>
              <p className="news-feed-card-time">{news.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NewsFeed;
```

**src/components/QuickActions/QuickActions.jsx**
```jsx
import React from 'react';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const QuickActions = () => {
  return (
    <div className="quick-actions">
      <h2 className="quick-actions-title">Quick Actions</h2>
      <div className="quick-actions-container">
        <div className="quick-actions-card">
          <div className="quick-actions-card-content">
            <h3 className="quick-actions-card-title">Markets</h3>
            <p className="quick-actions-card-description">View market data</p>
          </div>
        </div>
        <div className="quick-actions-card">
          <div className="quick-actions-card-content">
            <h3 className="quick-actions-card-title">Portfolio</h3>
            <p className="quick-actions-card-description">View your portfolio</p>
          </div>
        </div>
        <div className="quick-actions-card">
          <div className="quick-actions-card-content">
            <h3 className="quick-actions-card-title">Signals</h3>
            <p className="quick-actions-card-description">View trading signals</p>
          </div>
        </div>
        <div className="quick-actions-card">
          <div className="quick-actions-card-content">
            <h3 className="quick-actions-card-title">AnDy</h3>
            <p className="quick-actions-card-description">Chat with AnDy</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;
```

**styles.css**
```css
.page-container {
  max-width: 520px;
  margin: 0 auto;
  padding: 20px;
  background-color: #080808;
  color: #f0f0f0;
}

.header {
  background-color: #080808;
  color: #f0f0f0;
  padding: 20px;
  text-align: center;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.header-time {
  font-size: 18px;
  margin: 0;
}

.header-badge {
  background-color: #00ff88;
  color: #080808;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
}

.hero-card {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.hero-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-card-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.hero-card-variation {
  font-size: 18px;
  margin: 0;
}

.hero-card-variation-icon {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.hero-card-sparkline {
  width: 100%;
  height: 20px;
  margin-top: 10px;
}

.top-movers {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.top-movers-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.top-movers-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
}

.top-movers-card {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 20px;
  border-radius: 10px;
  margin: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.top-movers-card-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.top-movers-card-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.top-movers-card-price {
  font-size: 18px;
  margin: 0;
}

.top-movers-card-variation {
  font-size: 18px;
  margin: 0;
}

.top-movers-card-variation-icon {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.top-movers-card-badge {
  background-color: #00ff88;
  color: #080808;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 18px;
  cursor: pointer;
}

.top-movers-card-badge-icon {
  width: 20px;
  height: 20px;
}

.fear-and-greed {
  background-color: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.07);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

.fear-and-greed-title {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
}

.fear-and-greed-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.fear-and-greed-gauge {
  width: 100px;
  height: 100px;
  margin-top: 10px;
}

.fear-and-greed-label {
  font-size: 18px;
  margin: 0