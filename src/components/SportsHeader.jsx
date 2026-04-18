**src/components/SportsHeader.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

const SportsHeader = () => {
  const isMobile = useMediaQuery({
    query: '(max-width: 768px)',
  });

  return (
    <header className="sports-header">
      <div className="container">
        <div className="tabs">
          <Link to="/sports/psg" className="tab">
            PSG
          </Link>
          <Link to="/sports/nba" className="tab">
            NBA
          </Link>
          <Link to="/sports/nfl" className="tab">
            NFL
          </Link>
          <Link to="/sports/ufc" className="tab">
            UFC
          </Link>
        </div>
      </div>
    </header>
  );
};

export default SportsHeader;
```

**src/pages/Sports.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import SportsHeader from '../components/SportsHeader';
import Lucide from 'lucide-react';
import axios from 'axios';

const Sports = () => {
  const params = useParams();
  const [sportsData, setSportsData] = useState({});
  const [nextMatch, setNextMatch] = useState({});
  const [lastResults, setLastResults] = useState([]);

  useEffect(() => {
    const fetchSportsData = async () => {
      const response = await axios.get(`https://site.api.espn.com/apis/site/v2/sports/football/france/1/livescore`);
      setSportsData(response.data);
      const nextMatchData = response.data.events[0];
      setNextMatch({
        team1: nextMatchData.competitions[0].competitors[0].team.name,
        team2: nextMatchData.competitions[0].competitors[1].team.name,
        time: nextMatchData.date,
        competition: nextMatchData.competitions[0].name,
      });
      const lastResultsData = response.data.events.slice(1, 6);
      setLastResults(lastResultsData.map((match) => ({
        team1: match.competitions[0].competitors[0].team.name,
        team2: match.competitions[0].competitors[1].team.name,
        score: match.score.fullTime.score,
      })));
    };
    fetchSportsData();
  }, []);

  useEffect(() => {
    if (params.sport === 'nba') {
      const fetchNbaData = async () => {
        const response = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
        setSportsData(response.data);
      };
      fetchNbaData();
    }
  }, [params.sport]);

  return (
    <div className="sports-page">
      <SportsHeader />
      <div className="container">
        {params.sport === 'psg' && (
          <div className="next-match">
            <h2>Prochain match</h2>
            <div className="match-info">
              <p>
                {nextMatch.team1} vs {nextMatch.team2} - {nextMatch.competition}
              </p>
              <p>
                {nextMatch.time}
              </p>
            </div>
            <h2>Derniers résultats</h2>
            <ul>
              {lastResults.map((result, index) => (
                <li key={index}>
                  <p>
                    {result.team1} vs {result.team2} - {result.score}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        {params.sport === 'nba' && (
          <div className="nba-page">
            <h2>Standings</h2>
            <table>
              <thead>
                <tr>
                  <th>Équipe</th>
                  <th>Victoires</th>
                  <th>Défaites</th>
                </tr>
              </thead>
              <tbody>
                {sportsData.events.map((event, index) => (
                  <tr key={index}>
                    <td>{event.competitions[0].competitors[0].team.name}</td>
                    <td>{event.score.fullTime.score}</td>
                    <td>{event.score.fullTime.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <h2>Score du jour</h2>
            <ul>
              {sportsData.events.map((event, index) => (
                <li key={index}>
                  <p>
                    {event.competitions[0].competitors[0].team.name} vs {event.competitions[0].competitors[1].team.name} - {event.score.fullTime.score}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sports;
```

**src/pages/Sports.css**
```css
.sports-page {
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.sports-header {
  background-color: var(--bg2);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab {
  color: var(--t2);
  text-decoration: none;
  transition: color 0.2s ease;
}

.tab:hover {
  color: var(--green);
}

.next-match {
  background-color: var(--bg3);
  padding: 2rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
}

.match-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.nba-page {
  background-color: var(--bg3);
  padding: 2rem;
  border: 1px solid var(--border);
  border-radius: 1rem;
}

table {
  border-collapse: collapse;
  width: 100%;
}

th, td {
  border: 1px solid var(--border);
  padding: 1rem;
  text-align: left;
}

th {
  background-color: var(--bg);
}

@media (max-width: 768px) {
  .sports-header {
    flex-direction: column;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    margin-bottom: 1rem;
  }
}
```

**src/components/SportsHeader.css**
```css
.sports-header {
  background-color: var(--bg2);
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab {
  color: var(--t2);
  text-decoration: none;
  transition: color 0.2s ease;
}

.tab:hover {
  color: var(--green);
}

@media (max-width: 768px) {
  .sports-header {
    flex-direction: column;
  }

  .tabs {
    flex-direction: column;
  }

  .tab {
    margin-bottom: 1rem;
  }
}