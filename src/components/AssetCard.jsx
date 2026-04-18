Création de la page Signals avec les fonctionnalités requises :

```jsx
// src/pages/Signals.jsx

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import './Signals.css';

const assets = [
  { symbol: 'BTC', name: 'Bitcoin', price: 40000 },
  { symbol: 'ETH', name: 'Ethereum', price: 2500 },
  { symbol: 'NVDA', name: 'NVIDIA', price: 500 },
  { symbol: 'SOL', name: 'Solana', price: 50 },
  { symbol: 'AAPL', name: 'Apple', price: 150 },
  { symbol: 'SPY', name: 'SPDR S&P 500', price: 350 },
  { symbol: 'TSLA', name: 'Tesla', price: 600 },
  { symbol: 'LINK', name: 'Chainlink', price: 20 },
];

const calculateRSI = (price, period = 14) => {
  const gains = [];
  const losses = [];

  for (let i = 0; i < period; i++) {
    const currentPrice = price[i];
    const previousPrice = price[i - 1];

    const gain = currentPrice - previousPrice;
    const loss = previousPrice - currentPrice;

    if (gain > 0) {
      gains.push(gain);
      losses.push(0);
    } else if (loss > 0) {
      gains.push(0);
      losses.push(loss);
    } else {
      gains.push(0);
      losses.push(0);
    }
  }

  const averageGain = gains.reduce((a, b) => a + b, 0) / gains.length;
  const averageLoss = losses.reduce((a, b) => a + b, 0) / losses.length;

  const relativeStrength = averageGain / averageLoss;

  return 100 - (100 / (1 + relativeStrength));
};

const calculateMACD = (price, period = 12, signalPeriod = 26) => {
  const ema12 = price.reduce((a, b, i) => {
    if (i < period) {
      return a;
    }

    const previousEma = a;
    const currentPrice = price[i];
    const alpha = 2 / (period + 1);
    const newEma = previousEma * (1 - alpha) + currentPrice * alpha;

    return newEma;
  }, 0);

  const ema26 = price.reduce((a, b, i) => {
    if (i < signalPeriod) {
      return a;
    }

    const previousEma = a;
    const currentPrice = price[i];
    const alpha = 2 / (signalPeriod + 1);
    const newEma = previousEma * (1 - alpha) + currentPrice * alpha;

    return newEma;
  }, 0);

  const macd = ema12 - ema26;
  const signal = macd.reduce((a, b, i) => {
    if (i < signalPeriod) {
      return a;
    }

    const previousSignal = a;
    const currentMacd = macd[i];
    const alpha = 2 / (signalPeriod + 1);
    const newSignal = previousSignal * (1 - alpha) + currentMacd * alpha;

    return newSignal;
  }, 0);

  return macd;
};

const calculateSignal = (price, rsi, macd) => {
  if (rsi < 30) {
    return 'BUY';
  } else if (rsi > 70) {
    return 'SELL';
  } else if (macd > 0) {
    return 'BUY';
  } else if (macd < 0) {
    return 'SELL';
  } else {
    return 'HOLD';
  }
};

const Signals = () => {
  const [assets, setAssets] = useState(assets);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [signal, setSignal] = useState({});

  useEffect(() => {
    const fetchAssets = async () => {
      setLoading(true);
      // Fetch logic here
      // Example: const response = await fetch('/api/assets');
      // const data = await response.json();
      // setAssets(data);
      setLoading(false);
    };

    fetchAssets();
  }, []);

  const filteredAssets = assets.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const calculateSignals = () => {
      const prices = assets.map(asset => asset.price);
      const rsi = calculateRSI(prices);
      const macd = calculateMACD(prices);
      const signals = assets.map((asset, index) => ({
        ...asset,
        rsi: rsi[index],
        macd: macd[index],
        signal: calculateSignal(prices, rsi, macd),
      }));

      setSignal(signals);
    };

    calculateSignals();
  }, [assets]);

  return (
    <div className="signals">
      <header className="signals-header">
        <nav className="signals-tabs">
          <Link to="/signals" className="tab active">
            Tous
          </Link>
          <Link to="/signals/buy" className="tab">
            BUY
          </Link>
          <Link to="/signals/sell" className="tab">
            SELL
          </Link>
          <Link to="/signals/hold" className="tab">
            HOLD
          </Link>
        </nav>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" />
        </div>
        <button className="refresh-button">
          Dernière mise à jour : {new Date().toLocaleTimeString()}
        </button>
      </header>

      {loading ? (
        <div className="skeleton-loader">Loading...</div>
      ) : (
        <div className="assets-list">
          <h2 className="section-title">Signaux</h2>
          {filteredAssets.map((asset, index) => (
            <div key={asset.symbol} className="asset-card">
              <div className="asset-logo">
                {asset.logo ? (
                  <img src={asset.logo} alt={asset.name} />
                ) : (
                  <span className="symbol">{asset.symbol}</span>
                )}
              </div>
              <div className="asset-info">
                <h3 className="asset-name">{asset.name}</h3>
                <p className="asset-price">
                  {asset.price.toLocaleString('en-US', {
                    style: 'decimal',
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="asset-change">
                  {asset.rsi.toFixed(2)}% <span className="arrow">↑</span>
                </p>
                <p className="asset-change">
                  {asset.macd.toFixed(2)} <span className="arrow">↑</span>
                </p>
                <p className="asset-change">
                  {asset.signal} <span className="arrow">↑</span>
                </p>
                <div className="badges">
                  <div
                    className={`badge ${asset.rsi < 30 ? 'red' : 'green'}`}
                  >
                    RSI
                  </div>
                  <div
                    className={`badge ${asset.macd > 0 ? 'green' : 'red'}`}
                  >
                    MACD
                  </div>
                  <div
                    className={`badge ${asset.signal === 'BUY' ? 'green' : 'red'}`}
                  >
                    Signal
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Signals;
```

```css
// src/pages/Signals.css

.signals {
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.signals-header {
  position: sticky;
  top: 0;
  background-color: var(--bg);
  z-index: 10;
}

.signals-tabs {
  display: flex;
  overflow-x: auto;
  padding: 10px;
}

.tab {
  padding: 10px;
  color: var(--t2);
  text-decoration: none;
}

.tab.active {
  color: var(--green);
  border-bottom: 2px solid var(--green);
}

.search-bar {
  display: flex;
  align-items: center;
  background-color: var(--bg2);
  border-radius: 12px;
  padding: 5px;
  margin-top: 10px;
}

.search-bar input {
  background: transparent;
  border: none;
  color: var(--t1);
  outline: none;
  flex: 1;
}

.search-icon {
  color: var(--t2);
}

.refresh-button {
  background-color: var(--bg2);
  border: none;
  padding: 5px 10px;
  font-size: 12px;
  cursor: pointer;
}

.assets-list {
  padding: 10px;
}

.section-title {
  text-transform: uppercase;
  font-size: 10px;
  margin: 20px 0 10px;
}

.asset-card {
  background-color: var(--bg2);
  border-radius: 8px;
  padding: 10px;
  margin-bottom: 10px;
  transition: background-color 0.3s;
}

.asset-card:hover {
  background-color: var(--bg3);
}

.asset-logo {
  display: flex;
  align-items: center;
}

.symbol {
  font-weight: bold;
  color: var(--green);
}

.asset-info {
  margin-left: 10px;
}

.asset-name {
  font-size: 14px;
  margin: 0;
}

.asset-price {
  font-size: 18px;
  margin: 5px 0;
}

.asset-change {
  font-size: 12px;
}

.asset-change.green {
  color: green;
}

.asset-change.red {
  color: red;
}

.arrow {
  margin-left: 5px;
}

.badges {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.badge {
  background-color: var(--bg2);
  border-radius: 4px;
  padding: 2px 5px;
  font-size: 10px;
}

.badge.red {
  background-color: red;
}

.badge.green {
  background-color: green;
}

.skeleton-loader {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.2) 50%, rgba(255, 255, 255, 0.1) 75%);
  height: 100px;
  border-radius: 8px;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
}
```

Cette implémentation utilise les fonctionnalités requises pour afficher les signaux de trading pour chaque actif. Les signaux sont calculés en fonction des indicateurs techniques RSI et MACD, et sont affichés sous forme de badges colorés pour chaque actif. Le code est écrit en utilisant les règles fournies et utilise les variables CSS pour le design.