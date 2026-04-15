import { useState, useEffect, useCallback, useRef } from 'react'
import {
  RefreshCw, Loader2, ExternalLink, TrendingUp, Bitcoin,
  Flame, Cpu, Globe, Shield, Search, X, Bell, BellOff,
  Newspaper, ChevronRight, Zap, CheckCircle,
} from 'lucide-react'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { PullIndicator } from '../components/Skeleton'
import { requestNotificationPermission } from '../utils/smartNotify'

// ─── Sources ──────────────────────────────────────────────────────────────────
const SOURCES = [
  // Markets
  { id: 'reuters_biz',   label: 'Reuters',       url: 'https://feeds.reuters.com/reuters/businessNews',         cat: 'markets', color: '#f97316', emoji: '🟠' },
  { id: 'cnbc',          label: 'CNBC',           url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', cat: 'markets', color: '#0891b2', emoji: '📈' },
  { id: 'bbc_biz',       label: 'BBC Business',  url: 'https://feeds.bbci.co.uk/news/business/rss.xml',        cat: 'markets', color: '#ef4444', emoji: '🔴' },
  { id: 'marketwatch',   label: 'MarketWatch',   url: 'https://feeds.marketwatch.com/marketwatch/topstories/', cat: 'markets', color: '#10b981', emoji: '📊' },
  // Crypto
  { id: 'cointelegraph', label: 'CoinTelegraph', url: 'https://cointelegraph.com/rss',                         cat: 'crypto',  color: '#f59e0b', emoji: '₿' },
  { id: 'coindesk',      label: 'CoinDesk',      url: 'https://www.coindesk.com/arc/outboundfeeds/rss/',       cat: 'crypto',  color: '#fbbf24', emoji: '🪙' },
  { id: 'decrypt',       label: 'Decrypt',       url: 'https://decrypt.co/feed',                               cat: 'crypto',  color: '#8b5cf6', emoji: '🔮' },
  // World / Politics
  { id: 'bbc_world',    label: 'BBC World',      url: 'https://feeds.bbci.co.uk/news/world/rss.xml',           cat: 'world',   color: '#ef4444', emoji: '🌍' },
  { id: 'reuters_world', label: 'Reuters World', url: 'https://feeds.reuters.com/Reuters/worldNews',           cat: 'world',   color: '#f97316', emoji: '🌐' },
  { id: 'aljazeera',    label: 'Al Jazeera',     url: 'https://www.aljazeera.com/xml/rss/all.xml',             cat: 'world',   color: '#25a244', emoji: '📡' },
  { id: 'ap',           label: 'AP News',        url: 'https://feeds.apnews.com/rss/topnews',                  cat: 'world',   color: '#e11d48', emoji: '🔔' },
  // Oil / Energy
  { id: 'oilprice',     label: 'OilPrice',       url: 'https://oilprice.com/rss/main',                         cat: 'oil',     color: '#d97706', emoji: '🛢️' },
  { id: 'reuters_nrg',  label: 'Reuters Energy', url: 'https://feeds.reuters.com/reuters/energy',              cat: 'oil',     color: '#f97316', emoji: '⛽' },
  // Tech
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
  // Tier 1
  try {
    const r = await fetch(`https://corsproxy.io/?${encoded}`, { signal: AbortSignal.timeout(7000) })
    if (r.ok) items = parseXML(await r.text())
  } catch {}
  // Tier 2
  if (!items.length) {
    try {
      const r = await fetch(`https://api.allorigins.win/raw?url=${encoded}`, { signal: AbortSignal.timeout(8000) })
      if (r.ok) items = parseXML(await r.text())
    } catch {}
  }
  // Tier 3
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

// ─── Shared unread state (module-level so BottomNav can listen) ───────────────
let _unreadCount = 0
let _lastSeenTime = parseInt(localStorage.getItem('trackr_news_last_seen') || '0', 10)

export function getNewsUnreadCount() { return _unreadCount }

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

function dedup(items) {
  const seen = new Set()
  return items.filter(i => { if (seen.has(i.url)) return false; seen.add(i.url); return true })
}

const isBreaking = ts => ts && (Date.now() / 1000 - ts) < 15 * 60   // < 15 min
const isNew = ts => ts && (Date.now() / 1000 - ts) < 45 * 60        // < 45 min

// ─── Card component ───────────────────────────────────────────────────────────
function NewsCard({ item, breaking }) {
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
      }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
    >
      {/* Left accent bar */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
        background: item.sourceColor, borderRadius: '18px 0 0 18px',
        opacity: 0.85,
      }} />

      <div style={{ paddingLeft: 8 }}>
        {/* Source row */}
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

        {/* Headline */}
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
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function News() {
  const [tab, setTab] = useState('all')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [search, setSearch] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [notifsOn, setNotifsOn] = useState(() => {
    try { return JSON.parse(localStorage.getItem('trackr_settings_v2') || '{}').notificationsEnabled === true } catch { return false }
  })
  const timerRef = useRef(null)
  const searchRef = useRef(null)

  const tabSources = tab === 'all'
    ? SOURCES
    : SOURCES.filter(s => s.cat === tab)

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const results = await Promise.allSettled(
      tabSources.map(s =>
        fetchSource(s).then(rows =>
          rows.map(r => ({ ...r, source: s.label, sourceColor: s.color, sourceEmoji: s.emoji, cat: s.cat }))
        )
      )
    )
    let merged = []
    results.forEach(r => {
      if (r.status === 'fulfilled' && r.value.length) merged.push(...r.value)
    })
    const sorted = dedup(merged).sort((a, b) => b.time - a.time)
    setItems(sorted)
    setUpdatedAt(new Date())
    setLoading(false)

    // Update unread count (articles newer than last viewed)
    const newCount = sorted.filter(i => i.time > _lastSeenTime).length
    if (newCount !== _unreadCount) {
      _unreadCount = newCount
      window.dispatchEvent(new CustomEvent('trackr:newsbadge', { detail: { count: newCount } }))
    }
  }, [tab])

  // Mark as seen when user opens news page
  useEffect(() => {
    _lastSeenTime = Math.floor(Date.now() / 1000)
    localStorage.setItem('trackr_news_last_seen', String(_lastSeenTime))
    _unreadCount = 0
    window.dispatchEvent(new CustomEvent('trackr:newsbadge', { detail: { count: 0 } }))
  }, [])

  useEffect(() => { setItems([]); load() }, [tab])

  // Auto-refresh every 90s
  useEffect(() => {
    clearInterval(timerRef.current)
    timerRef.current = setInterval(() => load(true), 90 * 1000)
    return () => clearInterval(timerRef.current)
  }, [load])

  const ptr = usePullToRefresh(load)

  // Focus search input when opened
  useEffect(() => {
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 80)
  }, [showSearch])

  const filtered = search
    ? items.filter(i =>
        i.title?.toLowerCase().includes(search.toLowerCase()) ||
        i.source?.toLowerCase().includes(search.toLowerCase())
      )
    : items

  const breaking = filtered.filter(i => isBreaking(i.time))
  const rest = filtered.filter(i => !isBreaking(i.time))
  const activeTab = TABS.find(t => t.id === tab)

  async function toggleNotifs() {
    if (!notifsOn) {
      const perm = await requestNotificationPermission()
      if (perm === 'granted') {
        const s = JSON.parse(localStorage.getItem('trackr_settings_v2') || '{}')
        s.notificationsEnabled = true
        localStorage.setItem('trackr_settings_v2', JSON.stringify(s))
        setNotifsOn(true)
        // Send a confirmation notification via SW
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.getRegistration()
          reg?.active?.postMessage({
            type: 'SHOW_NOTIFICATION',
            title: '🔔 Alertes activées',
            body: 'Tu recevras les news importantes en temps réel.',
            url: '/news',
            tag: 'trackr-welcome',
          })
        }
      }
    } else {
      const s = JSON.parse(localStorage.getItem('trackr_settings_v2') || '{}')
      s.notificationsEnabled = false
      localStorage.setItem('trackr_settings_v2', JSON.stringify(s))
      setNotifsOn(false)
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', paddingBottom: 24 }}>
      <PullIndicator progress={ptr.progress} refreshing={ptr.refreshing} />

      {/* ── Sticky header ── */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(7,7,15,0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        paddingTop: 'max(52px, env(safe-area-inset-top, 0px))',
      }}>
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px 10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Newspaper size={20} color="#6366f1" />
            <span style={{ fontSize: 22, fontWeight: 800, color: 'white' }}>News</span>
            {/* Live dot */}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} className="live-ping" />
              <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>Live</span>
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {updatedAt && !loading && (
              <span style={{ fontSize: 10, color: '#374151' }}>
                {updatedAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={toggleNotifs}
              style={{ padding: '7px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                background: notifsOn ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                color: notifsOn ? '#818cf8' : '#4b5563',
              }}>
              {notifsOn ? <Bell size={16} /> : <BellOff size={16} />}
            </button>
            <button onClick={() => setShowSearch(v => !v)}
              style={{ padding: '7px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                background: showSearch ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
                color: showSearch ? '#818cf8' : '#4b5563',
              }}>
              {showSearch ? <X size={16} /> : <Search size={16} />}
            </button>
            <button onClick={() => load()} disabled={loading}
              style={{ padding: '7px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center',
                background: 'rgba(255,255,255,0.05)', color: loading ? '#374151' : '#6b7280',
              }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            </button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div style={{ padding: '0 16px 10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 16, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <Search size={15} color="#6b7280" />
              <input
                ref={searchRef}
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search headlines, sources…"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', fontSize: 15, fontFamily: 'inherit' }}
              />
              {search && <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#6b7280' }}><X size={14} /></button>}
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display: 'flex', overflowX: 'auto', gap: 6, padding: '0 16px 12px' }} className="no-scrollbar">
          {TABS.map(t => {
            const active = tab === t.id
            const Icon = t.icon
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '8px 14px',
                  borderRadius: 14,
                  border: active ? `1px solid ${t.color}40` : '1px solid rgba(255,255,255,0.07)',
                  background: active ? `${t.color}18` : 'rgba(255,255,255,0.03)',
                  color: active ? t.color : '#6b7280',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 180ms',
                  boxShadow: active ? `0 0 12px ${t.color}20` : 'none',
                }}
              >
                <Icon size={13} strokeWidth={active ? 2.5 : 1.8} />
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ padding: '12px 16px 0' }}>

        {/* Loading skeleton */}
        {loading && items.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 88, borderRadius: 18 }} />
            ))}
          </div>
        )}

        {/* Breaking news section */}
        {!loading && breaking.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                <Zap size={13} fill="#ef4444" /> Breaking
              </span>
              <span style={{ fontSize: 11, color: '#4b5563' }}>— last 15 min</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {breaking.slice(0, 5).map((item, i) => (
                <NewsCard key={item.url + i} item={item} breaking />
              ))}
            </div>
          </div>
        )}

        {/* Main feed */}
        {!loading && rest.length > 0 && (
          <div>
            {breaking.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Latest · {rest.length} articles
                </span>
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {rest.map((item, i) => (
                <NewsCard key={item.url + i} item={item} breaking={false} />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <Newspaper size={44} color="#374151" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: 16, color: '#6b7280', fontWeight: 600 }}>
              {search ? 'No articles match your search' : 'No articles loaded'}
            </p>
            <button onClick={() => load()} style={{ marginTop: 16, padding: '10px 20px', borderRadius: 14, background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8', fontSize: 14, cursor: 'pointer' }}>
              Refresh
            </button>
          </div>
        )}

        {/* Notification tip */}
        {!loading && items.length > 0 && (
          <div
            onClick={notifsOn ? undefined : toggleNotifs}
            style={{
              marginTop: 20, padding: '14px 16px', borderRadius: 18,
              background: notifsOn ? 'rgba(16,185,129,0.06)' : 'rgba(99,102,241,0.06)',
              border: notifsOn ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(99,102,241,0.18)',
              display: 'flex', alignItems: 'center', gap: 12,
              cursor: notifsOn ? 'default' : 'pointer',
            }}
          >
            {notifsOn
              ? <CheckCircle size={18} color="#10b981" />
              : <Bell size={18} color="#818cf8" />
            }
            <div style={{ flex: 1 }}>
              {notifsOn ? (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#10b981' }}>Alertes actives</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Seulement les news importantes · krach, Fed, records…</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>Activer les alertes push</div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>Reçois les breaking news sur ton téléphone, filtrées par importance</div>
                </>
              )}
            </div>
            {!notifsOn && <ChevronRight size={16} color="#4b5563" />}
          </div>
        )}

        {/* Source footer */}
        {!loading && items.length > 0 && (
          <div style={{ marginTop: 24, paddingBottom: 8 }}>
            <p style={{ fontSize: 10, color: '#374151', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>Sources</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {tabSources.map(s => (
                <span key={s.id} style={{ fontSize: 11, padding: '3px 8px', borderRadius: 8, background: `${s.color}12`, border: `1px solid ${s.color}25`, color: s.color, fontWeight: 600 }}>
                  {s.emoji} {s.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
