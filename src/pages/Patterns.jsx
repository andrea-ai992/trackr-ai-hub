// src/components/SignalCard.jsx
import { TrendingUp, Info, Zap, Target, BarChart3 } from 'lucide-react'

export function SignalCard({ signal }) {
  if (!signal) return null

  const {
    id,
    name,
    type,
    desc,
    points,
    support,
    resistance,
    neckline,
    pole,
    breakout,
    color = '#3b82f6'
  } = signal

  const getTypeIcon = (type) => {
    const typeLower = type.toLowerCase()
    if (typeLower.includes('bullish')) return <TrendingUp className="w-4 h-4" style={{ color: '#00ff88' }} />
    if (typeLower.includes('bearish')) return <TrendingUp className="w-4 h-4" style={{ color: '#ff4444' }} />
    if (typeLower.includes('continuation')) return <Zap className="w-4 h-4" style={{ color: '#ffcc00' }} />
    if (typeLower.includes('reversal')) return <Target className="w-4 h-4" style={{ color: '#8b5cf6' }} />
    return <BarChart3 className="w-4 h-4" style={{ color: '#3b82f6' }} />
  }

  return (
    <div
      className="w-full p-4 rounded-lg border border-[--border-hi] bg-[--bg2] hover:bg-[--bg3] transition-all duration-300 group"
      style={{ borderColor: 'rgba(255,255,255,0.12)' }}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: color + '20' }}
            >
              {getTypeIcon(type)}
            </div>
            <h3 className="text-[--t1] font-semibold text-sm" style={{ color: '#f0f0f0' }}>
              {name}
            </h3>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: color + '30',
                color: color
              }}
            >
              {type}
            </span>
          </div>

          <p className="text-[--t2] text-xs mb-3 leading-relaxed" style={{ color: '#888' }}>
            {desc}
          </p>

          <div className="flex gap-4 text-xs">
            {support && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#00ff88' }} />
                <span style={{ color: '#888' }}>Support</span>
              </div>
            )}
            {resistance && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff4444' }} />
                <span style={{ color: '#888' }}>Résistance</span>
              </div>
            )}
            {neckline && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#8b5cf6' }} />
                <span style={{ color: '#888' }}>Ligne de cou</span>
              </div>
            )}
            {pole && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ffcc00' }} />
                <span style={{ color: '#888' }}>Mât</span>
              </div>
            )}
            {breakout && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#06b6d4' }} />
                <span style={{ color: '#888' }}>Cassure</span>
              </div>
            )}
          </div>
        </div>

        <div className="w-24 h-16 ml-4 flex-shrink-0">
          <svg viewBox="0 0 100 60" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <filter id={`glow-${id}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="15" x2="100" y2="15" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <line x1="0" y1="30" x2="100" y2="30" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
            <line x1="0" y1="45" x2="100" y2="45" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />

            {/* Pattern Lines */}
            {pole && <line x1={pole[0][0]} y1={pole[0][1]} x2={pole[1][0]} y2={pole[1][1]} stroke={color} strokeWidth="1" strokeDasharray="2 1" />}
            {resistance && <line x1={resistance[0][0]} y1={resistance[0][1]} x2={resistance[1][0]} y2={resistance[1][1]} stroke={color} strokeWidth="1" />}
            {support && <line x1={support[0][0]} y1={support[0][1]} x2={support[1][0]} y2={support[1][1]} stroke={color} strokeWidth="1" />}
            {neckline && <line x1={neckline[0][0]} y1={neckline[0][1]} x2={neckline[1][0]} y2={neckline[1][1]} stroke={color} strokeWidth="1" strokeDasharray="1 1" />}

            {/* Price Action */}
            <polyline
              points={points.map(p => `${p[0]},${p[1]}`).join(' ')}
              fill="none"
              stroke={color}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
```

```jsx
// src/pages/Patterns.jsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, Info, Zap, ChevronRight, BarChart3, LineChart, Target, HelpCircle } from 'lucide-react'
import { SignalCard } from '../components/SignalCard'

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
    color: '#ff4444'
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
    color: '#00ff88'
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
    color: '#00ff88'
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
    color: '#ff4444'
  },
  {
    id: 'double-top',
    name: 'Double Top',
    type: 'Reversal (Bearish)',
    desc: 'Deux pics successifs montrant que le prix ne parvient pas à franchir une résistance.',
    points: [[10, 90], [40, 20], [70, 90], [100, 20], [130, 120]],
    neckline: [[10, 90], [130, 90]],
    resistance: [[40, 20], [100, 20]],
    color: '#ff4444'
  },
  {
    id: 'double-bottom',
    name: 'Double Bottom',
    type: 'Reversal (Bullish)',
    desc: 'Forme en "W". Le prix teste deux fois un support avant de rebondir vers le haut.',
    points: [[10, 20], [40, 90], [70, 20], [100, 90], [130, -10]],
    neckline: [[10, 20], [130, 20]],
    support: [[40, 90], [100, 90]],
    color: '#00ff88'
  },
  {
    id: 'falling-wedge',
    name: 'Falling Wedge',
    type: 'Reversal (Bullish)',
    desc: 'Le prix se resserre entre deux lignes descendantes divergentes. Souvent haussier.',
    points: [[10, 10], [130, 90], [40, 30], [110, 80], [60, 45], [100, 65], [140, 20]],
    resistance: [[10, 10], [140, 70]],
    support: [[130, 90], [140, 85]],
    color: '#00ff88'
  },
  {
    id: 'rising-wedge',
    name: 'Rising Wedge',
    type: 'Reversal (Bearish)',
    desc: 'Le prix se resserre entre deux lignes ascendantes. Indique un retournement baissier.',
    points: [[10, 110], [130, 30], [40, 90], [110, 40], [60, 75], [100, 55], [140, 100]],
    resistance: [[10, 110], [140, 50]],
    support: [[130, 30], [140, 35]],
    color: '#ff4444'
  },
  {
    id: 'head-shoulders',
    name: 'Head & Shoulders',
    type: 'Reversal (Bearish)',
    desc: 'Épaule-Tête-Épaule. Le signal de retournement baissier le plus célèbre.',
    points: [[10, 70], [30, 40], [50, 70], [75, 10], [100, 70], [120, 40], [140, 110]],
    neckline: [[10, 70], [140, 70]],
    color: '#ff4444'
  },
  {
    id: 'inv-head-shoulders',
    name: 'Inverse H&S',
    type: 'Reversal (Bullish)',
    desc: 'Épaule-Tête-Épaule inversée. Signal puissant de retournement à la hausse.',
    points: [[10, 40], [30, 70], [50, 40], [75, 100], [100, 40], [120, 70], [140, 0]],
    neckline: [[10, 40], [140, 40]],
    color: '#00ff88'
  },
  {
    id: 'cup-handle',
    name: 'Cup & Handle',
    type: 'Continuation (Bullish)',
    desc: 'Une forme de "tasse" suivie d\'une petite "anse". Signal de cassure haussière.',
    points: [[10, 10], [20, 40], [40, 70], [70, 80], [100, 70], [120, 40], [130, 15], [140, 30], [150, 20], [170, -20]],
    resistance: [[130, 15], [150, 15]],
    color: '#00ff88'
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
    color: '#00ff88'
  },
  {
    id: 'desc-triangle',
    name: 'Descending Triangle',
    type: 'Continuation (Bearish)',
    desc: 'Une ligne de support plate et une résistance descendante. Souvent résolu par le bas.',
    points: [[10, 20