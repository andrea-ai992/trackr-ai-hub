// ─── Agents Activity Log ──────────────────────────────────────────────────────
// Fetches recent Discord channel messages → unified activity feed for Mission Control

const DISCORD_API = 'https://discord.com/api/v10'
const BOT_TOKEN   = process.env.DISCORD_BOT_TOKEN

const CHANNELS = [
  { key: 'market_scanner', id: process.env.DISCORD_CH_MARKET_SCANNER, agent: 'MarketScanner', emoji: '🔭', color: 0x34d399 },
  { key: 'crypto',         id: process.env.DISCORD_CH_CRYPTO,          agent: 'CryptoTracker', emoji: '₿',  color: 0xfcd34d },
  { key: 'code_review',    id: process.env.DISCORD_CH_CODE_REVIEW,     agent: 'CodeReviewer',  emoji: '👁️', color: 0x60a5fa },
  { key: 'ui_review',      id: process.env.DISCORD_CH_UI_REVIEW,       agent: 'UIInspector',   emoji: '🎨', color: 0xf9a8d4 },
  { key: 'reports',        id: process.env.DISCORD_CH_REPORTS,          agent: 'ReportBot',     emoji: '📋', color: 0x67e8f9 },
  { key: 'app_pulse',      id: process.env.DISCORD_CH_APP_PULSE,        agent: 'Pulse',         emoji: '💓', color: 0xff006e },
]

function colorToHex(n) {
  return '#' + n.toString(16).padStart(6, '0')
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
  res.setHeader('Access-Control-Allow-Origin', '*')

  if (!BOT_TOKEN) {
    return res.json({ log: [], stats: { lastScan: null, tasksToday: 0, totalAgents: 45, activeAgents: 0 } })
  }

  try {
    const channelResults = await Promise.allSettled(
      CHANNELS.filter(c => c.id).map(async (ch) => {
        const r = await fetch(`${DISCORD_API}/channels/${ch.id}/messages?limit=8`, {
          headers: { Authorization: `Bot ${BOT_TOKEN}` },
        })
        if (!r.ok) return []
        const msgs = await r.json()
        if (!Array.isArray(msgs)) return []

        return msgs.map(m => {
          const embed = m.embeds?.[0]
          const description = embed?.description || m.content || ''
          const author = embed?.author?.name || ch.agent
          const rawColor = embed?.color ?? ch.color
          return {
            id: m.id,
            channel: ch.key,
            agent: author,
            emoji: ch.emoji,
            color: colorToHex(rawColor),
            summary: description.replace(/\*\*/g, '').slice(0, 160),
            timestamp: m.timestamp,
          }
        }).filter(e => e.summary.length > 10)
      })
    )

    const log = channelResults
      .flatMap(r => r.status === 'fulfilled' ? r.value : [])
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 40)

    const now = new Date()
    const todayStr = now.toDateString()
    const tasksToday = log.filter(e => new Date(e.timestamp).toDateString() === todayStr).length

    const lastScan = log[0]?.timestamp || null
    const activeChannels = new Set(log.filter(e => {
      const diff = (Date.now() - new Date(e.timestamp)) / 60000
      return diff < 20
    }).map(e => e.channel))

    res.json({
      log,
      stats: {
        lastScan,
        tasksToday,
        totalAgents: 45,
        activeAgents: activeChannels.size,
        activeChannels: [...activeChannels],
      },
    })
  } catch (e) {
    console.error('agents-log error:', e)
    res.json({ log: [], stats: { lastScan: null, tasksToday: 0, totalAgents: 45, activeAgents: 0 } })
  }
}
