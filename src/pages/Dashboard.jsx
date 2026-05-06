// src/pages/Dashboard.jsx — Hub Terminal
import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown, Newspaper, Trophy, Cpu, ChevronRight, RefreshCw, Settings } from 'lucide-react'

// ── Static data (remplacer par API plus tard) ─────────────────────────────
const PRICES = [
  { s: 'BTC',  p: 64320, c: +2.41, color: '#f7931a' },
  { s: 'ETH',  p: 3181,  c: -1.12, color: '#627eea' },
  { s: 'SOL',  p: 148.3, c: +4.87, color: '#9945ff' },
  { s: 'NVDA', p: 876,   c: +1.63, color: '#76b900' },
  { s: 'TSLA', p: 175,   c: -2.34, color: '#cc0000' },
  { s: 'SPY',  p: 521,   c: +0.44, color: '#00d4ff' },
  { s: 'AAPL', p: 189,   c: +0.82, color: '#888' },
  { s: 'AMZN', p: 186,   c: -0.71, color: '#ff9900' },
]

const HEADLINES = [
  { id: 0, t: 'Fed signals rate cut Q3 — inflation cools to 2.8%', src: 'Reuters', ago: '4m' },
  { id: 1, t: 'BTC ETF inflows $800M single session — record flows', src: 'Bloomberg', ago: '11m' },
  { id: 2, t: 'NVDA Q2 earnings +18% beat — AI demand accelerates', src: 'WSJ', ago: '29m' },
  { id: 3, t: 'PSG 3-1 Monaco — Mbappé doublé en Ligue 1', src: 'L\'Équipe', ago: '1h' },
]

const NEXT_MATCH = { home: 'PSG', away: 'Dortmund', comp: 'UCL', date: 'Mer 22 Avr', time: '21:00' }

const SIGNALS = [
  { s: 'BTC',  sig: 'BUY',  rsi: 28 },
  { s: 'ETH',  sig: 'HOLD', rsi: 51 },
  { s: 'NVDA', sig: 'BUY',  rsi: 32 },
]

const SPARK = [0.4, 0.55, 0.42, 0.68, 0.6, 0.82, 0.75, 0.88, 0.78, 1.0]
function spark(pts) {
  return pts.map((y, i) => `${i === 0 ? 'M' : 'L'}${(i / (pts.length - 1)) * 100},${28 - y * 22}`).join(' ')
}

function FG({ v }) {
  const c = v > 60 ? '#00ff88' : v < 40 ? '#ff3b3b' : '#ff9500'
  const circ = Math.PI * 34
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <svg width="72" height="42" viewBox="0 0 80 46">
        <path d="M8,44 A34,34 0 0,1 72,44" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
        <path d="M8,44 A34,34 0 0,1 72,44" fill="none" stroke={c} strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ - (v / 100) * circ} />
      </svg>
      <div style={{ fontSize: 16, fontWeight: 700, color: c, marginTop: -6 }}>{v}</div>
      <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
        {v > 60 ? 'Greed' : v < 40 ? 'Fear' : 'Neutral'}
      </div>
    </div>
  )
}

const G = ({ children, style = {} }) => (
  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, ...style }}>
    {children}
  </div>
)

export default function Dashboard() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [fg, setFg] = useState(68)
  const [pv, setPv] = useState(42893.24)
  const [pc, setPc] = useState(3.12)

  const refresh = useCallback(() => {
    setLoading(true)
    setTimeout(() => {
      setFg(Math.floor(Math.random() * 40) + 50)
      setPv(42893 + (Math.random() - 0.5) * 800)
      setPc(+(Math.random() * 7 - 1.5).toFixed(2))
      setLoading(false)
    }, 500)
  }, [])

  useEffect(() => { refresh() }, [])

  const $ = (n) => n < 1000 ? n.toFixed(2) : n.toLocaleString('en-US', { maximumFractionDigits: 0 })

  return (
    <div style={{ minHeight: '100dvh', background: '#000', fontFamily: "'JetBrains Mono', monospace", color: '#f0f0f0', paddingBottom: 'calc(64px + env(safe-area-inset-bottom))' }}>

      {/* ── Header ── */}
      <div style={{ position: 'sticky', top: 0, zIndex: 30, background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: '-0.02em' }}>TRACKR</span>
          <span style={{ fontSize: 9, color: '#444', letterSpacing: '0.1em', textTransform: 'uppercase' }}>HUB</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={refresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, display: 'flex' }}>
            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
          </button>
          <button onClick={() => navigate('/settings')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#444', padding: 4, display: 'flex' }}>
            <Settings size={14} />
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[100, 80, 60, 90, 70].map((w, i) => (
            <div key={i} style={{ height: 13, width: `${w}%`, borderRadius: 4, background: 'rgba(255,255,255,0.05)', animation: 'pulse 1.4s ease-in-out infinite alternate' }} />
          ))}
        </div>
      ) : <>

        {/* ── Portfolio card ── */}
        <div style={{ padding: '16px 16px 0' }}>
          <G style={{ padding: '14px 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Portfolio</div>
                <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1 }}>
                  ${pv.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
                  {pc >= 0
                    ? <TrendingUp size={11} color="#00ff88" />
                    : <TrendingDown size={11} color="#ff3b3b" />}
                  <span style={{ fontSize: 12, fontWeight: 600, color: pc >= 0 ? '#00ff88' : '#ff3b3b' }}>
                    {pc >= 0 ? '+' : ''}{pc}% today
                  </span>
                </div>
              </div>
              <div style={{ paddingTop: 4 }}>
                <svg width="100" height="32" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="spg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00ff88" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={spark(SPARK) + ' L100,30 L0,30 Z'} fill="url(#spg)" />
                  <path d={spark(SPARK)} fill="none" stroke="#00ff88" strokeWidth="1.5" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </G>
        </div>

        {/* ── Prices ticker ── */}
        <div style={{ padding: '12px 0 0', overflowX: 'auto', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
          <div style={{ display: 'flex', gap: 6, padding: '0 16px', width: 'max-content' }}>
            {PRICES.map((p, i) => (
              <G key={p.s} className="stagger-item press-scale" style={{ padding: '8px 12px', minWidth: 84, borderLeft: `2px solid ${p.c >= 0 ? '#00ff88' : '#ff3b3b'}`, animationDelay: `${40 + i * 40}ms`, cursor: 'pointer' }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', color: p.color }}>{p.s}</div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>${$(p.p)}</div>
                <div style={{ fontSize: 10, fontWeight: 600, color: p.c >= 0 ? '#00ff88' : '#ff3b3b', marginTop: 2 }}>{p.c >= 0 ? '+' : ''}{p.c}%</div>
              </G>
            ))}
          </div>
        </div>

        {/* ── Signals + F&G row ── */}
        <div style={{ padding: '12px 16px 0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 8 }}>
          <G style={{ padding: '12px 14px' }}>
            <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Signals</div>
            {SIGNALS.map(s => {
              const c = s.sig === 'BUY' ? '#00ff88' : s.sig === 'SELL' ? '#ff3b3b' : '#444'
              return (
                <div key={s.s} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{s.s}</span>
                  <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 4, background: `${c}12`, color: c, border: `1px solid ${c}40` }}>{s.sig}</span>
                </div>
              )
            })}
            <button onClick={() => navigate('/signals')} style={{ background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, fontSize: 10, color: '#00ff88', display: 'flex', alignItems: 'center', gap: 2, padding: 0 }}>
              All signals <ChevronRight size={11} />
            </button>
          </G>
          <G style={{ padding: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
            <div style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>F&G</div>
            <FG v={fg} />
          </G>
        </div>

        {/* ── Next match ── */}
        <div style={{ padding: '12px 16px 0' }}>
          <G style={{ padding: '12px 14px', borderLeft: '2px solid #ff6b35', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Trophy size={13} color="#ff6b35" />
              <div>
                <div style={{ fontSize: 9, color: '#ff6b35', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{NEXT_MATCH.comp} · Prochain match</div>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{NEXT_MATCH.home} <span style={{ color: '#444' }}>vs</span> {NEXT_MATCH.away}</div>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#ff6b35' }}>{NEXT_MATCH.time}</div>
              <div style={{ fontSize: 10, color: '#444' }}>{NEXT_MATCH.date}</div>
            </div>
          </G>
        </div>

        {/* ── News ── */}
        <div style={{ padding: '12px 16px 0' }}>
          <G style={{ overflow: 'hidden' }}>
            <div style={{ padding: '10px 14px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Newspaper size={12} color="#444" />
                <span style={{ fontSize: 9, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em' }}>News</span>
              </div>
              <button onClick={() => navigate('/markets?tab=news')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 9, color: '#00d4ff', display: 'flex', alignItems: 'center', gap: 1 }}>
                Tout voir <ChevronRight size={10} />
              </button>
            </div>
            {HEADLINES.map((h, i) => (
              <div key={h.id} onClick={() => navigate('/markets?tab=news')} style={{ padding: '9px 14px', borderBottom: i < HEADLINES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', display: 'flex', gap: 10, cursor: 'pointer' }}>
                <div style={{ fontSize: 12, color: '#ccc', lineHeight: 1.4, flex: 1 }}>{h.t}</div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ fontSize: 9, fontWeight: 600, color: '#00d4ff' }}>{h.src}</div>
                  <div style={{ fontSize: 9, color: '#444', marginTop: 1 }}>{h.ago}</div>
                </div>
              </div>
            ))}
          </G>
        </div>

        {/* ── Quick nav ── */}
        <div style={{ padding: '12px 16px 0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 6 }}>
          {[
            { label: 'Markets', icon: TrendingUp,  to: '/markets', color: '#00d4ff' },
            { label: 'Sports',  icon: Trophy,       to: '/sports',  color: '#ff6b35' },
            { label: 'Lea AI',  icon: Cpu,          to: '/ai',      color: '#b06dff' },
          ].map(({ label, icon: Icon, to, color }) => (
            <button key={label} onClick={() => navigate(to)}
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}22`, borderRadius: 10, padding: '11px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = color + '55'}
              onMouseLeave={e => e.currentTarget.style.borderColor = color + '22'}>
              <Icon size={17} color={color} />
              <span style={{ fontSize: 10, color: '#888' }}>{label}</span>
            </button>
          ))}
        </div>
      </>}
    </div>
  )
}
