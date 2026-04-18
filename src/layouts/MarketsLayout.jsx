src/layouts/MarketsLayout.jsx
```jsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const MarketsLayout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 340);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="markets-layout-skeleton">
        <div className="skeleton-header" />
        <div className="skeleton-nav" />
        <div className="skeleton-content">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="markets-layout">
      <Outlet />
    </div>
  );
};

export default MarketsLayout;
```

src/layouts/SportsLayout.jsx
```jsx
import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

const SportsLayout = () => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 340);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (isLoading) {
    return (
      <div className="sports-layout-skeleton">
        <div className="skeleton-header" />
        <div className="skeleton-nav" />
        <div className="skeleton-content">
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
          <div className="skeleton-card" />
        </div>
      </div>
    );
  }

  return (
    <div className="sports-layout">
      <Outlet />
    </div>
  );
};

export default SportsLayout;
```

src/styles/layouts.css
```css
/* Markets & Sports Layouts - Skeleton & Transitions */
.markets-layout,
.sports-layout {
  min-height: 100vh;
  width: 100%;
  transition: opacity 0.34s ease-in-out;
}

.markets-layout {
  background-color: var(--bg);
}

.sports-layout {
  background-color: var(--bg);
}

/* Skeleton Styles */
.markets-layout-skeleton,
.sports-layout-skeleton {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  background-color: var(--bg);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.skeleton-header {
  width: 100%;
  height: 3rem;
  background: linear-gradient(90deg, var(--border), var(--bg2), var(--border));
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.5rem;
}

.skeleton-nav {
  width: 100%;
  height: 2.5rem;
  background: linear-gradient(90deg, var(--border), var(--bg2), var(--border));
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.5rem;
}

.skeleton-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.skeleton-card {
  width: 100%;
  height: 6rem;
  background: linear-gradient(90deg, var(--border), var(--bg2), var(--border));
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.5rem;
}

/* Shimmer Animation */
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}