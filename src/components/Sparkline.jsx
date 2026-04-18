Je vais créer un composant Sparkline SVG dynamique optimisé pour 100+ données, puis l'intégrer dans Markets.jsx. Voici le code complet :

src/components/Sparkline.jsx
```jsx
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const Sparkline = ({
  data = [],
  width = 80,
  height = 30,
  color = 'var(--green)',
  showGradient = true,
  animate = true,
  strokeWidth = 1.5,
  radius = 2
}) => {
  const svgRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: width,
    height: height,
    viewBox: `0 0 ${width} ${height}`
  });

  // Optimisation pour 100+ données
  const simplifiedData = useRef([]);
  const [pathData, setPathData] = useState('');

  useEffect(() => {
    if (data.length === 0) return;

    // Simplification des données pour éviter la surcharge SVG
    const simplified = [];
    const step = Math.max(1, Math.floor(data.length / 20)); // Max 20 points affichés

    for (let i = 0; i < data.length; i += step) {
      simplified.push(data[i]);
    }

    simplifiedData.current = simplified;

    // Génération du chemin SVG
    const path = generateSparklinePath(simplified, dimensions.width, dimensions.height);
    setPathData(path);
  }, [data, dimensions.width, dimensions.height]);

  const generateSparklinePath = (points, width, height) => {
    if (points.length < 2) return '';

    let path = `M 0 ${height - (points[0] / 100) * height}`;

    for (let i = 1; i < points.length; i++) {
      const x = (i / (points.length - 1)) * width;
      const y = height - (points[i] / 100) * height;
      path += ` L ${x} ${y}`;
    }

    return path;
  };

  // Animation
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        width: `${dimensions.width}px`,
        height: `${dimensions.height}px`,
        position: 'relative',
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        viewBox={dimensions.viewBox}
        preserveAspectRatio="none"
        style={{
          overflow: 'visible',
          filter: showGradient ? 'url(#sparkline-gradient)' : 'none'
        }}
      >
        {/* Gradient */}
        {showGradient && (
          <defs>
            <linearGradient id="sparkline-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
        )}

        {/* Chemin principal */}
        <motion.path
          d={pathData}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={animate ? { opacity: 0 } : {}}
          animate={animate ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            strokeDasharray: animate ? 1000 : 0,
            strokeDashoffset: animate ? 1000 : 0
          }}
        />

        {/* Points de données */}
        {simplifiedData.current.map((point, index) => {
          const x = (index / (simplifiedData.current.length - 1)) * dimensions.width;
          const y = dimensions.height - (point / 100) * dimensions.height;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={radius}
              fill={color}
              opacity={isHovered ? 1 : 0}
              transition={{ duration: 0.2 }}
            />
          );
        })}
      </svg>
    </div>
  );
};

export default Sparkline;
```

src/pages/Markets.jsx
```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sparkline from '../components/Sparkline';

const Markets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stocks');
  const [stocksData, setStocksData] = useState([]);
  const [cryptoData, setCryptoData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Données mock pour démonstration
  useEffect(() => {
    // Simulation de données pour 100+ jours
    const generateMockData = (length) => {
      const data = [];
      let lastValue = Math.random() * 50 + 50;
      for (let i = 0; i < length; i++) {
        lastValue += (Math.random() - 0.5) * 2;
        data.push(Math.max(0, lastValue));
      }
      return data;
    };

    // Données pour les marchés
    const mockStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', price: 185.34, change: 2.45, changePercent: 1.34, sparkline: generateMockData(100) },
      { symbol: 'MSFT', name: 'Microsoft Corp.', price: 425.67, change: -1.23, changePercent: -0.29, sparkline: generateMockData(100) },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 175.89, change: 0.89, changePercent: 0.51, sparkline: generateMockData(100) },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 189.23, change: -3.45, changePercent: -1.8, sparkline: generateMockData(100) },
      { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.34, change: 5.67, changePercent: 3.33, sparkline: generateMockData(100) },
    ];

    const mockCrypto = [
      { symbol: 'BTC', name: 'Bitcoin', price: 68543.21, change: 1254.32, changePercent: 1.86, sparkline: generateMockData(100) },
      { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change: -45.23, changePercent: -1.3, sparkline: generateMockData(100) },
      { symbol: 'SOL', name: 'Solana', price: 156.78, change: 8.45, changePercent: 5.67, sparkline: generateMockData(100) },
      { symbol: 'ADA', name: 'Cardano', price: 0.4567, change: -0.0123, changePercent: -2.65, sparkline: generateMockData(100) },
      { symbol: 'XRP', name: 'XRP', price: 0.6543, change: 0.0234, changePercent: 3.68, sparkline: generateMockData(100) },
    ];

    setStocksData(mockStocks);
    setCryptoData(mockCrypto);
    setIsLoading(false);
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatChange = (change) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}`;
  };

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Markets</h1>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'stocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            Stocks
          </button>
          <button
            className={`tab-btn ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            Crypto
          </button>
        </div>
      </header>

      <div className="markets-content">
        {isLoading ? (
          <div className="loading">Loading markets data...</div>
        ) : activeTab === 'stocks' ? (
          <div className="market-table">
            <div className="table-header">
              <div>Symbol</div>
              <div>Name</div>
              <div>Price</div>
              <div>Change</div>
              <div>Sparkline</div>
            </div>

            {stocksData.map((stock, index) => (
              <div
                key={index}
                className="table-row"
                onClick={() => navigate(`/markets/stocks/${stock.symbol.toLowerCase()}`)}
              >
                <div className="cell symbol">{stock.symbol}</div>
                <div className="cell name">{stock.name}</div>
                <div className="cell price">${formatPrice(stock.price)}</div>
                <div className={`cell change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(stock.change)} ({stock.changePercent.toFixed(2)}%)
                </div>
                <div className="cell sparkline">
                  <Sparkline
                    data={stock.sparkline}
                    width={120}
                    height={40}
                    color={stock.change >= 0 ? 'var(--green)' : '#ff4444'}
                    showGradient={true}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="market-table">
            <div className="table-header">
              <div>Symbol</div>
              <div>Name</div>
              <div>Price</div>
              <div>Change</div>
              <div>Sparkline</div>
            </div>

            {cryptoData.map((crypto, index) => (
              <div
                key={index}
                className="table-row"
                onClick={() => navigate(`/markets/crypto/${crypto.symbol.toLowerCase()}`)}
              >
                <div className="cell symbol">{crypto.symbol}</div>
                <div className="cell name">{crypto.name}</div>
                <div className="cell price">${formatPrice(crypto.price)}</div>
                <div className={`cell change ${crypto.change >= 0 ? 'positive' : 'negative'}`}>
                  {formatChange(crypto.change)} ({crypto.changePercent.toFixed(2)}%)
                </div>
                <div className="cell sparkline">
                  <Sparkline
                    data={crypto.sparkline}
                    width={120}
                    height={40}
                    color={crypto.change >= 0 ? 'var(--green)' : '#ff4444'}
                    showGradient={true}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;
```

CSS pour Markets.jsx (à ajouter dans le fichier CSS global ou dans un module CSS dédié)
```css
.markets-content {
  padding: 1rem;
}

.tabs {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.tab-btn {
  padding: 0.5rem 1rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  color: var(--t2);
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: var(--green);
  color: var(--bg);
  border-color: var(--green);
}

.tab-btn:hover:not(.active) {
  background: var(--bg3);
}

.market-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg2);
  border-radius: 0.5rem;
  overflow: hidden;
}

.table-header {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 2fr;
  padding: 0.75rem 1rem;
  background: var(--bg3);
  font-weight: 600;
  color: var(--t2);
  font-size: 0.875rem;
}

.table-row {
  display: grid;
  grid-template-columns: 1fr 2fr 1fr 1fr 2fr;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s ease;
  cursor: pointer;
}

.table-row:hover {
  background: rgba(0, 255, 136, 0.05);
}

.cell {
  display: flex;
  align-items: center;
  font-size: 0.9375rem;
}

.symbol {
  font-weight: 600;
}

.name {
  color: var(--t1);
}

.price {
  font-weight: 500;
}

.change {
  font-weight: 500;
}

.change.positive {
  color: var(--green);
}

.change.negative {
  color: #ff4444;
}

.sparkline {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: var(--t2);
}