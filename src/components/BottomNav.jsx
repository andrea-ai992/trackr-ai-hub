import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, Trophy, TrendingUp, Newspaper, Grid2X2 } from 'lucide-react'

const TABS = [
  { to: '/',        icon: Home,        label: 'Hub',     matches: ['^/$'] },
  { to: '/sports',  icon: Trophy,      label: 'Sports',  matches: ['^/sports'] },
  { to: '/markets', icon: TrendingUp,  label: 'Markets', matches: ['^/markets', '^/stocks'] },
  { to: '/news',    icon: Newspaper,   label: 'Pulse',   matches: ['^/news'] },
  { to: '/more',    icon: Grid2X2,     label: 'More',    matches: ['^/more', '^/translator', '^/settings', '^/sneakers', '^/portfolio', '^/category', '^/flights'] },
]

export { TABS }

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [newsBadge, setNewsBadge] = useState(0)

  if (location.pathname.startsWith('/widget')) return null

  useEffect(() => {
    const handler = e => {
      if (e.detail?.increment) setNewsBadge(prev => prev + (e.detail.count ?? 1))
      else setNewsBadge(e.detail?.count ?? 0)
    }
    window.addEventListener('trackr:newsbadge', handler)
    return () => window.removeEventListener('trackr:newsbadge', handler)
  }, [])

  useEffect(() => {
    if (location.pathname.startsWith('/news')) setNewsBadge(0)
  }, [location.pathname])

  function isActive(tab) {
    return tab.matches.some(pattern => new RegExp(pattern).test(location.pathname))
  }

  function handleTab(tab) {
    navigator.vibrate?.(8)
    navigate(tab.to)
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
      paddingLeft: 20,
      paddingRight: 20,
      pointerEvents: 'none',
    }}>
      <nav style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        width: '100%',
        maxWidth: 380,
        background: 'rgba(18,26,43,0.7)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(132,147,150,0.15)',
        borderRadius: 999,
        padding: '5px 8px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(0,218,243,0.04) inset',
      }}>
        {TABS.map(tab => {
          const active = isActive(tab)
          const Icon = tab.icon
          const isNews = tab.to === '/news'
          const badge = isNews ? newsBadge : 0

          return (
            <button
              key={tab.to}
              onClick={() => handleTab(tab)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                minHeight: 54,
                padding: active ? '8px 6px' : '8px 4px',
                position: 'relative',
                background: active
                  ? 'linear-gradient(135deg, rgba(0,218,243,0.18) 0%, rgba(209,188,255,0.18) 100%)'
                  : 'transparent',
                border: active
                  ? '1px solid rgba(0,218,243,0.25)'
                  : '1px solid transparent',
                borderRadius: 999,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'all 250ms cubic-bezier(0.22,1,0.36,1)',
                boxShadow: active ? '0 0 16px rgba(0,218,243,0.12)' : 'none',
              }}
            >
              {/* Icon + badge */}
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.5}
                  style={{
                    color: active ? '#00daf3' : '#4b6070',
                    transition: 'color 200ms ease, filter 200ms ease',
                    filter: active ? 'drop-shadow(0 0 6px rgba(0,218,243,0.7))' : 'none',
                  }}
                />
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -6,
                    minWidth: 15, height: 15,
                    borderRadius: 8,
                    background: '#ef4444',
                    color: 'white',
                    fontSize: 8,
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 3px',
                    boxShadow: '0 0 6px rgba(239,68,68,0.6)',
                    border: '1.5px solid #0b1323',
                  }}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span style={{
                fontSize: 9,
                fontWeight: active ? 700 : 500,
                color: active ? '#c3f5ff' : '#4b6070',
                transition: 'color 200ms ease',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
