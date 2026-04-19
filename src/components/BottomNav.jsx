// src/components/BottomNav.jsx — 5 tabs: Hub | Markets | Sports | AI | More
import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import { Home, BarChart2, Trophy, Cpu, MoreHorizontal } from 'lucide-react'

export const TABS = [
  { to: '/',        icon: Home,           label: 'Hub',     color: '#00ff88' },
  { to: '/markets', icon: BarChart2,       label: 'Markets', color: '#00d4ff' },
  { to: '/sports',  icon: Trophy,          label: 'Sports',  color: '#ff6b35' },
  { to: '/ai',      icon: Cpu,            label: 'Lea',     color: '#b06dff' },
  { to: '/more',    icon: MoreHorizontal,  label: 'More',    color: '#888888' },
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
    if (tab.to === '/markets') return location.pathname.startsWith('/markets') || location.pathname.startsWith('/stocks/') || location.pathname.startsWith('/crypto/') || location.pathname.startsWith('/news')
    if (tab.to === '/sports') return location.pathname.startsWith('/sports')
    if (tab.to === '/ai') return location.pathname.startsWith('/ai') || location.pathname.startsWith('/brain') || location.pathname.startsWith('/agents') || location.pathname.startsWith('/andy')
    if (tab.to === '/more') return location.pathname.startsWith('/more') || location.pathname.startsWith('/flights') || location.pathname.startsWith('/portfolio')
    return false
  }

  const activeTab = TABS.find(t => isTabActive(t))
  const activeColor = activeTab?.color || '#00ff88'

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
      fontFamily: "'JetBrains Mono', monospace",
      paddingBottom: 'env(safe-area-inset-bottom)',
    }}>
      <nav ref={navRef} style={{
        display: 'flex', alignItems: 'center',
        width: '100%',
        background: 'rgba(0,0,0,0.92)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderTop: `1px solid ${activeColor}22`,
        position: 'relative', height: 56,
        transition: 'border-color 0.3s',
      }}>
        {/* Sliding pill */}
        <div aria-hidden style={{
          position: 'absolute', top: 6, bottom: 6,
          left: pillStyle.left + 4, width: pillStyle.width - 8,
          background: `${activeColor}10`,
          border: `1px solid ${activeColor}40`,
          borderRadius: 10,
          transition: 'left 0.28s cubic-bezier(0.25,0,0.2,1), width 0.28s cubic-bezier(0.25,0,0.2,1), background 0.3s, border-color 0.3s',
          pointerEvents: 'none', zIndex: 0,
        }} />

        {TABS.map((tab, i) => {
          const active = isTabActive(tab)
          const Icon = tab.icon
          const badge = tab.to === '/markets' ? newsBadge : 0
          return (
            <button key={tab.to} ref={el => { tabRefs.current[i] = el }}
              onClick={() => { navigator.vibrate?.(6); navigate(tab.to) }}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                height: '100%', padding: '4px 2px',
                background: 'transparent', border: 'none', borderRadius: 10,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent', zIndex: 1,
              }}>
              <div style={{ position: 'relative' }}>
                <Icon size={20} strokeWidth={active ? 2.2 : 1.5}
                  style={{
                    color: active ? tab.color : '#444',
                    transition: 'color 0.2s, transform 0.2s',
                    transform: active ? 'scale(1.12)' : 'scale(1)',
                    display: 'block',
                  }} />
                {badge > 0 && (
                  <span style={{
                    position: 'absolute', top: -4, right: -5,
                    minWidth: 14, height: 14, borderRadius: 7,
                    background: '#ff3b3b', color: '#fff',
                    fontSize: 8, fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 2px', border: '1.5px solid #000',
                  }}>{badge > 99 ? '99+' : badge}</span>
                )}
              </div>
              <span style={{
                fontSize: 9, fontWeight: active ? 700 : 400,
                color: active ? tab.color : '#444',
                letterSpacing: '0.05em', textTransform: 'uppercase',
                transition: 'color 0.2s',
              }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
