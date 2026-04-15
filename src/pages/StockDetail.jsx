import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext'
import { fetchNewsForSymbol } from '../hooks/useNews'
import { useStockPrice } from '../hooks/useStockPrice'
import {
  ArrowLeft, Bell, ExternalLink, Loader2, X, Plus, Check, BarChart2,
  Pencil, Trash2, MoreHorizontal, Star,
} from 'lucide-react'
import Modal from '../components/Modal'
import { requestNotificationPermission } from '../hooks/useAlerts'
import TradingViewChart from '../components/TradingViewChart'
import StockLogo from '../components/StockLogo'

function fmt(n, dec = 2) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec })
}
function fmtCur(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
}
function fmtCompact(n) {
  if (n == null) return '—'
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`
  return `$${n.toLocaleString()}`
}
function timeAgo(ts) {
  const diff = Math.floor((Date.now() / 1000 - ts) / 60)
  if (diff < 60) return `${diff}m ago`
  const h = Math.floor(diff / 60)
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`
}

const TICKER_COLORS = {
  AAPL: '#6366f1', MSFT: '#0ea5e9', GOOGL: '#10b981', AMZN: '#f59e0b',
  TSLA: '#ef4444', META: '#3b82f6', NVDA: '#8b5cf6', BTC: '#f59e0b',
}
function tickerColor(sym) {
  if (TICKER_COLORS[sym]) return TICKER_COLORS[sym]
  const colors = ['#6366f1','#10b981','#f59e0b','#ef4444','#8b5cf6','#06b6d4','#f97316','#ec4899']
  let h = 0; for (const c of (sym || '')) h = (h * 31 + c.charCodeAt(0)) & 0xffff
  return colors[h % colors.length]
}

// ── Inline Add-to-Portfolio sheet ────────────────────────────────────────────
function AddPortfolioSheet({ symbol, livePrice, onAdd, onClose }) {
  const [qty, setQty] = useState('')
  const [buyPrice, setBuyPrice] = useState(livePrice ? fmt(livePrice) : '')
  const [buyDate, setBuyDate] = useState(new Date().toISOString().slice(0, 10))

  const totalInvested = parseFloat(qty) && parseFloat(buyPrice)
    ? parseFloat(qty) * parseFloat(buyPrice) : null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 500, display: 'flex', flexDirection: 'column',
      justifyContent: 'flex-end',
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.65)' }} />

      {/* Sheet */}
      <div style={{
        position: 'relative', zIndex: 1,
        background: '#0f0f1a',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '28px 28px 0 0',
        padding: '24px 20px',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom, 0px))',
        animation: 'slideUp 300ms cubic-bezier(0.22,1,0.36,1) both',
      }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.15)', margin: '0 auto 20px' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: 'white' }}>Add {symbol} to Portfolio</h2>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: 10, padding: 8, cursor: 'pointer', color: '#9ca3af' }}>
            <X size={16} />
          </button>
        </div>

        {livePrice && (
          <div style={{ marginBottom: 16, padding: '10px 14px', borderRadius: 14, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
            <span style={{ fontSize: 13, color: '#9ca3af' }}>Live price:</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: '#10b981' }}>{fmtCur(livePrice)}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shares</label>
              <input
                type="number" step="any" value={qty} onChange={e => setQty(e.target.value)}
                placeholder="10"
                style={{ width: '100%', fontSize: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buy Price ($)</label>
              <input
                type="number" step="any" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                placeholder={livePrice ? fmt(livePrice) : '150.00'}
                style={{ width: '100%', fontSize: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Bought</label>
            <input
              type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)}
              style={{ width: '100%', fontSize: 15, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none', colorScheme: 'dark' }}
            />
          </div>

          {totalInvested && (
            <div style={{ padding: '12px 14px', borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <span style={{ fontSize: 14, color: '#818cf8' }}>
                Total invested: <strong>{fmtCur(totalInvested)}</strong>
              </span>
            </div>
          )}

          <button
            onClick={() => {
              if (!qty || !buyPrice) return
              onAdd({ quantity: parseFloat(qty), buyPrice: parseFloat(buyPrice), buyDate })
            }}
            disabled={!qty || !buyPrice}
            style={{
              padding: '15px', borderRadius: 16, border: 'none', cursor: 'pointer',
              background: qty && buyPrice ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'rgba(255,255,255,0.06)',
              color: qty && buyPrice ? 'white' : '#4b5563',
              fontSize: 16, fontWeight: 700, transition: 'all 200ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            <Plus size={18} />
            Add to Portfolio
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StockDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { stocks, addStock, updateStock, deleteStock, stockWatchlist, addToWatchlist, removeFromWatchlist, alerts, addAlert, deleteAlert } = useApp()
  const isWatched = stockWatchlist?.some(w => w.symbol === symbol)

  // id can be an internal stock ID OR a ticker symbol
  const stockById = stocks.find(s => s.id === id)
  const stockBySym = stocks.find(s => s.symbol?.toUpperCase() === id?.toUpperCase())
  const stock = stockById || stockBySym
  const symbol = stock?.symbol || id?.toUpperCase()
  const isOwned = !!stock

  const { price: livePrice, loading: priceLoading } = useStockPrice(symbol)
  const [news, setNews] = useState([])
  const [newsLoading, setNewsLoading] = useState(true)
  const [showAlertModal, setShowAlertModal] = useState(false)
  const [alertForm, setAlertForm] = useState({ targetPrice: '', direction: 'above' })
  const [showAddPortfolio, setShowAddPortfolio] = useState(false)
  const [addedTick, setAddedTick] = useState(false)
  const [exchangeCode, setExchangeCode] = useState(null)
  const [showMenu, setShowMenu] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)
  const [editForm, setEditForm] = useState({ quantity: '', buyPrice: '', buyDate: '' })

  // Extended market data: 52W, market cap, P/E, beta, dividend
  const [mktData, setMktData] = useState(null)
  useEffect(() => {
    if (!symbol) return
    fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,price`,
      { signal: AbortSignal.timeout(10000) }
    )
      .then(r => r.json())
      .then(j => {
        const r0 = j?.quoteSummary?.result?.[0]
        const sd = r0?.summaryDetail
        const ks = r0?.defaultKeyStatistics
        const pr = r0?.price
        const exchCode = pr?.exchange || pr?.exchangeName
        setExchangeCode(exchCode)
        setMktData({
          marketCap: pr?.marketCap?.raw ?? sd?.marketCap?.raw,
          fiftyTwoWeekHigh: sd?.fiftyTwoWeekHigh?.raw,
          fiftyTwoWeekLow: sd?.fiftyTwoWeekLow?.raw,
          trailingPE: sd?.trailingPE?.raw,
          forwardPE: sd?.forwardPE?.raw,
          beta: sd?.beta?.raw,
          dividendYield: sd?.dividendYield?.raw,
          eps: ks?.trailingEps?.raw,
          shortName: pr?.shortName,
          exchangeName: pr?.exchangeName,
          marketState: pr?.marketState,
          sector: ks?.sector,
        })
      })
      .catch(() => {})
  }, [symbol])

  useEffect(() => {
    if (!symbol) return
    setNewsLoading(true)
    fetchNewsForSymbol(symbol).then(n => { setNews(n); setNewsLoading(false) })
  }, [symbol])

  // Price flash
  const prevPriceRef = useRef(null)
  const [priceFlashClass, setPriceFlashClass] = useState('')
  const liveResolved = livePrice
  useEffect(() => {
    if (liveResolved == null || prevPriceRef.current == null) { prevPriceRef.current = liveResolved; return }
    if (liveResolved !== prevPriceRef.current) {
      const cls = liveResolved > prevPriceRef.current ? 'price-flash-up' : 'price-flash-down'
      setPriceFlashClass(cls)
      prevPriceRef.current = liveResolved
      const t = setTimeout(() => setPriceFlashClass(''), 700)
      return () => clearTimeout(t)
    }
  }, [liveResolved])

  const currentPrice = liveResolved
  const brandColor = tickerColor(symbol)

  // Portfolio P&L (only if owned)
  const pnl = (isOwned && currentPrice && stock.buyPrice) ? (currentPrice - stock.buyPrice) * stock.quantity : null
  const pnlPct = (isOwned && currentPrice && stock.buyPrice) ? ((currentPrice - stock.buyPrice) / stock.buyPrice) * 100 : null
  const invested = isOwned ? (stock.buyPrice * stock.quantity) : null
  const currentValue = (isOwned && currentPrice) ? currentPrice * stock.quantity : null

  const activeAlerts = alerts.filter(a => !a.triggered && a.symbol === symbol)

  async function handleAddAlert() {
    const granted = await requestNotificationPermission()
    if (!granted) { alert('Enable notifications in your browser settings.'); return }
    addAlert({
      symbol,
      name: mktData?.shortName || meta?.shortName || symbol,
      targetPrice: parseFloat(alertForm.targetPrice),
      direction: alertForm.direction,
    })
    setShowAlertModal(false)
    setAlertForm({ targetPrice: '', direction: 'above' })
  }

  function openEdit() {
    if (!stock) return
    setEditForm({ quantity: String(stock.quantity), buyPrice: String(stock.buyPrice), buyDate: stock.buyDate || '' })
    setShowMenu(false)
    setShowEdit(true)
  }
  function handleSaveEdit() {
    updateStock(stock.id, {
      quantity: parseFloat(editForm.quantity) || stock.quantity,
      buyPrice: parseFloat(editForm.buyPrice) || stock.buyPrice,
      buyDate: editForm.buyDate,
    })
    setShowEdit(false)
  }
  function handleDelete() {
    deleteStock(stock.id)
    navigate(-1)
  }

  function handleAddToPortfolio({ quantity, buyPrice, buyDate }) {
    addStock({
      symbol,
      name: mktData?.shortName || meta?.shortName || symbol,
      quantity,
      buyPrice,
      buyDate,
      salePrice: null,
    })
    setShowAddPortfolio(false)
    setAddedTick(true)
    setTimeout(() => setAddedTick(false), 2000)
  }

  // Stats row — market data + portfolio data
  const marketName = mktData?.exchangeName || 'Stock'
  const marketState = mktData?.marketState

  // Portfolio stats (only when owned)
  const portfolioStats = isOwned ? [
    { label: 'Buy Price', value: `$${fmt(stock.buyPrice)}` },
    { label: 'Shares', value: `${stock.quantity}` },
    { label: 'Invested', value: fmtCur(invested) },
    {
      label: 'P&L',
      value: pnl != null ? `${pnl >= 0 ? '+' : ''}${fmtCur(pnl)}` : '—',
      color: pnl != null ? (pnl >= 0 ? '#10b981' : '#ef4444') : undefined,
    },
    {
      label: 'Return',
      value: pnlPct != null ? `${pnlPct >= 0 ? '+' : ''}${fmt(pnlPct)}%` : '—',
      color: pnlPct != null ? (pnlPct >= 0 ? '#10b981' : '#ef4444') : undefined,
    },
    { label: 'Value', value: currentValue ? fmtCur(currentValue) : '—' },
  ] : []

  const marketStats = [
    ...(mktData?.marketCap ? [{ label: 'Mkt Cap', value: fmtCompact(mktData.marketCap) }] : []),
    ...(mktData?.fiftyTwoWeekHigh ? [{ label: '52W High', value: `$${fmt(mktData.fiftyTwoWeekHigh)}` }] : []),
    ...(mktData?.fiftyTwoWeekLow ? [{ label: '52W Low', value: `$${fmt(mktData.fiftyTwoWeekLow)}` }] : []),
    ...(mktData?.trailingPE ? [{ label: 'P/E', value: fmt(mktData.trailingPE) }] : []),
    ...(mktData?.eps ? [{ label: 'EPS', value: `$${fmt(mktData.eps)}` }] : []),
    ...(mktData?.beta ? [{ label: 'Beta', value: fmt(mktData.beta) }] : []),
    ...(mktData?.dividendYield ? [{ label: 'Div Yield', value: `${(mktData.dividendYield * 100).toFixed(2)}%` }] : []),
  ]

  const statsRow = [...portfolioStats, ...marketStats]

  const companyName = mktData?.shortName || symbol

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4"
        style={{ paddingTop: 'max(12px, env(safe-area-inset-top, 0px))', paddingBottom: 12 }}>
        <button onClick={() => { navigator.vibrate?.(6); navigate(-1) }}
          className="w-9 h-9 flex items-center justify-center rounded-full press-scale"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <ArrowLeft size={17} className="text-gray-300" />
        </button>
        <span className="text-sm font-bold text-white tracking-wide">{symbol}</span>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowAlertModal(true)}
            className="w-9 h-9 flex items-center justify-center rounded-full press-scale"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Bell size={16} className="text-gray-300" />
          </button>
          {isOwned && (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowMenu(v => !v)}
                className="w-9 h-9 flex items-center justify-center rounded-full press-scale"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <MoreHorizontal size={16} className="text-gray-300" />
              </button>
              {showMenu && (
                <>
                  <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 200 }} />
                  <div style={{ position: 'absolute', right: 0, top: 44, zIndex: 300, background: '#111120', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 16, overflow: 'hidden', minWidth: 150, boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                    <button onClick={openEdit}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'white', fontSize: 14, fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                      <Pencil size={14} color="#818cf8" /> Edit Position
                    </button>
                    <button onClick={() => { setShowMenu(false); setShowConfirmDelete(true) }}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '13px 16px', background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 14, fontWeight: 600 }}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── App Icon + Name ── */}
      <div className="flex items-start gap-4 px-5 pt-3 pb-5">
        <StockLogo symbol={symbol} size={76} />

        <div className="flex-1 min-w-0 pt-1">
          <h1 className="text-xl font-bold text-white leading-tight line-clamp-1">
            {companyName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{symbol} · {marketName}</p>
          <div className="flex items-center gap-2 mt-2.5 flex-wrap">
            {marketState && (
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-semibold ${
                marketState === 'REGULAR'
                  ? 'bg-emerald-500/10 text-emerald-400'
                  : 'bg-gray-500/10 text-gray-500'
              }`}>
                {marketState === 'REGULAR' ? '● Live' : '● Closed'}
              </span>
            )}
            {isOwned && (
              <span className="text-[11px] px-2.5 py-1 rounded-full font-semibold bg-indigo-500/10 text-indigo-400">
                In Portfolio
              </span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end', flexShrink: 0 }}>
          {!isOwned ? (
            <button onClick={() => setShowAddPortfolio(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold press-scale"
              style={{ background: addedTick ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)', border: addedTick ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(99,102,241,0.35)', color: addedTick ? '#10b981' : '#818cf8' }}>
              {addedTick ? <Check size={12} /> : <Plus size={12} />}
              {addedTick ? 'Added!' : 'Add'}
            </button>
          ) : (
            <button onClick={() => setShowAlertModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold press-scale"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.28)', color: '#818cf8' }}>
              <Bell size={12} />
              Alert
            </button>
          )}
          {/* Watchlist toggle */}
          <button
            onClick={() => isWatched ? removeFromWatchlist(symbol) : addToWatchlist({ symbol, name: companyName })}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold press-scale"
            style={{ background: isWatched ? 'rgba(234,179,8,0.12)' : 'rgba(255,255,255,0.05)', border: isWatched ? '1px solid rgba(234,179,8,0.3)' : '1px solid rgba(255,255,255,0.08)', color: isWatched ? '#eab308' : '#6b7280' }}>
            <Star size={12} fill={isWatched ? '#eab308' : 'none'} />
            {isWatched ? 'Watching' : 'Watch'}
          </button>
        </div>
      </div>

      {/* ── Price row ── */}
      <div className="px-5 pb-4">
        {currentPrice ? (
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className={`text-4xl font-black text-white ${priceFlashClass}`}>
              ${fmt(currentPrice)}
            </span>
            <span style={{ fontSize: 13, color: '#4b5563' }}>USD · Live</span>
          </div>
        ) : priceLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Loader2 size={20} className="animate-spin text-gray-600" />
            <span style={{ color: '#4b5563', fontSize: 14 }}>Loading {symbol}…</span>
          </div>
        ) : (
          <div style={{ color: '#6b7280', fontSize: 14 }}>Price unavailable · See chart below</div>
        )}
      </div>

      {/* ── Stats divider row ── */}
      {statsRow.length > 0 && (
        <div className="border-t border-b border-white/[0.06] overflow-x-auto no-scrollbar">
          <div className="flex items-stretch" style={{ minWidth: 'max-content' }}>
            {statsRow.map((stat, i) => (
              <div key={stat.label}
                className="flex flex-col items-center justify-center px-5 py-3.5"
                style={{ borderRight: i < statsRow.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', minWidth: 80 }}>
                <span className="text-[9px] font-semibold uppercase tracking-widest text-gray-600 mb-1.5 whitespace-nowrap">
                  {stat.label}
                </span>
                <span className="text-[13px] font-bold whitespace-nowrap" style={{ color: stat.color || 'white' }}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Not-in-portfolio banner ── */}
      {!isOwned && (
        <div style={{
          margin: '16px 16px 0', padding: '14px 16px', borderRadius: 18,
          background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 size={18} color="#818cf8" />
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'white' }}>Track your position</div>
              <div style={{ fontSize: 12, color: '#6b7280' }}>Add your buy-in to see real-time P&L</div>
            </div>
          </div>
          <button
            onClick={() => setShowAddPortfolio(true)}
            className="press-scale"
            style={{
              padding: '8px 14px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: 'white', fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap',
            }}>
            Add Position
          </button>
        </div>
      )}

      {/* ── TradingView Live Chart ── */}
      <div style={{ padding: '0 16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Chart</span>
          <span style={{ fontSize: 10, color: '#10b981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="live-ping" />
            TradingView
          </span>
          {isOwned && stock.buyPrice && (
            <span style={{ marginLeft: 'auto', fontSize: 11, color: brandColor, fontWeight: 600 }}>
              Buy line: ${fmt(stock.buyPrice)}
            </span>
          )}
        </div>
        <TradingViewChart symbol={symbol} exchangeCode={exchangeCode} height={420} />
      </div>

      {/* ── Active Alerts ── */}
      {activeAlerts.length > 0 && (
        <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: 'rgba(234,179,8,0.05)', border: '1px solid rgba(234,179,8,0.2)' }}>
          <p className="text-[10px] font-semibold text-yellow-500 uppercase tracking-widest mb-3">Active Alerts</p>
          {activeAlerts.map(a => (
            <div key={a.id} className="flex items-center justify-between py-1">
              <span className="text-sm text-white">{a.direction === 'above' ? '↑ Above' : '↓ Below'} ${fmt(a.targetPrice)}</span>
              <button onClick={() => deleteAlert(a.id)} className="text-gray-600 hover:text-red-400 p-1 press-scale">
                <X size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ── News ── */}
      <div className="border-t border-white/[0.06] px-5 pt-6 pb-10">
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-bold text-white">News</h2>
          <span className="text-xs text-gray-500 font-medium">{symbol}</span>
        </div>

        {newsLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
            ))}
          </div>
        ) : news.length === 0 ? (
          <p className="text-gray-600 text-sm">No news available</p>
        ) : (
          <div className="space-y-3">
            {news.map((n, i) => (
              <a key={n.id || i} href={n.url} target="_blank" rel="noreferrer"
                className="group flex gap-3.5 p-4 rounded-2xl transition-all press-scale"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                {n.thumbnail && (
                  <img src={n.thumbnail} alt="" className="w-16 h-16 rounded-xl object-cover opacity-80 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wide">{n.publisher}</span>
                    <span className="text-gray-700 text-[10px]">·</span>
                    <span className="text-[11px] text-gray-600">{timeAgo(n.time)}</span>
                  </div>
                  <p className="text-[13px] text-white leading-snug line-clamp-2 group-hover:text-indigo-200 transition-colors">{n.title}</p>
                </div>
                <ExternalLink size={12} className="text-gray-700 group-hover:text-gray-400 transition-colors shrink-0 mt-0.5" />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* ── Add to Portfolio sheet ── */}
      {showAddPortfolio && (
        <AddPortfolioSheet
          symbol={symbol}
          livePrice={currentPrice}
          onAdd={handleAddToPortfolio}
          onClose={() => setShowAddPortfolio(false)}
        />
      )}

      {/* ── Edit position modal ── */}
      {showEdit && stock && (
        <Modal title={`Edit ${symbol} Position`} onClose={() => setShowEdit(false)} size="sm">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Shares</label>
                <input type="number" step="any" value={editForm.quantity} onChange={e => setEditForm(f => ({ ...f, quantity: e.target.value }))}
                  style={{ width: '100%', fontSize: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Buy Price ($)</label>
                <input type="number" step="any" value={editForm.buyPrice} onChange={e => setEditForm(f => ({ ...f, buyPrice: e.target.value }))}
                  style={{ width: '100%', fontSize: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: '#6b7280', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date Bought</label>
              <input type="date" value={editForm.buyDate} onChange={e => setEditForm(f => ({ ...f, buyDate: e.target.value }))}
                style={{ width: '100%', fontSize: 15, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '12px 14px', color: 'white', outline: 'none', colorScheme: 'dark' }} />
            </div>
            {editForm.quantity && editForm.buyPrice && currentPrice && (
              <div style={{ padding: '10px 14px', borderRadius: 14, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: 13, color: '#818cf8' }}>
                  Invested: <strong>{fmtCur(parseFloat(editForm.quantity) * parseFloat(editForm.buyPrice))}</strong>
                  {' · '}P&L: <strong style={{ color: currentPrice > parseFloat(editForm.buyPrice) ? '#10b981' : '#ef4444' }}>
                    {fmtCur((currentPrice - parseFloat(editForm.buyPrice)) * parseFloat(editForm.quantity))}
                  </strong>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setShowEdit(false)}
                style={{ flex: 1, padding: '13px', borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: 15, cursor: 'pointer', background: 'transparent' }}>Cancel</button>
              <button onClick={handleSaveEdit}
                style={{ flex: 1, padding: '13px', borderRadius: 14, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none' }}>Save</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Confirm delete modal ── */}
      {showConfirmDelete && stock && (
        <Modal title="Remove Position?" onClose={() => setShowConfirmDelete(false)} size="sm">
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🗑️</div>
            <p style={{ fontSize: 17, color: 'white', fontWeight: 700, marginBottom: 8 }}>Remove {symbol}?</p>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>This will delete your position. Cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowConfirmDelete(false)}
                style={{ flex: 1, padding: '14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: 15, cursor: 'pointer', background: 'transparent' }}>Cancel</button>
              <button onClick={handleDelete}
                style={{ flex: 1, padding: '14px', borderRadius: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Alert modal ── */}
      {showAlertModal && (
        <Modal title={`Set Alert — ${symbol}`} onClose={() => setShowAlertModal(false)} size="sm">
          <div className="flex flex-col gap-4">
            {currentPrice && (
              <div className="text-center py-2">
                <div className="text-xs text-gray-500 mb-1">Current Price</div>
                <div className="text-2xl font-bold text-white">${fmt(currentPrice)}</div>
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Direction</label>
              <div className="grid grid-cols-2 gap-2">
                {['above', 'below'].map(d => (
                  <button key={d} onClick={() => setAlertForm(f => ({ ...f, direction: d }))}
                    className={`py-2.5 rounded-xl text-sm font-medium transition-all ${
                      alertForm.direction === d
                        ? d === 'above'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                        : 'bg-white/[0.04] text-gray-500 border border-transparent'
                    }`}>
                    {d === 'above' ? '↑ Above' : '↓ Below'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1.5">Target Price ($)</label>
              <input type="number" value={alertForm.targetPrice}
                onChange={e => setAlertForm(f => ({ ...f, targetPrice: e.target.value }))}
                placeholder={currentPrice ? fmt(currentPrice) : '150.00'}
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-700 focus:outline-none focus:border-yellow-500/50 transition-all" />
            </div>
            <button onClick={handleAddAlert} disabled={!alertForm.targetPrice}
              className="py-2.5 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-40 hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #d97706, #f59e0b)' }}>
              Create Alert
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
