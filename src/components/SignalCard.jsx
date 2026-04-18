src/components/SignalCard.jsx

```jsx
import React from 'react';
import { ArrowUpRight } from 'lucide-react';

const SignalCard = ({
  title,
  description,
  timestamp,
  confidence,
  status,
  onClick,
  className = '',
  showArrow = true
}) => {
  // Déterminer la couleur de statut
  const getStatusColor = () => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500/10 border-green-500/30';
      case 'pending':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'closed':
        return 'bg-red-500/10 border-red-500/30';
      default:
        return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  // Formatage de la confiance
  const formatConfidence = (value) => {
    if (value === undefined || value === null) return '';
    return `${Math.round(value * 100)}%`;
  };

  return (
    <div
      className={`w-full p-4 rounded-lg border ${getStatusColor()} ${className}`}
      style={{
        backgroundColor: 'var(--bg2)',
        borderColor: 'var(--border-hi)',
        cursor: onClick ? 'pointer' : 'default'
      }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between w-full">
        <div className="flex-1 pr-3">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-medium" style={{ color: 'var(--t1)' }}>
              {title}
            </h3>
            {showArrow && onClick && (
              <ArrowUpRight
                size={16}
                className="text-green shrink-0"
                style={{ color: 'var(--green)' }}
              />
            )}
          </div>

          <p className="text-sm mb-3" style={{ color: 'var(--t2)' }}>
            {description}
          </p>

          <div className="flex items-center gap-4 text-xs">
            <span style={{ color: 'var(--t3)' }}>
              {timestamp ? new Date(timestamp).toLocaleString() : 'N/A'}
            </span>

            {confidence !== undefined && confidence !== null && (
              <span
                className="px-2 py-1 rounded"
                style={{
                  backgroundColor: 'rgba(0, 255, 136, 0.1)',
                  color: 'var(--green)'
                }}
              >
                Confiance: {formatConfidence(confidence)}
              </span>
            )}
          </div>
        </div>

        {status && (
          <div
            className="px-3 py-1 rounded-full text-xs font-medium"
            style={{
              backgroundColor: status === 'active' ? 'rgba(0, 255, 136, 0.2)' : 'rgba(255, 255, 255, 0.1)',
              color: status === 'active' ? 'var(--green)' : 'var(--t1)'
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}
      </div>
    </div>
  );
};

export default SignalCard;
```

src/pages/Patterns.jsx

```jsx
import React, { useState, useEffect } from 'react';
import SignalCard from '../components/SignalCard';

const Patterns = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Simulation de données de signaux
  useEffect(() => {
    const fetchSignals = () => {
      try {
        setLoading(true);

        // Données simulées de signaux
        const mockSignals = [
          {
            id: 1,
            title: 'Breakout Pattern - BTC/USD',
            description: 'Breakout confirmed above resistance level at $68,500 with high volume',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            confidence: 0.87,
            status: 'active'
          },
          {
            id: 2,
            title: 'Double Top - AAPL',
            description: 'Potential reversal pattern forming after failed breakout at $220',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
            confidence: 0.72,
            status: 'pending'
          },
          {
            id: 3,
            title: 'Head and Shoulders - EUR/USD',
            description: 'Classic reversal pattern with neckline support at 1.0850',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
            confidence: 0.65,
            status: 'closed'
          },
          {
            id: 4,
            title: 'Triangle Pattern - NVDA',
            description: 'Ascending triangle forming with breakout potential above $950',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            confidence: 0.91,
            status: 'active'
          }
        ];

        setSignals(mockSignals);
        setError(null);
      } catch (err) {
        setError('Failed to load signals');
        console.error('Error fetching signals:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSignals();
  }, []);

  const handleSignalClick = (signal) => {
    console.log('Signal clicked:', signal.id);
    // Logique pour gérer le clic sur un signal
  };

  if (loading) {
    return (
      <div className="p-4">
        <div className="text-center py-8" style={{ color: 'var(--t2)' }}>
          Loading patterns...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="text-center py-8" style={{ color: 'var(--green)' }}>
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--t1)' }}>
        Pattern Signals
      </h1>

      <div className="space-y-3">
        {signals.length > 0 ? (
          signals.map((signal) => (
            <SignalCard
              key={signal.id}
              title={signal.title}
              description={signal.description}
              timestamp={signal.timestamp}
              confidence={signal.confidence}
              status={signal.status}
              onClick={() => handleSignalClick(signal)}
            />
          ))
        ) : (
          <div className="text-center py-8" style={{ color: 'var(--t2)' }}>
            No signals found
          </div>
        )}
      </div>
    </div>
  );
};

export default Patterns;