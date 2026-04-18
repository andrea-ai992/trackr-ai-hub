**src/components/ModuleCard.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IoChevronForward } from 'lucide-react';

const ModuleCard = ({ title, description, icon, badge, url }) => {
  return (
    <div className="module-card">
      <div className="module-card-header">
        <span className="module-card-icon">{icon}</span>
        <span className="module-card-badge">{badge}</span>
      </div>
      <div className="module-card-content">
        <h3 className="module-card-title">{title}</h3>
        <p className="module-card-description">{description}</p>
      </div>
      <div className="module-card-footer">
        <Link to={url} className="module-card-link">
          <IoChevronForward size={24} />
        </Link>
      </div>
    </div>
  );
};

export default ModuleCard;
```

**src/pages/More.jsx**
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { IoChevronForward } from 'lucide-react';
import ModuleCard from '../components/ModuleCard';
import { useDarkMode } from '../hooks/useDarkMode';

const modules = [
  {
    title: 'FlightTracker',
    description: 'Suivi de vols en temps réel',
    icon: '✈️',
    badge: 'LIVE',
    url: '/flight-tracker',
  },
  {
    title: 'CryptoTrader',
    description: 'Analyse et trading de crypto-monnaies',
    icon: '📈',
    badge: 'NEW',
    url: '/crypto-trader',
  },
  {
    title: 'Signals IA',
    description: 'Signaux de trading générés par IA',
    icon: '⚡',
    badge: 'NEW',
    url: '/signals-ia',
  },
  {
    title: 'Portfolio',
    description: 'Gestion de votre portefeuille d'investissement',
    icon: '💼',
    badge: '',
    url: '/portfolio',
  },
  {
    title: 'Patterns',
    description: 'Analyse de données et visualisation de tendances',
    icon: '📊',
    badge: '',
    url: '/patterns',
  },
  {
    title: 'Translator',
    description: 'Traducteur automatique de textes',
    icon: '🌐',
    badge: '',
    url: '/translator',
  },
  {
    title: 'RealEstate',
    description: 'Analyse et visualisation de données immobilières',
    icon: '🏠',
    badge: 'PRO',
    url: '/real-estate',
  },
  {
    title: 'Sneakers',
    description: 'Suivi de tendances et prix de chaussures',
    icon: '👟',
    badge: '',
    url: '/sneakers',
  },
  {
    title: 'Watches',
    description: 'Suivi de tendances et prix de montres',
    icon: '⌚',
    badge: 'PRO',
    url: '/watches',
  },
  {
    title: 'BusinessPlan',
    description: 'Création et gestion de plans d'affaires',
    icon: '📋',
    badge: '',
    url: '/business-plan',
  },
];

const More = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="more-page">
      <h1 className="more-page-title">Modules premium</h1>
      <div className="more-page-grid">
        {modules.map((module, index) => (
          <ModuleCard
            key={index}
            title={module.title}
            description={module.description}
            icon={module.icon}
            badge={module.badge}
            url={module.url}
          />
        ))}
      </div>
      <div className="more-page-settings">
        <div className="more-page-settings-dark-mode">
          <label className="more-page-settings-dark-mode-label">
            Mode sombre
          </label>
          <input
            type="checkbox"
            checked={darkMode}
            onChange={toggleDarkMode}
            disabled
            title="Mode sombre déjà activé"
          />
        </div>
        <div className="more-page-settings-version">
          <label className="more-page-settings-version-label">
            Version app
          </label>
          <span className="more-page-settings-version-value">v3.0</span>
        </div>
        <div className="more-page-settings-github">
          <label className="more-page-settings-github-label">
            GitHub
          </label>
          <a
            href="https://github.com/andrea-ai992/trackr-ai-hub"
            target="_blank"
            rel="noopener noreferrer"
          >
            Voir le code
          </a>
        </div>
      </div>
    </div>
  );
};

export default More;
```

**styles/global.css**
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

.module-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg);
  min-height: 130px;
}

.module-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 10px;
  border-bottom: 1px solid var(--border);
}

.module-card-icon {
  font-size: 28px;
  color: var(--green);
}

.module-card-badge {
  background-color: var(--green);
  color: #fff;
  padding: 5px 10px;
  border-radius: 10px;
}

.module-card-content {
  padding: 20px;
}

.module-card-title {
  font-size: 13px;
  font-weight: bold;
  color: var(--t1);
}

.module-card-description {
  font-size: 11px;
  color: var(--t3);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.module-card-footer {
  padding: 10px;
  border-top: 1px solid var(--border);
}

.module-card-link {
  text-decoration: none;
  color: var(--t2);
}

.more-page {
  padding: 20px;
}

.more-page-title {
  font-size: 24px;
  font-weight: bold;
  color: var(--t1);
}

.more-page-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.more-page-settings {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg);
}

.more-page-settings-dark-mode {
  display: flex;
  align-items: center;
}

.more-page-settings-dark-mode-label {
  font-size: 14px;
  color: var(--t2);
}

.more-page-settings-dark-mode input {
  margin-left: 10px;
}

.more-page-settings-version {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.more-page-settings-version-label {
  font-size: 14px;
  color: var(--t2);
}

.more-page-settings-version-value {
  font-size: 14px;
  color: var(--t1);
}

.more-page-settings-github {
  display: flex;
  align-items: center;
  margin-top: 10px;
}

.more-page-settings-github-label {
  font-size: 14px;
  color: var(--t2);
}

.more-page-settings-github a {
  text-decoration: none;
  color: var(--t2);
  margin-left: 10px;
}
```
J'ai créé le composant `ModuleCard` pour afficher chaque module premium, et le composant `More` pour afficher la grille de modules et les paramètres de l'application. J'ai également ajouté les styles nécessaires pour la grille et les paramètres.