```jsx
// src/pages/MMA.jsx
import { useState } from 'react'

const COLORS = {
  bg: '#0a0a0f',
  card: '#12121a',
  cardBorder: 'rgba(102,0,234,0.15)',
  purple: '#6600ea',
  purpleLight: '#8b33ff',
  purpleDim: 'rgba(102,0,234,0.12)',
  red: '#ff2d55',
  redDim: 'rgba(255,45,85,0.12)',
  gold: '#ffd60a',
  goldDim: 'rgba(255,214,10,0.12)',
  green: '#30d158',
  greenDim: 'rgba(48,209,88,0.12)',
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.55)',
  textDim: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.06)',
}

/* ─── MOCK DATA ─────────────────────────────────────────────────────────────
   Replace fetchEvents() / fetchFighters() below with secure server-side
   API calls (e.g. /api/ufc/events) when a real data source is available.
   ─────────────────────────────────────────────────────────────────────────── */
const MOCK_EVENTS = [
  {
    id: 'ufc-310',
    name: 'UFC 310',
    subtitle: 'Pantoja vs Asakura',
    date: '2024-12-07',
    location: 'T-Mobile Arena, Las Vegas, NV',
    status: 'completed',
    mainCard: [
      {
        id: 'f1',
        fighter1: { name: 'Alexandre Pantoja', country: '🇧🇷', record: '27-5', ranking: 'C' },
        fighter2: { name: 'Kai Asakura', country: '🇯🇵', record: '19-4', ranking: '#1' },
        weightClass: 'Flyweight',
        result: { winner: 'fighter1', method: 'Decision (Unanimous)', round: 5, time: '5:00' },
        isTitle: true,
      },
      {
        id: 'f2',
        fighter1: { name: 'Shavkat Rakhmonov', country: '🇰🇿', record: '18-0', ranking: '#3' },
        fighter2: { name: 'Ian Machado Garry', country: '🇮🇪', record: '15-0', ranking: '#5' },
        weightClass: 'Welterweight',
        result: { winner: 'fighter1', method: 'Submission (Rear Naked Choke)', round: 3, time: '4:23' },
        isTitle: false,
      },
      {
        id: 'f3',
        fighter1: { name: 'Jonathon Martinez', country: '🇺🇸', record: '16-4', ranking: '#12' },
        fighter2: { name: 'Deiveson Figueiredo', country: '🇧🇷', record: '23-4-1', ranking: '#7' },
        weightClass: 'Bantamweight',
        result: { winner: 'fighter2', method: 'KO/TKO', round: 1, time: '2:45' },
        isTitle: false,
      },
    ],
    prelimCard: [
      {
        id: 'f4',
        fighter1: { name: 'Umar Nurmagomedov', country: '🇷🇺', record: '17-0', ranking: '#2' },
        fighter2: { name: 'Cub Swanson', country: '🇺🇸', record: '29-12', ranking: 'NR' },
        weightClass: 'Bantamweight',
        result: { winner: 'fighter1', method: 'Decision (Unanimous)', round: 3, time: '5:00' },
        isTitle: false,
      },
      {
        id: 'f5',
        fighter1: { name: 'Roman Kopylov', country: '🇷🇺', record: '12-1', ranking: 'NR' },
        fighter2: { name: 'Michel Pereira', country: '🇧🇷', record: '30-11-2', ranking: '#10' },
        weightClass: 'Middleweight',
        result: { winner: 'fighter1', method: 'KO/TKO', round: 2, time: '1:12' },
        isTitle: false,
      },
    ],
  },
  {
    id: 'ufc-311',
    name: 'UFC 311',
    subtitle: 'Makhachev vs Moicano',
    date: '2025-01-18',
    location: 'Intuit Dome, Inglewood, CA',
    status: 'upcoming',
    mainCard: [
      {
        id: 'f6',
        fighter1: { name: 'Islam Makhachev', country: '🇷🇺', record: '26-1', ranking: 'C' },
        fighter2: { name: 'Renato Moicano', country: '🇧🇷', record: '21-5-1', ranking: '#5' },
        weightClass: 'Lightweight',
        result: null,
        isTitle: true,
      },
      {
        id: 'f7',
        fighter1: { name: 'Merab Dvalishvili', country: '🇬🇪', record: '17-4', ranking: 'C' },
        fighter2: { name: 'Umar Nurmagomedov', country: '🇷🇺', record: '17-0', ranking: '#2' },
        weightClass: 'Bantamweight',
        result: null,
        isTitle: true,
      },
      {
        id: 'f8',
        fighter1: { name: 'Mauricio Ruffy', country: '🇧🇷', record: '10-1', ranking: '#13' },
        fighter2: { name: 'Joe Solecki', country: '🇺🇸', record: '16-5', ranking: 'NR' },
        weightClass: 'Lightweight',
        result: null,
        isTitle: false,
      },
    ],
    prelimCard: [
      {
        id: 'f9',
        fighter1: { name: 'Mateusz Gamrot', country: '🇵🇱', record: '24-2', ranking: '#9' },
        fighter2: { name: 'Jalin Turner', country: '🇺🇸', record: '14-7', ranking: 'NR' },
        weightClass: 'Lightweight',
        result: null,
        isTitle: false,
      },
      {
        id: 'f10',
        fighter1: { name: 'Johnny Walker', country: '🇧🇷', record: '21-8', ranking: 'NR' },
        fighter2: { name: 'Dominic Reyes', country: '🇺🇸', record: '12-5', ranking: 'NR' },
        weightClass: 'Light Heavyweight',
        result: null,
        isTitle: false,
      },
    ],
  },
  {
    id: 'ufc-312',
    name: 'UFC 312',
    subtitle: 'Du Plessis vs Strickland 2',
    date: '2025-02-22',
    location: 'Qudos Bank Arena, Sydney, Australia',
    status: 'upcoming',
    mainCard: [
      {
        id: 'f11',
        fighter1: { name: 'Dricus Du Plessis', country: '🇿🇦', record: '22-2', ranking: 'C' },
        fighter2: { name: 'Sean Strickland', country: '🇺🇸', record: '29-6', ranking: '#1' },
        weightClass: 'Middleweight',
        result: null,
        isTitle: true,
      },
      {
        id: 'f12',
        fighter1: { name: 'Jack Della Maddalena', country: '🇦🇺', record: '16-2', ranking: '#7' },
        fighter2: { name: 'Gilbert Burns', country: '🇧🇷', record: '22-7', ranking: '#10' },
        weightClass: 'Welterweight',
        result: null,
        isTitle: false,
      },
    ],
    prelimCard: [
      {
        id: 'f13',
        fighter1: { name: 'Justin Tafa', country: '🇦🇺', record: '8-3', ranking: 'NR' },
        fighter2: { name: 'Tallison Teixeira', country: '🇧🇷', record: '10-1', ranking: 'NR' },
        weightClass: 'Heavyweight',
        result: null,
        isTitle: false,
      },
    ],
  },
]

const TOP_FIGHTERS = [
  {
    id: 'tf1',
    name: 'Jon Jones',
    country: '🇺🇸',
    nickname: 'Bones',
    weightClass: 'Heavyweight',
    record: '27-1 NC',
    ranking: 'C',
    age: 37,
    wins: { ko: 10, sub: 1, dec: 16 },
    losses: 1,
    streak: { type: 'win', count: 5 },
    reachIn: 84.5,
  },
  {
    id: 'tf2',
    name: 'Islam Makhachev',
    country: '🇷🇺',
    nickname: '',
    weightClass: 'Lightweight',
    record: '26-1',
    ranking: 'C',
    age: 32,
    wins: { ko: 4, sub: 11, dec: 11 },
    losses: 1,
    streak: { type: 'win', count: 14 },
    reachIn: 70.5,
  },
  {
    id: 'tf3',
    name: 'Alexandre Pantoja',
    country: '🇧🇷',
    nickname: 'The Cannibal',
    weightClass: 'Flyweight',
    record: '27-5',
    ranking: 'C',
    age: 34,
    wins: { ko: 7, sub: 10, dec: 10 },
    losses: 5,
    streak: { type: 'win', count: 6 },
    reachIn: 67,
  },
  {
    id: 'tf4',
    name: 'Dricus Du Plessis',
    country: '🇿🇦',
    nickname: 'Stillknocks',
    weightClass: 'Middleweight',
    record: '22-2',
    ranking: 'C',
    age: 30,
    wins: { ko: 11, sub: 5, dec: 6 },
    losses: 2,
    streak: { type: 'win', count: 7 },
    reachIn: 76,
  },
]

/* ─── HELPERS ─────────────────────────────────────────────────────────────── */
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function daysUntil(dateStr) {
  const now = new Date()
  const d = new Date(dateStr)
  return Math.ceil((d - now) / (1000 * 60 * 60 * 24))
}

/* ─── SUB-COMPONENTS ──────────────────────────────────────────────────────── */
function StatusBadge({ status, date }) {
  if (status === 'completed') {
    return (
      <span style={{
        fontSize: 11, fontWeight: 700, color: COLORS.textSub,
        background: 'rgba(255,255,255,0.06)', borderRadius: 6,
        padding: '3px 8px', letterSpacing: '0.5px', textTransform: 'uppercase',
      }}>
        Completed
      </span>
    )
  }
  const days = daysUntil(date)
  const urgent = days <= 7
  return (
    <span style={{
      fontSize: 11, fontWeight: 700,
      color: urgent ? COLORS.red : COLORS.purpleLight,
      background: urgent ? COLORS.redDim : COLORS.purpleDim,
      borderRadius: 6, padding: '3px 8px',
      letterSpacing: '0.5px', textTransform: 'uppercase',
    }}>
      {days <= 0 ? 'Today' : `In ${days}d`}
    </span>
  )
}

function MethodBadge({ method }) {
  let color = COLORS.textSub
  let bg = 'rgba(255,255,255,0.06)'
  if (method.startsWith('KO'))  { color = COLORS.red;  bg = COLORS.redDim }
  else if (method.startsWith('Sub')) { color = COLORS.gold; bg = COLORS.goldDim }
  else if (method.startsWith('Dec')) { color = COLORS.green; bg = COLORS.greenDim }
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color, background: bg,
      borderRadius: 5, padding: '2px 7px',
      letterSpacing: '0.3px', whiteSpace: 'nowrap',
    }}>
      {method}
    </span>
  )
}

function FighterName({ fighter, isWinner, isLoser }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 2,
      opacity: isLoser ? 0.45 : 1,
      flex: 1,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <span style={{ fontSize: 14 }}>{fighter.country}</span>
        <span style={{
          fontSize: 13, fontWeight: isWinner ? 700 : 500,
          color: isWinner ? COLORS.text : COLORS.textSub,
          lineHeight: 1.2,
        }}>
          {fighter.name}
        </span>
        {isWinner && (
          <span style={{ fontSize: 11 }}>✓</span>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 10, color: COLORS.textDim }}>{fighter.record}</span>
        <span style={{
          fontSize: 9, fontWeight: 700,
          color: fighter.ranking === 'C' ? COLORS.gold : COLORS.purpleLight,
          background: fighter.ranking === 'C' ? COLORS.goldDim : COLORS.purpleDim,
          borderRadius: 4, padding: '1px 5px',
        }}>
          {fighter.ranking === 'C' ? '👑 CHAMP' : fighter.ranking}
        </span>
      </div>
    </div>
  )
}

function FightRow({ fight, compact = false }) {
  const { fighter1, fighter2, weightClass, result, isTitle } = fight
  const winner = result ? result.winner : null

  return (
    <div style={{
      padding: compact ? '12px 0' : '16px 0',
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      {isTitle && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
          <span style={{ fontSize: 13 }}>🏆</span>
          <span style={{
            fontSize: 10, fontWeight: 700, color: COLORS.gold,
            letterSpacing: '0.8px', textTransform: 'uppercase',
          }}>
            Title Fight
          </span>
          <span style={{ fontSize: 10, color: COLORS.textDim, marginLeft: 2 }}>
            · {weightClass}
          </span>
        </div>
      )}
      {!isTitle && (
        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 8, letterSpacing: '0.3px' }}>
          {weightClass}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FighterName
          fighter={fighter1}
          isWinner={winner === 'fighter1'}
          isLoser={winner === 'fighter2'}
        />
        <span style={{
          fontSize: 11, fontWeight: 700, color: COLORS.textDim,
          flexShrink: 0, padding: '0 4px',
        }}>
          VS
        </span>
        <FighterName
          fighter={fighter2}
          isWinner={winner === 'fighter2'}
          isLoser={winner === 'fighter1'}
        />
      </div>

      {result && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          marginTop: 10, flexWrap: 'wrap',
        }}>
          <MethodBadge method={result.method} />
          <span style={{ fontSize: 10, color: COLORS.textDim }}>
            R{result.round} · {result.time}
          </span>
        </div>
      )}

      {!result && (
        <div style={{ marginTop: 8 }}>
          <span style={{
            fontSize: 10, color: COLORS.purpleLight,
            background: COLORS.purpleDim, borderRadius: 5,
            padding: '2px 8px', fontWeight: 600,
          }}>
            Scheduled
          </span>
        </div>
      )}
    </div>
  )
}

function EventCard({ event, isSelected, onSelect }) {
  const [showPrelims, setShowPrelims] = useState(false)

  return (
    <div
      onClick={onSelect}
      style={{
        background: COLORS.card,
        border: `1px solid ${isSelected ? COLORS.purple : COLORS.cardBorder}`,
        borderRadius: 16,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
        boxShadow: isSelected ? `0 0 0 1px ${COLORS.purple}` : 'none',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px 18px 14px',
        borderBottom: `1px solid ${COLORS.border}`,
        background: isSelected
          ? 'linear-gradient(135deg, rgba(102,0,234,0.15) 0%, transparent 60%)'
          : 'transparent',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <span style={{
                fontSize: 18, fontWeight: 800, color: COLORS.text,
                letterSpacing: '-0.3px',
              }}>
                {event.name}
              </span>
              <StatusBadge status={event.status} date={event.date} />
            </div>
            <div style={{ fontSize: 13, color: COLORS.textSub, fontWeight: 500, marginBottom: 6 }}>
              {event.subtitle}
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: COLORS.textDim }}>
                📅 {formatDate(event.date)}
              </span>
              <span style={{ fontSize: 11, color: COLORS.textDim }}>
                📍 {event.location}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div style={{ padding: '0 18px' }}>
        <div style={{
          fontSize: 10, fontWeight: 700, color: COLORS.purpleLight,
          letterSpacing: '0.8px', textTransform: 'uppercase',
          padding: '12px 0 4px',
        }}>
          Main Card
        </div>
        {event.mainCard.map((fight) => (
          <FightRow key={fight.id} fight={fight} />
        ))}
      </div>

      {/* Prelims Toggle */}
      <div style={{ padding: '0 18px 4px' }}>
        <button
          onClick={(e) => { e.stopPropagation(); setShowPrelims((v) => !v) }}
          style={{
            width: '100%', background: 'transparent', border: 'none',
            cursor: 'pointer', padding: '12px 0',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}
        >
          <span style={{
            fontSize: 10, fontWeight: 700, color: COLORS.textSub,
            letterSpacing: '0.8px', textTransform: 'uppercase',
          }}>
            Preliminary Card ({event.prelimCard.length} fights)
          </span>
          <span style={{ fontSize: 14, color: COLORS.textDim }}>
            {showPrelims ? '▲' : '▼'}
          </span>
        </button>

        {showPrelims && event.prelimCard.map((fight) => (
          <FightRow key={fight.id} fight={fight} compact />
        ))}

        {showPrelims && (
          <div style={{ height: 12 }} />
        )}
      </div>
    </div>
  )
}

function FighterCard({ fighter }) {
  const totalWins = fighter.wins.ko + fighter.wins.sub + fighter.wins.dec
  const koRate = totalWins > 0 ? Math.round((fighter.wins.ko / totalWins) * 100) : 0
  const subRate = totalWins > 0 ? Math.round((fighter.wins.sub / totalWins) * 100) : 0
  const decRate = totalWins > 0 ? Math.round((fighter.wins.dec / totalWins) * 100) : 0

  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 16,
      padding: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      {/* Identity */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 20 }}>{fighter.country}</span>
            <span style={{
              fontSize: 9, fontWeight: 700, color: COLORS.gold,
              background: COLORS.goldDim, borderRadius: 4,
              padding: '2px 6px', letterSpacing: '0.5px',
            }}>
              👑 CHAMPION
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLORS.text, lineHeight: 1.2, marginBottom: 2 }}>
            {fighter.name}
          </div>
          {fighter.nickname && (
            <div style={{ fontSize: 11, color: COLORS.textDim, fontStyle: 'italic' }}>
              "{fighter.nickname}"
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.text }}>{fighter.record}</div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginTop: 2 }}>{fighter.weightClass}</div>
          <div style={{ fontSize: 10, color: COLORS.textDim }}>Age {fighter.age}</div>
        </div>
      </div>

      {/* Streak */}
      <div style={{
        background: fighter.streak.type === 'win' ? COLORS.greenDim : COLORS.redDim,
        borderRadius: 8, padding: '8px 12px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 14 }}>{fighter.streak.type === 'win' ? '🔥' : '📉'}</span>
        <span style={{
          fontSize: 12, fontWeight: 700,
          color: fighter.streak.type === 'win' ? COLORS.green : COLORS.red,
        }}>
          {fighter.streak.count}-Fight {fighter.streak.type === 'win' ? 'Win' : 'Losing'} Streak
        </span>
      </div>

      {/* Win breakdown */}
      <div>
        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 8, letterSpacing: '0.3px' }}>
          Win Breakdown · {totalWins} total
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { label: 'KO/TKO', value: fighter.wins.ko, pct: koRate, color: COLORS.red, bg: COLORS.redDim },
            { label: 'SUB', value: fighter.wins.sub, pct: subRate, color: COLORS.gold, bg: COLORS.goldDim },
            { label: 'DEC', value: fighter.wins.dec, pct: decRate, color: COLORS.green, bg: COLORS.greenDim },
          ].map(({ label, value, pct, color, bg }) => (
            <div key={label} style={{
              flex: 1, background: bg, borderRadius: 8,
              padding: '8px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 16, fontWeight: 800, color }}>{value}</div>
              <div style={{ fontSize: 9, color, fontWeight: 600, marginTop: 1 }}>{label}</div>
              <div style={{ fontSize: 9, color: COLORS.textDim, marginTop: 2 }}>{pct}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Reach */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '8px 12px', background: COLORS.purpleDim, borderRadius: 8,
      }}>
        <span style={{ fontSize: 11, color: COLORS.textSub }}>Reach</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: COLORS.purpleLight }}>
          {fighter.reachIn}"
        </span>
      </div>
    </div>
  )
}

/* ─── MAIN DASHBOARD ──────────────────────────────────────────────────────── */
function MMADashboard() {
  const [activeTab, setActiveTab] = useState('events') // 'events' | 'fighters'
  const [selectedEventId, setSelectedEventId] = useState(MOCK_EVENTS[0].id)

  const upcomingEvents = MOCK_EVENTS.filter((e) => e.status === 'upcoming')
  const completedEvents = MOCK_EVENTS.filter((e) => e.status === 'completed')

  const tabs = [
    { id: 'events', label: '🥊 Events' },
    { id: 'fighters', label: '🏆 Champions' },
  ]

  return (
    <div style={{
      minHeight: '100vh',
      background: COLORS.bg,
      color: COLORS.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      WebkitFontSmoothing: 'antialiased',
    }}>
      {/* Page Header */}
      <div style={{
        padding: '24px 16px 0',
        background: 'linear-gradient(180deg, rgba(102,0,234,0.08) 0%, transparent 100%)',
        borderBottom: `1px solid ${COLORS.border}`,
        paddingBottom: 0,
      }}>
        <div style={{ maxWidth: 680, margin: '0 auto' }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 24 }}>🥊</span>
              <h1 style={{
                fontSize: 26, fontWeight: 900, margin: 0,
                letterSpacing: '-0.5px', color: COLORS.text,
              }}>
                MMA Hub
              </h1>
            </div>
            <p style={{ fontSize: 13, color: COLORS.textSub, margin: 0 }}>
              UFC events, fighter stats &amp; results
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 0 }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, background: 'transparent', border: 'none',
                  cursor: 'pointer', padding: '10px 0',
                  fontSize: 13, fontWeight: 600,
                  color: activeTab === tab.id ? COLORS.purpleLight : COLORS.textDim,
                  borderBottom: `2px solid ${activeTab === tab.id ? COLORS.purple : 'transparent'}`,
                  transition: 'all 0.2s',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px 40px', maxWidth: 680, margin: '0 auto' }}>

        {/* ── EVENTS TAB ── */}
        {activeTab === 'events' && (
          <div style={{ display: 'flex', flex