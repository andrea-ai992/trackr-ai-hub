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
      const limit   = Math.min(parseInt(req.query?.limit || '30'), 100)
      const entries = await getMemoryEntries(limit)
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
