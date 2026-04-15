import { useEffect, useRef } from 'react'

// Load TradingView script once across all instances
let _loaded = false
let _loading = false
const _cbs = []

function loadTV(cb) {
  if (_loaded) { cb(); return }
  _cbs.push(cb)
  if (_loading) return
  _loading = true
  const s = document.createElement('script')
  s.src = 'https://s3.tradingview.com/tv.js'
  s.async = true
  s.onload = () => {
    _loaded = true
    _cbs.forEach(fn => fn())
    _cbs.length = 0
  }
  document.head.appendChild(s)
}

// Map Yahoo Finance exchange codes → TradingView exchange prefix
function toTVSymbol(symbol, exchangeCode) {
  const clean = symbol?.replace('-', '.') || symbol
  const map = {
    NMS: 'NASDAQ', NGM: 'NASDAQ', NCM: 'NASDAQ',
    NYQ: 'NYSE',   NYA: 'NYSE',   NYE: 'NYSE',
    ASE: 'AMEX',   PCX: 'NYSE',
    TSX: 'TSX',    LSE: 'LSE',    FRA: 'XETRA',
    // TradingView already knows these as-is
    NASDAQ: 'NASDAQ', NYSE: 'NYSE', AMEX: 'AMEX',
  }
  if (map[exchangeCode]) return `${map[exchangeCode]}:${clean}`

  // Known NASDAQ names (NasdaqGS, NasdaqGM, NasdaqCM)
  if (exchangeCode?.startsWith('Nasdaq')) return `NASDAQ:${clean}`
  if (exchangeCode === 'New York Stock Exchange') return `NYSE:${clean}`

  // Hardcoded common symbols as fallback
  const nasdaqSet = new Set([
    'AAPL','MSFT','GOOGL','GOOG','AMZN','TSLA','META','NVDA','AMD','NFLX',
    'INTC','CSCO','QCOM','AVGO','TXN','MU','AMAT','KLAC','ADBE','CRM',
    'PYPL','SBUX','COST','MELI','ISRG','REGN','VRTX','MRNA','BIIB','GILD',
    'SPY','QQQ','IWM','VTI','ARKK','SQQQ','TQQQ',
  ])
  const nyseSet = new Set([
    'JPM','V','WMT','JNJ','PG','BAC','MA','XOM','CVX','HD','UNH',
    'DIS','MCD','KO','PEP','ABBV','TMO','DHR','NEE','LIN','RTX',
    'HON','IBM','GE','CAT','BA','MMM','WFC','C','GS','MS',
    'BRK.B','BRK.A','VZ','T','F','GM','NKE','PFE',
  ])
  if (nasdaqSet.has(clean)) return `NASDAQ:${clean}`
  if (nyseSet.has(clean))   return `NYSE:${clean}`

  return clean // Let TradingView auto-search
}

export default function TradingViewChart({ symbol, exchangeCode, height = 420 }) {
  const uid = useRef(`tv_${Date.now()}_${Math.random().toString(36).slice(2)}`)
  const tvSymbol = toTVSymbol(symbol, exchangeCode)

  useEffect(() => {
    const id = uid.current

    loadTV(() => {
      const el = document.getElementById(id)
      if (!el) return
      el.innerHTML = ''

      try {
        new window.TradingView.widget({
          container_id: id,
          symbol: tvSymbol,
          interval: 'D',
          timezone: 'America/New_York',
          theme: 'dark',
          style: '1',           // Candlestick
          locale: 'en',
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          save_image: false,
          height,
          width: '100%',
          backgroundColor: 'rgba(7,7,15,1)',
          gridColor: 'rgba(255,255,255,0.03)',
          withdateranges: true,
          details: true,         // Show volume panel
          hotlist: false,
          calendar: false,
          studies: ['STD;MACD'],  // MACD by default
        })
      } catch (e) {
        // Silently ignore widget errors (e.g. bad symbol)
      }
    })

    return () => {
      const el = document.getElementById(id)
      if (el) el.innerHTML = ''
    }
  }, [tvSymbol, height])

  return (
    <div
      id={uid.current}
      style={{
        borderRadius: 20,
        overflow: 'hidden',
        minHeight: height,
        background: '#07070f',
      }}
    />
  )
}
