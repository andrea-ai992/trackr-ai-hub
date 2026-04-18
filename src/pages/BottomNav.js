Créer un nouveau fichier `src/pages/BottomNav.js` avec le code suivant :

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Inter } from 'next/font/google';
import styles from '../styles/BottomNav.module.css';

const inter = Inter({ subsets: ['latin'] });

const BottomNav = () => {
  const [newss, setNewss] = useState([]);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data, error } = await supabase
          .from('news')
          .select('title, link, read')
          .eq('read', false)
          .limit(1);

        if (error) {
          throw error;
        }

        setNewss(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchNews();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const fetchNews = async () => {
        try {
          const { data, error } = await supabase
            .from('news')
            .select('title, link, read')
            .eq('read', false)
            .limit(1);

          if (error) {
            throw error;
          }

          setNewss(data);
        } catch (error) {
          console.error(error);
        }
      };

      fetchNews();
    }, 60000); // Mettre à jour les données toutes les 1 minute

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className={styles.bottomNav}>
      <div className={styles.newsBadge}>
        {newss.length > 0 && (
          <Link to="/news" className={styles.newsBadgeLink}>
            <span className={styles.badgeText}>
              Nouvelle
              <span className={styles.badgeCount}>{newss.length}</span>
            </span>
          </Link>
        )}
      </div>
      <ul className={styles.bottomNavList}>
        <li className={styles.bottomNavItem}>
          <Link to="/sports" className={styles.bottomNavItemLink}>
            Sports
          </Link>
        </li>
        <li className={styles.bottomNavItem}>
          <Link to="/markets" className={styles.bottomNavItemLink}>
            Marchés
          </Link>
        </li>
        <li className={styles.bottomNavItem}>
          <Link to="/more" className={styles.bottomNavItemLink}>
            Plus
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default BottomNav;
```

Créer un nouveau fichier `src/styles/BottomNav.module.css` avec le code suivant :

```css
.bottomNav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: var(--bg);
  color: var(--t1);
}

.newsBadge {
  position: relative;
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 0.2rem;
  background-color: var(--bg2);
  color: var(--t2);
}

.newsBadgeLink {
  text-decoration: none;
  color: var(--t2);
}

.badgeText {
  font-size: 1rem;
  font-weight: bold;
}

.badgeCount {
  font-size: 0.8rem;
  font-weight: normal;
  margin-left: 0.2rem;
}

.bottomNavList {
  display: flex;
  justify-content: space-between;
  align-items: center;
  list-style: none;
  padding: 0;
  margin: 0;
}

.bottomNavItem {
  margin-right: 1rem;
}

.bottomNavItemLink {
  text-decoration: none;
  color: var(--t2);
}
```

Créer un nouveau fichier `src/utils/supabase.js` avec le code suivant :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

Remplacez `https://your-supabase-url.supabase.co` par l'URL de votre base de données Supabase, `your-supabase-key` par la clé de votre base de données Supabase et `your-supabase-secret` par la clé secrète de votre base de données Supabase.