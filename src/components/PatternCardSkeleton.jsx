src/components/PatternCardSkeleton.jsx
```jsx
import React from 'react';

const PatternCardSkeleton = () => {
  return (
    <div className="pattern-card-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-icon"></div>
        <div className="skeleton-title"></div>
      </div>
      <div className="skeleton-chart">
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
        <div className="skeleton-line"></div>
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-label"></div>
        <div className="skeleton-value"></div>
      </div>
    </div>
  );
};

export default PatternCardSkeleton;