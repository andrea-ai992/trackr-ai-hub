import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Info, Zap, ChevronRight, BarChart3, LineChart, Target, HelpCircle } from 'lucide-react'

// ─── Pattern Data ─────────────────────────────────────────────────────────────
const PATTERNS = [
  {
    id: 'triple-top',
    name: 'Triple Top',
    type: 'Reversal (Bearish)',
    desc: 'Trois sommets consécutifs à peu près au même niveau, indiquant un épuisement des acheteurs.',
    points: [[10, 80], [30, 20], [50, 80], [70, 20], [90, 80], [110, 20], [130, 110]],
    support: [[10, 80], [130, 80]],
    resistance: [[30, 20], [110, 20]],
    breakout: [130, 110],
    color: '#ef4444'
  },
  {
    id: 'triple-bottom',
    name: 'Triple Bottom',
    type: 'Reversal (Bullish)',
    desc: 'Trois creux consécutifs indiquant une forte zone de support et un retournement imminent.',
    points: [[10, 20], [30, 80], [50, 20], [70, 80], [90, 20], [110, 80], [130, -10]],
    support: [[30, 80], [110, 80]],
    resistance: [[10, 20], [130, 20]],
    breakout: [130, -10],
    color: '#10b981'
  },
  {
    id: 'downward-flag',
    name: 'Downward Flag',
    type: 'Continuation (Bullish)',
    desc: 'Une consolidation descendante après une forte hausse (le "mât"). Signal de continuation.',
    points: [[10, 100], [40, 20], [60, 40], [80, 20], [100, 40], [125, -10]],
    pole: [[10, 100], [40, 20]],
    resistance: [[40, 20], [100, 20]],
    support: [[60, 40], [120, 40]],
    color: '#10b981'
  },
  {
    id: 'upward-flag',
    name: 'Upward Flag',
    type: 'Continuation (Bearish)',
    desc: 'Une consolidation ascendante après une chute brutale. Prélude à une nouvelle baisse.',
    points: [[10, 20], [40, 100], [60, 80], [80, 100], [100, 80], [125, 130]],
    pole: [[10, 20], [40, 100]],
    resistance: [[60, 80], [120, 80]],
    support: [[40, 100], [100, 100]],
    color: '#ef4444'
  },
  {
    id: 'double-top',
    name: 'Double Top',
    type: 'Reversal (Bearish)',
    desc: 'Deux pics successifs montrant que le prix ne parvient pas à franchir une résistance.',
    points: [[10, 90], [40, 20], [70, 90], [100, 20], [130, 120]],
    neckline: [[10, 90], [130, 90]],
    resistance: [[40, 20], [100, 20]],
    color: '#ef4444'
  },
  {
    id: 'double-bottom',
    name: 'Double Bottom',
    type: 'Reversal (Bullish)',
    desc: 'Forme en "W". Le prix teste deux fois un support avant de rebondir vers le haut.',
    points: [[10, 20], [40, 90], [70, 20], [100, 90], [130, -10]],
    neckline: [[10, 20], [130, 20]],
    support: [[40, 90], [100, 90]],
    color: '#10b981'
  },
  {
    id: 'falling-wedge',
    name: 'Falling Wedge',
    type: 'Reversal (Bullish)',
    desc: 'Le prix se resserre entre deux lignes descendantes divergentes. Souvent haussier.',
    points: [[10, 10], [130, 90], [40, 30], [110, 80], [60, 45], [100, 65], [140, 20]],
    resistance: [[10, 10], [140, 70]],
    support: [[130, 90], [140, 85]],
    color: '#10b981'
  },
  {
    id: 'rising-wedge',
    name: 'Rising Wedge',
    type: 'Reversal (Bearish)',
    desc: 'Le prix se resserre entre deux lignes ascendantes. Indique un retournement baissier.',
    points: [[10, 110], [130, 30], [40, 90], [110, 40], [60, 75], [100, 55], [140, 100]],
    resistance: [[10, 110], [140, 50]],
    support: [[130, 30], [140, 35]],
    color: '#ef4444'
  },
  {
    id: 'head-shoulders',
    name: 'Head & Shoulders',
    type: 'Reversal (Bearish)',
    desc: 'Épaule-Tête-Épaule. Le signal de retournement baissier le plus célèbre.',
    points: [[10, 70], [30, 40], [50, 70], [75, 10], [100, 70], [120, 40], [140, 110]],
    neckline: [[10, 70], [140, 70]],
    color: '#ef4444'
  },
  {
    id: 'inv-head-shoulders',
    name: 'Inverse H&S',
    type: 'Reversal (Bullish)',
    desc: 'Épaule-Tête-Épaule inversée. Signal puissant de retournement à la hausse.',
    points: [[10, 40], [30, 70], [50, 40], [75, 100], [100, 40], [120, 70], [140, 0]],
    neckline: [[10, 40], [140, 40]],
    color: '#10b981'
  },
  {
    id: 'cup-handle',
    name: 'Cup & Handle',
    type: 'Continuation (Bullish)',
    desc: 'Une forme de "tasse" suivie d\'une petite "anse". Signal de cassure haussière.',
    points: [[10, 10], [20, 40], [40, 70], [70, 80], [100, 70], [120, 40], [130, 15], [140, 30], [150, 20], [170, -20]],
    resistance: [[130, 15], [150, 15]],
    color: '#10b981'
  },
  {
    id: 'sym-triangle',
    name: 'Symmetrical Triangle',
    type: 'Bilateral',
    desc: 'Convergence des prix vers un point. Indique une indécision avant une explosion.',
    points: [[10, 10], [10, 110], [40, 30], [40, 90], [70, 50], [70, 70], [100, 60], [130, 10]],
    resistance: [[10, 10], [130, 60]],
    support: [[10, 110], [130, 60]],
    color: '#3b82f6'
  },
  {
    id: 'asc-triangle',
    name: 'Ascending Triangle',
    type: 'Continuation (Bullish)',
    desc: 'Une ligne de résistance plate et un support ascendant. Souvent résolu par le haut.',
    points: [[10, 110], [130, 20], [40, 80], [130, 20], [80, 50], [130, 20], [160, -20]],
    resistance: [[10, 20], [160, 20]],
    support: [[10, 110], [130, 20]],
    color: '#10b981'
  },
  {
    id: 'desc-triangle',
    name: 'Descending Triangle',
    type: 'Continuation (Bearish)',
    desc: 'Un support plat et une résistance descendante. Annonce généralement une chute.',
    points: [[10, 10], [130, 100], [40, 40], [130, 100], [80, 70], [130, 100], [160, 140]],
    support: [[10, 100], [160, 100]],
    resistance: [[10, 10], [130, 100]],
    color: '#ef4444'
  },
  {
    id: 'bull-pennant',
    name: 'Bullish Pennant',
    type: 'Continuation (Bullish)',
    desc: 'Petit triangle qui se forme après un mât vertical. Indique un saut imminent.',
    pole: [[10, 120], [30, 30]],
    points: [[30, 30], [60, 80], [80, 40], [100, 70], [120, 55], [150, 0]],
    resistance: [[30, 30], [120, 55]],
    support: [[60, 80], [120, 55]],
    color: '#10b981'
  },
  {
    id: 'bear-pennant',
    name: 'Bearish Pennant',
    type: 'Continuation (Bearish)',
    desc: 'Forme symétrique se créant après une chute libre. Prélude à plus de baisse.',
    pole: [[10, 10], [30, 100]],
    points: [[30, 100], [60, 50], [80, 90], [100, 60], [120, 75], [150, 130]],
    resistance: [[60, 50], [120, 75]],
    support: [[30, 100], [120, 75]],
    color: '#ef4444'
  }
]

// ─── Pattern SVG Component ────────────────────────────────────────────────────
function PatternSVG({ pattern, isHovered }) {
  const { points, support, resistance, neckline, pole, color } = pattern
  
  const toPoints = (pts) => pts.map(p => `${p[0]},${p[1]}`).join(' ')
  
  return (
    <svg viewBox="0 0 160 120" style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
      <defs>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
        <linearGradient id={`grad-${pattern.id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>

      {/* Grid Lines (Subtle) */}
      <line x1="0" y1="20" x2="160" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="60" x2="160" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
      <line x1="0" y1="100" x2="160" y2="100" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

      {/* Pattern Lines (Support/Resistance/Neckline) */}
      {pole && <line x1={pole[0][0]} y1={pole[0][1]} x2={pole[1][0]} y2={pole[1][1]} stroke="rgba(255,255,255,0.2)" strokeWidth="2" strokeDasharray="4 2" />}
      {resistance && <line x1={resistance[0][0]} y1={resistance[0][1]} x2={resistance[1][0]} y2={resistance[1][1]} stroke={isHovered ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" style={{ transition: 'all 300ms' }} />}
      {support && <line x1={support[0][0]} y1={support[0][1]} x2={support[1][0]} y2={support[1][1]} stroke={isHovered ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" style={{ transition: 'all 300ms' }} />}
      {neckline && <line x1={neckline[0][0]} y1={neckline[0][1]} x2={neckline[1][0]} y2={neckline[1][1]} stroke={isHovered ? color : "rgba(255,255,255,0.15)"} strokeWidth="1.5" strokeDasharray="3 3" style={{ transition: 'all 300ms' }} />}

      {/* Price Action Line */}
      <polyline
        points={toPoints(points)}
        fill="none"
        stroke={isHovered ? color : "white"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transition: 'all 400ms',
          strokeDasharray: '300',
          strokeDashoffset: isHovered ? '0' : '300',
          animation: isHovered ? 'dash 1.5s ease-out forwards' : 'none',
          filter: isHovered ? 'url(#glow)' : 'none'
        }}
      />

      {/* Breakout Pulse */}
      {isHovered && points.length > 0 && (
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="4"
          fill={color}
        >
          <animate attributeName="r" values="4;8;4" dur="1s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
        </circle>
      )}

      <style>{`
        @keyframes dash {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Patterns() {
  const navigate = useNavigate()
  const [hoveredId, setHoveredId] = useState(null)
  const [selectedType, setSelectedType] = useState('All')

  const types = ['All', 'Reversal', 'Continuation', 'Bilateral']
  
  const filteredPatterns = selectedType === 'All' 
    ? PATTERNS 
    : PATTERNS.filter(p => p.type.includes(selectedType))

  return (
    <div style={{ 
      maxWidth: 600, 
      margin: '0 auto', 
      paddingBottom: 40,
      minHeight: '100dvh',
      background: '#0b1323',
      color: '#dbe2f8'
    }}>
      {/* Header */}
      <div style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        background: 'rgba(11,19,35,0.85)', 
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: 'max(52px, env(safe-area-inset-top, 0px)) 16px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.06)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button 
            onClick={() => navigate(-1)}
            className="press-scale"
            style={{ 
              width: 40, height: 40, borderRadius: 12, 
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 24, fontWeight: 900, color: 'white', letterSpacing: '-0.02em' }}>Patterns Academy</h1>
            <p style={{ fontSize: 13, color: '#64748b' }}>Apprenez les signaux du marché</p>
          </div>
          <div style={{ 
            width: 42, height: 42, borderRadius: 14, 
            background: 'linear-gradient(135deg, #00daf3, #00a3ff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            boxShadow: '0 0 20px rgba(0,218,243,0.3)' 
          }}>
            <LineChart size={22} color="white" />
          </div>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              style={{
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 700,
                border: 'none',
                cursor: 'pointer',
                background: selectedType === t ? 'rgba(0,218,243,0.15)' : 'rgba(255,255,255,0.05)',
                color: selectedType === t ? '#00daf3' : '#64748b',
                transition: 'all 200ms'
              }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: '24px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {filteredPatterns.map(pattern => (
          <div 
            key={pattern.id}
            onMouseEnter={() => setHoveredId(pattern.id)}
            onMouseLeave={() => setHoveredId(null)}
            onTouchStart={() => setHoveredId(pattern.id)}
            style={{
              padding: '16px',
              borderRadius: 24,
              background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${hoveredId === pattern.id ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 300ms cubic-bezier(0.22, 1, 0.36, 1)',
              transform: hoveredId === pattern.id ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredId === pattern.id ? '0 12px 30px rgba(0,0,0,0.3)' : 'none'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <p style={{ 
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                color: pattern.type.includes('Bullish') ? '#10b981' : pattern.type.includes('Bearish') ? '#ef4444' : '#3b82f6'
              }}>
                {pattern.type}
              </p>
              {hoveredId === pattern.id && <Zap size={10} color={pattern.color} fill={pattern.color} />}
            </div>
            
            <div style={{ position: 'relative', marginBottom: 14, padding: '10px 0' }}>
               <PatternSVG pattern={pattern} isHovered={hoveredId === pattern.id} />
            </div>

            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', marginBottom: 4 }}>{pattern.name}</h3>
            <p style={{ fontSize: 12, color: '#4b5563', lineHeight: 1.4, minHeight: 48 }}>{pattern.desc}</p>
            
            <button style={{ 
              marginTop: 12, width: '100%', padding: '10px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
            }}>
              Détails <ChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Info Card */}
      <div style={{ margin: '0 16px', padding: 20, borderRadius: 24, background: 'rgba(0,218,243,0.05)', border: '1px solid rgba(0,218,243,0.15)', display: 'flex', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(0,218,243,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Info size={20} color="#00daf3" />
        </div>
        <div>
          <h4 style={{ fontSize: 15, fontWeight: 800, color: '#00daf3', marginBottom: 4 }}>Conseil de pro</h4>
          <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.5 }}>
            Les patterns sont plus fiables lorsqu'ils sont confirmés par le <strong>volume</strong> et surviennent sur des unités de temps élevées (D1, H4).
          </p>
        </div>
      </div>

      <style>{`
        .press-scale:active { transform: scale(0.95); }
      `}</style>
    </div>
  )
}
