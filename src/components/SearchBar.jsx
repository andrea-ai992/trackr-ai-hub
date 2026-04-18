Création du composant SearchBar.jsx :
```jsx
// src/components/SearchBar.jsx

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Inter } from '@lucide-react-native/Inter';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="search-bar">
      <input
        type="search"
        placeholder="Recherchez une action ou cryptomonnaie..."
        value={searchQuery}
        onChange={handleSearch}
        className="search-input"
      />
      <Link to={`/markets/search?q=${searchQuery}`}>
        <button className="search-button">
          <Inter name="Search" size={20} color="--green" />
        </button>
      </Link>
    </div>
  );
};

export default SearchBar;
```

Création de la feuille de style pour le composant SearchBar :
```css
/* src/components/SearchBar.css */

.search-bar {
  position: sticky;
  top: 0;
  background-color: var(--bg);
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border);
}

.search-input {
  width: 100%;
  padding: 0.5rem;
  font-size: 1.2rem;
  font-family: Inter;
  color: var(--t1);
  background-color: var(--bg2);
  border: none;
  border-radius: 0.25rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.search-button {
  background-color: var(--bg);
  border: none;
  padding: 0.5rem;
  font-size: 1.2rem;
  font-family: Inter;
  color: var(--green);
  cursor: pointer;
}

.search-button:hover {
  background-color: var(--bg2);
}
```

Importation du composant SearchBar dans la page Markets :
```jsx
// src/pages/Markets.jsx

import React from 'react';
import SearchBar from '../components/SearchBar';
import { Link } from 'react-router-dom';

const Markets = () => {
  return (
    <div className="markets-page">
      <SearchBar />
      {/* ... */}
    </div>
  );
};

export default Markets;
```

Ajout de la feuille de style pour la page Markets :
```css
/* src/pages/Markets.css */

.markets-page {
  padding: 2rem;
  background-color: var(--bg);
  color: var(--t1);
}

.markets-page h1 {
  font-size: 2.5rem;
  font-family: Inter;
  color: var(--t2);
  margin-bottom: 1rem;
}
```

Importation des feuilles de style dans les composants :
```jsx
// src/components/SearchBar.jsx

import React from 'react';
import './SearchBar.css';

// ...

// src/pages/Markets.jsx

import React from 'react';
import './Markets.css';