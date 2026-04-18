**src/pages/CryptoTrader.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CryptoPrice from '../components/CryptoPrice';
import Orderbook from '../components/Orderbook';
import Positions from '../components/Positions';
import { supabase } from '../supabase';

const CryptoTrader = () => {
  const [prices, setPrices] = useState({
    btc: { price: 0, variation: 0 },
    eth: { price: 0, variation: 0 },
    sol: { price: 0, variation: 0 },
  });

  const [orderbook, setOrderbook] = useState({
    bids: [],
    asks: [],
  });

  const [positions, setPositions] = useState([
    {
      symbol: 'BTC',
      entryPrice: 40000,
      currentPrice: 42000,
      profitLoss: 4.5,
    },
    {
      symbol: 'ETH',
      entryPrice: 2000,
      currentPrice: 2200,
      profitLoss: 10,
    },
    {
      symbol: 'SOL',
      entryPrice: 50,
      currentPrice: 55,
      profitLoss: 10,
    },
  ]);

  useEffect(() => {
    const fetchPrices = async () => {
      const response = await fetch('https://api.coingecko.com/api/v3/coins/markets?ids=bitcoin%2Cethereum%2Csolana&vs_currency=usd');
      const data = await response.json();
      setPrices({
        btc: { price: data[0].current_price, variation: data[0].price_change_percentage_24h },
        eth: { price: data[1].current_price, variation: data[1].price_change_percentage_24h },
        sol: { price: data[2].current_price, variation: data[2].price_change_percentage_24h },
      });
    };
    fetchPrices();
  }, []);

  useEffect(() => {
    const generateOrderbook = () => {
      const bids = [
        { price: 40000, quantity: 10 },
        { price: 39000, quantity: 20 },
        { price: 38000, quantity: 30 },
      ];
      const asks = [
        { price: 42000, quantity: 10 },
        { price: 43000, quantity: 20 },
        { price: 44000, quantity: 30 },
      ];
      setOrderbook({ bids, asks });
    };
    generateOrderbook();
  }, []);

  const handleBuy = () => {
    // Simuler une transaction
    const newPositions = [...positions];
    newPositions.push({
      symbol: 'BTC',
      entryPrice: 42000,
      currentPrice: 42000,
      profitLoss: 0,
    });
    setPositions(newPositions);
  };

  const handleSell = () => {
    // Simuler une transaction
    const newPositions = [...positions];
    newPositions[0].currentPrice = 38000;
    newPositions[0].profitLoss = -10;
    setPositions(newPositions);
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Crypto Trader</h1>
        <div className="prices">
          <CryptoPrice price={prices.btc.price} variation={prices.btc.variation} symbol="BTC" />
          <CryptoPrice price={prices.eth.price} variation={prices.eth.variation} symbol="ETH" />
          <CryptoPrice price={prices.sol.price} variation={prices.sol.variation} symbol="SOL" />
        </div>
      </div>
      <div className="orderbook">
        <Orderbook bids={orderbook.bids} asks={orderbook.asks} />
      </div>
      <div className="positions">
        <Positions positions={positions} />
      </div>
      <div className="buttons">
        <button onClick={handleBuy}>Buy</button>
        <button onClick={handleSell}>Sell</button>
      </div>
    </div>
  );
};

export default CryptoTrader;
```

**src/components/CryptoPrice.js**
```jsx
import React from 'react';

const CryptoPrice = ({ price, variation, symbol }) => {
  const variationColor = variation > 0 ? 'green' : 'red';
  return (
    <div className="crypto-price">
      <h2>{symbol}</h2>
      <p>Price: ${price}</p>
      <p>24h variation: {variation}% <span style={{ color: variationColor }}>{variation > 0 ? '+' : ''}</span></p>
    </div>
  );
};

export default CryptoPrice;
```

**src/components/Orderbook.js**
```jsx
import React from 'react';

const Orderbook = ({ bids, asks }) => {
  return (
    <div className="orderbook">
      <h2>Orderbook</h2>
      <table>
        <thead>
          <tr>
            <th>Price</th>
            <th>Quantity</th>
          </tr>
        </thead>
        <tbody>
          {bids.map((bid, index) => (
            <tr key={index}>
              <td>${bid.price}</td>
              <td>{bid.quantity}</td>
            </tr>
          ))}
          {asks.map((ask, index) => (
            <tr key={index}>
              <td>${ask.price}</td>
              <td>{ask.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>
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
    <div className="positions">
      <h2>Positions</h2>
      <ul>
        {positions.map((position, index) => (
          <li key={index}>
            <h3>{position.symbol}</h3>
            <p>Entry price: ${position.entryPrice}</p>
            <p>Current price: ${position.currentPrice}</p>
            <p>Profit/Loss: {position.profitLoss}%</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Positions;
```

**styles.css**
```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: var(--bg2);
}

.prices {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: var(--bg2);
}

.crypto-price {
  margin: 20px;
  padding: 20px;
  background-color: var(--bg3);
  border: 1px solid var(--border);
}

.orderbook {
  margin: 20px;
  padding: 20px;
  background-color: var(--bg3);
  border: 1px solid var(--border);
}

.positions {
  margin: 20px;
  padding: 20px;
  background-color: var(--bg3);
  border: 1px solid var(--border);
}

.buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: var(--bg2);
}

button {
  margin: 10px;
  padding: 10px 20px;
  background-color: var(--green);
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: var(--green);
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid var(--border);
  padding: 10px;
  text-align: left;
}

th {
  background-color: var(--bg2);
}

td {
  background-color: var(--bg3);
}

.red {
  color: red;
}

.green {
  color: green;
}
```
Notez que les styles sont écrits en CSS et utilisent les variables CSS définies dans le fichier `styles.css`. Les composants sont écrits en React et utilisent les variables CSS pour les styles. Les données sont simulées pour les prix et les positions.