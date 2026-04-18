**src/pages/Markets.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Tab, Tabs } from 'lucide-react';
import MarketTab from '../components/MarketTab';
import { supabase } from '../utils/supabase';
import { getStocks, getCryptoPrices } from '../utils/api';

const Markets = () => {
  const location = useLocation();
  const [stocks, setStocks] = useState([]);
  const [cryptoPrices, setCryptoPrices] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      const response = await getStocks();
      setStocks(response.data);
      setLoading(false);
    };
    fetchStocks();
  }, []);

  useEffect(() => {
    const fetchCryptoPrices = async () => {
      const response = await getCryptoPrices();
      setCryptoPrices(response.data);
      setLoading(false);
    };
    fetchCryptoPrices();
  }, []);

  const handleSearch = (query) => {
    const filteredStocks = stocks.filter((stock) =>
      stock.name.toLowerCase().includes(query.toLowerCase())
    );
    return filteredStocks;
  };

  return (
    <div className="bg bg2 h-screen">
      <header className="bg bg2 py-4">
        <h1 className="text-3xl font-bold text-t1">Markets</h1>
        <div className="flex justify-between items-center">
          <Link to="/markets/stocks">
            <Tab size={24} color="--green" className="mr-4" />
          </Link>
          <Link to="/markets/crypto">
            <Tab size={24} color="--green" className="ml-4" />
          </Link>
        </div>
      </header>
      <main className="p-4">
        <div className="bg bg2 p-4 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-t1 mb-4">
            {location.pathname.includes('/stocks') ? 'Stocks' : 'Crypto'}
          </h2>
          <div className="flex justify-between items-center mb-4">
            <input
              type="search"
              placeholder="Search"
              className="bg bg2 p-2 rounded-lg w-full"
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-screen">
              <div className="animate-spin rounded-full h-10 w-10 bg bg2" />
            </div>
          ) : (
            <div>
              {location.pathname.includes('/stocks') ? (
                <MarketTab
                  stocks={handleSearch('')}
                  cryptoPrices={cryptoPrices}
                />
              ) : (
                <MarketTab
                  stocks={stocks}
                  cryptoPrices={cryptoPrices}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Markets;
```

**src/components/MarketTab.tsx**
```tsx
import React from 'react';
import { Tab, Tabs } from 'lucide-react';
import { supabase } from '../utils/supabase';
import { getStocks, getCryptoPrices } from '../utils/api';

interface MarketTabProps {
  stocks: any[];
  cryptoPrices: any;
}

const MarketTab = ({ stocks, cryptoPrices }: MarketTabProps) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {stocks.map((stock) => (
        <div key={stock.symbol} className="bg bg2 p-4 rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-t1">{stock.name}</h2>
            <span
              className={`bg ${stock.priceChange > 0 ? '--green' : '--red'} p-2 rounded-lg text-t1`}
            >
              {stock.priceChange > 0 ? '+' : '-'}{stock.priceChange}%
            </span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-t2">{stock.price}</span>
            <span className="text-lg text-t2">{stock.volume}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-t2">{stock.marketCap}</span>
            <span className="text-lg text-t2">{stock.dividendYield}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-t2">{stock.peRatio}</span>
            <span className="text-lg text-t2">{stock.pbRatio}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-t2">{stock.dividendPayDate}</span>
            <span className="text-lg text-t2">{stock.exDividendDate}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-t2">{stock.nextEarningsDate}</span>
            <span className="text-lg text-t2">{stock.nextEarningsEstimate}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-t2">{stock.nextEarningsSurprise}</span>
            <span className="text-lg text-t2">{stock.nextEarningsSurprisePercent}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg text-t2">{stock.nextEarningsSurpriseDate}</span>
            <span className="text-lg text-t2">{stock.nextEarningsSurprisePercent}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MarketTab;
```

**src/utils/api.ts**
```tsx
import axios from 'axios';

const getStocks = async () => {
  const response = await axios.get('https://api.example.com/stocks');
  return response.data;
};

const getCryptoPrices = async () => {
  const response = await axios.get('https://api.example.com/crypto-prices');
  return response.data;
};

export { getStocks, getCryptoPrices };
```

**src/utils/supabase.ts**
```tsx
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://example.supabase.co';
const supabaseKey = 'YOUR_API_KEY';
const supabaseSecret = 'YOUR_API_SECRET';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

**src/styles/globals.css**
```css
:root {
  --green: #00ff88;
  --red: #ff0000;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.bg {
  background-color: var(--bg2);
}

.bg2 {
  background-color: var(--bg);
}

.text-t1 {
  color: var(--t1);
}

.text-t2 {
  color: var(--t2);
}

.text-t3 {
  color: var(--t3);
}

.border {
  border: 1px solid var(--border);
}
```
Notez que vous devrez remplacer les URL et les clés API par vos propres valeurs.