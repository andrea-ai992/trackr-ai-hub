import { useEffect, useState } from 'react';

const FearGreedGauge = () => {
  const [index, setIndex] = useState(50);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          const value = parseInt(data.data[0].value, 10);
          setIndex(value);
        }
      } catch (error) {
        console.error('Failed to fetch Fear & Greed Index:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFearGreedIndex();

    const interval = setInterval(fetchFearGreedIndex, 300000);
    return () => clearInterval(interval);
  }, []);

  const gaugeValue = Math.min(Math.max(index, 0), 100);
  const rotation = (gaugeValue / 100) * 180 - 90;

  return (
    <div className="fear-greed-gauge">
      <div className="gauge-container">
        <div className="gauge-needle" style={{ transform: `rotate(${rotation}deg)` }} />
        <div className="gauge-track">
          <div className="gauge-fill" style={{ width: `${gaugeValue}%` }} />
        </div>
        <div className="gauge-labels">
          <span className="label extreme-fear">0</span>
          <span className="label fear">25</span>
          <span className="label neutral">50</span>
          <span className="label greed">75</span>
          <span className="label extreme-greed">100</span>
        </div>
        <div className="gauge-value">
          <span className="value-number">{isLoading ? '...' : gaugeValue}</span>
          <span className="value-text">{isLoading ? 'Loading...' : 'Fear & Greed Index'}</span>
        </div>
      </div>
      <style jsx>{`
        .fear-greed-gauge {
          width: 100%;
          max-width: 300px;
          padding: 1rem;
          background: var(--surface);
          border-radius: 0.5rem;
          border: 1px solid var(--border);
        }

        .gauge-container {
          position: relative;
          width: 100%;
          height: 150px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .gauge-track {
          position: relative;
          width: 100%;
          height: 12px;
          background: var(--surface-low);
          border-radius: 6px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .gauge-fill {
          position: absolute;
          height: 100%;
          background: linear-gradient(90deg, #ff4444, #ffbb33, #00C851);
          transition: width 0.5s ease;
        }

        .gauge-needle {
          position: absolute;
          top: -8px;
          left: 50%;
          width: 2px;
          height: 20px;
          background: var(--neon);
          transform-origin: center bottom;
          transition: transform 0.5s ease;
          z-index: 10;
        }

        .gauge-labels {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.7rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .label {
          position: relative;
          padding: 0 0.25rem;
        }

        .label::after {
          content: '';
          position: absolute;
          top: -2px;
          left: 50%;
          width: 1px;
          height: 4px;
          background: var(--text-secondary);
          transform: translateX(-50%);
        }

        .extreme-fear::after {
          background: #ff4444;
        }

        .fear::after {
          background: #ff8800;
        }

        .neutral::after {
          background: var(--text-secondary);
        }

        .greed::after {
          background: #aaff00;
        }

        .extreme-greed::after {
          background: #00ff88;
        }

        .gauge-value {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'JetBrains Mono', monospace;
        }

        .value-number {
          font-size: 2rem;
          font-weight: bold;
          color: var(--neon);
          line-height: 1;
        }

        .value-text {
          font-size: 0.7rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
};

export default FearGreedGauge;