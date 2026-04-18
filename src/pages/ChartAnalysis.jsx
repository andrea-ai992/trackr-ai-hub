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

// ─── TradingView Chart ────────────────────────────────────────────────────────
let tvReady = false
function TVChart({ tvSymbol, tvInterval, uid }) {
  const ref = useRef(null)

  useEffect(() => {
    const container = ref.current
    if (!container) return

    function mount() {
      if (!window.TradingView || !container) return
      container.innerHTML = `<div id="${uid}" style="height:100%;width:100%"></div>`
      new window.TradingView.widget({
        container_id: uid,
        autosize: true,
        symbol: tvSymbol,
        interval: tvInterval,
        timezone: 'Europe/Paris',
        theme: 'dark',
        style: '1',
        locale: 'fr',
        backgroundColor: 'rgba(6,10,22,1)',
        gridColor: 'rgba(255,255,255,0.03)',
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: true,
        save_image: false,
        studies: [
          'Volume@tv-basicstudies',
          'RSI@tv-basicstudies',
          'MACD@tv-basicstudies',
          'MAExp@tv-basicstudies',
        ],
        studies_overrides: {
          'moving average exp.length': 21,
        },
        overrides: {
          'paneProperties.background': '#060a16',
          'paneProperties.backgroundType': 'solid',
          'mainSeriesProperties.candleStyle.upColor': '#26a69a',
          'mainSeriesProperties.candleStyle.downColor': '#ef5350',
          'mainSeriesProperties.candleStyle.borderUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.borderDownColor': '#ef5350',
          'mainSeriesProperties.candleStyle.wickUpColor': '#26a69a',
          'mainSeriesProperties.candleStyle.wickDownColor': '#ef5350',
        },
        loading_screen: { backgroundColor: '#060a16', foregroundColor: '#6366f1' },
      })
    }

    if (tvReady && window.TradingView) {
      mount()
    } else if (!tvReady) {
      tvReady = true
      const s = document.createElement('script')
      s.src = 'https://s3.tradingview.com/tv.js'
      s.onload = mount
      document.head.appendChild(s)
    } else {
      const t = setInterval(() => {
        if (window.TradingView) { clearInterval(t); mount() }
      }, 200)
      return () => clearInterval(t)
    }

    return () => { if (container) container.innerHTML = '' }
  }, [tvSymbol, tvInterval, uid])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <div ref={ref} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}

// ─── TradingViewWidget Component ───────────────────────────────────────────────
function TradingViewWidget({ symbol = 'COINBASE:BTCUSD', interval = '15' }) {
  const [activeSymbol, setActiveSymbol] = useState(symbol)
  const [activeInterval, setActiveInterval] = useState(interval)
  const [isExpanded, setIsExpanded] = useState(false)
  const uid = `tv-widget-${Math.random().toString(36).substr(2, 9)}`

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

      {/* Chart Container */}
      <div style={{
        height: 400,
        width: '100%',
        '@media (max-width: 768px)': {
          height: 300
        }
      }}>
        <TVChart
          tvSymbol={activeSymbol}
          tvInterval={activeInterval}
          uid={uid}
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
      if (cleanLine.match(/^(SUPPORTS|RÉSISTANCES|NIVEAUX)/i)) {
        currentSection = 'levels'
        return
      }
      if (cleanLine.match(/^(PATTERNS|FIGURES)/i)) {
        currentSection = 'patterns'
        return
      }
      if (cleanLine.match(/^(SETUP|CONFIGURATION)/i)) {
        currentSection = 'setup'
        return
      }
      if (cleanLine.match(/^(SENTIMENT|SCORE)/i)) {
        currentSection = 'sentiment'
        return
      }

      // Parse levels
      if (currentSection === 'levels') {
        const levelMatch = cleanLine.match(/(\d+\.?\d*)\s*(support|résistance|support clé|résistance clé)/i)
        if (levelMatch) {
          result.levels[levelMatch[2].includes('clé') ? 'supports' : levelMatch[2].includes('résistance') ? 'resistances' : 'supports'].push(parseFloat(levelMatch[1]))
        }
      }

      // Parse patterns
      if (currentSection === 'patterns') {
        const patternMatch = cleanLine.match(/^(🟢|🔴|⚡|🟡)\s*(.+)/)
        if (patternMatch) {
          result.patterns.push({
            type: patternMatch[2],
            bullish: patternMatch[1] === '🟢' || patternMatch[1] === '⚡'
          })
        }
      }

      // Parse setup
      if (currentSection === 'setup') {
        if (cleanLine.includes('Entrée:')) result.setup = { ...result.setup, entry: cleanLine.split(':')[1].trim() }
        if (cleanLine.includes('Stop:')) result.setup = { ...result.setup, stop: cleanLine.split(':')[1].trim() }
        if (cleanLine.includes('Objectif:')) result.setup = { ...result.setup, target: cleanLine.split(':')[1].trim() }
        if (cleanLine.includes('R:')) result.setup = { ...result.setup, rr: cleanLine.split(':')[1].trim() }
      }

      // Parse sentiment
      if (currentSection === 'sentiment') {
        const sentimentMatch = cleanLine.match(/(\d+\.?\d*)\s*(sur|out of)/i)
        if (sentimentMatch) {
          result.sentiment = parseFloat(sentimentMatch[1])
        }
      }

      // Parse recommendation
      if (cleanLine.match(/^(RECOMMANDATION|REC)/i)) {
        const recMatch = cleanLine.match(/(BUY|SELL|HOLD)/i)
        if (recMatch) {
          result.recommendation = recMatch[1].toUpperCase()
        }
      }

      result.analysis.push(cleanLine)
    })

    return result
  }

  const analysisData = parseAnalysis(data)
  const RecommendationIcon = RECOMMENDATION_ICONS[analysisData.recommendation]

  return (
    <div style={{
      background: 'var(--bg2)',
      borderRadius: 12,
      padding: 16,
      border: '1px solid var(--border)',
      marginTop: 16
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 700,
            color: RECOMMENDATION_COLORS[analysisData.recommendation],
            background: RECOMMENDATION_COLORS[analysisData.recommendation] + '15',
            border: `1px solid ${RECOMMENDATION_COLORS[analysisData.recommendation]}30`,
            display: 'flex',
            alignItems: 'center',
            gap: 6
          }}>
            <RecommendationIcon size={14} />
            {analysisData.recommendation}
          </div>
          <span style={{ fontSize: 11, color: 'var(--t3)' }}>{symbol} · {interval}</span>
        </div>
        <button onClick={onRefresh} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--t3)',
          padding: 4,
          display: 'flex'
        }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Key