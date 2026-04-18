import { useState, useEffect, useRef } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const CryptoMoversCarousel = () => {
  const [movers, setMovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const carouselRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const fetchMovers = async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=volume_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h',
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const filteredMovers = data
        .filter(coin => coin.price_change_percentage_24h !== null)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 10);

      setMovers(filteredMovers);
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError('Failed to fetch crypto movers. Please try again later.');
        console.error('Error fetching crypto movers:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovers();
    const interval = setInterval(fetchMovers, 60000);
    return () => clearInterval(interval);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -300,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 300,
        behavior: 'smooth'
      });
    }
  };

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      setScrollPosition(scrollContainerRef.current.scrollLeft);
    }
  };

  return (
    <div className="crypto-movers-carousel">
      <div className="carousel-header">
        <h3>Top 24h Movers</h3>
        <div className="carousel-controls">
          <button onClick={scrollLeft} aria-label="Scroll left">
            <ChevronLeft size={20} />
          </button>
          <button onClick={scrollRight} aria-label="Scroll right">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        className="scroll-container"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        {loading ? (
          Array.from({ length: 10 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="mover-card skeleton">
              <div className="skeleton-icon"></div>
              <div className="skeleton-name"></div>
              <div className="skeleton-price"></div>
              <div className="skeleton-change"></div>
            </div>
          ))
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={fetchMovers}>Retry</button>
          </div>
        ) : movers.length > 0 ? (
          movers.map((coin) => (
            <div key={coin.id} className="mover-card">
              <div className="coin-icon">
                <img
                  src={coin.image}
                  alt={coin.name}
                  width={24}
                  height={24}
                />
              </div>
              <div className="coin-info">
                <span className="coin-name">{coin.name}</span>
                <span className="coin-symbol">{coin.symbol.toUpperCase()}</span>
              </div>
              <div className="coin-price">${coin.current_price.toLocaleString()}</div>
              <div
                className={`price-change ${coin.price_change_percentage_24h >= 0 ? 'positive' : 'negative'}`}
              >
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}
                {coin.price_change_percentage_24h.toFixed(2)}%
              </div>
            </div>
          ))
        ) : (
          <div className="no-data">
            <p>No movers data available</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .crypto-movers-carousel {
          width: 100%;
          margin: 1rem 0;
          font-family: 'Inter', sans-serif;
        }

        .carousel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding: 0 0.5rem;
        }

        .carousel-header h3 {
          color: var(--t1);
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
        }

        .carousel-controls {
          display: flex;
          gap: 0.5rem;
        }

        .carousel-controls button {
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--t1);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .carousel-controls button:hover {
          background: var(--border);
        }

        .scroll-container {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          scroll-behavior: smooth;
          padding: 0 0.5rem;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .scroll-container::-webkit-scrollbar {
          display: none;
        }

        .mover-card {
          min-width: 120px;
          background: var(--bg2);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .mover-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 255, 136, 0.1);
        }

        .coin-icon {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          overflow: hidden;
        }

        .coin-info {
          display: flex;
          flex-direction: column;
          gap: 0.125rem;
        }

        .coin-name {
          color: var(--t1);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .coin-symbol {
          color: var(--t3);
          font-size: 0.75rem;
        }

        .coin-price {
          color: var(--t1);
          font-size: 0.875rem;
          font-weight: 500;
        }

        .price-change {
          font-size: 0.75rem;
          font-weight: 600;
          text-align: right;
        }

        .price-change.positive {
          color: var(--green);
        }

        .price-change.negative {
          color: #ff4444;
        }

        .skeleton {
          background: linear-gradient(90deg, var(--bg2) 25%, var(--bg) 50%, var(--bg2) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }

        .skeleton-icon {
          width: 24px;
          height: 24px;
          background: var(--bg);
          border-radius: 50%;
        }

        .skeleton-name {
          width: 60%;
          height: 0.875rem;
          background: var(--bg);
          border-radius: 4px;
        }

        .skeleton-price {
          width: 40%;
          height: 0.875rem;
          background: var(--bg);
          border-radius: 4px;
        }

        .skeleton-change {
          width: 30%;
          height: 0.75rem;
          background: var(--bg);
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .error-message {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 1rem;
          text-align: center;
          color: #ff4444;
        }

        .error-message button {
          background: var(--bg2);
          border: 1px solid var(--border);
          color: var(--t1);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          cursor: pointer;
          align-self: center;
          font-size: 0.875rem;
        }

        .no-data {
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 1rem;
          color: var(--t3);
          font-size: 0.875rem;
        }

        @media (min-width: 768px) {
          .mover-card {
            min-width: 140px;
          }

          .carousel-header {
            margin-bottom: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default CryptoMoversCarousel;