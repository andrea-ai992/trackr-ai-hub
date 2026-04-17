
import React from 'react';
import '../styles/animations.css';

const SkeletonLoader = ({
  variant = 'default',
  width = '100%',
  height = '20px',
  borderRadius = '4px',
  count = 1,
  className = '',
  style = {},
}) => {
  const skeletonStyle = {
    width,
    height,
    borderRadius,
    ...style,
  };

  const renderSkeleton = () => (
    <div
      className={`skeleton-loader ${className}`}
      style={skeletonStyle}
      role="status"
      aria-label="Loading..."
    >
      <div className="skeleton-shimmer" />
    </div>
  );

  if (variant === 'card') {
    return (
      <div className={`skeleton-card ${className}`} role="status" aria-label="Loading card...">
        <div className="skeleton-card-header">
          <div className="skeleton-loader skeleton-avatar">
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-card-header-lines">
            <div className="skeleton-loader skeleton-line skeleton-line-title">
              <div className="skeleton-shimmer" />
            </div>
            <div className="skeleton-loader skeleton-line skeleton-line-subtitle">
              <div className="skeleton-shimmer" />
            </div>
          </div>
        </div>
        <div className="skeleton-card-body">
          <div className="skeleton-loader skeleton-line skeleton-line-full">
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader skeleton-line skeleton-line-three-quarter">
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader skeleton-line skeleton-line-half">
            <div className="skeleton-shimmer" />
          </div>
        </div>
        <div className="skeleton-card-footer">
          <div className="skeleton-loader skeleton-badge">
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader skeleton-badge">
            <div className="skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'chart') {
    return (
      <div className={`skeleton-chart ${className}`} role="status" aria-label="Loading chart...">
        <div className="skeleton-chart-title">
          <div className="skeleton-loader" style={{ width: '40%', height: '24px', borderRadius: '4px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '20%', height: '24px', borderRadius: '4px' }}>
            <div className="skeleton-shimmer" />
          </div>
        </div>
        <div className="skeleton-chart-area">
          <div className="skeleton-chart-bars">
            {[80, 45, 90, 60, 75, 50, 85, 40, 70, 55, 95, 65].map((h, i) => (
              <div
                key={i}
                className="skeleton-loader skeleton-chart-bar"
                style={{ height: `${h}%` }}
              >
                <div className="skeleton-shimmer" />
              </div>
            ))}
          </div>
        </div>
        <div className="skeleton-chart-labels">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((_, i) => (
            <div
              key={i}
              className="skeleton-loader"
              style={{ width: '28px', height: '12px', borderRadius: '2px' }}
            >
              <div className="skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`skeleton-table ${className}`} role="status" aria-label="Loading table...">
        <div className="skeleton-table-header">
          {[20, 30, 25, 25].map((w, i) => (
            <div
              key={i}
              className="skeleton-loader"
              style={{ width: `${w}%`, height: '16px', borderRadius: '4px' }}
            >
              <div className="skeleton-shimmer" />
            </div>
          ))}
        </div>
        {Array.from({ length: count || 5 }).map((_, rowIdx) => (
          <div key={rowIdx} className="skeleton-table-row">
            {[20, 30, 25, 25].map((w, colIdx) => (
              <div
                key={colIdx}
                className="skeleton-loader"
                style={{ width: `${w}%`, height: '14px', borderRadius: '4px' }}
              >
                <div className="skeleton-shimmer" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'news') {
    return (
      <div className={`skeleton-news ${className}`} role="status" aria-label="Loading news...">
        <div className="skeleton-news-image">
          <div className="skeleton-loader" style={{ width: '100%', height: '100%', borderRadius: '8px' }}>
            <div className="skeleton-shimmer" />
          </div>
        </div>
        <div className="skeleton-news-content">
          <div className="skeleton-loader" style={{ width: '80px', height: '12px', borderRadius: '20px', marginBottom: '8px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '100%', height: '20px', borderRadius: '4px', marginBottom: '6px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '85%', height: '20px', borderRadius: '4px', marginBottom: '12px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '100%', height: '14px', borderRadius: '4px', marginBottom: '4px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '90%', height: '14px', borderRadius: '4px', marginBottom: '4px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '70%', height: '14px', borderRadius: '4px' }}>
            <div className="skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sport') {
    return (
      <div className={`skeleton-sport ${className}`} role="status" aria-label="Loading sport data...">
        <div className="skeleton-sport-header">
          <div className="skeleton-loader" style={{ width: '120px', height: '16px', borderRadius: '4px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '60px', height: '16px', borderRadius: '20px' }}>
            <div className="skeleton-shimmer" />
          </div>
        </div>
        <div className="skeleton-sport-teams">
          <div className="skeleton-sport-team">
            <div className="skeleton-loader skeleton-team-logo">
              <div className="skeleton-shimmer" />
            </div>
            <div className="skeleton-loader" style={{ width: '80px', height: '16px', borderRadius: '4px', margin: '0 auto' }}>
              <div className="skeleton-shimmer" />
            </div>
          </div>
          <div className="skeleton-sport-score">
            <div className="skeleton-loader" style={{ width: '80px', height: '40px', borderRadius: '8px' }}>
              <div className="skeleton-shimmer" />
            </div>
          </div>
          <div className="skeleton-sport-team">
            <div className="skeleton-loader skeleton-team-logo">
              <div className="skeleton-shimmer" />
            </div>
            <div className="skeleton-loader" style={{ width: '80px', height: '16px', borderRadius: '4px', margin: '0 auto' }}>
              <div className="skeleton-shimmer" />
            </div>
          </div>
        </div>
        <div className="skeleton-sport-stats">
          {[1, 2, 3].map((i) => (
            <div key={i} className="skeleton-sport-stat-row">
              <div className="skeleton-loader" style={{ width: '30px', height: '12px', borderRadius: '2px' }}>
                <div className="skeleton-shimmer" />
              </div>
              <div className="skeleton-loader" style={{ width: '60%', height: '8px', borderRadius: '4px' }}>
                <div className="skeleton-shimmer" />
              </div>
              <div className="skeleton-loader" style={{ width: '30px', height: '12px', borderRadius: '2px' }}>
                <div className="skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'crypto') {
    return (
      <div className={`skeleton-crypto ${className}`} role="status" aria-label="Loading crypto data...">
        <div className="skeleton-crypto-row">
          <div className="skeleton-loader skeleton-crypto-rank">
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader skeleton-crypto-icon">
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-crypto-info">
            <div className="skeleton-loader" style={{ width: '80px', height: '16px', borderRadius: '4px', marginBottom: '4px' }}>
              <div className="skeleton-shimmer" />
            </div>
            <div className="skeleton-loader" style={{ width: '40px', height: '12px', borderRadius: '4px' }}>
              <div className="skeleton-shimmer" />
            </div>
          </div>
          <div className="skeleton-crypto-price">
            <div className="skeleton-loader" style={{ width: '90px', height: '18px', borderRadius: '4px', marginBottom: '4px', marginLeft: 'auto' }}>
              <div className="skeleton-shimmer" />
            </div>
            <div className="skeleton-loader" style={{ width: '55px', height: '12px', borderRadius: '4px', marginLeft: 'auto' }}>
              <div className="skeleton-shimmer" />
            </div>
          </div>
        </div>
        <div className="skeleton-crypto-mini-chart">
          <div className="skeleton-loader" style={{ width: '100%', height: '40px', borderRadius: '4px' }}>
            <div className="skeleton-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'portfolio') {
    return (
      <div className={`skeleton-portfolio ${className}`} role="status" aria-label="Loading portfolio...">
        <div className="skeleton-portfolio-summary">
          <div className="skeleton-loader" style={{ width: '140px', height: '14px', borderRadius: '4px', margin: '0 auto 8px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '200px', height: '42px', borderRadius: '8px', margin: '0 auto 8px' }}>
            <div className="skeleton-shimmer" />
          </div>
          <div className="skeleton-loader" style={{ width: '100px', height: '16px', borderRadius: '20px', margin: '0 auto' }}>
            <div className="skeleton-shimmer" />
          </div>
        </div>
        <div className="skeleton-portfolio-donut">
          <div className="skeleton-loader skeleton-donut">
            <div className="skeleton-shimmer" />
          </div>
        </div>
        <div className="skeleton-portfolio-list">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton-portfolio-item">
              <div className="skeleton-loader skeleton-portfolio-color-dot">
                <div className="skeleton-shimmer" />
              </div>
              <div className="skeleton-loader" style={{ flex: 1, height: '14px', borderRadius: '4px' }}>
                <div className="skeleton-shimmer" />
              </div>
              <div className="skeleton-loader" style={{ width: '60px', height: '14px', borderRadius: '4px' }}>
                <div className="skeleton-shimmer" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (count > 1) {
    return (
      <div className={`skeleton-group ${className}`} role="status" aria-label="Loading...">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="skeleton-loader"
            style={{
              ...skeletonStyle,
              marginBottom: i < count - 1 ? '8px' : 0,
            }}
          >
            <div className="skeleton-shimmer" />
          </div>
        ))}
      </div>
    );
  }

  return renderSkeleton();
};

export const SkeletonCardGrid = ({ count = 3, className = '' }) => (
  <div className={`skeleton-card-grid ${className}`} role="status" aria-label="Loading cards...">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonLoader key={i} variant="card" />
    ))}
  </div>
);

export const SkeletonPageHeader = ({ className = '' }) => (
  <div className={`skeleton-page-header ${className}`} role="status" aria-label="Loading page header...">
    <div className="skeleton-loader" style={{ width: '60%', height: '36px', borderRadius: '8px', marginBottom: '12px' }}>
      <div className="skeleton-shimmer" />
    </div>
    <div className="skeleton-loader" style={{ width: '80%', height: '16px', borderRadius: '4px', marginBottom: '6px' }}>
      <div className="skeleton-shimmer" />
    </div>
    <div className="skeleton-loader" style={{ width: '50%', height: '16px', borderRadius: '4px' }}>
      <div className="skeleton-shimmer" />
    </div>
  </div>
);

export const SkeletonNavTabs = ({ tabs = 4, className = '' }) => (
  <div className={`skeleton-nav-tabs ${className}`} role="status" aria-label="Loading navigation...">
    {Array.from({ length: tabs }).map((_, i) => (
      <div
        key={i}
        className="skeleton-loader"
        style={{ width: '80px', height: '36px', borderRadius: '8px' }}
      >
        <div className="skeleton-shimmer" />
      </div>
    ))}
  </div>
);

export const SkeletonStatCard = ({ className = '' }) => (
  <div className={`skeleton-stat-card ${className}`} role="status" aria-label="Loading stat...">
    <div className="skeleton-loader" style={{ width: '100px', height: '14px', borderRadius: '4px', marginBottom: '8px' }}>
      <div className="skeleton-shimmer" />
    </div>
    <div className="skeleton-loader" style={{ width: '140px', height: '32px', borderRadius: '6px', marginBottom: '8px' }}>
      <div className="skeleton-shimmer" />
    </div>
    <div className="skeleton-loader" style={{ width: '70px', height: '12px', borderRadius: '20px' }}>
      <div className="skeleton-shimmer" />
    </div>
  </div>
);

export default SkeletonLoader;