import { useState, useEffect, useCallback } from 'react'

const CACHE = {}
const TTL = { '1': 60000, '7': 300000, '30': 600000, '90': 3600000, '365': 3600000 }

export function useCryptoChart(coinId, days = '30') {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetch_ = useCallback(async () => {
    if (!coinId) return
    const key = `${coinId}_${days}`
    const cached = CACHE[key]
    if (cached && Date.now() - cached.ts < (TTL[days] || 600000)) {
      setData(cached.data); setLoading(false); return
    }
    setLoading(true); setError(null)
    try {
      const res = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
        { signal: AbortSignal.timeout(12000) }
      )
      if (!res.ok) throw new Error('CoinGecko error ' + res.status)
      const json = await res.json()
      const prices = (json.prices || []).map(([ts, price]) => ({
        time: formatTime(ts, days),
        close: price,
        ts,
      }))
      CACHE[key] = { data: prices, ts: Date.now() }
      setData(prices)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [coinId, days])

  useEffect(() => { fetch_() }, [fetch_])

  return { data, loading, error, refresh: fetch_ }
}

function formatTime(ts, days) {
  const d = new Date(ts)
  if (days === '1') return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
  if (days === '7') return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
  if (days === '30') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
}
