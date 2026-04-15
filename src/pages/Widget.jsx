import { useState, useEffect, useRef, useCallback } from 'react'
import { useApp } from '../context/AppContext'
import StockLogo from '../components/StockLogo'
import {
  RefreshCw, Settings, X, Check, Plus, Trash2,
  ArrowUpRight, ArrowDownRight, Loader2, ExternalLink,
  TrendingUp, Newspaper, Clock,
} from 'lucide-react'

/* ─── Config stored in localStorage ─────────────────────────────────────────── */
const WIDGET_KEY = 'trackr_widget_v1'

function loadConfig() {
  try {
    const s = localStorage.getItem(WIDGET_KEY)
    if (s) return JSON.parse(s)
  } catch {}
  return { stocks: ['AAPL', 'NVDA', 'TSLA'], showNews: true, showIndices: true, compact: false }
}

function saveConfig(cfg) {
  localStorage.setItem(WIDGET_KEY, JSON.stringify(cfg))
}

/* ─── Formatters ─────────────────────────────────────────────────────────────── */
function fmtPrice(n) {
  if (n == null) return '—'
  if (n >= 10000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  return '$' + n.toFixed(2)
}
function fmtPct(n) {
  if (n == null) return null
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}
function fmtChange(n) {
  if (n == null) return null
  return (n >= 0 ? '+' : '') + n.toFixed(2)
}

/* ─── Yahoo Finance fetch (direct + proxy fallback) ──────────────────────────── */
const PCACHE = {}
const TTL = 25000

async function fetchJSON(url) {
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (r.ok) return await r.json()
  } catch {}
  try {
    const r = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`, { signal: AbortSignal.timeout(10000) })
    if (r.ok) { const w = await r.json(); return JSON.parse(w.contents) }
  } catch {}
  return null
}

async function fetchStock(symbol) {
  const cached = PCACHE[symbol]
  if (cached && Date.now() - cached.ts < TTL) return cached.data
  const json = await fetchJSON(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d`)
  const result = json?.chart?.result?.[0]
  if (!result) return null
  const meta = result.meta
  const closes = (result.indicators?.quote?.[0]?.close || []).filter(v => v != null)
  const curr = meta.regularMarketPrice
  const prev = meta.previousClose || meta.chartPreviousClose
  const data = {
    symbol: meta.symbol || symbol,
    shortName: meta.shortName || symbol,
    price: curr,
    change: curr && prev ? curr - prev : null,
    pct: curr && prev ? ((curr - prev) / prev) * 100 : null,
    marketState: meta.marketState,
    sparkline: closes,
    currency: meta.currency || 'USD',
  }
  PCACHE[symbol] = { data, ts: Date.now() }
  return data
}

async function fetchAll(symbols) {
  const results = await Promise.allSettled(symbols.map(fetchStock))
  const map = {}
  results.forEach((r, i) => { if (r.status === 'fulfilled' && r.value) map[symbols[i]] = r.value })
  return map
}

/* ─── RSS news fetch ─────────────────────────────────────────────────────────── */
const NEWS_CACHE = { data: null, ts: 0 }
const NEWS_TTL = 3 * 60 * 1000

const NEWS_FEEDS = [
  'https://feeds.reuters.com/reuters/businessNews',
  'https://www.cnbc.com/id/100003114/device/rss/rss.html',
  'https://cointelegraph.com/rss',
]

async function fetchWidgetNews() {
  if (NEWS_CACHE.data && Date.now() - NEWS_CACHE.ts < NEWS_TTL) return NEWS_CACHE.data
  const items = []
  for (const url of NEWS_FEEDS) {
    try {
      const encoded = encodeURIComponent(url)
      const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encoded}&count=3`, { signal: AbortSignal.timeout(8000) })
      const json = await r.json()
      if (json.status === 'ok') {
        json.items?.forEach(i => {
          const title = i.title?.replace(/<[^>]+>/g, '').trim()
          if (title) items.push({ title, url: i.link, time: i.pubDate ? new Date(i.pubDate).getTime() : 0 })
        })
      }
    } catch {}
  }
  const dedup = [...new Map(items.map(i => [i.title.slice(0, 60), i])).values()]
  const sorted = dedup.sort((a, b) => b.time - a.time).slice(0, 5)
  NEWS_CACHE.data = sorted
  NEWS_CACHE.ts = Date.now()
  return sorted
}

/* ─── Sparkline ─────────────────────────────────────────────────────────────── */
function Spark({ data, up, width = 100, height = 32 }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />
  const slice = data.slice(-60)
  const min = Math.min(...slice), max = Math.max(...slice), range = max - min || 1
  const pts = slice.map((v, i) =>
    `${(i / (slice.length - 1)) * width},${height - ((v - min) / range) * (height - 3) + 1.5}`
  ).join(' ')
  // Fill path
  const fillPts = `${pts} ${width},${height} 0,${height}`
  const color = up ? '#10b981' : '#ef4444'
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id={`wf${up ? 'u' : 'd'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.18} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polygon points={fillPts} fill={`url(#wf${up ? 'u' : 'd'})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ─── Clock ─────────────────────────────────────────────────────────────────── */
function LiveClock() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  const date = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
  return (
    <div style={{ textAlign: 'center', padding: '20px 0 12px' }}>
      <div style={{ fontSize: 52, fontWeight: 900, color: 'white', letterSpacing: '-2px', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        {time}
      </div>
      <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4, textTransform: 'capitalize' }}>{date}</div>
    </div>
  )
}

/* ─── Market state badge ─────────────────────────────────────────────────────── */
function MarketBadge({ state }) {
  const map = { REGULAR: ['Ouvert', '#10b981'], PRE: ['Pré-marché', '#f59e0b'], POST: ['Après clôture', '#f59e0b'] }
  const [label, color] = map[state] || ['Fermé', '#6b7280']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, color, padding: '3px 9px', borderRadius: 20, background: color + '18', border: `1px solid ${color}30` }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: state === 'REGULAR' ? `0 0 5px ${color}` : 'none' }} />
      {label}
    </span>
  )
}

/* ─── Stock Block ────────────────────────────────────────────────────────────── */
function StockBlock({ symbol, data: d, compact }) {
  const up = (d?.pct ?? 0) >= 0
  const color = up ? '#10b981' : '#ef4444'
  if (!d?.price) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: compact ? '12px 20px' : '16px 20px' }}>
      <StockLogo symbol={symbol} size={compact ? 38 : 46} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: compact ? 15 : 17, fontWeight: 800, color: 'white' }}>{symbol}</div>
      </div>
      <Loader2 size={16} style={{ color: '#374151' }} className="animate-spin" />
    </div>
  )
  return (
    <div style={{ padding: compact ? '12px 20px' : '16px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <StockLogo symbol={symbol} size={compact ? 38 : 46} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: compact ? 15 : 17, fontWeight: 900, color: 'white' }}>{symbol}</span>
            <span style={{ fontSize: 11, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>{d.shortName}</span>
          </div>
          {!compact && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
              {d.marketState && <MarketBadge state={d.marketState} />}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: compact ? 20 : 24, fontWeight: 900, color: 'white', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.5px' }}>
            {fmtPrice(d.price)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 1 }}>
            {up ? <ArrowUpRight size={13} color={color} /> : <ArrowDownRight size={13} color={color} />}
            <span style={{ fontSize: 14, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}>{fmtPct(d.pct)}</span>
          </div>
          {!compact && d.change != null && (
            <div style={{ fontSize: 11, color: '#4b5563', fontVariantNumeric: 'tabular-nums' }}>
              {fmtChange(d.change)} today
            </div>
          )}
        </div>
      </div>
      {!compact && d.sparkline?.length > 4 && (
        <div style={{ marginTop: 8, paddingLeft: 60 }}>
          <Spark data={d.sparkline} up={up} width="100%" height={28} />
        </div>
      )}
    </div>
  )
}

/* ─── Config Sheet ───────────────────────────────────────────────────────────── */
function ConfigSheet({ config, onChange, onClose }) {
  const { stocks: appStocks } = useApp()
  const [stocks, setStocks] = useState([...config.stocks])
  const [input, setInput] = useState('')
  const [showNews, setShowNews] = useState(config.showNews)
  const [showIndices, setShowIndices] = useState(config.showIndices)
  const [compact, setCompact] = useState(config.compact)

  function addStock() {
    const sym = input.trim().toUpperCase()
    if (!sym || stocks.includes(sym) || stocks.length >= 6) return
    setStocks(s => [...s, sym])
    setInput('')
  }

  function save() {
    const cfg = { stocks, showNews, showIndices, compact }
    onChange(cfg)
    saveConfig(cfg)
    onClose()
  }

  // Portfolio holdings as quick-add suggestions
  const portfolioSyms = [...new Set(appStocks.filter(s => !s.salePrice).map(s => s.symbol))]
  const suggestions = ['AAPL', 'NVDA', 'TSLA', 'MSFT', 'AMZN', 'META', 'GOOGL', 'AMD', 'SPY', 'QQQ', 'BTC-USD', 'ETH-USD']
    .filter(s => !stocks.includes(s)).slice(0, 8)

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)' }} />
      <div style={{
        position: 'relative', zIndex: 1, background: '#0f0f1a',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: '28px 28px 0 0',
        maxHeight: '88vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
        animation: 'slideUp 300ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '14px auto 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px 8px' }}>
          <span style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Configurer le widget</span>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.07)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}><X size={15} /></button>
        </div>

        <div style={{ overflowY: 'auto', flex: 1, padding: '0 20px' }}>
          {/* Actions */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Actions affichées ({stocks.length}/6)
            </p>
            {/* Current list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
              {stocks.map(sym => (
                <div key={sym} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <StockLogo symbol={sym} size={32} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'white', flex: 1 }}>{sym}</span>
                  <button onClick={() => setStocks(s => s.filter(x => x !== sym))} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#f87171' }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add input */}
            {stocks.length < 6 && (
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <input
                  value={input} onChange={e => setInput(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && addStock()}
                  placeholder="Ajouter un ticker (ex: MC.PA)"
                  style={{
                    flex: 1, padding: '11px 14px', borderRadius: 13,
                    background: 'rgba(255,255,255,0.05)', border: '1.5px solid rgba(255,255,255,0.1)',
                    color: 'white', fontSize: 15, fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <button onClick={addStock} style={{ padding: '0 16px', borderRadius: 13, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', cursor: 'pointer' }}>
                  <Plus size={18} />
                </button>
              </div>
            )}

            {/* Portfolio holdings */}
            {portfolioSyms.length > 0 && (
              <div style={{ marginBottom: 10 }}>
                <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 6 }}>Depuis ton portefeuille :</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {portfolioSyms.filter(s => !stocks.includes(s)).map(sym => (
                    <button key={sym} onClick={() => setStocks(s => s.length < 6 ? [...s, sym] : s)} style={{ padding: '5px 12px', borderRadius: 10, background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                      + {sym}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div>
              <p style={{ fontSize: 11, color: '#4b5563', fontWeight: 600, marginBottom: 6 }}>Suggestions :</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {suggestions.map(sym => (
                  <button key={sym} onClick={() => setStocks(s => s.length < 6 ? [...s, sym] : s)} style={{ padding: '5px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#6b7280', fontSize: 13, cursor: 'pointer' }}>
                    {sym}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {[
              { key: 'showNews', label: 'Afficher les news', val: showNews, set: setShowNews },
              { key: 'showIndices', label: 'Afficher les indices (S&P, Nasdaq…)', val: showIndices, set: setShowIndices },
              { key: 'compact', label: 'Mode compact (sans sparklines)', val: compact, set: setCompact },
            ].map(opt => (
              <div key={opt.key} onClick={() => opt.set(v => !v)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer' }}>
                <span style={{ fontSize: 14, color: 'white', fontWeight: 500 }}>{opt.label}</span>
                <div style={{ width: 44, height: 26, borderRadius: 13, background: opt.val ? '#6366f1' : 'rgba(255,255,255,0.1)', position: 'relative', transition: 'background 200ms', flexShrink: 0 }}>
                  <div style={{ position: 'absolute', top: 3, left: opt.val ? 21 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', transition: 'left 200ms', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }} />
                </div>
              </div>
            ))}
          </div>

          {/* How to add to home screen */}
          <div style={{ padding: '14px 16px', borderRadius: 16, background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)', marginBottom: 16 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', marginBottom: 6 }}>Ajouter à l'écran d'accueil</p>
            <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, margin: 0 }}>
              iPhone : Safari → 📤 Partager → "Sur l'écran d'accueil"<br />
              Android : Chrome → ⋮ Menu → "Ajouter à l'écran d'accueil"
            </p>
          </div>
        </div>

        <div style={{ padding: '12px 20px 0' }}>
          <button onClick={save} style={{
            width: '100%', padding: '15px', borderRadius: 18,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            border: 'none', color: 'white', fontSize: 16, fontWeight: 800, cursor: 'pointer',
          }}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Widget ────────────────────────────────────────────────────────────── */
const INDICES = [
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^IXIC', label: 'Nasdaq' },
  { symbol: '^DJI', label: 'Dow' },
  { symbol: 'GC=F', label: 'Gold' },
  { symbol: 'CL=F', label: 'Oil' },
]

export default function Widget() {
  const [config, setConfig] = useState(loadConfig)
  const [stockData, setStockData] = useState({})
  const [indexData, setIndexData] = useState({})
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [secondsAgo, setSecondsAgo] = useState(0)
  const [configOpen, setConfigOpen] = useState(false)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const allSyms = [...new Set(config.stocks)]
    const [sMap, iMap, newsItems] = await Promise.all([
      fetchAll_internal(allSyms),
      config.showIndices ? fetchAll_internal(INDICES.map(i => i.symbol)) : Promise.resolve({}),
      config.showNews ? fetchWidgetNews() : Promise.resolve([]),
    ])
    setStockData(sMap)
    setIndexData(iMap)
    setNews(newsItems)
    setLastUpdate(Date.now())
    setSecondsAgo(0)
    setLoading(false)
  }, [config])

  // seconds ticker
  useEffect(() => {
    const id = setInterval(() => setSecondsAgo(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [])
  useEffect(() => { setSecondsAgo(0) }, [lastUpdate])

  useEffect(() => {
    fetchAll()
    const id = setInterval(fetchAll, 30000)
    return () => clearInterval(id)
  }, [fetchAll])

  const anyData = Object.values(stockData)[0]
  const marketState = anyData?.marketState

  return (
    <div style={{
      minHeight: '100dvh', background: '#07070f', color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
    }}>
      {/* ── Header ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: 'max(14px, env(safe-area-inset-top, 0px)) 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TrendingUp size={15} color="white" />
          </div>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Trackr</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
            {secondsAgo < 3 ? '● Live' : `${secondsAgo}s`}
          </span>
          <button onClick={() => fetchAll()} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          </button>
          <button onClick={() => setConfigOpen(true)} style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            <Settings size={13} />
          </button>
        </div>
      </div>

      {/* ── Clock ── */}
      <LiveClock />

      {/* ── Indices strip ── */}
      {config.showIndices && (
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '0 16px 14px' }} className="no-scrollbar">
          {INDICES.map(idx => {
            const d = indexData[idx.symbol]
            const up = (d?.pct ?? 0) >= 0
            return (
              <div key={idx.symbol} style={{ flexShrink: 0, padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>{idx.label}</div>
                <div style={{ fontSize: 13, fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{d?.price ? fmtPrice(d.price) : '—'}</div>
                {d?.pct != null && <div style={{ fontSize: 10, fontWeight: 700, color: up ? '#10b981' : '#ef4444' }}>{fmtPct(d.pct)}</div>}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Stocks ── */}
      <div style={{ margin: '0 16px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={13} color="#10b981" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Mes actions</span>
          </div>
          {marketState && <MarketBadge state={marketState} />}
        </div>
        {config.stocks.map((sym, i) => (
          <div key={sym}>
            {i > 0 && <div style={{ height: 1, background: 'rgba(255,255,255,0.04)', margin: '0 20px' }} />}
            <StockBlock symbol={sym} data={stockData[sym]} compact={config.compact} />
          </div>
        ))}
      </div>

      {/* ── News ── */}
      {config.showNews && (
        <div style={{ margin: '0 16px 16px', borderRadius: 22, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px 8px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <Newspaper size={13} color="#6366f1" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>À la une</span>
          </div>
          {news.length === 0 ? (
            <div style={{ padding: '14px 20px' }}>
              <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.05)', marginBottom: 8 }} className="skeleton" />
              <div style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.05)', width: '80%' }} className="skeleton" />
            </div>
          ) : (
            news.map((item, i) => (
              <a key={i} href={item.url} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '11px 20px', borderBottom: i < news.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none', textDecoration: 'none' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', flexShrink: 0, marginTop: 7 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.45, margin: 0, fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.title}
                  </p>
                  <span style={{ fontSize: 10, color: '#374151', marginTop: 3, display: 'block' }}>
                    {item.time ? new Date(item.time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <ExternalLink size={11} color="#374151" style={{ flexShrink: 0, marginTop: 3 }} />
              </a>
            ))
          )}
        </div>
      )}

      {/* ── Footer tip ── */}
      <div style={{ padding: '0 20px', textAlign: 'center' }}>
        <p style={{ fontSize: 11, color: '#374151' }}>
          Ajouter à l'écran d'accueil · Safari → 📤 → "Sur l'écran d'accueil"
        </p>
      </div>

      {/* ── Config sheet ── */}
      {configOpen && (
        <ConfigSheet
          config={config}
          onChange={cfg => { setConfig(cfg); }}
          onClose={() => setConfigOpen(false)}
        />
      )}
    </div>
  )
}

// Avoid name collision with component's fetchAll
async function fetchAll_internal(symbols) {
  const results = await Promise.allSettled(symbols.map(fetchStock))
  const map = {}
  results.forEach((r, i) => { if (r.status === 'fulfilled' && r.value) map[symbols[i]] = r.value })
  return map
}
