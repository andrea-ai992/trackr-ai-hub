// src/components/SkeletonPage.jsx
import React from 'react';

const SkeletonPage = () => {
  return (
    <div
      style={{
        height: '60vh',
        backgroundColor: 'var(--surface-low)',
        borderRadius: 'var(--radius)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(90deg, transparent, var(--surface-high), transparent)',
          animation: 'shimmer 1.5s infinite',
        }}
      />
    </div>
  );
};

export default SkeletonPage;