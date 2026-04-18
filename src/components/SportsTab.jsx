src/pages/Sports.jsx:
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FiGrid } from 'lucide-react';
import SportsTab from '../components/SportsTab';

const Sports = () => {
  const [activeTab, setActiveTab] = useState('PSG');
  const [psgMatches, setPsgMatches] = useState([]);
  const [nbaStandings, setNbaStandings] = useState([]);
  const [nbaScores, setNbaScores] = useState([]);

  useEffect(() => {
    const fetchPsgMatches = async () => {
      const response = await fetch('https://api.football-data.org/v2/teams/95/matches?status=SCHEDULED');
      const data = await response.json();
      setPsgMatches(data.matches);
    };
    fetchPsgMatches();

    const fetchNbaStandings = async () => {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/standings');
      const data = await response.json();
      setNbaStandings(data);
    };
    fetchNbaStandings();

    const fetchNbaScores = async () => {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      const data = await response.json();
      setNbaScores(data);
    };
    fetchNbaScores();
  }, []);

  return (
    <div className="sports-container" style={{ backgroundColor: 'var(--bg)' }}>
      <header className="sports-header" style={{ backgroundColor: 'var(--bg2)', borderBottom: `1px solid var(--border)` }}>
        <nav className="sports-tabs" style={{ display: 'flex', overflowX: 'auto' }}>
          <button
            className={activeTab === 'PSG' ? 'active' : ''}
            style={{ backgroundColor: 'var(--bg2)', color: 'var(--t1)', border: 'none', padding: '10px' }}
            onClick={() => setActiveTab('PSG')}
          >
            PSG
          </button>
          <button
            className={activeTab === 'NBA' ? 'active' : ''}
            style={{ backgroundColor: 'var(--bg2)', color: 'var(--t1)', border: 'none', padding: '10px' }}
            onClick={() => setActiveTab('NBA')}
          >
            NBA
          </button>
          <button
            className={activeTab === 'NFL' ? 'active' : ''}
            style={{ backgroundColor: 'var(--bg2)', color: 'var(--t1)', border: 'none', padding: '10px' }}
            onClick={() => setActiveTab('NFL')}
          >
            NFL
          </button>
          <button
            className={activeTab === 'UFC' ? 'active' : ''}
            style={{ backgroundColor: 'var(--bg2)', color: 'var(--t1)', border: 'none', padding: '10px' }}
            onClick={() => setActiveTab('UFC')}
          >
            UFC
          </button>
        </nav>
      </header>
      {activeTab === 'PSG' && (
        <SportsTab
          title="PSG"
          color="#da291c"
          matches={psgMatches}
        />
      )}
      {activeTab === 'NBA' && (
        <SportsTab
          title="NBA"
          color="#f7dc6f"
          standings={nbaStandings}
          scores={nbaScores}
        />
      )}
      {activeTab === 'NFL' && (
        <div style={{ padding: '20px', color: 'var(--t1)' }}>
          NFL
        </div>
      )}
      {activeTab === 'UFC' && (
        <div style={{ padding: '20px', color: 'var(--t1)' }}>
          UFC
        </div>
      )}
    </div>
  );
};

export default Sports;
```

src/components/SportsTab.jsx:
```jsx
import React from 'react';

const SportsTab = ({ title, color, matches, standings, scores }) => {
  return (
    <div style={{ padding: '20px', backgroundColor: 'var(--bg3)' }}>
      <h2 style={{ color: color, fontSize: '24px', marginBottom: '10px' }}>{title}</h2>
      {title === 'PSG' && (
        <div>
          <h3 style={{ color: 'var(--t1)', fontSize: '18px', marginBottom: '10px' }}>Prochain match</h3>
          {matches.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{matches[0].homeTeam.name}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{matches[0].awayTeam.name}</div>
              </div>
              <div style={{ color: 'var(--t2)', fontSize: '16px', marginBottom: '10px' }}>{matches[0].competition.name}</div>
              <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{matches[0].utcDate}</div>
            </div>
          )}
          <h3 style={{ color: 'var(--t1)', fontSize: '18px', marginBottom: '10px' }}>Derniers résultats</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {matches.slice(1, 6).map((match, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{match.homeTeam.name}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{match.score.fullTime.homeTeam}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{match.score.fullTime.awayTeam}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{match.awayTeam.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
      {title === 'NBA' && (
        <div>
          <h3 style={{ color: 'var(--t1)', fontSize: '18px', marginBottom: '10px' }}>Standings</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {standings.length > 0 && standings.map((team, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{team.team.name}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{team.stats[0].displayValue}</div>
              </div>
            ))}
          </div>
          <h3 style={{ color: 'var(--t1)', fontSize: '18px', marginBottom: '10px' }}>Scores du jour</h3>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {scores.length > 0 && scores.map((game, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{game.competitions[0].competitors[0].team.displayName}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{game.competitions[0].competitors[0].score}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{game.competitions[0].competitors[1].score}</div>
                <div style={{ color: 'var(--t2)', fontSize: '16px' }}>{game.competitions[0].competitors[1].team.displayName}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SportsTab;