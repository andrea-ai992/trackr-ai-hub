import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import StockCard from '../components/StockCard';

const Markets = () => {
    const [activeTab, setActiveTab] = useState('stocks');
    const [stocks, setStocks] = useState([]);
    const [crypto, setCrypto] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStocks = async () => {
            const response = await fetch('/api/stocks'); // Proxy to Yahoo Finance
            const data = await response.json();
            setStocks(data);
        };

        const fetchCrypto = async () => {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd');
            const data = await response.json();
            setCrypto(data);
        };

        Promise.all([fetchStocks(), fetchCrypto()]).then(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredStocks = stocks.filter(stock => stock.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredCrypto = crypto.filter(coin => coin.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const sortedStocks = [...filteredStocks].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
    const sortedCrypto = [...filteredCrypto].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);

    return (
        <div className="markets" style={{ backgroundColor: 'var(--bg)', color: 'var(--t1)' }}>
            <div className="tabs">
                <button onClick={() => setActiveTab('stocks')} className={`tab ${activeTab === 'stocks' ? 'active' : ''}`}>Stocks</button>
                <button onClick={() => setActiveTab('crypto')} className={`tab ${activeTab === 'crypto' ? 'active' : ''}`}>Crypto</button>
            </div>
            <input 
                type="text" 
                placeholder="Search..." 
                value={searchTerm} 
                onChange={handleSearch} 
                className="search-bar" 
                style={{ position: 'sticky', top: 0 }} 
            />
            {loading ? (
                <div className="skeleton-loader">Loading...</div>
            ) : (
                <div className="content">
                    {activeTab === 'stocks' && sortedStocks.map(stock => (
                        <StockCard key={stock.symbol} stock={stock} />
                    ))}
                    {activeTab === 'crypto' && sortedCrypto.map(coin => (
                        <div key={coin.id} className="crypto-card">
                            <h3>{coin.name}</h3>
                            <p>Price: ${coin.current_price}</p>
                            <p>Market Cap: ${coin.market_cap}</p>
                            <p>24h Volume: ${coin.total_volume}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Markets;

import React from 'react';

const StockCard = ({ stock }) => {
    const priceChangeClass = stock.price_change_percentage_24h >= 0 ? 'badge green' : 'badge red';

    return (
        <div className="stock-card" style={{ backgroundColor: 'var(--bg2)', border: '1px solid var(--border)' }}>
            <img src={stock.logo || 'placeholder.png'} alt={stock.name} />
            <h3>{stock.name}</h3>
            <p>Price: ${stock.current_price}</p>
            <span className={priceChangeClass}>{stock.price_change_percentage_24h.toFixed(2)}%</span>
            <svg className="sparkline" width="100" height="20">
                {/* Add sparkline SVG logic here */}
            </svg>
        </div>
    );
};

export default StockCard;

<style>
    .markets {
        padding: 16px;
    }
    .tabs {
        display: flex;
        justify-content: space-around;
        margin-bottom: 16px;
    }
    .tab {
        padding: 12px;
        cursor: pointer;
        border: none;
        background: transparent;
        color: var(--t1);
        font-weight: bold;
    }
    .tab.active {
        border-bottom: 2px solid var(--green);
    }
    .search-bar {
        width: 100%;
        padding: 12px;
        margin-bottom: 16px;
        border: 1px solid var(--border);
        border-radius: 4px;
        background-color: var(--bg3);
        color: var(--t1);
    }
    .skeleton-loader {
        height: 100px;
        background: var(--bg3);
        animation: pulse 1.5s infinite;
    }
    .content {
        display: flex;
        flex-direction: column;
    }
    .stock-card, .crypto-card {
        padding: 16px;
        margin-bottom: 16px;
        border-radius: 8px;
        transition: transform 0.2s;
    }
    .stock-card:hover, .crypto-card:hover {
        transform: scale(1.02);
    }
    .badge {
        padding: 4px 8px;
        border-radius: 4px;
        color: #fff;
    }
    .badge.green {
        background-color: #00ff88;
    }
    .badge.red {
        background-color: #ff4c4c;
    }
</style>