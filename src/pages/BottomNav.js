Fichier `src/pages/BottomNav.js` mis à jour :

```jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Inter } from 'next/font/google';
import styles from '../styles/BottomNav.module.css';
import { Icon } from 'lucide-react';
import { styled } from 'styled-components';

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
              <Icon icon="bell" size={20} />
              Nouvelle
              <span className={styles.badgeCount}>{newss.length}</span>
            </span>
          </Link>
        )}
      </div>
      <ul className={styles.bottomNavList}>
        <li className={styles.bottomNavItem}>
          <Link to="/sports" className={styles.bottomNavItemLink}>
            <Icon icon="soccer" size={20} />
            Sports
          </Link>
        </li>
        <li className={styles.bottomNavItem}>
          <Link to="/markets" className={styles.bottomNavItemLink}>
            <Icon icon="chart-bar" size={20} />
            Marchés
          </Link>
        </li>
        <li className={styles.bottomNavItem}>
          <Link to="/more" className={styles.bottomNavItemLink}>
            <Icon icon="plus" size={20} />
            Plus
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default BottomNav;
```

Fichier `src/styles/BottomNav.module.css` mis à jour :

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
  transition: background-color 0.2s ease-in-out;
}

.newsBadgeLink {
  text-decoration: none;
  color: var(--t2);
}

.badgeText {
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.badgeCount {
  font-size: 0.8rem;
  font-weight: normal;
  margin-left: 0.2rem;
}

.badgeCount::before {
  content: "";
  display: inline-block;
  width: 0.2rem;
  height: 0.2rem;
  border-radius: 50%;
  background-color: var(--green);
  margin-right: 0.1rem;
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
  display: flex;
  align-items: center;
}

.bottomNavItemLink:hover {
  color: var(--t3);
}

.bottomNavItemLink::before {
  content: "";
  display: inline-block;
  width: 0.2rem;
  height: 0.2rem;
  border-radius: 50%;
  background-color: var(--green);
  margin-right: 0.1rem;
}
```

Fichier `package.json` mis à jour :

```json
{
  "name": "trackr-ai-hub",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.3.0",
    "lucide-react": "^2.0.0",
    "styled-components": "^5.3.5",
    "next": "^13.1.3",
    "supabase-js": "^1.7.0"
  },
  "devDependencies": {
    "vite": "^4.3.0",
    "vite-plugin-css-modules": "^1.0.0",
    "vite-plugin-react": "^1.0.0",
    "esbuild": "^0.18.22",
    "postcss": "^8.4.14",
    "postcss-modules": "^3.0.0",
    "postcss-preset-env": "^7.8.4",
    "autoprefixer": "^10.4.8",
    "cssnano": "^8.0.0",
    "prettier": "^2.7.1",
    "lint-staged": "^13.0.3",
    "husky": "^8.0.0"
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix"]
  },
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "prettier": {
    "printWidth": 120,
    "tabWidth": 2,
    "useTabs": false,
    "semi": true,
    "singleQuote": true,
    "trailingComma": "all",
    "bracketSpacing": true,
    "jsxBracketSameLine": true,
    "arrowParens": "avoid",
    "proseWrap": "preserve",
    "htmlWhitespaceSensitivity": "strict",
    "parser": "babel"
  }
}
```

Fichier `src/utils/supabase.js` mis à jour :

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-supabase-url.supabase.co';
const supabaseKey = 'your-supabase-key';
const supabaseSecret = 'your-supabase-secret';

const supabase = createClient(supabaseUrl, supabaseKey, supabaseSecret);

export default supabase;
```

Remplacez `https://your-supabase-url.supabase.co` par l'URL de votre base de données Supabase, `your-supabase-key` par la clé de votre base de données Supabase et `your-supabase-secret` par la clé secrète de votre base de données Supabase.