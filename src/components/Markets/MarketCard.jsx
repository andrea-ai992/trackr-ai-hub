// src/components/Markets/Sparkline.jsx
import React from 'react';

const Sparkline = ({ data, width = 60, height = 24 }) => {
  if (!data || data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 12H60"
          stroke="var(--text-muted)"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 1);
    const y = height - ((value - min) / range) * (height - 1);
    return `${x},${y}`;
  });

  const pathData = `M${points.join('L')}L${width},${height}L0,${height}Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={pathData}
        fill="url(#sparkGradient)"
        stroke="var(--neon)"
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <defs>
        <linearGradient id="sparkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--neon)" stopOpacity="0.8" />
          <stop offset="100%" stopColor="var(--neon)" stopOpacity="0.2" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default Sparkline;