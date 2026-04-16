// ─── Trackr AnDy — Discord Gateway Bot ────────────────────────────────────────
// Listens to ALL channels via Discord Gateway (WebSocket)
// Natural chat — no slash commands needed
// Routes messages to the right Vercel API agent per channel

import WebSocket from 'ws'
import http from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: `${__dir}/.env` })

const BOT_TOKEN  = process.env.DISCORD_BOT_TOKEN
const GUILD_ID   = process.env.DISCORD_GUILD_ID
const APP_URL    = process.env.APP_URL || process.env.VERCEL_URL || 'https://trackr-app-nu.vercel.app'
const PORT       = process.env.PORT || 3001
const API        = 'https://discord.com/api/v10'

if (!BOT_TOKEN || !GUILD_ID) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID')
  process.exit(1)
}

// Admin IDs — auto-populated at startup from guild owner + optional env override
const ADMIN_IDS = new Set(
  (process.env.DISCORD_ADMIN_USER_IDS || process.env.DISCORD_ADMIN_USER_ID || '').split(',').filter(Boolean)
)

// ─── Discord REST helpers ─────────────────────────────────────────────────────
const headers = {
  Authorization: `Bot ${BOT_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'TrackrAndyBot/3.0',
}

async function discordGet(path) {
  const r = await fetch(`${API}${path}`, { headers })
  if (r.status === 429) {
    const d = await r.json()
    await sleep((d.retry_after || 1) * 1000 + 200)
    return discordGet(path)
  }
  if (!r.ok) throw new Error(`Discord GET ${path} → ${r.status}`)
  return r.json()
}

async function discordPost(path, body) {
  const r = await fetch(`${API}${path}`, { method: 'POST', headers, body: JSON.stringify(body) })
  if (r.status === 429) {
    const d = await r.json()
    await sleep((d.retry_after || 1) * 1000 + 200)
    return discordPost(path, body)
  }
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Discord POST ${path} → ${r.status}: ${t}`)
  }
  return r.json()
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Channel routing config ───────────────────────────────────────────────────
// Maps channel-name patterns to the Vercel API endpoint + context to call
const CHANNEL_ROUTES = [
  { match: /^(andy-chat|nexus-hub|general|accueil)$/i,   agent: 'andy',   label: '🧠 AnDy' },
  { match: /^(crypto|bitcoin|trading)$/i,                agent: 'trading', label: '📊 Trading' },
  { match: /^(market-scanner|scanner|marchés?)$/i,       agent: 'trading', label: '📡 Scanner' },
  { match: /^(price-alerts|alerts?|alertes?)$/i,         agent: 'andy',   label: '🔔 Alertes' },
  { match: /^(portfolio|positions?|p&l)$/i,              agent: 'andy',   label: '💼 Portfolio' },
  { match: /^(reports?|rapports?)$/i,                    agent: 'andy',   label: '📋 Rapports' },
  { match: /^(brain|ia-autonomous?|autonome)$/i,         agent: 'brain',  label: '🤖 Brain' },
  { match: /^(admin-tasks?|admin)$/i,                    agent: 'admin',  adminOnly: true, label: '🔐 Admin' },
]

// Channels to completely ignore (read-only, bot output channels)
const IGNORE_CHANNELS = new Set([
  'app-pulse', 'code-review', 'ui-review', 'admin-logs',
  'annonces', 'logs', 'bot-logs',
])

// ─── Identify bot self ────────────────────────────────────────────────────────
let botUserId = null

// ─── Mode flags ──────────────────────────────────────────────────────────────
// Parsed from message prefixes: !think, !web, !search
function parseMode(text) {
  if (/^!think\s+/i.test(text))  return { mode: 'think',  content: text.replace(/^!think\s+/i, '') }
  if (/^!web\s+/i.test(text))    return { mode: 'web',    content: text.replace(/^!web\s+/i, '') }
  if (/^!search\s+/i.test(text)) return { mode: 'web',    content: text.replace(/^!search\s+/i, '') }
  return { mode: 'default', content: text }
}

// ─── Call AnDy API (SSE streaming) ───────────────────────────────────────────
async function callAnDy(userMessage, channelCtx = '', mode = 'default') {
  try {
    const systemNotes = {
      default: channelCtx
        ? `Tu réponds dans Discord #${channelCtx}. Tu es AnDy, l'IA personnelle d'Andrea. Tu réponds à TOUT — questions de vie quotidienne, vérifications en live, questions random, finance, tech, ou n'importe quoi d'autre. Sois direct et utile.`
        : `Tu es AnDy, l'IA personnelle d'Andrea sur Discord. Tu réponds à toutes les questions — vie quotidienne, random, finance, tech, etc. Sois direct et utile.`,
      think: `Tu es AnDy en MODE THINKING PROFOND. Analyse la question de façon exhaustive, étape par étape. Raisonne comme si tu avais un temps illimité. Montre ton raisonnement. Question: `,
      web: `Tu es AnDy en MODE RECHERCHE LIVE. L'utilisateur veut des infos récentes/en direct. Utilise tes connaissances les plus récentes et dis clairement si l'info pourrait être dépassée. Question: `,
    }

    const systemNote = mode === 'think' || mode === 'web'
      ? systemNotes[mode] + userMessage
      : systemNotes.default

    const timeout = mode === 'think' ? 90000 : 55000

    const res = await fetch(`${APP_URL}/api/andy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: mode === 'default' ? userMessage : `[${mode.toUpperCase()} MODE] ${userMessage}` }],
        portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [],
        systemNote,
        thinkingMode: mode === 'think',
      }),
      signal: AbortSignal.timeout(timeout),
    })

    if (!res.ok) return `❌ Erreur API AnDy (${res.status})`

    // Read SSE stream
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = '', fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const ev = JSON.parse(line.slice(6))
          if (ev.type === 'token') fullText += ev.text
        } catch {}
      }
    }

    return fullText.replace(/\[CHART:[^\]]+\]/g, '').trim().slice(0, 1990) || null
  } catch (e) {
    if (e.name === 'TimeoutError') return '⏱️ Timeout — AnDy met trop de temps. Réessaie.'
    console.error('callAnDy error:', e.message)
    return null
  }
}

// ─── Call trading expert ──────────────────────────────────────────────────────
async function callTrading(userMessage) {
  try {
    const res = await fetch(`${APP_URL}/api/trading-expert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: userMessage }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) return callAnDy(userMessage, 'trading')
    const d = await res.json()
    return (d.response || d.message || '').slice(0, 1990) || null
  } catch {
    return callAnDy(userMessage, 'trading')
  }
}

// ─── Admin command handler ────────────────────────────────────────────────────
// Admin can type: !task fix the auth bug
//                 !run bugs
//                 !status
async function handleAdminCommand(text, userId) {
  if (!isAdmin(userId)) return null

  const lower = text.toLowerCase().trim()

  if (lower.startsWith('!task ')) {
    const taskDesc = text.slice(6).trim()
    await fetch(`${APP_URL}/api/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'admin_task', status: 'pending', source: 'discord-admin',
        description: taskDesc, createdAt: new Date().toISOString(),
      }),
    })
    return `✅ **Tâche créée**: ${taskDesc}\nL'IA va la prendre en compte au prochain cycle d'auto-amélioration.`
  }

  if (lower.startsWith('!run ')) {
    const focus = lower.slice(5).trim()
    const validFoci = ['bugs', 'performance', 'ui', 'agents', 'brain', 'discord', 'full']
    if (!validFoci.includes(focus)) {
      return `❌ Focus invalide. Options: ${validFoci.join(', ')}`
    }
    // Fire and forget — too slow to await
    fetch(`${APP_URL}/api/self-improve?focus=${focus}`, { signal: AbortSignal.timeout(5000) }).catch(() => {})
    return `🔄 Cycle d'amélioration lancé (focus: **${focus}**).\nVérifie #admin-logs dans 1-2 min.`
  }

  if (lower === '!status') {
    try {
      const r = await fetch(`${APP_URL}/api/reports?type=status`, { signal: AbortSignal.timeout(10000) })
      const d = await r.json()
      const lines = [
        `**🟢 Statut Système — Trackr**`,
        `• Uptime: ${d.uptime || 'N/A'}`,
        `• AnDy: ${d.andy || '✅'}`,
        `• Agents actifs: ${d.agents || 'N/A'}`,
        `• Dernier cycle IA: ${d.lastImprove || 'N/A'}`,
      ]
      return lines.join('\n')
    } catch {
      return `**🟢 Bot Discord** online — impossible de récupérer le statut Vercel.`
    }
  }

  if (lower === '!help') {
    return [
      '**🔐 Commandes Admin**',
      '`!task <description>` — Créer une tâche pour l\'IA',
      '`!run <focus>` — Lancer un cycle d\'amélioration (bugs/performance/ui/agents/brain/discord/full)',
      '`!status` — Voir le statut système',
      '`!help` — Cette aide',
      '',
      '**💬 Modes de conversation (tous les channels)**',
      '`!think <question>` — Mode réflexion profonde (raisonnement complet)',
      '`!web <question>` — Mode recherche live (infos récentes)',
      '',
      'Pour tout le reste, parle normalement — AnDy répond à TOUT, même des questions random de la vie quotidienne.',
    ].join('\n')
  }

  return null
}

function isAdmin(userId) {
  if (!userId) return false
  return ADMIN_IDS.has(userId)
}

// ─── Route message to the right agent ────────────────────────────────────────
function routeChannel(channelName) {
  for (const route of CHANNEL_ROUTES) {
    if (route.match.test(channelName)) return route
  }
  return { agent: 'andy', label: '🧠 AnDy' }  // Default: AnDy handles everything
}

// ─── Send typing indicator ────────────────────────────────────────────────────
async function sendTyping(channelId) {
  try { await discordPost(`/channels/${channelId}/typing`, {}) } catch {}
}

// ─── Send reply (split if needed) ────────────────────────────────────────────
async function sendReply(channelId, messageId, text) {
  const chunks = []
  let remaining = text
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, 1990))
    remaining = remaining.slice(1990)
  }

  for (let i = 0; i < chunks.length; i++) {
    const body = {
      content: chunks[i],
      message_reference: i === 0 ? { message_id: messageId, channel_id: channelId } : undefined,
      allowed_mentions: { replied_user: true },
    }
    try {
      await discordPost(`/channels/${channelId}/messages`, body)
    } catch (e) {
      console.error('sendReply error:', e.message)
    }
    if (i < chunks.length - 1) await sleep(500)
  }
}

// ─── Process an incoming message ─────────────────────────────────────────────
const processingSet = new Set()  // Debounce: don't process same message twice

async function processMessage(msg) {
  if (processingSet.has(msg.id)) return
  processingSet.add(msg.id)
  setTimeout(() => processingSet.delete(msg.id), 60000)

  const channelName = msg._channelName || ''
  const content = msg.content?.trim() || ''
  const userId = msg.author?.id
  const username = msg.author?.username || 'Utilisateur'

  // Skip bots and empty messages
  if (msg.author?.bot) return
  if (content.length < 2) return

  // Skip ignored channels
  if (IGNORE_CHANNELS.has(channelName.toLowerCase())) return

  // Get route
  const route = routeChannel(channelName)

  // Check if admin-only channel and user is not admin
  if (route.adminOnly && !isAdmin(userId)) {
    await sendReply(msg.channel_id, msg.id, '🔐 Canal réservé à l\'administrateur.')
    return
  }

  console.log(`💬 [#${channelName}] ${username}: ${content.slice(0, 80)}`)

  // Check for admin commands first
  if (content.startsWith('!') && isAdmin(userId)) {
    const adminReply = await handleAdminCommand(content, userId)
    if (adminReply) {
      await sendReply(msg.channel_id, msg.id, adminReply)
      return
    }
  }

  // Parse mode prefix (!think, !web, !search)
  const { mode, content: cleanContent } = parseMode(content)

  // Ignore very short messages unless they mention the bot or use a mode prefix
  const mentionsBot = msg.mentions?.some?.(u => u.id === botUserId)
  const isMentioned = mentionsBot || content.toLowerCase().includes('andy')
  if (cleanContent.length < 4 && !isMentioned && mode === 'default') return

  // Show typing while processing
  await sendTyping(msg.channel_id)

  // Keep typing alive for long operations (thinking mode can take 60s+)
  const typingInterval = setInterval(() => sendTyping(msg.channel_id), 8000)

  try {
    let reply = null

    if (route.agent === 'trading' && mode === 'default') {
      reply = await callTrading(cleanContent)
    } else {
      reply = await callAnDy(cleanContent, channelName, mode)
    }

    // Add mode indicator for special modes
    if (reply && mode === 'think') reply = `🧠 **Thinking Mode**\n\n${reply}`
    if (reply && mode === 'web')   reply = `🌐 **Web Search Mode**\n\n${reply}`

    if (reply) {
      await sendReply(msg.channel_id, msg.id, reply)
      console.log(`✅ [${route.label}${mode !== 'default' ? '/' + mode : ''}] Replied to ${username}`)
    } else {
      await sendReply(msg.channel_id, msg.id,
        '❌ Je n\'ai pas pu générer de réponse. Réessaie dans quelques secondes.')
    }
  } finally {
    clearInterval(typingInterval)
  }
}

// ─── Build a channel name map ─────────────────────────────────────────────────
const channelNameMap = new Map()  // channelId → name

async function loadChannels() {
  try {
    // Load guild info — get owner_id automatically
    const guild = await discordGet(`/guilds/${GUILD_ID}`)
    if (guild.owner_id) {
      ADMIN_IDS.add(guild.owner_id)
      console.log(`👑 Guild owner auto-set as admin: ${guild.owner_id}`)
    }

    // Load channels
    const channels = await discordGet(`/guilds/${GUILD_ID}/channels`)
    for (const ch of channels) {
      channelNameMap.set(ch.id, ch.name || '')
    }
    console.log(`📡 Loaded ${channelNameMap.size} channels | Admins: ${[...ADMIN_IDS].join(', ')}`)
  } catch (e) {
    console.error('❌ loadChannels:', e.message)
  }
}

// ─── Discord Gateway (WebSocket) ──────────────────────────────────────────────
let ws = null
let heartbeatInterval = null
let sequence = null
let sessionId = null
let resumeGatewayUrl = null
let reconnectTimer = null

function connectGateway() {
  const gatewayUrl = resumeGatewayUrl || 'wss://gateway.discord.gg/?v=10&encoding=json'
  console.log(`🔌 Connecting to Discord Gateway: ${gatewayUrl}`)

  ws = new WebSocket(gatewayUrl)

  ws.on('open', () => console.log('✅ Gateway connected'))

  ws.on('message', async (raw) => {
    let data
    try { data = JSON.parse(raw) } catch { return }

    const { op, d, s, t } = data
    if (s) sequence = s

    switch (op) {
      // Dispatch
      case 0:
        await handleDispatch(t, d)
        break

      // Hello — start heartbeating
      case 10: {
        const interval = d.heartbeat_interval
        if (heartbeatInterval) clearInterval(heartbeatInterval)
        heartbeatInterval = setInterval(() => {
          ws.send(JSON.stringify({ op: 1, d: sequence }))
        }, interval)
        // Identify or resume
        if (sessionId && sequence) {
          ws.send(JSON.stringify({
            op: 6,
            d: { token: BOT_TOKEN, session_id: sessionId, seq: sequence },
          }))
        } else {
          ws.send(JSON.stringify({
            op: 2,
            d: {
              token: BOT_TOKEN,
              intents: (1 << 9) | (1 << 15),  // GUILD_MESSAGES + MESSAGE_CONTENT
              properties: { os: 'linux', browser: 'trackr-bot', device: 'trackr-bot' },
            },
          }))
        }
        break
      }

      // Reconnect
      case 7:
        console.log('🔄 Gateway requested reconnect')
        reconnect()
        break

      // Invalid session
      case 9:
        console.log('⚠️ Invalid session, re-identifying')
        sessionId = null
        sequence = null
        setTimeout(() => reconnect(), 3000)
        break
    }
  })

  ws.on('close', (code) => {
    console.log(`🔴 Gateway closed: ${code}`)
    clearInterval(heartbeatInterval)
    if (code !== 4004 && code !== 4013 && code !== 4014) {
      scheduleReconnect(5000)
    } else {
      console.error('❌ Fatal Discord error — check bot token and intents')
      process.exit(1)
    }
  })

  ws.on('error', (e) => {
    console.error('⚠️ Gateway error:', e.message)
  })
}

async function handleDispatch(type, data) {
  switch (type) {
    case 'READY': {
      botUserId = data.user?.id
      sessionId = data.session_id
      resumeGatewayUrl = data.resume_gateway_url
      console.log(`✅ Bot ready: ${data.user?.username}#${data.user?.discriminator} (${botUserId})`)
      await loadChannels()
      // Also fire cron on startup
      setTimeout(runCron, 5000)
      break
    }

    case 'GUILD_CHANNEL_CREATE':
    case 'GUILD_CHANNEL_UPDATE':
      channelNameMap.set(data.id, data.name || '')
      break

    case 'GUILD_CHANNEL_DELETE':
      channelNameMap.delete(data.id)
      break

    case 'MESSAGE_CREATE': {
      const msg = data
      msg._channelName = channelNameMap.get(msg.channel_id) || ''
      // Don't await — process in background to not block gateway
      processMessage(msg).catch(e => console.error('processMessage error:', e.message))
      break
    }
  }
}

function reconnect() {
  if (ws) {
    ws.removeAllListeners()
    try { ws.close() } catch {}
    ws = null
  }
  clearInterval(heartbeatInterval)
  connectGateway()
}

function scheduleReconnect(delayMs) {
  clearTimeout(reconnectTimer)
  reconnectTimer = setTimeout(reconnect, delayMs)
}

// ─── Cron — call discord-cron every 15 min ───────────────────────────────────
async function runCron() {
  try {
    const r = await fetch(`${APP_URL}/api/discord-cron`, {
      headers: { 'User-Agent': 'TrackrAndyBot/3.0' },
      signal: AbortSignal.timeout(30000),
    })
    const d = await r.json()
    console.log('🤖 Cron done:', JSON.stringify(d).slice(0, 80))
  } catch (e) {
    console.error('❌ Cron failed:', e.message)
  }
}

// ─── HTTP health server ───────────────────────────────────────────────────────
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: ws?.readyState === 1 ? 'online' : 'reconnecting',
    bot: botUserId ? 'identified' : 'pending',
    channels: channelNameMap.size,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }))
})
server.listen(PORT, () => console.log(`🌐 Health server on :${PORT}`))

// ─── Startup ──────────────────────────────────────────────────────────────────
console.log('🧠 AnDy Discord Bot v3.0 starting (Gateway mode)...')
console.log(`🌐 App URL: ${APP_URL}`)
connectGateway()

// Cron every 15 minutes
setInterval(runCron, 15 * 60 * 1000)

process.on('SIGTERM', () => {
  if (ws) try { ws.close(1000) } catch {}
  server.close()
  process.exit(0)
})
process.on('SIGINT', () => {
  if (ws) try { ws.close(1000) } catch {}
  server.close()
  process.exit(0)
})
