**src/pages/News.jsx**
```jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NewsCard } from '../components/NewsCard';
import { SearchBar } from '../components/SearchBar';
import { useTheme } from '../theme';

const News = () => {
  const location = useLocation();
  const theme = useTheme();

  return (
    <div className={`container ${theme.className}`}>
      <header className="sticky top-0 bg-${theme.bg2} py-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-${theme.t1} font-bold">News</h1>
          <SearchBar />
        </div>
      </header>
      <main className="py-8">
        <div className="container mx-auto">
          <ul className="flex overflow-x-scroll">
            <li className="mr-4">
              <Link to="/news/tout" className="text-${theme.t2} hover:text-${theme.green}">
                Tout
              </Link>
            </li>
            <li className="mr-4">
              <Link to="/news/tech" className="text-${theme.t2} hover:text-${theme.green}">
                Tech
              </Link>
            </li>
            <li className="mr-4">
              <Link to="/news/finance" className="text-${theme.t2} hover:text-${theme.green}">
                Finance
              </Link>
            </li>
            <li className="mr-4">
              <Link to="/news/sports" className="text-${theme.t2} hover:text-${theme.green}">
                Sports
              </Link>
            </li>
            <li className="mr-4">
              <Link to="/news/crypto" className="text-${theme.t2} hover:text-${theme.green}">
                Crypto
              </Link>
            </li>
            <li className="mr-4">
              <Link to="/news/france" className="text-${theme.t2} hover:text-${theme.green}">
                France
              </Link>
            </li>
          </ul>
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
            <NewsCard
              title="Titre 1"
              source="BBC"
              date="Hier à 10h"
              description="Description 1"
              image="https://via.placeholder.com/80"
              accentColor="#c00"
            />
            <NewsCard
              title="Titre 2"
              source="Bloomberg"
              date="Aujourd'hui à 12h"
              description="Description 2"
              image="https://via.placeholder.com/80"
              accentColor="#1a1a1a"
            />
            <NewsCard
              title="Titre 3"
              source="CoinDesk"
              date="Hier à 14h"
              description="Description 3"
              image="https://via.placeholder.com/80"
              accentColor="#f7931a"
            />
          </ul>
        </div>
      </main>
    </div>
  );
};

export default News;
```

**src/components/NewsCard.jsx**
```jsx
import React from 'react';
import { useTheme } from '../theme';

const NewsCard = ({ title, source, date, description, image, accentColor }) => {
  const theme = useTheme();

  return (
    <div className="bg-${theme.bg} p-4 rounded-md shadow-md">
      <h2 className="text-${theme.t1} font-bold mb-2">{title}</h2>
      <p className="text-${theme.t2} mb-4">{description}</p>
      <div className="flex justify-between items-center mb-4">
        <span className={`text-${theme.t3} ${accentColor === '#c00' ? 'bg-${accentColor}' : accentColor === '#1a1a1a' ? 'border-${accentColor}' : accentColor === '#f7931a' ? 'bg-${accentColor}' : ''} py-1 px-2 rounded-md`}>{source}</span>
        <span className="text-${theme.t3}">{date}</span>
      </div>
      {image && (
        <img src={image} alt="Image" className="w-20 h-20 rounded-md object-cover" />
      )}
    </div>
  );
};

export default NewsCard;
```

**src/components/SearchBar.jsx**
```jsx
import React, { useState } from 'react';
import { useTheme } from '../theme';

const SearchBar = () => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="relative">
      <input
        type="search"
        placeholder="Recherche"
        className={`py-2 pl-10 pr-4 text-${theme.t2} rounded-md focus:outline-none focus:ring-${theme.green}`}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      <button
        type="button"
        className={`absolute top-0 right-0 py-2 px-4 text-${theme.t2} bg-${theme.bg2} hover:bg-${theme.bg} rounded-md`}
        onClick={() => console.log('Search button clicked')}
      >
        Recherche
      </button>
    </div>
  );
};

export default SearchBar;
```

**src/theme.js**
```jsx
import { createTheme } from 'styled-components';

const theme = createTheme({
  className: 'dark',
  bg: '#080808',
  bg2: '#111',
  t1: '#f0f0f0',
  t2: '#888',
  t3: '#444',
  green: '#00ff88',
  border: 'rgba(255, 255, 255, 0.07)',
});

export default theme;
```

**src/utils/inter.css**
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.sticky {
  position: sticky;
  top: 0;
}

.bg-${theme.bg} {
  background-color: var(--bg);
}

.text-${theme.t1} {
  color: var(--t1);
}

.text-${theme.t2} {
  color: var(--t2);
}

.text-${theme.t3} {
  color: var(--t3);
}

.bg-${theme.bg2} {
  background-color: var(--bg2);
}

.shadow-md {
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.rounded-md {
  border-radius: 0.375rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.py-4 {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

.pl-10 {
  padding-left: 2.5rem;
}

.pr-4 {
  padding-right: 1.5rem;
}

.text-${theme.green} {
  color: var(--green);
}

.bg-${accentColor} {
  background-color: var(--accentColor);
}

.border-${accentColor} {
  border: 1px solid var(--accentColor);
}

.py-1 {
  padding-top: 0.25rem;
  padding-bottom: 0.25rem;
}

.px-2 {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

.rounded-md {
  border-radius: 0.375rem;
}

.w-20 {
  width: 5rem;
}

.h-20 {
  height: 5rem;
}

.object-cover {
  object-fit: cover;
}
```

**src/utils/vars.css**
```css
:root {
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --green: #00ff88;
  --border: rgba(255, 255, 255, 0.07);
}