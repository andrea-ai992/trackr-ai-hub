// src/components/SignalScore.jsx
import { useMemo } from 'react';

const SignalScore = ({
  rsi,
  macd,
  signal,
  volume,
  rsiThreshold = 70,
  macdThreshold = 0.02,
  volumeThreshold = 1.5
}) => {
  // Calcul des scores et couleurs pour chaque indicateur
  const getRSIScore = (value) => {
    if (value < 30) return { score: 3, color: 'var(--green)', label: 'Oversold' };
    if (value < 70) return { score: 2, color: 'var(--green)', label: 'Neutre' };
    if (value < rsiThreshold) return { score: 1, color: '#ffcc00', label: 'Sur-achat léger' };
    return { score: 0, color: '#ff3333', label: 'Sur-achat' };
  };

  const getMACDScore = (macdValue, signalValue) => {
    const diff = Math.abs(macdValue - signalValue);
    const threshold = macdThreshold * Math.max(Math.abs(macdValue), Math.abs(signalValue));

    if (diff < threshold) return { score: 3, color: 'var(--green)', label: 'Convergence' };
    if (macdValue > signalValue) return { score: 2, color: '#ffcc00', label: 'MACD > Signal' };
    return { score: 1, color: '#ff3333', label: 'MACD < Signal' };
  };

  const getVolumeScore = (value) => {
    if (value < volumeThreshold) return { score: 3, color: 'var(--green)', label: 'Volume faible' };
    if (value < 2) return { score: 2, color: '#ffcc00', label: 'Volume modéré' };
    return { score: 1, color: '#ff3333', label: 'Volume élevé' };
  };

  const rsiData = getRSIScore(rsi);
  const macdData = getMACDScore(macd, signal);
  const volumeData = getVolumeScore(volume);

  // Score global pondéré
  const globalScore = useMemo(() => {
    const weights = {
      rsi: 0.4,
      macd: 0.35,
      volume: 0.25
    };
    return Math.round(
      (rsiData.score * weights.rsi +
       macdData.score * weights.macd +
       volumeData.score * weights.volume) * 10
    );
  }, [rsiData.score, macdData.score, volumeData.score]);

  // Génération des alertes
  const alerts = useMemo(() => {
    const list = [];
    if (rsiData.score < 2) list.push(`RSI ${rsi.toFixed(2)} - ${rsiData.label}`);
    if (macdData.score < 2) list.push(`MACD ${macd > signal ? '>' : '<'} Signal (${(macd - signal).toFixed(4)})`);
    if (volumeData.score < 2) list.push(`Volume x${volume.toFixed(2)}`);
    return list;
  }, [rsiData, macdData, volumeData]);

  return (
    <div className="signal-score-container">
      {/* Score global */}
      <div className="global-score">
        <div className="score-value" style={{ color: globalScore >= 70 ? 'var(--green)' : globalScore >= 30 ? '#ffcc00' : '#ff3333' }}>
          {globalScore}/100
        </div>
        <div className="score-label">
          {globalScore >= 70 ? 'Très favorable' :
           globalScore >= 30 ? 'Attention' : 'Risqué'}
        </div>
      </div>

      {/* Indicateur RSI */}
      <div className="indicator rsi">
        <div className="indicator-header">
          <span className="indicator-name">RSI</span>
          <span className="indicator-value">{rsi.toFixed(2)}</span>
        </div>
        <div className="indicator-bar">
          <div
            className="indicator-fill"
            style={{
              width: `${Math.min(rsi, 100)}%`,
              backgroundColor: rsiData.color,
              borderRight: rsi >= rsiThreshold ? '2px solid #ff3333' : 'none'
            }}
          ></div>
          <div className="thresholds">
            <div className="threshold" style={{ left: '30%' }}>30</div>
            <div className="threshold" style={{ left: '70%' }}>70</div>
          </div>
        </div>
        <div className="indicator-label" style={{ color: rsiData.color }}>
          {rsiData.label}
        </div>
      </div>

      {/* Indicateur MACD */}
      <div className="indicator macd">
        <div className="indicator-header">
          <span className="indicator-name">MACD</span>
          <span className="indicator-value">{macd > signal ? '↑' : '↓'} {Math.abs(macd - signal).toFixed(4)}</span>
        </div>
        <div className="indicator-bar">
          <div
            className="indicator-fill"
            style={{
              width: '100%',
              backgroundColor: macdData.color,
              opacity: 0.7
            }}
          ></div>
        </div>
        <div className="indicator-label" style={{ color: macdData.color }}>
          {macdData.label}
        </div>
      </div>

      {/* Indicateur Volume */}
      <div className="indicator volume">
        <div className="indicator-header">
          <span className="indicator-name">Volume</span>
          <span className="indicator-value">x{volume.toFixed(2)}</span>
        </div>
        <div className="indicator-bar">
          <div
            className="indicator-fill"
            style={{
              width: `${Math.min(volume * 20, 100)}%`,
              backgroundColor: volumeData.color
            }}
          ></div>
        </div>
        <div className="indicator-label" style={{ color: volumeData.color }}>
          {volumeData.label}
        </div>
      </div>

      {/* Alertes */}
      {alerts.length > 0 && (
        <div className="alerts-container">
          <div className="alerts-header">⚠️ Alertes</div>
          <ul className="alerts-list">
            {alerts.map((alert, index) => (
              <li key={index} className="alert-item">{alert}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SignalScore;
```

```css
/* src/components/SignalScore.css */
.signal-score-container {
  width: 100%;
  max-width: 400px;
  padding: 1rem;
  background: var(--bg2);
  border-radius: 0.5rem;
  border: 1px solid var(--border);
  font-family: 'Inter', sans-serif;
}

.global-score {
  text-align: center;
  margin-bottom: 1.5rem;
}

.score-value {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.score-label {
  font-size: 0.9rem;
  color: var(--t2);
}

.indicator {
  margin-bottom: 1rem;
  padding: 0.75rem;
  border-radius: 0.25rem;
  background: rgba(0, 255, 136, 0.05);
  border: 1px solid var(--border);
}

.indicator-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.indicator-name {
  color: var(--t1);
}

.indicator-value {
  color: var(--green);
  font-weight: bold;
}

.indicator-bar {
  position: relative;
  height: 0.5rem;
  background: var(--bg);
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.indicator-fill {
  height: 100%;
  transition: width 0.3s ease;
  border-radius: 0.25rem;
}

.thresholds {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
}

.threshold {
  position: absolute;
  top: -0.75rem;
  font-size: 0.6rem;
  color: var(--t3);
  transform: translateX(-50%);
}

.indicator-label {
  font-size: 0.8rem;
  text-align: center;
}

.alerts-container {
  margin-top: 1rem;
  padding: 0.75rem;
  background: rgba(255, 51, 51, 0.1);
  border-radius: 0.25rem;
  border: 1px solid rgba(255, 51, 51, 0.3);
}

.alerts-header {
  font-weight: bold;
  color: #ff3333;
  margin-bottom: 0.5rem;
}

.alerts-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.alert-item {
  font-size: 0.8rem;
  color: #ff3333;
  margin-bottom: 0.25rem;
}

/* Responsive adjustments */
@media (min-width: 768px) {
  .signal-score-container {
    max-width: 500px;
  }

  .indicator {
    padding: 1rem;
  }
}