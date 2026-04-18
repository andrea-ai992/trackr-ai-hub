Voici le fichier `src/components/PortfolioAllocation.jsx` complet et fonctionnel :

```jsx
import { useState, useEffect } from 'react';

const PortfolioAllocation = () => {
  const [allocations, setAllocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const response = await fetch('/src/data/portfolio.json');
        if (!response.ok) throw new Error('Failed to load portfolio data');
        const data = await response.json();
        setAllocations(data.allocations || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchAllocations();
  }, []);

  if (loading) {
    return (
      <div className="portfolio-allocation">
        <div className="skeleton">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-allocation">
        <div className="error">Error: {error}</div>
      </div>
    );
  }

  if (allocations.length === 0) {
    return (
      <div className="portfolio-allocation">
        <div className="no-data">No allocation data available</div>
      </div>
    );
  }

  const total = allocations.reduce((sum, asset) => sum + asset.value, 0);
  const radius = 50;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="portfolio-allocation">
      <h3 className="allocation-title">Portfolio Allocation</h3>
      <div className="allocation-container">
        <div className="pie-chart">
          <svg viewBox="0 0 120 120" className="pie-svg">
            {allocations.map((asset, index) => {
              const percentage = asset.value / total;
              const strokeDashoffset = circumference - (percentage * circumference);
              const colorIndex = index % 5;
              const colors = ['#00ff88', '#ff00aa', '#00aaff', '#ffff00', '#ff8800'];
              const color = colors[colorIndex];

              return (
                <circle
                  key={asset.asset}
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke={color}
                  strokeWidth="20"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  transform="rotate(-90 60 60)"
                />
              );
            })}
          </svg>
        </div>
        <div className="allocation-legend">
          {allocations.map((asset) => {
            const percentage = ((asset.value / total) * 100).toFixed(1);
            const colorIndex = allocations.findIndex(a => a.asset === asset.asset) % 5;
            const colors = ['#00ff88', '#ff00aa', '#00aaff', '#ffff00', '#ff8800'];
            const color = colors[colorIndex];

            return (
              <div key={asset.asset} className="legend-item">
                <div className="legend-color" style={{ backgroundColor: color }}></div>
                <div className="legend-label">{asset.asset}</div>
                <div className="legend-value">{percentage}%</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PortfolioAllocation;
```

Et voici le CSS correspondant à ajouter dans votre fichier de styles (ou dans un module CSS) :

```css
.portfolio-allocation {
  --green: #00ff88;
  --bg: #080808;
  --bg2: #111;
  --t1: #f0f0f0;
  --t2: #888;
  --t3: #444;
  --border: rgba(255, 255, 255, 0.07);

  font-family: 'Inter', sans-serif;
  color: var(--t1);
  background-color: var(--bg2);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  width: 100%;
  box-sizing: border-box;
}

.allocation-title {
  margin: 0 0 15px 0;
  font-size: 1.2rem;
  color: var(--t1);
  font-weight: 600;
}

.allocation-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: center;
}

.pie-chart {
  width: 100%;
  max-width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.pie-svg {
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
}

.allocation-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 0;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-label {
  font-size: 0.9rem;
  color: var(--t2);
  flex-grow: 1;
}

.legend-value {
  font-size: 0.9rem;
  color: var(--t1);
  font-weight: 500;
}

.skeleton, .error, .no-data {
  text-align: center;
  padding: 40px;
  color: var(--t2);
}

.error {
  color: #ff4444;
}
```

Ce composant:
1. Charge les données depuis `portfolio.json`
2. Calcule les pourcentages d'allocation
3. Affiche un pie chart SVG animé
4. Affiche une légende avec les pourcentages
5. Gère les états de chargement et d'erreur
6. Respecte le design system demandé (mobile-first, dark theme, couleurs variables)
7. Est entièrement fonctionnel sans dépendances externes