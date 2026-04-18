**src/components/PremiumSkeletonLoader.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';
import { SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio } from './SkeletonLoader';

const PremiumSkeletonLoader = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonCard />
      <SkeletonStat />
      <SkeletonList />
      <SkeletonChart />
      <SkeletonNewsList />
      <SkeletonPortfolio />
    </div>
  );
};

export default PremiumSkeletonLoader;
```

**src/components/SkeletonLoader.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';
import { SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio } from './SkeletonLoader';

const SkeletonLoader = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonCard />
      <SkeletonStat />
      <SkeletonList />
      <SkeletonChart />
      <SkeletonNewsList />
      <SkeletonPortfolio />
    </div>
  );
};

export default SkeletonLoader;
```

**src/components/SkeletonCard.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';

const SkeletonCard = () => {
  const theme = useTheme();

  return (
    <div className="w-full h-16 bg-transparent rounded-md shadow-md animate-shimmer">
      <div className="h-full bg-gradient-to-r from--bg2 to--bg3 bg-size-200" />
    </div>
  );
};

export { SkeletonCard };
```

**src/components/SkeletonStat.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';

const SkeletonStat = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-2">
      {[1, 2, 3, 4].map((_, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="w-1/2 h-6 bg-transparent rounded-md shadow-md animate-shimmer" />
          <div className="w-1/2 h-6 bg-transparent rounded-md shadow-md animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

export { SkeletonStat };
```

**src/components/SkeletonList.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';

const SkeletonList = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-10 h-10 bg-transparent rounded-full shadow-md animate-shimmer" />
          <div className="w-full h-6 bg-transparent rounded-md shadow-md animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

export { SkeletonList };
```

**src/components/SkeletonChart.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';

const SkeletonChart = () => {
  const theme = useTheme();

  return (
    <div className="h-24 bg-transparent rounded-md shadow-md animate-shimmer">
      <div className="h-full bg-gradient-to-r from--bg2 to--bg3 bg-size-200" />
    </div>
  );
};

export { SkeletonChart };
```

**src/components/SkeletonNewsList.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';

const SkeletonNewsList = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4">
      {[1, 2, 3, 4, 5].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-full h-16 bg-transparent rounded-md shadow-md animate-shimmer" />
          <div className="w-10 h-10 bg-transparent rounded-full shadow-md animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

export { SkeletonNewsList };
```

**src/components/SkeletonPortfolio.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';

const SkeletonPortfolio = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4">
      <div className="h-24 bg-transparent rounded-md shadow-md animate-shimmer" />
      {[1, 2, 3, 4].map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="w-10 h-10 bg-transparent rounded-full shadow-md animate-shimmer" />
          <div className="w-full h-6 bg-transparent rounded-md shadow-md animate-shimmer" />
        </div>
      ))}
    </div>
  );
};

export { SkeletonPortfolio };
```

**src/components/ThemeContext.jsx**
```jsx
import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    colors: {
      primary: '#00ff88',
      secondary: '#111',
      background: '#080808',
      text: '#f0f0f0',
      border: 'rgba(255,255,255,0.07)',
    },
    fonts: {
      family: 'Inter',
      sizes: {
        h1: '2rem',
        h2: '1.5rem',
        h3: '1.2rem',
        body: '1rem',
      },
    },
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--green', theme.colors.primary);
    root.style.setProperty('--bg', theme.colors.background);
    root.style.setProperty('--bg2', theme.colors.secondary);
    root.style.setProperty('--bg3', theme.colors.secondary);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--t1', theme.fonts.sizes.body);
    root.style.setProperty('--t2', theme.fonts.sizes.body);
    root.style.setProperty('--t3', theme.fonts.sizes.body);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
```

**src/components/Dashboard.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';
import SkeletonLoader from './SkeletonLoader';

const Dashboard = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonLoader />
    </div>
  );
};

export default Dashboard;
```

**src/components/News.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';
import SkeletonNewsList from './SkeletonNewsList';

const News = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonNewsList />
    </div>
  );
};

export default News;
```

**src/components/Markets.jsx**
```jsx
import React from 'react';
import { useTheme } from './ThemeContext';
import SkeletonList from './SkeletonList';

const Markets = () => {
  const theme = useTheme();

  return (
    <div className="flex flex-col gap-4 p-4">
      <SkeletonList />
    </div>
  );
};

export default Markets;
```
**src/components/ThemeContext.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #111;
  --border: rgba(255,255,255,0.07);
  --t1: 1rem;
  --t2: 1rem;
  --t3: 1rem;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}
```
**src/components/SkeletonLoader.css**
```css
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.skeleton-loader .skeleton-card {
  width: 100%;
  height: 16rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-stat {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-loader .skeleton-stat .skeleton-stat-item {
  width: 100%;
  height: 6rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-loader .skeleton-list .skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-loader .skeleton-list .skeleton-list-item .skeleton-avatar {
  width: 10rem;
  height: 10rem;
  background-color: transparent;
  border-radius: 50%;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-list .skeleton-list-item .skeleton-list-item-text {
  width: 100%;
  height: 6rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-chart {
  width: 100%;
  height: 24rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-news-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-loader .skeleton-news-list .skeleton-news-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-loader .skeleton-news-list .skeleton-news-list-item .skeleton-news-list-item-thumbnail {
  width: 10rem;
  height: 10rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-news-list .skeleton-news-list-item .skeleton-news-list-item-text {
  width: 100%;
  height: 6rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-portfolio {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-loader .skeleton-portfolio .skeleton-portfolio-item {
  width: 100%;
  height: 24rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-portfolio .skeleton-portfolio-item .skeleton-portfolio-item-thumbnail {
  width: 10rem;
  height: 10rem;
  background-color: transparent;
  border-radius: 50%;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-portfolio .skeleton-portfolio-item .skeleton-portfolio-item-text {
  width: 100%;
  height: 6rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}
```
**src/components/Dashboard.css**
```css
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.dashboard .skeleton-loader {
  flex: 1;
}
```
**src/components/News.css**
```css
.news {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.news .skeleton-news-list {
  flex: 1;
}
```
**src/components/Markets.css**
```css
.markets {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.markets .skeleton-list {
  flex: 1;
}
```
**src/components/ThemeContext.js**
```jsx
import { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState({
    colors: {
      primary: '#00ff88',
      secondary: '#111',
      background: '#080808',
      text: '#f0f0f0',
      border: 'rgba(255,255,255,0.07)',
    },
    fonts: {
      family: 'Inter',
      sizes: {
        h1: '2rem',
        h2: '1.5rem',
        h3: '1.2rem',
        body: '1rem',
      },
    },
  });

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--green', theme.colors.primary);
    root.style.setProperty('--bg', theme.colors.background);
    root.style.setProperty('--bg2', theme.colors.secondary);
    root.style.setProperty('--bg3', theme.colors.secondary);
    root.style.setProperty('--border', theme.colors.border);
    root.style.setProperty('--t1', theme.fonts.sizes.body);
    root.style.setProperty('--t2', theme.fonts.sizes.body);
    root.style.setProperty('--t3', theme.fonts.sizes.body);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };
```
**src/components/ThemeContext.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #111;
  --border: rgba(255,255,255,0.07);
  --t1: 1rem;
  --t2: 1rem;
  --t3: 1rem;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}
```
**src/components/SkeletonLoader.css**
```css
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.skeleton-loader .skeleton-card {
  width: 100%;
  height: 16rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-stat {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-loader .skeleton-stat .skeleton-stat-item {
  width: 100%;
  height: 6rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skeleton-loader .skeleton-list .skeleton-list-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skeleton-loader .skeleton-list .skeleton-list-item .skeleton-avatar {
  width: 10rem;
  height: 10rem;
  background-color: transparent;
  border-radius: 50%;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-list .skeleton-list-item .skeleton-list-item-text {
  width: 100%;
  height: 6rem;
  background-color: transparent;
  border-radius: 1rem;
  box-shadow: 0 0 1rem rgba(0, 0, 0, 0.1);
  animation: shimmer 2s infinite;
}

.skeleton-loader .skeleton-chart {
  width: 100%;
  height: 24rem;
  background-color: transparent;
  border