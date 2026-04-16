// ─── AnDy Memory — Mémoire persistante d'apprentissage ───────────────────────
// Stocke chaque amélioration appliquée dans ANDY_MEMORY.json sur GitHub
// GET  /api/memory          — charge les entrées récentes
// POST /api/memory          — ajoute une nouvelle entrée
// Utilisé par self-improve.js pour éviter les doublons et apprendre des patterns

const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO         = 'andrea-ai992/trackr-ai-hub'
const GITHUB_API   = 'https://api.github.com'
const MEMORY_FILE  = 'ANDY_MEMORY.json'
const MAX_ENTRIES  = 150   // garde les 150 dernières entrées

// ─── GitHub helpers ───────────────────────────────────────────────────────────
async function ghHeaders() {
  return {
    Authorization: `token ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'TrackrAnDy/1.0',
  }
}

async function loadMemoryFile() {
  try {
    const r = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${MEMORY_FILE}`, {
      headers: await ghHeaders(),
    })
    if (r.status === 404) return { entries: [], sha: null }
    if (!r.ok) throw new Error(`GitHub GET memory → ${r.status}`)
    const data = await r.json()
    const raw  = Buffer.from(data.content, 'base64').toString('utf8')
    const parsed = JSON.parse(raw)
    return { entries: Array.isArray(parsed.entries) ? parsed.entries : [], sha: data.sha }
  } catch (e) {
    console.error('loadMemoryFile error:', e.message)
    return { entries: [], sha: null }
  }
}

async function saveMemoryFile(entries, sha) {
  const content = JSON.stringify({ entries: entries.slice(-MAX_ENTRIES) }, null, 2)
  const body = {
    message: '[AnDy] Update learning memory',
    content: Buffer.from(content).toString('base64'),
    committer: { name: 'AnDy AI', email: 'andy@trackr.ai' },
  }
  if (sha) body.sha = sha

  const r = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${MEMORY_FILE}`, {
    method: 'PUT',
    headers: await ghHeaders(),
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const err = await r.text()
    throw new Error(`GitHub PUT memory → ${r.status}: ${err}`)
  }
  return r.json()
}

// ─── Exports pour self-improve.js ────────────────────────────────────────────

/**
 * Charge les N dernières entrées de mémoire (ordre anti-chronologique)
 */
export async function getMemoryEntries(limit = 30) {
  const { entries } = await loadMemoryFile()
  return entries.slice(-limit).reverse()
}

/**
 * Retourne les entrées récentes pour un fichier donné (anti-doublon)
 * @param {string} filePath
 * @param {number} hoursBack  — fenêtre de temps (ex: 24h)
 */
export async function getRecentFixesForFile(filePath, hoursBack = 24) {
  const { entries } = await loadMemoryFile()
  const since = Date.now() - hoursBack * 3600 * 1000
  return entries.filter(e =>
    e.file === filePath &&
    new Date(e.timestamp).getTime() > since
  )
}

/**
 * Ajoute une nouvelle entrée en mémoire et la persiste sur GitHub
 */
export async function addMemoryEntry(entry) {
  const { entries, sha } = await loadMemoryFile()
  const newEntry = {
    id:        `mem_${Date.now()}`,
    timestamp: new Date().toISOString(),
    ...entry,
  }
  entries.push(newEntry)
  await saveMemoryFile(entries, sha)
  return newEntry
}

// ─── Générer un résumé de mémoire pour Claude ────────────────────────────────
export function formatMemoryForPrompt(entries) {
  if (!entries || entries.length === 0) return ''
  const lines = entries.slice(0, 20).map(e => {
    const d = new Date(e.timestamp).toLocaleDateString('fr-FR')
    const status = e.applied ? '✅ appliqué' : (e.dryRun ? '🔍 dry-run' : '❌ échec')
    return `- [${d}] ${status} · ${e.file || '?'} · ${e.problem || e.reason || 'raison inconnue'} (${e.severity || '?'})`
  })
  return `\n\n## Historique des améliorations récentes\n${lines.join('\n')}`
}

// ─── Agents Activity Log (fusionné depuis agents-log.js) ─────────────────────
const DISCORD_API_MEM = 'https://discord.com/api/v10'
const BOT_TOKEN_MEM   = process.env.DISCORD_BOT_TOKEN

const LOG_CHANNELS = [
  { key: 'market_scanner', id: process.env.DISCORD_CH_MARKET_SCANNER, agent: 'MarketScanner', emoji: '🔭', color: 0x34d399 },
  { key: 'crypto',         id: process.env.DISCORD_CH_CRYPTO,          agent: 'CryptoTracker', emoji: '₿',  color: 0xfcd34d },
  { key: 'code_review',    id: process.env.DISCORD_CH_CODE_REVIEW,     agent: 'CodeReviewer',  emoji: '👁️', color: 0x60a5fa },
  { key: 'ui_review',      id: process.env.DISCORD_CH_UI_REVIEW,       agent: 'UIInspector',   emoji: '🎨', color: 0xf9a8d4 },
  { key: 'reports',        id: process.env.DISCORD_CH_REPORTS,         agent: 'ReportBot',     emoji: '📋', color: 0x67e8f9 },
  { key: 'app_pulse',      id: process.env.DISCORD_CH_APP_PULSE,       agent: 'Pulse',         emoji: '💓', color: 0xff006e },
  { key: 'trading_desk',   id: process.env.DISCORD_CH_TRADING_DESK,    agent: 'TradingExpert', emoji: '📊', color: 0x00c853 },
  { key: 'brain',          id: process.env.DISCORD_CH_BRAIN,           agent: 'Brain',         emoji: '🧠', color: 0x6600ea },
]

async function handleAgentsLog(req, res) {
  res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60')
  if (!BOT_TOKEN_MEM) return res.json({ log: [], stats: { lastScan: null, tasksToday: 0, totalAgents: 45, activeAgents: 0 } })
  try {
    const results = await Promise.allSettled(
      LOG_CHANNELS.filter(c => c.id).map(async ch => {
        const r = await fetch(`${DISCORD_API_MEM}/channels/${ch.id}/messages?limit=8`, { headers: { Authorization: `Bot ${BOT_TOKEN_MEM}` } })
        if (!r.ok) return []
        const msgs = await r.json()
        if (!Array.isArray(msgs)) return []
        return msgs.map(m => {
          const embed = m.embeds?.[0]
          const description = embed?.description || m.content || ''
          const rawColor = embed?.color ?? ch.color
          return { id: m.id, channel: ch.key, agent: embed?.author?.name || ch.agent, emoji: ch.emoji, color: '#' + rawColor.toString(16).padStart(6, '0'), summary: description.replace(/\*\*/g, '').slice(0, 160), timestamp: m.timestamp }
        }).filter(e => e.summary.length > 10)
      })
    )
    const log = results.flatMap(r => r.status === 'fulfilled' ? r.value : []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 40)
    const todayStr = new Date().toDateString()
    const tasksToday = log.filter(e => new Date(e.timestamp).toDateString() === todayStr).length
    const activeChannels = new Set(log.filter(e => (Date.now() - new Date(e.timestamp)) / 60000 < 20).map(e => e.channel))
    return res.json({ log, stats: { lastScan: log[0]?.timestamp || null, tasksToday, totalAgents: 45, activeAgents: activeChannels.size, activeChannels: [...activeChannels] } })
  } catch (e) {
    return res.json({ log: [], stats: { lastScan: null, tasksToday: 0, totalAgents: 45, activeAgents: 0 } })
  }
}

// ─── Handler HTTP ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!GITHUB_TOKEN) {
    return res.status(503).json({ error: 'GITHUB_TOKEN non configuré' })
  }

  try {
    if (req.method === 'GET') {
      // ?type=agents-log → activité Discord (fusionné depuis agents-log.js)
      if (req.query?.type === 'agents-log') {
        return handleAgentsLog(req, res)
      }
      const limit     = Math.min(parseInt(req.query?.limit || '30'), 100)
      const typeFilter = req.query?.type   // filter by entry type
      const statusFilter = req.query?.status // filter by status field
      let entries = await getMemoryEntries(limit)
      if (typeFilter) entries = entries.filter(e => e.type === typeFilter)
      if (statusFilter) entries = entries.filter(e => e.status === statusFilter)
      return res.json({ ok: true, entries, count: entries.length })
    }

    if (req.method === 'POST') {
      const entry = req.body
      if (!entry || typeof entry !== 'object') {
        return res.status(400).json({ error: 'Corps invalide' })
      }
      const saved = await addMemoryEntry(entry)
      return res.json({ ok: true, entry: saved })
    }

    return res.status(405).json({ error: 'Méthode non autorisée' })
  } catch (e) {
    console.error('memory handler error:', e.message)
    return res.status(500).json({ error: e.message })
  }
}
