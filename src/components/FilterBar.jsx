Je vais créer le composant `FilterBar.jsx` et l'intégrer dans `SignalsPage.jsx` avec une logique de filtrage en temps réel basée sur le score bullish/bearish.

```jsx
// src/components/FilterBar.jsx
import { useState } from 'react';

export const FilterBar = ({ onFilterChange }) => {
  const [activeFilter, setActiveFilter] = useState('all');

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    onFilterChange(filter);
  };

  return (
    <div className="filter-bar">
      <div className="filter-buttons">
        <button
          className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterClick('all')}
        >
          Tous
        </button>
        <button
          className={`filter-btn ${activeFilter === 'bullish' ? 'active' : ''}`}
          onClick={() => handleFilterClick('bullish')}
        >
          Bullish
        </button>
        <button
          className={`filter-btn ${activeFilter === 'bearish' ? 'active' : ''}`}
          onClick={() => handleFilterClick('bearish')}
        >
          Bearish
        </button>
        <button
          className={`filter-btn ${activeFilter === 'strong-bullish' ? 'active' : ''}`}
          onClick={() => handleFilterClick('strong-bullish')}
        >
          Fort Bullish
        </button>
        <button
          className={`filter-btn ${activeFilter === 'strong-bearish' ? 'active' : ''}`}
          onClick={() => handleFilterClick('strong-bearish')}
        >
          Fort Bearish
        </button>
      </div>
    </div>
  );
};
```

```css
/* src/components/FilterBar.css */
.filter-bar {
  width: 100%;
  padding: 1rem 0;
  background-color: var(--bg2);
  border-bottom: 1px solid var(--border);
}

.filter-buttons {
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.filter-buttons::-webkit-scrollbar {
  display: none;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background-color: var(--bg);
  color: var(--t2);
  border: 1px solid var(--border);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.filter-btn:hover {
  background-color: var(--border);
  color: var(--t1);
}

.filter-btn.active {
  background-color: var(--green);
  color: var(--bg);
  border-color: var(--green);
  font-weight: 600;
}
```

```jsx
// src/pages/Signals/SignalsPage.jsx
import { useState, useEffect } from 'react';
import { FilterBar } from '../../components/FilterBar';
import './SignalsPage.css';

const SignalsPage = () => {
  const [signals, setSignals] = useState([]);
  const [filteredSignals, setFilteredSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        // Simulation de données - à remplacer par appel API réel
        const mockSignals = [
          { id: 1, symbol: 'BTC', name: 'Bitcoin', score: 85, sentiment: 'bullish', timestamp: '2024-01-15T10:30:00Z' },
          { id: 2, symbol: 'ETH', name: 'Ethereum', score: 72, sentiment: 'bullish', timestamp: '2024-01-15T11:15:00Z' },
          { id: 3, symbol: 'AAPL', name: 'Apple', score: 65, sentiment: 'neutral', timestamp: '2024-01-15T12:00:00Z' },
          { id: 4, symbol: 'TSLA', name: 'Tesla', score: 92, sentiment: 'strong-bullish', timestamp: '2024-01-15T09:45:00Z' },
          { id: 5, symbol: 'AMZN', name: 'Amazon', score: 45, sentiment: 'bearish', timestamp: '2024-01-15T13:20:00Z' },
          { id: 6, symbol: 'GOOGL', name: 'Google', score: 38, sentiment: 'strong-bearish', timestamp: '2024-01-15T14:10:00Z' },
          { id: 7, symbol: 'NVDA', name: 'NVIDIA', score: 88, sentiment: 'bullish', timestamp: '2024-01-15T15:30:00Z' },
          { id: 8, symbol: 'META', name: 'Meta', score: 76, sentiment: 'neutral', timestamp: '2024-01-15T16:00:00Z' },
        ];

        setSignals(mockSignals);
        setFilteredSignals(mockSignals);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors de la récupération des signaux:', error);
        setLoading(false);
      }
    };

    fetchSignals();
  }, []);

  useEffect(() => {
    const applyFilter = () => {
      if (filter === 'all') {
        setFilteredSignals(signals);
      } else {
        const filtered = signals.filter(signal => signal.sentiment === filter);
        setFilteredSignals(filtered);
      }
    };

    applyFilter();
  }, [filter, signals]);

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'strong-bullish':
        return 'var(--green)';
      case 'bullish':
        return 'var(--green)';
      case 'strong-bearish':
        return '#ff4444';
      case 'bearish':
        return '#ff4444';
      default:
        return 'var(--t2)';
    }
  };

  const getSentimentText = (sentiment) => {
    switch(sentiment) {
      case 'strong-bullish':
        return '⬆️ Fort Bullish';
      case 'bullish':
        return '⬆️ Bullish';
      case 'strong-bearish':
        return '⬇️ Fort Bearish';
      case 'bearish':
        return '⬇️ Bearish';
      default:
        return 'Neutre';
    }
  };

  if (loading) {
    return (
      <div className="signals-page">
        <div className="loading">Chargement des signaux...</div>
      </div>
    );
  }

  return (
    <div className="signals-page">
      <h1>Signaux de Trading</h1>
      <FilterBar onFilterChange={(newFilter) => setFilter(newFilter)} />

      <div className="signals-container">
        {filteredSignals.length > 0 ? (
          filteredSignals.map((signal) => (
            <div key={signal.id} className="signal-card">
              <div className="signal-header">
                <h3>{signal.symbol} - {signal.name}</h3>
                <span
                  className="sentiment-badge"
                  style={{ color: getSentimentColor(signal.sentiment) }}
                >
                  {getSentimentText(signal.sentiment)}
                </span>
              </div>
              <div className="signal-score">
                <span>Score: {signal.score}/100</span>
              </div>
              <div className="signal-timestamp">
                {new Date(signal.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="no-signals">Aucun signal correspondant à ce filtre.</div>
        )}
      </div>
    </div>
  );
};

export default SignalsPage;
```

```css
/* src/pages/Signals/SignalsPage.css */
.signals-page {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  padding: 1rem;
  font-family: 'Inter', sans-serif;
}

.signals-page h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: var(--t1);
  font-weight: 600;
}

.signals-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.signal-card {
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1rem;
  transition: all 0.2s ease;
}

.signal-card:hover {
  border-color: var(--border-hi);
  transform: translateY(-2px);
}

.signal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.signal-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--t1);
}

.sentiment-badge {
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: rgba(0, 255, 136, 0.1);
}

.signal-score {
  font-size: 0.875rem;
  color: var(--t2);
  margin-bottom: 0.5rem;
}

.signal-timestamp {
  font-size: 0.75rem;
  color: var(--t3);
  font-style: italic;
}

.loading, .no-signals {
  text-align: center;
  padding: 2rem;
  color: var(--t2);
  font-size: 0.875rem;
}