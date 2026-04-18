**src/api/cryptoApi.js**
```javascript
import axios from 'axios';

const cryptoApi = {
  async getPrices() {
    const response = await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
    return response.data;
  },
};

export default cryptoApi;
```

**src/pages/CryptoTrader.jsx**
```javascript
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaBitcoin, FaEthereum, FaSolana } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [prices, setPrices] = useState({});
  const [orderbook, setOrderbook] = useState({
    bids: [],
    asks: [],
  });
  const [positions, setPositions] = useState([
    {
      symbol: 'BTC',
      entryPrice: 40000,
      currentPrice: 42000,
      pnl: 0.05,
    },
    {
      symbol: 'ETH',
      entryPrice: 2000,
      currentPrice: 2200,
      pnl: 0.1,
    },
    {
      symbol: 'SOL',
      entryPrice: 50,
      currentPrice: 55,
      pnl: 0.1,
    },
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      const data = await cryptoApi.getPrices();
      setPrices(data);
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const generateOrderbook = () => {
      const bids = Array.from({ length: 10 }, (_, i) => ({
        price: 40000 - (i * 100),
        amount: 0.1,
      }));
      const asks = Array.from({ length: 10 }, (_, i) => ({
        price: 40000 + (i * 100),
        amount: 0.1,
      }));
      setOrderbook({ bids, asks });
    };
    generateOrderbook();
  }, []);

  const handleBuy = () => {
    // Simulate buy order
    const newPositions = [...positions];
    newPositions.push({
      symbol: 'BTC',
      entryPrice: 40000,
      currentPrice: 42000,
      pnl: 0.05,
    });
    setPositions(newPositions);
  };

  const handleSell = () => {
    // Simulate sell order
    const newPositions = [...positions];
    newPositions[0].currentPrice = 38000;
    newPositions[0].pnl = -0.05;
    setPositions(newPositions);
  };

  return (
    <div className="flex flex-col h-screen p-4">
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text--t1">Crypto Trader</h1>
        <Link to="/andy" className="text--t2 hover:text--green">
          <FaBitcoin className="mr-2" />
          Andy
        </Link>
      </header>
      <main className="flex-1 overflow-y-auto">
        <section className="flex justify-between mb-4">
          <div className="flex flex-col items-start">
            <h2 className="text-lg font-bold text--t1">Prices</h2>
            <ul className="flex flex-col">
              <li className="flex items-center mb-2">
                <FaBitcoin className="mr-2" />
                <span className="text--t2">{prices.bitcoin.usd}</span>
                <span className="text--t2 ml-2">
                  {prices.bitcoin.usd > prices.bitcoin.yesterday ? (
                    <span className="text--green">+</span>
                  ) : (
                    <span className="text--red">-</span>
                  )}
                  {prices.bitcoin.usd > prices.bitcoin.yesterday
                    ? prices.bitcoin.usd - prices.bitcoin.yesterday
                    : prices.bitcoin.yesterday - prices.bitcoin.usd}
                  %</span>
              </li>
              <li className="flex items-center mb-2">
                <FaEthereum className="mr-2" />
                <span className="text--t2">{prices.ethereum.usd}</span>
                <span className="text--t2 ml-2">
                  {prices.ethereum.usd > prices.ethereum.yesterday ? (
                    <span className="text--green">+</span>
                  ) : (
                    <span className="text--red">-</span>
                  )}
                  {prices.ethereum.usd > prices.ethereum.yesterday
                    ? prices.ethereum.usd - prices.ethereum.yesterday
                    : prices.ethereum.yesterday - prices.ethereum.usd}
                  %</span>
              </li>
              <li className="flex items-center mb-2">
                <FaSolana className="mr-2" />
                <span className="text--t2">{prices.solana.usd}</span>
                <span className="text--t2 ml-2">
                  {prices.solana.usd > prices.solana.yesterday ? (
                    <span className="text--green">+</span>
                  ) : (
                    <span className="text--red">-</span>
                  )}
                  {prices.solana.usd > prices.solana.yesterday
                    ? prices.solana.usd - prices.solana.yesterday
                    : prices.solana.yesterday - prices.solana.usd}
                  %</span>
              </li>
            </ul>
          </div>
          <div className="flex flex-col items-end">
            <h2 className="text-lg font-bold text--t1">Orderbook</h2>
            <ul className="flex flex-col">
              <li className="flex items-center mb-2">
                <span className="text--t2">Bids:</span>
                <ul className="flex flex-col ml-2">
                  {orderbook.bids.map((bid, index) => (
                    <li key={index} className="flex items-center mb-2">
                      <span className="text--t2">{bid.price}</span>
                      <span className="text--t2 ml-2">{bid.amount}</span>
                    </li>
                  ))}
                </ul>
              </li>
              <li className="flex items-center mb-2">
                <span className="text--t2">Asks:</span>
                <ul className="flex flex-col ml-2">
                  {orderbook.asks.map((ask, index) => (
                    <li key={index} className="flex items-center mb-2">
                      <span className="text--t2">{ask.price}</span>
                      <span className="text--t2 ml-2">{ask.amount}</span>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </div>
        </section>
        <section className="flex flex-col mb-4">
          <h2 className="text-lg font-bold text--t1">Positions</h2>
          <ul className="flex flex-col">
            {positions.map((position, index) => (
              <li key={index} className="flex items-center mb-2">
                <span className="text--t2">{position.symbol}</span>
                <span className="text--t2 ml-2">{position.entryPrice}</span>
                <span className="text--t2 ml-2">{position.currentPrice}</span>
                <span className="text--t2 ml-2">
                  {position.pnl > 0 ? (
                    <span className="text--green">+</span>
                  ) : (
                    <span className="text--red">-</span>
                  )}
                  {position.pnl > 0 ? position.pnl : -position.pnl}%
                </span>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex justify-between mb-4">
          <button className="bg--bg2 hover:bg--bg text--t1 font-bold py-2 px-4 rounded">
            Buy
          </button>
          <button className="bg--bg2 hover:bg--bg text--t1 font-bold py-2 px-4 rounded">
            Sell
          </button>
        </section>
      </main>
    </div>
  );
};

export default CryptoTrader;
```

**src/styles/globals.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #444;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

h1, h2, h3, h4, h5, h6 {
  color: var(--t1);
}

a {
  color: var(--green);
  text-decoration: none;
}

a:hover {
  color: var(--t1);
}

button {
  background-color: var(--bg2);
  color: var(--t1);
  border: none;
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

button:hover {
  background-color: var(--bg);
}

ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

li {
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

li:last-child {
  border-bottom: none;
}

.flex {
  display: flex;
}

.flex-col {
  flex-direction: column;
}

.items-start {
  justify-content: flex-start;
}

.items-end {
  justify-content: flex-end;
}

.items-center {
  justify-content: center;
}

.mb-4 {
  margin-bottom: 16px;
}

.ml-2 {
  margin-left: 8px;
}

.mr-2 {
  margin-right: 8px;
}

.text--t1 {
  color: var(--t1);
}

.text--t2 {
  color: var(--t2);
}

.text--t3 {
  color: var(--t3);
}

.text--green {
  color: var(--green);
}

.text--red {
  color: var(--red);
}
```

**src/styles/variables.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #444;
  --border: rgba(255, 255, 255, 0.07);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}