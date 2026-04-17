Je vais créer le système complet de skeleton loading premium. Voici les fichiers à créer/modifier :

---

**src/styles/skeleton-animations.css**

@import url('https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@300;400;500&display=swap');

:root {
  --skeleton-bg: #1a1a1a;
  --skeleton-shimmer-start: rgba(255, 255, 255, 0.0);
  --skeleton-shimmer-mid: rgba(255, 255, 255, 0.08);
  --skeleton-shimmer-end: rgba(255, 255, 255, 0.0);
  --skeleton-base: #1e1e1e;
  --skeleton-highlight: #2a2a2a;
  --fade-duration: 400ms;
}

@keyframes shimmer {
  0% {
    opacity: 0.4;
    background-position: -200% center;
  }
  50% {
    opacity: 0.9;
    background-position: 0% center;
  }
  100% {
    opacity: 0.4;
    background-position: 200% center;
  }
}

@keyframes shimmerSlide {
  0% {
    transform: translateX(-100%);
    opacity: 0.4;
  }
  50% {
    opacity: 0.9;
  }
  100% {
    transform: translateX(100%);
    opacity: 0.4;
  }
}

@keyframes pulseGlow {
  0%, 100% {
    opacity: 0.4;
    box-shadow: 0 0 0px rgba(99, 102, 241, 0);
  }
  50% {
    opacity: 0.9;
    box-shadow: 0 0 8px rgba(99, 102, 241, 0.15);
  }
}

@keyframes fadeInContent {
  0% {
    opacity: 0;
    transform: translateY(4px);
    filter: blur(2px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

@keyframes skeletonPulse {
  0%, 100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.85;
  }
}

.skeleton-wrapper {
  font-family: 'Roboto Mono', monospace;
  font-size: 13px;
  background: #0f0f0f;
  min-height: 100%;
}

.skeleton-item {
  position: relative;
  overflow: hidden;
  border-radius: 6px;
  background: var(--skeleton-base);
  animation: pulseGlow 1.8s ease-in-out infinite;
}

.skeleton-item::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.06) 30%,
    rgba(255, 255, 255, 0.12) 50%,
    rgba(255, 255, 255, 0.06) 70%,
    transparent 100%
  );
  animation: shimmerSlide 2s ease-in-out infinite;
  border-radius: inherit;
}

.skeleton-market {
  height: 40px;
}

.skeleton-chart {
  height: 60px;
}

.skeleton-list {
  height: 48px;
}

.skeleton-text-sm {
  height: 12px;
  border-radius: 4px;
}

.skeleton-text-md {
  height: 16px;
  border-radius: 4px;
}

.skeleton-text-lg {
  height: 20px;
  border-radius: 4px;
}

.skeleton-circle {
  border-radius: 50%;
  flex-shrink: 0;
}

.skeleton-badge {
  height: 24px;
  border-radius: 12px;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: #0f0f0f;
}

.skeleton-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skeleton-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  flex: 1;
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 8px;
  background: #0f0f0f;
}

.content-enter {
  animation: fadeInContent var(--fade-duration) ease-out forwards;
}

.content-enter-stagger > * {
  animation: fadeInContent var(--fade-duration) ease-out forwards;
  opacity: 0;
}

.content-enter-stagger > *:nth-child(1) { animation-delay: 0ms; }
.content-enter-stagger > *:nth-child(2) { animation-delay: 40ms; }
.content-enter-stagger > *:nth-child(3) { animation-delay: 80ms; }
.content-enter-stagger > *:nth-child(4) { animation-delay: 120ms; }
.content-enter-stagger > *:nth-child(5) { animation-delay: 160ms; }
.content-enter-stagger > *:nth-child(6) { animation-delay: 200ms; }
.content-enter-stagger > *:nth-child(7) { animation-delay: 240ms; }
.content-enter-stagger > *:nth-child(8) { animation-delay: 280ms; }

.backdrop-blur-skeleton {
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

@media (prefers-reduced-motion: reduce) {
  .skeleton-item,
  .skeleton-item::after {
    animation: skeletonPulse 2s ease-in-out infinite;
  }
  
  .content-enter,
  .content-enter-stagger > * {
    animation: none;
    opacity: 1;
  }
}

---

**src/components/PremiumSkeletonLoader.jsx**

import React, { useState, useEffect, useCallback } from 'react';
import '../styles/skeleton-animations.css';

const useResponsiveSkeletonCount = (mobileCount = 3, desktopCount = 8) => {
  const [count, setCount] = useState(() => {
    if (typeof window === 'undefined') return mobileCount;
    return window.innerWidth >= 768 ? desktopCount : mobileCount;
  });

  useEffect(() => {
    const handleResize = () => {
      setCount(window.innerWidth >= 768 ? desktopCount : mobileCount);
    };

    const debouncedResize = debounce(handleResize, 150);
    window.addEventListener('resize', debouncedResize);
    return () => window.removeEventListener('resize', debouncedResize);
  }, [mobileCount, desktopCount]);

  return count;
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

const SkeletonBlock = ({ width = '100%', height = 40, className = '', style = {} }) => (
  <div
    className={`skeleton-item ${className}`}
    style={{
      width,
      height,
      minHeight: height,
      ...style,
    }}
    aria-hidden="true"
  />
);

const MarketSkeletonRow = ({ index }) => (
  <div
    className="skeleton-row"
    style={{
      padding: '8px 16px',
      background: index % 2 === 0 ? '#0f0f0f' : '#111111',
      borderBottom: '1px solid #1a1a1a',
      animationDelay: `${index * 60}ms`,
    }}
  >
    <SkeletonBlock
      width={32}
      height={32}
      className="skeleton-circle"
      style={{ animationDelay: `${index * 60}ms` }}
    />
    <div className="skeleton-col" style={{ gap: '5px' }}>
      <SkeletonBlock
        width="45%"
        height={13}
        className="skeleton-text-sm"
        style={{ animationDelay: `${index * 60 + 100}ms` }}
      />
      <SkeletonBlock
        width="30%"
        height={11}
        className="skeleton-text-sm"
        style={{ animationDelay: `${index * 60 + 150}ms` }}
      />
    </div>
    <div
      className="skeleton-col"
      style={{ gap: '5px', alignItems: 'flex-end', maxWidth: '120px' }}
    >
      <SkeletonBlock
        width="80px"
        height={13}
        className="skeleton-text-sm"
        style={{ animationDelay: `${index * 60 + 200}ms` }}
      />
      <SkeletonBlock
        width="50px"
        height={11}
        className="skeleton-badge"
        style={{
          borderRadius: '4px',
          animationDelay: `${index * 60 + 250}ms`,
        }}
      />
    </div>
  </div>
);

const ChartSkeletonRow = ({ index }) => (
  <div
    style={{
      padding: '12px 16px',
      borderBottom: '1px solid #1a1a1a',
      background: '#0f0f0f',
    }}
  >
    <div className="skeleton-row" style={{ marginBottom: '10px' }}>
      <SkeletonBlock
        width={36}
        height={36}
        className="skeleton-circle"
        style={{ animationDelay: `${index * 80}ms` }}
      />
      <div className="skeleton-col" style={{ gap: '6px' }}>
        <SkeletonBlock
          width="40%"
          height={14}
          style={{ animationDelay: `${index * 80 + 80}ms` }}
        />
        <SkeletonBlock
          width="25%"
          height={11}
          style={{ animationDelay: `${index * 80 + 130}ms` }}
        />
      </div>
      <SkeletonBlock
        width="60px"
        height={20}
        style={{
          borderRadius: '4px',
          animationDelay: `${index * 80 + 180}ms`,
        }}
      />
    </div>
    <SkeletonBlock
      width="100%"
      height={60}
      className="skeleton-chart"
      style={{
        borderRadius: '8px',
        animationDelay: `${index * 80 + 220}ms`,
        background: 'linear-gradient(180deg, #1e1e1e 0%, #181818 100%)',
      }}
    />
  </div>
);

const ListSkeletonRow = ({ index }) => (
  <div
    className="skeleton-row"
    style={{
      padding: '12px 16px',
      height: 48,
      borderBottom: '1px solid #1a1a1a',
      background: '#0f0f0f',
      animationDelay: `${index * 50}ms`,
    }}
  >
    <SkeletonBlock
      width={28}
      height={28}
      className="skeleton-circle"
      style={{ animationDelay: `${index * 50}ms` }}
    />
    <div className="skeleton-col" style={{ gap: '5px', flex: 2 }}>
      <SkeletonBlock
        width={`${50 + (index % 3) * 15}%`}
        height={12}
        style={{ animationDelay: `${index * 50 + 80}ms` }}
      />
      <SkeletonBlock
        width={`${30 + (index % 4) * 10}%`}
        height={10}
        style={{ animationDelay: `${index * 50 + 120}ms` }}
      />
    </div>
    <div
      className="skeleton-col"
      style={{ gap: '5px', alignItems: 'flex-end', minWidth: '80px' }}
    >
      <SkeletonBlock
        width="70px"
        height={12}
        style={{ animationDelay: `${index * 50 + 150}ms` }}
      />
      <SkeletonBlock
        width="45px"
        height={10}
        style={{ animationDelay: `${index * 50 + 190}ms` }}
      />
    </div>
  </div>
);

const SkeletonHeader = ({ variant }) => {
  const headerConfigs = {
    markets: {
      title: { width: '120px', height: 16 },
      subtitle: { width: '80px', height: 11 },
      action: { width: '90px', height: 32, borderRadius: '6px' },
    },
    portfolio: {
      title: { width: '140px', height: 16 },
      subtitle: { width: '100px', height: 11 },
      action: { width: '80px', height: 32, borderRadius: '6px' },
    },
    analytics: {
      title: { width: '130px', height: 16 },
      subtitle: { width: '90px', height: 11 },
      action: { width: '100px', height: 32, borderRadius: '6px' },
    },
  };

  const config = headerConfigs[variant] || headerConfigs.markets;

  return (
    <div className="skeleton-header">
      <div className="skeleton-col" style={{ gap: '6px' }}>
        <SkeletonBlock width={config.title.width} height={config.title.height} />
        <SkeletonBlock width={config.subtitle.width} height={config.subtitle.height} />
      </div>
      <SkeletonBlock
        width={config.action.width}
        height={config.action.height}
        style={{ borderRadius: config.action.borderRadius }}
      />
    </div>
  );
};

const PortfolioSummaryCard = () => (
  <div
    style={{
      margin: '0 16px 16px',
      padding: '20px',
      background: '#141414',
      borderRadius: '12px',
      border: '1px solid #1e1e1e',
    }}
  >
    <div className="skeleton-row" style={{ marginBottom: '16px', justifyContent: 'space-between' }}>
      <div className="skeleton-col" style={{ gap: '8px' }}>
        <SkeletonBlock width="100px" height={11} />
        <SkeletonBlock width="150px" height={28} style={{ borderRadius: '4px' }} />
        <SkeletonBlock width="80px" height={11} />
      </div>
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          border: '6px solid #1e1e1e',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <SkeletonBlock width="100%" height="100%" className="skeleton-circle" />
      </div>
    </div>

    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '12px',
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            padding: '10px',
            background: '#0f0f0f',
            borderRadius: '8px',
          }}
        >
          <SkeletonBlock
            width="60%"
            height={10}
            style={{ marginBottom: '6px' }}
          />
          <SkeletonBlock width="80%" height={14} />
        </div>
      ))}
    </div>
  </div>
);

const AnalyticsSummaryCard = () => (
  <div
    style={{
      margin: '0 16px 16px',
      padding: '16px',
      background: '#141414',
      borderRadius: '12px',
      border: '1px solid #1e1e1e',
    }}
  >
    <SkeletonBlock
      width="100%"
      height={140}
      style={{
        borderRadius: '8px',
        marginBottom: '12px',
        background: 'linear-gradient(180deg, #1a1a1a 0%, #141414 100%)',
      }}
    />
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '10px',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            padding: '10px',
            background: '#0f0f0f',
            borderRadius: '8px',
          }}
        >
          <SkeletonBlock
            width="70%"
            height={10}
            style={{ marginBottom: '6px' }}
          />
          <SkeletonBlock width="55%" height={16} />
        </div>
      ))}
    </div>
  </div>
);

const MarketsSkeleton = ({ count }) => (
  <div className="skeleton-wrapper" style={{ minHeight: '100vh' }}>
    <SkeletonHeader variant="markets" />

    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '8px 16px 12px',
        background: '#0f0f0f',
        overflowX: 'auto',
      }}
    >
      {[1, 2, 3, 4].map((i) => (
        <SkeletonBlock
          key={i}
          width="70px"
          height={28}
          style={{
            borderRadius: '14px',
            flexShrink: 0,
            animationDelay: `${i * 100}ms`,
          }}
        />
      ))}
    </div>

    <div
      style={{
        display: 'flex',
        gap: '8px',
        padding: '0 16px 12px',
        background: '#0f0f0f',
      }}
    >
      <SkeletonBlock width="100%" height={36} style={{ borderRadius: '8px', flex: 1 }} />
      <SkeletonBlock width="40px" height={36} style={{ borderRadius: '8px', flexShrink: 0 }} />
    </div>

    <div style={{ background: '#0f0f0f' }}>
      {Array.