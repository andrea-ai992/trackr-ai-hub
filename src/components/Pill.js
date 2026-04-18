Création du composant Pill.js
```jsx
// src/components/Pill.js
import React from 'react';
import { Icon } from 'lucide-react';

const Pill = ({ icon, text, active, onClick }) => {
  return (
    <button
      className={`pill ${active ? 'pill-active' : ''}`}
      onClick={onClick}
    >
      <Icon name={icon} size={20} />
      <span className="pill-text">{text}</span>
    </button>
  );
};

export default Pill;
```

Création du CSS pour le composant Pill.js
```css
/* src/components/Pill.css */
.pill {
  background-color: var(--bg);
  color: var(--t1);
  border-radius: 10px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background-color 0.2s ease-in-out;
}

.pill-active {
  background-color: var(--green);
  color: var(--bg);
}

.pill-text {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  font-weight: 500;
}

.pill-icon {
  font-size: 16px;
}
```

Mise à jour du fichier BottomNav.js pour utiliser le composant Pill.js
```jsx
// src/pages/BottomNav.js
import React from 'react';
import { Link } from 'react-router-dom';
import Pill from '../components/Pill';

const BottomNav = () => {
  return (
    <div className="bottom-nav">
      <Link to="/dashboard">
        <Pill icon="home" text="Dashboard" active={true} />
      </Link>
      <Link to="/sports">
        <Pill icon="football" text="Sports" />
      </Link>
      <Link to="/markets">
        <Pill icon="chart" text="Markets" />
      </Link>
      <Link to="/news">
        <Pill icon="newspaper" text="News" />
      </Link>
      <Link to="/more">
        <Pill icon="more" text="More" />
      </Link>
    </div>
  );
};

export default BottomNav;
```

Mise à jour du CSS pour la page BottomNav
```css
/* src/pages/BottomNav.css */
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  background-color: var(--bg);
  display: flex;
  justify-content: space-around;
  padding: 8px 0;
  border-top: 1px solid var(--border);
}

.bottom-nav a {
  text-decoration: none;
  color: var(--t1);
}

.bottom-nav a:hover {
  color: var(--t2);
}
```

Création du CSS pour la page BottomNav (mobile-first)
```css
/* src/pages/BottomNav.css (mobile-first) */
@media (max-width: 768px) {
  .bottom-nav {
    flex-direction: column;
    align-items: center;
  }
  .bottom-nav a {
    margin-bottom: 8px;
  }
}
```

Mise à jour du fichier package.json pour ajouter les dépendances nécessaires
```json
{
  "name": "trackr-ai-hub",
  "version": "1.0.0",
  "scripts": {
    "start": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "lucide-react": "^1.0.0"
  }
}
```

Installation des dépendances nécessaires
```bash
npm install