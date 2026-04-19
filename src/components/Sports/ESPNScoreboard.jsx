// src/components/Sports/ESPNScoreboard.jsx
import { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

const ESPNScoreboard = ({ sport }) => {
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        let url = '';
        if (sport === 'nba') {
          url = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
        } else if (sport === 'nfl') {
          url = 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard';
        } else {
          setGames([]);
          setLoading(false);
          return;
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Failed to fetch');
        const data = await response.json();
        setGames(data.events || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        setGames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [sport]);

  const getTeamColor = (team) => {
    const colors = {
      'Lakers': { bg: '#552583', text: '#fdb927' },
      'Celtics': { bg: '#007A33', text: '#BA9653' },
      'Warriors': { bg: '#1D428A', text: '#FDB927' },
      '76ers': { bg: '#006BB6', text: '#ED174C' },
      'Nuggets': { bg: '#0E2240', text: '#FDB827' },
      'Heat': { bg: '#98002E', text: '#F9A01B' },
      'Bucks': { bg: '#00477D', text: '#EEE' },
      'Mavericks': { bg: '#00538C', text: '#B8C4CA' },
      'Clippers': { bg: '#C8102E', text: '#1D428A' },
      'Knicks': { bg: '#F58426', text: '#006BB6' },
      'Bulls': { bg: '#CE1141', text: '#FFFFFF' },
      'Nets': { bg: '#000000', text: '#FFFFFF' },
      'Raptors': { bg: '#CE1141', text: '#FFFFFF' },
      'Spurs': { bg: '#C4CED4', text: '#000000' },
      'Jazz': { bg: '#002B5C', text: '#F9A01B' },
      'Thunder': { bg: '#007AC1', text: '#EF3B24' },
      'Hawks': { bg: '#E03A3E', text: '#C1D32F' },
      'Pelicans': { bg: '#0C2340', text: '#C8102E' },
      'Timberwolves': { bg: '#0C2340', text: '#236192' },
      'Magic': { bg: '#0077C0', text: '#C4CED4' },
      'Pacers': { bg: '#002D62', text: '#FDBB30' },
      'Cavaliers': { bg: '#6F263D', text: '#041E42' },
      'Wizards': { bg: '#002B5C', text: '#C4A000' },
      'Hornets': { bg: '#00788C', text: '#1D1160' },
      'Kings': { bg: '#5A2D82', text: '#72A2C0' },
      'Trail Blazers': { bg: '#E03A3E', text: '#000000' },
      'Grizzlies': { bg: '#5D76A9', text: '#F5B110' },
      'Suns': { bg: '#1D1160', text: '#E56020' },
      'Pistons': { bg: '#006BB6', text: '#C8102E' },
      'Rockets': { bg: '#CE1141', text: '#C4CED4' },
      'Bengals': { bg: '#FB4F14', text: '#000000' },
      'Bills': { bg: '#00338D', text: '#C60C30' },
      'Chiefs': { bg: '#E31837', text: '#FFB612' },
      'Dolphins': { bg: '#008E97', text: '#FC4C02' },
      'Patriots': { bg: '#002244', text: '#C60C30' },
      'Steelers': { bg: '#101820', text: '#FFB612' },
      'Packers': { bg: '#203731', text: '#FFB612' },
      '49ers': { bg: '#AA0000', text: '#B3995D' },
      'Cowboys': { bg: '#003594', text: '#869397' },
      'Eagles': { bg: '#004C54', text: '#A5ACAF' },
      'Giants': { bg: '#0B2265', text: '#A71930' },
      'Jets': { bg: '#125740', text: '#FFFFFF' },
      'Ravens': { bg: '#241773', text: '#9E7C0C' },
      'Seahawks': { bg: '#002244', text: '#69BE28' },
      'Texans': { bg: '#03202F', text: '#A71930' },
      'Bears': { bg: '#C83803', text: '#0B162A' },
      'Browns': { bg: '#311D00', text: '#FF3C00' },
      'Colts': { bg: '#002C5F', text: '#A2AAAD' },
      'Lions': { bg: '#0076B6', text: '#B0B7BC' },
      'Panthers': { bg: '#0085CA', text: '#101820' },
      'Commanders': { bg: '#5A1414', text: '#FFB612' },
      'Falcons': { bg: '#A71930', text: '#000000' },
      'Rams': { bg: '#003594', text: '#866D4B' },
      'Saints': { bg: '#D3BC8D', text: '#101820' },
      'Buccaneers': { bg: '#D50A0A', text: '#FF7900' },
      'Titans': { bg: '#002A5C', text: '#4B92DB' },
      'Chargers': { bg: '#002A5C', text: '#FFC20E' },
      'Cardinals': { bg: '#97233F', text: '#000000' },
      'Jaguars': { bg: '#006778', text: '#D7A22A' },
      'Raiders': { bg: '#000000', text: '#A5ACAF' },
      'Dallas': { bg: '#003594', text: '#869397' },
      'Arizona': { bg: '#97233F', text: '#000000' },
      'Atlanta': { bg: '#A71930', text: '#000000' },
      'Carolina': { bg: '#0085CA', text: '#101820' },
      'Chicago': { bg: '#C83803', text: '#0B162A' },
      'Cincinnati': { bg: '#FB4F14', text: '#000000' },
      'Cleveland': { bg: '#311D00', text: '#FF3C00' },
      'Denver': { bg: '#0E2240', text: '#FDB827' },
      'Detroit': { bg: '#0076B6', text: '#B0B7BC' },
      'Green Bay': { bg: '#203731', text: '#FFB612' },
      'Houston': { bg: '#C8102E', text: '#C4CED4' },
      'Indianapolis': { bg: '#002C5F', text: '#A2AAAD' },
      'Jacksonville': { bg: '#006778', text: '#D7A22A' },
      'Kansas City': { bg: '#E31837', text: '#FFB612' },
      'Las Vegas': { bg: '#000000', text: '#A5ACAF' },
      'Los Angeles': { bg: '#003594', text: '#869397' },
      'Miami': { bg: '#008E97', text: '#FC4C02' },
      'Minnesota': { bg: '#4F2683', text: '#FFC62F' },
      'New England': { bg: '#002244', text: '#C60C30' },
      'New Orleans': { bg: '#D3BC8D', text: '#101820' },
      'NY Giants': { bg: '#0B2265', text: '#A71930' },
      'NY Jets': { bg: '#125740', text: '#FFFFFF' },
      'Philadelphia': { bg: '#004C54', text: '#A5ACAF' },
      'Pittsburgh': { bg: '#101820', text: '#FFB612' },
      'San Francisco': { bg: '#AA0000', text: '#B3995D' },
      'Seattle': { bg: '#002244', text: '#69BE28' },
      'Tampa Bay': { bg: '#D50A0A', text: '#FF7900' },
      'Tennessee': { bg: '#002A5C', text: '#4B92DB' },
      'Washington': { bg: '#5A1414', text: '#FFB612' },
    };
    return colors[team] || { bg: '#1a1a1a', text: '#e0e0e0' };
  };

  if (loading) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <div className="animate-pulse text-neon text-sm">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <div className="text-neon text-sm">Error: {error}</div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="w-full h-[200px] flex items-center justify-center">
        <div className="text-neon text-sm">No games today</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-3">
      {games.map((game) => {
        const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
        const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
        const homeColor = getTeamColor(homeTeam.team.shortDisplayName);
        const awayColor = getTeamColor(awayTeam.team.shortDisplayName);
        const status = game.status.type.name;
        const isFinal = status === 'STATUS_FINAL';
        const isLive = status === 'STATUS_IN_PROGRESS';
        const homeScore = homeTeam.score;
        const awayScore = awayTeam.score;

        return (
          <div
            key={game.id}
            className="w-full p-3 rounded-lg border border-border bg-surface flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{new Date(game.date).toLocaleDateString()}</span>
              <span>{game.competitions[0].venue.fullName}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: awayColor.bg, color: awayColor.text }}
                >
                  {awayTeam.team.abbreviation}
                </div>
                <span className="text-text-primary font-medium">{awayTeam.team.shortDisplayName}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-lg font-bold">
                  {isFinal ? homeScore : isLive ? 'Live' : homeScore}
                </span>
                <span className="text-xs text-text-secondary">vs</span>
                <span className="text-lg font-bold">
                  {isFinal ? awayScore : isLive ? 'Live' : awayScore}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ backgroundColor: homeColor.bg, color: homeColor.text }}
                >
                  {homeTeam.team.abbreviation}
                </div>
                <span className="text-text-primary font-medium">{homeTeam.team.shortDisplayName}</span>
              </div>
            </div>
            {isLive && (
              <div className="w-full h-1 bg-neon rounded-full animate-pulse"></div>
            )}
            <div className="flex items-center justify-between text-xs text-text-secondary">
              <span>{game.competitions[0].name}</span>
              <span>{game.competitions[0].notes[0]?.headline || ''}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ESPNScoreboard;