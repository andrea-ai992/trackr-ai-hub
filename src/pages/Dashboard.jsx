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
      <div style={{ paddingTop: 'max(56px, env(safe-area-inset-top, 0px))', paddingBottom: 24 }}>
        <p style={{ fontSize: 13, color: '#4b5563', fontWeight: 500, marginBottom: 4 }}>{today}</p>
        <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
          {greeting()}, <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{userName}</span>
        </h1>
      </div>

      {/* ── Portfolio Hero Card ── */}
      <button onClick={() => navigate('/markets')} className="press-scale" style={{
        width: '100%', textAlign: 'left', marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.08) 100%)',
        border: '1px solid rgba(99,102,241,0.25)',
        borderRadius: 28,
        padding: '24px 22px',
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
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingLeft: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Crypto Movers</span>
            <button onClick={() => navigate('/markets?tab=crypto')} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 13, color: '#6366f1', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
              See All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }} className="no-scrollbar">
            {topMovers.map(coin => {
              const pct = coin.price_change_percentage_24h
              const up = pct >= 0
              const cc = coinColors[coin.id] || '#6366f1'
              return (
                <button key={coin.id} onClick={() => navigate('/markets?tab=crypto')} className="press-scale"
                  style={{ flexShrink: 0, minWidth: 90, padding: '14px 12px', borderRadius: 20, textAlign: 'left', cursor: 'pointer',
                    background: `rgba(${up ? '16,185,129' : '239,68,68'},0.06)`,
                    border: `1px solid rgba(${up ? '16,185,129' : '239,68,68'},0.15)`,
                    boxShadow: `0 4px 20px rgba(${up ? '16,185,129' : '239,68,68'},0.08)`,
                  }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: cc + '25', border: `1px solid ${cc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 13, fontWeight: 900, color: cc }}>
                    {coin.symbol[0].toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 2 }}>{coin.symbol.toUpperCase()}</div>
                  <div style={{ fontSize: 11, color: '#6b7280', fontVariantNumeric: 'tabular-nums', marginBottom: 6 }}>
                    ${coin.current_price >= 1 ? coin.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : coin.current_price.toFixed(3)}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: up ? '#10b981' : '#ef4444', filter: `drop-shadow(0 0 3px ${up ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'})` }}>
                    {up ? '+' : ''}{pct?.toFixed(2)}%
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Live Flights ── */}
      <button onClick={() => navigate('/flights')} className="press-scale" style={{
        width: '100%', textAlign: 'left', marginBottom: 12,
        background: 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.18)',
        borderRadius: 24, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16,
        boxShadow: '0 4px 24px rgba(6,182,212,0.08)',
      }}>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(6,182,212,0.15)', border: '1px solid rgba(6,182,212,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 20px rgba(6,182,212,0.15)' }}>
          <Plane size={24} color="#22d3ee" />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22d3ee', boxShadow: '0 0 6px #22d3ee', display: 'inline-block' }} className="live-ping" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#22d3ee', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Flights</span>
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: 'white', letterSpacing: '-0.5px' }}>
            {flightCount != null ? flightCount.toLocaleString() : '—'}
          </div>
          <div style={{ fontSize: 13, color: '#4b5563', marginTop: 2 }}>airborne worldwide</div>
        </div>
        <ChevronRight size={20} color="#374151" />
      </button>

      {/* ── News ── */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, overflow: 'hidden', marginBottom: 12 }}>
        <button onClick={() => navigate('/news')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'none', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Zap size={13} color="#6366f1" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Latest News</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#6366f1', fontWeight: 600 }}>
            See All <ChevronRight size={14} />
          </div>
        </button>
        {news.length === 0 ? (
          <div style={{ padding: '20px', textAlign: 'center', color: '#374151', fontSize: 14 }}>Loading headlines…</div>
        ) : news.map((item, i) => (
          <a key={i} href={item.link} target="_blank" rel="noreferrer"
            style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 20px', borderBottom: i < news.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', textDecoration: 'none', transition: 'background 150ms' }}
            onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#6366f1', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>BBC Business</p>
              <p style={{ fontSize: 14, color: '#d1d5db', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
            </div>
            <ExternalLink size={13} color="#374151" style={{ flexShrink: 0, marginTop: 2 }} />
          </a>
        ))}
      </div>

      {/* ── 2-col grid: Fear & Greed + Translate ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <button onClick={() => navigate('/markets?tab=crypto')} className="press-scale" style={{
          textAlign: 'left', padding: '18px 16px', borderRadius: 24,
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: fg != null && fg > 60 ? '0 0 20px rgba(34,197,94,0.08)' : fg != null && fg < 40 ? '0 0 20px rgba(239,68,68,0.08)' : 'none',
        }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Fear & Greed</p>
          {fg != null ? (
            <>
              <FearGreedGauge value={fg} />
              <p style={{ fontSize: 12, fontWeight: 700, marginTop: 8, color: fg < 25 ? '#ef4444' : fg < 45 ? '#f97316' : fg < 55 ? '#eab308' : fg < 75 ? '#84cc16' : '#22c55e', filter: 'drop-shadow(0 0 4px currentColor)' }}>{fgLabel}</p>
            </>
          ) : <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 13 }}>Loading…</div>}
        </button>

        <button onClick={() => navigate('/translator')} className="press-scale" style={{
          textAlign: 'left', padding: '18px 16px', borderRadius: 24,
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)',
          boxShadow: '0 0 20px rgba(99,102,241,0.06)',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 28, height: 28, borderRadius: 10, background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(99,102,241,0.2)' }}>
              <Languages size={14} color="#818cf8" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Translate</span>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, marginBottom: 8 }}>
              <span>🇺🇸</span>
              <ChevronRight size={13} color="#374151" />
              <span>🇫🇷</span>
            </div>
            <p style={{ fontSize: 13, color: '#4b5563' }}>Tap to translate</p>
          </div>
        </button>
      </div>
    </div>
  )
}
