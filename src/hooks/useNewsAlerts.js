import { useEffect, useRef } from 'react'
import { notifyImportantNews } from '../utils/smartNotify'

const RSS2JSON = 'https://api.rss2json.com/v1/api.json?rss_url='
const SEEN_KEY = 'trackr_news_seen'
const CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes

// High-signal sources only for background alerts
const WATCHED_FEEDS = [
  { id: 'reuters_world', label: 'Reuters',     url: 'https://feeds.reuters.com/Reuters/worldNews',           emoji: '🌐' },
  { id: 'bbc_world',    label: 'BBC News',     url: 'https://feeds.bbci.co.uk/news/world/rss.xml',           emoji: '🔴' },
  { id: 'cnbc_top',     label: 'CNBC Markets', url: 'https://www.cnbc.com/id/100003114/device/rss/rss.html', emoji: '📈' },
  { id: 'cointelegraph',label: 'Crypto',       url: 'https://cointelegraph.com/rss',                         emoji: '₿' },
  { id: 'oilprice',     label: 'Oil',          url: 'https://oilprice.com/rss/main',                         emoji: '🛢️' },
]

function getSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) || '[]')) }
  catch { return new Set() }
}

function saveSeenIds(set) {
  const arr = [...set].slice(-800)
  localStorage.setItem(SEEN_KEY, JSON.stringify(arr))
}

async function checkFeeds() {
  const seen = getSeenIds()
  const isFirstRun = seen.size === 0
  const allNewArticles = []

  for (const feed of WATCHED_FEEDS) {
    try {
      const res = await fetch(
        `${RSS2JSON}${encodeURIComponent(feed.url)}&count=5`,
        { signal: AbortSignal.timeout(8000) }
      )
      if (!res.ok) continue
      const json = await res.json()
      if (json.status !== 'ok') continue

      const items = (json.items || [])
        .map(i => ({
          id: i.guid || i.link,
          title: i.title?.replace(/<[^>]+>/g, '').trim(),
          url: i.link,
          pubDate: i.pubDate,
          source: feed.label,
          emoji: feed.emoji,
        }))
        .filter(i => i.id && i.title)

      const newItems = items.filter(i => !seen.has(i.id))
      items.forEach(i => seen.add(i.id))

      if (newItems.length > 0 && !isFirstRun) {
        allNewArticles.push(...newItems)

        // Increment nav badge
        window.dispatchEvent(new CustomEvent('trackr:newsbadge', {
          detail: { count: newItems.length, increment: true }
        }))

        // In-app toast (always fires)
        window.dispatchEvent(new CustomEvent('trackr:news', {
          detail: {
            source: feed.label,
            title: newItems[0].title,
            url: newItems[0].url,
            emoji: feed.emoji,
          }
        }))
      }
    } catch {
      // Silently skip unavailable sources
    }
  }

  saveSeenIds(seen)

  // Smart notification: only send the truly important ones
  if (allNewArticles.length > 0 && !isFirstRun) {
    await notifyImportantNews(allNewArticles)
  }
}

export function useNewsAlerts() {
  const intervalRef = useRef(null)

  useEffect(() => {
    // First check after 45s so app has time to fully load
    const initTimer = setTimeout(checkFeeds, 45 * 1000)
    intervalRef.current = setInterval(checkFeeds, CHECK_INTERVAL)
    return () => {
      clearTimeout(initTimer)
      clearInterval(intervalRef.current)
    }
  }, [])
}
