// ─── Trackr AnDy — Discord Bot (REST Polling, All Channels) ──────────────────
// Polls ALL text channels every 5s — no privileged intents needed
// Natural chat: just type in any channel, AnDy responds
// Admin auto-detected from guild owner

import http from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: `${__dir}/.env` })

const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const GUILD_ID  = process.env.DISCORD_GUILD_ID
const APP_URL   = process.env.APP_URL || process.env.VERCEL_URL || 'https://trackr-app-nu.vercel.app'
const PORT      = process.env.PORT || 3099
const API       = 'https://discord.com/api/v10'

if (!BOT_TOKEN || !GUILD_ID) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID')
  process.exit(1)
}

// Admin IDs (auto-populated from guild owner at startup)
const ADMIN_IDS = new Set(
  (process.env.DISCORD_ADMIN_USER_IDS || process.env.DISCORD_ADMIN_USER_ID || '').split(',').filter(Boolean)
)

// ─── Discord REST helpers ─────────────────────────────────────────────────────
const headers = {
  Authorization: `Bot ${BOT_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'TrackrAndyBot/3.0',
}

async function discordFetch(path, opts = {}) {
  const r = await fetch(`${API}${path}`, { headers, ...opts })
  if (r.status === 429) {
    const d = await r.json().catch(() => ({}))
    await sleep((d.retry_after || 1) * 1000 + 300)
    return discordFetch(path, opts)
  }
  return r
}

async function discordGet(path) {
  const r = await discordFetch(path)
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`)
  return r.json()
}

async function discordPost(path, body) {
  const r = await discordFetch(path, {
    method: 'POST',
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`POST ${path} → ${r.status}: ${t.slice(0, 100)}`)
  }
  return r.json()
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Channel routing ──────────────────────────────────────────────────────────
const CHANNEL_ROUTES = [
  { match: /^(andy-chat|nexus-hub|general|accueil|chat)$/i,  agent: 'andy' },
  { match: /^(crypto|bitcoin|trading|defi)$/i,               agent: 'trading' },
  { match: /^(market-scanner|scanner|marchés?)$/i,           agent: 'trading' },
  { match: /^(portfolio|positions?|p&l)$/i,                  agent: 'andy' },
  { match: /^(brain|ia-autonomous?|autonome)$/i,             agent: 'brain' },
  { match: /^(admin-tasks?|admin)$/i,                        agent: 'admin', adminOnly: true },
]

// Channels to skip — bot output only
const SKIP_CHANNELS = new Set([
  'app-pulse', 'code-review', 'ui-review', 'admin-logs',
  'annonces', 'logs', 'bot-logs', 'server-logs',
])

function routeChannel(name) {
  for (const r of CHANNEL_ROUTES) if (r.match.test(name)) return r
  return { agent: 'andy' }
}

function isAdmin(userId) { return ADMIN_IDS.has(userId) }

// ─── Message mode parsing ─────────────────────────────────────────────────────
function parseMode(text) {
  if (/^!think\s+/i.test(text))  return { mode: 'think',  content: text.replace(/^!think\s+/i, '') }
  if (/^!web\s+/i.test(text))    return { mode: 'web',    content: text.replace(/^!web\s+/i, '') }
  if (/^!search\s+/i.test(text)) return { mode: 'web',    content: text.replace(/^!search\s+/i, '') }
  return { mode: 'default', content: text }
}

// ─── Admin commands ───────────────────────────────────────────────────────────
async function handleAdmin(text, userId) {
  if (!isAdmin(userId)) return null
  const lower = text.toLowerCase().trim()

  if (lower.startsWith('!task ')) {
    const desc = text.slice(6).trim()
    await fetch(`${APP_URL}/api/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'admin_task', status: 'pending', source: 'discord-admin', description: desc, createdAt: new Date().toISOString() }),
    }).catch(() => {})
    return `✅ **Tâche créée**: ${desc}\nL'IA la prend en compte au prochain cycle.`
  }

  if (lower.startsWith('!run ')) {
    const focus = lower.slice(5).trim()
    const valid = ['bugs', 'performance', 'ui', 'agents', 'brain', 'discord', 'security', 'full']
    if (!valid.includes(focus)) return `❌ Focus invalide. Options: ${valid.join(', ')}`
    fetch(`${APP_URL}/api/self-improve?focus=${focus}`, { signal: AbortSignal.timeout(5000) }).catch(() => {})
    return `🔄 Cycle d'amélioration lancé (focus: **${focus}**). Check #app-pulse dans 1-2 min.`
  }

  if (lower === '!status') {
    const up = Math.floor(process.uptime())
    const mins = Math.floor(up / 60), secs = up % 60
    return [
      `**🟢 Trackr Bot — Statut**`,
      `• Bot: online depuis ${mins}m${secs}s`,
      `• Channels surveillés: ${[...monitoredChannels.values()].map(c => '#' + c.name).join(', ') || 'chargement...'}`,
      `• App URL: ${APP_URL}`,
      `• Admins: ${[...ADMIN_IDS].join(', ')}`,
    ].join('\n')
  }

  if (lower === '!monitor') {
    fetch(`${APP_URL}/api/monitor?force=true`, { signal: AbortSignal.timeout(8000) }).catch(() => {})
    return `📡 Monitor lancé. Résultats dans #app-pulse dans quelques secondes.`
  }

  if (lower === '!help') {
    return [
      '**🔐 Commandes Admin**',
      '`!task <desc>` — Créer une tâche pour l\'IA',
      '`!run <focus>` — Lancer auto-amélioration (bugs/performance/ui/agents/brain/discord/security/full)',
      '`!status` — Statut du bot',
      '`!monitor` — Lancer le monitoring maintenant',
      '',
      '**💬 Modes (tous les channels)**',
      '`!think <question>` — Réflexion approfondie',
      '`!web <question>` — Recherche d\'infos récentes',
      '',
      'Sinon parle normalement — AnDy répond à TOUT (questions de vie, finance, tech, random...)',
    ].join('\n')
  }

  return null
}

// ─── Call AnDy (SSE stream) ───────────────────────────────────────────────────
async function callAnDy(message, channelName = '', mode = 'default') {
  const systemNotes = {
    default: `Tu es AnDy, l'IA personnelle d'Andrea sur Discord (channel: #${channelName || 'discord'}). Tu réponds à TOUT — vie quotidienne, questions random, vérifications en live, finance, tech, ou n'importe quoi d'autre. Sois direct et utile. Réponds en français sauf si on te parle en anglais.`,
    think:   `Tu es AnDy en MODE THINKING. Raisonne étape par étape de façon exhaustive. Montre ton raisonnement complet avant de conclure.`,
    web:     `Tu es AnDy en MODE RECHERCHE. L'utilisateur veut des infos récentes. Utilise tes connaissances les plus récentes, précise clairement si l'info pourrait être dépassée.`,
  }

  try {
    const res = await fetch(`${APP_URL}/api/andy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: message }],
        portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [],
        systemNote: systemNotes[mode] || systemNotes.default,
      }),
      signal: AbortSignal.timeout(mode === 'think' ? 90000 : 55000),
    })

    if (!res.ok) return `❌ Erreur AnDy (${res.status})`

    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = '', fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n'); buf = lines.pop()
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try { const ev = JSON.parse(line.slice(6)); if (ev.type === 'token') fullText += ev.text } catch {}
      }
    }

    return fullText.replace(/\[CHART:[^\]]+\]/g, '').trim().slice(0, 1990) || null
  } catch (e) {
    if (e.name === 'TimeoutError') return '⏱️ Timeout — AnDy prend trop de temps. Réessaie.'
    console.error('callAnDy:', e.message)
    return null
  }
}

// ─── Call trading expert ──────────────────────────────────────────────────────
async function callTrading(message) {
  try {
    const res = await fetch(`${APP_URL}/api/trading-expert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
      signal: AbortSignal.timeout(30000),
    })
    if (res.ok) {
      const d = await res.json()
      return (d.response || d.message || '').slice(0, 1990) || null
    }
  } catch {}
  return callAnDy(message, 'trading')
}

// ─── Discord helpers ──────────────────────────────────────────────────────────
async function sendTyping(channelId) {
  try { await discordPost(`/channels/${channelId}/typing`, {}) } catch {}
}

async function sendReply(channelId, messageId, text) {
  const chunks = []
  let remaining = text
  while (remaining.length > 0) { chunks.push(remaining.slice(0, 1990)); remaining = remaining.slice(1990) }

  for (let i = 0; i < chunks.length; i++) {
    try {
      await discordPost(`/channels/${channelId}/messages`, {
        content: chunks[i],
        message_reference: i === 0 ? { message_id: messageId, channel_id: channelId } : undefined,
        allowed_mentions: { replied_user: true },
      })
    } catch (e) { console.error('sendReply:', e.message) }
    if (i < chunks.length - 1) await sleep(600)
  }
}

// ─── Process a message ───────────────────────────────────────────────────────
const processed = new Set()

async function processMessage(msg, channelName) {
  if (processed.has(msg.id)) return
  processed.add(msg.id)
  setTimeout(() => processed.delete(msg.id), 120000)

  if (msg.author?.bot) return
  const content = msg.content?.trim() || ''
  if (content.length < 2) return

  if (SKIP_CHANNELS.has(channelName.toLowerCase())) return

  const route = routeChannel(channelName)
  if (route.adminOnly && !isAdmin(msg.author?.id)) {
    await sendReply(msg.channel_id, msg.id, '🔐 Canal réservé à l\'administrateur.')
    return
  }

  // Admin commands
  if (content.startsWith('!') && isAdmin(msg.author?.id)) {
    const adminReply = await handleAdmin(content, msg.author?.id)
    if (adminReply) { await sendReply(msg.channel_id, msg.id, adminReply); return }
  }

  const { mode, content: cleanContent } = parseMode(content)

  // Skip very short non-command messages
  if (cleanContent.length < 4 && mode === 'default') return

  console.log(`💬 [#${channelName}] ${msg.author?.username}: ${cleanContent.slice(0, 80)}`)

  await sendTyping(msg.channel_id)
  const typingInterval = setInterval(() => sendTyping(msg.channel_id), 8000)

  try {
    let reply = null

    if (route.agent === 'trading' && mode === 'default') {
      reply = await callTrading(cleanContent)
    } else {
      reply = await callAnDy(cleanContent, channelName, mode)
    }

    if (mode === 'think' && reply) reply = `🧠 **Thinking Mode**\n\n${reply}`
    if (mode === 'web'   && reply) reply = `🌐 **Web Search Mode**\n\n${reply}`

    if (reply) {
      await sendReply(msg.channel_id, msg.id, reply)
      console.log(`✅ Replied (${mode})`)
    } else {
      await sendReply(msg.channel_id, msg.id, '❌ Pas de réponse. Réessaie dans quelques secondes.')
    }
  } finally {
    clearInterval(typingInterval)
  }
}

// ─── Channel discovery ────────────────────────────────────────────────────────
const monitoredChannels = new Map()  // channelId → { id, name }
const lastSeen = new Map()           // channelId → lastMessageId

async function discoverChannels() {
  try {
    // Get guild info for owner ID
    const guild = await discordGet(`/guilds/${GUILD_ID}`)
    if (guild.owner_id) {
      ADMIN_IDS.add(guild.owner_id)
      console.log(`👑 Guild owner = ${guild.owner_id} (auto-admin)`)
    }

    // Get all channels
    const channels = await discordGet(`/guilds/${GUILD_ID}/channels`)
    // Only text channels (type 0)
    const textChannels = channels.filter(c => c.type === 0)

    monitoredChannels.clear()
    for (const ch of textChannels) {
      if (!SKIP_CHANNELS.has(ch.name)) {
        monitoredChannels.set(ch.id, { id: ch.id, name: ch.name })
      }
    }

    console.log(`📡 Monitoring ${monitoredChannels.size} channels: ${[...monitoredChannels.values()].map(c => '#' + c.name).join(', ')}`)
  } catch (e) {
    console.error('❌ discoverChannels:', e.message)
  }
}

async function initLastSeen() {
  for (const ch of monitoredChannels.values()) {
    try {
      const msgs = await discordGet(`/channels/${ch.id}/messages?limit=1`)
      if (msgs.length > 0) lastSeen.set(ch.id, msgs[0].id)
    } catch {}
    await sleep(100)  // gentle rate limit
  }
  console.log('✅ Initialized — watching for messages...')
}

// ─── Poll all channels ────────────────────────────────────────────────────────
let polling = false

async function pollAll() {
  if (polling) return
  polling = true
  try {
    for (const ch of monitoredChannels.values()) {
      try {
        const after = lastSeen.get(ch.id)
        const url = `/channels/${ch.id}/messages?limit=5${after ? `&after=${after}` : ''}`
        const msgs = await discordGet(url)
        const newMsgs = msgs.reverse().filter(m => !m.author?.bot && m.content?.trim().length >= 2)

        for (const msg of newMsgs) {
          lastSeen.set(ch.id, msg.id)
          processMessage(msg, ch.name).catch(e => console.error('processMessage:', e.message))
        }
      } catch (e) {
        if (!e.message.includes('50013') && !e.message.includes('403'))
          console.error(`❌ poll #${ch.name}:`, e.message)
      }
      await sleep(50)
    }
  } finally {
    polling = false
  }
}

// ─── Cron trigger ────────────────────────────────────────────────────────────
async function runCron() {
  try {
    const r = await fetch(`${APP_URL}/api/discord-cron`, {
      headers: { 'User-Agent': 'TrackrAndyBot/3.0' },
      signal: AbortSignal.timeout(30000),
    })
    console.log('🤖 Cron:', r.status)
  } catch (e) { console.error('❌ Cron:', e.message) }
}

// ─── HTTP health server ───────────────────────────────────────────────────────
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'online',
    channels: monitoredChannels.size,
    admins: [...ADMIN_IDS],
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }))
})
server.listen(PORT, () => console.log(`🌐 Health server on :${PORT}`))

// ─── Startup ──────────────────────────────────────────────────────────────────
console.log(`🧠 AnDy Discord Bot v3.0 (REST polling mode)`)
console.log(`🌐 App: ${APP_URL}`)

await discoverChannels()
await initLastSeen()

// Kick off cron
runCron()

// Poll every 5 seconds
setInterval(pollAll, 5000)

// Re-discover channels every 10 minutes (picks up new channels)
setInterval(discoverChannels, 10 * 60 * 1000)

// Cron every 15 minutes
setInterval(runCron, 15 * 60 * 1000)

process.on('SIGTERM', () => { server.close(); process.exit(0) })
process.on('SIGINT',  () => { server.close(); process.exit(0) })
