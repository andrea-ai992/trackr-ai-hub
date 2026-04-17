#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  AnDy Daemon — beast mode headless pour serveur Railway / VPS
//  Usage: node cli/andy-daemon.js
//  Env vars: ANTHROPIC_API_KEY, GITHUB_TOKEN, GITHUB_REPO, DISCORD_BOT_TOKEN…
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, writeFileSync, renameSync, readdirSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

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
const CH_MORNING   = process.env.DISCORD_CH_MORNING || process.env.DISCORD_CH_BRAIN || ''
const CH_UPDATES   = process.env.DISCORD_CH_UPDATES || CH_MORNING  // channel pour les notifs live
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
// Stratégie économique : Haiku (~20x moins cher) pour plan/review/autogen
//                        Sonnet uniquement pour la génération de code
const MODEL_SMART = 'claude-sonnet-4-6'               // ~$3/M in · $15/M out
const MODEL_FAST  = 'claude-haiku-4-5-20251001'        // ~$0.8/M in · $4/M out

const SYSTEM = `Tu es AnDy, l'IA autonome d'Andrea Matlega.

APPS ACTIVES:
1. Trackr (app principale) — React 19 + Vite mobile-first, Vercel. Repo: ${GITHUB_REPO}. URL: ${APP_URL}
   Pages: Dashboard, Sports (PSG/NFL/NBA), Markets (Stocks/Crypto), News (RSS multi-sources), More (modules), Andy (IA chat), Agents, Portfolio, Sneakers, Watches, FlightTracker
2. Dashboard serveur — Node.js port 4000, /vibe (dev mobile), /chat (AnDy chat), /api/* (data)

Tu travailles en mode autonome 24/7 — tu génères du code production-ready, tu le pousses sur GitHub.
Règles:
- Code complet et fonctionnel (pas de TODO, pas de placeholder)
- Mobile-first, dark theme (#080808 fond, #00ff88 accent neon)
- Design tokens CSS vars: --green, --bg, --bg2, --border, --t1, --t2, --t3
- Préfère améliorer ce qui existe plutôt que créer de zéro
- Si tu modifies un fichier, tu gardes toute la logique existante`

async function generateRaw(prompt, maxTokens = 4096, model = MODEL_SMART) {
  if (!API_KEY) throw new Error('ANTHROPIC_API_KEY manquante')
  while (true) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model, max_tokens: maxTokens, system: SYSTEM, stream: false, messages: [{ role: 'user', content: prompt }] }),
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
  // Haiku pour le plan (pas besoin de Sonnet)
  const plan    = await generateRaw(planPrompt, 300, MODEL_FAST)
  const fileOps = plan.split('\n')
    .map(l => l.match(/^(CREATE|MODIFY):(.+\.[\w]+)/i))
    .filter(Boolean)
    .map(m => ({ action: m[1].toUpperCase(), path: m[2].trim().replace(/^\//, '') }))
    .slice(0, 2)  // max 2 fichiers par tâche (économie)

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
        ? 'FICHIER ACTUEL (' + op.path + '):\n' + currentContent.slice(0, 10000)
        : 'Crée ' + op.path + ' from scratch.',
      'Génère le code COMPLET et fonctionnel. Code uniquement, pas de backticks.',
    ].filter(Boolean).join('\n')

    // Sonnet pour la génération de code (qualité critique)
    const newCode = await generateRaw(codePrompt, 5000, MODEL_SMART)
    let clean = newCode.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()

    // Review superviseur — Haiku suffit pour valider
    stage('testing')
    const reviewPrompt = [
      'Superviseur: vérifie ce code pour ' + op.path + ' (Trackr React+Vite).',
      'TÂCHE: ' + taskContent.slice(0, 200),
      'CODE (extrait):\n' + clean.slice(0, 6000),
      'Vérifie: syntaxe valide, tâche accomplie, pas de TODO/placeholder.',
      'Réponds APPROVED ou REJECTED\\nRAISON: ...\\nFIX: <code complet corrigé>',
    ].join('\n')

    const review = await generateRaw(reviewPrompt, 5000, MODEL_FAST)
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

// ── Discord notifications — live updates ──────────────────────────────────────
const NOTIF_EVERY_N   = 5              // notif toutes les N tâches terminées
const NOTIF_EVERY_MS  = 30 * 60 * 1000 // ou toutes les 30 minutes
const notifBuffer     = []             // { name, files, dur }
let   lastNotifTime   = Date.now()

async function flushDiscordNotif(force = false) {
  if (!notifBuffer.length) return
  if (!force && notifBuffer.length < NOTIF_EVERY_N && Date.now() - lastNotifTime < NOTIF_EVERY_MS) return
  if (!CH_UPDATES) { notifBuffer.length = 0; return }

  const count  = notifBuffer.length
  const since  = Math.round((Date.now() - lastNotifTime) / 60000)
  const lines  = notifBuffer.map(t => {
    const filesStr = (t.files || []).map(f => `\`${f.split('/').pop()}\``).join(', ') || `\`${t.name}\``
    return `✅ ${filesStr}`
  }).join('\n')

  const msg = [
    `🤖 **AnDy — ${count} tâche${count > 1 ? 's' : ''} terminée${count > 1 ? 's'  : ''}** _(${since}min)_`,
    `━━━━━━━━━━━━━━━━━━━━`,
    lines,
    `━━━━━━━━━━━━━━━━━━━━`,
    `🚀 Déployé sur Vercel · ${APP_URL}`,
  ].join('\n')

  const ok = await discordPost(CH_UPDATES, msg)
  log(`Discord notif: ${ok ? 'envoyée' : 'échec'} (${count} tâches)`)
  notifBuffer.length = 0
  lastNotifTime = Date.now()
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
  // ── Trackr App — redesign mobile-first ─────────────────────────────────────
  'Trackr/Dashboard — redesign complet: portfolio hero card neon vert, crypto movers horizontal scroll, news feed, Fear&Greed gauge, design tokens CSS vars --green --bg --t1',
  'Trackr/Sports — scores live ESPN ESPN animés, team cards couleurs de club, scroll tabs horizontal, countdown prochains matchs PSG/NFL/NBA',
  'Trackr/Markets — tab Stocks et Crypto propres, prix live pulsants couleur rouge/vert, sparklines, search bar sticky',
  'Trackr/News — header sticky avec tabs catégories scroll, cards avec accent bar couleur source, badge NEW/BREAKING, search inline',
  'Trackr/More — grille modules 2col dark, badges colorés, all-modules list avec chevron, settings tout en bas',
  // ── Design system ───────────────────────────────────────────────────────────
  'Trackr/CSS — design tokens propres dans index.css: --bg #080808 --green #00ff88 --t1 #f0f0f0 --border rgba(255,255,255,0.07), Inter font, press-scale, card, pill-up/down, scroll-row, tab-btn, page utility class',
  'Trackr/BottomNav — pill animé neon, icônes 22px, labels uppercase 9px, safe area bottom, badge news rouge',
  'Trackr/Animations — stagger fadeUp sur toutes les pages, page transitions slide 340ms, skeleton shimmer neon',
  // ── Performance ─────────────────────────────────────────────────────────────
  'Trackr/Performance — code splitting avec lazy/Suspense sur toutes les pages heavy (Sports, ChartAnalysis, FlightTracker), bundle target < 300kb',
  'Trackr/PWA — service worker cache offline, manifest icons 192/512, add-to-homescreen prompt mobile',
  // ── Crypto Trader ───────────────────────────────────────────────────────────
  'CryptoTrader/Setup — crée src/pages/CryptoTrader.jsx: interface trading mobile, orderbook simplifié, position tracker, P&L live, dark bloomberg terminal style',
  'CryptoTrader/Signals — crée src/pages/Signals.jsx: signaux IA de trading (RSI, MACD, volume), scoring bullish/bearish, alertes configurables',
  'CryptoTrader/Portfolio — améliore src/pages/Portfolio.jsx: intègre crypto holdings, allocation pie chart, total P&L en USD et %, top gainer/loser',
  // ── Dashboard serveur (/vibe) ───────────────────────────────────────────────
  'Serveur/Vibe — améliore deploy/dashboard.js VIBE_HTML: onglet LIVE plus détaillé (pipeline par tâche, durée, status), stats uptime/coût estimé',
  'Serveur/Logs — améliore onglet LOGS dans /vibe: filtre par niveau (info/error/warn), search, colors, auto-scroll to bottom',
  // ── Features app ───────────────────────────────────────────────────────────
  'Trackr/ChartAnalysis — améliore src/pages/ChartAnalysis.jsx: TradingView widget full width, bouton analyse IA avec prompt contextuel, résultats en card',
  'Trackr/Patterns — améliore src/pages/Patterns.jsx: 16 patterns chartistes avec illustrations SVG, description, exemple, niveau de confiance',
  'Trackr/Portfolio — améliore src/pages/Portfolio.jsx: ajout crypto positions, graphique allocation, stats avancées, export CSV',
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
    const taskStatus = readStatus().find(t => t.name === name)
    updateTaskStatus(name, { status: 'DONE', dur })
    renameSync(runningPath, runningPath.replace(/\.running$/, '.done'))
    log(`TASK DONE: ${name} (${dur}s)`)
    notifBuffer.push({ name, files: taskStatus?.files || [], dur })
    await flushDiscordNotif()
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
      // Haiku pour la génération de tâches (très économique)
      const raw   = await generateRaw(prompt, 600, MODEL_FAST)
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
      if (attempts < 3) await sl(15000)
    }
  }
  // Fallback statique
  const fallback = 'Audit sécurité Trackr — focus: ' + secDomain + '. Identifie et corrige les failles.'
  writeFileSync(resolve(TASKS_DIR, `auto-${prefix}-sec.txt`), fallback, 'utf8')
  log('fallback task injected')
}

// ── Discord morning recap — 7h00 ─────────────────────────────────────────────
function scheduleDiscordRecap() {
  const now = new Date(), target = new Date(now)
  target.setHours(7, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const ms = target - now
  log(`Discord recap schedulé à ${target.toLocaleString('fr-FR')} (dans ${Math.round(ms/60000)}min)`)

  setTimeout(async () => {
    const done    = taskLog.filter(t => t.status === 'DONE')
    const errors  = taskLog.filter(t => t.status === 'ERROR')
    const queue   = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt'))

    // Domaines travaillés cette nuit
    const domains = {}
    for (const t of done) {
      const d = (t.desc || '').split('—')[0].trim().replace(/^[A-Z0-9]+\//, '') || 'autre'
      domains[d] = (domains[d] || 0) + 1
    }
    const topDomains = Object.entries(domains).sort((a,b) => b[1]-a[1]).slice(0, 5)

    // Fichiers les plus modifiés
    const files = {}
    for (const t of done) {
      for (const f of (t.files || [])) {
        const name = f.split('/').pop()
        files[name] = (files[name] || 0) + 1
      }
    }
    const topFiles = Object.entries(files).sort((a,b) => b[1]-a[1]).slice(0, 8)

    // Durée totale de travail
    const totalSec = done.reduce((s, t) => s + (t.dur || 0), 0)
    const totalMin = Math.round(totalSec / 60)
    const estimatedCost = (done.length * 0.10).toFixed(2)

    const dateFR = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

    const lines = [
      `# 🤖 AnDy — Rapport du matin`,
      `**${dateFR} · 7h00**`,
      ``,
      `## 📊 Stats nuit`,
      `✅ **${done.length} tâches terminées** · ⏱ ${totalMin}min de travail · 💸 ~$${estimatedCost}`,
      errors.length ? `❌ **${errors.length} erreur${errors.length>1?'s':''}**` : ``,
      queue.length  ? `⏳ ${queue.length} en attente` : ``,
      `🔄 ${autoGenCount} cycles auto-génération`,
      ``,
      topDomains.length ? `## 🎯 Domaines travaillés\n${topDomains.map(([d,n]) => `• **${d}** — ${n} tâche${n>1?'s':''}`).join('\n')}` : '',
      ``,
      topFiles.length ? `## 📁 Fichiers modifiés\n${topFiles.map(([f,n]) => `\`${f}\` ×${n}`).join(' · ')}` : '',
      ``,
      `## 🏆 Dernières réussites`,
      ...done.slice(-8).map(t => `✔ \`${(t.desc||t.name).slice(0,70)}\``),
      errors.length ? `\n## ⚠️ Erreurs\n${errors.slice(-3).map(t => `✘ \`${t.name}\` — ${(t.error||'').slice(0,60)}`).join('\n')}` : '',
      ``,
      `## 🔗 Accès`,
      `📱 App Trackr: ${APP_URL}`,
      `🖥 Dashboard: http://62.238.12.221:4000/vibe`,
      `💬 AnDy chat: http://62.238.12.221:4000/chat`,
      `📦 Repo: https://github.com/${GITHUB_REPO}`,
    ].filter(l => l !== undefined).join('\n')

    const ok = await discordPost(CH_MORNING, lines.slice(0, 1990))
    log(`Discord recap 7h: ${ok ? 'envoyé ✓' : 'échec ✗'}`)
    scheduleDiscordRecap()
  }, ms)
}

// ── AI Data Export — snapshot portable de toute l'IA ─────────────────────────
const AI_DATA_DIR   = resolve(ROOT, 'ai-data')
const MEMORY_FILE   = resolve(ROOT, 'ANDY_MEMORY.json')
let   lastExportCount = 0
const EXPORT_EVERY_N  = 10  // exporte toutes les 10 tâches terminées

async function exportAIData() {
  try {
    mkdirSync(AI_DATA_DIR, { recursive: true })

    const allStatus = readStatus()
    const done   = allStatus.filter(t => t.status === 'DONE')
    const errors = allStatus.filter(t => t.status === 'ERROR')
    const files  = readdirSync(TASKS_DIR).filter(f => !f.startsWith('.'))

    // Charge la mémoire Andy
    let memory = {}
    try { memory = JSON.parse(readFileSync(MEMORY_FILE, 'utf8')) } catch {}

    // Stats agrégées
    const stats = {
      exportedAt:   new Date().toISOString(),
      totalDone:    done.length + files.filter(f => f.endsWith('.done')).length,
      totalErrors:  errors.length + files.filter(f => f.endsWith('.error')).length,
      totalQueue:   files.filter(f => f.endsWith('.txt')).length,
      autoGenCycles: autoGenCount,
      uptime:       process.uptime(),
      repo:         GITHUB_REPO,
      app:          APP_URL,
      model:        { code: MODEL_SMART, fast: MODEL_FAST },
    }

    // Domaines les plus travaillés
    const domainCount = {}
    for (const t of done) {
      const d = (t.desc || '').split('/')[0].trim() || 'other'
      domainCount[d] = (domainCount[d] || 0) + 1
    }

    // Fichiers les plus modifiés
    const fileCount = {}
    for (const t of done) {
      for (const f of (t.files || [])) {
        fileCount[f] = (fileCount[f] || 0) + 1
      }
    }
    const topFiles = Object.entries(fileCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([f, n]) => ({ file: f, times: n }))

    // Écrit tous les fichiers d'export
    writeFileSync(resolve(AI_DATA_DIR, 'stats.json'),
      JSON.stringify(stats, null, 2), 'utf8')
    writeFileSync(resolve(AI_DATA_DIR, 'task-history.json'),
      JSON.stringify(allStatus.slice(-500), null, 2), 'utf8')
    writeFileSync(resolve(AI_DATA_DIR, 'memory.json'),
      JSON.stringify(memory, null, 2), 'utf8')
    writeFileSync(resolve(AI_DATA_DIR, 'domains.json'),
      JSON.stringify({ domains: domainCount, topFiles }, null, 2), 'utf8')
    writeFileSync(resolve(AI_DATA_DIR, 'README.md'), [
      '# AnDy AI Data Export',
      '',
      `> Généré automatiquement — ${new Date().toLocaleString('fr-FR')}`,
      '',
      '## Contenu',
      '| Fichier | Description |',
      '|---------|-------------|',
      '| `stats.json` | Stats globales (tâches, uptime, modèles) |',
      '| `task-history.json` | Historique des 500 dernières tâches |',
      '| `memory.json` | Mémoire complète d\'AnDy (ANDY_MEMORY.json) |',
      '| `domains.json` | Domaines travaillés + fichiers les plus modifiés |',
      '',
      '## Migration vers un nouveau serveur',
      '```bash',
      '# 1. Clone le repo',
      `git clone https://github.com/${GITHUB_REPO}`,
      '# 2. Copie ton .env',
      'scp root@ancien-serveur:/root/trackr/.env /root/trackr/.env',
      '# 3. Lance',
      'pm2 start ecosystem.config.cjs && pm2 save && pm2 startup',
      '```',
      '',
      `## Stats actuelles`,
      `- **Tâches terminées :** ${stats.totalDone}`,
      `- **Cycles auto-gen :** ${autoGenCount}`,
      `- **Repo :** ${GITHUB_REPO}`,
      `- **App :** ${APP_URL}`,
    ].join('\n'), 'utf8')

    // Push vers GitHub
    try {
      execSync(`cd ${ROOT} && git add ai-data/ && git commit -m "[AnDy] export ai-data — ${stats.totalDone} tasks" && git pull origin main --no-rebase -X ours -q && git push origin main -q`, { stdio: 'pipe' })
      log(`AI data exported & pushed — ${stats.totalDone} tasks total`)
    } catch (e) {
      log(`AI export local OK, push skipped: ${e.message?.slice(0, 60)}`)
    }
  } catch (err) {
    log(`exportAIData error: ${err.message}`)
  }
}

// ── Self-update — pull le nouveau code depuis GitHub ─────────────────────────
let lastSelfUpdate = Date.now()
const SELF_UPDATE_EVERY_MS = 60 * 60 * 1000  // toutes les heures

async function selfUpdate() {
  if (Date.now() - lastSelfUpdate < SELF_UPDATE_EVERY_MS) return
  lastSelfUpdate = Date.now()
  try {
    const out = execSync(`cd ${ROOT} && git pull origin main --no-rebase -X ours -q 2>&1`, { stdio: 'pipe' }).toString().trim()
    if (out && !out.includes('Already up to date')) {
      log(`Self-update: ${out.slice(0, 100)}`)
    }
  } catch {}
}

// ── Main loop ─────────────────────────────────────────────────────────────────
// Coût estimé par tâche : ~$0.08-0.12 (Haiku plan+review, Sonnet code)
// $20 de crédits ≈ 160-250 tâches
const PAUSE_BETWEEN_TASKS = 20   // secondes entre chaque tâche (évite burst)
const PAUSE_BETWEEN_CYCLES = 120 // secondes entre cycles d'auto-gen

async function main() {
  mkdirSync(TASKS_DIR, { recursive: true })
  log('=== AnDy Daemon démarré ===')
  log(`Repo: ${GITHUB_REPO} | App: ${APP_URL}`)
  log(`Modèles: code=${MODEL_SMART} plan/review/gen=${MODEL_FAST}`)

  // Nettoyage des .error et .running du démarrage précédent
  const stale = readdirSync(TASKS_DIR).filter(f => f.endsWith('.running') || f.endsWith('.error'))
  if (stale.length) {
    const archiveDir = resolve(TASKS_DIR, '_archive')
    mkdirSync(archiveDir, { recursive: true })
    for (const f of stale) {
      try {
        const src = resolve(TASKS_DIR, f)
        const dst = resolve(archiveDir, f)
        renameSync(src, dst)
      } catch {}
    }
    log(`Archivé ${stale.length} fichier(s) stale → andy-tasks/_archive/`)
  }

  scheduleDiscordRecap()

  while (true) {
    await waitForOnline()
    await flushSyncQueue()

    const queue = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt')).sort()

    // Self-update depuis GitHub toutes les heures
    await selfUpdate()

    // Flush notif si ça fait 30min sans envoyer (même si < 5 tâches)
    if (Date.now() - lastNotifTime > NOTIF_EVERY_MS) await flushDiscordNotif(true)

    // Export AI data toutes les EXPORT_EVERY_N tâches
    const doneSoFar = taskLog.filter(t => t.status === 'DONE').length
    if (doneSoFar > 0 && doneSoFar % EXPORT_EVERY_N === 0 && doneSoFar !== lastExportCount) {
      lastExportCount = doneSoFar
      await exportAIData()
    }

    if (queue.length) {
      log(`${queue.length} tâche(s) en queue`)
      for (const f of queue) {
        const fp = resolve(TASKS_DIR, f)
        if (existsSync(fp)) {
          await runTask(fp)
          await sl(PAUSE_BETWEEN_TASKS * 1000)
        }
      }
    } else {
      await generateNextTasks()
      const after = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt'))
      if (!after.length) {
        log(`Pas de tâches — pause ${PAUSE_BETWEEN_CYCLES}s`)
        await sl(PAUSE_BETWEEN_CYCLES * 1000)
      } else {
        // Petite pause avant de traiter le nouveau cycle
        await sl(10000)
      }
    }

    await sl(500)
  }
}

main().catch(err => {
  log('FATAL: ' + err.message)
  process.exit(1)
})
