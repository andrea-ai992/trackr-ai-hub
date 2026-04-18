**src/pages/Sports.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Header, Tab, TabPane, Grid, Container } from '@supabase/ui';
import { supabaseClient } from '../services/supabase';
import { getPSGMatch } from '../services/api';
import MatchCard from './MatchCard';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const Sports = () => {
  const [matches, setMatches] = useState([]);
  const [nbaStandings, setNbaStandings] = useState([]);
  const [nbaScores, setNbaScores] = useState([]);

  useEffect(() => {
    const fetchPSGMatch = async () => {
      const { data } = await getPSGMatch();
      setMatches(data);
    };
    fetchPSGMatch();
  }, []);

  useEffect(() => {
    const fetchNbaStandings = async () => {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      const data = await response.json();
      setNbaStandings(data.events);
    };
    fetchNbaStandings();
  }, []);

  useEffect(() => {
    const fetchNbaScores = async () => {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      const data = await response.json();
      setNbaScores(data.events);
    };
    fetchNbaScores();
  }, []);

  return (
    <Container className="max-w-7xl mx-auto p-4">
      <Header className="sticky top-0 bg-transparent">
        <Grid className="grid-cols-4 gap-4">
          <NavLink to="/sports/psg" className="text-lg font-bold text-green">
            PSG
          </NavLink>
          <NavLink to="/sports/nba" className="text-lg font-bold text-green">
            NBA
          </NavLink>
          <NavLink to="/sports/nfl" className="text-lg font-bold text-green">
            NFL
          </NavLink>
          <NavLink to="/sports/ufc" className="text-lg font-bold text-green">
            UFC
          </NavLink>
        </Grid>
      </Header>
      <Tab defaultActiveKey="psg" className="mt-4">
        <TabPane tab="PSG" key="psg">
          <Grid className="grid-cols-1 gap-4">
            {matches.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </Grid>
        </TabPane>
        <TabPane tab="NBA" key="nba">
          <Grid className="grid-cols-1 gap-4">
            <h2 className="text-lg font-bold text-t1">Standings</h2>
            <ul>
              {nbaStandings.map((standing) => (
                <li key={standing.id}>
                  <span className="text-t2">{standing.team.name}</span>
                  <span className="text-t2">{standing.wins} - {standing.losses}</span>
                </li>
              ))}
            </ul>
            <h2 className="text-lg font-bold text-t1">Scores</h2>
            <ul>
              {nbaScores.map((score) => (
                <li key={score.id}>
                  <span className="text-t2">{score.status.short}</span>
                  <span className="text-t2">{score.status.score}</span>
                </li>
              ))}
            </ul>
          </Grid>
        </TabPane>
        {/* Ajouter les autres tabs NFL et UFC */}
      </Tab>
    </Container>
  );
};

export default Sports;
```

**src/components/MatchCard.jsx**
```jsx
import React from 'react';
import { Grid, Container } from '@supabase/ui';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

const MatchCard = ({ match }) => {
  return (
    <Container className="bg-bg2 rounded-lg p-4">
      <Grid className="grid-cols-2 gap-4">
        <div className="flex flex-col">
          <span className="text-t1 font-bold">{match.homeTeam.name}</span>
          <span className="text-t2">{match.homeTeam.score}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-t1 font-bold">{match.awayTeam.name}</span>
          <span className="text-t2">{match.awayTeam.score}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-t1 font-bold">Heure</span>
          <span className="text-t2">{match.startTime}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-t1 font-bold">Compétition</span>
          <span className="text-t2">{match.competition.name}</span>
        </div>
      </Grid>
    </Container>
  );
};

export default MatchCard;
```

**styles/globals.css**
```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.container {
  max-width: 7xl;
  margin: 0 auto;
  padding: 4rem;
}

.header {
  position: sticky;
  top: 0;
  background-color: transparent;
}

.tab {
  margin-top: 4rem;
}

.tab-pane {
  padding: 4rem;
}

.match-card {
  background-color: var(--bg2);
  border-radius: 1rem;
  padding: 2rem;
}

.match-card .grid-cols-2 {
  gap: 2rem;
}

.match-card .flex {
  flex-direction: column;
  align-items: center;
}

.match-card .text-t1 {
  font-size: 1.5rem;
  font-weight: bold;
}

.match-card .text-t2 {
  font-size: 1rem;
  color: var(--t2);
}
```

Assurez-vous de mettre à jour votre fichier `package.json` pour inclure les dépendances nécessaires.