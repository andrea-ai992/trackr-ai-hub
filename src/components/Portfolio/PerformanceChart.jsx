import React from 'react';

const PerformanceChart = ({ data, width = 375, height = 120 }) => {
  if (!data || data.length === 0) {
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <rect width="100%" height="100%" fill="var(--surface)" rx="12" />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fill="var(--text-muted)" fontFamily="'JetBrains Mono', monospace" fontSize="12">No data available</text>
      </svg>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 1);
  const minValue = Math.min(...data.map(d => d.value), -1);
  const range = maxValue - minValue;

  const getY = (value) => {
    const normalized = (value - minValue) / range;
    return height - (normalized * height * 0.9);
  };

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width * 0.95) + (width * 0.025);
    const y = getY(d.value);
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M ${points} L ${width},${getY(0)} L 0,${getY(0)} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id="performanceGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--neon)" stopOpacity="0.3" />
          <stop offset="100%" stopColor="var(--neon)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="var(--surface)" rx="12" />
      <path d={pathData} fill="url(#performanceGradient)" stroke="var(--neon)" strokeWidth="1.5" />
      <line x1="0" y1={getY(0)} x2={width} y2={getY(0)} stroke="var(--border)" strokeWidth="1" strokeDasharray="2,2" />
      <text x={width * 0.025} y={getY(maxValue) - 4} textAnchor="start" fill="var(--text-secondary)" fontFamily="'JetBrains Mono', monospace" fontSize="10">{maxValue.toFixed(2)}%</text>
      <text x={width * 0.025} y={getY(minValue) + 14} textAnchor="start" fill="var(--text-secondary)" fontFamily="'JetBrains Mono', monospace" fontSize="10">{minValue.toFixed(2)}%</text>
    </svg>
  );
};

export default PerformanceChart;