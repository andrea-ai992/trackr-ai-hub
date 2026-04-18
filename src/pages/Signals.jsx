Création de src/pages/Signals.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Inter } from '@fontsource/inter';
import { Lucide } from 'lucide-react';

const assets = [
  { ticker: 'BTC', name: 'Bitcoin', price: 45000 },
  { ticker: 'ETH', name: 'Ethereum', price: 3500 },
  { ticker: 'NVDA', name: 'NVIDIA', price: 250 },
  { ticker: 'SOL', name: 'Solana', price: 20 },
  { ticker: 'AAPL', name: 'Apple', price: 150 },
  { ticker: 'SPY', name: 'SPDR S&P 500', price: 450 },
  { ticker: 'TSLA', name: 'Tesla', price: 1000 },
  { ticker: 'LINK', name: 'Chainlink', price: 20 },
];

const getRSI = (data) => {
  const gains = data.map((item, index) => item.close - item.open);
  const gainsAboveMA = gains.filter((gain, index) => gain > gains[index - 1]);
  const gainsBelowMA = gains.filter((gain, index) => gain < gains[index - 1]);
  const averageGain = gainsAboveMA.reduce((a, b) => a + b, 0) / gainsAboveMA.length;
  const averageLoss = gainsBelowMA.reduce((a, b) => a + b, 0) / gainsBelowMA.length;
  const rs = averageGain / averageLoss;
  const rsi = 100 - (100 / (1 + rs));
  return rsi;
};

const getMACD = (data) => {
  const ema12 = data.slice(-12).reduce((a, b, index) => {
    if (index === 0) return b.close;
    return (0.12 * b.close + 0.88 * a);
  }, 0);
  const ema26 = data.slice(-26).reduce((a, b, index) => {
    if (index === 0) return b.close;
    return (0.26 * b.close + 0.74 * a);
  }, 0);
  const macd = ema12 - ema26;
  return macd;
};

const getSignal = (data) => {
  const rsi = getRSI(data);
  const macd = getMACD(data);
  if (rsi < 30 && macd > 0) return 'BUY';
  if (rsi > 70 && macd < 0) return 'SELL';
  return 'HOLD';
};

const Signals = () => {
  const [data, setData] = useState([]);
  const [lastUpdated, setLastUpdated] = useState('');
  const [filter, setFilter] = useState('Tous');

  useEffect(() => {
    const fetchData = async () => {
      const { data: historicalData } = await supabase
        .from('historical_data')
        .select('close, open')
        .order('id', { ascending: false });
      const processedData = historicalData.map((item, index) => ({
        ...item,
        close: parseFloat(item.close),
        open: parseFloat(item.open),
      }));
      const signals = processedData.map((item, index) => ({
        ...item,
        signal: getSignal(processedData.slice(0, index + 1)),
      }));
      setData(signals);
      setLastUpdated(new Date().toLocaleTimeString());
    };
    fetchData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const fetchData = async () => {
        const { data: historicalData } = await supabase
          .from('historical_data')
          .select('close, open')
          .order('id', { ascending: false });
        const processedData = historicalData.map((item, index) => ({
          ...item,
          close: parseFloat(item.close),
          open: parseFloat(item.open),
        }));
        const signals = processedData.map((item, index) => ({
          ...item,
          signal: getSignal(processedData.slice(0, index + 1)),
        }));
        setData(signals);
        setLastUpdated(new Date().toLocaleTimeString());
      };
      fetchData();
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const filteredData = data.filter((item) => {
    if (filter === 'Tous') return true;
    if (filter === 'BUY' && item.signal === 'BUY') return true;
    if (filter === 'SELL' && item.signal === 'SELL') return true;
    if (filter === 'HOLD' && item.signal === 'HOLD') return true;
    return false;
  });

  return (
    <div className="signals-page">
      <header className="header">
        <nav>
          <ul>
            <li>
              <Link to="#" onClick={() => setFilter('Tous')}>Tous</Link>
            </li>
            <li>
              <Link to="#" onClick={() => setFilter('BUY')}>BUY</Link>
            </li>
            <li>
              <Link to="#" onClick={() => setFilter('SELL')}>SELL</Link>
            </li>
            <li>
              <Link to="#" onClick={() => setFilter('HOLD')}>HOLD</Link>
            </li>
          </ul>
        </nav>
        <button className="refresh-button" onClick={() => window.location.reload()}>
          <Lucide icon="refresh" />
          {lastUpdated}
        </button>
      </header>
      <main className="main">
        {filteredData.map((item, index) => (
          <div key={index} className="asset-card">
            <h2>
              {item.ticker} - {item.name}
            </h2>
            <p>
              Prix simulé : {item.price}
            </p>
            <div className="score-bar">
              <div
                className="score-bar-bullish"
                style={{
                  width: `${item.signal === 'BUY' ? 100 : 0}%`,
                  backgroundColor: item.signal === 'BUY' ? '#00ff88' : '#ff0000',
                }}
              />
              <div
                className="score-bar-bearish"
                style={{
                  width: `${item.signal === 'SELL' ? 100 : 0}%`,
                  backgroundColor: item.signal === 'SELL' ? '#00ff88' : '#ff0000',
                }}
              />
            </div>
            <div className="badges">
              <div className="badge rsi-badge">
                <p>RSI : {getRSI(data.slice(0, index + 1)).toFixed(2)}</p>
                <p
                  style={{
                    color: getRSI(data.slice(0, index + 1)) < 30 ? '#00ff88' : getRSI(data.slice(0, index + 1)) > 70 ? '#ff0000' : '#888',
                  }}
                >
                  {getRSI(data.slice(0, index + 1)) < 30 ? 'Oversold' : getRSI(data.slice(0, index + 1)) > 70 ? 'Overbought' : 'Neutral'}
                </p>
              </div>
              <div className="badge macd-badge">
                <p>MACD : {getMACD(data.slice(0, index + 1)).toFixed(2)}</p>
                <p
                  style={{
                    color: getMACD(data.slice(0, index + 1)) > 0 ? '#00ff88' : getMACD(data.slice(0, index + 1)) < 0 ? '#ff0000' : '#888',
                  }}
                >
                  {getMACD(data.slice(0, index + 1)) > 0 ? 'Bullish' : getMACD(data.slice(0, index + 1)) < 0 ? 'Bearish' : 'Neutral'}
                </p>
              </div>
              <div className="badge volume-badge">
                <p>Volume : {Math.random() * 1000}</p>
                <p
                  style={{
                    color: Math.random() * 1000 > 500 ? '#00ff88' : Math.random() * 1000 < 250 ? '#ff0000' : '#888',
                  }}
                >
                  {Math.random() * 1000 > 500 ? 'High' : Math.random() * 1000 < 250 ? 'Low' : 'Normal'}
                </p>
              </div>
            </div>
            <div className="signal-badge">
              <p>
                Signal : {item.signal}
              </p>
              <p
                style={{
                  color: item.signal === 'BUY' ? '#00ff88' : item.signal === 'SELL' ? '#ff0000' : '#888',
                }}
              >
                <Lucide icon={item.signal === 'BUY' ? 'arrow-up' : item.signal === 'SELL' ? 'arrow-down' : 'arrow-right'} />
              </p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Signals;
```

```css
.signals-page {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.header {
  background-color: var(--bg2);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header nav ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.header nav ul li {
  margin-right: 1rem;
}

.header nav a {
  color: var(--t1);
  text-decoration: none;
}

.header nav a:hover {
  color: var(--green);
}

.refresh-button {
  background-color: var(--bg2);
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.refresh-button:hover {
  background-color: var(--bg3);
}

.main {
  padding: 2rem;
}

.asset-card {
  background-color: var(--bg);
  padding: 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
}

.asset-card h2 {
  font-size: 1.5rem;
  margin-top: 0;
}

.asset-card p {
  font-size: 1rem;
  margin-bottom: 1rem;
}

.score-bar {
  height: 10px;
  background-color: var(--bg);
  border-radius: 0.5rem;
  overflow: hidden;
  margin-bottom: 1rem;
}

.score-bar-bullish {
  height: 100%;
  background-color: var(--green);
}

.score-bar-bearish {
  height: 100%;
  background-color: var(--green);
}

.badges {
  display: flex;
  margin-bottom: 1rem;
}

.badge {
  background-color: var(--bg);
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  margin-right: 1rem;
}

.rsi-badge p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.rsi-badge p:last-child {
  font-size: 0.8rem;
}

.macd-badge p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.macd-badge p:last-child {
  font-size: 0.8rem;
}

.volume-badge p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.volume-badge p:last-child {
  font-size: 0.8rem;
}

.signal-badge {
  background-color: var(--bg);
  padding: 0.5rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.signal-badge p {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.signal-badge p:last-child {
  font-size: 1.5rem;
}