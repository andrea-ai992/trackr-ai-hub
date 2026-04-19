// src/pages/Markets.jsx
import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import './Markets.css';

const Markets = () => {
  const [activeTab, setActiveTab] = useState('stocks');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [stocksRes, cryptoRes] = await Promise.all([
          fetch('/api/stocks'),
          fetch('/api/crypto')
        ]);

        const stocksData = await stocksRes.json();
        const cryptoData = await cryptoRes.json();

        setStocks(stocksData);
        setCrypto(cryptoData);

        const sortedStocks = [...stocksData].sort((a, b) => b.changePercent - a.changePercent);
        const sortedCrypto = [...cryptoData].sort((a, b) => b.changePercent - a.changePercent);

        setTopGainers([...sortedStocks.slice(0, 5), ...sortedCrypto.slice(0, 5)]);
        setTopLosers([...sortedStocks.slice(-5).reverse(), ...sortedCrypto.slice(-5).reverse()]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const [stocksRes, cryptoRes] = await Promise.all([
        fetch('/api/stocks'),
        fetch('/api/crypto')
      ]);

      const stocksData = await stocksRes.json();
      const cryptoData = await cryptoRes.json();

      setStocks(stocksData);
      setCrypto(cryptoData);
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredStocks = stocks.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredCrypto = crypto.filter(asset =>
    asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderAssetCard = (asset) => (
    <div key={`${asset.symbol}-${asset.type}`} className="asset-card">
      <div className="asset-logo">
        {asset.logo ? (
          <img src={asset.logo} alt={asset.name} />
        ) : (
          <span className="symbol">{asset.symbol.slice(0, 2)}</span>
        )}
      </div>
      <div className="asset-info">
        <h3 className="asset-name">{asset.name}</h3>
        <p className="asset-price">{asset.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}</p>
        <p className={`asset-change ${asset.changePercent >= 0 ? 'positive' : 'negative'}`}>
          {asset.changePercent >= 0 ? '+' : ''}{asset.changePercent.toFixed(2)}%
        </p>
        <div className="sparkline-container">
          <svg width="40" height="20" viewBox="0 0 40 20" className="sparkline">
            {asset.sparkline ? (
              <polyline
                fill="none"
                stroke={asset.changePercent >= 0 ? '#00ff88' : '#ff4444'}
                strokeWidth="1.5"
                points={asset.sparkline}
              />
            ) : (
              <polyline
                fill="none"
                stroke="var(--text-muted)"
                strokeWidth="1.5"
                points="0,10 5,8 10,12 15,6 20,14 25,8 30,12 35,10"
              />
            )}
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="markets">
      <header className="markets-header">
        <nav className="markets-tabs">
          <button
            className={`tab ${activeTab === 'stocks' ? 'active' : ''}`}
            onClick={() => setActiveTab('stocks')}
          >
            Stocks
          </button>
          <button
            className={`tab ${activeTab === 'crypto' ? 'active' : ''}`}
            onClick={() => setActiveTab('crypto')}
          >
            Crypto
          </button>
        </nav>
        <div className="search-container">
          <div className="search-bar">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </header>

      <div
        className={`markets-content ${refreshing ? 'refreshing' : ''}`}
        onClick={(e) => {
          if (e.currentTarget.classList.contains('refreshing')) {
            handleRefresh();
          }
        }}
      >
        {loading ? (
          <div className="skeleton-loader">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="skeleton-card"></div>
            ))}
          </div>
        ) : (
          <>
            <div className="section">
              <h2 className="section-title">Top Gainers</h2>
              {activeTab === 'stocks'
                ? filteredStocks
                    .filter(asset => asset.changePercent > 0)
                    .sort((a, b) => b.changePercent - a.changePercent)
                    .slice(0, 5)
                    .map(renderAssetCard)
                : filteredCrypto
                    .filter(asset => asset.changePercent > 0)
                    .sort((a, b) => b.changePercent - a.changePercent)
                    .slice(0, 5)
                    .map(renderAssetCard)}
            </div>

            <div className="section">
              <h2 className="section-title">Top Losers</h2>
              {activeTab === 'stocks'
                ? filteredStocks
                    .filter(asset => asset.changePercent < 0)
                    .sort((a, b) => a.changePercent - b.changePercent)
                    .slice(0, 5)
                    .map(renderAssetCard)
                : filteredCrypto
                    .filter(asset => asset.changePercent < 0)
                    .sort((a, b) => a.changePercent - b.changePercent)
                    .slice(0, 5)
                    .map(renderAssetCard)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Markets;