src/components/SkeletonLoader.jsx
```jsx
import React from 'react';

const SkeletonLoader = ({
  width = '100%',
  height = '1.5rem',
  radius = '0.25rem',
  margin = '0',
  padding = '0',
  className = '',
  shimmer = true,
  lines = 1,
  gap = '0.75rem'
}) => {
  return (
    <div
      className={`skeleton-container ${className}`}
      style={{
        width,
        height: lines > 1 ? `calc(${height} * ${lines} + ${gap} * ${lines - 1})` : height,
        margin,
        padding,
        display: 'flex',
        flexDirection: 'column',
        gap: lines > 1 ? gap : '0'
      }}
    >
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className="skeleton-line"
          style={{
            width: '100%',
            height,
            borderRadius: radius,
            backgroundColor: 'var(--bg2)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {shimmer && (
            <div
              className="skeleton-shimmer"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent, var(--bg3), transparent)',
                transform: 'translateX(-100%)',
                animation: 'shimmer 1.5s infinite'
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
```

src/components/SkeletonLoader.css
```css
.skeleton-container {
  font-family: 'Inter', sans-serif;
  color: var(--t1);
  box-sizing: border-box;
}

.skeleton-line {
  background-color: var(--bg2);
  position: relative;
  overflow: hidden;
}

.skeleton-shimmer {
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}