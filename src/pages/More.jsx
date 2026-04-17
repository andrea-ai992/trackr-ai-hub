import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plane, Languages, Footprints, FolderOpen, Settings2, Plus, X,
  TrendingUp, Bitcoin, ChevronRight, Sparkles, Lock, LayoutDashboard,
  Bot, Radio, Brain, Shield, Watch, Home, Briefcase, BarChart2, LineChart
} from 'lucide-react'

const ALL_MODULES = [
  { id: 'brain',       to: '/brain',       icon: Brain,           label: 'Brain IA',        desc: 'Cycles auto · mémoire · rapports',          color: '#a78bfa', badge: '24/7' },
  { id: 'agents',      to: '/agents',      icon: Radio,           label: 'Mission Control', desc: 'Agents IA · activité live · scans',           color: '#00ff88', badge: 'Live' },
  { id: 'andy',        to: '/andy',        icon: Bot,             label: 'AnDy AI',         desc: 'Assistant IA · conseiller & dev',             color: '#00ff88', badge: 'AI' },
  { id: 'flights',     to: '/flights',     icon: Plane,           label: 'Flights',         desc: 'Radar de vols en temps réel',                 color: '#38bdf8', badge: 'Live' },
  { id: 'portfolio',   to: '/portfolio',   icon: FolderOpen,      label: 'Portfolio',       desc: 'Stocks & crypto overview',                    color: '#fbbf24' },
  { id: 'sneakers',    to: '/sneakers',    icon: Footprints,      label: 'Sneakers',        desc: 'Collection & resell tracker',                 color: '#a78bfa' },
  { id: 'watches',     to: '/watches',     icon: Watch,           label: 'Montres',         desc: 'Collection · Prix Chrono24 live',             color: '#d4a843', badge: 'Live' },
  { id: 'widget',      to: '/widget',      icon: LayoutDashboard, label: 'Widget',          desc: 'Prix live · écran d\'accueil',                color: '#00ff88', badge: 'New' },
  { id: 'translator',  to: '/translator',  icon: Languages,       label: 'Translator',      desc: 'Voix & texte · 40 langues',                   color: '#38bdf8' },
  { id: 'markets',     to: '/markets',     icon: TrendingUp,      label: 'Markets',         desc: 'Stocks & crypto live',                        color: '#00ff88' },
  { id: 'real-estate', to: '/real-estate', icon: Home,            label: 'Immobilier',      desc: 'Portfolio · Simulateur crédit',               color: '#00cc66', badge: 'AI' },
  { id: 'business',    to: '/business',    icon: Briefcase,       label: 'Business Plan',   desc: 'Génère · Valide · Développe tes idées',       color: '#a78bfa', badge: 'IA' },
  { id: 'patterns',    to: '/patterns',    icon: LineChart,       label: 'Patterns',        desc: '16 figures chartistes clés',                  color: '#38bdf8', badge: 'Pro' },
  { id: 'charts',      to: '/charts',      icon: BarChart2,       label: 'Chart Analysis',  desc: 'TradingView + analyse IA',                    color: '#fbbf24', badge: 'Trader' },
  { id: 'admin',       to: '/admin',       icon: Shield,          label: 'Admin',           desc: 'Panneau d\'administration',                   color: '#ff4d4d', badge: 'Admin' },
]

const COMING_SOON = [
  { id: 'alerts', icon: Bitcoin, label: 'Crypto Alerts', desc: 'Alertes de prix custom', color: '#fbbf24' },
  { id: 'weather', icon: Sparkles, label: 'Weather', desc: 'Météo locale & globale', color: '#38bdf8' },
]

const PINNED_KEY = 'trackr_pinned_modules'
function getPinned() {
  try { return JSON.parse(localStorage.getItem(PINNED_KEY) || '["andy","flights","portfolio","sneakers"]') }
  catch { return ['andy', 'flights', 'portfolio', 'sneakers'] }
}

export default function More() {
  const navigate   = useNavigate()
  const [pinned, setPinned]       = useState(getPinned)
  const [showStore, setShowStore] = useState(false)
  const [editMode, setEditMode]   = useState(false)

  const pinnedMods = pinned.map(id => ALL_MODULES.find(m => m.id === id)).filter(Boolean)
  const unpinned   = ALL_MODULES.filter(m => !pinned.includes(m.id))

  function togglePin(id) {
    setPinned(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
      localStorage.setItem(PINNED_KEY, JSON.stringify(next))
      return next
    })
  }

  return (
    <div className="page">
      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: 8, marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, color: 'var(--t1)', letterSpacing: '-0.3px' }}>Apps</h1>
          <p style={{ fontSize: 13, color: 'var(--t3)', marginTop: 2 }}>Tes outils & modules</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setEditMode(e => !e); setShowStore(false) }} className="press-scale"
            style={{ padding: '8px 16px', borderRadius: 999, fontSize: 12, fontWeight: 700, letterSpacing: '0.04em',
              background: editMode ? 'var(--green-bg)' : 'var(--bg2)',
              border: `1px solid ${editMode ? 'var(--border-hi)' : 'var(--border)'}`,
              color: editMode ? 'var(--green)' : 'var(--t2)',
            }}>
            {editMode ? 'Terminé' : 'Modifier'}
          </button>
        </div>
      </div>

      {/* ── Pinned grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        {pinnedMods.map(m => {
          const Icon = m.icon
          return (
            <div key={m.id} style={{ position: 'relative' }}>
              {editMode && (
                <button onClick={() => togglePin(m.id)}
                  style={{ position: 'absolute', top: -7, left: -7, zIndex: 10, width: 22, height: 22, borderRadius: '50%', background: 'var(--bg4)', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t1)' }}>
                  <X size={11} />
                </button>
              )}
              <button onClick={() => !editMode && navigate(m.to)} className="press-scale"
                style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '18px 16px', borderRadius: 'var(--radius-lg)', textAlign: 'left',
                  background: 'var(--bg2)', border: '1px solid var(--border)', cursor: editMode ? 'default' : 'pointer', minHeight: 140,
                }}>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: m.color + '15', border: `1px solid ${m.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon size={21} style={{ color: m.color }} />
                </div>
                {m.badge && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: m.color, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4, opacity: 0.85 }}>{m.badge}</span>
                )}
                <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--t1)', marginBottom: 3, lineHeight: 1.2 }}>{m.label}</p>
                <p style={{ fontSize: 11, color: 'var(--t3)', lineHeight: 1.35 }}>{m.desc}</p>
              </button>
            </div>
          )
        })}

        {/* Add slot */}
        <button onClick={() => { setShowStore(s => !s); setEditMode(false) }} className="press-scale"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 140, borderRadius: 'var(--radius-lg)',
            background: showStore ? 'var(--green-bg)' : 'transparent',
            border: `1.5px dashed ${showStore ? 'var(--border-hi)' : 'var(--border)'}`,
          }}>
          <div style={{ width: 38, height: 38, borderRadius: 12, background: showStore ? 'rgba(0,255,136,0.12)' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Plus size={18} style={{ color: showStore ? 'var(--green)' : 'var(--t3)' }} />
          </div>
          <p style={{ fontSize: 12, fontWeight: 600, color: showStore ? 'var(--green)' : 'var(--t3)' }}>Ajouter</p>
        </button>
      </div>

      {/* ── Module store ── */}
      {showStore && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
            <span className="section-label">Modules disponibles</span>
          </div>
          {unpinned.length === 0 ? (
            <p style={{ padding: '20px 16px', textAlign: 'center', fontSize: 13, color: 'var(--t3)' }}>Tous les modules sont ajoutés !</p>
          ) : unpinned.map((m, i) => {
            const Icon = m.icon
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: i < unpinned.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: m.color + '15', border: `1px solid ${m.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} style={{ color: m.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{m.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{m.desc}</p>
                </div>
                <button onClick={() => { togglePin(m.id); setShowStore(false) }} className="press-scale"
                  style={{ padding: '7px 14px', borderRadius: 999, fontSize: 11, fontWeight: 700, background: 'var(--green-bg)', border: '1px solid var(--border-hi)', color: 'var(--green)', flexShrink: 0 }}>
                  Ajouter
                </button>
              </div>
            )
          })}
          {COMING_SOON.map((m) => {
            const Icon = m.icon
            return (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderTop: '1px solid var(--border)', opacity: 0.45 }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: m.color + '12', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} style={{ color: m.color }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{m.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{m.desc}</p>
                </div>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, fontWeight: 700, color: 'var(--t3)', padding: '5px 10px', borderRadius: 999, border: '1px solid var(--border)' }}>
                  <Lock size={9} /> Bientôt
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* ── All modules list ── */}
      {!showStore && (
        <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid var(--border)' }}>
            <span className="section-label">Tous les modules</span>
          </div>
          {ALL_MODULES.filter(m => !pinned.includes(m.id)).map((m, i, arr) => {
            const Icon = m.icon
            return (
              <button key={m.id} onClick={() => navigate(m.to)} className="press-scale-sm"
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '13px 16px', borderBottom: i < arr.length - 1 ? '1px solid var(--border)' : 'none', textAlign: 'left' }}>
                <div style={{ width: 42, height: 42, borderRadius: 13, flexShrink: 0, background: m.color + '15', border: `1px solid ${m.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={19} style={{ color: m.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>{m.label}</p>
                  <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>{m.desc}</p>
                </div>
                {m.badge && <span style={{ fontSize: 9, fontWeight: 700, color: m.color, letterSpacing: '0.07em', textTransform: 'uppercase', opacity: 0.8, flexShrink: 0 }}>{m.badge}</span>}
                <ChevronRight size={14} color="var(--t3)" />
              </button>
            )
          })}
        </div>
      )}

      {/* ── Settings ── */}
      <button onClick={() => navigate('/settings')} className="press-scale"
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 13, padding: '14px 16px', borderRadius: 'var(--radius-lg)', textAlign: 'left', background: 'var(--bg2)', border: '1px solid var(--border)' }}>
        <div style={{ width: 42, height: 42, borderRadius: 13, background: 'rgba(100,116,139,0.12)', border: '1px solid rgba(100,116,139,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Settings2 size={19} style={{ color: '#94a3b8' }} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--t1)' }}>Paramètres</p>
          <p style={{ fontSize: 11, color: 'var(--t3)', marginTop: 1 }}>Notifications, données, affichage</p>
        </div>
        <ChevronRight size={14} color="var(--t3)" />
      </button>
    </div>
  )
}
