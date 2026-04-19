// src/components/BottomNav.jsx — 5 tabs: Dashboard | Sports | Markets | News | More
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { Home, Sports, BarChart2, News, MoreHorizontal } from 'lucide-react'

export const TABS = [
  { to: '/',        icon: Home,          label: 'Dashboard'     },
  { to: '/sports', icon: Sports,         label: 'Sports'        },
  { to: '/markets', icon: BarChart2,      label: 'Markets'       },
  { to: '/news',    icon: News,           label: 'News'          },
  { to: '/more',    icon: MoreHorizontal, label: 'More'          },
]

export default function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [newsBadge, setNewsBadge] = useState(0)
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 })
  const tabRefs = useRef([])
  const navRef = useRef(null)

  if (location.pathname.startsWith('/widget')) return null

  function isTabActive(tab) {
    if (tab.to === '/') return location.pathname === '/' || location.pathname === '/dashboard'
    if (tab.to === '/sports') return location.pathname.startsWith('/sports') || location.pathname.startsWith('/nfl/') || location.pathname.startsWith('/nba/') || location.pathname.startsWith('/psg/') || location.pathname.startsWith('/ufc/')
    if (tab.to === '/markets') return location.pathname.startsWith('/markets') || location.pathname.startsWith('/stocks/') || location.pathname.startsWith('/crypto/')
    if (tab.to === '/news') return location.pathname.startsWith('/news')
    if (tab.to === '/more') return location.pathname.startsWith('/more') || location.pathname.startsWith('/flights/') || location.pathname.startsWith('/portfolio/')
    return false
  }

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.increment) setNewsBadge(p => p + (e.detail.count ?? 1))
      else setNewsBadge(e.detail?.count ?? 0)
    }
    window.addEventListener('trackr:newsbadge', handler)
    return () => window.removeEventListener('trackr:newsbadge', handler)
  }, [])

  useEffect(() => {
    if (location.pathname.startsWith('/markets') || location.pathname.startsWith('/news')) setNewsBadge(0)
  }, [location.pathname])

  useEffect(() => {
    const activeIdx = TABS.findIndex(tab => isTabActive(tab))
    if (activeIdx === -1) return
    const el = tabRefs.current[activeIdx]
    const nav = navRef.current
    if (!el || !nav) return
    const navRect = nav.getBoundingClientRect()
    const elRect = el.getBoundingClientRect()
    setPillStyle({ left: elRect.left - navRect.left, width: elRect.width })
  }, [location.pathname])

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000,
      display: 'flex', justifyContent: 'center',
      paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))',
      pointerEvents: 'none',
      fontFamily: 'JetBrains Mono, monospace',
    }}>
      <nav ref={navRef} style={{
        pointerEvents: 'auto',
        display: 'flex', alignItems: 'center', gap: 2,
        width: '100%', maxWidth: 420,
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid var(--border)',
        padding: '4px 4px',
        position: 'relative', height: 60,
      }}>
        {/* Sliding pill */}
        <div aria-hidden style={{
          position: 'absolute', top: 4, bottom: 4,
          left: pillStyle.left, width: pillStyle.width,
          background: 'rgba(0,255,136,0.12)',
          border: '1px solid var(--border-bright)',
          borderRadius: 12,
          padding: '6px 16px',
          transition: 'left 0.3s ease, width 0.3s ease',
          pointerEvents: 'none', zIndex: 0,
          boxShadow: '0 0 10px rgba(0,255,136,0.15)',
        }} />

        {TABS.map((tab, i) => {
          const active = isTabActive(tab)
          const Icon = tab.icon
          const badge = tab.to === '/news' ? newsBadge : 0
          return (
            <button key={tab.to} ref={el => { tabRefs.current[i] = el }}
              onClick={() => { navigator.vibrate?.(8); navigate(tab.to) }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 3,
                minHeight: 48, padding: '6px 4px',
                position: 'relative', background: 'transparent',
                border: 'none', borderRadius: 999, cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent', zIndex: 1,
              }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={22} strokeWidth={active ? 2.2 : 1.6}
                  style={{ color: active ? 'var(--neon)' : 'var(--text-muted)', transition: 'color 0.2s, transform 0.2s', transform: active ? 'scale(1.1)' : 'scale(1)' }} />
                {badge > 0 && (
                  <span style={{ position: 'absolute', top: -4, right: -6, minWidth: 15, height: 15, borderRadius: 8, background: '#ef4444', color: 'white', fontSize: 8, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px', border: '1.5px solid var(--bg)' }}>
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 9, fontWeight: 700, color: active ? 'var(--neon)' : 'var(--text-muted)', transition: 'all 0.2s', letterSpacing: '0.06em', textTransform: 'uppercase', opacity: active ? 1 : 0.5 }}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}