src/context/NewsContext.jsx
```jsx
import { createContext, useState } from 'react';

const NewsContext = createContext();

const NewsProvider = ({ children }) => {
  const [unreadNews, setUnreadNews] = useState(0);

  return (
    <NewsContext.Provider value={{ unreadNews, setUnreadNews }}>
      {children}
    </NewsContext.Provider>
  );
};

export { NewsContext, NewsProvider };
```

src/components/BottomNav.jsx
```jsx
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Sports, Markets, News, More } from 'lucide-react';
import { NewsContext } from '../context/NewsContext';

const BottomNav = () => {
  const { pathname } = useLocation();
  const { unreadNews } = useContext(NewsContext);

  return (
    <nav
      className="bottom-nav"
      style={{
        backgroundColor: 'var(--bg)',
        padding: '0.5rem',
        borderTop: `1px solid var(--border)`,
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        safeAreaInset: 'bottom',
      }}
    >
      <ul
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 0,
          margin: 0,
          listStyle: 'none',
        }}
      >
        <li>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Home size={22} color={pathname === '/' ? 'var(--green)' : 'var(--t2)'} />
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: pathname === '/' ? 'var(--green)' : 'var(--t2)',
              }}
            >
              Home
            </span>
          </Link>
        </li>
        <li>
          <Link to="/sports" style={{ textDecoration: 'none' }}>
            <Sports size={22} color={pathname === '/sports' ? 'var(--green)' : 'var(--t2)'} />
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: pathname === '/sports' ? 'var(--green)' : 'var(--t2)',
              }}
            >
              Sports
            </span>
          </Link>
        </li>
        <li>
          <Link to="/markets" style={{ textDecoration: 'none' }}>
            <Markets size={22} color={pathname === '/markets' ? 'var(--green)' : 'var(--t2)'} />
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: pathname === '/markets' ? 'var(--green)' : 'var(--t2)',
              }}
            >
              Markets
            </span>
          </Link>
        </li>
        <li>
          <Link to="/news" style={{ textDecoration: 'none' }}>
            <News size={22} color={pathname === '/news' ? 'var(--green)' : 'var(--t2)'} />
            {unreadNews > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-0.5rem',
                  right: '-0.5rem',
                  backgroundColor: 'red',
                  color: 'white',
                  fontSize: '0.6rem',
                  padding: '0.2rem',
                  borderRadius: '50%',
                }}
              >
                {unreadNews}
              </span>
            )}
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: pathname === '/news' ? 'var(--green)' : 'var(--t2)',
              }}
            >
              News
            </span>
          </Link>
        </li>
        <li>
          <Link to="/more" style={{ textDecoration: 'none' }}>
            <More size={22} color={pathname === '/more' ? 'var(--green)' : 'var(--t2)'} />
            <span
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: pathname === '/more' ? 'var(--green)' : 'var(--t2)',
              }}
            >
              More
            </span>
          </Link>
        </li>
      </ul>
      <div
        className="pill-indicator"
        style={{
          position: 'absolute',
          bottom: '2.5rem',
          left: pathname === '/' ? '2.5rem' : pathname === '/sports' ? '7.5rem' : pathname === '/markets' ? '12.5rem' : pathname === '/news' ? '17.5rem' : '22.5rem',
          backgroundColor: 'var(--green)',
          border: `1px solid var(--border-hi)`,
          width: '2rem',
          height: '0.5rem',
          borderRadius: '1rem',
          transition: '200ms ease',
        }}
      />
    </nav>
  );
};

export default BottomNav;