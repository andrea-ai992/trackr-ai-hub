Je vais créer les fichiers nécessaires pour le redesign de la page Markets avec les fonctionnalités demandées.

D'abord, voici le fichier `src/pages/Markets/Tabs.js` :

```jsx
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const Tabs = ({ activeTab, onTabChange, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <button
          className={`tab-button ${activeTab === 'stocks' ? 'active' : ''}`}
          onClick={() => onTabChange('stocks')}
        >
          Stocks
        </button>
        <button
          className={`tab-button ${activeTab === 'crypto' ? 'active' : ''}`}
          onClick={() => onTabChange('crypto')}
        >
          Crypto
        </button>
        <div
          className="pill-indicator"
          style={{
            transform: activeTab === 'stocks' ? 'translateX(0)' : 'translateX(100%)'
          }}
        />
      </div>

      <div className="tabs-content">
        {children}
      </div>

      <style jsx>{`
        .tabs-container {
          position: relative;
          width: 100%;
          margin-bottom: 1.5rem;
        }

        .tabs-header {
          position: relative;
          display: flex;
          background: var(--bg2);
          border-radius: 1rem;
          padding: 0.25rem;
          height: 3rem;
          width: 100%;
          overflow: hidden;
        }

        .tab-button {
          flex: 1;
          position: relative;
          z-index: 1;
          background: transparent;
          border: none;
          color: var(--t2);
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          padding: 0.5rem;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
        }

        .tab-button.active {
          color: var(--t1);
        }

        .pill-indicator {
          position: absolute;
          top: 0.25rem;
          left: 0.25rem;
          width: calc(50% - 0.5rem);
          height: calc(100% - 0.5rem);
          background: var(--bg);
          border-radius: 0.75rem;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 0;
        }

        .tabs-content {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default Tabs;
```

Maintenant, voici le fichier complet `src/pages/Markets.jsx` avec toutes les fonctionnalités demandées :

```jsx
import { useState, useEffect, useMemo } from 'react';
import { Search, TrendingUp, TrendingDown } from 'lucide-react';
import Tabs from './Markets/Tabs';

const Markets = () => {
  const [activeTab, setActiveTab] = useState('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('default');
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stocks data
  const stockSymbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM',
    'V', 'WMT', 'DIS', 'BAC', 'C', 'PFE', 'XOM', 'KO', 'PEP', 'INTC'
  ];

  // Crypto data
  const cryptoSymbols = ['bitcoin', 'ethereum', 'solana', 'binancecoin', 'avalanche-2', 'chainlink'];

  // Fetch stocks data
  useEffect(() => {
    const fetchStocks = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/yahoo-finance');
        if (!response.ok) throw new Error('Failed to fetch stocks');

        const data = await response.json();
        const formattedStocks = stockSymbols.map(symbol => {
          const stockData = data[symbol];
          if (!stockData) return null;

          return {
            symbol,
            name: stockData.longName || symbol,
            price: stockData.regularMarketPrice,
            change: stockData.regularMarketChange,
            changePercent: stockData.regularMarketChangePercent,
            logo: `https://logo.clearbit.com/${symbol.toLowerCase()}.com`
          };
        }).filter(Boolean);

        setStocks(formattedStocks);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'stocks') {
      fetchStocks();
    }
  }, [activeTab]);

  // Fetch crypto data
  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        setLoading(true);
        const ids = cryptoSymbols.join(',');
        const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=100&page=1&sparkline=true&price_change_percentage=24h`);

        if (!response.ok) throw new Error('Failed to fetch crypto');

        const data = await response.json();
        const formattedCrypto = data.map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          price: coin.current_price,
          change: coin.price_change_24h,
          changePercent: coin.price_change_percentage_24h,
          marketCap: coin.market_cap,
          volume24h: coin.total_volume,
          logo: coin.image,
          sparkline: coin.sparkline_in_7d.price
        }));

        setCrypto(formattedCrypto);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'crypto') {
      fetchCrypto();
    }
  }, [activeTab]);

  // Filter and sort stocks
  const filteredStocks = useMemo(() => {
    let result = [...stocks];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(stock =>
        stock.name.toLowerCase().includes(term) ||
        stock.symbol.toLowerCase().includes(term)
      );
    }

    switch (sortOrder) {
      case 'gainers':
        return result.sort((a, b) => b.changePercent - a.changePercent);
      case 'losers':
        return result.sort((a, b) => a.changePercent - b.changePercent);
      default:
        return result;
    }
  }, [stocks, searchTerm, sortOrder]);

  // Filter and sort crypto
  const filteredCrypto = useMemo(() => {
    let result = [...crypto];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(coin =>
        coin.name.toLowerCase().includes(term) ||
        coin.symbol.toLowerCase().includes(term)
      );
    }

    switch (sortOrder) {
      case 'gainers':
        return result.sort((a, b) => b.changePercent - a.changePercent);
      case 'losers':
        return result.sort((a, b) => a.changePercent - b.changePercent);
      default:
        return result;
    }
  }, [crypto, searchTerm, sortOrder]);

  // Generate sparkline SVG
  const generateSparkline = (data) => {
    if (!data || data.length === 0) return null;

    const width = 60;
    const height = 20;
    const values = data;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    if (range === 0) return null;

    const points = values.map((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <polyline
          fill="none"
          stroke="var(--green)"
          strokeWidth="1.5"
          points={points}
        />
      </svg>
    );
  };

  if (error) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Recharger</button>
      </div>
    );
  }

  return (
    <div className="markets-page">
      <header className="markets-header">
        <h1>Marchés Financiers</h1>
        <p>Données en temps réel</p>
      </header>

      <div className="markets-controls">
        <div className="search-container">
          <Search size={20} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="sort-controls">
          <button
            className={`sort-button ${sortOrder === 'gainers' ? 'active' : ''}`}
            onClick={() => setSortOrder(sortOrder === 'gainers' ? 'default' : 'gainers')}
          >
            <TrendingUp size={16} />
            Gagnants
          </button>
          <button
            className={`sort-button ${sortOrder === 'losers' ? 'active' : ''}`}
            onClick={() => setSortOrder(sortOrder === 'losers' ? 'default' : 'losers')}
          >
            <TrendingDown size={16} />
            Perdants
          </button>
        </div>
      </div>

      <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
        {/* Stocks Tab */}
        <div className={`tab-content ${activeTab === 'stocks' ? 'active' : ''}`}>
          {loading ? (
            <div className="skeleton-list">
              {[...Array(10)].map((_, i) => (
                <div key={`skeleton-${i}`} className="skeleton-item">
                  <div className="skeleton-logo"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-price"></div>
                  <div className="skeleton-change"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="market-list">
              {filteredStocks.length > 0 ? (
                filteredStocks.map((stock) => (
                  <div key={stock.symbol} className="market-item">
                    <div className="item-logo">
                      <img
                        src={stock.logo}
                        alt={stock.symbol}
                        onError={(e) => {
                          e.target.src = `https://via.placeholder.com/40?text=${stock.symbol}`;
                        }}
                      />
                    </div>
                    <div className="item-info">
                      <div className="item-name">{stock.name}</div>
                      <div className="item-symbol">{stock.symbol}</div>
                    </div>
                    <div className="item-price">${stock.price.toFixed(2)}</div>
                    <div className={`item-change ${stock.changePercent >= 0 ? 'positive' : 'negative'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                    <div className="item-sparkline">
                      {generateSparkline(stock.sparklineData)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Aucun résultat trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Crypto Tab */}
        <div className={`tab-content ${activeTab === 'crypto' ? 'active' : ''}`}>
          {loading ? (
            <div className="skeleton-list">
              {[...Array(6)].map((_, i) => (
                <div key={`skeleton-crypto-${i}`} className="skeleton-item">
                  <div className="skeleton-logo"></div>
                  <div className="skeleton-text"></div>
                  <div className="skeleton-price"></div>
                  <div className="skeleton-change"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="market-list">
              {filteredCrypto.length > 0 ? (
                filteredCrypto.map((coin) => (
                  <div key={coin.id} className="market-item">
                    <div className="item-logo">
                      <img src={coin.logo} alt={coin.symbol} />
                    </div>
                    <div className="item-info">
                      <div className="item-name">{coin.name}</div>
                      <div className="item-symbol">{coin.symbol}</div>
                    </div>
                    <div className="item-price">${coin.price.toLocaleString()}</div>
                    <div className={`item-change ${coin.changePercent >= 0 ? 'positive' : 'negative'}`}>
                      {coin.changePercent >= 0 ? '+' : ''}{coin.changePercent.toFixed(2)}%
                    </div>
                    <div className="crypto-details">
                      <div className="detail-item">
                        <div className="detail-label">Cap</div>
                        <div className="detail-value">${coin.marketCap.toLocaleString()}</div>
                      </div>
                      <div className="detail-item">
                        <div className="detail-label">Vol 24h</div>
                        <div className="detail-value">${coin.volume24h.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <p>Aucun résultat trouvé</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Tabs>

      <style jsx>{`
        .markets-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--t1);
          font-family: 'Inter', sans-serif;
          padding: 1rem;
        }

        .markets-header {
          margin-bottom: 1.5rem;
        }

        .markets-header h1 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0;
          color: var(--t1);
        }

        .markets-header p {
          font-size: 0.9rem;
          color: var(--t2);
          margin: 0.25rem 0 0 0;
        }

        .markets-controls {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-container {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--t2);
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          color: var(--t1);
          font-size: 0.95rem;
          transition: border-color 0.2s;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--green);
        }

        .sort-controls {
          display: flex;
          gap: 0.5rem;
        }

        .sort-button {
          flex: 1;
          padding: 0.5rem;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          color: var(--t2);
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .sort-button.active {
          background: var(--green);
          color: var(--bg);
          border-color: var(--green);
        }

        .tab-content {
          display: none;
        }

        .tab-content.active {
          display: block;
        }

        .market-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .market-item {
          display: grid;
          grid-template-columns: 2.5rem 1fr 6rem 5rem 1fr;
          align-items: center;
          padding: 1rem;
          background: var(--bg2);
          border-radius: 0.75rem;
          border: 1