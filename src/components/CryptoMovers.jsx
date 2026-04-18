src/components/CryptoMovers.jsx
```jsx
import { useState, useEffect, useRef } from 'react';
import '../styles/CryptoMovers.css';

const CryptoMovers = () => {
  const [movers, setMovers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const animationRef = useRef(null);
  const scrollSpeed = 0.5;

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        // Mock data - replace with actual API call in production
        const mockData = [
          { id: 1, symbol: 'BTC', name: 'Bitcoin', price: 50234.56, change: 2.45, icon: '🟠' },
          { id: 2, symbol: 'ETH', name: 'Ethereum', price: 3124.78, change: 1.89, icon: '🟣' },
          { id: 3, symbol: 'SOL', name: 'Solana', price: 145.23, change: 3.12, icon: '🔵' },
          { id: 4, symbol: 'ADA', name: 'Cardano', price: 0.4567, change: -0.78, icon: '🔴' },
          { id: 5, symbol: 'DOT', name: 'Polkadot', price: 6.789, change: 4.23, icon: '🟢' },
          { id: 6, symbol: 'AVAX', name: 'Avalanche', price: 34.56, change: 5.12, icon: '🔶' },
          { id: 7, symbol: 'MATIC', name: 'Polygon', price: 0.8901, change: 2.34, icon: '🟣' },
          { id: 8, symbol: 'LTC', name: 'Litecoin', price: 89.45, change: -1.23, icon: '🔷' },
        ];

        setMovers(mockData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching movers:', error);
        setIsLoading(false);
      }
    };

    fetchMovers();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    const scroll = scrollRef.current;

    if (!container || !scroll) return;

    let scrollPosition = 0;
    let direction = 1;

    const animateScroll = () => {
      scrollPosition += scrollSpeed * direction;

      if (scrollPosition >= scroll.scrollWidth / 2) {
        scrollPosition = 0;
      } else if (scrollPosition <= 0) {
        scrollPosition = scroll.scrollWidth / 2;
      }

      scroll.style.transform = `translateX(-${scrollPosition}px)`;
      animationRef.current = requestAnimationFrame(animateScroll);
    };

    animationRef.current = requestAnimationFrame(animateScroll);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const formatChange = (change) => {
    const color = change >= 0 ? 'var(--green)' : '#ff4444';
    const sign = change >= 0 ? '+' : '';
    return (
      <span style={{ color }}>
        {sign}{change.toFixed(2)}%
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="crypto-movers">
        <div className="movers-header">
          <h3>Crypto Movers</h3>
        </div>
        <div className="movers-loading">
          <div className="loading-spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="crypto-movers">
      <div className="movers-header">
        <h3>Crypto Movers</h3>
        <button className="refresh-btn" onClick={() => window.location.reload()}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M22 11.5a10.5 10.5 0 0 1-15.4 9.3M2 12.5a10.5 10.5 0 0 0 15.4 9.3" />
          </svg>
        </button>
      </div>

      <div className="movers-container" ref={containerRef}>
        <div className="movers-scroll" ref={scrollRef}>
          {movers.map((mover) => (
            <div key={mover.id} className="mover-card">
              <div className="mover-icon" style={{ '--parallax-offset': '0px' }}>
                {mover.icon}
              </div>
              <div className="mover-info">
                <div className="mover-symbol">{mover.symbol}</div>
                <div className="mover-name">{mover.name}</div>
              </div>
              <div className="mover-price">${formatPrice(mover.price)}</div>
              <div className="mover-change">{formatChange(mover.change)}</div>
            </div>
          ))}

          {/* Duplicate for seamless loop */}
          {movers.map((mover) => (
            <div key={`dup-${mover.id}`} className="mover-card">
              <div className="mover-icon" style={{ '--parallax-offset': '0px' }}>
                {mover.icon}
              </div>
              <div className="mover-info">
                <div className="mover-symbol">{mover.symbol}</div>
                <div className="mover-name">{mover.name}</div>
              </div>
              <div className="mover-price">${formatPrice(mover.price)}</div>
              <div className="mover-change">{formatChange(mover.change)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CryptoMovers;
```

src/styles/CryptoMovers.css
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

.crypto-movers {
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

.movers-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem 1rem;
  margin-bottom: 1rem;
}

.movers-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--t1);
}

.refresh-btn {
  background: transparent;
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: var(--t2);
}

.refresh-btn:hover {
  background: var(--border);
  color: var(--t1);
  border-color: var(--green);
}

.movers-container {
  width: 100%;
  overflow: hidden;
  position: relative;
  padding: 0.5rem 0;
}

.movers-scroll {
  display: flex;
  width: max-content;
  will-change: transform;
  transition: transform 0.3s ease-out;
}

.mover-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  margin-right: 0.5rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  min-width: 180px;
  transition: all 0.2s ease;
}

.mover-card:hover {
  background: var(--bg3);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.1);
}

.mover-icon {
  font-size: 1.5rem;
  transition: transform 0.1s ease-out;
}

.mover-info {
  flex: 1;
  min-width: 0;
}

.mover-symbol {
  font-weight: 600;
  color: var(--t1);
  font-size: 0.9rem;
  margin-bottom: 0.1rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.mover-name {
  font-size: 0.7rem;
  color: var(--t3);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mover-price {
  font-weight: 600;
  color: var(--t1);
  font-size: 0.9rem;
  margin-right: 0.5rem;
}

.mover-change {
  font-weight: 600;
  font-size: 0.8rem;
}

.movers-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid var(--border);
  border-top: 3px solid var(--green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .mover-card {
    min-width: 200px;
  }

  .movers-header h3 {
    font-size: 1.5rem;
  }
}

/* Parallax effect on scroll */
@media (hover: hover) {
  .movers-scroll {
    scroll-behavior: smooth;
  }

  .mover-icon {
    animation: float 3s ease-in-out infinite;
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-5px);
    }
  }
}