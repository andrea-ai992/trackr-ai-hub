import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCryptoChart } from '../hooks/useCryptoChart'
import { useApp } from '../context/AppContext'
import { ArrowLeft, Plus, Trash2, Loader2, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import Modal from '../components/Modal'

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
function fmtPct(n) {
  if (n == null) return '—'
  return (n >= 0 ? '+' : '') + n.toFixed(2) + '%'
}
function fmtCompact(n) {
  if (n == null) return '—'
  if (n >= 1e12) return '$' + (n / 1e12).toFixed(2) + 'T'
  if (n >= 1e9) return '$' + (n / 1e9).toFixed(1) + 'B'
  return '$' + (n / 1e6).toFixed(0) + 'M'
}

const RANGES = [
  { label: '1D', days: '1' },
  { label: '7D', days: '7' },
  { label: '1M', days: '30' },
  { label: '3M', days: '90' },
  { label: '1Y', days: '365' },
]

const EMPTY_HOLDING = { quantity: '', buyPrice: '', buyDate: '' }

export default function CryptoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { cryptoHoldings, addCryptoHolding, deleteCryptoHolding } = useApp()
  const [days, setDays] = useState('30')
  const [coin, setCoin] = useState(null)
  const [coinLoading, setCoinLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [holdingForm, setHoldingForm] = useState(EMPTY_HOLDING)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const { data: chartData, loading: chartLoading } = useCryptoChart(id, days)
  const myHoldings = cryptoHoldings.filter(h => h.coinId === id && !h.salePrice)

  // Fetch coin details
  useEffect(() => {
    if (!id) return
    setCoinLoading(true)
    fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}&sparkline=false&price_change_percentage=24h,7d`, { signal: AbortSignal.timeout(10000) })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d) && d[0]) setCoin(d[0]) })
      .catch(() => {})
      .finally(() => setCoinLoading(false))
  }, [id])

  // Auto-refresh price every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(8000) })
        .then(r => r.json())
        .then(d => {
          if (d[id]) setCoin(prev => prev ? { ...prev, current_price: d[id].usd, price_change_percentage_24h: d[id].usd_24h_change } : prev)
        })
        .catch(() => {})
    }, 30000)
    return () => clearInterval(timer)
  }, [id])

  const price = coin?.current_price
  const pct24h = coin?.price_change_percentage_24h
  const isUp = (pct24h ?? 0) >= 0
  const accentColor = isUp ? '#10b981' : '#ef4444'

  // Total holdings value + P&L
  const totalQty = myHoldings.reduce((s, h) => s + h.quantity, 0)
  const totalInvested = myHoldings.reduce((s, h) => s + h.buyPrice * h.quantity, 0)
  const totalValue = price ? price * totalQty : totalInvested
  const totalPnL = totalValue - totalInvested
  const totalPnLPct = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0

  const gradId = `cgrad_${id}`

  function handleAddHolding(e) {
    e.preventDefault()
    addCryptoHolding({
      coinId: id,
      coinName: coin?.name || id,
      symbol: coin?.symbol?.toUpperCase() || id.toUpperCase(),
      image: coin?.image,
      quantity: parseFloat(holdingForm.quantity) || 0,
      buyPrice: parseFloat(holdingForm.buyPrice) || 0,
      buyDate: holdingForm.buyDate,
    })
    setShowAddModal(false)
    setHoldingForm(EMPTY_HOLDING)
  }

  if (coinLoading && !coin) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <Loader2 size={28} color="#6366f1" className="animate-spin" />
    </div>
  )

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>

      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', paddingTop: 'max(14px, env(safe-area-inset-top, 0px))', paddingBottom: 12 }}>
        <button onClick={() => { navigator.vibrate?.(6); navigate(-1) }}
          className="press-scale"
          style={{ width: 40, height: 40, borderRadius: 14, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ArrowLeft size={18} color="#d1d5db" />
        </button>
        <span style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{coin?.name || id}</span>
        <button onClick={() => setShowAddModal(true)}
          className="press-scale"
          style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 14, background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
          <Plus size={14} /> Track
        </button>
      </div>

      {/* Coin header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '8px 20px 20px' }}>
        {coin?.image && <img src={coin.image} alt={coin.name} style={{ width: 64, height: 64, borderRadius: 20, flexShrink: 0, boxShadow: `0 0 20px ${accentColor}25` }} />}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'white', marginBottom: 2 }}>{coin?.name}</div>
          <div style={{ fontSize: 14, color: '#6b7280' }}>{coin?.symbol?.toUpperCase()} · #{coin?.market_cap_rank}</div>
        </div>
      </div>

      {/* Live price */}
      <div style={{ padding: '0 20px 16px' }}>
        <div style={{ fontSize: 44, fontWeight: 900, color: 'white', letterSpacing: '-1px', marginBottom: 8, fontVariantNumeric: 'tabular-nums' }}>
          {fmtPrice(price)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: accentColor, filter: `drop-shadow(0 0 6px ${accentColor}80)` }}>
            {isUp ? '▲' : '▼'} {fmtPct(pct24h)} today
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', overflowX: 'auto', marginBottom: 20 }} className="no-scrollbar">
        <div style={{ display: 'flex', minWidth: 'max-content' }}>
          {[
            { label: 'Mkt Cap', value: fmtCompact(coin?.market_cap) },
            { label: '24h High', value: fmtPrice(coin?.high_24h) },
            { label: '24h Low', value: fmtPrice(coin?.low_24h) },
            { label: 'Volume', value: fmtCompact(coin?.total_volume) },
            { label: 'Circulating', value: coin?.circulating_supply ? (coin.circulating_supply / 1e6).toFixed(1) + 'M' : '—' },
            { label: 'All-time High', value: fmtPrice(coin?.ath), color: '#10b981' },
          ].map((s, i, arr) => (
            <div key={s.label} style={{ padding: '12px 20px', borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none', minWidth: 90 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>{s.label}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: s.color || 'white', whiteSpace: 'nowrap' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ padding: '0 16px 24px' }}>
        {/* Range pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
          {RANGES.map(r => (
            <button key={r.days} onClick={() => setDays(r.days)}
              className="press-scale"
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: days === r.days ? accentColor + '25' : 'transparent',
                border: days === r.days ? `1px solid ${accentColor}50` : '1px solid transparent',
                color: days === r.days ? accentColor : '#4b5563',
                transition: 'all 200ms ease',
              }}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Chart area */}
        <div style={{ borderRadius: 24, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {chartLoading ? (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Loader2 size={22} color="#6b7280" className="animate-spin" />
            </div>
          ) : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 12, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={accentColor} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                <XAxis dataKey="time" tick={{ fill: '#374151', fontSize: 10 }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                <YAxis domain={['auto', 'auto']} tick={{ fill: '#374151', fontSize: 10 }} axisLine={false} tickLine={false} width={60} tickFormatter={v => fmtPrice(v)} />
                <Tooltip
                  contentStyle={{ background: 'rgba(12,12,22,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, fontSize: 13 }}
                  labelStyle={{ color: '#6b7280', marginBottom: 4 }}
                  itemStyle={{ color: accentColor, fontWeight: 700 }}
                  formatter={v => [fmtPrice(v), 'Price']}
                />
                <Area type="monotone" dataKey="close" stroke={accentColor} strokeWidth={2.5}
                  fill={`url(#${gradId})`} dot={false} activeDot={{ r: 5, fill: accentColor, strokeWidth: 0, filter: `drop-shadow(0 0 6px ${accentColor})` }} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#374151', fontSize: 14 }}>No chart data</div>
          )}
        </div>
      </div>

      {/* My Holdings */}
      <div style={{ padding: '0 16px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>My Holdings</h2>
          <button onClick={() => setShowAddModal(true)} className="press-scale"
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 14, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            <Plus size={13} /> Add
          </button>
        </div>

        {myHoldings.length === 0 ? (
          <button onClick={() => setShowAddModal(true)} className="press-scale"
            style={{ width: '100%', padding: '32px', borderRadius: 24, border: '2px dashed rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.04)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
            <div style={{ width: 52, height: 52, borderRadius: 16, background: 'rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={24} color="#818cf8" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#6b7280' }}>Track your {coin?.symbol?.toUpperCase()} holdings</div>
          </button>
        ) : (
          <>
            {/* Summary card */}
            {myHoldings.length > 0 && price && (
              <div style={{ padding: '20px', borderRadius: 24, background: totalPnL >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${totalPnL >= 0 ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`, marginBottom: 14, boxShadow: `0 0 30px ${totalPnL >= 0 ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)'}` }}>
                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Total Position</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: 'white', marginBottom: 6, fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(totalValue)}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: totalPnL >= 0 ? '#10b981' : '#ef4444', filter: `drop-shadow(0 0 4px ${totalPnL >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(239,68,68,0.5)'})` }}>
                    {totalPnL >= 0 ? '+' : ''}{fmtUSD(totalPnL)}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: totalPnL >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: totalPnL >= 0 ? '#10b981' : '#ef4444' }}>
                    {fmtPct(totalPnLPct)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', marginTop: 8 }}>{totalQty} {coin?.symbol?.toUpperCase()} · Avg {fmtUSD(totalInvested / totalQty)}/coin</div>
              </div>
            )}

            {/* Individual holdings */}
            {myHoldings.map(h => {
              const val = price ? price * h.quantity : h.buyPrice * h.quantity
              const pnl = val - h.buyPrice * h.quantity
              const pnlPct = ((val - h.buyPrice * h.quantity) / (h.buyPrice * h.quantity)) * 100
              const up = pnl >= 0
              return (
                <div key={h.id} style={{ padding: '18px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div>
                      <div style={{ fontSize: 17, fontWeight: 700, color: 'white', marginBottom: 3 }}>{h.quantity} {h.symbol}</div>
                      <div style={{ fontSize: 13, color: '#6b7280' }}>Bought {h.buyDate || 'N/A'} · {fmtUSD(h.buyPrice)}/coin</div>
                    </div>
                    <button onClick={() => setConfirmDelete(h)} className="press-scale"
                      style={{ padding: '6px 10px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', cursor: 'pointer' }}>
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Invested</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{fmtUSD(h.buyPrice * h.quantity)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Value Now</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>{fmtUSD(val)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: '#4b5563', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>P&L</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: up ? '#10b981' : '#ef4444', filter: `drop-shadow(0 0 4px ${up ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.4)'})` }}>
                        {up ? '+' : ''}{fmtUSD(pnl)}
                      </div>
                      <div style={{ fontSize: 12, color: up ? '#10b981' : '#ef4444' }}>{fmtPct(pnlPct)}</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </>
        )}
      </div>

      {/* Add holding modal */}
      {showAddModal && (
        <Modal title={`Track ${coin?.name || id}`} onClose={() => setShowAddModal(false)} size="sm">
          <form onSubmit={handleAddHolding} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {price && (
              <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>Current Price</div>
                <div style={{ fontSize: 28, fontWeight: 800, color: accentColor, filter: `drop-shadow(0 0 8px ${accentColor}60)` }}>{fmtPrice(price)}</div>
              </div>
            )}
            {[
              { key: 'quantity', label: `How many ${coin?.symbol?.toUpperCase() || 'coins'}?`, placeholder: '0.5', type: 'number', step: 'any' },
              { key: 'buyPrice', label: 'Price you paid per coin ($)', placeholder: fmtPrice(price) || '0.00', type: 'number', step: 'any' },
              { key: 'buyDate', label: 'Date you bought', placeholder: '', type: 'date' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display: 'block', fontSize: 14, color: '#9ca3af', fontWeight: 500, marginBottom: 8 }}>{f.label}</label>
                <input type={f.type} step={f.step} value={holdingForm[f.key]} onChange={e => setHoldingForm(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{ width: '100%', fontSize: 16, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, padding: '13px 16px', color: 'white', outline: 'none' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 12, marginTop: 4 }}>
              <button type="button" onClick={() => setShowAddModal(false)}
                style={{ flex: 1, padding: '14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: 15, cursor: 'pointer', background: 'transparent' }}>
                Cancel
              </button>
              <button type="submit" disabled={!holdingForm.quantity || !holdingForm.buyPrice}
                style={{ flex: 1, padding: '14px', borderRadius: 16, background: 'linear-gradient(135deg, #4f46e5, #6366f1)', color: 'white', fontSize: 15, fontWeight: 700, cursor: 'pointer', border: 'none', opacity: !holdingForm.quantity || !holdingForm.buyPrice ? 0.4 : 1 }}>
                Save
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <Modal title="Remove Holding?" onClose={() => setConfirmDelete(null)} size="sm">
          <div style={{ textAlign: 'center', padding: '8px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
            <p style={{ fontSize: 16, color: 'white', fontWeight: 600, marginBottom: 8 }}>Remove {confirmDelete.quantity} {confirmDelete.symbol}?</p>
            <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setConfirmDelete(null)}
                style={{ flex: 1, padding: '14px', borderRadius: 16, border: '1px solid rgba(255,255,255,0.08)', color: '#9ca3af', fontSize: 15, cursor: 'pointer', background: 'transparent' }}>
                Cancel
              </button>
              <button onClick={() => { deleteCryptoHolding(confirmDelete.id); setConfirmDelete(null) }}
                style={{ flex: 1, padding: '14px', borderRadius: 16, background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>
                Remove
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
