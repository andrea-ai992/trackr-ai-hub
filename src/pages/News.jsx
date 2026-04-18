import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RefreshCw, Loader2, ExternalLink, TrendingUp, Bitcoin,
  Flame, Cpu, Globe, Shield, Search, X, Zap,
} from 'lucide-react'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { PullIndicator } from '../components/Skeleton'
import { requestNotificationPermission } from '../utils/smartNotify'

// ─── Sources ──────────────────────────────────────────────────────────────────
const SOURCES = [
  { id: 'reuters_biz', label: 'Reuters', url: 'https://feeds.reuters.com/reuters/businessNews', cat: 'markets', color: '#ff8000', emoji: '🌐' },
  { id: 'bbc_biz', label: 'BBC Business', url: 'https://feeds.bbci.co.uk/news/business/rss.xml', cat: 'markets', color: '#e60026', emoji: '🔴' },
  { id: 'coindesk', label: 'CoinDesk', url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', cat: 'crypto', color: '#f7931a', emoji: '🪙' },
  { id: 'lemonde', label: 'Le Monde', url: 'https://www.lemonde.fr/rss/une.xml', cat: 'world', color: '#003189', emoji: '📰' },
  { id: 'bloomberg', label: 'Bloomberg', url: 'https://www.bloomberg.com/feed/podcast/etf-report.xml', cat: 'markets', color: '#1a1a1a', emoji: '📈' },
]

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: 'Tout' },
  { id: 'tech', label: 'Tech' },
  { id: 'finance', label: 'Finance' },
  { id: 'sports', label: 'Sports' },
  { id: 'crypto', label: 'Crypto' },
  { id: 'france', label: 'France' },
]

// ─── RSS fetch with 3-tier proxy ──────────────────────────────────────────────
const CACHE = {}
const TTL = 90 * 1000

function parseXML(text) {
  try {
    const doc = new DOMParser().parseFromString(text, 'text/xml')
    const nodes = [...doc.querySelectorAll('item'), ...doc.querySelectorAll('entry')]
    return nodes.map(el => {
      const title = el.querySelector('title')?.textContent?.replace(/<!\[CDATA\[|\]\]>/g, '')?.trim()
      const linkEl = el.querySelector('link')
      const url = linkEl?.getAttribute('href') || linkEl?.textContent?.trim() || el.querySelector('guid')?.textContent?.trim()
      const pubRaw = el.querySelector('pubDate, published, updated')?.textContent
      const time = pubRaw ? Math.floor(new Date(pubRaw).getTime() / 1000) : 0
      return { title, url, time }
    }).filter(i => i.title && i.url && i.title.length > 5)
  } catch { return [] }
}

async function fetchSource(src) {
  const cached = CACHE[src.id]
  if (cached && Date.now() - cached.ts < TTL) return cached.data
  const encoded = encodeURIComponent(src.url)
  let items = []
  try {
    const r = await fetch(`https://corsproxy.io/?${encoded}`, { signal: AbortSignal.timeout(7000) })
    if (r.ok) items = parseXML(await r.text())
  } catch {}
  if (items.length) CACHE[src.id] = { data: items, ts: Date.now() }
  return items
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
function ago(ts) {
  if (!ts) return ''
  const m = Math.floor((Date.now() / 1000 - ts) / 60)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

const isBreaking = ts => ts && (Date.now() / 1000 - ts) < 30 * 60   // < 30 min
const isNew = ts => ts && (Date.now() / 1000 - ts) < 120 * 60      // < 2h

// ─── Card component ───────────────────────────────────────────────────────────
function NewsCard({ item }) {
  const breaking = isBreaking(item.time)
  return (
    <a href={item.url} target="_blank" rel="noreferrer"
      style={{
        display: 'block', textDecoration: 'none',
        padding: '13px 14px 13px 17px',
        background: breaking ? 'rgba(255,77,77,0.06)' : 'var(--bg2)',
        border: breaking ? '1px solid rgba(255,77,77,0.2)' : '1px solid var(--border)',
        borderLeft: `3px solid ${item.sourceColor}`,
        borderRadius: 'var(--radius)',
        transition: 'background 100ms',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative'
      }}
    >
      {breaking && (
        <span style={{ position: 'absolute', top: 10, left: 10, fontSize: 9, fontWeight: 800, color: '#ff0000', background: 'rgba(255,0,0,0.1)', padding: '2px 6px', borderRadius: 5 }}>
          BREAKING
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: item.sourceColor }}>{item.sourceEmoji} {item.source}</span>
        <span style={{ fontSize: 10, color: 'var(--t3)' }}>· {ago(item.time)}</span>
        <ExternalLink size={11} style={{ color: 'var(--t3)', marginLeft: 'auto' }} />
      </div>
      <p style={{ fontSize: breaking ? 14 : 13, lineHeight: 1.45, color: breaking ? 'var(--t1)' : 'var(--t2)', fontWeight: breaking ? 700 : 500, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.title}
      </p>
    </a>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function News() {
  const [tab, setTab] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const timerRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)
    const results = await Promise.allSettled(
      SOURCES.map(s => fetchSource(s).then(rows =>
        rows.map(r => ({ ...r, source: s.label, sourceColor: s.color, sourceEmoji: s.emoji }))
      ))
    )
    let merged = []
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value.length) merged.push(...r.value)
    })
    setItems(merged.sort((a, b) => b.time - a.time))
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [])

  useEffect(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => load(), 90 * 1000)
    return () => clearInterval(timerRef.current)
  }, [load])

  const filtered = search
    ? items.filter(i =>
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.source?.toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--t1)', padding: '16px' }}>
      <header style={{ position: 'sticky', top: 0, background: 'var(--bg)', zIndex: 10, padding: '10px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              flex: 1, padding: '10px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
              transition: 'width 0.3s', outline: 'none', background: 'var(--bg2)', color: 'var(--t1)'
            }}
            onFocus={e => e.target.style.width = '200px'}
            onBlur={e => e.target.style.width = '100px'}
          />
        </div>
        <div style={{ display: 'flex', overflowX: 'auto', marginTop: '10px' }}>
          {TABS.map(tabItem => (
            <button key={tabItem.id} onClick={() => setTab(tabItem.id)} style={{
              flex: 'none', padding: '10px 15px', background: tab === tabItem.id ? 'var(--green)' : 'var(--bg2)',
              color: tab === tabItem.id ? '#fff' : 'var(--t1)', border: 'none', borderRadius: 'var(--radius)', marginRight: '8px'
            }}>
              {tabItem.label}
            </button>
          ))}
        </div>
      </header>
      <div>
        {loading ? (
          <PullIndicator />
        ) : (
          filtered.map((item, index) => <NewsCard key={index} item={item} />)
        )}
      </div>
    </div>
  )
}