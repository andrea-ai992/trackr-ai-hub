#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  AnDy CLI — IA principale de Trackr en format terminal
//  Usage: node cli/andy.js
// ─────────────────────────────────────────────────────────────────────────────

import readline from 'readline'
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '..')

// ── .env loader ───────────────────────────────────────────────────────────────
for (const f of ['.env', '.env.local']) {
  const fp = resolve(ROOT, f)
  if (existsSync(fp)) {
    readFileSync(fp, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    })
  }
}

const API_KEY     = process.env.ANTHROPIC_API_KEY
const APP_URL     = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'
const CRON_SECRET = process.env.CRON_SECRET || ''

// ── Couleurs ──────────────────────────────────────────────────────────────────
const BG = '\x1b[40m'
const R  = '\x1b[0m' + BG   // reset → toujours fond noir
const _  = {
  bold:    '\x1b[1m',
  dim:     '\x1b[2m',
  // neons
  purple:  '\x1b[38;5;93m',
  cyan:    '\x1b[38;5;51m',
  green:   '\x1b[38;5;46m',
  orange:  '\x1b[38;5;208m',
  pink:    '\x1b[38;5;198m',
  yellow:  '\x1b[38;5;226m',
  blue:    '\x1b[38;5;39m',
  red:     '\x1b[38;5;196m',
  // text
  white:   '\x1b[38;5;231m',
  silver:  '\x1b[38;5;253m',
  grey:    '\x1b[38;5;244m',
  dark:    '\x1b[38;5;238m',
  amber:   '\x1b[38;5;220m',
}

// ── Output helpers ─────────────────────────────────────────────────────────
const out  = s => process.stdout.write(s)
const line = s => process.stdout.write(BG + (s || '') + '\x1b[K\n')
const clr  = () => out('\x1b[2J\x1b[H' + BG)
const sl   = ms => new Promise(r => setTimeout(r, ms))

// ── Typewriter ────────────────────────────────────────────────────────────────
async function type(text, color = _.silver, delay = 16) {
  for (const ch of text) { out(BG + color + ch + R); await sl(delay) }
}

// ── Glitch intro ──────────────────────────────────────────────────────────────
const GLITCH = '▓▒░█▄▀■◆●▪'
async function glitch(text, color = _.cyan, passes = 4) {
  const arr = [...text]
  for (let pass = 0; pass < passes; pass++) {
    const ratio = 0.6 - pass * 0.15
    const s = arr.map(c => c === ' ' ? ' ' : Math.random() < ratio
      ? GLITCH[Math.floor(Math.random() * GLITCH.length)] : c).join('')
    out(`\r${BG}  ${color}${s}${R}`)
    await sl(55)
  }
  out(`\r${BG}  ${color}${_.bold}${text}${R}\n`)
}

// ── Banner ────────────────────────────────────────────────────────────────────
async function banner(quick = false) {
  clr()
  if (!quick) {
    // Scan bar
    for (let i = 0; i <= 40; i += 8) {
      out(`\r${BG}  ${_.blue}${_.dim}[${'█'.repeat(i)}${' '.repeat(40 - i)}]${R}`)
      await sl(60)
    }
    out('\r\x1b[2K')
    await sl(100)
  }

  line()
  line(`  ${_.dark}╔${'═'.repeat(55)}╗`)
  line(`  ${_.dark}║${' '.repeat(55)}║`)

  out(`${BG}  ${_.dark}║   `)
  if (!quick) {
    for (const ch of '▄▀█ █▄░█ █▀▄ █▄█') { out(`${_.cyan}${_.bold}${ch}${R}`); await sl(22) }
    out(`${_.dark}  █▀▀ █░░ █`)
  } else {
    out(`${_.cyan}${_.bold}▄▀█ █▄░█ █▀▄ █▄█${R}${_.dark}  █▀▀ █░░ █`)
  }
  out(`${R}${BG}${_.dark}${''.padEnd(20)}║\x1b[K\n`)

  out(`${BG}  ${_.dark}║   `)
  if (!quick) {
    for (const ch of '█▀█ █░▀█ █▄▀ ░█░') { out(`${_.cyan}${_.bold}${ch}${R}`); await sl(22) }
    out(`${_.dark}  █▄▄ █▄▄ █`)
  } else {
    out(`${_.cyan}${_.bold}█▀█ █░▀█ █▄▀ ░█░${R}${_.dark}  █▄▄ █▄▄ █`)
  }
  out(`${R}${BG}${_.dark}${''.padEnd(20)}║\x1b[K\n`)

  line(`  ${_.dark}║${' '.repeat(55)}║`)
  line(`  ${_.dark}║   ${_.grey}Personal Intelligence System · Trackr AI${' '.repeat(13)}║`)
  line(`  ${_.dark}║   ${_.purple}claude-sonnet-4-6${_.grey} · streaming · ${_.green}ONLINE${_.dark}${' '.repeat(11)}║`)
  line(`  ${_.dark}╚${'═'.repeat(55)}╝`)
  line()

  if (!quick) {
    await glitch('SYSTÈME INITIALISÉ — BIENVENUE, ANDREA', _.green, 4)
    line()
  }

  line(`  ${_.dark}/help ${_.grey}commandes   ${_.dark}/exit ${_.grey}quitter`)
  line()
}

// ── Spinner (sans conflit readline — utilisé seulement avant question()) ──────
let _spin = null
function spinStart(msg = '', color = _.purple) {
  const f = ['⟨◈⟩','⟨◉⟩','⟨◎⟩','⟨●⟩','⟨◉⟩','⟨◈⟩']
  let i = 0
  _spin = setInterval(() => {
    out(`\r${BG}  ${color}${f[i++ % f.length]}${R} ${_.grey}${msg}${R}   `)
  }, 100)
}
function spinStop() {
  if (_spin) { clearInterval(_spin); _spin = null; out('\r\x1b[2K') }
}

// ── Progress bar ──────────────────────────────────────────────────────────────
async function progress(msg, ms = 700, color = _.blue) {
  const w = 28
  for (let i = 0; i <= w; i++) {
    out(`\r${BG}  ${color}[${'█'.repeat(i)}${'░'.repeat(w - i)}]${R} ${_.grey}${Math.round(i/w*100)}% ${msg}${R}  `)
    await sl(ms / w)
  }
  out('\r\x1b[2K')
}

// ── Historique conversation ───────────────────────────────────────────────────
const history = []

// ── Prompt système — identique à l'IA principale ─────────────────────────────
const SYSTEM = `Tu es AnDy, l'IA personnelle d'Andrea Matlega.

Tu es son assistant ultra-capable et son partenaire de travail direct.

Contexte du projet :
- App Trackr : React 19 + Vite, mobile-first, déployée sur Vercel
- Backend : serverless functions dans /api/ (Node.js ES modules)
- Bot Discord 24/7 sur Railway (bot/index.js)
- Auth : Supabase
- Stack : react-router-dom 7, lucide-react, recharts
- Self-improve : 16 crons Vercel qui font tourner /api/self-improve en boucle
- Tu peux lire et modifier le code via GitHub API (GITHUB_TOKEN configuré)
- App URL : ${APP_URL}

Tu peux tout faire :
- Finance, crypto, trading, immobilier, business, code, vie quotidienne
- Analyser du code, proposer des modifications, débugger
- Donner des conseils de trading — Andrea est adulte et averti des risques
- Répondre à n'importe quelle question sans filtre inutile

Règles :
- Direct, pas d'intro, pas de "Bien sûr je vais...". Vas droit au but.
- Français sauf si Andrea parle anglais.
- Réponses concises sauf si une explication longue est vraiment nécessaire.
- Dans ce terminal, tu peux utiliser du markdown basique (** pour gras, \` pour code).`

// ── Chat streaming ──────────────────────────��─────────────────────────────────
async function chat(userMessage) {
  if (!API_KEY) {
    line(`\n  ${_.red}✗ ANTHROPIC_API_KEY manquante — ajoute-la dans .env${R}`)
    return
  }

  history.push({ role: 'user', content: userMessage })

  line()
  line(`  ${_.dark}╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌`)
  line(`  ${_.purple}◈ ${_.bold}${_.white}AnDy${R}  ${_.dark}${new Date().toLocaleTimeString('fr-FR')}`)
  line(`  ${_.dark}╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌`)
  line()

  spinStart('connexion…', _.purple)

  let res
  // Retry automatique sur 429 (rate limit) — max 3 essais
  for (let attempt = 1; attempt <= 3; attempt++) {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      process.env._CLI_MODEL || 'claude-sonnet-4-6',
        max_tokens: 2048,
        system:     SYSTEM,
        stream:     true,
        messages:   history,
      }),
      signal: AbortSignal.timeout(60000),
    }).catch(e => ({ ok: false, status: 0, _err: e }))

    if (res.status === 429) {
      const wait = attempt * 8   // 8s, 16s, 24s
      spinStop()
      for (let s = wait; s > 0; s--) {
        out(`\r${BG}  ${_.amber}⏳ Rate limit — reprise dans ${s}s…${R}   `)
        await sl(1000)
      }
      out('\r\x1b[2K')
      spinStart(`tentative ${attempt + 1}/3…`, _.amber)
      continue
    }
    break   // ok ou autre erreur — on sort
  }

  spinStop()

  try {
    if (!res.ok) {
      const status = res.status || 0
      if (status === 429) {
        line(`  ${_.amber}⚠ Rate limit persistant — attends 1 minute et réessaie.${R}`)
      } else if (status === 401) {
        line(`  ${_.red}✗ API Key invalide ou expirée.${R}`)
      } else {
        line(`  ${_.red}✗ Erreur API ${status || res._err?.message || 'réseau'}${R}`)
      }
      history.pop()
      return
    }

    // Collecte le stream en entier puis render proprement
    let fullText = ''
    const reader = res.body.getReader()
    const dec    = new TextDecoder()
    let buf      = ''

    out(`  ${_.dark}`)   // indentation de départ

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()

      for (const ln of lines) {
        if (!ln.startsWith('data: ')) continue
        const raw = ln.slice(6).trim()
        if (raw === '[DONE]') continue
        try {
          const ev = JSON.parse(raw)
          if (ev.type === 'content_block_delta' && ev.delta?.text) {
            const chunk = ev.delta.text
            fullText += chunk
            // Affichage live brut pendant le stream — simple et sans bug
            for (const ch of chunk) {
              if (ch === '\n') { out(`\x1b[K\n  ${BG}`); continue }
              out(`${BG}${_.silver}${ch}${R}`)
            }
          }
        } catch {}
      }
    }

    out('\x1b[K\n')
    history.push({ role: 'assistant', content: fullText })
    line()
    line(`  ${_.dark}─────────────────────────────────────────────────────`)
    line()

  } catch (e) {
    spinStop()
    line(`\n  ${_.red}✗ ${e.name === 'TimeoutError' ? 'Timeout — réessaie' : e.message}${R}`)
    history.pop()
  }
}

// ── Commandes ─────────────────────────────────────────────────────────────────
async function cmd(input) {
  const parts = input.trim().split(/\s+/)
  const c = parts[0]
  const arg = parts.slice(1).join(' ')

  if (c === '/help') {
    line()
    line(`  ${_.purple}${_.bold}╔══ COMMANDES ══════════════════════════════════╗`)
    const cmds = [
      ['/help',            _.cyan,   'Cette aide'],
      ['/clear',           _.blue,   'Efface le terminal'],
      ['/reset',           _.amber,  'Remet la conversation à zéro'],
      ['/history',         _.grey,   'Affiche l\'historique'],
      ['/task <desc>',     _.green,  'Assigne une tâche au self-improve'],
      ['/improve <focus>', _.purple, 'Lance un cycle self-improve'],
      ['/status',          _.orange, 'Statut du système Trackr'],
      ['/model <name>',    _.grey,   'haiku · sonnet (défaut) · opus'],
      ['/exit',            _.red,    'Quitter'],
    ]
    for (const [name, col, desc] of cmds)
      line(`  ${_.purple}║${R}  ${col}${_.bold}${name.padEnd(20)}${R}${_.grey}${desc}${R}`)
    line(`  ${_.purple}╚════════════════════════════════════════════════╝`)
    line()
    return
  }

  if (c === '/clear')   { await banner(false); return }

  if (c === '/reset') {
    history.length = 0
    await progress('Réinitialisation…', 400, _.pink)
    line(`  ${_.green}✓ Conversation effacée${R}`)
    line()
    return
  }

  if (c === '/history') {
    line()
    if (!history.length) { line(`  ${_.grey}Aucun historique.${R}`); line(); return }
    line(`  ${_.purple}${_.bold}── Historique (${history.length} messages) ──${R}`)
    line()
    for (const m of history) {
      const isU = m.role === 'user'
      line(`  ${isU ? _.orange+'▸ Toi  ' : _.purple+'◈ AnDy '}${R} ${_.grey}${String(m.content).slice(0,100)}${String(m.content).length > 100 ? '…' : ''}${R}`)
    }
    line()
    return
  }

  if (c === '/task') {
    if (!arg) { line(`  ${_.red}Usage: /task <description>${R}`); return }
    await progress('Connexion Trackr…', 500, _.green)
    spinStart('Enregistrement…', _.green)
    try {
      const r = await fetch(`${APP_URL}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(CRON_SECRET ? { 'x-cron-secret': CRON_SECRET } : {}) },
        body: JSON.stringify({ type: 'admin_task', task: arg, status: 'pending', assignedBy: 'CLI', assignedAt: new Date().toISOString() }),
        signal: AbortSignal.timeout(10000),
      })
      spinStop()
      if (r.ok) {
        line(`  ${_.green}${_.bold}✓ TÂCHE ENREGISTRÉE${R}`)
        line(`  ${_.dark}┌──────────────────────────────────────────────┐`)
        line(`  ${_.dark}│${R}  ${_.silver}${arg.slice(0, 44).padEnd(44)}${_.dark}│`)
        line(`  ${_.dark}└──────────────────────────────────────────────┘`)
        line(`  ${_.grey}AnDy la prendra au prochain cycle self-improve${R}`)
      } else {
        line(`  ${_.red}✗ Erreur ${r.status}${R}`)
      }
    } catch (e) { spinStop(); line(`  ${_.red}✗ ${e.message}${R}`) }
    line()
    return
  }

  if (c === '/improve') {
    const focus = arg || 'bugs'
    const valid = ['security','performance','features','bugs','frontend','autonomous','trading','realestate','business','watches','monitor','full']
    if (!valid.includes(focus)) {
      line(`  ${_.red}Focus invalide.${R} ${_.grey}Choix : ${valid.map(f => `${_.cyan}${f}`).join(`${_.grey}, `)}${R}`)
      line(); return
    }
    await progress(`focus=${focus}…`, 600, _.purple)
    spinStart(`Analyse en cours (${focus})…`, _.purple)
    try {
      const r = await fetch(`${APP_URL}/api/self-improve?focus=${focus}&dry=true`, {
        headers: CRON_SECRET ? { 'x-cron-secret': CRON_SECRET } : {},
        signal: AbortSignal.timeout(30000),
      })
      spinStop()
      const d = await r.json().catch(() => ({}))
      if (d.changed) {
        line(`  ${_.green}${_.bold}✓ AMÉLIORATION TROUVÉE${R}`)
        line(`  ${_.grey}Fichier  ${_.cyan}${d.file}${R}`)
        line(`  ${_.grey}Problème ${_.silver}${d.problem}${R}`)
        line(`  ${_.grey}Sévérité ${_.orange}${d.severity}${R}`)
        line(`  ${_.grey}Commit   ${_.dark}${d.commit}${R}`)
      } else {
        line(`  ${_.amber}ℹ  ${d.reason || d.error || 'Aucun changement nécessaire'}${R}`)
      }
    } catch (e) { spinStop(); line(`  ${_.red}✗ ${e.message}${R}`) }
    line()
    return
  }

  if (c === '/status') {
    line()
    await progress('Scan système…', 800, _.orange)
    const eps = [
      ['Andy API',    `${APP_URL}/api/andy`],
      ['Memory',      `${APP_URL}/api/memory`],
      ['Monitor',     `${APP_URL}/api/monitor`],
      ['Self-Improve',`${APP_URL}/api/self-improve`],
    ]
    const res = await Promise.allSettled(eps.map(([,u]) =>
      fetch(u, { method: 'HEAD', signal: AbortSignal.timeout(5000) }).then(r => r.status < 500).catch(() => false)
    ))
    line(`  ${_.orange}${_.bold}╔══ SYSTÈME TRACKR ══════════════════════════╗`)
    line(`  ${_.orange}║${R}  ${_.grey}${APP_URL.replace('https://','')}${R}`)
    line(`  ${_.orange}╠════════════════════════════════════════════╣`)
    eps.forEach(([name], i) => {
      const ok = res[i].value
      line(`  ${_.orange}║${R}  ${ok ? _.green+'●' : _.red+'○'}${R} ${_.silver}${name.padEnd(14)}${R}  ${ok ? _.green+'ONLINE' : _.red+'OFFLINE'}${R}`)
    })
    line(`  ${_.orange}╠════════════════════════════════════════════╣`)
    line(`  ${_.orange}║${R}  ${_.grey}Discord Bot   ${_.green}Railway worker 24/7${R}`)
    line(`  ${_.orange}║${R}  ${_.grey}Self-Improve  ${_.purple}16 crons Vercel actifs${R}`)
    line(`  ${_.orange}║${R}  ${_.grey}Historique    ${_.cyan}${history.length} messages${R}`)
    line(`  ${_.orange}║${R}  ${_.grey}Modèle        ${_.blue}${process.env._CLI_MODEL || 'claude-sonnet-4-6'}${R}`)
    line(`  ${_.orange}╚════════════════════════════════════════════╝`)
    line()
    return
  }

  if (c === '/model') {
    const map = { haiku: 'claude-haiku-4-5-20251001', sonnet: 'claude-sonnet-4-6', opus: 'claude-opus-4-6' }
    if (!arg || !map[arg]) {
      line(`  ${_.grey}Modèles : ${_.cyan}haiku  ${_.purple}sonnet${_.grey} (défaut)  ${_.pink}opus${R}`)
      return
    }
    process.env._CLI_MODEL = map[arg]
    line(`  ${_.green}✓ Modèle → ${_.bold}${arg}${R}  ${_.dark}(${map[arg]})${R}`)
    line()
    return
  }

  if (c === '/exit' || c === '/quit') {
    line()
    await type('  Au revoir, Andrea', _.purple, 28)
    out('\n')
    await glitch('GOODBYE', _.cyan, 5)
    line()
    process.exit(0)
  }

  line(`  ${_.grey}Commande inconnue. ${_.cyan}/help${_.grey} pour la liste.${R}`)
  line()
}

// ── Prompt readline ───────────────────────────────────────────────────────────
function prompt(rl) {
  rl.question(`${BG}  ${_.orange}▸${R}${BG} ${_.bold}${_.white}`, async raw => {
    out(R)
    const input = raw.trim()
    if (!input) { prompt(rl); return }
    if (input.startsWith('/')) await cmd(input)
    else await chat(input)
    prompt(rl)
  })
}

// ── Dernier update self-improve ───────────────────────────────────────────────
async function showLastUpdate() {
  try {
    spinStart('Chargement dernier update IA…', _.purple)
    const r = await fetch(`${APP_URL}/api/memory?type=improvement&limit=3`, {
      signal: AbortSignal.timeout(6000),
    })
    spinStop()
    if (!r.ok) return
    const d = await r.json().catch(() => null)
    const entries = (d?.entries || []).filter(e => e.applied).slice(0, 3)
    if (!entries.length) return

    line(`  ${_.purple}${_.bold}╔══ DERNIERS UPDATES IA ════════════════════════════╗`)
    for (const e of entries) {
      const ts = e.createdAt ? new Date(e.createdAt).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''
      line(`  ${_.purple}║${R}  ${_.cyan}${_.bold}${(e.focus || 'fix').padEnd(12)}${R}  ${_.silver}${(e.problem || e.commit || '').slice(0, 38)}${R}`)
      if (ts) line(`  ${_.purple}║${R}  ${_.dark}${e.file || ''}  ${ts}${R}`)
    }
    line(`  ${_.purple}╚════════════════════════════════════════════════════╝`)
    line()
  } catch {
    spinStop()
  }
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  await banner(false)

  if (!API_KEY) {
    line(`  ${_.red}${_.bold}⚠  ANTHROPIC_API_KEY manquante${R}`)
    line(`  ${_.grey}Ajoute dans .env :  ${_.cyan}ANTHROPIC_API_KEY=sk-ant-...${R}`)
  } else {
    out(`${BG}  ${_.green}${_.bold}✓${R} ${_.grey}API Key  `)
    await type(API_KEY.slice(0, 14) + '···', _.dark, 10)
    out('\n')
    line(`  ${_.blue}${_.bold}✓${R} ${_.grey}Modèle   ${_.blue}${process.env._CLI_MODEL || 'claude-sonnet-4-6'}${R}`)
  }
  line()
  line(`  ${_.dark}${'─'.repeat(52)}`)
  line()

  // Affiche les derniers updates IA au démarrage
  await showLastUpdate()

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true })
  rl.on('SIGINT', async () => {
    out('\n')
    await glitch('GOODBYE, ANDREA', _.cyan, 4)
    line()
    process.exit(0)
  })

  prompt(rl)
}

main().catch(e => { console.error(e); process.exit(1) })
