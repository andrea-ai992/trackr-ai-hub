SportsLayout.jsx
```jsx
import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

export default function SportsLayout() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 340);
    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="sports-layout">
      {isLoading && (
        <div className="skeleton-shimmer">
          <div className="shimmer-line bg2"></div>
          <div className="shimmer-line bg2"></div>
          <div className="shimmer-line bg2"></div>
          <div className="shimmer-line bg2"></div>
        </div>
      )}
      <Outlet />
    </div>
  );
}