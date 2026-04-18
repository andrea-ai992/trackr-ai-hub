**src/components/BottomNav.jsx**
```jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { Context } from '../Context';
import { FaHome, FaTrendingUp, FaGlobe, FaMoreHorizontal, FaActivity } from 'lucide-react';
import BottomNavPillIndicator from './PillIndicator';
import useWindowDimensions from '../hooks/useWindowDimensions';
import useNewsUnreadCount from '../hooks/useNewsUnreadCount';

const BottomNav = () => {
  const { width } = useWindowDimensions();
  const { unreadNewsCount, setUnreadNewsCount } = useContext(Context);
  const newsUnreadCount = useNewsUnreadCount();

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav__container">
        <Link to="/" className="bottom-nav__item">
          <FaHome size={22} color={width < 768 ? '--t3' : '--green'} />
          <span className="bottom-nav__label">Home</span>
        </Link>
        <Link to="/trending" className="bottom-nav__item">
          <FaTrendingUp size={22} color={width < 768 ? '--t3' : '--green'} />
          <span className="bottom-nav__label">Trending</span>
        </Link>
        <Link to="/markets" className="bottom-nav__item">
          <FaGlobe size={22} color={width < 768 ? '--t3' : '--green'} />
          <span className="bottom-nav__label">Markets</span>
        </Link>
        <Link to="/sports" className="bottom-nav__item">
          <FaActivity size={22} color={width < 768 ? '--t3' : '--green'} />
          <span className="bottom-nav__label">Sports</span>
        </Link>
        <Link to="/news" className="bottom-nav__item">
          <FaMoreHorizontal size={22} color={width < 768 ? '--t3' : '--green'} />
          <span className="bottom-nav__label">News</span>
          {newsUnreadCount > 0 && (
            <span className="bottom-nav__badge">{newsUnreadCount}</span>
          )}
        </Link>
      </div>
      <BottomNavPillIndicator />
    </nav>
  );
};

export default BottomNav;
```

**src/components/BottomNav/PillIndicator.jsx**
```jsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const BottomNavPillIndicator = () => {
  const location = useLocation();

  return (
    <div className="bottom-nav__pill-indicator">
      {['/home', '/trending', '/markets', '/sports', '/news'].map((path, index) => (
        <div
          key={path}
          className={`bottom-nav__pill ${location.pathname === path ? 'active' : ''}`}
          style={{
            transition: 'left 250ms ease',
            left: index * 50,
            width: 10,
            height: 10,
            borderRadius: '999px',
            backgroundColor: location.pathname === path ? '--green' : '--t3',
            borderColor: location.pathname === path ? '--border-hi' : '--border',
          }}
        />
      ))}
    </div>
  );
};

export default BottomNavPillIndicator;
```

**src/components/BottomNav/index.css**
```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  background-color: var(--bg);
  box-shadow: 0 -1px 0 rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bottom-nav__container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.bottom-nav__item {
  display: flex;
  align-items: center;
  margin-right: 16px;
  transition: color 250ms ease;
}

.bottom-nav__item:last-child {
  margin-right: 0;
}

.bottom-nav__label {
  font-size: 14px;
  font-family: Inter;
  font-weight: 400;
  color: var(--t1);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-left: 8px;
}

.bottom-nav__badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: var(--t3);
  color: var(--t1);
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.bottom-nav__pill {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: var(--t3);
  border: 1px solid var(--border);
  border-radius: 999px;
  transition: left 250ms ease;
}

.bottom-nav__pill.active {
  background-color: var(--green);
  border-color: var(--border-hi);
}
```

**src/components/BottomNav/PillIndicator/index.css**
```css
.bottom-nav__pill-indicator {
  position: absolute;
  bottom: -56px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}