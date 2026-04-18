Création de src/pages/Signals.jsx

```jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Link } from 'react-router-dom';
import { SupabaseClient } from '@supabase/supabase-js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowUp, faArrowDown, faCircle } from '@fortawesome/free-solid-svg-icons';
import Lucide from 'lucide-react';

const supabase = new SupabaseClient('https://trackr-app-nu.vercel.app/.supabase', {
  key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c'
});

const assets = [
  { ticker: 'BTC', name: 'Bitcoin', price: 45000 },
  { ticker: 'ETH', name: 'Ethereum', price: 2500 },
  { ticker: 'NVDA', name: 'NVIDIA', price: 550 },
  { ticker: 'SOL', name: 'Solana', price: 120 },
  { ticker: 'AAPL', name: 'Apple', price: 150 },
  { ticker: 'SPY', name: 'S&P 500', price: 450 },
  { ticker: 'TSLA', name: 'Tesla', price: 1000 },
  { ticker: 'LINK', name: 'Chainlink', price: 20 },
];

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    const fetchSignals = async () => {
      const { data, error } = await supabase
        .from('signals')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) {
        console.error(error);
      } else {
        setSignals(data);
      }
    };
    fetchSignals();
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const fetchSignals = async () => {
        const { data, error } = await supabase
          .from('signals')
          .select('*')
          .order('created_at', { ascending: false });
        if (error) {
          console.error(error);
        } else {
          setSignals(data);
          setLastUpdated(new Date().toLocaleTimeString());
        }
      };
      fetchSignals();
    }, 60000);
    return () => clearInterval(intervalId);
  }, []);

  const rsi = (price, period = 14) => {
    const gains = [];
    for (let i = 0; i < period; i++) {
      const gain = price[i] - price[i - 1];
      gains.push(gain > 0 ? gain : 0);
    }
    const averageGain = gains.reduce((a, b) => a + b, 0) / gains.length;
    const losses = [];
    for (let i = 0; i < period; i++) {
      const loss = price[i - 1] - price[i];
      losses.push(loss > 0 ? 0 : loss);
    }
    const averageLoss = losses.reduce((a, b) => a + b, 0) / losses.length;
    const rs = averageGain / averageLoss;
    return 100 - (100 / (1 + rs));
  };

  const macd = (price, period = 12) => {
    const ema12 = [];
    const ema26 = [];
    for (let i = 0; i < price.length; i++) {
      if (i < period) {
        ema12.push(price[i]);
        ema26.push(price[i]);
      } else {
        const ema12Last = ema12[i - 1];
        const ema26Last = ema26[i - 1];
        const ema12New = (price[i] + (period - 1) * ema12Last) / period;
        const ema26New = (price[i] + (period - 1) * ema26Last) / period;
        ema12.push(ema12New);
        ema26.push(ema26New);
      }
    }
    const macdLine = ema12[ema12.length - 1] - ema26[ema26.length - 1];
    const signalLine = ema12[ema12.length - 1];
    return macdLine > signalLine ? 'Bullish' : macdLine < signalLine ? 'Bearish' : 'Neutral';
  };

  const calculateSignal = (price, rsiValue, macdValue) => {
    if (rsiValue < 30 && macdValue === 'Bullish') {
      return 'BUY';
    } else if (rsiValue > 70 && macdValue === 'Bearish') {
      return 'SELL';
    } else {
      return 'HOLD';
    }
  };

  const filteredSignals = signals.filter((signal) => {
    if (filter === 'Tous') {
      return true;
    } else if (filter === 'BUY') {
      return signal.signal === 'BUY';
    } else if (filter === 'SELL') {
      return signal.signal === 'SELL';
    } else {
      return signal.signal === 'HOLD';
    }
  });

  return (
    <div className="container">
      <header>
        <div className="filter">
          <button
            className={filter === 'Tous' ? 'active' : ''}
            onClick={() => setFilter('Tous')}
          >
            Tous
          </button>
          <button
            className={filter === 'BUY' ? 'active' : ''}
            onClick={() => setFilter('BUY')}
          >
            BUY
          </button>
          <button
            className={filter === 'SELL' ? 'active' : ''}
            onClick={() => setFilter('SELL')}
          >
            SELL
          </button>
          <button
            className={filter === 'HOLD' ? 'active' : ''}
            onClick={() => setFilter('HOLD')}
          >
            HOLD
          </button>
        </div>
        <button className="refresh" onClick={() => window.location.reload()}>
          <FontAwesomeIcon icon={faArrowUp} />
          <span>Refresh</span>
          <span>{lastUpdated}</span>
        </button>
      </header>
      <main>
        {filteredSignals.map((signal, index) => (
          <div key={index} className="card">
            <h2>
              {signal.asset.ticker} - {signal.asset.name}
            </h2>
            <p>
              Prix simulé : {signal.price}
            </p>
            <div className="score">
              <div className="bar">
                <div
                  className="fill"
                  style={{
                    width: `${signal.score}%`,
                    backgroundColor: signal.score < 50 ? '#ff0000' : '#00ff00',
                  }}
                />
              </div>
              <span>{signal.score}%</span>
            </div>
            <div className="badges">
              <div className="badge">
                <span>RSI</span>
                <span style={{ color: signal.rsi < 30 ? '#ff0000' : signal.rsi > 70 ? '#00ff00' : '#000' }}>
                  {signal.rsi}
                </span>
              </div>
              <div className="badge">
                <span>MACD</span>
                <span style={{ color: signal.macd === 'Bullish' ? '#00ff00' : signal.macd === 'Bearish' ? '#ff0000' : '#000' }}>
                  {signal.macd}
                </span>
              </div>
              <div className="badge">
                <span>Volumen</span>
                <span style={{ color: signal.volume === 'High' ? '#00ff00' : signal.volume === 'Normal' ? '#000' : '#ff0000' }}>
                  {signal.volume}
                </span>
              </div>
            </div>
            <div className="signal">
              <span>{signal.signal}</span>
              <FontAwesomeIcon
                icon={signal.signal === 'BUY' ? faArrowUp : signal.signal === 'SELL' ? faArrowDown : faCircle}
                style={{ color: signal.signal === 'BUY' ? '#00ff00' : signal.signal === 'SELL' ? '#ff0000' : '#000' }}
              />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Signals;
```

```css
.container {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: var(--bg);
  color: var(--t1);
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: var(--bg2);
  border-bottom: 1px solid var(--border);
}

.filter {
  display: flex;
  gap: 10px;
}

.filter button {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--bg2);
  color: var(--t1);
  cursor: pointer;
}

.filter button.active {
  background-color: var(--green);
  color: var(--bg);
}

.refresh {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: var(--bg2);
  color: var(--t1);
  cursor: pointer;
}

.refresh span {
  margin-left: 10px;
}

.main {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.card {
  padding: 20px;
  background-color: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card h2 {
  margin-top: 0;
}

.score {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--bg2);
  border-radius: 5px;
  border: 1px solid var(--border);
}

.bar {
  width: 100%;
  height: 10px;
  background-color: var(--bg);
  border-radius: 5px;
  overflow: hidden;
}

.fill {
  height: 100%;
  background-color: var(--t1);
}

.badges {
  display: flex;
  gap: 10px;
}

.badge {
  padding: 10px;
  background-color: var(--bg2);
  border: 1px solid var(--border);
  border-radius: 5px;
}

.badge span {
  margin-bottom: 5px;
}

.signal {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: var(--bg2);
  border-radius: 5px;
  border: 1px solid var(--border);
}

.signal span {
  margin-right: 10px;
}
```

```json
"dependencies": {
  "react": "^18.2.0",
  "react-router-dom": "^6.4.3",
  "lucide-react": "^0.1.0",
  "supabase-js": "^1.32.0"
}