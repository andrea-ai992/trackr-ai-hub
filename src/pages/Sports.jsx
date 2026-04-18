import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Sports.css';

const Sports = () => {
  const [activeTab, setActiveTab] = useState('PSG');
  const [psgData, setPsgData] = useState([]);
  const [nbaData, setNbaData] = useState([]);
  const [nflData, setNflData] = useState([]);
  const [ufcData, setUfcData] = useState([]);

  useEffect(() => {
    fetchPsgData();
    fetchNbaData();
    fetchNflData();
    fetchUfcData();
  }, []);

  const fetchPsgData = async () => {
    // Fetch PSG data from your API or source
    // Example data structure
    setPsgData([
      {
        match: 'PSG vs Lyon',
        time: '21:00',
        competition: 'Ligue 1',
        result: 'W',
      },
      // Add more match results
    ]);
  };

  const fetchNbaData = async () => {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
    const data = await response.json();
    setNbaData(data.events);
  };

  const fetchNflData = async () => {
    const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard');
    const data = await response.json();
    setNflData(data.events);
  };

  const fetchUfcData = async () => {
    // Fetch UFC data from your API or source
    // Example data structure
    setUfcData([
      {
        event: 'UFC 264',
        fights: [
          { fighter1: 'McGregor', fighter2: 'Poirier' },
          // Add more fights
        ],
      },
    ]);
  };

  return (
    <div className="sports-container">
      <header className="sports-header">
        <div className="tabs">
          {['PSG', 'NBA', 'NFL', 'UFC'].map((tab) => (
            <div
              key={tab}
              className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>
      </header>
      <div className="content">
        {activeTab === 'PSG' && (
          <div className="psg-content">
            {psgData.map((match, index) => (
              <div key={index} className="match-card">
                <div className="match-info">
                  <span>{match.match}</span>
                  <span>{match.time}</span>
                  <span>{match.competition}</span>
                </div>
                <span className={`result ${match.result}`}>{match.result}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'NBA' && (
          <div className="nba-content">
            {nbaData.map((event, index) => (
              <div key={index} className="team-card">
                <span>{event.name}</span>
                <span>{event.date}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'NFL' && (
          <div className="nfl-content">
            {nflData.map((event, index) => (
              <div key={index} className="team-card">
                <span>{event.name}</span>
                <span>{event.date}</span>
              </div>
            ))}
          </div>
        )}
        {activeTab === 'UFC' && (
          <div className="ufc-content">
            {ufcData.map((event, index) => (
              <div key={index} className="event-card">
                <span>{event.event}</span>
                {event.fights.map((fight, idx) => (
                  <div key={idx} className="fight">
                    <span>{fight.fighter1} vs {fight.fighter2}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sports;

import './Sports.css';

.sports-container {
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  padding: 16px;
}

.sports-header {
  position: sticky;
  top: 0;
  background-color: var(--bg2);
  z-index: 10;
}

.tabs {
  display: flex;
  overflow-x: auto;
  padding: 8px 0;
}

.tab {
  flex: 0 0 auto;
  padding: 12px 16px;
  cursor: pointer;
  transition: background-color 200ms;
}

.tab.active {
  background-color: var(--green);
  color: var(--bg);
}

.content {
  margin-top: 16px;
}

.match-card, .team-card, .event-card {
  background-color: var(--bg3);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.result {
  font-weight: bold;
}

.result.W {
  color: green;
}

.result.D {
  color: yellow;
}

.result.L {
  color: red;
}

.fight {
  margin-top: 8px;
}