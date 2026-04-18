Je vais créer les deux fichiers demandés avec un composant SVG performant pour le graphique de performance annuelle et un utilitaire pour générer les données.

```jsx
// src/pages/Portfolio/utils/performanceData.js
export const generatePerformanceData = (years = 5) => {
  const data = [];
  let currentValue = 10000; // Valeur de départ

  for (let i = 0; i < years; i++) {
    const year = new Date().getFullYear() - years + i + 1;
    const monthlyChanges = [];

    // Génération de variations mensuelles réalistes
    for (let m = 0; m < 12; m++) {
      const month = m + 1;
      const baseChange = (Math.random() * 0.15 - 0.075) * 100; // -7.5% à +7.5%
      const seasonality = Math.sin((m / 12) * Math.PI * 2) * 0.02 * 100; // Effet saisonnier
      const volatility = (Math.random() * 0.05) * 100; // Volatilité supplémentaire

      let monthlyChange = baseChange + seasonality + (Math.random() > 0.5 ? volatility : -volatility);
      monthlyChange = Math.max(-15, Math.min(20, monthlyChange)); // Limiter les variations

      monthlyChanges.push({
        month,
        value: monthlyChange,
        date: new Date(year, m, 1)
      });

      // Mise à jour de la valeur courante
      currentValue *= (1 + monthlyChange / 100);
    }

    data.push({
      year,
      annualReturn: (currentValue - 10000) / 100,
      monthlyData: monthlyChanges,
      finalValue: currentValue
    });
  }

  return data;
};

// Fonction pour calculer les statistiques annuelles
export const calculateAnnualStats = (data) => {
  return data.map(yearData => {
    const monthlyReturns = yearData.monthlyData.map(m => m.value);
    const avgReturn = monthlyReturns.reduce((sum, val) => sum + val, 0) / monthlyReturns.length;
    const maxReturn = Math.max(...monthlyReturns);
    const minReturn = Math.min(...monthlyReturns);
    const volatility = Math.sqrt(
      monthlyReturns.reduce((sum, val) => sum + Math.pow(val - avgReturn, 2), 0) / monthlyReturns.length
    );

    return {
      year: yearData.year,
      annualReturn: yearData.annualReturn,
      avgMonthlyReturn: avgReturn,
      maxMonthlyReturn: maxReturn,
      minMonthlyReturn: minReturn,
      volatility: volatility,
      finalValue: yearData.finalValue
    };
  });
};

// Données par défaut
export const defaultPerformanceData = generatePerformanceData(5);
export const defaultAnnualStats = calculateAnnualStats(defaultPerformanceData);
```

```jsx
// src/pages/Portfolio/components/PerformanceChart.jsx
import { useState, useEffect, useRef, useMemo } from 'react';
import { generatePerformanceData, calculateAnnualStats } from '../utils/performanceData';

const PerformanceChart = ({ data, width = '100%', height = 300 }) => {
  const [hoveredYear, setHoveredYear] = useState(null);
  const [hoveredMonth, setHoveredMonth] = useState(null);
  const chartRef = useRef(null);
  const tooltipRef = useRef(null);

  // Calcul des statistiques si aucune data n'est fournie
  const annualStats = useMemo(() => {
    return data ? calculateAnnualStats(data) : calculateAnnualStats(generatePerformanceData(5));
  }, [data]);

  // Calcul des valeurs maximales et minimales pour l'échelle Y
  const maxValue = useMemo(() => {
    return Math.max(...annualStats.map(stat => stat.finalValue));
  }, [annualStats]);

  const minValue = useMemo(() => {
    return Math.min(...annualStats.map(stat => stat.finalValue));
  }, [annualStats]);

  // Calcul des points pour le graphique
  const chartPoints = useMemo(() => {
    return annualStats.map((stat, index) => {
      const x = (index / (annualStats.length - 1)) * (width - 40) + 20;
      const y = height - 20 - ((stat.finalValue - minValue) / (maxValue - minValue)) * (height - 40);
      return { x, y, stat };
    });
  }, [annualStats, width, height, minValue, maxValue]);

  // Calcul des points pour l'axe X (années)
  const xAxisPoints = useMemo(() => {
    return annualStats.map((stat, index) => {
      const x = (index / (annualStats.length - 1)) * (width - 40) + 20;
      return { x, year: stat.year };
    });
  }, [annualStats, width]);

  // Calcul des points pour l'axe Y (valeurs)
  const yAxisPoints = useMemo(() => {
    const steps = 5;
    const stepValue = (maxValue - minValue) / steps;
    const points = [];

    for (let i = 0; i <= steps; i++) {
      const value = minValue + i * stepValue;
      const y = height - 20 - (i / steps) * (height - 40);
      points.push({ y, value });
    }

    return points;
  }, [minValue, maxValue, height]);

  // Gestion de l'affichage du tooltip
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (chartRef.current && tooltipRef.current) {
        const rect = chartRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Vérifier si la souris est sur le graphique
        if (x >= 20 && x <= width - 20 && y >= 20 && y <= height - 20) {
          // Trouver le point le plus proche
          let closestPoint = null;
          let minDistance = Infinity;

          chartPoints.forEach(point => {
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance < minDistance) {
              minDistance = distance;
              closestPoint = point;
            }
          });

          if (closestPoint && minDistance < 20) {
            setHoveredYear(closestPoint.stat.year);
            setHoveredMonth(null);
          } else {
            setHoveredYear(null);
            setHoveredMonth(null);
          }
        } else {
          setHoveredYear(null);
          setHoveredMonth(null);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [chartPoints, width, height]);

  // Style pour le tooltip
  const tooltipStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    transform: 'translate(-50%, -100%)',
    backgroundColor: 'var(--bg2)',
    color: 'var(--t1)',
    padding: '8px 12px',
    borderRadius: '4px',
    border: '1px solid var(--border)',
    fontSize: '12px',
    pointerEvents: 'none',
    zIndex: 100,
    opacity: hoveredYear ? 1 : 0,
    transition: 'opacity 0.2s ease'
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100%',
      fontFamily: 'Inter, sans-serif'
    }}>
      <svg
        ref={chartRef}
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ overflow: 'visible' }}
      >
        {/* Fond du graphique */}
        <rect
          x="0"
          y="0"
          width={width}
          height={height}
          fill="var(--bg)"
          rx="4"
        />

        {/* Grille horizontale */}
        {yAxisPoints.map((point, index) => (
          <g key={`grid-${index}`}>
            <line
              x1="20"
              y1={point.y}
              x2={width - 20}
              y2={point.y}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
            <text
              x={width - 25}
              y={point.y + 4}
              fill="var(--t3)"
              fontSize="10"
              textAnchor="end"
            >
              {Math.round(point.value).toLocaleString('fr-FR', {
                style: 'currency',
                currency: 'EUR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              })}
            </text>
          </g>
        ))}

        {/* Ligne principale du graphique */}
        <path
          d={chartPoints.reduce((path, point, index) => {
            const command = index === 0 ? 'M' : 'L';
            return `${path} ${command} ${point.x},${point.y}`;
          }, '')}
          stroke="var(--green)"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points de données */}
        {chartPoints.map((point, index) => (
          <circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="var(--green)"
            opacity="0.8"
            onMouseEnter={() => setHoveredYear(point.stat.year)}
            onMouseLeave={() => setHoveredYear(null)}
          />
        ))}

        {/* Axe X (années) */}
        <g>
          {xAxisPoints.map((point, index) => (
            <g key={`axis-${index}`}>
              <line
                x1={point.x}
                y1={height - 20}
                x2={point.x}
                y2={height - 15}
                stroke="var(--t3)"
                strokeWidth="1"
              />
              <text
                x={point.x}
                y={height - 5}
                fill="var(--t3)"
                fontSize="10"
                textAnchor="middle"
              >
                {point.year}
              </text>
            </g>
          ))}
        </g>

        {/* Titre */}
        <text
          x={width / 2}
          y="15"
          fill="var(--t1)"
          fontSize="14"
          fontWeight="500"
          textAnchor="middle"
        >
          Performance Annuelle
        </text>
      </svg>

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        style={{
          ...tooltipStyle,
          left: hoveredYear ? `${chartPoints.find(p => p.stat.year === hoveredYear)?.x || 0}px` : '0',
          top: '0'
        }}
      >
        <div style={{ fontWeight: 600, marginBottom: '4px' }}>
          Année {hoveredYear}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px' }}>
          <div>Valeur finale:</div>
          <div style={{ textAlign: 'right' }}>
            {annualStats.find(s => s.year === hoveredYear)?.finalValue.toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })}
          </div>
          <div>Rendement annuel:</div>
          <div style={{
            textAlign: 'right',
            color: annualStats.find(s => s.year === hoveredYear)?.annualReturn >= 0 ? 'var(--green)' : '#ff4444'
          }}>
            {annualStats.find(s => s.year === hoveredYear)?.annualReturn.toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceChart;