Création de la page Trackr/Sports avec les team cards :

```jsx
// src/pages/Sports.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
import { supabase } from '../utils/supabase';

function Sports() {
  const [teams, setTeams] = React.useState([]);

  React.useEffect(() => {
    async function fetchTeams() {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name, color');
      if (error) {
        console.error(error);
      } else {
        setTeams(data);
      }
    }
    fetchTeams();
  }, []);

  return (
    <div className="bg bg2 h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Sports</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <li key={team.id}>
            <TeamCard team={team} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sports;
```

Création du composant TeamCard :

```jsx
// src/components/TeamCard.js
import React from 'react';
import { Link } from 'react-router-dom';

function TeamCard({ team }) {
  return (
    <Link to={`/sports/${team.id}`} className="bg bg3 rounded-lg p-4 shadow-md">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-t1">{team.name}</h2>
        <div
          className="bg-green h-4 w-4 rounded-full"
          style={{ backgroundColor: team.color }}
        />
      </div>
      <p className="text-t2">Description du club</p>
    </Link>
  );
}

export default TeamCard;
```

Création des styles pour les team cards :

```css
/* src/components/TeamCard.css */
.bg3 {
  background-color: var(--bg2);
  border: 1px solid var(--border-hi);
}

.bg3:hover {
  background-color: var(--bg);
}

.text-t1 {
  color: var(--t1);
}

.text-t2 {
  color: var(--t2);
}

.bg-green {
  background-color: var(--green);
}
```

Importation des styles dans le composant TeamCard :

```jsx
// src/components/TeamCard.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TeamCard.css';

function TeamCard({ team }) {
  // ...
  return (
    <Link to={`/sports/${team.id}`} className={`bg bg3 rounded-lg p-4 shadow-md ${styles.bg3}`}>
      // ...
    </Link>
  );
}
```

Création des routes pour les team cards :

```jsx
// src/pages/Sports.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
import { supabase } from '../utils/supabase';

function Sports() {
  // ...
  return (
    <div className="bg bg2 h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">Sports</h1>
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <li key={team.id}>
            <Route path={`/sports/${team.id}`} element={<TeamDetail team={team} />} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function TeamDetail({ team }) {
  return (
    <div className="bg bg2 h-screen p-4">
      <h1 className="text-3xl font-bold mb-4">{team.name}</h1>
      <p className="text-t2">Description du club</p>
    </div>
  );
}
```

Création des styles pour les team details :

```css
/* src/pages/Sports.css */
.bg2 {
  background-color: var(--bg2);
  border: 1px solid var(--border-hi);
}

.text-t2 {
  color: var(--t2);
}
```

Importation des styles dans la page Sports :

```jsx
// src/pages/Sports.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import TeamCard from '../components/TeamCard';
import styles from './Sports.css';

function Sports() {
  // ...
  return (
    <div className={`bg bg2 h-screen p-4 ${styles.bg2}`}>
      // ...
    </div>
  );
}