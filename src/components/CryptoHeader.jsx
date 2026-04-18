**src/pages/CryptoTrader.jsx**

```jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import CryptoHeader from './CryptoHeader';
import CryptoOrderbook from './CryptoOrderbook';
import CryptoPositions from './CryptoPositions';

function CryptoTrader() {
  const [coins, setCoins] = useState({
    btc: { price: 0, variation: 0 },
    eth: { price: 0, variation: 0 },
    sol: { price: 0, variation: 0 },
  });
  const [portfolio, setPortfolio] = useState({
    btc: { quantity: 0, price: 0, pl: 0 },
    eth: { quantity: 0, price: 0, pl: 0 },
    sol: { quantity: 0, price: 0, pl: 0 },
  });
  const [positions, setPositions] = useState([
    { coin: 'BTC', quantity: 10, price: 40000, pl: 2000 },
    { coin: 'ETH', quantity: 20, price: 2000, pl: -400 },
    { coin: 'SOL', quantity: 30, price: 50, pl: 1500 },
  ]);

  useEffect(() => {
    const fetchCoins = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin%2Cethereum%2Csolana&vs_currencies=usd');
      const data = await response.json();
      setCoins({
        btc: { price: data.bitcoin.usd, variation: Math.random() * 10 - 5 },
        eth: { price: data.ethereum.usd, variation: Math.random() * 10 - 5 },
        sol: { price: data.solana.usd, variation: Math.random() * 10 - 5 },
      });
    };
    fetchCoins();
    const interval = setInterval(fetchCoins, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculatePortfolio = () => {
      const btc = positions.find((position) => position.coin === 'BTC');
      const eth = positions.find((position) => position.coin === 'ETH');
      const sol = positions.find((position) => position.coin === 'SOL');
      setPortfolio({
        btc: {
          quantity: btc ? btc.quantity : 0,
          price: btc ? btc.price : 0,
          pl: btc ? btc.pl : 0,
        },
        eth: {
          quantity: eth ? eth.quantity : 0,
          price: eth ? eth.price : 0,
          pl: eth ? eth.pl : 0,
        },
        sol: {
          quantity: sol ? sol.quantity : 0,
          price: sol ? sol.price : 0,
          pl: sol ? sol.pl : 0,
        },
      });
    };
    calculatePortfolio();
  }, [positions]);

  return (
    <div className="container">
      <CryptoHeader coins={coins} />
      <div className="tabs">
        <Link to="/cryptotrader/market">Marché</Link>
        <Link to="/cryptotrader/positions">Positions</Link>
        <Link to="/cryptotrader/history">Historique</Link>
      </div>
      <Outlet />
      <CryptoOrderbook />
      <CryptoPositions positions={positions} portfolio={portfolio} />
    </div>
  );
}

export default CryptoTrader;
```

**src/components/CryptoHeader.jsx**

```jsx
import React from 'react';
import { Link } from 'react-router-dom';

function CryptoHeader({ coins }) {
  return (
    <header className="crypto-header">
      <div className="coin-prices">
        <div className="coin-price">
          <span className="coin-symbol">BTC</span>
          <span className="coin-price-value">${coins.btc.price}</span>
          <span className="coin-variation">{coins.btc.variation > 0 ? '+' : ''}{coins.btc.variation}%</span>
        </div>
        <div className="coin-price">
          <span className="coin-symbol">ETH</span>
          <span className="coin-price-value">${coins.eth.price}</span>
          <span className="coin-variation">{coins.eth.variation > 0 ? '+' : ''}{coins.eth.variation}%</span>
        </div>
        <div className="coin-price">
          <span className="coin-symbol">SOL</span>
          <span className="coin-price-value">${coins.sol.price}</span>
          <span className="coin-variation">{coins.sol.variation > 0 ? '+' : ''}{coins.sol.variation}%</span>
        </div>
      </div>
      <div className="portfolio-value">
        <span className="portfolio-value-label">Portfolio:</span>
        <span className="portfolio-value-value">${coins.btc.price * positions.btc.quantity + coins.eth.price * positions.eth.quantity + coins.sol.price * positions.sol.quantity}</span>
      </div>
    </header>
  );
}

export default CryptoHeader;
```

**src/components/CryptoOrderbook.jsx**

```jsx
import React from 'react';

function CryptoOrderbook() {
  const bids = [
    { price: 40000, quantity: 100 },
    { price: 39900, quantity: 200 },
    { price: 39800, quantity: 300 },
    { price: 39700, quantity: 400 },
    { price: 39600, quantity: 500 },
    { price: 39500, quantity: 600 },
    { price: 39400, quantity: 700 },
    { price: 39300, quantity: 800 },
  ];

  const asks = [
    { price: 39000, quantity: 100 },
    { price: 39100, quantity: 200 },
    { price: 39200, quantity: 300 },
    { price: 39300, quantity: 400 },
    { price: 39400, quantity: 500 },
    { price: 39500, quantity: 600 },
    { price: 39600, quantity: 700 },
    { price: 39700, quantity: 800 },
  ];

  return (
    <div className="orderbook">
      <div className="orderbook-header">
        <span className="orderbook-header-label">Bids</span>
        <span className="orderbook-header-label">Asks</span>
      </div>
      <div className="orderbook-body">
        {bids.map((bid, index) => (
          <div key={index} className="orderbook-row">
            <span className="orderbook-row-price">${bid.price}</span>
            <span className="orderbook-row-quantity">{bid.quantity}</span>
          </div>
        ))}
        {asks.map((ask, index) => (
          <div key={index} className="orderbook-row">
            <span className="orderbook-row-price">${ask.price}</span>
            <span className="orderbook-row-quantity">{ask.quantity}</span>
          </div>
        ))}
      </div>
      <div className="orderbook-footer">
        <span className="orderbook-footer-label">Spread:</span>
        <span className="orderbook-footer-value">${Math.abs(bids[0].price - asks[0].price)}</span>
      </div>
    </div>
  );
}

export default CryptoOrderbook;
```

**src/components/CryptoPositions.jsx**

```jsx
import React from 'react';

function CryptoPositions({ positions, portfolio }) {
  return (
    <div className="positions">
      {positions.map((position, index) => (
        <div key={index} className="position">
          <span className="position-coin">{position.coin}</span>
          <span className="position-quantity">{position.quantity}</span>
          <span className="position-entry-price">${position.price}</span>
          <span className="position-current-price">${portfolio[position.coin].price}</span>
          <span className="position-pl">${portfolio[position.coin].pl}</span>
          <span className="position-pl-percentage">{portfolio[position.coin].pl > 0 ? '+' : ''}{portfolio[position.coin].pl}%</span>
        </div>
      ))}
    </div>
  );
}

export default CryptoPositions;
```

**styles**

```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.crypto-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: var(--bg2);
  color: var(--t2);
}

.coin-prices {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.coin-price {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 30%;
}

.coin-symbol {
  font-size: 18px;
  font-weight: bold;
}

.coin-price-value {
  font-size: 24px;
  font-weight: bold;
}

.coin-variation {
  font-size: 16px;
  color: var(--t3);
}

.portfolio-value {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.portfolio-value-label {
  font-size: 18px;
  font-weight: bold;
}

.portfolio-value-value {
  font-size: 24px;
  font-weight: bold;
}

.orderbook {
  padding: 20px;
  background-color: var(--bg2);
  color: var(--t2);
}

.orderbook-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--bg3);
  color: var(--t3);
}

.orderbook-header-label {
  font-size: 16px;
  font-weight: bold;
}

.orderbook-body {
  padding: 10px;
  background-color: var(--bg3);
  color: var(--t3);
}

.orderbook-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.orderbook-row-price {
  font-size: 16px;
  font-weight: bold;
}

.orderbook-row-quantity {
  font-size: 16px;
}

.orderbook-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--bg3);
  color: var(--t3);
}

.orderbook-footer-label {
  font-size: 16px;
  font-weight: bold;
}

.orderbook-footer-value {
  font-size: 16px;
}

.positions {
  padding: 20px;
  background-color: var(--bg2);
  color: var(--t2);
}

.position {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.position-coin {
  font-size: 16px;
  font-weight: bold;
}

.position-quantity {
  font-size: 16px;
}

.position-entry-price {
  font-size: 16px;
}

.position-current-price {
  font-size: 16px;
}

.position-pl {
  font-size: 16px;
}

.position-pl-percentage {
  font-size: 16px;
  color: var(--t3);
}
```

**package.json**

```json
{
  "name": "trackr",
  "version": "1.0.0",
  "scripts": {
    "start": "vite"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "lucide-react": "^0.3.0"
  },
  "devDependencies": {
    "@supabase/supabase-js": "^1.34.1",
    "vite": "^4.1.0"
  }
}
```

**Note**: Ce code est une implémentation de base et peut nécessiter des ajustements pour fonctionner correctement dans votre environnement de développement.