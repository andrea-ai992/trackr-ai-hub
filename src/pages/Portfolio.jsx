```jsx
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
              <span style={{ fontSize: 12, color: '#6b7280' }}>{items.length} article{items.length !== 1 ? 's' : ''}</span>
              {sold.length > 0 && <span style={{ fontSize: 12, color: '#4b5563' }}>· {sold.length} vendu{sold.length !== 1 ? 's' : ''}</span>}
            </div>
          </div>
          {spark.length > 1 && (
            <div style={{ width: 72 }}>
              <SparkChart data={spark} color={totalPnl >= 0 ? cat.color : '#ef4444'} height={36} />
            </div>
          )}
          <ChevronRight size={16} color="#374151" />
        </div>

        {/* Stats row */}
        <div style={{ display: 'flex', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          {[
            { label: 'Investi', value: invested > 0 ? fmtFull(invested) : '—', color: '#6b7280' },
            { label: 'P&L réalisé', value: sold.length ? (profit >= 0 ? '+' : '') + fmtFull(profit) : '—', color: profit > 0 ? '#10b981' : profit < 0 ? '#ef4444' : '#6b7280' },
            unrealized
              ? { label: 'Potentiel', value: (unrealized >= 0 ? '+' : '') + fmtFull(unrealized), color: unrealized >= 0 ? '#6366f1' : '#ef4444' }
              : p ? { label: 'Rend.', value: `${p >= 0 ? '+' : ''}${p}%`, color: +p >= 0 ? '#10b981' : '#ef4444' }
              : null,
          ].filter(Boolean).map((stat, i, arr) => (
            <div key={i} style={{
              flex: 1, padding: '10px 14px',
              borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
            }}>
              <div style={{ fontSize: 10, color: '#4b5563', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{stat.label}</div>
              <div style={{ fontSize: 13, fontWeight: 800, color: stat.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</div>
            </div>
          ))}
        </div>
      </div>
    </Link>
  )
}

/* ─── Performance Chart ───────────────────────────────────────────────────── */
function PerformanceChart() {
  const data = Array(30).fill(0).map((_, i) => ({ x: i, y: Math.random() * 100 }));
  const width = 300;
  const height = 200;
  const margin = 20;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flexShrink: 0, marginBottom: 20 }}>
      <rect x={0} y={0} width={width} height={height} fill="none" rx={10} />
      <g transform={`translate(${margin}, ${margin})`}>
        <path
          d={`M ${data[0].x} ${height - margin - data[0].y} L ${data.map((d, i) => `${d.x} ${height - margin - d.y}`).join(' L ')}`}
          stroke="#10b981"
          strokeWidth={2}
          fill={`linear-gradient(to bottom, #10b981, #10b98180)`}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <g transform={`translate(0, ${height - margin}) scale(1, -1)`}>
          <path
            d={`M ${data[0].x} ${data[0].y} L ${data.map((d, i) => `${d.x} ${d.y}`).join(' L ')}`}
            stroke="none"
            fill={`linear-gradient(to bottom, #10b981, #10b98180)`}
          />
        </g>
        <g>
          {data.map((d, i) => (
            <circle key={i} cx={d.x} cy={height - margin - d.y} r={2} fill="#10b981" />
          ))}
        </g>
      </g>
      <g transform={`translate(${margin}, ${height - margin})`}>
        <text x={0} y={20} textAnchor="start" fill="#6b7280" fontSize={12}>0</text>
        <text x={0} y={height - margin - 20} textAnchor="start" fill="#6b7280" fontSize={12}>100</text>
      </g>
    </svg>
  );
}

/* ─── Allocation Chart ───────────────────────────────────────────────────── */
function AllocationChart() {
  const data = [
    { label: 'Stocks', value: 30, color: '#10b981' },
    { label: 'Crypto', value: 20, color: '#6366f1' },
    { label: 'Cash', value: 20, color: '#ef4444' },
    { label: 'Autres', value: 30, color: '#4b5563' },
  ];
  const width = 200;
  const height = 200;
  const radius = 80;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ flexShrink: 0, marginBottom: 20 }}>
      <g transform={`translate($
/* ─── Portfolio ──────────────────────────────────────────────────────────── */
function Portfolio() {
  return (
    <div>
      <PerformanceChart />
      {/* Reste du code */}
    </div>
  );
}

export default Portfolio;