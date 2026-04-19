import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const SignalsChart = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchSignals = () => {
      const mockSignals = Array.from({ length: 12 }, (_, i) => ({
        id: i + 1,
        symbol: ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'AVAX'][i % 6],
        price: (Math.random() * 5000 + 100).toFixed(2),
        change: (Math.random() * 20 - 10).toFixed(2),
        signal: ['BUY', 'SELL', 'HOLD'][Math.floor(Math.random() * 3)],
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
        confidence: (Math.random() * 100).toFixed(1),
      }));
      setSignals(mockSignals);
      setLoading(false);
    };

    const timer = setTimeout(fetchSignals, 800);
    return () => clearTimeout(timer);
  }, []);

  const visibleSignals = expanded ? signals : signals.slice(0, 6);

  return (
    <div className="signals-chart-container">
      <div className="signals-header">
        <h3>Market Signals</h3>
        <button onClick={() => setExpanded(!expanded)} className="expand-toggle">
          <ChevronDown size={16} className={expanded ? 'rotate-180' : ''} />
        </button>
      </div>

      <div className="signals-list">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={`skeleton-${i}`} className="signal-item skeleton">
              <div className="skeleton-line" style={{ width: `${Math.random() * 80 + 20}%` }}></div>
              <div className="skeleton-line" style={{ width: `${Math.random() * 60 + 20}%` }}></div>
            </div>
          ))
        ) : (
          visibleSignals.map((signal) => (
            <div
              key={signal.id}
              className="signal-item"
              style={{
                animationDelay: `${signal.id * 0.05}s`,
                animation: 'fadeUp 0.4s ease-out forwards'
              }}
            >
              <div className="signal-symbol">{signal.symbol}</div>
              <div className="signal-price">${signal.price}</div>
              <div className={`signal-change ${signal.change >= 0 ? 'positive' : 'negative'}`}>
                {signal.change >= 0 ? '+' : ''}{signal.change}%
              </div>
              <div className={`signal-type ${signal.signal.toLowerCase()}`}>{signal.signal}</div>
              <div className="signal-confidence">{signal.confidence}%</div>
              <div className="signal-time">
                {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .signals-chart-container {
          width: 100%;
          background: var(--surface);
          border-radius: 8px;
          padding: 12px;
          font-family: 'JetBrains Mono', monospace;
          color: var(--text-primary);
          border: 1px solid var(--border);
        }

        .signals-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .expand-toggle {
          background: none;
          border: none;
          color: var(--neon);
          cursor: pointer;
          transition: transform 0.2s ease;
          padding: 4px;
        }

        .expand-toggle:hover {
          opacity: 0.8;
        }

        .rotate-180 {
          transform: rotate(180deg);
        }

        .signals-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .signal-item {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
          align-items: center;
          padding: 8px 4px;
          font-size: 12px;
          border-radius: 4px;
          background: var(--surface-low);
          border: 1px solid transparent;
          transition: all 0.2s ease;
          opacity: 0;
          transform: translateY(20px);
        }

        .signal-item.skeleton {
          background: linear-gradient(90deg, var(--surface-high) 25%, var(--surface-low) 50%, var(--surface-high) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          grid-template-columns: repeat(6, 1fr);
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .skeleton-line {
          height: 8px;
          background: var(--surface-high);
          border-radius: 2px;
        }

        .signal-item:hover {
          background: var(--surface-high);
          border-color: var(--border-bright);
        }

        .signal-symbol {
          font-weight: 600;
          color: var(--text-primary);
        }

        .signal-price {
          font-weight: 500;
        }

        .signal-change {
          font-weight: 500;
        }

        .signal-change.positive {
          color: #00ff88;
        }

        .signal-change.negative {
          color: #ff4444;
        }

        .signal-type {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          text-align: center;
        }

        .signal-type.buy {
          background: rgba(0, 255, 136, 0.1);
          color: #00ff88;
        }

        .signal-type.sell {
          background: rgba(255, 68, 68, 0.1);
          color: #ff4444;
        }

        .signal-type.hold {
          background: rgba(170, 170, 170, 0.1);
          color: var(--text-secondary);
        }

        .signal-confidence {
          font-size: 10px;
          color: var(--text-secondary);
        }

        .signal-time {
          font-size: 10px;
          color: var(--text-muted);
        }

        @keyframes fadeUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .signal-item {
            grid-template-columns: 2fr 1fr 1fr;
            font-size: 11px;
          }

          .signal-type {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .signals-header {
            font-size: 12px;
          }

          .signal-item {
            grid-template-columns: 1.5fr 1fr 1fr;
            padding: 6px 4px;
          }

          .signal-symbol {
            font-size: 11px;
          }

          .signal-price {
            font-size: 11px;
          }

          .signal-change {
            font-size: 11px;
          }
        }
      `}</style>
    </div>
  );
};

export default SignalsChart;