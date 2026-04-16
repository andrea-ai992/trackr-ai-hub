#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  AnDy Daemon — beast mode headless pour serveur Railway / VPS
//  Usage: node cli/andy-daemon.js
//  Env vars: ANTHROPIC_API_KEY, GITHUB_TOKEN, GITHUB_REPO, DISCORD_BOT_TOKEN…
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, writeFileSync, renameSync, readdirSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '..')

// ── .env loader ───────────────────────────────────────────────────────────────
for (const f of ['.env', '.env.local']) {
  const fp = resolve(ROOT, f)
  if (existsSync(fp)) {
    readFileSync(fp, 'utf8').split('\n').forEach(l => {
      const m = l.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    })
  }
}

const API_KEY      = process.env.ANTHROPIC_API_KEY
const APP_URL      = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
const GITHUB_REPO  = process.env.GITHUB_REPO  || 'andrea-ai992/trackr-ai-hub'
const GITHUB_API   = 'https://api.github.com'
const BOT_TOKEN    = process.env.DISCORD_BOT_TOKEN || ''
const GUILD_ID     = process.env.DISCORD_GUILD_ID  || ''
const CH_MORNING   = process.env.DISCORD_CH_MORNING || process.env.DISCORD_CH_BRAIN || ''
const DISCORD_API  = 'https://discord.com/api/v10'

// ── Logging (stdout structuré — visible dans Railway logs) ────────────────────
function log(msg) {
  process.stdout.write('[' + new Date().toISOString() + '] ' + msg.replace(/\x1b\[[0-9;]*m/g, '') + '\n')
}

const sl = ms => new Promise(r => setTimeout(r, ms))

// ── Discord ───────────────────────────────────────────────────────────────────
async function discordPost(channelId, content) {
  if (!BOT_TOKEN || !channelId) return false
  const r = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: content.slice(0, 1990) }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  return r?.ok || false
}

// ── Network ───────────────────────────────────────────────────────────────────
const SYNC_QUEUE_FILE = resolve(ROOT, 'andy-tasks', '.sync-queue.json')

async function checkOnline() {
  try {
    const r = await fetch('https://api.github.com', { method: 'HEAD', signal: AbortSignal.timeout(4000) })
    return r.ok || r.status < 500
  } catch { return false }
}

function loadSyncQueue() {
  try { return JSON.parse(readFileSync(SYNC_QUEUE_FILE, 'utf8')) } catch { return [] }
}
function saveSyncQueue(q) {
  writeFileSync(SYNC_QUEUE_FILE, JSON.stringify(q, null, 2), 'utf8')
}

async function waitForOnline() {
  if (await checkOnline()) return
  log('OFFLINE — retry toutes les 15s...')
  while (!(await checkOnline())) await sl(15000)
  log('ONLINE — reprise')
  await flushSyncQueue()
}

// ── GitHub ────────────────────────────────────────────────────────────────────
function ghHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'AnDy-Daemon',
  }
}

async function ghGet(path) {
  const r = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}${path}`, {
    headers: ghHeaders(), signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  return r?.ok ? r.json().catch(() => null) : null
}

async function ghWriteFile(filePath, content, message, sha) {
  const body = { message, content: Buffer.from(content).toString('base64'), ...(sha ? { sha } : {}) }
  const r = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
    method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null)
  return r?.ok || false
}

async function flushSyncQueue() {
  const queue = loadSyncQueue()
  if (!queue.length) return
  log(`Sync queue: ${queue.length} fichier(s) en attente`)
  const remaining = []
  for (const item of queue) {
    const ok = await ghWriteFile(item.filePath, item.content, item.message, item.sha)
    if (ok) log(`synced: ${item.filePath}`)
    else remaining.push(item)
  }
  saveSyncQueue(remaining)
}

// ── Claude API ────────────────────────────────────────────────────────────────
const SYSTEM = `Tu es AnDy, l'IA autonome du projet Trackr.
App React 19 + Vite mobile-first, déployée sur Vercel. Repo GitHub: ${GITHUB_REPO}. App: ${APP_URL}.
Tu travailles en mode serveur autonome — tu génères et pousses du code directement sur GitHub.
Sois précis, complet, production-ready.`

async function generateRaw(prompt, maxTokens = 8192) {
  if (!API_KEY) throw new Error('ANTHROPIC_API_KEY manquante')
  while (true) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: maxTokens, system: SYSTEM, stream: false, messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(120000),
    }).catch(err => { throw new Error(`Réseau: ${err.message}`) })

    if ([429, 500, 503, 529].includes(res.status)) {
      log(`API ${res.status} — retry dans 30s`)
      await sl(30000)
      continue
    }
    if (res.status === 400) {
      const body = await res.json().catch(() => ({}))
      const msg  = body?.error?.message || ''
      if (msg.toLowerCase().includes('credit')) {
        log(`Crédits épuisés — retry dans 60s (recharge sur console.anthropic.com)`)
        await sl(60000)
        continue
      }
      throw new Error(`API 400: ${msg}`)
    }
    if (!res.ok) throw new Error(`API ${res.status}`)
    const d = await res.json().catch(() => null)
    const text = d?.content?.[0]?.text?.trim()
    if (!text) throw new Error('Réponse vide')
    return text
  }
}

// ── Execute task ──────────────────────────────────────────────────────────────
async function executeTask(taskContent, taskName = '') {
  const ts = () => new Date().toISOString()
  const stage = (s, extra = {}) => {
    if (taskName) updateTaskStatus(taskName, { stage: s, stages: { [s]: ts() }, ...extra })
  }

  const planPrompt = [
    'TÂCHE: ' + taskContent.slice(0, 600),
    'Identifie les fichiers à créer ou modifier dans le projet Trackr (React+Vite).',
    'Format — une ligne par fichier:',
    'CREATE:chemin/fichier.jsx',
    'MODIFY:chemin/fichier.jsx',
    'Max 3 fichiers, chemins relatifs. Rien d\'autre.',
  ].join('\n')

  stage('planning')
  const plan    = await generateRaw(planPrompt, 400)
  const fileOps = plan.split('\n')
    .map(l => l.match(/^(CREATE|MODIFY):(.+\.[\w]+)/i))
    .filter(Boolean)
    .map(m => ({ action: m[1].toUpperCase(), path: m[2].trim().replace(/^\//, '') }))
    .slice(0, 3)

  if (!fileOps.length) throw new Error('Plan vide')

  stage('generating', { files: fileOps.map(o => o.path) })

  for (const op of fileOps) {
    log(`${op.action} ${op.path}`)
    let currentContent = '', sha = null

    if (op.action === 'MODIFY') {
      const data = await ghGet(`/contents/${op.path}`)
      if (data?.content) {
        currentContent = Buffer.from(data.content, 'base64').toString('utf8')
        sha = data.sha
      }
    }

    const codePrompt = [
      'TÂCHE: ' + taskContent,
      op.action === 'MODIFY' && currentContent
        ? 'FICHIER ACTUEL (' + op.path + '):\n' + currentContent.slice(0, 12000)
        : 'Crée ' + op.path + ' from scratch.',
      'Génère le code COMPLET et fonctionnel. Code uniquement, pas de backticks.',
    ].filter(Boolean).join('\n')

    const newCode = await generateRaw(codePrompt, 8192)
    let clean = newCode.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()

    // Review superviseur
    stage('testing')
    const reviewPrompt = [
      'Superviseur: vérifie ce code pour ' + op.path + ' (Trackr React+Vite).',
      'TÂCHE: ' + taskContent.slice(0, 300),
      'CODE:\n' + clean.slice(0, 10000),
      'Vérifie: syntaxe valide, tâche accomplie, pas de TODO/placeholder, compatible React 19.',
      'Réponds exactement APPROVED ou REJECTED\\nRAISON: ...\\nFIX: <code complet corrigé>',
    ].join('\n')

    const review = await generateRaw(reviewPrompt, 8192)
    if (review.trim().startsWith('REJECTED')) {
      const fixMatch = review.match(/FIX:([\s\S]+)/)
      if (fixMatch) clean = fixMatch[1].replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()
      else throw new Error('Review rejeté sans fix')
      log(`corrigé par superviseur: ${op.path}`)
    } else {
      log(`review OK: ${op.path}`)
    }

    stage('safe')

    const msg = `[AnDy] ${op.action === 'CREATE' ? 'feat' : 'update'}: ${op.path}`
    const ok  = await ghWriteFile(op.path, clean, msg, sha)
    if (ok) {
      stage('live')
      log(`pushed: ${op.path} → Vercel deploying`)
    } else {
      const online = await checkOnline()
      if (!online) {
        const q = loadSyncQueue()
        q.push({ filePath: op.path, content: clean, message: msg, sha: sha || null })
        saveSyncQueue(q)
        log(`offline — queued: ${op.path}`)
      } else {
        throw new Error('Push échoué: ' + op.path)
      }
    }
  }
}

// ── Task runner ───────────────────────────────────────────────────────────────
const TASKS_DIR   = resolve(ROOT, 'andy-tasks')
const STATUS_FILE = resolve(ROOT, 'andy-tasks', '.task-status.json')
const taskLog     = []
const errorLog    = []
let   autoGenCount = 0

function readStatus() {
  try { return JSON.parse(readFileSync(STATUS_FILE, 'utf8')) } catch { return [] }
}

function updateTaskStatus(name, updates) {
  mkdirSync(TASKS_DIR, { recursive: true })
  const list = readStatus()
  const idx  = list.findIndex(t => t.name === name)
  if (idx >= 0) {
    const e = list[idx]
    if (updates.stages) e.stages = { ...e.stages, ...updates.stages }
    Object.assign(e, { ...updates, stages: e.stages })
  } else {
    list.push({ name, stages: {}, ...updates })
  }
  try { writeFileSync(STATUS_FILE, JSON.stringify(list.slice(-100), null, 2), 'utf8') } catch {}
}

// Priorités ordonnées : qualité + design > features > infra
const TASK_DOMAINS = [
  // P0 — Fluidité et qualité visuelle (répété 3x pour poids plus élevé)
  'P0/performance — code splitting, lazy loading, bundle < 200kb, LCP < 1.5s',
  'P0/animations — page transitions fade 200ms, hover scale, skeleton loaders neon vert',
  'P0/polish — supprimer tous les layout shifts, hauteurs fixes sur cards, scroll smooth iOS',
  // P1 — Design dédié par catégorie (look app native)
  'P1/Sports — design stadium dark, scores live animés, stats visuelles comme ESPN',
  'P1/MMA-UFC — design octagon noir/rouge, fighter cards avec photos, countdown fight',
  'P1/Crypto — design Bloomberg terminal, charts recharts temps réel, prix live pulsants',
  'P1/Markets — design Bloomberg/TradingView, candlestick charts, heatmap sectorielle',
  'P1/News — design Flipboard/Apple News, cards avec image cover, catégories colorées',
  'P1/Hub — dashboard glassmorphism, widgets modulaires drag-drop, KPIs animés',
  // P2 — Features
  'P2/notifications — push notifications PWA, badge icône, son discret',
  'P2/search — barre de recherche globale avec résultats instantanés',
  'P2/offline — PWA service worker, cache offline, indicateur connexion',
  'P2/settings — thème perso, layout dense/normal, raccourcis clavier',
  // P3 — Infra
  'P3/API — rate limiting, cache Redis/KV, erreurs gracieuses',
  'P3/sécurité — headers HTTP, CSP, HTTPS strict',
  'P3/monitoring — Sentry errors, Web Vitals tracking',
]

const SECURITY_DOMAINS = [
  'XSS — sanitisation inputs, dangerouslySetInnerHTML',
  'CSRF — vérification tokens API routes serverless',
  'auth — expiration sessions Supabase, refresh tokens',
  'secrets — aucune clé API exposée côté client',
  'headers — CSP, X-Frame-Options, HSTS sur /api/',
  'rate-limiting — brute-force sur /api/auth',
  'injections — validation paramètres query/body',
  'npm audit — dépendances vulnérables',
  'prompt-injection — manipulation du prompt système',
  'outputs IA — valider code avant push',
  'infra Vercel — env vars, pas de secrets dans vercel.json',
  'GitHub token — permissions minimales, pas de push force',
]

async function runTask(filePath) {
  const name    = filePath.split('/').pop().replace(/\.txt$/, '')
  const content = readFileSync(filePath, 'utf8').trim()
  if (!content) return

  const startTime = Date.now()
  log(`TASK START: ${name}`)

  updateTaskStatus(name, {
    desc: content.slice(0, 80),
    startedAt: new Date().toISOString(),
    stage: 'started',
    stages: { started: new Date().toISOString() },
    files: [],
    status: 'RUNNING',
    dur: 0,
    error: null,
  })

  taskLog.push({ name, desc: content.slice(0, 60), status: 'RUNNING', dur: 0 })
  const entry = taskLog[taskLog.length - 1]

  const runningPath = filePath.replace(/\.txt$/, '.running')
  renameSync(filePath, runningPath)

  try {
    await executeTask(content, name)
    const dur = Math.round((Date.now() - startTime) / 1000)
    entry.status = 'DONE'; entry.dur = dur
    updateTaskStatus(name, { status: 'DONE', dur })
    renameSync(runningPath, runningPath.replace(/\.running$/, '.done'))
    log(`TASK DONE: ${name} (${dur}s)`)
  } catch (err) {
    const dur = Math.round((Date.now() - startTime) / 1000)
    entry.status = 'ERROR'; entry.dur = dur
    errorLog.push({ name, error: err.message, ts: new Date().toISOString() })
    updateTaskStatus(name, { status: 'ERROR', stage: 'error', dur, error: err.message })
    renameSync(runningPath, runningPath.replace(/\.running$/, '.error'))
    log(`TASK ERROR: ${name} — ${err.message}`)
  }
}

async function generateNextTasks() {
  autoGenCount++
  const domain    = TASK_DOMAINS[autoGenCount % TASK_DOMAINS.length]
  const secDomain = SECURITY_DOMAINS[autoGenCount % SECURITY_DOMAINS.length]
  const prefix    = String(Date.now())
  const totalDone = taskLog.filter(t => t.status === 'DONE').length
  const recentDone = taskLog.filter(t => t.status === 'DONE').slice(-10).map(t => t.name)
  const recentErrs = errorLog.slice(-4).map(e => e.name + ': ' + e.error.slice(0, 50))

  log(`AUTO-GEN #${autoGenCount} — feature: ${domain} | sécurité: ${secDomain}`)

  const prompt = [
    'Projet Trackr — app React 19 + Vite mobile-first, repo: ' + GITHUB_REPO,
    'OBJECTIF PRINCIPAL: rendre l app parfaitement fluide, rapide et visuellement impressionnante.',
    'Chaque page doit ressembler à une vraie app dédiée pro (ESPN pour sports, Bloomberg pour markets, etc).',
    'Tâches faites (' + totalDone + '): ' + (recentDone.join(', ') || 'aucune'),
    recentErrs.length ? 'Erreurs récentes: ' + recentErrs.join(' | ') : '',
    'Focus ce cycle: ' + domain,
    'Focus sécurité: ' + secDomain,
    '',
    'Génère 3 tâches concrètes et ambitieuses — priorise TOUJOURS la qualité visuelle et la fluidité.',
    'Chaque tâche doit avoir un impact visible immédiat sur l utilisateur.',
    'Format — exactement 3 lignes:',
    'TASK: description complète et précise avec fichiers cibles',
    'Pas de markdown, pas de numérotation.',
  ].filter(Boolean).join('\n')

  let attempts = 0
  while (attempts < 3) {
    attempts++
    try {
      const raw   = await generateRaw(prompt, 800)
      const tasks = raw.split('\n').map(l => l.match(/^TASK:\s*(.+)/i)?.[1]?.trim()).filter(Boolean)
      if (!tasks.length) throw new Error('Aucune ligne TASK')
      tasks.slice(0, 3).forEach((desc, i) => {
        const fname = `auto-${prefix}-${i + 1}.txt`
        writeFileSync(resolve(TASKS_DIR, fname), desc, 'utf8')
        log(`new task: ${fname}`)
      })
      return
    } catch (err) {
      log(`auto-gen ${attempts}/3 failed: ${err.message}`)
      if (attempts < 3) await sl(20000)
    }
  }
  // Fallback statique
  const fallback = 'Audit sécurité Trackr — focus: ' + secDomain + '. Identifie et corrige les failles.'
  writeFileSync(resolve(TASKS_DIR, `auto-${prefix}-sec.txt`), fallback, 'utf8')
  log('fallback task injected')
}

// ── Discord morning recap ─────────────────────────────────────────────────────
function scheduleDiscordRecap() {
  const now = new Date(), target = new Date(now)
  target.setHours(9, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const ms = target - now
  log(`Discord recap schedulé à ${target.toISOString()}`)
  setTimeout(async () => {
    const done   = taskLog.filter(t => t.status === 'DONE')
    const errors = taskLog.filter(t => t.status === 'ERROR')
    const msg = [
      `🤖 **AnDy Server — Rapport** (${new Date().toLocaleDateString('fr-FR')})`,
      `✅ **${done.length} tâches terminées**`,
      ...done.slice(-10).map(t => `  • \`${t.name}\` *(${t.dur}s)*`),
      errors.length ? `❌ **${errors.length} erreurs**` : '',
      `🔄 Auto-générations: ${autoGenCount} | Repo: ${GITHUB_REPO}`,
      `💡 *App: ${APP_URL}*`,
    ].filter(Boolean).join('\n')
    const ok = await discordPost(CH_MORNING, msg)
    log(`Discord recap: ${ok ? 'envoyé' : 'échec'}`)
    scheduleDiscordRecap() // re-schedule pour le lendemain
  }, ms)
}

// ── Main loop ─────────────────────────────────────────────────────────────────
async function main() {
  mkdirSync(TASKS_DIR, { recursive: true })
  log('=== AnDy Daemon démarré ===')
  log(`Repo: ${GITHUB_REPO} | App: ${APP_URL}`)
  log(`Dossier tâches: ${TASKS_DIR}`)
  scheduleDiscordRecap()

  while (true) {
    await waitForOnline()
    await flushSyncQueue()

    const queue = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt')).sort()

    if (queue.length) {
      log(`${queue.length} tâche(s) en queue`)
      for (const f of queue) {
        const fp = resolve(TASKS_DIR, f)
        if (existsSync(fp)) await runTask(fp)
      }
    } else {
      await generateNextTasks()
      const after = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt'))
      if (!after.length) {
        const pause = Math.min(30 + autoGenCount * 5, 180)
        log(`Pas de tâches — pause ${pause}s`)
        await sl(pause * 1000)
      }
    }

    await sl(500)
  }
}

main().catch(err => {
  log('FATAL: ' + err.message)
  process.exit(1)
})
