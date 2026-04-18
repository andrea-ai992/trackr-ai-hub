Je vais créer un système de scores en direct pour les sports avec des animations CSS fluides. Voici les fichiers nécessaires :

src/components/SportsScoreDisplay.jsx
```jsx
import { useState, useEffect, useRef } from 'react';

const SportsScoreDisplay = ({ sport, initialScores = [], initialStatus = '' }) => {
  const [scores, setScores] = useState(initialScores);
  const [status, setStatus] = useState(initialStatus);
  const [isAnimating, setIsAnimating] = useState(false);
  const prevScoresRef = useRef(initialScores);

  useEffect(() => {
    if (JSON.stringify(scores) !== JSON.stringify(prevScoresRef.current)) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 300);
      prevScoresRef.current = scores;
      return () => clearTimeout(timer);
    }
  }, [scores]);

  const updateScores = (newScores) => {
    setScores(newScores);
  };

  const updateStatus = (newStatus) => {
    setStatus(newStatus);
  };

  const renderTeamScore = (team, index) => {
    const prevScore = prevScoresRef.current[index]?.score || 0;
    const currentScore = scores[index]?.score || 0;

    return (
      <div key={team.id} className="team-score">
        <div className="team-info">
          <div className="team-logo">
            <img src={team.logo} alt={team.name} />
          </div>
          <div className="team-details">
            <h3 className="team-name">{team.name}</h3>
            <p className="team-league">{team.league}</p>
          </div>
        </div>

        <div className="score-container">
          {isAnimating ? (
            <div className="score-animation">
              <span className="score-old">{prevScore}</span>
              <span className="score-arrow">→</span>
              <span className="score-new">{currentScore}</span>
            </div>
          ) : (
            <div className={`score-value ${currentScore > prevScore ? 'score-up' : currentScore < prevScore ? 'score-down' : ''}`}>
              {currentScore}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="sports-score-display">
      <div className="score-header">
        <h2 className="sport-title">{sport.toUpperCase()} LIVE SCORES</h2>
        <div className="match-status">{status}</div>
      </div>

      <div className="teams-container">
        {scores.map(renderTeamScore)}
      </div>

      <div className="score-controls">
        <button
          onClick={() => updateScores([
            { ...scores[0], score: scores[0].score + 1 },
            scores[1]
          ])}
          className="score-btn"
        >
          +1 {scores[0].name}
        </button>
        <button
          onClick={() => updateScores([
            scores[0],
            { ...scores[1], score: scores[1].score + 1 }
          ])}
          className="score-btn"
        >
          +1 {scores[1].name}
        </button>
        <button
          onClick={() => updateStatus('HT - Halftime')}
          className="status-btn"
        >
          Halftime
        </button>
        <button
          onClick={() => updateStatus('FT - Full Time')}
          className="status-btn"
        >
          Full Time
        </button>
      </div>
    </div>
  );
};

export default SportsScoreDisplay;
```

src/components/SportsScoreDisplay.css
```css
.sports-score-display {
  --gap: 1rem;
  --radius: 0.75rem;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  width: 100%;
  max-width: 400px;
  background: var(--bg2);
  border-radius: var(--radius);
  padding: var(--gap);
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  border: 1px solid var(--border);
}

.score-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--gap);
  padding-bottom: var(--gap);
  border-bottom: 1px solid var(--border);
}

.sport-title {
  color: var(--green);
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.match-status {
  background: rgba(0, 255, 136, 0.1);
  color: var(--green);
  padding: 0.25rem 0.75rem;
  border-radius: 2rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.teams-container {
  display: flex;
  flex-direction: column;
  gap: var(--gap);
}

.team-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.team-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.team-logo img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 50%;
}

.team-details {
  display: flex;
  flex-direction: column;
}

.team-name {
  color: var(--t1);
  font-size: 0.9rem;
  font-weight: 600;
  margin: 0;
}

.team-league {
  color: var(--t2);
  font-size: 0.7rem;
  margin: 0;
}

.score-container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.score-value {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--t1);
  min-width: 30px;
  text-align: center;
}

.score-value.score-up {
  color: #00ff88;
  animation: scorePulse 0.5s ease;
}

.score-value.score-down {
  color: #ff4444;
  animation: scorePulse 0.5s ease;
}

.score-animation {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.2rem;
  font-weight: 700;
}

.score-old {
  color: var(--t3);
  text-decoration: line-through;
}

.score-new {
  color: var(--green);
}

.score-controls {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: var(--gap);
}

.score-btn, .status-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: var(--radius);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
}

.score-btn {
  background: rgba(0, 255, 136, 0.1);
  color: var(--green);
}

.score-btn:hover {
  background: rgba(0, 255, 136, 0.2);
}

.status-btn {
  background: rgba(255, 255, 255, 0.05);
  color: var(--t1);
}

.status-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}

@keyframes scorePulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); }
}

@media (min-width: 768px) {
  .sports-score-display {
    max-width: 500px;
  }

  .team-score {
    padding: 1rem;
  }

  .score-controls {
    justify-content: center;
  }
}
```

src/pages/Sports.jsx
```jsx
import { useState, useEffect } from 'react';
import SportsScoreDisplay from '../components/SportsScoreDisplay';
import '../components/SportsScoreDisplay.css';

const Sports = () => {
  const [activeSport, setActiveSport] = useState('football');
  const [psgScores, setPsgScores] = useState([
    { id: 'psg', name: 'PSG', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/c/c1/Logo_PSG.svg/1200px-Logo_PSG.svg.png', league: 'Ligue 1', score: 2 },
    { id: 'om', name: 'OM', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/a/a3/Olympique_de_Marseille_logo.svg/1200px-Olympique_de_Marseille_logo.svg.png', league: 'Ligue 1', score: 1 }
  ]);
  const [nflScores, setNflScores] = useState([
    { id: 'cowboys', name: 'Cowboys', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Dallas_Cowboys_logo.svg/1200px-Dallas_Cowboys_logo.svg.png', league: 'NFL', score: 24 },
    { id: 'eagles', name: 'Eagles', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4f/Philadelphia_Eagles_logo.svg/1200px-Philadelphia_Eagles_logo.svg.png', league: 'NFL', score: 21 }
  ]);
  const [nbaScores, setNbaScores] = useState([
    { id: 'lakers', name: 'Lakers', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png', league: 'NBA', score: 102 },
    { id: 'celtics', name: 'Celtics', logo: 'https://upload.wikimedia.org/wikipedia/fr/thumb/6/65/Celtics_de_Boston_logo.svg/1200px-Celtics_de_Boston_logo.svg.png', league: 'NBA', score: 98 }
  ]);
  const [ufcScores, setUfcScores] = useState([
    { id: 'fighter1', name: 'Fighter 1', logo: 'https://via.placeholder.com/40x40/333/fff?text=F1', league: 'UFC', score: 12 },
    { id: 'fighter2', name: 'Fighter 2', logo: 'https://via.placeholder.com/40x40/333/fff?text=F2', league: 'UFC', score: 8 }
  ]);

  const [status, setStatus] = useState('FT - Full Time');

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPsgScores(prev => [
        { ...prev[0], score: prev[0].score + (Math.random() > 0.7 ? 1 : 0) },
        { ...prev[1], score: prev[1].score + (Math.random() > 0.7 ? 1 : 0) }
      ]);

      setNflScores(prev => [
        { ...prev[0], score: prev[0].score + (Math.random() > 0.6 ? 2 : 0) },
        { ...prev[1], score: prev[1].score + (Math.random() > 0.6 ? 2 : 0) }
      ]);

      setNbaScores(prev => [
        { ...prev[0], score: prev[0].score + (Math.random() > 0.5 ? 2 : 0) },
        { ...prev[1], score: prev[1].score + (Math.random() > 0.5 ? 2 : 0) }
      ]);

      setUfcScores(prev => [
        { ...prev[0], score: prev[0].score + (Math.random() > 0.8 ? 1 : 0) },
        { ...prev[1], score: prev[1].score + (Math.random() > 0.8 ? 1 : 0) }
      ]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const renderSportSection = () => {
    switch (activeSport) {
      case 'football':
        return (
          <SportsScoreDisplay
            sport="football"
            initialScores={psgScores}
            initialStatus={status}
          />
        );
      case 'nfl':
        return (
          <SportsScoreDisplay
            sport="nfl"
            initialScores={nflScores}
            initialStatus={status}
          />
        );
      case 'nba':
        return (
          <SportsScoreDisplay
            sport="nba"
            initialScores={nbaScores}
            initialStatus={status}
          />
        );
      case 'ufc':
        return (
          <SportsScoreDisplay
            sport="ufc"
            initialScores={ufcScores}
            initialStatus={status}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="sports-page">
      <div className="sports-header">
        <h1 className="page-title">SPORTS LIVE SCORES</h1>
        <p className="page-subtitle">Real-time updates with smooth animations</p>
      </div>

      <div className="sports-nav">
        {['football', 'nfl', 'nba', 'ufc'].map(sport => (
          <button
            key={sport}
            className={`nav-btn ${activeSport === sport ? 'active' : ''}`}
            onClick={() => setActiveSport(sport)}
          >
            {sport.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="sports-content">
        {renderSportSection()}
      </div>
    </div>
  );
};

export default Sports;
```

src/pages/Sports.css
```css
.sports-page {
  min-height: 100vh;
  background: var(--bg);
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.sports-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-title {
  color: var(--green);
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
}

.page-subtitle {
  color: var(--t2);
  font-size: 0.9rem;
  margin: 0;
}

.sports-nav {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.nav-btn {
  padding: 0.5rem 1rem;
  background: var(--bg2);
  color: var(--t2);
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  font-size: 0.8rem;
  cursor: pointer;
  transition: var(--transition);
}

.nav-btn:hover {
  background: var(--bg3);
  color: var(--t1);
}

.nav-btn.active {
  background: var(--green);
  color: var(--bg);
  border-color: var(--green);
}

.sports-content {
  display: flex;
  justify-content: center;
}

@media (min-width: 768px) {
  .sports-page {
    padding: 2rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .sports-nav {
    gap: 1rem;
  }

  .nav-btn {
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;
  }
}