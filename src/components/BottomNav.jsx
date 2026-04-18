Je vais créer le hook personnalisé `useBottomNav.js` pour centraliser la logique d'animation et de suivi de l'onglet actif, puis mettre à jour le composant `BottomNav.jsx` pour utiliser ce hook.

D'abord, le fichier du hook:

```javascript
import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import DOMPurify from 'dompurify'

export const TABS = [
  { id: '/', label: 'Dashboard', icon: 'Home' },
  { id: '/sports', label: 'Sports', icon: 'Trophy' },
  { id: '/markets/crypto', label: 'Crypto', icon: 'Bitcoin' },
  { id: '/news', label: 'News', icon: 'Newspaper' },
  { id: '/more', label: 'More', icon: 'Menu' },
]

export const useBottomNav = () => {
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

  return {
    activeTab,
    pillPosition,
    navRefs,
    handleTabClick,
    TABS
  }
}
```

Maintenant, le fichier BottomNav.jsx mis à jour:

```jsx
import { useEffect, useRef } from 'react'
import { Home, Trophy, TrendingUp, Newspaper, Menu, Bitcoin } from 'lucide-react'
import DOMPurify from 'dompurify'
import { useBottomNav } from '../hooks/useBottomNav'

const BottomNav = () => {
  const { activeTab, pillPosition, navRefs, handleTabClick, TABS } = useBottomNav()
  const iconMap = {
    Home: Home,
    Trophy: Trophy,
    Bitcoin: Bitcoin,
    Newspaper: Newspaper,
    Menu: Menu
  }

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {TABS.map((tab) => {
          const Icon = iconMap[tab.icon]
          const sanitizedLabel = DOMPurify.sanitize(tab.label)

          return (
            <button
              key={tab.id}
              ref={el => navRefs.current[tab.id] = el}
              className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabClick(tab.id)}
              aria-label={sanitizedLabel}
            >
              <Icon size={24} strokeWidth={activeTab === tab.id ? 2.5 : 2} />
              <span className="nav-label" dangerouslySetInnerHTML={{ __html: sanitizedLabel }} />
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

Et enfin, le CSS pour BottomNav (à ajouter dans le fichier CSS global ou dans un module CSS):

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--bg2);
  backdrop-filter: blur(10px);
  border-top: 1px solid var(--border);
  z-index: 1000;
  padding: 0.75rem 0;
}

.nav-container {
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 100%;
  overflow-x: auto;
  padding: 0 1rem;
}

.nav-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 0.5rem;
  background: transparent;
  border: none;
  color: var(--t2);
  cursor: pointer;
  transition: color 0.2s ease;
  min-width: 60px;
  z-index: 1;
}

.nav-item:hover {
  color: var(--green);
}

.nav-item.active {
  color: var(--green);
}

.nav-label {
  font-size: 0.75rem;
  font-weight: 500;
  text-align: center;
}

.pill {
  position: absolute;
  bottom: 0.75rem;
  height: 36px;
  background: rgba(0, 255, 136, 0.1);
  border-radius: 999px;
  border: 1px solid var(--green);
  z-index: 0;
  pointer-events: none;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .nav-container {
    max-width: 400px;
    margin: 0 auto;
  }

  .nav-item {
    min-width: 80px;
  }
}