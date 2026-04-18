Voici l'implémentation complète du fichier `src/pages/Patterns/Patterns.jsx` avec un skeleton shimmer neon réutilisable pour les 16 patterns chartistes :

```jsx
import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter } from 'lucide-react';
import './Patterns.css';

const ShimmerSkeleton = ({ width = '100%', height = '20px', borderRadius = '4px' }) => {
  return (
    <div
      className="shimmer-skeleton"
      style={{
        width,
        height,
        borderRadius,
      }}
    />
  );
};

const PatternCardSkeleton = () => {
  return (
    <div className="pattern-card skeleton">
      <div className="pattern-header">
        <ShimmerSkeleton width="80px" height="24px" borderRadius="12px" />
        <ShimmerSkeleton width="60px" height="24px" borderRadius="12px" />
      </div>
      <div className="pattern-content">
        <div className="pattern-chart">
          <ShimmerSkeleton width="100%" height="120px" borderRadius="8px" />
        </div>
        <div className="pattern-details">
          <ShimmerSkeleton width="100%" height="16px" borderRadius="4px" />
          <ShimmerSkeleton width="80%" height="16px" borderRadius="4px" />
          <div className="pattern-meta">
            <ShimmerSkeleton width="60px" height="12px" borderRadius="4px" />
            <ShimmerSkeleton width="40px" height="12px" borderRadius="4px" />
          </div>
        </div>
      </div>
    </div>
  );
};

const Patterns = () => {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchPatterns = async () => {
      try {
        // Simulation de chargement de données
        setTimeout(() => {
          const mockPatterns = Array.from({ length: 16 }, (_, i) => ({
            id: i + 1,
            name: `Pattern ${i + 1}`,
            type: ['Bullish', 'Bearish', 'Neutral'][Math.floor(Math.random() * 3)],
            description: `Description du pattern chartiste ${i + 1}`,
            reliability: Math.floor(Math.random() * 100) + 1,
            lastSeen: '2023-11-15',
          }));
          setPatterns(mockPatterns);
          setLoading(false);
        }, 1500);
      } catch (error) {
        console.error('Error fetching patterns:', error);
        setLoading(false);
      }
    };

    fetchPatterns();
  }, []);

  const filteredPatterns = patterns.filter((pattern) => {
    const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pattern.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || pattern.type.toLowerCase() === filter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="patterns-page">
      <header className="patterns-header">
        <button className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h1>Patterns Chartistes</h1>
      </header>

      <div className="patterns-controls">
        <div className="search-container">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher un pattern..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-container">
          <Filter size={16} className="filter-icon" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">Tous</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="patterns-grid skeleton-grid">
          {Array.from({ length: 16 }).map((_, index) => (
            <PatternCardSkeleton key={`skeleton-${index}`} />
          ))}
        </div>
      ) : (
        <>
          {filteredPatterns.length > 0 ? (
            <div className="patterns-grid">
              {filteredPatterns.map((pattern) => (
                <div key={pattern.id} className="pattern-card">
                  <div className="pattern-header">
                    <span className={`pattern-type ${pattern.type.toLowerCase()}`}>
                      {pattern.type}
                    </span>
                    <span className="pattern-reliability">
                      {pattern.reliability}%
                    </span>
                  </div>
                  <div className="pattern-content">
                    <div className="pattern-chart">
                      {/* Placeholder pour le graphique */}
                      <div className="chart-placeholder">
                        <ShimmerSkeleton width="100%" height="120px" borderRadius="8px" />
                      </div>
                    </div>
                    <div className="pattern-details">
                      <h3 className="pattern-name">{pattern.name}</h3>
                      <p className="pattern-description">{pattern.description}</p>
                      <div className="pattern-meta">
                        <span className="last-seen">Dernière détection: {pattern.lastSeen}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-results">
              <ShimmerSkeleton width="200px" height="24px" />
              <p>Aucun pattern trouvé correspondant à vos critères.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Patterns;
```

Et voici le contenu correspondant pour `src/pages/Patterns/Patterns.css` :

```css
:root {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --bg3: #1a1a1a;
  --border: rgba(255, 255, 255, 0.07);
  --border-hi: rgba(0, 255, 136, 0.2);
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
}

@font-face {
  font-family: 'Inter';
  src: local('Inter'), url('https://fonts.cdnfonts.com/css/inter') format('woff2');
  font-weight: 400;
  font-style: normal;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg);
  color: var(--t1);
}

.patterns-page {
  min-height: 100vh;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.patterns-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-button {
  background: none;
  border: none;
  color: var(--t1);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: var(--bg2);
}

.patterns-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
}

.patterns-controls {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.search-container, .filter-container {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--bg2);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.search-input, .filter-select {
  background: transparent;
  border: none;
  color: var(--t1);
  font-family: 'Inter', sans-serif;
  flex: 1;
}

.search-input {
  outline: none;
}

.filter-select {
  cursor: pointer;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.pattern-card {
  background-color: var(--bg2);
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--border);
  transition: all 0.2s;
}

.pattern-card:hover {
  border-color: var(--border-hi);
  transform: translateY(-2px);
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.pattern-type {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: capitalize;
}

.pattern-type.bullish {
  background-color: rgba(0, 255, 136, 0.1);
  color: var(--green);
}

.pattern-type.bearish {
  background-color: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.pattern-type.neutral {
  background-color: rgba(255, 255, 255, 0.1);
  color: var(--t1);
}

.pattern-reliability {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--green);
}

.pattern-content {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pattern-chart {
  width: 100%;
  height: 120px;
  background-color: var(--bg3);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-placeholder {
  width: 100%;
  height: 100%;
}

.pattern-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.pattern-name {
  font-size: 1rem;
  font-weight: 600;
}

.pattern-description {
  font-size: 0.875rem;
  color: var(--t2);
  line-height: 1.4;
}

.pattern-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: var(--t3);
}

.last-seen {
  color: var(--t3);
}

.no-results {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  text-align: center;
}

/* Skeleton Styles */
.shimmer-skeleton {
  background: linear-gradient(90deg, var(--bg3) 25%, var(--bg2) 50%, var(--bg3) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Skeleton Grid */
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .patterns-controls {
    flex-direction: column;
  }

  .patterns-grid {
    grid-template-columns: 1fr;
  }
}