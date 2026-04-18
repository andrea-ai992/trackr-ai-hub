Création de src/components/PerformanceChart.jsx :

```jsx
import React, { useEffect, useRef } from 'react';
import { useTheme } from 'react-jss';
import { Inter } from '@next/font/google';
import { useState, useMemo } from 'react';
import { useTransition, animated } from 'react-spring';

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter',
});

const PerformanceChart = ({ data }) => {
  const theme = useTheme();
  const chartRef = useRef(null);
  const [points, setPoints] = useState([]);
  const [transition, setTransition] = useTransition(true, {
    from: { opacity: 0, x: 0, y: 0 },
    enter: { opacity: 1, x: 0, y: 0 },
    leave: { opacity: 0, x: 0, y: 0 },
    config: { mass: 1, tension: 170, friction: 26, clamp: true },
  });

  useEffect(() => {
    const points = [];
    for (let i = 0; i < data.length; i++) {
      points.push({
        x: i,
        y: data[i],
      });
    }
    setPoints(points);
  }, [data]);

  const gradient = useMemo(
    () =>
      `linear-gradient(to right, ${theme.colors.green} 0%, ${theme.colors.green} 100%)`,
    [theme.colors.green]
  );

  return (
    <div className={inter.className}>
      <svg
        ref={chartRef}
        width="100%"
        height="100%"
        viewBox="0 0 400 200"
        preserveAspectRatio="xMinYMin meet"
        className={theme.classes.svg}
      >
        <defs>
          <linearGradient id="gradient" x1="0" y1="0" x2="100%" y2="0">
            <stop offset="0%" stopColor={theme.colors.green} />
            <stop offset="100%" stopColor={theme.colors.green} />
          </linearGradient>
        </defs>
        <g>
          {transition((style, item) => (
            <animated.path
              key={item}
              d={`M ${points[0].x} ${points[0].y} ${points
                .slice(1)
                .map((point) => `L ${point.x} ${point.y}`)
                .join(' ')} L ${points[points.length - 1].x} ${points[points.length - 1].y}`}
              stroke={theme.colors.border}
              strokeWidth={2}
              fill="none"
              strokeDasharray="5 5"
              style={style}
            />
          ))}
          <path
            d={`M ${points[0].x} ${points[0].y} ${points
              .slice(1)
              .map((point) => `L ${point.x} ${point.y}`)
              .join(' ')} L ${points[points.length - 1].x} ${points[points.length - 1].y}`}
            stroke={theme.colors.green}
            strokeWidth={2}
            fill="none"
            strokeDasharray="5 5"
          />
          <rect
            x={0}
            y={0}
            width="100%"
            height="100%"
            fill={gradient}
            rx={10}
            ry={10}
          />
          <g>
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r={4}
                fill={theme.colors.bg}
                stroke={theme.colors.border}
                strokeWidth={2}
              />
            ))}
          </g>
          <g>
            {points.map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={point.y + 10}
                textAnchor="middle"
                fontSize={14}
                fill={theme.colors.t1}
                className={theme.classes.text}
              >
                {index === 0 ? '0' : index}
              </text>
            ))}
          </g>
          <g>
            {points.map((point, index) => (
              <text
                key={index}
                x={point.x}
                y={point.y - 10}
                textAnchor="middle"
                fontSize={14}
                fill={theme.colors.t1}
                className={theme.classes.text}
              >
                {data[index]}
              </text>
            ))}
          </g>
          <g>
            {points.map((point, index) => (
              <line
                key={index}
                x1={point.x}
                y1={point.y}
                x2={point.x}
                y2={200}
                stroke={theme.colors.border}
                strokeWidth={2}
              />
            ))}
          </g>
          <g>
            {points.map((point, index) => (
              <line
                key={index}
                x1={0}
                y1={200 - point.y}
                x2={400}
                y2={200 - point.y}
                stroke={theme.colors.border}
                strokeWidth={2}
              />
            ))}
          </g>
        </g>
      </svg>
      <div className={theme.classes.legend}>
        <span className={theme.classes.legendItem}>
          <span className={theme.classes.legendColor} />
          <span className={theme.classes.legendText}>Performance</span>
        </span>
      </div>
    </div>
  );
};

export default PerformanceChart;
```

Création de src/pages/Portfolio.jsx :

```jsx
import React from 'react';
import { useTheme } from 'react-jss';
import { Inter } from '@next/font/google';
import PerformanceChart from '../components/PerformanceChart';
import { useState, useMemo } from 'react';
import { useTransition, animated } from 'react-spring';

const inter = Inter({
  subsets: ['latin'],
  variable: '--inter',
});

const Portfolio = () => {
  const theme = useTheme();
  const [data, setData] = useState([
    100,
    120,
    150,
    180,
    200,
    220,
    250,
    280,
    300,
    320,
    350,
  ]);
  const [allocation, setAllocation] = useState({
    stocks: 45,
    crypto: 30,
    cash: 15,
    autres: 10,
  });
  const [holdings, setHoldings] = useState([
    {
      logo: 'logo1',
      name: 'Nom 1',
      quantity: 10,
      price: 100,
      value: 1000,
      pl: 10,
    },
    {
      logo: 'logo2',
      name: 'Nom 2',
      quantity: 20,
      price: 200,
      value: 4000,
      pl: 20,
    },
    {
      logo: 'logo3',
      name: 'Nom 3',
      quantity: 30,
      price: 300,
      value: 9000,
      pl: 30,
    },
  ]);
  const [stats, setStats] = useState({
    totalValue: 10000,
    bestPerformer: 'Nom 1',
    worstPerformer: 'Nom 2',
    beta: 1.2,
  });

  const gradient = useMemo(
    () =>
      `linear-gradient(to right, ${theme.colors.green} 0%, ${theme.colors.green} 100%)`,
    [theme.colors.green]
  );

  return (
    <div className={inter.className}>
      <PerformanceChart data={data} />
      <div className={theme.classes.section}>
        <h2 className={theme.classes.title}>Allocation</h2>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 200 200"
          preserveAspectRatio="xMinYMin meet"
          className={theme.classes.svg}
        >
          <g>
            {Object.keys(allocation).map((key, index) => (
              <g key={index}>
                <rect
                  x={index * 50}
                  y={0}
                  width={50}
                  height={allocation[key]}
                  fill={key === 'stocks' ? theme.colors.green : theme.colors.bg}
                  rx={10}
                  ry={10}
                />
                <text
                  x={index * 50 + 25}
                  y={allocation[key] + 10}
                  textAnchor="middle"
                  fontSize={14}
                  fill={theme.colors.t1}
                  className={theme.classes.text}
                >
                  {key} ({allocation[key]}%)
                </text>
              </g>
            ))}
          </g>
          <g>
            {Object.keys(allocation).map((key, index) => (
              <text
                key={index}
                x={index * 50 + 25}
                y={200 - 10}
                textAnchor="middle"
                fontSize={14}
                fill={theme.colors.t1}
                className={theme.classes.text}
              >
                {key}
              </text>
            ))}
          </g>
        </svg>
        <div className={theme.classes.legend}>
          <span className={theme.classes.legendItem}>
            <span className={theme.classes.legendColor} style={{ backgroundColor: theme.colors.green }} />
            <span className={theme.classes.legendText}>Stocks</span>
          </span>
          <span className={theme.classes.legendItem}>
            <span className={theme.classes.legendColor} style={{ backgroundColor: theme.colors.bg }} />
            <span className={theme.classes.legendText}>Crypto</span>
          </span>
          <span className={theme.classes.legendItem}>
            <span className={theme.classes.legendColor} style={{ backgroundColor: theme.colors.bg }} />
            <span className={theme.classes.legendText}>Cash</span>
          </span>
          <span className={theme.classes.legendItem}>
            <span className={theme.classes.legendColor} style={{ backgroundColor: theme.colors.bg }} />
            <span className={theme.classes.legendText}>Autres</span>
          </span>
        </div>
      </div>
      <div className={theme.classes.section}>
        <h2 className={theme.classes.title}>Holdings</h2>
        <ul>
          {holdings.map((holding, index) => (
            <li key={index}>
              <img src={holding.logo} alt={holding.name} width={30} height={30} />
              <span className={theme.classes.holdingName}>{holding.name}</span>
              <span className={theme.classes.holdingQuantity}>{holding.quantity}</span>
              <span className={theme.classes.holdingPrice}>{holding.price}</span>
              <span className={theme.classes.holdingValue}>{holding.value}</span>
              <span className={theme.classes.holdingPl}>
                <span
                  style={{
                    backgroundColor: holding.pl > 0 ? theme.colors.green : theme.colors.red,
                    color: theme.colors.t1,
                  }}
                >
                  {holding.pl}%
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className={theme.classes.section}>
        <h2 className={theme.classes.title}>Stats</h2>
        <div className={theme.classes.stats}>
          <span className={theme.classes.statsItem}>
            <span className={theme.classes.statsValue}>{stats.totalValue}</span>
            <span className={theme.classes.statsLabel}>Total Value</span>
          </span>
          <span className={theme.classes.statsItem}>
            <span className={theme.classes.statsValue}>{stats.bestPerformer}</span>
            <span className={theme.classes.statsLabel}>Best Performer</span>
          </span>
          <span className={theme.classes.statsItem}>
            <span className={theme.classes.statsValue}>{stats.worstPerformer}</span>
            <span className={theme.classes.statsLabel}>Worst Performer</span>
          </span>
          <span className={theme.classes.statsItem}>
            <span className={theme.classes.statsValue}>{stats.beta}</span>
            <span className={theme.classes.statsLabel}>Beta</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;
```

Création de src/styles/jss/styles.js :

```javascript
const styles = {
  inter: {
    fontFamily: 'Inter',
    '@apply text-lg': {},
  },
  svg: {
    width: '100%',
    height: '100%',
    viewBox: '0 0 400 200',
    preserveAspectRatio: 'xMinYMin meet',
  },
  section: {
    padding: '20px',
    backgroundColor: '#111',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
  title: {
    fontSize: '18px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  legend: {
    padding: '10px',
    backgroundColor: '#111',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
  legendItem: {
    display: 'inline-block',
    margin: '5px',
  },
  legendColor: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'inline-block',
    marginRight: '10px',
  },
  legendText: {
    fontSize: '14px',
    color: '#fff',
  },
  stats: {
    padding: '20px',
    backgroundColor: '#111',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.2)',
  },
  statsItem: {
    display: 'inline-block',
    margin: '10px',
  },
  statsValue: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#fff',
  },
  statsLabel: {
    fontSize: '14px',
    color: '#fff',
  },
  holdingName: {
    fontSize: '14px',
    color: '#fff',
  },
  holdingQuantity: {
    fontSize: '14px',
    color: '#fff',
  },
  holdingPrice: {
    fontSize: '14px',
    color: '#fff',
  },
  holdingValue: {
    fontSize: '14px',
    color: '#fff',
  },
  holdingPl: {
    fontSize: '14px',
    color: '#fff',
  },
  text: {
    fontSize: '14px',
    color: '#fff',
  },
};

export default styles;
```

Création de src/styles/jss/theme.js :

```javascript
import styles from './styles';

const theme = {
  colors: {
    green: '#00ff88',
    bg: '#111',
    border: 'rgba(255, 255, 255, 0.07)',
  },
  classes: styles,
};

export default theme;