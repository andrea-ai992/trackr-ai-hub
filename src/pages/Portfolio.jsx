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
    .map(c => ({ label: c.cat.name, value: c.invested, color: c.cat.color }))

  // Recent sales across all cats
  const recentSales = allCats
    .flatMap(c => c.sold.map(s => ({
      ...s,
      profit: (s.salePrice - s.buyPrice) * (s.quantity || 1),
      catColor: c.cat.color,
      catName: c.cat.name,
    })))
    .sort((a, b) => (b.saleDate || '').localeCompare(a.saleDate || ''))
    .slice(0, 5)

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 32 }}>
      {/* ── Header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        background: 'rgba(7,7,15,0.92)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'max(52px, env(safe-area-inset-top, 0px))',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Wallet size={20} color="#6366f1" />
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>Portfolio</span>
          </div>
          <Link to="/settings" style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '7px 12px', borderRadius: 12,
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
            color: '#6b7280', fontSize: 12, fontWeight: 600, textDecoration: 'none',
          }}>
            <Plus size={13} /> Catégorie
          </Link>
        </div>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* ── Global Summary ── */}
        {globalInvested > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
            border: '1px solid rgba(99,102,241,0.2)',
            borderRadius: 24, padding: '20px', marginBottom: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              {/* Donut */}
              {segments.length > 1 && <Donut segments={segments} size={110} />}

              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, color: '#818cf8', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Portfolio global
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: 'white', marginBottom: 4 }}>
                  {fmt(globalInvested)}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 16, fontWeight: 800,
                    color: isUp ? '#10b981' : '#ef4444',
                  }}>
                    {isUp ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {isUp ? '+' : ''}{fmt(globalProfit)}
                  </span>
                  {globalPct && (
                    <span style={{
                      fontSize: 13, fontWeight: 700,
                      padding: '3px 8px', borderRadius: 8,
                      background: isUp ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                      color: isUp ? '#10b981' : '#ef4444',
                    }}>
                      {isUp ? '+' : ''}{globalPct}%
                    </span>
                  )}
                </div>
                {/* Legend */}
                {segments.length > 1 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 10 }}>
                    {segments.map(seg => (
                      <div key={seg.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: seg.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 11, color: '#9ca3af' }}>{seg.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Category Cards ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          {allCats.map(c => (
            <CatCard key={c.cat.id} {...c} />
          ))}
        </div>

        {/* ── Recent Sales ── */}
        {recentSales.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <BarChart3 size={15} color="#6b7280" />
              <span style={{ fontSize: 13, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Dernières ventes
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentSales.map((s, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px',
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: 16, position: 'relative', overflow: 'hidden',
                }}>
                  {/* Left accent */}
                  <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: s.catColor, borderRadius: '16px 0 0 16px' }} />
                  <div style={{ paddingLeft: 8, flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                      {s.catName} · {s.saleDate}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 800, color: s.profit >= 0 ? '#10b981' : '#ef4444' }}>
                      {s.profit >= 0 ? '+' : ''}{fmt(s.profit)}
                    </div>
                    <div style={{ fontSize: 11, color: '#4b5563' }}>{fmt(s.salePrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {globalInvested === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{
              width: 70, height: 70, borderRadius: 22, margin: '0 auto 16px',
              background: 'rgba(99,102,241,0.1)', border: '1.5px dashed rgba(99,102,241,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Wallet size={28} color="#6366f1" />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#9ca3af', marginBottom: 8 }}>Portfolio vide</p>
            <p style={{ fontSize: 13, color: '#4b5563' }}>Ajoute des sneakers, actions ou autres actifs pour voir ton résumé ici.</p>
          </div>
        )}
      </div>
    </div>
  )
}
