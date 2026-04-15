import { useState, useEffect, useCallback } from 'react'

// Uses Yahoo Finance via a CORS proxy for live prices
const CACHE = {}
const CACHE_TTL = 60 * 1000 // 1 minute

export function useStockPrice(symbol) {
  const [price, setPrice] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchPrice = useCallback(async () => {
    if (!symbol) return
    const cached = CACHE[symbol]
    if (cached && Date.now() - cached.ts < CACHE_TTL) {
      setPrice(cached.price)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (!res.ok) throw new Error('Network error')
      const json = await res.json()
      const p = json?.chart?.result?.[0]?.meta?.regularMarketPrice
      if (p == null) throw new Error('No price data')
      CACHE[symbol] = { price: p, ts: Date.now() }
      setPrice(p)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [symbol])

  useEffect(() => {
    fetchPrice()
    const id = setInterval(fetchPrice, CACHE_TTL)
    return () => clearInterval(id)
  }, [fetchPrice])

  return { price, loading, error, refresh: fetchPrice }
}

export async function fetchMultiplePrices(symbols) {
  const results = {}
  await Promise.allSettled(
    symbols.map(async sym => {
      const cached = CACHE[sym]
      if (cached && Date.now() - cached.ts < CACHE_TTL) {
        results[sym] = cached.price
        return
      }
      try {
        const res = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`,
          { signal: AbortSignal.timeout(8000) }
        )
        const json = await res.json()
        const p = json?.chart?.result?.[0]?.meta?.regularMarketPrice
        if (p != null) {
          CACHE[sym] = { price: p, ts: Date.now() }
          results[sym] = p
        }
      } catch {
        // silently skip
      }
    })
  )
  return results
}
