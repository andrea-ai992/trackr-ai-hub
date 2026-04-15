import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, TrendingUp, Plane, Newspaper, Home, MoreHorizontal, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'

const NAV_SHORTCUTS = [
  { label: 'Accueil',   path: '/',        icon: Home,        color: '#6366f1' },
  { label: 'Vols',      path: '/flights', icon: Plane,       color: '#06b6d4' },
  { label: 'Marchés',   path: '/markets', icon: TrendingUp,  color: '#10b981' },
  { label: 'Actualités',path: '/news',    icon: Newspaper,   color: '#ef4444' },
  { label: 'Plus',      path: '/more',    icon: MoreHorizontal, color: '#8b5cf6' },
]

export default function SearchOverlay({ onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  const navigate = useNavigate()
  const { stocks } = useApp()

  // Auto-focus
  useEffect(() => {
    const t = setTimeout(() => inputRef.current?.focus(), 60)
    return () => clearTimeout(t)
  }, [])

  // Dismiss on Escape
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const q = query.trim().toUpperCase()

  const matchedStocks = q
    ? stocks.filter(s =>
        s.symbol?.toUpperCase().includes(q) || s.name?.toUpperCase().includes(q)
      ).slice(0, 6)
    : []

  const matchedNav = q
    ? NAV_SHORTCUTS.filter(n => n.label.toUpperCase().includes(q))
    : NAV_SHORTCUTS

  function go(path) {
    navigator.vibrate?.(6)
    navigate(path)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 2000,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      />

      {/* Panel */}
      <div
        className="glass"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 2001,
          background: 'rgba(15,15,24,0.97)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          paddingTop: 'max(16px, env(safe-area-inset-top, 0px))',
          animation: 'slideDown 220ms cubic-bezier(0.32,0.72,0,1)',
          maxHeight: '85dvh',
          overflowY: 'auto',
        }}
      >
        {/* Search input row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '8px 16px 12px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <Search size={17} style={{ color: '#6b7280', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher actions, pages…"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: 16, // prevents iOS zoom
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={onClose}
            style={{
              width: 30,
              height: 30,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
              background: 'rgba(255,255,255,0.07)',
              border: 'none',
              cursor: 'pointer',
              color: '#9ca3af',
              flexShrink: 0,
            }}
          >
            <X size={15} />
          </button>
        </div>

        {/* Stock results */}
        {matchedStocks.length > 0 && (
          <section style={{ padding: '12px 0 4px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 16px 8px' }}>
              Mes Actions
            </p>
            {matchedStocks.map(s => (
              <button
                key={s.id}
                onClick={() => go(`/stocks/${s.id}`)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 16px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                className="press-scale"
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: 'rgba(16,185,129,0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <TrendingUp size={16} color="#10b981" />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'white', fontFamily: 'monospace' }}>{s.symbol}</p>
                  {s.name && <p style={{ fontSize: 12, color: '#6b7280', marginTop: 1 }}>{s.name}</p>}
                </div>
                <ChevronRight size={14} color="#4b5563" />
              </button>
            ))}
          </section>
        )}

        {/* Navigation shortcuts */}
        {matchedNav.length > 0 && (
          <section style={{ padding: '12px 0 16px' }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '0 16px 8px' }}>
              {q ? 'Navigation' : 'Accès rapide'}
            </p>
            {matchedNav.map(n => {
              const Icon = n.icon
              return (
                <button
                  key={n.path}
                  onClick={() => go(n.path)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '10px 16px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  className="press-scale"
                >
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: n.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Icon size={16} color={n.color} />
                  </div>
                  <p style={{ fontSize: 14, fontWeight: 500, color: 'white', flex: 1 }}>{n.label}</p>
                  <ChevronRight size={14} color="#4b5563" />
                </button>
              )
            })}
          </section>
        )}

        {q && matchedStocks.length === 0 && matchedNav.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', color: '#4b5563', fontSize: 14 }}>
            Aucun résultat pour « {query} »
          </div>
        )}
      </div>
    </>
  )
}
