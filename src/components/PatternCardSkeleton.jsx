Je vais implémenter la skeleton card et modifier Markets.jsx pour utiliser `AbortSignal.timeout()`. Voici les fichiers nécessaires :

---

src/components/PatternCardSkeleton.jsx
```jsx
import React from 'react';
import './PatternCardSkeleton.css';

const PatternCardSkeleton = () => {
  return (
    <div className="pattern-card-skeleton">
      <div className="skeleton-header">
        <div className="skeleton-icon"></div>
        <div className="skeleton-title"></div>
      </div>
      <div className="skeleton-price"></div>
      <div className="skeleton-chart-placeholder"></div>
      <div className="skeleton-stats">
        <div className="skeleton-stat"></div>
        <div className="skeleton-stat"></div>
      </div>
    </div>
  );
};

export default PatternCardSkeleton;
```

src/components/PatternCardSkeleton.css
```css
.pattern-card-skeleton {
  width: 100%;
  max-width: 320px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: pulse 1.5s ease-in-out infinite;
}

.skeleton-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.skeleton-icon {
  width: 24px;
  height: 24px;
  background: var(--t3);
  border-radius: 50%;
}

.skeleton-title {
  width: 60%;
  height: 16px;
  background: var(--t3);
  border-radius: 4px;
}

.skeleton-price {
  width: 40%;
  height: 24px;
  background: var(--t3);
  border-radius: 4px;
}

.skeleton-chart-placeholder {
  width: 100%;
  height: 80px;
  background: var(--t3);
  border-radius: 4px;
}

.skeleton-stats {
  display: flex;
  gap: 16px;
}

.skeleton-stat {
  flex: 1;
  height: 12px;
  background: var(--t3);
  border-radius: 4px;
}

@keyframes pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 1;
  }
}
```

---

src/pages/Markets.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Bitcoin, DollarSign, Trophy, Plane } from 'lucide-react';
import PatternCardSkeleton from '../components/PatternCardSkeleton';

const TIMEOUT_MS = 5000; // 5 seconds timeout for fetch requests

const Markets = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('stocks');
  const [stocksData, setStocksData] = useState(null);
  const [cryptoData, setCryptoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (url, setter) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setter(data);
      setError(null);
    } catch (err) {
      if (err.name === 'AbortError') {
        setError('Request timed out. Please try again.');
      } else {
        setError('Failed to fetch data. Please try again later.');
      }
      setter(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    if (activeTab === 'stocks') {
      fetchData('/api/stocks/live', setStocksData);
    } else if (activeTab === 'crypto') {
      fetchData('/api/crypto/live', setCryptoData);
    }
  }, [activeTab]);

  const renderMarketCard = (data, type) => {
    if (isLoading) {
      return <PatternCardSkeleton />;
    }

    if (error) {
      return (
        <div className="error-card">
          <p>{error}</p>
          <button onClick={() => fetchData(type === 'stocks' ? '/api/stocks/live' : '/api/crypto/live', type === 'stocks' ? setStocksData : setCryptoData)}>
            Retry
          </button>
        </div>
      );
    }

    if (!data) return null;

    const Icon = type === 'stocks' ? DollarSign : Bitcoin;
    const trend = data.change > 0 ? <TrendingUp className="text-green" /> : <TrendingDown className="text-red-500" />;

    return (
      <div className="market-card">
        <div className="market-header">
          <div className="flex items-center gap-2">
            <Icon size={20} />
            <h3>{data.symbol}</h3>
          </div>
          <span className="text-lg font-semibold">{data.price.toFixed(2)}</span>
        </div>
        <div className="market-change">
          <span className={data.change > 0 ? 'text-green' : 'text-red-500'}>
            {trend} {Math.abs(data.change).toFixed(2)}%
          </span>
        </div>
        <div className="market-volume">
          <span>Volume: {data.volume.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="tabs-container">
        <button
          className={`tab-button ${activeTab === 'stocks' ? 'active' : ''}`}
          onClick={() => setActiveTab('stocks')}
        >
          <DollarSign size={16} /> Stocks
        </button>
        <button
          className={`tab-button ${activeTab === 'crypto' ? 'active' : ''}`}
          onClick={() => setActiveTab('crypto')}
        >
          <Bitcoin size={16} /> Crypto
        </button>
      </div>

      <div className="market-content">
        {activeTab === 'stocks' && (
          <div className="market-grid">
            {renderMarketCard(stocksData, 'stocks')}
          </div>
        )}
        {activeTab === 'crypto' && (
          <div className="market-grid">
            {renderMarketCard(cryptoData, 'crypto')}
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;
```

---

src/pages/Markets.css (ajouts nécessaires)
```css
.page-container {
  min-height: 100vh;
  background: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  padding: 16px;
}

.tabs-container {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.tab-button {
  padding: 10px 16px;
  background: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.tab-button.active {
  color: var(--green);
  border-bottom: 2px solid var(--green);
}

.tab-button:hover:not(.active) {
  color: var(--t1);
}

.market-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.market-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.market-change {
  font-size: 14px;
}

.market-volume {
  font-size: 12px;
  color: var(--t2);
}

.error-card {
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  color: #ff4444;
}

.error-card button {
  margin-top: 10px;
  padding: 6px 12px;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--t1);
  cursor: pointer;
}

.error-card button:hover {
  background: var(--border);
}