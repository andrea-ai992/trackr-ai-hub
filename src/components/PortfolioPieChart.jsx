Je vais créer un composant PieChart SVG complet et autonome pour afficher l'allocation d'actifs à partir des données portfolio.json. Voici les fichiers nécessaires :

src/components/PortfolioPieChart.jsx
```jsx
import { useEffect, useState } from 'react';

const PortfolioPieChart = ({ data }) => {
  const [chartData, setChartData] = useState([]);
  const [total, setTotal] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    if (data && data.length > 0) {
      const filteredData = data.filter(item => item.allocation > 0);
      setChartData(filteredData);

      const sum = filteredData.reduce((acc, item) => acc + item.allocation, 0);
      setTotal(sum);
    }
  }, [data]);

  const radius = 80;
  const strokeWidth = 30;
  const center = radius + strokeWidth / 2;
  const size = radius * 2 + strokeWidth;

  const getPath = (startAngle, endAngle) => {
    const startRad = (startAngle - 90) * Math.PI / 180;
    const endRad = (endAngle - 90) * Math.PI / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  const getColor = (index) => {
    const colors = [
      'rgba(0, 255, 136, 0.8)',
      'rgba(0, 200, 255, 0.8)',
      'rgba(255, 100, 0, 0.8)',
      'rgba(255, 0, 200, 0.8)',
      'rgba(255, 255, 0, 0.8)',
      'rgba(100, 0, 255, 0.8)',
      'rgba(0, 255, 255, 0.8)',
      'rgba(255, 150, 150, 0.8)'
    ];
    return colors[index % colors.length];
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="portfolio-pie-chart empty">
        <p style={{ color: 'var(--t2)' }}>Aucune donnée d'allocation disponible</p>
      </div>
    );
  }

  return (
    <div className="portfolio-pie-chart">
      <div className="pie-chart-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <g transform={`translate(${center}, ${center})`}>
            {chartData.map((item, index) => {
              const startAngle = chartData.slice(0, index).reduce((acc, curr) => acc + (curr.allocation / total) * 360, 0);
              const endAngle = startAngle + (item.allocation / total) * 360;

              return (
                <path
                  key={item.asset}
                  d={getPath(startAngle, endAngle)}
                  fill={getColor(index)}
                  stroke="var(--bg2)"
                  strokeWidth={strokeWidth}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
                />
              );
            })}
          </g>
        </svg>
      </div>

      <div className="pie-chart-legend">
        {chartData.map((item, index) => {
          const percentage = ((item.allocation / total) * 100).toFixed(1);
          const isHovered = hoveredIndex === index;

          return (
            <div
              key={item.asset}
              className={`legend-item ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="legend-color" style={{ backgroundColor: getColor(index) }} />
              <div className="legend-info">
                <span className="legend-asset">{item.asset}</span>
                <span className="legend-percentage">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PortfolioPieChart;
```

src/components/PortfolioAllocation.jsx
```jsx
import { useEffect, useState } from 'react';
import PortfolioPieChart from './PortfolioPieChart';

const PortfolioAllocation = () => {
  const [portfolioData, setPortfolioData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPortfolioData = async () => {
      try {
        const response = await fetch('/data/portfolio.json');
        if (!response.ok) {
          throw new Error('Failed to fetch portfolio data');
        }
        const data = await response.json();
        setPortfolioData(data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchPortfolioData();
  }, []);

  if (loading) {
    return (
      <div className="portfolio-allocation loading">
        <div className="loading-spinner"></div>
        <p>Chargement des données...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portfolio-allocation error">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="portfolio-allocation">
      <h2>Allocation des actifs</h2>
      <div className="allocation-content">
        <PortfolioPieChart data={portfolioData} />
        <div className="allocation-summary">
          <div className="summary-item total-value">
            <span className="label">Valeur totale</span>
            <span className="value">
              {portfolioData.reduce((acc, item) => acc + item.value, 0).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR'
              })}
            </span>
          </div>
          <div className="summary-item asset-count">
            <span className="label">Nombre d'actifs</span>
            <span className="value">{portfolioData.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAllocation;
```

src/components/PortfolioAllocation.css
```css
.portfolio-allocation {
  --card-padding: 1.5rem;
  --card-gap: 1rem;

  width: 100%;
  max-width: 400px;
  background: var(--bg2);
  border-radius: 12px;
  padding: var(--card-padding);
  border: 1px solid var(--border);
  font-family: 'Inter', sans-serif;
}

.portfolio-allocation h2 {
  color: var(--t1);
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: var(--card-gap);
  text-align: center;
}

.portfolio-allocation.loading,
.portfolio-allocation.error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  min-height: 200px;
}

.portfolio-allocation.loading .loading-spinner {
  width: 30px;
  height: 30px;
  border: 3px solid var(--border);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.portfolio-allocation.error p {
  color: #ff4444;
  text-align: center;
}

.allocation-content {
  display: flex;
  flex-direction: column;
  gap: var(--card-gap);
}

.portfolio-pie-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.pie-chart-container {
  width: 100%;
  display: flex;
  justify-content: center;
}

.pie-chart-legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: var(--bg);
  transition: background 0.2s ease;
  cursor: pointer;
}

.legend-item:hover,
.legend-item.hovered {
  background: var(--bg3);
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  flex-shrink: 0;
}

.legend-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.legend-asset {
  color: var(--t1);
  font-size: 0.9rem;
  font-weight: 500;
}

.legend-percentage {
  color: var(--t2);
  font-size: 0.8rem;
}

.allocation-summary {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.summary-item.total-value .value {
  color: var(--green);
  font-weight: 600;
}

.summary-item.asset-count .value {
  color: var(--t1);
  font-weight: 500;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .portfolio-allocation {
    max-width: 500px;
  }

  .allocation-content {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
  }

  .portfolio-pie-chart {
    flex: 1;
  }

  .allocation-summary {
    flex: 1;
  }
}
```

Ces fichiers créent un composant PieChart SVG autonome qui :
- Lit les données depuis portfolio.json
- Affiche un graphique circulaire avec animation au survol
- Montre les pourcentages exacts pour chaque actif
- Inclut une légende interactive
- Gère les états de chargement et d'erreur
- Est responsive et mobile-first
- Utilise les variables CSS spécifiées
- A un design sombre avec accents verts néon