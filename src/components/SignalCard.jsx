Je vais implémenter un système de scoring avancé pour les signaux avec des alertes visuelles. Voici les fichiers nécessaires :

src/components/SignalCard.jsx
```jsx
import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

const SignalCard = ({ signal }) => {
  const [score, setScore] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    const calculateScore = () => {
      let newScore = 0;

      // RSI Scoring
      if (signal.rsi > 70) newScore += 20; // Overbought
      if (signal.rsi < 30) newScore += 20; // Oversold
      if (signal.rsi > 60 || signal.rsi < 40) newScore += 10;

      // MACD Scoring
      if (signal.macd > 0) newScore += 25;
      if (signal.macdSignal > 0) newScore += 15;
      if (signal.macdHistogram > 0) newScore += 10;

      // Volume Scoring
      if (signal.volume > signal.volumeMA20) newScore += 15;
      if (signal.volume > signal.volumeMA20 * 1.5) newScore += 10;

      setScore(newScore);
      setIsActive(newScore >= 50);
    };

    calculateScore();
  }, [signal]);

  const getSignalType = () => {
    if (score >= 70) return 'BULLISH';
    if (score >= 50) return 'BEARISH';
    return 'NEUTRAL';
  };

  const getSignalColor = () => {
    if (score >= 70) return 'var(--green)';
    if (score >= 50) return '#ff4444';
    return 'var(--t3)';
  };

  const getBadgeColor = () => {
    if (score >= 70) return 'rgba(0, 255, 136, 0.2)';
    if (score >= 50) return 'rgba(255, 68, 68, 0.2)';
    return 'rgba(68, 68, 68, 0.2)';
  };

  return (
    <div className="signal-card" style={{
      background: 'var(--bg2)',
      border: `1px solid var(--border)`,
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      transition: 'all 0.3s ease',
      animation: isActive ? 'pulse 1.5s infinite' : 'none'
    }}>
      <div className="signal-header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '12px'
      }}>
        <div style={{ fontWeight: '600', color: 'var(--t1)', fontSize: '16px' }}>
          {signal.symbol}
        </div>
        <div style={{
          background: getBadgeColor(),
          color: getSignalColor(),
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          border: `1px solid ${getSignalColor()}`
        }}>
          {getSignalType()}
        </div>
      </div>

      <div className="signal-metrics" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
        marginBottom: '12px'
      }}>
        <div style={{ color: 'var(--t2)', fontSize: '12px' }}>RSI: {signal.rsi.toFixed(2)}</div>
        <div style={{ color: 'var(--t2)', fontSize: '12px' }}>MACD: {signal.macd.toFixed(4)}</div>
        <div style={{ color: 'var(--t2)', fontSize: '12px' }}>Volume: {signal.volume.toLocaleString()}</div>
        <div style={{ color: 'var(--t2)', fontSize: '12px' }}>MA20: {signal.volumeMA20.toLocaleString()}</div>
      </div>

      <div className="signal-score" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          background: score >= 50 ? (score >= 70 ? 'var(--green)' : '#ff4444') : 'var(--t3)',
          borderRadius: '50%'
        }}></div>
        <div style={{ color: 'var(--t2)', fontSize: '12px' }}>Score: {score}/100</div>
      </div>

      <div className="signal-details" style={{
        marginTop: '12px',
        paddingTop: '12px',
        borderTop: `1px solid var(--border)`
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <span style={{ color: 'var(--t2)', fontSize: '12px' }}>Trend</span>
          {score >= 70 ? (
            <TrendingUp size={16} color="var(--green)" />
          ) : score >= 50 ? (
            <TrendingDown size={16} color="#ff4444" />
          ) : (
            <AlertTriangle size={16} color="var(--t3)" />
          )}
        </div>
      </div>
    </div>
  );
};

export default SignalCard;
```

src/pages/Signals.jsx
```jsx
import { useState, useEffect } from 'react';
import SignalCard from '../components/SignalCard';
import { TrendingUp, TrendingDown, Settings } from 'lucide-react';

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilters, setActiveFilters] = useState({
    bullish: true,
    bearish: true,
    neutral: true
  });

  useEffect(() => {
    const fetchSignals = async () => {
      try {
        // Simulation de données - à remplacer par appel API réel
        const mockSignals = [
          {
            symbol: 'BTC/USD',
            rsi: 72.5,
            macd: 0.0045,
            macdSignal: 0.0023,
            macdHistogram: 0.0022,
            volume: 12500000,
            volumeMA20: 8500000
          },
          {
            symbol: 'ETH/USD',
            rsi: 28.3,
            macd: -0.0012,
            macdSignal: -0.0008,
            macdHistogram: -0.0004,
            volume: 9800000,
            volumeMA20: 7200000
          },
          {
            symbol: 'AAPL',
            rsi: 65.2,
            macd: 0.0034,
            macdSignal: 0.0021,
            macdHistogram: 0.0013,
            volume: 4500000,
            volumeMA20: 3800000
          },
          {
            symbol: 'TSLA',
            rsi: 35.7,
            macd: -0.0021,
            macdSignal: -0.0015,
            macdHistogram: -0.0006,
            volume: 6200000,
            volumeMA20: 5100000
          }
        ];

        setSignals(mockSignals);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching signals:', error);
        setLoading(false);
      }
    };

    fetchSignals();
  }, []);

  const filteredSignals = signals.filter(signal => {
    if (activeFilters.bullish && signal.rsi > 70) return true;
    if (activeFilters.bearish && signal.rsi < 30) return true;
    if (activeFilters.neutral && signal.rsi >= 30 && signal.rsi <= 70) return true;
    return false;
  });

  const toggleFilter = (filter) => {
    setActiveFilters(prev => ({
      ...prev,
      [filter]: !prev[filter]
    }));
  };

  if (loading) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: 'var(--t2)'
      }}>
        Loading signals...
      </div>
    );
  }

  return (
    <div style={{
      padding: '16px',
      minHeight: '100vh',
      background: 'var(--bg)'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{
          color: 'var(--t1)',
          fontSize: '24px',
          fontWeight: '700',
          margin: '0'
        }}>
          Trading Signals
        </h1>
        <div style={{
          display: 'flex',
          gap: '8px'
        }}>
          <button
            onClick={() => toggleFilter('bullish')}
            style={{
              background: activeFilters.bullish ? 'rgba(0, 255, 136, 0.2)' : 'transparent',
              border: `1px solid ${activeFilters.bullish ? 'var(--green)' : 'var(--border)'}`,
              color: activeFilters.bullish ? 'var(--green)' : 'var(--t2)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <TrendingUp size={14} />
            Bullish
          </button>
          <button
            onClick={() => toggleFilter('bearish')}
            style={{
              background: activeFilters.bearish ? 'rgba(255, 68, 68, 0.2)' : 'transparent',
              border: `1px solid ${activeFilters.bearish ? '#ff4444' : 'var(--border)'}`,
              color: activeFilters.bearish ? '#ff4444' : 'var(--t2)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <TrendingDown size={14} />
            Bearish
          </button>
          <button
            onClick={() => toggleFilter('neutral')}
            style={{
              background: activeFilters.neutral ? 'rgba(68, 68, 68, 0.2)' : 'transparent',
              border: `1px solid ${activeFilters.neutral ? 'var(--t3)' : 'var(--border)'}`,
              color: activeFilters.neutral ? 'var(--t3)' : 'var(--t2)',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Settings size={14} />
            Neutral
          </button>
        </div>
      </div>

      {filteredSignals.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: 'var(--t2)'
        }}>
          No signals match the selected filters
        </div>
      ) : (
        <div style={{ marginBottom: '20px' }}>
          {filteredSignals.map((signal, index) => (
            <SignalCard key={index} signal={signal} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Signals;
```

src/styles/SignalCard.css
```css
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(0, 255, 136, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 255, 136, 0); }
}

.signal-card {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

@media (min-width: 768px) {
  .signal-card {
    padding: 20px;
  }
}
```

src/styles/globals.css (ajout du font Inter et variables)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

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

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--bg);
  color: var(--t1);
  line-height: 1.5;
}