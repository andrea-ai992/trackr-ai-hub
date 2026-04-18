**src/pages/Sports.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Header, Tab, TabList, TabPanel, TabPanels, Tabs } from '@supabase/ui';
import { supabaseClient } from '../Dashboard/server';
import SportsHeader from './SportsHeader';
import PSG from './PSG';
import NBA from './NBA';
import NFL from './NFL';
import UFC from './UFC';

function Sports() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PSG');

  useEffect(() => {
    const currentTab = location.pathname.split('/').pop();
    setActiveTab(currentTab);
  }, [location]);

  return (
    <Container>
      <SportsHeader activeTab={activeTab} />
      <Tabs defaultIndex={0} onChange={(index) => setActiveTab(Object.keys(Tabs)[index])}>
        <TabList>
          <Tab>PSG</Tab>
          <Tab>NBA</Tab>
          <Tab>NFL</Tab>
          <Tab>UFC</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <PSG />
          </TabPanel>
          <TabPanel>
            <NBA />
          </TabPanel>
          <TabPanel>
            <NFL />
          </TabPanel>
          <TabPanel>
            <UFC />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  );
}

export default Sports;
```

**src/components/SportsHeader.jsx**
```jsx
import React from 'react';
import { styled } from 'styled-components';
import { Container, Header, Tab, TabList, TabPanels, Tabs } from '@supabase/ui';

const StyledHeader = styled(Header)`
  position: sticky;
  top: 0;
  background-color: var(--bg);
  color: var(--t1);
  z-index: 1;
`;

const StyledTabs = styled(Tabs)`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
`;

const StyledTab = styled(Tab)`
  margin: 0 1rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  transition: background-color 200ms ease-in-out;
  background-color: var(--bg2);
  color: var(--t2);
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;

  &.active {
    background-color: var(--green);
    color: var(--t1);
  }
`;

function SportsHeader({ activeTab }) {
  return (
    <StyledHeader>
      <StyledTabs>
        <StyledTab active={activeTab === 'PSG'} onClick={() => console.log('PSG')}>PSG</StyledTab>
        <StyledTab active={activeTab === 'NBA'} onClick={() => console.log('NBA')}>NBA</StyledTab>
        <StyledTab active={activeTab === 'NFL'} onClick={() => console.log('NFL')}>NFL</StyledTab>
        <StyledTab active={activeTab === 'UFC'} onClick={() => console.log('UFC')}>UFC</StyledTab>
      </StyledTabs>
    </StyledHeader>
  );
}

export default SportsHeader;
```

**src/components/PSG.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import { supabaseClient } from '../Dashboard/server';

function PSG() {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchNextMatch = async () => {
      const { data: nextMatch } = await supabaseClient
        .from('matches')
        .select('team1, team2, date, competition')
        .eq('team1', 'PSG')
        .order('date', { ascending: false })
        .limit(1);
      setData(nextMatch);
    };
    fetchNextMatch();
  }, []);

  return (
    <div>
      <h2>Prochain match</h2>
      {data && (
        <div>
          <img src={data.team1.logo} alt={data.team1.name} />
          <span>{data.date}</span>
          <img src={data.competition.badge} alt={data.competition.name} />
          <img src={data.team2.logo} alt={data.team2.name} />
        </div>
      )}
      <h2>5 derniers résultats</h2>
      {/* Ajouter code pour afficher les 5 derniers résultats */}
    </div>
  );
}

export default PSG;
```

**src/components/NBA.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NBA() {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      const response = await axios.get('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      setScores(response.data);
    };
    fetchScores();
  }, []);

  return (
    <div>
      <h2>Scores du jour</h2>
      {scores && (
        <ul>
          {scores.events.map((event) => (
            <li key={event.id}>
              <img src={event.participants[0].team.logo} alt={event.participants[0].team.name} />
              <span>{event.status.short}</span>
              <img src={event.participants[1].team.logo} alt={event.participants[1].team.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NBA;
```

**src/components/NFL.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function NFL() {
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const fetchScores = async () => {
      const response = await axios.get('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
      setScores(response.data);
    };
    fetchScores();
  }, []);

  return (
    <div>
      <h2>Scores du jour</h2>
      {scores && (
        <ul>
          {scores.events.map((event) => (
            <li key={event.id}>
              <img src={event.participants[0].team.logo} alt={event.participants[0].team.name} />
              <span>{event.status.short}</span>
              <img src={event.participants[1].team.logo} alt={event.participants[1].team.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default NFL;
```

**src/components/UFC.jsx**
```jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function UFC() {
  const [nextEvent, setNextEvent] = useState(null);

  useEffect(() => {
    const fetchNextEvent = async () => {
      const response = await axios.get('https://api.sportradar.us/mma2/trial/v7/en/schedules/next.json?api_key=YOUR_API_KEY');
      setNextEvent(response.data);
    };
    fetchNextEvent();
  }, []);

  return (
    <div>
      <h2>Prochain événement</h2>
      {nextEvent && (
        <div>
          <img src={nextEvent.main_card_fights[0].competitors[0].image} alt={nextEvent.main_card_fights[0].competitors[0].name} />
          <span>{nextEvent.main_card_fights[0].competitors[0].name}</span>
          <img src={nextEvent.main_card_fights[0].competitors[1].image} alt={nextEvent.main_card_fights[0].competitors[1].name} />
          <span>{nextEvent.main_card_fights[0].competitors[1].name}</span>
        </div>
      )}
    </div>
  );
}

export default UFC;
```

Notez que vous devrez remplacer `YOUR_API_KEY` par votre clé API Sportradar.