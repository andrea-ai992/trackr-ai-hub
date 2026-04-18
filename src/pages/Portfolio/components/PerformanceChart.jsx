import { useEffect, useRef, useState } from 'react';

const PerformanceChart = ({ data, period = 'year' }) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, value: 0, date: '' });

  // Calculate dimensions responsively
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const { width, height } = svgRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Format date based on period
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (period === 'year') {
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } else if (period === 'month') {
      return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
    }
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Find max value for scaling
  const maxValue = Math.max(...data.map(item => item.value), 1);
  const minValue = Math.min(...data.map(item => item.value), 0);

  // Calculate path data for the line chart
  const generatePathData = () => {
    if (data.length === 0) return '';

    const width = dimensions.width;
    const height = dimensions.height;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
  };

  // Calculate circle positions for data points
  const getCirclePositions = () => {
    if (data.length === 0) return [];

    const width = dimensions.width;
    const height = dimensions.height;
    const padding = 20;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    return data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / (maxValue - minValue)) * chartHeight;
      return { cx: x, cy: y, value: point.value, date: point.date };
    });
  };

  const circlePositions = getCirclePositions();

  // Handle mouse move for tooltip
  const handleMouseMove = (e) => {
    if (circlePositions.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Find closest point
    let closestDistance = Infinity;
    let closestPoint = null;

    circlePositions.forEach(point => {
      const distance = Math.sqrt((point.cx - mouseX) ** 2 + (point.cy - mouseY) ** 2);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPoint = point;
      }
    });

    // Show tooltip if close enough
    if (closestDistance < 15) {
      setTooltip({
        show: true,
        x: closestPoint.cx,
        y: closestPoint.cy - 30,
        value: closestPoint.value,
        date: closestPoint.date
      });
    } else {
      setTooltip({ ...tooltip, show: false });
    }
  };

  const handleMouseLeave = () => {
    setTooltip({ ...tooltip, show: false });
  };

  // Calculate Y axis ticks
  const getYAxisTicks = () => {
    const ticks = [];
    const tickCount = 5;
    const step = (maxValue - minValue) / (tickCount - 1);

    for (let i = 0; i < tickCount; i++) {
      const value = minValue + i * step;
      ticks.push(value);
    }

    return ticks;
  };

  const yAxisTicks = getYAxisTicks();

  return (
    <div className="performance-chart-container" style={{
      width: '100%',
      height: '300px',
      position: 'relative',
      fontFamily: 'Inter, sans-serif',
      color: 'var(--t1)',
      overflow: 'hidden'
    }}>
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        viewBox={`0 0 ${dimensions.width || 400} ${dimensions.height || 300}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: 'crosshair' }}
      >
        {/* Background */}
        <rect
          x="0"
          y="0"
          width={dimensions.width || 400}
          height={dimensions.height || 300}
          fill="var(--bg)"
          rx="8"
        />

        {/* Grid lines */}
        <g opacity="0.2">
          {yAxisTicks.map((tick, index) => {
            const y = 20 + (dimensions.height - 40) * (1 - (tick - minValue) / (maxValue - minValue));
            return (
              <line
                key={`grid-${index}`}
                x1="20"
                y1={y}
                x2={dimensions.width - 20}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
              />
            );
          })}
        </g>

        {/* Y Axis labels */}
        <g>
          {yAxisTicks.map((tick, index) => {
            const y = 20 + (dimensions.height - 40) * (1 - (tick - minValue) / (maxValue - minValue));
            return (
              <text
                key={`y-label-${index}`}
                x="10"
                y={y + 4}
                fill="var(--t3)"
                fontSize="10"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {tick.toFixed(1)}%
              </text>
            );
          })}
        </g>

        {/* X Axis labels */}
        <g>
          {data.map((point, index) => {
            const x = 20 + (index / (data.length - 1)) * (dimensions.width - 40);
            return (
              <text
                key={`x-label-${index}`}
                x={x}
                y={dimensions.height - 10}
                fill="var(--t3)"
                fontSize="10"
                textAnchor="middle"
                dominantBaseline="hanging"
              >
                {formatDate(point.date)}
              </text>
            );
          })}
        </g>

        {/* Chart line */}
        <path
          d={generatePathData()}
          fill="none"
          stroke="var(--green)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Chart fill */}
        <path
          d={`${generatePathData()} L ${dimensions.width - 20} ${dimensions.height - 20} L 20 ${dimensions.height - 20} Z`}
          fill="url(#fillGradient)"
          opacity="0.3"
        />

        {/* Gradient definition */}
        <defs>
          <linearGradient id="fillGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--green)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="var(--green)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Data points */}
        {circlePositions.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.cx}
            cy={point.cy}
            r="4"
            fill="var(--green)"
            stroke="var(--bg2)"
            strokeWidth="2"
            opacity="0"
            style={{
              transition: 'opacity 0.2s ease, transform 0.2s ease',
              transform: 'scale(0)'
            }}
            className="data-point"
          />
        ))}

        {/* Tooltip */}
        {tooltip.show && (
          <g>
            <line
              x1={tooltip.x}
              y1={tooltip.y - 20}
              x2={tooltip.x}
              y2={dimensions.height - 20}
              stroke="var(--green)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
            <circle
              cx={tooltip.x}
              cy={tooltip.y}
              r="6"
              fill="var(--green)"
            />
            <rect
              x={tooltip.x - 40}
              y={tooltip.y - 35}
              width="80"
              height="24"
              rx="4"
              fill="var(--bg2)"
              stroke="var(--border)"
              strokeWidth="1"
            />
            <text
              x={tooltip.x}
              y={tooltip.y - 22}
              fill="var(--t1)"
              fontSize="12"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {tooltip.value.toFixed(2)}%
            </text>
            <text
              x={tooltip.x}
              y={dimensions.height - 15}
              fill="var(--t3)"
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="hanging"
            >
              {formatDate(tooltip.date)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default PerformanceChart;