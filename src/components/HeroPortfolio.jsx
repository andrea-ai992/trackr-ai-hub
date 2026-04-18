src/components/HeroPortfolio.jsx
```jsx
import { useState } from 'react';
import './HeroPortfolio.css';

const HeroPortfolio = () => {
  const [isHovered, setIsHovered] = useState(false);

  const portfolioValue = 124856.32;
  const dailyChange = 2.45;
  const dailyChangePercent = 1.98;

  return (
    <div className="hero-portfolio-container">
      <div
        className={`hero-card ${isHovered ? 'hovered' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="hero-header">
          <h2 className="hero-title">Portfolio</h2>
          <div className="hero-value">${portfolioValue.toLocaleString()}</div>
        </div>

        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-label">Daily Change</div>
            <div className={`stat-value ${dailyChange >= 0 ? 'positive' : 'negative'}`}>
              {dailyChange >= 0 ? '+' : ''}{dailyChange}
            </div>
            <div className={`stat-percent ${dailyChangePercent >= 0 ? 'positive' : 'negative'}`}>
              {dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent}%
            </div>
          </div>
        </div>

        <div className="hero-actions">
          <button className="action-button">Deposit</button>
          <button className="action-button secondary">Withdraw</button>
        </div>
      </div>
    </div>
  );
};

export default HeroPortfolio;
```

src/styles/HeroPortfolio.css
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

.hero-portfolio-container {
  width: 100%;
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.hero-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 1.5rem;
  background: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  overflow: hidden;
}

.hero-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 12px;
  background: radial-gradient(circle at 50% 50%, rgba(0, 255, 136, 0.1) 0%, transparent 70%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.hero-card.hovered::before {
  opacity: 1;
}

.hero-card.hovered {
  box-shadow: 0 0 20px rgba(0, 255, 136, 0.3),
              0 0 40px rgba(0, 255, 136, 0.2),
              0 0 60px rgba(0, 255, 136, 0.1);
  transform: translateY(-2px);
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.hero-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--t1);
  margin: 0;
}

.hero-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--green);
}

.hero-stats {
  margin-bottom: 1.5rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--t2);
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
}

.stat-value.positive {
  color: var(--green);
}

.stat-value.negative {
  color: #ff4444;
}

.stat-percent {
  font-size: 0.8rem;
}

.stat-percent.positive {
  color: var(--green);
}

.stat-percent.negative {
  color: #ff4444;
}

.hero-actions {
  display: flex;
  gap: 0.75rem;
}

.action-button {
  flex: 1;
  padding: 0.75rem;
  background: var(--green);
  color: var(--bg);
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.action-button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.action-button.secondary {
  background: transparent;
  color: var(--t1);
  border: 1px solid var(--border);
}

.action-button.secondary:hover {
  background: rgba(255, 255, 255, 0.05);
}

@media (min-width: 768px) {
  .hero-card {
    max-width: 450px;
  }

  .hero-header {
    margin-bottom: 2rem;
  }

  .hero-actions {
    gap: 1rem;
  }
}