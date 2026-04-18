Je vais créer les deux fichiers demandés avec un code complet et fonctionnel.

```jsx
// src/components/CryptoTrader/CryptoTrader.jsx
import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import OrderBook from './OrderBook';

// Mock data generator for order book and trades
const generateMockData = () => {
  const bids = [];
  const asks = [];
  const trades = [];

  // Generate random bids
  for (let i = 0; i < 20; i++) {
    bids.push({
      price: (100000 + Math.random() * 1000).toFixed(2),
      size: (Math.random() * 100).toFixed(4),
      total: (Math.random() * 10000).toFixed(2)
    });
  }

  // Generate random asks
  for (let i = 0; i < 20; i++) {
    asks.push({
      price: (100000 + 100 + Math.random() * 1000).toFixed(2),
      size: (Math.random() * 100).toFixed(4),
      total: (Math.random() * 10000).toFixed(2)
    });
  }

  // Generate random trades
  for (let i = 0; i < 10; i++) {
    trades.push({
      price: (100000 + Math.random() * 1000).toFixed(2),
      size: (Math.random() * 50).toFixed(4),
      time: new Date(Date.now() - i * 10000).toLocaleTimeString(),
      side: Math.random() > 0.5 ? 'buy' : 'sell'
    });
  }

  return { bids, asks, trades };
};

const CryptoTrader = () => {
  const [market, setMarket] = useState('BTC/USDT');
  const [price, setPrice] = useState('100,500.25');
  const [priceChange, setPriceChange] = useState('+2.45%');
  const [priceChangeValue, setPriceChangeValue] = useState('+2,425.50');
  const [volume, setVolume] = useState('1,234.56 BTC');
  const [orderBookData, setOrderBookData] = useState(generateMockData());
  const [tradesData, setTradesData] = useState(generateMockData().trades);
  const [activeTab, setActiveTab] = useState('orderbook');
  const [depthChart, setDepthChart] = useState({ bids: [], asks: [] });
  const chartRef = useRef(null);

  // Update depth chart data
  useEffect(() => {
    const bids = orderBookData.bids.map(bid => ({
      price: parseFloat(bid.price),
      size: parseFloat(bid.size)
    })).sort((a, b) => b.price - a.price);

    const asks = orderBookData.asks.map(ask => ({
      price: parseFloat(ask.price),
      size: parseFloat(ask.size)
    })).sort((a, b) => a.price - b.price);

    setDepthChart({ bids, asks });
  }, [orderBookData]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOrderBookData(generateMockData());
      setTradesData(generateMockData().trades);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(parseFloat(num));
  };

  const calculateTotalSize = (orders) => {
    return orders.reduce((sum, order) => sum + parseFloat(order.size), 0).toFixed(4);
  };

  return (
    <div className="crypto-trader">
      <header className="crypto-header">
        <div className="header-info">
          <h1>{market}</h1>
          <div className="price-container">
            <span className="price">{price}</span>
            <span className={`price-change ${priceChange.startsWith('+') ? 'up' : 'down'}`}>
              {priceChange} ({priceChangeValue})
            </span>
          </div>
          <div className="volume-info">
            <span>Vol: {volume}</span>
          </div>
        </div>
      </header>

      <div className="tabs-container">
        <button
          className={`tab-btn ${activeTab === 'orderbook' ? 'active' : ''}`}
          onClick={() => setActiveTab('orderbook')}
        >
          Order Book
        </button>
        <button
          className={`tab-btn ${activeTab === 'trades' ? 'active' : ''}`}
          onClick={() => setActiveTab('trades')}
        >
          Trades
        </button>
        <button
          className={`tab-btn ${activeTab === 'depth' ? 'active' : ''}`}
          onClick={() => setActiveTab('depth')}
        >
          Depth
        </button>
      </div>

      <div className="content-container">
        {activeTab === 'orderbook' && (
          <OrderBook
            bids={orderBookData.bids}
            asks={orderBookData.asks}
            totalBids={calculateTotalSize(orderBookData.bids)}
            totalAsks={calculateTotalSize(orderBookData.asks)}
          />
        )}

        {activeTab === 'trades' && (
          <div className="trades-container">
            <div className="trades-header">
              <span>Price</span>
              <span>Size</span>
              <span>Time</span>
              <span>Type</span>
            </div>
            <div className="trades-list">
              {tradesData.map((trade, index) => (
                <div key={index} className={`trade-row ${trade.side}`}>
                  <span className="trade-price">{trade.price}</span>
                  <span className="trade-size">{trade.size}</span>
                  <span className="trade-time">{trade.time}</span>
                  <span className={`trade-type ${trade.side}`}>
                    {trade.side === 'buy' ? 'Buy' : 'Sell'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'depth' && (
          <div className="depth-chart-container">
            <svg ref={chartRef} className="depth-chart">
              <defs>
                <linearGradient id="bidGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="askGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff4444" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ff4444" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Asks */}
              {depthChart.asks.map((ask, index) => (
                <rect
                  key={`ask-${index}`}
                  x="0"
                  y={index * 4}
                  width={ask.size * 2}
                  height="3"
                  fill="url(#askGradient)"
                  fillOpacity="0.7"
                />
              ))}

              {/* Bids */}
              {depthChart.bids.map((bid, index) => (
                <rect
                  key={`bid-${index}`}
                  x="0"
                  y={chartRef.current?.clientHeight - (index * 4) - 3}
                  width={bid.size * 2}
                  height="3"
                  fill="url(#bidGradient)"
                  fillOpacity="0.7"
                />
              ))}
            </svg>
            <div className="depth-axis">
              <span>Price</span>
              <span>Size</span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .crypto-trader {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--t1);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }

        .crypto-header {
          margin-bottom: 1rem;
        }

        .header-info h1 {
          font-size: 1.5rem;
          margin: 0 0 0.5rem 0;
          color: var(--t1);
        }

        .price-container {
          display: flex;
          align-items: baseline;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }

        .price {
          font-size: 1.8rem;
          font-weight: 600;
          color: var(--t1);
        }

        .price-change {
          font-size: 0.9rem;
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
        }

        .price-change.up {
          background: rgba(0, 255, 136, 0.2);
          color: var(--green);
        }

        .price-change.down {
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
        }

        .volume-info {
          font-size: 0.8rem;
          color: var(--t2);
        }

        .tabs-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }

        .tab-btn {
          flex: 1;
          padding: 0.75rem;
          background: transparent;
          border: none;
          color: var(--t2);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          border-bottom: 2px solid transparent;
        }

        .tab-btn.active {
          color: var(--t1);
          border-bottom-color: var(--green);
        }

        .content-container {
          flex: 1;
          overflow: hidden;
        }

        .trades-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .trades-header, .trade-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--border);
        }

        .trades-header {
          font-size: 0.8rem;
          color: var(--t3);
          font-weight: 600;
        }

        .trade-row {
          font-size: 0.9rem;
        }

        .trade-price {
          color: var(--t1);
        }

        .trade-size {
          color: var(--t1);
        }

        .trade-time {
          color: var(--t2);
          font-size: 0.8rem;
        }

        .trade-type {
          font-size: 0.8rem;
          padding: 0.1rem 0.3rem;
          border-radius: 0.2rem;
          text-align: center;
        }

        .trade-type.buy {
          background: rgba(0, 255, 136, 0.2);
          color: var(--green);
        }

        .trade-type.sell {
          background: rgba(255, 68, 68, 0.2);
          color: #ff4444;
        }

        .depth-chart-container {
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .depth-chart {
          flex: 1;
          width: 100%;
          height: 100%;
          background: var(--bg2);
          border-radius: 0.5rem;
        }

        .depth-axis {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--t2);
          margin-top: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default CryptoTrader;
```

```jsx
// src/components/CryptoTrader/OrderBook.jsx
import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OrderBook = ({ bids, asks, totalBids, totalAsks }) => {
  const [sortBids, setSortBids] = useState('price_desc');
  const [sortAsks, setSortAsks] = useState('price_asc');
  const [maxTotal, setMaxTotal] = useState(0);
  const bidsContainerRef = useRef(null);
  const asksContainerRef = useRef(null);

  // Calculate max total for scaling
  useEffect(() => {
    const allOrders = [...bids, ...asks];
    const totals = allOrders.map(order => parseFloat(order.total));
    const max = Math.max(...totals, 1);
    setMaxTotal(max);
  }, [bids, asks]);

  // Sort bids and asks based on state
  const sortedBids = [...bids].sort((a, b) => {
    if (sortBids === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
    if (sortBids === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortBids === 'size_desc') return parseFloat(b.size) - parseFloat(a.size);
    if (sortBids === 'size_asc') return parseFloat(a.size) - parseFloat(b.size);
    return 0;
  });

  const sortedAsks = [...asks].sort((a, b) => {
    if (sortAsks === 'price_asc') return parseFloat(a.price) - parseFloat(b.price);
    if (sortAsks === 'price_desc') return parseFloat(b.price) - parseFloat(a.price);
    if (sortAsks === 'size_asc') return parseFloat(a.size) - parseFloat(b.size);
    if (sortAsks === 'size_desc') return parseFloat(b.size) - parseFloat(a.size);
    return 0;
  });

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(parseFloat(num));
  };

  // Calculate bar width based on total
  const getBarWidth = (total) => {
    return `${Math.min((parseFloat(total) / maxTotal) * 100, 100)}%`;
  };

  return (
    <div className="order-book">
      <div className="order-book-header">
        <div className="header-row">
          <span>Price (USDT)</span>
          <span>Size</span>
          <span>Total</span>
        </div>
      </div>

      <div className="order-book-content">
        {/* Bids Section */}
        <div className="bids-section">
          <div className="section-header">
            <span>Bids ({totalBids} BTC)</span>
            <div className="sort-controls">
              <button
                className={`sort-btn ${sortBids === 'price_desc' ? 'active' : ''}`}
                onClick={() => setSortBids('price_desc')}
                title="Sort by price descending"
              >
                <ChevronDown size={14} />
              </button>
              <button
                className={`sort-btn ${sortBids === 'size_desc' ? 'active' : ''}`}
                onClick={() => setSortBids('size_desc')}
                title="Sort by size descending"
              >
                <ChevronDown size={14} />
              </button>
            </div>
          </div>

          <div className="orders-container" ref={bidsContainerRef}>
            {sortedBids.map((bid, index) => (
              <div key={`bid-${index}`} className="order-row bid-row">
                <span className="order-price">{formatNumber(bid.price)}</span>
                <span className="order-size">{formatNumber(bid.size)}</span>
                <div className="order-bar-container">
                  <div
                    className="order-bar"
                    style={{
                      width: getBarWidth(bid.total),
                      background: 'linear-gradient(to right, rgba(0, 255, 136, 0.2), transparent)'
                    }}
                  ></div>
                  <span className="order-total">{formatNumber(bid.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Spread */}
        <div className="spread-row">
          <span>Spread</span>
        </div>

        {/* Asks Section */}
        <div className="asks-section">
          <div className="section-header">
            <span>Asks ({totalAsks} BTC)</span>
            <div className="sort-controls">
              <button
                className={`sort-btn ${sortAsks === 'price_asc' ? 'active' : ''}`}
                onClick={() => setSortAsks('price