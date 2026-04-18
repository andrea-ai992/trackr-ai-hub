import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const SparklineAnimated = ({
  data = [],
  width = 100,
  height = 30,
  lineColor = 'var(--green)',
  pulseColor = 'rgba(0, 255, 136, 0.3)',
  pulseDuration = 1000,
  showIcon = false,
  iconSize = 12,
  value = null,
  change = null
}) => {
  const [pulseActive, setPulseActive] = useState(false);
  const svgRef = useRef(null);
  const lastValue = data.length > 0 ? data[data.length - 1] : null;

  // Normalize data for SVG path
  const normalizedData = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - (value / Math.max(...data) * height);
    return { x, y };
  });

  // Calculate path for the sparkline
  const pathData = normalizedData.reduce((acc, point, index) => {
    if (index === 0) {
      return `M ${point.x} ${point.y}`;
    }
    return `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Pulse animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseActive(prev => !prev);
    }, pulseDuration);

    return () => clearInterval(interval);
  }, [pulseDuration]);

  // Render pulse overlay
  const renderPulse = () => {
    if (!pulseActive || data.length === 0) return null;

    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const centerY = height / 2;

    return (
      <circle
        cx={width}
        cy={centerY}
        r={Math.max(width, height) * 0.4}
        fill={pulseColor}
        opacity={0.3}
        filter="url(#pulseGlow)"
      />
    );
  };

  // Calculate change direction and color
  const changeDirection = change !== null ? change : (lastValue !== null && data.length > 1 ? lastValue - data[data.length - 2] : 0);
  const isPositive = changeDirection >= 0;
  const changeColor = isPositive ? 'var(--green)' : '#ff4444';
  const changeIcon = isPositive ? <TrendingUp size={iconSize} /> : <TrendingDown size={iconSize} />;

  return (
    <div className="sparkline-container" style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      fontFamily: 'Inter, sans-serif',
      fontSize: '12px'
    }}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{
          display: 'block',
          overflow: 'visible'
        }}
      >
        <defs>
          <filter id="pulseGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Sparkline path */}
        <path
          d={pathData}
          fill="none"
          stroke={lineColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse overlay */}
        {renderPulse()}

        {/* Current value indicator */}
        {lastValue !== null && (
          <circle
            cx={normalizedData[normalizedData.length - 1].x}
            cy={normalizedData[normalizedData.length - 1].y}
            r="2"
            fill={lineColor}
          />
        )}
      </svg>

      {value !== null && (
        <span style={{
          color: isPositive ? 'var(--green)' : '#ff4444',
          fontWeight: 500
        }}>
          {value}
        </span>
      )}

      {change !== null && (
        <span style={{
          color: changeColor,
          display: 'flex',
          alignItems: 'center',
          gap: '2px'
        }}>
          {showIcon && changeIcon}
          <span>
            {Math.abs(change).toFixed(2)}%
          </span>
        </span>
      )}
    </div>
  );
};

export default SparklineAnimated;