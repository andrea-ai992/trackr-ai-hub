Création de la page Patterns avec pagination

```javascript
// src/components/Patterns.js

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Icon } from 'lucide-react';

const Patterns = () => {
  const navigate = useNavigate();

  const patterns = [
    {
      id: 1,
      name: 'Candlestick Pattern',
      description: 'Candlestick pattern description',
      svg: (
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M 20 20 L 80 20 L 80 80 L 20 80 Z" />
        </svg>
      ),
    },
    // Ajouter les 15 autres patterns chartistes SVG
  ];

  const handleNavigate = (id) => {
    navigate(`/patterns/${id}`);
  };

  const handlePrevPage = () => {
    const currentPage = Math.floor(Math.random() * 10);
    const nextPage = Math.max(0, currentPage - 1);
    navigate(`/patterns/page/${nextPage}`);
  };

  const handleNextPage = () => {
    const currentPage = Math.floor(Math.random() * 10);
    const nextPage = Math.min(10, currentPage + 1);
    navigate(`/patterns/page/${nextPage}`);
  };

  const itemsPerPage = 4;
  const currentPage = Math.floor(Math.random() * 10);
  const startIndex = currentPage * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatterns = patterns.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[var(--bg)]">
      <h1 className="text-[var(--t1)] text-4xl font-bold mb-4">Patterns</h1>
      <div className="flex flex-wrap justify-center mb-4">
        {paginatedPatterns.map((pattern, index) => (
          <div
            key={pattern.id}
            className="bg-[var(--bg2)] rounded-lg p-4 m-2 cursor-pointer"
            onClick={() => handleNavigate(pattern.id)}
          >
            <h2 className="text-[var(--t2)] text-lg font-bold mb-2">{pattern.name}</h2>
            <p className="text-[var(--t3)] text-sm">{pattern.description}</p>
            <div className="w-full h-64 bg-[var(--bg3)] rounded-lg mt-4">
              {pattern.svg}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between w-full mb-4">
        <button
          className="bg-[var(--bg2)] rounded-lg p-4 text-[var(--t2)] text-lg font-bold hover:bg-[var(--bg3)]"
          onClick={handlePrevPage}
        >
          <Icon name="arrow-left" size={24} />
          Précédent
        </button>
        <button
          className="bg-[var(--bg2)] rounded-lg p-4 text-[var(--t2)] text-lg font-bold hover:bg-[var(--bg3)]"
          onClick={handleNextPage}
        >
          Suivant
          <Icon name="arrow-right" size={24} />
        </button>
      </div>
    </div>
  );
};

export default Patterns;
```

```css
/* src/components/Patterns.css */

.patterns {
  @apply flex flex-col items-center justify-center h-screen bg-[var(--bg)] dark:bg-[var(--bg)] text-[var(--t1)] text-4xl font-bold mb-4;
}

.patterns h1 {
  @apply text-[var(--t1)] text-4xl font-bold mb-4;
}

.patterns .pattern {
  @apply bg-[var(--bg2)] rounded-lg p-4 m-2 cursor-pointer;
}

.patterns .pattern h2 {
  @apply text-[var(--t2)] text-lg font-bold mb-2;
}

.patterns .pattern p {
  @apply text-[var(--t3)] text-sm;
}

.patterns .pattern svg {
  @apply w-full h-64 bg-[var(--bg3)] rounded-lg mt-4;
}

.patterns .pagination {
  @apply flex justify-between w-full mb-4;
}

.patterns .pagination button {
  @apply bg-[var(--bg2)] rounded-lg p-4 text-[var(--t2)] text-lg font-bold hover:bg-[var(--bg3)];
}

.patterns .pagination button svg {
  @apply mr-2;
}
```

```javascript
// src/App.js

import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Patterns from './components/Patterns';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/patterns" element={<Patterns />} />
        <Route path="/patterns/page/:page" element={<Patterns />} />
        <Route path="/patterns/:id" element={<PatternDetail />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
```

```javascript
// src/components/PatternDetail.js

import React from 'react';

const PatternDetail = () => {
  return (
    <div>
      <h1>Pattern Detail</h1>
    </div>
  );
};

export default PatternDetail;