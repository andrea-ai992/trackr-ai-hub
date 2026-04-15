import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Loader2, RefreshCw, ChevronRight, TrendingUp, Search, X } from 'lucide-react'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { PullIndicator } from '../components/Skeleton'

const COIN_IDS = 'bitcoin,ethereum,solana,binancecoin,cardano,ripple,dogecoin,avalanche-2,chainlink,polkadot,matic-network,litecoin,stellar,uniswap,cosmos'

function fmtPrice(n) {
  if (n == null) return '—'
  if (n >= 1000) return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
  if (n >= 1) return '$' + n.toFixed(2)
  if (n >= 0.01) return '$' + n.toFixed(4)
  return '$' + n.toFixed(6)
}
function fmtUSD(n) {
  if (n == null) return '—'
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtB(n) {
  if (n == null) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  return '$' + (n / 1e6).toFixed(0) + 'M'
}
function fmtPct(n) {
  if (n == null) return '—'
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}

function MiniSparkline({ data, up }) {
  if (!data || data.length < 2) return <div style={{ width: 56, height: 24 }} />
  const slice = data.slice(-40)
  const min = Math.min(...slice), max = Math.max(...slice), range = max - min || 1
  const w = 56, h = 24
  const pts = slice.map((v, i) => `${(i / (slice.length - 1)) * w},${h - ((v - min) / range) * (h - 2) + 1}`).join(' ')
  return (
    <svg width={w} height={h} style={{ flexShrink: 0, overflow: 'visible' }}>
      <defs>
        <linearGradient id={`sg-${up}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={up ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
          <stop offset="100%" stopColor={up ? '#10b981' : '#ef4444'} stopOpacity={1} />
        </linearGradient>
      </defs>
      <polyline points={pts} fill="none" stroke={`url(#sg-${up})`} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CryptoSearchBar({ navigate }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [debounce, setDebounce] = useState(null)

  useEffect(() => {
    clearTimeout(debounce)
    if (!query.trim()) { setResults([]); return }
    setLoading(true)
    const t = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`,
          { signal: AbortSignal.timeout(8000) }
        )
        const json = await res.json()
        setResults((json.coins || []).slice(0, 8))
      } catch { setResults([]) }
      setLoading(false)
    }, 400)
    setDebounce(t)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 18, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {loading ? <Loader2 size={16} color="#6b7280" className="animate-spin" /> : <Search size={16} color="#6b7280" />}
        <input
          value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search any coin… e.g. Solana, PEPE, SUI"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 16, fontFamily: 'inherit' }}
        />
        {query && <button onClick={() => { setQuery(''); setResults([]) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}><X size={15} color="#6b7280" /></button>}
      </div>
      {results.length > 0 && (
        <div style={{ marginTop: 8, borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(12,12,22,0.95)' }}>
          {results.map((coin, i) => (
            <button key={coin.id} onClick={() => { navigate(`/crypto/${coin.id}`); setQuery(''); setResults([]) }}
              className="press-scale"
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '13px 16px', borderBottom: i < results.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', cursor: 'pointer', background: 'transparent', textAlign: 'left' }}>
              {coin.thumb
                ? <img src={coin.thumb} alt={coin.name} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />
                : <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(99,102,241,0.2)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: '#818cf8' }}>{coin.symbol?.[0]?.toUpperCase()}</div>
              }
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{coin.name}</div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>{coin.symbol?.toUpperCase()} {coin.market_cap_rank ? `· #${coin.market_cap_rank}` : ''}</div>
              </div>
              <div style={{ fontSize: 13, color: '#818cf8', fontWeight: 600 }}>View →</div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Crypto() {
  const navigate = useNavigate()
  const { cryptoHoldings } = useApp()
  const [coins, setCoins] = useState([])
  const [globalData, setGlobalData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(null)

  async function fetchData() {
    setLoading(true)
    try {
      const [coinsRes, globalRes] = await Promise.allSettled([
        fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${COIN_IDS}&order=market_cap_desc&sparkline=true&price_change_percentage=24h`, { signal: AbortSignal.timeout(15000) }).then(r => r.json()),
        fetch('https://api.coingecko.com/api/v3/global', { signal: AbortSignal.timeout(10000) }).then(r => r.json()),
      ])
      if (coinsRes.status === 'fulfilled' && Array.isArray(coinsRes.value)) setCoins(coinsRes.value)
      if (globalRes.status === 'fulfilled') setGlobalData(globalRes.value?.data)
      setLastUpdate(Date.now())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 30000)
    return () => clearInterval(id)
  }, [])

  const { progress, refreshing: pullRefreshing } = usePullToRefresh(fetchData)

  // My holdings summary
  const myHoldings = cryptoHoldings.filter(h => !h.salePrice)
  const coinMap = Object.fromEntries(coins.map(c => [c.id, c]))
  const totalCryptoInvested = myHoldings.reduce((s, h) => s + h.buyPrice * h.quantity, 0)
  const totalCryptoValue = myHoldings.reduce((s, h) => {
    const livePrice = coinMap[h.coinId]?.current_price
    return s + (livePrice ?? h.buyPrice) * h.quantity
  }, 0)
  const totalCryptoPnL = totalCryptoValue - totalCryptoInvested
  const totalCryptoPnLPct = totalCryptoInvested > 0 ? (totalCryptoPnL / totalCryptoInvested) * 100 : 0

  const statChips = [
    { label: 'Market Cap', value: globalData ? fmtB(globalData.total_market_cap?.usd) : '—' },
    { label: '24h Volume', value: globalData ? fmtB(globalData.total_volume?.usd) : '—' },
    { label: 'BTC Dom', value: globalData ? `${globalData.market_cap_percentage?.btc?.toFixed(1)}%` : '—' },
    { label: 'Active Coins', value: globalData ? globalData.active_cryptocurrencies?.toLocaleString() : '—' },
  ]

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 32px' }}>
      <PullIndicator progress={progress} refreshing={pullRefreshing} />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, paddingBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981', display: 'inline-block' }} className="live-ping" />
          <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 600 }}>
            {lastUpdate ? `Updated ${Math.floor((Date.now() - lastUpdate) / 1000)}s ago` : 'Loading…'}
          </span>
        </div>
        <button onClick={fetchData} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Refresh
        </button>
      </div>

      {/* My crypto portfolio summary */}
      {myHoldings.length > 0 && (
        <div style={{ marginBottom: 20, padding: '20px', borderRadius: 24,
          background: totalCryptoPnL >= 0 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)',
          border: `1px solid ${totalCryptoPnL >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
          boxShadow: `0 0 30px ${totalCryptoPnL >= 0 ? 'rgba(16,185,129,0.07)' : 'rgba(239,68,68,0.07)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <TrendingUp size={14} color={totalCryptoPnL >= 0 ? '#10b981' : '#ef4444'} />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.08em' }}>My Crypto Portfolio</span>
          </div>
          <div style={{ fontSize: 34, fontWeight: 900, color: 'white', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
            {fmtUSD(totalCryptoValue)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: totalCryptoPnL >= 0 ? '#10b981' : '#ef4444', filter: `drop-shadow(0 0 4px ${totalCryptoPnL >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'})` }}>
              {totalCryptoPnL >= 0 ? '+' : ''}{fmtUSD(totalCryptoPnL)}
            </span>
            <span style={{ fontSize: 13, padding: '3px 10px', borderRadius: 20, fontWeight: 600,
              background: totalCryptoPnL >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color: totalCryptoPnL >= 0 ? '#10b981' : '#ef4444' }}>
              {totalCryptoPnL >= 0 ? '+' : ''}{totalCryptoPnLPct.toFixed(2)}%
            </span>
          </div>
          {/* Holdings breakdown */}
          <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
            {myHoldings.map(h => {
              const livePrice = coinMap[h.coinId]?.current_price
              const val = (livePrice ?? h.buyPrice) * h.quantity
              const pnl = val - h.buyPrice * h.quantity
              const up = pnl >= 0
              return (
                <button key={h.id} onClick={() => navigate(`/crypto/${h.coinId}`)} className="press-scale"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                  {coinMap[h.coinId]?.image && <img src={coinMap[h.coinId].image} alt={h.symbol} style={{ width: 20, height: 20, borderRadius: '50%' }} />}
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{h.symbol}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: up ? '#10b981' : '#ef4444' }}>
                    {up ? '+' : ''}{fmtUSD(pnl)}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Global stat chips */}
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 20 }} className="no-scrollbar">
        {statChips.map(s => (
          <div key={s.label} style={{ flexShrink: 0, padding: '12px 16px', borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, whiteSpace: 'nowrap' }}>{s.label}</div>
            <div style={{ fontSize: 14, fontWeight: 700, color: s.color || 'white', whiteSpace: 'nowrap' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <CryptoSearchBar navigate={navigate} />

      {/* Coin list */}
      <div style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
        {coins.length} top assets · Tap to see chart
      </div>

      {loading && coins.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: 76, borderRadius: 20, background: 'rgba(255,255,255,0.03)', animation: 'pulse 1.5s ease infinite' }} />
          ))}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {coins.map((coin, i) => {
            const pct = coin.price_change_percentage_24h
            const up = (pct ?? 0) >= 0
            const myHolding = myHoldings.filter(h => h.coinId === coin.id)
            const hasHolding = myHolding.length > 0
            const holdingValue = hasHolding ? coin.current_price * myHolding.reduce((s, h) => s + h.quantity, 0) : null
            const holdingPnL = hasHolding ? holdingValue - myHolding.reduce((s, h) => s + h.buyPrice * h.quantity, 0) : null

            return (
              <button key={coin.id} onClick={() => navigate(`/crypto/${coin.id}`)}
                className="press-scale"
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                  padding: '14px 16px', borderRadius: 20, cursor: 'pointer', textAlign: 'left',
                  background: hasHolding ? 'rgba(99,102,241,0.05)' : 'rgba(255,255,255,0.03)',
                  border: hasHolding ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.06)',
                  transition: 'all 200ms ease',
                }}>
                {/* Rank */}
                <span style={{ fontSize: 12, color: '#4b5563', width: 20, textAlign: 'right', flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{i + 1}</span>

                {/* Image */}
                <img src={coin.image} alt={coin.symbol} style={{ width: 40, height: 40, borderRadius: '50%', flexShrink: 0 }} />

                {/* Name */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white', marginBottom: 2 }}>{coin.symbol.toUpperCase()}</div>
                  <div style={{ fontSize: 12, color: '#6b7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{coin.name}</div>
                  {hasHolding && holdingPnL != null && (
                    <div style={{ fontSize: 12, fontWeight: 600, color: holdingPnL >= 0 ? '#10b981' : '#ef4444', marginTop: 2 }}>
                      My holding: {fmtUSD(holdingValue)} ({holdingPnL >= 0 ? '+' : ''}{fmtUSD(holdingPnL)})
                    </div>
                  )}
                </div>

                {/* Sparkline */}
                <MiniSparkline data={coin.sparkline_in_7d?.price} up={up} />

                {/* Price */}
                <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'white', fontVariantNumeric: 'tabular-nums' }}>{fmtPrice(coin.current_price)}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: up ? '#10b981' : '#ef4444', filter: `drop-shadow(0 0 3px ${up ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'})` }}>
                    {fmtPct(pct)}
                  </div>
                </div>

                <ChevronRight size={16} color="#374151" style={{ flexShrink: 0 }} />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
