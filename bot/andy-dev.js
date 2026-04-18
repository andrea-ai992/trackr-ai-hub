// ─── AnDy Dev Bot — Développement & Déploiements ──────────────────────────────
// Spécialisé: tâches IA, queue, logs, commits, code review
// Token: DISCORD_DEV_BOT_TOKEN dans bot/.env

import { writeFileSync, readFileSync, readdirSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '..')

// Parse .env
try {
  const raw = readFileSync(`${__dir}/.env`, 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').replace(/[\r\n\\]+$/, '').trim()
  }
} catch {}

const BOT_TOKEN  = process.env.DISCORD_DEV_BOT_TOKEN
const GUILD_ID   = process.env.DISCORD_GUILD_ID
const GROQ_KEY   = process.env.GROQ_API_KEY
const ANTH_KEY   = process.env.ANTHROPIC_API_KEY
const TASKS_DIR  = resolve(ROOT, 'andy-tasks')
const LOG_FILE   = '/root/logs/andy-daemon.log'
const API        = 'https://discord.com/api/v10'
const BOT_START  = Date.now()
const BOT_START_SNOWFLAKE = String((BigInt(BOT_START - 1420070400000) << 22n))

if (!BOT_TOKEN || !GUILD_ID) {
  console.error('❌ DISCORD_DEV_BOT_TOKEN ou DISCORD_GUILD_ID manquant'); process.exit(1)
}
console.log('🔧 AnDy Dev Bot démarré')

// ─── Discord helpers ──────────────────────────────────────────────────────────
const H = { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'AndyDevBot/1.0' }

async function dFetch(path, opts = {}) {
  const r = await fetch(`${API}${path}`, { headers: H, ...opts })
  if (r.status === 429) {
    const d = await r.json().catch(() => ({}))
    await sleep((d.retry_after || 1) * 1000 + 200)
    return dFetch(path, opts)
  }
  return r
}

async function dGet(path) {
  const r = await dFetch(path)
  if (!r.ok) throw new Error(`GET ${path} → ${r.status}`)
  return r.json()
}

async function dPost(path, body) {
  const r = await dFetch(path, { method: 'POST', body: JSON.stringify(body) })
  return r.json().catch(() => ({}))
}

async function sendMsg(channelId, content, refMsgId = null) {
  const body = { content: content.slice(0, 1990) }
  if (refMsgId) body.message_reference = { message_id: refMsgId, channel_id: channelId }
  return dPost(`/channels/${channelId}/messages`, body)
}

async function editMsg(channelId, msgId, content) {
  await dFetch(`/channels/${channelId}/messages/${msgId}`, {
    method: 'PATCH', body: JSON.stringify({ content: content.slice(0, 1990) })
  }).catch(() => {})
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── AI call (Groq → Anthropic) ───────────────────────────────────────────────
const DEV_SYSTEM = `Tu es AnDy Dev, l'assistant développement d'Andrea Matlega.
Stack: React 19 + Vite, Node.js, déployé sur Vercel. Repo GitHub: andrea-ai992/trackr-ai-hub.
Tu aides avec: code, architecture, bugs, PR, optimisations, review.
Réponds en français. Court et direct. Code en blocs \`\`\`.`

async function askAI(message, maxTokens = 800) {
  // Groq
  if (GROQ_KEY) {
    try {
      const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: DEV_SYSTEM }, { role: 'user', content: message }],
          max_tokens: maxTokens, temperature: 0.3,
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (r.ok) {
        const d = await r.json().catch(() => null)
        const t = d?.choices?.[0]?.message?.content?.trim()
        if (t) return t.slice(0, 1990)
      }
    } catch (e) { console.error('Groq:', e.message) }
  }
  // Anthropic fallback
  if (ANTH_KEY) {
    try {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTH_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: maxTokens, system: DEV_SYSTEM, messages: [{ role: 'user', content: message }] }),
        signal: AbortSignal.timeout(30000),
      })
      if (r.ok) {
        const d = await r.json().catch(() => null)
        return d?.content?.[0]?.text?.trim()?.slice(0, 1990)
      }
    } catch (e) { console.error('Anthropic:', e.message) }
  }
  return null
}

// ─── Task helpers ─────────────────────────────────────────────────────────────
function getTasks() {
  try {
    const all = readdirSync(TASKS_DIR).filter(f => !f.startsWith('.'))
    return {
      queue:   all.filter(f => f.endsWith('.txt')),
      running: all.filter(f => f.endsWith('.running')),
      done:    all.filter(f => f.endsWith('.done')),
      error:   all.filter(f => f.endsWith('.error')),
    }
  } catch { return { queue: [], running: [], done: [], error: [] } }
}

function getLogs(n = 20) {
  try {
    return readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean).slice(-n)
  } catch { return [] }
}

function createTask(desc, priority = 'manual') {
  const fname = `${priority}-${Date.now()}.txt`
  writeFileSync(resolve(TASKS_DIR, fname), desc.trim(), 'utf8')
  return fname
}

// ─── Commands ─────────────────────────────────────────────────────────────────
async function handleCommand(content, channelId, msgId) {
  const lower = content.toLowerCase().trim()

  // !task <desc> — crée une tâche manuelle
  if (lower.startsWith('!task ')) {
    const desc = content.slice(6).trim()
    if (!desc) return sendMsg(channelId, '❌ Usage: `!task description de la tâche`', msgId)
    const fname = createTask(desc, 'manual')
    return sendMsg(channelId, `✅ **Tâche créée** — AnDy va la traiter en priorité\n\`${fname}\`\n> ${desc.slice(0, 100)}`, msgId)
  }

  // !urgent <desc> — tâche urgente priorité max
  if (lower.startsWith('!urgent ')) {
    const desc = content.slice(8).trim()
    if (!desc) return sendMsg(channelId, '❌ Usage: `!urgent description`', msgId)
    const fname = createTask(desc, 'urgent')
    return sendMsg(channelId, `🚨 **Tâche URGENTE créée** — interruption immédiate\n\`${fname}\`\n> ${desc.slice(0, 100)}`, msgId)
  }

  // !status — statut global
  if (lower === '!status') {
    const t = getTasks()
    const lines = [
      `**🔧 AnDy Dev — Statut**`,
      `\`\`\``,
      `✅ DONE    ${t.done.length}`,
      `⏳ QUEUE   ${t.queue.length}`,
      `⟳  RUNNING ${t.running.length}`,
      `❌ ERROR   ${t.error.length}`,
      `\`\`\``,
    ]
    if (t.running.length) lines.push(`**En cours:** \`${t.running[0].replace('.running', '')}\``)
    if (t.queue.length) lines.push(`**Prochain:** \`${t.queue[0].replace('.txt', '')}\``)
    return sendMsg(channelId, lines.join('\n'), msgId)
  }

  // !queue — liste la queue
  if (lower === '!queue') {
    const t = getTasks()
    if (!t.queue.length && !t.running.length) return sendMsg(channelId, '**Queue vide** — AnDy est idle.', msgId)
    const items = [
      ...(t.running.map(f => `⟳  \`${f.replace('.running', '')}\` ← EN COURS`)),
      ...(t.queue.slice(0, 10).map((f, i) => `${i + 1}. \`${f.replace('.txt', '')}\``)),
      ...(t.queue.length > 10 ? [`+ ${t.queue.length - 10} autres…`] : []),
    ]
    return sendMsg(channelId, `**📋 Queue AnDy**\n${items.join('\n')}`, msgId)
  }

  // !logs — derniers logs daemon
  if (lower === '!logs' || lower.startsWith('!logs ')) {
    const n = parseInt(lower.split(' ')[1]) || 15
    const lines = getLogs(Math.min(n, 30))
    if (!lines.length) return sendMsg(channelId, '❌ Logs inaccessibles.', msgId)
    const formatted = lines.slice(-n).join('\n').slice(0, 1800)
    return sendMsg(channelId, `**📋 Logs daemon (${n} dernières lignes)**\n\`\`\`\n${formatted}\n\`\`\``, msgId)
  }

  // !deploy — derniers commits GitHub
  if (lower === '!deploy') {
    try {
      const r = await fetch('https://api.github.com/repos/andrea-ai992/trackr-ai-hub/commits?per_page=5', {
        headers: { 'User-Agent': 'andy-dev-bot', ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}) },
        signal: AbortSignal.timeout(8000),
      })
      const commits = await r.json()
      if (!Array.isArray(commits)) return sendMsg(channelId, '❌ GitHub inaccessible.', msgId)
      const lines = commits.map(c => {
        const msg = c.commit.message.split('\n')[0].slice(0, 60)
        const sha = c.sha.slice(0, 7)
        const date = new Date(c.commit.author.date).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        const isAndy = msg.includes('[AnDy]') ? ' 🤖' : ''
        return `\`${sha}\` ${msg}${isAndy} — ${date}`
      })
      return sendMsg(channelId, `**🚀 Derniers commits**\n${lines.join('\n')}`, msgId)
    } catch (e) { return sendMsg(channelId, `❌ Erreur GitHub: ${e.message}`, msgId) }
  }

  // !help
  if (lower === '!help' || lower === '!dev') {
    return sendMsg(channelId, [
      '**🔧 AnDy Dev — Commandes**',
      '',
      '`!task <desc>` — Crée une tâche (priorité manuelle)',
      '`!urgent <desc>` — Tâche urgente (interruption immédiate)',
      '`!status` — Statut queue + running',
      '`!queue` — Liste complète de la queue',
      '`!logs [n]` — Derniers logs daemon (défaut: 15)',
      '`!deploy` — Derniers commits GitHub',
      '',
      'Ou écris normalement — AnDy répond avec du contexte dev.',
    ].join('\n'), msgId)
  }

  return null
}

// ─── Message processor ────────────────────────────────────────────────────────
const processed = new Set()
const DEV_CHANNELS = new Set(['dev', 'développement', 'development', 'code', 'code-review', 'deployments', 'deploy', 'build', 'tasks', 'taches', 'tâches', 'git', 'andy-dev', 'bugs', 'performance', 'agent-forge', 'brain-cycles'])

async function processMsg(msg, channelName) {
  if (processed.has(msg.id)) return
  if (BigInt(msg.id) <= BigInt(BOT_START_SNOWFLAKE)) return
  processed.add(msg.id); setTimeout(() => processed.delete(msg.id), 60000)

  if (msg.author?.bot) return
  const content = msg.content?.trim() || ''
  if (content.length < 2) return

  const chName = channelName.toLowerCase()

  // Répond uniquement dans les channels dev ou si mention/DM
  const isDevChannel = DEV_CHANNELS.has(chName) || chName.includes('dev') || chName.includes('deploy') || chName.includes('task')
  const isMention = content.includes(`<@`) // mention du bot
  if (!isDevChannel && !isMention) return

  console.log(`🔧 [#${channelName}] ${msg.author?.username}: ${content.slice(0, 80)}`)

  // Commandes
  if (content.startsWith('!')) {
    const cmdReply = await handleCommand(content, msg.channel_id, msg.id)
    if (cmdReply) return
  }

  // Réponse IA avec contexte dev
  const ph = await sendMsg(msg.channel_id, '🔧 …', msg.id).catch(() => null)

  const taskInfo = (() => {
    const t = getTasks()
    if (!t.running.length) return 'Queue idle.'
    return `En cours: ${t.running[0].replace('.running', '')} | Queue: ${t.queue.length}`
  })()

  const aiPrompt = `[Contexte: ${taskInfo}]\n\nQuestion de ${msg.author?.username}: ${content}`
  const reply = await askAI(aiPrompt)

  const final = reply || '❌ IA indisponible — Groq et Anthropic inaccessibles.'
  if (ph?.id) await editMsg(msg.channel_id, ph.id, final)
  else await sendMsg(msg.channel_id, final, msg.id)
}

// ─── Polling ──────────────────────────────────────────────────────────────────
const monitoredChannels = new Map()
const deadChannels = new Set()
const lastSeen = new Map()

async function discoverChannels() {
  try {
    const guild = await dGet(`/guilds/${GUILD_ID}`)
    const channels = await dGet(`/guilds/${GUILD_ID}/channels`)
    for (const ch of channels) {
      if (ch.type !== 0) continue
      const name = (ch.name || '').toLowerCase()
      const isDev = DEV_CHANNELS.has(name) || name.includes('dev') || name.includes('deploy') || name.includes('task') || name.includes('build') || name.includes('bug') || name.includes('code') || name.includes('agent') || name.includes('brain')
      if (isDev) {
        monitoredChannels.set(ch.id, ch.name)
        console.log(`📡 Monitor: #${ch.name}`)
      }
    }
  } catch (e) { console.error('discoverChannels:', e.message) }
}

async function pollChannel(channelId, channelName) {
  if (deadChannels.has(channelId)) return
  try {
    const since = lastSeen.get(channelId)
    const path = `/channels/${channelId}/messages?limit=5${since ? `&after=${since}` : ''}`
    const r = await dFetch(path)

    if (r.status === 403 || r.status === 404) { deadChannels.add(channelId); return }
    if (!r.ok) return

    const msgs = await r.json().catch(() => [])
    if (!Array.isArray(msgs) || !msgs.length) return

    const sorted = msgs.sort((a, b) => Number(BigInt(a.id) - BigInt(b.id)))
    lastSeen.set(channelId, sorted[sorted.length - 1].id)

    if (!since) return // premier poll = init seulement

    for (const msg of sorted) {
      await processMsg(msg, channelName)
      await sleep(200)
    }
  } catch (e) { if (!e.message.includes('fetch')) console.error(`poll #${channelName}:`, e.message) }
}

async function poll() {
  for (const [id, name] of monitoredChannels) {
    await pollChannel(id, name)
    await sleep(300)
  }
}

// ─── Start ────────────────────────────────────────────────────────────────────
await discoverChannels()

if (!monitoredChannels.size) {
  console.warn('⚠️ Aucun canal dev trouvé — le bot attend quand même.')
}

// Redécouverte toutes les 5min
setInterval(discoverChannels, 5 * 60 * 1000)

// Polling toutes les 2.5s
setInterval(poll, 2500)

console.log(`✅ AnDy Dev Bot prêt — ${monitoredChannels.size} canaux monitorés`)
