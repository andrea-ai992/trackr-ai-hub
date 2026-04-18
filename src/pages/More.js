Crée un nouveau fichier `src/pages/More.js` avec le code suivant :

```javascript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '@supabase/ui';
import { Inter } from 'next/font/google';
import styles from '../styles/More.module.css';

const inter = Inter({ subsets: ['latin'] });

const More = () => {
  const theme = useTheme();
  const location = useLocation();

  const newData = [
    { id: 1, name: 'Badge 1', status: 'NEW' },
    { id: 2, name: 'Badge 2', status: 'LIVE' },
    { id: 3, name: 'Badge 3', status: 'NEW' },
    { id: 4, name: 'Badge 4', status: 'LIVE' },
    { id: 5, name: 'Badge 5', status: 'NEW' },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>More</h1>
      <div className={styles.badges}>
        {newData.map((badge) => (
          <div
            key={badge.id}
            className={`${styles.badge} ${
              badge.status === 'NEW' ? styles.new : styles.live
            }`}
          >
            <span className={styles.name}>{badge.name}</span>
            <span className={styles.status}>{badge.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default More;
```

Crée un nouveau fichier `src/styles/More.module.css` avec le code suivant :

```css
.container {
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.badges {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.badge {
  padding: 10px 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.new {
  background-color: var(--green);
  color: var(--t1);
}

.live {
  background-color: var(--bg2);
  color: var(--t2);
}

.name {
  font-size: 16px;
  font-weight: bold;
}

.status {
  font-size: 14px;
  color: var(--t3);
}
```

Ajoute les CSS vars dans `src/styles/global.css` :

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
```

Maintenant, tu peux accéder à la page More en utilisant l'URL `/more`. Les badges NEW et LIVE seront affichés avec un effet de fond qui change en fonction de l'état des données.