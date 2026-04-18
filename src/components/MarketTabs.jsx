import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MarketTabs from '../components/MarketTabs';
import './Markets.css';

const Markets = () => {
    const [activeTab, setActiveTab] = useState('stocks');
    const [stocksData, setStocksData] = useState([]);
    const [cryptoData, setCryptoData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchStocks = async () => {
            const response = await fetch('/api/stocks');
            const data = await response.json();
            setStocksData(data);
        };

        const fetchCrypto = async () => {
            const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false');
            const data = await response.json();
            setCryptoData(data);
        };

        Promise.all([fetchStocks(), fetchCrypto()]).then(() => setLoading(false));
    }, []);

    const handleSearch = (e) => {
        setSearchTerm(e.target.value.toLowerCase());
    };

    const filteredStocks = stocksData.filter(stock => stock.name.toLowerCase().includes(searchTerm));
    const filteredCrypto = cryptoData.filter(coin => coin.name.toLowerCase().includes(searchTerm));

    return (
        <div className="markets">
            <h1 className="title">Financial Markets</h1>
            <MarketTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            <input
                type="text"
                placeholder="Search..."
                className="search-bar"
                value={searchTerm}
                onChange={handleSearch}
            />
            {loading ? (
                <div className="skeleton-loader">Loading...</div>
            ) : (
                <div className="market-section">
                    {activeTab === 'stocks' ? (
                        <div className="stocks">
                            {filteredStocks.map(stock => (
                                <div key={stock.symbol} className="stock-item">
                                    <img src={stock.logo || 'placeholder.png'} alt={stock.name} className="stock-logo" />
                                    <div className="stock-info">
                                        <h2 className="stock-name">{stock.name}</h2>
                                        <p className="stock-price">${stock.price}</p>
                                        <span className={`stock-change ${stock.change >= 0 ? 'positive' : 'negative'}`}>
                                            {stock.change >= 0 ? `+${stock.change}%` : `${stock.change}%`}
                                        </span>
                                    </div>
                                    <svg className="sparkline" /* SVG data for 7-day trend */ />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="crypto">
                            {filteredCrypto.map(coin => (
                                <div key={coin.id} className="crypto-item">
                                    <h2 className="crypto-name">{coin.name}</h2>
                                    <p className="crypto-price">${coin.current_price}</p>
                                    <p className="crypto-market-cap">Market Cap: ${coin.market_cap}</p>
                                    <p className="crypto-volume">24h Volume: ${coin.total_volume}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Markets;

import React from 'react';
import './MarketTabs.css';

const MarketTabs = ({ activeTab, setActiveTab }) => {
    return (
        <div className="market-tabs">
            <div className={`tab ${activeTab === 'stocks' ? 'active' : ''}`} onClick={() => setActiveTab('stocks')}>
                Stocks
            </div>
            <div className={`tab ${activeTab === 'crypto' ? 'active' : ''}`} onClick={() => setActiveTab('crypto')}>
                Crypto
            </div>
            <div className="indicator" style={{ transform: activeTab === 'stocks' ? 'translateX(0)' : 'translateX(100%)' }} />
        </div>
    );
};

export default MarketTabs;

.markets {
    background-color: var(--bg);
    color: var(--t1);
    padding: 20px;
}

.title {
    font-size: 24px;
    margin-bottom: 20px;
}

.search-bar {
    width: 100%;
    padding: 10px;
    margin-bottom: 20px;
    border: 1px solid var(--border);
    border-radius: 5px;
    background-color: var(--bg2);
    color: var(--t1);
}

.market-section {
    display: flex;
    flex-direction: column;
}

.stocks, .crypto {
    display: flex;
    flex-direction: column;
}

.stock-item, .crypto-item {
    display: flex;
    align-items: center;
    padding: 15px;
    border: 1px solid var(--border);
    border-radius: 5px;
    margin-bottom: 10px;
    background-color: var(--bg2);
}

.stock-logo {
    width: 40px;
    height: 40px;
    margin-right: 15px;
}

.stock-info {
    flex-grow: 1;
}

.stock-name {
    font-size: 18px;
}

.stock-price {
    font-size: 16px;
}

.stock-change {
    font-size: 14px;
}

.positive {
    color: var(--green);
}

.negative {
    color: red;
}

.market-tabs {
    display: flex;
    position: relative;
}

.tab {
    flex: 1;
    padding: 10px;
    text-align: center;
    cursor: pointer;
    border-bottom: 2px solid transparent;
}

.tab.active {
    border-bottom: 2px solid var(--green);
}

.indicator {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    width: 50%;
    background-color: var(--green);
    transition: transform 0.3s ease;
}

.skeleton-loader {
    height: 200px;
    background-color: var(--bg3);
    border-radius: 5px;
}