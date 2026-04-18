Pour mettre en place les animations de scores en direct pour ESPN sur la page Trackr/Sports, nous allons modifier le code existant pour ajouter les animations nécessaires.

Tout d'abord, nous allons ajouter les animations pour les scores en direct. Nous allons utiliser la bibliothèque Lucide React pour créer les animations.

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
                  <span className="team home">{match.homeTeam.name}</span>
                  {animateScore()}
                  <span className="vs">vs</span>
                  {animateScore()}
                  <span className="team away">{match.awayTeam.name}</span>
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

Nous avons ajouté une fonction `animateScore` qui crée une animation pour les scores en direct. Nous avons également ajouté une variable `animated` pour contrôler l'animation.

Nous avons également ajouté une classe `animate-score` pour les scores en direct et une classe `score-value` pour les valeurs des scores.

Enfin, nous avons ajouté une animation pour les scores en direct en utilisant la fonction `animateScore` et la variable `animated`.

Cela devrait mettre en place les animations de scores en direct pour ESPN sur la page Trackr/Sports.