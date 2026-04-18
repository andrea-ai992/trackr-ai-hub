import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Zap, RefreshCw, ChevronDown, CheckCircle, AlertCircle, Info } from 'lucide-react'

// ─── Assets ───────────────────────────────────────────────────────────────────
const ASSETS = [
  { label: 'BTC',   symbol: 'BTC-USD',  tv: 'COINBASE:BTCUSD', type: 'crypto' },
  { label: 'ETH',   symbol: 'ETH-USD',  tv: 'COINBASE:ETHUSD', type: 'crypto' },
  { label: 'SOL',   symbol: 'SOL-USD',  tv: 'COINBASE:SOLUSD', type: 'crypto' },
  { label: 'NVDA',  symbol: 'NVDA',     tv: 'NASDAQ:NVDA',     type: 'stock'  },
  { label: 'AAPL',  symbol: 'AAPL',     tv: 'NASDAQ:AAPL',     type: 'stock'  },
  { label: 'TSLA',  symbol: 'TSLA',     tv: 'NASDAQ:TSLA',     type: 'stock'  },
  { label: 'SPX',   symbol: '^GSPC',    tv: 'SP:SPX',          type: 'index'  },
  { label: 'GOLD',  symbol: 'GC=F',     tv: 'TVC:GOLD',        type: 'commo'  },
]

const TIMEFRAMES = [
  { label: '15m', tv: '15',  api: '15m' },
  { label: '1H',  tv: '60',  api: '1h'  },
  { label: '4H',  tv: '240', api: '4h'  },
  { label: '1D',  tv: 'D',   api: '1d'  },
  { label: '1W',  tv: 'W',   api: '1w'  },
]

const TYPE_COLOR = { crypto: '#f59e0b', stock: '#6366f1', index: '#10b981', commo: '#fcd34d' }
const RECOMMENDATION_COLORS = { BUY: '#10b981', SELL: '#ef4444', HOLD: '#f59e0b' }
const RECOMMENDATION_ICONS = { BUY: CheckCircle, SELL: AlertCircle, HOLD: Info }

// ─── TradingView Lightweight Charts Integration ───────────────────────────────
function LightweightChart({ data, interval }) {
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const seriesRef = useRef(null)

  useEffect(() => {
    if (!chartContainerRef.current || !data || data.length === 0) return

    // Cleanup previous chart
    if (chartRef.current) {
      chartRef.current.remove()
      chartRef.current = null
      seriesRef.current = null
    }

    const container = chartContainerRef.current
    const height = container.clientHeight
    const width = container.clientWidth

    // Initialize chart
    chartRef.current = LightweightCharts.createChart(container, {
      layout: {
        backgroundColor: 'var(--bg2)',
        textColor: 'var(--t1)',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.07)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.07)' },
      },
      width: width,
      height: height,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        scaleMargins: {
          top: 0.1,
          bottom: 0.2,
        },
      },
      crosshair: {
        mode: LightweightCharts.CrosshairMode.Normal,
      },
    })

    // Add candlestick series
    seriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: '#26a69a',
      downColor: '#ef5350',
      borderVisible: false,
      wickUpColor: '#26a69a',
      wickDownColor: '#ef5350',
      borderUpColor: '#26a69a',
      borderDownColor: '#ef5350',
    })

    // Set data
    seriesRef.current.setData(data)

    // Handle resize
    const handleResize = () => {
      if (chartRef.current && container) {
        chartRef.current.applyOptions({
          width: container.clientWidth,
          height: container.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      if (chartRef.current) {
        chartRef.current.remove()
        chartRef.current = null
        seriesRef.current = null
      }
    }
  }, [data, interval])

  return <div ref={chartContainerRef} style={{ width: '100%', height: '100%' }} />
}

// ─── Fetch OHLC Data ──────────────────────────────────────────────────────────
async function fetchOHLCData(symbol, interval) {
  try {
    const apiInterval = TIMEFRAMES.find(tf => tf.tv === interval)?.api || '1h'
    const endTime = Math.floor(Date.now() / 1000)
    let startTime

    switch(apiInterval) {
      case '15m':
        startTime = endTime - (7 * 24 * 60 * 60) // 7 days
        break
      case '1h':
        startTime = endTime - (30 * 24 * 60 * 60) // 30 days
        break
      case '4h':
        startTime = endTime - (90 * 24 * 60 * 60) // 90 days
        break
      case '1d':
        startTime = endTime - (365 * 24 * 60 * 60) // 1 year
        break
      case '1w':
        startTime = endTime - (3 * 365 * 24 * 60 * 60) // 3 years
        break
      default:
        startTime = endTime - (30 * 24 * 60 * 60)
    }

    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase().replace('coinbase:', '').replace('-usd', '')}/ohlc?vs_currency=usd&days=max`
    )

    if (!response.ok) throw new Error('Failed to fetch data')

    const rawData = await response.json()
    const filteredData = rawData
      .filter(item => item[0] >= startTime && item[0] <= endTime)
      .map(item => ({
        time: item[0],
        open: item[1],
        high: item[2],
        low: item[3],
        close: item[4],
      }))

    return filteredData
  } catch (error) {
    console.error('Error fetching OHLC data:', error)
    return []
  }
}

// ─── TradingView Lightweight Chart Component ──────────────────────────────────
function LightweightTradingView({ tvSymbol, tvInterval }) {
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const symbol = tvSymbol.split(':')[1].toLowerCase().replace('usd', '')
    fetchOHLCData(symbol, tvInterval)
      .then(data => {
        setChartData(data)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [tvSymbol, tvInterval])

  if (loading) {
    return (
      <div style={{
        width: '100%',
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg2)',
        borderRadius: 8,
      }}>
        <div style={{
          width: 36,
          height: 36,
          borderRadius: '50%',
          border: '3px solid var(--green)',
          borderTopColor: 'var(--green)',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    )
  }

  if (!chartData || chartData.length === 0) {
    return (
      <div style={{
        width: '100%',
        height: 400,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg2)',
        borderRadius: 8,
        color: 'var(--t3)',
      }}>
        <p style={{ fontSize: 14, marginBottom: 8 }}>Données indisponibles</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--t1)',
            cursor: 'pointer',
            fontSize: 12,
          }}
        >
          Recharger
        </button>
      </div>
    )
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'var(--bg2)',
      borderRadius: 8,
      overflow: 'hidden',
    }}>
      <LightweightChart data={chartData} interval={tvInterval} />
    </div>
  )
}

// ─── TradingViewWidget Component ───────────────────────────────────────────────
function TradingViewWidget({ symbol = 'COINBASE:BTCUSD', interval = '15' }) {
  const [activeSymbol, setActiveSymbol] = useState(symbol)
  const [activeInterval, setActiveInterval] = useState(interval)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSymbolChange = (tvSymbol) => {
    setActiveSymbol(tvSymbol)
    setIsExpanded(false)
  }

  const handleIntervalChange = (tvInterval) => {
    setActiveInterval(tvInterval)
  }

  return (
    <div style={{
      width: '100%',
      background: 'var(--bg2)',
      borderRadius: 12,
      border: '1px solid var(--border)',
      overflow: 'hidden',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      {/* Header Controls */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1 }}>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: '1px solid var(--border)',
              borderRadius: 8,
              padding: '6px 12px',
              fontSize: 12,
              color: 'var(--t1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <TrendingUp size={14} />
            {ASSETS.find(a => a.tv === activeSymbol)?.label || activeSymbol.split(':')[1]}
            <ChevronDown size={14} />
          </button>

          {isExpanded && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 16,
              background: 'var(--bg2)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              padding: 8,
              zIndex: 100,
              minWidth: 200,
              maxHeight: 300,
              overflowY: 'auto'
            }}>
              {ASSETS.map((asset) => (
                <div
                  key={asset.tv}
                  onClick={() => handleSymbolChange(asset.tv)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    borderRadius: 8,
                    fontSize: 12,
                    color: 'var(--t1)',
                    background: activeSymbol === asset.tv ? 'rgba(0, 255, 136, 0.1)' : 'transparent',
                    '&:hover': {
                      background: 'rgba(255, 255, 255, 0.05)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      color: TYPE_COLOR[asset.type],
                      fontWeight: 600
                    }}>
                      {asset.label}
                    </span>
                    <span style={{ color: 'var(--t2)', fontSize: 10 }}>
                      {asset.type}
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t2)' }}>
                    {asset.symbol}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{
            display: 'flex',
            border: '1px solid var(--border)',
            borderRadius: 8,
            overflow: 'hidden'
          }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.tv}
                onClick={() => handleIntervalChange(tf.tv)}
                style={{
                  padding: '6px 12px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: activeInterval === tf.tv ? 'var(--bg)' : 'var(--t2)',
                  background: activeInterval === tf.tv ? 'var(--green)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  '&:not(:last-child)': {
                    borderRight: '1px solid var(--border)'
                  }
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Container - Full Width Responsive */}
      <div style={{
        width: '100%',
        height: '50vh',
        minHeight: 300,
        maxHeight: 600,
        '@media (max-width: 768px)': {
          height: '40vh',
          minHeight: 250
        },
        '@media (max-width: 480px)': {
          height: '35vh',
          minHeight: 200
        }
      }}>
        <LightweightTradingView
          tvSymbol={activeSymbol}
          tvInterval={activeInterval}
        />
      </div>
    </div>
  )
}

// ─── Analysis Result ──────────────────────────────────────────────────────────
function AnalysisCard({ data, loading, onRefresh, symbol, interval }) {
  if (loading) return (
    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--green)', borderTopColor: 'var(--green)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 13, color: 'var(--t3)' }}>AnDy analyse {symbol}…</p>
    </div>
  )

  if (!data) return (
    <div style={{ padding: '16px 0', textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: 'var(--t3)', marginBottom: 12 }}>Lance l'analyse IA pour voir le setup du jour</p>
      <button onClick={onRefresh} style={{
        padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
        background: 'linear-gradient(135deg, var(--green), #00cc88)', color: 'var(--bg)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <Zap size={14} /> Analyser avec AnDy
      </button>
    </div>
  )

  // Parse analysis data
  const parseAnalysis = (text) => {
    const lines = text.split('\n').filter(Boolean)
    const result = {
      recommendation: 'HOLD',
      levels: { supports: [], resistances: [] },
      patterns: [],
      sentiment: 0,
      setup: null,
      analysis: []
    }

    let currentSection = null

    lines.forEach(line => {
      const cleanLine = line.replace(/^[-•]\s*/, '').trim()

      // Detect sections
      if