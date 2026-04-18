import { useState } from 'react'

const TABS = [
  { id: 'psg', label: 'PSG', emoji: '⚽', color: '#004170' },
  { id: 'nba', label: 'NBA', emoji: '🏀', color: '#f59e0b' },
  { id: 'nfl', label: 'NFL', emoji: '🏈', color: '#f97316' },
  { id: 'ufc', label: 'UFC', emoji: '🥊', color: '#8b5cf6' },
]

export default function Sports() {
  const [active, setActive] = useState('psg')
  const tab = TABS.find(t => t.id === active)

  return (
    <div className="page">
      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 8, padding: '12px 16px', overflowX: 'auto', scrollbarWidth: 'none', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            style={{ padding: '8px 16px', borderRadius: 20, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0, background: active === t.id ? t.color : 'var(--bg2)', color: active === t.id ? '#fff' : 'var(--t3)', transition: '.15s' }}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '24px 16px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>{tab.emoji}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--t1)' }}>{tab.label}</div>
        <div style={{ fontSize: 13, color: 'var(--t3)', marginTop: 8 }}>En cours de développement par AnDy…</div>
      </div>
    </div>
  )
}
