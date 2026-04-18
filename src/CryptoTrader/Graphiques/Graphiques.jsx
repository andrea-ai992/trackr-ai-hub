Création de src/CryptoTrader/Graphiques/Graphiques.jsx

```jsx
// Importations
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Inter } from '@next/font/google';
import { supabase } from '../supabaseClient';
import { Lucide } from 'lucide-react';

// Définition des styles
const inter = Inter({
  subsets: ['latin'],
  variable: '--inter',
});

const styles = {
  container: {
    backgroundColor: 'var(--bg)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    color: 'var(--t1)',
    fontWeight: 'bold',
  },
  graph: {
    width: '100%',
    height: '300px',
    backgroundColor: 'var(--bg2)',
    borderRadius: '10px',
    padding: '20px',
  },
  button: {
    backgroundColor: 'var(--green)',
    color: 'var(--t1)',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
  },
  buttonHover: {
    backgroundColor: 'var(--green)',
    color: 'var(--t1)',
    padding: '10px 20px',
    borderRadius: '10px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease-in-out',
  },
};

// Définition de la fonction
function Graphiques() {
  const [graphiques, setGraphiques] = useState([]);
  const location = useLocation();

  // Récupération des données
  useEffect(() => {
    const fetchGraphiques = async () => {
      try {
        const { data, error } = await supabase
          .from('graphiques')
          .select('id, titre, description, url');
        if (error) {
          console.error(error);
        } else {
          setGraphiques(data);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchGraphiques();
  }, []);

  // Fonction pour afficher les graphiques
  const afficherGraphique = (graphique) => {
    return (
      <div key={graphique.id} className="graph">
        <h2 className="title">{graphique.titre}</h2>
        <p className="description">{graphique.description}</p>
        <a href={graphique.url} target="_blank" rel="noopener noreferrer">
          <Lucide icon="external-link" size={24} />
        </a>
      </div>
    );
  };

  // Fonction pour afficher les boutons
  const afficherBouton = () => {
    return (
      <button
        className="button"
        style={{
          ...styles.button,
          backgroundColor: location.pathname === '/crypto-trader/graphiques' ? 'var(--green)' : 'var(--bg)',
        }}
        onClick={() => {
          location.pathname === '/crypto-trader/graphiques'
            ? location.pathname = '/crypto-trader/graphiques'
            : location.pathname = '/crypto-trader/graphiques';
        }}
      >
        <Lucide icon="chart-bar" size={24} />
        <span>Graphiques</span>
      </button>
    );
  };

  return (
    <div className={inter.className}>
      <div className="container">
        <div className="header">
          <h1 className="title">Graphiques</h1>
          <div>
            {afficherBouton()}
          </div>
        </div>
        <div>
          {graphiques.map((graphique) => afficherGraphique(graphique))}
        </div>
      </div>
    </div>
  );
}

export default Graphiques;
```

Mise à jour de src/CryptoTrader/CryptoTrader.jsx

```jsx
// Importations
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Lucide } from 'lucide-react';
import Graphiques from './Graphiques';

// Définition des styles
const styles = {
  container: {
    backgroundColor: 'var(--bg)',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '24px',
    color: 'var(--t1)',
    fontWeight: 'bold',
  },
};

// Définition de la fonction
function CryptoTrader() {
  const location = useLocation();

  // Fonction pour afficher les boutons
  const afficherBouton = () => {
    return (
      <div>
        <Link to="/crypto-trader/graphiques">
          <button
            className="button"
            style={{
              ...styles.button,
              backgroundColor: location.pathname === '/crypto-trader/graphiques' ? 'var(--green)' : 'var(--bg)',
            }}
          >
            <Lucide icon="chart-bar" size={24} />
            <span>Graphiques</span>
          </button>
        </Link>
      </div>
    );
  };

  return (
    <div>
      <div className="container">
        <div className="header">
          <h1 className="title">Crypto Trader</h1>
          <div>
            {afficherBouton()}
          </div>
        </div>
        <Graphiques />
      </div>
    </div>
  );
}

export default CryptoTrader;
```

Mise à jour de src/CryptoTrader/index.jsx

```jsx
// Importations
import React from 'react';
import CryptoTrader from './CryptoTrader';

// Définition de la fonction
function Index() {
  return (
    <div>
      <CryptoTrader />
    </div>
  );
}

export default Index;
```

Mise à jour de src/CryptoTrader/styles.css

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

.container {
  background-color: var(--bg);
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.title {
  font-size: 24px;
  color: var(--t1);
  font-weight: bold;
}

.graph {
  width: 100%;
  height: 300px;
  background-color: var(--bg2);
  border-radius: 10px;
  padding: 20px;
}

.button {
  background-color: var(--green);
  color: var(--t1);
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
}

.button:hover {
  background-color: var(--green);
  color: var(--t1);
  padding: 10px 20px;
  border-radius: 10px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
}