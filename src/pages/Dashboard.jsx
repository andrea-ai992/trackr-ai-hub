import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { fetchMultiplePrices } from '../hooks/useStockPrice';
import { Plane, Languages, ExternalLink, ChevronRight, TrendingUp, Zap } from 'lucide-react';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

function fmtUSD(n) {
  if (n == null) return '—';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function Sparkline({ data, color = '#6366f1', width = 80, height = 28 }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) + 1}`).join(' ');
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id="spark-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={1} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={`url(#spark-grad)`} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function FearGreedGauge({ value }) {
  const clamped = Math.max(0, Math.min(100, value));
  const color = clamped < 25 ? '#ef4444' : clamped < 45 ? '#f97316' : clamped < 55 ? '#eab308' : clamped < 75 ? '#84cc16' : '#22c55e';
  const r = 40, cx = 56, cy = 52;
  const angle = Math.PI - (clamped / 100) * Math.PI;
  const needle = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  const sx = cx - r, ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle);
  const largeArc = clamped > 50 ? 1 : 0;
  return (
    <svg width={112} height={60} viewBox="0 0 112 60">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" strokeLinecap="round" />
      {clamped > 0 && <path d={`M ${sx} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />}
      <circle cx={needle.x} cy={needle.y} r="5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="17" fontWeight="800" fontFamily="system-ui">{value}</text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { stocks, sneakers } = useApp();
  const [livePrices, setLivePrices] = useState({});
  const [fearGreed, setFearGreed] = useState(null);
  const [topMovers, setTopMovers] = useState([]);
  const [flightCount, setFlightCount] = useState(null);
  const [news, setNews] = useState([]);
  const userName = localStorage.getItem('nexus_name') || 'there';

  useEffect(() => {
    const syms = [...new Set(stocks.filter(s => !s.salePrice).map(s => s.symbol).filter(Boolean))];
    if (syms.length) fetchMultiplePrices(syms).then(setLivePrices);
  }, [stocks.length]);

  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1', { signal: AbortSignal.timeout(8000) })
      .then(r => r.json()).then(d => setFearGreed(d.data?.[0])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano&order=market_cap_desc&sparkline=false&price_change_percentage=24h', { signal: AbortSignal.timeout(12000) })
      .then(r => r.json()).then(d => setTopMovers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://opensky-network.org/api/states/all', { signal: AbortSignal.timeout(15000) })
      .then(r => r.json())
      .then(d => setFlightCount((d.states || []).filter(s => !s[8] && s[5] != null && s[6] != null).length))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://feeds.bbci.co.uk/news/business/rss.xml') + '&count=3', { signal: AbortSignal.timeout(10000) })
      .then(r => r.json()).then(d => setNews(d.items || [])).catch(() => {});
  }, []);

  const openStocks = stocks.filter(s => !s.salePrice);
  const totalInvested = openStocks.reduce((s, i) => s + i.buyPrice * i.quantity, 0);
  const totalCurrent = openStocks.reduce((s, i) => s + (livePrices[i.symbol] ?? i.buyPrice) * i.quantity, 0);
  const totalPnL = totalCurrent - totalInvested;
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;
  const positions = openStocks.length + sneakers.filter(s => !s.salePrice).length;
  const sparkData = [0.98, 1.01, 0.99, 1.03, 1.01, 1.04, 1.0 + totalPnLPct / 200].map(m => totalCurrent * m);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const fg = fearGreed ? parseInt(fearGreed.value) : null;
  const fgLabel = fg == null ? '' : fg < 25 ? 'Extreme Fear' : fg < 45 ? 'Fear' : fg < 55 ? 'Neutral' : fg < 75 ? 'Greed' : 'Extreme Greed';
  const isUp = totalPnL >= 0;

  return (
    <div style={{
      maxWidth: 520,
      margin: '0 auto',
      padding: '0 16px 24px',
      backgroundColor: '#080808',
      color: '#e0e0e0',
    }}>

      {/* Header */}
      <div style={{
        paddingTop: 'max(56px, env(safe-area-inset-top, 0px))',
        paddingBottom: 20,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}>
          <span style={{
            fontSize: 12,
            color: '#4b6070',
            fontWeight: 600,
            marginBottom: 3,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            fontFamily: "'JetBrains Mono', monospace",
          }}>{today}</span>
          <h1 style={{
            fontSize: 28,
            fontWeight: 800,
            color: '#e0e0e0',
            letterSpacing: '-0.5px',
            lineHeight: 1.15,
            fontFamily: "'JetBrains Mono', monospace",
          }}>{greeting()}, <span style={{
            background: 'linear-gradient(135deg,#818cf8,#c084fc)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>{userName}</span></h1>
        </div>
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          fontSize: 12,
          color: '#e0e0e0',
          fontWeight: 600,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: 8,
          borderRadius: 20,
          boxShadow: '0 0 4px rgba(0,255,136,0.5)',
        }}>
          <span style={{
            width: 6,
            height: 6,
            borderRadius: '50%',
            background: '#00ff88',
            boxShadow: '0 0 6px #00ff88',
            display: 'inline-block',
          }} className="live-ping" />
          <span style={{
            fontSize: 11,
            color: '#00ff88',
            fontWeight: 600,
          }}>Live</span>
        </button>
      </div>

      {/* ── Portfolio Hero Card ── */}
      <button onClick={() => navigate('/markets')} style={{
        width: '100%',
        textAlign: 'left',
        marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.09) 100%)',
        border: '1px solid rgba(99,102,241,0.22)',
        borderRadius: 24,
        padding: '22px 20px',
        boxShadow: '0 0 40px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#111',
        color: '#e0e0e0',
      }}>
        {/* Subtle grid pattern */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)',
          backgroundSize: '28px 28px',
          borderRadius: 28,
        }} />

        <div style={{
          position: 'relative',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            <div style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              background: 'rgba(99,102,241,0.25)',
              border: '1px solid rgba(99,102,241,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <TrendingUp size={14} color="#818cf8" />
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: '#818cf8',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}>Portfolio</span>
            <div style={{
              marginLeft: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 6px #00ff88',
                display: 'inline-block',
              }} className="live-ping" />
              <span style={{
                fontSize: 11,
                color: '#00ff88',
                fontWeight: 600,
              }}>Live</span>
            </div>
          </div>

          <div style={{
            fontSize: 42,
            fontWeight: 900,
            color: '#e0e0e0',
            letterSpacing: '-1px',
            marginBottom: 6,
            fontVariantNumeric: 'tabular-nums',
          }}>
            {fmtUSD(totalCurrent)}
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: isUp ? '#00ff88' : '#ef4444',
              filter: isUp ? 'drop-shadow(0 0 4px rgba(0,255,136,0.5))' : 'drop-shadow(0 0 4px rgba(239,68,68,0.5))',
            }}>
              {isUp ? '+' : ''}{fmtUSD(totalPnL)}
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              background: isUp ? 'rgba(0,255,136,0.15)' : 'rgba(239,68,68,0.15)',
              color: isUp ? '#00ff88' : '#ef4444',
              border: `1px solid ${isUp ? 'rgba(0,255,136,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              {isUp ? '+' : ''}{totalPnLPct.toFixed(2)}%
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,0.07)',
          }}>
            <span style={{
              fontSize: 13,
              color: '#6b7280',
            }}>{positions} position{positions !== 1 ? 's' : ''}</span>
            <Sparkline data={sparkData} color={isUp ? '#00ff88' : '#ef4444'} width={80} height={26} />
          </div>
        </div>
      </button>

      {/* ── Top Movers ── */}
      {topMovers.length > 0 && (
        <div style={{
          marginBottom: 16,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 10,
            paddingLeft: 2,
          }}>
            <span className="section-label">Crypto Movers</span>
            <button onClick={() => navigate('/markets?tab=crypto')} style={{
              display: 'flex',
              alignItems: 'center',
              gap: 3,
              fontSize: 12,
              color: '#6366f1',
              fontWeight: 700,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 8,
              borderRadius: 20,
              boxShadow: '0 0 4px rgba(0,255,136,0.5)',
            }}>
              <span style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#00ff88',
                boxShadow: '0 0 6px #00ff88',
                display: 'inline-block',
              }} className="live-ping" />
              <span style={{
                fontSize: 11,
                color: '#00ff88',
                fontWeight: 600,
              }}>Live</span>
            </button>
          </div>

          <div style={{
            overflowX: 'auto',
            scrollSnapType: 'x mandatory',
            scrollBehavior: 'smooth',
            padding: '16px 0',
            backgroundColor: '#111',
            color: '#e0e0e0',
          }}>
            {topMovers.map((m, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '16px',
                backgroundColor: '#111',
                color: '#e0e0e0',
                borderLeft: '4px solid',
                borderColor: m.price_change_percentage_24h > 0 ? '#00ff88' : '#ef4444',
                scrollSnapAlign: 'start',
              }}>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: '#e0e0e0',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                }}>{m.symbol}</span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: m.price_change_percentage_24h > 0 ? '#00ff88' : '#ef4444',
                }}>{m.current_price}</span>
                <span style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: m.price_change_percentage_24h > 0 ? '#00ff88' : '#ef4444',
                }}>{m.price_change_percentage_24h.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Fear & Greed Gauge ── */}
      {fearGreed && (
        <div style={{
          marginBottom: 16,
        }}>
          <div style={{
            display: 'flex',
            alignItems