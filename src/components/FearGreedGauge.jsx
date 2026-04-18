src/components/FearGreedGauge.jsx
```jsx
import { useState, useEffect } from 'react';
import './FearGreedGauge.css';

const FearGreedGauge = () => {
  const [value, setValue] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        const newValue = parseInt(data.data[0].value, 10);
        setValue(newValue);
      } catch (error) {
        console.error('Error fetching Fear & Greed Index:', error);
        setValue(50); // Fallback value
      } finally {
        setIsLoading(false);
      }
    };

    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const rotation = (normalizedValue / 100) * 180 - 90;

  return (
    <div className="fear-greed-gauge-container">
      <div className="gauge-header">
        <h3>Fear & Greed Index</h3>
        <span className="gauge-value">{isLoading ? 'Loading...' : `${normalizedValue}`}</span>
      </div>
      <div className="gauge-wrapper">
        <svg viewBox="0 0 200 100" className="gauge-svg">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff0000" />
              <stop offset="50%" stopColor="#ffff00" />
              <stop offset="100%" stopColor="#00ff00" />
            </linearGradient>
          </defs>
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="6"
            strokeDasharray="251.2"
            strokeDashoffset={251.2 - (251.2 * normalizedValue) / 100}
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 80)`}
            className="gauge-needle"
          />
          <circle cx="100" cy="80" r="4" fill="var(--green)" />
        </svg>
        <div className="gauge-labels">
          <span className="label extreme-fear">Extreme Fear</span>
          <span className="label fear">Fear</span>
          <span className="label neutral">Neutral</span>
          <span className="label greed">Greed</span>
          <span className="label extreme-greed">Extreme Greed</span>
        </div>
      </div>
      <div className="gauge-description">
        <p>{isLoading ? 'Fetching market sentiment...' : getSentimentDescription(normalizedValue)}</p>
      </div>
    </div>
  );
};

const getSentimentDescription = (value) => {
  if (value <= 20) return "Extreme Fear. Investors are very worried. Consider buying opportunities.";
  if (value <= 40) return "Fear. Selling pressure is high. Market may be oversold.";
  if (value <= 60) return "Neutral. Market sentiment is balanced.";
  if (value <= 80) return "Greed. Investors are optimistic. Market may be overbought.";
  return "Extreme Greed. Market is highly optimistic. Consider taking profits.";
};

export default FearGreedGauge;
```

src/styles/FearGreedGauge.css
```css
.fear-greed-gauge-container {
  --gauge-size: 200px;
  --label-font-size: 10px;
  --value-font-size: 24px;

  font-family: 'Inter', sans-serif;
  width: 100%;
  max-width: 350px;
  background: var(--bg2);
  border-radius: 12px;
  padding: 16px;
  border: 1px solid var(--border);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.gauge-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.gauge-header h3 {
  color: var(--t1);
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}

.gauge-value {
  color: var(--green);
  font-size: var(--value-font-size);
  font-weight: 700;
  min-width: 60px;
  text-align: right;
}

.gauge-wrapper {
  position: relative;
  width: var(--gauge-size);
  height: calc(var(--gauge-size) * 0.6);
  margin: 0 auto 12px;
}

.gauge-svg {
  width: 100%;
  height: 100%;
  display: block;
}

.gauge-needle {
  transition: stroke-dashoffset 0.8s ease-out;
}

.gauge-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: var(--label-font-size);
  color: var(--t3);
}

.label {
  text-align: center;
  flex: 1;
}

.extreme-fear { color: #ff0000; }
.fear { color: #ff6600; }
.neutral { color: var(--t2); }
.greed { color: #ccff00; }
.extreme-greed { color: var(--green); }

.gauge-description {
  color: var(--t2);
  font-size: 13px;
  line-height: 1.4;
  text-align: center;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .fear-greed-gauge-container {
    max-width: 400px;
    padding: 20px;
  }

  .gauge-header h3 {
    font-size: 18px;
  }

  .gauge-value {
    font-size: 28px;
  }

  .gauge-labels {
    font-size: 12px;
  }
}