// ─── Trackr AnDy — Discord Bot v4.0 ──────────────────────────────────────────
// Direct Claude streaming — zero Vercel cold start
// REST polling with auto-skip of inaccessible channels
// One response at a time per channel, instant placeholder + live streaming

import http from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readFileSync } from 'fs'

const __dir = dirname(fileURLToPath(import.meta.url))

// Parse .env manually — avoids dotenvx quote/encoding issues
try {
  const raw = readFileSync(`${__dir}/.env`, 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) {
      // Always override from .env — ensures stale PM2 cache doesn't win
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').replace(/[\r\n\\]+$/, '').trim()
    }
  }
} catch {}

const BOT_TOKEN     = process.env.DISCORD_BOT_TOKEN
const GUILD_ID      = process.env.DISCORD_GUILD_ID
const APP_URL       = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const PORT          = process.env.PORT || 3099
const API           = 'https://discord.com/api/v10'
const BOT_START     = Date.now()

// ─── Startup validation ───────────────────────────────────────────────────────
if (!BOT_TOKEN || !GUILD_ID) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID'); process.exit(1)
}
if (!ANTHROPIC_KEY) {
  console.error('❌ Missing ANTHROPIC_API_KEY — add it to bot/.env'); process.exit(1)
}
console.log(`🔑 Claude key: ${ANTHROPIC_KEY.slice(0,14)}...${ANTHROPIC_KEY.slice(-4)} (${ANTHROPIC_KEY.length} chars)`)

// Extract creation timestamp from Discord snowflake (ignore pre-start messages)
function snowflakeMs(id) { return Number(BigInt(id) >> 22n) + 1420070400000 }

// Admin IDs (auto-populated from guild owner at startup)
const ADMIN_IDS = new Set(
  (process.env.DISCORD_ADMIN_USER_IDS || process.env.DISCORD_ADMIN_USER_ID || '').split(',').filter(Boolean)
)

// ─── Discord REST helpers ─────────────────────────────────────────────────────
const headers = {
  Authorization: `Bot ${BOT_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'TrackrAndyBot/4.0',
}

async function discordFetch(path, opts = {}) {
  const r = await fetch(`${API}${path}`, { headers, ...opts })
  if (r.status === 429) {
    const d = await r.json().catch(() => ({}))
    await sleep((d.retry_after || 1) * 1000 + 200)
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
  const r = await discordFetch(path, { method: 'POST', body: JSON.stringify(body) })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`POST ${path} → ${r.status}: ${t.slice(0, 80)}`)
  }
  return r.json()
}

async function editMessage(channelId, messageId, content) {
  try {
    await discordFetch(`/channels/${channelId}/messages/${messageId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content: content.slice(0, 1990) }),
    })
  } catch {}
}

async function sendTyping(channelId) {
  try { await discordPost(`/channels/${channelId}/typing`, {}) } catch {}
}

async function sendReply(channelId, messageId, text) {
  try {
    return await discordPost(`/channels/${channelId}/messages`, {
      content: text.slice(0, 1990),
      message_reference: { message_id: messageId, channel_id: channelId },
      allowed_mentions: { replied_user: true },
    })
  } catch (e) { console.error('sendReply:', e.message) }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Channel config ───────────────────────────────────────────────────────────
// Channels where bot should NOT respond (output-only)
const SKIP_CHANNELS = new Set([
  'app-pulse', 'code-review', 'ui-review', 'admin-logs', 'annonces',
  'logs', 'bot-logs', 'server-logs', 'bienvenue', 'statut-agents',
  'notifications', 'scheduler', 'reports', 'deployments',
])

// Channels with persistent 503/403 — auto-populated, skip polling them
const deadChannels = new Set()

// Trading channels → use trading system prompt
const TRADING_CHANNELS = new Set(['crypto', 'bitcoin', 'trading', 'defi', 'market-scanner', 'oracle-predictions'])
// Admin-only channels
const ADMIN_ONLY = new Set(['admin-tasks', 'admin'])

function isAdmin(userId) { return ADMIN_IDS.has(userId) }

// ─── Claude direct streaming ──────────────────────────────────────────────────
const SYSTEM = {
  default: (ch) => `Tu es AnDy, l'IA personnelle d'Andrea. Tu réponds dans Discord (#${ch}).
Règles absolues:
- COURT: 2-3 paragraphes max. Discord n'est pas Word.
- Direct: pas d'intro, pas de "Bien sûr!", vas au but.
- Langue: français sauf si on te parle anglais.
- Tu réponds à tout: finance, crypto, business, vie quotidienne, tech, n'importe quoi.`,

  trading: () => `Tu es AnDy, expert trading/crypto d'Andrea. Tu penses comme les meilleurs traders (Stan Druckenmiller, Paul Tudor Jones, Jesse Livermore) et tu bases tes analyses sur:
- L'analyse technique (niveaux clés, structure de marché, momentum)
- Les fondamentaux macro (Fed, liquidités, corrélations)
- Les news et catalyseurs récents (tu en es conscient jusqu'à ta date de coupure)
- Les études académiques et recherches quantitatives quand pertinent
- Le sentiment de marché et les positions des gros acteurs

Format: COURT et direct. Donne des niveaux précis, des thèses claires, des catalyseurs.
Pas de disclaimers — Andrea sait que c'est une analyse, pas du conseil certifié.`,

  think: () => `Tu es AnDy en MODE ANALYSE PROFONDE. Raisonne étape par étape.
Montre ton raisonnement structuré, identifie les risques, donne une conclusion claire.`,

  web: () => `Tu es AnDy en MODE INFO. Donne les infos les plus récentes que tu as.
Dis clairement si quelque chose pourrait avoir changé depuis ta date de coupure.`,
}

async function callClaude(message, { channelName = '', mode = 'default', systemNote = null, onChunk = null } = {}) {
  const isTrading = TRADING_CHANNELS.has(channelName)
  const systemKey = systemNote ? null : (mode === 'think' ? 'think' : mode === 'web' ? 'web' : isTrading ? 'trading' : 'default')
  const system = systemNote || SYSTEM[systemKey](channelName)
  const model  = mode === 'think' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001'

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: mode === 'think' ? 2000 : 600,
        stream: true,
        system,
        messages: [{ role: 'user', content: message }],
      }),
      signal: AbortSignal.timeout(mode === 'think' ? 55000 : 15000),
    })

    if (!res.ok) {
      const err = await res.text()
      // Debug: log exact key bytes being sent
      const keyBytes = Buffer.from(ANTHROPIC_KEY).toString('hex').slice(0, 20)
      console.error(`Claude ${res.status} | key-hex-start: ${keyBytes} | key-len: ${ANTHROPIC_KEY.length}`)
      return `❌ Erreur Claude (${res.status})`
    }

    const reader = res.body.getReader()
    const dec = new TextDecoder()
    let buf = '', text = '', lastEdit = 0

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n'); buf = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const ev = JSON.parse(line.slice(6))
          if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
            text += ev.delta.text
            const now = Date.now()
            // Update Discord every 900ms (safely under 5 edits/5s rate limit)
            if (onChunk && text.length > 30 && now - lastEdit > 900) {
              lastEdit = now
              onChunk(text + ' ▌').catch(() => {})
            }
          }
        } catch {}
      }
    }

    return text.trim().slice(0, 1990) || null
  } catch (e) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError')
      return '⏱️ Timeout — réessaie ou utilise `!think` pour une analyse approfondie.'
    console.error('callClaude:', e.message)
    return null
  }
}

// ─── Intent detection ─────────────────────────────────────────────────────────
function detectIntent(text) {
  const t = text.toLowerCase()
  if (/\b(je veux|j'aimerais|développe|crée|ajoute|implémente|build|make me)\b.{0,60}\b(une?|le|la|des|un)\b/i.test(text)) return 'develop'
  if (/\b(perdu|sais pas|pas sûr|où est|guide|quoi faire|help me|lost)\b/i.test(t)) return 'lost'
  return 'chat'
}

// ─── Channel guide ────────────────────────────────────────────────────────────
function getGuideText(currentChannel = '') {
  return [
    `**🗺️ Guide Trackr** — tu es dans **#${currentChannel}**`,
    '',
    '**#andy-chat** — 🧠 Chat général, questions, conseils, idées',
    '**#crypto / #trading** — 📊 Marchés, crypto, analyses',
    '**#brain-cycles** — 🤖 IA autonome, cycles d\'amélioration',
    '**#agent-forge** — ⚡ Agents IA en action',
    '**#bugs / #performance** — 🐛 Issues détectées',
    '',
    '> Dis-moi ce que tu veux faire, je m\'en occupe.',
  ].join('\n')
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
    return `✅ **Tâche créée**: ${desc}`
  }

  if (lower.startsWith('!run ')) {
    const focus = lower.slice(5).trim()
    fetch(`${APP_URL}/api/self-improve?focus=${focus}`, { signal: AbortSignal.timeout(5000) }).catch(() => {})
    return `🔄 Auto-amélioration lancée (focus: **${focus}**). Check #app-pulse.`
  }

  if (lower === '!status') {
    const up = Math.floor(process.uptime())
    return [
      `**🟢 AnDy Bot v4.0**`,
      `• Uptime: ${Math.floor(up/60)}m${up%60}s`,
      `• Channels actifs: ${monitoredChannels.size - deadChannels.size}/${monitoredChannels.size}`,
      `• Admins: ${[...ADMIN_IDS].join(', ')}`,
      `• Claude: Haiku (chat) / Sonnet (think)`,
    ].join('\n')
  }

  if (lower === '!monitor') {
    fetch(`${APP_URL}/api/monitor?force=true`, { signal: AbortSignal.timeout(8000) }).catch(() => {})
    return `📡 Monitor lancé → #app-pulse`
  }

  if (lower === '!guide') return getGuideText()

  if (lower === '!help') return [
    '**💬 Parle normalement — AnDy répond à tout**',
    '',
    '**Modes:**',
    '`!think <question>` — Analyse approfondie (Sonnet)',
    '`!web <question>` — Mode infos récentes',
    '',
    '**Admin:**',
    '`!task <desc>` — Créer une tâche IA',
    '`!run <focus>` — Auto-amélioration (bugs/security/performance/full)',
    '`!status` — Statut du bot',
    '`!monitor` — Lancer le monitoring',
  ].join('\n')

  return null
}

// ─── Process a single message ─────────────────────────────────────────────────
const processed   = new Set()
const channelLock = new Map()

async function processMessage(msg, channelName) {
  // Dedup + replay protection
  if (processed.has(msg.id)) return
  if (snowflakeMs(msg.id) < BOT_START - 3000) return
  processed.add(msg.id)
  setTimeout(() => processed.delete(msg.id), 60000)

  if (msg.author?.bot) return
  const content = msg.content?.trim() || ''
  if (content.length < 2) return

  const userId   = msg.author?.id || ''
  const username = msg.author?.username || 'user'
  const chName   = channelName.toLowerCase()

  if (SKIP_CHANNELS.has(chName)) return
  if (ADMIN_ONLY.has(chName) && !isAdmin(userId)) {
    await sendReply(msg.channel_id, msg.id, '🔐 Canal réservé à l\'admin.')
    return
  }

  // Admin commands
  if (content.startsWith('!') && isAdmin(userId)) {
    const adminReply = await handleAdmin(content, userId)
    if (adminReply) { await sendReply(msg.channel_id, msg.id, adminReply); return }
  }

  // Mode parsing
  let mode = 'default', cleanContent = content
  if (/^!think\s+/i.test(content))  { mode = 'think'; cleanContent = content.replace(/^!think\s+/i, '') }
  else if (/^!web\s+/i.test(content)) { mode = 'web';   cleanContent = content.replace(/^!web\s+/i, '') }
  if (cleanContent.length < 3 && mode === 'default') return

  console.log(`💬 [#${channelName}] ${username}: ${cleanContent.slice(0, 80)}`)

  // Intent routing
  const intent = mode === 'default' ? detectIntent(cleanContent) : 'chat'

  if (intent === 'lost') {
    await sendReply(msg.channel_id, msg.id, getGuideText(channelName))
    return
  }

  // "Je veux développer X" → save task + explain steps
  if (intent === 'develop' && isAdmin(userId)) {
    const taskDesc = cleanContent.replace(/^(je veux|j'aimerais|développe|crée|ajoute)\s+/i, '').trim()
    await fetch(`${APP_URL}/api/memory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'admin_task', status: 'pending', source: `discord-${username}`, description: taskDesc, createdAt: new Date().toISOString() }),
    }).catch(() => {})

    let ph
    try { ph = await sendReply(msg.channel_id, msg.id, `✅ **Tâche**: ${taskDesc}\n> 🧠 Analyse en cours...`) } catch {}

    const systemNote = `Tu es AnDy. Une tâche vient d'être créée: "${taskDesc}".
Réponds en 2 parties TRÈS COURTES:
1. ✅ Confirmation en 1 phrase
2. 📋 2-3 étapes concrètes (bullets)
Max 120 mots.`

    const onChunk = ph?.id ? (p) => editMessage(msg.channel_id, ph.id, `✅ **Tâche**: ${taskDesc}\n\n${p}`) : null
    const reply = await callClaude(cleanContent, { channelName, systemNote, onChunk })
    const final = `✅ **Tâche créée**: ${taskDesc}\n\n${reply || ''}`
    if (ph?.id) await editMessage(msg.channel_id, ph.id, final)
    console.log(`✅ [develop] ${username}: ${taskDesc}`)
    return
  }

  // Standard reply — typing indicator + immediate placeholder + live stream
  sendTyping(msg.channel_id).catch(() => {})

  const placeholderText = mode === 'think' ? '🧠 Thinking...' : mode === 'web' ? '🌐 Searching...' : '...'
  let ph
  try { ph = await sendReply(msg.channel_id, msg.id, placeholderText) } catch (e) {
    console.error('placeholder failed:', e.message); return
  }

  const onChunk = ph?.id ? (p) => editMessage(msg.channel_id, ph.id, p) : null

  try {
    let reply = await callClaude(cleanContent, { channelName, mode, onChunk })

    if (mode === 'think' && reply) reply = `🧠 **Analyse approfondie**\n\n${reply}`
    if (mode === 'web'   && reply) reply = `🌐 **Mode recherche**\n\n${reply}`

    const final = reply || '❌ Pas de réponse. Réessaie ou tape `!help`.'
    if (ph?.id) await editMessage(msg.channel_id, ph.id, final)
    else        await sendReply(msg.channel_id, msg.id, final)

    console.log(`✅ [${mode}] ${username} → ${reply?.length || 0} chars`)
  } catch (e) {
    console.error('reply error:', e.message)
    if (ph?.id) await editMessage(msg.channel_id, ph.id, `❌ Erreur: ${e.message.slice(0, 80)}`)
  }
}

// ─── Channel discovery ────────────────────────────────────────────────────────
const monitoredChannels = new Map()
const lastSeen = new Map()
const failCount = new Map()  // channelId → consecutive fail count

async function discoverChannels() {
  try {
    const guild = await discordGet(`/guilds/${GUILD_ID}`)
    if (guild.owner_id) { ADMIN_IDS.add(guild.owner_id); console.log(`👑 Owner: ${guild.owner_id}`) }

    const channels = await discordGet(`/guilds/${GUILD_ID}/channels`)
    monitoredChannels.clear()
    for (const ch of channels.filter(c => c.type === 0)) {
      if (!SKIP_CHANNELS.has(ch.name) && !deadChannels.has(ch.id)) {
        monitoredChannels.set(ch.id, { id: ch.id, name: ch.name })
      }
    }
    console.log(`📡 Monitoring ${monitoredChannels.size} channels`)
  } catch (e) { console.error('discoverChannels:', e.message) }
}

async function initLastSeen() {
  const chs = [...monitoredChannels.values()]
  // Process in batches of 5 to avoid rate limits
  for (let i = 0; i < chs.length; i += 5) {
    await Promise.allSettled(
      chs.slice(i, i + 5).map(async ch => {
        try {
          const msgs = await discordGet(`/channels/${ch.id}/messages?limit=1`)
          if (msgs.length > 0) lastSeen.set(ch.id, msgs[0].id)
        } catch (e) {
          // Only skip on 403 (permanent permission denied) — 503 is temporary
          if (e.message.includes('403') || e.message.includes('Missing Access')) {
            deadChannels.add(ch.id)
            monitoredChannels.delete(ch.id)
          }
        }
      })
    )
    await sleep(200)
  }
  console.log(`✅ Ready — ${monitoredChannels.size} channels active, ${deadChannels.size} skipped`)
}

// ─── Poll ─────────────────────────────────────────────────────────────────────
let polling = false

async function pollAll() {
  if (polling) return
  polling = true
  try {
    for (const ch of monitoredChannels.values()) {
      try {
        const after = lastSeen.get(ch.id)
        const msgs = await discordGet(`/channels/${ch.id}/messages?limit=5${after ? `&after=${after}` : ''}`)
        const newMsgs = msgs.reverse().filter(m => !m.author?.bot && m.content?.trim().length >= 2)

        failCount.set(ch.id, 0)  // reset fail counter on success

        for (const msg of newMsgs) {
          lastSeen.set(ch.id, msg.id)
          if (!channelLock.get(ch.id)) {
            channelLock.set(ch.id, true)
            processMessage(msg, ch.name)
              .catch(e => console.error('processMessage:', e.message))
              .finally(() => channelLock.delete(ch.id))
          }
        }
      } catch (e) {
        const fails = (failCount.get(ch.id) || 0) + 1
        failCount.set(ch.id, fails)
        // Only mark dead on 403 (permanent) — 503 is Discord-side temporary
        if (fails >= 10 && e.message.includes('403')) {
          deadChannels.add(ch.id)
          monitoredChannels.delete(ch.id)
          console.log(`⚠️ Skipping #${ch.name} — no permission`)
        }
      }
      await sleep(40)  // ~40ms between channels → full cycle in ~1.4s
    }
  } finally {
    polling = false
  }
}

// ─── HTTP health check ────────────────────────────────────────────────────────
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'online', version: '4.0',
    channels: { active: monitoredChannels.size, dead: deadChannels.size },
    admins: [...ADMIN_IDS],
    uptime: Math.floor(process.uptime()),
    ts: new Date().toISOString(),
  }))
}).listen(PORT, () => console.log(`🌐 Health: http://localhost:${PORT}`))

// ─── Startup ──────────────────────────────────────────────────────────────────
console.log(`🧠 AnDy Bot v4.0 — Claude direct streaming`)
console.log(`🌐 Vercel: ${APP_URL}`)

await discoverChannels()
await initLastSeen()

// Poll every 3s (faster than before)
setInterval(pollAll, 3000)

// Re-discover channels every 15 min (picks up new ones)
setInterval(discoverChannels, 15 * 60 * 1000)

// Monitor every 5 min via Vercel
setInterval(() => {
  fetch(`${APP_URL}/api/monitor?silent=true`, { signal: AbortSignal.timeout(12000) }).catch(() => {})
}, 5 * 60 * 1000)

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT',  () => process.exit(0))
