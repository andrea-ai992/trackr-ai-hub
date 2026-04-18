import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Courier New', monospace"

// ─── Activity Feed (System Log) ───────────────────────────────────────────────
function ActivityFeed() {
  const [commits, setCommits] = useState([])
  const [agentLog, setAgentLog] = useState([])
  const [memory, setMemory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function safeJson(res) {
      if (!res.ok) { console.warn(`ActivityFeed fetch error: HTTP ${res.status} ${res.url}`); return null }
      const ct = res.headers.get('content-type') || ''
      if (!ct.includes('application/json') && !ct.includes('text/json') && !ct.includes('text/plain')) {
        console.warn(`ActivityFeed: unexpected content-type "${ct}" for ${res.url}, skipping .json()`)
        await res.body?.cancel().catch(() => {})
        return null
      }
      try { return await res.json() } catch (e) { console.warn(`ActivityFeed JSON parse error (${res.url}):`, e.message); return null }
    }

    Promise.allSettled([
      fetch('https://api.github.com/repos/andrea-ai992/trackr-ai-hub/commits?per_page=8', { signal: AbortSignal.timeout(8000) }).then(safeJson),
      fetch('/api/memory?type=agents-log', { signal: AbortSignal.timeout(6000) }).then(safeJson),
      fetch('/api/memory?limit=20', { signal: AbortSignal.timeout(6000) }).then(safeJson),
    ]).then(([c, a, m]) => {
      if (c.status === 'fulfilled' && Array.isArray(c.value)) setCommits(c.value)
      if (a.status === 'fulfilled' && Array.isArray(a.value?.log)) setAgentLog(a.value.log.slice(0, 10))
      if (m.status === 'fulfilled' && Array.isArray(m.value?.entries)) setMemory(m.value.entries.slice(0, 10))
      setLoading(false)
    })
  }, [])

  function timeAgo(d) {
    if (!d) return ''
    const min = Math.floor((Date.now() - new Date(d)) / 60000)
    if (min < 1) return 'now'
    if (min < 60) return `${min}m`
    if (min < 1440) return `${Math.floor(min / 60)}h`
    return `${Math.floor(min / 1440)}d`
  }

  const aiCommits = commits.filter(c => c.commit?.message?.includes('[AnDy'))

  if (loading) return (
    <div style={{ padding: '20px 16px', fontFamily: MONO, color: '#333', fontSize: 12 }}>
      $ loading system log...
    </div>
  )

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '0 16px 16px', fontFamily: MONO, overscrollBehavior: 'contain' }}>
      {aiCommits.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: '#00ff88', padding: '14px 0 8px', letterSpacing: '0.12em' }}>COMMITS</div>
          {aiCommits.map((c, i) => (
            <div key={i} style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 10, color: '#333', flexShrink: 0, paddingTop: 1 }}>{timeAgo(c.commit.author?.date)}</span>
              <div>
                <div style={{ fontSize: 11, color: '#888', lineHeight: 1.5 }}>
                  {c.commit.message.replace('[AnDy Auto-Improve] ', '').replace('[AnDy] ', '').slice(0, 85)}
                </div>
                {c.commit.message.includes('focus=security') && (
                  <div style={{ fontSize: 9, color: '#ef4444', marginTop: 2 }}>⚠ SECURITY</div>
                )}
              </div>
            </div>
          ))}
        </>
      )}

      {agentLog.length > 0 && (
        <>
          <div style={{ fontSize: 10, color: '#aa44ff', padding: '14px 0 8px', letterSpacing: '0.12em' }}>AGENTS</div>
          {agentLog.map((entry, i) => (
            <div key={i} style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 10, color: '#333', flexShrink: 0, paddingTop: 1 }}>{timeAgo(entry.timestamp)}</span>
              <div>
                <div style={{ fontSize: 10, color: entry.color || '#888', fontWeight: 700, marginBottom: 2 }}>{entry.agent}</div>
                <div style={{ fontSize: 11, color: '#555', lineHeight: 1.4 }}>{entry.summary?.slice(0, 100)}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {memory.filter(e => e.type === 'trading_result' || e.type === 'trading_learning').length > 0 && (
        <>
          <div style={{ fontSize: 10, color: '#10b981', padding: '14px 0 8px', letterSpacing: '0.12em' }}>TRADING MEMORY</div>
          {memory.filter(e => e.type === 'trading_result' || e.type === 'trading_learning').map((entry, i) => (
            <div key={i} style={{ marginBottom: 10, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 10, color: '#333', flexShrink: 0, paddingTop: 1 }}>
                {entry.verdictCorrect === true ? '[OK]' : entry.verdictCorrect === false ? '[✗]' : '[ ]'}
              </span>
              <div>
                <div style={{ fontSize: 11, color: '#e0e0e0', fontWeight: 700 }}>
                  {entry.symbol}{' '}
                  <span style={{ color: entry.verdict?.includes('ACHAT') ? '#10b981' : entry.verdict?.includes('VENTE') ? '#ef4444' : '#fcd34d', fontWeight: 400 }}>
                    {entry.verdict}
                  </span>
                </div>
                <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{entry.result?.slice(0, 80)}</div>
              </div>
            </div>
          ))}
        </>
      )}

      {aiCommits.length === 0 && agentLog.length === 0 && (
        <div style={{ color: '#333', fontSize: 12, padding: '20px 0' }}>$ no activity found</div>
      )}
    </div>
  )
}

// ─── Storage ──────────────────────────────────────────────────────────────────
const HISTORY_KEY = 'trackr_andy_v2'
const MAX_MSGS = 60

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(msgs) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-MAX_MSGS)))
}

// ─── TradingView ──────────────────────────────────────────────────────────────
const TV_SYMBOL_MAP = {
  'BTC-USD': 'COINBASE:BTCUSD', 'ETH-USD': 'COINBASE:ETHUSD',
  'SOL-USD': 'COINBASE:SOLUSD', '^GSPC': 'SP:SPX', '^DJI': 'DJ:DJI',
  'GC=F': 'TVC:GOLD', 'CL=F': 'TVC:USOIL',
}
const TV_INT = { '5m': '5', '15m': '15', '1h': '60', '4h': '240', '1d': 'D' }

let tvLoaded = false
function TVChart({ symbol, interval }) {
  const ref = useRef(null)
  const uid = useRef(`tv_${Date.now()}`)
  useEffect(() => {
    const container = ref.current
    if (!container) return
    const sym = TV_SYMBOL_MAP[symbol] || `NASDAQ:${symbol}`
    const int = TV_INT[interval] || 'D'
    function init() {
      if (!window.TradingView || !container) return
      container.innerHTML = `<div id="${uid.current}" style="height:100%;width:100%"></div>`
      new window.TradingView.widget({
        container_id: uid.current, autosize: true, symbol: sym, interval: int,
        timezone: 'Europe/Paris', theme: 'dark', style: '1', locale: 'fr',
        backgroundColor: 'rgba(0,0,0,1)', gridColor: 'rgba(40,40,40,0.5)',
        enable_publishing: false, hide_side_toolbar: true,
        studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies'],
        overrides: { 'paneProperties.background': '#000000' },
      })
    }
    if (tvLoaded && window.TradingView) { init() }
    else if (!tvLoaded) {
      tvLoaded = true
      const s = document.createElement('script')
      s.src = 'https://s3.tradingview.com/tv.js'
      s.onload = init; document.head.appendChild(s)
    } else {
      const t = setInterval(() => { if (window.TradingView) { clearInterval(t); init() } }, 200)
      return () => clearInterval(t)
    }
    return () => { if (container) container.innerHTML = '' }
  }, [symbol, interval])
  return (
    <div style={{ width: '100%', height: 300, margin: '8px 0', border: '1px solid #1a1a1a', background: '#000' }}>
      <div ref={ref} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}

// ─── Tool display ─────────────────────────────────────────────────────────────
const TOOL_CFG = {
  navigate:              { label: 'navigate',      color: '#00ff88' },
  fetch_price:           { label: 'fetch_price',   color: '#00ff88' },
  fetch_crypto_price:    { label: 'fetch_crypto',  color: '#00ff88' },
  technical_analysis:    { label: 'tech_analysis', color: '#00cc66' },
  scan_market:           { label: 'scan_market',   color: '#00cc66' },
  add_stock:             { label: 'add_stock',     color: '#00ff88' },
  remove_stock:          { label: 'remove_stock',  color: '#ff4444' },
  add_crypto:            { label: 'add_crypto',    color: '#00ff88' },
  remove_crypto:         { label: 'remove_crypto', color: '#ff4444' },
  create_alert:          { label: 'create_alert',  color: '#00cc66' },
  delete_alert:          { label: 'delete_alert',  color: '#555'    },
  add_to_watchlist:      { label: 'watchlist+',    color: '#00ff88' },
  remove_from_watchlist: { label: 'watchlist-',    color: '#555'    },
  add_sneaker:           { label: 'add_sneaker',   color: '#00cc66' },
}

function toolSummary(name, input, result) {
  const fmt = (n, d = 2) => Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d })
  switch (name) {
    case 'navigate': return `→ ${input.path}`
    case 'fetch_price': return result?.price ? `${result.name || input.symbol} $${fmt(result.price)} ${parseFloat(result.changePct) >= 0 ? '+' : ''}${result.changePct}%` : input.symbol
    case 'fetch_crypto_price': return result?.price ? `${input.coinId} $${fmt(result.price)} ${parseFloat(result.change24h) >= 0 ? '+' : ''}${result.change24h}%` : input.coinId
    case 'technical_analysis': return result?.trend ? `${result.assetName || input.symbol} ${input.interval} ${result.trend} RSI=${result.rsi}` : `${input.symbol} ${input.interval}`
    case 'scan_market': return `${result?.count || 0} assets scanned`
    case 'add_stock': return `${input.symbol} ${input.quantity}x @ $${input.buyPrice}`
    case 'remove_stock': return input.symbol
    case 'add_crypto': return `${input.coinName} ${input.quantity}x @ $${input.buyPrice}`
    case 'remove_crypto': return input.coinId
    case 'create_alert': return `${input.symbol} ${input.direction === 'above' ? '>' : '<'} $${input.targetPrice}`
    case 'delete_alert': return `${input.symbol} ${input.direction === 'above' ? '>' : '<'} $${input.targetPrice}`
    case 'add_to_watchlist': return `${input.symbol} (${input.name})`
    case 'remove_from_watchlist': return input.symbol
    case 'add_sneaker': return `${input.brand} ${input.model} T${input.size}`
    default: return JSON.stringify(input)
  }
}

function ToolCard({ name, input, result }) {
  const [exp, setExp] = useState(false)
  const cfg = TOOL_CFG[name] || { label: name, color: '#555' }
  const summary = toolSummary(name, input, result)
  const hasDetail = result && !result.error && Object.keys(result).length > 1
  const ok = !result?.error
  return (
    <div style={{ fontFamily: MONO, fontSize: 11, padding: '2px 0', color: '#555' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ color: ok ? cfg.color : '#ef4444' }}>{ok ? '✓' : '✗'}</span>
        <span style={{ color: cfg.color, fontWeight: 700 }}>[{cfg.label}]</span>
        <span style={{ color: '#666' }}>{summary}</span>
        {hasDetail && (
          <button onClick={() => setExp(e => !e)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', color: '#444', fontSize: 10, marginLeft: 4, fontFamily: MONO }}>
            {exp ? '▲' : '▼'}
          </button>
        )}
      </div>
      {exp && hasDetail && (
        <pre style={{ margin: '4px 0 4px 18px', fontSize: 10, color: '#444', background: '#050505', border: '1px solid #1a1a1a', padding: '5px 8px', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: MONO }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}

// ─── Markdown ──────────────────────────────────────────────────────────────────
const CHART_RE = /\[CHART:([^:]+):([^\]]+)\]/g

function inlineMd(text) {
  const parts = []; const re = /(\*\*(.+?)\*\*|`(.+?)`|\*(.+?)\*)/g; let last = 0, m
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index))
    if (m[2]) parts.push(<strong key={m.index} style={{ color: '#e0e0e0', fontWeight: 700 }}>{m[2]}</strong>)
    else if (m[3]) parts.push(<code key={m.index} style={{ background: 'rgba(0,255,136,0.07)', padding: '1px 4px', color: '#00ff88', fontFamily: MONO }}>{m[3]}</code>)
    else if (m[4]) parts.push(<em key={m.index} style={{ color: '#aa44ff' }}>{m[4]}</em>)
    last = re.lastIndex
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts.length === 1 && typeof parts[0] === 'string' ? text : parts
}

function renderLine(line, key) {
  const lm = line.match(/^[-*•]\s(.+)/)
  if (lm) return <div key={key} style={{ display: 'flex', gap: 8, margin: '2px 0' }}><span style={{ color: '#444', flexShrink: 0 }}>—</span><span>{inlineMd(lm[1])}</span></div>
  const gm = line.match(/^🟢\s(.+)/); if (gm) return <div key={key} style={{ color: '#10b981', margin: '3px 0' }}>+ {inlineMd(gm[1])}</div>
  const rm = line.match(/^🔴\s(.+)/); if (rm) return <div key={key} style={{ color: '#ef4444', margin: '3px 0' }}>- {inlineMd(rm[1])}</div>
  const ym = line.match(/^🟡\s(.+)/); if (ym) return <div key={key} style={{ color: '#fcd34d', margin: '3px 0' }}>~ {inlineMd(ym[1])}</div>
  const em = line.match(/^⚡\s(.+)/); if (em) return <div key={key} style={{ color: '#00ff88', margin: '3px 0' }}>! {inlineMd(em[1])}</div>
  return <div key={key} style={{ lineHeight: 1.65, margin: '1px 0' }}>{inlineMd(line)}</div>
}

function renderContent(text) {
  const segments = []; let last = 0; let m
  CHART_RE.lastIndex = 0
  while ((m = CHART_RE.exec(text)) !== null) {
    if (m.index > last) segments.push({ type: 'text', content: text.slice(last, m.index) })
    segments.push({ type: 'chart', symbol: m[1], interval: m[2] })
    last = CHART_RE.lastIndex
  }
  if (last < text.length) segments.push({ type: 'text', content: text.slice(last) })

  return segments.map((seg, si) => {
    if (seg.type === 'chart') return <TVChart key={si} symbol={seg.symbol} interval={seg.interval} />
    const lines = seg.content.split('\n'); const out = []; let i = 0
    while (i < lines.length) {
      const line = lines[i]
      if (line.startsWith('```')) {
        const lang = line.slice(3).trim(); const code = []
        i++
        while (i < lines.length && !lines[i].startsWith('```')) { code.push(lines[i]); i++ }
        out.push(
          <pre key={`${si}-${i}`} style={{ background: '#050505', border: '1px solid #1a1a1a', padding: '10px 12px', overflowX: 'auto', margin: '6px 0', fontSize: 11, lineHeight: 1.6, fontFamily: MONO }}>
            {lang && <div style={{ color: '#333', fontSize: 9, marginBottom: 4, letterSpacing: '0.1em' }}>{lang.toUpperCase()}</div>}
            <code style={{ color: '#00ff88', whiteSpace: 'pre', fontFamily: MONO }}>{code.join('\n')}</code>
          </pre>
        )
        i++; continue
      }
      const hm = line.match(/^(#{1,3})\s(.+)/)
      if (hm) {
        const sz = hm[1].length === 1 ? 15 : hm[1].length === 2 ? 13 : 12
        out.push(<div key={`${si}-${i}`} style={{ fontSize: sz, fontWeight: 700, color: '#e0e0e0', margin: '10px 0 3px', fontFamily: MONO }}>
          {'#'.repeat(hm[1].length)} {hm[2]}
        </div>)
        i++; continue
      }
      if (line.match(/^---+$/)) { out.push(<div key={`${si}-${i}`} style={{ height: 1, background: '#1a1a1a', margin: '8px 0' }} />); i++; continue }
      if (line.trim() === '') { out.push(<div key={`${si}-${i}`} style={{ height: 4 }} />); i++; continue }
      out.push(renderLine(line, `${si}-${i}`)); i++
    }
    return <div key={si}>{out}</div>
  })
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function Bubble({ msg, onSpeak }) {
  const isUser = msg.role === 'user'
  const [copied, setCopied] = useState(false)
  const allTools = [...(msg.serverTools || []), ...(msg.clientActions || []).map(a => ({ ...a, isClient: true }))]
  const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''

  if (isUser) return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #0d0d0d' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'flex-end', gap: 8, marginBottom: 4 }}>
        {time && <span style={{ fontSize: 9, color: '#2a2a2a', fontFamily: MONO }}>{time}</span>}
        <span style={{ fontSize: 9, color: '#00ff88', fontFamily: MONO, fontWeight: 700, letterSpacing: '0.1em' }}>YOU</span>
      </div>
      <div style={{ textAlign: 'right' }}>
        <span style={{ fontSize: 13.5, color: '#00ff88', fontFamily: MONO, lineHeight: 1.6, wordBreak: 'break-word' }}>
          &gt; {msg.content}
        </span>
      </div>
    </div>
  )

  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid #0d0d0d' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <span style={{ fontSize: 9, color: '#00ff88', fontFamily: MONO, fontWeight: 700, letterSpacing: '0.1em' }}>ANDY</span>
        {time && <span style={{ fontSize: 9, color: '#2a2a2a', fontFamily: MONO }}>{time}</span>}
      </div>
      {allTools.length > 0 && (
        <div style={{ marginBottom: 8, paddingLeft: 2 }}>
          {allTools.map((t, i) => <ToolCard key={t.id || i} name={t.name} input={t.input} result={t.result} />)}
        </div>
      )}
      {(msg.content || msg.streaming) && (
        <div style={{ fontSize: 13.5, color: '#c0c0c0', lineHeight: 1.7, fontFamily: MONO, wordBreak: 'break-word' }}>
          {msg.content ? renderContent(msg.content) : null}
          {msg.streaming && (
            <span style={{ display: 'inline-block', width: 8, height: '0.9em', background: '#00ff88', marginLeft: 2, verticalAlign: 'text-bottom', animation: 'cursorBlink 0.8s step-end infinite' }} />
          )}
        </div>
      )}
      {msg.content && !msg.streaming && (
        <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
          <button
            onClick={() => { navigator.clipboard.writeText(msg.content); setCopied(true); setTimeout(() => setCopied(false), 1500) }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a2a2a', padding: 0, fontSize: 10, fontFamily: MONO }}
            onMouseEnter={e => e.currentTarget.style.color = '#666'}
            onMouseLeave={e => e.currentTarget.style.color = '#2a2a2a'}
          >
            {copied ? '[copied ✓]' : '[copy]'}
          </button>
          <button
            onClick={() => onSpeak(msg.content)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a2a2a', padding: 0, fontSize: 10, fontFamily: MONO }}
            onMouseEnter={e => e.currentTarget.style.color = '#666'}
            onMouseLeave={e => e.currentTarget.style.color = '#2a2a2a'}
          >
            [speak]
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Voice ────────────────────────────────────────────────────────────────────
function useSpeech(onResult) {
  const ref = useRef(null)
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return
    setSupported(true)
    const r = new SR(); r.lang = 'fr-FR'; r.continuous = false; r.interimResults = true
    r.onresult = e => {
      let f = '', inter = ''
      for (const res of e.results) { if (res.isFinal) f += res[0].transcript; else inter += res[0].transcript }
      setInterim(inter); if (f) { setInterim(''); onResult(f.trim()) }
    }
    r.onend = () => { setListening(false); setInterim('') }
    r.onerror = () => { setListening(false); setInterim('') }
    ref.current = r
  }, [])
  const toggle = useCallback(() => {
    if (!ref.current) return
    if (listening) ref.current.stop()
    else { try { ref.current.start(); setListening(true) } catch {} }
  }, [listening])
  return { listening, interim, supported, toggle }
}

function speakText(text) {
  window.speechSynthesis?.cancel()
  const clean = text.replace(/[🟢🔴🟡📊📈📉🔔⚡₿]/gu, '').replace(/\*\*/g, '').replace(/`[^`]*`/g, '').replace(/```[\s\S]*?```/g, 'code').replace(/\[CHART:[^\]]+\]/g, '').slice(0, 600)
  const u = new SpeechSynthesisUtterance(clean); u.lang = 'fr-FR'; u.rate = 1.05; u.pitch = 1
  const fr = window.speechSynthesis.getVoices().find(v => /thomas|amélie|nicolas/i.test(v.name) && v.lang?.startsWith('fr'))
  if (fr) u.voice = fr
  window.speechSynthesis.speak(u)
}

// ─── Suggestions ──────────────────────────────────────────────────────────────
const SUGGESTIONS = [
  'analyse technique Apple 1h',
  'scanne mon portfolio',
  'combien vaut Bitcoin ?',
  'crée alertes NVDA aux niveaux clés',
  'meilleur setup du marché ?',
  'analyse S&P500 tendance',
]

// ─── Input Bar ────────────────────────────────────────────────────────────────
function InputBar({ input, onInput, onSend, onMic, listening, interim, supported, loading, offline, textareaRef }) {
  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSend() }
  }
  const canSend = input.trim() && !loading && !offline

  return (
    <div style={{ fontFamily: MONO }}>
      {interim && (
        <div style={{ fontSize: 11, color: '#00daf3', marginBottom: 4 }}>[mic] {interim}</div>
      )}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, borderTop: '1px solid #1a1a1a', paddingTop: 10 }}>
        <span style={{ fontSize: 13, color: listening ? '#ef4444' : canSend ? '#00ff88' : '#333', paddingBottom: 6, flexShrink: 0, fontFamily: MONO, userSelect: 'none' }}>
          {listening ? '[●]' : '>_'}
        </span>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={onInput}
          onKeyDown={onKeyDown}
          placeholder={offline ? 'offline' : listening ? 'listening...' : ''}
          rows={1}
          style={{
            flex: 1, background: 'none', border: 'none', outline: 'none',
            color: '#e0e0e0', fontSize: 13.5, resize: 'none', lineHeight: 1.5,
            fontFamily: MONO, maxHeight: 120, overflowY: 'auto', paddingBottom: 6,
          }}
        />
        <div style={{ display: 'flex', gap: 8, flexShrink: 0, paddingBottom: 6, alignItems: 'center' }}>
          {supported && (
            <button onClick={onMic} style={{ background: 'none', border: 'none', cursor: 'pointer', color: listening ? '#ef4444' : '#333', fontSize: 11, fontFamily: MONO, padding: 0 }}>
              {listening ? '[stop]' : '[mic]'}
            </button>
          )}
          <button onClick={onSend} disabled={!canSend} style={{
            background: 'none',
            border: `1px solid ${canSend ? '#00ff88' : '#1a1a1a'}`,
            cursor: canSend ? 'pointer' : 'default',
            color: canSend ? '#00ff88' : '#2a2a2a',
            fontSize: 12, fontFamily: MONO, padding: '3px 10px',
            transition: 'all 150ms',
          }}>
            [↵]
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Andy() {
  const navigate = useNavigate()
  const {
    stocks, cryptoHoldings, sneakers, alerts, stockWatchlist,
    addStock, deleteStock, addCryptoHolding, deleteCryptoHolding,
    addAlert, deleteAlert, addToWatchlist, removeFromWatchlist, addSneaker,
  } = useApp()

  const [messages, setMessages] = useState(loadHistory)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [toolStatus, setToolStatus] = useState('')
  const [autoSpeak, setAutoSpeak] = useState(false)
  const [offline, setOffline] = useState(!navigator.onLine)
  const [view, setView] = useState('chat') // 'chat' | 'log'
  const streamTextRef = useRef('')
  const listRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true)
    window.addEventListener('online', on); window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  useEffect(() => { saveHistory(messages) }, [messages])

  useEffect(() => {
    if (view === 'chat' && listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, loading, view])

  const { listening, interim, supported, toggle: toggleMic } = useSpeech(useCallback(t => sendMessage(t), [messages]))

  function handleInput(e) {
    setInput(e.target.value)
    const ta = e.target; ta.style.height = 'auto'; ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }

  async function executeClientActions(actions) {
    for (const { name, input: inp } of actions) {
      try {
        switch (name) {
          case 'navigate': navigate(inp.path); break
          case 'add_stock': addStock({ symbol: inp.symbol, name: inp.name, quantity: inp.quantity, buyPrice: inp.buyPrice, buyDate: inp.buyDate || '' }); break
          case 'remove_stock': { const s = stocks.find(x => x.symbol?.toUpperCase() === inp.symbol?.toUpperCase()); if (s) deleteStock(s.id); break }
          case 'add_crypto': addCryptoHolding({ coinId: inp.coinId, coinName: inp.coinName, symbol: inp.symbol, quantity: inp.quantity, buyPrice: inp.buyPrice }); break
          case 'remove_crypto': { const c = cryptoHoldings.find(x => x.coinId === inp.coinId); if (c) deleteCryptoHolding(c.id); break }
          case 'create_alert': addAlert({ symbol: inp.symbol, name: inp.name || inp.symbol, targetPrice: inp.targetPrice, direction: inp.direction }); break
          case 'delete_alert': { const a = alerts.find(x => x.symbol === inp.symbol && x.direction === inp.direction && Math.abs(x.targetPrice - inp.targetPrice) < 0.01); if (a) deleteAlert(a.id); break }
          case 'add_to_watchlist': addToWatchlist({ symbol: inp.symbol, name: inp.name }); break
          case 'remove_from_watchlist': removeFromWatchlist(inp.symbol); break
          case 'add_sneaker': addSneaker({ brand: inp.brand, model: inp.model, size: inp.size, buyPrice: inp.buyPrice }); break
        }
      } catch (e) { console.warn('Tool error:', name, e) }
    }
  }

  async function sendMessage(text) {
    const trimmed = (text || input).trim()
    if (!trimmed || loading || offline) return
    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    setView('chat')

    const userMsg = { role: 'user', content: trimmed, timestamp: new Date() }
    const newMsgs = [...messages, userMsg]
    const placeholder = { role: 'assistant', content: '', streaming: true, serverTools: [], clientActions: [], timestamp: new Date() }
    setMessages([...newMsgs, placeholder])
    setLoading(true)
    streamTextRef.current = ''

    const apiMsgs = newMsgs.map(m => ({ role: m.role, content: m.content }))

    try {
      const res = await fetch('/api/andy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMsgs, portfolio: stocks.filter(s => !s.salePrice), crypto: cryptoHoldings.filter(c => !c.salePrice), sneakers, alerts, watchlist: stockWatchlist }),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      let finalClientActions = []
      let finalServerTools = []

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          let ev
          try { ev = JSON.parse(line.slice(6)) } catch { continue }

          if (ev.type === 'token') {
            streamTextRef.current += ev.text
            const t = streamTextRef.current
            setMessages(prev => {
              const copy = [...prev]
              copy[copy.length - 1] = { ...copy[copy.length - 1], content: t }
              return copy
            })
          } else if (ev.type === 'tool_start') {
            setToolStatus(ev.label || ev.name)
          } else if (ev.type === 'tool_done') {
            setToolStatus('')
          } else if (ev.type === 'done') {
            finalClientActions = ev.clientActions || []
            finalServerTools = ev.executedServerTools || []
          } else if (ev.type === 'error') {
            throw new Error(ev.message)
          }
        }
      }

      const finalText = streamTextRef.current
      if (finalClientActions.length > 0) await executeClientActions(finalClientActions)
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: finalText, streaming: false, serverTools: finalServerTools, clientActions: finalClientActions, timestamp: copy[copy.length - 1].timestamp }
        return copy
      })
      if (autoSpeak && finalText) speakText(finalText)
    } catch (e) {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: `ERR: ${e.message}`, streaming: false, serverTools: [], clientActions: [], timestamp: copy[copy.length - 1].timestamp }
        return copy
      })
    } finally {
      setLoading(false)
      setToolStatus('')
    }
  }

  function clearAll() {
    setMessages([])
    localStorage.removeItem(HISTORY_KEY)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#000', display: 'flex', flexDirection: 'column', color: '#c0c0c0', fontFamily: MONO, overflow: 'hidden' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 14px',
        paddingTop: 'max(12px, env(safe-area-inset-top, 0px))',
        paddingBottom: 10,
        borderBottom: '1px solid #1a1a1a',
        background: '#000',
        flexShrink: 0, zIndex: 20,
      }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', padding: 0, fontSize: 16, fontFamily: MONO, lineHeight: 1 }}>
          ←
        </button>

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: '#00ff88', fontWeight: 700, letterSpacing: '0.1em', flexShrink: 0 }}>ANDY</span>
          <span style={{ fontSize: 10, color: '#222' }}>·</span>
          <span style={{ fontSize: 10, color: '#444', flexShrink: 0 }}>claude-sonnet-4-6</span>
          <span style={{ fontSize: 10, color: '#222' }}>·</span>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
            background: offline ? '#ef4444' : '#00ff88',
            boxShadow: offline ? 'none' : '0 0 5px #00ff88',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: 10, color: offline ? '#ef4444' : '#00ff88', flexShrink: 0 }}>
            {offline ? 'OFFLINE' : 'ONLINE'}
          </span>
          {messages.length > 0 && (
            <span style={{ fontSize: 10, color: '#2a2a2a', flexShrink: 0 }}>· {messages.length}</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <button
            onClick={() => setView(v => v === 'log' ? 'chat' : 'log')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: view === 'log' ? '#00ff88' : '#333', fontSize: 11, fontFamily: MONO, padding: 0 }}
          >
            [log]
          </button>
          <button onClick={() => setAutoSpeak(v => !v)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: autoSpeak ? '#00ff88' : '#333', fontSize: 11, fontFamily: MONO, padding: 0 }}>
            [spk]
          </button>
          <button onClick={() => sendMessage('Scanne mon portfolio et donne-moi les signaux importants.')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#00cc66', fontSize: 11, fontFamily: MONO, padding: 0 }}>
            [scan]
          </button>
          {messages.length > 0 && (
            <button onClick={clearAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#333', fontSize: 11, fontFamily: MONO, padding: 0 }}>
              [clr]
            </button>
          )}
        </div>
      </div>

      {offline && (
        <div style={{ background: 'rgba(239,68,68,0.06)', color: '#ef4444', fontSize: 11, textAlign: 'center', padding: '5px 16px', borderBottom: '1px solid rgba(239,68,68,0.12)', fontFamily: MONO }}>
          ! OFFLINE — connexion requise
        </div>
      )}

      {/* ── Chat View ─────────────────────────────────────────────────────── */}
      {view === 'chat' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 16px 8px', overscrollBehavior: 'contain' }}>

            {messages.length === 0 && (
              <div style={{ padding: '20px 0' }}>
                {/* Boot info */}
                <div style={{ border: '1px solid #1a1a1a', padding: '12px 14px', marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: '#00ff88', fontWeight: 700, marginBottom: 8, letterSpacing: '0.08em' }}>
                    ANDY — ASSISTANT IA
                  </div>
                  <div style={{ fontSize: 10, color: '#444', lineHeight: 1.9 }}>
                    <div>model   · claude-sonnet-4-6</div>
                    <div>status  · <span style={{ color: offline ? '#ef4444' : '#00ff88' }}>{offline ? 'OFFLINE' : 'ONLINE'}</span></div>
                    <div>tools   · portfolio · crypto · markets · alerts · sneakers</div>
                    <div>voice   · fr-FR (speech I/O)</div>
                  </div>
                </div>
                {/* Quick commands */}
                <div style={{ fontSize: 9, color: '#2a2a2a', marginBottom: 10, letterSpacing: '0.2em' }}>QUICK COMMANDS</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {SUGGESTIONS.map((s, i) => (
                    <button key={i} onClick={() => sendMessage(s)} style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', color: '#3a3a3a', fontSize: 12, fontFamily: MONO,
                      padding: '5px 0', display: 'flex', alignItems: 'center', gap: 10,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#888'}
                    onMouseLeave={e => e.currentTarget.style.color = '#3a3a3a'}>
                      <span style={{ color: '#2a2a2a' }}>&gt;</span>
                      <span>{s}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => <Bubble key={i} msg={msg} onSpeak={speakText} />)}

            {loading && (
              <div style={{ padding: '10px 0', borderBottom: '1px solid #0d0d0d' }}>
                <div style={{ fontSize: 9, color: '#00ff88', fontFamily: MONO, fontWeight: 700, marginBottom: 6, letterSpacing: '0.1em' }}>ANDY</div>
                <div style={{ fontSize: 11, color: '#333', fontFamily: MONO }}>
                  {toolStatus
                    ? <span style={{ color: '#555' }}>[{toolStatus}]</span>
                    : <span>
                        thinking
                        <span style={{ animation: 'dotPulse 1.2s ease-in-out 0s infinite' }}>.</span>
                        <span style={{ animation: 'dotPulse 1.2s ease-in-out 0.2s infinite' }}>.</span>
                        <span style={{ animation: 'dotPulse 1.2s ease-in-out 0.4s infinite' }}>.</span>
                      </span>
                  }
                </div>
              </div>
            )}

            <div style={{ height: 8 }} />
          </div>

          {/* Input */}
          <div style={{ padding: '10px 16px', paddingBottom: 'max(14px, env(safe-area-inset-bottom, 0px))', background: '#000', flexShrink: 0 }}>
            <InputBar
              input={input} onInput={handleInput}
              onSend={() => sendMessage()} onMic={toggleMic}
              listening={listening} interim={interim}
              supported={supported} loading={loading} offline={offline}
              textareaRef={textareaRef}
            />
          </div>
        </div>
      )}

      {/* ── Log View ──────────────────────────────────────────────────────── */}
      {view === 'log' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '10px 16px 8px', borderBottom: '1px solid #1a1a1a', flexShrink: 0 }}>
            <span style={{ fontSize: 10, color: '#2a2a2a', fontFamily: MONO, letterSpacing: '0.1em' }}>
              $ tail -f /var/log/andy/activity.log
            </span>
          </div>
          <ActivityFeed />
        </div>
      )}

      <style>{`
        @keyframes cursorBlink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
        @keyframes dotPulse { 0%,80%,100% { opacity: 0.15 } 40% { opacity: 1 } }
      `}</style>
    </div>
  )
}
