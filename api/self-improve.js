// ─── Self-Improve — AnDy lit le code et s'améliore automatiquement ───────────
// GET /api/self-improve?focus=security|performance|features|bugs
// Lit les fichiers clés, les analyse avec Claude, commit les améliorations

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const GITHUB_TOKEN = process.env.GITHUB_TOKEN
const REPO = 'andrea-ai992/trackr-ai-hub'
const GITHUB_API = 'https://api.github.com'
const DISCORD_API = 'https://discord.com/api/v10'
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CODE_REVIEW_CH = process.env.DISCORD_CH_CODE_REVIEW

// ─── Files AnDy can read and improve ─────────────────────────────────────────
const READABLE_FILES = [
  'api/andy.js',
  'api/_security.js',
  'api/discord.js',
  'api/discord-cron.js',
  'api/trigger-agent.js',
  'api/agents-log.js',
  'src/pages/Andy.jsx',
  'src/pages/Agents.jsx',
  'src/pages/Dashboard.jsx',
  'src/pages/Markets.jsx',
  'src/App.jsx',
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

// ─── Pick files to analyze based on focus ────────────────────────────────────
function pickFiles(focus) {
  const maps = {
    security:    ['api/_security.js', 'api/andy.js', 'api/discord.js', 'api/trigger-agent.js'],
    performance: ['api/andy.js', 'src/pages/Andy.jsx', 'src/pages/Markets.jsx'],
    features:    ['src/pages/Dashboard.jsx', 'src/pages/Agents.jsx', 'src/App.jsx'],
    bugs:        ['api/andy.js', 'api/discord-cron.js', 'src/pages/Andy.jsx'],
    frontend:    ['src/pages/Andy.jsx', 'src/pages/Agents.jsx', 'src/App.jsx'],
  }
  return maps[focus] || maps.bugs
}

// ─── Ask Claude to analyze and propose one specific improvement ───────────────
async function analyzeWithClaude(files, focus) {
  const fileContents = files
    .map(([path, content]) => `### ${path}\n\`\`\`\n${content.slice(0, 8000)}\n\`\`\``)
    .join('\n\n')

  const focusInstructions = {
    security: 'Cherche des failles de sécurité : injections, CORS mal configuré, données exposées, rate limiting insuffisant, tokens en clair, manque de validation.',
    performance: 'Cherche des problèmes de performance : appels API non mis en cache, re-renders inutiles, boucles inefficaces, payloads trop lourds, requêtes en série au lieu de parallèle.',
    features: 'Identifie la fonctionnalité la plus utile à ajouter qui améliorerait vraiment l\'expérience utilisateur.',
    bugs: 'Cherche des bugs réels : edge cases non gérés, erreurs silencieuses, race conditions, états incohérents, parsing fragile.',
    frontend: 'Cherche des problèmes UI/UX : accessibility, responsive, animations, lisibilité, cohérence visuelle.',
  }

  const prompt = `Tu es AnDy, l'IA auto-apprenante de l'app Trackr. Tu analyses le code source et proposes UNE amélioration concrète et sûre.

**Focus :** ${focusInstructions[focus] || focusInstructions.bugs}

**Code source à analyser :**
${fileContents}

**Instructions importantes :**
1. Identifie LE problème le plus impactant dans ce code
2. Propose une correction précise et ciblée
3. Réponds UNIQUEMENT avec ce JSON (rien d'autre avant ou après) :

{
  "problem": "Description courte du problème trouvé",
  "severity": "critical|high|medium|low",
  "file": "chemin/du/fichier/a/modifier",
  "explanation": "Explication de pourquoi c'est un problème et comment la correction l'améliore",
  "old_code": "EXACT extrait de code à remplacer (10-50 lignes max)",
  "new_code": "Code de remplacement amélioré",
  "commit_message": "fix: description courte en anglais"
}

Si aucune amélioration significative n'est nécessaire, réponds : {"no_change": true, "reason": "explication"}`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
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

  // Safety: don't let Claude modify self-improve.js
  if (file.includes('self-improve')) {
    throw new Error('Cannot modify self-improve.js')
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
  // Only allow GET with secret or POST from cron
  const secret = req.headers['x-cron-secret'] || req.query?.secret
  if (secret !== process.env.CRON_SECRET && req.method !== 'GET') {
    // Allow GET without secret for manual triggers (but log it)
    if (req.method !== 'GET') {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const focus = req.query?.focus || 'bugs'
  const dryRun = req.query?.dry === 'true'
  const startedAt = new Date().toISOString()

  console.log(`🧠 Self-improve started — focus: ${focus}, dryRun: ${dryRun}`)

  try {
    // 1. Pick files to analyze
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

    // 2. Ask Claude to analyze
    const improvement = await analyzeWithClaude(loaded.map(([p, c]) => [p, c]), focus)

    // No change needed
    if (improvement.no_change) {
      await postDiscord(
        `✅ Code Review — ${focus}`,
        `**Aucun changement nécessaire**\n\n${improvement.reason}`,
        [],
        0x10b981
      )
      return res.status(200).json({ ok: true, changed: false, reason: improvement.reason, focus, startedAt })
    }

    // 3. Notify Discord of the proposed change (before applying)
    const severityColor = { critical: 0xef4444, high: 0xf97316, medium: 0xf59e0b, low: 0x6b7280 }
    await postDiscord(
      `🔧 Amélioration ${dryRun ? '(DRY RUN)' : 'appliquée'} — ${improvement.severity?.toUpperCase()} • ${focus}`,
      `**Problème :** ${improvement.problem}\n\n${improvement.explanation}`,
      [
        { name: 'Fichier', value: `\`${improvement.file}\``, inline: true },
        { name: 'Sévérité', value: improvement.severity || 'medium', inline: true },
        { name: 'Commit', value: improvement.commit_message || 'auto-fix', inline: false },
      ],
      severityColor[improvement.severity] || 0x8b5cf6
    )

    if (dryRun) {
      return res.status(200).json({ ok: true, changed: false, dryRun: true, improvement, focus, startedAt })
    }

    // 4. Find the file data for the target file
    const targetFile = loaded.find(([p]) => p === improvement.file)
    if (!targetFile) {
      return res.status(400).json({ error: `Target file ${improvement.file} was not loaded`, improvement })
    }
    const [, fileContent, fileSha] = targetFile

    // 5. Apply and commit
    await applyImprovement(improvement, fileContent, fileSha)

    console.log(`✅ Improvement committed: ${improvement.commit_message}`)

    return res.status(200).json({
      ok: true,
      changed: true,
      file: improvement.file,
      problem: improvement.problem,
      severity: improvement.severity,
      commit: improvement.commit_message,
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
    return res.status(500).json({ error: e.message, focus, startedAt })
  }
}
