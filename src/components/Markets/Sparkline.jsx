import React from 'react';

const Sparkline = ({
  data = [],
  width = 100,
  height = 40,
  color = 'var(--neon)',
  lineWidth = 2,
  showDot = true,
  dotRadius = 3,
  animate = true,
  duration = 1500
}) => {
  if (!data.length) {
    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width={width} height={height} rx={2} fill="var(--surface-low)" />
      </svg>
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * (width - 1);
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const pathData = `M${points}`;

  const animatedPath = animate
    ? pathData
    : pathData;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ fontFamily: 'JetBrains Mono, monospace' }}
    >
      <rect
        x="0"
        y="0"
        width={width}
        height={height}
        rx={2}
        fill="var(--surface-low)"
        stroke="var(--border)"
        strokeWidth={0.5}
      />

      <path
        d={animatedPath}
        stroke={color}
        strokeWidth={lineWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeDasharray={animate ? '0 1' : undefined}
        style={{
          transition: animate ? `stroke-dasharray ${duration}ms ease-in-out` : undefined,
          animation: animate ? `sparkline-draw ${duration}ms ease-in-out forwards` : undefined
        }}
      />

      {showDot && data.length > 0 && (
        <circle
          cx={(data.length - 1) / (data.length - 1) * (width - 1)}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r={dotRadius}
          fill={color}
        />
      )}

      <style jsx>{`
        @keyframes sparkline-draw {
          0% {
            stroke-dasharray: 0 100;
          }
          100% {
            stroke-dasharray: 100 0;
          }
        }
      `}</style>
    </svg>
  );
};

export default Sparkline;