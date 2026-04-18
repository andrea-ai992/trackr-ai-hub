**src/components/Pagination.js**
```jsx
import React from 'react';

const Pagination = ({ totalItems, itemsPerPage, onPageChange }) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="pagination">
      {pages.map((page, index) => (
        <button
          key={index}
          className={`pagination-button ${page === 1 ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

export default Pagination;
```

**src/components/Patterns.js**
```jsx
import React, { useState, useEffect } from 'react';
import Pagination from './Pagination';
import { useMediaQuery } from 'react-responsive';
import { useTheme } from '@emotion/react';
import { css } from '@emotion/react';
import { Inter } from '@next/font/google';

const inter = Inter({ subsets: ['latin'] });

const patterns = [
  { id: 1, name: 'Pattern 1', svg: 'SVG 1' },
  { id: 2, name: 'Pattern 2', svg: 'SVG 2' },
  { id: 3, name: 'Pattern 3', svg: 'SVG 3' },
  // Ajoutez les 13 autres patterns ici
];

const perPage = 16;

const Patterns = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const theme = useTheme();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = currentPage * perPage;
  const displayedPatterns = patterns.slice(startIndex, endIndex);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setCurrentPage(1);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const onPageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div
      className={css`
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 20px;
        background-color: ${theme.vars.bg};
        color: ${theme.vars.t1};
      `}
    >
      <h1
        className={css`
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 10px;
          color: ${theme.vars.t2};
        `}
      >
        Patterns
      </h1>
      <div
        className={css`
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        `}
      >
        {displayedPatterns.map((pattern, index) => (
          <div
            key={index}
            className={css`
              display: flex;
              flex-direction: column;
              align-items: center;
              padding: 10px;
              background-color: ${theme.vars.bg2};
              border: 1px solid ${theme.vars.border};
              border-radius: 10px;
              cursor: pointer;
            `}
            onClick={() => console.log(pattern)}
          >
            <h2
              className={css`
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
                color: ${theme.vars.t3};
              `}
            >
              {pattern.name}
            </h2>
            <svg
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 10H90" />
              <path d="M10 90H90" />
              <path d="M10 10L90 90" />
              <path d="M90 10L10 90" />
            </svg>
          </div>
        ))}
      </div>
      <Pagination
        totalItems={patterns.length}
        itemsPerPage={perPage}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default Patterns;
```

**src/styles/global.css**
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

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
  line-height: 1.6;
  margin: 0;
  padding: 0;
}

a {
  text-decoration: none;
  color: var(--green);
}

a:hover {
  color: var(--green);
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.pagination-button {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 20px;
  cursor: pointer;
  margin: 0 5px;
}

.pagination-button.active {
  background-color: var(--green);
  color: var(--t1);
}

.pagination-button:hover {
  background-color: var(--bg2);
  color: var(--t1);
}