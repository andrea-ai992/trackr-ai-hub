Voici le code complet pour `src/pages/Signals/SignalsPage.jsx` avec un filtre en temps réel pour les signaux bullish/bearish et une logique de tri basée sur le score :

```jsx
import { useState, useEffect } from 'react';
import { Filter, TrendingUp, TrendingDown, Star } from 'lucide-react';

const SignalsPage = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('score');
  const [loading, setLoading] = useState(true);

  // Mock data - remplacer par appel API réel
  useEffect(() => {
    const fetchSignals = () => {
      setLoading(true);
      // Simulation d'appel API
      setTimeout(() => {
        const mockSignals = [
          { id: 1, symbol: 'BTC/USDT', signal: 'Bullish', score: 85, price: 50200, change: 2.5, timestamp: '2024-01-15T10:30:00Z' },
          { id: 2, symbol: 'ETH/USDT', signal: 'Bearish', score: 65, price: 3200, change: -1.2, timestamp: '2024-01-15T10:31:00Z' },
          { id: 3, symbol: 'AAPL', signal: 'Bullish', score: 78, price: 185.50, change: 1.8, timestamp: '2024-01-15T10:32:00Z' },
          { id: 4, symbol: 'TSLA', signal: 'Bearish', score: 42, price: 175.20, change: -3.1, timestamp: '2024-01-15T10:33:00Z' },
          { id: 5, symbol: 'SOL/USDT', signal: 'Bullish', score: 92, price: 125.75, change: 4.3, timestamp: '2024-01-15T10:34:00Z' },
          { id: 6, symbol: 'XRP/USDT', signal: 'Neutral', score: 55, price: 0.61, change: 0.5, timestamp: '2024-01-15T10:35:00Z' },
        ];
        setSignals(mockSignals);
        setLoading(false);
      }, 500);
    };

    fetchSignals();
  }, []);

  const filteredSignals = signals.filter(signal => {
    if (filter === 'all') return true;
    if (filter === 'bullish') return signal.signal === 'Bullish';
    if (filter === 'bearish') return signal.signal === 'Bearish';
    return true;
  });

  const sortedSignals = [...filteredSignals].sort((a, b) => {
    if (sortBy === 'score') {
      return b.score - a.score;
    } else if (sortBy === 'price') {
      return a.price - b.price;
    } else if (sortBy === 'change') {
      return b.change - a.change;
    }
    return 0;
  });

  const getSignalColor = (signal) => {
    if (signal === 'Bullish') return 'var(--green)';
    if (signal === 'Bearish') return '#ff4444';
    return 'var(--t3)';
  };

  const getSignalIcon = (signal) => {
    if (signal === 'Bullish') return <TrendingUp size={16} />;
    if (signal === 'Bearish') return <TrendingDown size={16} />;
    return null;
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Chargement des signaux...</div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <header className="page-header">
        <h1>Signaux de Trading</h1>
        <p>Filtres en temps réel pour les signaux bullish/bearish</p>
      </header>

      <div className="filter-bar">
        <div className="filter-group">
          <button
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Tous
          </button>
          <button
            className={`filter-btn ${filter === 'bullish' ? 'active' : ''}`}
            onClick={() => setFilter('bullish')}
          >
            <TrendingUp size={16} /> Bullish
          </button>
          <button
            className={`filter-btn ${filter === 'bearish' ? 'active' : ''}`}
            onClick={() => setFilter('bearish')}
          >
            <TrendingDown size={16} /> Bearish
          </button>
        </div>

        <div className="sort-group">
          <button
            className={`sort-btn ${sortBy === 'score' ? 'active' : ''}`}
            onClick={() => setSortBy('score')}
          >
            <Star size={14} /> Score
          </button>
          <button
            className={`sort-btn ${sortBy === 'price' ? 'active' : ''}`}
            onClick={() => setSortBy('price')}
          >
            Prix
          </button>
          <button
            className={`sort-btn ${sortBy === 'change' ? 'active' : ''}`}
            onClick={() => setSortBy('change')}
          >
            Changement
          </button>
        </div>
      </div>

      <div className="signals-container">
        {sortedSignals.length === 0 ? (
          <div className="empty-state">
            <Filter size={48} />
            <p>Aucun signal trouvé avec les filtres sélectionnés</p>
          </div>
        ) : (
          <div className="signals-list">
            {sortedSignals.map((signal) => (
              <div key={signal.id} className="signal-card">
                <div className="signal-header">
                  <div className="signal-symbol">
                    <span className="symbol">{signal.symbol}</span>
                    <span
                      className="signal-badge"
                      style={{ color: getSignalColor(signal.signal) }}
                    >
                      {getSignalIcon(signal.signal)}
                      {signal.signal}
                    </span>
                  </div>
                  <span className="signal-score">{signal.score}/100</span>
                </div>

                <div className="signal-details">
                  <div className="detail-item">
                    <span className="detail-label">Prix:</span>
                    <span className="detail-value">${signal.price.toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Changement:</span>
                    <span
                      className="detail-change"
                      style={{ color: signal.change >= 0 ? 'var(--green)' : '#ff4444' }}
                    >
                      {signal.change >= 0 ? '+' : ''}{signal.change}%
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Heure:</span>
                    <span className="detail-time">
                      {new Date(signal.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalsPage;
```

Et voici le CSS correspondant à ajouter dans votre fichier de styles :

```css
/* SignalsPage.css */
.signals-page {
  min-height: 100vh;
  background-color: var(--bg);
  color: var(--t1);
  font-family: 'Inter', sans-serif;
}

.page-header {
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.page-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: var(--t1);
}

.page-header p {
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
  color: var(--t2);
}

.filter-bar {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--border);
}

.filter-group, .sort-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn, .sort-btn {
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  background-color: var(--bg2);
  color: var(--t1);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-btn:hover, .sort-btn:hover {
  background-color: rgba(0, 255, 136, 0.1);
}

.filter-btn.active, .sort-btn.active {
  background-color: var(--green);
  border-color: var(--green);
  color: var(--bg);
}

.filter-btn svg, .sort-btn svg {
  margin-right: 0.5rem;
}

.signals-container {
  padding: 1rem;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: var(--t2);
  text-align: center;
}

.empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.signals-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.signal-card {
  padding: 1rem;
  border-radius: 0.5rem;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  transition: all 0.2s ease;
}

.signal-card:hover {
  border-color: var(--green);
  transform: translateY(-2px);
}

.signal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.signal-symbol {
  display: flex;
  flex-direction: column;
}

.symbol {
  font-weight: 600;
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.signal-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background-color: rgba(0, 255, 136, 0.1);
  font-size: 0.75rem;
  font-weight: 500;
}

.signal-score {
  font-weight: 700;
  color: var(--green);
}

.signal-details {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
}

.detail-label {
  color: var(--t2);
}

.detail-value {
  color: var(--t1);
}

.detail-change {
  font-weight: 600;
}

.detail-time {
  font-size: 0.75rem;
  color: var(--t3);
}

.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--t2);
}
```

Ce code inclut :
1. Un composant `FilterBar` avec des boutons interactifs pour filtrer les signaux bullish/bearish
2. Une logique de tri basée sur le score, le prix ou le changement
3. Un design mobile-first avec le thème sombre et les couleurs spécifiées
4. Des animations subtiles pour améliorer l'expérience utilisateur
5. Un état de chargement et un état vide
6. Des badges de signal colorés (vert pour bullish, rouge pour bearish)
7. Une présentation claire des données avec des icônes Lucide

Le code est prêt à être intégré dans votre application et suit toutes les règles spécifiées.