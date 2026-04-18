import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fetchMultiplePrices } from '../hooks/useStockPrice'
import { Plane, Languages, ExternalLink, ChevronRight, TrendingUp, Zap, TrendingDown, Wallet, ChartLine, Bell, Settings, Bitcoin, Ethereum, Dogecoin, Cardano, Solana, Ripple } from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function fmtUSD(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtPct(n) {
  if (n == null) return '—'
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}

function Sparkline({ data, color = '#00ff88', width = 80, height = 28 }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / range) * (height - 2) + 1}`).join(' ')
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
  )
}

function FearGreedGauge({ value }) {
  const clamped = Math.max(0, Math.min(100, value))
  const color = clamped < 25 ? '#ef4444' : clamped < 45 ? '#f97316' : clamped < 55 ? '#eab308' : clamped < 75 ? '#84cc16' : '#22c55e'
  const r = 40, cx = 56, cy = 52
  const angle = Math.PI - (clamped / 100) * Math.PI
  const needle = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) }
  const sx = cx - r, ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle)
  const largeArc = clamped > 50 ? 1 : 0
  return (
    <svg width={112} height={60} viewBox="0 0 112 60">
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--border)" strokeWidth="7" strokeLinecap="round" />
      {clamped > 0 && <path d={`M ${sx} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />}
      <circle cx={needle.x} cy={needle.y} r="5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="17" fontWeight="800" fontFamily="JetBrains Mono">{value}</text>
    </svg>
  )
}

function NewsItem({ item }) {
  const ago = (() => {
    const now = new Date()
    const then = new Date(item.pubDate)
    const diff = now - then
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins}min`
    const hours = Math.floor(mins / 60)
    return `${hours}h`
  })()

  const sources = {
    'bbc.com': { color: '#007bff', name: 'BBC' },
    'reuters.com': { color: '#ff6600', name: 'Reuters' },
    'ft.com': { color: '#003366', name: 'FT' },
    'bloomberg.com': { color: '#0066cc', name: 'Bloomberg' },
    'cnbc.com': { color: '#008080', name: 'CNBC' }
  }

  const source = sources[new URL(item.link).hostname] || { color: '#666', name: 'News' }

  return (
    <article style={{ display: 'flex', flexDirection: 'column', gap: 6, padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: source.color, padding: '2px 8px', borderRadius: 12, background: `${source.color}20`, border: `1px solid ${source.color}30` }}>{source.name}</span>
        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ago}</span>
      </div>
      <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.4 }}>{item.title}</h3>
    </article>
  )
}

function QuickAction({ icon: Icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
        backdropFilter: 'blur(12px)',
        transition: 'all 0.2s ease',
        fontFamily: 'JetBrains Mono',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--text-primary)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
        e.currentTarget.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      <Icon size={20} color="var(--neon)" />
      <span>{label}</span>
    </button>
  )
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { stocks, sneakers } = useApp()
  const [livePrices, setLivePrices] = useState({})
  const [fearGreed, setFearGreed] = useState(null)
  const [topMovers, setTopMovers] = useState([])
  const [flightCount, setFlightCount] = useState(null)
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const userName = localStorage.getItem('nexus_name') || 'there'

  useEffect(() => {
    const syms = [...new Set(stocks.filter(s => !s.salePrice).map(s => s.symbol).filter(Boolean))]
    if (syms.length) fetchMultiplePrices(syms).then(setLivePrices)
  }, [stocks.length])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fgRes, moversRes, newsRes] = await Promise.allSettled([
          fetch('https://api.alternative.me/fng/?limit=1', { signal: AbortSignal.timeout(8000) }),
          fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano,dogecoin,ripple&order=market_cap_desc&sparkline=false&price_change_percentage=24h', { signal: AbortSignal.timeout(12000) }),
          fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://feeds.bbci.co.uk/news/business/rss.xml') + '&count=3', { signal: AbortSignal.timeout(10000) })
        ])

        if (fgRes.status === 'fulfilled' && fgRes.value.ok) {
          const d = await fgRes.value.json()
          setFearGreed(d.data?.[0])
        }

        if (moversRes.status === 'fulfilled' && moversRes.value.ok) {
          const d = await moversRes.value.json()
          setTopMovers(Array.isArray(d) ? d : [])
        }

        if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
          const d = await newsRes.value.json()
          setNews(d.items || [])
        }
      } catch (e) {}
      setLoading(false)
    }
    fetchData()
  }, [])

  useEffect(() => {
    fetch('https://opensky-network.org/api/states/all', { signal: AbortSignal.timeout(15000) })
      .then(r => r.json())
      .then(d => setFlightCount((d.states || []).filter(s => !s[8] && s[5] != null && s[6] != null).length))
      .catch(() => {})
  }, [])

  const openStocks = stocks.filter(s => !s.salePrice)
  const totalInvested = openStocks.reduce((s, i) => s + i.buyPrice * i.quantity, 0)
  const totalCurrent = openStocks.reduce((s, i) => s + (livePrices[i.symbol] ?? i.buyPrice) * i.quantity, 0)
  const totalPnL = totalCurrent - totalInvested
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  const positions = openStocks.length + sneakers.filter(s => !s.salePrice).length
  const sparkData = [0.98, 1.01, 0.99, 1.03, 1.01, 1.04, 1.0 + totalPnLPct / 200].map(m => totalCurrent * m)
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const fg = fearGreed ? parseInt(fearGreed.value) : null
  const fgLabel = fg == null ? '' : fg < 25 ? 'Extreme Fear' : fg < 45 ? 'Fear' : fg < 55 ? 'Neutral' : fg < 75 ? 'Greed' : 'Extreme Greed'
  const isUp = totalPnL >= 0

  const coinIcons = {
    bitcoin: <Bitcoin size={16} />,
    ethereum: <Ethereum size={16} />,
    solana: <Solana size={16} />,
    binancecoin: <Ripple size={16} />,
    cardano: <Cardano size={16} />,
    dogecoin: <Dogecoin size={16} />,
    ripple: <Ripple size={16} />
  }

  return (
    <div style={{
      maxWidth: 520,
      margin: '0 auto',
      padding: '0 16px 24px',
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      fontFamily: 'JetBrains Mono',
      color: 'var(--text-primary)',
      position: 'relative'
    }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stagger-item { animation: fadeInUp 0.3s ease-out forwards; }
        .stagger-item:nth-child(1) { animation-delay: 0.06s; }
        .stagger-item:nth-child(2) { animation-delay: 0.12s; }
        .stagger-item:nth-child(3) { animation-delay: 0.18s; }
        .stagger-item:nth-child(4) { animation-delay: 0.24s; }
        .stagger-item:nth-child(5) { animation-delay: 0.30s; }
        .stagger-item:nth-child(6) { animation-delay: 0.36s; }
        .stagger-item:nth-child(7) { animation-delay: 0.42s; }
        .stagger-item:nth-child(8) { animation-delay: 0.48s; }
        .live-ping {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .skeleton {
          background: linear-gradient(90deg, var(--surface-low) 25%, var(--surface) 50%, var(--surface-low) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        .press-scale:active { transform: scale(0.96); }
      `}</style>

      {/* Header */}
      <div className="stagger-item" style={{ paddingTop: 'max(56px, env(safe-area-inset-top, 0px))', paddingBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{today}</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          {greeting()}, <span style={{ color: 'var(--neon)' }}>{userName}</span>
        </h1>
      </div>

      {/* ── Portfolio Hero Card ── */}
      <button
        onClick={() => navigate('/markets')}
        className="press-scale stagger-item"
        style={{
          width: '100%',
          textAlign: 'left',
          marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(0,255,136,0.08) 0%, rgba(0,255,136,0.04) 100%)',
          border: '1px solid var(--border)',
          borderRadius: 24,
          padding: '22px 20px',
          boxShadow: '0 0 40px rgba(0,255,136,0.1), 0 8px 32px rgba(0,0,0,0.4)',
          position: 'relative',
          overflow: 'hidden',
          backdropFilter: 'blur(12px)'
        }}
      >
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(0,255,136,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,136,0.03) 1px,transparent 1px)', backgroundSize: '28px 28px', borderRadius: 28 }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(0,255,136,0.25)', border: '1px solid var(--neon)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="var(--neon)" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Portfolio</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} className="live-ping" />
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Live</span>
            </div>
          </div>

          <div style={{ fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
            {loading ? <span className="skeleton" style={{ display: 'inline-block', width: '60%', height: 42, borderRadius: 4 }} /> : fmtUSD(totalCurrent)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{
              fontSize: 16,
              fontWeight: 700,
              color: isUp ? '#10b981' : '#ef4444',
              filter: isUp ? 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' : 'drop-shadow(0 0 4px rgba(239,68,68,0.5))'
            }}>
              {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 80, height: 16, borderRadius: 4 }} /> : (isUp ? '+' : '') + fmtUSD(totalPnL)}
            </span>
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '3px 10px',
              borderRadius: 20,
              background: isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: isUp ? '#10b981' : '#ef4444',
              border: `1px solid ${isUp ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`
            }}>
              {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 40, height: 14, borderRadius: 7 }} /> : fmtPct(totalPnLPct)}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              {loading ? <span className="skeleton" style={{ display: 'inline-block', width: 60, height: 12, borderRadius: 4 }} /> : `${positions} position${positions !== 1 ? 's' : ''}`}
            </span>
            {loading ? <div style={{ width: 80, height: 26 }} className="skeleton" /> : <Sparkline data={sparkData} color={isUp ? '#10b981' : '#ef4444'} width={80} height={26} />}
          </div>
        </div>
      </button>

      {/* ── Top Movers ── */}
      <div className="stagger-item" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 2 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--neon)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Top Movers</span>
          <button onClick={() => navigate('/markets')} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--neon)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>
            View all <ChevronRight size={14} />
          </button>
        </div>

        <div style={{
          display: 'flex',
          gap: 12,
          overflowX: 'auto',
          paddingBottom: 8,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {topMovers.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ minWidth: 120, padding: 12, borderRadius: 16, background: 'var(--surface)', border: '1px solid var(--border)' }} className="skeleton" />
            ))
          ) : (
            topMovers.map((coin) => {
              const change = coin.price_change_percentage_24h || 0
              const isPositive = change >= 0
              return (
                <button
                  key={coin.id}
                  onClick={() => navigate(`/markets?tab=crypto&coin=${coin.id}`)}
                  style={{
                    minWidth: 120,
                    padding: 12,
                    borderRadius: 16,
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(12px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--surface-high)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--surface)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: 6,
                      background: 'var(--surface-low)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                      color: 'white'
                    }}>
                      {coinIcons[coin.id] || coin.symbol.toUpperCase().slice(0, 2)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{coin.symbol.toUpperCase()}</span>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>{fmtUSD(coin.current_price)}</div>
                  <div style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: isPositive ? '#10b981' : '#ef4444',
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: isPositive ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
                    border: `1px solid ${isPositive ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                    display: 'inline-block',
                    animation: 'pulse 1.5s infinite'
                  }}>
                    {isPositive ? '+' : ''}{change.toFixed(2)}%
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* ── Fear & Greed ── */}
      <div className="stagger-item" style={{ marginBottom: