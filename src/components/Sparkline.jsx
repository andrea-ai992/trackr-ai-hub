src/components/Sparkline.jsx
```jsx
import { useEffect, useRef, useState } from 'react';

const Sparkline = ({
  data = [],
  width = '100%',
  height = 40,
  lineColor = 'var(--green)',
  fillColor = 'rgba(0, 255, 136, 0.1)',
  pulseColor = 'rgba(255, 0, 0, 0.3)',
  strokeWidth = 2,
  animate = true,
  showPulse = true,
  className = ''
}) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: parseInt(width) || 100,
    height: parseInt(height) || 40
  });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: rect.height
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const max = Math.max(...data, 0);
  const min = Math.min(...data, 0);
  const range = max - min || 1;

  const getY = (value) => {
    const normalized = (value - min) / range;
    return dimensions.height - (normalized * dimensions.height);
  };

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * dimensions.width;
    const y = getY(value);
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className={`sparkline-container ${className}`} style={{ width, height: `${dimensions.height}px` }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
        preserveAspectRatio="none"
        style={{ display: 'block' }}
      >
        {/* Fill area */}
        <polygon
          points={`${points} ${dimensions.width},${dimensions.height} 0,${dimensions.height}`}
          fill={fillColor}
          stroke="none"
        />

        {/* Line path */}
        <polyline
          points={points}
          fill="none"
          stroke={lineColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Pulse animation */}
        {showPulse && animate && (
          <circle
            cx={data.length > 0 ? (data.length - 1) / (data.length - 1) * dimensions.width : 0}
            cy={getY(data[data.length - 1] || 0)}
            r="0"
            fill={pulseColor}
            style={{
              animation: 'pulse 1.5s ease-out infinite',
              animationDelay: '0.5s'
            }}
          >
            <animate
              attributeName="r"
              values="0;8;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.3;0"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
        )}
      </svg>

      <style jsx>{`
        .sparkline-container {
          font-family: 'Inter', sans-serif;
          position: relative;
          overflow: hidden;
        }

        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default Sparkline;