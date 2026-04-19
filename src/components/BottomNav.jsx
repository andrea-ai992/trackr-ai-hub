import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Trophy, ShoppingBag, Newspaper, MoreHorizontal } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();
  const [activePath, setActivePath] = useState(location.pathname);

  useEffect(() => {
    setActivePath(location.pathname);
  }, [location.pathname]);

  const navItems = [
    { path: '/', icon: Home, label: 'Dashboard', badge: 0 },
    { path: '/sports', icon: Trophy, label: 'Sports', badge: 0 },
    { path: '/markets', icon: ShoppingBag, label: 'Markets', badge: 0 },
    { path: '/news', icon: Newspaper, label: 'News', badge: 0 },
    { path: '/more', icon: MoreHorizontal, label: 'More', badge: 0 },
  ];

  const newsBadge = 3;

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`nav-item ${activePath === item.path ? 'active' : ''}`}
          >
            <div className="icon-wrapper">
              <item.icon size={20} strokeWidth={1.5} />
              {item.label === 'News' && newsBadge > 0 && (
                <span className="badge">{newsBadge}</span>
              )}
            </div>
            <span className="label">{item.label}</span>
          </Link>
        ))}
        <div className="pill" style={{ transform: `translateX(calc(${navItems.findIndex(item => activePath === item.path) * 100}%))` }} />
      </div>
    </nav>
  );
};

export default BottomNav;