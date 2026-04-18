src/components/Skeleton/Skeleton.jsx
```jsx
import React from 'react';
import './Skeleton.css';

const Skeleton = ({
  width = '100%',
  height = '1.25rem',
  borderRadius = '0.25rem',
  margin = '0',
  padding = '0',
  className = '',
  animate = true
}) => {
  return (
    <div
      className={`skeleton ${animate ? 'skeleton--pulse' : ''} ${className}`}
      style={{
        width,
        height,
        borderRadius,
        margin,
        padding
      }}
    />
  );
};

export default Skeleton;
```

src/components/Skeleton/Skeleton.css
```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--border) 25%,
    var(--green) 50%,
    var(--border) 75%
  );
  background-size: 200% 100%;
  border-radius: inherit;
  display: inline-block;
  position: relative;
  overflow: hidden;
}

.skeleton--pulse {
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.6;
    background-position: 200% 50%;
  }
  50% {
    opacity: 1;
    background-position: -200% 50%;
  }
}