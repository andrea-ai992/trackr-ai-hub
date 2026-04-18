import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { MessageSquare, Send, Sparkles, Bot } from 'lucide-react'

const MONO = "'JetBrains Mono', 'Fira Code', 'SF Mono', 'Courier New', monospace"

const HISTORY_KEY = 'trackr_andy_v2'
const MAX_MSGS = 60

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]') } catch { return [] }
}
function saveHistory(msgs) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(msgs.slice(-MAX_MSGS)))
}

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
    default: return name
  }
}

function ChatMessage({ role, content, tool, toolInput, toolResult }) {
  const isUser = role === 'user'
  const isAnDy = role === 'assistant'

  const renderMarkdown = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--neon)' }}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div style={{
      display: 'flex',
      marginBottom: 16,
      justifyContent: isUser ? 'flex-end' : 'flex-start',
    }}>
      {!isUser && (
        <div style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--neon)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          flexShrink: 0,
        }}>
          <Bot size={18} style={{ color: 'var(--bg)' }} />
        </div>
      )}

      <div style={{
        maxWidth: '85%',
        padding: '12px 16px',
        borderRadius: 12,
        backgroundColor: isUser ? 'var(--green-bg)' : 'var(--surface)',
        border: isUser ? '1px solid var(--border)' : '1px solid var(--border)',
        color: isUser ? 'var(--bg)' : 'var(--text-primary)',
        fontFamily: MONO,
        fontSize: 14,
        lineHeight: 1.5,
      }}>
        {isAnDy && tool && (
          <div style={{
            marginBottom: 8,
            paddingBottom: 8,
            borderBottom: '1px solid var(--border-bright)',
            fontSize: 11,
            color: TOOL_CFG[tool]?.color || 'var(--text-secondary)',
          }}>
            {TOOL_CFG[tool]?.label || tool}
            <div style={{ marginTop: 4, fontSize: 10, color: 'var(--text-muted)' }}>
              {toolInput && renderMarkdown(JSON.stringify(toolInput))}
            </div>
          </div>
        )}

        {isAnDy && toolResult && (
          <div style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--border-bright)',
            fontSize: 11,
            color: 'var(--text-secondary)',
          }}>
            {renderMarkdown(toolResult)}
          </div>
        )}

        {!tool && renderMarkdown(content)}
      </div>
    </div>
  )
}

export default function Andy() {
  const [messages, setMessages] = useState(loadHistory())
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const { setTitle } = useApp()

  useEffect(() => {
    setTitle('AnDy')
  }, [setTitle])

  useEffect(() => {
    saveHistory(messages)
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    const userMsg = { id: Date.now(), role: 'user', content: userMessage }
    setMessages(prev => [...prev, userMsg])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: messages }),
      })

      if (!response.ok) throw new Error('Network response was not ok')

      const data = await response.json()
      const assistantMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        tool: data.tool,
        toolInput: data.toolInput,
        toolResult: data.toolResult,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Désolé, je n'ai pas pu traiter ta demande. Réessaye plus tard.",
      }])
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, messages])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (suggestion) => {
    setInput(suggestion)
    setTimeout(() => inputRef.current?.focus(), 0)
  }

  const suggestions = [
    'Analyse mon portfolio',
    'News crypto',
    'Stats PSG',
    'Prévision marché',
  ]

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--bg)',
      fontFamily: MONO,
      color: 'var(--text-primary)',
    }}>
      <header style={{
        padding: '16px 16px 12px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: 'var(--neon)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pulse 2s infinite',
          boxShadow: '0 0 12px var(--neon)',
        }}>
          <Bot size={20} style={{ color: 'var(--bg)' }} />
        </div>

        <div style={{ fontSize: 16, fontWeight: 600 }}>
          AnDy
        </div>

        {isLoading && (
          <div style={{
            fontSize: 12,
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}>
            <span>AnDy pense</span>
            <span style={{ animation: 'dots 1.5s infinite' }}>...</span>
          </div>
        )}
      </header>

      <div style={{ flex: 1, overflowY