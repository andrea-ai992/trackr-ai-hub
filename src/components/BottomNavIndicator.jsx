**src/components/BottomNav.jsx**
```jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Context } from '../context';
import { FaHome, FaTrendingUp, FaGlobe, FaMoreHorizontal, FaActivity } from 'lucide-react';
import BottomNavIndicator from './BottomNavIndicator';
import './BottomNav.css';

const BottomNav = () => {
  const { unreadNewsCount, setUnreadNewsCount } = useContext(Context);
  const location = useLocation();

  const handleNewsClick = () => {
    setUnreadNewsCount(0);
    localStorage.setItem('unreadNewsCount', 0);
  };

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <FaHome size={22} />
          <span className="nav-label">Home</span>
        </Link>
        <Link to="/trending" className={`nav-item ${location.pathname === '/trending' ? 'active' : ''}`}>
          <FaTrendingUp size={22} />
          <span className="nav-label">Trending</span>
        </Link>
        <Link to="/sports" className={`nav-item ${location.pathname === '/sports' ? 'active' : ''}`}>
          <FaActivity size={22} />
          <span className="nav-label">Sports</span>
        </Link>
        <Link to="/markets" className={`nav-item ${location.pathname === '/markets' ? 'active' : ''}`}>
          <FaGlobe size={22} />
          <span className="nav-label">Markets</span>
        </Link>
        <Link to="/more" className={`nav-item ${location.pathname === '/more' ? 'active' : ''}`}>
          <FaMoreHorizontal size={22} />
          <span className="nav-label">More</span>
        </Link>
        <Link to="/news" className={`nav-item ${location.pathname === '/news' ? 'active' : ''}`}>
          <div className="nav-item-badge" onClick={handleNewsClick}>
            {unreadNewsCount > 0 && (
              <span className="badge">{unreadNewsCount}</span>
            )}
            <FaActivity size={22} />
            <span className="nav-label">News</span>
          </div>
        </Link>
      </div>
      <BottomNavIndicator location={location} />
    </nav>
  );
};

export default BottomNav;
```

**src/components/BottomNavIndicator.jsx**
```jsx
import React from 'react';
import { useLocation } from 'react-router-dom';
import './BottomNavIndicator.css';

const BottomNavIndicator = ({ location }) => {
  const pathnames = location.pathname.split('/');
  const activeIndex = pathnames.length - 1;

  return (
    <div className="bottom-nav-indicator">
      <div
        className="indicator"
        style={{
          left: `${activeIndex * 60}px`,
          width: `${activeIndex * 60}px`,
        }}
      />
    </div>
  );
};

export default BottomNavIndicator;
```

**src/components/BottomNav.css**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px;
  background-color: var(--bg);
  box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nav-item {
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 999px;
  transition: left 250ms ease;
  background-color: var(--bg2);
  color: var(--t3);
}

.nav-item.active {
  background-color: var(--green);
  color: var(--t1);
  border: 1px solid var(--border-hi);
}

.nav-item:hover {
  background-color: var(--bg2);
  color: var(--t1);
}

.nav-label {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-left: 8px;
}

.nav-item-badge {
  position: relative;
  display: flex;
  align-items: center;
}

.badge {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  background-color: var(--t3);
  color: var(--t1);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.bottom-nav-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px;
}

.indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background-color: var(--green);
  border-radius: 999px;
  transition: left 250ms ease;
}
```

**src/components/BottomNavIndicator.css**
```css
.bottom-nav-indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 8px;
}

.indicator {
  position: absolute;
  top: 0;
  left: 0;
  width: 60px;
  height: 4px;
  background-color: var(--green);
  border-radius: 999px;
  transition: left 250ms ease;
}