Pour mettre en place les animations de scores en direct pour ESPN sur la page Trackr/Sports, nous allons modifier le code existant pour ajouter les animations nécessaires.

```jsx
import React, { useState, useEffect } from 'react';
import './Sports.css';
import { useAnimation } from '@lucide-react/core';

const Sports = () => {
  // ...

  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    // ...
    const interval = setInterval(() => {
      updateLiveScores();
      setAnimated(true);
    }, 30000);
    return () => clearInterval(interval);
  }, [liveScores]);

  // ...

  const getMatchStatusClass = (status) => {
    if (status === 'LIVE' || status === 'Q1' || status === 'Q2' || status === 'Q3' || status === 'Round 1' || status === 'Round 2') {
      return 'status-live';
    } else if (status === 'FINAL' || status === 'FT') {
      return 'status-final';
    } else {
      return 'status-scheduled';
    }
  };

  const animateScore = () => {
    return (
      <div className="animate-score">
        <div className="score-value" style={{ animation: animated ? 'fadeIn 0.3s ease-out' : '' }}>
          {liveScores.psg ? `${liveScores.psg.homeScore}` : match.goals.home}
        </div>
        <div className="score-value" style={{ animation: animated ? 'fadeIn 0.3s ease-out' : '' }}>
          {liveScores.psg ? `${liveScores.psg.awayScore}` : match.goals.away}
        </div>
      </div>
    );
  };

  // ...

  const getTeamColor = (teamName) => {
    switch (teamName) {
      case 'PSG':
        return '#00ff88'; // Bleu clair
      case 'NBA':
        return '#f0f0f0'; // Blanc
      case 'NFL':
        return '#111'; // Noir
      case 'UFC':
        return '#888'; // Gris clair
      default:
        return '#444'; // Gris foncé
    }
  };

  return (
    <div className="sports-container">
      // ...
      {activeTab === 'PSG' && (
        <div className="psg-content">
          <div className="match-card">
            {psgData.map((match, index) => (
              <div key={index} className="match-info">
                // ...
                <div className="match-details">
                  <span className="team home" style={{ backgroundColor: getTeamColor(match.homeTeam.name) }}>
                    {match.homeTeam.name}
                  </span>
                  {animateScore()}
                  <span className="vs">vs</span>
                  {animateScore()}
                  <span className="team away" style={{ backgroundColor: getTeamColor(match.awayTeam.name) }}>
                    {match.awayTeam.name}
                  </span>
                </div>
                // ...
              </div>
            ))}
          </div>
        </div>
      )}
      // ...
    </div>
  );
};

export default Sports;
```

```css
.animate-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.score-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--t1);
  min-width: 24px;
  text-align: center;
  animation: fadeIn 0.3s ease-out;
}

.team {
  padding: 4px 8px;
  border-radius: 4px;
  color: var(--t1);
  font-weight: 700;
  font-size: 1.1rem;
}

.team.home {
  background-color: var(--green);
  border: 1px solid var(--border);
}

.team.away {
  background-color: var(--bg2);
  border: 1px solid var(--border);
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
```

Nous avons ajouté une fonction `getTeamColor` pour récupérer la couleur du club en fonction du nom du club. Nous avons également ajouté une classe `team` pour les noms des clubs et une classe `home` et `away` pour les couleurs des clubs.

Nous avons également ajouté des styles pour les classes `status-live`, `status-final` et `status-scheduled` pour les statuts des matchs.

Cela devrait mettre en place les animations de scores en direct pour ESPN sur la page Trackr/Sports avec les couleurs des clubs.