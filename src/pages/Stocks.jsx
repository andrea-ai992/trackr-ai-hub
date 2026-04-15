import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  Loader2, RefreshCw, ChevronRight, TrendingUp, TrendingDown,
  Search, X, Star, Plus, ArrowUpRight, ArrowDownRight,
  BarChart3, Zap, Check,
} from 'lucide-react'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { PullIndicator } from '../components/Skeleton'
import StockLogo, { tickerColor } from '../components/StockLogo'

// ─── Default market stocks ────────────────────────────────────────────────────
const MARKET_STOCKS = [
  { symbol: 'AAPL',  name: 'Apple' },
  { symbol: 'MSFT',  name: 'Microsoft' },
  { symbol: 'NVDA',  name: 'NVIDIA' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN',  name: 'Amazon' },
  { symbol: 'META',  name: 'Meta' },
  { symbol: 'TSLA',  name: 'Tesla' },
  { symbol: 'AVGO',  name: 'Broadcom' },
  { symbol: 'JPM',   name: 'JPMorgan' },
  { symbol: 'LLY',   name: 'Eli Lilly' },
  { symbol: 'V',     name: 'Visa' },
  { symbol: 'UNH',   name: 'UnitedHealth' },
  { symbol: 'WMT',   name: 'Walmart' },
  { symbol: 'MA',    name: 'Mastercard' },
  { symbol: 'XOM',   name: 'Exxon' },
  { symbol: 'NFLX',  name: 'Netflix' },
  { symbol: 'AMD',   name: 'AMD' },
  { symbol: 'COST',  name: 'Costco' },
  { symbol: 'HD',    name: 'Home Depot' },
  { symbol: 'BRK-B', name: 'Berkshire' },
]

const INDICES = [
  { symbol: '^GSPC', label: 'S&P 500' },
  { symbol: '^IXIC', label: 'Nasdaq' },
  { symbol: '^DJI',  label: 'Dow Jones' },
  { symbol: '^FTSE', label: 'FTSE 100' },
  { symbol: '^VIX',  label: 'VIX' },
  { symbol: 'GC=F',  label: 'Gold' },
  { symbol: 'CL=F',  label: 'Oil (WTI)' },
  { symbol: 'EURUSD=X', label: 'EUR/USD' },
]

// ─── Formatters ───────────────────────────────────────────────────────────────
function fmtPrice(n, decimals = 2) {
  if (n == null) return '—'
  if (n >= 10000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 1 })
  return '$' + n.toFixed(decimals)
}
function fmtUSD(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtPct(n) {
  if (n == null) return '—'
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}

// ─── Fetch with proxy fallback ────────────────────────────────────────────────
const PRICE_CACHE = {}
const TTL = 20000 // 20s

async function fetchJSON(url) {
  // Try direct first (works on most deployments)
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) })
    if (r.ok) return await r.json()
  } catch {}
  // Fallback: allorigins proxy
  try {
    const proxy = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
    const r = await fetch(proxy, { signal: AbortSignal.timeout(10000) })
    if (r.ok) {
      const wrapper = await r.json()
      return JSON.parse(wrapper.contents)
    }
  } catch {}
  return null
}

async function fetchStockLive(symbol) {
  const cached = PRICE_CACHE[symbol]
  if (cached && Date.now() - cached.ts < TTL) return cached.data
  try {
    const json = await fetchJSON(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=1d&includePrePost=false`
    )
    const result = json?.chart?.result?.[0]
    if (!result) return null
    const meta = result.meta
    const closes = result.indicators?.quote?.[0]?.close || []
    const validCloses = closes.filter(v => v != null)
    const curr = meta.regularMarketPrice ?? meta.chartPreviousClose
    const prev = meta.previousClose ?? meta.chartPreviousClose
    const data = {
      symbol: meta.symbol || symbol,
      shortName: meta.shortName || meta.longName || symbol,
      current_price: curr,
      previousClose: prev,
      price_change_percentage_24h: curr && prev ? ((curr - prev) / prev) * 100 : null,
      marketState: meta.marketState,
      sparkline: validCloses,
      currency: meta.currency || 'USD',
    }
    PRICE_CACHE[symbol] = { data, ts: Date.now() }
    return data
  } catch { return null }
}

async function fetchBatch(symbols) {
  const results = await Promise.allSettled(symbols.map(fetchStockLive))
  const map = {}
  results.forEach((r, i) => { if (r.status === 'fulfilled' && r.value) map[symbols[i]] = r.value })
  return map
}

async function searchStocks(query) {
  const json = await fetchJSON(
    `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=10&newsCount=0&enableFuzzyQuery=false`
  )
  if (!json) return []
  return (json.quotes || [])
    .filter(q => ['EQUITY', 'ETF', 'INDEX', 'FUTURE', 'CURRENCY'].includes(q.quoteType))
    .slice(0, 8)
    .map(q => ({ symbol: q.symbol, name: q.shortname || q.longname || q.symbol, exchange: q.exchDisp, type: q.quoteType }))
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Spark({ data, up, width = 60, height = 26 }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />
  const slice = data.slice(-50)
  const min = Math.min(...slice), max = Math.max(...slice), range = max - min || 1
  const pts = slice.map((v, i) =>
    `${(i / (slice.length - 1)) * width},${height - ((v - min) / range) * (height - 4) + 2}`
  ).join(' ')
  const id = `s${up ? 'u' : 'd'}${data.length}`
  return (
    <svg width={width} height={height} style={{ overflow: 'visible', flexShrink: 0 }}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={up ? '#10b981' : '#ef4444'} stopOpacity={0.2} />
          <stop offset="100%" stopColor={up ? '#10b981' : '#ef4444'} stopOpacity={1} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={`url(#${id})`} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ─── Market State Dot ─────────────────────────────────────────────────────────
function MarketDot({ state }) {
  const color = state === 'REGULAR' ? '#10b981' : state === 'PRE' || state === 'POST' ? '#f59e0b' : '#6b7280'
  const label = state === 'REGULAR' ? 'Ouvert' : state === 'PRE' ? 'Pré' : state === 'POST' ? 'Après' : 'Fermé'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 600, color }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: color, boxShadow: state === 'REGULAR' ? `0 0 6px ${color}` : 'none' }} />
      {label}
    </span>
  )
}

// ─── Stock Row ────────────────────────────────────────────────────────────────
function StockRow({ symbol, name, rank, liveData: d, myHolding, hasHolding, onClick, onStar, isWatched }) {
  const pct = d?.price_change_percentage_24h
  const up = (pct ?? 0) >= 0
  const holdingQty = myHolding?.reduce((s, h) => s + (h.quantity || 0), 0) ?? 0
  const holdingInvested = myHolding?.reduce((s, h) => s + (h.buyPrice || 0) * (h.quantity || 0), 0) ?? 0
  const holdingValue = hasHolding && d?.current_price ? d.current_price * holdingQty : null
  const holdingPnL = holdingValue != null ? holdingValue - holdingInvested : null

  return (
    <div style={{ display: 'flex', alignItems: 'stretch', gap: 6 }}>
      <button onClick={onClick} className="press-scale"
        style={{
          flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 12,
          padding: '13px 14px', borderRadius: 18, cursor: 'pointer', textAlign: 'left',
          background: hasHolding ? 'rgba(99,102,241,0.07)' : 'rgba(255,255,255,0.025)',
          border: hasHolding ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
          transition: 'all 180ms',
        }}>
        {rank != null && (
          <span style={{ fontSize: 11, color: '#374151', width: 18, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
            {rank}
          </span>
        )}
        <StockLogo symbol={symbol} size={40} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{symbol}</span>
            {hasHolding && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 5, background: 'rgba(99,102,241,0.2)', color: '#818cf8', fontWeight: 700 }}>HODLing</span>}
          </div>
          <div style={{ fontSize: 12, color: '#4b5563', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {d?.shortName || name}
          </div>
          {hasHolding && holdingPnL != null && (
            <div style={{ fontSize: 11, fontWeight: 700, marginTop: 1, color: holdingPnL >= 0 ? '#10b981' : '#ef4444' }}>
              {fmtUSD(holdingValue)} · {holdingPnL >= 0 ? '+' : ''}{fmtUSD(holdingPnL)}
            </div>
          )}
        </div>
        <Spark data={d?.sparkline} up={up} />
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 72 }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: d?.current_price ? 'white' : '#374151', fontVariantNumeric: 'tabular-nums' }}>
            {d?.current_price ? fmtPrice(d.current_price) : <Loader2 size={14} className="animate-spin" style={{ color: '#374151' }} />}
          </div>
          {pct != null ? (
            <div style={{ fontSize: 12, fontWeight: 700, color: up ? '#10b981' : '#ef4444' }}>
              {fmtPct(pct)}
            </div>
          ) : d === undefined ? null : (
            <div style={{ fontSize: 11, color: '#374151' }}>—</div>
          )}
        </div>
        <ChevronRight size={14} color="#374151" style={{ flexShrink: 0 }} />
      </button>
      {onStar && (
        <button onClick={onStar} style={{
          width: 40, borderRadius: 14,
          border: isWatched ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.06)',
          background: isWatched ? 'rgba(234,179,8,0.1)' : 'rgba(255,255,255,0.025)',
          cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Star size={14} color={isWatched ? '#eab308' : '#374151'} fill={isWatched ? '#eab308' : 'none'} />
        </button>
      )}
    </div>
  )
}

// ─── Quick Add Position Sheet ─────────────────────────────────────────────────
function QuickAddSheet({ symbol, name, livePrice, onAdd, onClose }) {
  const [qty, setQty] = useState('')
  const [buyPrice, setBuyPrice] = useState(livePrice ? livePrice.toFixed(2) : '')
  const [buyDate, setBuyDate] = useState(new Date().toISOString().slice(0, 10))
  const [done, setDone] = useState(false)

  const total = parseFloat(qty) && parseFloat(buyPrice) ? parseFloat(qty) * parseFloat(buyPrice) : null

  function submit() {
    if (!qty || !buyPrice) return
    onAdd({ symbol, name, quantity: parseFloat(qty), buyPrice: parseFloat(buyPrice), buyDate })
    setDone(true)
    setTimeout(onClose, 900)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '28px 28px 0 0',
        padding: '24px 20px',
        paddingBottom: 'max(28px, env(safe-area-inset-bottom, 0px))',
        animation: 'slideUp 300ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'white' }}>Ajouter {symbol}</h2>
            <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{name}</p>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#9ca3af' }}>
            <X size={16} />
          </button>
        </div>

        {livePrice && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Prix live :</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>${livePrice.toFixed(2)}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#6b7280', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nombre d'actions</label>
              <input
                type="number" step="any" value={qty} onChange={e => setQty(e.target.value)}
                placeholder="10"
                style={{ width: '100%', fontSize: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, color: '#6b7280', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Prix d'achat ($)</label>
              <input
                type="number" step="any" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                placeholder={livePrice ? livePrice.toFixed(2) : '150.00'}
                style={{ width: '100%', fontSize: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 11, color: '#6b7280', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date d'achat</label>
            <input
              type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)}
              style={{ width: '100%', fontSize: 15, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none', colorScheme: 'dark' }}
            />
          </div>

          {total != null && (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: '#818cf8' }}>Investi total :</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: '#818cf8' }}>${total.toFixed(2)}</span>
              </div>
              {livePrice && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: '#4b5563' }}>Valeur actuelle :</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: (livePrice * parseFloat(qty) - total) >= 0 ? '#10b981' : '#ef4444' }}>
                    ${(livePrice * parseFloat(qty)).toFixed(2)} ({((livePrice * parseFloat(qty) - total) / total * 100).toFixed(1)}%)
                  </span>
                </div>
              )}
            </div>
          )}

          <button
            onClick={submit}
            disabled={!qty || !buyPrice || done}
            style={{
              padding: '15px', borderRadius: 16, border: 'none', cursor: qty && buyPrice ? 'pointer' : 'default',
              background: done ? 'rgba(16,185,129,0.2)' : qty && buyPrice ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              color: done ? '#10b981' : qty && buyPrice ? 'white' : '#4b5563',
              fontSize: 16, fontWeight: 700, transition: 'all 200ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {done ? <><Check size={18} /> Ajouté !</> : <><Plus size={18} /> Ajouter au portefeuille</>}
          </button>
        </div>
      </div>
      <style>{`@keyframes slideUp { from { transform: translateY(100%) } to { transform: translateY(0) } }`}</style>
    </div>
  )
}

// ─── Market Explorer (search overlay) ─────────────────────────────────────────
function MarketExplorer({ navigate, watchedSymbols, onWatch, onClose, onQuickAdd }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [prices, setPrices] = useState({})
  const [searching, setSearching] = useState(false)
  const [priceLoading, setPriceLoading] = useState(false)
  const inputRef = useRef(null)
  const debounce = useRef(null)

  useEffect(() => { setTimeout(() => inputRef.current?.focus(), 80) }, [])

  useEffect(() => {
    clearTimeout(debounce.current)
    if (!query.trim()) { setResults([]); setPrices({}); return }
    setSearching(true)
    debounce.current = setTimeout(async () => {
      const found = await searchStocks(query)
      setResults(found)
      setSearching(false)
      if (found.length > 0) {
        setPriceLoading(true)
        const syms = found.map(r => r.symbol)
        const map = await fetchBatch(syms)
        setPrices(map)
        setPriceLoading(false)
      }
    }, 350)
    return () => clearTimeout(debounce.current)
  }, [query])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 300,
      background: 'rgba(7,7,15,0.97)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      display: 'flex', flexDirection: 'column',
      paddingTop: 'max(12px, env(safe-area-inset-top, 0px))',
      paddingBottom: 'max(90px, calc(80px + env(safe-area-inset-bottom, 0px)))',
    }}>
      {/* Search bar */}
      <div style={{ padding: '0 16px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 18,
          background: 'rgba(255,255,255,0.07)', border: '1.5px solid rgba(99,102,241,0.4)',
        }}>
          {searching ? <Loader2 size={17} color="#6366f1" className="animate-spin" /> : <Search size={17} color="#6366f1" />}
          <input
            ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Chercher une action, ETF… (AAPL, Tesla, CAC 40…)"
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 16, fontFamily: 'inherit' }}
          />
          {query && (
            <button onClick={() => { setQuery(''); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 0 }}>
              <X size={16} />
            </button>
          )}
        </div>
        <button onClick={onClose} style={{
          padding: '12px 16px', borderRadius: 16,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
          color: '#9ca3af', fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>Fermer</button>
      </div>

      {/* Hint when empty */}
      {!query && (
        <div style={{ padding: '24px 20px', flex: 1, overflowY: 'auto' }}>
          <p style={{ fontSize: 13, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 16 }}>Suggestions</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {['Apple', 'Tesla', 'Amazon', 'CrowdStrike', 'NVIDIA', 'Meta', 'S&P 500', 'Gold', 'EUR/USD', 'CAC 40', 'LVMH', 'Airbus', 'TotalEnergies', 'Hermès', 'ASML', 'SAP', 'Palantir', 'Spotify'].map(q => (
              <button key={q} onClick={() => setQuery(q)} style={{
                padding: '8px 14px', borderRadius: 12,
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.18)',
                color: '#818cf8', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>{q}</button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: '#374151', marginTop: 20 }}>
            Recherche sur tous les marchés : NYSE, Nasdaq, Euronext, LSE, Tokyo…
          </p>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px' }}>
          <p style={{ fontSize: 12, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
            {results.length} résultat{results.length > 1 ? 's' : ''} · {priceLoading ? 'Chargement des prix…' : 'Prix live'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map(r => {
              const d = prices[r.symbol]
              const pct = d?.price_change_percentage_24h
              const up = (pct ?? 0) >= 0
              const isWatched = watchedSymbols.has(r.symbol)
              return (
                <div key={r.symbol} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 18,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                }}>
                  <StockLogo symbol={r.symbol} size={44} />
                  <button
                    onClick={() => { navigate(`/stocks/${r.symbol}`); onClose() }}
                    style={{ flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{r.symbol}</span>
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 5, fontWeight: 700,
                        background: r.type === 'ETF' ? 'rgba(16,185,129,0.12)' : r.type === 'INDEX' ? 'rgba(6,182,212,0.12)' : 'rgba(99,102,241,0.12)',
                        color: r.type === 'ETF' ? '#10b981' : r.type === 'INDEX' ? '#06b6d4' : '#818cf8',
                      }}>{r.type}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.name}{r.exchange ? ` · ${r.exchange}` : ''}
                    </div>
                  </button>

                  {/* Live price block */}
                  <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 76 }}>
                    {priceLoading && !d ? (
                      <Loader2 size={14} className="animate-spin" style={{ color: '#374151' }} />
                    ) : d?.current_price ? (
                      <>
                        <div style={{ fontSize: 16, fontWeight: 800, color: 'white', fontVariantNumeric: 'tabular-nums' }}>
                          {fmtPrice(d.current_price)}
                        </div>
                        {pct != null && (
                          <div style={{
                            fontSize: 13, fontWeight: 700,
                            color: up ? '#10b981' : '#ef4444',
                            display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
                          }}>
                            {up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                            {fmtPct(pct)}
                          </div>
                        )}
                        {d.marketState && <MarketDot state={d.marketState} />}
                      </>
                    ) : (
                      <span style={{ fontSize: 13, color: '#374151' }}>—</span>
                    )}
                  </div>

                  {/* Sparkline */}
                  {d?.sparkline && d.sparkline.length > 2 && (
                    <Spark data={d.sparkline} up={up} width={52} height={28} />
                  )}

                  {/* Watch + Quick add */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => onWatch(r.symbol, r.name)} style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: isWatched ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.05)',
                      border: isWatched ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.08)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Star size={14} color={isWatched ? '#eab308' : '#6b7280'} fill={isWatched ? '#eab308' : 'none'} />
                    </button>
                    <button onClick={() => onQuickAdd({ symbol: r.symbol, name: r.name, livePrice: d?.current_price })} style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Plus size={14} color="#818cf8" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* No results */}
      {query && !searching && results.length === 0 && (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
          <Search size={40} color="#374151" />
          <p style={{ fontSize: 16, color: '#6b7280', fontWeight: 600 }}>Aucun résultat pour "{query}"</p>
          <p style={{ fontSize: 13, color: '#374151' }}>Essaie le ticker exact (ex: TTE.PA pour TotalEnergies)</p>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Stocks() {
  const navigate = useNavigate()
  const { stocks, stockWatchlist, addStock, addToWatchlist, removeFromWatchlist } = useApp()
  const [stockData, setStockData] = useState({})
  const [indexData, setIndexData] = useState({})
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [explorerOpen, setExplorerOpen] = useState(false)
  const [quickAdd, setQuickAdd] = useState(null) // { symbol, name, livePrice }
  const [tab, setTab] = useState('market') // 'market' | 'watchlist' | 'portfolio'
  const secondsRef = useRef(null)
  const [secondsAgo, setSecondsAgo] = useState(0)

  const myHoldings = stocks.filter(s => !s.salePrice)
  const watchedSymbols = new Set(stockWatchlist.map(w => w.symbol))
  const marketSymbols = new Set(MARKET_STOCKS.map(s => s.symbol))
  const extraWatchlist = stockWatchlist.filter(w => !marketSymbols.has(w.symbol))

  const fetchData = useCallback(async () => {
    setLoading(true)
    const allSymbols = [...new Set([
      ...MARKET_STOCKS.map(s => s.symbol),
      ...extraWatchlist.map(w => w.symbol),
      ...myHoldings.map(s => s.symbol),
    ])]
    const [sMap, iMap] = await Promise.all([
      fetchBatch(allSymbols),
      fetchBatch(INDICES.map(i => i.symbol)),
    ])
    setStockData(sMap)
    setIndexData(iMap)
    setLastUpdate(Date.now())
    setSecondsAgo(0)
    setLoading(false)
  }, [stocks.length, stockWatchlist.length])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [fetchData])

  // Seconds counter
  useEffect(() => {
    secondsRef.current = setInterval(() => setSecondsAgo(s => s + 1), 1000)
    return () => clearInterval(secondsRef.current)
  }, [])
  useEffect(() => { setSecondsAgo(0) }, [lastUpdate])

  const { progress, refreshing: pullRefreshing } = usePullToRefresh(fetchData)

  function handleWatch(symbol, name) {
    if (watchedSymbols.has(symbol)) removeFromWatchlist(symbol)
    else addToWatchlist({ symbol, name })
  }

  // Portfolio stats
  const totalInvested = myHoldings.reduce((s, h) => s + (h.buyPrice || 0) * (h.quantity || 0), 0)
  const totalValue = myHoldings.reduce((s, h) => {
    const live = stockData[h.symbol]?.current_price ?? h.buyPrice
    return s + (live || 0) * (h.quantity || 0)
  }, 0)
  const totalPnL = totalValue - totalInvested
  const pnlPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0
  const isUp = totalPnL >= 0

  // Global market state from first loaded stock
  const anyData = Object.values(stockData)[0]
  const marketState = anyData?.marketState || null

  const TABS = [
    { id: 'market', label: 'Marché', count: MARKET_STOCKS.length },
    { id: 'watchlist', label: 'Watchlist', count: extraWatchlist.length },
    { id: 'portfolio', label: 'Portefeuille', count: myHoldings.length },
  ]

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', paddingBottom: 32 }}>
      <PullIndicator progress={progress} refreshing={pullRefreshing} />

      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,7,15,0.95)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'max(52px, env(safe-area-inset-top, 0px))',
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TrendingUp size={20} color="#10b981" />
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Actions</span>
            {marketState && <MarketDot state={marketState} />}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {lastUpdate && (
              <span style={{ fontSize: 10, color: '#374151', fontVariantNumeric: 'tabular-nums' }}>
                {secondsAgo < 5 ? '● Mis à jour' : `il y a ${secondsAgo}s`}
              </span>
            )}
            <button onClick={fetchData} disabled={loading} style={{
              width: 34, height: 34, borderRadius: 11,
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280',
            }}>
              {loading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
          </div>
        </div>

        {/* Search / Explorer button */}
        <div style={{ padding: '0 16px 10px' }}>
          <button onClick={() => setExplorerOpen(true)} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '12px 16px', borderRadius: 16,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
            cursor: 'pointer', textAlign: 'left',
          }}>
            <Search size={16} color="#6b7280" />
            <span style={{ fontSize: 15, color: '#4b5563', flex: 1 }}>Rechercher une action, ETF, indice…</span>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 7, background: 'rgba(99,102,241,0.12)', color: '#818cf8', fontWeight: 700 }}>
              Tous marchés
            </span>
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 6, padding: '0 16px 12px', overflowX: 'auto' }} className="no-scrollbar">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '7px 14px', borderRadius: 12, whiteSpace: 'nowrap',
              background: tab === t.id ? 'rgba(16,185,129,0.14)' : 'rgba(255,255,255,0.04)',
              border: tab === t.id ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(255,255,255,0.06)',
              color: tab === t.id ? '#10b981' : '#6b7280',
              fontSize: 13, fontWeight: tab === t.id ? 700 : 500, cursor: 'pointer',
            }}>
              {t.label}
              {t.count > 0 && (
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 5,
                  background: tab === t.id ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)',
                  color: tab === t.id ? '#10b981' : '#4b5563',
                }}>{t.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Index strip ── */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '14px 16px 4px' }} className="no-scrollbar">
        {INDICES.map(idx => {
          const d = indexData[idx.symbol]
          const pct = d?.price_change_percentage_24h
          const up = (pct ?? 0) >= 0
          return (
            <div key={idx.symbol} style={{
              flexShrink: 0, padding: '10px 14px', borderRadius: 14,
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
              minWidth: 90,
            }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5, whiteSpace: 'nowrap' }}>{idx.label}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: d?.current_price ? 'white' : '#374151', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
                {d?.current_price ? fmtPrice(d.current_price) : loading ? '…' : '—'}
              </div>
              {pct != null && (
                <div style={{ fontSize: 10, fontWeight: 700, color: up ? '#10b981' : '#ef4444', marginTop: 2 }}>
                  {fmtPct(pct)}
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ padding: '16px 16px 0' }}>

        {/* ── PORTFOLIO TAB ── */}
        {tab === 'portfolio' && (
          <>
            {/* Add position button */}
            <button
              onClick={() => setExplorerOpen(true)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px', borderRadius: 16, marginBottom: 14, cursor: 'pointer',
                background: 'rgba(99,102,241,0.08)', border: '1.5px dashed rgba(99,102,241,0.3)',
              }}
            >
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(99,102,241,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Plus size={16} color="#818cf8" />
              </div>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#818cf8' }}>Ajouter une action au portefeuille</span>
            </button>

            {myHoldings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <BarChart3 size={44} color="#374151" style={{ margin: '0 auto 14px', display: 'block' }} />
                <p style={{ fontSize: 16, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>Aucune position</p>
                <p style={{ fontSize: 13, color: '#4b5563' }}>Recherche une action et appuie sur "+" pour l'ajouter</p>
              </div>
            ) : (
              <>
                {/* Portfolio summary card */}
                <div style={{
                  marginBottom: 16, padding: '20px', borderRadius: 22,
                  background: isUp ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
                  border: `1px solid ${isUp ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
                }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Valeur totale</div>
                  <div style={{ fontSize: 34, fontWeight: 900, color: 'white', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(totalValue)}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 16, fontWeight: 800, color: isUp ? '#10b981' : '#ef4444' }}>
                      {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                      {isUp ? '+' : ''}{fmtUSD(totalPnL)}
                    </span>
                    <span style={{ fontSize: 13, padding: '3px 10px', borderRadius: 20, fontWeight: 700, background: isUp ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: isUp ? '#10b981' : '#ef4444' }}>
                      {isUp ? '+' : ''}{pnlPct.toFixed(2)}%
                    </span>
                  </div>
                  <div style={{ fontSize: 11, color: '#4b5563', marginTop: 8 }}>Investi: {fmtUSD(totalInvested)} · {myHoldings.length} position{myHoldings.length > 1 ? 's' : ''}</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {myHoldings.map(h => {
                    const d = stockData[h.symbol]
                    const myH = myHoldings.filter(x => x.symbol === h.symbol)
                    return (
                      <StockRow key={h.id} symbol={h.symbol} name={h.name || h.symbol}
                        liveData={d} myHolding={myH} hasHolding
                        onClick={() => navigate(`/stocks/${h.id}`)}
                        onStar={() => handleWatch(h.symbol, h.name || h.symbol)}
                        isWatched={watchedSymbols.has(h.symbol)}
                      />
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── WATCHLIST TAB ── */}
        {tab === 'watchlist' && (
          <>
            {extraWatchlist.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Star size={44} color="#374151" style={{ margin: '0 auto 14px', display: 'block' }} />
                <p style={{ fontSize: 16, fontWeight: 700, color: '#6b7280', marginBottom: 8 }}>Watchlist vide</p>
                <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 20 }}>Utilise la recherche pour ajouter des actions à surveiller</p>
                <button onClick={() => setExplorerOpen(true)} style={{ padding: '10px 20px', borderRadius: 13, background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)', color: '#eab308', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  Rechercher une action
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {extraWatchlist.map(w => {
                  const myH = myHoldings.filter(h => h.symbol === w.symbol)
                  return (
                    <StockRow key={w.symbol} symbol={w.symbol} name={w.name}
                      liveData={stockData[w.symbol]} myHolding={myH} hasHolding={myH.length > 0}
                      onClick={() => navigate(myH.length > 0 ? `/stocks/${myH[0].id}` : `/stocks/${w.symbol}`)}
                      onStar={() => handleWatch(w.symbol, w.name)}
                      isWatched
                    />
                  )
                })}
              </div>
            )}
          </>
        )}

        {/* ── MARKET TAB ── */}
        {tab === 'market' && (
          <>
            {myHoldings.length > 0 && (
              <div style={{
                marginBottom: 16, padding: '14px 16px', borderRadius: 18,
                background: isUp ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                border: `1px solid ${isUp ? 'rgba(16,185,129,0.18)' : 'rgba(239,68,68,0.18)'}`,
                display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer',
              }} onClick={() => setTab('portfolio')}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Mon portefeuille</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 20, fontWeight: 900, color: 'white' }}>{fmtUSD(totalValue)}</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: isUp ? '#10b981' : '#ef4444' }}>
                      {isUp ? '+' : ''}{fmtUSD(totalPnL)} ({isUp ? '+' : ''}{pnlPct.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <ChevronRight size={16} color="#4b5563" />
              </div>
            )}

            <div style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Top {MARKET_STOCKS.length} · Prix live · Auto-refresh 30s
            </div>

            {loading && Object.keys(stockData).length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[...Array(8)].map((_, i) => (
                  <div key={i} style={{ height: 74, borderRadius: 18, background: 'rgba(255,255,255,0.03)' }} className="skeleton" />
                ))}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {MARKET_STOCKS.map((s, i) => {
                  const myH = myHoldings.filter(h => h.symbol === s.symbol)
                  const d = stockData[s.symbol]
                  return (
                    <div key={s.symbol} style={{ display: 'flex', gap: 6 }}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <StockRow symbol={s.symbol} name={s.name} rank={i + 1}
                          liveData={d} myHolding={myH} hasHolding={myH.length > 0}
                          onClick={() => navigate(myH.length > 0 ? `/stocks/${myH[0].id}` : `/stocks/${s.symbol}`)}
                          onStar={() => handleWatch(s.symbol, s.name)}
                          isWatched={watchedSymbols.has(s.symbol)}
                        />
                      </div>
                      {!myH.length && (
                        <button
                          onClick={() => setQuickAdd({ symbol: s.symbol, name: s.name, livePrice: d?.current_price })}
                          style={{
                            width: 40, borderRadius: 14, flexShrink: 0,
                            background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >
                          <Plus size={14} color="#818cf8" />
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Market Explorer Overlay ── */}
      {explorerOpen && (
        <MarketExplorer
          navigate={navigate}
          watchedSymbols={watchedSymbols}
          onWatch={handleWatch}
          onClose={() => setExplorerOpen(false)}
          onQuickAdd={({ symbol, name, livePrice }) => {
            setExplorerOpen(false)
            setQuickAdd({ symbol, name, livePrice })
          }}
        />
      )}

      {/* ── Quick Add Sheet ── */}
      {quickAdd && (
        <QuickAddSheet
          symbol={quickAdd.symbol}
          name={quickAdd.name}
          livePrice={quickAdd.livePrice}
          onAdd={({ symbol, name, quantity, buyPrice, buyDate }) => {
            addStock({ symbol, name, quantity, buyPrice, buyDate })
            addToWatchlist({ symbol, name })
          }}
          onClose={() => setQuickAdd(null)}
        />
      )}
    </div>
  )
}
