Je vais créer un composant `SkeletonShimmer.jsx` complet et fonctionnel avec un effet de pulse pour les placeholders des patterns, puis l'intégrer dans `Pattern.jsx`.

```jsx
// src/components/SkeletonShimmer.jsx
import React from 'react';

const SkeletonShimmer = ({ width = '100%', height = '1.5rem', borderRadius = '0.25rem' }) => {
  return (
    <div
      className="skeleton-shimmer"
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: 'var(--bg2)',
        position: 'relative',
        overflow: 'hidden',
        display: 'inline-block'
      }}
    >
      <style jsx>{`
        .skeleton-shimmer {
          animation: pulse 1.5s ease-in-out 0.5s infinite;
          background: linear-gradient(
            90deg,
            var(--bg2) 25%,
            var(--border) 50%,
            var(--bg2) 75%
          );
          background-size: 200% 100%;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 0.6;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default SkeletonShimmer;
```

```jsx
// src/pages/Patterns.jsx
import React, { useState, useEffect } from 'react';
import SkeletonShimmer from '../components/SkeletonShimmer';

const Patterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation de chargement des données
    const timer = setTimeout(() => {
      setPatterns(Array(16).fill({
        id: '',
        name: '',
        description: '',
        image: '',
        category: ''
      }));
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="patterns-page">
        <header className="patterns-header">
          <h1>Patterns <span className="subtitle">16 designs</span></h1>
        </header>

        <div className="patterns-grid">
          {Array(16).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="pattern-card skeleton">
              <div className="pattern-image">
                <SkeletonShimmer width="100%" height="12rem" borderRadius="0.5rem" />
              </div>
              <div className="pattern-info">
                <div className="pattern-name">
                  <SkeletonShimmer width="80%" height="1.25rem" borderRadius="0.25rem" />
                </div>
                <div className="pattern-category">
                  <SkeletonShimmer width="60%" height="1rem" borderRadius="0.25rem" />
                </div>
                <div className="pattern-description">
                  <SkeletonShimmer width="100%" height="1rem" borderRadius="0.25rem" />
                  <SkeletonShimmer width="90%" height="1rem" borderRadius="0.25rem" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="patterns-page">
      <header className="patterns-header">
        <h1>Patterns <span className="subtitle">16 designs</span></h1>
      </header>

      <div className="patterns-grid">
        {patterns.map((pattern) => (
          <div key={pattern.id} className="pattern-card">
            <div className="pattern-image">
              <img
                src={pattern.image || '/placeholder-pattern.png'}
                alt={pattern.name || 'Pattern'}
                loading="lazy"
              />
            </div>
            <div className="pattern-info">
              <h3 className="pattern-name">{pattern.name}</h3>
              <span className="pattern-category">{pattern.category}</span>
              <p className="pattern-description">{pattern.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Patterns;
```

```css
/* src/pages/Patterns.css */
.patterns-page {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  padding: 1rem;
}

.patterns-header {
  margin-bottom: 2rem;
  text-align: center;
}

.patterns-header h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: var(--green);
  margin: 0;
}

.subtitle {
  font-size: 1rem;
  color: var(--t2);
  margin-left: 0.5rem;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.pattern-card {
  background-color: var(--bg2);
  border-radius: 0.75rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--border);
}

.pattern-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 255, 136, 0.1);
}

.pattern-image {
  width: 100%;
  height: 12rem;
  background-color: var(--bg3);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.pattern-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pattern-info {
  padding: 1rem;
}

.pattern-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--t1);
  margin: 0 0 0.25rem 0;
}

.pattern-category {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--green);
  background-color: rgba(0, 255, 136, 0.1);
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  margin-bottom: 0.5rem;
}

.pattern-description {
  font-size: 0.875rem;
  color: var(--t2);
  line-height: 1.4;
  margin: 0;
}

/* Skeleton specific styles */
.pattern-card.skeleton {
  background-color: var(--bg2);
  border: 1px solid var(--border);
}

.pattern-card.skeleton .pattern-image {
  background-color: var(--bg3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pattern-card.skeleton .pattern-info {
  padding: 1rem;
}