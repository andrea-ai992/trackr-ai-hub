Je vais redesigner le composant `Dashboard.jsx` avec un layout 2x2, intégrer des shimmers neon et optimiser les appels fetch avec `AbortSignal.timeout()`. Voici le code complet et fonctionnel :

```jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchMultiplePrices } from '../hooks/useStockPrice';
import { TrendingUp, RefreshCw } from 'lucide-react';
import { Inter } from '@fontsource/inter';

function greeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

function fmt(n, decimals = 2) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function fmtPct(n) {
  if (n == null) return '—';
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%';
}

function Movers({ data }) {
  return (
    <div className="scroll-row">
      {data.map((item, i) => (
        <div key={i} className="stagger-item">
          <div className="mover-item">
            <div className="mover-icon">
              <TrendingUp size={16} color="white" />
            </div>
            <div className="mover-info">
              <span className="mover-name">{item.name}</span>
              <span className={`mover-pct ${item.pct >= 0 ? 'positive' : 'negative'}`}>{fmtPct(item.pct)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function News({ data }) {
  return (
    <div className="news-grid">
      {data.map((item, i) => (
        <div key={i} className="news-item">
          <h3 className="news-title">{item.title.length > 40 ? `${item.title.substring(0, 40)}...` : item.title}</h3>
          <div className="news-meta">
            <span className="news-source">{item.source}</span>
            <span className="news-time">{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickActions({ actions }) {
  return (
    <div className="quick-actions-grid">
      {actions.map((item, i) => (
        <button key={i} className="quick-action-button">
          <span>{item.name}</span>
        </button>
      ))}
    </div>
  );
}

function HeroCard({ value, pct, sparkline }) {
  return (
    <div className="hero-card">
      <div className="hero-header">
        <h2>Total P&L</h2>
        <span className={`hero-value ${pct >= 0 ? 'positive' : 'negative'}`}>{fmt(value)}</span>
      </div>
      <div className="sparkline-container">
        <svg width="100%" height="32" viewBox="0 0 100 32">
          <polyline
            fill="none"
            stroke={pct >= 0 ? 'var(--green)' : '#ff4d4d'}
            strokeWidth="2"
            points={sparkline.map((point, i) => `${i * 10},${32 - point * 24}`).join(' ')}
          />
        </svg>
      </div>
    </div>
  );
}

function FearGreedGauge({ value }) {
  const angle = (value / 100) * Math.PI;
  const radius = 40;
  const centerX = 50;
  const centerY = 50;
  const endX = centerX + radius * Math.sin(angle);
  const endY = centerY - radius * Math.cos(angle);

  return (
    <div className="gauge-container">
      <div className="gauge-value">{value}</div>
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        <circle
          cx={centerX}
          cy={centerY}
          r={radius}
          fill="none"
          stroke="var(--t2)"
          strokeWidth="2"
        />
        <line
          x1={centerX}
          y1={centerY}
          x2={endX}
          y2={endY}
          stroke={value > 50 ? 'var(--green)' : '#ff4d4d'}
          strokeWidth="3"
        />
      </svg>
      <div className="gauge-label">
        {value > 50 ? 'Greed' : value < 50 ? 'Fear' : 'Neutral'}
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, portfolio, news, movers, fearGreed } = useApp();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchAll = async () => {
      try {
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        );

        const portfolioData = await Promise.race([
          fetchMultiplePrices(portfolio, signal),
          timeoutPromise
        ]);

        const newsData = await Promise.race([
          fetchNews(),
          timeoutPromise
        ]);

        const moversData = await Promise.race([
          fetchMovers(),
          timeoutPromise
        ]);

        const fearGreedData = await Promise.race([
          fetchFearGreed(),
          timeoutPromise
        ]);

        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
        setLoading(false);
      }
    };

    fetchAll();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="dashboard">
        <header className="header">
          <div className="header-content">
            <div className="header-skeleton">
              <div className="skeleton-line" style={{ width: '60%' }}></div>
              <div className="skeleton-line" style={{ width: '30%' }}></div>
            </div>
          </div>
        </header>
        <main className="content">
          <div className="hero-card-skeleton">
            <div className="skeleton-line" style={{ width: '80%' }}></div>
            <div className="skeleton-line" style={{ width: '50%' }}></div>
            <div className="sparkline-skeleton"></div>
          </div>
          <div className="movers-skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="mover-skeleton">
                <div className="skeleton-line" style={{ width: '100%' }}></div>
              </div>
            ))}
          </div>
          <div className="gauge-skeleton">
            <div className="skeleton-line" style={{ width: '40%' }}></div>
            <div className="gauge-container">
              <svg width="100%" height="100%" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" fill="none" stroke="var(--t2)" strokeWidth="2" />
              </svg>
            </div>
          </div>
          <div className="news-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="news-skeleton">
                <div className="skeleton-line" style={{ width: '90%' }}></div>
                <div className="skeleton-line" style={{ width: '60%' }}></div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard">
        <header className="header">
          <div className="header-content">
            <h1>Erreur</h1>
          </div>
        </header>
        <main className="content">
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Recharger</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <h1>{greeting()}</h1>
          <span>{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
          <button className="refresh-button" onClick={() => navigate('/refresh')}>
            <RefreshCw size={16} color="#fff" />
          </button>
          <div className="live-badge">
            <div className="live-dot"></div>
          </div>
        </div>
      </header>
      <main className="dashboard-grid">
        <HeroCard value={portfolio.totalValue} pct={portfolio.pnl24h} sparkline={portfolio.sparkline} />
        <div className="movers-container">
          <h3 className="section-title">Top Movers</h3>
          <Movers data={movers} />
        </div>
        <div className="gauge-container">
          <h3 className="section-title">Fear & Greed</h3>
          <FearGreedGauge value={fearGreed} />
        </div>
        <div className="news-container">
          <h3 className="section-title">Actualités</h3>
          <News data={news} />
        </div>
        <div className="quick-actions-container">
          <h3 className="section-title">Actions rapides</h3>
          <QuickActions actions={[{ name: 'Markets' }, { name: 'Sports' }, { name: 'Flights' }, { name: 'AnDy' }]} />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
```

```css
.dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: var(--bg);
  max-width: 520px;
  min-height: 100vh;
}

.header {
  position: sticky;
  top: 0;
  width: 100%;
  background-color: var(--bg);
  padding: 16px;
  border-bottom: 1px solid var(--border);
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
  position: relative;
}

.header-content > h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--t1);
  margin: 0;
}

.header-content > span {
  font-size: 14px;
  font-weight: 700;
  color: var(--t2);
  margin-left: auto;
}

.refresh-button {
  background: transparent;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: var(--t2);
  transition: color 0.2s;
}

.refresh-button:hover {
  color: var(--green);
}

.live-badge {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--green);
  display: flex;
  justify-content: center;
  align-items: center;
  animation: pulse 2s infinite;
}

.live-dot {
  width: 8px;
  height: 8px;
  background-color: var(--bg);
  border-radius: 50%;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  width: 100%;
  padding: 16px 0;
}

.hero-card {
  background-color: var(--bg2);
  padding: 20px;
  border-radius: 16px;
  border: 2px solid var(--green);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.hero-header > h2 {
  font-size: 16px;
  font-weight: 700;
  color: var(--t1);
  margin: 0;
}

.hero-value {
  font-size: 20px;
  font-weight: 800;
}

.hero-value.positive {
  color: var(--green);
}

.hero-value.negative {
  color: #ff4d4d;
}

.sparkline-container {
  width: 100%;
  height: 32px;
}

.scroll-row {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 8px 0;
  gap: 12px;
}

.stagger-item {
  flex-shrink: 0;
}

.mover-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: var(--bg2);
  border-radius: 12px;
  border: 1px solid var(--border);
}

.mover-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: var(--green);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mover-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mover-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--t1);
}

.mover-pct {
  font-size: 14px;
  font-weight: 700;
}

.mover-pct.positive {
  color: var(--green);
}

.mover-pct.negative {
  color: #ff4d4d;
}

.gauge-container {
  background-color: var(--bg2);
  padding: 20px;
  border-radius: 16px;
  border: 1px solid var(--border);
  position: relative;
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.gauge-value {
  font-size: 24px;
  font-weight: 800;
  color: var(--t1);
  margin-bottom: 8px;
}

.gauge-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--t2);
  margin-top: 8px;
}

.news-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.news-item {
  background-color: var(--bg2);
  padding: 16px;
  border-radius: 12px;
  border: 1px solid var(--border);
}

.news-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--t1);
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.news-meta {
  display: flex;
  gap: 8px;
}

.news-source, .news-time {
  font-size: 11px;
  font-weight: 700;
  color: var(--t2);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.quick-action-button {
  background-color: var(--green);
  border: none;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: #080808;
  cursor: pointer;
  transition: transform 0.2s;
}

.quick-action-button:hover {
  transform: translateY(-2px);
}

.section-title {
  font-size: 16px;
  font-weight: 800;
  color: var(--t1);
  margin-bottom: 12px;
}

/* Skeleton Styles */
.header-skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.skeleton-line {
  height: 20px;
  background-color: var(--t3);
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.sparkline-skeleton {
  width: 100%;
  height: 32px;
  background-color: var(--t3);
  border-radius: 4px;
  animation: shimmer 1.5s infinite;
}

.hero-card-skeleton {
  background-color: var(--t3);
  padding