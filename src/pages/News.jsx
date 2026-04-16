src/hooks/useVirtualScroll.js
import { useState, useEffect, useRef, useCallback } from 'react'

const useVirtualScroll = ({
  itemCount,
  itemHeight,
  overscan = 5,
  containerRef,
}) => {
  const [scrollTop, setScrollTop] = useState(0)
  const [containerHeight, setContainerHeight] = useState(0)
  const rafRef = useRef(null)

  const handleScroll = useCallback((e) => {
    if (rafRef.current) return
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(e.target.scrollTop)
      rafRef.current = null
    })
  }, [])

  useEffect(() => {
    const el = containerRef?.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height)
      }
    })
    ro.observe(el)
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      ro.disconnect()
      el.removeEventListener('scroll', handleScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [containerRef, handleScroll])

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const visibleCount = Math.ceil(containerHeight / itemHeight) + overscan * 2
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount)
  const totalHeight = itemCount * itemHeight
  const offsetY = startIndex * itemHeight

  return { startIndex, endIndex, totalHeight, offsetY }
}

export default useVirtualScroll


src/pages/News.jsx
import { useState, useEffect, useCallback, useRef, memo } from 'react'
import {
  RefreshCw, Loader2, ExternalLink, TrendingUp, Bitcoin,
  Flame, Cpu, Globe, Shield, Search, X, Bell, BellOff,
  Newspaper, ChevronRight, Zap, CheckCircle,
} from 'lucide-react'
import { FixedSizeList as List } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { PullIndicator } from '../components/Skeleton'
import { requestNotificationPermission } from '../utils/smartNotify'

const SOURCES = [
  { id: 'reuters_biz',   label: 'Reuters',       url: 'https://feeds.reuters.com/reuters/businessNews',         cat: 'markets', color: '#f97316', emoji: '🟠' },
  { id: 'cnbc',          label: 'CNBC',           url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', cat: 'markets', color: '#0891b2', emoji: '📈' },
  { id: 'bbc_biz',       label: 'BBC Business',  url: 'https://feeds.bbci.co.uk/news/business/rss.xml',        cat: 'markets', color: '#ef4444', emoji: '🔴' },
  { id: 'marketwatch',   label: 'MarketWatch',   url: 'https://feeds.marketwatch.com/marketwatch/topstories/', cat: 'markets', color: '#10b981', emoji: '📊' },
  { id: 'cointelegraph', label: 'CoinTelegraph', url: 'https://cointelegraph.com/rss',                         cat: 'crypto',  color: '#f59e0b', emoji: '₿' },
  { id: 'coindesk',      label: 'CoinDesk',      url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',       cat: 'crypto',  color: '#fbbf24', emoji: '🪙' },
  { id: 'decrypt',       label: 'Decrypt',       url: 'https://decrypt.co/feed',                               cat: 'crypto',  color: '#8b5cf6', emoji: '🔮' },
  { id: 'bbc_world',    label: 'BBC World',      url: 'https://feeds.bbci.co.uk/news/world/rss.xml',           cat: 'world',   color: '#ef4444', emoji: '🌍' },
  { id: 'reuters_world', label: 'Reuters World', url: 'https://feeds.reuters.com/Reuters/worldNews',           cat: 'world',   color: '#f97316', emoji: '🌐' },
  { id: 'aljazeera',    label: 'Al Jazeera',     url: 'https://www.aljazeera.com/xml/rss/all.xml',             cat: 'world',   color: '#25a244', emoji: '📡' },
  { id: 'ap',           label: 'AP News',        url: 'https://feeds.apnews.com/rss/topnews',                  cat: 'world',   color: '#e11d48', emoji: '🔔' },
  { id: 'oilprice',     label: 'OilPrice',       url: 'https://oilprice.com/rss/main',                         cat: 'oil',     color: '#d97706', emoji: '🛢️' },
  { id: 'reuters_nrg',  label: 'Reuters Energy', url: 'https://feeds.reuters.com/reuters/energy',              cat: 'oil',     color: '#f97316', emoji: '⛽' },
  { id: 'tc',           label: 'TechCrunch',     url: 'https://techcrunch.com/feed/',                          cat: 'tech',    color: '#10b981', emoji: '🚀' },
  { id: 'verge',        label: 'The Verge',      url: 'https://www.theverge.com/rss/index.xml',                cat: 'tech',    color: '#6366f1', emoji: '⚡' },
  { id: 'ars',          label: 'Ars Technica',   url: 'https://feeds.arstechnica.com/arstechnica/index',       cat: 'tech',    color: '#06b6d4', emoji: '🔬' },
]

const TABS = [
  { id: 'all',     label: 'All',     icon: Globe,      color: '#6366f1' },
  { id: 'markets', label: 'Markets', icon: TrendingUp, color: '#10b981' },
  { id: 'crypto',  label: 'Crypto',  icon: Bitcoin,    color: '#f59e0b' },
  { id: 'world',   label: 'World',   icon: Shield,     color: '#ef4444' },
  { id: 'oil',     label: 'Oil',     icon: Flame,      color: '#d97706' },
  { id: 'tech',    label: 'Tech',    icon: Cpu,        color: '#8b5cf6' },
]

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
  if (!items.length) {
    try {
      const r = await fetch(`https://api.allorigins.win/raw?url=${encoded}`, { signal: AbortSignal.timeout(8000) })
      if (r.ok) items = parseXML(await r.text())
    } catch {}
  }
  if (!items.length) {
    try {
      const r = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encoded}&count=20`, { signal: AbortSignal.timeout(10000) })
      const json = await r.json()
      if (json.status === 'ok') {
        items = (json.items || []).map(i => ({
          title: i.title?.replace(/<[^>]+>/g, '').trim(),
          url: i.link,
          time: i.pubDate ? Math.floor(new Date(i.pubDate).getTime() / 1000) : 0,
        })).filter(i => i.title && i.url)
      }
    } catch {}
  }
  if (items.length) CACHE[src.id] = { data: items, ts: Date.now() }
  return items
}

let _unreadCount = 0
let _lastSeenTime = parseInt(localStorage.getItem('trackr_news_last_seen') || '0', 10)

export function getNewsUnreadCount() { return _unreadCount }

function ago(ts) {
  if (!ts) return ''
  const m = Math.floor((Date.now() / 1000 - ts) / 60)
  if (m < 1) return 'Just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function dedup(items) {
  const seen = new Set()
  return items.filter(i => { if (seen.has(i.url)) return false; seen.add(i.url); return true })
}

const isBreaking = ts => ts && (Date.now() / 1000 - ts) < 15 * 60
const isNew = ts => ts && (Date.now() / 1000 - ts) < 45 * 60

const NewsCard = memo(function NewsCard({ item, breaking }) {
  const [pressed, setPressed] = useState(false)

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noreferrer"
      style={{
        display: 'block',
        textDecoration: 'none',
        padding: '14px 16px',
        background: breaking
          ? 'rgba(239,68,68,0.07)'
          : pressed ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)',
        border: breaking
          ? '1px solid rgba(239,68,68,0.22)'
          : '1px solid rgba(255,255,255,0.05)',
        borderRadius: 18,
        transition: 'background 120ms',
        WebkitTapHighlightColor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        willChange: 'transform',
        transform: 'translateZ(0)',
      }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: item.sourceColor, borderRadius: '18px 0 0 18px',
        opacity: 0.85,
      }} />
      <div style={{ paddingLeft: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
          {breaking && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 3,
              fontSize: 9, fontWeight: 900, letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#ef4444', background: 'rgba(239,68,68,0.15)',
              border: '1px solid rgba(239,68,68,0.3)',
              padding: '2px 6px', borderRadius: 5,
            }}>
              <Zap size={8} fill="#ef4444" /> BREAKING
            </span>
          )}
          {!breaking && isNew(item.time) && (
            <span style={{
              fontSize: 9, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: '#10b981', background: 'rgba(16,185,129,0.12)',
              border: '1px solid rgba(16,185,129,0.25)',
              padding: '2px 6px', borderRadius: 5,
            }}>NEW</span>
          )}
          <span style={{ fontSize: 11, fontWeight: 700, color: item.sourceColor }}>
            {item.sourceEmoji} {item.source}
          </span>
          <span style={{ fontSize: 10, color: '#374151' }}>·</span>
          <span style={{ fontSize: 11, color: '#4b5563' }}>{ago(item.time)}</span>
          <ExternalLink size={11} style={{ color: '#374151', marginLeft: 'auto' }} />
        </div>
        <p style={{
          fontSize: breaking ? 15 : 14,
          lineHeight: 1.45,
          color: breaking ? '#f9fafb' : '#d1d5db',
          fontWeight: breaking ? 700 : 500,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {item.title}
        </p>
      </div>
    </a>
  )
})

const ITEM_HEIGHT = 130

const VirtualNewsRow = memo(function VirtualNewsRow({ index, style, data }) {
  const item = data[index]
  if (!item) return null
  const breaking = isBreaking(item.time)
  return (
    <div style={{ ...style, paddingBottom: 10, paddingLeft: 16, paddingRight: 16, boxSizing: 'border-box' }}>
      <NewsCard item={item} breaking={breaking} />
    </div>
  )
})

export default function News() {
  const [tab, setTab] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [search, setSearch] = useState('')
  const [notifEnabled, setNotifEnabled] = useState(
    () => localStorage.getItem('trackr_news_notif') === '1'
  )
  const [markRead, setMarkRead] = useState(false)
  const scrollRef = useRef(null)
  const listRef = useRef(null)
  const abortRef = useRef(null)

  const load = useCallback(async (force = false) => {
    if (force) Object.keys(CACHE).forEach(k => delete CACHE[k])
    setLoading(true)
    abortRef.current?.abort()
    const results = await Promise.allSettled(SOURCES.map(s => fetchSource(s)))
    const merged = []
    results.forEach((r, i) => {
      if (r.status === 'fulfilled') {
        r.value.forEach(item => merged.push({
          ...item,
          source: SOURCES[i].label,
          sourceColor: SOURCES[i].color,
          sourceEmoji: SOURCES[i].emoji,
          cat: SOURCES[i].cat,
        }))
      }
    })
    merged.sort((a, b) => b.time - a.time)
    const deduped = dedup(merged)
    const latest = deduped[0]?.time || 0
    _unreadCount = deduped.filter(i => i.time > _lastSeenTime).length
    setItems(deduped)
    setUpdatedAt(Date.now())
    setLoading(false)
    if (notifEnabled && latest > _lastSeenTime) {
      const breaking = deduped.filter(i => isBreaking(i.time))
      if (breaking.length > 0) {
        requestNotificationPermission().catch(() => {})
      }
    }
  }, [notifEnabled])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const id = setInterval(() => load(), 3 * 60 * 1000)
    return () => clearInterval(id)
  }, [load])

  const { pullState, handlers } = usePullToRefresh({ onRefresh: () => load(true) })

  const handleMarkRead = useCallback(() => {
    _lastSeenTime = Math.floor(Date.now() / 1000)
    localStorage.setItem('trackr_news_last_seen', String(_lastSeenTime))
    _unreadCount = 0
    setMarkRead(true)
    setTimeout(() => setMarkRead(false), 2000)
  }, [])

  const handleNotif = useCallback(async () => {
    if (!notifEnabled) {
      await requestNotificationPermission()
      localStorage.setItem('trackr_news_notif', '1')
      setNotifEnabled(true)
    } else {
      localStorage.setItem('trackr_news_notif', '0')
      setNotifEnabled(false)
    }
  }, [notifEnabled])

  const filtered = items.filter(i => {
    const matchTab = tab === 'all' || i.cat === tab
    const matchSearch = !search || i.title?.toLowerCase().includes(search.toLowerCase())
    return matchTab && matchSearch
  })

  const activeTab = TABS.find(t => t.id === tab)

  return (
    <div
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: '#060608',
        overflow: 'hidden',
        overscrollBehavior: 'contain',
      }}
    >
      {/* Pull indicator */}
      <PullIndicator pullState={pullState} />

      {/* Header */}
      <div style={{
        padding: '16px 16px 0',
        flexShrink: 0,
        background: '#