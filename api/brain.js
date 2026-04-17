// ─── BRAIN — Orchestrateur Central Autonome ──────────────────────────────────
// Tourne toutes les heures via cron Vercel
// Lit la mémoire → analyse → décide → dispatche → rapporte → apprend
// GET  /api/brain          — déclenchement manuel
// POST /api/brain          — déclenchement interne (depuis discord-cron)

import { getMemoryEntries, addMemoryEntry, formatMemoryForPrompt } from './memory.js'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const DISCORD_API       = 'https://discord.com/api/v10'
const BOT_TOKEN         = process.env.DISCORD_BOT_TOKEN
const GITHUB_TOKEN      = process.env.GITHUB_TOKEN
const REPO              = process.env.GITHUB_REPO || 'andrea-ai992/trackr-ai-hub'
const GITHUB_API        = 'https://api.github.com'
const VERCEL_URL        = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

// ─── Canaux Discord ───────────────────────────────────────────────────────────
const CH = {
  brain:       process.env.DISCORD_CH_BRAIN       || process.env.DISCORD_CH_CODE_REVIEW,
  market:      process.env.DISCORD_CH_MARKET_SCANNER,
  code:        process.env.DISCORD_CH_CODE_REVIEW,
  ui:          process.env.DISCORD_CH_UI_REVIEW,
  reports:     process.env.DISCORD_CH_REPORTS,
  appPulse:    process.env.DISCORD_CH_APP_PULSE,
  crypto:      process.env.DISCORD_CH_CRYPTO,
}

// ─── Rotation des focus d'amélioration ───────────────────────────────────────
const FOCUS_CYCLE = ['bugs', 'security', 'performance', 'frontend', 'features']

// ─── Discord post helper ──────────────────────────────────────────────────────
async function discord(channelId, embed) {
  if (!channelId || !BOT_TOKEN) return
  return fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [{ ...embed, timestamp: new Date().toISOString() }] }),
    signal: AbortSignal.timeout(8000),
  }).catch(() => {})
}

// ─── Appel à Claude (décision Brain) ─────────────────────────────────────────
async function askBrain(systemPrompt, userPrompt) {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-beta': 'prompt-caching-2024-07-31',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
      messages: [{ role: 'user', content: userPrompt }],
    }),
    signal: AbortSignal.timeout(30000),
  })
  if (!r.ok) {
    const errBody = await r.text().catch(() => '')
    throw new Error(`Claude API → ${r.status}: ${errBody.slice(0, 200)}`)
  }
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json') && !ct.includes('text/json')) {
    const body = await r.text().catch(() => '')
    throw new Error(`Claude API unexpected content-type "${ct}": ${body.slice(0, 200)}`)
  }
  const d = await r.json().catch(e => { throw new Error(`Claude API JSON parse error: ${e.message}`) })
  return d.content?.[0]?.text || ''
}

// ─── Lecture des fichiers GitHub ──────────────────────────────────────────────
async function ghGet(path) {
  const r = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'TrackrBrain/1.0',
    },
    signal: AbortSignal.timeout(10000),
  })
  if (!r.ok) return null
  return r.json()
}

async function getFileContent(filePath) {
  const data = await ghGet(`/repos/${REPO}/contents/${filePath}`)
  if (!data?.content) return null
  return Buffer.from(data.content, 'base64').toString('utf8')
}

// ─── Analyse de la mémoire — identifier les patterns ─────────────────────────
function analyzeMemory(entries) {
  if (!entries.length) return { gaps: [], recurringErrors: [], successRate: 0, lastFocus: null }

  const last7d = entries.filter(e => {
    const age = Date.now() - new Date(e.timestamp).getTime()
    return age < 7 * 86400000
  })

  const applied     = last7d.filter(e => e.applied).length
  const errors      = last7d.filter(e => e.type === 'error')
  const noChanges   = last7d.filter(e => e.type === 'no_change').length
  const lastFocus   = last7d.find(e => e.focus)?.focus || null

  // Erreurs récurrentes (même message 2+ fois)
  const errorMap = {}
  errors.forEach(e => {
    const key = (e.error || '').slice(0, 60)
    errorMap[key] = (errorMap[key] || 0) + 1
  })
  const recurringErrors = Object.entries(errorMap)
    .filter(([, n]) => n >= 2)
    .map(([msg, count]) => ({ msg, count }))

  // Focus couverts récemment (éviter répétition dans 24h)
  const recentFocuses = new Set(
    entries.filter(e => {
      const age = Date.now() - new Date(e.timestamp).getTime()
      return age < 24 * 3600000 && e.focus
    }).map(e => e.focus)
  )

  // Gaps = focus pas couverts récemment
  const gaps = FOCUS_CYCLE.filter(f => !recentFocuses.has(f))

  return {
    gaps,
    recurringErrors,
    successRate: last7d.length > 0 ? Math.round(applied / last7d.length * 100) : 0,
    lastFocus,
    totalWeek: last7d.length,
    appliedWeek: applied,
    noChanges,
  }
}

// ─── Décision Brain : choisir le prochain focus d'amélioration ───────────────
function decideFocus(analysis) {
  // Si des gaps existent, prendre le premier
  if (analysis.gaps.length > 0) return analysis.gaps[0]

  // Sinon rotation cyclique
  const idx = FOCUS_CYCLE.indexOf(analysis.lastFocus)
  return FOCUS_CYCLE[(idx + 1) % FOCUS_CYCLE.length]
}

// ─── Auth header pour appels internes ────────────────────────────────────────
function internalHeaders(extra = {}) {
  return {
    'Content-Type': 'application/json',
    'x-cron-secret': process.env.CRON_SECRET || '',
    Authorization: `Bearer ${process.env.CRON_SECRET || ''}`,
    ...extra,
  }
}

// ─── Appel self-improve ───────────────────────────────────────────────────────
async function triggerSelfImprove(focus, dry = false) {
  try {
    const url = `${VERCEL_URL}/api/self-improve?focus=${focus}${dry ? '&dry=true' : ''}`
    const r = await fetch(url, {
      headers: internalHeaders(),
      signal: AbortSignal.timeout(50000),
    })
    if (!r.ok) {
      const txt = await r.text().catch(() => r.status)
      throw new Error(`self-improve ${r.status}: ${txt}`)
    }
    return r.json()
  } catch (e) {
    console.error('triggerSelfImprove:', e.message)
    return { error: e.message }
  }
}

// ─── Appel trigger-agent ──────────────────────────────────────────────────────
async function triggerAgent(agent, task, channelHint) {
  try {
    const r = await fetch(`${VERCEL_URL}/api/trigger-agent`, {
      method: 'POST',
      headers: internalHeaders(),
      body: JSON.stringify({ agent, task, channelHint }),
      signal: AbortSignal.timeout(45000),
    })
    if (!r.ok) throw new Error(`trigger-agent ${r.status}`)
    return r.json()
  } catch (e) {
    console.error('triggerAgent:', e.message)
    return { error: e.message }
  }
}

// ─── Génération du plan de cycle (quels agents tourner cette heure) ───────────
async function generateCyclePlan(memory, analysis, hour) {
  const memContext = formatMemoryForPrompt(memory)

  const systemPrompt = `Tu es le Cerveau (Brain) de Trackr, un système d'IA multi-agents autonome.
Tu dois décider exactement quels agents activer ce cycle et quelles tâches leur donner.
Réponds UNIQUEMENT en JSON valide, rien d'autre.`

  const userPrompt = `Heure UTC actuelle : ${hour}h
Analyse mémoire : successRate=${analysis.successRate}%, gaps=${analysis.gaps.join(',')}, erreurs récurrentes=${analysis.recurringErrors.length}
${memContext}

Génère le plan du cycle en JSON :
{
  "agents_to_run": [
    {
      "agent": "nom de l'agent (ex: MarketScanner, CodeReviewer, UIInspector)",
      "task": "tâche précise à accomplir",
      "channel_hint": "code-review|market-scanner|ui-review|reports|crypto",
      "priority": "high|medium|low"
    }
  ],
  "self_improve_focus": "bugs|security|performance|features|frontend ou null",
  "new_agent_needed": {
    "needed": true/false,
    "gap_description": "description du gap si needed=true"
  },
  "cycle_rationale": "Explication courte de la stratégie de ce cycle (2 phrases)"
}

Contraintes :
- Max 4 agents à activer (Vercel timeout 60s)
- Si successRate < 50%, priorise bugs
- Choisis des tâches utiles et concrètes
- self_improve_focus: null si déjà fait dans la dernière heure`

  try {
    const text = await askBrain(systemPrompt, userPrompt)
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) return null
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

// ─── Analyse santé de l'app ───────────────────────────────────────────────────
async function checkAppHealth() {
  const start = Date.now()
  try {
    // Ping léger — on vérifie que l'API répond, sans consommer de tokens Claude
    const r = await fetch(`${VERCEL_URL}/api/memory`, {
      signal: AbortSignal.timeout(10000),
    })
    const latency = Date.now() - start
    return { ok: r.ok, latency, status: r.status }
  } catch (e) {
    return { ok: false, latency: Date.now() - start, error: e.message }
  }
}

// ─── Vérification si de nouveaux agents doivent être créés ───────────────────
async function checkForNewAgentNeed(plan) {
  if (!plan?.new_agent_needed?.needed) return
  if (!plan.new_agent_needed.gap_description) return

  try {
    await fetch(`${VERCEL_URL}/api/agent-forge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        gap: plan.new_agent_needed.gap_description,
        context: 'Trackr app — IA multi-agents autonome finance/crypto/dev',
      }),
      signal: AbortSignal.timeout(55000),
    })
  } catch { /* non bloquant */ }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).end()
  }

  const cycleStart = Date.now()
  const now        = new Date()
  const hour       = now.getUTCHours()
  const cycleId    = `brain_${cycleStart}`

  const cycle = {
    id:          cycleId,
    startedAt:   now.toISOString(),
    hour,
    actions:     [],
    errors:      [],
    agentsRan:   [],
    improveResult: null,
    healthCheck: null,
  }

  console.log(`🧠 Brain cycle started — ${now.toISOString()}`)

  try {
    // ── 1. Vérification santé de l'app ────────────────────────────────────────
    const health = await checkAppHealth()
    cycle.healthCheck = health
    if (!health.ok) {
      cycle.errors.push(`App health failed: ${health.error || health.status}`)
    }

    // ── 2. Charger la mémoire ─────────────────────────────────────────────────
    const memory   = await getMemoryEntries(40)
    const analysis = analyzeMemory(memory)
    cycle.analysis = analysis

    // ── 3. Générer le plan du cycle avec Claude ───────────────────────────────
    const plan = await generateCyclePlan(memory, analysis, hour)
    cycle.plan = plan

    // ── 4. Exécuter les agents planifiés ─────────────────────────────────────
    if (plan?.agents_to_run?.length > 0) {
      const agentResults = await Promise.allSettled(
        plan.agents_to_run
          .filter(a => a.priority !== 'low' || Math.random() < 0.4) // low priority: 40% chance
          .map(a => triggerAgent(a.agent, a.task, a.channel_hint))
      )
      agentResults.forEach((r, i) => {
        const agent = plan.agents_to_run[i]
        if (r.status === 'fulfilled' && r.value) {
          cycle.agentsRan.push({ agent: agent.agent, task: agent.task, ok: true })
        } else {
          cycle.errors.push(`Agent ${agent?.agent} failed`)
        }
      })
    }

    // ── 5. Déclenchement self-improve ─────────────────────────────────────────
    if (plan?.self_improve_focus) {
      const improveResult = await triggerSelfImprove(plan.self_improve_focus)
      cycle.improveResult = improveResult
      if (improveResult?.changed) {
        cycle.actions.push(`✅ Code amélioré (${plan.self_improve_focus}): ${improveResult.problem}`)
      }
    } else if (!plan) {
      // Fallback si le plan a échoué : rotation simple
      const focus = decideFocus(analysis)
      const improveResult = await triggerSelfImprove(focus)
      cycle.improveResult = improveResult
    }

    // ── 6. Vérifier besoin de nouveaux agents (non-bloquant) ─────────────────
    checkForNewAgentNeed(plan) // fire and forget

    // ── 7. Post résumé Discord ────────────────────────────────────────────────
    const duration = Math.round((Date.now() - cycleStart) / 1000)
    const improved = cycle.improveResult?.changed
    const color    = cycle.errors.length === 0 ? 0x00daf3 : 0xf59e0b

    await discord(CH.brain, {
      author: { name: '🧠 Brain — Cycle Autonome' },
      title:  `Cycle ${hour}h UTC — ${cycle.agentsRan.length} agent(s) · ${duration}s`,
      description: [
        plan?.cycle_rationale ? `*${plan.cycle_rationale}*` : '',
        '',
        `**Santé app:** ${health.ok ? `🟢 ${health.latency}ms` : '🔴 Hors ligne'}`,
        `**Mémoire:** ${memory.length} entrées · succès 7j: ${analysis.successRate}%`,
        improved ? `**Code amélioré:** \`${cycle.improveResult.file}\` — ${cycle.improveResult.problem}` : '',
        cycle.errors.length > 0 ? `**Erreurs:** ${cycle.errors.join(', ')}` : '',
      ].filter(Boolean).join('\n'),
      color,
      fields: cycle.agentsRan.length > 0 ? [
        {
          name: `🤖 Agents (${cycle.agentsRan.length})`,
          value: cycle.agentsRan.map(a => `• **${a.agent}** — ${a.task.slice(0, 60)}`).join('\n').slice(0, 1000),
          inline: false,
        },
      ] : [],
      footer: { text: `Brain ID: ${cycleId} · Trackr Autonomous` },
    })

    // ── 8. Enregistrer en mémoire ─────────────────────────────────────────────
    await addMemoryEntry({
      type:          'brain_cycle',
      hour,
      successRate:   analysis.successRate,
      agentsRan:     cycle.agentsRan.length,
      improved:      !!improved,
      improvedFile:  cycle.improveResult?.file || null,
      focus:         plan?.self_improve_focus || null,
      errors:        cycle.errors.length,
      appHealthy:    health.ok,
      duration,
    }).catch(() => {})

    return res.json({
      ok:       true,
      cycleId,
      duration,
      agentsRan: cycle.agentsRan.length,
      improved: !!improved,
      errors:   cycle.errors.length,
      health:   health.ok,
    })

  } catch (e) {
    console.error('Brain cycle error:', e.message)
    await discord(CH.brain, {
      author: { name: '🧠 Brain — ERREUR CRITIQUE' },
      title:  `Cycle ${hour}h UTC — Échec`,
      description: `**Erreur :** ${e.message}\n\nLe cycle sera réessayé à la prochaine heure.`,
      color: 0xef4444,
    })
    return res.status(500).json({ error: e.message })
  }
}
