// ─── REPORTS — Rapports Automatiques IA ──────────────────────────────────────
// Génère des rapports structurés sur l'activité autonome de l'IA
// Posté dans Discord + accessible via API dans l'app
// GET /api/reports?type=daily|weekly|summary&format=discord|json

import { getMemoryEntries } from './memory.js'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const DISCORD_API       = 'https://discord.com/api/v10'
const BOT_TOKEN         = process.env.DISCORD_BOT_TOKEN
const GITHUB_TOKEN      = process.env.GITHUB_TOKEN
const REPO              = 'andrea-ai992/trackr-ai-hub'
const GITHUB_API        = 'https://api.github.com'

const CH = {
  reports:  process.env.DISCORD_CH_REPORTS,
  code:     process.env.DISCORD_CH_CODE_REVIEW,
  brain:    process.env.DISCORD_CH_BRAIN || process.env.DISCORD_CH_CODE_REVIEW,
}

// ─── Discord helper ───────────────────────────────────────────────────────────
async function discord(channelId, embeds) {
  if (!channelId || !BOT_TOKEN) return
  const embedArray = Array.isArray(embeds) ? embeds : [embeds]
  return fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: embedArray.map(e => ({ ...e, timestamp: new Date().toISOString() })) }),
  }).catch(() => {})
}

// ─── Lire l'historique Git des commits récents ───────────────────────────────
async function getRecentCommits(limit = 20) {
  try {
    const r = await fetch(
      `${GITHUB_API}/repos/${REPO}/commits?per_page=${limit}&author=AnDy+Auto-Improve`,
      {
        headers: {
          Authorization: `token ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'TrackrReports/1.0',
        },
      }
    )
    if (!r.ok) return []
    const data = await r.json()
    return data.map(c => ({
      sha:     c.sha?.slice(0, 7),
      message: c.commit?.message?.slice(0, 100),
      date:    c.commit?.author?.date,
      author:  c.commit?.author?.name,
    }))
  } catch { return [] }
}

// ─── Analyser la mémoire pour générer les stats ──────────────────────────────
function computeStats(entries, daysBack = 7) {
  const since = Date.now() - daysBack * 86400000
  const window = entries.filter(e => new Date(e.timestamp).getTime() > since)

  const brainCycles    = window.filter(e => e.type === 'brain_cycle')
  const improvements   = window.filter(e => e.type === 'improvement' && e.applied)
  const errors         = window.filter(e => e.type === 'error')
  const noChanges      = window.filter(e => e.type === 'no_change')
  const dryruns        = window.filter(e => e.type === 'dry_run')

  // Répartition par focus
  const byFocus = {}
  improvements.forEach(e => {
    byFocus[e.focus] = (byFocus[e.focus] || 0) + 1
  })

  // Répartition par sévérité
  const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 }
  improvements.forEach(e => {
    if (e.severity && bySeverity[e.severity] !== undefined) {
      bySeverity[e.severity]++
    }
  })

  // Fichiers les plus touchés
  const fileCounts = {}
  improvements.forEach(e => {
    if (e.file) fileCounts[e.file] = (fileCounts[e.file] || 0) + 1
  })
  const topFiles = Object.entries(fileCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  // Taux de succès Brain
  const brainSuccess = brainCycles.filter(c => c.improved).length
  const brainHealthy = brainCycles.filter(c => c.appHealthy).length

  // Leçons apprises
  const lessons = [...new Set(
    improvements.filter(e => e.learned).map(e => e.learned)
  )].slice(0, 5)

  // Agents forgés
  const forgedAgents = window.filter(e => e.type === 'agent_forged')

  return {
    window: daysBack,
    total:           window.length,
    brainCycles:     brainCycles.length,
    improvements:    improvements.length,
    errors:          errors.length,
    noChanges:       noChanges.length,
    dryruns:         dryruns.length,
    forgedAgents:    forgedAgents.length,
    byFocus,
    bySeverity,
    topFiles,
    lessons,
    successRate:     window.length > 0 ? Math.round(improvements.length / window.length * 100) : 0,
    brainSuccessRate: brainCycles.length > 0 ? Math.round(brainSuccess / brainCycles.length * 100) : 0,
    appUptime:       brainCycles.length > 0 ? Math.round(brainHealthy / brainCycles.length * 100) : 100,
  }
}

// ─── Générer une analyse narrative avec Claude ────────────────────────────────
async function generateNarrative(stats, type) {
  if (!ANTHROPIC_API_KEY) return null

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001', // Haiku = rapide et pas cher pour les résumés
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `Tu es AnDy, l'IA autonome de Trackr. Génère un résumé ${type === 'weekly' ? 'hebdomadaire' : 'quotidien'} percutant en 3-4 phrases maximum.

Stats:
- ${stats.improvements} améliorations appliquées (${stats.successRate}% succès)
- ${stats.brainCycles} cycles autonomes, ${stats.errors} erreurs
- Focus: ${JSON.stringify(stats.byFocus)}
- Sévérités: ${JSON.stringify(stats.bySeverity)}
- Top fichiers: ${stats.topFiles.map(([f, n]) => `${f}(${n})`).join(', ')}
- ${stats.forgedAgents} nouveaux agents créés
- Leçons: ${stats.lessons.join(' | ')}

Ton : confiant, analytique, orienté résultats. En français.`,
      }],
    }),
  })
  if (!r.ok) return null
  const d = await r.json()
  return d.content?.[0]?.text || null
}

// ─── Rapport Quotidien ────────────────────────────────────────────────────────
async function generateDailyReport() {
  const entries  = await getMemoryEntries(100)
  const stats    = computeStats(entries, 1) // dernières 24h
  const commits  = await getRecentCommits(10)
  const narrative = await generateNarrative(stats, 'daily')

  const focusBar = Object.entries(stats.byFocus)
    .map(([f, n]) => `${f}: ${n}`)
    .join(' · ') || 'aucune amélioration'

  const sevBar = [
    stats.bySeverity.critical > 0 ? `🔴 ${stats.bySeverity.critical} critique` : '',
    stats.bySeverity.high     > 0 ? `🟠 ${stats.bySeverity.high} élevé`        : '',
    stats.bySeverity.medium   > 0 ? `🟡 ${stats.bySeverity.medium} moyen`      : '',
    stats.bySeverity.low      > 0 ? `⚪ ${stats.bySeverity.low} faible`         : '',
  ].filter(Boolean).join(' · ') || 'Aucune'

  const commitsText = commits.length > 0
    ? commits.slice(0, 5).map(c => `• \`${c.sha}\` ${c.message}`).join('\n')
    : 'Aucun commit autonome aujourd\'hui'

  const embeds = [
    {
      author: { name: '📊 Rapport Quotidien — AnDy IA Autonome' },
      title:  `Bilan du ${new Date().toLocaleDateString('fr-FR')}`,
      description: narrative || `L'IA a effectué **${stats.improvements}** améliorations aujourd'hui avec un taux de succès de **${stats.successRate}%**.`,
      color: stats.successRate >= 60 ? 0x00daf3 : stats.successRate >= 30 ? 0xf59e0b : 0xef4444,
      fields: [
        {
          name: '🧠 Cycles Brain',
          value: `**${stats.brainCycles}** cycles · App uptime **${stats.appUptime}%** · Succès amélioration **${stats.brainSuccessRate}%**`,
          inline: false,
        },
        {
          name: '🔧 Améliorations (24h)',
          value: `**${stats.improvements}** appliquées · ${stats.errors} erreurs · ${stats.noChanges} sans changement\n${focusBar}`,
          inline: false,
        },
        {
          name: '🎯 Sévérités résolues',
          value: sevBar || 'Aucune',
          inline: false,
        },
        {
          name: '📂 Fichiers les plus améliorés',
          value: stats.topFiles.length > 0
            ? stats.topFiles.map(([f, n]) => `\`${f}\` (${n}×)`).join('\n')
            : 'Aucun',
          inline: false,
        },
        {
          name: `⚗️ Commits autonomes`,
          value: commitsText.slice(0, 900),
          inline: false,
        },
      ].filter(f => f.value !== 'Aucun' || f.name.includes('Cycles')),
      footer: { text: `Trackr Autonomous · ${stats.total} événements analysés` },
    },
  ]

  // Leçons apprises (si on en a)
  if (stats.lessons.length > 0) {
    embeds[0].fields.push({
      name: '💡 Leçons apprises aujourd\'hui',
      value: stats.lessons.map(l => `• ${l}`).join('\n').slice(0, 800),
      inline: false,
    })
  }

  return { embeds, stats }
}

// ─── Rapport Hebdomadaire ─────────────────────────────────────────────────────
async function generateWeeklyReport() {
  const entries   = await getMemoryEntries(150)
  const stats7    = computeStats(entries, 7)
  const stats24   = computeStats(entries, 1)
  const commits   = await getRecentCommits(20)
  const narrative = await generateNarrative(stats7, 'weekly')

  // Évolution (7j vs jour en cours)
  const trend = stats7.improvements > 0
    ? Math.round((stats24.improvements / (stats7.improvements / 7)) * 100) - 100
    : 0
  const trendEmoji = trend > 10 ? '📈' : trend < -10 ? '📉' : '➡️'

  const embeds = [
    {
      author: { name: '🔭 Rapport Hebdomadaire — AnDy IA Autonome' },
      title:  `Semaine du ${new Date(Date.now() - 7 * 86400000).toLocaleDateString('fr-FR')} au ${new Date().toLocaleDateString('fr-FR')}`,
      description: narrative || `Sur 7 jours, l'IA a opéré **${stats7.brainCycles}** cycles autonomes avec **${stats7.improvements}** améliorations appliquées.`,
      color: 0x6600ea,
      fields: [
        {
          name: '📊 Vue d\'ensemble 7 jours',
          value: [
            `🧠 **${stats7.brainCycles}** cycles Brain`,
            `✅ **${stats7.improvements}** améliorations`,
            `❌ **${stats7.errors}** erreurs`,
            `⚗️ **${stats7.forgedAgents}** nouveaux agents créés`,
            `📈 Taux de succès : **${stats7.successRate}%**`,
            `🌐 Uptime app : **${stats7.appUptime}%**`,
          ].join('\n'),
          inline: false,
        },
        {
          name: `${trendEmoji} Tendance (vs moyenne semaine)`,
          value: `Aujourd'hui : **${stats24.improvements}** améliorations · ${trend > 0 ? '+' : ''}${trend}% vs moyenne quotidienne`,
          inline: false,
        },
        {
          name: '🔧 Répartition par domaine',
          value: Object.entries(stats7.byFocus).length > 0
            ? Object.entries(stats7.byFocus).map(([f, n]) => `**${f}**: ${n} améliorations`).join('\n')
            : 'Aucune répartition disponible',
          inline: true,
        },
        {
          name: '🎯 Sévérités résolues',
          value: [
            `🔴 Critique : ${stats7.bySeverity.critical}`,
            `🟠 Élevé : ${stats7.bySeverity.high}`,
            `🟡 Moyen : ${stats7.bySeverity.medium}`,
            `⚪ Faible : ${stats7.bySeverity.low}`,
          ].join('\n'),
          inline: true,
        },
        {
          name: '📂 Top fichiers améliorés',
          value: stats7.topFiles.length > 0
            ? stats7.topFiles.map(([f, n]) => `\`${f}\` — ${n}×`).join('\n')
            : 'Aucun',
          inline: false,
        },
        {
          name: `💡 ${stats7.lessons.length} leçons apprises cette semaine`,
          value: stats7.lessons.length > 0
            ? stats7.lessons.map(l => `• ${l}`).join('\n').slice(0, 900)
            : 'Pas encore de leçons enregistrées.',
          inline: false,
        },
        {
          name: `🔗 ${commits.length} commits autonomes`,
          value: commits.slice(0, 8).map(c => `• \`${c.sha}\` ${c.message}`).join('\n').slice(0, 900) || 'Aucun',
          inline: false,
        },
      ],
      footer: { text: `Trackr Autonomous · ${stats7.total} événements · Généré automatiquement` },
    },
  ]

  return { embeds, stats: stats7 }
}

// ─── Rapport de Résumé (pour l'app) ──────────────────────────────────────────
async function generateSummary() {
  const entries = await getMemoryEntries(50)
  const stats   = computeStats(entries, 7)
  const last    = entries[0]

  return {
    lastActivity:    last?.timestamp || null,
    lastAction:      last?.type || null,
    lastFile:        last?.file || null,
    improvements:    stats.improvements,
    successRate:     stats.successRate,
    appUptime:       stats.appUptime,
    brainCycles:     stats.brainCycles,
    forgedAgents:    stats.forgedAgents,
    topFocus:        Object.entries(stats.byFocus).sort((a, b) => b[1] - a[1])[0]?.[0] || null,
    lessons:         stats.lessons,
    topFiles:        stats.topFiles,
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'GET') return res.status(405).end()

  const type    = req.query?.type || 'summary'
  const post    = req.query?.post === 'true'  // poster sur Discord aussi
  const hour    = new Date().getUTCHours()

  try {
    // ── summary : résumé compact pour l'app ──────────────────────────────────
    if (type === 'summary') {
      const summary = await generateSummary()
      return res.json({ ok: true, summary })
    }

    // ── daily : rapport quotidien ─────────────────────────────────────────────
    if (type === 'daily') {
      const { embeds, stats } = await generateDailyReport()
      if (post || hour === 8) {
        await discord(CH.reports, embeds)
      }
      return res.json({ ok: true, stats, posted: post || hour === 8 })
    }

    // ── weekly : rapport hebdomadaire ─────────────────────────────────────────
    if (type === 'weekly') {
      const { embeds, stats } = await generateWeeklyReport()
      if (post || (new Date().getUTCDay() === 0 && hour === 9)) {
        await discord(CH.reports, embeds)
        await discord(CH.code, embeds) // aussi dans code-review
      }
      return res.json({ ok: true, stats, posted: post })
    }

    return res.status(400).json({ error: 'Type invalide. Utilise : summary | daily | weekly' })

  } catch (e) {
    console.error('reports error:', e.message)
    return res.status(500).json({ error: e.message })
  }
}
