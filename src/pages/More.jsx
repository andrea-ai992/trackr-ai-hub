import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from './ModuleCard';
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
        gridTemplateColumns: '1fr 1fr',
        gap: 10,
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

const More = () => {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState(getPinned());
  const [unpinned, setUnpinned] = useState(ALL_MODULES.filter((m) => !pinned.includes(m.id)));
  const [showStore, setShowStore] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

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
      return next;
    });
  };

  const handleEditMode = () => {
    setEditMode(!editMode);
  };

  const handleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    document.body.classList.add('dark-mode');
    if (!darkMode) {
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
            onItemClick={() => {}}
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
                  fontWeight: 700,
                  color: 'var(--t3)',
                  padding: '5px 10px',
                  borderRadius: 999,
                  border: '1px solid var(--border)',
                }}
              >
                <ChevronRight size={9} style={{ color: 'var(--t3)' }} />
                <span style={{ fontSize: 9, fontWeight: 700, color: 'var(--t3)' }}>Bêta</span>
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Settings ── */}
      <div
        style={{
          background: 'var(--bg2)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          padding: '13px 16px',
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 13,
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 13,
              background: 'var(--green)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707" />
            </svg>
          </div>
          <div
            style={{
              flex: 1,
              minWidth: 0,
            }}
          >
            <p
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--t1)',
              }}
            >
              Paramètres
            </p>
            <p
              style={{
                fontSize: 11,
                color: 'var(--t3)',
                marginTop: 1,
              }}
            >
              Gestion des préférences
            </p>
          </div>
          <ChevronRight size={18} style={{ color: 'var(--t3)', flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
};

export default More;