**src/components/PremiumSkeletonLoader.jsx**
```jsx
import React from 'react';
import { SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio } from './SkeletonLoader';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      <SkeletonCard />
      <SkeletonStat />
      <SkeletonList />
      <SkeletonChart />
      <SkeletonNewsList />
      <SkeletonPortfolio />
    </div>
  );
};

export { SkeletonLoader, SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio };
```

**src/components/SkeletonLoader.jsx**
```jsx
import React from 'react';
import { SkeletonCard } from './SkeletonCard';

const SkeletonStat = () => {
  return (
    <div className="skeleton-stat">
      <div className="stat-col">
        <div className="stat-value" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
      </div>
      <div className="stat-col">
        <div className="stat-value" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
      </div>
      <div className="stat-col">
        <div className="stat-value" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
      </div>
      <div className="stat-col">
        <div className="stat-value" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
      </div>
    </div>
  );
};

const SkeletonList = () => {
  return (
    <div className="skeleton-list">
      <div className="list-item">
        <div className="avatar" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg2)' }} />
        <div className="list-text">
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="list-item">
        <div className="avatar" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg2)' }} />
        <div className="list-text">
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="list-item">
        <div className="avatar" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg2)' }} />
        <div className="list-text">
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="list-item">
        <div className="avatar" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg2)' }} />
        <div className="list-text">
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="list-item">
        <div className="avatar" style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg2)' }} />
        <div className="list-text">
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="list-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
    </div>
  );
};

const SkeletonChart = () => {
  return (
    <div className="skeleton-chart">
      <div className="chart-container" style={{ height: '200px', backgroundColor: 'var(--bg2)' }} />
    </div>
  );
};

const SkeletonNewsList = () => {
  return (
    <div className="skeleton-news-list">
      <div className="news-item">
        <div className="news-thumbnail" style={{ width: '80px', height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="news-text">
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="news-item">
        <div className="news-thumbnail" style={{ width: '80px', height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="news-text">
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="news-item">
        <div className="news-thumbnail" style={{ width: '80px', height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="news-text">
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="news-item">
        <div className="news-thumbnail" style={{ width: '80px', height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="news-text">
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
      <div className="news-item">
        <div className="news-thumbnail" style={{ width: '80px', height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="news-text">
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
          <div className="news-text-line" style={{ height: '20px', backgroundColor: 'var(--bg2)' }} />
        </div>
      </div>
    </div>
  );
};

const SkeletonPortfolio = () => {
  return (
    <div className="skeleton-portfolio">
      <div className="hero" style={{ height: '120px', backgroundColor: 'var(--bg2)' }} />
      <div className="holdings">
        <div className="holding" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="holding" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="holding" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
        <div className="holding" style={{ height: '60px', backgroundColor: 'var(--bg2)' }} />
      </div>
    </div>
  );
};

export { SkeletonLoader, SkeletonCard, SkeletonStat, SkeletonList, SkeletonChart, SkeletonNewsList, SkeletonPortfolio };
```

**src/components/SkeletonCard.jsx**
```jsx
import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="skeleton-card">
      <div className="card-container" style={{ height: '80px', backgroundColor: 'var(--bg2)' }} />
    </div>
  );
};

export default SkeletonCard;
```

**styles/global.css**
```css
.skeleton-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
}

.skeleton-card {
  width: 300px;
  margin-bottom: 20px;
}

.skeleton-stat {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.stat-col {
  width: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-value {
  width: 100%;
  height: 100%;
  background-color: var(--bg2);
  border-radius: 10px;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    background-color: var(--bg2);
  }
  100% {
    background-color: var(--bg3);
  }
}

.skeleton-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.list-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.avatar {
  width: 40px;
  height: 40px;
  background-color: var(--bg2);
  border-radius: 50%;
  animation: shimmer 2s infinite;
}

.list-text {
  margin-left: 20px;
}

.list-text-line {
  width: 100%;
  height: 20px;
  background-color: var(--bg2);
  animation: shimmer 2s infinite;
}

.skeleton-chart {
  width: 100%;
  height: 200px;
  background-color: var(--bg2);
  border-radius: 10px;
  animation: shimmer 2s infinite;
}

.skeleton-news-list {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.news-item {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.news-thumbnail {
  width: 80px;
  height: 60px;
  background-color: var(--bg2);
  border-radius: 10px;
  animation: shimmer 2s infinite;
}

.news-text {
  margin-left: 20px;
}

.news-text-line {
  width: 100%;
  height: 20px;
  background-color: var(--bg2);
  animation: shimmer 2s infinite;
}

.skeleton-portfolio {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background-color: var(--bg);
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
}

.hero {
  width: 100%;
  height: 120px;
  background-color: var(--bg2);
  border-radius: 10px;
  animation: shimmer 2s infinite;
}

.holdings {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 20px;
}

.holding {
  width: 25%;
  height: 60px;
  background-color: var(--bg2);
  border-radius: 10px;
  animation: shimmer 2s infinite;
}
```

**src/components/Dashboard.jsx**
```jsx
import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const Dashboard = () => {
  return (
    <div className="dashboard">
      <SkeletonLoader />
    </div>
  );
};

export default Dashboard;
```

**src/components/News.jsx**
```jsx
import React from 'react';
import SkeletonNewsList from './SkeletonLoader';

const News = () => {
  return (
    <div className="news">
      <SkeletonNewsList />
    </div>
  );
};

export default News;
```

**src/components/Markets.jsx**
```jsx
import React from 'react';
import SkeletonChart from './SkeletonLoader';

const Markets = () => {
  return (
    <div className="markets">
      <SkeletonChart />
    </div>
  );
};

export default Markets;