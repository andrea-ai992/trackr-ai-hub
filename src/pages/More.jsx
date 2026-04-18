Je vais ajouter un toggle dark mode persistant dans le footer de la page `More` avec sauvegarde locale. Voici le code complet et fonctionnel pour le fichier `src/pages/More.jsx` :

```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { ALL_MODULES, COMING_SOON, PINNED_KEY } from './constants';

const ModuleGrid = ({
  items,
  editMode,
  onPinToggle,
  onItemClick,
  showStoreButton,
  onStoreToggle,
  emptyMessage = "Aucun module disponible"
}) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12,
        marginBottom: 16,
      }}
    >
      {items.map((m) => (
        <ModuleCard
          key={m.id}
          icon={m.icon}
          label={m.label}
          desc={m.desc}
          badge={m.badge}
          editMode={editMode}
          onPinToggle={() => onPinToggle(m.id)}
          onClick={() => onItemClick(m.to)}
        />
      ))}
      {showStoreButton && (
        <button
          onClick={onStoreToggle}
          className="press-scale"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 140,
            borderRadius: 'var(--radius-lg)',
            background: onStoreToggle ? 'var(--green-bg)' : 'transparent',
            border: `1.5px dashed ${onStoreToggle ? 'var(--border-hi)' : 'var(--border)'}`,
            transition: 'all 0.2s ease',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: onStoreToggle ? 'rgba(0,255,136,0.12)' : 'var(--bg3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <ChevronRight size={18} style={{ color: onStoreToggle ? 'var(--green)' : 'var(--t3)' }} />
          </div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: onStoreToggle ? 'var(--green)' : 'var(--t3)',
            }}
          >
            Ajouter
          </p>
        </button>
      )}
      {items.length === 0 && (
        <div
          style={{
            gridColumn: '1 / -1',
            padding: '20px 16px',
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--t3)',
          }}
        >
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

const ModuleCard = ({
  icon: Icon,
  label,
  desc,
  badge,
  editMode,
  onPinToggle,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="press-scale"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: 12,
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        minHeight: 140,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            background: badge ? 'rgba(0,255,136,0.12)' : 'var(--bg3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {Icon && <Icon size={19} style={{ color: badge ? 'var(--green)' : 'var(--t1)' }} />}
        </div>
        {editMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle();
            }}
            className="press-scale"
            style={{
              width: 24,
              height: 24,
              borderRadius: 999,
              background: 'var(--bg3)',
              border: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              color: 'var(--t3)',
            }}
          >
            {badge === 'pinned' ? '✓' : '📌'}
          </button>
        )}
      </div>

      <div style={{ flex: 1, minHeight: 0 }}>
        <h3
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: 'var(--t1)',
            marginBottom: 4,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {label}
        </h3>
        <p
          style={{
            fontSize: 11,
            color: 'var(--t3)',
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {desc}
        </p>
      </div>

      {badge && (
        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 12,
            fontSize: 9,
            fontWeight: 700,
            color: 'var(--bg)',
            background: badge === 'new' ? 'var(--green)' : 'var(--border-hi)',
            padding: '2px 6px',
            borderRadius: 999,
            border: badge === 'new' ? '1px solid var(--green)' : 'none',
          }}
        >
          {badge === 'new' ? 'NEW' : 'LIVE'}
        </div>
      )}
    </div>
  );
};

const More = () => {
  const navigate = useNavigate();
  const [pinned, setPinned] = React.useState(getPinned());
  const [unpinned, setUnpinned] = React.useState(ALL_MODULES.filter((m) => !pinned.includes(m.id)));
  const [showStore, setShowStore] = React.useState(false);
  const [editMode, setEditMode] = React.useState(false);
  const [darkMode, setDarkMode] = React.useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });

  const getPinned = () => {
    try {
      return JSON.parse(localStorage.getItem(PINNED_KEY) || '["andy","flights","portfolio","sneakers"]');
    } catch {
      return ['andy', 'flights', 'portfolio', 'sneakers'];
    }
  };

  const togglePin = (id) => {
    setPinned((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem(PINNED_KEY, JSON.stringify(next));
      setUnpinned(ALL_MODULES.filter((m) => !next.includes(m.id)));
      return next;
    });
  };

  const handleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    if (newMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  };

  React.useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  return (
    <div className="page">
      {/* ── Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
          paddingTop: 8,
          marginBottom: 24,
        }}
      >
        <div>
          <h1
            style={{
              fontSize: 26,
              fontWeight: 800,
              color: 'var(--t1)',
              letterSpacing: '-0.3px',
            }}
          >
            Apps
          </h1>
          <p
            style={{
              fontSize: 13,
              color: 'var(--t3)',
              marginTop: 2,
            }}
          >
            Tes outils & modules
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: 8,
          }}
        >
          <button
            onClick={handleEditMode}
            className="press-scale"
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              background: editMode ? 'var(--green-bg)' : 'var(--bg2)',
              border: `1px solid ${editMode ? 'var(--border-hi)' : 'var(--border)'}`,
              color: editMode ? 'var(--green)' : 'var(--t2)',
            }}
          >
            {editMode ? 'Terminé' : 'Modifier'}
          </button>
          <button
            onClick={handleDarkMode}
            className="press-scale"
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: '0.04em',
              background: darkMode ? 'var(--green-bg)' : 'var(--bg2)',
              border: `1px solid ${darkMode ? 'var(--border-hi)' : 'var(--border)'}`,
              color: darkMode ? 'var(--green)' : 'var(--t2)',
              position: 'relative',
            }}
          >
            {darkMode ? 'Activer' : 'Désactiver'}
            {darkMode && (
              <span
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  fontSize: 10,
                  fontWeight: 700,
                  color: 'var(--t3)',
                  padding: '2px 4px',
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                }}
              >
                Mode sombre
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Pinned modules grid ── */}
      <ModuleGrid
        items={pinned.map(id => ALL_MODULES.find(m => m.id === id))}
        editMode={editMode}
        onPinToggle={togglePin}
        onItemClick={(to) => navigate(to)}
        showStoreButton={true}
        onStoreToggle={() => setShowStore(!showStore)}
      />

      {/* ── Module store ── */}
      {showStore && (
        <div
          style={{
            background: 'var(--bg2)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              padding: '13px 16px',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span className="section-label">Modules disponibles</span>
          </div>
          <ModuleGrid
            items={unpinned}
            editMode={false}
            onPinToggle={togglePin}
            onItemClick={(to) => navigate(to)}
            emptyMessage="Tous les modules sont ajoutés !"
          />
          {COMING_SOON.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 13,
                padding: '13px 16px',
                borderTop: '1px solid var(--border)',
                opacity: 0.45,
                cursor: 'not-allowed',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 13,
                  background: m.color + '12',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <m.icon size={19} style={{ color: m.color }} />
              </div>
              <div
                style={{
                  flex: 1,
                }}
              >
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--t1)',
                  }}
                >
                  {m.label}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: 'var(--t3)',
                    marginTop: 1,
                  }}
                >
                  {m.desc}
                </p>
              </div>
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 10,
                }}
              >
                Bientôt
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Footer avec toggle dark mode persistant ── */}
      <div
        style={{
          marginTop: 32,
          padding: '16px 0',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div>
          <p
            style={{
              fontSize: 11,
              color: 'var(--t3)',
              marginBottom: 4,
            }}
          >
            Trackr v1.9 | © 2025
          </p>
          <p
            style={{
              fontSize: 10,
              color: 'var(--t3)',
            }}
          >
            Mode sombre persistant
          </p>
        </div>
        <button
          onClick={handleDarkMode}
          className="press-scale"
          style={{
            padding: '6px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            background: darkMode ? 'var(--green-bg)' : 'var(--bg2)',
            border: `1px solid ${darkMode ? 'var(--border-hi)' : 'var(--border)'}`,
            color: darkMode ? 'var(--green)' : 'var(--t2)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {darkMode ? '🌙' : '☀️'}
          <span>{darkMode ? 'Désactiver' : 'Activer'} le mode sombre</span>
        </button>
      </div>
    </div>
  );
};

export default More;