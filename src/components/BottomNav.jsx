import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Trophy, TrendingUp, Newspaper, Menu, Bitcoin } from 'lucide-react'

export const TABS = [
  { id: '/', label: 'Dashboard', icon: Home },
  { id: '/sports', label: 'Sports', icon: Trophy },
  { id: '/markets/crypto', label: 'Crypto', icon: Bitcoin },
  { id: '/news', label: 'News', icon: Newspaper },
  { id: '/more', label: 'More', icon: Menu },
]

const BottomNav = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('/')
  const [pillPosition, setPillPosition] = useState({ left: 0, width: 0 })
  const navRefs = useRef({})

  useEffect(() => {
    const currentPath = location.pathname
    const matchedTab = TABS.find(tab => currentPath.startsWith(tab.id)) || TABS[0]
    setActiveTab(matchedTab.id)

    const updatePillPosition = () => {
      if (navRefs.current[matchedTab.id]) {
        const tabElement = navRefs.current[matchedTab.id]
        setPillPosition({
          left: tabElement.offsetLeft,
          width: tabElement.offsetWidth
        })
      }
    }

    updatePillPosition()
    window.addEventListener('resize', updatePillPosition)
    return () => window.removeEventListener('resize', updatePillPosition)
  }, [location.pathname])

  const handleTabClick = (path) => {
    navigate(path)
  }

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              ref={el => navRefs.current[tab.id] = el}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              aria-label={tab.label}
            >
              <Icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="nav-label">{tab.label}</span>
            </button>
          )
        })}
        <div
          className="pill"
          style={{
            left: `${pillPosition.left}px`,
            width: `${pillPosition.width}px`,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </nav>
  )
}

export default BottomNav
```

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: var(--bg2);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border);
  padding: 0.5rem 0;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
  position: relative;
  height: 56px;
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  width: 100%;
  height: 100%;
  background: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  transition: color 0.2s ease;
  z-index: 1;
}

.nav-item:hover {
  color: var(--green);
}

.nav-item.active {
  color: var(--green);
}

.nav-label {
  font-size: 0.7rem;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.pill {
  position: absolute;
  bottom: 0.5rem;
  height: 36px;
  background-color: rgba(0, 255, 136, 0.15);
  border-radius: 18px;
  border: 1px solid var(--green);
  z-index: 0;
  pointer-events: none;
}

/* Safe area for iOS */
@supports (padding: max(0px)) {
  .bottom-nav {
    padding-bottom: max(0.5rem, env(safe-area-inset-bottom));
  }
}