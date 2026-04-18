#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  AnDy Daemon v3 — workers stables, Discord fiable, auto-amélioration
//  Fixes: Discord lit .task-status.json (plus RAM), 2 workers (rate limit safe),
//         semaphore API global, startup ping, heartbeat 4h, requeue .running
// ─────────────────────────────────────────────────────────────────────────────

import { existsSync, readFileSync, writeFileSync, renameSync, readdirSync, mkdirSync, unlinkSync } from 'fs'
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
      if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
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
const CH_UPDATES   = process.env.DISCORD_CH_UPDATES || CH_MORNING
const CH_NOISE     = process.env.DISCORD_CH_NOISE   || CH_UPDATES  // channel secondaire pour les notifs peu importantes
const DISCORD_API  = 'https://discord.com/api/v10'

// Juge si une notif mérite le channel principal ou le channel secondaire
// Retourne 'important' ou 'noise'
function judgeNotif(taskName = '', files = []) {
  const n = taskName.toLowerCase()
  // Toujours important
  if (n.startsWith('manual-') || n.startsWith('urgent-') || n.startsWith('critical-') || n.startsWith('fix-')) return 'important'
  // Fichiers visibles par l'utilisateur = important
  const userFiles = ['dashboard', 'sports', 'markets', 'news', 'bottomnav', 'cryptotrader', 'signals', 'portfolio', 'more', 'andy', 'index.css', 'app.jsx']
  if (files.some(f => userFiles.some(u => f.toLowerCase().includes(u)))) return 'important'
  // Memory, internal, auto mineurs = noise
  if (n.includes('memory') || n.includes('learning') || n.includes('reflect') || n.includes('self-improve')) return 'noise'
  if (n.startsWith('auto-') && !files.some(f => f.startsWith('src/'))) return 'noise'
  // Tout le reste auto = noise
  if (n.startsWith('auto-')) return 'noise'
  return 'important'
}

// ── Logging ───────────────────────────────────────────────────────────────────
const _liveLog = []
function log(msg) {
  const clean = msg.replace(/\x1b\[[0-9;]*m/g, '')
  process.stdout.write('[' + new Date().toISOString() + '] ' + clean + '\n')
  _liveLog.push({ ts: new Date().toISOString(), msg: clean })
  if (_liveLog.length > 100) _liveLog.shift()
}

const sl = ms => new Promise(r => setTimeout(r, ms))

// ── Discord ───────────────────────────────────────────────────────────────────
async function discordPost(channelId, content) {
  if (!BOT_TOKEN || !channelId) { log('Discord: BOT_TOKEN ou channelId manquant'); return false }
  try {
    const r = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: content.slice(0, 1990) }),
      signal: AbortSignal.timeout(12000),
    })
    if (!r.ok) {
      const body = await r.text().catch(() => '')
      log(`Discord error ${r.status}: ${body.slice(0, 100)}`)
    }
    return r.ok
  } catch (e) { log(`Discord exception: ${e.message}`); return false }
}

// ── Network ───────────────────────────────────────────────────────────────────
const SYNC_QUEUE_FILE = resolve(ROOT, 'andy-tasks', '.sync-queue.json')

async function checkOnline() {
  try {
    const r = await fetch('https://api.github.com', { method: 'HEAD', signal: AbortSignal.timeout(4000) })
    return r.ok || r.status < 500
  } catch { return false }
}

function loadSyncQueue()  { try { return JSON.parse(readFileSync(SYNC_QUEUE_FILE, 'utf8')) } catch { return [] } }
function saveSyncQueue(q) { writeFileSync(SYNC_QUEUE_FILE, JSON.stringify(q, null, 2), 'utf8') }

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
    'User-Agent': 'AnDy-Daemon/3',
  }
}

async function ghGet(path) {
  const r = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}${path}`, {
    headers: ghHeaders(), signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  return r?.ok ? r.json().catch(() => null) : null
}

async function ghWriteFile(filePath, content, message, sha) {
  const encoded = Buffer.from(content).toString('base64')
  // Si pas de SHA fourni, tenter de le récupérer (fichier existant)
  if (!sha) {
    const existing = await ghGet(`/contents/${filePath}`)
    if (existing?.sha) sha = existing.sha
  }
  const body = { message, content: encoded, ...(sha ? { sha } : {}) }
  const r = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
    method: 'PUT', headers: ghHeaders(), body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  }).catch(() => null)
  if (r?.ok) return true
  // 422 = conflit SHA — re-fetch et retry une fois
  if (r?.status === 422) {
    const fresh = await ghGet(`/contents/${filePath}`)
    if (fresh?.sha) {
      const r2 = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
        method: 'PUT', headers: ghHeaders(),
        body: JSON.stringify({ message, content: encoded, sha: fresh.sha }),
        signal: AbortSignal.timeout(20000),
      }).catch(() => null)
      return r2?.ok || false
    }
  }
  return false
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

// ── Providers LLM — chaîne multi-provider avec cooldown par provider ──────────
//
//  1. Groq        GRATUIT — console.groq.com        — llama-3.3-70b · 6000 req/jour
//  2. Gemini      GRATUIT — aistudio.google.com     — 1.5-flash · 1M tokens/jour
//  3. OpenRouter  GRATUIT — openrouter.ai           — models :free (llama-3.1-70b)
//  4. Anthropic   PAYANT  — anthropic.com           — fallback si crédits dispo
//  5. Ollama      LOCAL   — si OLLAMA_URL défini    — qwen2.5-coder ou autre
//
//  Pour activer un provider, ajouter la clé dans .env :
//    GROQ_API_KEY=gsk_...      (console.groq.com — gratuit, pas de CB)
//    GEMINI_API_KEY=AIza...    (aistudio.google.com — gratuit, pas de CB)
//    OPENROUTER_API_KEY=sk-... (openrouter.ai — gratuit, modèles :free)

const GROQ_KEY       = process.env.GROQ_API_KEY       || ''
const GEMINI_KEY     = process.env.GEMINI_API_KEY      || ''
const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY  || ''
const OLLAMA_URL     = process.env.OLLAMA_URL          || ''
const OLLAMA_MODEL   = process.env.OLLAMA_MODEL        || 'qwen2.5-coder:7b'

// Modèles
const MODEL_SMART  = 'claude-3-5-sonnet-20241022'
const MODEL_FAST   = 'claude-3-5-haiku-20241022'
const GROQ_SMART   = 'llama-3.3-70b-versatile'
const GROQ_FAST    = 'llama-3.1-8b-instant'

// Semaphore global
const API_SEMAPHORE_LIMIT = 3
let   apiConcurrent = 0

// Cooldown par provider — évite retry inutile quand daily limit ou crédits épuisés
const providerCooldown = { groq: 0, gemini: 0, openrouter: 0, anthropic: 0, ollama: 0 }

function providerAvailable(name) { return Date.now() >= (providerCooldown[name] || 0) }

function setCooldown(name, seconds) {
  providerCooldown[name] = Date.now() + seconds * 1000
  log(`[LLM] ${name} cooldown: ${seconds >= 3600 ? Math.round(seconds/3600) + 'h' : Math.round(seconds/60) + 'min'}`)
}

// ── System prompt ─────────────────────────────────────────────────────────────
const SYSTEM = `Tu es AnDy, l'IA autonome d'Andrea Matlega.

APPS ACTIVES:
1. Trackr (app principale) — React 19 + Vite mobile-first, Vercel. Repo: ${GITHUB_REPO}. URL: ${APP_URL}
   Pages: Dashboard, Sports (PSG/NFL/NBA/UFC), Markets (Stocks/Crypto), News (RSS), More, Andy (IA chat), Agents, Portfolio, CryptoTrader, Signals, BrainExplorer, FlightTracker, Sneakers, Watches, RealEstate, BusinessPlan, Patterns, ChartAnalysis
2. Dashboard serveur — Node.js port 4000, /vibe (dev mobile), /chat (AnDy chat), /api/* (data)

Tu travailles en mode autonome 24/7 — tu génères du code production-ready, tu le pousses sur GitHub.
Règles ABSOLUES:
- Code complet et fonctionnel (pas de TODO, pas de placeholder, pas de lorem ipsum)
- Mobile-first, dark theme (#080808 fond, #00ff88 accent neon)
- Design tokens CSS vars: --green, --bg, --bg2, --bg3, --border, --border-hi, --t1, --t2, --t3
- Préfère améliorer ce qui existe plutôt que créer de zéro
- Si tu modifies un fichier, tu gardes toute la logique existante
- Imports: vérifie que les librairies sont dans package.json avant de les importer
- Pas de librairies externes non installées (recharts, framer-motion, etc. ne sont pas disponibles)
- Librairies disponibles: react, react-router-dom, lucide-react, @supabase/supabase-js`

// ── OpenAI-compatible call (Groq, OpenRouter, Ollama) ────────────────────────
async function callOpenAI(baseUrl, apiKey, model, prompt, maxTokens, extraHeaders = {}) {
  const res = await fetch(`${baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}), ...extraHeaders },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: prompt }], max_tokens: maxTokens, temperature: 0.4 }),
    signal: AbortSignal.timeout(60000),
  }).catch(err => { throw new Error(`Réseau: ${err.message}`) })
  if (res.status === 429) {
    const s = parseInt(res.headers?.get?.('retry-after') || '30') || 30
    throw new Error(`429:${s}`)
  }
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(`API ${res.status}: ${(b?.error?.message || '').slice(0,100)}`) }
  const d = await res.json().catch(() => null)
  return d?.choices?.[0]?.message?.content?.trim() || null
}

// ── Gemini REST call (gratuit — aistudio.google.com) ─────────────────────────
async function callGemini(prompt, maxTokens) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: Math.min(maxTokens, 8192), temperature: 0.4 },
      }),
      signal: AbortSignal.timeout(60000),
    }
  ).catch(err => { throw new Error(`Réseau: ${err.message}`) })
  if (res.status === 429) {
    const d = await res.json().catch(() => ({}))
    const retryMs = d?.error?.details?.find(x => x.retryDelay)?.retryDelay
    const s = retryMs ? Math.ceil(parseInt(retryMs) / 1000) || 60 : 60
    throw new Error(`429:${s}`)
  }
  if (!res.ok) { const b = await res.json().catch(() => ({})); throw new Error(`Gemini ${res.status}: ${(b?.error?.message || '').slice(0,80)}`) }
  const d = await res.json().catch(() => null)
  return d?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || null
}

// ── Multi-provider LLM — chaîne de fallback intelligente ─────────────────────
async function generateRaw(prompt, maxTokens = 4096, hint = 'smart') {
  while (apiConcurrent >= API_SEMAPHORE_LIMIT) await sl(500)
  apiConcurrent++
  try {
    // Helper: appelle un provider avec retries sur 429 transient
    async function tryProvider(name, callFn, maxRetries = 3) {
      if (!providerAvailable(name)) return null
      for (let i = 0; i < maxRetries; i++) {
        try {
          const text = await callFn()
          if (text) { log(`[LLM] ✓ ${name}`); return text }
        } catch (e) {
          if (e.message.startsWith('429:')) {
            const raw = parseInt(e.message.split(':')[1]) || 30
            if (raw > 300) {
              setCooldown(name, Math.min(raw, 8 * 3600))  // daily limit — cooldown jusqu'à reset
              return null
            }
            const wait = Math.min(raw, 60) + 3
            log(`[LLM] ${name} 429 — wait ${wait}s`)
            await sl(wait * 1000)
            continue
          }
          if (/credit|billing|quota|insufficient_quota/i.test(e.message)) {
            setCooldown(name, 24 * 3600)
            log(`[LLM] ${name} crédits épuisés — cooldown 24h`)
            return null
          }
          log(`[LLM] ${name} tentative ${i+1}/${maxRetries}: ${e.message.slice(0,80)}`)
          if (i < maxRetries - 1) await sl(3000)
        }
      }
      return null
    }

    // 1. Groq — primary (meilleur qualité gratuit)
    if (GROQ_KEY && providerAvailable('groq')) {
      const model = hint === 'fast' ? GROQ_FAST : GROQ_SMART
      const text = await tryProvider('groq', () => callOpenAI('https://api.groq.com/openai', GROQ_KEY, model, prompt, maxTokens))
      if (text) return text
    }

    // 2. Gemini 1.5 Flash — gratuit, 1M tokens/jour (aistudio.google.com)
    if (GEMINI_KEY && providerAvailable('gemini')) {
      const text = await tryProvider('gemini', () => callGemini(prompt, maxTokens), 2)
      if (text) return text
    }

    // 3. OpenRouter — modèles :free (openrouter.ai — compte gratuit)
    if (OPENROUTER_KEY && providerAvailable('openrouter')) {
      const model = hint === 'fast' ? 'meta-llama/llama-3.1-8b-instruct:free' : 'meta-llama/llama-3.1-70b-instruct:free'
      const text = await tryProvider('openrouter',
        () => callOpenAI('https://openrouter.ai/api', OPENROUTER_KEY, model, prompt, maxTokens,
          { 'HTTP-Referer': APP_URL, 'X-Title': 'AnDy-Daemon' }), 2)
      if (text) return text
    }

    // 4. Anthropic — payant, fallback
    if (API_KEY && providerAvailable('anthropic')) {
      try {
        const model = hint === 'fast' ? MODEL_FAST : MODEL_SMART
        const res = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model, max_tokens: maxTokens, system: SYSTEM, stream: false, messages: [{ role: 'user', content: prompt }] }),
          signal: AbortSignal.timeout(60000),
        })
        if (res.status === 429) {
          setCooldown('anthropic', 60)
        } else if (res.status === 400 || res.status === 402) {
          const b = await res.json().catch(() => ({}))
          if (/credit|billing|quota/i.test(b?.error?.message || '')) setCooldown('anthropic', 24 * 3600)
          else throw new Error(`Anthropic ${res.status}: ${(b?.error?.message || '').slice(0,80)}`)
        } else if (res.ok) {
          const d = await res.json().catch(() => null)
          const text = d?.content?.[0]?.text?.trim()
          if (text) return text
        }
      } catch (e) { log(`[LLM] Anthropic: ${e.message.slice(0,80)}`) }
    }

    // 5. Ollama — local (si installé sur le VPS)
    if (OLLAMA_URL && providerAvailable('ollama')) {
      const text = await tryProvider('ollama', () => callOpenAI(OLLAMA_URL, '', OLLAMA_MODEL, prompt, maxTokens), 2)
      if (text) return text
    }

    throw new Error('LLM indisponible')
  } finally {
    apiConcurrent--
  }
}

// ── Task status ───────────────────────────────────────────────────────────────
const TASKS_DIR   = resolve(ROOT, 'andy-tasks')
const STATUS_FILE = resolve(ROOT, 'andy-tasks', '.task-status.json')
const LIVE_FILE   = resolve(ROOT, 'andy-tasks', '.live-state.json')

// ── Live state — écrit à chaque événement, lu par le dashboard ───────────────
const liveWorkers = {}  // { [id]: { task, stage, since } }

function writeLiveState() {
  try {
    const allStatus = readStatus()
    const done   = allStatus.filter(t => t.status === 'DONE')
    const errors = allStatus.filter(t => t.status === 'ERROR')
    const queue  = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt'))
    const running = readdirSync(TASKS_DIR).filter(f => f.endsWith('.running'))

    writeFileSync(LIVE_FILE, JSON.stringify({
      updatedAt:    new Date().toISOString(),
      workers:      liveWorkers,
      stats: {
        done:    done.length,
        errors:  errors.length,
        queue:   queue.length,
        running: running.length,
        session: totalDoneSession,
        cycles:  autoGenCount,
        cost:    (done.length * 0.10).toFixed(2),
      },
      recentDone:  done.slice(-20).reverse(),
      recentErrors: errors.slice(-10).reverse(),
      log:         _liveLog.slice(-50),
    }, null, 2), 'utf8')
  } catch {}
}

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
  try { writeFileSync(STATUS_FILE, JSON.stringify(list.slice(-200), null, 2), 'utf8') } catch {}
}

// ── Execute task ──────────────────────────────────────────────────────────────
async function executeTask(taskContent, taskName = '', isManual = false) {
  const ts    = () => new Date().toISOString()
  const stage = (s, extra = {}) => {
    if (taskName) {
      updateTaskStatus(taskName, { stage: s, stages: { [s]: ts() }, ...extra })
      if (liveWorkers._current) liveWorkers._current.stage = s
      writeLiveState()
    }
  }

  // Vérifie si on doit céder la place à une tâche manuelle urgente
  const checkInterrupt = () => {
    if (!isManual && urgentPending()) throw new InterruptError()
  }

  const planPrompt = [
    'TÂCHE: ' + taskContent.slice(0, 600),
    'Identifie les fichiers à créer ou modifier dans le projet Trackr.',
    'Fichiers autorisés: src/**/*.jsx, src/**/*.tsx, src/**/*.js, src/**/*.css, api/*.js, deploy/*.js, public/*.json, public/*.js, ai-data/*.md, vercel.json, vite.config.js, index.html',
    'Format — une ligne par fichier:',
    'CREATE:chemin/fichier.ext',
    'MODIFY:chemin/fichier.ext',
    'Max 2 fichiers, chemins relatifs. Rien d\'autre.',
  ].join('\n')

  stage('planning')
  checkInterrupt()
  const plan    = await generateRaw(planPrompt, 300, 'fast')
  const fileOps = plan.split('\n')
    .map(l => l.match(/^(CREATE|MODIFY):(.+\.[\w]+)/i))
    .filter(Boolean)
    .map(m => ({ action: m[1].toUpperCase(), path: m[2].trim().replace(/^\//, '') }))
    .filter(o => o.path.startsWith('src/') || o.path.startsWith('api/') || o.path.startsWith('cli/') || o.path.startsWith('deploy/') || o.path.startsWith('public/') || o.path.startsWith('ai-data/') || o.path === 'vercel.json' || o.path === 'vite.config.js' || o.path === 'index.html')
    .slice(0, 2)

  if (!fileOps.length) throw new Error('Plan vide ou chemins invalides')

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
      '',
      'RÈGLES:',
      '- Code COMPLET et fonctionnel, pas de TODO, pas de placeholder',
      '- Utilise CSS vars: --green #00ff88, --bg #080808, --bg2 #111, --t1 #f0f0f0, --t2 #888, --t3 #444, --border rgba(255,255,255,0.07)',
      '- Mobile-first, dark theme, Inter font',
      '- Pas de librairies non installées (pas de recharts, framer-motion, chart.js)',
      'Code uniquement, pas de backticks.',
    ].filter(Boolean).join('\n')

    checkInterrupt()
    const newCode = await generateRaw(codePrompt, 4000, 'smart')
    let clean = newCode.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()
    if (clean.length < 50) throw new Error('Code trop court')

    stage('safe')

    // ── Écrire + pousser directement (Vercel valide le build au déploiement) ─
    const localPath = resolve(ROOT, op.path)
    const fname = op.path.split('/').pop()
    try {
      mkdirSync(localPath.replace(/\/[^/]+$/, ''), { recursive: true })
      writeFileSync(localPath, clean, 'utf8')
    } catch (e) { log(`write local skip: ${e.message}`) }

    const commitMsg = `[AnDy] ${op.action === 'CREATE' ? 'feat' : 'update'}: ${op.path}`
    const ok = await ghWriteFile(op.path, clean, commitMsg, sha)
    if (ok) {
      stage('live')
      log(`pushed: ${op.path} → Vercel deploying`)
      // Notif Discord — déployé, app à jour
      discordPost(CH_UPDATES, `🚀 **Déployé** — \`${fname}\` pushé sur GitHub\n📱 Vercel redéploie → **ton app se met à jour dans ~2min**\n🔗 ${APP_URL}`)
    } else {
      const online = await checkOnline()
      if (!online) {
        const q = loadSyncQueue()
        q.push({ filePath: op.path, content: clean, message: commitMsg, sha: sha || null })
        saveSyncQueue(q)
        log(`offline — queued: ${op.path}`)
      } else {
        throw new Error(`Push GitHub échoué: ${op.path}`)
      }
    }
  }
}

// ── Run task ──────────────────────────────────────────────────────────────────
let autoGenCount = 0
let totalDoneSession = 0
let totalErrorSession = 0

// Buffer Discord notifs
const notifBuffer     = []
let   lastNotifTime   = Date.now()
const NOTIF_EVERY_N   = 1
const NOTIF_EVERY_MS  = 5 * 60 * 1000   // 5min

async function flushDiscordNotif(force = false) {
  if (!notifBuffer.length) return
  if (!force && notifBuffer.length < NOTIF_EVERY_N && Date.now() - lastNotifTime < NOTIF_EVERY_MS) return
  if (!CH_UPDATES) { notifBuffer.length = 0; return }

  // Sépare les notifs importantes des bruits de fond
  const important = notifBuffer.filter(t => judgeNotif(t.name, t.files) === 'important')
  const noise     = notifBuffer.filter(t => judgeNotif(t.name, t.files) === 'noise')
  const since     = Math.round((Date.now() - lastNotifTime) / 60000)

  if (important.length) {
    const lines = important.map(t => {
      const files = (t.files || []).map(f => `\`${f.split('/').pop()}\``).join(' ') || `\`${t.name}\``
      return `✅ ${files} _(${t.dur}s)_`
    }).join('\n')
    await discordPost(CH_UPDATES, [
      `🤖 **AnDy — ${important.length} update${important.length>1?'s':''}** _(${since}min)_`,
      `━━━━━━━━━━━━━━━━━━━━`,
      lines,
      `━━━━━━━━━━━━━━━━━━━━`,
      `📱 ${APP_URL}`,
    ].join('\n'))
  }

  if (noise.length && CH_NOISE !== CH_UPDATES) {
    const lines = noise.map(t => `· \`${t.name}\` (${t.dur}s)`).join('\n')
    await discordPost(CH_NOISE, [
      `⚙️ **AnDy — ${noise.length} tâche${noise.length>1?'s':''} interne${noise.length>1?'s':''}**`,
      lines,
    ].join('\n'))
  }

  notifBuffer.length = 0
  lastNotifTime = Date.now()
}

const TASK_TIMEOUT_MS = 4 * 60 * 1000  // 4min max par tâche
const skipQueue = []                  // tâches à retry après la queue principale

async function runTask(filePath) {
  const name    = filePath.split('/').pop().replace(/\.txt$/, '')
  const content = readFileSync(filePath, 'utf8').trim()
  if (!content) { renameSync(filePath, filePath.replace(/\.txt$/, '.done')); return }

  const startTime = Date.now()
  log(`TASK START: ${name}`)

  updateTaskStatus(name, {
    desc: content.slice(0, 100),
    startedAt: new Date().toISOString(),
    stage: 'started', stages: { started: new Date().toISOString() },
    files: [], status: 'RUNNING', dur: 0, error: null,
  })

  const runningPath = filePath.replace(/\.txt$/, '.running')
  renameSync(filePath, runningPath)

  const isManual = name.startsWith('manual-') || name.startsWith('urgent-')
  if (isManual) discordPost(CH_UPDATES, `⚡ **Tâche prioritaire démarrée**\n\`${name}\`\n> ${content.slice(0, 120)}`)

  try {
    // Timeout dur — skip si trop long, retry à la fin
    await Promise.race([
      executeTask(content, name, isManual),
      new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), TASK_TIMEOUT_MS)),
    ])

    const dur = Math.round((Date.now() - startTime) / 1000)
    const taskStatus = readStatus().find(t => t.name === name)
    updateTaskStatus(name, { status: 'DONE', dur })
    renameSync(runningPath, runningPath.replace(/\.running$/, '.done'))
    totalDoneSession++
    log(`TASK DONE: ${name} (${dur}s) [session: ${totalDoneSession}]`)
    notifBuffer.push({ name, files: taskStatus?.files || [], dur })
    await flushDiscordNotif()

  } catch (err) {
    if (err.isInterrupt) {
      renameSync(runningPath, runningPath.replace(/\.running$/, '.txt'))
      claimedTasks.delete(name + '.txt')
      updateTaskStatus(name, { status: 'QUEUED', stage: 'queued' })
      log(`TASK INTERRUPTED: ${name}`)
      return
    }

    const dur = Math.round((Date.now() - startTime) / 1000)

    // TIMEOUT ou erreur → skip et retry à la fin au lieu de marquer ERROR permanent
    if (err.message === 'TIMEOUT' || err.message.includes('LLM indisponible')) {
      renameSync(runningPath, runningPath.replace(/\.running$/, '.txt'))
      claimedTasks.delete(name + '.txt')
      skipQueue.push(name + '.txt')
      updateTaskStatus(name, { status: 'QUEUED', stage: 'skip-retry', error: err.message })
      log(`TASK SKIP (retry later): ${name} — ${err.message}`)
      return
    }

    updateTaskStatus(name, { status: 'ERROR', stage: 'error', dur, error: err.message })
    renameSync(runningPath, runningPath.replace(/\.running$/, '.error'))
    totalErrorSession++
    log(`TASK ERROR: ${name} — ${err.message}`)
  }
}

// ── Auto-gen — génère de nouvelles tâches intelligemment ─────────────────────
const TASK_DOMAINS = [
  'Trackr/Dashboard — redesign: hero card portfolio neon vert, crypto movers scroll, Fear&Greed gauge SVG, news feed, quick actions 2x2',
  'Trackr/Sports — ESPN live scores animés, team cards couleurs club, tabs PSG/NBA/NFL/UFC scroll horizontal',
  'Trackr/Markets — Stocks et Crypto, prix live pulsants rouge/vert, sparklines SVG, search bar sticky',
  'Trackr/News — header sticky tabs catégories, cards accent bar couleur source, badge BREAKING/NEW',
  'Trackr/More — grille modules 2col, badges NEW/LIVE, settings dark mode toggle en bas',
  'Trackr/CSS — design tokens index.css: variables CSS complètes, Inter font, animations fadeUp/ping/shimmer',
  'Trackr/BottomNav — pill animé neon qui suit l onglet actif, safe area bottom, badge news rouge',
  'Trackr/Performance — lazy/Suspense sur pages lourdes, bundle < 300kb',
  'Trackr/PWA — service worker cache offline, manifest complet avec shortcuts',
  'Trackr/CryptoTrader — interface trading bloomberg dark, orderbook, positions P&L live',
  'Trackr/Signals — signaux IA (RSI/MACD/Volume), scoring bullish/bearish, alertes',
  'Trackr/Portfolio — graphique performance SVG, pie chart allocation, total P&L',
  'Trackr/Andy — chat premium: bulles messages, thinking animé, suggestions rapides',
  'Trackr/BrainExplorer — arbre tâches infini, task detail panel, activité 24h',
  'Trackr/Animations — stagger fadeUp, page transitions 340ms, skeleton shimmer neon',
  'Serveur/Vibe — pipeline par tâche détaillée, stats uptime/coût, logs filtrables',
  'Trackr/Security — sanitisation inputs, CSP headers, rate limiting, validation',
  'Trackr/ChartAnalysis — TradingView widget full width, analyse IA contextuelle',
  'Trackr/Patterns — 16 patterns chartistes SVG, description, niveau confiance',
  'Trackr/FlightTracker — design premium, statut live, alertes perturbations',
]

const SECURITY_DOMAINS = [
  'XSS — sanitisation inputs, dangerouslySetInnerHTML',
  'auth — expiration sessions Supabase, refresh tokens',
  'secrets — aucune clé API exposée côté client',
  'rate-limiting — brute-force sur /api/auth',
  'validation — paramètres query/body strictement validés',
  'outputs IA — valider code avant push',
]

function getRecentDomains(n = 12) {
  const all  = readStatus()
  const done = all.filter(t => t.status === 'DONE').slice(-n)
  return done.map(t => (t.desc || t.name || '').split(/[—\-\/]/)[0].trim().toLowerCase())
}

function pickNextDomain() {
  const recentDomains = getRecentDomains(12)
  const fresh = TASK_DOMAINS.filter(d => {
    const key = d.split(/[—\-\/]/)[0].trim().toLowerCase()
    return !recentDomains.some(r => r.slice(0, 8) === key.slice(0, 8))
  })
  const pool = fresh.length > 0 ? fresh : TASK_DOMAINS
  return pool[autoGenCount % pool.length]
}

function loadMemoryContext() {
  try {
    const mem  = JSON.parse(readFileSync(resolve(ROOT, 'ANDY_MEMORY.json'), 'utf8'))
    const entries = (mem.entries || []).slice(-15)
    const patterns = entries.filter(e => e.type === 'pattern_scan').flatMap(e => e.findings || []).slice(-5)
    if (!patterns.length) return ''
    return 'Bugs/patterns connus: ' + patterns.map(p => `${p.file}: ${p.description}`).join(' | ')
  } catch { return '' }
}

async function generateNextTasks() {
  autoGenCount++
  const domain    = pickNextDomain()
  const secDomain = SECURITY_DOMAINS[autoGenCount % SECURITY_DOMAINS.length]
  const prefix    = String(Date.now())
  const allStatus = readStatus()
  const done      = allStatus.filter(t => t.status === 'DONE')
  const errors    = allStatus.filter(t => t.status === 'ERROR')
  const recentDone = done.slice(-6).map(t => (t.desc || t.name).slice(0, 45))
  const recentErrs = errors.slice(-3).map(e => e.name + ': ' + (e.error || '').slice(0, 40))
  const memCtx    = loadMemoryContext()

  log(`AUTO-GEN #${autoGenCount} — focus: ${domain.slice(0, 55)}`)

  const prompt = [
    'Projet Trackr — React 19 + Vite mobile-first, repo: ' + GITHUB_REPO,
    'STACK: react, react-router-dom, lucide-react, @supabase/supabase-js (SEULEMENT ces librairies)',
    'OBJECTIF: rendre chaque page visuellement impressionnante, fluide, pro.',
    'Design: dark #080808, neon #00ff88, Inter, CSS vars --green --bg --bg2 --t1 --t2 --t3.',
    '',
    memCtx || '',
    'Tâches récentes terminées (' + done.length + ' total): ' + (recentDone.join(' · ') || 'aucune'),
    recentErrs.length ? 'ERREURS À ÉVITER: ' + recentErrs.join(' · ') : '',
    '',
    'FOCUS: ' + domain,
    'FOCUS SÉCURITÉ: ' + secDomain,
    '',
    'Génère 3 tâches concrètes NON DUPLIQUÉES. Chaque tâche doit spécifier le fichier exact.',
    'Format strict — exactement 3 lignes commençant par TASK:',
    'TASK: <description précise avec fichier(s) cible(s)>',
  ].filter(Boolean).join('\n')

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw   = await generateRaw(prompt, 800, 'fast')
      const tasks = raw.split('\n').map(l => l.match(/^TASK:\s*(.+)/i)?.[1]?.trim()).filter(Boolean)
      if (!tasks.length) throw new Error('Aucune ligne TASK')
      tasks.slice(0, 3).forEach((desc, i) => {
        const fname = `auto-${prefix}-${i + 1}.txt`
        writeFileSync(resolve(TASKS_DIR, fname), desc, 'utf8')
        log(`new task: ${fname}`)
      })
      return
    } catch (err) {
      log(`auto-gen ${attempt}/3 failed: ${err.message}`)
      if (attempt < 3) await sl(20000)
    }
  }
  // Fallback statique
  const fallback = `Améliore src/index.css — ajoute/consolide les design tokens CSS vars (--bg #080808 --green #00ff88 --t1 #f0f0f0 --border rgba(255,255,255,0.07)), classes utilitaires .page .card .pill-up .pill-down .scroll-row .tab-btn .section-label .press-scale .live-dot, animations @keyframes fadeUp shimmer ping pulse. Mobile-first, Inter font.`
  writeFileSync(resolve(TASKS_DIR, `auto-${prefix}-fallback.txt`), fallback, 'utf8')
  log('fallback task injected')
}

// ── Discord heartbeat + recap ─────────────────────────────────────────────────
let lastHeartbeat = 0
const HEARTBEAT_EVERY_MS = 4 * 60 * 60 * 1000  // toutes les 4h

async function sendHeartbeat() {
  if (Date.now() - lastHeartbeat < HEARTBEAT_EVERY_MS) return
  lastHeartbeat = Date.now()

  const allStatus = readStatus()
  const done      = allStatus.filter(t => t.status === 'DONE')
  const errors    = allStatus.filter(t => t.status === 'ERROR')
  const queue     = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt')).length
  const cost      = (done.length * 0.10).toFixed(2)
  const recentFiles = [...new Set(
    done.slice(-8).flatMap(t => (t.files || []).map(f => f.split('/').pop()))
  )].slice(0, 5)

  const msg = [
    `💓 **AnDy — ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}**`,
    `✅ ${done.length} terminées · ❌ ${errors.length} erreurs · ⏳ ${queue} en queue`,
    `💸 ~$${cost} · 🔁 cycle #${autoGenCount} · ⚡ session: +${totalDoneSession} done`,
    recentFiles.length ? `📁 ${recentFiles.map(f => `\`${f}\``).join(' ')}` : '',
    `📱 ${APP_URL} | 🖥 http://62.238.12.221:4000/vibe`,
  ].filter(Boolean).join('\n')

  const ok = await discordPost(CH_UPDATES, msg)
  log(`Heartbeat Discord: ${ok ? 'ok' : 'échec'}`)
}

function scheduleDiscordRecap() {
  const now = new Date(), target = new Date(now)
  target.setHours(7, 0, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  const ms = target - now
  log(`Discord recap schedulé à ${target.toLocaleString('fr-FR')} (dans ${Math.round(ms/60000)}min)`)

  setTimeout(async () => {
    // ← FIX CRITIQUE: lit .task-status.json PAS taskLog (RAM)
    const allStatus = readStatus()
    const midnight  = new Date(); midnight.setHours(0, 0, 0, 0)
    const done      = allStatus.filter(t => t.status === 'DONE' && t.startedAt && new Date(t.startedAt) >= midnight)
    const errors    = allStatus.filter(t => t.status === 'ERROR' && t.startedAt && new Date(t.startedAt) >= midnight)
    const queue     = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt'))

    const domains = {}
    for (const t of done) {
      const d = (t.desc || '').split(/[—\/]/)[0].trim().replace(/^(Trackr|Serveur|CryptoTrader)\//, '') || 'autre'
      domains[d] = (domains[d] || 0) + 1
    }
    const topDomains = Object.entries(domains).sort((a,b) => b[1]-a[1]).slice(0, 5)

    const files = {}
    for (const t of done) {
      for (const f of (t.files || [])) {
        const name = f.split('/').pop()
        files[name] = (files[name] || 0) + 1
      }
    }
    const topFiles = Object.entries(files).sort((a,b) => b[1]-a[1]).slice(0, 8)

    const totalSec = done.reduce((s, t) => s + (t.dur || 0), 0)
    const estimatedCost = (done.length * 0.10).toFixed(2)
    const dateFR = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

    const lines = [
      `🤖 **AnDy — Rapport du matin**`,
      `**${dateFR} · 7h00**`,
      ``,
      `📊 **Stats nuit**`,
      `✅ **${done.length} tâches terminées** · ⏱ ${Math.round(totalSec/60)}min · 💸 ~$${estimatedCost}`,
      errors.length ? `❌ ${errors.length} erreur${errors.length>1?'s':''}` : '',
      queue.length  ? `⏳ ${queue.length} en attente` : '',
      `🔁 ${autoGenCount} cycles auto-génération`,
      ``,
      topDomains.length ? `🎯 **Domaines**\n${topDomains.map(([d,n]) => `• **${d}** — ${n}`).join('\n')}` : '',
      ``,
      topFiles.length ? `📁 **Fichiers modifiés**\n${topFiles.map(([f,n]) => `\`${f}\` ×${n}`).join(' · ')}` : '',
      ``,
      `🏆 **Dernières tâches**`,
      ...done.slice(-6).map(t => `✔ \`${(t.desc||t.name).slice(0,65)}\``),
      errors.length ? `\n⚠️ **Erreurs**\n${errors.slice(-3).map(t => `✘ \`${t.name}\``).join('\n')}` : '',
      ``,
      `🔗 **Accès**`,
      `📱 ${APP_URL}`,
      `🖥 http://62.238.12.221:4000/vibe`,
      `📦 https://github.com/${GITHUB_REPO}`,
    ].filter(l => l !== undefined).join('\n')

    const ok = await discordPost(CH_MORNING, lines.slice(0, 1990))
    log(`Discord recap 7h: ${ok ? 'envoyé ✓' : 'ÉCHEC ✗ — vérifier BOT_TOKEN et DISCORD_CH_MORNING'}`)
    scheduleDiscordRecap()
  }, ms)
}

// ── AI Data Export ────────────────────────────────────────────────────────────
const AI_DATA_DIR     = resolve(ROOT, 'ai-data')
const MEMORY_FILE     = resolve(ROOT, 'ANDY_MEMORY.json')
let   lastExportCount = 0
const EXPORT_EVERY_N  = 8

async function exportAIData() {
  try {
    mkdirSync(AI_DATA_DIR, { recursive: true })
    const allStatus = readStatus()
    const done   = allStatus.filter(t => t.status === 'DONE')
    const errors = allStatus.filter(t => t.status === 'ERROR')
    const files  = readdirSync(TASKS_DIR).filter(f => !f.startsWith('.'))

    let memory = {}
    try { memory = JSON.parse(readFileSync(MEMORY_FILE, 'utf8')) } catch {}

    const stats = {
      exportedAt: new Date().toISOString(),
      totalDone: done.length,
      totalErrors: errors.length,
      totalQueue: files.filter(f => f.endsWith('.txt')).length,
      autoGenCycles: autoGenCount,
      sessionDone: totalDoneSession,
      uptime: process.uptime(),
      repo: GITHUB_REPO,
      app: APP_URL,
      workers: WORKER_COUNT,
      model: { code: MODEL_SMART, fast: MODEL_FAST },
    }

    const domainCount = {}
    for (const t of done) {
      const d = (t.desc || '').split('/')[0].trim() || 'other'
      domainCount[d] = (domainCount[d] || 0) + 1
    }
    const fileCount = {}
    for (const t of done) {
      for (const f of (t.files || [])) fileCount[f] = (fileCount[f] || 0) + 1
    }

    writeFileSync(resolve(AI_DATA_DIR, 'stats.json'), JSON.stringify(stats, null, 2), 'utf8')
    writeFileSync(resolve(AI_DATA_DIR, 'task-history.json'), JSON.stringify(allStatus.slice(-500), null, 2), 'utf8')
    writeFileSync(resolve(AI_DATA_DIR, 'memory.json'), JSON.stringify(memory, null, 2), 'utf8')
    writeFileSync(resolve(AI_DATA_DIR, 'domains.json'), JSON.stringify({ domains: domainCount, topFiles: Object.entries(fileCount).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([f,n])=>({file:f,times:n})) }, null, 2), 'utf8')

    try {
      execSync(`cd "${ROOT}" && git add ai-data/ && git diff --cached --quiet || git commit -m "[AnDy] export ai-data — ${done.length} tasks" && git pull origin main --no-rebase -X ours -q && git push origin main -q`, { stdio: 'pipe' })
      log(`AI data exported: ${done.length} tasks total`)
    } catch (e) {
      log(`AI export local OK, push skipped: ${(e.message || '').slice(0, 60)}`)
    }
  } catch (err) {
    log(`exportAIData error: ${err.message}`)
  }
}

// ── Self-update ───────────────────────────────────────────────────────────────
let lastSelfUpdate = Date.now()
const SELF_UPDATE_EVERY_MS = 90 * 60 * 1000  // 90min

async function selfUpdate() {
  if (Date.now() - lastSelfUpdate < SELF_UPDATE_EVERY_MS) return
  lastSelfUpdate = Date.now()
  try {
    const out = execSync(`cd "${ROOT}" && git pull origin main --no-rebase -X ours -q 2>&1`, { stdio: 'pipe' }).toString().trim()
    if (out && !out.includes('Already up to date')) log(`Self-update: ${out.slice(0, 100)}`)
  } catch {}
}

// ── Parallel workers ──────────────────────────────────────────────────────────
const WORKER_COUNT     = 3
const PAUSE_AFTER_TASK = 2
const PAUSE_IDLE       = 8

const claimedTasks = new Set()

function priorityScore(fname) {
  let score = 0
  if (fname.startsWith('urgent-'))   score += 2000
  if (fname.startsWith('manual-'))   score += 1000
  if (fname.startsWith('MISSION-'))  score += 500   // tâches missions — haute priorité
  if (fname.startsWith('critical-')) score += 100
  if (fname.startsWith('fix-'))      score += 80
  if (fname.startsWith('NUIT-'))     score += 70
  if (fname.startsWith('v2-'))       score += 60
  if (fname.startsWith('auto-'))     score += 30
  if (fname.includes('redesign'))    score += 15
  if (fname.includes('perf'))        score += 10
  return score
}

// Vérifie si une tâche manuelle/urgente attend en queue
function urgentPending() {
  try {
    return readdirSync(TASKS_DIR).some(f =>
      (f.startsWith('manual-') || f.startsWith('urgent-')) &&
      f.endsWith('.txt') &&
      !skipQueue.includes(f)  // skip-retried tasks ne comptent pas
    )
  } catch { return false }
}

// Throw this to interrupt a running auto task and requeue it
class InterruptError extends Error {
  constructor() { super('INTERRUPTED'); this.isInterrupt = true }
}

function claimNextTask() {
  const all = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt'))
  // Sépare: tâches normales (pas dans skipQueue) et retries
  const normal  = all.filter(f => !skipQueue.includes(f) && !claimedTasks.has(f))
  const retries = all.filter(f => skipQueue.includes(f)  && !claimedTasks.has(f))

  // Priorité: normales d'abord, retries seulement si plus rien d'autre
  const pool = normal.length > 0 ? normal : retries
  if (!pool.length) return null

  const sorted = pool.sort((a, b) => priorityScore(b) - priorityScore(a))
  for (const f of sorted) {
    if (claimedTasks.has(f)) continue
    claimedTasks.add(f)
    if (retries.includes(f)) {
      skipQueue.splice(skipQueue.indexOf(f), 1)
      log(`RETRY: ${f}`)
    }
    return resolve(TASKS_DIR, f)
  }
  return null
}

async function worker(id) {
  await sl(id * 1000)
  log(`Worker #${id} démarré`)
  liveWorkers[id] = { task: null, stage: 'idle', since: new Date().toISOString() }
  writeLiveState()

  while (true) {
    const fp = claimNextTask()
    if (fp) {
      const fname = fp.split('/').pop()
      liveWorkers[id] = { task: fname.replace(/\.txt$/, ''), stage: 'starting', since: new Date().toISOString() }
      liveWorkers._current = liveWorkers[id]
      writeLiveState()
      try {
        if (existsSync(fp)) await runTask(fp)
        else claimedTasks.delete(fname)
      } catch (e) {
        log(`Worker #${id} erreur inattendue: ${e.message}`)
      } finally {
        claimedTasks.delete(fname)
        liveWorkers[id] = { task: null, stage: 'idle', since: new Date().toISOString() }
        writeLiveState()
      }
      await sl(PAUSE_AFTER_TASK * 1000)
    } else {
      liveWorkers[id] = { task: null, stage: 'idle', since: new Date().toISOString() }
      writeLiveState()
      await sl(PAUSE_IDLE * 1000)
    }
  }
}

async function supervisor() {
  mkdirSync(TASKS_DIR, { recursive: true })
  mkdirSync(resolve(TASKS_DIR, '_archive'), { recursive: true })
  mkdirSync(AI_DATA_DIR, { recursive: true })

  // Requeue les .running (tâches interrompues au restart précédent)
  const running = readdirSync(TASKS_DIR).filter(f => f.endsWith('.running'))
  if (running.length) {
    for (const f of running) {
      const src  = resolve(TASKS_DIR, f)
      const dest = resolve(TASKS_DIR, f.replace(/\.running$/, '.txt'))
      try { renameSync(src, dest); log(`Requeued: ${f} → .txt`) } catch {}
    }
  }

  // Archive les .error du run précédent
  const errFiles = readdirSync(TASKS_DIR).filter(f => f.endsWith('.error'))
  if (errFiles.length) {
    const arch = resolve(TASKS_DIR, '_archive')
    for (const f of errFiles) {
      try { renameSync(resolve(TASKS_DIR, f), resolve(arch, Date.now() + '-' + f)) } catch {}
    }
    log(`Archivé ${errFiles.length} erreur(s) précédente(s)`)
  }

  // Ping startup Discord
  const allStatus = readStatus()
  const totalDone = allStatus.filter(t => t.status === 'DONE').length
  const queueLen  = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt')).length
  await discordPost(CH_UPDATES, [
    `⚡ **AnDy v3 démarré** — ${new Date().toLocaleString('fr-FR')}`,
    `📊 Historique: ${totalDone} tâches terminées | ${queueLen} en queue`,
    `🔧 ${WORKER_COUNT} workers · semaphore ${API_SEMAPHORE_LIMIT} API calls max`,
    `📱 ${APP_URL}`,
  ].join('\n'))

  scheduleDiscordRecap()
  lastHeartbeat = Date.now()  // reset pour ne pas envoyer juste après le startup

  while (true) {
    await waitForOnline()
    await flushSyncQueue()
    await selfUpdate()
    await sendHeartbeat()

    if (Date.now() - lastNotifTime > NOTIF_EVERY_MS) await flushDiscordNotif(true)

    // Export AI data toutes les EXPORT_EVERY_N tâches
    if (totalDoneSession > 0 && totalDoneSession % EXPORT_EVERY_N === 0 && totalDoneSession !== lastExportCount) {
      lastExportCount = totalDoneSession
      exportAIData()
    }

    // Génère de nouvelles tâches si la queue est faible
    const queue = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt')).length
    if (queue < WORKER_COUNT * 3) {
      await generateNextTasks()
    }

    await sl(20000)
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  log('=== AnDy Daemon v3 démarré ===')
  log(`Repo: ${GITHUB_REPO} | App: ${APP_URL}`)
  log(`Providers: ${[
    GROQ_KEY       && `Groq(${GROQ_KEY.slice(0,8)}…)`,
    GEMINI_KEY     && `Gemini(${GEMINI_KEY.slice(0,8)}…)`,
    OPENROUTER_KEY && `OpenRouter(${OPENROUTER_KEY.slice(0,8)}…)`,
    API_KEY        && `Anthropic(${API_KEY.slice(0,16)}…)`,
    OLLAMA_URL     && `Ollama(${OLLAMA_URL})`,
  ].filter(Boolean).join(' | ') || 'AUCUN ⚠ — ajouter GROQ_API_KEY ou GEMINI_API_KEY dans .env'}`)
  log(`Discord: BOT=${BOT_TOKEN ? 'ok' : 'MANQUANT'} | CH_UPDATES=${CH_UPDATES || 'MANQUANT'}`)
  log(`Workers: ${WORKER_COUNT} | Semaphore API: ${API_SEMAPHORE_LIMIT}`)

  mkdirSync(TASKS_DIR, { recursive: true })

  const promises = [
    supervisor(),
    ...Array.from({ length: WORKER_COUNT }, (_, i) => worker(i + 1)),
  ]

  await Promise.allSettled(promises)
  log('FATAL: tous les workers se sont arrêtés')
  process.exit(1)
}

main().catch(err => {
  log('FATAL: ' + err.message)
  process.exit(1)
})
