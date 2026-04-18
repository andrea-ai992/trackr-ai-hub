src/components/Sports/LiveScoreCard.jsx
```jsx
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const LiveScoreCard = ({
  sport,
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  homeLogo,
  awayLogo,
  time,
  status,
  league,
  isExpanded,
  onToggleExpand
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (status === 'LIVE') {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const getTeamColors = () => {
    switch (sport) {
      case 'PSG':
        return {
          home: '#004d9f',
          away: '#ffffff',
          border: 'rgba(0, 77, 159, 0.8)'
        };
      case 'NBA':
        return {
          home: '#c8102e',
          away: '#006bb6',
          border: 'rgba(200, 16, 46, 0.8)'
        };
      case 'NFL':
        return {
          home: '#d52b1e',
          away: '#00338d',
          border: 'rgba(213, 43, 30, 0.8)'
        };
      case 'UFC':
        return {
          home: '#000000',
          away: '#228B22',
          border: 'rgba(0, 0, 0, 0.8)'
        };
      default:
        return {
          home: 'var(--t1)',
          away: 'var(--t1)',
          border: 'var(--border)'
        };
    }
  };

  const colors = getTeamColors();

  return (
    <div
      className="w-full max-w-sm mx-auto mb-3 rounded-xl overflow-hidden border"
      style={{
        borderColor: colors.border,
        backgroundColor: 'var(--bg2)'
      }}
    >
      <div
        className="p-3 cursor-pointer"
        onClick={onToggleExpand}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={homeLogo}
              alt={`${homeTeam} logo`}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-lg" style={{ color: colors.home }}>
              {homeTeam}
            </span>
          </div>

          <div className="text-center">
            <div className={`text-2xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
              {homeScore}
            </div>
            <div className="text-xs text-t3">vs</div>
            <div className={`text-2xl font-bold ${isAnimating ? 'animate-pulse' : ''}`}>
              {awayScore}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <img
              src={awayLogo}
              alt={`${awayTeam} logo`}
              className="w-8 h-8 rounded-full object-cover"
            />
            <span className="font-semibold text-lg" style={{ color: colors.away }}>
              {awayTeam}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-t2">
          <span>{league}</span>
          <span className={status === 'LIVE' ? 'text-green animate-pulse' : ''}>
            {status === 'LIVE' ? 'EN DIRECT' : time}
          </span>
        </div>
      </div>

      {isExpanded && (
        <div className="px-3 pb-3 text-xs text-t2">
          <div className="flex justify-between">
            <span>Période: {status === 'LIVE' ? 'En cours' : status}</span>
            <span>Statistiques</span>
          </div>
          <div className="mt-2 h-16 bg-bg2 rounded p-2 flex items-center justify-center">
            <span className="text-t3">Graphique des stats</span>
          </div>
        </div>
      )}

      <button
        className="w-full p-2 bg-bg3 hover:bg-bg transition-colors"
        onClick={onToggleExpand}
      >
        {isExpanded ? (
          <ChevronUp size={20} className="mx-auto" style={{ color: 'var(--green)' }} />
        ) : (
          <ChevronDown size={20} className="mx-auto" style={{ color: 'var(--green)' }} />
        )}
      </button>
    </div>
  );
};

export default LiveScoreCard;
```

src/components/Sports/Sports.jsx
```jsx
import { useState, useEffect } from 'react';
import { ChevronRight, Search, Trophy, Clock, TrendingUp, Fist } from 'lucide-react';
import LiveScoreCard from './LiveScoreCard';

const sportsData = {
  psg: {
    name: 'PSG',
    color: '#004d9f',
    leagues: ['Ligue 1', 'Coupe de France', 'Ligue des Champions'],
    liveMatches: [
      {
        homeTeam: 'PSG',
        awayTeam: 'Olympique de Marseille',
        homeScore: '2',
        awayScore: '1',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c1/Logo_PSG.svg/1200px-Logo_PSG.svg.png',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/5/5c/Olympique_de_Marseille_logo.svg/1200px-Olympique_de_Marseille_logo.svg.png',
        time: '85\'',
        status: 'LIVE',
        league: 'Ligue 1'
      },
      {
        homeTeam: 'PSG',
        awayTeam: 'Real Madrid',
        homeScore: '1',
        awayScore: '1',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c1/Logo_PSG.svg/1200px-Logo_PSG.svg.png',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/4/4f/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png',
        time: 'Mi-temps',
        status: 'HT',
        league: 'Ligue des Champions'
      }
    ]
  },
  nba: {
    name: 'NBA',
    color: '#c8102e',
    leagues: ['NBA Regular Season', 'Playoffs'],
    liveMatches: [
      {
        homeTeam: 'Lakers',
        awayTeam: 'Warriors',
        homeScore: '102',
        awayScore: '98',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/3/3c/Lakers_logo.svg/1200px-Lakers_logo.svg.png',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/5/56/Golden_State_Warriors_logo.svg/1200px-Golden_State_Warriors_logo.svg.png',
        time: '4th QTR 2:34',
        status: 'LIVE',
        league: 'NBA Regular Season'
      }
    ]
  },
  nfl: {
    name: 'NFL',
    color: '#d52b1e',
    leagues: ['NFL Regular Season', 'Playoffs'],
    liveMatches: [
      {
        homeTeam: 'Chiefs',
        awayTeam: '49ers',
        homeScore: '28',
        awayScore: '24',
        homeLogo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/8/8d/Kansas_City_Chiefs_logo.svg/1200px-Kansas_City_Chiefs_logo.svg.png',
        awayLogo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/San_Francisco_49ers_logo.svg/1200px-San_Francisco_49ers_logo.svg.png',
        time: 'Q4 12:45',
        status: 'LIVE',
        league: 'NFL Regular Season'
      }
    ]
  },
  ufc: {
    name: 'UFC',
    color: '#000000',
    leagues: ['UFC Main Card', 'Prelims'],
    liveMatches: [
      {
        homeTeam: 'Islam Makhachev',
        awayTeam: 'Alexander Volkanovski',
        homeScore: '12',
        awayScore: '11',
        homeLogo: 'https://example.com/ufc_logo.png',
        awayLogo: 'https://example.com/ufc_logo.png',
        time: 'Round 3 4:12',
        status: 'LIVE',
        league: 'UFC Main Event'
      }
    ]
  }
};

const Sports = () => {
  const [activeSport, setActiveSport] = useState('psg');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCards, setExpandedCards] = useState({});
  const [sportsDataState, setSportsDataState] = useState(sportsData);

  const toggleExpandCard = (sportKey, matchIndex) => {
    setExpandedCards(prev => ({
      ...prev,
      [`${sportKey}-${matchIndex}`]: !prev[`${sportKey}-${matchIndex}`]
    }));
  };

  const filteredSports = Object.entries(sportsDataState).filter(([key, sport]) =>
    sport.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sport.leagues.some(league => league.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: 'var(--bg)', fontFamily: 'Inter, sans-serif' }}>
      <header className="p-4 border-b border-border">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--green)' }}>Sports en direct</h1>
      </header>

      <div className="p-4">
        <div className="relative mb-6">
          <Search
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-t2"
          />
          <input
            type="text"
            placeholder="Rechercher un sport ou une ligue..."
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-bg2 border border-border focus:outline-none focus:border-green transition-colors"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ color: 'var(--t1)' }}
          />
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {Object.entries(sportsDataState).map(([key, sport]) => (
            <button
              key={key}
              className={`px-4 py-2 rounded-full flex items-center gap-2 whitespace-nowrap transition-all ${
                activeSport === key ? 'bg-green text-black font-semibold' : 'bg-bg2 hover:bg-bg3'
              }`}
              onClick={() => setActiveSport(key)}
              style={{
                backgroundColor: activeSport === key ? 'var(--green)' : 'var(--bg2)',
                color: activeSport === key ? '#000' : 'var(--t1)'
              }}
            >
              {key === 'psg' && <Trophy size={16} />}
              {key === 'nba' && <TrendingUp size={16} />}
              {key === 'nfl' && <Trophy size={16} />}
              {key === 'ufc' && <Fist size={16} />}
              {sport.name}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {sportsDataState[activeSport].liveMatches.map((match, index) => (
            <LiveScoreCard
              key={`${activeSport}-${index}`}
              sport={activeSport.toUpperCase()}
              {...match}
              isExpanded={expandedCards[`${activeSport}-${index}`] || false}
              onToggleExpand={() => toggleExpandCard(activeSport, index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Sports;