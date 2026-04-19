// src/components/NewsSkeleton.jsx
import React from 'react';

const NewsSkeleton = () => {
  return (
    <div className="news-skeleton">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="news-item-skeleton">
          <div className="skeleton-line title" />
          <div className="skeleton-line source" />
          <div className="skeleton-line meta" />
        </div>
      ))}
    </div>
  );
};

export default NewsSkeleton;