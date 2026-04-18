**src/components/TabPillNeon.jsx**
```jsx
import React from 'react';

const TabPillNeon = ({ active, onClick, children }) => {
  return (
    <button
      className={`tab-pill-neon ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <div className="pill-neon" />
      <span className="pill-text">{children}</span>
    </button>
  );
};

const styles = {
  tabPillNeon: {
    backgroundColor: 'var(--bg)',
    color: 'var(--t1)',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '0.5rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '100%',
    height: '2.5rem',
    margin: '0.5rem 0',
  },
  active: {
    backgroundColor: 'var(--green)',
    color: 'var(--bg)',
  },
  pillNeon: {
    width: '1rem',
    height: '1rem',
    borderRadius: '50%',
    backgroundColor: 'var(--green)',
    position: 'relative',
    zIndex: 1,
  },
  pillText: {
    fontSize: '1rem',
    fontWeight: 'bold',
    marginLeft: '0.5rem',
  },
};

TabPillNeon.styles = styles;

export default TabPillNeon;
```

**src/pages/Markets.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TabPillNeon } from '../components/TabPillNeon';
import { useSupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { Inter } from 'next/font/google';
import styles from '../styles/markets.module.css';

const inter = Inter({ subsets: ['latin'] });

const Markets = () => {
  const navigate = useNavigate();
  const supabase = useSupabaseClient();
  const [stocks, setStocks] = useState([]);
  const [crypto, setCrypto] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      const response = await axios.get('https://api.yahoofinance.com/v10/quote?symbols=AAPL');
      const stockData = response.data.quote;
      setStocks([stockData]);
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    const fetchCrypto = async () => {
      const response = await axios.get('/api/crypto-prices');
      const cryptoData = response.data;
      setCrypto(cryptoData);
    };
    fetchCrypto();
  }, []);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      const response = await axios.get('/api/crypto-prices');
      const cryptoData = response.data;
      setCrypto(cryptoData);
    };
    fetchCryptoPrices();
  }, []);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const filteredStocks = stocks.filter((stock) => {
    return stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredCrypto = crypto.filter((coin) => {
    return coin.symbol.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleTabClick = (tab) => {
    if (tab === 'stocks') {
      navigate('/markets/stocks');
    } else if (tab === 'crypto') {
      navigate('/markets/crypto');
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Markets</h1>
        <input
          type="search"
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Recherche"
          className={styles.search}
        />
      </header>
      <main className={styles.main}>
        <div className={styles.tabs}>
          <TabPillNeon
            active={window.location.pathname.includes('/stocks')}
            onClick={() => handleTabClick('stocks')}
            children="Stocks"
          />
          <TabPillNeon
            active={window.location.pathname.includes('/crypto')}
            onClick={() => handleTabClick('crypto')}
            children="Crypto"
          />
        </div>
        {loading ? (
          <div className={styles.loader}>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </div>
        ) : (
          <div className={styles.content}>
            <h2 className={styles.subtitle}>Stocks</h2>
            <ul className={styles.list}>
              {filteredStocks.map((stock) => (
                <li key={stock.symbol} className={styles.item}>
                  <img src="" alt={stock.symbol} className={styles.logo} />
                  <span className={styles.price}>{stock.price}</span>
                  <span className={styles.percent}>
                    <span className={styles.badge} style={{ backgroundColor: stock.percent > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {stock.percent > 0 ? '+' : '-'}{stock.percent}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <h2 className={styles.subtitle}>Crypto</h2>
            <ul className={styles.list}>
              {filteredCrypto.map((coin) => (
                <li key={coin.symbol} className={styles.item}>
                  <span className={styles.symbol}>{coin.symbol}</span>
                  <span className={styles.price}>{coin.price}</span>
                  <span className={styles.percent}>
                    <span className={styles.badge} style={{ backgroundColor: coin.percent > 0 ? 'var(--green)' : 'var(--red)' }}>
                      {coin.percent > 0 ? '+' : '-'}{coin.percent}%
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
};

export default Markets;
```

**src/styles/markets.module.css**
```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: var(--bg2);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.title {
  font-size: 2rem;
  font-weight: bold;
  color: var(--t1);
}

.search {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  width: 100%;
  max-width: 300px;
  font-size: 1rem;
  font-weight: bold;
  color: var(--t1);
}

.main {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.tab-pill-neon {
  ${TabPillNeon.styles.tabPillNeon}
}

.tab-pill-neon.active {
  ${TabPillNeon.styles.active}
}

.pill-neon {
  ${TabPillNeon.styles.pillNeon}
}

.pill-text {
  ${TabPillNeon.styles.pillText}
}

.loader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
}

.skeleton {
  width: 100px;
  height: 20px;
  background-color: var(--bg);
  border-radius: 0.5rem;
  margin: 0 10px;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.subtitle {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--t1);
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.logo {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: var(--bg);
  margin-right: 10px;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--t1);
}

.percent {
  display: flex;
  align-items: center;
  margin-left: 10px;
}

.badge {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 1rem;
  font-weight: bold;
  color: var(--t1);
}
```

**src/api/crypto-prices.js**
```js
import axios from 'axios';

const getCryptoPrices = async () => {
  const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false');
  return response.data;
};

export default getCryptoPrices;
```

**src/api/crypto-prices.json**
```json
[
  {
    "id": "bitcoin",
    "symbol": "BTC",
    "name": "Bitcoin",
    "image": "https://assets.coingecko.com/coins/images/1/large/bitcoin.png?1547033579",
    "current_price": 45000,
    "market_cap": 850000000000,
    "market_cap_rank": 1,
    "fully_diluted_valuation": 1000000000000,
    "total_volume": 20000000000,
    "high_24h": 46000,
    "low_24h": 44000,
    "price_change_24h": 1000,
    "price_change_percentage_24h": 2.22,
    "market_cap_change_24h": 100000000000,
    "market_cap_change_percentage_24h": 11.11,
    "circulating_supply": 18000000,
    "total_supply": 21000000,
    "max_supply": 21000000,
    "ath": 69000,
    "ath_change_percentage": -35.14,
    "ath_date": "2021-11-10T14:24:11.849Z",
    "atl": 67,
    "atl_change_percentage": 66666.67,
    "atl_date": "2013-04-06T00:00:00.000Z",
    "roi": {
      "times": 1000000,
      "currency": "usd",
      "percentage": 1000000
    },
    "last_updated": "2023-02-20T14:24:11.849Z"
  },
  {
    "id": "ethereum",
    "symbol": "ETH",
    "name": "Ethereum",
    "image": "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1595348880",
    "current_price": 3000,
    "market_cap": 500000000000,
    "market_cap_rank": 2,
    "fully_diluted_valuation": 1000000000000,
    "total_volume": 10000000000,
    "high_24h": 3200,
    "low_24h": 2800,
    "price_change_24h": 200,
    "price_change_percentage_24h": 6.67,
    "market_cap_change_24h": 100000000000,
    "market_cap_change_percentage_24h": 11.11,
    "circulating_supply": 17000000,
    "total_supply": 21000000,
    "max_supply": 21000000,
    "ath": 4800,
    "ath_change_percentage": -37.5,
    "ath_date": "2021-11-16T14:24:11.849Z",
    "atl": 0.432,
    "atl_change_percentage": 600000,
    "atl_date": "2015-12-04T00:00:00.000Z",
    "roi": {
      "times": 1000000,
      "currency": "usd",
      "percentage": 1000000
    },
    "last_updated": "2023-02-20T14:24:11.849Z"
  }
]