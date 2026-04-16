**Fichier 1: src/components/MMADashboard.jsx** (complet)

```jsx
import { useState } from 'react'
import {
  Trophy, Calendar, MapPin, Users, ChevronRight,
  Clock, Star, Zap, Shield, TrendingUp, Award, Filter
} from 'lucide-react'

// ============================================================
// MOCK DATA — À remplacer par un appel API sécurisé côté serveur
// Exemple: GET /api/mma/events → proxy vers api.sportsdata.io ou ESPN MMA API
// Les clés API doivent rester côté serveur (Vercel Edge Functions / API Routes)
// ============================================================

const MOCK_EVENTS = [
  {
    id: 'ufc-310',
    name: 'UFC 310',
    subtitle: 'Pantoja vs Asakura',
    date: '2024-12-07',
    time: '22:00',
    venue: 'T-Mobile Arena',
    location: 'Las Vegas, Nevada',
    status: 'completed',
    ppv: true,
    mainCard: [
      {
        id: 'f1',
        fighter1: { name: 'Alexandre Pantoja', nickname: 'The Cannibal', record: '28-5', country: '🇧🇷', rank: 'C', imgPlaceholder: 'AP' },
        fighter2: { name: 'Kai Asakura', nickname: '', record: '20-4', country: '🇯🇵', rank: '#3', imgPlaceholder: 'KA' },
        weightClass: 'Flyweight',
        title: true,
        result: { winner: 'fighter1', method: 'Decision (Unanimous)', round: 5, time: '5:00' },
        isMain: true,
      },
      {
        id: 'f2',
        fighter1: { name: 'Shavkat Rakhmonov', nickname: 'Nomad', record: '18-0', country: '🇰🇿', rank: '#1', imgPlaceholder: 'SR' },
        fighter2: { name: 'Ian Machado Garry', nickname: 'The Future', record: '15-0', country: '🇮🇪', rank: '#4', imgPlaceholder: 'IG' },
        weightClass: 'Welterweight',
        title: false,
        result: { winner: 'fighter1', method: 'Submission (Rear Naked Choke)', round: 3, time: '3:47' },
        isMain: false,
      },
      {
        id: 'f3',
        fighter1: { name: 'Umar Nurmagomedov', nickname: '', record: '17-0', country: '🇷🇺', rank: '#2', imgPlaceholder: 'UN' },
        fighter2: { name: 'Cory Sandhagen', nickname: 'Sandman', record: '16-5', country: '🇺🇸', rank: '#1', imgPlaceholder: 'CS' },
        weightClass: 'Bantamweight',
        title: false,
        result: { winner: 'fighter1', method: 'Decision (Split)', round: 5, time: '5:00' },
        isMain: false,
      },
      {
        id: 'f4',
        fighter1: { name: 'Movsar Evloev', nickname: 'The Eagle', record: '18-0', country: '🇷🇺', rank: '#5', imgPlaceholder: 'ME' },
        fighter2: { name: 'Arnold Allen', nickname: 'Almighty', record: '19-3', country: '🇬🇧', rank: '#7', imgPlaceholder: 'AA' },
        weightClass: 'Featherweight',
        title: false,
        result: { winner: 'fighter1', method: 'Decision (Unanimous)', round: 3, time: '5:00' },
        isMain: false,
      },
      {
        id: 'f5',
        fighter1: { name: 'Brendan Allen', nickname: 'All Business', record: '23-5', country: '🇺🇸', rank: '#6', imgPlaceholder: 'BA' },
        fighter2: { name: 'Paul Craig', nickname: 'Bearjew', record: '17-7-1', country: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', rank: 'NR', imgPlaceholder: 'PC' },
        weightClass: 'Light Heavyweight',
        title: false,
        result: { winner: 'fighter1', method: 'KO/TKO', round: 2, time: '1:22' },
        isMain: false,
      },
    ],
    prelims: [
      {
        id: 'p1',
        fighter1: { name: 'Carlos Prates', nickname: 'The Natural Born Killer', record: '18-4', country: '🇧🇷', rank: 'NR', imgPlaceholder: 'CP' },
        fighter2: { name: 'Neil Magny', nickname: 'The Haitian Sensation', record: '28-13', country: '🇺🇸', rank: 'NR', imgPlaceholder: 'NM' },
        weightClass: 'Welterweight',
        title: false,
        result: { winner: 'fighter1', method: 'KO/TKO', round: 1, time: '2:14' },
        isMain: false,
      },
      {
        id: 'p2',
        fighter1: { name: 'Erin Blanchfield', nickname: 'Cold Blooded', record: '11-2', country: '🇺🇸', rank: '#2', imgPlaceholder: 'EB' },
        fighter2: { name: 'Natalia Silva', nickname: 'Natalinha', record: '18-5-1', country: '🇧🇷', rank: '#4', imgPlaceholder: 'NS' },
        weightClass: "Women's Flyweight",
        title: false,
        result: { winner: 'fighter2', method: 'Decision (Split)', round: 3, time: '5:00' },
        isMain: false,
      },
    ],
  },
  {
    id: 'ufc-311',
    name: 'UFC 311',
    subtitle: 'Makhachev vs Moicano',
    date: '2025-01-18',
    time: '22:00',
    venue: 'Intuit Dome',
    location: 'Inglewood, California',
    status: 'upcoming',
    ppv: true,
    mainCard: [
      {
        id: 'u1',
        fighter1: { name: 'Islam Makhachev', nickname: 'The Machine', record: '26-1', country: '🇷🇺', rank: 'C', imgPlaceholder: 'IM' },
        fighter2: { name: 'Renato Moicano', nickname: 'Money', record: '21-5-1', country: '🇧🇷', rank: '#4', imgPlaceholder: 'RM' },
        weightClass: 'Lightweight',
        title: true,
        result: null,
        isMain: true,
      },
      {
        id: 'u2',
        fighter1: { name: 'Merab Dvalishvili', nickname: 'The Machine', record: '17-4', country: '🇬🇪', rank: 'C', imgPlaceholder: 'MD' },
        fighter2: { name: 'Umar Nurmagomedov', nickname: '', record: '17-0', country: '🇷🇺', rank: '#2', imgPlaceholder: 'UN' },
        weightClass: 'Bantamweight',
        title: true,
        result: null,
        isMain: false,
      },
      {
        id: 'u3',
        fighter1: { name: 'Jiri Prochazka', nickname: 'Denisa', record: '30-4-1', country: '🇨🇿', rank: '#1', imgPlaceholder: 'JP' },
        fighter2: { name: 'Jamahal Hill', nickname: 'Sweet Dreams', record: '12-2', country: '🇺🇸', rank: '#3', imgPlaceholder: 'JH' },
        weightClass: 'Light Heavyweight',
        title: false,
        result: null,
        isMain: false,
      },
    ],
    prelims: [
      {
        id: 'up1',
        fighter1: { name: 'Doo Ho Choi', nickname: 'The Korean Superboy', record: '17-6', country: '🇰🇷', rank: 'NR', imgPlaceholder: 'DC' },
        fighter2: { name: 'Joe Lauzon', nickname: 'J-Lau', record: '30-16', country: '🇺🇸', rank: 'NR', imgPlaceholder: 'JL' },
        weightClass: 'Lightweight',
        title: false,
        result: null,
        isMain: false,
      },
    ],
  },
  {
    id: 'ufc-fn-vegas-100',
    name: 'UFC Fight Night',
    subtitle: 'Rodriguez vs Lemos',
    date: '2025-01-25',
    time: '19:00',
    venue: 'UFC APEX',
    location: 'Las Vegas, Nevada',
    status: 'upcoming',
    ppv: false,
    mainCard: [
      {
        id: 'fn1',
        fighter1: { name: 'Marina Rodriguez', nickname: 'Xena', record: '17-6-2', country: '🇧🇷', rank: '#5', imgPlaceholder: 'MR' },
        fighter2: { name: 'Amanda Lemos', nickname: 'Pão de Mel', record: '13-3-1', country: '🇧🇷', rank: '#6', imgPlaceholder: 'AL' },
        weightClass: "Women's Strawweight",
        title: false,
        result: null,
        isMain: true,
      },
    ],
    prelims: [],
  },
]

const MOCK_FIGHTERS = [
  {
    id: 'jon-jones',
    name: 'Jon Jones',
    nickname: 'Bones',
    weightClass: 'Heavyweight',
    rank: 'Champion',
    record: { wins: 27, losses: 1, draws: 0, nc: 1 },
    country: '🇺🇸',
    age: 36,
    height: "6'4\"",
    reach: '84.5"',
    stance: 'Orthodox',
    stats: { slpm: 2.59, stracc: 57, sapm: 1.25, stdef: 64, tdavg: 1.86, tdacc: 42, tddef: 96, subavg: 0.9 },
    imgPlaceholder: 'JJ',
    color: '#f59e0b',
    titleDefenses: 11,
    finishes: 10,
  },
  {
    id: 'islam-makhachev',
    name: 'Islam Makhachev',
    nickname: 'The Machine',
    weightClass: 'Lightweight',
    rank: 'Champion',
    record: { wins: 26, losses: 1, draws: 0, nc: 0 },
    country: '🇷🇺',
    age: 32,
    height: "5'10\"",
    reach: '70"',
    stance: 'Orthodox',
    stats: { slpm: 3.79, stracc: 55, sapm: 1.30, stdef: 69, tdavg: 4.50, tdacc: 62, tddef: 84, subavg: 1.2 },
    imgPlaceholder: 'IM',
    color: '#3b82f6',
    titleDefenses: 3,
    finishes: 14,
  },
  {
    id: 'alexandre-pantoja',
    name: 'Alexandre Pantoja',
    nickname: 'The Cannibal',
    weightClass: 'Flyweight',
    rank: 'Champion',
    record: { wins: 28, losses: 5, draws: 0, nc: 0 },
    country: '🇧🇷',
    age: 33,
    height: "5'5\"",
    reach: '66"',
    stance: 'Orthodox',
    stats: { slpm: 4.28, stracc: 47, sapm: 3.21, stdef: 52, tdavg: 2.65, tdacc: 38, tddef: 77, subavg: 1.5 },
    imgPlaceholder: 'AP',
    color: '#10b981',
    titleDefenses: 3,
    finishes: 13,
  },
  {
    id: 'shavkat-rakhmonov',
    name: 'Shavkat Rakhmonov',
    nickname: 'Nomad',
    weightClass: 'Welterweight',
    rank: '#1 Contender',
    record: { wins: 18, losses: 0, draws: 0, nc: 0 },
    country: '🇰🇿',
    age: 29,
    height: "6'1\"",
    reach: '75"',
    stance: 'Orthodox',
    stats: { slpm: 5.12, stracc: 53, sapm: 2.10, stdef: 61, tdavg: 3.20, tdacc: 55, tddef: 71, subavg: 2.1 },
    imgPlaceholder: 'SR',
    color: '#8b5cf6',
    titleDefenses: 0,
    finishes: 18,
  },
]

const MOCK_RANKINGS = {
  Lightweight: [
    { rank: 'C', name: 'Islam Makhachev', record: '26-1', country: '🇷🇺' },
    { rank: 1, name: 'Dustin Poirier', record: '30-9', country: '🇺🇸' },
    { rank: 2, name: 'Charles Oliveira', record: '34-10', country: '🇧🇷' },
    { rank: 3, name: 'Beneil Dariush', record: '22-5-1', country: '🇺🇸' },
    { rank: 4, name: 'Renato Moicano', record: '21-5-1', country: '🇧🇷' },
    { rank: 5, name: 'Mateusz Gamrot', record: '24-2', country: '🇵🇱' },
  ],
  Welterweight: [
    { rank: 'C', name: 'Belal Muhammad', record: '23-3', country: '🇺🇸' },
    { rank: 1, name: 'Shavkat Rakhmonov', record: '18-0', country: '🇰🇿' },
    { rank: 2, name: 'Jack Della Maddalena', record: '16-2', country: '🇦🇺' },
    { rank: 3, name: 'Gilbert Burns', record: '22-7', country: '🇧🇷' },
    { rank: 4, name: 'Ian Machado Garry', record: '15-1', country: '🇮🇪' },
    { rank: 5, name: 'Vicente Luque', record: '22-9-1', country: '🇧🇷' },
  ],
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

function FighterAvatar({ placeholder, color = '#6b7280', size = 'md' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-12 h-12 text-sm', lg: 'w-16 h-16 text-base' }
  return (
    <div
      className={`${sizes[size]} rounded-full flex items-center justify-center font-bold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {placeholder}
    </div>
  )
}

function MethodBadge({ method }) {
  const isKO = method?.includes('KO') || method?.includes('TKO')
  const isSub = method?.includes('Submission')
  const isDec = method?.includes('Decision')
  const bg = isKO ? 'bg-red-500/20 text-red-400 border-red-500/30'
    : isSub ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
    : isDec ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${bg}`}>
      {method}
    </span>
  )
}

function StatBar({ label, value, max = 100, color = '#3b82f6' }) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-400">
        <span>{label}</span>
        <span className="font-semibold text-white">{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function FightCard({ fight, showResult = true }) {
  const { fighter1, fighter2, weightClass, title, result, isMain } = fight
  const winner = result?.winner
  return (
    <div className={`relative rounded-xl p-4 border transition-all duration-200 hover:border-gray-600 ${
      isMain
        ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-yellow-500/40'
        : 'bg-gray-800/50 border-gray-700/50'
    }`}>
      {isMain && (
        <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
          <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-0.5 rounded-full uppercase tracking-wide">
            Main Event
          </span>
        </div>
      )}
      {title && (
        <div className="flex items-center gap-1 mb-3 justify-center">
          <Trophy className="w-3 h-3 text-yellow-400" />
          <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wide">
            {weightClass} Championship
          </span>
        </div>
      )}
      {!title && (
        <p className="text-xs text-gray-500 text-center mb-3">{weightClass}</p>
      )}

      <div className="flex items-center gap-3">
        {/* Fighter 1 */}
        <div className={`flex-1 flex flex-col items-center gap-1 ${winner === 'fighter1' ? 'opacity-100' : winner ? 'opacity-50' : 'opacity-100'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm ${
            winner === 'fighter1' ? 'ring-2 ring-green-400' : 'bg-gray-700'
          }`} style={{ backgroundColor: winner === 'fighter1' ? '#16a34a' : '#374151' }}>
            {fighter1.imgPlaceholder}
          </div>
          <p className="text-xs font-semibold text-center text-white leading-tight">{fighter1.name}</p>
          <p className="text-xs text-gray-400">{fighter1.record}</p>
          <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
            {fighter1.country} {fighter1.rank}
          </span>
          {winner === 'fighter1' && (
            <span className="text-xs font-bold text-green-400 uppercase">Win</span>
          )}
        </div>

        {/* VS */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0">
          <span className="text-lg font-black text-gray-500">VS</span>
          {showResult && result && (
            <div className="text-center space-y-1">
              <MethodBadge method={result.method} />
              <p className="text-xs text-gray-500">R{result.round} · {result.time}</p>
            </div>
          )}
          {!result && (
            <span className="text-xs text-blue-400 font-medium animate-pulse">TBD</span>
          )}
        </div>

        {/* Fighter 2 */}
        <div className={`flex-1 flex flex-col items-center gap-1 ${winner === 'fighter2' ? 'opacity-100' : winner ? 'opacity-50' : 'opacity-100'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm`}
            style={{ backgroundColor: winner === 'fighter2' ? '#16a34a' : '#374151' }}>
            {fighter2.imgPlaceholder}
          </div>
          <p className="text-xs font-semibold text-center text-white leading-tight">{fighter2.name}</p>
          <p className="text-xs text-gray-400">{fighter2.record}</p>
          <span className="text-xs bg-gray-700 px-1.5 py-0.5 rounded text-gray-300">
            {fighter2.country} {fighter2.rank}
          </span>
          {winner === 'fighter2' && (
            <span className="text-xs font-bold text-green-400 uppercase">Win</span>
          )}
        </div>
      </div>
    </div>
  )
}

function EventCard({ event, isSelected, onClick }) {
  const isCompleted = event.status === 'completed'
  const isUpcoming = event.status === 'upcoming'
  const dateObj = new Date(event.date)
  const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-4 border transition-all duration-200 ${
        isSelected
          ? 'bg-red-500/10 border-red-500/50'
          : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              isCompleted ? 'bg-gray-600 text-gray-300' : 'bg-red-500/20 text-red-400'
            }`}>
              {isCompleted ? 'Terminé' : 'À venir'}
            </span>
            {event.ppv && (
              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full font-semibold">
                PPV
              </span>
            )}
          </div>
          <h3 className="font-bold text-white text-sm">{event.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">{event.subtitle}</p>
        </div>
        <ChevronRight className={`w-4 h-4 flex-shrink-0 mt-1 transition-transform ${isSelected ? 'text-red-400 rotate-90' : 'text-gray-600'}`} />
      </div>

      <div className="mt-3 space-y-1">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{formattedDate} · {event.time} ET</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <MapPin className="w-3 h-3" />
          <span className="truncate">{event.venue}, {event.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users className="w-3 h-3" />
          <span>{event.mainCard.length} main · {event.prelims.length} prelims</span>
        </div>
      </div>
    </button>
  )
}

function FighterProfileCard({ fighter }) {
  const { wins, losses, draws, nc } = fighter.record
  const totalFights = wins + losses + draws + nc
  const winPct = totalFights > 0 ? Math.round((wins / totalFights) * 100) : 0

  return (
    <div className="rounded-xl border border-gray-700/50 bg-gray-800/50 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-black text-white text-lg flex-shrink-0 ring-2"
          style={{ backgroundColor: fighter.color, ringColor: fighter.color }}
        >
          {fighter.imgPlaceholder}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-lg">{fighter.country}</span>
            <span className="text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full font-semibold">
              {fighter.rank}
            </span>
          </div>
          <h3 className="font-black text-white text-base leading-tight">{fighter.name}</h3>
          {fighter.nickname && (
            <p className="text-xs text-gray-400 italic">"{fighter.nickname}"</p>
          )}
          <p className="text-sm text-gray-300 mt-1">
            {wins}-{losses}-{draws}
            {nc > 0 && <span className="text-gray-500"> ({nc} NC)</span>}
            <span className="text-gray-500 text-xs ml-2">{fighter.weightClass}</span>
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        {[
          { label: 'Âge', value: fighter.age },
          { label: 'Taille', value: fighter.height },
          { label: 'Allonge', value: fighter.reach },
        ].map(({ label, value }) => (
          <div key={label} className="bg-gray-900/50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-500">{label}</p>
            <p className="text-sm font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Achievements */}
      <div className="flex gap-3">
        <div className="flex-1 bg-gray-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-yellow-400" />
            <p className="text-xs text-gray-500">Défenses</p>
          </div>
          <p className="text-lg font-black text-yellow-400">{fighter.titleDefenses}</p>
        </div>
        <div className="flex-1 bg-gray-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Zap className="w-3 h-3 text-red-400" />
            <p className="text-xs text-gray-500">Finishes</p>
          </div>
          <p className="text-lg font-black text-red-400">{fighter.finishes}</p>
        </div>
        <div className="flex-1 bg-gray-900/50 rounded-lg p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <TrendingUp className="w-3 h-3 text-green-400" />
            <p className="text-xs text-gray-500">Win %</p>
          </div>
          <p className="text-lg font-black text-green-400">{winPct}%</p>
        </div>
      </div>

      {/* Performance Stats */}
      <div className="space-y-2.5">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">Stats de performance</p>
        <StatBar label="Précision frappe" value={fighter.stats.stracc} color={fighter.color} />
        <StatBar label="Défense frappe" value={fighter.stats.stdef} color={fighter.color} />
        <StatBar label="Précision takedown" value={fighter.stats.tdacc} color={fighter.color} />
        <StatBar label="Défense takedown" value={fighter.stats.tddef} color={fighter.color} />
      </div>

      {/* Raw Stats */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { label: 'Frappes/min', value: fighter.stats.slpm },
          { label: 'Reçues/min', value: fighter.stats.sapm },
          { label: 'Takedowns/15min', value: fighter.