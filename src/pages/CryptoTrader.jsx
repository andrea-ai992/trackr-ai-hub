src/pages/CryptoTrader.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import OrderBook from '../components/OrderBook';
import TradingView from '../components/TradingView';
import PositionsPanel from '../components/PositionsPanel';

const CryptoTrader = () => {
  const navigate = useNavigate();
  const [activePair, setActivePair] = useState('BTC/USDT');
  const [orderType, setOrderType] = useState('limit');
  const [orderSide, setOrderSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [size, setSize] = useState('');
  const [positions, setPositions] = useState([]);
  const wsOrderBookRef = useRef(null);
  const wsTradesRef = useRef(null);

  const pairs = [
    { name: 'BTC/USDT', label: 'BTC/USDT' },
    { name: 'ETH/USDT', label: 'ETH/USDT' },
    { name: 'SOL/USDT', label: 'SOL/USDT' },
    { name: 'ADA/USDT', label: 'ADA/USDT' }
  ];

  const orderTypes = [
    { value: 'limit', label: 'Limit' },
    { value: 'market', label: 'Market' }
  ];

  const orderSides = [
    { value: 'buy', label: 'Buy' },
    { value: 'sell', label: 'Sell' }
  ];

  const handlePairChange = (pair) => {
    setActivePair(pair);
  };

  const handleOrderSubmit = (e) => {
    e.preventDefault();
    if (!price || !size) return;

    const newPosition = {
      id: Date.now(),
      pair: activePair,
      side: orderSide,
      type: orderType,
      price: parseFloat(price),
      size: parseFloat(size),
      timestamp: new Date().toISOString(),
      pnl: 0
    };

    setPositions(prev => [...prev, newPosition]);
    setPrice('');
    setSize('');
  };

  useEffect(() => {
    const connectOrderBook = () => {
      if (wsOrderBookRef.current) wsOrderBookRef.current.close();

      wsOrderBookRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${activePair.toLowerCase().replace('/', '')}@depth20@100ms`);

      wsOrderBookRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Handle order book updates
      };

      wsOrderBookRef.current.onerror = () => {
        setTimeout(connectOrderBook, 5000);
      };
    };

    const connectTrades = () => {
      if (wsTradesRef.current) wsTradesRef.current.close();

      wsTradesRef.current = new WebSocket(`wss://stream.binance.com:9443/ws/${activePair.toLowerCase().replace('/', '')}@trade`);

      wsTradesRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        // Handle trade updates
      };

      wsTradesRef.current.onerror = () => {
        setTimeout(connectTrades, 5000);
      };
    };

    connectOrderBook();
    connectTrades();

    return () => {
      if (wsOrderBookRef.current) wsOrderBookRef.current.close();
      if (wsTradesRef.current) wsTradesRef.current.close();
    };
  }, [activePair]);

  return (
    <div className="crypto-trader-page">
      <header className="header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
            <path d="M19 12H5M5 12L12 5M5 12L12 19" />
          </svg>
        </button>
        <h1>CryptoTrader</h1>
        <div className="pair-selector">
          {pairs.map(pair => (
            <button
              key={pair.name}
              className={`pair-btn ${activePair === pair.name ? 'active' : ''}`}
              onClick={() => handlePairChange(pair.name)}
            >
              {pair.label}
            </button>
          ))}
        </div>
      </header>

      <main className="main-layout">
        <div className="left-panel">
          <OrderBook pair={activePair} />
          <div className="order-form">
            <div className="form-group">
              <label>Type</label>
              <div className="radio-group">
                {orderTypes.map(type => (
                  <label key={type.value}>
                    <input
                      type="radio"
                      name="orderType"
                      value={type.value}
                      checked={orderType === type.value}
                      onChange={() => setOrderType(type.value)}
                    />
                    {type.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Side</label>
              <div className="radio-group">
                {orderSides.map(side => (
                  <label key={side.value}>
                    <input
                      type="radio"
                      name="orderSide"
                      value={side.value}
                      checked={orderSide === side.value}
                      onChange={() => setOrderSide(side.value)}
                    />
                    {side.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>

            <div className="form-group">
              <label>Size</label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="0.00"
                step="0.00000001"
              />
            </div>

            <button className="submit-btn" onClick={handleOrderSubmit}>
              {orderType === 'market' ? 'Market Order' : 'Place Order'}
            </button>
          </div>
        </div>

        <div className="right-panel">
          <TradingView pair={activePair} />
          <PositionsPanel positions={positions} setPositions={setPositions} />
        </div>
      </main>
    </div>
  );
};

export default CryptoTrader;