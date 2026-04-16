#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  AnDy CLI — Terminal interface futuriste pour l'IA de Trackr
//  Usage: node cli/andy.js
// ─────────────────────────────────────────────────────────────────────────────

import readline from 'readline'
import { existsSync, readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '..')

// ── Load .env / .env.local ────────────────────────────────────────────────────
for (const f of ['.env', '.env.local']) {
  const p = resolve(ROOT, f)
  if (existsSync(p)) {
    readFileSync(p, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    })
  }
}

const API_KEY     = process.env.ANTHROPIC_API_KEY
const APP_URL     = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'
const CRON_SECRET = process.env.CRON_SECRET || ''

// ── ANSI palette — black background, neon accents ────────────────────────────
const BG = '\x1b[40m'   // black background — appliqué sur tout

const C = {
  reset:    '\x1b[0m' + BG,  // reset revient toujours au fond noir
  bold:     '\x1b[1m',
  dim:      '\x1b[2m',
  italic:   '\x1b[3m',
  blink:    '\x1b[5m',
  // neon accents
  neonBlue: '\x1b[38;5;39m',
  neonGreen:'\x1b[38;5;46m',
  neonPink: '\x1b[38;5;198m',
  neonPurple:'\x1b[38;5;93m',
  neonCyan: '\x1b[38;5;51m',
  neonOrange:'\x1b[38;5;208m',
  neonYellow:'\x1b[38;5;226m',
  // text
  white:    '\x1b[38;5;231m',
  offWhite: '\x1b[38;5;253m',
  grey:     '\x1b[38;5;244m',
  darkGrey: '\x1b[38;5;238m',
  // status
  green:    '\x1b[38;5;46m',
  red:      '\x1b[38;5;196m',
  amber:    '\x1b[38;5;220m',
  // bg fills
  bgBlack:  '\x1b[40m',
  bgStripe: '\x1b[48;5;235m',
}

const W = process.stdout.columns || 72
const p  = (...a) => process.stdout.write(a.join(''))
// pl : chaque ligne repart avec fond noir + \x1b[K remplit le reste de la ligne en noir
const pl = (...a) => process.stdout.write(BG + a.join('') + '\x1b[K\n')
const clr = () => p('\x1b[2J\x1b[H' + BG)   // efface + fond noir immédiat

// ── Sleep helper ──────────────────────────────────────────────────────────────
const sleep = ms => new Promise(r => setTimeout(r, ms))

// ── Typewriter print ──────────────────────────────────────────────────────────
async function typewrite(text, color = C.offWhite, delay = 18) {
  for (const ch of text) {
    p(`${color}${ch}${C.reset}`)
    await sleep(delay)
  }
}

// ── Horizontal rule ───────────────────────────────────────────────────────────
function hr(char = '─', color = C.darkGrey, len = Math.min(W - 4, 60)) {
  pl(`  ${color}${char.repeat(len)}${C.reset}`)
}

// ── Glitch text effect ────────────────────────────────────────────────────────
const GLITCH_CHARS = '█▓▒░▄▀■□▪▫◆◇○●'
async function glitch(text, color = C.neonBlue, passes = 3) {
  const chars = text.split('')
  for (let pass = 0; pass < passes; pass++) {
    const scrambled = chars.map((c) =>
      c === ' ' ? ' ' :
      Math.random() > 0.5 + pass * 0.15
        ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
        : c
    ).join('')
    p(`\r  ${color}${scrambled}${C.reset}`)
    await sleep(60)
  }
  p(`\r  ${color}${C.bold}${text}${C.reset}\n`)
}

// ── ASCII Banner with boot sequence ──────────────────────────────────────────
async function banner(fast = false) {
  clr()

  if (!fast) {
    // Scan line effect
    for (let i = 0; i < 3; i++) {
      p(`${C.neonBlue}${C.dim}  [${'█'.repeat(i * 20)}${' '.repeat(60 - i * 20)}]${C.reset}`)
      await sleep(80)
      p('\r\x1b[2K')
    }
  }

  pl()
  pl(`  ${C.darkGrey}╔${'═'.repeat(57)}╗${C.reset}`)
  pl(`  ${C.darkGrey}║${' '.repeat(57)}║${C.reset}`)

  // Logo line 1
  p(`  ${C.darkGrey}║   ${C.reset}`)
  p(`${C.neonCyan}${C.bold}`)
  const logo1 = '▄▀█ █▄░█ █▀▄ █▄█'
  const logo2 = '  █▀▀ █░░ █'
  if (!fast) {
    for (const ch of logo1) { p(ch); await sleep(25) }
    p(`${C.darkGrey}${logo2}`)
  } else {
    p(logo1 + C.darkGrey + logo2)
  }
  p(`${C.reset}`)
  pl(`${C.darkGrey}                      ║${C.reset}`)

  p(`  ${C.darkGrey}║   ${C.reset}`)
  p(`${C.neonCyan}${C.bold}`)
  const logo3 = '█▀█ █░▀█ █▄▀ ░█░'
  const logo4 = '  █▄▄ █▄▄ █'
  if (!fast) {
    for (const ch of logo3) { p(ch); await sleep(25) }
    p(`${C.darkGrey}${logo4}`)
  } else {
    p(logo3 + C.darkGrey + logo4)
  }
  p(`${C.reset}`)
  pl(`${C.darkGrey}                      ║${C.reset}`)

  pl(`  ${C.darkGrey}║${' '.repeat(57)}║${C.reset}`)
  pl(`  ${C.darkGrey}║   ${C.grey}Trackr AI · Personal Intelligence System${' '.repeat(15)}║${C.reset}`)
  pl(`  ${C.darkGrey}║   ${C.neonPurple}claude-sonnet-4-6${C.grey} · Streaming · ${C.neonGreen}ONLINE${C.grey}${' '.repeat(10)}║${C.reset}`)
  pl(`  ${C.darkGrey}╚${'═'.repeat(57)}╝${C.reset}`)
  pl()

  if (!fast) {
    await glitch('SYSTÈME INITIALISÉ — BIENVENUE, ANDREA', C.neonGreen, 4)
    pl()
  }

  pl(`  ${C.darkGrey}/${C.grey}help ${C.darkGrey}pour les commandes   ${C.darkGrey}/${C.grey}exit ${C.darkGrey}pour quitter${C.reset}`)
  pl()
}

// ── Spinners ──────────────────────────────────────────────────────────────────
const SPIN_SETS = {
  dots:   ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏'],
  arc:    ['◜','◠','◝','◞','◡','◟'],
  pulse:  ['█','▓','▒','░','▒','▓'],
  matrix: ['▖','▗','▘','▝','▞','▟','▙','▛'],
  cyber:  ['⟨◈⟩','⟨◉⟩','⟨◎⟩','⟨●⟩','⟨◉⟩','⟨◈⟩'],
}

let spinTimer = null
let spinI = 0

function startSpin(label = '', set = 'cyber', color = C.neonPurple) {
  const frames = SPIN_SETS[set]
  spinI = 0
  spinTimer = setInterval(() => {
    p(`\r  ${color}${frames[spinI++ % frames.length]}${C.reset} ${C.grey}${label}${C.reset}   `)
  }, 100)
}

function stopSpin() {
  if (spinTimer) { clearInterval(spinTimer); spinTimer = null }
  p('\r\x1b[2K')
}

// ── Progress bar ──────────────────────────────────────────────────────────────
async function progressBar(label, durationMs = 800, color = C.neonBlue) {
  const w = 30
  for (let i = 0; i <= w; i++) {
    const pct = Math.round(i / w * 100)
    const bar = '█'.repeat(i) + '░'.repeat(w - i)
    p(`\r  ${color}[${bar}]${C.reset} ${C.grey}${pct}% ${label}${C.reset}  `)
    await sleep(durationMs / w)
  }
  p('\r\x1b[2K')
}

// ── Conversation history ──────────────────────────────────────────────────────
const history = []

const SYSTEM = `Tu es AnDy, l'IA personnelle d'Andrea Matlega. Tu es son assistant personnel ultra-capable.

**Ton rôle :**
- Répondre à toutes ses questions : finance, crypto, trading, immobilier, business, code, vie quotidienne
- L'aider à développer son app Trackr (React/Vite frontend + Vercel serverless backend)
- Analyser ses idées et lui donner des retours directs et honnêtes
- Tu peux donner des conseils de trading et d'investissement — Andrea est adulte et averti des risques

**L'app Trackr :**
- App React/Vite mobile-first déployée sur Vercel
- Backend : serverless functions dans /api/
- Tu es aussi l'IA autonome qui s'améliore elle-même via /api/self-improve (crons Vercel)
- Bot Discord 24/7 sur Railway
- Stack : React 19, react-router-dom 7, lucide-react, recharts, Supabase auth

**Style :**
- Direct et concis. Pas d'intro bullshit.
- Français sauf si on te parle anglais.
- Dans ce terminal CLI, tu peux utiliser du markdown simple.
- Si tu génères du code, indique le fichier et la ligne.`

// ── Streaming chat ────────────────────────────────────────────────────────────
async function chat(userMessage) {
  if (!API_KEY) {
    pl(`\n  ${C.red}✗ ANTHROPIC_API_KEY non définie${C.reset}`)
    pl(`  ${C.grey}Ajoute-la dans ${C.neonCyan}.env${C.grey} à la racine.${C.reset}\n`)
    return
  }

  history.push({ role: 'user', content: userMessage })

  pl()
  hr('·', C.darkGrey)
  p(`  ${C.neonPurple}◈ ${C.bold}${C.white}AnDy${C.reset}`)
  pl(`  ${C.darkGrey}${new Date().toLocaleTimeString('fr-FR')}${C.reset}`)
  hr('·', C.darkGrey)
  pl()
  p('  ')

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
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
    })

    if (!res.ok) {
      const err = await res.text()
      pl(`${C.red}Erreur API ${res.status}: ${err}${C.reset}`)
      history.pop()
      return
    }

    let fullText = ''
    let inCode = false
    let inBold = false
    const reader = res.body.getReader()
    const dec    = new TextDecoder()
    let buf      = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += dec.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const raw = line.slice(6).trim()
        if (raw === '[DONE]') continue
        try {
          const ev = JSON.parse(raw)
          if (ev.type === 'content_block_delta' && ev.delta?.text) {
            const chunk = ev.delta.text
            fullText += chunk

            for (const ch of chunk) {
              if (ch === '\n') { p(`\n  `); continue }
              if (ch === '`') { inCode = !inCode }
              if (inCode)       { p(`${C.neonCyan}${ch}${C.reset}`); continue }
              if (ch === '*')   { inBold = !inBold; continue }
              if (inBold)       { p(`${C.neonYellow}${C.bold}${ch}${C.reset}`); continue }
              p(`${C.offWhite}${ch}${C.reset}`)
            }
          }
        } catch {}
      }
    }

    history.push({ role: 'assistant', content: fullText })
    pl()
    pl()
    hr('─', C.darkGrey)
    pl()

  } catch (e) {
    stopSpin()
    pl(`\n  ${C.red}✗ ${e.message}${C.reset}\n`)
    history.pop()
  }
}

// ── Commands ──────────────────────────────────────────────────────────────────
async function handleCommand(input) {
  const [cmd, ...args] = input.trim().split(/\s+/)
  const arg = args.join(' ')

  switch (cmd) {

    case '/help': {
      pl()
      pl(`  ${C.neonPurple}${C.bold}╔══ COMMANDES ═══════════════════════════╗${C.reset}`)
      const cmds = [
        ['/help',            C.neonCyan,   'Affiche cette aide'],
        ['/clear',           C.neonBlue,   'Efface le terminal'],
        ['/reset',           C.amber,      'Remet la conv à zéro'],
        ['/history',         C.grey,       'Historique de conversation'],
        ['/task <desc>',     C.neonGreen,  'Assigne une tâche au self-improve'],
        ['/improve <focus>', C.neonPurple, 'Lance un cycle d\'amélioration'],
        ['/status',          C.neonOrange, 'Statut du système Trackr'],
        ['/model <name>',    C.grey,       'haiku / sonnet (défaut) / opus'],
        ['/exit',            C.red,        'Quitter'],
      ]
      for (const [c, col, d] of cmds) {
        pl(`  ${C.darkGrey}║${C.reset}  ${col}${C.bold}${c.padEnd(20)}${C.reset}${C.grey}${d}${C.reset}`)
      }
      pl(`  ${C.neonPurple}${C.bold}╚════════════════════════════════════════╝${C.reset}`)
      pl()
      break
    }

    case '/clear': {
      await banner(false)
      break
    }

    case '/reset': {
      history.length = 0
      await progressBar('Nettoyage mémoire…', 400, C.neonPink)
      pl(`  ${C.neonGreen}✓ Conversation réinitialisée${C.reset}\n`)
      break
    }

    case '/history': {
      pl()
      if (history.length === 0) {
        pl(`  ${C.grey}Aucun historique${C.reset}\n`)
        break
      }
      pl(`  ${C.neonPurple}${C.bold}── HISTORIQUE (${history.length} messages) ──${C.reset}`)
      pl()
      for (const m of history) {
        const isUser = m.role === 'user'
        const who  = isUser ? `${C.neonOrange}▸ Toi  ` : `${C.neonPurple}◈ AnDy `
        const col  = isUser ? C.amber : C.offWhite
        pl(`  ${who}${C.reset} ${col}${String(m.content).slice(0, 100)}${String(m.content).length > 100 ? C.grey + '…' : ''}${C.reset}`)
      }
      pl()
      break
    }

    case '/task': {
      if (!arg) {
        pl(`  ${C.red}Usage: /task <description de la tâche>${C.reset}\n`)
        break
      }
      await progressBar('Connexion à Trackr…', 600, C.neonGreen)
      startSpin('Assignation de la tâche…', 'matrix', C.neonGreen)
      try {
        const r = await fetch(`${APP_URL}/api/memory`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(CRON_SECRET ? { 'x-cron-secret': CRON_SECRET } : {}),
          },
          body: JSON.stringify({
            type:       'admin_task',
            task:       arg,
            status:     'pending',
            assignedBy: 'CLI',
            assignedAt: new Date().toISOString(),
          }),
          signal: AbortSignal.timeout(10000),
        })
        stopSpin()
        if (r.ok) {
          pl(`  ${C.neonGreen}${C.bold}✓ TÂCHE ENREGISTRÉE${C.reset}`)
          pl(`  ${C.darkGrey}┌─────────────────────────────────────────┐${C.reset}`)
          pl(`  ${C.darkGrey}│${C.reset} ${C.offWhite}${arg.slice(0, 40).padEnd(40)}${C.darkGrey} │${C.reset}`)
          pl(`  ${C.darkGrey}└─────────────────────────────────────────┘${C.reset}`)
          pl(`  ${C.grey}AnDy la prendra au prochain cycle self-improve${C.reset}\n`)
        } else {
          pl(`  ${C.red}✗ Erreur API ${r.status}${C.reset}\n`)
        }
      } catch (e) {
        stopSpin()
        pl(`  ${C.red}✗ ${e.message}${C.reset}\n`)
      }
      break
    }

    case '/improve': {
      const focus = arg || 'bugs'
      const valid = ['security','performance','features','bugs','frontend','autonomous','trading','realestate','business','watches','monitor','full']
      if (!valid.includes(focus)) {
        pl(`  ${C.red}Focus invalide.${C.reset}`)
        pl(`  ${C.grey}Choix : ${valid.map(f => `${C.neonCyan}${f}${C.grey}`).join(', ')}${C.reset}\n`)
        break
      }
      await progressBar(`Chargement focus=${focus}…`, 700, C.neonPurple)
      startSpin(`Analyse en cours (focus: ${focus})…`, 'pulse', C.neonPurple)
      try {
        const r = await fetch(`${APP_URL}/api/self-improve?focus=${focus}&dry=true`, {
          headers: CRON_SECRET ? { 'x-cron-secret': CRON_SECRET } : {},
          signal: AbortSignal.timeout(30000),
        })
        stopSpin()
        const d = await r.json().catch(() => ({}))
        if (d.changed) {
          pl(`  ${C.neonGreen}${C.bold}✓ AMÉLIORATION DÉTECTÉE${C.reset}`)
          pl(`  ${C.grey}Fichier  ${C.neonCyan}${d.file}${C.reset}`)
          pl(`  ${C.grey}Problème ${C.offWhite}${d.problem}${C.reset}`)
          pl(`  ${C.grey}Sévérité ${C.neonOrange}${d.severity}${C.reset}`)
          pl(`  ${C.grey}Commit   ${C.darkGrey}${d.commit}${C.reset}\n`)
        } else {
          pl(`  ${C.amber}ℹ ${d.reason || d.error || 'Aucun changement nécessaire'}${C.reset}\n`)
        }
      } catch (e) {
        stopSpin()
        pl(`  ${C.red}✗ ${e.message}${C.reset}\n`)
      }
      break
    }

    case '/status': {
      pl()
      await progressBar('Scan du système…', 900, C.neonOrange)
      const endpoints = [
        ['Andy API',     `${APP_URL}/api/andy`],
        ['Memory',       `${APP_URL}/api/memory`],
        ['Monitor',      `${APP_URL}/api/monitor`],
        ['Self-Improve', `${APP_URL}/api/self-improve`],
      ]
      const results = await Promise.allSettled(
        endpoints.map(([, url]) =>
          fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
            .then(r => r.status < 500)
            .catch(() => false)
        )
      )
      pl(`  ${C.neonOrange}${C.bold}╔══ SYSTÈME TRACKR ══════════════════════╗${C.reset}`)
      pl(`  ${C.neonOrange}║${C.reset}  ${C.grey}${APP_URL.replace('https://','')}${C.reset}`)
      pl(`  ${C.neonOrange}╠════════════════════════════════════════╣${C.reset}`)
      endpoints.forEach(([name], i) => {
        const ok  = results[i].value
        const dot = ok ? `${C.neonGreen}●` : `${C.red}○`
        const st  = ok ? `${C.neonGreen}ONLINE ` : `${C.red}OFFLINE`
        pl(`  ${C.neonOrange}║${C.reset}  ${dot}${C.reset} ${C.offWhite}${name.padEnd(14)}${C.reset} ${st}${C.reset}`)
      })
      pl(`  ${C.neonOrange}╠════════════════════════════════════════╣${C.reset}`)
      pl(`  ${C.neonOrange}║${C.reset}  ${C.grey}Bot Discord   ${C.neonGreen}Railway worker 24/7${C.reset}`)
      pl(`  ${C.neonOrange}║${C.reset}  ${C.grey}Self-Improve  ${C.neonPurple}16 crons Vercel actifs${C.reset}`)
      pl(`  ${C.neonOrange}║${C.reset}  ${C.grey}Historique    ${C.neonCyan}${history.length} messages en mémoire${C.reset}`)
      pl(`  ${C.neonOrange}║${C.reset}  ${C.grey}Modèle        ${C.neonBlue}${process.env._CLI_MODEL || 'claude-sonnet-4-6'}${C.reset}`)
      pl(`  ${C.neonOrange}╚════════════════════════════════════════╝${C.reset}`)
      pl()
      break
    }

    case '/model': {
      const models = {
        haiku:  'claude-haiku-4-5-20251001',
        sonnet: 'claude-sonnet-4-6',
        opus:   'claude-opus-4-6',
      }
      if (!arg || !models[arg]) {
        pl(`  ${C.grey}Modèles : ${C.neonCyan}haiku${C.grey}  ${C.neonPurple}sonnet${C.grey} (défaut)  ${C.neonPink}opus${C.reset}\n`)
        break
      }
      process.env._CLI_MODEL = models[arg]
      pl(`  ${C.neonGreen}✓ Modèle → ${C.bold}${arg}${C.reset}  ${C.darkGrey}(${models[arg]})${C.reset}\n`)
      break
    }

    case '/exit':
    case '/quit': {
      pl()
      await typewrite('  Shutdown en cours', C.neonPurple, 30)
      for (let i = 0; i < 3; i++) { p(`${C.neonPurple}.${C.reset}`); await sleep(250) }
      pl()
      await glitch('GOODBYE, ANDREA', C.neonCyan, 5)
      pl()
      process.exit(0)
    }

    default: {
      pl(`  ${C.grey}Commande inconnue. Tape ${C.neonCyan}/help${C.grey} pour la liste.${C.reset}\n`)
    }
  }
}

// ── Prompt ────────────────────────────────────────────────────────────────────
function prompt(rl) {
  rl.question(
    `${BG}  ${C.neonOrange}▸${C.reset}${BG} ${C.bold}${C.white}`,
    async (input) => {
      p(C.reset)
      const trimmed = input.trim()
      if (!trimmed) { prompt(rl); return }
      if (trimmed.startsWith('/')) {
        await handleCommand(trimmed)
      } else {
        await chat(trimmed)
      }
      prompt(rl)
    }
  )
}

// ── Entry point ───────────────────────────────────────────────────────────────
async function main() {
  await banner(false)

  if (!API_KEY) {
    pl(`  ${C.red}${C.bold}⚠  ANTHROPIC_API_KEY manquante${C.reset}`)
    pl(`  ${C.grey}Lance avec : ${C.neonCyan}ANTHROPIC_API_KEY=sk-ant-... node cli/andy.js${C.reset}\n`)
  } else {
    p(`  ${C.neonGreen}${C.bold}✓${C.reset} ${C.grey}API Key ${C.reset}`)
    await typewrite(API_KEY.slice(0, 14) + '···', C.darkGrey, 12)
    pl()
    p(`  ${C.neonBlue}${C.bold}✓${C.reset} ${C.grey}Modèle  ${C.neonBlue}${process.env._CLI_MODEL || 'claude-sonnet-4-6'}${C.reset}`)
    pl()
    pl()
    hr('═', C.darkGrey)
    pl()
  }

  const rl = readline.createInterface({
    input:    process.stdin,
    output:   process.stdout,
    terminal: true,
  })

  rl.on('SIGINT', async () => {
    pl()
    await glitch('GOODBYE, ANDREA', C.neonCyan, 4)
    pl()
    process.exit(0)
  })

  prompt(rl)
}

main().catch(e => { console.error(e); process.exit(1) })
