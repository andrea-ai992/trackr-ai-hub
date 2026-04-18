import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext'
import { ChevronRight, TrendingUp, TrendingDown } from 'lucide-react'

function fmt(n, currency = 'EUR') {
  if (n == null) return '—'
  return n.toLocaleString('fr-FR', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pct(profit, invested) {
  if (!invested) return null
  return ((profit / invested) * 100).toFixed(1)
}

export default function Portfolio() {
  const { portfolio = [] } = useApp?.() || {}
  const [tab, setTab] = useState('overview')

  const totalInvested = portfolio.reduce((s, c) => s + (c.invested || 0), 0)
  const totalValue    = portfolio.reduce((s, c) => s + (c.currentValue || c.invested || 0), 0)
  const totalProfit   = totalValue - totalInvested
  const profitPct     = pct(totalProfit, totalInvested)
  const isUp          = totalProfit >= 0

  return (
    <div className="page">
      {/* Header */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 4 }}>Portfolio total</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-.02em', fontVariantNumeric: 'tabular-nums' }}>
          {fmt(totalValue)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
          {isUp ? <TrendingUp size={15} color="#00ff88" /> : <TrendingDown size={15} color="#ef4444" />}
          <span style={{ fontSize: 14, fontWeight: 600, color: isUp ? '#00ff88' : '#ef4444' }}>
            {isUp ? '+' : ''}{fmt(totalProfit)} ({isUp ? '+' : ''}{profitPct}%)
          </span>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '16px 16px 0' }}>
        {[
          { label: 'Investi', val: fmt(totalInvested), color: 'var(--t2)' },
          { label: 'Positions', val: portfolio.length, color: 'var(--t2)' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px' }}>
            <div style={{ fontSize: 10, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Positions */}
      <div style={{ padding: '16px 16px 24px' }}>
        <div style={{ fontSize: 11, color: 'var(--t3)', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 12 }}>Positions</div>
        {portfolio.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--t3)', fontSize: 14 }}>
            Aucune position · ajoutez des actifs
          </div>
        ) : portfolio.map((p, i) => {
          const profit = (p.currentValue || p.invested || 0) - (p.invested || 0)
          const up = profit >= 0
          return (
            <div key={i} style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 16, padding: '14px 16px', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {(p.symbol || p.name || '?')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{p.name || p.symbol}</div>
                <div style={{ fontSize: 12, color: 'var(--t3)', marginTop: 2 }}>Investi {fmt(p.invested)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)' }}>{fmt(p.currentValue || p.invested)}</div>
                <div style={{ fontSize: 12, color: up ? '#00ff88' : '#ef4444', marginTop: 2 }}>{up ? '+' : ''}{fmt(profit)}</div>
              </div>
              <ChevronRight size={16} color="var(--t3)" />
            </div>
          )
        })}
      </div>
    </div>
  )
}
