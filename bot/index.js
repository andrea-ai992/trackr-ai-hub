// ─── Trackr AnDy — Discord Bot v4.0 ──────────────────────────────────────────
// Direct Claude streaming — zero Vercel cold start
// REST polling with auto-skip of inaccessible channels
// One response at a time per channel, instant placeholder + live streaming

import http from 'http'
import { fileURLToPath } from 'url'
import { dirname, resolve } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const __dir   = dirname(fileURLToPath(import.meta.url))
const TASKS_DIR = resolve(__dir, '..', 'andy-tasks')
try { mkdirSync(TASKS_DIR, { recursive: true }) } catch {}

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
const GROQ_KEY      = process.env.GROQ_API_KEY
const PORT          = process.env.PORT || 3099
const API           = 'https://discord.com/api/v10'
const BOT_START     = Date.now()
// Snowflake généré depuis BOT_START — tous les messages antérieurs sont ignorés
const BOT_START_SNOWFLAKE = String((BigInt(BOT_START - 1420070400000) << 22n))

// ─── Startup validation ───────────────────────────────────────────────────────
if (!BOT_TOKEN || !GUILD_ID) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID'); process.exit(1)
}
if (!GROQ_KEY) {
  console.error('❌ GROQ_API_KEY manquante dans bot/.env'); process.exit(1)
}
console.log(`🔑 Groq: ${GROQ_KEY.slice(0,10)}...`)


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

  aide: () => `Tu es AnDy, l'assistant IA d'Andrea Matlega pour son app Trackr.

SYSTÈME COMPLET:
- App Trackr (React/Vite) déployée sur Vercel: https://trackr-app-nu.vercel.app
- Daemon IA (andy-daemon) sur VPS 62.238.12.221 — exécute des tâches en autonomie
- Dashboard dev: http://62.238.12.221:4000/vibe
- Bot Discord principal (AnDy) + Bot Dev (AnDy Dev)
- CLI: node cli/task.js sur le repo local

CANAUX DISCORD:
- #chat → questions générales, conseils, analyses
- #tâches → donner des tâches au daemon IA (!task, !urgent, !status, !queue)
- #crypto #trading → analyses financières
- #déploiements → voir les commits et déploiements
- #bugs → signaler des bugs
- #idées → suggestions de features
- #live → statut daemon en direct
- #aide → CE CANAL — tu guides Andrea

COMMANDES DISPONIBLES:
- !task <description> → crée une tâche normale (le daemon l'exécute en quelques minutes)
- !urgent <description> → tâche urgente (interrompt tout immédiatement)
- !status → voir ce qu'AnDy fait en ce moment
- !queue → voir toutes les tâches en attente
- !logs → voir les derniers logs du daemon
- !deploy → voir les derniers commits GitHub
- !think <question> → analyse approfondie
- !web <question> → infos récentes

DEPUIS LE CLI:
- node cli/task.js "description" → soumet une tâche
- node cli/task.js urgent "description" → tâche urgente
- node cli/task.js status → statut

TON RÔLE DANS #aide:
1. Andrea décrit ce qu'elle veut faire en langage naturel
2. Tu comprends l'intention
3. Tu réponds avec: le canal exact + la commande exacte à copier-coller
4. Format de réponse:
   📍 Va dans **#canal**
   \`\`\`
   commande exacte à copier-coller
   \`\`\`
   ⏱️ Ce qui va se passer: [description courte]

Si la demande est une TÂCHE à exécuter → tu la crées DIRECTEMENT (pas besoin qu'Andrea aille ailleurs) et tu confirmes.
Si c'est une QUESTION → tu réponds directement.
Si c'est ambigu → tu demandes une clarification en 1 phrase max.`,
}

async function callClaude(message, { channelName = '', mode = 'default', systemNote = null, onChunk = null } = {}) {
  const isTrading = TRADING_CHANNELS.has(channelName)
  const isAide    = channelName === 'aide' || channelName === 'assistant' || channelName === 'help'
  const systemKey = systemNote ? null : (mode === 'think' ? 'think' : mode === 'web' ? 'web' : isAide ? 'aide' : isTrading ? 'trading' : 'default')
  const system = systemNote || SYSTEM[systemKey](channelName)
  const maxTokens = mode === 'think' ? 2000 : 600

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'system', content: system }, { role: 'user', content: message }],
        max_tokens: maxTokens,
        temperature: 0.5,
      }),
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) { console.error(`Groq ${res.status}`); return `❌ Groq erreur ${res.status} — réessaie.` }
    const d = await res.json().catch(() => null)
    const text = d?.choices?.[0]?.message?.content?.trim()
    if (text) {
      if (onChunk) onChunk(text).catch(() => {})
      return text.slice(0, 1990)
    }
    return '❌ Pas de réponse.'
  } catch (e) {
    if (e.name === 'TimeoutError' || e.name === 'AbortError') return '⏱️ Timeout — réessaie.'
    console.error('callClaude:', e.message)
    return '❌ Erreur réseau.'
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

  if (lower.startsWith('!task ') || lower.startsWith('!urgent ')) {
    const isUrgent = lower.startsWith('!urgent ')
    const desc = text.slice(isUrgent ? 8 : 6).trim()
    if (!desc) return isUrgent ? '❌ Usage: `!urgent description`' : '❌ Usage: `!task description`'
    const priority = isUrgent ? 'urgent' : 'manual'
    const fname = `${priority}-${Date.now()}.txt`
    try { writeFileSync(resolve(TASKS_DIR, fname), desc, 'utf8') } catch (e) { return `❌ Erreur: ${e.message}` }
    return isUrgent
      ? `🚨 **URGENT** — AnDy interrompt tout\n\`${fname}\`\n> ${desc.slice(0, 100)}`
      : `✅ **Tâche créée** — AnDy va l'exécuter\n\`${fname}\`\n> ${desc.slice(0, 100)}`
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
  if (BigInt(msg.id) <= BigInt(BOT_START_SNOWFLAKE)) return  // strict: avant démarrage = ignoré
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

  // !task et !urgent — ouverts à tous depuis n'importe quel channel
  if ((content.toLowerCase().startsWith('!task ') || content.toLowerCase().startsWith('!urgent ')) && isAdmin(userId)) {
    const r = await handleAdmin(content, userId)
    if (r) { await sendReply(msg.channel_id, msg.id, r); return }
  }

  // Autres commandes admin
  if (content.startsWith('!') && isAdmin(userId)) {
    const adminReply = await handleAdmin(content, userId)
    if (adminReply) { await sendReply(msg.channel_id, msg.id, adminReply); return }
  }

  // Mode parsing
  const isAideChannel = ['aide', 'assistant', 'help'].includes(chName)
  let mode = 'default', cleanContent = content
  if (/^!think\s+/i.test(content))  { mode = 'think'; cleanContent = content.replace(/^!think\s+/i, '') }
  else if (/^!web\s+/i.test(content)) { mode = 'web';   cleanContent = content.replace(/^!web\s+/i, '') }
  if (cleanContent.length < 3 && mode === 'default') return

  console.log(`💬 [#${channelName}] ${username}: ${cleanContent.slice(0, 80)}`)

  // ── #aide : l'IA crée la tâche directement si elle le juge pertinent ──────────
  if (isAideChannel && isAdmin(userId) && mode === 'default') {
    const ph = await sendReply(msg.channel_id, msg.id, '⟨◈⟩ …').catch(() => null)
    const onChunk = ph?.id ? p => editMessage(msg.channel_id, ph.id, p) : null

    // Demande à l'IA d'analyser + éventuellement générer une commande !task
    const aidePrompt = `Andrea dit: "${cleanContent}"

Analyse et réponds selon le format de ton system prompt.
Si c'est une tâche à exécuter, inclus dans ta réponse une ligne au format exact:
CRÉER_TÂCHE: <description complète et précise de la tâche pour le daemon IA>
ou si urgent:
CRÉER_URGENT: <description>
Sinon, réponds normalement.`

    const reply = await callClaude(aidePrompt, { channelName, onChunk })

    // Extrait et crée la tâche si l'IA l'a décidé
    if (reply) {
      const taskMatch = reply.match(/CRÉER_TÂCHE:\s*(.+)/i)
      const urgentMatch = reply.match(/CRÉER_URGENT:\s*(.+)/i)
      const match = urgentMatch || taskMatch
      if (match) {
        const desc = match[1].trim()
        const priority = urgentMatch ? 'urgent' : 'manual'
        const fname = `${priority}-${Date.now()}.txt`
        try { writeFileSync(resolve(TASKS_DIR, fname), desc, 'utf8') } catch {}
        const clean = reply.replace(/CRÉER_(TÂCHE|URGENT):\s*.+/gi, '').trim()
        const confirmation = `${clean}\n\n${urgentMatch ? '🚨 **URGENT créé**' : '✅ **Tâche créée**'} → \`${fname}\``
        if (ph?.id) await editMessage(msg.channel_id, ph.id, confirmation)
        else await sendReply(msg.channel_id, msg.id, confirmation)
        return
      }
      if (ph?.id) await editMessage(msg.channel_id, ph.id, reply)
      else await sendReply(msg.channel_id, msg.id, reply)
    }
    return
  }

  // ── #tâches : tout message = tâche directe ───────────────────────────────────
  if ((chName === 'tâches' || chName === 'taches' || chName === 'tasks') && mode === 'default') {
    const isUrgent = /^urgent[:\s]/i.test(cleanContent)
    const desc = cleanContent.replace(/^urgent[:\s]*/i, '').trim()
    const priority = isUrgent ? 'urgent' : 'manual'
    const fname = `${priority}-${Date.now()}.txt`
    try { writeFileSync(resolve(TASKS_DIR, fname), desc, 'utf8') } catch (e) {
      await sendReply(msg.channel_id, msg.id, `❌ Erreur: ${e.message}`)
      return
    }
    const emoji = isUrgent ? '🚨' : '✅'
    const label = isUrgent ? 'URGENT — interrompt tout' : 'reçue — AnDy va l\'exécuter'
    await sendReply(msg.channel_id, msg.id,
      `${emoji} **Tâche ${label}**\n> ${desc.slice(0, 120)}\n\`${fname}\``
    )
    return
  }

  // Intent routing standard
  const intent = mode === 'default' ? detectIntent(cleanContent) : 'chat'

  if (intent === 'lost') {
    await sendReply(msg.channel_id, msg.id, getGuideText(channelName))
    return
  }

  // "Je veux développer X" → save task + explain steps
  if (intent === 'develop' && isAdmin(userId)) {
    const taskDesc = cleanContent.replace(/^(je veux|j'aimerais|développe|crée|ajoute)\s+/i, '').trim()
    const fname = `manual-${Date.now()}.txt`
    try { writeFileSync(resolve(TASKS_DIR, fname), taskDesc, 'utf8') } catch {}

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
  for (let i = 0; i < chs.length; i += 5) {
    await Promise.allSettled(
      chs.slice(i, i + 5).map(async ch => {
        // Toujours initialiser avec BOT_START_SNOWFLAKE en premier
        // → même si le fetch échoue, le poll ne remontera jamais avant le démarrage
        lastSeen.set(ch.id, BOT_START_SNOWFLAKE)
        try {
          const msgs = await discordGet(`/channels/${ch.id}/messages?limit=1`)
          if (msgs.length > 0) {
            // Prendre le plus récent entre le dernier message et BOT_START
            const msgSnow = msgs[0].id
            const pick = BigInt(msgSnow) > BigInt(BOT_START_SNOWFLAKE) ? msgSnow : BOT_START_SNOWFLAKE
            lastSeen.set(ch.id, pick)
          }
        } catch (e) {
          if (e.message.includes('403') || e.message.includes('Missing Access')) {
            deadChannels.add(ch.id)
            monitoredChannels.delete(ch.id)
          }
          // Sinon on garde BOT_START_SNOWFLAKE — aucun replay possible
        }
      })
    )
    await sleep(200)
  }
  console.log(`✅ Ready — ${monitoredChannels.size} channels actifs, ${deadChannels.size} skippés`)
  console.log(`🛡️  Replay protection: messages avant ${new Date(BOT_START).toISOString()} ignorés`)
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

// ─── Portfolios séparés ───────────────────────────────────────────────────────
const STOCKS_PORTFOLIO = [
  { ticker: 'WM',   name: 'Waste Management',  sector: 'Industrials/Defensive' },
  { ticker: 'CRWD', name: 'CrowdStrike',        sector: 'Cybersecurity' },
  { ticker: 'NVDA', name: 'Nvidia',             sector: 'AI/Semiconductors' },
  { ticker: 'WMT',  name: 'Walmart',            sector: 'Consumer Defensive' },
  { ticker: 'NET',  name: 'Cloudflare',         sector: 'Network Security' },
  { ticker: 'ASML', name: 'ASML Holding',       sector: 'Semiconductor Equipment' },
  { ticker: 'COST', name: 'Costco',             sector: 'Consumer Defensive' },
  { ticker: 'MT',   name: 'ArcelorMittal',      sector: 'Steel/Materials' },
  { ticker: 'PM',   name: 'Philip Morris',      sector: 'Tobacco/Dividend' },
  { ticker: 'DE',   name: 'John Deere',         sector: 'Agriculture/Industrials' },
  { ticker: 'VSAT', name: 'Viasat',             sector: 'Satellite/Telecom' },
  { ticker: 'BABA', name: 'Alibaba',            sector: 'Chinese Tech/E-commerce' },
  { ticker: 'TEM',  name: 'Tempus AI',          sector: 'AI Healthcare' },
]

const CRYPTO_PORTFOLIO = [
  { ticker: 'BTC',  name: 'Bitcoin',   },
  { ticker: 'ETH',  name: 'Ethereum',  },
  { ticker: 'SOL',  name: 'Solana',    },
  { ticker: 'BNB',  name: 'BNB',       },
  { ticker: 'AVAX', name: 'Avalanche', },
  { ticker: 'LINK', name: 'Chainlink', },
]

async function postToChannel(channelId, content) {
  if (!channelId) return
  try {
    await discordPost(`/channels/${channelId}/messages`, {
      content: content.slice(0, 1990),
    })
  } catch (e) { console.error('postToChannel:', e.message) }
}

// Find channel ID by name in monitored channels
function findChannel(...names) {
  for (const [id, ch] of monitoredChannels) {
    if (names.includes(ch.name)) return id
  }
  return null
}

// ─── Brief actions (NYSE/NASDAQ) ──────────────────────────────────────────────
async function generateStocksBrief() {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/New_York' })
  const tickers = STOCKS_PORTFOLIO.map(p => `${p.ticker} (${p.name})`).join(', ')

  const prompt = `Analyse pré-marché ACTIONS pour Andrea — ${today}

Son portfolio actions: ${tickers}

Fais une analyse style expert hedge fund:

1. **MACRO DU JOUR** — contexte global (taux, Fed, dollar, VIX, futures S&P/Nasdaq)
2. **SETUP PAR ACTION** — pour chaque ticker: tendance + niveau S/R clé + signal (achat/vente/attente)
3. **TOP 3 OPPORTUNITÉS** — les 3 meilleurs setups du jour avec entry/stop/target
4. **RISQUES** — earnings à venir, macro, news sectorielles

Format Discord: **gras**, emojis, sections claires. Max 1800 chars.
Note ta date de coupure si tu ne peux pas confirmer les prix actuels.`

  console.log('📈 Generating stocks brief...')
  const analysis = await callClaude(prompt, { channelName: 'market-scanner', mode: 'think', systemNote: SYSTEM.trading() })
  if (!analysis) { console.error('Stocks brief failed'); return null }

  const header = `📈 **TRADING ACTIONS — ${today.toUpperCase()}**\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  const full = (header + analysis).slice(0, 1990)

  const channelId = process.env.DISCORD_CH_MARKET_SCANNER || findChannel('market-scanner', 'trading-desk', 'trading')
  if (channelId) {
    await postToChannel(channelId, full)
    console.log('✅ Stocks brief posted')
  }

  fetch(`${APP_URL}/api/morning?type=stocks&brief=${encodeURIComponent(analysis.slice(0, 400))}`, { signal: AbortSignal.timeout(5000) }).catch(() => {})
  return full
}

// ─── Brief crypto ─────────────────────────────────────────────────────────────
async function generateCryptoBrief() {
  const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/New_York' })
  const tickers = CRYPTO_PORTFOLIO.map(p => `${p.ticker} (${p.name})`).join(', ')

  const prompt = `Analyse crypto pour Andrea — ${today}

Cryptos à analyser: ${tickers}

Fais une analyse style expert crypto:

1. **DOMINANCE & MACRO CRYPTO** — BTC dominance, liquidités, sentiment marché (Fear & Greed), tendance globale
2. **SETUP PAR COIN** — pour chaque crypto: tendance + support/résistance clé + signal (long/short/attente)
3. **TOP 3 TRADES** — les 3 meilleures opportunités avec entry/stop/target
4. **RISQUES** — news crypto, régulation, on-chain signals, corrélation BTC

Format Discord: **gras**, emojis, sections claires. Max 1800 chars.
Note ta date de coupure si tu ne peux pas confirmer les prix actuels.`

  console.log('🪙 Generating crypto brief...')
  const analysis = await callClaude(prompt, { channelName: 'crypto', mode: 'think', systemNote: SYSTEM.trading() })
  if (!analysis) { console.error('Crypto brief failed'); return null }

  const header = `🪙 **TRADING CRYPTO — ${today.toUpperCase()}**\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
  const full = (header + analysis).slice(0, 1990)

  const channelId = process.env.DISCORD_CH_CRYPTO || findChannel('crypto', 'bitcoin', 'defi')
  if (channelId) {
    await postToChannel(channelId, full)
    console.log('✅ Crypto brief posted')
  }

  fetch(`${APP_URL}/api/morning?type=crypto&brief=${encodeURIComponent(analysis.slice(0, 400))}`, { signal: AbortSignal.timeout(5000) }).catch(() => {})
  return full
}

// ─── Scheduler briefs — 8:30am ET (actions) + 8:00am ET (crypto, 24/7) ───────
function scheduleDailyBrief() {
  const now = new Date()
  const et  = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))

  // Stocks: 8:30am ET, weekdays only
  const stocksTarget = new Date(et)
  stocksTarget.setHours(8, 30, 0, 0)
  if (et >= stocksTarget) stocksTarget.setDate(stocksTarget.getDate() + 1)
  while (stocksTarget.getDay() === 0 || stocksTarget.getDay() === 6) stocksTarget.setDate(stocksTarget.getDate() + 1)

  // Crypto: 8:00am ET, every day (marché 24/7)
  const cryptoTarget = new Date(et)
  cryptoTarget.setHours(8, 0, 0, 0)
  if (et >= cryptoTarget) cryptoTarget.setDate(cryptoTarget.getDate() + 1)

  console.log(`📅 Next stocks brief in ${Math.round((stocksTarget - et)/3600000)}h (8:30am ET, weekdays)`)
  console.log(`📅 Next crypto brief in ${Math.round((cryptoTarget - et)/3600000)}h (8:00am ET, daily)`)

  setTimeout(async () => { await generateStocksBrief(); scheduleDailyBrief() }, stocksTarget - et)
  setTimeout(async () => { await generateCryptoBrief(); scheduleDailyBrief() }, cryptoTarget - et)
}

// ─── HTTP health check ────────────────────────────────────────────────────────
http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost')

  if (url.pathname === '/brief/stocks') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Generating stocks brief...')
    generateStocksBrief().catch(console.error)
    return
  }

  if (url.pathname === '/brief/crypto') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Generating crypto brief...')
    generateCryptoBrief().catch(console.error)
    return
  }

  // Legacy /brief → stocks
  if (url.pathname === '/brief') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Generating brief...')
    generateStocksBrief().catch(console.error)
    return
  }

  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'online', version: '4.1',
    channels: { active: monitoredChannels.size, dead: deadChannels.size },
    admins: [...ADMIN_IDS],
    uptime: Math.floor(process.uptime()),
    stocks: STOCKS_PORTFOLIO.map(p => p.ticker),
    crypto: CRYPTO_PORTFOLIO.map(p => p.ticker),
    ts: new Date().toISOString(),
  }))
}).listen(PORT, () => console.log(`🌐 Health: http://localhost:${PORT}`))

// ─── Startup ──────────────────────────────────────────────────────────────────
console.log(`🧠 AnDy Bot v4.0 — Claude direct streaming`)
console.log(`🌐 Vercel: ${APP_URL}`)

await discoverChannels()
await initLastSeen()

// Poll every 3s
setInterval(pollAll, 3000)

// Re-discover channels every 15 min
setInterval(discoverChannels, 15 * 60 * 1000)

// Monitor every 5 min
setInterval(() => {
  fetch(`${APP_URL}/api/monitor?silent=true`, { signal: AbortSignal.timeout(12000) }).catch(() => {})
}, 5 * 60 * 1000)

// Schedule daily pre-market brief (8:30am ET, weekdays)
scheduleDailyBrief()

process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT',  () => process.exit(0))
