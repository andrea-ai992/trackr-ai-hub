import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const FearGreedGauge = () => {
  const [value, setValue] = useState(50);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchFearGreedIndex = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('https://api.alternative.me/fng/?limit=1');
      if (!response.ok) throw new Error('Failed to fetch Fear & Greed Index');
      const data = await response.json();
      const currentValue = parseInt(data.data[0].value, 10);
      setValue(currentValue);
      setLastUpdated(new Date(data.data[0].timestamp * 1000).toLocaleString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const getGaugeColor = (value) => {
    if (value < 20) return '#ff4d4d'; // Extreme Fear
    if (value < 40) return '#ff9933'; // Fear
    if (value < 60) return '#f0f0f0'; // Neutral
    if (value < 80) return '#99ff99'; // Greed
    return '#00ff88'; // Extreme Greed
  };

  const getGaugeLabel = (value) => {
    if (value < 20) return 'Extreme Fear';
    if (value < 40) return 'Fear';
    if (value < 60) return 'Neutral';
    if (value < 80) return 'Greed';
    return 'Extreme Greed';
  };

  const angle = (value / 100) * 180;
  const rotation = angle - 90;
  const gaugeColor = getGaugeColor(value);
  const gaugeLabel = getGaugeLabel(value);

  return (
    <div className="fear-greed-gauge-container">
      <div className="gauge-header">
        <h3>Fear & Greed Index</h3>
        <button
          onClick={fetchFearGreedIndex}
          disabled={loading}
          aria-label="Refresh Fear & Greed Index"
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} />
        </button>
      </div>

      <div className="gauge-wrapper">
        <svg
          width="100%"
          height="200"
          viewBox="0 0 300 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background arc */}
          <path
            d="M 50 150 A 100 100 0 0 1 250 150"
            fill="none"
            stroke="var(--border)"
            strokeWidth="20"
            strokeLinecap="round"
          />

          {/* Value arc */}
          <path
            d={`M 50 150 A 100 100 0 ${angle > 90 ? 1 : 0} 1 ${50 + 100 * Math.cos((rotation * Math.PI) / 180)} ${150 + 100 * Math.sin((rotation * Math.PI) / 180)}`}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="20"
            strokeLinecap="round"
            strokeDasharray="5,5"
          />

          {/* Needle */}
          <line
            x1="150"
            y1="150"
            x2={50 + 100 * Math.cos((rotation * Math.PI) / 180)}
            y2={150 + 100 * Math.sin((rotation * Math.PI) / 180)}
            stroke="var(--green)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Center circle */}
          <circle cx="150" cy="150" r="15" fill="var(--bg2)" stroke="var(--border)" strokeWidth="2" />

          {/* Value text */}
          <text
            x="150"
            y="120"
            textAnchor="middle"
            fill="var(--t1)"
            fontSize="32"
            fontWeight="bold"
          >
            {value}
          </text>

          {/* Label text */}
          <text
            x="150"
            y="180"
            textAnchor="middle"
            fill="var(--t3)"
            fontSize="12"
          >
            {gaugeLabel}
          </text>
        </svg>
      </div>

      {lastUpdated && (
        <div className="gauge-footer">
          <p>Last updated: {lastUpdated}</p>
        </div>
      )}

      {error && (
        <div className="gauge-error">
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default FearGreedGauge;
```

```css
.fear-greed-gauge-container {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);

  width: 100%;
  max-width: 300px;
  padding: 1rem;
  background: var(--bg2);
  border-radius: 12px;
  border: 1px solid var(--border);
  font-family: 'Inter', sans-serif;
}

.gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.gauge-header h3 {
  margin: 0;
  color: var(--t1);
  font-size: 1rem;
  font-weight: 600;
}

.gauge-header button {
  background: none;
  border: none;
  color: var(--t2);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.2s;
}

.gauge-header button:hover {
  color: var(--green);
}

.gauge-header button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gauge-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 1rem;
}

.gauge-footer {
  text-align: center;
  font-size: 0.75rem;
  color: var(--t3);
}

.gauge-error {
  text-align: center;
  font-size: 0.75rem;
  color: #ff4d4d;
  margin-top: 0.5rem;
}