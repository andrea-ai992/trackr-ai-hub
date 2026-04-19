// src/pages/ChartAnalysis.jsx
import { lazy, Suspense } from 'react'
import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Zap, RefreshCw, ChevronDown, ChevronUp, Brain } from 'lucide-react'

// Lazy load TVChart component
const TVChart = lazy(() => import('../components/TVChart'))

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

function ChartAnalysis() {
  const [activeAsset, setActiveAsset] = useState(ASSETS[0])
  const [activeTimeframe, setActiveTimeframe] = useState(TIMEFRAMES[0])
  const [analysisData, setAnalysisData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false)
  const navigate = useNavigate()

  const handleAnalyze = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activeAsset.symbol,
          interval: activeTimeframe.api,
          type: activeAsset.type
        })
      })
      const data = await response.json()
      setAnalysisData(data.text)
    } catch (error) {
      console.error('Analysis error:', error)
    } finally {
      setLoading(false)
    }
  }, [activeAsset, activeTimeframe])

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      color: 'var(--text-primary)',
      fontFamily: 'JetBrains Mono, monospace',
      padding: '16px',
      paddingBottom: '80px'
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginBottom: 24
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--neon)',
            padding: 8
          }}
        >
          <ArrowLeft size={20} />
        </button>
        <h1 style={{
          fontSize: 18,
          fontWeight: 700,
          color: 'var(--text-primary)',
          margin: 0
        }}>
          ChartAnalysis
        </h1>
      </header>

      {/* Asset Selector */}
      <div style={{
        marginBottom: 20,
        position: 'relative'
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          marginBottom: 8
        }}>
          ACTIF
        </div>
        <div style={{
          display: 'flex',
          gap: 8,
          flexWrap: 'wrap'
        }}>
          {ASSETS.map((asset) => (
            <button
              key={asset.symbol}
              onClick={() => setActiveAsset(asset)}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: activeAsset.symbol === asset.symbol ? '1px solid var(--neon)' : '1px solid var(--border)',
                background: activeAsset.symbol === asset.symbol ? 'rgba(0,255,136,0.1)' : 'transparent',
                color: 'var(--text-primary)',
                fontSize: 14,
                cursor: 'pointer',
                fontFamily: 'JetBrains Mono, monospace'
              }}
            >
              {asset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Timeframe Selector */}
      <div style={{
        marginBottom: 24,
        position: 'relative'
      }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          marginBottom: 8
        }}>
          TIMEFRAME
        </div>
        <button
          onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
          style={{
            padding: '12px 16px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--text-primary)',
            fontSize: 14,
            cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%'
          }}
        >
          <span>{activeTimeframe.label}</span>
          {showTimeframeDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showTimeframeDropdown && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'var(--surface)',
            borderRadius: 8,
            border: '1px solid var(--border)',
            marginTop: 8,
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.api}
                onClick={() => {
                  setActiveTimeframe(tf)
                  setShowTimeframeDropdown(false)
                }}
                style={{
                  padding: '12px 16px',
                  width: '100%',
                  textAlign: 'left',
                  background: activeTimeframe.api === tf.api ? 'rgba(0,255,136,0.1)' : 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14
                }}
              >
                {tf.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Chart Container */}
      <div style={{
        height: 300,
        marginBottom: 24,
        borderRadius: 12,
        overflow: 'hidden',
        border: '1px solid var(--border)'
      }}>
        <Suspense fallback={
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--surface)'
          }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              border: '3px solid var(--neon)',
              borderTopColor: 'var(--neon)',
              animation: 'spin 0.8s linear infinite'
            }} />
          </div>
        }>
          <TVChart
            tvSymbol={activeAsset.tv}
            tvInterval={activeTimeframe.tv}
            uid={`tv-chart-${activeAsset.symbol}-${activeTimeframe.api}`}
          />
        </Suspense>
      </div>

      {/* Analysis Section */}
      <div style={{
        background: 'var(--surface)',
        borderRadius: 12,
        padding: 16,
        border: '1px solid var(--border)'
      }}>
        <AnalysisCard
          data={analysisData}
          loading={loading}
          onRefresh={handleAnalyze}
          symbol={activeAsset.symbol}
          interval={activeTimeframe.label}
        />
      </div>
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
            <div key={i} style={{
              fontWeight: 600,
              margin: '12px 0 8px 0',
              color: 'var(--text-primary)'
            }}>
              {cleanLine}
            </div>
          )

          if (isBullet) return (
            <div key={i} style={{ marginBottom: 6 }}>
              <span style={{ marginRight: 8 }}>•</span>
              <span>{cleanLine}</span>
            </div>
          )

          return (
            <div key={i} style={{ marginBottom: 6 }}>
              {cleanLine}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ChartAnalysis