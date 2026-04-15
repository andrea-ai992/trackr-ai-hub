import { useState, useEffect, useCallback } from 'react'

const CHART_CACHE = {}
const TTL = { '1d': 60000, '5d': 300000, '1mo': 600000, '6mo': 3600000, '1y': 3600000, '5y': 86400000 }
const INTERVAL = { '1d': '5m', '5d': '15m', '1mo': '1d', '6mo': '1wk', '1y': '1mo', '5y': '3mo' }

export function useStockChart(symbol, range = '1mo') {
  const [data, setData] = useState([])
  const [meta, setMeta] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch_ = useCallback(async () => {
    if (!symbol) return
    const key = `${symbol}_${range}`
    const cached = CHART_CACHE[key]
    if (cached && Date.now() - cached.ts < (TTL[range] || 600000)) {
      setData(cached.data); setMeta(cached.meta); setLoading(false); return
    }
    setLoading(true); setError(null)
    try {
      const interval = INTERVAL[range] || '1d'
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (!res.ok) throw new Error('Chart API error')
      const json = await res.json()
      const result = json?.chart?.result?.[0]
      if (!result) throw new Error('Pas de données')
      const ts = result.timestamp || []
      const q = result.indicators?.quote?.[0] || {}
      const points = ts.map((t, i) => ({
        time: formatTime(t, range),
        open: q.open?.[i],
        high: q.high?.[i],
        low: q.low?.[i],
        close: q.close?.[i],
        volume: q.volume?.[i],
      })).filter(p => p.close != null)
      const m = result.meta
      const metaObj = {
        currency: m.currency,
        symbol: m.symbol,
        currentPrice: m.regularMarketPrice,
        previousClose: m.previousClose || m.chartPreviousClose,
        marketState: m.marketState,
        shortName: m.shortName,
        fullName: m.longName,
      }
      CHART_CACHE[key] = { data: points, meta: metaObj, ts: Date.now() }
      setData(points); setMeta(metaObj)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [symbol, range])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, meta, loading, error, refresh: fetch_ }
}

function formatTime(ts, range) {
  const d = new Date(ts * 1000)
  if (range === '1d') return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  if (range === '5d') return d.toLocaleDateString('fr-FR', { weekday: 'short', hour: '2-digit', minute: '2-digit' })
  if (range === '1mo') return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  return d.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })
}

// Fetch for ticker tape (multiple symbols at once)
const TICKER_CACHE = {}
export async function fetchTickerPrices(symbols) {
  const result = {}
  await Promise.allSettled(symbols.map(async sym => {
    const cached = TICKER_CACHE[sym]
    if (cached && Date.now() - cached.ts < 60000) { result[sym] = cached; return }
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=2d`,
        { signal: AbortSignal.timeout(6000) }
      )
      const json = await res.json()
      const m = json?.chart?.result?.[0]?.meta
      if (!m) return
      const price = m.regularMarketPrice
      const prev = m.previousClose || m.chartPreviousClose
      const change = prev ? ((price - prev) / prev) * 100 : 0
      const obj = { price, change: +change.toFixed(2), currency: m.currency, shortName: m.shortName }
      TICKER_CACHE[sym] = { ...obj, ts: Date.now() }
      result[sym] = obj
    } catch { /* skip */ }
  }))
  return result
}
