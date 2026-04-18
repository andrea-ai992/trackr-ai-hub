**src/pages/CryptoTrader.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../api/supabase';
import { Inter } from '@fontsource/inter';
import { useTheme } from '../hooks/useTheme';

const CryptoTrader = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [data, setData] = useState({
    prices: {
      BTC: 0,
      ETH: 0,
      SOL: 0,
    },
    variations: {
      BTC: 0,
      ETH: 0,
      SOL: 0,
    },
    portfolio: {
      total: 0,
    },
    orderbook: {
      bids: [],
      asks: [],
    },
    positions: [
      {
        symbol: 'BTC',
        entryPrice: 40000,
        currentPrice: 42000,
        pl: 1000,
        plPct: 2.5,
      },
      {
        symbol: 'ETH',
        entryPrice: 1500,
        currentPrice: 1450,
        pl: -50,
        plPct: -3.33,
      },
      {
        symbol: 'SOL',
        entryPrice: 50,
        currentPrice: 56,
        pl: 600,
        plPct: 12,
      },
    ],
  });

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
      const data = await response.json();
      setData((prevData) => ({
        ...prevData,
        prices: {
          BTC: data.bitcoin.usd,
          ETH: data.ethereum.usd,
          SOL: data.solana.usd,
        },
      }));
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1');
      const data = await response.json();
      setData((prevData) => ({
        ...prevData,
        variations: {
          BTC: data.prices[0][1] - data.prices[0][0],
        },
      }));
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=1');
      const data = await response.json();
      setData((prevData) => ({
        ...prevData,
        variations: {
          ETH: data.prices[0][1] - data.prices[0][0],
        },
      }));
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/solana/market_chart?vs_currency=usd&days=1');
      const data = await response.json();
      setData((prevData) => ({
        ...prevData,
        variations: {
          SOL: data.prices[0][1] - data.prices[0][0],
        },
      }));
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
      const data = await response.json();
      const portfolio = data.bitcoin.usd + data.ethereum.usd + data.solana.usd;
      setData((prevData) => ({
        ...prevData,
        portfolio: {
          total: portfolio,
        },
      }));
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=1');
      const data = await response.json();
      const bids = [];
      const asks = [];
      for (let i = 0; i < 8; i++) {
        bids.push({
          price: data.prices[i][0],
          volume: data.prices[i][1],
        });
        asks.push({
          price: data.prices[i][0] + 100,
          volume: data.prices[i][1],
        });
      }
      setData((prevData) => ({
        ...prevData,
        orderbook: {
          bids,
          asks,
        },
      }));
    }, 10000);

    return () => clearInterval(intervalId);
  }, []);

  const handleBuy = () => {
    // Simule une transaction
    const newPositions = data.positions.map((position) => {
      if (position.symbol === 'BTC') {
        return {
          ...position,
          entryPrice: 42000,
          currentPrice: 42000,
          pl: 0,
          plPct: 0,
        };
      }
      return position;
    });
    setData((prevData) => ({
      ...prevData,
      positions: newPositions,
    }));
  };

  const handleSell = () => {
    // Simule une transaction
    const newPositions = data.positions.map((position) => {
      if (position.symbol === 'BTC') {
        return {
          ...position,
          entryPrice: 40000,
          currentPrice: 42000,
          pl: -1000,
          plPct: -2.5,
        };
      }
      return position;
    });
    setData((prevData) => ({
      ...prevData,
      positions: newPositions,
    }));
  };

  return (
    <div className={`container ${theme}`}>
      <header className="header">
        <h1>Crypto Trader</h1>
      </header>
      <main className="main">
        <section className="section">
          <h2>Prix en temps réel</h2>
          <ul>
            <li>
              <span>BTC: {data.prices.BTC}</span>
              <span style={{ color: data.variations.BTC > 0 ? 'green' : 'red' }}>
                {data.variations.BTC > 0 ? '+' : '-'}
                {data.variations.BTC.toFixed(2)}%
              </span>
            </li>
            <li>
              <span>ETH: {data.prices.ETH}</span>
              <span style={{ color: data.variations.ETH > 0 ? 'green' : 'red' }}>
                {data.variations.ETH > 0 ? '+' : '-'}
                {data.variations.ETH.toFixed(2)}%
              </span>
            </li>
            <li>
              <span>SOL: {data.prices.SOL}</span>
              <span style={{ color: data.variations.SOL > 0 ? 'green' : 'red' }}>
                {data.variations.SOL > 0 ? '+' : '-'}
                {data.variations.SOL.toFixed(2)}%
              </span>
            </li>
          </ul>
          <p>Total portfolio: {data.portfolio.total}</p>
        </section>
        <section className="section">
          <h2>Orderbook</h2>
          <ul>
            <li>
              <span>Bids:</span>
              <ul>
                {data.orderbook.bids.map((bid, index) => (
                  <li key={index}>
                    <span>{bid.price}</span>
                    <span>{bid.volume}</span>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <span>Asks:</span>
              <ul>
                {data.orderbook.asks.map((ask, index) => (
                  <li key={index}>
                    <span>{ask.price}</span>
                    <span>{ask.volume}</span>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
          <p>Spread: {data.orderbook.bids[0].price - data.orderbook.asks[0].price}</p>
        </section>
        <section className="section">
          <h2>Positions</h2>
          <ul>
            {data.positions.map((position, index) => (
              <li key={index}>
                <span>{position.symbol}</span>
                <span>Entry price: {position.entryPrice}</span>
                <span>Current price: {position.currentPrice}</span>
                <span style={{ color: position.plPct > 0 ? 'green' : 'red' }}>
                  {position.plPct > 0 ? '+' : '-'}
                  {position.plPct.toFixed(2)}%
                </span>
                <span>P&L: {position.pl}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="section">
          <h2>Actions</h2>
          <button onClick={handleBuy}>BUY</button>
          <button onClick={handleSell}>SELL</button>
        </section>
        <section className="section">
          <h2>Tabs</h2>
          <ul>
            <li>
              <Link to="/crypto/trader/market">Marché</Link>
            </li>
            <li>
              <Link to="/crypto/trader/positions">Positions</Link>
            </li>
            <li>
              <Link to="/crypto/trader/history">Historique</Link>
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default CryptoTrader;
```

**src/api/crypto.js**
```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.coingecko.com/api/v3/',
});

const getPrices = async () => {
  const response = await api.get('simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
  return response.data;
};

const getVariations = async () => {
  const response = await api.get('coins/bitcoin/market_chart?vs_currency=usd&days=1');
  return response.data.prices[0][1] - response.data.prices[0][0];
};

const getOrderbook = async () => {
  const response = await api.get('coins/bitcoin/market_chart?vs_currency=usd&days=1');
  const bids = [];
  const asks = [];
  for (let i = 0; i < 8; i++) {
    bids.push({
      price: response.data.prices[i][0],
      volume: response.data.prices[i][1],
    });
    asks.push({
      price: response.data.prices[i][0] + 100,
      volume: response.data.prices[i][1],
    });
  }
  return { bids, asks };
};

const getPortfolio = async () => {
  const response = await api.get('simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
  return response.data.bitcoin.usd + response.data.ethereum.usd + response.data.solana.usd;
};

export { getPrices, getVariations, getOrderbook, getPortfolio };
```

**src/components/Orderbook.js**
```jsx
import React from 'react';

const Orderbook = ({ bids, asks }) => {
  return (
    <div>
      <h2>Orderbook</h2>
      <ul>
        {bids.map((bid, index) => (
          <li key={index}>
            <span>{bid.price}</span>
            <span>{bid.volume}</span>
          </li>
        ))}
      </ul>
      <ul>
        {asks.map((ask, index) => (
          <li key={index}>
            <span>{ask.price}</span>
            <span>{ask.volume}</span>
          </li>
        ))}
      </ul>
      <p>Spread: {bids[0].price - asks[0].price}</p>
    </div>
  );
};

export default Orderbook;
```

**src/components/Positions.js**
```jsx
import React from 'react';

const Positions = ({ positions }) => {
  return (
    <div>
      <h2>Positions</h2>
      <ul>
        {positions.map((position, index) => (
          <li key={index}>
            <span>{position.symbol}</span>
            <span>Entry price: {position.entryPrice}</span>
            <span>Current price: {position.currentPrice}</span>
            <span style={{ color: position.plPct > 0 ? 'green' : 'red' }}>
              {position.plPct > 0 ? '+' : '-'}
              {position.plPct.toFixed(2)}%
            </span>
            <span>P&L: {position.pl}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Positions;
```

**src/components/Tabs.js**
```jsx
import React from 'react';

const Tabs = ({ tabs }) => {
  return (
    <div>
      <h2>Tabs</h2>
      <ul>
        {tabs.map((tab, index) => (
          <li key={index}>
            <Link to={tab.link}>{tab.label}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Tabs;