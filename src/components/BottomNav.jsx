import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
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
  const location  = useLocation()
  const navigate  = useNavigate()
  const [newsBadge, setNewsBadge] = useState(0)
  const [pillStyle, setPillStyle] = useState({})
  const tabRefs   = useRef([])
  const navRef    = useRef(null)

  if (location.pathname.startsWith('/widget')) return null

  // News badge events
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

  // Animate the sliding pill to the active tab
  useEffect(() => {
    const activeIdx = TABS.findIndex(tab =>
      tab.matches.some(pattern => new RegExp(pattern).test(location.pathname))
    )
    if (activeIdx === -1) return
    const el = tabRefs.current[activeIdx]
    const nav = navRef.current
    if (!el || !nav) return

    const navRect = nav.getBoundingClientRect()
    const elRect  = el.getBoundingClientRect()
    setPillStyle({
      left:  elRect.left - navRect.left,
      width: elRect.width,
    })
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
      <nav
        ref={navRef}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          maxWidth: 380,
          background: 'rgba(8,8,8,0.92)',
          backdropFilter: 'blur(28px)',
          WebkitBackdropFilter: 'blur(28px)',
          border: '1px solid rgba(0,255,136,0.10)',
          borderRadius: 999,
          padding: '5px 6px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(0,255,136,0.04) inset',
          position: 'relative',
        }}
      >
        {/* Animated sliding pill background */}
        {pillStyle.width > 0 && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 5,
              bottom: 5,
              left: pillStyle.left,
              width: pillStyle.width,
              background: 'rgba(0,255,136,0.08)',
              border: '1px solid rgba(0,255,136,0.22)',
              borderRadius: 999,
              boxShadow: '0 0 16px rgba(0,255,136,0.12)',
              transition: 'left 320ms cubic-bezier(0.32,0.72,0,1), width 320ms cubic-bezier(0.32,0.72,0,1)',
              pointerEvents: 'none',
            }}
          />
        )}

        {TABS.map((tab, i) => {
          const active = isActive(tab)
          const Icon   = tab.icon
          const badge  = tab.to === '/news' ? newsBadge : 0

          return (
            <button
              key={tab.to}
              ref={el => { tabRefs.current[i] = el }}
              onClick={() => handleTab(tab)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                minHeight: 54,
                padding: '8px 4px',
                position: 'relative',
                background: 'transparent',
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                zIndex: 1,
              }}
            >
              {/* Icon + badge */}
              <div style={{ position: 'relative', display: 'inline-flex' }}>
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.6}
                  style={{
                    color: active ? '#00ff88' : '#333333',
                    transition: 'color 250ms cubic-bezier(0.32,0.72,0,1), filter 250ms ease',
                    filter: active ? 'drop-shadow(0 0 5px rgba(0,255,136,0.7))' : 'none',
                    transform: active ? 'scale(1.08)' : 'scale(1)',
                    transitionProperty: 'color, filter, transform',
                    transitionDuration: '250ms',
                    transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
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
                    animation: 'itemFadeUp 300ms cubic-bezier(0.32,0.72,0,1) both',
                  }}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>

              <span style={{
                fontSize: 9,
                fontWeight: active ? 700 : 500,
                color: active ? '#00ff88' : '#333333',
                transition: 'color 250ms ease, font-weight 250ms ease',
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
