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
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || 'All',
    pattern: searchParams.get('pattern') || '',
    sort: searchParams.get('sort') || 'name',
    order: searchParams.get('order') || 'asc'
  })
  const [selectedPattern, setSelectedPattern] = useState(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ─── Validation des paramètres avec Zod ───────────────────────────────────────
  useEffect(() => {
    const result = searchSchema.safeParse(Object.fromEntries(searchParams.entries()))
    if (!result.success) {
      const defaultParams = searchSchema.parse({})
      setSearchParams(defaultParams)
      setFilters(defaultParams)
    }
  }, [searchParams, setSearchParams])

  // ─── Gestion des filtres ───────────────────────────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.type !== 'All') params.set('type', filters.type)
    if (filters.pattern) params.set('pattern', filters.pattern)
    if (filters.sort !== 'name') params.set('sort', filters.sort)
    if (filters.order !== 'asc') params.set('order', filters.order)
    setSearchParams(params)
  }, [filters, setSearchParams])

  // ─── Filtrage et tri des patterns ─────────────────────────────────────────────
  const filteredPatterns = PATTERNS
    .filter(p => filters.type === 'All' || p.type.includes(filters.type))
    .filter(p => !filters.pattern || p.name.toLowerCase().includes(filters.pattern.toLowerCase()))
    .sort((a, b) => {
      const keyA = a[filters.sort]
      const keyB = b[filters.sort]
      return filters.order === 'asc'
        ? keyA.localeCompare(keyB)
        : keyB.localeCompare(keyA)
    })

  // ─── Gestion des clics sur les patterns ───────────────────────────────────────
  const handlePatternClick = (pattern) => {
    setSelectedPattern(pattern)
    setIsMobileMenuOpen(false)
  }

  const handleBackClick = () => {
    setSelectedPattern(null)
  }

  // ─── Rendu ────────────────────────────────────────────────────────────────────
  if (selectedPattern) {
    return (
      <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] p-4">
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleBackClick}
            className="p-2 rounded hover:bg-[var(--surface-low)] transition-colors"
            aria-label="Retour"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-[var(--neon)]">{selectedPattern.name}</h1>
        </div>

        <div className="bg-[var(--surface)] rounded-lg p-4 mb-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-[var(--text-secondary)]">Type:</span>
              <span className="text-sm font-mono text-[var(--neon)]">{selectedPattern.type}</span>
            </div>
            <p className="text-sm leading-relaxed">{selectedPattern.desc}</p>
          </div>
        </div>

        <div className="bg-[var(--surface)] rounded-lg p-4">
          <PatternSVG pattern={selectedPattern} isHovered={true} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] p-4">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded hover:bg-[var(--surface-low)] transition-colors"
          aria-label="Retour"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-bold text-[var(--neon)]">Patterns</h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded hover:bg-[var(--surface-low)] transition-colors md:hidden"
          aria-label="Menu"
        >
          <Zap size={20} />
        </button>
      </div>

      {/* Filtres Mobile */}
      {isMobileMenuOpen && (
        <div className="bg-[var(--surface)] rounded-lg p-4 mb-4 md:hidden">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-xs mb-1 text-[var(--text-secondary)]">Type</label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({...filters, type: e.target.value})}
                className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--neon)]"
              >
                <option value="All">All</option>
                <option value="Reversal">Reversal</option>
                <option value="Continuation">Continuation</option>
                <option value="Bilateral">Bilateral</option>
              </select>
            </div>

            <div>
              <label className="block text-xs mb-1 text-[var(--text-secondary)]">Pattern</label>
              <input
                type="text"
                value={filters.pattern}
                onChange={(e) => setFilters({...filters, pattern: e.target.value})}
                placeholder="Rechercher..."
                className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--neon)]"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs mb-1 text-[var(--text-secondary)]">Sort by</label>
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters({...filters, sort: e.target.value})}
                  className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--neon)]"
                >
                  <option value="name">Name</option>
                  <option value="type">Type</option>
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1 text-[var(--text-secondary)]">Order</label>
                <select
                  value={filters.order}
                  onChange={(e) => setFilters({...filters, order: e.target.value})}
                  className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--neon)]"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtres Desktop */}
      <div className="hidden md:flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs mb-1 text-[var(--text-secondary)]">Type</label>
          <select
            value={filters.type}
            onChange={(e) => setFilters({...filters, type: e.target.value})}
            className="w-full p-2 bg-[var(--surface-high)] border border-[var(--border)] rounded text-sm focus:outline-none focus:ring-1 focus:ring-[var(--neon)]"
          >
            <option value="All">All</option>
            <option value="Reversal">Reversal</option>
            <option value="Continuation">Continuation</option>
            <option value="Bilateral">B