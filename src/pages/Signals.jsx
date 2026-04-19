import { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, AlertCircle, Check, X, RefreshCw } from 'lucide-react';

const assets = [
  { ticker: 'BTC', name: 'Bitcoin' },
  { ticker: 'ETH', name: 'Ethereum' },
  { ticker: 'NVDA', name: 'NVIDIA' },
  { ticker: 'SOL', name: 'Solana' },
  { ticker: 'AAPL', name: 'Apple' },
  { ticker: 'SPY', name: 'S&P 500 ETF' },
  { ticker: 'TSLA', name: 'Tesla' },
  { ticker: 'LINK', name: 'Chainlink' }
];

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [lastUpdated, setLastUpdated] = useState(null);

  const generateSignals = () => {
    const newSignals = assets.map(asset => {
      const rsi = Math.floor(Math.random() * 61) + 20;
      const volume = ['high', 'normal', 'low'][Math.floor(Math.random() * 3)];
      const price = (Math.random() * 10000 + 10).toFixed(2);

      let macdState = 'neutral';
      if (rsi < 30) macdState = 'bullish';
      else if (rsi > 70) macdState = 'bearish';

      let signal = 'HOLD';
      if (rsi < 30 && volume === 'high') signal = 'BUY';
      else if (rsi > 70 && volume === 'low') signal = 'SELL';

      return {
        ...asset,
        price,
        rsi,
        volume,
        macd: macdState,
        signal,
        score: Math.floor(Math.random() * 101)
      };
    });

    setSignals(newSignals);
    setLastUpdated(new Date());
  };

  useEffect(() => {
    generateSignals();
  }, []);

  const filteredSignals = signals.filter(signal => {
    if (filter === 'Tous') return true;
    return signal.signal === filter;
  });

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4 text-[var(--neon)]">SIGNALS</h1>
        <div className="flex items-center gap-4 mb-4">
          <div className="flex gap-2">
            {['Tous', 'BUY', 'SELL', 'HOLD'].map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-3 py-1 rounded text-sm ${filter === type ? 'bg-[var(--neon)] text-black' : 'bg-[var(--surface)] border border-[var(--border)]'}`}
              >
                {type}
              </button>
            ))}
          </div>
          <button
            onClick={generateSignals}
            className="flex items-center gap-2 px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-sm hover:bg-[var(--surface-high)] transition-colors"
          >
            <RefreshCw size={16} />
            Refresh
            {lastUpdated && (
              <span className="text-xs text-[var(--text-secondary)]">
                {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredSignals.map((signal, index) => (
          <div
            key={index}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-4 flex flex-col gap-3"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="text-xl font-bold text-[var(--neon)]">{signal.ticker}</div>
                <div className="text-xs text-[var(--text-secondary)]">{signal.name}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono">${signal.price}</div>
              </div>
            </div>

            <div className="w-full h-2 bg-[var(--surface-low)] rounded-full relative">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${signal.score}%`,
                  background: `linear-gradient(90deg, #ff0000 ${100 - signal.score}%, #00ff88 ${signal.score}%)`
                }}
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className={`px-2 py-1 rounded text-xs font-mono ${
                signal.rsi < 30 ? 'bg-blue-900/30 text-blue-300' :
                signal.rsi > 70 ? 'bg-red-900/30 text-red-300' :
                'bg-[var(--surface-low)] text-[var(--text-secondary)]'
              }`}>
                RSI {signal.rsi}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-mono ${
                signal.macd === 'bullish' ? 'bg-green-900/30 text-green-300' :
                signal.macd === 'bearish' ? 'bg-red-900/30 text-red-300' :
                'bg-[var(--surface-low)] text-[var(--text-secondary)]'
              }`}>
                MACD {signal.macd}
              </div>
              <div className={`px-2 py-1 rounded text-xs font-mono ${
                signal.volume === 'high' ? 'bg-purple-900/30 text-purple-300' :
                signal.volume === 'low' ? 'bg-orange-900/30 text-orange-300' :
                'bg-[var(--surface-low)] text-[var(--text-secondary)]'
              }`}>
                VOL {signal.volume}
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className={`flex items-center gap-1 px-3 py-1 rounded text-sm font-mono ${
                signal.signal === 'BUY' ? 'bg-green-900/30 text-green-300 border border-green-500/30' :
                signal.signal === 'SELL' ? 'bg-red-900/30 text-red-300 border border-red-500/30' :
                'bg-[var(--surface-low)] text-[var(--text-secondary)] border border-[var(--border)]'
              }`}>
                {signal.signal === 'BUY' && <ArrowUp size={14} />}
                {signal.signal === 'SELL' && <ArrowDown size={14} />}
                {signal.signal}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Signals;