import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Info, Zap, ChevronRight, BarChart3, LineChart, Target, HelpCircle } from 'lucide-react'
import { z } from 'zod'

// ─── Zod Schemas ────────────────────────────────────────────────────────────
const searchSchema = z.object({
  type: z.enum(['All', 'Reversal', 'Continuation', 'Bilateral']).default('All'),
  pattern: z.string().optional(),
  sort: z.enum(['name', 'type']).default('name'),
  order: z.enum(['asc', 'desc']).default('asc')
})

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [hoveredId, setHoveredId] = useState(null)
  const [error, setError] = useState(null)

  // Parse and validate search params
  const parseParams = () => {
    try {
      const params = Object.fromEntries(searchParams.entries())
      const validated = searchSchema.parse(params)
      return validated
    } catch (err) {
      if (err instanceof z.ZodError) {
        const firstError = err.errors[0]
        setError(`Invalid parameter: ${firstError.path.join('.')} - ${firstError.message}`)
      } else {
        setError('Invalid URL parameters')
      }
      return null
    }
  }

  const validatedParams = parseParams()

  const types = ['All', 'Reversal', 'Continuation', 'Bilateral']

  const filteredPatterns = validatedParams
    ? validatedParams.type === 'All'
      ? PATTERNS
      : PATTERNS.filter(p => p.type.includes(validatedParams.type))
    : []

  const sortPatterns = (patterns) => {
    if (!validatedParams) return patterns

    return [...patterns].sort((a, b) => {
      const aValue = validatedParams.sort === 'name' ? a.name : a.type
      const bValue = validatedParams.sort === 'name' ? b.name : b.type

      if (validatedParams.order === 'asc') {
        return aValue.localeCompare(bValue)
      }
      return bValue.localeCompare(aValue)
    })
  }

  const sortedPatterns = sortPatterns(filteredPatterns)

  const handleTypeChange = (type) => {
    const params = new URLSearchParams()
    params.set('type', type)
    params.set('sort', 'name')
    params.set('order', 'asc')
    setSearchParams(params)
    setError(null)
  }

  const handlePatternClick = (id) => {
    navigate(`/patterns/${id}`)
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
      color: 'var(--text-primary)',
      fontFamily: 'JetBrains Mono, monospace',
      padding: '1rem',
      position: 'relative'
    }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--neon)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'JetBrains Mono, monospace'
          }}
        >
          <ArrowLeft size={20} />
          Back
        </button>
      </header>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid var(--neon)',
          color: 'var(--neon)',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '0.25rem',
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: '0.875rem'
        }}>
          {error}
        </div>
      )}

      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}>
        <section>
          <h1 style={{
            fontSize: '1.25rem',
            marginBottom: '1rem',
            color: 'var(--neon)'
          }}>
            Chart Patterns
          </h1>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.5rem',
            marginBottom: '1.5rem'
          }}>
            {types.map(type => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: validatedParams?.type === type
                    ? 'var(--neon)'
                    : 'var(--surface)',
                  color: validatedParams?.type === type
                    ? 'var(--bg)'
                    : 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '0.25rem',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: '0.875rem',
                  transition: 'all 200ms'
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </section>

        <section>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '1rem'
          }}>
            {sortedPatterns.map(pattern => (
              <div
                key={pattern.id}
                onClick={() => handlePatternClick(pattern.id)}
                onMouseEnter={() => setHoveredId(pattern.id)}
                onMouseLeave={() => setHoveredId(null)}
                style={{
                  backgroundColor: 'var(--surface)',
                  borderRadius: '0.5rem',
                  padding: '0.75rem',
                  cursor: 'pointer',
                  border: `1px solid ${hoveredId === pattern.id ? 'var(--neon)' : 'var(--border)'}`,
                  transition: 'all 200ms'
                }}
              >
                <div style={{
                  height: '100px',
                  marginBottom: '0.5rem',
                  position: 'relative'
                }}>
                  <PatternSVG pattern={pattern} isHovered={hoveredId === pattern.id} />
                </div>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <h3 style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    {pattern.name}
                  </h3>
                  <p style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.2'
                  }}>
                    {pattern.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}