Je vais implémenter les skeletons shimmer et les effets de pulse pour les pages Sports. Voici les modifications nécessaires :

Fichier: src/components/Sports/TeamCard.jsx
```jsx
import React from 'react';
import './TeamCard.css';

const TeamCard = ({
  homeTeam,
  awayTeam,
  competition,
  status,
  time,
  venue,
  homeScore,
  awayScore,
  isLoading = false,
  isPulse = false
}) => {
  const getMatchStatusClass = (status) => {
    if (status === 'LIVE' || status === 'Q1' || status === 'Q2' || status === 'Q3' || status === 'Round 1' || status === 'Round 2') {
      return 'status-live';
    } else if (status === 'FINAL' || status === 'FT') {
      return 'status-final';
    } else {
      return 'status-scheduled';
    }
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

  return (
    <div className={`team-card ${isLoading ? 'skeleton' : ''} ${isPulse ? 'pulse' : ''}`}>
      <div className="match-header">
        {isLoading ? (
          <div className="skeleton-text skeleton-competition"></div>
        ) : (
          <span className="competition">{competition}</span>
        )}
        {isLoading ? (
          <div className="skeleton-text skeleton-status"></div>
        ) : (
          <span className={`status ${getMatchStatusClass(status)}`}>
            {status}
          </span>
        )}
      </div>

      <div className="match-details">
        {isLoading ? (
          <div className="skeleton-team skeleton-home"></div>
        ) : (
          <span
            className="team home"
            style={{ backgroundColor: getTeamColor(homeTeam) }}
          >
            {homeTeam}
          </span>
        )}

        <div className="score-container">
          {isLoading ? (
            <div className="skeleton-score"></div>
          ) : (
            <>
              <div className="score-value">{homeScore}</div>
              <span className="vs">vs</span>
              <div className="score-value">{awayScore}</div>
            </>
          )}
        </div>

        {isLoading ? (
          <div className="skeleton-team skeleton-away"></div>
        ) : (
          <span
            className="team away"
            style={{ backgroundColor: getTeamColor(awayTeam) }}
          >
            {awayTeam}
          </span>
        )}
      </div>

      <div className="match-footer">
        {isLoading ? (
          <div className="skeleton-text skeleton-time"></div>
        ) : (
          <span className="time">{time}</span>
        )}
        {isLoading ? (
          <div className="skeleton-text skeleton-venue"></div>
        ) : (
          <span className="venue">{venue}</span>
        )}
      </div>
    </div>
  );
};

export default TeamCard;
```

Fichier: src/components/Sports/TeamCard.css
```css
.team-card {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  transition: all 0.2s ease;
  position: relative;
  overflow: hidden;
}

.team-card:hover {
  border-color: var(--border-hi);
  transform: translateY(-2px);
}

.team-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(0, 255, 136, 0.1), transparent);
  transform: translateX(-100%);
  animation: shimmer 1.5s infinite;
}

.team-card.skeleton::before {
  animation: shimmer 1.5s infinite;
}

.team-card.pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
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

.status-live {
  color: var(--green);
}

.status-final {
  color: var(--t3);
}

.status-scheduled {
  color: var(--t2);
}

.match-details {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  position: relative;
}

.team {
  flex: 1;
  padding: 8px 12px;
  border-radius: 8px;
  color: var(--t1);
  font-weight: 500;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home {
  margin-right: 8px;
}

.away {
  margin-left: 8px;
}

.score-container {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  justify-content: center;
}

.score-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--t1);
}

.vs {
  font-size: 0.9rem;
  color: var(--t2);
  font-weight: 500;
}

.match-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--t2);
}

.skeleton {
  background-color: var(--bg3);
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transform: translateX(-100%);
  animation: skeleton-shimmer 1.5s infinite;
}

@keyframes skeleton-shimmer {
  100% {
    transform: translateX(100%);
  }
}

.skeleton-text {
  height: 16px;
  width: 60px;
}

.skeleton-competition {
  width: 80px;
}

.skeleton-status {
  width: 40px;
}

.skeleton-team {
  height: 32px;
  width: 100px;
}

.skeleton-home {
  margin-right: 8px;
}

.skeleton-away {
  margin-left: 8px;
}

.skeleton-score {
  height: 24px;
  width: 40px;
  border-radius: 4px;
}

.skeleton-time, .skeleton-venue {
  height: 14px;
  width: 50px;
}
```

Fichier: src/pages/Sports.jsx
```jsx
import React, { useState, useEffect } from 'react';
import './Sports.css';
import SportsTabs from '../components/SportsTabs';
import TeamCard from '../components/Sports/TeamCard';

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
  const [isLoading, setIsLoading] = useState(true);
  const [animated, setAnimated] = useState(false);

  const updateLiveScores = () => {
    setAnimated(true);
    setTimeout(() => setAnimated(false), 300);
  };

  useEffect(() => {
    const fetchSportsData = async () => {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    };

    fetchSportsData();

    const interval = setInterval(() => {
      updateLiveScores();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

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
    if (isLoading) {
      return (
        <div className="loading-container">
          {[...Array(3)].map((_, index) => (
            <TeamCard
              key={index}
              isLoading={true}
              homeTeam=""
              awayTeam=""
              competition=""
              status=""
              time=""
              venue=""
              homeScore=""
              awayScore=""
            />
          ))}
        </div>
      );
    }

    switch (activeTab) {
      case 'PSG':
        return (
          <div className="psg-content">
            <div className="match-card">
              {psgData.map((match, index) => (
                <TeamCard
                  key={index}
                  homeTeam={match.homeTeam.name}
                  awayTeam={match.awayTeam.name}
                  competition={match.competition}
                  status={match.status}
                  time={match.time}
                  venue={match.venue}
                  homeScore={match.homeTeam.score || 0}
                  awayScore={match.awayTeam.score || 0}
                  isPulse={animated}
                />
              ))}
            </div>
          </div>
        );
      case 'NBA':
        return (
          <div className="nba-content">
            <div className="match-card">
              {nbaData.map((match, index) => (
                <TeamCard
                  key={index}
                  homeTeam={match.homeTeam.name}
                  awayTeam={match.awayTeam.name}
                  competition={match.competition}
                  status={match.status}
                  time={match.time}
                  venue={match.venue}
                  homeScore={match.homeTeam.score || 0}
                  awayScore={match.awayTeam.score || 0}
                  isPulse={animated}
                />
              ))}
            </div>
          </div>
        );
      case 'NFL':
        return (
          <div className="nfl-content">
            <div className="match-card">
              {nflData.map((match, index) => (
                <TeamCard
                  key={index}
                  homeTeam={match.homeTeam.name}
                  awayTeam={match.awayTeam.name}
                  competition={match.competition}
                  status={match.status}
                  time={match.time}
                  venue={match.venue}
                  homeScore={match.homeTeam.score || 0}
                  awayScore={match.awayTeam.score || 0}
                  isPulse={animated}
                />
              ))}
            </div>
          </div>
        );
      case 'UFC':
        return (
          <div className="ufc-content">
            <div className="match-card">
              {ufcData.map((match, index) => (
                <TeamCard
                  key={index}
                  homeTeam={match.fighter1.name}
                  awayTeam={match.fighter2.name}
                  competition={match.competition}
                  status={match.status}
                  time={match.time}
                  venue={match.venue}
                  homeScore={match.fighter1.score || 0}
                  awayScore={match.fighter2.score || 0}
                  isPulse={animated}
                />
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

.loading-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
}

.animate-score {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 80px;
  justify-content: center;
}

.score-value {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--t1);
}

.vs {
  font-size: 0.9rem;
  color: var(--t2);
  font-weight: 500;
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

@media (max-width: 768px) {
  .sports-container {
    padding: 12px 0;
  }

  .match-card {
    gap: 8px;
  }

  .loading-container {
    gap: 8px;
  }
}
```

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
              <div
                className="motion-indicator"
                style={{
                  width: isMounted ? '100%' : '0'
                }}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
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

.tab