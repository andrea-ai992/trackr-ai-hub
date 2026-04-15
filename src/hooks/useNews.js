import { useState, useEffect, useCallback } from 'react'

const CACHE = {}
const TTL = 5 * 60 * 1000

// RSS feeds via rss2json.com (free, CORS-friendly, 10k req/day)
const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url='

const SOURCES = {
  all: [
    { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', label: 'BBC Business' },
    { url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', label: 'CNBC' },
  ],
  stocks: [
    { url: 'https://feeds.reuters.com/reuters/businessNews', label: 'Reuters' },
    { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', label: 'CNBC Markets' },
  ],
  crypto: [
    { url: 'https://cointelegraph.com/rss', label: 'CoinTelegraph' },
    { url: 'https://decrypt.co/feed', label: 'Decrypt' },
  ],
  commodities: [
    { url: 'https://feeds.bbci.co.uk/news/business/market-data/rss.xml', label: 'BBC Markets' },
    { url: 'https://feeds.reuters.com/reuters/energy', label: 'Reuters Energy' },
  ],
  tech: [
    { url: 'https://techcrunch.com/feed/', label: 'TechCrunch' },
    { url: 'https://feeds.arstechnica.com/arstechnica/index', label: 'Ars Technica' },
  ],
}

function parseItem(item, source) {
  const ts = item.pubDate ? Math.floor(new Date(item.pubDate).getTime() / 1000) : 0
  const thumb = item.thumbnail ||
    item.enclosure?.link ||
    item.content?.match(/<img[^>]+src="([^"]+)"/)?.[1] ||
    null
  return {
    id: item.guid || item.link,
    title: item.title?.replace(/<[^>]+>/g, '').trim(),
    url: item.link,
    publisher: item.author || source,
    time: ts,
    description: item.description?.replace(/<[^>]+>/g, '').slice(0, 140) + '…',
    thumbnail: thumb?.startsWith('http') ? thumb : null,
  }
}

async function fetchFeed(feedUrl, label) {
  const encoded = encodeURIComponent(feedUrl)
  const res = await fetch(`${RSS2JSON}${encoded}&count=12`, { signal: AbortSignal.timeout(10000) })
  if (!res.ok) throw new Error(`${label}: ${res.status}`)
  const json = await res.json()
  if (json.status !== 'ok') throw new Error(`${label}: ${json.message || 'error'}`)
  return (json.items || []).map(i => parseItem(i, label))
}

export function useNews(category = 'all') {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchNews = useCallback(async () => {
    const cached = CACHE[category]
    if (cached && Date.now() - cached.ts < TTL) {
      setArticles(cached.data); setLoading(false); return
    }
    setLoading(true); setError(null)
    const feeds = SOURCES[category] || SOURCES.all
    try {
      const results = await Promise.allSettled(feeds.map(f => fetchFeed(f.url, f.label)))
      const all = results.flatMap(r => r.status === 'fulfilled' ? r.value : [])
      if (all.length === 0) {
        const failMsg = results.find(r => r.status === 'rejected')?.reason?.message
        throw new Error(failMsg || 'Aucune actualité disponible')
      }
      const sorted = all.filter(a => a.title).sort((a, b) => b.time - a.time)
      CACHE[category] = { data: sorted, ts: Date.now() }
      setArticles(sorted)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [category])

  useEffect(() => { fetchNews() }, [fetchNews])
  return { articles, loading, error, refresh: fetchNews }
}

export async function fetchNewsForSymbol(symbol) {
  const key = `sym_${symbol}`
  const cached = CACHE[key]
  if (cached && Date.now() - cached.ts < TTL) return cached.data
  try {
    // Yahoo Finance RSS for a specific symbol
    const url = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`
    const items = await fetchFeed(url, symbol)
    CACHE[key] = { data: items, ts: Date.now() }
    return items
  } catch {
    return []
  }
}
