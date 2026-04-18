import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchMultiplePrices } from '../hooks/useStockPrice';
import { TrendingUp } from 'lucide-react';
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
        <div key={i} className="stagger-item" style={{ padding: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 12, background: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={16} color="white" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.name}</span>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: item.pct >= 0 ? 'var(--green)' : '#ff4d4d' }}>{fmtPct(item.pct)}</span>
        </div>
      ))}
    </div>
  );
}

function News({ data }) {
  return (
    <div className="grid">
      {data.map((item, i) => (
        <div key={i} className="stagger-item" style={{ padding: 16 }}>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: 'var(--t1)' }}>{item.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.source}</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.time}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function QuickActions({ actions }) {
  return (
    <div className="grid">
      {actions.map((item, i) => (
        <div key={i} className="stagger-item">
          <button className="action-button">
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)' }}>{item.name}</span>
          </button>
        </div>
      ))}
    </div>
  );
}

function HeroCard({ value, pct, sparkline }) {
  return (
    <div className="hero-card" style={{
      padding: 16,
      borderRadius: 12,
      border: '2px solid var(--green)',
      backgroundColor: 'var(--bg2)',
      marginBottom: 16,
    }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>Total P&L</h2>
      <span style={{ fontSize: 24, fontWeight: 800, color: pct >= 0 ? 'var(--green)' : '#ff4d4d' }}>{fmt(value)}</span>
      <svg width="100%" height="24" viewBox="0 0 100 24">
        <path d="M 0 0 L 0 24 L 100 24 Z" fill="#fff" />
        {sparkline.map((point, i) => (
          <path key={i} d={`M ${i * 10} 0 L ${i * 10} ${point * 12} Z`} fill={point > 0 ? 'var(--green)' : '#ff4d4d'} />
        ))}
      </svg>
    </div>
  );
}

function FearGreedGauge({ value }) {
  const angle = (value / 100) * Math.PI;
  return (
    <svg width="100%" height="100%" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--t2)" strokeWidth="2" />
      <path d={`M 50 50 L 50 ${50 + 40 * Math.sin(angle)} Z`} fill={value > 50 ? 'var(--green)' : '#ff4d4d'} />
    </svg>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const { user, portfolio, news, movers, fearGreed } = useApp();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      const portfolioData = await fetchMultiplePrices(portfolio);
      const newsData = await fetchNews();
      const moversData = await fetchMovers();
      const fearGreedData = await fetchFearGreed();
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div className="skeleton-loader">
        <div className="skeleton-loader-item" style={{ height: 100, backgroundColor: 'var(--bg2)' }} />
        <div className="skeleton-loader-item" style={{ height: 100, backgroundColor: 'var(--bg2)' }} />
        <div className="skeleton-loader-item" style={{ height: 100, backgroundColor: 'var(--bg2)' }} />
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="header">
        <div className="header-content">
          <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--t1)' }}>{greeting()}</h1>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--t2)' }}>{new Date().toLocaleDateString()}</span>
          <button className="refresh-button" onClick={() => navigate('/refresh')}>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M 0 0 L 0 20 L 20 20 Z" fill="#fff" />
              <path d="M 10 0 L 10 20 Z" fill="#fff" />
            </svg>
          </button>
        </div>
      </header>
      <main className="content">
        <HeroCard value={portfolio.totalValue} pct={portfolio.pnl24h} sparkline={portfolio.sparkline} />
        <Movers data={movers} />
        <FearGreedGauge value={fearGreed} />
        <News data={news} />
        <QuickActions actions={[{ name: 'Flights' }, { name: 'Markets' }, { name: 'Sports' }, { name: 'AnDy' }]} />
      </main>
    </div>
  );
}

export default Dashboard;

.dashboard {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  background-color: var(--bg);
}

.header {
  position: sticky;
  top: 0;
  background-color: var(--bg);
  padding: 16px;
  border-bottom: 1px solid var(--border);
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.header-content > h1 {
  font-size: 24px;
  font-weight: 700;
  color: var(--t1);
}

.header-content > span {
  font-size: 14px;
  font-weight: 700;
  color: var(--t2);
}

.refresh-button {
  background-color: var(--green);
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}

.content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.hero-card {
  background-color: var(--bg2);
  padding: 16px;
  border: 2px solid var(--green);
  border-radius: 12px;
  margin-bottom: 16px;
}

.hero-card > h2 {
  font-size: 20px;
  font-weight: 700;
  color: var(--t1);
}

.hero-card > span {
  font-size: 24px;
  font-weight: 800;
  color: var(--green);
}

.scroll-row {
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  padding: 16px;
}

.stagger-item {
  padding: 12px;
  margin-right: 16px;
}

.stagger-item:last-child {
  margin-right: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.grid > div {
  padding: 16px;
  border: 1px solid var(--border);
  border-radius: 12px;
  background-color: var(--bg2);
}

.grid > div > h2 {
  font-size: 16px;
  font-weight: 800;
  color: var(--t1);
}

.grid > div > span {
  font-size: 11px;
  font-weight: 700;
  color: var(--t2);
}

.action-button {
  background-color: var(--green);
  border: none;
  padding: 8px 16px;
  font-size: 11px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
}

.skeleton-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
}

.skeleton-loader-item {
  height: 100px;
  background-color: var(--bg2);
  margin-bottom: 16px;
}

.fear-greed-gauge {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: var(--t2);
  padding: 16px;
}

.fear-greed-gauge > svg {
  width: 100%;
  height: 100%;
}

.fear-greed-gauge > svg > circle {
  stroke-width: 2;
  stroke: var(--t2);
}

.fear-greed-gauge > svg > path {
  fill: var(--green);
}