// src/components/Dashboard/Movers.jsx
import { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

const Movers = () => {
  const [movers, setMovers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovers = async () => {
      try {
        const response = await fetch('/api/movers');
        const data = await response.json();
        setMovers(data);
      } catch (error) {
        console.error('Failed to fetch movers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMovers();
  }, []);

  if (loading) {
    return (
      <div className="movers-container">
        <div className="movers-header">
          <h3>Movers</h3>
        </div>
        <div className="movers-scroll">
          {[...Array(4)].map((_, i) => (
            <div key={`skeleton-${i}`} className="mover-item skeleton">
              <div className="mover-icon skeleton"></div>
              <div className="mover-price skeleton"></div>
              <div className="mover-change skeleton"></div>
              <div className="mover-sparkline skeleton"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="movers-container">
      <div className="movers-header">
        <h3>Movers</h3>
        <ChevronRight size={16} color="var(--text-secondary)" />
      </div>
      <div className="movers-scroll">
        {movers.map((mover) => (
          <div key={mover.id} className="mover-item">
            <div className="mover-icon">{mover.icon}</div>
            <div className="mover-info">
              <div className="mover-symbol">{mover.symbol}</div>
              <div className={`mover-price ${mover.change >= 0 ? 'up' : 'down'}`}>
                ${mover.price}
              </div>
              <div className={`mover-change ${mover.change >= 0 ? 'up' : 'down'}`}>
                {mover.change >= 0 ? '+' : ''}{mover.change}%
              </div>
            </div>
            <div className="mover-sparkline">
              <svg width="40" height="16" viewBox="0 0 40 16">
                <polyline
                  fill="none"
                  stroke={mover.change >= 0 ? 'var(--neon)' : 'var(--text-muted)'}
                  strokeWidth="1.5"
                  points={mover.sparkline}
                />
              </svg>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Movers;