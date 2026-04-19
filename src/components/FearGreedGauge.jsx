import { useState, useEffect } from 'react';

const FearGreedGauge = () => {
  const [score, setScore] = useState(50);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchFearGreedIndex = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('https://api.coingecko.com/api/v3/fear_greed_index', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch fear & greed index');
      }

      const data = await response.json();
      setScore(data.value);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 300000);
    return () => clearInterval(interval);
  }, []);

  const getColor = () => {
    if (score < 25) return '#ff3366';
    if (score < 50) return '#ff9900';
    if (score < 75) return '#ffcc00';
    return '#00ff88';
  };

  const getLabel = () => {
    if (score < 20) return 'Extreme Fear';
    if (score < 40) return 'Fear';
    if (score < 60) return 'Neutral';
    if (score < 80) return 'Greed';
    return 'Extreme Greed';
  };

  const normalizedScore = Math.min(Math.max(score, 0), 100);

  return (
    <div className="fear-greed-gauge-container">
      <div className="gauge-header">
        <h3>Fear & Greed Index</h3>
        <button onClick={fetchFearGreedIndex} disabled={isLoading} className="refresh-btn">
          <RefreshCw size={16} />
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="gauge-wrapper">
        <svg viewBox="0 0 200 100" className="gauge-svg">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={getColor()} />
              <stop offset={`${normalizedScore}%`} stopColor={getColor()} />
              <stop offset={`${normalizedScore}%`} stopColor="#333" />
              <stop offset="100%" stopColor="#333" />
            </linearGradient>
          </defs>

          <path
            d="M 20 50 A 30 30 0 0 1 180 50"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          <path
            d="M 20 50 A 30 30 0 0 1 180 50"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="2"
            strokeDasharray="188.5"
            strokeDashoffset={188.5 - (normalizedScore / 100) * 188.5}
            strokeLinecap="round"
            transform="rotate(-90 50 50)"
          />

          <circle cx="50" cy="50" r="4" fill={getColor()} />

          {Array.from({ length: 11 }).map((_, i) => {
            const angle = (i * 18) - 90;
            const value = i * 10;
            const isActive = value <= normalizedScore;
            return (
              <g key={i} transform={`rotate(${angle} 50 50) translate(0,-45)`}>
                <line
                  x1="0"
                  y1="0"
                  x2="0"
                  y2={isActive ? 5 : 3}
                  stroke={isActive ? getColor() : "var(--border)"}
                  strokeWidth={isActive ? 2 : 1}
                />
                <text
                  x="0"
                  y="8"
                  textAnchor="middle"
                  fill={isActive ? getColor() : "var(--text-secondary)"}
                  fontSize="8"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {value}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="gauge-value">
          <span className="score">{normalizedScore}</span>
          <span className="label">{getLabel()}</span>
        </div>
      </div>

      <style jsx>{`
        .fear-greed-gauge-container {
          width: 100%;
          max-width: 200px;
          background: var(--surface);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid var(--border);
          font-family: 'JetBrains Mono', monospace;
        }

        .gauge-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .gauge-header h3 {
          margin: 0;
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }

        .refresh-btn {
          background: none;
          border: none;
          color: var(--neon);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .refresh-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .error-message {
          color: #ff3366;
          font-size: 12px;
          margin-bottom: 12px;
          text-align: center;
        }

        .gauge-wrapper {
          position: relative;
          width: 100%;
          height: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .gauge-svg {
          width: 100%;
          height: 100%;
          transform: rotate(-90deg);
        }

        .gauge-value {
          margin-top: 8px;
          text-align: center;
        }

        .score {
          font-size: 24px;
          font-weight: 700;
          color: var(--neon);
          display: block;
        }

        .label {
          font-size: 10px;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      `}</style>
    </div>
  );
};

export default FearGreedGauge;