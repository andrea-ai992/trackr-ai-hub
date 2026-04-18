import { useState, useEffect } from 'react';

const FearGreedGauge = ({ value = 50, size = 200 }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    const startValue = displayValue;
    const endValue = Math.min(Math.max(value, 0), 100);
    const duration = 1000;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const newValue = startValue + (endValue - startValue) * easeProgress;
      setDisplayValue(Math.round(newValue));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const normalizedValue = Math.min(Math.max(displayValue, 0), 100);
  const angle = (normalizedValue / 100) * 180 - 90;

  return (
    <div className="fear-greed-gauge-container" style={{ width: size, height: size }}>
      <svg
        className="fear-greed-gauge"
        viewBox="0 0 200 100"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ff4757" />
            <stop offset={`${normalizedValue}%`} stopColor="#ffa502" />
            <stop offset={`${normalizedValue}%`} stopColor="#2ed573" />
            <stop offset="100%" stopColor="#2ed573" />
          </linearGradient>
        </defs>

        <g transform="translate(0, 50)">
          <path
            d="M 20 0 A 80 80 0 0 1 180 0"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />
          <path
            d="M 20 0 A 80 80 0 0 1 180 0"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="4"
            strokeDasharray="4,4"
            strokeDashoffset={80 - (normalizedValue / 100) * 160}
            transform="rotate(-90 100 0)"
          />
          <path
            d="M 100 0 L 100 -10 L 110 -10 L 100 0 Z"
            fill="var(--green)"
            transform={`rotate(${angle} 100 0)`}
          />
        </g>
      </svg>

      <div className="gauge-value">
        {displayValue}
      </div>

      <div className="gauge-labels">
        <span className="label-extreme">0</span>
        <span className="label-extreme">100</span>
      </div>

      <div className="gauge-title">Fear & Greed Index</div>
    </div>
  );
};

export default FearGreedGauge;
```

```css
.fear-greed-gauge-container {
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--t1);
  position: relative;
}

.fear-greed-gauge {
  transition: transform 0.3s ease;
}

.gauge-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--green);
  text-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
}

.gauge-labels {
  display: flex;
  justify-content: space-between;
  width: 100%;
  font-size: 0.8rem;
  color: var(--t3);
  padding: 0 20px;
  box-sizing: border-box;
}

.gauge-title {
  font-size: 0.9rem;
  color: var(--t2);
  text-align: center;
}

@media (max-width: 600px) {
  .gauge-value {
    font-size: 1.5rem;
  }

  .gauge-labels {
    font-size: 0.7rem;
  }

  .gauge-title {
    font-size: 0.8rem;
  }
}