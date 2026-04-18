**src/components/PerformanceGraph.js**
```jsx
import React, { useState, useEffect } from 'react';
import { interpolate, easeInOut } from 'lucide-react';
import { motion } from 'react';
import { css } from 'glamor';

const PerformanceGraph = () => {
  const [data, setData] = useState([]);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    const generateData = () => {
      const points = 30;
      const data = [];
      for (let i = 0; i < points; i++) {
        const x = i / points;
        const y = Math.sin(x * Math.PI * 2) + Math.sin(x * Math.PI * 4);
        data.push({ x, y });
      }
      return data;
    };
    const generatedData = generateData();
    setData(generatedData);
  }, []);

  useEffect(() => {
    const graphContainer = document.getElementById('graph-container');
    if (graphContainer) {
      const rect = graphContainer.getBoundingClientRect();
      setWidth(rect.width);
      setHeight(rect.height);
    }
  }, []);

  const gradient = css({
    background: `linear-gradient(to bottom, #00ff88 0%, #00ff88 ${data.length / 30 * 100}%, #00ff88 100%)`,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  });

  const axisX = css({
    position: 'absolute',
    top: height / 2,
    left: 0,
    width: '100%',
    fontSize: '12px',
    color: '#fff',
  });

  const axisY = css({
    position: 'absolute',
    top: 0,
    left: width / 2,
    transform: 'rotate(-90deg)',
    fontSize: '12px',
    color: '#fff',
  });

  const line = css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    stroke: '#fff',
    strokeWidth: '2px',
    strokeLinecap: 'round',
  });

  const points = data.map((point, index) => (
    <motion.circle
      key={index}
      cx={point.x * width}
      cy={height - point.y * height}
      r="4"
      fill="#fff"
      stroke="#fff"
      strokeWidth="2px"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    />
  ));

  return (
    <div id="graph-container" style={{ position: 'relative', width, height }}>
      <svg width={width} height={height}>
        <rect x="0" y="0" width={width} height={height} fill="#080808" />
        <g className={axisX} />
        <g className={axisY} />
        <g className={line}>
          {data.map((point, index) => (
            <motion.line
              key={index}
              x1={point.x * width}
              y1={height - point.y * height}
              x2={(point.x + 0.01) * width}
              y2={height - (point.y + 0.01) * height}
              stroke="#fff"
              strokeWidth="2px"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            />
          ))}
        </g>
        <g className={gradient}>
          {points}
        </g>
      </svg>
    </div>
  );
};

export default PerformanceGraph;
```

**src/pages/Portfolio.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { css } from 'glamor';
import PerformanceGraph from '../components/PerformanceGraph';

const Portfolio = () => {
  const [data, setData] = useState({
    allocation: {
      stocks: 45,
      crypto: 30,
      cash: 15,
      autres: 10,
    },
    holdings: [
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
    ],
    stats: {
      totalValue: 10000,
      bestPerformer: 'Nom 1',
      worstPerformer: 'Nom 2',
      beta: 1.5,
    },
  });

  useEffect(() => {
    // fetch data from API
  }, []);

  const gradient = css({
    background: `linear-gradient(to bottom, #00ff88 0%, #00ff88 45%, #00ff88 45%, #00ff88 55%, #00ff88 55%, #00ff88 100%)`,
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  });

  const pieChart = css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
  });

  const legend = css({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: 1,
  });

  const holdingsList = data.holdings.map((holding, index) => (
    <div key={index} style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px',
      borderBottom: '1px solid #444',
    }}>
      <img src={holding.logo} alt={holding.name} style={{ width: '20px', height: '20px' }} />
      <span style={{ fontSize: '12px', color: '#fff' }}>{holding.name}</span>
      <span style={{ fontSize: '12px', color: '#fff' }}>{holding.quantity}</span>
      <span style={{ fontSize: '12px', color: '#fff' }}>{holding.price}</span>
      <span style={{ fontSize: '12px', color: '#fff' }}>{holding.value}</span>
      <span style={{ fontSize: '12px', color: holding.pl > 0 ? '#00ff88' : '#ff0000' }}>{holding.pl}%</span>
    </div>
  ));

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: '#080808',
    }}>
      <PerformanceGraph />
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'relative',
          width: '80%',
          height: '80%',
          backgroundColor: '#111',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.07)',
        }}>
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            <g className={pieChart}>
              <path d="M 50 0 A 50 50 0 1 1 0 50" fill="#00ff88" />
              <path d="M 50 0 A 50 50 0 1 1 0 50" fill="#ff0000" />
              <path d="M 50 0 A 50 50 0 1 1 0 50" fill="#ffff00" />
              <path d="M 50 0 A 50 50 0 1 1 0 50" fill="#ff00ff" />
            </g>
            <g className={legend}>
              <text x="10" y="10" textAnchor="start" dominantBaseline="hanging" fill="#fff" fontSize="12px">Stocks</text>
              <text x="10" y="30" textAnchor="start" dominantBaseline="hanging" fill="#fff" fontSize="12px">45%</text>
              <text x="10" y="50" textAnchor="start" dominantBaseline="hanging" fill="#fff" fontSize="12px">Crypto</text>
              <text x="10" y="70" textAnchor="start" dominantBaseline="hanging" fill="#fff" fontSize="12px">30%</text>
              <text x="10" y="90" textAnchor="start" dominantBaseline="hanging" fill="#fff" fontSize="12px">Cash</text>
              <text x="10" y="110" textAnchor="start" dominantBaseline="hanging" fill="#fff" fontSize="12px">15%</text>
            </g>
          </svg>
        </div>
        <div style={{
          position: 'relative',
          width: '80%',
          height: '20%',
          backgroundColor: '#111',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <h2 style={{
            fontSize: '24px',
            color: '#fff',
            marginBottom: '10px',
          }}>Holdings</h2>
          <ul style={{
            listStyle: 'none',
            padding: '0',
            margin: '0',
          }}>
            {holdingsList}
          </ul>
        </div>
        <div style={{
          position: 'relative',
          width: '80%',
          height: '20%',
          backgroundColor: '#111',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(255, 255, 255, 0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <h2 style={{
            fontSize: '24px',
            color: '#fff',
            marginBottom: '10px',
          }}>Stats</h2>
          <p style={{
            fontSize: '18px',
            color: '#fff',
          }}>Total Value: {data.stats.totalValue}</p>
          <p style={{
            fontSize: '18px',
            color: '#00ff88',
          }}>Best Performer: {data.stats.bestPerformer}</p>
          <p style={{
            fontSize: '18px',
            color: '#ff0000',
          }}>Worst Performer: {data.stats.worstPerformer}</p>
          <p style={{
            fontSize: '18px',
            color: '#fff',
          }}>Beta: {data.stats.beta}</p>
        </div>
      </div>
    </div>
  );
};

export default Portfolio;