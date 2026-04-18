**src/components/Header.jsx**
```jsx
import React from 'react';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '@emotion/react';
import { Badge, Text } from 'lucide-react';

const Header = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 520 });

  const currentTime = new Date().toLocaleTimeString();
  const badgeColor = theme.colors.green;

  return (
    <header className="flex justify-between items-center py-4">
      <div className="flex items-center">
        <Text className="text-2xl font-bold mr-2" color={theme.colors.text1}>
          Bonjour Andrea
        </Text>
        <Text className="text-lg" color={theme.colors.text2}>
          {currentTime}
        </Text>
      </div>
      <div className="flex items-center">
        <Badge
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded-full"
          color={badgeColor}
          size={20}
        >
          LIVE
        </Badge>
      </div>
    </header>
  );
};

export default Header;
```

**src/pages/Dashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useTheme } from '@emotion/react';
import Header from '../components/Header';
import { useMediaQuery } from 'react-responsive';
import { Skeleton, Text, Badge, Icon } from 'lucide-react';
import { useSupabaseClient } from '../hooks/useSupabaseClient';
import { getPortfolioValue, getTopMovers, getNewsFeed } from '../api';

const Dashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery({ maxWidth: 520 });
  const supabaseClient = useSupabaseClient();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [topMovers, setTopMovers] = useState([]);
  const [newsFeed, setNewsFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolioValue = async () => {
      const value = await getPortfolioValue(supabaseClient);
      setPortfolioValue(value);
    };
    const fetchTopMovers = async () => {
      const movers = await getTopMovers(supabaseClient);
      setTopMovers(movers);
    };
    const fetchNewsFeed = async () => {
      const feed = await getNewsFeed(supabaseClient);
      setNewsFeed(feed);
    };
    fetchPortfolioValue();
    fetchTopMovers();
    fetchNewsFeed();
    setLoading(false);
  }, [supabaseClient]);

  const heroCardStyles = `
    backdrop-filter: blur(12px);
    background-color: rgba(255, 255, 255, 0.04);
    border: 1px solid ${theme.colors.border};
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  `;

  const topMoversStyles = `
    display: flex;
    overflow-x: auto;
    padding: 20px;
  `;

  const quickActionsStyles = `
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    padding: 20px;
  `;

  return (
    <div className="max-w-520 mx-auto p-4">
      <Header />
      <section className="py-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Portfolio</h2>
          <Text className="text-lg" color={theme.colors.text2}>
            {portfolioValue}$
          </Text>
        </div>
        <div className="flex justify-between items-center">
          <Text className="text-lg" color={theme.colors.text2}>
            Variation : {loading ? '-' : Math.round((portfolioValue / 100 - 1) * 100)}%
          </Text>
          <svg
            className="w-8 h-8 text-green-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 10l-2 1m0 0l2 2m-5 4v1a1 1 0 001 1h4a1 1 0 001-1V6a1 1 0 001-1H5a1 1 0 001-1m4 4h4"
            />
          </svg>
        </div>
      </section>
      <section className="py-4">
        <h2 className="text-2xl font-bold">Top Movers</h2>
        <div className={topMoversStyles}>
          {topMovers.map((mover, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <svg
                    className="w-8 h-8 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 10l-2 1m0 0l2 2m-5 4v1a1 1 0 001 1h4a1 1 0 001-1V6a1 1 0 001-1H5a1 1 0 001-1m4 4h4"
                    />
                  </svg>
                  <Text className="text-lg" color={theme.colors.text2}>
                    {mover.symbol}
                  </Text>
                </div>
                <Text className="text-lg" color={theme.colors.text2}>
                  {mover.price}
                </Text>
                <Text
                  className={`text-lg ${
                    mover.change > 0 ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {mover.change}%
                </Text>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="py-4">
        <h2 className="text-2xl font-bold">Fear & Greed</h2>
        <svg
          className="w-48 h-48 text-gray-400"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
        >
          <circle cx="50" cy="50" r="45" stroke-width="10" />
          <path
            d="M 50 50 L 50 90"
            stroke-width="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <path
            d="M 50 50 L 90 50"
            stroke-width="10"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
        <Text className="text-lg" color={theme.colors.text2}>
          {loading ? '-' : Math.round(fearAndGreed / 100 * 100)}%
        </Text>
      </section>
      <section className="py-4">
        <h2 className="text-2xl font-bold">News Feed</h2>
        <div className="flex flex-col">
          {newsFeed.map((item, index) => (
            <div key={index} className="bg-gray-900 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <Text className="text-lg" color={theme.colors.text2}>
                  {item.title}
                </Text>
                <Text
                  className={`text-lg ${
                    item.source === 'source1' ? 'text-red-500' : 'text-green-500'
                  }`}
                >
                  {item.source}
                </Text>
              </div>
              <Text className="text-lg" color={theme.colors.text2}>
                {item.timeAgo}
              </Text>
            </div>
          ))}
        </div>
      </section>
      <section className="py-4">
        <h2 className="text-2xl font-bold">Quick Actions</h2>
        <div className={quickActionsStyles}>
          <div
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition duration-300"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Icon
              className="text-lg"
              color={theme.colors.text2}
              name="chart-bar"
            />
            <Text className="text-lg" color={theme.colors.text2}>
              Markets
            </Text>
          </div>
          <div
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition duration-300"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Icon
              className="text-lg"
              color={theme.colors.text2}
              name="briefcase"
            />
            <Text className="text-lg" color={theme.colors.text2}>
              Portfolio
            </Text>
          </div>
          <div
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition duration-300"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Icon
              className="text-lg"
              color={theme.colors.text2}
              name="signal"
            />
            <Text className="text-lg" color={theme.colors.text2}>
              Signals
            </Text>
          </div>
          <div
            className="bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition duration-300"
            style={{
              backdropFilter: 'blur(12px)',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.07)',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            }}
          >
            <Icon
              className="text-lg"
              color={theme.colors.text2}
              name="robot"
            />
            <Text className="text-lg" color={theme.colors.text2}>
              AnDy
            </Text>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
```

**styles.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #444;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

body {
  background-color: var(--bg);
  font-family: 'Inter', sans-serif;
  color: var(--t2);
  max-width: 520px;
  margin: 0 auto;
  padding: 20px;
}

header {
  background-color: var(--bg);
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

header .flex {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header .text-2xl {
  font-size: 24px;
  font-weight: bold;
}

header .text-lg {
  font-size: 18px;
}

.hero-card {
  background-color: rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.hero-card .text-2xl {
  font-size: 24px;
  font-weight: bold;
}

.hero-card .text-lg {
  font-size: 18px;
}

.top-movers {
  display: flex;
  overflow-x: auto;
  padding: 20px;
}

.top-movers .bg-gray-900 {
  background-color: var(--bg);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.top-movers .text-lg {
  font-size: 18px;
}

.fear-and-greed {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--bg);
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.fear-and-greed .text-lg {
  font-size: 18px;
}

.news-feed {
  padding: 20px;
}

.news-feed .bg-gray-900 {
  background-color: var(--bg);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.news-feed .text-lg {
  font-size: 18px;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  padding: 20px;
}

.quick-actions .bg-gray-900 {
  background-color: var(--bg);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.quick-actions .text-lg {
  font-size: 18px;
}
```
Note : Les styles CSS sont écrits en utilisant les variables CSS définies dans le fichier `styles.css`. Les classes CSS sont utilisées pour styliser les éléments HTML. Les animations et les effets sont réalisés en utilisant les propriétés CSS telles que `backdrop-filter`, `box-shadow`, `border-radius`, etc.