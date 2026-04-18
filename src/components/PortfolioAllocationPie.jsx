import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from 'recharts';

const PortfolioAllocationPie = ({ data = [], size = '100%', showLabels = true }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const chartRef = useRef(null);

  const COLORS = [
    '#00ff88',
    '#ff4500',
    '#1e90ff',
    '#ffd700',
    '#ff69b4',
    '#7b68ee',
    '#32cd32',
    '#ffa500',
    '#9370db',
    '#00bfff'
  ];

  const pieData = data.map((item, index) => ({
    ...item,
    fill: COLORS[index % COLORS.length],
    value: item.value || 0,
    name: item.name || `Asset ${index + 1}`
  }));

  const totalValue = pieData.reduce((sum, item) => sum + (item.value || 0), 0);

  const handleMouseEnter = (index) => {
    setActiveIndex(index);
  };

  const handleMouseLeave = () => {
    setActiveIndex(0);
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
    name,
    value
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill={activeIndex === index ? COLORS[index % COLORS.length] : 'var(--t2)'}
        textAnchor="middle"
        dominantBaseline="central"
        className="pie-label"
        style={{
          fontSize: '12px',
          fontWeight: 600,
          transition: 'all 0.3s ease'
        }}
      >
        {showLabels && (name)}
      </text>
    );
  };

  const renderLegend = () => {
    return (
      <div className="pie-legend" style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginTop: '20px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {pieData.map((entry, index) => (
          <div
            key={`legend-${index}`}
            className="legend-item"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              opacity: activeIndex === index ? 1 : 0.7
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onMouseLeave={handleMouseLeave}
          >
            <div
              className="legend-color"
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: entry.fill,
                borderRadius: '2px',
                transition: 'all 0.3s ease'
              }}
            />
            <div
              className="legend-text"
              style={{
                color: 'var(--t1)',
                fontSize: '12px',
                fontWeight: activeIndex === index ? 600 : 400
              }}
            >
              {entry.name}
            </div>
            <div
              className="legend-value"
              style={{
                color: 'var(--t2)',
                fontSize: '11px',
                marginLeft: 'auto'
              }}
            >
              {((entry.value / totalValue) * 100).toFixed(1)}%
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      className="portfolio-allocation-pie"
      style={{
        width: size,
        maxWidth: '100%',
        backgroundColor: 'var(--bg2)',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        border: '1px solid var(--border)'
      }}
    >
      <div
        className="pie-container"
        style={{
          position: 'relative',
          width: '100%',
          height: '300px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
        ref={chartRef}
      >
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={90}
              innerRadius={40}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
              stroke="var(--border)"
              strokeWidth={1}
              animationBegin={0}
              animationDuration={1000}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.fill}
                  stroke="var(--border)"
                  strokeWidth={1}
                />
              ))}
              {showLabels && (
                <Label
                  content={renderCustomizedLabel}
                  position="center"
                />
              )}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div
          className="pie-center-text"
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none'
          }}
        >
          <div
            className="center-title"
            style={{
              color: 'var(--t1)',
              fontSize: '14px',
              fontWeight: 500,
              marginBottom: '4px'
            }}
          >
            Portfolio
          </div>
          <div
            className="center-value"
            style={{
              color: 'var(--green)',
              fontSize: '20px',
              fontWeight: 700
            }}
          >
            ${totalValue.toLocaleString()}
          </div>
        </div>
      </div>

      {renderLegend()}
    </div>
  );
};

export default PortfolioAllocationPie;