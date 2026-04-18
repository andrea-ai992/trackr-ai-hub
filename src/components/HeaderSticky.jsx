Création de src/components/HeaderSticky.jsx :
```jsx
import React from 'react';

const HeaderSticky = () => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  return (
    <header className="sticky top-0 bg-transparent z-10">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-lg font-bold text--t1">Bonjour</h2>
          <span className="text-sm text--t2 ml-2">{formattedTime}</span>
        </div>
        <button
          className="text-lg font-bold text--t1 hover:text--green transition duration-300"
          onClick={() => window.location.reload()}
        >
          Actualiser
        </button>
      </div>
    </header>
  );
};

export default HeaderSticky;
```

Création de src/pages/Dashboard.jsx :
```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import HeaderSticky from '../components/HeaderSticky';
import { supabase } from '../utils/supabase';
import { Skeleton } from 'lucide-react';

const Dashboard = () => {
  const [data, setData] = useState({
    portfolioValue: 0,
    pnl24h: 0,
    movers: [],
    news: [],
    quickActions: [
      { label: 'Markets', icon: '↗' },
      { label: 'Sports', icon: '🏆' },
      { label: 'Flights', icon: '✈' },
      { label: 'AnDy', icon: '◈' },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const { data: portfolioData } = await supabase.from('portfolio').select('value, pnl_24h');
        const { data: moversData } = await supabase
          .from('movers')
          .select('symbol, price, percent_change')
          .order('percent_change', { ascending: false });
        const { data: newsData } = await supabase
          .from('news')
          .select('title, source, timestamp')
          .limit(3);
        setData({
          portfolioValue: portfolioData[0].value,
          pnl24h: portfolioData[0].pnl_24h,
          movers: moversData,
          news: newsData,
          quickActions: [
            { label: 'Markets', icon: '↗' },
            { label: 'Sports', icon: '🏆' },
            { label: 'Flights', icon: '✈' },
            { label: 'AnDy', icon: '◈' },
          ],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="bg--bg h-screen">
      <HeaderSticky />
      <main className="container mx-auto p-4">
        {loading ? (
          <Skeleton className="h-64 w-full bg--bg2" />
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg--bg2 p-4 rounded-lg shadow-md w-full md:w-1/2 lg:w-1/3 xl:w-1/4 mb-4">
              <h2 className="text-lg font-bold text--t1">Portfolio</h2>
              <p className="text-3xl font-bold text--t2">{data.portfolioValue}</p>
              <p className="text-lg font-bold text--t2">
                {data.pnl24h > 0 ? (
                  <span className="text--green">{data.pnl24h}</span>
                ) : (
                  <span className="text--red">{data.pnl24h}</span>
                )}
              </p>
            </div>
            <div className="flex justify-center mb-4">
              <h2 className="text-lg font-bold text--t1">Movers</h2>
              <div className="flex flex-wrap justify-center">
                {data.movers.map((mover, index) => (
                  <div key={index} className="mr-4 mb-4">
                    <h3 className="text-lg font-bold text--t2">{mover.symbol}</h3>
                    <p className="text-lg font-bold text--t2">
                      {mover.price}
                      <span className="text--t3 ml-2">{mover.percent_change}%</span>
                    </p>
                    <div className="w-24 h-4 bg--bg2 rounded-full">
                      <div
                        className={`w-full h-full bg--green rounded-full`}
                        style={{
                          width: `${mover.percent_change}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <h2 className="text-lg font-bold text--t1">Fear & Greed</h2>
              <svg
                className="w-24 h-24 bg--bg2 rounded-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="xMidYMid meet"
              >
                <circle
                  className="bg--bg2"
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="none"
                  strokeWidth="10"
                />
                <path
                  d={`M 50 50 L ${50 + 45 * Math.sin((data.pnl24h / 100) * Math.PI)} ${
                    50 + 45 * Math.cos((data.pnl24h / 100) * Math.PI)
                  }`}
                  stroke="#ff0000"
                  strokeWidth="10"
                  fill="none"
                />
              </svg>
            </div>
            <div className="flex justify-center mb-4">
              <h2 className="text-lg font-bold text--t1">News</h2>
              <div className="flex flex-wrap justify-center">
                {data.news.map((news, index) => (
                  <div key={index} className="mr-4 mb-4">
                    <h3 className="text-lg font-bold text--t2">{news.title}</h3>
                    <p className="text-lg font-bold text--t2">{news.source}</p>
                    <p className="text-lg font-bold text--t2">{news.timestamp}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center mb-4">
              <h2 className="text-lg font-bold text--t1">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-4">
                {data.quickActions.map((action, index) => (
                  <Link
                    key={index}
                    to={action.label === 'Markets' ? '/markets' : action.label === 'Sports' ? '/sports' : action.label === 'Flights' ? '/flights' : '/andy'}
                    className="bg--bg2 p-4 rounded-lg shadow-md text-lg font-bold text--t1 hover:text--green transition duration-300"
                  >
                    <span className="mr-2">{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Dashboard;
```

Création de src/utils/supabase.js :
```jsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

Création de src/components/Skeleton.js :
```jsx
import React from 'react';

const Skeleton = () => {
  return (
    <div className="h-64 w-full bg--bg2 rounded-lg shadow-md animate-pulse" />
  );
};

export default Skeleton;
```

Création de src/components/MiniSparkline.js :
```jsx
import React from 'react';

const MiniSparkline = ({ data }) => {
  return (
    <svg
      className="w-24 h-4 bg--bg2 rounded-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle
        className="bg--bg2"
        cx="50"
        cy="50"
        r="45"
        stroke="none"
        strokeWidth="10"
      />
      <path
        d={`M 50 50 L ${50 + 45 * Math.sin((data / 100) * Math.PI)} ${
          50 + 45 * Math.cos((data / 100) * Math.PI)
        }`}
        stroke="#ff0000"
        strokeWidth="10"
        fill="none"
      />
    </svg>
  );
};

export default MiniSparkline;
```

Création de src/components/FearAndGreedGauge.js :
```jsx
import React from 'react';

const FearAndGreedGauge = ({ data }) => {
  return (
    <svg
      className="w-24 h-24 bg--bg2 rounded-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
    >
      <circle
        className="bg--bg2"
        cx="50"
        cy="50"
        r="45"
        stroke="none"
        strokeWidth="10"
      />
      <path
        d={`M 50 50 L ${50 + 45 * Math.sin((data / 100) * Math.PI)} ${
          50 + 45 * Math.cos((data / 100) * Math.PI)
        }`}
        stroke="#ff0000"
        strokeWidth="10"
        fill="none"
      />
    </svg>
  );
};

export default FearAndGreedGauge;
```

Création de src/components/QuickActionsGrid.js :
```jsx
import React from 'react';

const QuickActionsGrid = ({ data }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {data.map((action, index) => (
        <Link
          key={index}
          to={action.label === 'Markets' ? '/markets' : action.label === 'Sports' ? '/sports' : action.label === 'Flights' ? '/flights' : '/andy'}
          className="bg--bg2 p-4 rounded-lg shadow-md text-lg font-bold text--t1 hover:text--green transition duration-300"
        >
          <span className="mr-2">{action.icon}</span>
          {action.label}
        </Link>
      ))}
    </div>
  );
};

export default QuickActionsGrid;
```

Création de src/pages/Dashboard.css :
```css
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.sticky {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}

.container {
  max-width: 768px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  background-color: var(--bg2);
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.header h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.header span {
  font-size: 1rem;
  color: var(--t2);
}

.portfolio {
  background-color: var(--bg2);
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.portfolio h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.portfolio p {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t2);
}

.movers {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.movers div {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.movers div h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.movers div p {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t2);
}

.movers div svg {
  width: 24px;
  height: 24px;
  fill: var(--t3);
}

.fear-and-greed {
  display: flex;
  justify-content: center;
}

.fear-and-greed svg {
  width: 24px;
  height: 24px;
  fill: var(--t3);
}

.news {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.news div {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.news div h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.news div p {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t2);
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  justify-content: center;
}

.quick-actions a {
  background-color: var(--bg2);
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: var(--t1);
  transition: background-color 0.3s ease;
}

.quick-actions a:hover {
  background-color: var(--green);
  color: var(--t2);
}

.quick-actions a svg {
  width: 24px;
  height: 24px;
  fill: var(--t3);
}
```

Création de src/pages/Dashboard.scss :
```scss
@import 'variables';

body {
  font-family: 'Inter', sans-serif;
  background-color: $bg;
  color: $t1;
}

.sticky {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 10;
}

.container {
  max-width: 768px;
  margin: 0 auto;
  padding: 2rem;
}

.header {
  background-color: $bg2;
  padding: 1rem;
  border-bottom: 1px solid $border;
}

.header h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: $t1;
}

.header span {
  font-size: 1rem;
  color: $t2;
}

.portfolio {
  background-color: $bg2;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.portfolio h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: $t1;
}

.portfolio p {
  font-size: 1.5rem;
  font-weight: bold;
  color: $t2;
}

.movers {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.movers div {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid $border;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.movers div h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: $t1;
}

.movers div p {
  font-size: 1.5rem;
  font-weight: bold;
  color: $t2;
}

.movers div svg {
  width: 24px;
  height: 24px;
  fill: $t3;
}

.fear-and-greed {
  display: flex;
  justify-content: center;
}

.fear-and-greed svg {
  width: 24px;
  height: 24px;
  fill: $t3;
}

.news {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.news div {
  margin: 1rem;
  padding: 1rem;
  border: 1px solid $border;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.news div h3 {
  font-size: 1.5rem;
  font-weight: bold;
  color: $t1;
}

.news div p {
  font-size: 1.5rem;
  font-weight: bold;
  color: $t2;
}

.quick-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  justify-content: center;
}

.quick-actions a {
  background-color: $bg2;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: