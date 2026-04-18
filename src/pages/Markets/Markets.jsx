import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AiOutlineSearch } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useTheme } from '../hooks/useTheme';

const Markets = () => {
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('stocks');
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const response = await fetch('/api/yahoo-finance');
        const data = await response.json();
        setStocks(data);
      } catch (error) {
        console.error(error);
      }
    };

    const fetchCrypto = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
        const data = await response.json();
        setCrypto(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchStocks();
    fetchCrypto();
    setLoading(false);
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTabChange = (event) => {
    setSelectedTab(event.target.dataset.tab);
  };

  const filteredStocks = stocks.filter(stock => stock.name.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredCrypto = crypto.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const sortedStocks = filteredStocks.sort((a, b) => b.variation - a.variation);
  const sortedCrypto = filteredCrypto.sort((a, b) => b.price - a.price);

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
            {selectedTab === 'stocks' && (
              <section className="assets-list">
                {sortedStocks.map((stock) => (
                  <div key={stock.id} className="asset-card">
                    <div className="asset-logo">
                      <span className="asset-symbol">{stock.symbol}</span>
                    </div>
                    <div className="asset-info">
                      <h3 className="asset-name">{stock.name}</h3>
                      <p className="asset-price">
                        <span className="asset-price-value">{stock.price}</span>
                        <span className={`price-change ${stock.variation > 0 ? 'positive' : 'negative'}`}>
                          {stock.variation.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                    <div className="asset-chart">
                      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Placeholder for sparkline */}
                      </svg>
                    </div>
                  </div>
                ))}
              </section>
            )}
            {selectedTab === 'crypto' && (
              <section className="assets-list">
                {sortedCrypto.map((coin) => (
                  <div key={coin.id} className="asset-card">
                    <div className="asset-logo">
                      <span className="asset-symbol">{coin.symbol}</span>
                    </div>
                    <div className="asset-info">
                      <h3 className="asset-name">{coin.name}</h3>
                      <p className="asset-price">
                        <span className="asset-price-value">{coin.current_price}</span>
                        <span className={`price-change ${coin.price_change_percentage_24h > 0 ? 'positive' : 'negative'}`}>
                          {coin.price_change_percentage_24h.toFixed(2)}%
                        </span>
                      </p>
                    </div>
                    <div className="asset-chart">
                      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {/* Placeholder for sparkline */}
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

.assets-list {
  display: flex;
  flex-direction: column;
}

.asset-card {
  display: flex;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
  transition: background-color 0.2s ease;
  min-height: 44px;
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

.price-change {
  margin-left: 10px;
  font-size: 14px;
}

.price-change.positive {
  color: #00ff88;
}

.price-change.negative {
  color: #ff4d4d;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
}

.skeleton-card {
  height: 44px;
  background-color: rgba(255, 255, 255, 0.1);
  margin-bottom: 10px;
  border-radius: 8px;
}