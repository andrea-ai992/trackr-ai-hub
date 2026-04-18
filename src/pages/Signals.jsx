import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

const Signals = () => {
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Tous');

  const tickers = [
    { ticker: 'BTC', name: 'Bitcoin' },
    { ticker: 'ETH', name: 'Ethereum' },
    { ticker: 'NVDA', name: 'NVIDIA' },
    { ticker: 'SOL', name: 'Solana' },
    { ticker: 'AAPL', name: 'Apple' },
    { ticker: 'SPY', name: 'SPDR S&P 500' }
  ];

  const generateSignal = (ticker) => {
    const rsi = Math.floor(Math.random() * 100);
    const macd = (Math.random() * 20) - 10;
    const volume = Math.floor(Math.random() * 1000000000);
    const priceChange = (Math.random() * 20) - 10;

    let signal = 'HOLD';
    let signalColor = 'text-primary';

    if (rsi > 70 && macd > 0) {
      signal = 'SELL';
      signalColor = 'text-red-500';
    } else if (rsi < 30 && macd < 0) {
      signal = 'BUY';
      signalColor = 'text-green-500';
    }

    return {
      ticker,
      name: tickers.find(t => t.ticker === ticker).name,
      rsi,
      macd,
      volume,
      priceChange,
      signal,
      signalColor,
      bullish: signal === 'BUY' ? 100 : 0,
      bearish: signal === 'SELL' ? 100 : 0
    };
  };

  useEffect(() => {
    const fetchSignals = () => {
      setLoading(true);
      const newSignals = tickers.map(ticker => generateSignal(ticker.ticker));
      setSignals(newSignals);
      setLoading(false);
    };

    fetchSignals();
  }, []);

  const filteredSignals = filter === 'Tous'
    ? signals
    : signals.filter(signal => signal.signal === filter);

  const getBadgeColor = (value) => {
    if (value > 70) return 'bg-red-500';
    if (value < 30) return 'bg-green-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="min-h-screen bg-bg text-text-primary font-['JetBrains_Mono'] p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Signals</h1>
        <button
          onClick={() => {
            setLoading(true);
            setSignals(tickers.map(ticker => generateSignal(ticker.ticker)));
            setLoading(false);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface-high rounded-lg transition-colors"
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['Tous', 'BUY', 'SELL', 'HOLD'].map(type => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
              filter === type
                ? 'bg-surface-high border border-border-bright'
                : 'bg-surface hover:bg-surface-high'
            }`}
          >
            {type}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neon"></div>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="text-center py-20 text-text-muted">No signals found</div>
        ) : (
          filteredSignals.map((signal, index) => (
            <div
              key={index}
              className="bg-surface rounded-xl p-4 border border-border transition-all hover:border-border-bright"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-neon font-bold text-lg">{signal.ticker}</span>
                    <span className="text-text-secondary text-sm">{signal.name}</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className={`text-xs px-2 py-1 rounded ${signal.signalColor}`}>
                      {signal.signal}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-text-secondary text-sm">
                    {signal.priceChange > 0 ? '+' : ''}{signal.priceChange.toFixed(2)}%
                  </div>
                </div>
              </div>

              <div className="w-full bg-surface-low rounded-full h-2 mb-3">
                <div
                  className="h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${signal.bullish}%`,
                    background: `linear-gradient(90deg, #00ff88 ${signal.bullish}%, #ff0000 ${signal.bearish}%)`
                  }}
                ></div>
              </div>

              <div className="flex gap-2">
                <div className={`text-xs px-2 py-1 rounded ${getBadgeColor(signal.rsi)}`}>
                  RSI {signal.rsi}
                </div>
                <div className={`text-xs px-2 py-1 rounded ${signal.macd > 0 ? 'bg-green-500' : 'bg-red-500'}`}>
                  MACD {signal.macd.toFixed(2)}
                </div>
                <div className="text-xs px-2 py-1 rounded bg-surface-low">
                  Volume {signal.volume.toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Signals;