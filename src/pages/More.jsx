import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plane, Languages, Footprints, FolderOpen, Settings2, Plus, X,
  TrendingUp, Bitcoin, ChevronRight, Sparkles, Lock, LayoutDashboard, Bot, Radio
} from 'lucide-react'

// All available modules
const ALL_MODULES = [
  {
    id: 'agents',
    to: '/agents',
    icon: Radio,
    label: 'Mission Control',
    desc: '45 agents IA · activité live · scans auto',
    color: '#00daf3',
    glow: 'rgba(0,218,243,0.2)',
    badge: '45 agents',
    badgeColor: '#00daf3',
    builtIn: true,
  },
  {
    id: 'andy',
    to: '/andy',
    icon: Bot,
    label: 'AnDy AI',
    desc: 'Assistant IA vocal · conseiller & dev',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.25)',
    badge: 'AI',
    badgeColor: '#8b5cf6',
    builtIn: true,
  },
  {
    id: 'flights',
    to: '/flights',
    icon: Plane,
    label: 'Flight Tracker',
    desc: 'Vols live & radar autour de vous',
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.2)',
    badge: 'Live',
    badgeColor: '#06b6d4',
    builtIn: true,
  },
  {
    id: 'portfolio',
    to: '/portfolio',
    icon: FolderOpen,
    label: 'Portfolio',
    desc: 'Stocks & crypto overview',
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.2)',
    builtIn: true,
  },
  {
    id: 'sneakers',
    to: '/sneakers',
    icon: Footprints,
    label: 'Sneakers',
    desc: 'Collection & resell tracker',
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.2)',
    builtIn: true,
  },
  {
    id: 'widget',
    to: '/widget',
    icon: LayoutDashboard,
    label: 'Widget',
    desc: 'Prix live + news · écran d\'accueil',
    color: '#6366f1',
    glow: 'rgba(99,102,241,0.2)',
    badge: 'Nouveau',
    badgeColor: '#6366f1',
    builtIn: true,
  },
  {
    id: 'translator',
    to: '/translator',
    icon: Languages,
    label: 'Translator',
    desc: 'Voice & text, 40 langues',
    color: '#818cf8',
    glow: 'rgba(99,102,241,0.2)',
    builtIn: true,
  },
  {
    id: 'markets',
    to: '/markets',
    icon: TrendingUp,
    label: 'Markets',
    desc: 'Stocks & crypto live prices',
    color: '#10b981',
    glow: 'rgba(16,185,129,0.2)',
    builtIn: true,
  },
  {
    id: 'settings',
    to: '/settings',
    icon: Settings2,
    label: 'Settings',
    desc: 'App preferences & data',
    color: '#64748b',
    glow: 'rgba(100,116,139,0.15)',
    builtIn: true,
  },
]

const COMING_SOON = [
  { id: 'crypto_alerts', icon: Bitcoin, label: 'Crypto Alerts', desc: 'Custom price alerts for coins', color: '#f59e0b' },
  { id: 'weather', icon: Sparkles, label: 'Weather', desc: 'Local & global weather', color: '#06b6d4' },
]

const PINNED_KEY = 'trackr_pinned_modules'

function getPinned() {
  try { return JSON.parse(localStorage.getItem(PINNED_KEY) || '["andy","flights","portfolio","sneakers"]') }
  catch { return ['andy', 'flights', 'portfolio', 'sneakers'] }
}

function savePinned(ids) {
  localStorage.setItem(PINNED_KEY, JSON.stringify(ids))
}

export default function More() {
  const navigate = useNavigate()
  const [pinned, setPinned] = useState(getPinned)
  const [showStore, setShowStore] = useState(false)
  const [editMode, setEditMode] = useState(false)

  const pinnedModules = pinned.map(id => ALL_MODULES.find(m => m.id === id)).filter(Boolean)
  const unpinned = ALL_MODULES.filter(m => !pinned.includes(m.id))

  function togglePin(id) {
    setPinned(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      savePinned(next)
      return next
    })
  }

  function removePin(id) {
    setPinned(prev => {
      const next = prev.filter(x => x !== id)
      savePinned(next)
      return next
    })
  }

  return (
    <div style={{ maxWidth: 500, margin: '0 auto', padding: '0 16px 32px', paddingTop: 'max(52px, env(safe-area-inset-top, 0px))' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: 'white', marginBottom: 2 }}>My Apps</h1>
          <p style={{ fontSize: 13, color: '#4b5563' }}>Your tools & modules</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => { setEditMode(e => !e); setShowStore(false) }}
            className="press-scale"
            style={{
              padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              background: editMode ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.06)',
              border: editMode ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(255,255,255,0.1)',
              color: editMode ? '#818cf8' : '#9ca3af',
            }}
          >
            {editMode ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {/* Pinned modules grid */}
      {pinnedModules.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
          {pinnedModules.map(m => {
            const Icon = m.icon
            return (
              <div key={m.id} style={{ position: 'relative' }}>
                {editMode && (
                  <button
                    onClick={() => removePin(m.id)}
                    style={{
                      position: 'absolute', top: -6, left: -6, zIndex: 10,
                      width: 22, height: 22, borderRadius: '50%',
                      background: '#374151', border: '2px solid #07070f',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: 'white',
                    }}
                  >
                    <X size={11} />
                  </button>
                )}
                <button
                  onClick={() => !editMode && navigate(m.to)}
                  className="press-scale"
                  style={{
                    width: '100%',
                    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
                    padding: '20px 18px', borderRadius: 24, textAlign: 'left', cursor: editMode ? 'default' : 'pointer',
                    background: 'rgba(255,255,255,0.03)',
                    border: `1px solid rgba(255,255,255,0.08)`,
                    boxShadow: `0 4px 24px ${m.glow}, 0 0 0 1px rgba(255,255,255,0.02) inset`,
                    transition: 'all 250ms cubic-bezier(0.22,1,0.36,1)',
                  }}
                >
                  <div style={{
                    width: 52, height: 52, borderRadius: 18, marginBottom: 14,
                    background: m.color + '20', border: `1px solid ${m.color}35`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: `0 0 20px ${m.color}30`,
                  }}>
                    <Icon size={24} style={{ color: m.color }} />
                  </div>
                  {m.badge && (
                    <span style={{
                      display: 'inline-block', marginBottom: 6, padding: '2px 7px', borderRadius: 6,
                      background: m.badgeColor + '20', border: `1px solid ${m.badgeColor}35`,
                      fontSize: 10, fontWeight: 700, color: m.badgeColor, textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>{m.badge}</span>
                  )}
                  <p style={{ fontSize: 16, fontWeight: 700, color: 'white', marginBottom: 4 }}>{m.label}</p>
                  <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.4 }}>{m.desc}</p>
                  {!editMode && <ChevronRight size={14} color="#374151" style={{ marginTop: 10, alignSelf: 'flex-end' }} />}
                </button>
              </div>
            )
          })}

          {/* Add slot */}
          <button
            onClick={() => { setShowStore(s => !s); setEditMode(false) }}
            className="press-scale"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: 160, borderRadius: 24, cursor: 'pointer',
              background: showStore ? 'rgba(99,102,241,0.08)' : 'rgba(255,255,255,0.02)',
              border: `1.5px dashed ${showStore ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.1)'}`,
              transition: 'all 250ms cubic-bezier(0.22,1,0.36,1)',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 14, marginBottom: 10,
              background: showStore ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Plus size={20} style={{ color: showStore ? '#818cf8' : '#4b5563' }} />
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: showStore ? '#818cf8' : '#4b5563' }}>Add Tool</p>
          </button>
        </div>
      )}

      {/* Store — available modules */}
      {showStore && (
        <div style={{
          borderRadius: 24, overflow: 'hidden',
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.07)',
          marginBottom: 24,
        }}>
          <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Available Modules</p>
          </div>
          {unpinned.length === 0 && COMING_SOON.length === 0 && (
            <p style={{ padding: 24, textAlign: 'center', fontSize: 14, color: '#4b5563' }}>All modules added!</p>
          )}
          {unpinned.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderBottom: (i < unpinned.length - 1 || COMING_SOON.length > 0) ? '1px solid rgba(255,255,255,0.04)' : 'none',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: m.color + '20', border: `1px solid ${m.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} style={{ color: m.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{m.label}</p>
                  <p style={{ fontSize: 12, color: '#4b5563' }}>{m.desc}</p>
                </div>
                <button
                  onClick={() => { togglePin(m.id); setShowStore(false) }}
                  className="press-scale"
                  style={{
                    padding: '7px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)',
                    color: '#818cf8',
                  }}
                >
                  Add
                </button>
              </div>
            )
          })}

          {/* Coming soon */}
          {COMING_SOON.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={m.id}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px',
                  borderTop: i === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  opacity: 0.5,
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 14, flexShrink: 0,
                  background: m.color + '15', border: `1px solid ${m.color}25`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={20} style={{ color: m.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>{m.label}</p>
                  <p style={{ fontSize: 12, color: '#4b5563' }}>{m.desc}</p>
                </div>
                <div style={{
                  padding: '6px 12px', borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#4b5563', display: 'flex', alignItems: 'center', gap: 4,
                }}>
                  <Lock size={10} /> Soon
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Settings shortcut — always visible at bottom */}
      <button
        onClick={() => navigate('/settings')}
        className="press-scale"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 14,
          padding: '16px 20px', borderRadius: 20, cursor: 'pointer', textAlign: 'left',
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'rgba(100,116,139,0.15)', border: '1px solid rgba(100,116,139,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Settings2 size={20} style={{ color: '#94a3b8' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: 'white' }}>Settings</p>
          <p style={{ fontSize: 12, color: '#4b5563' }}>Notifications, data, appearance</p>
        </div>
        <ChevronRight size={16} style={{ color: '#374151' }} />
      </button>
    </div>
  )
}
