// src/components/PortfolioPerformance.jsx
import { useState, useEffect, useRef } from 'react';

const PortfolioPerformance = ({ data }) => {
  const [isAnimated, setIsAnimated] = useState(false);
  const svgRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsAnimated(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );
    if (svgRef.current) observer.observe(svgRef.current);
    return () => observer.disconnect();
  }, []);

  if (!data || !data.performance || !data.performance.values || !data.performance.dates) {
    return (
      <div className="performance-chart" style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Données indisponibles
      </div>
    );
  }

  const { values, dates } = data.performance;
  const maxValue = Math.max(...values);
  const minValue = Math.min(...values);
  const range = maxValue - minValue;
  const padding = range * 0.1;
  const yMax = maxValue + padding;
  const yMin = minValue - padding;

  const width = 350;
  const height = 120;
  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = (index) => (index / (values.length - 1)) * innerWidth;
  const yScale = (value) => innerHeight - ((value - yMin) / (yMax - yMin)) * innerHeight;

  const points = values.map((v, i) => `${xScale(i)},${yScale(v)}`).join(' ');
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="performance-chart" style={{ marginBottom: '2rem' }} ref={svgRef}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        stroke="var(--neon)"
        strokeWidth="1.5"
        style={{ display: 'block' }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--neon)" stopOpacity="0.2" />
            <stop offset="100%" stopColor="var(--neon)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Axes */}
        <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="var(--border)" />
        <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="var(--border)" />

        {/* Grid */}
        {[...Array(5)].map((_, i) => (
          <line
            key={`grid-y-${i}`}
            x1={margin.left}
            y1={yScale(yMin + (range * (i / 4)))}
            x2={width - margin.right}
            y2={yScale(yMin + (range * (i / 4)))}
            stroke="var(--border)"
            strokeDasharray="2 2"
          />
        ))}

        {/* Courbe */}
        {isAnimated ? (
          <path
            d={`M ${points} L ${xScale(values.length - 1)},${yScale(values[values.length - 1])}`}
            fill={`url(#${gradientId})`}
            stroke="var(--neon)"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
          />
        ) : (
          <path
            d={`M ${points} L ${xScale(values.length - 1)},${yScale(values[values.length - 1])}`}
            fill={`url(#${gradientId})`}
            stroke="var(--neon)"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ strokeDasharray: '1000', strokeDashoffset: '1000' }}
          />
        )}

        {/* Points */}
        {values.map((v, i) => (
          <circle
            key={`point-${i}`}
            cx={xScale(i)}
            cy={yScale(v)}
            r="3"
            fill="var(--neon)"
            style={{ opacity: isAnimated ? 1 : 0 }}
          />
        ))}

        {/* Labels X (dates) */}
        {dates.map((date, i) => (
          <text
            key={`date-${i}`}
            x={xScale(i)}
            y={height - margin.bottom + 15}
            fill="var(--text-secondary)"
            fontSize="8"
            textAnchor="middle"
            fontFamily="JetBrains Mono, monospace"
          >
            {date}
          </text>
        ))}

        {/* Labels Y (valeurs) */}
        {[...Array(5)].map((_, i) => (
          <text
            key={`value-${i}`}
            x={margin.left - 5}
            y={yScale(yMin + (range * (i / 4)))}
            fill="var(--text-secondary)"
            fontSize="8"
            textAnchor="end"
            fontFamily="JetBrains Mono, monospace"
          >
            {Math.round(yMin + (range * (i / 4))).toLocaleString()}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default PortfolioPerformance;