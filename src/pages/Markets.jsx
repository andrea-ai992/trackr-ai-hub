// src/pages/Markets.jsx — Stocks | Crypto | News in one place
import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Stocks from './Stocks'
import Crypto from './Crypto'
import News from './News'

const TABS = [
  { id: 'stocks', label: 'Stocks' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'news',   label: 'News'   },
]

export default function Markets() {
  const [params, setParams] = useSearchParams()
  const raw = params.get('tab')
  const [tab, setTab] = useState(TABS.find(t => t.id === raw) ? raw : 'stocks')

  useEffect(() => {
    const t = params.get('tab')
    if (TABS.find(x => x.id === t)) setTab(t)
    else setTab('stocks')
  }, [params])

  function switchTab(id) {
    setTab(id)
    if (id === 'stocks') setParams({})
    else setParams({ tab: id })
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
      <div style={{ position: 'sticky', top: 0, zIndex: 20, background: 'rgba(8,8,8,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', padding: '10px 16px' }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--surface)', borderRadius: 12, padding: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => switchTab(t.id)}
              style={{ flex: 1, padding: '8px 0', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, letterSpacing: '0.04em', transition: 'all 0.15s', background: tab === t.id ? 'var(--surface-high)' : 'transparent', color: tab === t.id ? 'var(--neon)' : 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{ display: tab === 'stocks' ? 'block' : 'none' }}><Stocks inMarkets /></div>
      <div style={{ display: tab === 'crypto' ? 'block' : 'none' }}><Crypto /></div>
      <div style={{ display: tab === 'news'   ? 'block' : 'none' }}><News   /></div>
    </div>
  )
}
