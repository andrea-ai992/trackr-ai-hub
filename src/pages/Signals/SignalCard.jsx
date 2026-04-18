import React from 'react';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';

const SignalCard = ({ signal }) => {
  const getScoreColor = (score) => {
    if (score >= 70) return 'var(--green)';
    if (score >= 40) return '#ffd700';
    return '#ff4444';
  };

  const getIndicatorColor = (value, type) => {
    if (type === 'rsi') {
      if (value > 70) return 'var(--green)';
      if (value < 30) return '#ff4444';
      return '#ffd700';
    }

    if (type === 'macd') {
      return value > 0 ? 'var(--green)' : '#ff4444';
    }

    if (type === 'volume') {
      return value > 0 ? 'var(--green)' : '#ff4444';
    }

    return '#888';
  };

  const renderIndicator = (label, value, type) => {
    const color = getIndicatorColor(value, type);

    return (
      <div className="indicator-item">
        <span className="indicator-label">{label}</span>
        <div className="indicator-value-container">
          <span className="indicator-value" style={{ color }}>
            {value.toFixed(2)}
          </span>
          {type === 'rsi' && value > 70 && <TrendingUp size={16} color={color} />}
          {type === 'rsi' && value < 30 && <TrendingDown size={16} color={color} />}
          {type === 'macd' && <BarChart3 size={16} color={color} />}
        </div>
      </div>
    );
  };

  return (
    <div className="signal-card">
      <div className="signal-header">
        <h3 className="signal-title">{signal.symbol}</h3>
        <span className="signal-time">{signal.time}</span>
      </div>

      <div className="signal-score">
        <div className="score-container">
          <div
            className="score-circle"
            style={{ background: `conic-gradient(${getScoreColor(signal.score)} ${signal.score * 3.6}deg, #333 0deg)` }}
          >
            <span className="score-value">{signal.score}</span>
          </div>
          <span className="score-label">Score</span>
        </div>
      </div>

      <div className="signal-indicators">
        {renderIndicator('RSI', signal.rsi, 'rsi')}
        {renderIndicator('MACD', signal.macd, 'macd')}
        {renderIndicator('Volume', signal.volume, 'volume')}
      </div>

      <div className="signal-description">
        {signal.description}
      </div>

      <div className="signal-footer">
        <span className="signal-type">{signal.type}</span>
        <span className={`signal-status ${signal.status}`}>{signal.status}</span>
      </div>
    </div>
  );
};

export default SignalCard;
```

```css
.signal-card {
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(0, 255, 136, 0.3);

  width: 100%;
  max-width: 320px;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  margin: 8px 0;
  font-family: 'Inter', sans-serif;
  color: var(--t1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.signal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.signal-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--t1);
  margin: 0;
}

.signal-time {
  font-size: 12px;
  color: var(--t3);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.signal-score {
  display: flex;
  justify-content: center;
  margin: 12px 0;
}

.score-container {
  position: relative;
  width: 60px;
  height: 60px;
}

.score-circle {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(var(--green) 0deg, #333 0deg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.score-circle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  height: 80%;
  background: var(--bg2);
  border-radius: 50%;
}

.score-value {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
  position: relative;
  z-index: 1;
}

.score-label {
  display: block;
  text-align: center;
  font-size: 12px;
  color: var(--t3);
  margin-top: 8px;
}

.signal-indicators {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 16px 0;
}

.indicator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid var(--border);
}

.indicator-item:last-child {
  border-bottom: none;
}

.indicator-label {
  font-size: 14px;
  color: var(--t2);
}

.indicator-value-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.indicator-value {
  font-size: 14px;
  font-weight: 600;
}

.signal-description {
  font-size: 14px;
  color: var(--t2);
  line-height: 1.4;
  margin: 12px 0;
  padding: 8px 0;
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
}

.signal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.signal-type {
  font-size: 12px;
  color: var(--t3);
  background: rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
}

.signal-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 6px;
  font-weight: 600;
}

.signal-status.buy {
  color: var(--green);
  background: rgba(0, 255, 136, 0.1);
  border: 1px solid var(--green);
}

.signal-status.sell {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
}

.signal-status.hold {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid #ffd700;
}