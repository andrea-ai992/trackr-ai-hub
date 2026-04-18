// src/components/SkeletonPage.jsx
import React from 'react';

const SkeletonPage = () => {
  return (
    <div
      className="skeleton-page"
      style={{
        height: '60vh',
        backgroundColor: 'var(--bg)',
        borderRadius: 'var(--radius, 8px)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <style jsx>{`
        .skeleton-page {
          font-family: 'JetBrains Mono', monospace;
        }
        .shimmer {
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 136, 0.1),
            transparent
          );
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          100% {
            left: 100%;
          }
        }
      `}</style>
      <div className="shimmer" />
    </div>
  );
};

export default SkeletonPage;