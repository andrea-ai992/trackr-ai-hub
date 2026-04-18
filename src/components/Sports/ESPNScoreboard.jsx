// src/components/Sports/ESPNScoreboard.jsx
import { useEffect, useState } from 'react';
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
        if (!response.ok) throw new Error('Failed to fetch data');
        const data = await response.json();
        setGames(data.events || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, [sport]);

  if (loading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse text-text-secondary">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-neon">
        Error: {error}
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="p-4 text-center text-text-secondary">
        No games available
      </div>
    );
  }

  const getTeamLogo = (teamName) => {
    const teamLogos = {
      'Lakers': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/lakers.png',
      'Celtics': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/celtics.png',
      'Warriors': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/warriors.png',
      'Bulls': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/bulls.png',
      'Heat': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/heat.png',
      'Nuggets': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nba/500/nuggets.png',
      'Buccaneers': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/tb.png',
      'Chiefs': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/kc.png',
      '49ers': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/sf.png',
      'Cowboys': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/dal.png',
      'Patriots': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/ne.png',
      'Steelers': 'https://a.espncdn.com/combiner/i?img=/i/teamlogos/nfl/500/pit.png',
    };
    return teamLogos[teamName] || '';
  };

  const getTeamColor = (teamName) => {
    const teamColors = {
      'Lakers': '#fdb927',
      'Celtics': '#007a33',
      'Warriors': '#1d428a',
      'Bulls': '#ce1141',
      'Heat': '#98002e',
      'Nuggets': '#002868',
      'Buccaneers': '#d50a0a',
      'Chiefs': '#e31837',
      '49ers': '#aa0000',
      'Cowboys': '#003594',
      'Patriots': '#002244',
      'Steelers': '#ffb612',
    };
    return teamColors[teamName] || '#00ff88';
  };

  return (
    <div className="w-full">
      {games.map((game, index) => {
        const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
        const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
        const isGameLive = game.status.type.name === 'in';
        const isGameOver = game.status.type.name === 'post';

        return (
          <div
            key={game.id}
            className={`w-full p-3 mb-2 rounded-lg border border-border ${index === 0 ? 'mt-0' : ''}`}
            style={{ borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-text-secondary font-mono">
                {new Date(game.date).toLocaleString()}
              </div>
              <div className="text-xs text-text-secondary font-mono">
                {game.competitions[0].venue.fullName}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {awayTeam && (
                  <>
                    <img
                      src={getTeamLogo(awayTeam.team.displayName)}
                      alt={awayTeam.team.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                    <div className="text-lg font-bold" style={{ color: getTeamColor(awayTeam.team.displayName) }}>
                      {awayTeam.team.displayName}
                    </div>
                  </>
                )}
              </div>

              <div className="flex flex-col items-center mx-2">
                {isGameLive ? (
                  <div className="text-xs text-neon mb-1">LIVE</div>
                ) : isGameOver ? (
                  <div className="text-xs text-text-secondary mb-1">FINAL</div>
                ) : (
                  <div className="text-xs text-text-secondary mb-1">
                    {new Date(game.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                <div className="text-lg font-bold">
                  {isGameOver ? (
                    <>
                      <span style={{ color: getTeamColor(awayTeam.team.displayName) }}>
                        {awayTeam.score}
                      </span>
                      {' '}-{' '}
                      <span style={{ color: getTeamColor(homeTeam.team.displayName) }}>
                        {homeTeam.score}
                      </span>
                    </>
                  ) : (
                    'VS'
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {homeTeam && (
                  <>
                    <div className="text-lg font-bold" style={{ color: getTeamColor(homeTeam.team.displayName) }}>
                      {homeTeam.team.displayName}
                    </div>
                    <img
                      src={getTeamLogo(homeTeam.team.displayName)}
                      alt={homeTeam.team.displayName}
                      className="w-10 h-10 rounded-full"
                    />
                  </>
                )}
              </div>
            </div>

            {game.competitions[0].notes && (
              <div className="mt-2 text-xs text-text-secondary font-mono">
                {game.competitions[0].notes[0].headline}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ESPNScoreboard;