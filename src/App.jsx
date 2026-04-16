```jsx
// src/pages/CryptoMarkets.jsx
import { useState, useEffect, useCallback } from 'react'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

const COLORS = {
  bg: '#0a0a0f',
  card: '#12121a',
  cardBorder: 'rgba(102,0,234,0.15)',
  purple: '#6600ea',
  purpleLight: '#8b33ff',
  purpleDim: 'rgba(102,0,234,0.12)',
  red: '#ff2d55',
  redDim: 'rgba(255,45,85,0.12)',
  green: '#30d158',
  greenDim: 'rgba(48,209,88,0.12)',
  gold: '#ffd60a',
  goldDim: 'rgba(255,214,10,0.12)',
  text: '#ffffff',
  textSub: 'rgba(255,255,255,0.55)',
  textDim: 'rgba(255,255,255,0.35)',
  border: 'rgba(255,255,255,0.06)',
}

const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd' +
  '&order=market_cap_desc' +
  '&per_page=10' +
  '&page=1' +
  '&sparkline=true' +
  '&price_change_percentage=24h'

const SPIN_STYLE = `
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`

function formatPrice(price) {
  if (price >= 1000) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (price >= 1) {
    return '$' + price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })
  }
  return '$' + price.toFixed(6)
}

function formatMarketCap(val) {
  if (val >= 1e12) return '$' + (val / 1e12).toFixed(2) + 'T'
  if (val >= 1e9)  return '$' + (val / 1e9).toFixed(2) + 'B'
  if (val >= 1e6)  return '$' + (val / 1e6).toFixed(2) + 'M'
  return '$' + val.toLocaleString()
}

function formatVolume(val) {
  return formatMarketCap(val)
}

function SparklineChart({ data, positive }) {
  if (!data || data.length === 0) return null
  const chartData = data.map((v, i) => ({ i, v }))
  const color = positive ? COLORS.green : COLORS.red

  return (
    <ResponsiveContainer width="100%" height={52}>
      <LineChart data={chartData} margin={{ top: 4, right: 0, bottom: 4, left: 0 }}>
        <Line
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip content={() => null} />
      </LineChart>
    </ResponsiveContainer>
  )
}

function CoinCard({ coin, rank }) {
  const change = coin.price_change_percentage_24h || 0
  const positive = change >= 0
  const changeColor = positive ? COLORS.green : COLORS.red
  const changeBg = positive ? COLORS.greenDim : COLORS.redDim
  const sparkData = coin.sparkline_in_7d?.price || []

  return (
    <div
      style={{
        background: COLORS.card,
        border: `1px solid ${COLORS.cardBorder}`,
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        transition: 'border-color 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <img
            src={coin.image}
            alt={coin.name}
            width={40}
            height={40}
            style={{ borderRadius: '50%', display: 'block' }}
            onError={(e) => { e.target.style.display = 'none' }}
          />
          <span style={{
            position: 'absolute',
            bottom: -4,
            right: -6,
            fontSize: 9,
            fontWeight: 700,
            color: COLORS.textDim,
            background: COLORS.bg,
            borderRadius: 4,
            padding: '1px 4px',
            border: `1px solid ${COLORS.border}`,
            lineHeight: 1.4,
          }}>
            #{rank}
          </span>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: COLORS.text }}>
              {coin.name}
            </span>
            <span style={{ fontSize: 11, fontWeight: 600, color: COLORS.textDim, textTransform: 'uppercase' }}>
              {coin.symbol}
            </span>
          </div>
          <div style={{ fontSize: 12, color: COLORS.textSub, marginTop: 2 }}>
            MCap {formatMarketCap(coin.market_cap)}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: COLORS.text, whiteSpace: 'nowrap' }}>
            {formatPrice(coin.current_price)}
          </span>
          <span style={{
            fontSize: 12,
            fontWeight: 700,
            color: changeColor,
            background: changeBg,
            borderRadius: 6,
            padding: '2px 8px',
          }}>
            {positive ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>

      {sparkData.length > 0 && (
        <div style={{ marginTop: -4 }}>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>7-day chart</div>
          <SparklineChart data={sparkData} positive={positive} />
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 8,
        paddingTop: 8,
        borderTop: `1px solid ${COLORS.border}`,
      }}>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2, letterSpacing: '0.3px' }}>24h HIGH</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.green }}>
            {formatPrice(coin.high_24h || 0)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2, letterSpacing: '0.3px' }}>24h LOW</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.red }}>
            {formatPrice(coin.low_24h || 0)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2, letterSpacing: '0.3px' }}>VOLUME</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSub }}>
            {formatVolume(coin.total_volume || 0)}
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2, letterSpacing: '0.3px' }}>SUPPLY</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: COLORS.textSub }}>
            {coin.circulating_supply
              ? (coin.circulating_supply / 1e6).toFixed(2) + 'M'
              : '—'}
          </div>
        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 16,
      padding: '16px',
      height: 220,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          border: `2px solid ${COLORS.purpleLight}`,
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite',
        }} />
        <span style={{ fontSize: 12, color: COLORS.textDim }}>Loading...</span>
      </div>
    </div>
  )
}

function MarketSummaryBar({ coins }) {
  if (!coins.length) return null
  const gainers = coins.filter(c => (c.price_change_percentage_24h || 0) >= 0).length
  const losers = coins.length - gainers
  const avgChange = coins.reduce((s, c) => s + (c.price_change_percentage_24h || 0), 0) / coins.length
  const positive = avgChange >= 0

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      padding: '12px 16px',
      background: COLORS.card,
      border: `1px solid ${COLORS.cardBorder}`,
      borderRadius: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 80 }}>
        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>AVG 24H</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: positive ? COLORS.green : COLORS.red }}>
          {positive ? '+' : ''}{avgChange.toFixed(2)}%
        </div>
      </div>
      <div style={{ flex: 1, minWidth: 80 }}>
        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>GAINERS</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.green }}>{gainers} 📈</div>
      </div>
      <div style={{ flex: 1, minWidth: 80 }}>
        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>LOSERS</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.red }}>{losers} 📉</div>
      </div>
      <div style={{ flex: 1, minWidth: 80 }}>
        <div style={{ fontSize: 10, color: COLORS.textDim, marginBottom: 2 }}>TRACKED</div>
        <div style={{ fontSize: 14, fontWeight: 700, color: COLORS.text }}>{coins.length} 🪙</div>
      </div>
    </div>
  )
}

export default function CryptoMarkets() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [countdown, setCountdown] = useState(60)

  const fetchCoins = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)

    try {
      const res = await fetch(COINGECKO_URL, {
        headers: { Accept: 'application/json' },
      })

      if (res.status === 429) {
        throw new Error('Rate limit reached. Please wait a moment.')
      }
      if (!res.ok) {
        throw new Error(`API error: ${res.status} ${res.statusText}`)
      }

      const data = await res.json()
      if (!Array.isArray(data) || data.length === 0) {
        throw new Error('No data received from CoinGecko.')
      }

      setCoins(data)
      setLastUpdated(new Date())
      setCountdown(60)
    } catch (err) {
      setError(err.message || 'Failed to fetch market data.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchCoins(false)
  }, [fetchCoins])

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchCoins(true)
    }, 60_000)
    return () => clearInterval(interval)
  }, [fetchCoins])

  // Countdown timer
  useEffect(() => {
    if (loading) return
    const tick = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 60 : prev - 1))
    }, 1000)
    return () => clearInterval(tick)
  }, [loading])

  const handleManualRefresh = () => {
    if (!refreshing && !loading) {
      fetchCoins(true)
    }
  }

  return (
    <>
      <style>{SPIN_STYLE}</style>
      <div style={{
        minHeight: '100vh',
        background: COLORS.bg,
        padding: '0 0 80px 0',
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 16px 12px',
          borderBottom: `1px solid ${COLORS.border}`,
          position: 'sticky',
          top: 0,
          background: COLORS.bg,
          zIndex: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1 style={{
                fontSize: 20,
                fontWeight: 800,
                color: COLORS.text,
                margin: 0,
                letterSpacing: '-0.3px',
              }}>
                Crypto Markets
              </h1>
              <div style={{ fontSize: 11, color: COLORS.textDim, marginTop: 2 }}>
                {lastUpdated
                  ? `Updated ${lastUpdated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} · refresh in ${countdown}s`
                  : 'Fetching live data…'}
              </div>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              style={{
                background: COLORS.purpleDim,
                border: `1px solid ${COLORS.purple}`,
                borderRadius: 10,
                padding: '8px 14px',
                color: COLORS.purpleLight,
                fontSize: 12,
                fontWeight: 700,
                cursor: refreshing || loading ? 'not-allowed' : 'pointer',
                opacity: refreshing || loading ? 0.5 : 1,
                transition: 'opacity 0.2s',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span style={{
                display: 'inline-block',
                animation: refreshing ? 'spin 0.8s linear infinite' : 'none',
              }}>
                ↻
              </span>
              {refreshing ? 'Updating…' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '16px 16px 0' }}>
          {/* Error state */}
          {error && (
            <div style={{
              background: COLORS.redDim,
              border: `1px solid ${COLORS.red}`,
              borderRadius: 12,
              padding: '14px 16px',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
            }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>⚠️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: COLORS.red, marginBottom: 4 }}>
                  Failed to load market data
                </div>
                <div style={{ fontSize: 12, color: COLORS.textSub }}>{error}</div>
                <button
                  onClick={handleManualRefresh}
                  style={{
                    marginTop: 10,
                    background: 'transparent',
                    border: `1px solid ${COLORS.red}`,
                    borderRadius: 8,
                    padding: '5px 12px',
                    color: COLORS.red,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <LoadingCard key={i} />
              ))}
            </div>
          )}

          {/* Data state */}
          {!loading && !error && coins.length > 0 && (
            <>
              <MarketSummaryBar coins={coins} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {coins.map((coin, idx) => (
                  <CoinCard key={coin.id} coin={coin} rank={idx + 1} />
                ))}
              </div>
            </>
          )}

          {/* Empty state (should not occur normally) */}
          {!loading && !error && coins.length === 0 && (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: COLORS.textDim,
              fontSize: 14,
            }}>
              No market data available.
            </div>
          )}
        </div>
      </div>
    </>
  )
}