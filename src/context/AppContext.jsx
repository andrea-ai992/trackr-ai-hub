// src/components/BottomNav.jsx
import { useState, useEffect, useRef } from 'react';
import { Home, TrendingUp, Globe, MoreHorizontal, Activity } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const navItems = [
  { path: '/', icon: Home, label: 'Accueil' },
  { path: '/markets', icon: TrendingUp, label: 'Marchés' },
  { path: '/news', icon: Globe, label: 'Actualités' },
  { path: '/sports', icon: Activity, label: 'Sports' },
  { path: '/more', icon: MoreHorizontal, label: 'Plus' },
];

export default function BottomNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { categories } = useApp();
  const [activeIndex, setActiveIndex] = useState(0);
  const [newsCount, setNewsCount] = useState(0);
  const pillRef = useRef(null);

  useEffect(() => {
    const currentIndex = navItems.findIndex(item => item.path === pathname);
    if (currentIndex !== -1) setActiveIndex(currentIndex);

    const updatePillPosition = () => {
      if (pillRef.current) {
        const activeItem = document.querySelector(`[data-index="${activeIndex}"]`);
        if (activeItem) {
          const { offsetLeft, offsetWidth } = activeItem;
          pillRef.current.style.left = `${offsetLeft}px`;
          pillRef.current.style.width = `${offsetWidth}px`;
        }
      }
    };

    const timer = setTimeout(updatePillPosition, 50);
    return () => clearTimeout(timer);
  }, [pathname, activeIndex]);

  useEffect(() => {
    const unread = localStorage.getItem('trackr_news_unread') || '0';
    setNewsCount(parseInt(unread, 10));
  }, []);

  const handleNavClick = (path, index) => {
    navigate(path);
    setActiveIndex(index);
  };

  return (
    <nav className="bottom-nav" style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '56px',
      paddingBottom: 'env(safe-area-inset-bottom)',
      backgroundColor: 'var(--surface)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1000,
    }}>
      <div
        ref={pillRef}
        className="pill-indicator"
        style={{
          position: 'absolute',
          top: '8px',
          height: '40px',
          backgroundColor: 'var(--green-bg, rgba(0, 255, 136, 0.12))',
          border: '1px solid var(--border-bright)',
          borderRadius: '999px',
          transition: 'left 250ms ease, width 250ms ease',
          pointerEvents: 'none',
        }}
      />

      {navItems.map((item, index) => (
        <button
          key={item.path}
          data-index={index}
          onClick={() => handleNavClick(item.path, index)}
          className="nav-item"
          style={{
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            width: '60px',
            height: '100%',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            color: activeIndex === index ? 'var(--neon)' : 'var(--text-secondary)',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '10px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            transition: 'color 200ms ease',
          }}
        >
          <item.icon size={22} style={{ strokeWidth: 1.5 }} />
          <span style={{ fontSize: '8px' }}>{item.label}</span>
          {item.path === '/news' && newsCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '6px',
              right: '12px',
              backgroundColor: '#ff4757',
              color: 'white',
              borderRadius: '999px',
              padding: '2px 6px',
              fontSize: '8px',
              fontWeight: 'bold',
            }}>
              {newsCount > 9 ? '9+' : newsCount}
            </span>
          )}
        </button>
      ))}
    </nav>
  );
}