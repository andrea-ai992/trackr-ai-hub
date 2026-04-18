import { useState, useEffect } from 'react'
import { RefreshCw } from 'lucide-react'

const SIGNALS = [
  { ticker: 'BTC', name: 'Bitcoin', symbol: 'bitcoin' },
  { ticker: 'ETH', name: 'Ethereum', symbol: 'ethereum' },
  { ticker: 'NVDA', name: 'NVIDIA', symbol: 'nvidia' },
  { ticker: 'SOL', name: 'Solana', symbol: 'solana' },
  { ticker: 'AAPL', name: 'Apple', symbol: 'apple' },
  { ticker: 'SPY', name: 'S&P 500', symbol: 'spy' }
]

const generateSignalData = () => {
  const now = Date.now()
  return SIGNALS.map(signal => {
    const rsi = Math.floor(Math.random() * 100)
    const macd = (Math.random() * 20 - 10).toFixed(2)
    const volume = Math.floor(Math.random() * 50000000 + 1000000)

    let signal
    let signalColor
    let bullishScore = 0
    let bearishScore = 0

    if (rsi > 70) {
      signal = 'SELL'
      signalColor = 'text-red-500'
      bearishScore = Math.min(100, rsi - 30)
      bullishScore = 0
    } else if (rsi < 30) {
      signal = 'BUY'
      signalColor = 'text-green-500'
      bullishScore = Math.min(100, 70 - rsi)
      bearishScore = 0
    } else {
      signal = 'HOLD'
      signalColor = 'text-yellow-500'
      bullishScore = Math.min(100, 70 - rsi)
      bearishScore = Math.min(100, rsi - 30)
    }

    const priceChange = (Math.random() * 20 - 10).toFixed(2)
    const price = (Math.random() * 50000 + 1000).toFixed(2)

    return {
      ...signal,
      rsi,
      macd,
      volume,
      signal,
      signalColor,
      bullishScore,
      bearishScore,
      priceChange: parseFloat(priceChange),
      price: parseFloat(price),
      lastUpdated: now
    }
  })
}

export default function Signals() {
  const [signals, setSignals] = useState(generateSignalData())
  const [filter, setFilter] = useState('Tous')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => prev.map(signal => ({
        ...signal,
        ...generateSignalData().find(s => s.ticker === signal.ticker)
      })))
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  const filteredSignals = filter === 'Tous'
    ? signals
    : signals.filter(signal => signal.signal === filter)

  const refreshSignals = () => {
    setLoading(true)
    setSignals(generateSignalData())
    setTimeout(() => setLoading(false), 300)
  }

  return (
    <div className="w-full min-h-screen flex flex-col" style={{ fontFamily: 'JetBrains Mono, monospace', backgroundColor: 'var(--bg)', color: 'var(--text-primary)' }}>
      <div className="w-full p-4 border-b border-var(--border-bright)">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Signaux IA Trading</h1>
          <button
            onClick={refreshSignals}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1 rounded bg-surface-high hover:bg-surface text-sm press-scale"
          >
            <RefreshCw size={16} className={`${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Rafraîchissement...' : 'Rafraîchir'}
          </button>
        </div>

        <div className="flex gap-2 mb-4 overflow-x-auto">
          {['Tous', 'BUY', 'SELL', 'HOLD'].map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1 rounded text-xs whitespace-nowrap ${
                filter === type
                  ? 'bg-surface-high text-neon border border-neon'
                  : 'bg-surface text-text-secondary hover:text-text-primary'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredSignals.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-muted">
            Aucun signal correspondant
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredSignals.map((signal, index) => (
              <div
                key={signal.ticker}
                className="w-full p-4 rounded-lg bg-surface border border-var(--border) hover:border-neon/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-high flex items-center justify-center">
                      <span className="text-sm font-bold">{signal.ticker}</span>
                    </div>
                    <div>
                      <div className="font-bold">{signal.name}</div>
                      <div className="text-xs text-text-secondary">
                        {signal.symbol.toUpperCase()} • {new Date(signal.lastUpdated).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${signal.signalColor}`}>
                    {signal.signal}
                  </div>
                </div>

                <div className="w-full h-1 bg-surface-low rounded-full mb-3 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${signal.bullishScore}%`,
                      background: `linear-gradient(90deg, var(--neon), rgba(0,255,136,0.3))`,
                      transform: signal.signal === 'SELL' ? 'scaleX(-1)' : 'scaleX(1)'
                    }}
                  />
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className={`px-2 py-1 rounded text-xs bg-surface-high border border-var(--border) ${
                    signal.rsi > 70 ? 'text-red-500 border-red-500/30' :
                    signal.rsi < 30 ? 'text-green-500 border-green-500/30' : 'text-text-primary'
                  }`}>
                    RSI: {signal.rsi}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs bg-surface-high border border-var(--border) ${
                    parseFloat(signal.macd) > 0 ? 'text-green-500 border-green-500/30' :
                    parseFloat(signal.macd) < 0 ? 'text-red-500 border-red-500/30' : 'text-text-primary'
                  }`}>
                    MACD: {signal.macd}
                  </div>
                  <div className="px-2 py-1 rounded text-xs bg-surface-high border border-var(--border) text-text-primary">
                    Volume: {signal.volume.toLocaleString()}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-var(--border) flex items-center justify-between">
                  <div className="text-sm">
                    <div className="text-text-secondary">Prix</div>
                    <div className="font-bold">${signal.price.toFixed(2)}</div>
                  </div>
                  <div className={`text-sm ${signal.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {signal.priceChange >= 0 ? '▲' : '▼'} {Math.abs(signal.priceChange).toFixed(2)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}