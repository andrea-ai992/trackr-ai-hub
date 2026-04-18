import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { CategoryIcon } from '../components/Sidebar'
import SparkChart from '../components/SparkChart'
import {
  ChevronRight, Plus, TrendingUp, TrendingDown, Wallet,
  BarChart3, Package, DollarSign, ArrowUpRight, ArrowDownRight,
} from 'lucide-react'

/* ─── Helpers ─────────────────────────────────────────────────────────────── */
function fmt(n, currency = 'EUR') {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
}
function fmtFull(n) {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
}
function pct(profit, invested) {
  if (!invested) return null
  return ((profit / invested) * 100).toFixed(1)
}

function buildSpark(sold) {
  const map = {}
  sold.forEach(s => {
    const m = (s.saleDate || '').slice(0, 7)
    if (m) map[m] = (map[m] || 0) + (s.profit ?? 0)
  })
  return Object.entries(map).sort().map(([, v]) => ({ value: +v.toFixed(2) }))
}

/* ─── Donut (simple SVG) ──────────────────────────────────────────────────── */
function Donut({ segments, size = 120 }) {
  const r = 44, cx = 60, cy = 60, stroke = 14
  const total = segments.reduce((s, g) => s + g.value, 0)
  if (total === 0) return null
  let offset = 0
  const circ = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        if (!seg.value) return null
        const frac = seg.value / total
        const dashArray = `${frac * circ} ${circ}`
        const dashOffset = -offset * circ
        offset += frac
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={seg.color} strokeWidth={stroke}
            strokeDasharray={dashArray} strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
          />
        )
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="800" fontFamily="JetBrains Mono">Total</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="var(--text-secondary)" fontSize="8" fontFamily="JetBrains Mono">investi</text>
    </svg>
  )
}

/* ─── Category Card ───────────────────────────────────────────────────────── */
function CatCard({ cat, items, to, sold, profit, invested, spark, unrealized }) {
  const hasPnl = profit !== 0 || unrealized !== 0
  const totalPnl = profit + (unrealized || 0)
  const p = pct(totalPnl, invested)

  return (
    <Link to={to} style={{ display: 'block', textDecoration: 'none' }}>
      <div style={{
        display: 'flex', flexDirection: 'column', gap: 0,
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 22, overflow: 'hidden',
        transition: 'border-color 180ms',
      }}>
        {/* Top row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '16px 16px 12px' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 14, flexShrink: 0,
            background: cat.color + '18', border: `1.5px solid ${cat.color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CategoryIcon name={cat.icon} size={20} style={{ color: cat.color }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 3 }}>{cat.name}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{items.length} article{items.length !== 1 ? 's' : ''}</span>
              {sold.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>· {sold.length} vendu{sold.length !== 1 ? 's' : ''}</span>}
            </div>
          </div>
          {spark.length > 1 && (
            <div style={{ width: 72 }}>
              <SparkChart data={spark} color={totalPnl >= 0 ? cat.color : '#ef4444'} height={36} />
            </div>
          )}
          <ChevronRight size={16} color="var(--text-muted)" />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Investi', value: invested > 0 ? fmtFull(invested) : '—', color: 'var(--text-secondary)' },
            { label: 'P&L réalisé', value: sold.length ? (profit >= 0 ? '+' : '') + fmtFull(profit) : '—', color: profit > 0 ? '#10b981' : profit < 0 ? '#ef4444' : 'var(--text-secondary)' },
            unrealized
              ? { label: 'Potentiel', value: (unrealized >= 0 ? '+' : '') + fmtFull(unrealized), color: unrealized >= 0 ? '#6366f1' : '#ef4444' }
              : p ? { label: 'Rend.', value: `${p >= 0 ? '+' : ''}${p}%`, color: +p >= 0 ? '#10b981' : '#ef4444' }
              : null,
          ].filter(Boolean).map((stat, i, arr) => (
            <div key={i} style={{
              flex: 1, padding: '10px 14px',
              borderRight: i < arr.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: stat.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

/* ─── Performance Chart SVG ───────────────────────────────────────────────── */
function PerformanceChart({ data, width = 343, height = 180 }) {
  if (!data || data.length === 0) return (
    <div style={{ width, height, background: 'var(--surface)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono', fontSize: 14 }}>Aucune donnée</span>
    </div>
  )

  const max = Math.max(...data.map(d => d.value), 0)
  const min = Math.min(...data.map(d => d.value), 0)
  const range = max - min
  const padding = range * 0.05

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - 40) + 20
    const y = height - 20 - ((d.value - min + padding) / (range + 2 * padding)) * (height - 40)
    return { x, y }
  })

  const d = points.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.x} ${p.y}`
    const prev = points[i - 1]
    const cp1x = prev.x + (p.x - prev.x) * 0.5
    const cp1y = prev.y
    const cp2x = p.x - (p.x - prev.x) * 0.5
    const cp2y = p.y
    return `${acc} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p.x} ${p.y}`
  }, '')

  const dates = data.map(d => d.date)
  const minDate = dates[0]
  const maxDate = dates[dates.length - 1]

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ background: 'var(--surface)', borderRadius: 16 }}>
      {/* Gradient fill */}
      <defs>
        <linearGradient id="perfGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Axes */}
      <line x1={20} y1={height - 20} x2={width - 20} y2={height - 20} stroke="var(--border-bright)" strokeWidth={1} />
      <line x1={20} y1={20} x2={20} y2={height - 20} stroke="var(--border-bright)" strokeWidth={1} />

      {/* Date labels */}
      <text x={20} y={height - 5} fill="var(--text-secondary)" fontSize={10} fontFamily="JetBrains Mono">{minDate}</text>
      <text x={width - 20} y={height - 5} fill="var(--text-secondary)" fontSize={10} fontFamily="JetBrains Mono" textAnchor="end">{maxDate}</text>

      {/* Value labels */}
      <text x={15} y={25} fill="var(--text-secondary)" fontSize={10} fontFamily="JetBrains Mono" textAnchor="end">{fmtFull(max)}</text>
      <text x={15} y={height - 25} fill="var(--text-secondary)" fontSize={10} fontFamily="JetBrains Mono" textAnchor="end">{fmtFull(min)}</text>

      {/* Chart path */}
      <path d={d} fill="url(#perfGradient)" stroke="#00ff88" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0, animation: 'draw 800ms ease-out forwards' }} />

      {/* Animated path */}
      <path d={d} fill="none" stroke="#00ff88" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ strokeDasharray: '1000', strokeDashoffset: '1000', animation: 'draw 800ms ease-out forwards' }} />

      {/* Dots */}
      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={3} fill="#00ff88" style={{ opacity: 0, animation: 'fadeIn 800ms ease-out forwards', animationDelay: `${i * 50}ms` }} />
      ))}
    </svg>
  )
}

/* ─── Pie Chart SVG ───────────────────────────────────────────────────────── */
function PieChart({ segments, size = 120 }) {
  const r = 44, cx = 60, cy = 60, stroke = 14
  const total = segments.reduce((s, g) => s + g.value, 0)
  if (total === 0) return null

  const colors = ['#00ff88', '#6366f1', '#f59e0b', '#ef4444']
  const labels = ['Stocks', 'Crypto', 'Cash', 'Autres']

  let offset = 0
  const circ = 2 * Math.PI * r

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
      {segments.map((seg, i) => {
        if (!seg.value) return null
        const frac = seg.value / total
        const dashArray = `${frac * circ} ${circ}`
        const dashOffset = -offset * circ
        offset += frac
        return (
          <circle key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={colors[i]} strokeWidth={stroke}
            strokeDasharray={dashArray} strokeDashoffset={dashOffset}
            strokeLinecap="butt"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px' }}
          />
        )
      })}

      {/* Legend */}
      <g transform={`translate(0, ${size - 20})`}>
        {segments.map((seg, i) => {
          const pct = ((seg.value / total) * 100).toFixed(0)
          return (
            <g key={i} transform={`translate(${i * 100}, 0)`}>
              <circle cx={8} cy={8} r={6} fill={colors[i]} />
              <text x={20} y={12} fill="white" fontSize={10} fontFamily="JetBrains Mono">{labels[i]} {pct}%</text>
            </g>
          )
        })}
      </g>
    </svg>
  )
}

/* ─── Holding Item ────────────────────────────────────────────────────────── */
function HoldingItem({ item, logo, isCrypto }) {
  const currentValue = item.marketValue || item.buyPrice
  const invested = item.buyPrice * (item.quantity || 1)
  const profit = currentValue * (item.quantity || 1) - invested
  const pct = invested > 0 ? ((profit / invested) * 100).toFixed(1) : 0
  const isPositive = profit >= 0

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 0', borderBottom: '1px solid var(--border)',
    }}>
      <div style={{ width: 36, height: 36, borderRadius: 8, flexShrink: 0, background: 'var(--surface-high)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {logo}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 2, fontFamily: 'JetBrains Mono' }}>{item.name}</div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
          {item.quantity} × {fmt(item.buyPrice)} = {fmt(currentValue * (item.quantity || 1))}
        </div>
      </div>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: 14, fontWeight: 800, color: isPositive ? '#10b981' : '#ef4444', fontFamily: 'JetBrains Mono' }}>
          {isPositive ? '+' : ''}{pct}%
        </div>
        <div style={{ fontSize: 11, color: isPositive ? '#10b981' : '#ef444