Création de src/pages/More.jsx
```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ModuleCard } from './ModuleCard';
import { Inter } from 'next/font/google';
import styles from '../styles/Mobile.module.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const modules = [
  {
    id: 1,
    title: 'FlightTracker',
    description: 'Suivi de vols',
    icon: '✈️',
    badge: 'LIVE',
    link: '/flighttracker',
  },
  {
    id: 2,
    title: 'CryptoTrader',
    description: 'Trading crypto',
    icon: '📈',
    badge: 'NEW',
    link: '/cryptotrader',
  },
  {
    id: 3,
    title: 'Signals IA',
    description: 'Signaux IA',
    icon: '⚡',
    badge: 'NEW',
    link: '/signals-ia',
  },
  {
    id: 4,
    title: 'Portfolio',
    description: 'Gestion de portefeuille',
    icon: '💼',
    badge: '',
    link: '/portfolio',
  },
  {
    id: 5,
    title: 'Patterns',
    description: 'Modèles',
    icon: '📊',
    badge: '',
    link: '/patterns',
  },
  {
    id: 6,
    title: 'Translator',
    description: 'Traducteur',
    icon: '🌐',
    badge: '',
    link: '/translator',
  },
  {
    id: 7,
    title: 'RealEstate',
    description: 'Immobilier',
    icon: '🏠',
    badge: 'PRO',
    link: '/realestate',
  },
  {
    id: 8,
    title: 'Sneakers',
    description: 'Sneakers',
    icon: '👟',
    badge: '',
    link: '/sneakers',
  },
  {
    id: 9,
    title: 'Watches',
    description: 'Montres',
    icon: '⌚',
    badge: 'PRO',
    link: '/watches',
  },
  {
    id: 10,
    title: 'BusinessPlan',
    description: 'Plan d\'entreprise',
    icon: '📋',
    badge: '',
    link: '/businessplan',
  },
];

const More = () => {
  const location = useLocation();

  return (
    <div className={`${styles.container} ${styles.darkMode}`}>
      <h1 className={styles.title}>Modules premium</h1>
      <div className={styles.modules}>
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            title={module.title}
            description={module.description}
            icon={module.icon}
            badge={module.badge}
            link={module.link}
          />
        ))}
      </div>
      <div className={styles.settings}>
        <div className={styles.darkModeToggle}>
          <input
            type="checkbox"
            id="dark-mode-toggle"
            className={styles.checkbox}
            disabled
            title="Dark mode déjà activé"
          />
          <label className={styles.label} htmlFor="dark-mode-toggle">
            Dark mode
          </label>
        </div>
        <p className={styles.version}>Version app : v3.0</p>
        <p className={styles.github}>
          <a
            href="https://github.com/andrea-ai992/trackr-ai-hub"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
};

export default More;
```

Création de src/components/ModuleCard.jsx
```jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Inter } from 'next/font/google';
import styles from './ModuleCard.module.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const ModuleCard = ({ title, description, icon, badge, link }) => {
  return (
    <div className={`${styles.card} ${styles.minHeight}`}>
      <div className={styles.icon}>{icon}</div>
      <div className={styles.badge}>{badge}</div>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
      <Link to={link} className={styles.link}>
        Découvrir
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={styles.chevron}
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0V0z" fill="none" />
          <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
        </svg>
      </Link>
    </div>
  );
};

export default ModuleCard;
```

Création de src/styles/Mobile.module.css
```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.modules {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.card {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.minHeight {
  min-height: 130px;
}

.icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 10px;
  background-color: var(--green);
  color: var(--t1);
}

.title {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  font-size: 11px;
  color: var(--t3);
  line-height: 1.5;
}

.link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t1);
  text-decoration: none;
}

.chevron {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}

.settings {
  margin-top: 40px;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.darkModeToggle {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.checkbox {
  margin-right: 10px;
}

.label {
  font-size: 14px;
  color: var(--t2);
}

.version {
  font-size: 14px;
  color: var(--t2);
  margin-bottom: 10px;
}

.github {
  font-size: 14px;
  color: var(--t2);
}
```

Création de src/styles/ModuleCard.module.css
```css
.card {
  background-color: var(--bg2);
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.minHeight {
  min-height: 130px;
}

.icon {
  font-size: 28px;
  margin-bottom: 10px;
}

.badge {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 5px 10px;
  border-radius: 10px;
  background-color: var(--green);
  color: var(--t1);
}

.title {
  font-size: 13px;
  font-weight: bold;
  margin-bottom: 10px;
}

.description {
  font-size: 11px;
  color: var(--t3);
  line-height: 1.5;
}

.link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg2);
  color: var(--t1);
  text-decoration: none;
}

.chevron {
  width: 20px;
  height: 20px;
  margin-left: 10px;
}