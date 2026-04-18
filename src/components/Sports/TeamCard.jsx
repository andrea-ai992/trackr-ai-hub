import React from 'react';

const TeamCard = ({ team }) => {
  return (
    <div className="team-card">
      <div className="team-logo-skeleton"></div>
      <div className="team-info-skeleton">
        <div className="team-name-skeleton"></div>
        <div className="team-record-skeleton"></div>
      </div>
    </div>
  );
};

const TeamCardSkeleton = () => {
  return (
    <div className="team-card skeleton-pulse">
      <div className="team-logo-skeleton"></div>
      <div className="team-info-skeleton">
        <div className="team-name-skeleton"></div>
        <div className="team-record-skeleton"></div>
      </div>
    </div>
  );
};

export { TeamCard, TeamCardSkeleton };
```

```jsx
import React from 'react';

const Sports = () => {
  const teams = [
    { id: 1, name: 'PSG', logo: 'psg.svg', record: '25-5-8' },
    { id: 2, name: 'Real Madrid', logo: 'real.svg', record: '28-4-6' },
    { id: 3, name: 'Bayern', logo: 'bayern.svg', record: '27-6-5' },
    { id: 4, name: 'Man City', logo: 'city.svg', record: '26-7-5' },
  ];

  return (
    <div className="sports-page">
      <div className="sports-header">
        <h1>Sports Dashboard</h1>
      </div>

      <div className="sports-grid">
        {teams.map(team => (
          <TeamCard key={team.id} team={team} />
        ))}

        <TeamCardSkeleton />
        <TeamCardSkeleton />
        <TeamCardSkeleton />
        <TeamCardSkeleton />
      </div>
    </div>
  );
};

export default Sports;
```

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');

:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  margin: 0;
  padding: 0;
  min-height: 100vh;
}

.sports-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.sports-header {
  margin-bottom: 2rem;
}

.sports-header h1 {
  color: var(--green);
  font-size: 1.5rem;
  margin: 0;
  text-align: center;
}

.sports-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

/* Team Card Styles */
.team-card {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: all 0.3s ease;
}

.team-card:hover {
  background-color: var(--bg3);
  transform: translateY(-2px);
}

.team-card.skeleton-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.team-logo-skeleton {
  width: 60px;
  height: 60px;
  background-color: var(--bg);
  border-radius: 50%;
  margin-bottom: 0.75rem;
  border: 2px solid var(--border);
}

.team-info-skeleton {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-name-skeleton {
  height: 1rem;
  background-color: var(--bg);
  border-radius: 0.25rem;
  width: 80%;
  margin: 0 auto;
}

.team-record-skeleton {
  height: 0.8rem;
  background-color: var(--bg);
  border-radius: 0.25rem;
  width: 60%;
  margin: 0 auto;
}

/* Real Team Card Styles */
.team-card.active {
  background-color: var(--bg3);
  border-color: var(--green);
}

.team-card.active .team-logo-skeleton {
  background-color: var(--green);
  border-color: var(--green);
}

.team-card.active .team-name-skeleton,
.team-card.active .team-record-skeleton {
  background-color: var(--green);
}

/* Animations */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .sports-grid {
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 0.75rem;
  }

  .team-card {
    padding: 0.75rem;
  }
}