// src/components/OrderBook.jsx
import { useState, useEffect, useRef } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const OrderBook = ({ bids = [], asks = [], pricePrecision = 2 }) => {
  const [sortBids, setSortBids] = useState(true);
  const [sortAsks, setSortAsks] = useState(true);
  const bidsEndRef = useRef(null);
  const asksEndRef = useRef(null);

  const sortedBids = [...bids].sort((a, b) => sortBids ? b[0] - a[0] : a[0] - b[0]);
  const sortedAsks = [...asks].sort((a, b) => sortAsks ? a[0] - b[0] : b[0] - a[0]);

  useEffect(() => {
    bidsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [bids]);

  useEffect(() => {
    asksEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [asks]);

  const formatPrice = (price) => price.toFixed(pricePrecision);
  const formatAmount = (amount) => amount.toLocaleString(undefined, { maximumFractionDigits: 4 });

  return (
    <div className="orderbook-container">
      <div className="orderbook-header">
        <h3>Order Book</h3>
        <div className="orderbook-controls">
          <button
            className="sort-btn"
            onClick={() => setSortBids(!sortBids)}
            aria-label="Sort bids"
          >
            {sortBids ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button
            className="sort-btn"
            onClick={() => setSortAsks(!sortAsks)}
            aria-label="Sort asks"
          >
            {sortAsks ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      <div className="orderbook-grid">
        <div className="orderbook-side bids">
          <div className="orderbook-header-row">
            <span>Bids</span>
            <span>Price</span>
            <span>Amount</span>
            <span>Total</span>
          </div>

          <div className="orderbook-rows bids-rows">
            {sortedBids.map(([price, amount], index) => {
              const total = price * amount;
              return (
                <div key={`bid-${index}`} className="orderbook-row bid-row">
                  <div className="orderbook-cell amount-cell">{formatAmount(amount)}</div>
                  <div className="orderbook-cell price-cell">{formatPrice(price)}</div>
                  <div className="orderbook-cell total-cell">{formatAmount(total)}</div>
                </div>
              );
            })}
            <div ref={bidsEndRef} />
          </div>
        </div>

        <div className="orderbook-side asks">
          <div className="orderbook-header-row">
            <span>Asks</span>
            <span>Price</span>
            <span>Amount</span>
            <span>Total</span>
          </div>

          <div className="orderbook-rows asks-rows">
            {sortedAsks.map(([price, amount], index) => {
              const total = price * amount;
              return (
                <div key={`ask-${index}`} className="orderbook-row ask-row">
                  <div className="orderbook-cell price-cell">{formatPrice(price)}</div>
                  <div className="orderbook-cell amount-cell">{formatAmount(amount)}</div>
                  <div className="orderbook-cell total-cell">{formatAmount(total)}</div>
                </div>
              );
            })}
            <div ref={asksEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;