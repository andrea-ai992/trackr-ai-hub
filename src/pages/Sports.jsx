Je vais créer un composant réutilisable pour les onglets horizontaux avec animations fluides et l'intégrer dans la page Sports.

Fichier: src/components/SportsTabs.jsx
```jsx
import React, { useState, useEffect } from 'react';
import './SportsTabs.css';

const SPORTS_TABS = [
  { id: 'PSG', label: 'PSG' },
  { id: 'NBA', label: 'NBA' },
  { id: 'NFL', label: 'NFL' },
  { id: 'UFC', label: 'UFC' }
];

const SportsTabs = ({ activeTab, onTabChange }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <div className="sports-tabs-container">
      <div className="sports-tabs">
        {SPORTS_TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            aria-label={`Afficher les matchs ${tab.label}`}
          >
            <span className="tab-label">{tab.label}</span>
            {activeTab === tab.id && (
              <motionIndicator
                className="motion-indicator"
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

const MotionIndicator = ({ className, ...props }) => {
  return <div className={className} {...props} />;
};

export default SportsTabs;
```

Fichier: src/components/SportsTabs.css
```css
.sports-tabs-container {
  width: 100%;
  padding: 0 16px;
  margin-bottom: 24px;
}

.sports-tabs {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.sports-tabs::-webkit-scrollbar {
  display: none;
}

.tab-button {
  position: relative;
  flex: 1;
  min-width: 0;
  padding: 12px 16px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--t2);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
}

.tab-button:hover:not(.active) {
  background-color: var(--bg3);
  border-color: var(--border-hi);
}

.tab-button.active {
  background-color: var(--bg);
  border-color: var(--green);
  color: var(--t1);
  box-shadow: 0 0 0 1px var(--green);
}

.tab-label {
  display: inline-block;
  position: relative;
  z-index: 1;
}

.motion-indicator {
  position: absolute;
  bottom: -1px;
  left: 0;
  height: 2px;
  background-color: var(--green);
  border-radius: 1px;
  z-index: 0;
}
```

Fichier: src/pages/Sports.jsx
```jsx
import React, { useState, useEffect } from 'react';
import './Sports.css';
import SportsTabs from '../components/SportsTabs';

const Sports = () => {
  const [activeTab, setActiveTab] = useState('PSG');
  const [psgData, setPsgData] = useState([]);
  const [nbaData, setNbaData] = useState([]);
  const [nflData, setNflData] = useState([]);
  const [ufcData, setUfcData] = useState([]);
  const [liveScores, setLiveScores] = useState({
    psg: null,
    nba: null,
    nfl: null,
    ufc: null
  });
  const [animated, setAnimated] = useState(false);

  const updateLiveScores = () => {
    setAnimated(true);
    setTimeout(() => setAnimated(false), 300);
  };

  useEffect(() => {
    const fetchSportsData = async () => {
      try {
        const [psgRes, nbaRes, nflRes, ufcRes] = await Promise.all([
          fetch('/api/sports/psg'),
          fetch('/api/sports/nba'),
          fetch('/api/sports/nfl'),
          fetch('/api/sports/ufc')
        ]);

        const [psgData, nbaData, nflData, ufcData] = await Promise.all([
          psgRes.json(),
          nbaRes.json(),
          nflRes.json(),
          ufcRes.json()
        ]);

        setPsgData(psgData);
        setNbaData(nbaData);
        setNflData(nflData);
        setUfcData(ufcData);
      } catch (error) {
        console.error('Error fetching sports data:', error);
      }
    };

    fetchSportsData();

    const interval = setInterval(() => {
      updateLiveScores();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getMatchStatusClass = (status) => {
    if (status === 'LIVE' || status === 'Q1' || status === 'Q2' || status === 'Q3' || status === 'Round 1' || status === 'Round 2') {
      return 'status-live';
    } else if (status === 'FINAL' || status === 'FT') {
      return 'status-final';
    } else {
      return 'status-scheduled';
    }
  };

  const animateScore = (key) => {
    return (
      <div className="animate-score">
        <div
          className="score-value"
          style={{
            animation: animated ? 'fadeIn 0.3s ease-out' : ''
          }}
        >
          {liveScores[key] ? liveScores[key].homeScore : 0}
        </div>
        <span className="vs">vs</span>
        <div
          className="score-value"
          style={{
            animation: animated ? 'fadeIn 0.3s ease-out' : ''
          }}
        >
          {liveScores[key] ? liveScores[key].awayScore : 0}
        </div>
      </div>
    );
  };

  const getTeamColor = (teamName) => {
    switch (teamName) {
      case 'PSG':
        return 'var(--green)';
      case 'NBA':
        return 'var(--t1)';
      case 'NFL':
        return 'var(--t1)';
      case 'UFC':
        return 'var(--t3)';
      default:
        return 'var(--t2)';
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'PSG':
        return (
          <div className="psg-content">
            <div className="match-card">
              {psgData.map((match, index) => (
                <div key={index} className="match-info">
                  <div className="match-header">
                    <span className="competition">{match.competition}</span>
                    <span className={`status ${getMatchStatusClass(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="match-details">
                    <span
                      className="team home"
                      style={{ backgroundColor: getTeamColor(match.homeTeam.name) }}
                    >
                      {match.homeTeam.name}
                    </span>
                    {animateScore('psg')}
                    <span className="team away" style={{ backgroundColor: getTeamColor(match.awayTeam.name) }}>
                      {match.awayTeam.name}
                    </span>
                  </div>
                  <div className="match-footer">
                    <span className="time">{match.time}</span>
                    <span className="venue">{match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'NBA':
        return (
          <div className="nba-content">
            <div className="match-card">
              {nbaData.map((match, index) => (
                <div key={index} className="match-info">
                  <div className="match-header">
                    <span className="competition">{match.competition}</span>
                    <span className={`status ${getMatchStatusClass(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="match-details">
                    <span
                      className="team home"
                      style={{ backgroundColor: getTeamColor(match.homeTeam.name) }}
                    >
                      {match.homeTeam.name}
                    </span>
                    {animateScore('nba')}
                    <span className="team away" style={{ backgroundColor: getTeamColor(match.awayTeam.name) }}>
                      {match.awayTeam.name}
                    </span>
                  </div>
                  <div className="match-footer">
                    <span className="time">{match.time}</span>
                    <span className="venue">{match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'NFL':
        return (
          <div className="nfl-content">
            <div className="match-card">
              {nflData.map((match, index) => (
                <div key={index} className="match-info">
                  <div className="match-header">
                    <span className="competition">{match.competition}</span>
                    <span className={`status ${getMatchStatusClass(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="match-details">
                    <span
                      className="team home"
                      style={{ backgroundColor: getTeamColor(match.homeTeam.name) }}
                    >
                      {match.homeTeam.name}
                    </span>
                    {animateScore('nfl')}
                    <span className="team away" style={{ backgroundColor: getTeamColor(match.awayTeam.name) }}>
                      {match.awayTeam.name}
                    </span>
                  </div>
                  <div className="match-footer">
                    <span className="time">{match.time}</span>
                    <span className="venue">{match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'UFC':
        return (
          <div className="ufc-content">
            <div className="match-card">
              {ufcData.map((match, index) => (
                <div key={index} className="match-info">
                  <div className="match-header">
                    <span className="competition">{match.competition}</span>
                    <span className={`status ${getMatchStatusClass(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                  <div className="match-details">
                    <span
                      className="team home"
                      style={{ backgroundColor: getTeamColor(match.fighter1.name) }}
                    >
                      {match.fighter1.name}
                    </span>
                    {animateScore('ufc')}
                    <span className="team away" style={{ backgroundColor: getTeamColor(match.fighter2.name) }}>
                      {match.fighter2.name}
                    </span>
                  </div>
                  <div className="match-footer">
                    <span className="time">{match.time}</span>
                    <span className="venue">{match.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="sports-container">
      <SportsTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {renderTabContent()}
    </div>
  );
};

export default Sports;
```

Fichier: src/pages/Sports.css
```css
.sports-container {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  padding: 20px 0;
}

.match-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.match-info {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
}

.match-info:hover {
  border-color: var(--border-hi);
  transform: translateY(-2px);
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 0.9rem;
  color: var(--t2);
}

.competition {
  font-weight: 600;
}

.status {
  font-weight: 500;
}

.match-details {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.team {
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--t1);
  font-weight: 600;
  font-size: 1rem;
  flex: 1;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.team.home {
  background-color: var(--green);
  border: 1px solid var(--green);
}

.team.away {
  background-color: var(--bg3);
  border: 1px solid var(--border);
}

.animate-score {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.score-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--t1);
  min-width: 24px;
  text-align: center;
  flex-shrink: 0;
}

.vs {
  font-size: 1rem;
  color: var(--t2);
  font-weight: 500;
}

.match-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--t2);
  padding-top: 8px;
  border-top: 1px solid var(--border);
}

.status-live {
  color: var(--green);
}

.status-final {
  color: var(--t3);
}

.status-scheduled {
  color: var(--t2);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}