Je vais implémenter le composant `ShimmerSkeleton` et l'intégrer dans `Patterns.jsx` pour les 16 patterns chartistes.

```jsx
// src/components/ui/ShimmerSkeleton.jsx
import React from 'react';

const ShimmerSkeleton = ({
  width = '100%',
  height = '1.5rem',
  borderRadius = '0.25rem',
  className = '',
  animate = true
}) => {
  return (
    <div
      className={`shimmer-skeleton ${animate ? 'shimmer-animate' : ''} ${className}`}
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};

export default ShimmerSkeleton;
```

```css
/* src/components/ui/ShimmerSkeleton.css */
.shimmer-skeleton {
  background: linear-gradient(90deg, var(--border) 25%, var(--bg2) 50%, var(--border) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

.shimmer-skeleton::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(0, 255, 136, 0.2) 50%,
    transparent 100%
  );
  transform: translateX(-100%);
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

```jsx
// src/pages/Patterns/Patterns.jsx
import React, { useState, useEffect } from 'react';
import ShimmerSkeleton from '../../components/ui/ShimmerSkeleton';
import './Patterns.css';

const Patterns = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const patterns = [
    'Tête et épaules', 'Double top', 'Double bottom', 'Tête et épaules inversé',
    'Canal haussier', 'Canal baissier', 'Triangle ascendant', 'Triangle descendant',
    'Triangle symétrique', 'Wedge ascendant', 'Wedge descendant', 'Fanion haussier',
    'Fanion baissier', 'Rectangle haussier', 'Rectangle baissier', 'Épaule-tête-épaule'
  ];

  return (
    <div className="patterns-page">
      <header className="patterns-header">
        <h1>Patterns Chartistes</h1>
        <p>Analyse technique des configurations graphiques</p>
      </header>

      <main className="patterns-grid">
        {loading ? (
          Array.from({ length: 16 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="pattern-card skeleton">
              <ShimmerSkeleton
                width="100%"
                height="12rem"
                borderRadius="0.5rem"
                className="pattern-image-skeleton"
              />
              <div className="pattern-info">
                <ShimmerSkeleton width="80%" height="1.5rem" className="pattern-title-skeleton" />
                <ShimmerSkeleton width="60%" height="1rem" className="pattern-desc-skeleton" />
              </div>
            </div>
          ))
        ) : (
          patterns.map((pattern, index) => (
            <div key={pattern} className="pattern-card">
              <div className="pattern-image">
                <img
                  src={`/patterns/${pattern.toLowerCase().replace(/\s+/g, '-')}.png`}
                  alt={pattern}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/patterns/default.png';
                  }}
                />
              </div>
              <div className="pattern-info">
                <h3>{pattern}</h3>
                <p>Configuration graphique {index + 1}</p>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default Patterns;
```

```css
/* src/pages/Patterns/Patterns.css */
.patterns-page {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  padding: 1rem;
}

.patterns-header {
  text-align: center;
  margin-bottom: 2rem;
}

.patterns-header h1 {
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  color: var(--green);
}

.patterns-header p {
  font-size: 1rem;
  color: var(--t2);
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin: 0 auto;
  max-width: 1200px;
}

.pattern-card {
  background-color: var(--bg2);
  border-radius: 0.5rem;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--border);
}

.pattern-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 255, 136, 0.1);
}

.pattern-card.skeleton {
  background-color: var(--bg2);
  border: 1px solid var(--border);
}

.pattern-image {
  width: 100%;
  height: 12rem;
  background-color: var(--bg3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.pattern-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.pattern-image-skeleton {
  width: 100%;
  height: 12rem;
}

.pattern-info {
  padding: 1rem;
}

.pattern-title-skeleton {
  margin-bottom: 0.5rem;
}

.pattern-desc-skeleton {
  margin-bottom: 0.25rem;
}

.pattern-info h3 {
  font-size: 1rem;
  margin-bottom: 0.25rem;
  color: var(--t1);
}

.pattern-info p {
  font-size: 0.875rem;
  color: var(--t2);
}