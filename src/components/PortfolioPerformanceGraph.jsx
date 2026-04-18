import { useState, useEffect, useRef } from 'react';

const PortfolioPerformanceGraph = ({ data = [], height = 200 }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const svgRef = useRef(null);

  // Normalize data to fit the graph
  const minValue = Math.min(...data.map(item => item.value), 0);
  const maxValue = Math.max(...data.map(item => item.value));
  const range = maxValue - minValue;
  const normalizedData = data.map(item => ({
    ...item,
    y: height - ((item.value - minValue) / range) * height
  }));

  // Calculate path points for SVG
  const pathData = normalizedData.map((point, i) =>
    `${i === 0 ? 'M' : 'L'} ${i * (100 / (normalizedData.length - 1))} ${point.y}`
  ).join(' ');

  // Calculate area path for fill effect
  const areaPathData = `M 0 ${height} ${pathData} L ${(normalizedData.length - 1) * (100 / (normalizedData.length - 1))} ${height} Z`;

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Handle mouse movement for tooltip
  const handleMouseMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest data point
    let closestIndex = 0;
    let minDistance = Infinity;

    normalizedData.forEach((point, i) => {
      const distance = Math.abs(x - (i * (100 / (normalizedData.length - 1))));
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    });

    setHoveredIndex(closestIndex);
    setTooltipPos({ x: x + rect.left + 10, y: y + rect.top + 10 });
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="portfolio-performance-graph" style={{
      width: '100%',
      height: `${height}px`,
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
      color: 'var(--t1)',
      overflow: 'hidden'
    }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair' }}
      >
        {/* Grid lines */}
        <defs>
          <linearGradient id="graphGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={`grid-${y}`}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Vertical grid lines */}
        {normalizedData.map((_, i) => (
          <line
            key={`vgrid-${i}`}
            x1={i * (100 / (normalizedData.length - 1))}
            y1="0"
            x2={i * (100 / (normalizedData.length - 1))}
            y2="100"
            stroke="var(--border)"
            strokeWidth="0.5"
            strokeDasharray="2,2"
          />
        ))}

        {/* Area fill */}
        <path
          d={areaPathData}
          fill="url(#graphGradient)"
          opacity="0.6"
        />

        {/* Performance line */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--green)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points */}
        {normalizedData.map((point, i) => (
          <circle
            key={`point-${i}`}
            cx={i * (100 / (normalizedData.length - 1))}
            cy={point.y}
            r={hoveredIndex === i ? 4 : 2}
            fill="var(--green)"
            stroke="var(--bg)"
            strokeWidth="2"
          />
        ))}

        {/* Hover line */}
        {hoveredIndex !== null && (
          <>
            <line
              x1={hoveredIndex * (100 / (normalizedData.length - 1))}
              y1={0}
              x2={hoveredIndex * (100 / (normalizedData.length - 1))}
              y2={height}
              stroke="var(--green)"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
            <line
              x1={0}
              y1={normalizedData[hoveredIndex].y}
              x2={100}
              y2={normalizedData[hoveredIndex].y}
              stroke="var(--green)"
              strokeWidth="1"
              strokeDasharray="4,2"
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredIndex !== null && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            left: `${tooltipPos.x}px`,
            top: `${tooltipPos.y}px`,
            backgroundColor: 'var(--bg2)',
            color: 'var(--t1)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid var(--border)',
            fontSize: '12px',
            pointerEvents: 'none',
            zIndex: 100,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div><strong>{data[hoveredIndex].date}</strong></div>
          <div>{formatCurrency(data[hoveredIndex].value)}</div>
          <div style={{ color: data[hoveredIndex].value >= 0 ? 'var(--green)' : '#ff4444' }}>
            {data[hoveredIndex].value >= 0 ? '+' : ''}{data[hoveredIndex].change}%
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPerformanceGraph;