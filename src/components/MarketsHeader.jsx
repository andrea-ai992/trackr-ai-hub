Création de src/components/MarketsHeader.jsx
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AiOutlineSearch } from 'lucide-react';

const MarketsHeader = () => {
  return (
    <header className="markets-header sticky top-0 bg--bg z-10">
      <div className="container mx-auto px-4 pt-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text--t1">Markets</h1>
          <div className="flex items-center">
            <Link to="/markets/stocks" className="mr-4">
              <span className={`text-sm font-bold text--t2 ${window.location.pathname.includes('stocks') ? 'underline underline-offset-2 decoration--green' : ''}`}>Stocks</span>
            </Link>
            <Link to="/markets/crypto">
              <span className={`text-sm font-bold text--t2 ${window.location.pathname.includes('crypto') ? 'underline underline-offset-2 decoration--green' : ''}`}>Crypto</span>
            </Link>
          </div>
        </div>
        <div className="search-bar sticky top-0 bg--bg2 p-2 rounded-lg shadow-md">
          <AiOutlineSearch className="text--t3" />
          <input type="search" className="w-full pl-4 py-2 text--t2 placeholder:text--t3" placeholder="Recherchez un actif" />
        </div>
      </div>
    </header>
  );
};

export default MarketsHeader;
```

Création de src/pages/Markets.jsx
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MarketsHeader from '../components/MarketsHeader';
import { Spinner } from 'lucide-react';
import axios from 'axios';

const Markets = () => {
  const location = useLocation();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('/api/markets');
        setAssets(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAssets();
  }, []);

  const handlePullToRefresh = () => {
    setLoading(true);
    const fetchAssets = async () => {
      try {
        const response = await axios.get('/api/markets');
        setAssets(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAssets();
  };

  return (
    <div className="markets-page bg--bg">
      <MarketsHeader />
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text--t1">Liste des actifs</h2>
          <div className="flex flex-wrap justify-center">
            {assets.map((asset, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
                <div className="card bg--bg2 rounded-lg shadow-md">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full" />
                      <span className="text-lg font-bold text--t1">{asset.name}</span>
                    </div>
                    <div className="text-lg font-bold text--t1">${asset.price}</div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="text-lg font-bold text--t1">{asset.variation}%</div>
                    <div className={`text-lg font-bold text--t1 ${asset.variation > 0 ? 'text--green' : 'text--red'}`}>{asset.variation > 0 ? '↑' : '↓'}</div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="sparkline bg--bg3 h-4 w-40 rounded-lg">
                      <svg width="40" height="20" viewBox="0 0 40 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 10L20 10L20 10" stroke="#fff" strokeWidth="2" />
                        <path d="M20 10L20 10" stroke="#fff" strokeWidth="2" />
                        <path d="M20 10L20 10" stroke="#fff" strokeWidth="2" />
                        <path d="M20 10L20 10" stroke="#fff" strokeWidth="2" />
                        <path d="M20 10L20 10" stroke="#fff" strokeWidth="2" />
                        <path d="M20 10L20 10" stroke="#fff" strokeWidth="2" />
                        <path d="M20 10L20 10" stroke="#fff" strokeWidth="2" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text--t1">Top Gainers</h2>
          <div className="flex flex-wrap justify-center">
            {assets.slice(0, 5).map((asset, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
                <div className="card bg--bg2 rounded-lg shadow-md">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full" />
                      <span className="text-lg font-bold text--t1">{asset.name}</span>
                    </div>
                    <div className="text-lg font-bold text--t1">${asset.price}</div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="text-lg font-bold text--t1">{asset.variation}%</div>
                    <div className={`text-lg font-bold text--t1 ${asset.variation > 0 ? 'text--green' : 'text--red'}`}>{asset.variation > 0 ? '↑' : '↓'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold text--t1">Top Losers</h2>
          <div className="flex flex-wrap justify-center">
            {assets.slice(-5).map((asset, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
                <div className="card bg--bg2 rounded-lg shadow-md">
                  <div className="flex items-center justify-between p-4">
                    <div className="flex items-center">
                      <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full" />
                      <span className="text-lg font-bold text--t1">{asset.name}</span>
                    </div>
                    <div className="text-lg font-bold text--t1">${asset.price}</div>
                  </div>
                  <div className="flex items-center justify-between p-4">
                    <div className="text-lg font-bold text--t1">{asset.variation}%</div>
                    <div className={`text-lg font-bold text--t1 ${asset.variation > 0 ? 'text--green' : 'text--red'}`}>{asset.variation > 0 ? '↑' : '↓'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        {loading ? (
          <div className="flex justify-center items-center h-screen">
            <Spinner className="text--t1" />
          </div>
        ) : (
          <div className="flex justify-center items-center h-screen">
            <button className="bg--bg2 hover:bg--bg2 hover:border hover:border--border-hi text--t1 font-bold py-2 px-4 rounded-lg" onClick={handlePullToRefresh}>
              Pull to refresh
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Markets;
```

Création de src/components/MarketsHeader.scss
```scss
.markets-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: var(--bg);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.markets-header .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.markets-header .flex {
  display: flex;
  align-items: center;
}

.markets-header .h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.markets-header .tabs {
  display: flex;
  align-items: center;
}

.markets-header .tabs .tab {
  margin-right: 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: var(--t2);
  text-decoration: none;
  transition: color 0.2s ease-in-out;
}

.markets-header .tabs .tab.active {
  color: var(--green);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.markets-header .search-bar {
  position: sticky;
  top: 0;
  background-color: var(--bg2);
  padding: 0.5rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.07);
}

.markets-header .search-bar .lucide-search {
  font-size: 1.5rem;
  color: var(--t3);
}

.markets-header .search-bar input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1rem;
  font-weight: bold;
  color: var(--t2);
  border: none;
  border-radius: 12px;
  background-color: var(--bg2);
  transition: background-color 0.2s ease-in-out;
}

.markets-header .search-bar input:focus {
  background-color: var(--bg);
}
```

Création de src/pages/Markets.scss
```scss
.markets-page {
  background-color: var(--bg);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.markets-page .container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.markets-page .flex {
  display: flex;
  align-items: center;
}

.markets-page .h2 {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.markets-page .card {
  background-color: var(--bg2);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.07);
  transition: background-color 0.2s ease-in-out;
}

.markets-page .card:hover {
  background-color: var(--bg);
}

.markets-page .sparkline {
  background-color: var(--bg3);
  height: 4px;
  width: 40px;
  border-radius: 12px;
  overflow: hidden;
}

.markets-page .sparkline svg {
  width: 100%;
  height: 100%;
}

.markets-page .sparkline svg path {
  stroke: var(--t1);
  stroke-width: 2;
}

.markets-page .pull-to-refresh {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  background-color: var(--bg);
  text-align: center;
  transition: opacity 0.2s ease-in-out;
}

.markets-page .pull-to-refresh.show {
  opacity: 1;
}

.markets-page .pull-to-refresh button {
  background-color: var(--bg2);
  padding: 0.5rem 1rem;
  font-size: 1rem;
  font-weight: bold;
  color: var(--t1);
  border: none;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.07);
  transition: background-color 0.2s ease-in-out;
}

.markets-page .pull-to-refresh button:hover {
  background-color: var(--bg);
}
```

Création de src/components/MarketsHeader.js
```jsx
import React from 'react';
import './MarketsHeader.scss';

const MarketsHeader = () => {
  return (
    <header className="markets-header">
      <div className="container">
        <h1 className="h1">Markets</h1>
        <div className="tabs">
          <Link to="/markets/stocks" className="tab">
            Stocks
          </Link>
          <Link to="/markets/crypto" className="tab">
            Crypto
          </Link>
        </div>
        <div className="search-bar">
          <AiOutlineSearch className="lucide-search" />
          <input type="search" placeholder="Recherchez un actif" />
        </div>
      </div>
    </header>
  );
};

export default MarketsHeader;
```

Création de src/pages/Markets.js
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import MarketsHeader from '../components/MarketsHeader';
import { Spinner } from 'lucide-react';
import axios from 'axios';

const Markets = () => {
  const location = useLocation();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const response = await axios.get('/api/markets');
        setAssets(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAssets();
  }, []);

  const handlePullToRefresh = () => {
    setLoading(true);
    const fetchAssets = async () => {
      try {
        const response = await axios.get('/api/markets');
        setAssets(response.data);
        setLoading(false);
      } catch (error) {
        console.error(error);
      }
    };
    fetchAssets();
  };

  return (
    <div className="markets-page">
      <MarketsHeader />
      <div className="container">
        <h2 className="h2">Liste des actifs</h2>
        <div className="flex">
          {assets.map((asset, index) => (
            <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
              <div className="card">
                <div className="flex">
                  <div className="flex">
                    <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full" />
                    <span className="text-lg font-bold text--t1">{asset.name}</span>
                  </div>
                  <div className="text-lg font-bold text--t1">${asset.price}</div>
                </div>
                <div className="flex">
                  <div className="text-lg font-bold text--t1">{asset.variation}%</div>
                  <div className={`text-lg font-bold text--t1 ${asset.variation > 0 ? 'text--green' : 'text--red'}`}>{asset.variation > 0 ? '↑' : '↓'}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex">
          <h2 className="h2">Top Gainers</h2>
          <div className="flex">
            {assets.slice(0, 5).map((asset, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
                <div className="card">
                  <div className="flex">
                    <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full" />
                    <span className="text-lg font-bold text--t1">{asset.name}</span>
                  </div>
                  <div className="flex">
                    <div className="text-lg font-bold text--t1">{asset.variation}%</div>
                    <div className={`text-lg font-bold text--t1 ${asset.variation > 0 ? 'text--green' : 'text--red'}`}>{asset.variation > 0 ? '↑' : '↓'}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex">
          <h2 className="h2">Top Losers</h2>
          <div className="flex">
            {assets.slice(-5).map((asset, index) => (
              <div key={index} className="w-full md:w-1/2 lg:w-1/3 xl:w-1/4 p-4">
                <div className="card">
                  <div className="flex">
                    <img src={asset.logo} alt={asset.name} className="w-8 h-8 rounded-full" />
                    <span className="text-lg font-bold text--t1">{asset.name}</span>
                  </div>
                  <div className="flex">
                    <div className="text-lg font-bold text--t1">{asset