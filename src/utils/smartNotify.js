// Smart news notification filter — only send what matters

// Keywords that make a headline urgent/important
const URGENT_KEYWORDS = [
  // Market crashes & crises
  'crash', 'collapse', 'plonge', 'effondrement', 'krach', 'crisis', 'crise',
  'bankrupt', 'faillite', 'default', 'défaut',
  // Big moves
  'surge', 'soar', 'rallye', 'record', 'all-time high', 'plus haut',
  'plunge', 'tumble', 'slump', 'chute', 'baisse', 'hausse',
  // Central banks / macro
  'fed', 'federal reserve', 'bce', 'banque centrale', 'taux', 'rate hike', 'rate cut',
  'inflation', 'récession', 'recession', 'pib', 'gdp',
  // Geopolitics
  'war', 'guerre', 'sanctions', 'tariff', 'tarifs', 'trump', 'embargo',
  // Big earnings / M&A
  'earnings', 'résultats', 'merger', 'acquisition', 'rachat', 'ipo',
  // Crypto specific
  'bitcoin', 'btc', 'ethereum', 'eth', 'crypto', 'sec', 'etf',
  // Breaking
  'breaking', 'urgent', 'flash',
]

// Keywords for medium importance (still worth showing)
const MEDIUM_KEYWORDS = [
  'sp500', 's&p', 'nasdaq', 'dow jones', 'cac 40', 'dax',
  'oil', 'pétrole', 'gold', 'or', 'dollar', 'euro',
  'nvidia', 'apple', 'tesla', 'microsoft', 'amazon', 'google',
  'apple', 'aapl', 'msft', 'amzn', 'tsla', 'meta',
  'invest', 'marché', 'market', 'bourse',
]

const NOTIFIED_KEY = 'trackr_notified_headlines'
const MAX_STORED = 200

function getNotified() {
  try { return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]')) }
  catch { return new Set() }
}

function saveNotified(set) {
  const arr = [...set].slice(-MAX_STORED)
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(arr))
}

function scoreHeadline(title) {
  const lower = title.toLowerCase()
  for (const kw of URGENT_KEYWORDS) {
    if (lower.includes(kw)) return 2 // urgent
  }
  for (const kw of MEDIUM_KEYWORDS) {
    if (lower.includes(kw)) return 1 // medium
  }
  return 0 // not important
}

// Send notification via Service Worker (works when app is open or in background)
async function sendSWNotification({ title, body, url, urgent, tag }) {
  if (!('serviceWorker' in navigator)) return
  try {
    const reg = await navigator.serviceWorker.getRegistration()
    if (!reg) return
    reg.active?.postMessage({ type: 'SHOW_NOTIFICATION', title, body, url, urgent, tag })
  } catch {}
}

// Main: filter articles and notify for the important ones
export async function notifyImportantNews(articles) {
  if (Notification.permission !== 'granted') return
  const notified = getNotified()
  const toNotify = []

  for (const a of articles) {
    const id = a.title?.slice(0, 80) || a.link
    if (!id || notified.has(id)) continue
    const score = scoreHeadline(a.title || '')
    if (score === 0) continue
    toNotify.push({ ...a, _score: score, _id: id })
  }

  // Sort by score desc, send max 3 per check (avoid notification spam)
  toNotify.sort((a, b) => b._score - a._score)
  const toSend = toNotify.slice(0, 3)

  for (const a of toSend) {
    notified.add(a._id)
    const isUrgent = a._score === 2
    const source = a.source || a.feed || ''
    const body = source ? `${source} · ${a.pubDate ? new Date(a.pubDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''}` : ''
    await sendSWNotification({
      title: isUrgent ? `🔴 ${a.title}` : `📈 ${a.title}`,
      body,
      url: '/news',
      urgent: isUrgent,
      tag: `trackr-news-${a._id.replace(/\s+/g, '-').slice(0, 40)}`,
    })
    // Small delay between notifications
    await new Promise(r => setTimeout(r, 400))
  }

  if (toSend.length > 0) saveNotified(notified)
  return toSend.length
}

export function requestNotificationPermission() {
  if (!('Notification' in window)) return Promise.resolve('not-supported')
  if (Notification.permission === 'granted') return Promise.resolve('granted')
  if (Notification.permission === 'denied') return Promise.resolve('denied')
  return Notification.requestPermission()
}
