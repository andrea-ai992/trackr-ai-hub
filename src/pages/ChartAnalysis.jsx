import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Zap, RefreshCw, ChevronDown, ChevronUp, Brain } from 'lucide-react'

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

// ─── Analysis Result ──────────────────────────────────────────────────────────
function AnalysisCard({ data, loading, onRefresh, symbol, interval }) {
  if (loading) return (
    <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--neon)', borderTopColor: 'var(--neon)', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>AnDy analyse {symbol}…</p>
    </div>
  )

  if (!data) return (
    <div style={{ padding: '16px 0', textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>Lance l'analyse IA pour voir le setup du jour</p>
      <button onClick={onRefresh} style={{
        padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
        background: 'linear-gradient(135deg, var(--neon), #00ff8880)', color: 'var(--bg)',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <Brain size={14} /> Analyser avec AnDy
      </button>
    </div>
  )

  const text = data
  const lines = text.split('\n').filter(Boolean)

  const isHaussier = /haussier|bullish|achat|hausse|montée/i.test(text)
  const isBaissier = /baissier|bearish|vente|baisse|descente/i.test(text)
  const isNeutre = !isHaussier && !isBaissier
  const trend = isHaussier ? 'bullish' : isBaissier ? 'bearish' : 'neutral'
  const TrendIcon = trend === 'bullish' ? TrendingUp : trend === 'bearish' ? TrendingDown : Minus
  const trendColor = trend === 'bullish' ? '#10b981' : trend === 'bearish' ? '#ef4444' : '#f59e0b'
  const recommendation = isHaussier ? 'BUY' : isBaissier ? 'SELL' : 'HOLD'

  const supportResistance = text.match(/support[s]?:\s*([^\n]+)/i)?.[1] || 'N/A'
  const patterns = text.match(/pattern[s]?:\s*([^\n]+)/i)?.[1] || 'N/A'
  const sentimentScore = text.match(/sentiment:\s*([^\n]+)/i)?.[1] || 'N/A'

  return (
    <div style={{ background: 'var(--surface)', borderRadius: 12, padding: 16, border: '1px solid var(--border)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            padding: '4px 12px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 700,
            color: trendColor,
            background: `${trendColor}15`,
            border: `1px solid ${trendColor}30`,
            display: 'flex',
            alignItems: 'center',
            gap: 5
          }}>
            <TrendIcon size={12} />
            {trend === 'bullish' ? 'Haussier' : trend === 'bearish' ? 'Baissier' : 'Neutre'}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{symbol} · {interval}</span>
        </div>
        <button onClick={onRefresh} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          padding: 4,
          display: 'flex'
        }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Recommendation Badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 16px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 700,
        marginBottom: 16,
        background: recommendation === 'BUY' ? '#10b98115' : recommendation === 'SELL' ? '#ef444415' : '#f59e0b15',
        border: `1px solid ${recommendation === 'BUY' ? '#10b981' : recommendation === 'SELL' ? '#ef4444' : '#f59e0b'}30`,
        color: recommendation === 'BUY' ? '#10b981' : recommendation === 'SELL' ? '#ef4444' : '#f59e0b'
      }}>
        {recommendation === 'BUY' && <TrendingUp size={12} />}
        {recommendation === 'SELL' && <TrendingDown size={12} />}
        {recommendation === 'HOLD' && <Minus size={12} />}
        <span>{recommendation}</span>
      </div>

      {/* Key Levels */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: 8 }}>
          NIVEAUX CLÉS
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Supports</div>
              <div style={{ color: '#aaa' }}>{supportResistance.split(',')[0] || 'N/A'}</div>
            </div>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Résistances</div>
              <div style={{ color: '#aaa' }}>{supportResistance.split(',')[1] || 'N/A'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Patterns */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: 8 }}>
          PATTERNS
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {patterns}
        </div>
      </div>

      {/* Sentiment */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', marginBottom: 8 }}>
          SENTIMENT
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6 }}>
          {sentimentScore}
        </div>
      </div>

      {/* Analysis text — formatted */}
      <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.7 }}>
        {lines.map((line, i) => {
          const isBullet = line.startsWith('- ') || line.startsWith('• ') || /^[🟢🔴🟡⚡]/.test(line)
          const isTitle = line.startsWith('##') || line.startsWith('**') || /^[A-Z][A-ZÀ-Ÿ\s]{3,}:/.test(line)
          const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '')

          if (isTitle) return (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.08em', marginTop: 10, marginBottom: 4 }}>
              {cleanLine.toUpperCase()}
            </div>
          )
          if (isBullet) return (
            <div key={i} style={{ paddingLeft: 8, borderLeft: '2px solid var(--border-bright)', marginBottom: 4, color: 'var(--text-primary)' }}>
              {cleanLine.replace(/^[-•]\s*/, '')}
            </div>
          )
          return <div key={i} style={{ marginBottom: 3 }}>{cleanLine}</div>
        })}
      </div>
    </div>
  )
}

// ─── Historical Analysis ──────────────────────────────────────────────────────
function HistoricalAnalysis({ analyses, symbol }) {
  const [expanded, setExpanded] = useState(false)

  if (!analyses || analyses.length === 0) return null

  return (
    <div style={{ marginTop: 24 }}>
      <div
        onClick={() => setExpanded(!expanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
          padding: '12px 0',
          borderBottom: '1px solid var(--border)',
          marginBottom: 8
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <ChevronDown size={16} style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {expanded ? 'Masquer' : 'Voir'} l'historique ({analyses.length})
          </span>
        </div>
      </div>

      {expanded && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {analyses.slice(0, 3).map((analysis, index) => (
            <div key={index} style={{
              background: 'var(--surface-low)',
              borderRadius: 12,
              padding: 12,
              border: '1px solid var(--border)',
              fontSize: 12,
              color: 'var(--text-primary)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(analysis.timestamp).toLocaleString('fr-FR')}</span>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 10,
                  fontWeight: 700,
                  color: analysis.recommendation === 'BUY' ? '#10b981' : analysis.recommendation === 'SELL' ? '#ef4444' : '#f59e0b',
                  background: analysis.recommendation === 'BUY' ? '#10b98115' : analysis.recommendation === 'SELL' ? '#ef444415' : '#f59e0b15'
                }}>
                  {analysis.recommendation}
                </span>
              </div>
              <div style={{ fontSize: 11, lineHeight: 1.5 }}>
                {analysis.summary}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChartAnalysis() {
  const navigate = useNavigate()
  const [asset, setAsset] = useState(ASSETS[0])
  const [tf, setTf] = useState(TIMEFRAMES[3])
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const [showTimeframes, setShowTimeframes] = useState(false)
  const [historicalAnalyses, setHistoricalAnalyses] = useState([])
  const chartUid = useRef(`tv_${Date.now()}`)

  useEffect(() => {
    setAnalysis(null)
    setShowAssets(false)
    setShowTimeframes(false)
  }, [asset, tf])

  const saveAnalysis = useCallback((analysisData) => {
    const newAnalysis = {
      timestamp: new Date().toISOString(),
      symbol: asset.symbol,
      interval: tf.label,
      recommendation: analysisData.includes('BUY') ? 'BUY' : analysisData.includes('SELL') ? 'SELL' : 'HOLD',
      summary: analysisData.split('\n')[0].substring(0, 100) + '...',
      fullText: analysisData
    }

    setHistoricalAnalyses(prev => {
      const updated = [newAnalysis, ...prev]
      localStorage.setItem(`chartAnalysis_${asset.symbol}_${tf.label}`, JSON.stringify(updated))
      return updated.slice(0, 3)
    })
  }, [asset, tf])

  const loadHistoricalAnalyses = useCallback(() => {
    const key = `chartAnalysis_${asset.symbol}_${tf.label}`
    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setHistoricalAnalyses(parsed.slice(0, 3))
      } catch {
        setHistoricalAnalyses([])
      }
    }
  }, [asset, tf])

  useEffect(() => {
    loadHistoricalAnalyses()
  }, [loadHistoricalAnalyses])

  const runAnalysis = useCallback(async () => {
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await fetch('/api/brain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyse le chart de ${asset.symbol} en ${tf.api}, identifie les niveaux clés, patterns, support/résistance, et donne une recommendation. Format: Niveaux clés: [supports, résistances], Patterns: [liste], Sentiment: [score], Conclusion: [recommandation].`
        })
      })

      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const data = await res.json()
      const analysisText = data.analysis || data.response || "Analyse non disponible"

      setAnalysis(analysisText)
      saveAnalysis(analysisText)
    } catch (e) {
      setAnalysis(`Erreur: ${e.message}`)
    }
    setLoading(false)
  }, [asset, tf, saveAnalysis])

  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'JetBrains Mono, monospace'
    }}>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        paddingTop: 'max(12px, env(safe-area-inset-top, 0px))',
        paddingBottom: 10,
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface-high)'
      }}>
        <button onClick={() => navigate(-1)} style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          padding: 4
        }}>
          <ArrowLeft size={20} />
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontSize: 13
          }}>
            <span style={{ fontWeight: 600 }}>{asset.label}</span>
            <ChevronDown size={16} />
          </div>

          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            cursor: 'pointer',
            fontSize: 13
          }}>
            <span style={{ fontWeight: 600 }}>{tf.label}</span>
            <ChevronDown size={16} />
          </div>
        </div>
      </div>

      {/* TradingView Chart */}
      <div style={{
        flex: 1,
        minHeight: 300,
        background: 'var(--surface-high)',
        position: 'relative'
      }}>
        <TVChart tvSymbol={asset.tv} tvInterval={tf.tv} uid={chartUid.current} />
      </div>

      {/* Analysis Section */}
      <div style={{
        padding: '20px 14px',
        background: 'var(--surface-high)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          marginBottom: 16
        }}>
          <Brain size={18} color="var(--neon)" />
          <span style={{ fontSize: 14, fontWeight: 600 }}>Analyse IA</span>
        </div>

        <AnalysisCard
          data={analysis}
          loading={loading}
          onRefresh={runAnalysis}
          symbol={asset.symbol}
          interval={tf.label}
        />

        <HistoricalAnalysis analyses={historicalAnalyses} symbol={asset.symbol} />
      </div>
    </div>
  )
}