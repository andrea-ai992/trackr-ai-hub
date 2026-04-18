// src/components/PortfolioChart.jsx
import React, { useEffect, useRef } from 'react';

const PortfolioChart = ({ data, width = 375, height = 200 }) => {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const animatePath = () => {
      const path = svg.querySelector('path');
      if (path) {
        path.style.strokeDasharray = path.getTotalLength();
        path.style.strokeDashoffset = path.getTotalLength();
        path.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
        path.style.strokeDashoffset = '0';
      }
    };

    animatePath();
  }, [data]);

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const padding = 20;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const scaleX = (index) => padding + (index / (data.length - 1)) * chartWidth;
  const scaleY = (value) => padding + chartHeight - (value / maxValue) * chartHeight;

  const linePath = data.map((point, i) =>
    i === 0 ? `M${scaleX(i)},${scaleY(point.value)}` : `L${scaleX(i)},${scaleY(point.value)}`
  ).join(' ');

  return (
    <div className="portfolio-chart" style={{ width: '100%', height: height }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        stroke="#00ff88"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path d={`${linePath} V${chartHeight + padding} H${padding} Z`} fill="url(#chartGradient)" />
        <path d={linePath} fill="none" />

        {/* Axe X */}
        <line
          x1={padding}
          y1={chartHeight + padding}
          x2={width - padding}
          y2={chartHeight + padding}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Axe Y */}
        <line
          x1={padding}
          y1={padding}
          x2={padding}
          y2={chartHeight + padding}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {/* Graduations X */}
        {data.map((point, i) => (
          <g key={`x-${i}`}>
            <line
              x1={scaleX(i)}
              y1={chartHeight + padding}
              x2={scaleX(i)}
              y2={chartHeight + padding + 4}
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={scaleX(i)}
              y={chartHeight + padding + 16}
              fontFamily="JetBrains Mono, monospace"
              fontSize="10"
              fill="var(--text-secondary)"
              textAnchor="middle"
            >
              {point.date}
            </text>
          </g>
        ))}

        {/* Graduations Y */}
        {Array.from({ length: 5 }).map((_, i) => {
          const value = (maxValue * (1 - i / 4)).toFixed(2);
          return (
            <g key={`y-${i}`}>
              <line
                x1={padding - 4}
                y1={scaleY(maxValue * (1 - i / 4))}
                x2={padding}
                y2={scaleY(maxValue * (1 - i / 4))}
                stroke="var(--border)"
                strokeWidth="1"
              />
              <text
                x={padding - 8}
                y={scaleY(maxValue * (1 - i / 4)) + 4}
                fontFamily="JetBrains Mono, monospace"
                fontSize="10"
                fill="var(--text-secondary)"
                textAnchor="end"
              >
                ${value}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export const PortfolioAllocation = ({ data, size = 150 }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const center = size / 2;
  const radius = size / 2 - 10;

  let cumulativeAngle = 0;
  const segments = data.map((item, index) => {
    const angle = (item.value / total) * 360;
    const largeArcFlag = angle > 180 ? 1 : 0;

    const x1 = center + radius * Math.cos((cumulativeAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((cumulativeAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos(((cumulativeAngle + angle) * Math.PI) / 180);
    const y2 = center + radius * Math.sin(((cumulativeAngle + angle) * Math.PI) / 180);

    cumulativeAngle += angle;

    return {
      path: `M${center},${center} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`,
      color: item.color,
      label: item.label,
      value: item.value,
    };
  });

  return (
    <div className="portfolio-allocation" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ alignSelf: 'center' }}>
        {segments.map((segment, index) => (
          <path key={`segment-${index}`} d={segment.path} fill={segment.color} />
        ))}
      </svg>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {segments.map((segment, index) => (
          <div key={`legend-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 12,
              height: 12,
              backgroundColor: segment.color,
              borderRadius: 2,
            }} />
            <span style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 12,
              color: 'var(--text-primary)',
            }}>
              {segment.label} ({((segment.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};