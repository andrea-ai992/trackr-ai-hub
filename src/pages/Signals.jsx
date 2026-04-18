import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle, PauseCircle, RefreshCw } from 'lucide-react';

const assets = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'SOL', name: 'Solana' },
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'SPY', name: 'S&P 500' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'LINK', name: 'Chainlink' }
];

const Signals = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    generateSignals();
  }, []);

  const generateSignals = () => {
    const newData = assets.map(asset => {
      const rsi = Math.floor(Math.random() * 60) + 20;
      const volumeLevel = Math.random() > 0.7 ? 'high' : Math.random() > 0.4 ? 'normal' : 'low';

      let macdStatus;
      if (rsi < 30) {
        macdStatus = 'bullish';
      } else if (rsi > 70) {
        macdStatus = 'bearish';
      } else {
        macdStatus = Math.random() > 0.5 ? 'bullish' : 'neutral';
      }

      let signal;
      if (rsi < 30 && volumeLevel === 'high' && macdStatus === 'bullish') {
        signal = 'BUY';
      } else if (rsi > 70 && volumeLevel === 'high' && macdStatus === 'bearish') {
        signal = 'SELL';
      } else {
        signal = 'HOLD';
      }

      return {
        ...asset,
        price: (Math.random() * 10000).toFixed(2),
        rsi,
        volume: volumeLevel,
        macd: macdStatus,
        score: Math.floor(Math.random() * 100),
        signal
      };
    });

    setData(newData);
    setLastUpdated(new Date());
  };

  const filteredData = data.filter(item => {
    if (filter === 'Tous') return true;
    return item.signal === filter;
  });

  return (
    <div className="signals-page">
      <header className="signals-header">
        <h1>SIGNALS</h1>
        <div className="header-controls">
          <div className="filter-buttons">
            {['Tous', 'BUY', 'SELL', 'HOLD'].map(type => (
              <button
                key={type}
                className={`filter-btn ${filter === type ? 'active' : ''}`}
                onClick={() => setFilter(type)}
              >
                {type}
              </button>
            ))}
          </div>
          <button className="refresh-btn" onClick={generateSignals}>
            <RefreshCw size={16} />
            <span>{lastUpdated.toLocaleTimeString()}</span>
          </button>
        </div>
      </header>

      <div className="signals-grid">
        {filteredData.map((item, index) => (
          <div key={index} className="signal-card">
            <div className="card-header">
              <div className="ticker-price">
                <span className="ticker">{item.ticker}</span>
                <span className="price">${item.price}</span>
              </div>
              <span className="name">{item.name}</span>
            </div>

            <div className="score-bar-container">
              <div
                className="score-bar"
                style={{ width: `${item.score}%` }}
              ></div>
            </div>

            <div className="indicators">
              <div className="indicator">
                <span className="label">RSI</span>
                <span className={`value ${item.rsi < 30 ? 'oversold' : item.rsi > 70 ? 'overbought' : ''}`}>
                  {item.rsi}
                </span>
              </div>
              <div className="indicator">
                <span className="label">MACD</span>
                <span className={`value ${item.macd}`}>{item.macd}</span>
              </div>
              <div className="indicator">
                <span className="label">VOL</span>
                <span className={`value ${item.volume}`}>{item.volume}</span>
              </div>
            </div>

            <div className={`signal-badge ${item.signal.toLowerCase()}`}>
              {item.signal === 'BUY' && <ArrowUp size={16} />}
              {item.signal === 'SELL' && <ArrowDown size={16} />}
              {item.signal === 'HOLD' && <PauseCircle size={16} />}
              <span>{item.signal}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Signals;