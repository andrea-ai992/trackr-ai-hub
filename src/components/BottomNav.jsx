Je vais ajouter la sanitisation XSS dans le composant BottomNav.jsx en utilisant DOMPurify. Voici le code modifié :

```jsx
import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Trophy, TrendingUp, Newspaper, Menu, Bitcoin } from 'lucide-react'
import DOMPurify from 'dompurify'

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