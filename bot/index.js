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

// ─── Intent detection ─────────────────────────────────────────────────────────
// Returns: 'task' | 'develop' | 'lost' | 'question' | 'chat'
function detectIntent(text) {
  const t = text.toLowerCase()

  // Task creation intent
  if (/^!task\b/.test(t)) return 'task_cmd'

  // "I want to build / develop / add X"
  if (/\b(je veux|j'aimerais|fais moi|développe|crée|ajoute|implémente|build|make me|create)\b.{0,60}\b(une? |le |la |des |un )/i.test(text) ||
      /\b(je veux qu[e']?|je voudrais que)\b/i.test(text)) return 'develop'

  // Lost / confused / need help navigating
  if (/\b(perdu|sais pas|pas sûr|aide|comment faire|par où|où est|guide|quoi faire|help me|i('m| am) lost)\b/i.test(t) ||
      t.length < 20 && /\?$/.test(t.trim()) && !/[\w]{4,}/.test(t)) return 'lost'

  // Explicit question
  if (/\?/.test(text) || /^(c'?est quoi|comment|pourquoi|quand|qui|quel|quelle|combien|est-ce|what|how|why|when|who)/i.test(t)) return 'question'

  return 'chat'
}

// ─── Channel guide ────────────────────────────────────────────────────────────
const CHANNEL_GUIDE = [
  { channels: ['andy-chat', 'nexus-hub'], desc: '🧠 Chat général avec AnDy — questions, conseils, idées' },
  { channels: ['crypto', 'trading', 'market-scanner'], desc: '📊 Crypto & marchés — prix, analyses, signaux' },
  { channels: ['portfolio-watch'], desc: '💼 Suivi de ton portfolio stocks & crypto' },
  { channels: ['brain-cycles'], desc: '🤖 Activité de l\'IA autonome — cycles, améliorations' },
  { channels: ['reports'], desc: '📋 Rapports quotidiens & hebdo générés par l\'IA' },
  { channels: ['admin-tasks'], desc: '🔐 Tâches de développement (admin seulement)' },
  { channels: ['agent-forge'], desc: '⚡ Création et activité des agents IA' },
  { channels: ['bugs', 'performance'], desc: '🐛 Suivi des problèmes détectés et corrigés' },
]

function getGuideText(currentChannel = '') {
  const lines = [
    `**🗺️ Guide des channels Trackr**`,
    `Tu es dans **#${currentChannel}**. Voici où aller selon ce que tu veux faire:`,
    '',
  ]
  for (const { channels, desc } of CHANNEL_GUIDE) {
    lines.push(`**#${channels[0]}** ${channels.length > 1 ? `(ou #${channels.slice(1).join(', #')})` : ''}`)
    lines.push(`  ${desc}`)
  }
  lines.push('')
  lines.push(`**💡 Tu peux aussi rester ici et me parler directement.**`)
  lines.push(`Dis-moi ce que tu veux faire et je m'occupe du reste.`)
  return lines.join('\n')
}

// ─── Auto task creation from natural language ────────────────────────────────
async function createTaskFromText(text, username) {
  // Clean up the text to extract the core task
  const taskDesc = text
    .replace(/^(je veux|j'aimerais|fais|développe|crée|ajoute|implémente)\s+/i, '')
    .replace(/^(que tu|que l'ia|à l'ia)\s+/i, '')
    .trim()

  await fetch(`${APP_URL}/api/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'admin_task',
      status: 'pending',
      source: `discord-${username}`,
      description: taskDesc,
      originalMessage: text,
      createdAt: new Date().toISOString(),
    }),
  }).catch(() => {})

  return taskDesc
}

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

  if (lower === '!guide') {
    return getGuideText()
  }

  if (lower === '!help') {
    return [
      '**🔐 Commandes Admin**',
      '`!task <desc>` — Créer une tâche pour l\'IA',
      '`!run <focus>` — Lancer auto-amélioration (bugs/performance/ui/agents/brain/discord/security/realestate/business/full)',
      '`!status` — Statut du bot',
      '`!monitor` — Lancer le monitoring maintenant',
      '`!guide` — Voir le guide des channels',
      '',
      '**💬 Modes (tous les channels)**',
      '`!think <question>` — Réflexion approfondie (Claude extended thinking)',
      '`!web <question>` — Mode recherche, infos récentes',
      '',
      '**✨ Création naturelle (parle normalement)**',
      '"Je veux développer X" → crée une tâche + AnDy répond',
      '"Je suis perdu" → guide des channels',
      'N\'importe quoi d\'autre → AnDy répond directement',
    ].join('\n')
  }

  return null
}

// ─── Call fast /api/chat (Claude Haiku JSON — 2-4s) ──────────────────────────
async function callChat(message, channelName = '', mode = 'default', systemNote = null) {
  try {
    const res = await fetch(`${APP_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, channelName, mode, systemNote }),
      signal: AbortSignal.timeout(mode === 'think' ? 58000 : 12000),
    })
    if (!res.ok) {
      console.error(`callChat HTTP ${res.status}`)
      return `❌ Erreur (${res.status}) — réessaie.`
    }
    const d = await res.json()
    return d.reply?.trim() || null
  } catch (e) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError')
      return '⏱️ Timeout — essaie `!think` pour les questions complexes.'
    console.error('callChat:', e.message)
    return null
  }
}

// ─── Legacy AnDy SSE fallback (think mode only) ───────────────────────────────
async function callAnDy(message, channelName = '', mode = 'default', customSystemNote = null) {
  // Use fast /api/chat for everything now
  return callChat(message, channelName, mode, customSystemNote)
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
  return callChat(message, 'trading')
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

// ─── Edit a message ───────────────────────────────────────────────────────────
async function editMessage(channelId, messageId, content) {
  try {
    await discordFetch(`/channels/${channelId}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content: content.slice(0, 1990) }),
    })
  } catch (e) { console.error('editMessage:', e.message) }
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

  // Extract user info early — this was the critical missing piece
  const userId   = msg.author?.id || ''
  const username = msg.author?.username || 'user'

  if (SKIP_CHANNELS.has(channelName.toLowerCase())) return

  const route = routeChannel(channelName)
  if (route.adminOnly && !isAdmin(userId)) {
    await sendReply(msg.channel_id, msg.id, '🔐 Canal réservé à l\'administrateur.')
    return
  }

  // ── 1. Admin commands (!task, !run, !status, !guide, !help) ─────────────────
  if (content.startsWith('!') && isAdmin(userId)) {
    const adminReply = await handleAdmin(content, userId)
    if (adminReply) { await sendReply(msg.channel_id, msg.id, adminReply); return }
  }

  // ── 2. Mode prefixes (!think, !web, !search) ──────────────────────────────
  const { mode, content: cleanContent } = parseMode(content)
  if (cleanContent.length < 4 && mode === 'default') return

  console.log(`💬 [#${channelName}] ${username}: ${cleanContent.slice(0, 80)}`)

  // ── 3. Intent detection ───────────────────────────────────────────────────
  const intent = mode === 'default' ? detectIntent(cleanContent) : 'chat'

  // Lost/confused → guide + offer to help
  if (intent === 'lost') {
    const guideReply = [
      getGuideText(channelName),
      '',
      `> Dis-moi ce que tu veux faire et je m'en occupe directement.`,
    ].join('\n')
    await sendReply(msg.channel_id, msg.id, guideReply.slice(0, 1990))
    return
  }

  // "Je veux développer X" → auto-create task + AnDy explains next steps
  if (intent === 'develop' && isAdmin(userId)) {
    const taskDesc = await createTaskFromText(cleanContent, username)
    // Post immediate placeholder
    let placeholder
    try {
      placeholder = await discordPost(`/channels/${msg.channel_id}/messages`, {
        content: `✅ **Tâche créée**: ${taskDesc}\n> 🧠 AnDy prépare les prochaines étapes...`,
        message_reference: { message_id: msg.id, channel_id: msg.channel_id },
        allowed_mentions: { replied_user: true },
      })
    } catch {}

    const systemNote = `Tu es AnDy, l'IA de développement d'Andrea. Une tâche vient d'être créée.
Réponds en 2 parties COURTES:
1. ✅ Confirme la demande (1 phrase)
2. 📋 2-3 prochaines étapes concrètes (bullets)
Max 150 mots.`

    const andyReply = await callChat(cleanContent, channelName, 'default', systemNote)
    const fullReply = [
      `✅ **Tâche créée**: ${taskDesc}`,
      `> Prise en compte au prochain cycle IA.`,
      '',
      andyReply || '',
    ].filter(Boolean).join('\n')

    if (placeholder?.id) {
      await editMessage(msg.channel_id, placeholder.id, fullReply)
    } else {
      await sendReply(msg.channel_id, msg.id, fullReply.slice(0, 1990))
    }
    console.log(`✅ [develop] Task created + replied`)
    return
  }

  // ── 4. Regular message → immediate placeholder + fast reply ──────────────
  const thinking = mode === 'think' ? '🧠 **Thinking...**'
                 : mode === 'web'   ? '🌐 **Searching...**'
                 : '...'

  // Post immediate placeholder so user sees something within <1s
  let placeholder
  try {
    placeholder = await discordPost(`/channels/${msg.channel_id}/messages`, {
      content: thinking,
      message_reference: { message_id: msg.id, channel_id: msg.channel_id },
      allowed_mentions: { replied_user: true },
    })
  } catch (e) { console.error('placeholder:', e.message) }

  try {
    let reply = null

    if (route.agent === 'trading' && mode === 'default') {
      reply = await callTrading(cleanContent)
    } else {
      reply = await callChat(cleanContent, channelName, mode)
    }

    if (mode === 'think' && reply) reply = `🧠 **Thinking Mode**\n\n${reply}`
    if (mode === 'web'   && reply) reply = `🌐 **Web Mode**\n\n${reply}`

    const finalReply = reply || `❌ Pas de réponse. Réessaie ou tape \`!help\`.`

    if (placeholder?.id) {
      await editMessage(msg.channel_id, placeholder.id, finalReply)
    } else {
      await sendReply(msg.channel_id, msg.id, finalReply)
    }
    console.log(`✅ Replied (${mode}/${intent}) to ${username}`)
  } catch (e) {
    console.error('processMessage reply:', e.message)
    if (placeholder?.id) {
      await editMessage(msg.channel_id, placeholder.id, `❌ Erreur: ${e.message.slice(0, 100)}`)
    }
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

// Monitor every 5 minutes (replaces Vercel cron which requires Pro plan)
async function runMonitor() {
  try {
    await fetch(`${APP_URL}/api/monitor?silent=true`, {
      headers: { 'User-Agent': 'TrackrAndyBot/3.0' },
      signal: AbortSignal.timeout(15000),
    })
  } catch {}
}
setInterval(runMonitor, 5 * 60 * 1000)

process.on('SIGTERM', () => { server.close(); process.exit(0) })
process.on('SIGINT',  () => { server.close(); process.exit(0) })
