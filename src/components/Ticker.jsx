import { useEffect, useState } from 'react'
import { fetchTickerPrices } from '../hooks/useStockChart'

const DEFAULT_SYMBOLS = ['BTC-USD', 'ETH-USD', 'NVDA', 'AAPL', 'MSFT', 'SPY', 'GC=F', 'CL=F', 'TSLA', 'AMZN']
const LABELS = { 'BTC-USD': 'BTC', 'ETH-USD': 'ETH', 'GC=F': 'GOLD', 'CL=F': 'OIL', 'SPY': 'S&P500' }

export default function Ticker() {
  const [prices, setPrices] = useState({})

  useEffect(() => {
    fetchTickerPrices(DEFAULT_SYMBOLS).then(setPrices)
    const id = setInterval(() => fetchTickerPrices(DEFAULT_SYMBOLS).then(setPrices), 60000)
    return () => clearInterval(id)
  }, [])

  if (Object.keys(prices).length === 0) return null

  const items = DEFAULT_SYMBOLS.map(sym => {
    const d = prices[sym]
    if (!d) return null
    return { sym, label: LABELS[sym] || sym, price: d.price, change: d.change, currency: d.currency }
  }).filter(Boolean)

  if (items.length === 0) return null

  const doubled = [...items, ...items] // for seamless loop

  return (
    <div className="border-b border-white/[0.06] bg-[#0d0d16] overflow-hidden h-8 flex items-center">
      <div className="flex items-center gap-0 ticker-inner whitespace-nowrap">
        {doubled.map((item, i) => {
          const up = item.change >= 0
          return (
            <span key={i} className="flex items-center gap-1.5 px-4 text-xs border-r border-white/[0.06]">
              <span className="text-gray-500 font-medium">{item.label}</span>
              <span className="text-white font-semibold">
                {item.currency === 'USD' ? '$' : '€'}{item.price?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: item.price > 100 ? 2 : 4 })}
              </span>
              <span className={`font-medium ${up ? 'text-emerald-400' : 'text-red-400'}`}>
                {up ? '▲' : '▼'} {Math.abs(item.change)}%
              </span>
            </span>
          )
        })}
      </div>
    </div>
  )
}
