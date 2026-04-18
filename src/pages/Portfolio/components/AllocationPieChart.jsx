src/pages/Portfolio/components/AllocationPieChart.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Text } from 'recharts';

const COLORS = [
  '#00ff88', '#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3',
  '#f38181', '#a8e6cf', '#ffd3b6', '#a8c8ec', '#d8a7ca'
];

const AllocationPieChart = ({ data, size = 200 }) => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [touchStart, setTouchStart] = useState(null);
  const chartRef = useRef(null);

  const handleMouseEnter = (index) => setActiveIndex(index);
  const handleMouseLeave = () => setActiveIndex(null);

  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    const dx = e.touches[0].clientX - touchStart.x;
    const dy = e.touches[0].clientY - touchStart.y;
    if (Math.sqrt(dx * dx + dy * dy) > 10) {
      setActiveIndex(null);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => setTouchStart(null);

  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, index
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
    const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

    return (
      <Text
        x={x}
        y={y}
        fill={activeIndex === index ? COLORS[index] : '#f0f0f0'}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={activeIndex === index ? 600 : 400}
      >
        {`${(percent * 100).toFixed(1)}%`}
      </Text>
    );
  };

  const legendItems = data.map((item, index) => ({
    ...item,
    color: COLORS[index % COLORS.length]
  }));

  return (
    <div
      className="allocation-pie-chart"
      style={{
        width: '100%',
        maxWidth: size,
        margin: '0 auto',
        fontFamily: 'Inter, sans-serif'
      }}
      ref={chartRef}
    >
      <div
        style={{
          width: '100%',
          height: size,
          position: 'relative'
        }}
        onMouseEnter={() => setActiveIndex(null)}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={size / 2}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              onMouseEnter={(_, index) => handleMouseEnter(index)}
              onMouseLeave={handleMouseLeave}
              activeIndex={activeIndex}
              activeShape={null}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="none"
                  style={{
                    cursor: 'pointer',
                    transition: 'fill 0.2s ease'
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div
        className="legend"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '12px',
          justifyContent: 'center'
        }}
      >
        {legendItems.map((item, index) => (
          <div
            key={`legend-${index}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor:
                activeIndex === index ? 'rgba(0, 255, 136, 0.15)' : 'transparent',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={() => setActiveIndex(index)}
            onMouseLeave={handleMouseLeave}
            onClick={() => setActiveIndex(activeIndex === index ? null : index)}
          >
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: item.color,
                borderRadius: '2px'
              }}
            />
            <span
              style={{
                fontSize: '12px',
                color: activeIndex === index ? 'var(--green)' : 'var(--t2)',
                fontWeight: activeIndex === index ? 600 : 400
              }}
            >
              {item.name}
            </span>
            <span
              style={{
                fontSize: '12px',
                color: 'var(--t3)'
              }}
            >
              {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllocationPieChart;