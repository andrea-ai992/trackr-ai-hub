import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { fetchMultiplePrices } from '../hooks/useStockPrice'
import { Plane, ChevronRight, TrendingUp, ArrowUpRight, ArrowDownRight, Bot } from 'lucide-react'

function greeting() {
  const h = new Date().getHours()
  if (h < 6)  return 'Bonne nuit'
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

function Sparkline({ data, color = '#00ff88', width = 72, height = 28 }) {
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
  const ex = cx + r * Math.cos(angle), ey = cy + r * Math.sin(angle)
  const largeArc = v > 50 ? 1 : 0
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={100} height={54} viewBox="0 0 100 54">
        <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" strokeLinecap="round" />
        {v > 0 && <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${ex} ${ey}`} fill="none" stroke={color} strokeWidth="6" strokeLinecap="round" />}
        <circle cx={nx} cy={ny} r="4" fill={color} />
        <text x={cx} y={cy+4} textAnchor="middle" fill="white" fontSize="15" fontWeight="800" fontFamily="Inter,system-ui">{v}</text>
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

  const open   = stocks.filter(s => !s.salePrice)
  const inv    = open.reduce((s, i) => s + i.buyPrice * i.quantity, 0)
  const cur    = open.reduce((s, i) => s + (livePrices[i.symbol] ?? i.buyPrice) * i.quantity, 0)
  const pnl    = cur - inv
  const pnlPct = inv > 0 ? (pnl / inv) * 100 : 0
  const isUp   = pnl >= 0
  const pos    = open.length + sneakers.filter(s => !s.salePrice).length
  const today  = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  const fg     = fearGreed ? parseInt(fearGreed.value) : null
  const sparkData = Array.from({ length: 8 }, (_, i) => cur * (0.97 + (i / 7) * 0.06 * (isUp ? 1 : -1) + Math.random() * 0.01))

  const coinColor = { bitcoin: '#f59e0b', ethereum: '#6366f1', solana: '#9945ff', binancecoin: '#f0b90b' }

  return (
    <div className="page" style={{ paddingTop: 'max(60px, env(safe-area-inset-top, 0px))' }}>

      {/* ── Header ── */}
      <div className="stagger-item" style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 11, color: 'var(--t3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>{today}</p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.3px' }}>
          {greeting()}, <span style={{ color: 'var(--green)' }}>{name}</span>
        </h1>
      </div>

      {/* ── Portfolio card ── */}
      <button onClick={() => navigate('/markets')} className="press-scale stagger-item" style={{
        width: '100%', textAlign: 'left', marginBottom: 12,
        background: 'var(--bg2)',
        border: `1px solid ${isUp ? 'rgba(0,255,136,0.18)' : 'rgba(255,77,77,0.18)'}`,
        borderRadius: 'var(--radius-xl)',
        padding: '20px',
        display: 'block',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--green-bg)', border: '1px solid var(--border-hi)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={15} color="var(--green)" />
            </div>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Portfolio</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <span className="live-dot" />
            <span style={{ fontSize: 10, color: 'var(--green)', fontWeight: 600 }}>Live</span>
          </div>
        </div>

        <div className="num" style={{ fontSize: 38, fontWeight: 900, color: 'var(--t1)', letterSpacing: '-1px', marginBottom: 8, lineHeight: 1 }}>
          {fmt(cur)}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {isUp ? <ArrowUpRight size={14} color="var(--green)" /> : <ArrowDownRight size={14} color="var(--red)" />}
            <span className="num" style={{ fontSize: 14, fontWeight: 700, color: isUp ? 'var(--green)' : 'var(--red)' }}>
              {fmt(Math.abs(pnl))}
            </span>
          </div>
          <span className={`pill ${isUp ? 'pill-up' : 'pill-down'}`}>{fmtPct(pnlPct)}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: 12, color: 'var(--t3)' }}>{pos} position{pos !== 1 ? 's' : ''}</span>
          <Sparkline data={sparkData} color={isUp ? '#00ff88' : '#ff4d4d'} />
        </div>
      </button>

      {/* ── Crypto movers ── */}
      {crypto.length > 0 && (
        <div className="stagger-item" style={{ marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10, paddingLeft: 2 }}>
            <span className="section-label">Crypto</span>
            <button onClick={() => navigate('/markets?tab=crypto')} style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
              Voir tout <ChevronRight size={13} />
            </button>
          </div>
          <div className="scroll-row">
            {crypto.map(c => {
              const pct = c.price_change_percentage_24h
              const up  = pct >= 0
              const cc  = coinColor[c.id] || 'var(--green)'
              return (
                <button key={c.id} onClick={() => navigate('/markets?tab=crypto')} className="press-scale"
                  style={{ minWidth: 90, padding: '14px 12px', borderRadius: 'var(--radius)', textAlign: 'left', background: 'var(--bg2)', border: '1px solid var(--border)', flexShrink: 0 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: cc + '18', border: `1px solid ${cc}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10, fontSize: 13, fontWeight: 900, color: cc }}>
                    {c.symbol?.[0]?.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--t1)', marginBottom: 2 }}>{c.symbol?.toUpperCase()}</div>
                  <div className="num" style={{ fontSize: 10, color: 'var(--t3)', marginBottom: 6 }}>
                    ${c.current_price >= 1 ? c.current_price.toLocaleString('en-US', { maximumFractionDigits: 0 }) : c.current_price?.toFixed(3)}
                  </div>
                  <span className={`pill ${up ? 'pill-up' : 'pill-down'}`} style={{ fontSize: 9 }}>
                    {up ? '+' : ''}{pct?.toFixed(2)}%
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── 2-col quick actions ── */}
      <div className="stagger-item" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>

        {/* Flights */}
        <button onClick={() => navigate('/flights')} className="press-scale" style={{
          textAlign: 'left', padding: '16px', borderRadius: 'var(--radius-lg)',
          background: 'var(--bg2)', border: '1px solid var(--border)',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Plane size={17} color="var(--blue)" />
          </div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--t1)', marginBottom: 2 }}>Flights</p>
          <p style={{ fontSize: 10, color: 'var(--t3)' }}>Radar live</p>
        </button>

        {/* AnDy */}
        <button onClick={() => navigate('/andy')} className="press-scale" style={{
          textAlign: 'left', padding: '16px', borderRadius: 'var(--radius-lg)',
          background: 'var(--green-bg)', border: '1px solid var(--border-hi)',
        }}>
          <div style={{ width: 36, height: 36, borderRadius: 11, background: 'rgba(0,255,136,0.12)', border: '1px solid rgba(0,255,136,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
            <Bot size={17} color="var(--green)" />
          </div>
          <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--green)', marginBottom: 2 }}>AnDy AI</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span className="live-dot" style={{ width: 5, height: 5 }} />
            <p style={{ fontSize: 10, color: 'var(--green)', opacity: 0.7 }}>En ligne</p>
          </div>
        </button>
      </div>

      {/* ── Fear & Greed ── */}
      {fg != null && (
        <button onClick={() => navigate('/markets?tab=crypto')} className="press-scale stagger-item" style={{
          width: '100%', textAlign: 'center', marginBottom: 12,
          background: 'var(--bg2)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', padding: '18px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ textAlign: 'left' }}>
            <p className="section-label" style={{ marginBottom: 6 }}>Fear & Greed Index</p>
            <p style={{ fontSize: 11, color: 'var(--t3)' }}>Sentiment du marché crypto</p>
          </div>
          <FGGauge value={fg} />
        </button>
      )}

      {/* ── News ── */}
      {news.length > 0 && (
        <div className="stagger-item" style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 12 }}>
          <button onClick={() => navigate('/news')} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
            <span className="section-label">Actualités</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>
              Tout voir <ChevronRight size={13} />
            </div>
          </button>
          {news.map((item, i) => (
            <a key={i} href={item.link} target="_blank" rel="noreferrer" className="press-scale-sm"
              style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '13px 16px', borderBottom: i < news.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em' }}>BBC Business</p>
                <p style={{ fontSize: 13, color: 'var(--t1)', lineHeight: 1.4, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{item.title}</p>
              </div>
              <ArrowUpRight size={13} color="var(--t3)" style={{ flexShrink: 0, marginTop: 2 }} />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
