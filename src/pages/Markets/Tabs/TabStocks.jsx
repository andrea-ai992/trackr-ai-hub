**src/pages/Markets.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import Tabs from './Tabs';

const Markets = () => {
  const [stocks, setStocks] = useState([]);
  const [cryptos, setCryptos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('variation');

  const navigate = useNavigate();
  const params = useParams();

  useEffect(() => {
    const fetchStocks = async () => {
      const response = await fetch('/api/stocks');
      const data = await response.json();
      setStocks(data);
    };

    const fetchCryptos = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?ids=bitcoin%2Cethereum%2Csolana%2Cbnb%2Cavax%2Clink&vs_currency=usd');
      const data = await response.json();
      setCryptos(data);
    };

    fetchStocks();
    fetchCryptos();
    setLoading(false);
  }, []);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleSort = (e) => {
    setSort(e.target.value);
  };

  const filteredStocks = stocks.filter((stock) => stock.name.toLowerCase().includes(search.toLowerCase()));
  const sortedStocks = filteredStocks.sort((a, b) => {
    if (sort === 'variation') {
      return b.variation - a.variation;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  const filteredCryptos = cryptos.filter((crypto) => crypto.name.toLowerCase().includes(search.toLowerCase()));
  const sortedCryptos = filteredCryptos.sort((a, b) => {
    if (sort === 'variation') {
      return b.price_change_percentage_24h - a.price_change_percentage_24h;
    } else {
      return a.name.localeCompare(b.name);
    }
  });

  return (
    <div className="container">
      <header className="header">
        <h1>Marchés financiers</h1>
        <input
          type="search"
          placeholder="Rechercher"
          value={search}
          onChange={handleSearch}
          className="search-bar"
        />
        <select value={sort} onChange={handleSort} className="sort-select">
          <option value="variation">Variation</option>
          <option value="name">Nom</option>
        </select>
      </header>
      <main className="main">
        <Tabs>
          <TabStocks stocks={sortedStocks} />
          <TabCrypto cryptos={sortedCryptos} />
        </Tabs>
      </main>
      {loading && (
        <div className="skeleton-loader">
          <div className="skeleton-loader-item" />
          <div className="skeleton-loader-item" />
          <div className="skeleton-loader-item" />
        </div>
      )}
    </div>
  );
};

export default Markets;
```

**src/pages/Markets/Tabs/Tabs.jsx**
```jsx
import React from 'react';
import { TabList, TabPanels, Tab } from './Tab';

const Tabs = ({ children }) => {
  return (
    <div className="tabs">
      <TabList>
        <Tab>Actions</Tab>
        <Tab>Overview</Tab>
        <Tab>Reports</Tab>
      </TabList>
      <TabPanels>
        {children}
      </TabPanels>
    </div>
  );
};

export default Tabs;
```

**src/pages/Markets/Tabs/TabStocks.jsx**
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Icon } from './Icon';

const TabStocks = ({ stocks }) => {
  const navigate = useNavigate();

  const handleStockClick = (stock) => {
    navigate(`/markets/stocks/${stock.symbol}`);
  };

  return (
    <div className="tab-pane">
      <h2>Actions</h2>
      <ul>
        {stocks.map((stock) => (
          <li key={stock.symbol}>
            <div className="stock-item">
              <div className="stock-item-logo">
                <Icon name="logo" />
              </div>
              <div className="stock-item-info">
                <h3>{stock.name}</h3>
                <p>{stock.symbol}</p>
                <p>
                  ${stock.price.toFixed(2)}
                  <span className="variation-badge">
                    {stock.variation > 0 ? (
                      <span className="variation-badge-positive">
                        {stock.variation.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="variation-badge-negative">
                        {stock.variation.toFixed(2)}%
                      </span>
                    )}
                  </span>
                </p>
              </div>
              <button onClick={() => handleStockClick(stock)}>Détails</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabStocks;
```

**src/pages/Markets/Tabs/TabCrypto.jsx**
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Icon } from './Icon';

const TabCrypto = ({ cryptos }) => {
  const navigate = useNavigate();

  const handleCryptoClick = (crypto) => {
    navigate(`/markets/crypto/${crypto.id}`);
  };

  return (
    <div className="tab-pane">
      <h2>Overview</h2>
      <ul>
        {cryptos.map((crypto) => (
          <li key={crypto.id}>
            <div className="crypto-item">
              <div className="crypto-item-logo">
                <Icon name="logo" />
              </div>
              <div className="crypto-item-info">
                <h3>{crypto.name}</h3>
                <p>
                  ${crypto.current_price.toFixed(2)}
                  <span className="variation-badge">
                    {crypto.price_change_percentage_24h > 0 ? (
                      <span className="variation-badge-positive">
                        {crypto.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    ) : (
                      <span className="variation-badge-negative">
                        {crypto.price_change_percentage_24h.toFixed(2)}%
                      </span>
                    )}
                  </span>
                </p>
                <p>
                  Market Cap : ${crypto.market_cap.toFixed(2)}
                </p>
                <p>
                  Volume 24h : ${crypto.total_volume.toFixed(2)}
                </p>
              </div>
              <button onClick={() => handleCryptoClick(crypto)}>Détails</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TabCrypto;
```

**src/pages/Markets/Tabs/Icon.jsx**
```jsx
import React from 'react';

const Icon = ({ name }) => {
  switch (name) {
    case 'logo':
      return <svg width="24" height="24" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
      </svg>;
    default:
      return null;
  }
};

export default Icon;
```

**src/pages/Markets/Tabs/TabList.jsx**
```jsx
import React from 'react';

const TabList = ({ children }) => {
  return (
    <ul className="tab-list">
      {children}
    </ul>
  );
};

export default TabList;
```

**src/pages/Markets/Tabs/TabPanels.jsx**
```jsx
import React from 'react';

const TabPanels = ({ children }) => {
  return (
    <div className="tab-panels">
      {children}
    </div>
  );
};

export default TabPanels;
```

**styles/markets.css**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background-color: var(--bg);
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: var(--bg2);
}

.header h1 {
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
}

.search-bar {
  width: 300px;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  color: var(--t1);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
}

.sort-select {
  width: 150px;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  color: var(--t1);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
}

.main {
  padding: 20px;
}

.tabs {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  background-color: var(--bg2);
}

.tab-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
}

.tab-list li {
  margin-right: 20px;
}

.tab-list li:last-child {
  margin-right: 0;
}

.tab {
  padding: 10px 20px;
  font-size: 16px;
  color: var(--t1);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.tab.active {
  background-color: var(--bg);
  color: var(--t2);
}

.tab-pane {
  padding: 20px;
}

.stock-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.stock-item-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.stock-item-info {
  flex: 1;
}

.stock-item-info h3 {
  font-size: 16px;
  font-weight: bold;
  color: var(--t1);
}

.stock-item-info p {
  font-size: 14px;
  color: var(--t2);
}

.variation-badge {
  display: inline-block;
  padding: 5px 10px;
  font-size: 14px;
  color: var(--t2);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
}

.variation-badge-positive {
  background-color: var(--green);
  color: var(--t1);
}

.variation-badge-negative {
  background-color: var(--bg);
  color: var(--t2);
}

.crypto-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

.crypto-item-logo {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.crypto-item-info {
  flex: 1;
}

.crypto-item-info h3 {
  font-size: 16px;
  font-weight: bold;
  color: var(--t1);
}

.crypto-item-info p {
  font-size: 14px;
  color: var(--t2);
}

.skeleton-loader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: var(--bg2);
}

.skeleton-loader-item {
  width: 100px;
  height: 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 5px;
  animation: skeleton-loader 1s infinite;
}

@keyframes skeleton-loader {
  0% {
    background-color: var(--bg);
  }
  50% {
    background-color: var(--bg2);
  }
  100% {
    background-color: var(--bg);
  }
}
```

**styles/global.css**
```css
body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

a {
  text-decoration: none;
  color: var(--t2);
}

a:hover {
  color: var(--t1);
}

button {
  padding: 10px 20px;
  font-size: 16px;
  color: var(--t1);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: var(--bg);
  color: var(--t2);
}

input[type="search"] {
  width: 300px;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  color: var(--t1);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
}

input[type="search"]:hover {
  background-color: var(--bg);
  color: var(--t2);
}

select {
  width: 150px;
  height: 40px;
  padding: 10px;
  font-size: 16px;
  color: var(--t1);
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
}

select:hover {
  background-color: var(--bg);
  color: var(--t2);
}