import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fetchMultiplePrices } from '../hooks/useStockPrice'
import { Plane, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownRight, Bot, ChartLine, Signal, Wallet, Newspaper } from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 6) return 'Bonne nuit'
  if (h < 12) return 'Bonjour'
  if (h < 18) return 'Bon après-midi'
  return 'Bonsoir'
}

function fmt(n, decimals = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}

function fmtPct(n) {
  if (n == null) return '—'
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}

function Sparkline({ data, color = 'var(--green)', width = 72, height = 28 }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 4) + 2}`).join(' ')
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
    </svg>
  )
}

function FGGauge({ value }) {
  const v = Math.max(0, Math.min(100, value))
  const color = v < 25 ? '#ff4d4d' : v < 45 ? '#fb923c' : v < 55 ? '#fbbf24' : v < 75 ? '#84cc16' : '#00ff88'
  const label = v < 25 ? 'Extrême peur' : v < 45 ? 'Peur' : v < 55 ? 'Neutre' : v < 75 ? 'Avidité' : 'Extrême avidité'
  const angle = Math.PI - (v / 100) * Math.PI
  const r = 38, cx = 50, cy = 46
  const nx = cx + r * Math.cos(angle), ny = cy + r * Math.sin(angle)
  const largeArc = v > 50 ? 1 : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginBottom: 12 }}>
      <svg width={100} height={54} viewBox="0 0 100 54">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--border)" strokeWidth="6" strokeLinecap="round" />
        {v > 0 && <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${nx} ${ny}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />}
        <circle cx={nx} cy={ny} r="4" fill={color} />
        <text x={cx} y={cy + 4} textAnchor="middle" fill="white" fontSize="15" fontWeight="800" fontFamily="Inter,system-ui">{v}</text>
      </svg>
      <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: '0.04em' }}>{label}</span>
    </div>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { stocks, sneakers } = useApp()
  const [livePrices, setLivePrices] = useState({})
  const [fearGreed, setFearGreed] = useState(null)
  const [crypto, setCrypto] = useState([])
  const [news, setNews] = useState([])
  const name = localStorage.getItem('nexus_name') || 'Andrea'

  useEffect(() => {
    const syms = [...new Set(stocks.filter(s => !s.salePrice).map(s => s.symbol).filter(Boolean))]
    if (syms.length) fetchMultiplePrices(syms).then(setLivePrices)
  }, [stocks.length])

  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1', { signal: AbortSignal.timeout(8000) })
      .then(r => r.json()).then(d => setFearGreed(d.data?.[0])).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin&order=market_cap_desc&sparkline=false&price_change_percentage=24h', { signal: AbortSignal.timeout(12000) })
      .then(r => r.json()).then(d => setCrypto(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://feeds.bbci.co.uk/news/business/rss.xml') + '&count=4', { signal: AbortSignal.timeout(10000) })
      .then(r => r.json()).then(d => setNews(d.items || [])).catch(() => {})
  }, [])

  const open = stocks.filter(s => !s.salePrice)
  const inv = open.reduce((s, i) => s + i.buyPrice * i.quantity, 0)
  const cur = open.reduce((s, i) => s + (livePrices[i.symbol] ?? i.buyPrice) * i.quantity, 0)
  const pnl = cur - inv
  const pnlPct = inv > 0 ? (pnl / inv) * 100 : 0
  const isUp = pnl >= 0
  const pos = open.length + sneakers.filter(s => !s.salePrice).length
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const fg = fearGreed ? parseInt(fearGreed.value) : null
  const sparkData = Array.from({ length: 8 }, (_, i) => cur * (0.97 + (i / 7) * 0.06 * (isUp ? 1 : -1) + Math.random() * 0.01))

  const coinColor = { bitcoin: '#f59e0b', ethereum: '#6366f1', solana: '#9945ff', binancecoin: '#f0b90b' }

  return (
    <div className="page" style={{
      paddingTop: 'max(60px, env(safe-area-inset-top, 0px))',
      backgroundColor: 'var(--bg)',
      color: 'var(--t1)',
      maxWidth: '520px',
      margin: '0 auto',
      padding: '0 16px',
      fontFamily: 'Inter, system-ui, sans-serif',
      minHeight: '100vh'
    }}>
      <style>
        {`
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
          .stagger-item {
            animation: fadeUp 0.4s ease-out forwards;
            opacity: 0;
          }
          .stagger-item:nth-child(1) { animation-delay: 0.1s; }
          .stagger-item:nth-child(2) { animation-delay: 0.2s; }
          .stagger-item:nth-child(3) { animation-delay: 0.3s; }
          .stagger-item:nth-child(4) { animation-delay: 0.4s; }
          .stagger-item:nth-child(5) { animation-delay: 0.5s; }
          .stagger-item:nth-child(6) { animation-delay: 0.6s; }
          .stagger-item:nth-child(7) { animation-delay: 0.7s; }
          .stagger-item:nth-child(8) { animation-delay: 0.8s; }
          .stagger-item:nth-child(9) { animation-delay: 0.9s; }
          .stagger-item:nth-child(10) { animation-delay: 1s; }

          .scroll-row {
            display: flex;
            gap: 8px;
            overflow-x: auto;
            scrollbar-width: none;
            -ms-overflow-style: none;
          }
          .scroll-row::-webkit-scrollbar { display: none; }

          .press-scale {
            transition: transform 0.15s ease, opacity 0.15s ease;
          }
          .press-scale:active {
            transform: scale(0.96);
          }

          .pill {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 6px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.02em;
          }
          .pill-up { background: rgba(0, 255, 136, 0.15); color: var(--green); }
          .pill-down { background: rgba(255, 77, 77, 0.15); color: #ff4d4d; }

          .section-label {
            font-size: 11px;
            font-weight: 700;
            color: var(--t2);
            text-transform: uppercase;
            letter-spacing: 0.12em;
          }

          .num {
            font-variant-numeric: tabular-nums;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
            margin-top: 16px;
          }

          .action-button {
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 16px;
            text-align: center;
            color: var(--t1);
            transition: background 0.3s;
            backdrop-filter: blur(12px);
          }
          .action-button:hover {
            background: rgba(255, 255, 255, 0.1);
          }
        `}
      </style>

      {/* Header */}
      <div className="stagger-item" style={{ marginBottom: 24 }}>
        <p style={{
          fontSize: 11,
          color: 'var(--t3)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.12em',
          marginBottom: 4
        }}>
          {today}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h1 style={{
            fontSize: 26,
            fontWeight: 800,
            color: 'var(--t1)',
            letterSpacing: '-0.3px',
            margin: 0
          }}>
            {greeting()}, <span style={{ color: 'var(--green)' }}>{name}</span>
          </h1>
          <div className="live-dot" style={{
            width: 10,
            height: 10,
            borderRadius: '50%',
            backgroundColor: 'var(--green)',
            animation: 'pulse 1s infinite',
            flexShrink: 0
          }} />
        </div>
      </div>

      {/* Portfolio Hero */}
      <button
        onClick={() => navigate('/portfolio')}
        className="press-scale stagger-item"
        style={{
          width: '100%',
          textAlign: 'left',
          marginBottom: 16,
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(12px)',
          border: `1px solid ${isUp ? 'rgba(0,255,136,0.2)' : 'rgba(255,77,77,0.2)'}`,
          borderRadius: '12px',
          padding: '24px',
          display: 'block',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 12,
              background: 'rgba(0,255,136,0.1)',
              border: '1px solid rgba(0,255,136,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <TrendingUp size={16} color="var(--green)" />
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--t2)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}>
              Portfolio
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div className="live-dot" style={{ width: 5, height: 5 }} />
            <span style={{
              fontSize: 10,
              color: 'var(--green)',
              fontWeight: 600
            }}>
              Live
            </span>
          </div>
        </div>

        <div style={{
          fontSize: 38,
          fontWeight: 900,
          color: 'var(--t1)',
          letterSpacing: '-1px',
          marginBottom: 8,
          lineHeight: 1
        }}>
          {fmt(cur)}
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isUp ? (
              <ArrowUpRight size={16} color="var(--green)" />
            ) : (
              <ArrowDownRight size={16} color="#ff4d4d" />
            )}
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: isUp ? 'var(--green)' : '#ff4d4d'
            }}>
              {fmt(Math.abs(pnl))}
            </span>
          </div>
          <span className={`pill ${isUp ? 'pill-up' : 'pill-down'}`}>
            {fmtPct(pnlPct)}
          </span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <Sparkline data={sparkData} />
        </div>
      </button>

      {/* Top Movers */}
      <div className="stagger-item" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--t1)',
          marginBottom: 12
        }}>Top Movers</h2>
        <div className="scroll-row">
          {crypto.map(c => (
            <div key={c.id} style={{
              background: 'rgba(255, 255, 255, 0.04)',
              borderRadius: '12px',
              padding: '16px',
              minWidth: 120,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  backgroundColor: coinColor[c.id],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white'
                }}>{c.symbol.toUpperCase()}</div>
                <span style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: 'var(--t1)'
                }}>{fmt(c.current_price)}</span>
              </div>
              <span style={{
                fontSize: 12,
                fontWeight: 500,
                color: c.price_change_percentage_24h >= 0 ? 'var(--green)' : '#ff4d4d'
              }}>
                {fmtPct(c.price_change_percentage_24h)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Fear & Greed Gauge */}
      <div className="stagger-item" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--t1)',
          marginBottom: 12
        }}>Fear & Greed</h2>
        <FGGauge value={fg} />
      </div>

      {/* News Feed */}
      <div className="stagger-item" style={{ marginBottom: 24 }}>
        <h2 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--t1)',
          marginBottom: 12
        }}>Dernières Nouvelles</h2>
        {news.slice(0, 3).map(n