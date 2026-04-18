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
      <text x={cx} y={cy - 4} textAnchor="middle" fill="white" fontSize="12" fontWeight="800" fontFamily="system-ui">Total</text>
      <text x={cx} y={cy + 11} textAnchor="middle" fill="#9ca3af" fontSize="8" fontFamily="system-ui">investi</text>
    </svg>
  )
}

/* ─── Performance Chart SVG ───────────────────────────────────────────────── */
function PerformanceChart({ data }) {
  const width = 340
  const height = 120
  const padding = { top: 12, right: 20, bottom: 20, left: 30 }
  const innerWidth = width - padding.left - padding.right
  const innerHeight = height - padding.top - padding.bottom

  const maxValue = Math.max(...data, 0) * 1.1
  const minValue = Math.min(...data.filter(v => v < 0), 0) * 1.1

  const yScale = (value) => {
    return innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight
  }

  const xScale = (index) => {
    return (index / (data.length - 1)) * innerWidth
  }

  const points = data.map((value, index) => ({
    x: xScale(index),
    y: yScale(value),
    value
  }))

  const pathData = points.map((p, i) =>
    `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
  ).join(' ')

  const gradientId = 'perfGradient'

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{ marginBottom: 24 }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#00ff88" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Y Axis */}
      <g transform={`translate(${padding.left}, ${padding.top})`}>
        {/* Grid lines */}
        {Array.from({ length: 5 }).map((_, i) => {
          const y = (i / 4) * innerHeight
          const value = minValue + ((maxValue - minValue) * (4 - i) / 4)
          return (
            <g key={i} transform={`translate(0, ${y})`}>
              <line
                x1={0}
                x2={innerWidth}
                stroke="rgba(0,255,136,0.08)"
                strokeWidth={1}
              />
              <text
                x={-4}
                y={4}
                textAnchor="end"
                fill="var(--text-secondary)"
                fontSize={10}
                fontFamily="JetBrains Mono"
              >
                {value >= 0 ? '+' : ''}{value.toFixed(0)}k
              </text>
            </g>
          )
        })}

        {/* X Axis */}
        {data.map((_, i) => {
          const x = xScale(i)
          return (
            <g key={i} transform={`translate(${x}, ${innerHeight + 4})`}>
              <text
                x={0}
                y={12}
                textAnchor="middle"
                fill="var(--text-secondary)"
                fontSize={9}
                fontFamily="JetBrains Mono"
              >
                {i % 5 === 0 ? `J${i/5+1}` : ''}
              </text>
            </g>
          )
        })}

        {/* Chart */}
        <path
          d={pathData}
          fill="none"
          stroke="var(--neon)"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ strokeDasharray: '0 1000', animation: 'draw 1s ease-in-out forwards' }}
        />

        {/* Fill */}
        <path
          d={`${pathData} L ${innerWidth} ${innerHeight} L 0 ${innerHeight} Z`}
          fill="url(#perfGradient)"
          opacity={0.8}
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill="var(--neon)"
            style={{ animation: `fadeIn 0.5s ease-in forwards`, animationDelay: `${i * 0.05}s` }}
          />
        ))}
      </g>
    </svg>
  )
}

/* ─── Allocation Chart SVG ────────────────────────────────────────────────--- */
function AllocationChart({ segments }) {
  const size = 160
  const center = size / 2
  const radius = 60
  const strokeWidth = 20

  const total = segments.reduce((s, g) => s + g.value, 0)
  if (total === 0) return null

  let offset = 0
  const circ = 2 * Math.PI * radius

  return (
    <div style={{ marginBottom: 24 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ marginBottom: 16 }}>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {segments.map((seg, i) => {
          if (!seg.value) return null
          const frac = seg.value / total
          const dashArray = `${frac * circ} ${circ}`
          const dashOffset = -offset * circ
          offset += frac
          return (
            <circle
              key={i}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={dashArray}
              strokeDashoffset={dashOffset}
              strokeLinecap="butt"
              style={{ transform: 'rotate(-90deg)', transformOrigin: `${center}px ${center}px` }}
            />
          )
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: seg.color
            }} />
            <span style={{
              fontSize: 12,
              fontFamily: 'JetBrains Mono',
              color: 'var(--text-primary)',
              fontWeight: 500
            }}>
              {seg.label} ({((seg.value / total) * 100).toFixed(1)}%)
            </span>
          </div>
        ))}
      </div>
    </div>
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
        background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)',
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
              <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4, fontFamily: 'JetBrains Mono' }}>{stat.label}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: stat.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'JetBrains Mono' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

/* ─── Main ────────────────────────────────────────────────────────────────── */
export default function Portfolio() {
  const { categories, sneakers, stocks, cryptoHoldings, customItems } = useApp()

  const allCats = categories
    .filter(cat => cat.id !== 'flights') // flights don't have financial tracking
    .map(cat => {
      const items = cat.id === 'sneakers' ? sneakers
        : cat.id === 'stocks' ? stocks
        : customItems[cat.id] || []
      const to = cat.id === 'sneakers' ? '/sneakers'
        : cat.id === 'stocks' ? '/stocks'
        : `/category/${cat.id}`

      const sold = items.filter(i => i.salePrice && i.saleDate)
      const profit = sold.reduce((s, i) => s + (i.salePrice - i.buyPrice) * (i.quantity || 1), 0)
      const invested = items.reduce((s, i) => s + (i.buyPrice || 0) * (i.quantity || 1), 0)

      // Unrealized P&L (sneakers with marketValue only)
      const unrealized = cat.id === 'sneakers'
        ? items.filter(i => !i.salePrice && i.marketValue)
            .reduce((s, i) => s + (i.marketValue - i.buyPrice), 0)
        : 0

      const spark = buildSpark(sold.map(i => ({
        saleDate: i.saleDate,
        profit: (i.salePrice - i.buyPrice) * (i.quantity || 1),
      })))
      return { cat, items, to, sold, profit, invested, spark, unrealized }
    })

  // Global totals
  const globalInvested = allCats.reduce((s, c) => s + c.invested, 0)
  const globalProfit = allCats.reduce((s, c) => s + c.profit, 0)
  const globalPct = globalInvested > 0 ? ((globalProfit / globalInvested) * 100).toFixed(1) : null
  const isUp = globalProfit >= 0

  // Donut segments (by invested amount)
  const segments = allCats
    .filter(c => c.invested > 0)
    .map(c => ({