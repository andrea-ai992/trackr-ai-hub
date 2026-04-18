Je vais créer le composant `FearGreedGauge` avec un SVG animé et une intégration de l'API Fear & Greed Index. Voici le code complet :

```jsx
// src/components/FearGreedGauge.jsx
import { useState, useEffect } from 'react';

const FearGreedGauge = () => {
  const [fearGreedData, setFearGreedData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFearGreedIndex = async () => {
      try {
        const response = await fetch('https://api.alternative.me/fng/?limit=1');
        if (!response.ok) throw new Error('Failed to fetch Fear & Greed Index');

        const data = await response.json();
        setFearGreedData({
          value: parseInt(data.data[0].value),
          valueText: data.data[0].value_classification,
          timestamp: new Date(parseInt(data.data[0].timestamp) * 1000)
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching Fear & Greed Index:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFearGreedIndex();
    const interval = setInterval(fetchFearGreedIndex, 300000); // Rafraîchir toutes les 5 minutes

    return () => clearInterval(interval);
  }, []);

  const getGaugeColor = (value) => {
    if (value < 25) return '#007bff'; // Extreme Fear
    if (value < 45) return '#00c8ff'; // Fear
    if (value < 55) return '#ffc107'; // Neutral
    if (value < 75) return '#ff9800'; // Greed
    return '#ff0000'; // Extreme Greed
  };

  const getNeedlePosition = (value) => {
    // Valeur normalisée entre 0 et 100 pour la position de l'aiguille
    return (value / 100) * 240 + 15; // 15-255 pour couvrir l'arc de 240°
  };

  if (loading) {
    return (
      <div className="bg-var(--bg2) border border-var(--border) rounded-lg p-4">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-2">
            <div className="h-4 bg-var(--bg) rounded w-1/3"></div>
            <div className="h-4 bg-var(--bg) rounded w-1/4"></div>
          </div>
          <div className="h-32 bg-var(--bg) rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-var(--bg2) border border-red-500/30 rounded-lg p-4">
        <p className="text-red-500 text-sm">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-3 py-1 text-xs bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!fearGreedData) return null;

  return (
    <div className="bg-var(--bg2) border border-var(--border) rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-var(--t1)">Fear & Greed Index</h3>
        <span className="text-xs text-var(--t3)">
          Updated: {fearGreedData.timestamp.toLocaleTimeString()}
        </span>
      </div>

      <div className="relative h-32 flex items-center justify-center">
        {/* Fond de l'indicateur */}
        <svg viewBox="0 0 270 120" className="w-full h-full">
          {/* Cercle de fond */}
          <circle
            cx="135"
            cy="80"
            r="60"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Arc de progression */}
          <path
            d="M 75 80 A 60 60 0 0 1 195 80"
            fill="none"
            stroke="var(--border)"
            strokeWidth="2"
          />

          {/* Graduations */}
          {[0, 25, 50, 75, 100].map((value) => {
            const angle = (value / 100) * 240 + 15;
            const x1 = 135 + 55 * Math.cos((angle - 90) * Math.PI / 180);
            const y1 = 80 + 55 * Math.sin((angle - 90) * Math.PI / 180);
            const x2 = 135 + 65 * Math.cos((angle - 90) * Math.PI / 180);
            const y2 = 80 + 65 * Math.sin((angle - 90) * Math.PI / 180);

            return (
              <g key={value}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--t3)"
                  strokeWidth="1"
                />
                <text
                  x={x2 + 5 * Math.cos((angle - 90) * Math.PI / 180)}
                  y={y2 + 5 * Math.sin((angle - 90) * Math.PI / 180)}
                  fill="var(--t3)"
                  fontSize="8"
                  textAnchor="middle"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {/* Aiguille */}
          <g transform={`rotate(${getNeedlePosition(fearGreedData.value) - 15}, 135, 80)`}>
            <line
              x1="135"
              y1="80"
              x2="135"
              y2="20"
              stroke={getGaugeColor(fearGreedData.value)}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <polygon
              points="135,20 130,30 140,30"
              fill={getGaugeColor(fearGreedData.value)}
            />
          </g>

          {/* Indicateur de valeur */}
          <circle
            cx={135 + 30 * Math.cos((getNeedlePosition(fearGreedData.value) - 90) * Math.PI / 180)}
            cy={80 + 30 * Math.sin((getNeedlePosition(fearGreedData.value) - 90) * Math.PI / 180)}
            r="8"
            fill={getGaugeColor(fearGreedData.value)}
          />
        </svg>
      </div>

      {/* Légende */}
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: getGaugeColor(fearGreedData.value) }}
          />
          <span className="text-sm font-medium text-var(--t1)">
            {fearGreedData.value}: {fearGreedData.valueText}
          </span>
        </div>
      </div>

      {/* Barre de progression */}
      <div className="mt-3 h-2 bg-var(--bg) rounded-full overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${fearGreedData.value}%`,
            backgroundColor: getGaugeColor(fearGreedData.value)
          }}
        />
      </div>
    </div>
  );
};

export default FearGreedGauge;
```

Maintenant, je vais intégrer ce composant dans `Markets.jsx` en ajoutant une nouvelle section dédiée :

```jsx
// src/pages/Markets.jsx
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, ChevronDown, ChevronUp, RefreshCw, AlertTriangle } from 'lucide-react';
import SearchBar from '../components/SearchBar';
import Sparkline from '../components/Sparkline';
import FearGreedGauge from '../components/FearGreedGauge';

const Markets = () => {
  // ... (le code existant reste inchangé jusqu'à la partie return)

  return (
    <div className="min-h-screen bg-var(--bg) text-var(--t1) font-['Inter']">
      {/* ... (le code existant reste inchangé jusqu'à la section des onglets) */}

      <div className="px-4 pt-4 pb-24">
        {loading && retryCount === 0 ? (
          <div className="space-y-3">
            {/* ... (le code existant reste inchangé) */}
          </div>
        ) : (
          <>
            {/* Nouveau composant FearGreedGauge */}
            <div className="mb-6">
              <FearGreedGauge />
            </div>

            {data && (tab === 'stocks' ? sortedStocks : sortedCrypto).length === 0 ? (
              <div className="text-center py-12">
                {/* ... (le code existant reste inchangé) */}
              </div>
            ) : (
              <div className="space-y-2 mb-6">
                {/* ... (le code existant pour afficher les actifs) */}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Markets;