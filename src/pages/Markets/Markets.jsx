Création de src/pages/Markets/Markets.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineSearch } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../hooks/useTheme';

const Markets = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('stocks');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const { data, error } = await supabase
          .from('assets')
          .select('id, name, symbol, price, variation')
          .order('variation', { ascending: false });
        if (error) {
          setError(error.message);
        } else {
          setAssets(data);
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAssets();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event) => {
    setSelectedTab(event.target.dataset.tab);
  };

  const filteredAssets = assets.filter((asset) => {
    const assetName = asset.name.toLowerCase();
    const searchTermLower = searchTerm.toLowerCase();
    return assetName.includes(searchTermLower);
  });

  const sortedAssets = filteredAssets.sort((a, b) => {
    if (selectedTab === 'stocks') {
      return b.variation - a.variation;
    } else {
      return b.price - a.price;
    }
  });

  const topGainers = sortedAssets.slice(0, 10);
  const topLosers = sortedAssets.slice(-10);

  return (
    <div className="markets-page">
      <header className="header">
        <nav className="tabs">
          <ul>
            <li>
              <Link
                to="/markets/stocks"
                className={location.pathname.includes('stocks') ? 'active' : ''}
                onClick={handleTabChange}
                data-tab="stocks"
              >
                Stocks
              </Link>
            </li>
            <li>
              <Link
                to="/markets/crypto"
                className={location.pathname.includes('crypto') ? 'active' : ''}
                onClick={handleTabChange}
                data-tab="crypto"
              >
                Crypto
              </Link>
            </li>
          </ul>
        </nav>
        <div className="search-bar">
          <input
            type="search"
            placeholder="Recherchez un actif"
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
          <button className="search-button">
            <AiOutlineSearch />
          </button>
        </div>
      </header>
      <main className="main">
        {loading ? (
          <div className="skeleton-loader">
            <div className="skeleton-card" />
            <div className="skeleton-card" />
            <div className="skeleton-card" />
          </div>
        ) : (
          <>
            {topGainers.length > 0 && (
              <section className="top-gainers">
                <h2 className="section-label">Top Gainers</h2>
                {topGainers.map((asset, index) => (
                  <div key={asset.id} className="asset-card">
                    <div className="asset-logo">
                      {asset.symbol ? (
                        <span className="asset-symbol">{asset.symbol}</span>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="3" y1="15" x2="21" y2="15" />
                        </svg>
                      )}
                    </div>
                    <div className="asset-info">
                      <h3 className="asset-name">{asset.name}</h3>
                      <p className="asset-price">
                        <span className="asset-price-value">
                          <tabular-nums>{asset.price}</tabular-nums>
                        </span>
                        <span className="asset-price-change">
                          <span
                            className={`price-change ${asset.variation > 0 ? 'positive' : 'negative'}`}
                          >
                            {asset.variation.toFixed(2)}%
                          </span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {asset.variation > 0 ? (
                              <path d="M5 3L2 6L5 9" />
                            ) : (
                              <path d="M5 9L2 6L5 3" />
                            )}
                          </svg>
                        </span>
                      </p>
                    </div>
                    <div className="asset-chart">
                      <svg
                        width="40"
                        height="20"
                        viewBox="0 0 40 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 5L35 5" />
                        <path d="M5 15L35 15" />
                        <path d="M5 5L5 15" />
                        <path d="M35 5L35 15" />
                      </svg>
                    </div>
                  </div>
                ))}
              </section>
            )}
            {topLosers.length > 0 && (
              <section className="top-losers">
                <h2 className="section-label">Top Losers</h2>
                {topLosers.map((asset, index) => (
                  <div key={asset.id} className="asset-card">
                    <div className="asset-logo">
                      {asset.symbol ? (
                        <span className="asset-symbol">{asset.symbol}</span>
                      ) : (
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <line x1="3" y1="9" x2="21" y2="9" />
                          <line x1="3" y1="15" x2="21" y2="15" />
                        </svg>
                      )}
                    </div>
                    <div className="asset-info">
                      <h3 className="asset-name">{asset.name}</h3>
                      <p className="asset-price">
                        <span className="asset-price-value">
                          <tabular-nums>{asset.price}</tabular-nums>
                        </span>
                        <span className="asset-price-change">
                          <span
                            className={`price-change ${asset.variation < 0 ? 'positive' : 'negative'}`}
                          >
                            {asset.variation.toFixed(2)}%
                          </span>
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 12 12"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            {asset.variation < 0 ? (
                              <path d="M5 9L2 6L5 3" />
                            ) : (
                              <path d="M5 3L2 6L5 9" />
                            )}
                          </svg>
                        </span>
                      </p>
                    </div>
                    <div className="asset-chart">
                      <svg
                        width="40"
                        height="20"
                        viewBox="0 0 40 20"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 5L35 5" />
                        <path d="M5 15L35 15" />
                        <path d="M5 5L5 15" />
                        <path d="M35 5L35 15" />
                      </svg>
                    </div>
                  </div>
                ))}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Markets;
```

Création de src/pages/Markets/Markets.css
```css
.markets-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.header {
  position: sticky;
  top: 0;
  background-color: var(--bg);
  padding: 10px;
  border-bottom: 1px solid var(--border);
  z-index: 1;
}

.tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.tabs ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
}

.tabs li {
  margin-right: 20px;
}

.tabs a {
  color: var(--t2);
  text-decoration: none;
  transition: color 0.2s ease;
}

.tabs a:hover {
  color: var(--t3);
}

.tabs a.active {
  color: var(--green);
  text-decoration: underline;
}

.search-bar {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.search-input {
  width: 100%;
  padding: 10px;
  border: none;
  border-radius: 12px;
  background-color: var(--bg2);
  color: var(--t1);
}

.search-button {
  background-color: var(--bg2);
  border: none;
  padding: 10px;
  border-radius: 12px;
  cursor: pointer;
}

.search-button:hover {
  background-color: var(--bg);
}

.main {
  padding: 20px;
}

.asset-card {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease;
}

.asset-card:hover {
  background-color: var(--bg);
}

.asset-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.asset-symbol {
  font-size: 24px;
  font-weight: bold;
  color: var(--green);
}

.asset-info {
  flex: 1;
  padding: 10px;
}

.asset-name {
  font-size: 16px;
  font-weight: bold;
  color: var(--t1);
}

.asset-price {
  font-size: 14px;
  color: var(--t2);
}

.asset-price-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
}

.asset-price-change {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: var(--t2);
}

.price-change {
  margin-right: 10px;
}

.price-change.positive {
  color: var(--green);
}

.price-change.negative {
  color: var(--t3);
}

.asset-chart {
  width: 40px;
  height: 20px;
  margin-left: 10px;
}

.top-gainers,
.top-losers {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.section-label {
  font-size: 16px;
  font-weight: bold;
  color: var(--t1);
  text-align: center;
}

.skeleton-loader {
  display: flex;
  justify-content: space-between;
  padding: 20px;
}

.skeleton-card {
  width: 300px;
  height: 100px;
  background-color: var(--bg);
  border-radius: 12px;
  margin: 10px;
}
```

Création de src/pages/Markets/Markets.theme.js
```javascript
import { createTheme } from '@material-ui/core/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00ff88',
    },
    background: {
      default: '#080808',
      paper: '#111',
    },
    text: {
      primary: '#f0f0f0',
      secondary: '#888',
      disabled: '#444',
    },
  },
  typography: {
    fontFamily: 'Inter',
  },
});

export default theme;
```

Création de src/hooks/useTheme.js
```javascript
import { useTheme } from '@material-ui/core/styles';

const useTheme = () => {
  const theme = useTheme();
  return theme;
};

export default useTheme;