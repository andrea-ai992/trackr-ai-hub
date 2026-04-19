import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [filter, setFilter] = useState('Tous');
  const [loading, setLoading] = useState(true);

  const tickers = [
    { ticker: 'BTC', name: 'Bitcoin' },
    { ticker: 'ETH', name: 'Ethereum' },
    { ticker: 'NVDA', name: 'NVIDIA' },
    { ticker: 'SOL', name: 'Solana' },
    { ticker: 'AAPL', name: 'Apple' },
    { ticker: 'SPY', name: 'S&P 500' }
  ];

  const generateSignal = () => {
    return tickers.map(ticker => {
      const rsi = Math.floor(Math.random() * 100);
      const macd = (Math.random() * 20) - 10;
      const volume = Math.floor(Math.random() * 5000000) + 1000000;
      const priceChange = (Math.random() * 20) - 10;
      const sentiment = Math.random() * 100;

      let signal;
      let signalColor;
      let score;

      if (sentiment > 70) {
        signal = 'BUY';
        signalColor = 'var(--neon)';
        score = Math.min(100, Math.floor(sentiment + (100 - rsi) / 2));
      } else if (sentiment < 30) {
        signal = 'SELL';
        signalColor = '#ff4444';
        score = Math.min(100, Math.floor((100 - sentiment) / 2 + rsi / 2));
      } else {
        signal = 'HOLD';
        signalColor = '#ffff00';
        score = Math.floor(sentiment);
      }

      const rsiColor = rsi > 70 ? '#ff4444' : rsi < 30 ? 'var(--neon)' : '#aaa';
      const macdColor = macd > 0 ? 'var(--neon)' : '#ff4444';
      const volumeColor = volume > 3000000 ? 'var(--neon)' : '#aaa';

      return {
        ticker: ticker.ticker,
        name: ticker.name,
        rsi: { value: rsi, color: rsiColor },
        macd: { value: macd.toFixed(2), color: macdColor },
        volume: { value: (volume / 1000000).toFixed(1) + 'M', color: volumeColor },
        priceChange: priceChange.toFixed(2) + '%',
        sentiment: Math.floor(sentiment),
        signal: { type: signal, color: signalColor },
        score: score
      };
    });
  };

  useEffect(() => {
    const fetchSignals = () => {
      setLoading(true);
      const newSignals = generateSignal();
      setSignals(newSignals);
      setLoading(false);
    };

    fetchSignals();
  }, []);

  const handleRefresh = () => {
    setLoading(true);
    const newSignals = generateSignal();
    setSignals(newSignals);
    setLoading(false);
  };

  const filteredSignals = filter === 'Tous'
    ? signals
    : signals.filter(signal => signal.signal.type === filter);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-primary)] font-[JetBrains_Mono] p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-[var(--neon)]">Signaux IA Trading</h1>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 rounded bg-[var(--surface)] hover:bg-[var(--surface-high)] transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Rafraîchir</span>
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        {['Tous', 'BUY', 'SELL', 'HOLD'].map((option) => (
          <button
            key={option}
            onClick={() => setFilter(option)}
            className={`px-3 py-1.5 rounded text-sm transition-colors ${
              filter === option
                ? 'bg-[var(--neon)] text-black font-bold'
                : 'bg-[var(--surface)] hover:bg-[var(--surface-high)]'
            }`}
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        {filteredSignals.map((signal, index) => (
          <div
            key={index}
            className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)]"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-[var(--neon)]">{signal.ticker}</span>
                  <span className="text-sm text-[var(--text-secondary)]">{signal.name}</span>
                </div>
                <div className="text-sm text-[var(--text-muted)] mt-1">
                  {signal.priceChange}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-[var(--text-secondary)]">Score</div>
                <div className="text-lg font-bold" style={{ color: signal.score > 70 ? 'var(--neon)' : signal.score > 30 ? '#aaa' : '#ff4444' }}>
                  {signal.score}/100
                </div>
              </div>
            </div>

            <div className="w-full bg-[var(--surface-low)] rounded-full h-1.5 mb-3">
              <div
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: `${signal.score}%`,
                  background: signal.signal.type === 'BUY'
                    ? 'linear-gradient(90deg, #00ff88, #00aa55)'
                    : signal.signal.type === 'SELL'
                      ? 'linear-gradient(90deg, #ff4444, #aa0000)'
                      : 'linear-gradient(90deg, #ffff00, #aaaa00)'
                }}
              ></div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <div className="px-2 py-1 rounded text-xs bg-[var(--surface-high)] border border-[var(--border)]" style={{ color: signal.rsi.color }}>
                RSI {signal.rsi.value}
              </div>
              <div className="px-2 py-1 rounded text-xs bg-[var(--surface-high)] border border-[var(--border)]" style={{ color: signal.macd.color }}>
                MACD {signal.macd.value}
              </div>
              <div className="px-2 py-1 rounded text-xs bg-[var(--surface-high)] border border-[var(--border)]" style={{ color: signal.volume.color }}>
                Volume {signal.volume.value}
              </div>
              <div className="px-2 py-1 rounded text-xs bg-[var(--surface-high)] border border-[var(--border)]" style={{ color: signal.signal.color }}>
                {signal.signal.type}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Signals;