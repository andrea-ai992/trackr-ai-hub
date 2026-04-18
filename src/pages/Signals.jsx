import React from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useQuery } from '../hooks/useQuery';
import { getAssets, getSignals } from '../api/signals';

const Signals = () => {
  const query = useQuery();
  const assets = getAssets();
  const signals = getSignals();

  const filteredSignals = signals.filter((signal) => {
    const filter = query.get('filter');
    if (filter === 'BUY' || filter === 'SELL' || filter === 'HOLD') {
      return signal.signal === filter;
    }
    return true;
  });

  const renderSignalCard = (signal) => {
    const asset = assets.find((asset) => asset.id === signal.asset_id);
    const rsi = Math.floor(Math.random() * 60 + 20);
    const macd = rsi > 50 ? 'bullish' : rsi < 50 ? 'bearish' : 'neutral';
    const volume = Math.floor(Math.random() * 100 + 50);
    const signalGlobal = rsi < 30 || rsi > 70 ? (rsi < 30 ? 'BUY' : 'SELL') : 'HOLD';

    return (
      <div key={signal.id} className="signal-card">
        <div className="asset-info">
          <span className="ticker">{asset.ticker}</span>
          <span className="name">{asset.name}</span>
          <span className="price">{signal.price.toFixed(2)}</span>
        </div>
        <div className="score-bar">
          <div
            className="score-bar-inner"
            style={{
              width: `${signal.score}%`,
              backgroundColor: signal.score > 50 ? 'var(--green)' : 'var(--t2)',
            }}
          />
        </div>
        <div className="badges">
          <div className="badge rsi">
            <span className="value">{rsi}</span>
            <span className="indicator">
              {rsi < 30 ? 'oversold' : rsi > 70 ? 'overbought' : 'neutral'}
            </span>
          </div>
          <div className="badge macd">
            <span className="value">{macd}</span>
            <span className="indicator">
              {macd === 'bullish' ? 'bullish' : macd === 'bearish' ? 'bearish' : 'neutral'}
            </span>
          </div>
          <div className="badge volume">
            <span className="value">{volume}</span>
            <span className="indicator">
              {volume > 80 ? 'high' : volume < 20 ? 'low' : 'normal'}
            </span>
          </div>
        </div>
        <div className="signal">
          <span className="badge">
            {signalGlobal}
            <i className={`icon-${signalGlobal.toLowerCase()}`} />
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 12 }}>
      <div style={{ fontSize: 32 }}>⚡</div>
      <p style={{ color: 'var(--t1)', fontWeight: 700, fontSize: 18 }}>Signaux IA</p>
      <p style={{ color: 'var(--t3)', fontSize: 13 }}>Dernière mise à jour : {new Date().toLocaleString()}</p>
      <div className="filter-container">
        <Link to={`/signals?filter=Tous`}>Tous</Link>
        <Link to={`/signals?filter=BUY`}>BUY</Link>
        <Link to={`/signals?filter=SELL`}>SELL</Link>
        <Link to={`/signals?filter=HOLD`}>HOLD</Link>
      </div>
      <div className="signal-cards">
        {filteredSignals.map(renderSignalCard)}
      </div>
    </div>
  );
};

export default Signals;
```

```css
.signal-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg2);
  width: 300px;
  margin: 20px;
}

.asset-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.ticker {
  font-size: 24px;
  font-weight: 700;
  color: var(--t1);
}

.name {
  font-size: 18px;
  font-weight: 400;
  color: var(--t2);
}

.price {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
}

.score-bar {
  width: 100%;
  height: 10px;
  background-color: var(--t2);
  border-radius: 10px;
  overflow: hidden;
}

.score-bar-inner {
  height: 100%;
  background-color: var(--green);
  transition: width 0.2s ease-in-out;
}

.badges {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.badge {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg2);
  margin-right: 20px;
}

.rsi {
  background-color: var(--t2);
}

.rsi .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
}

.rsi .indicator {
  font-size: 14px;
  font-weight: 400;
  color: var(--t3);
}

.macd {
  background-color: var(--t2);
}

.macd .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
}

.macd .indicator {
  font-size: 14px;
  font-weight: 400;
  color: var(--t3);
}

.volume {
  background-color: var(--t2);
}

.volume .value {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
}

.volume .indicator {
  font-size: 14px;
  font-weight: 400;
  color: var(--t3);
}

.signal {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: 10px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background-color: var(--bg2);
  margin-top: 20px;
}

.signal .badge {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
}

.signal .icon {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
}

.filter-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.filter-container a {
  font-size: 18px;
  font-weight: 700;
  color: var(--t1);
  text-decoration: none;
  margin-right: 20px;
}

.filter-container a:hover {
  color: var(--green);
}

.signal-cards {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}