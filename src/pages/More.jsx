Voici le code complet et fonctionnel pour la page `More.jsx` :

```jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModuleCard from './ModuleCard';
import { ChevronRight } from 'lucide-react';
import { ALL_MODULES, COMING_SOON, PINNED_KEY } from './constants';

const More = () => {
  const navigate = useNavigate();
  const [pinned, setPinned] = useState(getPinned());
  const [unpinned, setUnpinned] = useState(ALL_MODULES.filter((m) => !pinned.includes(m.id)));
  const [showStore, setShowStore] = useState(false);
  const [editMode, setEditMode] = useState(false);

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
        </div>
      </div>

      {/* ── Pinned grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 16,
        }}
      >
        {pinned.map((m) => (
          <ModuleCard
            key={m.id}
            icon={m.icon}
            label={m.label}
            desc={m.desc}
            badge={m.badge}
            onClick={() => navigate(m.to)}
          />
        ))}
        <button
          onClick={() => setShowStore(!showStore)}
          className="press-scale"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 140,
            borderRadius: 'var(--radius-lg)',
            background: showStore ? 'var(--green-bg)' : 'transparent',
            border: `1.5px dashed ${showStore ? 'var(--border-hi)' : 'var(--border)'}`,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: showStore ? 'rgba(0,255,136,0.12)' : 'var(--bg3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 8,
            }}
          >
            <ChevronRight size={18} style={{ color: showStore ? 'var(--green)' : 'var(--t3)' }} />
          </div>
          <p
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: showStore ? 'var(--green)' : 'var(--t3)',
            }}
          >
            Ajouter
          </p>
        </button>
      </div>

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
          {unpinned.length === 0 ? (
            <p
              style={{
                padding: '20px 16px',
                textAlign: 'center',
                fontSize: 13,
                color: 'var(--t3)',
              }}
            >
              Tous les modules sont ajoutés !
            </p>
          ) : (
            unpinned.map((m, i) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 13,
                  padding: '13px 16px',
                  borderBottom: i < unpinned.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    background: m.color + '15',
                    border: `1px solid ${m.color}28`,
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
                <button
                  onClick={() => {
                    togglePin(m.id);
                    setShowStore(false);
                  }}
                  className="press-scale"
                  style={{
                    padding: '7px 14px',
                    borderRadius: 999,
                    fontSize: 11,
                    fontWeight: 700,
                    background: 'var(--green-bg)',
                    border: '1px solid var(--border-hi)',
                    color: 'var(--green)',
                    flexShrink: 0,
                  }}
                >
                  Ajouter
                </button>
              </div>
            ))
          )}
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
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
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
              Mode sombre
            </p>
            <p
              style={{
                fontSize: 11,
                color: 'var(--t3)',
                marginTop: 1,
              }}
            >
              Activer/désactiver le mode sombre
            </p>
          </div>
          <button
            className="press-scale"
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--green-bg)',
              border: '1px solid var(--border-hi)',
              color: 'var(--green)',
              flexShrink: 0,
            }}
          >
            Activer
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            marginTop: 16,
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
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
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
              Version
            </p>
            <p
              style={{
                fontSize: 11,
                color: 'var(--t3)',
                marginTop: 1,
              }}
            >
              V3.0
            </p>
          </div>
          <button
            className="press-scale"
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--green-bg)',
              border: '1px solid var(--border-hi)',
              color: 'var(--green)',
              flexShrink: 0,
            }}
          >
            Télécharger
          </button>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 13,
            marginTop: 16,
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
              <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
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
              GitHub
            </p>
            <p
              style={{
                fontSize: 11,
                color: 'var(--t3)',
                marginTop: 1,
              }}
            >
              Voir le code source
            </p>
          </div>
          <button
            className="press-scale"
            style={{
              padding: '7px 14px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 700,
              background: 'var(--green-bg)',
              border: '1px solid var(--border-hi)',
              color: 'var(--green)',
              flexShrink: 0,
            }}
          >
            Ouvrir
          </button>
        </div>
      </div>
    </div>
  );
};

export default More;
```

Et voici le code pour le composant `ModuleCard` :

```jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const ModuleCard = ({ icon, label, desc, badge, onClick }) => {
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(false);

  const handleEditMode = () => {
    setEditMode(!editMode);
  };

  return (
    <div
      className="module-card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        padding: '18px 16px',
        borderRadius: 'var(--radius-lg)',
        background: 'var(--bg2)',
        border: '1px solid var(--border)',
        cursor: editMode ? 'default' : 'pointer',
        minHeight: 130,
      }}
    >
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          background: '#00ff88',
          border: '1px solid #00ff88',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <icon size={21} style={{ color: '#00ff88' }} />
      </div>
      {badge && (
        <span
          style={{
            fontSize: 9,
            fontWeight: 700,
            color: '#00ff88',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            marginBottom: 4,
            opacity: 0.85,
          }}
        >
          {badge}
        </span>
      )}
      <p
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--t1)',
          marginBottom: 3,
          lineHeight: 1.2,
        }}
      >
        {label}
      </p>
      <p
        style={{
          fontSize: 11,
          color: 'var(--t3)',
          lineHeight: 1.35,
        }}
      >
        {desc}
      </p>
      <ChevronRight size={12} style={{ color: '#00ff88' }} />
    </div>
  );
};

export default ModuleCard;
```

Et voici le code