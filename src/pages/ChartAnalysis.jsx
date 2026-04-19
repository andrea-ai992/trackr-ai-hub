import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingUp, TrendingDown, Minus, Zap, RefreshCw, ChevronDown } from 'lucide-react'

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
  { label: '1W',  tv: 'W',   api: '1d'  },
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
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid rgba(99,102,241,0.2)', borderTopColor: '#6366f1', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ fontSize: 13, color: '#4b5563' }}>AnDy analyse {symbol}…</p>
    </div>
  )

  if (!data) return (
    <div style={{ padding: '16px 0', textAlign: 'center' }}>
      <p style={{ fontSize: 13, color: '#4b5563', marginBottom: 12 }}>Lance l'analyse IA pour voir le setup du jour</p>
      <button onClick={onRefresh} style={{
        padding: '10px 24px', borderRadius: 12, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 700,
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white',
        display: 'inline-flex', alignItems: 'center', gap: 8,
      }}>
        <Zap size={14} /> Analyser avec AnDy
      </button>
    </div>
  )

  // Parse signals, setup, levels from the analysis text
  const text = data
  const lines = text.split('\n').filter(Boolean)

  // Detect trend from text
  const isHaussier = /haussier|bullish|achat|hausse|montée/i.test(text)
  const isBaissier = /baissier|bearish|vente|baisse|descente/i.test(text)
  const trend = isHaussier ? 'bullish' : isBaissier ? 'bearish' : 'neutral'
  const TrendIcon = trend === 'bullish' ? TrendingUp : trend === 'bearish' ? TrendingDown : Minus
  const trendColor = trend === 'bullish' ? '#10b981' : trend === 'bearish' ? '#ef4444' : '#f59e0b'

  return (
    <div>
      {/* Trend badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 700, color: trendColor, background: trendColor + '15', border: `1px solid ${trendColor}30`, display: 'flex', alignItems: 'center', gap: 5 }}>
            <TrendIcon size={12} />
            {trend === 'bullish' ? 'Haussier' : trend === 'bearish' ? 'Baissier' : 'Neutre'}
          </div>
          <span style={{ fontSize: 11, color: '#4b5563' }}>{symbol} · {interval}</span>
        </div>
        <button onClick={onRefresh} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#4b5563', padding: 4, display: 'flex' }}>
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Analysis text — formatted */}
      <div style={{ fontSize: 13, color: '#d1d5db', lineHeight: 1.7 }}>
        {lines.map((line, i) => {
          const isBullet = line.startsWith('- ') || line.startsWith('• ') || /^[🟢🔴🟡⚡]/.test(line)
          const isTitle = line.startsWith('##') || line.startsWith('**') || /^[A-Z][A-ZÀ-Ÿ\s]{3,}:/.test(line)
          const cleanLine = line.replace(/^#+\s*/, '').replace(/\*\*/g, '')

          if (isTitle) return (
            <div key={i} style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', letterSpacing: '0.08em', marginTop: 10, marginBottom: 4 }}>
              {cleanLine.toUpperCase()}
            </div>
          )
          if (isBullet) return (
            <div key={i} style={{ paddingLeft: 8, borderLeft: '2px solid rgba(99,102,241,0.3)', marginBottom: 4, color: '#c4c9d4' }}>
              {cleanLine.replace(/^[-•]\s*/, '')}
            </div>
          )
          return <div key={i} style={{ marginBottom: 3 }}>{cleanLine}</div>
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ChartAnalysis() {
  const navigate = useNavigate()
  const [asset, setAsset]         = useState(ASSETS[0])
  const [tf, setTf]               = useState(TIMEFRAMES[3])   // 1D default
  const [analysis, setAnalysis]   = useState(null)
  const [loading, setLoading]     = useState(false)
  const [showAssets, setShowAssets] = useState(false)
  const chartUid = useRef(`tv_${Date.now()}`)

  // Reset analysis on asset/TF change
  useEffect(() => { setAnalysis(null) }, [asset, tf])

  const runAnalysis = useCallback(async () => {
    setLoading(true)
    setAnalysis(null)
    try {
      const res = await fetch('/api/andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Fais une analyse technique complète de ${asset.symbol} sur le timeframe ${tf.api}. Donne-moi : la tendance actuelle, les niveaux clés (supports/résistances), les signaux RSI/MACD/EMA, le setup de trading pour aujourd'hui/demain (entrée, stop loss, objectif, R/R), et ta conclusion en 1 phrase.`,
          }],
          portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [],
        }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = '', text = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const ev = JSON.parse(line.slice(6))
            if (ev.type === 'token') {
              text += ev.text
              setAnalysis(text.replace(/\[CHART:[^\]]+\]/g, '').trim())
            }
          } catch {}
        }
      }
    } catch (e) {
      setAnalysis(`Erreur: ${e.message}`)
    }
    setLoading(false)
  }, [asset, tf])

  return (
    <div style={{ minHeight: '100dvh', background: '#060a16', color: 'white', display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 14px', paddingTop: 'max(12px, env(safe-area-inset-top, 0px))', paddingBottom: 10,
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'rgba(6,10,22,0.95)', backdropFilter: 'blur(20px)',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: 4, display: 'flex' }}>
          <ArrowLeft size={20} />
        </button>

        {/* Asset selector */}
        <button onClick={() => setShowAssets(s => !s)} style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, padding: '6px 12px', cursor: 'pointer',
        }}>
          <span style={{ fontSize: 11, color: TYPE_COLOR[asset.type], fontWeight: 700 }}>●</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>{asset.label}</span>
          <ChevronDown size={13} color="#6b7280" />
        </button>

        {/* Timeframes */}
        <div style={{ display: 'flex', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
          {TIMEFRAMES.map(t => (
            <button key={t.label} onClick={() => setTf(t)} style={{
              padding: '5px 9px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none',
              background: tf.label === t.label ? 'rgba(99,102,241,0.25)' : 'transparent',
              color: tf.label === t.label ? '#818cf8' : '#4b5563',
            }}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Asset dropdown */}
      {showAssets && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end',
        }} onClick={() => setShowAssets(false)}>
          <div style={{
            width: '100%', background: '#0d0d1a', borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(255,255,255,0.08)', padding: '16px 0 32px',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#4b5563', letterSpacing: '0.08em', padding: '0 16px 12px' }}>CHOISIR UN ACTIF</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, padding: '0 16px' }}>
              {ASSETS.map(a => (
                <button key={a.label} onClick={() => { setAsset(a); setShowAssets(false) }} style={{
                  padding: '12px 0', borderRadius: 14, border: asset.label === a.label ? `1px solid ${TYPE_COLOR[a.type]}40` : '1px solid rgba(255,255,255,0.07)',
                  background: asset.label === a.label ? TYPE_COLOR[a.type] + '15' : 'rgba(255,255,255,0.03)',
                  cursor: 'pointer', textAlign: 'center',
                }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: asset.label === a.label ? TYPE_COLOR[a.type] : 'white' }}>{a.label}</div>
                  <div style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{a.type}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: 380, flexShrink: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <TVChart tvSymbol={asset.tv} tvInterval={tf.tv} uid={`${chartUid.current}_${asset.label}_${tf.label}`} />
      </div>

      {/* AI Analysis panel */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: 'white' }}>Analyse IA · {asset.label}</div>
            <div style={{ fontSize: 11, color: '#4b5563', marginTop: 1 }}>Setup du jour · {tf.label}</div>
          </div>
          {!loading && (
            <button onClick={runAnalysis} style={{
              padding: '8px 16px', borderRadius: 12, border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white',
              fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <Zap size={12} />
              {analysis ? 'Actualiser' : 'Analyser'}
            </button>
          )}
        </div>

        {/* Analysis content */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 16, padding: 16,
        }}>
          <AnalysisCard data={analysis} loading={loading} onRefresh={runAnalysis} symbol={asset.label} interval={tf.label} />
        </div>

        {/* Quick actions */}
        {!loading && !analysis && (
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: '📊 Setup aujourd\'hui', msg: `Donne-moi le setup de trading pour ${asset.symbol} aujourd'hui — entrée, stop, cible, R/R.` },
              { label: '🔮 Scénario demain',    msg: `Quels sont les scénarios probables pour ${asset.symbol} demain ? Haussier si..., Baissier si...` },
              { label: '🎯 Niveaux clés',       msg: `Quels sont les niveaux de support et résistance les plus importants sur ${asset.symbol} en ce moment ?` },
              { label: '⚡ Signal RSI/MACD',    msg: `Analyse le RSI et le MACD de ${asset.symbol} sur ${tf.api}. Y a-t-il un signal d'achat ou de vente ?` },
            ].map(q => (
              <button key={q.label} onClick={async () => {
                setLoading(true); setAnalysis(null)
                try {
                  const res = await fetch('/api/andy', {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: [{ role: 'user', content: q.msg }], portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [] }),
                  })
                  const reader = res.body.getReader()
                  const decoder = new TextDecoder()
                  let buf = '', text = ''
                  while (true) {
                    const { done, value } = await reader.read()
                    if (done) break
                    buf += decoder.decode(value, { stream: true })
                    const lines = buf.split('\n'); buf = lines.pop()
                    for (const line of lines) {
                      if (!line.startsWith('data: ')) continue
                      try { const ev = JSON.parse(line.slice(6)); if (ev.type === 'token') { text += ev.text; setAnalysis(text.replace(/\[CHART:[^\]]+\]/g, '').trim()) } } catch {}
                    }
                  }
                } catch (e) { setAnalysis(`Erreur: ${e.message}`) }
                setLoading(false)
              }} style={{
                padding: '12px 10px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)',
                background: 'rgba(255,255,255,0.03)', cursor: 'pointer', textAlign: 'left',
                fontSize: 12, fontWeight: 600, color: '#9ca3af',
              }}>
                {q.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
      `}</style>
    </div>
  )
}
