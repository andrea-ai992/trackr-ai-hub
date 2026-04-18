Création de src/components/ScoresLive.jsx :

```jsx
// src/components/ScoresLive.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Inter } from '@fontsource/inter';
import { styled } from 'styled-components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const ScoreCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
`;

const ScoreText = styled.span`
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
`;

const ScoreTime = styled.span`
  font-size: 18px;
  color: var(--t2);
`;

const ScoreLoader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--border);
`;

const ScoreLoaderText = styled.span`
  font-size: 18px;
  color: var(--t2);
`;

const ScoresLive = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const { data, error } = await supabase
          .from('scores')
          .select('id, team1, team2, score1, score2, time');
        if (error) {
          console.error(error);
        } else {
          setScores(data);
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchScores();
  }, []);

  if (loading) {
    return (
      <Container>
        <ScoreLoader>
          <ScoreLoaderText>Loading...</ScoreLoaderText>
        </ScoreLoader>
      </Container>
    );
  }

  return (
    <Container>
      {scores.map((score, index) => (
        <ScoreCard key={score.id}>
          <ScoreText>
            {score.team1} {score.score1} - {score.score2} {score.team2}
          </ScoreText>
          <ScoreTime>{score.time}</ScoreTime>
        </ScoreCard>
      ))}
    </Container>
  );
};

export default ScoresLive;
```

Modification de src/pages/Sports.jsx pour intégrer ScoresLive :

```jsx
// src/pages/Sports.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { styled } from 'styled-components';
import { Inter } from '@fontsource/inter';
import ScoresLive from '../components/ScoresLive';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

const SportsPage = () => {
  return (
    <Container>
      <h1>ESPN Scores</h1>
      <ScoresLive />
    </Container>
  );
};

export default SportsPage;
```

Ajout de CSS pour les animations de scores en direct :

```css
/* src/styles/globals.css */
.scores-live {
  animation: scores-load 2s infinite;
}

@keyframes scores-load {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
```

Ajout de la classe `scores-live` dans src/components/ScoresLive.jsx pour les animations de scores en direct :

```jsx
// src/components/ScoresLive.jsx
import React, { useState, useEffect } from 'react';
// ...
return (
  <Container className="scores-live">
    {scores.map((score, index) => (
      <ScoreCard key={score.id}>
        <ScoreText>
          {score.team1} {score.score1} - {score.score2} {score.team2}
        </ScoreText>
        <ScoreTime>{score.time}</ScoreTime>
      </ScoreCard>
    ))}
  </Container>
);