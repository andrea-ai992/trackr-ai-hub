// src/components/NewsHeader.jsx
import React from 'react';
import { useTheme } from '../hooks/useTheme';

const NewsHeader = ({ categories, activeCategory, onCategoryChange }) => {
  const theme = useTheme();

  return (
    <header className="news-header">
      <div className="categories">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-btn ${category === activeCategory ? 'active' : ''}`}
            onClick={() => onCategoryChange(category)}
          >
            {category}
          </button>
        ))}
      </div>
      <style jsx>{`
        .news-header {
          position: sticky;
          top: 0;
          background-color: var(--bg);
          padding: 1rem;
          display: flex;
          justify-content: flex-start;
          align-items: center;
          z-index: 100;
          font-family: 'JetBrains Mono', monospace;
        }
        .categories {
          display: flex;
          gap: 0.75rem;
          overflow-x: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .categories::-webkit-scrollbar {
          display: none;
        }
        .category-btn {
          background-color: var(--surface-low);
          color: var(--text-primary);
          padding: 0.5rem 1rem;
          border: 1px solid var(--border);
          border-radius: 0.25rem;
          cursor: pointer;
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.875rem;
          white-space: nowrap;
          transition: all 0.2s ease;
        }
        .category-btn.active {
          background-color: var(--surface-high);
          color: var(--neon);
          border-color: var(--neon);
        }
        .category-btn:hover:not(.active) {
          background-color: var(--surface);
        }
      `}</style>
    </header>
  );
};

export default NewsHeader;