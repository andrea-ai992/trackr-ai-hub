import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import AssetCard from '../components/AssetCard';
import './Markets.css';

const Markets = () => {
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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

    return (
        <div className="markets">
            <header className="markets-header">
                <nav className="markets-tabs">
                    <Link to="/markets/stocks" className="tab">Stocks</Link>
                    <Link to="/markets/crypto" className="tab active">Crypto</Link>
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
            </header>

            {loading ? (
                <div className="skeleton-loader">Loading...</div>
            ) : (
                <div className="assets-list">
                    <h2 className="section-title">Top Gainers</h2>
                    {filteredAssets.filter(asset => asset.change > 0).map(asset => (
                        <AssetCard key={asset.symbol} asset={asset} />
                    ))}
                    <h2 className="section-title">Top Losers</h2>
                    {filteredAssets.filter(asset => asset.change < 0).map(asset => (
                        <AssetCard key={asset.symbol} asset={asset} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default Markets;

import React from 'react';
import './AssetCard.css';

const AssetCard = ({ asset }) => {
    const changeColor = asset.change > 0 ? 'green' : 'red';

    return (
        <div className="asset-card">
            <div className="asset-logo">
                {asset.logo ? <img src={asset.logo} alt={asset.name} /> : <span className="symbol">{asset.symbol}</span>}
            </div>
            <div className="asset-info">
                <h3 className="asset-name">{asset.name}</h3>
                <p className="asset-price">{asset.price.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2 })}</p>
                <p className={`asset-change ${changeColor}`}>
                    {asset.change.toFixed(2)}% <span className={`arrow ${changeColor}`}>{asset.change > 0 ? '↑' : '↓'}</span>
                </p>
                <svg width="40" height="20">
                    {/* Mini sparkline SVG here */}
                </svg>
            </div>
        </div>
    );
};

export default AssetCard;

.markets {
    background-color: var(--bg);
    color: var(--t1);
    font-family: 'Inter', sans-serif;
}

.markets-header {
    position: sticky;
    top: 0;
    background-color: var(--bg);
    z-index: 10;
}

.markets-tabs {
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