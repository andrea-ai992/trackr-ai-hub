**src/pages/Dashboard/Header/Header.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineClock } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

const Header = () => {
  const { theme } = useTheme();
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  return (
    <header className="flex justify-between items-center p-4">
      <div className="flex items-center">
        <h1 className="text-lg font-bold text--t1 mr-2">Bonjour Andrea</h1>
        <span className="text-sm text--t2">{formattedTime}</span>
      </div>
      <div className="flex items-center">
        <Link to="/" className="flex items-center justify-center w-8 h-8 bg--green rounded-full hover:bg--green-dark transition duration-300">
          <HiOutlineClock className="text--t1" />
        </Link>
        <span className="text-sm text--t2 ml-2">Live</span>
      </div>
    </header>
  );
};

export default Header;
```

**src/pages/Dashboard/Dashboard.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from './Header';
import SectionPortfolioHero from './SectionPortfolioHero';
import SectionMovers from './SectionMovers';
import SectionFearAndGreed from './SectionFearAndGreed';
import SectionNewsFeed from './SectionNewsFeed';
import SectionQuickActions from './SectionQuickActions';

const Dashboard = () => {
  const [data, setData] = useState({});

  useEffect(() => {
    // Charger les données ici
  }, []);

  return (
    <div className="max-w-520px mx-auto p-4">
      <Header />
      <SectionPortfolioHero data={data} />
      <SectionMovers data={data} />
      <SectionFearAndGreed data={data} />
      <SectionNewsFeed data={data} />
      <SectionQuickActions />
    </div>
  );
};

export default Dashboard;
```

**src/pages/Dashboard/SectionPortfolioHero/SectionPortfolioHero.jsx**
```jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const SectionPortfolioHero = ({ data }) => {
  const { theme } = useTheme();

  return (
    <section className="bg--bg p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text--t1">Portfolio</h2>
        <span className="text-sm text--t2">{data.totalValue}</span>
      </div>
      <div className="flex justify-between items-center mb-4">
        <span className="text-lg font-bold text--t1">{data.variation}%</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          {data.variation > 0 ? (
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          ) : (
            <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          )}
        </svg>
      </div>
      <div className="bg--bg2 p-4 rounded-lg shadow-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-64 h-8"
        >
          <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      </div>
    </section>
  );
};

export default SectionPortfolioHero;
```

**src/pages/Dashboard/SectionMovers/SectionMovers.jsx**
```jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const SectionMovers = ({ data }) => {
  const { theme } = useTheme();

  return (
    <section className="bg--bg p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold text--t1 mb-4">Movers</h2>
      <div className="flex overflow-x-auto">
        {data.movers.map((mover, index) => (
          <div key={index} className="bg--bg2 p-4 rounded-lg shadow-md m-2">
            <h3 className="text-lg font-bold text--t1">{mover.name}</h3>
            <p className="text-sm text--t2">{mover.price}</p>
            <p className="text-sm text--t2">{mover.change}%</p>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`w-8 h-8 text--t1 ${mover.change > 0 ? 'text--green' : 'text--red'}`}
            >
              {mover.change > 0 ? (
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              ) : (
                <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              )}
            </svg>
          </div>
        ))}
      </div>
    </section>
  );
};

export default SectionMovers;
```

**src/pages/Dashboard/SectionFearAndGreed/SectionFearAndGreed.jsx**
```jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const SectionFearAndGreed = ({ data }) => {
  const { theme } = useTheme();

  return (
    <section className="bg--bg p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold text--t1 mb-4">Fear & Greed</h2>
      <div className="flex justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="w-64 h-64"
        >
          <circle cx="12" cy="12" r="10" className="text--t2" />
          <path
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
            className={`text--t1 ${data.fearAndGreed > 50 ? 'text--red' : data.fearAndGreed < 50 ? 'text--green' : 'text--t2'}`}
          />
        </svg>
      </div>
      <div className="flex justify-center mt-4">
        <p className="text-lg font-bold text--t1">{data.fearAndGreed}%</p>
        <p className="text-sm text--t2">{data.fearAndGreed > 50 ? 'Fear' : data.fearAndGreed < 50 ? 'Greed' : 'Neutral'}</p>
      </div>
    </section>
  );
};

export default SectionFearAndGreed;
```

**src/pages/Dashboard/SectionNewsFeed/SectionNewsFeed.jsx**
```jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const SectionNewsFeed = ({ data }) => {
  const { theme } = useTheme();

  return (
    <section className="bg--bg p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-bold text--t1 mb-4">News Feed</h2>
      {data.news.map((news, index) => (
        <div key={index} className="bg--bg2 p-4 rounded-lg shadow-md m-2">
          <h3 className="text-lg font-bold text--t1">{news.title}</h3>
          <p className="text-sm text--t2">{news.source}</p>
          <p className="text-sm text--t2">{news.time}</p>
        </div>
      ))}
    </section>
  );
};

export default SectionNewsFeed;
```

**src/pages/Dashboard/SectionQuickActions/SectionQuickActions.jsx**
```jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const SectionQuickActions = () => {
  const { theme } = useTheme();

  return (
    <section className="bg--bg p-4 rounded-lg shadow-md">
      <div className="flex flex-wrap justify-center">
        <div className="w-full md:w-1/2 xl:w-1/3 p-4">
          <Link to="/markets" className="bg--green p-4 rounded-lg shadow-md hover:bg--green-dark transition duration-300">
            <i className="lucide-react:chart-line text--t1" />
            <p className="text-sm text--t2">Markets</p>
          </Link>
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4">
          <Link to="/portfolio" className="bg--green p-4 rounded-lg shadow-md hover:bg--green-dark transition duration-300">
            <i className="lucide-react:chart-bar text--t1" />
            <p className="text-sm text--t2">Portfolio</p>
          </Link>
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4">
          <Link to="/signals" className="bg--green p-4 rounded-lg shadow-md hover:bg--green-dark transition duration-300">
            <i className="lucide-react:bell text--t1" />
            <p className="text-sm text--t2">Signals</p>
          </Link>
        </div>
        <div className="w-full md:w-1/2 xl:w-1/3 p-4">
          <Link to="/andy" className="bg--green p-4 rounded-lg shadow-md hover:bg--green-dark transition duration-300">
            <i className="lucide-react:robot text--t1" />
            <p className="text-sm text--t2">AnDy</p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SectionQuickActions;
```

**src/styles/globals.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

header {
  background-color: var(--bg);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

header svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: var(--t1);
}

section {
  background-color: var(--bg2);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

section h2 {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--t1);
}

section p {
  font-size: 1rem;
  color: var(--t2);
}

.card {
  background-color: var(--bg2);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card h3 {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--t1);
}

.card p {
  font-size: 1rem;
  color: var(--t2);
}

.gauge {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
}

.gauge svg {
  width: 50%;
  height: 50%;
  fill: var(--t1);
}

.gauge path {
  stroke: var(--t1);
  stroke-width: 2;
  fill: none;
}

.news-feed {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.news-feed div {
  width: 100%;
  max-width: 300px;
  margin: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.news-feed h3 {
  font-size: 1.25rem;
  font-weight: bold;
  color: var(--t1);
}

.news-feed p {
  font-size: 1rem;
  color: var(--t2);
}

.quick-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.quick-actions div {
  width: 100%;
  max-width: 200px;
  margin: 1rem;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.quick-actions a {
  background-color: var(--green);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: var(--t1);
}

.quick-actions a:hover {
  background-color: var(--green-dark);
}

.quick-actions i {
  font-size: 2rem;
  color: var(--t1);
}

.quick-actions p {
  font-size: 1rem;
  color: var(--t2);
}

.fadeUp {
  animation: fadeUp 0.5s ease-in-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**src/styles/Dashboard.css**
```css
.dashboard {
  max-width: 520px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--bg);
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.dashboard header {
  background-color: var(--bg);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dashboard header h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.dashboard header svg {
  width: 1.5rem;
  height: 1.5rem;
  fill: var(--t1);
}

.dashboard section {
  background-color: var(--bg2);
  padding: 1rem;