import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchMultiplePrices } from '../hooks/useStockPrice';
import { TrendingUp } from 'lucide-react';

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
          <span style={{ fontSize: 14, fontWeight: 700, color: item.pct >= 0 ? 'var(--green)' : '#ff4d4d' }}>{fmt(item.pct)}</span>
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

export default function Dashboard() {
  const navigate = useNavigate();
  const { stocks } = useApp();
  const [livePrices, setLivePrices] = useState({});
  const [crypto, setCrypto] = useState([]);
  const [news, setNews] = useState([]);
  const name = localStorage.getItem('nexus_name') || 'Andrea';

  useEffect(() => {
    const syms = [...new Set(stocks.filter(s => !s.salePrice).map(s => s.symbol).filter(Boolean))];
    if (syms.length) fetchMultiplePrices(syms).then(setLivePrices);
  }, [stocks.length]);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana&order=market_cap_desc&sparkline=false&price_change_percentage=24h')
      .then(r => r.json()).then(d => setCrypto(Array.isArray(d) ? d : []));
  }, []);

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://feeds.bbci.co.uk/news/business/rss.xml') + '&count=3')
      .then(r => r.json()).then(d => setNews(d.items || []));
  }, []);

  const open = stocks.filter(s => !s.salePrice);
  const inv = open.reduce((s, i) => s + i.buyPrice * i.quantity, 0);
  const cur = open.reduce((s, i) => s + (livePrices[i.symbol] ?? i.buyPrice) * i.quantity, 0);
  const pnl = cur - inv;
  const isUp = pnl >= 0;

  return (
    <div className="page" style={{
      padding: '0 16px',
      backgroundColor: 'var(--bg)',
      color: 'var(--t1)',
      maxWidth: '520px',
      margin: '0 auto',
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh',
    }}>
      <div className="stagger-item" style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)' }}>
          {greeting()}, <span style={{ color: 'var(--green)' }}>{name}</span>
        </h1>
        <div className="hero-card" style={{
          padding: 16,
          borderRadius: 12,
          border: '2px solid var(--green)',
          backgroundColor: 'var(--bg2)',
          marginBottom: 16,
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--t1)' }}>Total P&L</h2>
          <span style={{ fontSize: 24, fontWeight: 800, color: isUp ? 'var(--green)' : '#ff4d4d', animation: 'fadeIn 1s' }}>{fmt(pnl)}</span>
        </div>
      </div>

      <Movers data={crypto.map(c => ({ name: c.name, pct: c.price_change_percentage_24h, color: c.color }))} />

      <News data={news} />

      <QuickActions actions={[{ name: 'Flights' }, { name: 'Markets' }, { name: 'Sports' }, { name: 'AnDy' }]} />
    </div>
  );
}