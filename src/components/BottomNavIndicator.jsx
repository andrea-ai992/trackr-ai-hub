**src/components/BottomNav.jsx**
```jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Context } from '../Context';
import { FaHome, FaTrendingUp, FaGlobe, FaMoreHorizontal, FaActivity } from 'lucide-react';
import BottomNavIndicator from './BottomNavIndicator';

const BottomNav = () => {
  const { unreadNewsCount } = useContext(Context);
  const location = useLocation();

  return (
    <nav className="bottom-nav" style={{ backgroundColor: '--bg', padding: '0 16px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <ul className="bottom-nav__list">
        <li className="bottom-nav__item">
          <Link to="/" className="bottom-nav__link">
            <FaHome size={22} className="bottom-nav__icon" />
            <span className="bottom-nav__label">Home</span>
          </Link>
        </li>
        <li className="bottom-nav__item">
          <Link to="/trending" className="bottom-nav__link">
            <FaTrendingUp size={22} className="bottom-nav__icon" />
            <span className="bottom-nav__label">Trending</span>
          </Link>
        </li>
        <li className="bottom-nav__item">
          <Link to="/sports" className="bottom-nav__link">
            <FaActivity size={22} className="bottom-nav__icon" />
            <span className="bottom-nav__label">Sports</span>
          </Link>
        </li>
        <li className="bottom-nav__item">
          <Link to="/markets" className="bottom-nav__link">
            <FaGlobe size={22} className="bottom-nav__icon" />
            <span className="bottom-nav__label">Markets</span>
          </Link>
        </li>
        <li className="bottom-nav__item">
          <Link to="/news" className="bottom-nav__link">
            <FaMoreHorizontal size={22} className="bottom-nav__icon" />
            <span className="bottom-nav__label">News</span>
            {unreadNewsCount > 0 && (
              <span className="bottom-nav__badge" style={{ backgroundColor: '--t3', color: '#fff' }}>{unreadNewsCount}</span>
            )}
          </Link>
        </li>
      </ul>
      <BottomNavIndicator location={location} />
    </nav>
  );
};

export default BottomNav;
```

**src/components/BottomNavIndicator.jsx**
```jsx
import React from 'react';
import { useTransition } from 'react';
import { FaActivity } from 'lucide-react';

const BottomNavIndicator = ({ location }) => {
  const [isMounted, startTransition] = useTransition();

  return (
    <div
      className="bottom-nav-indicator"
      style={{
        position: 'absolute',
        left: 0,
        width: '100%',
        height: 56,
        backgroundColor: 'var(--green)',
        border: '1px solid var(--border-hi)',
        borderRadius: '999px',
        transform: isMounted ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'left, width 250ms ease',
      }}
    >
      <FaActivity size={22} className="bottom-nav-indicator__icon" />
    </div>
  );
};

export default BottomNavIndicator;
```

**src/styles/global.css**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: var(--bg);
  box-shadow: 0 -1px 0 var(--border);
}

.bottom-nav__list {
  display: flex;
  gap: 16px;
}

.bottom-nav__item {
  position: relative;
}

.bottom-nav__link {
  display: flex;
  align-items: center;
  color: var(--t3);
  text-decoration: none;
}

.bottom-nav__icon {
  margin-right: 8px;
}

.bottom-nav__label {
  font-size: 14px;
  font-family: 'Inter', sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.bottom-nav__badge {
  position: absolute;
  top: 50%;
  right: 0;
  transform: translateY(-50%);
  padding: 4px 8px;
  border-radius: 999px;
  background-color: var(--t3);
  color: #fff;
}

.bottom-nav-indicator {
  position: absolute;
  left: 0;
  width: 100%;
  height: 56;
  background-color: var(--green);
  border: 1px solid var(--border-hi);
  border-radius: 999px;
  transform: translateX(-100%);
  transition: left, width 250ms ease;
}

.bottom-nav-indicator__icon {
  margin: 12px;
}
```

**src/styles/variables.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(255, 255, 255, 0.15);
}