import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { Home, Trophy, TrendingUp, Newspaper, MoreHorizontal, Activity } from 'lucide-react';

const TABS = [
  { to: '/', icon: Home, label: 'Hub', matches: ['^/$'] },
  { to: '/sports', icon: Activity, label: 'Sports', matches: ['^/sports'] },
  { to: '/markets', icon: TrendingUp, label: 'Markets', matches: ['^/markets', '^/stocks'] },
  { to: '/news', icon: Newspaper, label: 'Pulse', matches: ['^/news'] },
  { to: '/more', icon: MoreHorizontal, label: 'More', matches: ['^/more', '^/translator', '^/settings', '^/sneakers', '^/portfolio', '^/category', '^/flights'] },
];

export { TABS };

export default function BottomNav() {
  const location = useLocation();
  const navigate = useNavigate();
  const [newsBadge, setNewsBadge] = useState(0);
  const [pillStyle, setPillStyle] = useState({});
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
      tab.matches.some((pattern) => new RegExp(pattern).test(location.pathname))
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

  function isActive(tab) {
    return tab.matches.some((pattern) => new RegExp(pattern).test(location.pathname));
  }

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
        paddingLeft: 20,
        paddingRight: 20,
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
          background: 'var(--surface)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          padding: '5px 6px',
          boxShadow: '0 8px 40px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border-bright) inset',
          position: 'relative',
          height: 56,
          pointerEvents: 'auto',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Animated sliding pill indicator */}
        {pillStyle.width > 0 && (
          <div
            aria-hidden
            style={{
              position: 'absolute',
              top: 4,
              bottom: 4,
              left: pillStyle.left,
              width: pillStyle.width,
              background: 'var(--neon)',
              opacity: 0.12,
              border: '1px solid var(--neon)',
              borderRadius: 999,
              transition: 'left 250ms ease, width 250ms ease',
              pointerEvents: 'none',
            }}
          />
        )}

        {TABS.map((tab, i) => {
          const active = isActive(tab);
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
              }}
            >
              {/* Icon + badge */}
              <div
                style={{
                  position: 'relative',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon
                  size={22}
                  strokeWidth={active ? 2.2 : 1.6}
                  style={{
                    color: active ? 'var(--neon)' : 'var(--text-secondary)',
                    transition: 'color 250ms cubic-bezier(0.32, 0.72, 0, 1)',
                    filter: active ? 'drop-shadow(0 0 5px rgba(0, 255, 136, 0.7))' : 'none',
                    transform: active ? 'scale(1.08)' : 'scale(1)',
                    transitionProperty: 'color, filter, transform',
                    transitionDuration: '250ms',
                    transitionTimingFunction: 'cubic-bezier(0.32, 0.72, 0, 1)',
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
                      border: '1.5px solid #0b1323',
                      animation: 'itemFadeUp 300ms cubic-bezier(0.32, 0.72, 0, 1) both',
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
                  transition: 'color 250ms ease, font-weight 250ms ease',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'JetBrains Mono, monospace',
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