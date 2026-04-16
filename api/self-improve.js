// ─── Self-Improve — AnDy lit le code et s'améliore automatiquement ───────────
// GET /api/self-improve?focus=security|performance|features|bugs|frontend
// Lit les fichiers clés, les analyse avec Claude, commit les améliorations
// v2 : utilise la mémoire pour éviter les doublons et apprendre des patterns

import { getMemoryEntries, getRecentFixesForFile, addMemoryEntry, formatMemoryForPrompt } from './memory.js'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = process.env.GITHUB_REPO || 'andrea-ai992/trackr-ai-hub'
const GITHUB_API = 'https://api.github.com'
const DISCORD_API = 'https://discord.com/api/v10'
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CODE_REVIEW_CH = process.env.DISCORD_CH_CODE_REVIEW
const ANNONCES_CH = process.env.DISCORD_CH_ANNONCES
const APP_URL = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

// ─── Files AnDy can read and improve ─────────────────────────────────────────
// L'IA peut lire et corriger tous ces fichiers, y compris ses propres orchestrateurs
const READABLE_FILES = [
  // Core API
  'api/andy.js',
  'api/_security.js',
  'api/discord.js',
  'api/discord-cron.js',
  'api/trigger-agent.js',
  'api/trading-expert.js',
  'api/monitor.js',
  // Nouveaux modules IA
  'api/real-estate.js',
  'api/business-plan.js',
  'api/watch-price.js',
  // IA autonome (l'IA peut se corriger elle-même — sauf memory.js et self-improve.js)
  'api/brain.js',
  'api/reports.js',
  'api/morning.js',
  'api/agent-forge.js',
  // Frontend — pages
  'src/pages/Andy.jsx',
  'src/pages/Agents.jsx',
  'src/pages/BrainStatus.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Markets.jsx',
  'src/pages/Sports.jsx',
  'src/pages/News.jsx',
  'src/pages/Portfolio.jsx',
  'src/pages/More.jsx',
  'src/pages/Watches.jsx',
  'src/pages/RealEstate.jsx',
  'src/pages/BusinessPlan.jsx',
  // Frontend — components + CSS
  'src/components/BottomNav.jsx',
  'src/components/Skeleton.jsx',
  'src/App.jsx',
  'src/index.css',
]

// ─── GitHub helpers ───────────────────────────────────────────────────────────
async function ghGet(path) {
  const r = await fetch(`${GITHUB_API}${path}`, {
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'User-Agent': 'TrackrAnDy/1.0',
    },
  })
  if (!r.ok) throw new Error(`GitHub GET ${path} → ${r.status}`)
  return r.json()
}

async function getFileContent(filePath) {
  try {
    const data = await ghGet(`/repos/${REPO}/contents/${filePath}`)
    return {
      content: Buffer.from(data.content, 'base64').toString('utf8'),
      sha: data.sha,
    }
  } catch (e) {
    return null
  }
}

async function commitFile(filePath, content, sha, message) {
  const r = await fetch(`${GITHUB_API}/repos/${REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'TrackrAnDy/1.0',
    },
    body: JSON.stringify({
      message,
      content: Buffer.from(content).toString('base64'),
      sha,
    }),
  })
  if (!r.ok) {
    const e = await r.text()
    throw new Error(`GitHub PUT ${filePath} → ${r.status}: ${e}`)
  }
  return r.json()
}

// ─── Post to Discord code-review channel ─────────────────────────────────────
async function postDiscord(title, description, fields = [], color = 0x8b5cf6) {
  if (!CODE_REVIEW_CH || !BOT_TOKEN) return
  await fetch(`${DISCORD_API}/channels/${CODE_REVIEW_CH}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        author: { name: '🧠 AnDy — Self-Improvement Engine' },
        title,
        description: description.slice(0, 3000),
        color,
        fields: fields.slice(0, 5),
        footer: { text: 'Trackr Auto-Learn · github.com/andrea-ai992/trackr-ai-hub' },
        timestamp: new Date().toISOString(),
      }],
    }),
  }).catch(() => {})
}

// ─── Notify admin (#annonces) for critical changes ────────────────────────────
async function notifyAdminCritical(improvement) {
  if (!ANNONCES_CH || !BOT_TOKEN) return
  const severityColor = { critical: 0xef4444, high: 0xf97316, medium: 0x6600ea, low: 0x374151 }
  const shouldNotify = improvement.severity === 'critical' || improvement.severity === 'high'
  if (!shouldNotify) return

  await fetch(`${DISCORD_API}/channels/${ANNONCES_CH}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: improvement.severity === 'critical' ? '🚨 **Correction critique appliquée — Mise à jour en cours**' : null,
      embeds: [{
        author: { name: '⚡ AnDy — Changement important détecté & corrigé' },
        title: `[${improvement.severity.toUpperCase()}] ${improvement.problem}`,
        description: improvement.explanation,
        color: severityColor[improvement.severity] || 0x6600ea,
        fields: [
          { name: '📂 Fichier modifié', value: `\`${improvement.file}\``, inline: true },
          { name: '🌿 Commit', value: improvement.commit_message, inline: true },
          { name: '🔗 Voir l\'app', value: `[trackr-app-nu.vercel.app](${APP_URL})`, inline: false },
          ...(improvement.learned ? [{ name: '💡 Leçon apprise', value: improvement.learned, inline: false }] : []),
        ],
        footer: { text: 'AnDy Auto-Improve · Déploiement Vercel déclenché automatiquement' },
        timestamp: new Date().toISOString(),
      }],
    }),
  }).catch(() => {})
}

// ─── Fetch pending admin tasks from memory ────────────────────────────────────
async function getPendingAdminTask() {
  try {
    const r = await fetch(`${APP_URL}/api/memory?type=admin_task&status=pending&limit=50`, {
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return null
    const data = await r.json()
    const tasks = (data.entries || []).filter(e => e.status === 'pending')
    return tasks.length > 0 ? tasks[tasks.length - 1] : null // oldest pending first
  } catch { return null }
}

// ─── Known error patterns to scan for proactively ────────────────────────────
const KNOWN_ERROR_PATTERNS = [
  {
    id: 'sse_json_parse',
    pattern: /res\.json\(\)|await res\.json\(\)/,
    files: ['api/discord.js', 'api/andy.js'],
    description: 'Calling .json() on an SSE (text/event-stream) response — must read stream instead',
    severity: 'critical',
  },
  {
    id: 'vercel_url_empty',
    pattern: /process\.env\.VERCEL_URL/,
    files: ['api/andy.js', 'api/discord.js', 'api/brain.js', 'api/morning.js'],
    description: 'Using VERCEL_URL which is empty in production — use APP_URL instead',
    severity: 'high',
  },
  {
    id: 'fetch_no_timeout',
    pattern: /await fetch\([^)]+\)(?!.*AbortSignal|.*timeout)/,
    files: ['api/andy.js', 'api/trading-expert.js', 'api/brain.js'],
    description: 'fetch() call without AbortSignal.timeout() — can hang indefinitely',
    severity: 'medium',
  },
  {
    id: 'empty_catch',
    pattern: /catch\s*\([^)]*\)\s*\{\s*\}/,
    files: ['api/discord.js', 'api/andy.js', 'api/brain.js'],
    description: 'Empty catch block silently swallows errors',
    severity: 'medium',
  },
]

// ─── Scan for known error patterns and return findings ────────────────────────
async function detectKnownPatterns(loadedFiles) {
  const findings = []
  for (const { id, pattern, files, description, severity } of KNOWN_ERROR_PATTERNS) {
    for (const [path, content] of loadedFiles) {
      if (!files.some(f => path.endsWith(f))) continue
      if (pattern.test(content)) {
        findings.push({ id, file: path, description, severity })
      }
    }
  }
  return findings
}

// ─── Pick files to analyze based on focus ────────────────────────────────────
function pickFiles(focus) {
  const maps = {
    // 🔐 Sécurité — priorité maximale — OWASP Top 10 + injections + tokens
    security:    ['api/_security.js', 'api/andy.js', 'api/discord.js', 'api/trading-expert.js', 'api/brain.js', 'api/reports.js'],
    // ⚡ Performance — caching, appels parallèles, re-renders React
    performance: ['api/andy.js', 'api/brain.js', 'api/trading-expert.js', 'src/pages/Andy.jsx', 'src/pages/Markets.jsx', 'src/pages/Dashboard.jsx'],
    // ✨ Fonctionnalités — nouvelles features utiles
    features:    ['src/pages/Dashboard.jsx', 'src/pages/Sports.jsx', 'src/pages/Markets.jsx', 'src/pages/Andy.jsx', 'src/App.jsx'],
    // 🐛 Bugs — edge cases, erreurs silencieuses, race conditions
    bugs:        ['api/andy.js', 'api/discord.js', 'api/brain.js', 'api/morning.js', 'api/trading-expert.js', 'src/pages/Andy.jsx', 'src/pages/Dashboard.jsx'],
    // 🎨 Frontend/Design — animations, responsive, UX, accessibilité
    frontend:    ['src/index.css', 'src/App.jsx', 'src/pages/Dashboard.jsx', 'src/pages/Sports.jsx', 'src/components/BottomNav.jsx', 'src/pages/Markets.jsx'],
    // 🤖 Système autonome — Brain, Agent Forge, Morning, Reports
    autonomous:  ['api/brain.js', 'api/agent-forge.js', 'api/reports.js', 'api/morning.js'],
    // 📊 Trading — améliorer TradingExpert, indicateurs, apprentissage
    trading:     ['api/trading-expert.js', 'api/andy.js', 'api/discord.js'],
    // 🏠 Immobilier — améliorer les calculs, les données marché, l'UX
    realestate:  ['api/real-estate.js', 'src/pages/RealEstate.jsx'],
    // 💼 Business — améliorer la génération de plans, les analyses marché
    business:    ['api/business-plan.js', 'src/pages/BusinessPlan.jsx'],
    // ⌚ Watches — améliorer le tracking de prix, l'UX collection
    watches:     ['api/watch-price.js', 'src/pages/Watches.jsx'],
    // 📡 Monitor — améliorer la détection d'anomalies et les alertes
    monitor:     ['api/monitor.js', 'api/self-improve.js'],
    // 🚀 Full — analyse globale complète de tout le projet
    full:        ['api/andy.js', 'api/brain.js', 'api/discord.js', 'api/monitor.js', 'api/real-estate.js', 'api/business-plan.js', 'src/pages/Dashboard.jsx', 'src/pages/More.jsx', 'src/App.jsx'],
  }
  return maps[focus] || maps.bugs
}

// ─── Ask Claude to analyze and propose one specific improvement ───────────────
async function analyzeWithClaude(files, focus, memoryContext) {
  const fileContents = files
    .map(([path, content]) => `### ${path}\n\`\`\`\n${content.slice(0, 8000)}\n\`\`\``)
    .join('\n\n')

  const focusInstructions = {
    security:    '🔐 PRIORITÉ MAXIMALE — Cherche des failles de sécurité : injections (SQL, commande, prompt), CORS mal configuré, données sensibles exposées dans les logs ou réponses API, rate limiting insuffisant, tokens/clés API en clair dans le code, manque de validation des inputs, SSRF potentiels, path traversal, XSS. Corrige la faille la plus critique en premier. C\'est la priorité absolue du système.',
    performance: '⚡ Cherche des problèmes de performance : appels API séquentiels à paralléliser avec Promise.all, re-renders React inutiles, états non mémoïsés, payloads trop lourds, absence de debounce sur les inputs, requests sans timeout, fuites mémoire, animations bloquantes sur le thread principal.',
    features:    '✨ Identifie et ajoute la fonctionnalité la plus utile qui améliorerait l\'expérience utilisateur de façon visible. Pense mobile-first : swipe gestures, quick actions, shortcuts. Priorise ce qui peut être vu immédiatement à l\'ouverture de l\'app.',
    bugs:        '🐛 Cherche des bugs réels : edge cases non gérés (null/undefined, tableaux vides), erreurs silencieuses avalées par catch vide, race conditions, états incohérents après navigation, parsing fragile de JSON externe, gestion d\'erreur manquante sur les fetch critiques.',
    frontend:    '🎨 Améliore le design mobile : transitions spring physics, stagger animations sur les listes, micro-interactions au toucher, meilleure hiérarchie visuelle, contrastes accessibles, espacement cohérent, composants plus expressifs. Chaque ouverture de l\'app doit avoir l\'air plus belle. Utilise les classes CSS existantes : stagger-item, press-scale, pill, section-label.',
    autonomous:  '🤖 Analyse le système autonome : Brain, Agent Forge, Morning Briefing, Reports. Cherche des bugs dans la logique d\'orchestration, erreurs dans les appels API internes, problèmes de communication inter-agents, améliore l\'intelligence du Brain pour qu\'il prenne de meilleures décisions sur quels agents activer.',
    trading:     '📊 Améliore le TradingExpert : ajoute ou améliore des indicateurs techniques, affine le prompt Claude pour des analyses plus précises, améliore la détection de patterns haute conviction, optimise la gestion d\'erreur pour les APIs marché (CoinGecko, Yahoo Finance), améliore la vitesse de la Phase 1 Discord.',
  }

  const prompt = `Tu es AnDy, l'IA auto-apprenante de l'app Trackr. Tu analyses le code source et proposes UNE amélioration concrète et sûre.

**Focus :** ${focusInstructions[focus] || focusInstructions.bugs}
${memoryContext}

**Code source à analyser :**
${fileContents}

**Instructions importantes :**
1. Consulte l'historique ci-dessus : n'applique PAS une correction déjà faite récemment sur le même fichier
2. Identifie LE problème le plus impactant dans ce code qui n'a pas encore été traité
3. Propose une correction précise et ciblée
4. Réponds UNIQUEMENT avec ce JSON (rien d'autre avant ou après) :

{
  "problem": "Description courte du problème trouvé",
  "severity": "critical|high|medium|low",
  "file": "chemin/du/fichier/a/modifier",
  "explanation": "Explication de pourquoi c'est un problème et comment la correction l'améliore",
  "old_code": "EXACT extrait de code à remplacer (10-50 lignes max)",
  "new_code": "Code de remplacement amélioré",
  "commit_message": "fix: description courte en anglais",
  "learned": "Ce que cette correction t'apprend sur le codebase (1 phrase)"
}

Si aucune amélioration significative n'est nécessaire (ou si tout a déjà été corrigé récemment), réponds : {"no_change": true, "reason": "explication"}`

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
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: 'Tu es AnDy, un agent IA autonome qui améliore le code de Trackr. Tu te souviens de tes actions passées grâce à ta mémoire et tu construis progressivement une meilleure version du code.',
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!r.ok) throw new Error(`Anthropic API → ${r.status}`)
  const data = await r.json()
  const text = data.content?.[0]?.text || ''

  // Extract JSON from response
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('No JSON in Claude response')
  return JSON.parse(jsonMatch[0])
}

// ─── Apply the improvement ────────────────────────────────────────────────────
async function applyImprovement(improvement, fileContent, fileSha) {
  const { file, old_code, new_code, commit_message } = improvement

  if (!old_code || !new_code || !file) {
    throw new Error('Missing file/old_code/new_code in improvement')
  }

  // Safety: don't let Claude modify self-improve.js or memory.js
  if (file.includes('self-improve') || file.includes('memory')) {
    throw new Error('Cannot modify self-improve.js or memory.js')
  }

  // Verify old_code actually exists in the file
  if (!fileContent.includes(old_code.trim())) {
    throw new Error(`old_code not found in ${file} — skipping to avoid corruption`)
  }

  // Apply the replacement
  const updatedContent = fileContent.replace(old_code.trim(), new_code.trim())
  if (updatedContent === fileContent) {
    throw new Error('Replacement had no effect')
  }

  // Commit to GitHub
  const result = await commitFile(file, updatedContent, fileSha, `[AnDy Auto-Improve] ${commit_message}`)
  return result
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Auth : GET libre (pour tests manuels), POST/cron vérifient le secret
  const CRON_SECRET = process.env.CRON_SECRET
  if (CRON_SECRET && req.method !== 'GET') {
    const provided = req.headers['x-cron-secret']
      || req.headers['authorization']?.replace('Bearer ', '')
      || req.query?.secret
    if (provided !== CRON_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const focus    = req.query?.focus || 'bugs'
  const dryRun   = req.query?.dry === 'true'
  const startedAt = new Date().toISOString()

  console.log(`🧠 Self-improve started — focus: ${focus}, dryRun: ${dryRun}`)

  try {
    // 1. Charger la mémoire récente (apprentissage)
    const [recentMemory] = await Promise.allSettled([getMemoryEntries(25)])
    const memory = recentMemory.status === 'fulfilled' ? recentMemory.value : []
    const memoryContext = formatMemoryForPrompt(memory)

    // 2. Pick files to analyze
    const filePaths = pickFiles(focus)
    const fileData = await Promise.all(
      filePaths.map(async p => {
        const f = await getFileContent(p)
        return f ? [p, f.content, f.sha] : null
      })
    )
    const loaded = fileData.filter(Boolean)

    if (loaded.length === 0) {
      return res.status(500).json({ error: 'Could not load any files from GitHub' })
    }

    // 3. Vérifier si un admin a assigné une tâche spécifique
    const adminTask = await getPendingAdminTask()
    let adminContext = ''
    let activeFocus = focus
    if (adminTask) {
      console.log(`📋 Admin task found: "${adminTask.task}" (focus: ${adminTask.focus || focus})`)
      adminContext = `\n\n**📋 TÂCHE PRIORITAIRE assignée par l'administrateur :**\n"${adminTask.task}"\nFocus: ${adminTask.focus || focus}\n\nTraite cette tâche EN PRIORITÉ avant toute autre amélioration générale.`
      if (adminTask.focus) activeFocus = adminTask.focus
    }

    // 4. Détection proactive de patterns d'erreurs connus
    const patternFindings = await detectKnownPatterns(loaded.map(([p, c]) => [p, c]))
    if (patternFindings.length > 0) {
      const patternSummary = patternFindings.map(f => `- [${f.severity.toUpperCase()}] ${f.file}: ${f.description}`).join('\n')
      console.log(`🔍 Known patterns found:\n${patternSummary}`)
      await addMemoryEntry({
        type: 'pattern_scan',
        focus: activeFocus,
        findings: patternFindings,
        count: patternFindings.length,
        applied: false,
        note: 'Patterns detected before Claude analysis — guiding fix priority',
      }).catch(() => {})
    }

    // 4b. Ask Claude to analyze (avec contexte mémoire + patterns + tâche admin)
    const patternContext = patternFindings.length > 0
      ? `\n\n**🚨 Patterns d'erreurs détectés automatiquement (PRIORITÉ) :**\n${patternFindings.map(f => `- [${f.severity.toUpperCase()}] \`${f.file}\`: ${f.description}`).join('\n')}\nFixe le plus critique en premier.`
      : ''
    const improvement = await analyzeWithClaude(loaded.map(([p, c]) => [p, c]), activeFocus, memoryContext + adminContext + patternContext)

    // No change needed
    if (improvement.no_change) {
      await postDiscord(
        `✅ Code Review — ${focus}`,
        `**Aucun changement nécessaire**\n\n${improvement.reason}`,
        [],
        0x10b981
      )
      // Enregistre quand même en mémoire pour tracer les cycles
      await addMemoryEntry({
        type:    'no_change',
        focus,
        reason:  improvement.reason,
        applied: false,
      }).catch(() => {})
      return res.status(200).json({ ok: true, changed: false, reason: improvement.reason, focus, startedAt })
    }

    // 4. Vérifier si ce fichier a été modifié très récemment (< 6h) — anti-doublon
    const recentFixes = await getRecentFixesForFile(improvement.file, 6).catch(() => [])
    if (recentFixes.length > 0 && !dryRun) {
      const lastFix = recentFixes[0]
      console.log(`⏭ Skipping ${improvement.file} — already fixed ${recentFixes.length}x in last 6h`)
      await postDiscord(
        `⏭ Amélioration ignorée — fichier récemment modifié`,
        `**${improvement.file}** a déjà été corrigé ${recentFixes.length}× dans les 6 dernières heures.\n\n**Problème détecté (non appliqué) :** ${improvement.problem}`,
        [{ name: 'Dernière correction', value: lastFix.problem || '?', inline: false }],
        0x6b7280
      )
      return res.status(200).json({ ok: true, changed: false, skipped: true, reason: 'recently_fixed', focus, startedAt })
    }

    // 5. Notify Discord of the proposed change (before applying)
    const severityColor = { critical: 0xef4444, high: 0xf97316, medium: 0xf59e0b, low: 0x6b7280 }
    await postDiscord(
      `🔧 Amélioration ${dryRun ? '(DRY RUN)' : 'appliquée'} — ${improvement.severity?.toUpperCase()} • ${focus}`,
      `**Problème :** ${improvement.problem}\n\n${improvement.explanation}${improvement.learned ? `\n\n💡 *${improvement.learned}*` : ''}`,
      [
        { name: 'Fichier',   value: `\`${improvement.file}\``,          inline: true },
        { name: 'Sévérité',  value: improvement.severity || 'medium',   inline: true },
        { name: 'Commit',    value: improvement.commit_message || 'auto-fix', inline: false },
        { name: 'Mémoire',   value: `${memory.length} entrées chargées`, inline: true },
      ],
      severityColor[improvement.severity] || 0x8b5cf6
    )

    if (dryRun) {
      await addMemoryEntry({
        type: 'dry_run', focus, file: improvement.file,
        problem: improvement.problem, severity: improvement.severity,
        learned: improvement.learned, applied: false, dryRun: true,
      }).catch(() => {})
      return res.status(200).json({ ok: true, changed: false, dryRun: true, improvement, focus, startedAt })
    }

    // 6. Find the file data for the target file
    const targetFile = loaded.find(([p]) => p === improvement.file)
    if (!targetFile) {
      return res.status(400).json({ error: `Target file ${improvement.file} was not loaded`, improvement })
    }
    const [, fileContent, fileSha] = targetFile

    // 7. Apply and commit
    await applyImprovement(improvement, fileContent, fileSha)
    console.log(`✅ Improvement committed: ${improvement.commit_message}`)

    // 8. Enregistrer en mémoire (apprentissage persistant)
    await addMemoryEntry({
      type:     'improvement',
      focus:    activeFocus,
      file:     improvement.file,
      problem:  improvement.problem,
      severity: improvement.severity,
      commit:   improvement.commit_message,
      learned:  improvement.learned || null,
      applied:  true,
      fromAdminTask: adminTask ? adminTask.task : null,
    }).catch(e => console.error('memory save failed:', e.message))

    // 9. Notifier l'admin si changement critique/élevé (#annonces)
    await notifyAdminCritical(improvement).catch(() => {})

    // 10. Marquer la tâche admin comme done si elle existait
    if (adminTask) {
      await addMemoryEntry({
        type:   'admin_task',
        task:   adminTask.task,
        focus:  adminTask.focus || activeFocus,
        status: 'done',
        result: improvement.problem,
        commit: improvement.commit_message,
        assignedBy: adminTask.assignedBy,
      }).catch(() => {})
    }

    return res.status(200).json({
      ok: true,
      changed: true,
      file:     improvement.file,
      problem:  improvement.problem,
      severity: improvement.severity,
      commit:   improvement.commit_message,
      learned:  improvement.learned,
      focus,
      startedAt,
      completedAt: new Date().toISOString(),
    })

  } catch (e) {
    console.error('self-improve error:', e.message)
    await postDiscord(
      '⚠️ Self-Improve — Erreur',
      `**Focus :** ${focus}\n**Erreur :** ${e.message}`,
      [],
      0xef4444
    )
    // Enregistre l'échec en mémoire aussi
    await addMemoryEntry({
      type:    'error',
      focus,
      error:   e.message,
      applied: false,
    }).catch(() => {})
    return res.status(500).json({ error: e.message, focus, startedAt })
  }
}
