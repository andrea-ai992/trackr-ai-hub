**src/components/GraphPerformance.jsx**
```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import { interpolateNumber } from 'polished';

const GraphPerformance = () => {
  const theme = useTheme();
  const data = [
    { date: '2022-01-01', value: 10000 },
    { date: '2022-01-02', value: 10500 },
    { date: '2022-01-03', value: 11000 },
    { date: '2022-01-04', value: 11500 },
    { date: '2022-01-05', value: 12000 },
    { date: '2022-01-06', value: 12500 },
    { date: '2022-01-07', value: 13000 },
    { date: '2022-01-08', value: 13500 },
    { date: '2022-01-09', value: 14000 },
    { date: '2022-01-10', value: 14500 },
    { date: '2022-01-11', value: 15000 },
    { date: '2022-01-12', value: 15500 },
    { date: '2022-01-13', value: 16000 },
    { date: '2022-01-14', value: 16500 },
    { date: '2022-01-15', value: 17000 },
    { date: '2022-01-16', value: 17500 },
    { date: '2022-01-17', value: 18000 },
    { date: '2022-01-18', value: 18500 },
    { date: '2022-01-19', value: 19000 },
    { date: '2022-01-20', value: 19500 },
    { date: '2022-01-21', value: 20000 },
    { date: '2022-01-22', value: 20500 },
    { date: '2022-01-23', value: 21000 },
    { date: '2022-01-24', value: 21500 },
    { date: '2022-01-25', value: 22000 },
    { date: '2022-01-26', value: 22500 },
    { date: '2022-01-27', value: 23000 },
    { date: '2022-01-28', value: 23500 },
    { date: '2022-01-29', value: 24000 },
    { date: '2022-01-30', value: 24500 },
  ];

  const margin = { top: 20, right: 20, bottom: 30, left: 40 };
  const width = 400;
  const height = 300;

  const xScale = (data) => {
    const minDate = data[0].date;
    const maxDate = data[data.length - 1].date;
    return (t) => {
      const date = new Date(t);
      const scaleX = (date.getTime() - minDate.getTime()) / (maxDate.getTime() - minDate.getTime());
      return scaleX * (width - margin.left - margin.right);
    };
  };

  const yScale = (data) => {
    const minY = Math.min(...data.map((d) => d.value));
    const maxY = Math.max(...data.map((d) => d.value));
    return (t) => {
      const scaleY = (t - minY) / (maxY - minY);
      return height - scaleY * (height - margin.top - margin.bottom);
    };
  };

  const drawGraph = (data) => {
    const x = xScale(data);
    const y = yScale(data);

    const path = data
      .map((d, i) => {
        const x0 = x(d.date);
        const y0 = y(d.value);
        const x1 = x(data[i - 1].date);
        const y1 = y(data[i - 1].value);
        return `M ${x0} ${y0} L ${x1} ${y1}`;
      })
      .join(' ');

    return (
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          background: theme.bg,
          color: theme.t1,
        }}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.green} />
            <stop offset="1" stopColor={theme.green} stopOpacity={0} />
          </linearGradient>
        </defs>
        <path
          d={path}
          stroke={theme.green}
          strokeWidth={2}
          fill="url(#gradient)"
          style={{
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
          }}
        />
        <g>
          {data.map((d, i) => (
            <circle
              key={i}
              cx={x(d.date)}
              cy={y(d.value)}
              r={2}
              fill={theme.green}
              opacity={0.5}
            />
          ))}
        </g>
        <g>
          {data.map((d, i) => (
            <text
              key={i}
              x={x(d.date)}
              y={y(d.value)}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={theme.t1}
              fontSize={12}
            >
              {d.value.toLocaleString()}
            </text>
          ))}
        </g>
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2 style={{ color: theme.t1, fontSize: 24, marginBottom: 20 }}>Performance</h2>
      {drawGraph(data)}
    </div>
  );
};

export default GraphPerformance;
```

**src/pages/Portfolio.jsx**
```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import GraphPerformance from '../components/GraphPerformance';

const Portfolio = () => {
  const theme = useTheme();

  const data = [
    { date: '2022-01-01', value: 10000 },
    { date: '2022-01-02', value: 10500 },
    { date: '2022-01-03', value: 11000 },
    { date: '2022-01-04', value: 11500 },
    { date: '2022-01-05', value: 12000 },
    { date: '2022-01-06', value: 12500 },
    { date: '2022-01-07', value: 13000 },
    { date: '2022-01-08', value: 13500 },
    { date: '2022-01-09', value: 14000 },
    { date: '2022-01-10', value: 14500 },
    { date: '2022-01-11', value: 15000 },
    { date: '2022-01-12', value: 15500 },
    { date: '2022-01-13', value: 16000 },
    { date: '2022-01-14', value: 16500 },
    { date: '2022-01-15', value: 17000 },
    { date: '2022-01-16', value: 17500 },
    { date: '2022-01-17', value: 18000 },
    { date: '2022-01-18', value: 18500 },
    { date: '2022-01-19', value: 19000 },
    { date: '2022-01-20', value: 19500 },
    { date: '2022-01-21', value: 20000 },
    { date: '2022-01-22', value: 20500 },
    { date: '2022-01-23', value: 21000 },
    { date: '2022-01-24', value: 21500 },
    { date: '2022-01-25', value: 22000 },
    { date: '2022-01-26', value: 22500 },
    { date: '2022-01-27', value: 23000 },
    { date: '2022-01-28', value: 23500 },
    { date: '2022-01-29', value: 24000 },
    { date: '2022-01-30', value: 24500 },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1 style={{ color: theme.t1, fontSize: 36, marginBottom: 20 }}>Portfolio</h1>
      <GraphPerformance data={data} />
      <h2 style={{ color: theme.t1, fontSize: 24, marginBottom: 20 }}>Allocation</h2>
      <svg
        width={200}
        height={200}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          background: theme.bg,
          color: theme.t1,
        }}
      >
        <circle
          cx={100}
          cy={100}
          r={90}
          fill="url(#gradient)"
          style={{
            stroke: theme.green,
            strokeWidth: 2,
          }}
        />
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={theme.green} />
            <stop offset="1" stopColor={theme.green} stopOpacity={0} />
          </linearGradient>
        </defs>
        <g>
          {[
            { name: 'Stocks', value: 30 },
            { name: 'Crypto', value: 20 },
            { name: 'Cash', value: 20 },
            { name: 'Autres', value: 30 },
          ].map((segment, i) => (
            <g key={i}>
              <circle
                cx={100}
                cy={100}
                r={90}
                fill="none"
                stroke={theme.green}
                strokeWidth={2}
                style={{
                  strokeDasharray: `${segment.value * 10} ${100 - segment.value * 10}`,
                  strokeDashoffset: `${segment.value * 10}`,
                }}
              />
              <text
                x={100}
                y={100}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={theme.t1}
                fontSize={12}
              >
                {segment.name}
              </text>
              <text
                x={100}
                y={120}
                textAnchor="middle"
                dominantBaseline="middle"
                fill={theme.t1}
                fontSize={12}
              >
                {segment.value}%
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default Portfolio;