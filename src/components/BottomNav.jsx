import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Home, Trophy, TrendingUp, Newspaper, MoreHorizontal, Activity } from 'lucide-react';

const TABS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/sports', icon: Trophy, label: 'Sports' },
  { to: '/markets', icon: TrendingUp, label: 'Markets' },
  { to: '/news', icon: Newspaper, label: 'News' },
  { to: '/more', icon: MoreHorizontal, label: 'More' },
];

export { TABS };

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newsBadge, setNewsBadge] = useState(0);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0 });
  const tabRefs = useRef([]);
  const navRef = useRef(null);

  if (location.pathname.startsWith('/widget')) return null;

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.increment) setNewsBadge((prev) => prev + (e.detail.count ?? 1));
      else setNewsBadge(e.detail?.count ?? 0);
    };
    window.addEventListener('trackr:newsbadge', handler);
    return () => window.removeEventListener('trackr:newsbadge', handler);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/news')) setNewsBadge(0);
  }, [location.pathname]);

  useEffect(() => {
    const activeIdx = TABS.findIndex((tab) =>
      tab.to === location.pathname ||
      (tab.to !== '/' && location.pathname.startsWith(tab.to))
    );
    if (activeIdx === -1) return;
    const el = tabRefs.current[activeIdx];
    const nav = navRef.current;
    if (!el || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPillStyle({
      left: elRect.left - navRect.left,
      width: elRect.width,
    });
  }, [location.pathname]);

  function handleTab(tab) {
    navigator.vibrate?.(8);
    navigate(tab.to);
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'max(20px, env(safe-area-inset-bottom, 0px))',
        pointerEvents: 'none',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 14,
        color: 'var(--text-primary)',
      }}
    >
      <nav
        ref={navRef}
        style={{
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          width: '100%',
          maxWidth: 380,
          background: 'var(--surface-low)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid var(--border)',
          borderRadius: 999,
          padding: '4px',
          boxShadow: '0 -8px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border-bright) inset',
          position: 'relative',
          height: 56,
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            top: 4,
            bottom: 4,
            left: pillStyle.left,
            width: pillStyle.width,
            backgroundColor: 'var(--surface-high)',
            border: '1px solid var(--neon)',
            borderRadius: 999,
            transition: 'left 0.25s cubic-bezier(0.25, 0, 0.2, 1), width 0.25s cubic-bezier(0.25, 0, 0.2, 1)',
            pointerEvents: 'none',
            zIndex: 0,
            boxShadow: '0 0 12px var(--neon), 0 0 20px var(--neon)',
            opacity: 0.8,
          }}
        />

        {TABS.map((tab, i) => {
          const active = location.pathname === tab.to ||
                        (tab.to !== '/' && location.pathname.startsWith(tab.to));
          const Icon = tab.icon;
          const badge = tab.to === '/news' ? newsBadge : 0;

          return (
            <button
              key={tab.to}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              onClick={() => handleTab(tab)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 3,
                minHeight: 56,
                padding: '8px 4px',
                position: 'relative',
                background: 'transparent',
                border: 'none',
                borderRadius: 999,
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                zIndex: 1,
                transition: 'background-color 0.15s',
                ':active': {
                  backgroundColor: 'rgba(0, 255, 136, 0.08)',
                },
              }}
            >
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: active ? '6px 12px' : '6px',
                  borderRadius: 999,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backgroundColor: active ? 'rgba(0, 255, 136, 0.12)' : 'transparent',
                  transform: active ? 'scale(1.1)' : 'scale(1)',
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.6}
                  style={{
                    color: active ? 'var(--neon)' : 'var(--text-secondary)',
                    transition: 'color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                />
                {badge > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      minWidth: 15,
                      height: 15,
                      borderRadius: 8,
                      background: '#ef4444',
                      color: 'white',
                      fontSize: 8,
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 3px',
                      boxShadow: '0 0 6px rgba(239, 68, 68, 0.6)',
                      border: '1.5px solid var(--bg)',
                    }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>

              <span
                style={{
                  fontSize: 8,
                  fontWeight: active ? 700 : 500,
                  color: active ? 'var(--neon)' : 'var(--text-secondary)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'JetBrains Mono, monospace',
                  opacity: active ? 1 : 0,
                }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}