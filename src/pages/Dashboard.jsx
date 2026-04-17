import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fetchMultiplePrices } from '../hooks/useStockPrice'
import { Plane, Languages, ExternalLink, ChevronRight, TrendingUp, Zap } from 'lucide-react'

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

function Sparkline({ data, color = '#6366f1', width = 80, height = 28 }) {
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
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="7" strokeLinecap="round" />
      {clamped > 0 && <path d={`M ${sx} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`} fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />}
      <circle cx={needle.x} cy={needle.y} r="5" fill={color} style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
      <text x={cx} y={cy + 6} textAnchor="middle" fill="white" fontSize="17" fontWeight="800" fontFamily="system-ui">{value}</text>
    </svg>
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
  const userName = localStorage.getItem('nexus_name') || 'there'

  useEffect(() => {
    const syms = [...new Set(stocks.filter(s => !s.salePrice).map(s => s.symbol).filter(Boolean))]
    if (syms.length) fetchMultiplePrices(syms).then(setLivePrices)
  }, [stocks.length])

  useEffect(() => {
    fetch('https://api.alternative.me/fng/?limit=1', { signal: AbortSignal.timeout(8000) })
      .then(r => r.json()).then(d => setFearGreed(d.data?.[0])).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,solana,binancecoin,cardano&order=market_cap_desc&sparkline=false&price_change_percentage=24h', { signal: AbortSignal.timeout(12000) })
      .then(r => r.json()).then(d => setTopMovers(Array.isArray(d) ? d : [])).catch(() => {})
  }, [])

  useEffect(() => {
    fetch('https://opensky-network.org/api/states/all', { signal: AbortSignal.timeout(15000) })
      .then(r => r.json())
      .then(d => setFlightCount((d.states || []).filter(s => !s[8] && s[5] != null && s[6] != null).length))
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent('https://feeds.bbci.co.uk/news/business/rss.xml') + '&count=3', { signal: AbortSignal.timeout(10000) })
      .then(r => r.json()).then(d => setNews(d.items || [])).catch(() => {})
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

  // Coin colors
  const coinColors = { bitcoin: '#f59e0b', ethereum: '#6366f1', solana: '#9945ff', binancecoin: '#f0b90b', cardano: '#0033ad' }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 24px' }}>

      {/* Header */}
      <div className="stagger-item" style={{ paddingTop: 'max(56px, env(safe-area-inset-top, 0px))', paddingBottom: 20 }}>
        <p style={{ fontSize: 12, color: '#4b6070', fontWeight: 600, marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: "'Space Grotesk', system-ui" }}>{today}</p>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: 'white', letterSpacing: '-0.5px', lineHeight: 1.15 }}>
          {greeting()}, <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{userName}</span>
        </h1>
      </div>

      {/* ── Portfolio Hero Card ── */}
      <button onClick={() => navigate('/markets')} className="press-scale stagger-item" style={{
        width: '100%', textAlign: 'left', marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.13) 0%, rgba(139,92,246,0.09) 100%)',
        border: '1px solid rgba(99,102,241,0.22)',
        borderRadius: 24,
        padding: '22px 20px',
        boxShadow: '0 0 40px rgba(99,102,241,0.1), 0 8px 32px rgba(0,0,0,0.4)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle grid pattern */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.05) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,0.05) 1px,transparent 1px)', backgroundSize: '28px 28px', borderRadius: 28 }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={14} color="#818cf8" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Portfolio</span>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981', display: 'inline-block' }} className="live-ping" />
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Live</span>
            </div>
          </div>

          <div style={{ fontSize: 42, fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>
            {fmtUSD(totalCurrent)}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: isUp ? '#10b981' : '#ef4444', filter: isUp ? 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' : 'drop-shadow(0 0 4px rgba(239,68,68,0.5))' }}>
              {isUp ? '+' : ''}{fmtUSD(totalPnL)}
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isUp ? '#10b981' : '#ef4444', border: `1px solid ${isUp ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
              {isUp ? '+' : ''}{totalPnLPct.toFixed(2)}%
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{positions} position{positions !== 1 ? 's' : ''}</span>
            <Sparkline data={sparkData} color={isUp ? '#10b981' : '#ef4444'} width={80} height={26} />
          </div>
        </div>
      </button>

      {/* ── Top Movers ── */}
      {topMovers.length > 0 && (
        <div className="stagger-item" style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 2 }}>
            <span className="section-label">Crypto Movers</span>
            <button onClick={() => navigate('/markets?tab=crypto')} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6366f1', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'Space Grotesk', system-ui" }}>
              Voir tout <ChevronRight size={13} />
            </button>
          </div>
          <div className="scroll-row">
            {topMovers.map(coin => {
              const pct = coin.price_change_percentage_24h
              const up  = pct >= 0
              const cc  = coinColors[coin.id] || '#6366f1'
              return (
                <button key={coin.id} onClick={() => navigate('/markets?tab=crypto')} className="press-scale"
                  style={{ minWidth: 86, padding: '14px 11px', borderRadius: 20, textAlign: 'left',
                    background: `rgba(${up ? '16,185,129' : '239,68,68'},0.07)`,
                    border: `1px solid rgba(${up ? '16,185,129' : '239,68,68'},0.16)`,
                    boxShadow: `0 4px 20px rgba(${up ? '16,185,129' : '239,68,68'},0.07)`,
                  }}>
                  <div style={{ width: 30, height: 30, borderRadius: 9, background: cc + '22', border: `1px solid ${cc}38`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 9, fontSize: 12, fontWeight: 900, color: cc }}>
                    {coin.symbol[0].toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'white', marginBottom: 1 }}>{coin.symbol.toUpperCase()}</div>
                  <div style={{ fontSize: 10, color: '#6b7280', fontVariantNumeric: 'tabular-nums', marginBottom: 5 }}>
                    ${coin.current_price >= 1 ? coin.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : coin.current_price.toFixed(3)}
                  </div>
                  <span className={`pill ${up ? 'pill-up' : 'pill-down'}`} style={{ fontSize: 10, padding: '2px 7px' }}>
                    {up ? '+' : ''}{pct?.toFixed(2)}%
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Live Flights ── */}
      <button onClick={() => navigate('/flights')} className="press-scale stagger-item" style={{
        width: '100%', textAlign: 'left', marginBottom: 10,
        background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.15)',
        borderRadius: 22, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14,
        boxShadow: '0 4px 24px rgba(6,182,212,0.07)',
      }}>
        <div style={{ width: 46, height: 46, borderRadius: 14, background: 'rgba(6,182,212,0.14)', border: '1px solid rgba(6,182,212,0.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Plane size={20} color="#22d3ee" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 5px #22d3ee', display: 'inline-block' }} className="live-ping" />
            <span className="section-label" style={{ color: '#22d3ee' }}>Live Flights</span>
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.5px', fontVariantNumeric: 'tabular-nums' }}>
            {flightCount != null ? flightCount.toLocaleString() : '—'}
          </div>
          <div style={{ fontSize: 12, color: '#4b6070', marginTop: 1 }}>en vol dans le monde</div>
        </div>
        <ChevronRight size={18} color="#374151" />
      </button>

      {/* ── News ── */}
      <div className="stagger-item" style={{ background: 'rgba(19,28,43,0.5)', border: '1px solid rgba(132,147,150,0.12)', borderRadius: 22, overflow: 'hidden', marginBottom: 10 }}>
        <button onClick={() => navigate('/news')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'none', border: 'none', borderBottom: '1px solid rgba(132,147,150,0.08)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Zap size={12} color="#6366f1" />
            <span className="section-label">Actualités</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6366f1', fontWeight: 700, fontFamily: "'Space Grotesk', system-ui" }}>
            Tout voir <ChevronRight size={13} />
          </div>
        </button>
        {news.length === 0 ? (
          <div style={{ padding: '18px', textAlign: 'center', color: '#374151', fontSize: 13 }}>Chargement…</div>
        ) : news.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noreferrer" className="press-scale-sm"
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 18px', borderBottom: i < news.length - 1 ? '1px solid rgba(132,147,150,0.07)' : 'none', textDecoration: 'none', transition: 'background 150ms ease' }}
            onTouchStart={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onTouchEnd={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: '#6366f1', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>BBC Business</p>
              <p style={{ fontSize: 13, color: '#bac9cc', lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
            </div>
            <ExternalLink size={12} color="#374151" style={{ flexShrink: 0 }} />
          </a>
        ))}
      </div>

      {/* ── 2-col grid: Fear & Greed + Translate ── */}
      <div className="stagger-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <button onClick={() => navigate('/markets?tab=crypto')} className="press-scale" style={{
          textAlign: 'left', padding: '16px 14px', borderRadius: 22,
          background: 'rgba(19,28,43,0.5)', border: '1px solid rgba(132,147,150,0.12)',
          boxShadow: fg != null && fg > 60 ? '0 0 20px rgba(34,197,94,0.07)' : fg != null && fg < 40 ? '0 0 20px rgba(239,68,68,0.07)' : 'none',
        }}>
          <p className="section-label" style={{ marginBottom: 10 }}>Fear & Greed</p>
          {fg != null ? (
            <>
              <FearGreedGauge value={fg} />
              <p style={{ fontSize: 11, fontWeight: 700, marginTop: 6, color: fg < 25 ? '#ef4444' : fg < 45 ? '#f97316' : fg < 55 ? '#eab308' : fg < 75 ? '#84cc16' : '#22c55e' }}>{fgLabel}</p>
            </>
          ) : <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 13 }}>…</div>}
        </button>

        <button onClick={() => navigate('/translator')} className="press-scale" style={{
          textAlign: 'left', padding: '16px 14px', borderRadius: 22,
          background: 'rgba(99,102,241,0.07)', border: '1px solid rgba(99,102,241,0.16)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 14 }}>
            <div style={{ width: 26, height: 26, borderRadius: 9, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Languages size={13} color="#818cf8" />
            </div>
            <span className="section-label">Traduire</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 18, marginBottom: 6 }}>
            <span>🇺🇸</span>
            <ChevronRight size={12} color="#374151" />
            <span>🇫🇷</span>
          </div>
          <p style={{ fontSize: 12, color: '#4b6070' }}>Appuyer pour traduire</p>
        </button>
      </div>
    </div>
  )
}
