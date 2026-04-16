// ─── AGENT FORGE — Création Autonome de Nouveaux Agents ──────────────────────
// Appelé par Brain quand un gap de couverture est identifié
// Claude conçoit le nouvel agent, le code est commité sur GitHub
// POST /api/agent-forge { gap, context }
// GET  /api/agent-forge  — liste des agents forgés

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GITHUB_TOKEN      = process.env.GITHUB_TOKEN
const REPO              = 'andrea-ai992/trackr-ai-hub'
const GITHUB_API        = 'https://api.github.com'
const DISCORD_API       = 'https://discord.com/api/v10'
const BOT_TOKEN         = process.env.DISCORD_BOT_TOKEN
const CODE_REVIEW_CH    = process.env.DISCORD_CH_CODE_REVIEW

// ─── Fichier registre des agents ─────────────────────────────────────────────
const REGISTRY_FILE = 'AGENTS_REGISTRY.json'

// ─── GitHub helpers ───────────────────────────────────────────────────────────
const GH_HEADERS = {
  Authorization: `token ${GITHUB_TOKEN}`,
  Accept: 'application/vnd.github.v3+json',
  'Content-Type': 'application/json',
  'User-Agent': 'TrackrAgentForge/1.0',
}

async function ghRead(filePath) {
  const r = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${filePath}`, { headers: GH_HEADERS })
  if (r.status === 404) return { content: null, sha: null }
  if (!r.ok) throw new Error(`GitHub GET ${filePath} → ${r.status}`)
  const data = await r.json()
  return {
    content: Buffer.from(data.content, 'base64').toString('utf8'),
    sha: data.sha,
  }
}

async function ghWrite(filePath, content, sha, message) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    committer: { name: 'AnDy Forge', email: 'forge@trackr.ai' },
  }
  if (sha) body.sha = sha
  const r = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: GH_HEADERS,
    body: JSON.stringify(body),
  })
  if (!r.ok) {
    const err = await r.text()
    throw new Error(`GitHub PUT ${filePath} → ${r.status}: ${err}`)
  }
  return r.json()
}

// ─── Registre des agents forgés ──────────────────────────────────────────────
async function loadRegistry() {
  const { content, sha } = await ghRead(REGISTRY_FILE)
  if (!content) return { agents: [], sha: null }
  return { agents: JSON.parse(content).agents || [], sha }
}

async function saveRegistry(agents, sha) {
  const content = JSON.stringify({ agents, updated: new Date().toISOString() }, null, 2)
  return ghWrite(REGISTRY_FILE, content, sha, '[AgentForge] Update agents registry')
}

async function registerAgent(agentMeta, sha) {
  const { agents, sha: registrySha } = await loadRegistry()
  const existing = agents.findIndex(a => a.key === agentMeta.key)
  if (existing >= 0) {
    agents[existing] = { ...agents[existing], ...agentMeta, updated: new Date().toISOString() }
  } else {
    agents.push({ ...agentMeta, created: new Date().toISOString() })
  }
  await saveRegistry(agents, registrySha)
}

// ─── Discord notification ─────────────────────────────────────────────────────
async function notifyDiscord(title, description, fields = [], color = 0x6600ea) {
  if (!CODE_REVIEW_CH || !BOT_TOKEN) return
  await fetch(`${DISCORD_API}/channels/${CODE_REVIEW_CH}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        author: { name: '⚗️ Agent Forge — Nouvel Agent Déployé' },
        title,
        description: description.slice(0, 2000),
        color,
        fields: fields.slice(0, 5),
        footer: { text: 'Trackr Agent Forge · Auto-création' },
        timestamp: new Date().toISOString(),
      }],
    }),
  }).catch(() => {})
}

// ─── Design de l'agent avec Claude ───────────────────────────────────────────
async function designAgent(gap, context) {
  const prompt = `Tu es AgentForge, le système de création autonome d'agents IA de Trackr.

**Gap identifié :** ${gap}
**Contexte app :** ${context}

**Règles de l'architecture Trackr :**
- Les agents sont des modules Node.js ESM qui tournent sur Vercel serverless
- Chaque agent exporte une fonction principale: \`export async function run(ctx)\`
- ctx contient: { discord, vercelUrl, anthropicKey, hour }
- discord est: \`async (channelId, embed) => {}\`
- L'agent appelle l'API Anthropic directement (pas de SDK) ou des APIs externes
- Il poste ses résultats dans un canal Discord via ctx.discord()
- Il retourne \`{ ok: true, result: string, metrics: {} }\`

**Génère le JSON suivant (rien d'autre) :**
{
  "key": "snake_case_agent_key (ex: gas_monitor)",
  "name": "AgentName (ex: GasMonitor)",
  "emoji": "🔥",
  "role": "Description courte du rôle (< 50 chars)",
  "schedule": "always|5min|15min|4xday|2xday|1xday|on-demand",
  "category": "markets|dev|design|data|utility|ai-core",
  "channel_hint": "market-scanner|code-review|ui-review|reports|crypto|app-pulse",
  "description": "Ce que cet agent fait précisément",
  "file_path": "api/agents/{key}.js",
  "cron_schedule": "expression cron (ex: '0 */6 * * *') ou null si on-demand",
  "code": "CODE JAVASCRIPT COMPLET de l'agent (ESM, fonction run exportée, commentaires en français)"
}

Le code doit être fonctionnel, concis (< 150 lignes), utiliser des APIs publiques gratuites si besoin.
Pour les analyses IA, utiliser l'API Anthropic via ctx.anthropicKey.`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 6000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!r.ok) throw new Error(`Claude API → ${r.status}`)
  const data = await r.json()
  const text = data.content?.[0]?.text || ''

  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Claude response')
  return JSON.parse(jsonMatch[0])
}

// ─── Validation du code généré ────────────────────────────────────────────────
function validateAgentCode(code) {
  if (!code || typeof code !== 'string') throw new Error('Code vide')
  if (code.length < 100) throw new Error('Code trop court')
  if (!code.includes('export async function run')) throw new Error('Manque la fonction run exportée')
  // Blocklist : ne doit pas contenir de commandes dangereuses
  const dangerous = ['exec(', 'eval(', 'child_process', 'fs.writeFile', 'process.exit']
  for (const d of dangerous) {
    if (code.includes(d)) throw new Error(`Code dangereux : contient "${d}"`)
  }
  return true
}

// ─── Déploiement de l'agent sur GitHub ───────────────────────────────────────
async function deployAgent(design) {
  validateAgentCode(design.code)

  // Vérifier que le fichier n'existe pas déjà (éviter écrasement involontaire)
  const { content: existing } = await ghRead(design.file_path)
  if (existing) {
    throw new Error(`Agent ${design.file_path} existe déjà — mise à jour refusée (sécurité)`)
  }

  // Commit le code de l'agent
  await ghWrite(
    design.file_path,
    design.code,
    null,
    `[AgentForge] Create agent ${design.name}: ${design.role}`
  )

  return design.file_path
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!ANTHROPIC_API_KEY || !GITHUB_TOKEN) {
    return res.status(503).json({ error: 'ANTHROPIC_API_KEY ou GITHUB_TOKEN manquant' })
  }

  // ── GET : liste les agents forgés ─────────────────────────────────────────
  if (req.method === 'GET') {
    try {
      const { agents } = await loadRegistry()
      return res.json({ ok: true, agents, count: agents.length })
    } catch (e) {
      return res.json({ ok: true, agents: [], error: e.message })
    }
  }

  // ── POST : créer un nouvel agent ──────────────────────────────────────────
  if (req.method !== 'POST') return res.status(405).end()

  const { gap, context } = req.body || {}
  if (!gap) return res.status(400).json({ error: 'gap requis' })

  const startedAt = new Date().toISOString()
  console.log(`⚗️ AgentForge started — gap: ${gap}`)

  try {
    // 1. Demander à Claude de designer l'agent
    const design = await designAgent(gap, context || 'Trackr AI Hub')

    console.log(`⚗️ Agent designed: ${design.name} (${design.key})`)

    // 2. Déployer sur GitHub
    const deployedPath = await deployAgent(design)

    // 3. Enregistrer dans le registre
    await registerAgent({
      key:          design.key,
      name:         design.name,
      emoji:        design.emoji,
      role:         design.role,
      schedule:     design.schedule,
      category:     design.category,
      channelHint:  design.channel_hint,
      description:  design.description,
      filePath:     design.file_path,
      cronSchedule: design.cron_schedule,
      gap,
    })

    // 4. Notifier Discord
    await notifyDiscord(
      `✅ Nouvel agent déployé : ${design.emoji} ${design.name}`,
      `**Rôle :** ${design.role}\n\n**Pourquoi :** ${design.description}\n\n**Gap comblé :** ${gap}`,
      [
        { name: 'Fichier',    value: `\`${design.file_path}\``,   inline: true },
        { name: 'Schedule',   value: design.schedule,             inline: true },
        { name: 'Catégorie',  value: design.category,             inline: true },
        { name: 'Cron',       value: design.cron_schedule || 'on-demand', inline: false },
      ]
    )

    return res.json({
      ok:        true,
      agent:     design.name,
      key:       design.key,
      filePath:  deployedPath,
      role:      design.role,
      schedule:  design.schedule,
      startedAt,
      deployedAt: new Date().toISOString(),
    })

  } catch (e) {
    console.error('AgentForge error:', e.message)
    await notifyDiscord(
      '⚠️ AgentForge — Erreur création agent',
      `**Gap :** ${gap}\n**Erreur :** ${e.message}`,
      [],
      0xef4444
    )
    return res.status(500).json({ error: e.message, gap, startedAt })
  }
}
