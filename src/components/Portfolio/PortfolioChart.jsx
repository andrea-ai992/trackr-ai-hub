// src/components/Portfolio/PortfolioChart.jsx
import { useMemo } from 'react';

const PortfolioChart = ({ data, width = 375, height = 120 }) => {
  const { pnl, labels, values } = data;

  const { path, gradient } = useMemo(() => {
    const points = values.map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - (v / Math.max(...values)) * height;
      return `${x},${y}`;
    }).join(' ');

    const pathData = `M 0,${height} L ${points} L ${width},${height} Z`;

    const gradientId = `gradient-${Math.random().toString(36).substring(2, 9)}`;

    return {
      path: pathData,
      gradient: (
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
        </linearGradient>
      )
    };
  }, [values, width, height]);

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {gradient}
      <path d={path} fill={`url(#${gradient.id})`} stroke="var(--neon)" strokeWidth="1" />
      {values.map((v, i) => {
        const x = (i / (values.length - 1)) * width;
        const y = height - (v / Math.max(...values)) * height;
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2"
            fill="var(--neon)"
          />
        );
      })}
    </svg>
  );
};

export default PortfolioChart;