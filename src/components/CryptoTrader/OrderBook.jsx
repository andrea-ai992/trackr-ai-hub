src/components/CryptoTrader/OrderBook.jsx
```jsx
import { useState, useEffect, useRef, useCallback } from 'react';

const OrderBook = ({
  bids = [],
  asks = [],
  maxDepth = 20,
  animationDuration = 300,
  symbol = 'BTC/USDT'
}) => {
  const [expanded, setExpanded] = useState(false);
  const [activeBids, setActiveBids] = useState([]);
  const [activeAsks, setActiveAsks] = useState([]);
  const bidsContainerRef = useRef(null);
  const asksContainerRef = useRef(null);

  // Normalize and sort bids (highest first)
  const normalizedBids = bids
    .sort((a, b) => b[0] - a[0])
    .slice(0, maxDepth);

  // Normalize and sort asks (lowest first)
  const normalizedAsks = asks
    .sort((a, b) => a[0] - b[0])
    .slice(0, maxDepth);

  // Calculate max size for scaling
  const maxBidSize = normalizedBids.reduce((max, [_, size]) => Math.max(max, size), 0);
  const maxAskSize = normalizedAsks.reduce((max, [_, size]) => Math.max(max, size), 0);

  // Animate bids/asks on change
  useEffect(() => {
    const animateList = (newList, setList, containerRef) => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const children = Array.from(container.children);

      // Remove old items not in new list
      children.forEach(child => {
        const price = child.dataset.price;
        if (!newList.some(([p]) => p.toString() === price)) {
          child.style.opacity = '0';
          child.style.transform = 'translateY(-10px)';
          setTimeout(() => child.remove(), animationDuration);
        }
      });

      // Add new items
      newList.forEach(([price, size], index) => {
        if (!children.some(child => child.dataset.price === price.toString())) {
          const item = document.createElement('div');
          item.className = 'order-item';
          item.dataset.price = price;
          item.style.opacity = '0';
          item.style.transform = 'translateY(10px)';
          item.innerHTML = `
            <span class="price">${price.toLocaleString()}</span>
            <span class="size">${size.toFixed(4)}</span>
            <div class="bar" style="width: ${(size / (containerRef === bidsContainerRef ? maxBidSize : maxAskSize)) * 100}%"></div>
          `;
          container.appendChild(item);

          setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
          }, 10);
        }
      });

      setList(newList);
    };

    animateList(normalizedBids, setActiveBids, bidsContainerRef);
    animateList(normalizedAsks, setActiveAsks, asksContainerRef);
  }, [bids, asks, maxDepth, animationDuration, maxBidSize, maxAskSize]);

  // Format price for display
  const formatPrice = (price) => {
    return price.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    });
  };

  return (
    <div className="order-book-container">
      <div className="order-book-header">
        <h3>Order Book - {symbol}</h3>
        <button
          className="expand-toggle"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>

      <div className={`order-book-content ${expanded ? 'expanded' : ''}`}>
        {/* Bids (Buys) - Green */}
        <div className="order-book-side bids">
          <div className="order-book-header">
            <span>Bids</span>
            <span>Size</span>
          </div>
          <div className="order-book-list" ref={bidsContainerRef}>
            {activeBids.map(([price, size], index) => (
              <div
                key={`bid-${price}-${index}`}
                className="order-item"
                data-price={price}
              >
                <span className="price">{formatPrice(price)}</span>
                <span className="size">{size.toFixed(4)}</span>
                <div
                  className="bar"
                  style={{
                    width: `${(size / maxBidSize) * 100}%`,
                    backgroundColor: 'rgba(0, 255, 136, 0.2)'
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Asks (Sells) - Red */}
        <div className="order-book-side asks">
          <div className="order-book-header">
            <span>Asks</span>
            <span>Size</span>
          </div>
          <div className="order-book-list" ref={asksContainerRef}>
            {activeAsks.map(([price, size], index) => (
              <div
                key={`ask-${price}-${index}`}
                className="order-item"
                data-price={price}
              >
                <span className="price">{formatPrice(price)}</span>
                <span className="size">{size.toFixed(4)}</span>
                <div
                  className="bar"
                  style={{
                    width: `${(size / maxAskSize) * 100}%`,
                    backgroundColor: 'rgba(255, 0, 0, 0.2)'
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
```

src/components/CryptoTrader/OrderBook.css
```css
.order-book-container {
  --gap: 0.5rem;
  --item-height: 2.25rem;
  --header-height: 2rem;

  width: 100%;
  max-width: 100%;
  font-family: 'Inter', sans-serif;
  color: var(--t1);
  background: var(--bg2);
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.order-book-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--gap) 1rem;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
  font-size: 0.875rem;
  font-weight: 600;
}

.order-book-header h3 {
  margin: 0;
  font-size: 1rem;
  font-weight: 700;
}

.expand-toggle {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--t2);
  padding: 0.25rem 0.75rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.expand-toggle:hover {
  background: var(--border);
  color: var(--t1);
}

.order-book-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--gap);
  padding: var(--gap);
  max-height: 400px;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.order-book-content.expanded {
  max-height: 800px;
}

.order-book-side {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.order-book-side.bids {
  order: 2;
}

.order-book-side.asks {
  order: 1;
}

.order-book-list {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  max-height: 300px;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: var(--border) var(--bg2);
}

.order-book-list::-webkit-scrollbar {
  width: 4px;
}

.order-book-list::-webkit-scrollbar-track {
  background: var(--bg2);
}

.order-book-list::-webkit-scrollbar-thumb {
  background-color: var(--border);
  border-radius: 2px;
}

.order-book-header {
  display: grid;
  grid-template-columns: 2fr 1fr;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--t2);
  background: var(--bg);
  border-radius: 0.25rem;
}

.order-item {
  display: grid;
  grid-template-columns: 2fr 1fr;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background: transparent;
  border-radius: 0.25rem;
  position: relative;
  overflow: hidden;
  transition: all 0.2s ease;
  min-height: var(--item-height);
  font-size: 0.75rem;
}

.order-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.price {
  font-family: 'Roboto Mono', monospace;
  font-weight: 500;
  color: var(--green);
}

.size {
  font-family: 'Roboto Mono', monospace;
  text-align: right;
  color: var(--t3);
}

.bar {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, currentColor);
  opacity: 0.3;
  transition: width 0.3s ease;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .order-book-content {
    grid-template-columns: 1fr 1fr;
    max-height: 500px;
  }

  .order-book-side.bids {
    order: 1;
  }

  .order-book-side.asks {
    order: 2;
  }

  .order-book-list {
    max-height: 400px;
  }
}