**src/components/PremiumSkeletonLoader.jsx**
```jsx
import React from 'react';
import { Skeleton } from 'lucide-react';

const SkeletonCard = () => {
  return (
    <div
      style={{
        height: '80px',
        backgroundColor: 'var(--bg2)',
        backgroundSize: '200%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
    </div>
  );
};

const SkeletonStat = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '60px',
        backgroundColor: 'var(--bg2)',
        backgroundSize: '200%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '10px',
        padding: '0 10px',
      }}
    >
      <div
        style={{
          width: '25%',
          height: '100%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
      <div
        style={{
          width: '25%',
          height: '100%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
      <div
        style={{
          width: '25%',
          height: '100%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
      <div
        style={{
          width: '25%',
          height: '100%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
    </div>
  );
};

const SkeletonList = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '120px',
        backgroundColor: 'var(--bg2)',
        backgroundSize: '200%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '10px',
        padding: '0 10px',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
        }}
      />
      <div
        style={{
          height: '20px',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
          padding: '0 10px',
        }}
      />
      <div
        style={{
          height: '20px',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
          padding: '0 10px',
        }}
      />
    </div>
  );
};

const SkeletonChart = () => {
  return (
    <div
      style={{
        height: '200px',
        backgroundColor: 'var(--bg2)',
        backgroundSize: '200%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
    </div>
  );
};

const SkeletonNewsList = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '120px',
        backgroundColor: 'var(--bg2)',
        backgroundSize: '200%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '10px',
        padding: '0 10px',
      }}
    >
      {[1, 2, 3, 4, 5].map((item, index) => (
        <div
          key={index}
          style={{
            width: 'calc(20% - 10px)',
            height: '100%',
            backgroundColor: 'var(--bg3)',
            backgroundSize: '200%',
            animation: 'shimmer 1.5s infinite linear',
            borderRadius: '10px',
            marginRight: '10px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg3)',
              backgroundSize: '200%',
              animation: 'shimmer 1.5s infinite linear',
            }}
          />
          <div
            style={{
              height: '20px',
              backgroundColor: 'var(--bg3)',
              backgroundSize: '200%',
              animation: 'shimmer 1.5s infinite linear',
              borderRadius: '10px',
              padding: '0 10px',
            }}
          />
        </div>
      ))}
    </div>
  );
};

const SkeletonPortfolio = () => {
  return (
    <div
      style={{
        height: '120px',
        backgroundColor: 'var(--bg2)',
        backgroundSize: '200%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          height: '80px',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
      {[1, 2, 3, 4].map((item, index) => (
        <div
          key={index}
          style={{
            width: 'calc(25% - 10px)',
            height: '20px',
            backgroundColor: 'var(--bg3)',
            backgroundSize: '200%',
            animation: 'shimmer 1.5s infinite linear',
            borderRadius: '10px',
            marginRight: '10px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--bg3)',
              backgroundSize: '200%',
              animation: 'shimmer 1.5s infinite linear',
            }}
          />
          <div
            style={{
              height: '20px',
              backgroundColor: 'var(--bg3)',
              backgroundSize: '200%',
              animation: 'shimmer 1.5s infinite linear',
              borderRadius: '10px',
              padding: '0 10px',
            }}
          />
        </div>
      ))}
    </div>
  );
};

export {
  SkeletonCard,
  SkeletonStat,
  SkeletonList,
  SkeletonChart,
  SkeletonNewsList,
  SkeletonPortfolio,
};
```

**src/components/SkeletonCard.jsx**
```jsx
import React from 'react';

const SkeletonCard = () => {
  return (
    <div
      style={{
        height: '80px',
        backgroundColor: 'var(--bg2)',
        backgroundSize: '200%',
        animation: 'shimmer 1.5s infinite linear',
        borderRadius: '10px',
      }}
    >
      <div
        style={{
          height: '100%',
          backgroundColor: 'var(--bg3)',
          backgroundSize: '200%',
          animation: 'shimmer 1.5s infinite linear',
          borderRadius: '10px',
        }}
      />
    </div>
  );
};

export default SkeletonCard;
```

**src/components/SkeletonLoader.jsx**
```jsx
import React from 'react';
import SkeletonCard from './SkeletonCard';

const SkeletonLoader = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
};

export default SkeletonLoader;
```

**src/components/Dashboard.jsx**
```jsx
import React from 'react';
import SkeletonLoader from './SkeletonLoader';

const Dashboard = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <SkeletonLoader />
      <SkeletonChart />
      <SkeletonNewsList />
      <SkeletonPortfolio />
    </div>
  );
};

export default Dashboard;
```

**src/components/News.jsx**
```jsx
import React from 'react';
import SkeletonNewsList from './SkeletonNewsList';

const News = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <SkeletonNewsList />
      <SkeletonNewsList />
      <SkeletonNewsList />
      <SkeletonNewsList />
    </div>
  );
};

export default News;
```

**src/components/Markets.jsx**
```jsx
import React from 'react';
import SkeletonList from './SkeletonList';

const Markets = () => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
      }}
    >
      <SkeletonList />
      <SkeletonList />
      <SkeletonList />
      <SkeletonList />
    </div>
  );
};

export default Markets;
```

**styles.css**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #222;
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

.shimmer {
  animation: shimmer 1.5s infinite linear;
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

Note : J'ai ajouté les styles pour les animations et les couleurs dans le fichier styles.css. J'ai également ajouté les imports nécessaires pour les composants SkeletonCard, SkeletonLoader, SkeletonNewsList, SkeletonPortfolio et SkeletonChart.