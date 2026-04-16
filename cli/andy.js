#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  AnDy CLI — Terminal interface futuriste pour l'IA de Trackr
//  Usage: node cli/andy.js
//         ANTHROPIC_API_KEY=sk-... node cli/andy.js
// ─────────────────────────────────────────────────────────────────────────────

import readline from 'readline'
import { createReadStream, existsSync, readFileSync } from 'fs'
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

const API_KEY   = process.env.ANTHROPIC_API_KEY
const APP_URL   = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'
const CRON_SECRET = process.env.CRON_SECRET || ''

// ── ANSI palette ──────────────────────────────────────────────────────────────
const C = {
  reset:    '\x1b[0m',
  bold:     '\x1b[1m',
  dim:      '\x1b[2m',
  italic:   '\x1b[3m',
  // colours
  purple:   '\x1b[38;5;135m',
  cyan:     '\x1b[38;5;45m',
  teal:     '\x1b[38;5;49m',
  pink:     '\x1b[38;5;213m',
  amber:    '\x1b[38;5;214m',
  red:      '\x1b[38;5;196m',
  green:    '\x1b[38;5;82m',
  blue:     '\x1b[38;5;33m',
  white:    '\x1b[38;5;255m',
  grey:     '\x1b[38;5;242m',
  // bg
  bgPurple: '\x1b[48;5;55m',
  bgDark:   '\x1b[48;5;234m',
}

const p  = (...a) => process.stdout.write(a.join(''))
const pl = (...a) => console.log(...a)
const clr = () => p('\x1b[2J\x1b[H')

// ── ASCII Banner ──────────────────────────────────────────────────────────────
function banner() {
  clr()
  pl(`${C.purple}${C.bold}`)
  pl(`  ╔═══════════════════════════════════════════════════════╗`)
  pl(`  ║                                                       ║`)
  pl(`  ║   ${C.cyan}▄▀█ █▄░█ █▀▄ █▄█   █▀▀ █░░ █${C.purple}                      ║`)
  pl(`  ║   ${C.cyan}█▀█ █░▀█ █▄▀ ░█░   █▄▄ █▄▄ █${C.purple}                      ║`)
  pl(`  ║                                                       ║`)
  pl(`  ║   ${C.grey}Trackr AI · Personal Intelligence System${C.purple}            ║`)
  pl(`  ║   ${C.grey}Model: claude-sonnet-4-6 · Streaming ON${C.purple}             ║`)
  pl(`  ╚═══════════════════════════════════════════════════════╝${C.reset}`)
  pl()
  pl(`  ${C.grey}Type ${C.cyan}/help${C.grey} for commands · ${C.cyan}/exit${C.grey} to quit${C.reset}`)
  pl()
}

// ── Spinner ───────────────────────────────────────────────────────────────────
const SPIN_FRAMES = ['⠋','⠙','⠹','⠸','⠼','⠴','⠦','⠧','⠇','⠏']
let spinTimer = null
let spinI = 0

function startSpin(label = '') {
  spinI = 0
  spinTimer = setInterval(() => {
    p(`\r  ${C.purple}${SPIN_FRAMES[spinI++ % SPIN_FRAMES.length]}${C.reset} ${C.grey}${label}${C.reset}  `)
  }, 80)
}

function stopSpin() {
  if (spinTimer) { clearInterval(spinTimer); spinTimer = null }
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
- Dans ce terminal CLI, tu peux utiliser du markdown simple (pas de rendu, juste texte).
- Si tu génères du code, indique le fichier et la ligne.`

// ── Streaming chat with Anthropic ─────────────────────────────────────────────
async function chat(userMessage) {
  if (!API_KEY) {
    pl(`\n  ${C.red}✗ ANTHROPIC_API_KEY non définie${C.reset}`)
    pl(`  ${C.grey}Export-la : ${C.amber}export ANTHROPIC_API_KEY=sk-ant-...${C.reset}\n`)
    return
  }

  history.push({ role: 'user', content: userMessage })

  pl()
  p(`  ${C.purple}◈${C.reset} ${C.bold}${C.white}AnDy${C.reset}  ${C.grey}${new Date().toLocaleTimeString('fr-FR')}${C.reset}\n\n  `)

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-6',
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
    let inCode   = false
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

            // Minimal colour: code blocks teal, rest white
            for (const ch of chunk) {
              if (ch === '`') inCode = !inCode
              if (ch === '\n') { p('\n  '); continue }
              p(inCode ? `${C.teal}${ch}${C.reset}` : `${C.white}${ch}${C.reset}`)
            }
          }
        } catch {}
      }
    }

    history.push({ role: 'assistant', content: fullText })
    pl(`\n`)

  } catch (e) {
    stopSpin()
    pl(`\n  ${C.red}✗ ${e.message}${C.reset}\n`)
    history.pop()
  }
}

// ── Special commands ──────────────────────────────────────────────────────────
async function handleCommand(input) {
  const [cmd, ...args] = input.trim().split(/\s+/)
  const arg = args.join(' ')

  switch (cmd) {

    case '/help': {
      pl()
      pl(`  ${C.purple}${C.bold}Commandes disponibles${C.reset}`)
      pl(`  ${C.grey}────────────────────────────────────────────${C.reset}`)
      const cmds = [
        ['/help',             'Affiche cette aide'],
        ['/clear',            'Efface le terminal'],
        ['/history',          'Affiche l\'historique de la conversation'],
        ['/reset',            'Remet la conversation à zéro'],
        ['/task <desc>',      'Assigne une tâche à AnDy (self-improve)'],
        ['/improve <focus>',  'Lance un cycle self-improve (focus facultatif)'],
        ['/status',           'Statut du système Trackr'],
        ['/model <name>',     'Change le modèle (haiku/sonnet/opus)'],
        ['/exit',             'Quitter'],
      ]
      for (const [c, d] of cmds) {
        pl(`  ${C.cyan}${c.padEnd(22)}${C.reset}${C.grey}${d}${C.reset}`)
      }
      pl()
      break
    }

    case '/clear': {
      banner()
      break
    }

    case '/reset': {
      history.length = 0
      pl(`\n  ${C.green}✓ Conversation réinitialisée${C.reset}\n`)
      break
    }

    case '/history': {
      pl()
      if (history.length === 0) { pl(`  ${C.grey}Aucun historique${C.reset}\n`); break }
      for (const m of history) {
        const who = m.role === 'user'
          ? `${C.amber}▸ Toi${C.reset}`
          : `${C.purple}◈ AnDy${C.reset}`
        pl(`  ${who}  ${C.grey}${String(m.content).slice(0, 120)}${C.reset}`)
      }
      pl()
      break
    }

    case '/task': {
      if (!arg) { pl(`  ${C.red}Usage: /task <description de la tâche>${C.reset}\n`); break }
      startSpin('Assignation de la tâche…')
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
          pl(`  ${C.green}✓ Tâche assignée${C.reset} — AnDy la prendra au prochain cycle self-improve`)
          pl(`  ${C.grey}  "${arg}"${C.reset}\n`)
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
      const validFocus = ['security','performance','features','bugs','frontend','autonomous','trading','realestate','business','watches','monitor','full']
      if (!validFocus.includes(focus)) {
        pl(`  ${C.red}Focus invalide. Choix : ${validFocus.join(', ')}${C.reset}\n`)
        break
      }
      startSpin(`Lancement self-improve focus=${focus}…`)
      try {
        const r = await fetch(`${APP_URL}/api/self-improve?focus=${focus}&dry=true`, {
          headers: CRON_SECRET ? { 'x-cron-secret': CRON_SECRET } : {},
          signal: AbortSignal.timeout(15000),
        })
        stopSpin()
        const d = await r.json().catch(() => ({}))
        if (d.changed) {
          pl(`  ${C.green}✓ Amélioration appliquée${C.reset}`)
          pl(`  ${C.grey}  Fichier  : ${C.cyan}${d.file}${C.reset}`)
          pl(`  ${C.grey}  Problème : ${d.problem}${C.reset}`)
          pl(`  ${C.grey}  Commit   : ${d.commit}${C.reset}\n`)
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
      startSpin('Vérification du système…')
      const endpoints = [
        ['API Andy',    `${APP_URL}/api/andy`],
        ['Memory',      `${APP_URL}/api/memory`],
        ['Monitor',     `${APP_URL}/api/monitor`],
      ]
      const results = await Promise.allSettled(
        endpoints.map(([, url]) =>
          fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
            .then(r => r.status < 500)
            .catch(() => false)
        )
      )
      stopSpin()
      pl()
      pl(`  ${C.purple}${C.bold}Statut Trackr${C.reset}  ${C.grey}${APP_URL}${C.reset}`)
      pl(`  ${C.grey}──────────────────────────────────${C.reset}`)
      endpoints.forEach(([name], i) => {
        const ok = results[i].value
        pl(`  ${ok ? C.green + '●' : C.red + '○'}${C.reset} ${name.padEnd(16)}${ok ? C.green + 'online' : C.red + 'unreachable'}${C.reset}`)
      })
      pl(`  ${C.grey}──────────────────────────────────${C.reset}`)
      pl(`  ${C.grey}Bot Discord  ${C.green}Railway worker 24/7${C.reset}`)
      pl(`  ${C.grey}Self-Improve ${C.purple}Crons Vercel × 16${C.reset}`)
      pl(`  ${C.grey}Historique   ${C.cyan}${history.length} messages${C.reset}`)
      pl()
      break
    }

    case '/model': {
      if (!arg) { pl(`  ${C.grey}Modèles : haiku, sonnet (défaut), opus${C.reset}\n`); break }
      const models = {
        haiku:  'claude-haiku-4-5-20251001',
        sonnet: 'claude-sonnet-4-6',
        opus:   'claude-opus-4-6',
      }
      if (!models[arg]) { pl(`  ${C.red}Modèle inconnu. Choix : haiku, sonnet, opus${C.reset}\n`); break }
      process.env._CLI_MODEL = models[arg]
      pl(`  ${C.green}✓ Modèle changé → ${arg} (${models[arg]})${C.reset}\n`)
      break
    }

    case '/exit':
    case '/quit': {
      pl(`\n  ${C.purple}À bientôt, Andrea.${C.reset}\n`)
      process.exit(0)
    }

    default: {
      pl(`  ${C.grey}Commande inconnue. Tape ${C.cyan}/help${C.grey} pour la liste.${C.reset}\n`)
    }
  }
}

// ── Prompt ────────────────────────────────────────────────────────────────────
function prompt(rl) {
  rl.question(
    `  ${C.amber}▸${C.reset} ${C.bold}${C.white}`,
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
  banner()

  if (!API_KEY) {
    pl(`  ${C.red}${C.bold}⚠ ANTHROPIC_API_KEY manquante${C.reset}`)
    pl(`  ${C.grey}Lance le CLI avec :${C.reset}`)
    pl(`  ${C.amber}  ANTHROPIC_API_KEY=sk-ant-... node cli/andy.js${C.reset}`)
    pl(`  ${C.grey}Ou ajoute-la dans ${C.cyan}.env${C.grey} à la racine du projet.${C.reset}\n`)
  } else {
    pl(`  ${C.green}✓ API Key détectée${C.reset}  ${C.grey}${API_KEY.slice(0, 12)}...${C.reset}\n`)
  }

  const rl = readline.createInterface({
    input:  process.stdin,
    output: process.stdout,
    terminal: true,
  })

  rl.on('SIGINT', () => {
    pl(`\n\n  ${C.purple}À bientôt, Andrea.${C.reset}\n`)
    process.exit(0)
  })

  // Patch readline to hide the default prompt overwrite on stream tokens
  process.stdout.on('drain', () => {})

  prompt(rl)
}

main().catch(e => { console.error(e); process.exit(1) })
