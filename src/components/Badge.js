Création du fichier src/components/Badge.js :

```jsx
import React from 'react';

const Badge = ({ children, type, className }) => {
  const getBackgroundColor = () => {
    switch (type) {
      case 'NEW':
        return 'linear-gradient(to right, var(--green), var(--green))';
      case 'LIVE':
        return 'linear-gradient(to right, var(--bg), var(--bg))';
      default:
        return 'linear-gradient(to right, var(--bg2), var(--bg2))';
    }
  };

  return (
    <div
      className={`flex items-center justify-center w-8 h-8 rounded-full ${className}`}
      style={{
        backgroundColor: getBackgroundColor(),
        color: 'var(--t1)',
        border: '1px solid var(--border)',
        fontSize: '0.625rem',
        fontWeight: 'bold',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </div>
  );
};

export default Badge;
```

Création du fichier src/components/TrackrMore.js :

```jsx
import React from 'react';
import Badge from './Badge';

const TrackrMore = () => {
  const newData = true; // Remplacez par votre logique de données
  const newBadge = newData ? 'NEW' : 'LIVE';

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-lg font-bold text--t1">Trackr/More</h2>
      <div className="flex flex-wrap gap-2">
        <Badge type={newBadge} className="mr-2">
          {newBadge.toUpperCase()}
        </Badge>
        <Badge type="LIVE" className="mr-2">
          LIVE
        </Badge>
        <Badge type="NEW" className="mr-2">
          NEW
        </Badge>
      </div>
    </div>
  );
};

export default TrackrMore;
```

Ajout du CSS dans src/styles/globals.css :

```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.dark {
  background-color: var(--bg);
  color: var(--t1);
}

.flex {
  display: flex;
}

.items-center {
  align-items: center;
}

.justify-center {
  justify-content: center;
}

.w-8 {
  width: 2rem;
}

.h-8 {
  height: 2rem;
}

.rounded-full {
  border-radius: 50%;
}

.text-lg {
  font-size: 1.125rem;
}

.text-bold {
  font-weight: bold;
}

.text-uppercase {
  text-transform: uppercase;
}
```

Ajout des classes dans src/styles/index.js :

```jsx
import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  ${() => import('./globals.css')}
`;

export default GlobalStyle;
```

N'oubliez pas d'importer le fichier GlobalStyle dans votre composant principal.