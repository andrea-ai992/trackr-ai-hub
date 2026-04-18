**src/api/stockApi.js**
```javascript
import axios from 'axios';
import { supabaseUrl, supabaseKey } from '../config';

const stockApi = axios.create({
  baseURL: `${supabaseUrl}/stock`,
  headers: {
    'Content-Type': 'application/json',
    'X-API-KEY': supabaseKey,
  },
});

const getStocks = async () => {
  try {
    const response = await stockApi.get('/all');
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getStock = async (symbol) => {
  try {
    const response = await stockApi.get(`/${symbol}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getStocksByCategory = async (category) => {
  try {
    const response = await stockApi.get(`/${category}`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { getStocks, getStock, getStocksByCategory };
```

**src/config.js**
```javascript
export const supabaseUrl = 'https://your-supabase-url.supabase.co';
export const supabaseKey = 'your-supabase-key';
```

**src/pages/Markets/Stocks.jsx**
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabaseUrl, supabaseKey } from '../config';
import { getStocks } from '../api/stockApi';
import styles from './Stocks.module.css';

const Stocks = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const data = await getStocks();
        setStocks(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Stocks</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <ul className={styles.list}>
          {stocks.map((stock) => (
            <li key={stock.symbol} className={styles.item}>
              <h2 className={styles.symbol}>{stock.symbol}</h2>
              <p className={styles.name}>{stock.name}</p>
              <p className={styles.price}>{stock.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Stocks;
```

**src/pages/Markets/Crypto.jsx**
```javascript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { supabaseUrl, supabaseKey } from '../config';
import { getStocks } from '../api/stockApi';
import styles from './Crypto.module.css';

const Crypto = () => {
  const [crypto, setCrypto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        const data = await getStocks('crypto');
        setCrypto(data);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };
    fetchCrypto();
  }, []);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Crypto</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error: {error.message}</p>
      ) : (
        <ul className={styles.list}>
          {crypto.map((item) => (
            <li key={item.symbol} className={styles.item}>
              <h2 className={styles.symbol}>{item.symbol}</h2>
              <p className={styles.name}>{item.name}</p>
              <p className={styles.price}>{item.price}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Crypto;
```

**src/pages/Markets/Stocks.module.css**
```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.symbol {
  font-size: 18px;
  font-weight: bold;
}

.name {
  font-size: 16px;
  color: var(--t2);
}

.price {
  font-size: 16px;
  color: var(--t3);
}
```

**src/pages/Markets/Crypto.module.css**
```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.title {
  font-size: 24px;
  margin-bottom: 20px;
}

.list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}

.symbol {
  font-size: 18px;
  font-weight: bold;
}

.name {
  font-size: 16px;
  color: var(--t2);
}

.price {
  font-size: 16px;
  color: var(--t3);
}