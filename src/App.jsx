import { useState, useEffect, useMemo } from 'react'
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'

const CRYPTO_SYMBOLS = ['bitcoin', 'ethereum', 'solana']

export default function CryptoTrader() {
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState('bitcoin')
  const [orderBook, setOrderBook] = useState({ bids: [], asks: [] })
  const [positions, setPositions] = useState([
    { symbol: 'bitcoin', entry: 42000, current: 42500, size: 0.05 },
    { symbol: 'ethereum', entry: 2800, current: 2750, size: 1.2 },
    { symbol: 'solana', entry: 120, current: 125, size: 5 }
  ])
  const [positionSize, setPositionSize] = useState(1)

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const responses = await Promise.all(
          CRYPTO_SYMBOLS.map(symbol =>
            fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${symbol}&vs_currencies=usd&include_24hr_change=true`)
          )
        )
        const data = await Promise.all(responses.map(r => r.json()))
        const priceData = {}
        data.forEach((item, i) => {
          const symbol = CRYPTO_SYMBOLS[i]
          priceData[symbol] = {
            price: item[symbol].usd,
            change: item[symbol].usd_24h_change
          }
        })
        setPrices(priceData)
        setLoading(false)
      } catch (err) {
        console.error('Failed to fetch prices:', err)
        setLoading(false)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, 15000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const generateOrderBook = () => {
      const midPrice = prices[selected]?.price || 50000
      const spread = midPrice * 0.001
      const bestBid = midPrice - spread / 2
      const bestAsk = midPrice + spread / 2

      const bids = Array.from({ length: 10 }, (_, i) => ({
        price: bestBid - (i * 10),
        size: Math.random() * 5 + 1
      }))

      const asks = Array.from({ length: 10 }, (_, i) => ({
        price: bestAsk + (i * 10),
        size: Math.random() * 5 + 1
      }))

      setOrderBook({ bids, asks })
    }

    generateOrderBook()
  }, [selected, prices])

  const updatePositionPrices = () => {
    setPositions(prev => prev.map(pos => {
      const currentPrice = prices[pos.symbol]?.price || pos.current
      return { ...pos, current: currentPrice }
    }))
  }

  useEffect(() => {
    updatePositionPrices()
    const interval = setInterval(updatePositionPrices, 5000)
    return () => clearInterval(interval)
  }, [prices])

  const selectedPrice = prices[selected] || { price: 0, change: 0 }
  const pnl = positions.reduce((acc, pos) => {
    const currentPrice = prices[pos.symbol]?.price || pos.current
    const pnlPercent = ((currentPrice - pos.entry) / pos.entry) * 100 * pos.size
    return acc + pnlPercent
  }, 0)

  const formatPrice = (price) => {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const formatChange = (change) => {
    return change.toFixed(2) + '%'
  }

  const formatCurrency = (value) => {
    return '$' + value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  const handleBuy = () => {
    const newPosition = {
      symbol: selected,
      entry: prices[selected]?.price || 0,
      current: prices[selected]?.price || 0,
      size: positionSize
    }
    setPositions(prev => [...prev, newPosition])
  }

  const handleSell = () => {
    const newPosition = {
      symbol: selected,
      entry: prices[selected]?.price || 0,
      current: prices[selected]?.price || 0,
      size: -positionSize
    }
    setPositions(prev => [...prev, newPosition])
  }

  return (
    <div className="w-full h-full min-h-screen flex flex-col" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {/* Header */}
      <div className="w-full p-4 border-b border-bright">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-2">
            <img
              src={`https://cryptologos.cc/logos/${selected === 'bitcoin' ? 'bitcoin-btc-logo' : selected === 'ethereum' ? 'ethereum-eth-logo' : 'solana-sol-logo'}`}
              alt={selected}
              className="w-6 h-6"
            />
            <span className="text-lg font-bold">{selected.toUpperCase()}</span>
            <ChevronDown size={16} className="text-text-muted" />
          </div>
        </div>

        <div className="flex gap-4 mb-4">
          {CRYPTO_SYMBOLS.map(symbol => (
            <button
              key={symbol}
              onClick={() => setSelected(symbol)}
              className={`px-3 py-1 rounded text-sm ${selected === symbol ? 'bg-surface-high text-neon border border-neon' : 'text-text-secondary hover:text-text-primary'}`}
            >
              {symbol.toUpperCase()}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <div className="text-2xl font-bold">
            {loading ? 'Loading...' : formatCurrency(selectedPrice.price)}
          </div>
          <div className={`text-sm flex items-center gap-1 ${selectedPrice.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {selectedPrice.change >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {formatChange(selectedPrice.change)}
          </div>
        </div>
      </div>

      {/* PnL Bar */}
      <div className="w-full px-4 py-2">
        <div className="w-full h-2 rounded-full bg-surface-low overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min(Math.max(pnl, -100), 100) + 100}%`,
              background: pnl >= 0 ? 'linear-gradient(90deg, #00ff88, #00aa55)' : 'linear-gradient(90deg, #ff4444, #aa0000)'
            }}
          />
        </div>
        <div className="text-xs text-text-muted mt-1 text-center">
          P&L: {pnl >= 0 ? '+' : ''}{pnl.toFixed(2)}%
        </div>
      </div>

      {/* Order Book */}
      <div className="flex-1 flex flex-col overflow-hidden px-4 py-2">
        <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs text-text-muted mb-1">BIDS</div>
          {orderBook.bids.map((bid, i) => (
            <div key={`bid-${i}`} className="flex justify-between text-xs">
              <span className="text-green-500">{formatPrice(bid.price)}</span>
              <span className="text-text-secondary">{bid.size.toFixed(2)}</span>
            </div>
          ))}

          <div className="flex justify-between text-sm font-bold my-1 py-1 border-t border-b border-bright">
            <span>PRICE</span>
            <span>SIZE</span>
          </div>

          <div className="text-xs text-text-muted mb-1">ASKS</div>
          {orderBook.asks.map((ask, i) => (
            <div key={`ask-${i}`} className="flex justify-between text-xs">
              <span className="text-red-500">{formatPrice(ask.price)}</span>
              <span className="text-text-secondary">{ask.size.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Positions */}
      <div className="w-full px-4 py-2 overflow-y-auto max-h-40">
        <div className="text-xs text-text-muted mb-2">OPEN POSITIONS</div>
        {positions.length === 0 ? (
          <div className="text-xs text-text-muted text-center py-2">No open positions</div>
        ) : (
          positions.map((pos, i) => {
            const currentPrice = prices[pos.symbol]?.price || pos.current
            const pnlPercent = ((currentPrice - pos.entry) / pos.entry) * 100 * pos.size
            const pnlColor = pnlPercent >= 0 ? 'text-green-500' : 'text-red-500'

            return (
              <div key={`pos-${i}`} className="flex justify-between text-xs mb-1 py-1 border-b border-bright">
                <div className="flex flex-col">
                  <span className="font-bold">{pos.symbol.toUpperCase()}</span>
                  <span className="text-text-muted text-xs">
                    {pos.size > 0 ? 'LONG' : 'SHORT'} • {formatPrice(pos.entry)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={pnlColor}>{pnlPercent >= 0 ? '+' : ''}{pnlPercent.toFixed(2)}%</span>
                  <span className="text-text-muted text-xs">{formatPrice(currentPrice)}</span>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Controls */}
      <div className="w-full px-4 py-4 border-t border-bright">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPositionSize(prev => Math.max(0.01, prev - 0.01))}
              className="px-3 py-1 text-lg hover:bg-surface-high rounded"
            >
              -
            </button>
            <span className="text-lg font-bold">{positionSize}</span>
            <button
              onClick={() => setPositionSize(prev => prev + 0.01)}
              className="px-3 py-1 text-lg hover:bg-surface-high rounded"
            >
              +
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleSell}
            className="w-full py-3 bg-red-900/50 hover:bg-red-800/50 text-red-400 rounded border border-red-500/30 text-sm font-bold press-scale"
          >
            SELL
          </button>
          <button
            onClick={handleBuy}
            className="w-full py-3 bg-green-900/50 hover:bg-green-800/50 text-green-400 rounded border border-green-500/30 text-sm font-bold press-scale"
          >
            BUY
          </button>
        </div>
      </div>
    </div>
  )
}