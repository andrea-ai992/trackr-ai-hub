import { useEffect, useState } from 'react'
import { Bell, Newspaper, X } from 'lucide-react'

export default function Toast() {
  const [toasts, setToasts] = useState([])

  function addToast(toast) {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev.slice(-3), { ...toast, id }]) // max 4 at a time
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 7000)
  }

  useEffect(() => {
    // Price alerts
    const alertHandler = e => {
      const { title, body } = e.detail
      addToast({ type: 'alert', title, body })
    }
    // News alerts
    const newsHandler = e => {
      const { source, title, url, emoji } = e.detail
      addToast({ type: 'news', title: `${emoji} ${source}`, body: title, url })
    }

    window.addEventListener('trackr:alert', alertHandler)
    window.addEventListener('trackr:news', newsHandler)
    return () => {
      window.removeEventListener('trackr:alert', alertHandler)
      window.removeEventListener('trackr:news', newsHandler)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div style={{
      position: 'fixed',
      top: 'max(16px, env(safe-area-inset-top, 0px))',
      left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8,
      width: 'calc(100vw - 32px)', maxWidth: 380, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id}
          onClick={() => t.url && window.open(t.url, '_blank')}
          style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '14px 16px',
            background: t.type === 'news'
              ? 'rgba(10,10,25,0.92)'
              : 'rgba(10,10,25,0.92)',
            border: t.type === 'news'
              ? '1px solid rgba(99,102,241,0.25)'
              : '1px solid rgba(99,102,241,0.35)',
            borderRadius: 18,
            boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03) inset',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            cursor: t.url ? 'pointer' : 'default',
            pointerEvents: 'all',
            animation: 'slideInFromTop 300ms cubic-bezier(0.22,1,0.36,1) both',
          }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10, flexShrink: 0,
            background: t.type === 'news' ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.2)',
            border: '1px solid rgba(99,102,241,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {t.type === 'news'
              ? <Newspaper size={14} style={{ color: '#818cf8' }} />
              : <Bell size={14} style={{ color: '#818cf8' }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.title}</div>
            <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.4 }}
              // Truncate long news headlines
            >{t.body?.length > 100 ? t.body.slice(0, 97) + '…' : t.body}</div>
          </div>
          <button
            onClick={e => { e.stopPropagation(); setToasts(p => p.filter(x => x.id !== t.id)) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 2, flexShrink: 0 }}>
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
