Je vais créer le composant `ModuleCard` réutilisable avec gestion des badges NEW/LIVE et des clics, puis l'intégrer dans les pages existantes.

```jsx
// src/components/ModuleCard.jsx
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

const ModuleCard = ({
  title,
  icon: Icon,
  path,
  isNew = false,
  isLive = false,
  onClick,
  className = '',
  badge = null
}) => {
  const navigate = useNavigate()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick()
    }
    if (path) {
      navigate(path)
    }
  }

  return (
    <div
      className={`module-card ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-content">
        <div className="card-icon">
          <Icon size={24} />
        </div>

        <div className="card-title">{title}</div>

        {(isNew || isLive || badge) && (
          <div className="card-badge">
            {badge ? (
              badge
            ) : (
              <>
                {isNew && <span className="badge-new">NEW</span>}
                {isLive && <span className="badge-live">LIVE</span>}
              </>
            )}
          </div>
        )}
      </div>

      <div className={`card-overlay ${isHovered ? 'visible' : ''}`}></div>
    </div>
  )
}

export default ModuleCard
```

```css
/* src/styles/ModuleCard.css */
.module-card {
  position: relative;
  width: 100%;
  aspect-ratio: 1/1;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  overflow: hidden;
  transition: all var(--transition-speed) ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.module-card:hover {
  border-color: var(--green);
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.1);
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  position: relative;
  z-index: 2;
}

.card-icon {
  width: 48px;
  height: 48px;
  background-color: rgba(0, 255, 136, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
}

.card-title {
  font-size: 1rem;
  font-weight: 500;
  color: var(--t1);
}

.card-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 6px;
  z-index: 3;
}

.badge-new,
.badge-live {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.badge-new {
  background-color: rgba(0, 255, 136, 0.2);
  color: var(--green);
  border: 1px solid var(--green);
}

.badge-live {
  background-color: rgba(255, 0, 0, 0.2);
  color: #ff0000;
  border: 1px solid #ff0000;
}

.card-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 255, 136, 0.1) 0%,
    rgba(0, 255, 136, 0.05) 100%
  );
  opacity: 0;
  transition: opacity var(--transition-speed) ease;
  pointer-events: none;
}

.card-overlay.visible {
  opacity: 1;
}

/* Responsive grid */
.modules-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  padding: 16px;
}

.modules-grid .module-card {
  min-height: 120px;
}

@media (min-width: 768px) {
  .modules-grid .module-card {
    min-height: 140px;
  }
}

@media (min-width: 1024px) {
  .modules-grid .module-card {
    min-height: 160px;
  }
}