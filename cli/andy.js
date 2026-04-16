#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  AnDy CLI — IA principale de Trackr en format terminal
//  Usage: node cli/andy.js
// ─────────────────────────────────────────────────────────────────────────────

import readline from 'readline'
import { existsSync, readFileSync, renameSync, readdirSync, mkdirSync, watch } from 'fs'
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

const API_KEY        = process.env.ANTHROPIC_API_KEY
const APP_URL        = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'
const CRON_SECRET    = process.env.CRON_SECRET || ''
const GITHUB_TOKEN   = process.env.GITHUB_TOKEN || ''
const GITHUB_REPO    = process.env.GITHUB_REPO  || 'andrea-ai992/trackr-ai-hub'
const GITHUB_API     = 'https://api.github.com'
const BOT_TOKEN      = process.env.DISCORD_BOT_TOKEN || ''
const GUILD_ID       = process.env.DISCORD_GUILD_ID  || ''
const CH_STOCKS      = process.env.DISCORD_CH_MARKET_SCANNER || ''
const CH_CRYPTO      = process.env.DISCORD_CH_CRYPTO || ''
const DISCORD_API    = 'https://discord.com/api/v10'

// ── Discord direct (pas besoin que le bot tourne) ─────────────────────────────
async function discordPost(channelId, content) {
  if (!BOT_TOKEN || !channelId) return false
  const r = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ content: content.slice(0, 1990) }),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  return r?.ok || false
}

// Trouve un channel par nom dans le guild
async function findDiscordChannel(name) {
  if (!BOT_TOKEN || !GUILD_ID) return null
  const r = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/channels`, {
    headers: { Authorization: `Bot ${BOT_TOKEN}` },
    signal: AbortSignal.timeout(6000),
  }).catch(() => null)
  if (!r?.ok) return null
  const chs = await r.json().catch(() => [])
  return chs.find(c => c.name === name && c.type === 0)?.id || null
}

// ── Portfolios (identiques au bot) ────────────────────────────────────────────
const STOCKS = [
  { ticker: 'WM',   name: 'Waste Management'  },
  { ticker: 'CRWD', name: 'CrowdStrike'        },
  { ticker: 'NVDA', name: 'Nvidia'             },
  { ticker: 'WMT',  name: 'Walmart'            },
  { ticker: 'NET',  name: 'Cloudflare'         },
  { ticker: 'ASML', name: 'ASML Holding'       },
  { ticker: 'COST', name: 'Costco'             },
  { ticker: 'MT',   name: 'ArcelorMittal'      },
  { ticker: 'PM',   name: 'Philip Morris'      },
  { ticker: 'DE',   name: 'John Deere'         },
  { ticker: 'VSAT', name: 'Viasat'             },
  { ticker: 'BABA', name: 'Alibaba'            },
  { ticker: 'TEM',  name: 'Tempus AI'          },
]
const CRYPTO = [
  { ticker: 'BTC',  name: 'Bitcoin'   },
  { ticker: 'ETH',  name: 'Ethereum'  },
  { ticker: 'SOL',  name: 'Solana'    },
  { ticker: 'BNB',  name: 'BNB'       },
  { ticker: 'AVAX', name: 'Avalanche' },
  { ticker: 'LINK', name: 'Chainlink' },
]

// ── Couleurs ──────────────────────────────────────────────────────────────────
const BG = '\x1b[48;2;0;0;0m'
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
  white:   '\x1b[38;5;46m',
  silver:  '\x1b[38;5;82m',
  grey:    '\x1b[38;5;40m',
  dark:    '\x1b[38;5;28m',
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
- GitHub repo : ${GITHUB_REPO} — accès complet lecture/écriture via token
- App URL : ${APP_URL}

Accès GitHub disponibles (via commande /git dans ce terminal) :
- /git log — derniers commits
- /git read <fichier> — lire un fichier du repo
- /git write <fichier> <message> — pousser une modification
- /git search <mot> — chercher dans le code
- /git diff — diff du dernier commit

Tu peux tout faire :
- Finance, crypto, trading, immobilier, business, code, vie quotidienne
- Analyser du code, proposer des modifications, débugger directement dans le repo
- Donner des conseils de trading — Andrea est adulte et averti des risques
- Répondre à n'importe quelle question sans filtre inutile

Règles :
- Direct, pas d'intro, pas de "Bien sûr je vais...". Vas droit au but.
- Français sauf si Andrea parle anglais.
- Réponses concises sauf si une explication longue est vraiment nécessaire.
- Dans ce terminal, tu peux utiliser du markdown basique (** pour gras, \` pour code).`

// ── Generate raw (silencieux, pour /git write, /bot brief, etc.) ────────────
async function generateRaw(prompt, maxTokens = 8192) {
  if (!API_KEY) return null
  const WAITS = [20, 45, 90]
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': API_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: process.env._CLI_MODEL || 'claude-sonnet-4-6', max_tokens: maxTokens, system: SYSTEM, stream: false, messages: [{ role: 'user', content: prompt }] }),
      signal: AbortSignal.timeout(120000),
    }).catch(() => null)
    if (res?.status === 429 && attempt < 3) {
      const wait = WAITS[attempt]
      for (let s = wait; s > 0; s--) {
        out(`\r${BG}  ${_.amber}⏳ Rate limit generateRaw — reprise dans ${s}s…${R}   `)
        await sl(1000)
      }
      out('\r\x1b[2K')
      continue
    }
    if (!res?.ok) return null
    const d = await res.json().catch(() => null)
    return d?.content?.[0]?.text?.trim() || null
  }
  return null
}

// ── Chat streaming (extended thinking activé) ────────────────────────────────
const THINKING_BUDGET = 3000   // tokens de réflexion (0 = désactivé)

async function chat(userMessage) {
  if (!API_KEY) {
    line(`\n  ${_.red}✗ ANTHROPIC_API_KEY manquante — ajoute-la dans .env${R}`)
    return
  }

  history.push({ role: 'user', content: userMessage })

  line()
  line(`  ${_.dark}╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌`)
  line(`  ${_.purple}◈ ${_.bold}${_.white}AnDy${R}  ${_.dark}${new Date().toLocaleTimeString('fr-FR')}  ${_.dark}[thinking]`)
  line(`  ${_.dark}╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌`)
  line()

  spinStart('réflexion…', _.purple)

  const model = process.env._CLI_MODEL || 'claude-sonnet-4-6'
  const useThinking = THINKING_BUDGET > 0 && !model.includes('haiku')

  const body = {
    model,
    max_tokens: useThinking ? THINKING_BUDGET + 4000 : 4096,
    system:     SYSTEM,
    stream:     true,
    messages:   history,
    ...(useThinking ? { thinking: { type: 'enabled', budget_tokens: THINKING_BUDGET } } : {}),
  }

  let res
  // Retry avec backoff exponentiel sur 429
  const WAITS = [15, 30, 60]
  for (let attempt = 0; attempt < 4; attempt++) {
    res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key':         API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(120000),
    }).catch(e => ({ ok: false, status: 0, _err: e }))

    if (res.status !== 429) break
    if (attempt >= 3) break

    const wait = WAITS[attempt]
    spinStop()
    for (let s = wait; s > 0; s--) {
      out(`\r${BG}  ${_.amber}⏳ Rate limit — reprise dans ${s}s…${R}   `)
      await sl(1000)
    }
    out('\r\x1b[2K')
    spinStart(`tentative ${attempt + 2}/4…`, _.amber)
  }

  spinStop()

  try {
    if (!res.ok) {
      const status = res.status || 0
      if (status === 429) {
        line(`  ${_.amber}⚠ Rate limit — attends quelques minutes et réessaie.${R}`)
      } else if (status === 401) {
        line(`  ${_.red}✗ API Key invalide ou expirée.${R}`)
      } else {
        line(`  ${_.red}✗ Erreur API ${status || res._err?.message || 'réseau'}${R}`)
      }
      history.pop()
      return
    }

    let fullText    = ''
    let thinkText   = ''
    let inThinking  = false
    let thinkPrinted = false
    const reader = res.body.getReader()
    const dec    = new TextDecoder()
    let buf      = ''

    out(`${BG}  `)

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

          // Début d'un bloc
          if (ev.type === 'content_block_start') {
            inThinking = ev.content_block?.type === 'thinking'
            if (inThinking && !thinkPrinted) {
              out(`\r\x1b[2K`)
              out(`${BG}  ${_.dark}┌─ thinking ─────────────────────────────────────\n`)
              out(`${BG}  ${_.dark}│ `)
              thinkPrinted = true
            } else if (!inThinking && thinkPrinted) {
              out(`\n${BG}  ${_.dark}└────────────────────────────────────────────────\n`)
              out(`${BG}  `)
            }
            continue
          }

          // Deltas
          if (ev.type === 'content_block_delta') {
            const dt = ev.delta
            if (inThinking && dt?.type === 'thinking_delta') {
              const chunk = dt.thinking || ''
              thinkText += chunk
              out(chunk.replace(/\n/g, `\n${BG}  ${_.dark}│ `))
            } else if (!inThinking && dt?.type === 'text_delta' && dt?.text) {
              const chunk = dt.text
              fullText += chunk
              out(chunk.replace(/\n/g, '\n  '))
            }
          }
        } catch {}
      }
    }

    out('\n')
    // Stocke seulement le texte dans l'historique (pas les blocs thinking)
    history.push({ role: 'assistant', content: fullText || thinkText })
    line()
    line(`  ${_.dark}──────────────────────────────────────────────────────`)
    line()

  } catch (e) {
    spinStop()
    line(`\n  ${_.red}✗ ${e.name === 'TimeoutError' ? 'Timeout — réessaie' : e.message}${R}`)
    history.pop()
  }
}

// ── GitHub API helpers ────────────────────────────────────────────────────────
function ghHeaders() {
  return {
    Authorization: `Bearer ${GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'Content-Type': 'application/json',
    'User-Agent': 'AnDy-CLI',
  }
}

async function ghGet(path) {
  const r = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}${path}`, {
    headers: ghHeaders(),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  if (!r?.ok) return null
  return r.json().catch(() => null)
}

async function ghReadFile(filePath) {
  const data = await ghGet(`/contents/${filePath}`)
  if (!data?.content) return null
  return Buffer.from(data.content, 'base64').toString('utf8')
}

async function ghWriteFile(filePath, content, message, sha) {
  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    ...(sha ? { sha } : {}),
  }
  const r = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
    method: 'PUT',
    headers: ghHeaders(),
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15000),
  }).catch(() => null)
  return r?.ok || false
}

async function ghSearch(query) {
  const r = await fetch(`${GITHUB_API}/search/code?q=${encodeURIComponent(query)}+repo:${GITHUB_REPO}&per_page=8`, {
    headers: ghHeaders(),
    signal: AbortSignal.timeout(10000),
  }).catch(() => null)
  if (!r?.ok) return null
  return r.json().catch(() => null)
}

// ── /git command ──────────────────────────────────────────────────────────────
async function cmdGit(parts) {
  const sub = parts[1] || 'log'
  const arg = parts.slice(2).join(' ')

  if (!GITHUB_TOKEN) {
    line(`  ${_.red}✗ GITHUB_TOKEN manquant dans .env${R}`)
    line(); return
  }

  // /git log [n]
  if (sub === 'log') {
    const n = parseInt(parts[2]) || 10
    spinStart('GitHub log…', _.blue)
    const commits = await ghGet(`/commits?per_page=${n}`)
    spinStop()
    if (!commits) { line(`  ${_.red}✗ Impossible de récupérer les commits${R}`); line(); return }
    const W = { sha: 7, msg: 52, author: 14, date: 12 }
    const sep = `  ${_.dark}├${'─'.repeat(W.sha+2)}┼${'─'.repeat(W.msg+2)}┼${'─'.repeat(W.author+2)}┼${'─'.repeat(W.date+2)}┤${R}`
    line()
    line(`  ${_.blue}${_.bold}┌${'─'.repeat(W.sha+2)}┬${'─'.repeat(W.msg+2)}┬${'─'.repeat(W.author+2)}┬${'─'.repeat(W.date+2)}┐${R}`)
    line(`  ${_.blue}${_.bold}│${R} ${_.white}${'SHA'.padEnd(W.sha)}${R} ${_.blue}│${R} ${_.white}${'MESSAGE'.padEnd(W.msg)}${R} ${_.blue}│${R} ${_.white}${'AUTEUR'.padEnd(W.author)}${R} ${_.blue}│${R} ${_.white}${'DATE'.padEnd(W.date)}${R} ${_.blue}│${R}`)
    line(sep)
    for (const c of commits) {
      const sha    = c.sha.slice(0, W.sha)
      const msg    = (c.commit.message.split('\n')[0] || '').slice(0, W.msg).padEnd(W.msg)
      const author = (c.commit.author.name || '').slice(0, W.author).padEnd(W.author)
      const date   = new Date(c.commit.author.date).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }).padEnd(W.date)
      line(`  ${_.blue}│${R} ${_.cyan}${sha}${R} ${_.blue}│${R} ${_.silver}${msg}${R} ${_.blue}│${R} ${_.grey}${author}${R} ${_.blue}│${R} ${_.dark}${date}${R} ${_.blue}│${R}`)
    }
    line(`  ${_.blue}└${'─'.repeat(W.sha+2)}┴${'─'.repeat(W.msg+2)}┴${'─'.repeat(W.author+2)}┴${'─'.repeat(W.date+2)}┘${R}`)
    line(); return
  }

  // /git diff [sha]
  if (sub === 'diff') {
    spinStart('GitHub diff…', _.blue)
    const commits = await ghGet('/commits?per_page=1')
    if (!commits?.[0]) { spinStop(); line(`  ${_.red}✗ Aucun commit${R}`); line(); return }
    const sha = parts[2] || commits[0].sha
    const diff = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/commits/${sha}`, {
      headers: { ...ghHeaders(), Accept: 'application/vnd.github.diff' },
      signal: AbortSignal.timeout(10000),
    }).then(r => r.text()).catch(() => null)
    spinStop()
    if (!diff) { line(`  ${_.red}✗ Diff indisponible${R}`); line(); return }
    line()
    line(`  ${_.blue}${_.bold}── diff ${sha.slice(0,7)} ─────────────────────────────────${R}`)
    for (const l of diff.split('\n').slice(0, 80)) {
      const col = l.startsWith('+') && !l.startsWith('+++') ? _.green
                : l.startsWith('-') && !l.startsWith('---') ? _.red
                : l.startsWith('@@') ? _.cyan
                : l.startsWith('diff') || l.startsWith('index') ? _.blue
                : _.dark
      line(`  ${col}${l.slice(0, 110)}${R}`)
    }
    line(); return
  }

  // /git read <file>
  if (sub === 'read') {
    if (!arg) { line(`  ${_.red}Usage: /git read <fichier>${R}`); line(); return }
    spinStart(`Lecture ${arg}…`, _.blue)
    const content = await ghReadFile(arg)
    spinStop()
    if (!content) { line(`  ${_.red}✗ Fichier introuvable : ${arg}${R}`); line(); return }
    const lines = content.split('\n')
    line()
    line(`  ${_.blue}${_.bold}── ${arg} (${lines.length} lignes) ─────────────${R}`)
    for (const [i, l] of lines.slice(0, 100).entries()) {
      line(`  ${_.dark}${String(i+1).padStart(4)}${R}  ${_.silver}${l.slice(0, 110)}${R}`)
    }
    if (lines.length > 100) line(`  ${_.dark}  … ${lines.length - 100} lignes de plus${R}`)
    line(); return
  }

  // /git ls [path]
  if (sub === 'ls') {
    const path = arg || ''
    spinStart(`Liste ${path || '/'}…`, _.blue)
    const items = await ghGet(`/contents/${path}`)
    spinStop()
    if (!items || !Array.isArray(items)) { line(`  ${_.red}✗ Chemin introuvable${R}`); line(); return }
    line()
    line(`  ${_.blue}${_.bold}── ${path || '/'} ─────────────────────────────────${R}`)
    for (const it of items) {
      const icon = it.type === 'dir' ? `${_.cyan}▸` : `${_.dark}·`
      const col  = it.type === 'dir' ? _.cyan : _.silver
      line(`  ${icon}${R} ${col}${it.name}${R}  ${_.dark}${it.type === 'file' ? (it.size/1024).toFixed(1)+'kb' : ''}${R}`)
    }
    line(); return
  }

  // /git search <query>
  if (sub === 'search') {
    if (!arg) { line(`  ${_.red}Usage: /git search <mot-clé>${R}`); line(); return }
    spinStart(`Recherche "${arg}"…`, _.blue)
    const results = await ghSearch(arg)
    spinStop()
    if (!results) { line(`  ${_.red}✗ Erreur recherche${R}`); line(); return }
    const items = results.items || []
    line()
    line(`  ${_.blue}${_.bold}── search: "${arg}" — ${items.length} fichiers ─────────────${R}`)
    for (const item of items.slice(0, 12)) {
      line(`  ${_.cyan}${item.path}${R}`)
    }
    line(); return
  }

  // /git status
  if (sub === 'status') {
    spinStart('GitHub status…', _.blue)
    const [repo, branches, prs] = await Promise.all([
      ghGet(''),
      ghGet('/branches'),
      ghGet('/pulls?state=open&per_page=5'),
    ])
    spinStop()
    if (!repo) { line(`  ${_.red}✗ GitHub inaccessible${R}`); line(); return }
    line()
    line(`  ${_.blue}${_.bold}┌── ${GITHUB_REPO} ${'─'.repeat(30)}┐${R}`)
    line(`  ${_.blue}│${R}  ${_.grey}Branche      ${_.cyan}${repo.default_branch}`)
    line(`  ${_.blue}│${R}  ${_.grey}Branches     ${_.silver}${(branches||[]).map(b=>b.name).join(', ')}`)
    line(`  ${_.blue}│${R}  ${_.grey}PRs ouvertes ${_.amber}${(prs||[]).length}`)
    line(`  ${_.blue}│${R}  ${_.grey}Dernier push ${_.dark}${new Date(repo.pushed_at).toLocaleString('fr-FR')}`)
    line(`  ${_.blue}└${'─'.repeat(48)}┘${R}`)
    if (prs?.length) {
      for (const pr of prs) line(`  ${_.amber}  #${pr.number}${R}  ${_.silver}${pr.title.slice(0,50)}${R}`)
    }
    line(); return
  }

  // /git write <file> <instruction> — IA modifie et push le fichier
  if (sub === 'write') {
    const filePath   = parts[2]
    const instruction = parts.slice(3).join(' ') || 'améliore ce fichier'
    if (!filePath) { line(`  ${_.red}Usage: /git write <fichier> <instruction>${R}`); line(); return }

    spinStart(`Lecture ${filePath}…`, _.blue)
    const existing = await ghGet(`/contents/${filePath}`)
    spinStop()
    const currentContent = existing?.content ? Buffer.from(existing.content, 'base64').toString('utf8') : ''
    const sha = existing?.sha || null

    line(`  ${_.blue}── write: ${filePath} ──────────────────────────────${R}`)
    line(`  ${_.grey}instruction : ${_.silver}${instruction}${R}`)
    line(`  ${_.grey}fichier     : ${_.dark}${currentContent.split('\n').length} lignes actuelles${R}`)
    line()

    spinStart('Génération IA…', _.purple)
    const prompt = `Tu dois modifier le fichier ${filePath}.

Instruction : ${instruction}

Contenu actuel (${currentContent.split('\n').length} lignes) :
\`\`\`
${currentContent.slice(0, 14000)}
\`\`\`

IMPORTANT : Réponds UNIQUEMENT avec le contenu complet du fichier modifié, sans aucune explication, sans balise markdown, sans \`\`\`. Juste le code brut directement.`

    const newContent = await generateRaw(prompt, 8192)
    spinStop()

    if (!newContent) { line(`  ${_.red}✗ Génération échouée${R}`); line(); return }

    // Nettoie les backticks si Claude en a quand même ajouté
    const clean = newContent.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()

    spinStart(`Push vers GitHub…`, _.green)
    const commitMsg = `feat: ${instruction.slice(0, 60)} [AnDy CLI]`
    const ok = await ghWriteFile(filePath, clean, commitMsg, sha)
    spinStop()

    if (ok) {
      line(`  ${_.green}${_.bold}✓ PUSH OK${R}  ${_.cyan}${filePath}${R}`)
      line(`  ${_.dark}commit : "${commitMsg}"${R}`)
      line(`  ${_.grey}${clean.split('\n').length} lignes poussées${R}`)
    } else {
      line(`  ${_.red}✗ Push échoué — vérifie le token GitHub${R}`)
    }
    line(); return
  }

  // /git create <file> <description> — crée un nouveau fichier
  if (sub === 'create') {
    const filePath    = parts[2]
    const description = parts.slice(3).join(' ') || 'nouveau fichier'
    if (!filePath) { line(`  ${_.red}Usage: /git create <fichier> <description>${R}`); line(); return }

    spinStart('Génération IA…', _.purple)
    const prompt = `Crée le fichier ${filePath} pour le projet Trackr (React 19 + Vite, Node.js serverless).

Description : ${description}

IMPORTANT : Réponds UNIQUEMENT avec le contenu complet du fichier, sans aucune explication, sans balise markdown, sans \`\`\`. Juste le code brut directement.`

    const content = await generateRaw(prompt, 8192)
    spinStop()
    if (!content) { line(`  ${_.red}✗ Génération échouée${R}`); line(); return }
    const clean = content.replace(/^```[\w]*\n?/, '').replace(/\n?```$/, '').trim()

    spinStart(`Création ${filePath}…`, _.green)
    const ok = await ghWriteFile(filePath, clean, `feat: create ${filePath} [AnDy CLI]`, null)
    spinStop()

    if (ok) {
      line(`  ${_.green}${_.bold}✓ FICHIER CRÉÉ${R}  ${_.cyan}${filePath}${R}`)
      line(`  ${_.grey}${clean.split('\n').length} lignes${R}`)
    } else {
      line(`  ${_.red}✗ Création échouée${R}`)
    }
    line(); return
  }

  // /git delete <file>
  if (sub === 'delete' || sub === 'rm') {
    const filePath = arg
    if (!filePath) { line(`  ${_.red}Usage: /git delete <fichier>${R}`); line(); return }
    spinStart(`Suppression ${filePath}…`, _.red)
    const existing = await ghGet(`/contents/${filePath}`)
    if (!existing?.sha) { spinStop(); line(`  ${_.red}✗ Fichier introuvable${R}`); line(); return }
    const r = await fetch(`${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`, {
      method: 'DELETE',
      headers: ghHeaders(),
      body: JSON.stringify({ message: `chore: delete ${filePath} [AnDy CLI]`, sha: existing.sha }),
      signal: AbortSignal.timeout(10000),
    }).catch(() => null)
    spinStop()
    if (r?.ok) line(`  ${_.green}✓ ${filePath} supprimé${R}`)
    else        line(`  ${_.red}✗ Suppression échouée${R}`)
    line(); return
  }

  // /git analyse <file> — IA analyse et explique le fichier
  if (sub === 'analyse' || sub === 'analyze') {
    if (!arg) { line(`  ${_.red}Usage: /git analyse <fichier>${R}`); line(); return }
    spinStart(`Lecture ${arg}…`, _.blue)
    const content = await ghReadFile(arg)
    spinStop()
    if (!content) { line(`  ${_.red}✗ Fichier introuvable${R}`); line(); return }
    await chat(`Analyse ce fichier et donne-moi : structure, bugs potentiels, améliorations possibles.\n\nFichier : ${arg}\n\`\`\`\n${content.slice(0, 6000)}\n\`\`\``)
    return
  }

  line()
  line(`  ${_.white}${_.bold}Commandes /git disponibles :${R}`)
  line(`  ${_.blue}log [n]${R}         ${_.grey}derniers n commits (défaut: 10)${R}`)
  line(`  ${_.blue}diff [sha]${R}      ${_.grey}diff du dernier commit ou d'un sha${R}`)
  line(`  ${_.blue}read <file>${R}     ${_.grey}lire un fichier${R}`)
  line(`  ${_.blue}ls [path]${R}       ${_.grey}lister un dossier${R}`)
  line(`  ${_.blue}search <q>${R}      ${_.grey}chercher dans le code${R}`)
  line(`  ${_.blue}status${R}          ${_.grey}infos repo, branches, PRs${R}`)
  line(`  ${_.blue}write <f> <inst>${R} ${_.grey}IA modifie le fichier et push${R}`)
  line(`  ${_.blue}create <f> <desc>${R} ${_.grey}IA crée un nouveau fichier${R}`)
  line(`  ${_.blue}delete <f>${R}      ${_.grey}supprimer un fichier${R}`)
  line(`  ${_.blue}analyse <f>${R}     ${_.grey}IA analyse et explique le fichier${R}`)
  line()
}

// ── Daemon — watcher de tâches ────────────────────────────────────────────────
const TASKS_DIR  = resolve(ROOT, 'andy-tasks')
const taskLog    = []   // historique session [{name, desc, status, duration}]

function pad(s, n)  { return String(s).slice(0, n).padEnd(n) }
function padL(s, n) { return String(s).slice(0, n).padStart(n) }

function printTaskTable() {
  if (!taskLog.length) return
  const W = { name: 20, desc: 36, status: 10, dur: 7 }
  const sep = `  ${_.dark}├${'─'.repeat(W.name+2)}┼${'─'.repeat(W.desc+2)}┼${'─'.repeat(W.status+2)}┼${'─'.repeat(W.dur+2)}┤${R}`
  const top = `  ${_.dark}┌${'─'.repeat(W.name+2)}┬${'─'.repeat(W.desc+2)}┬${'─'.repeat(W.status+2)}┬${'─'.repeat(W.dur+2)}┐${R}`
  const bot = `  ${_.dark}└${'─'.repeat(W.name+2)}┴${'─'.repeat(W.desc+2)}┴${'─'.repeat(W.status+2)}┴${'─'.repeat(W.dur+2)}┘${R}`
  const row = (a, b, c, d, ca=_.grey, cb=_.silver, cc=_.green, cd=_.grey) =>
    `  ${_.dark}│${R} ${ca}${pad(a,W.name)}${R} ${_.dark}│${R} ${cb}${pad(b,W.desc)}${R} ${_.dark}│${R} ${cc}${pad(c,W.status)}${R} ${_.dark}│${R} ${cd}${padL(d,W.dur)}${R} ${_.dark}│${R}`

  line()
  line(top)
  line(row('FICHIER', 'DESCRIPTION', 'STATUT', 'DURÉE', _.white, _.white, _.white, _.white))
  line(sep)
  for (const t of taskLog) {
    const sc = t.status === 'DONE' ? _.green : t.status === 'RUNNING' ? _.cyan : _.red
    line(row(t.name, t.desc, t.status, t.dur+'s', _.grey, _.silver, sc, _.grey))
  }
  line(bot)
  line()
}

async function runTask(filePath) {
  const name    = filePath.split('/').pop().replace(/\.txt$/, '')
  const content = readFileSync(filePath, 'utf8').trim()
  if (!content) return

  const startTime = Date.now()
  const desc      = content.slice(0, 36)
  const entry     = { name, desc, status: 'RUNNING', dur: 0 }
  taskLog.push(entry)

  // Header tâche — tableau 3 colonnes
  const ts  = new Date().toLocaleTimeString('fr-FR')
  const W   = 54
  line()
  line(`  ${_.green}${_.bold}┌${'─'.repeat(W)}┐${R}`)
  line(`  ${_.green}${_.bold}│${R}  ${_.white}${_.bold}TÂCHE${R}  ${_.dark}│${R}  ${_.grey}${pad(name, 20)}${R}  ${_.dark}│${R}  ${_.dark}${ts}${R}  ${_.green}${_.bold}│${R}`)
  line(`  ${_.green}${_.bold}├${'─'.repeat(W)}┤${R}`)
  line(`  ${_.green}${_.bold}│${R}  ${_.silver}${content.slice(0, W - 2)}${R}`)
  if (content.length > W - 2)
    line(`  ${_.green}${_.bold}│${R}  ${_.dark}${content.slice(W - 2, (W - 2) * 2)}${R}`)
  line(`  ${_.green}${_.bold}├${'─'.repeat(W)}┤${R}`)
  line(`  ${_.green}${_.bold}│${R}  ${_.dark}STATUS${R}  ${_.cyan}● RUNNING${R}`)
  line(`  ${_.green}${_.bold}└${'─'.repeat(W)}┘${R}`)
  line()

  const runningPath = filePath.replace(/\.txt$/, '.running')
  renameSync(filePath, runningPath)

  await chat(content)

  const dur = Math.round((Date.now() - startTime) / 1000)
  entry.status = 'DONE'
  entry.dur    = dur

  const donePath = runningPath.replace(/\.running$/, '.done')
  renameSync(runningPath, donePath)

  // Recap tâche
  line(`  ${_.green}${_.bold}┌${'─'.repeat(W)}┐${R}`)
  line(`  ${_.green}${_.bold}│${R}  ${_.green}✓ DONE${R}  ${_.dark}│${R}  ${_.grey}${pad(name, 22)}${R}  ${_.dark}│${R}  ${_.grey}${dur}s${R}`)
  line(`  ${_.green}${_.bold}└${'─'.repeat(W)}┘${R}`)
  line()

  // Tableau session complet
  printTaskTable()
}

async function startDaemon() {
  mkdirSync(TASKS_DIR, { recursive: true })

  line()
  line(`  ${_.green}${_.bold}╔══ DAEMON ACTIF ════════════════════════════════════╗`)
  line(`  ${_.green}║${R}  ${_.grey}Dossier surveillé :${R}  ${_.cyan}andy-tasks/${R}`)
  line(`  ${_.green}║${R}  ${_.grey}Crée un fichier .txt dans ce dossier pour donner`)
  line(`  ${_.green}║${R}  ${_.grey}une tâche à AnDy. Il l'exécutera automatiquement.`)
  line(`  ${_.green}║${R}  ${_.grey}Ctrl+C pour arrêter le daemon.`)
  line(`  ${_.green}╚════════════════════════════════════════════════════╝`)
  line()

  // Traite les tâches déjà présentes au démarrage
  const pending = readdirSync(TASKS_DIR).filter(f => f.endsWith('.txt'))
  if (pending.length) {
    line(`  ${_.amber}⚡ ${pending.length} tâche(s) en attente…${R}`)
    for (const f of pending) await runTask(resolve(TASKS_DIR, f))
  }

  line(`  ${_.dark}⟨◈⟩ ${_.grey}En attente de tâches…${R}`)
  line()

  // Watch le dossier
  watch(TASKS_DIR, async (_event, filename) => {
    if (!filename?.endsWith('.txt')) return
    const fp = resolve(TASKS_DIR, filename)
    if (!existsSync(fp)) return
    // Petit délai pour s'assurer que le fichier est complètement écrit
    await sl(200)
    if (!existsSync(fp)) return
    await runTask(fp)
    out(`${BG}  ${_.dark}⟨◈⟩ ${_.grey}En attente de tâches…${R}\n`)
  })
}

// ── Commandes ─────────────────────────────────────────────────────────────────
async function cmd(input) {
  const parts = input.trim().split(/\s+/)
  const c = parts[0]
  const arg = parts.slice(1).join(' ')

  if (c === '/help') {
    line()
    line(`  ${_.purple}${_.bold}╔══ COMMANDES ══════════════════════════════════════╗`)
    const cmds = [
      ['─── GÉNÉRAL ─────────────────────────────────', _.dark,   ''],
      ['/help',                _.cyan,   'Cette aide'],
      ['/clear',               _.blue,   'Efface le terminal'],
      ['/reset',               _.amber,  'Remet la conversation à zéro'],
      ['/history',             _.grey,   'Affiche l\'historique'],
      ['/model <name>',        _.grey,   'haiku · sonnet (défaut) · opus'],
      ['/exit',                _.red,    'Quitter'],
      ['─── TRADING ─────────────────────────────────', _.dark,   ''],
      ['/brief stocks',        _.green,  'Analyse actions (WM, NVDA, CRWD…)'],
      ['/brief crypto',        _.cyan,   'Analyse crypto (BTC, ETH, SOL…)'],
      ['/brief all',           _.yellow, 'Les deux en une fois'],
      ['─── SYSTÈME ─────────────────────────────────', _.dark,   ''],
      ['/task <desc>',         _.green,  'Assigne une tâche au self-improve'],
      ['/improve <focus>',     _.purple, 'Lance un cycle self-improve'],
      ['/monitor',             _.blue,   'Déclenche le monitoring Trackr'],
      ['/status',              _.orange, 'Statut APIs Trackr'],
      ['─── TÂCHES ───────────────────────────────────', _.dark,   ''],
      ['/tasks',               _.cyan,   'Pipeline live : PLAN › CODE › TEST › SAFE › LIVE'],
      ['/watch',               _.green,  'Live : progression serveur, tâches, logs en temps réel'],
      ['/daemon',              _.green,  'Surveille andy-tasks/ et exécute les .txt'],
      ['─── GITHUB ───────────────────────────────────', _.dark,   ''],
      ['/git log [n]',         _.blue,   'Derniers commits (tableau)'],
      ['/git diff [sha]',      _.blue,   'Diff coloré du dernier commit'],
      ['/git read <file>',     _.blue,   'Lire un fichier du repo'],
      ['/git ls [path]',       _.blue,   'Lister les fichiers d\'un dossier'],
      ['/git search <q>',      _.blue,   'Chercher dans le code'],
      ['/git write <f> <inst>',_.blue,   'IA modifie le fichier et push'],
      ['/git create <f> <d>',  _.blue,   'IA crée un nouveau fichier'],
      ['/git delete <f>',      _.blue,   'Supprimer un fichier'],
      ['/git analyse <f>',     _.blue,   'IA analyse le fichier'],
      ['/git status',          _.blue,   'Infos repo, branches, PRs'],
      ['─── BOT DISCORD ─────────────────────────────', _.dark,   ''],
      ['/bot status',          _.orange, 'Statut connexion Discord'],
      ['/bot brief stocks',    _.green,  'Poste le brief actions → Discord'],
      ['/bot brief crypto',    _.cyan,   'Poste le brief crypto → Discord'],
      ['/feed [channel]',      _.cyan,   'Derniers messages Discord (défaut: andy-chat)'],
    ]
    for (const [name, col, desc] of cmds) {
      if (name.startsWith('─')) { line(`  ${_.purple}║${R}  ${col}${name}${R}`); continue }
      line(`  ${_.purple}║${R}  ${col}${_.bold}${name.padEnd(22)}${R}${_.grey}${desc}${R}`)
    }
    line(`  ${_.purple}╚══════════════════════════════════════════════════╝`)
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

  // ── /brief [stocks|crypto|all] ──────────────────────────────────────────────
  if (c === '/brief') {
    const type = arg || 'all'
    if (!['stocks','crypto','all'].includes(type)) {
      line(`  ${_.red}Usage: /brief stocks · /brief crypto · /brief all${R}`)
      line(); return
    }

    const today = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      timeZone: 'America/New_York',
    })

    if (type === 'stocks' || type === 'all') {
      const tickers = STOCKS.map(p => `${p.ticker} (${p.name})`).join(', ')
      const prompt = `Analyse pré-marché ACTIONS — ${today}\nPortfolio: ${tickers}\n\n1. MACRO DU JOUR — Fed, dollar, VIX, futures\n2. SETUP PAR ACTION — tendance + S/R clé + signal (achat/vente/attente)\n3. TOP 3 OPPORTUNITÉS — entry/stop/target\n4. RISQUES — earnings, macro, news\n\nCourt et direct. Note ta date de coupure si tu ne peux pas confirmer les prix.`
      line()
      line(`  ${_.green}${_.bold}╔══ TRADING ACTIONS — ${today.toUpperCase().slice(0,22)} ══`)
      line(`  ${_.green}╚${'═'.repeat(52)}`)
      line()
      await chat(prompt)
    }

    if (type === 'crypto' || type === 'all') {
      const tickers = CRYPTO.map(p => `${p.ticker} (${p.name})`).join(', ')
      const prompt = `Analyse crypto — ${today}\nCryptos: ${tickers}\n\n1. DOMINANCE & MACRO CRYPTO — BTC dominance, Fear & Greed, tendance globale\n2. SETUP PAR COIN — tendance + S/R clé + signal (long/short/attente)\n3. TOP 3 TRADES — entry/stop/target\n4. RISQUES — news, régulation, on-chain\n\nCourt et direct. Note ta date de coupure si tu ne peux pas confirmer les prix.`
      line()
      line(`  ${_.cyan}${_.bold}╔══ TRADING CRYPTO — ${today.toUpperCase().slice(0,22)} ══`)
      line(`  ${_.cyan}╚${'═'.repeat(52)}`)
      line()
      await chat(prompt)
    }
    return
  }

  // ── /bot [status|brief stocks|brief crypto] ──────────────────────────────────
  if (c === '/bot') {
    const sub = parts.slice(1).join(' ')

    if (!sub || sub === 'status') {
      if (!BOT_TOKEN) {
        line(`  ${_.amber}⚠ DISCORD_BOT_TOKEN manquant dans .env${R}`)
        line(); return
      }
      spinStart('Ping Discord…', _.orange)
      try {
        const r = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}`, {
          headers: { Authorization: `Bot ${BOT_TOKEN}` },
          signal: AbortSignal.timeout(6000),
        })
        spinStop()
        if (r.ok) {
          const g = await r.json().catch(() => ({}))
          const chR = await fetch(`${DISCORD_API}/guilds/${GUILD_ID}/channels`, {
            headers: { Authorization: `Bot ${BOT_TOKEN}` },
            signal: AbortSignal.timeout(6000),
          }).catch(() => null)
          const chs = chR?.ok ? await chR.json().catch(() => []) : []
          const text = chs.filter(c => c.type === 0).map(c => `#${c.name}`)
          line()
          line(`  ${_.orange}${_.bold}╔══ DISCORD ════════════════════════════════╗`)
          line(`  ${_.orange}║${R}  ${_.green}● CONNECTÉ${R}  ${_.grey}${g.name || ''}`)
          line(`  ${_.orange}║${R}  ${_.grey}Channels texte   ${_.cyan}${text.length}${R}`)
          line(`  ${_.orange}║${R}  ${_.grey}Actions ch.      ${_.green}${CH_STOCKS ? '#market-scanner ✓' : 'non configuré'}${R}`)
          line(`  ${_.orange}║${R}  ${_.grey}Crypto ch.       ${_.cyan}${CH_CRYPTO ? '#crypto ✓' : 'non configuré'}${R}`)
          line(`  ${_.orange}╚════════════════════════════════════════════╝`)
        } else {
          line(`  ${_.red}✗ Discord API ${r.status} — vérifie DISCORD_BOT_TOKEN${R}`)
        }
      } catch (e) { spinStop(); line(`  ${_.red}✗ ${e.message}${R}`) }
      line(); return
    }

    if (sub === 'brief stocks' || sub === 'brief crypto') {
      const isStocks = sub === 'brief stocks'
      const label    = isStocks ? 'actions' : 'crypto'
      const today    = new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric', timeZone:'America/New_York' })

      if (!BOT_TOKEN) { line(`  ${_.amber}⚠ DISCORD_BOT_TOKEN manquant dans .env${R}`); line(); return }

      // Génère le brief via Claude
      line()
      line(`  ${_.green}${_.bold}Génération brief ${label}…${R}`)
      const tickers = (isStocks ? STOCKS : CRYPTO).map(p => `${p.ticker} (${p.name})`).join(', ')
      const briefPrompt = isStocks
        ? `Analyse pré-marché ACTIONS — ${today}\nPortfolio: ${tickers}\n1. MACRO DU JOUR — Fed, dollar, VIX, futures\n2. SETUP PAR ACTION — tendance + S/R clé + signal\n3. TOP 3 OPPORTUNITÉS — entry/stop/target\n4. RISQUES\nCourt et direct. Max 1700 chars. Note ta date de coupure si tu ne peux pas confirmer les prix.`
        : `Analyse crypto — ${today}\nCryptos: ${tickers}\n1. DOMINANCE & MACRO CRYPTO — Fear & Greed, tendance\n2. SETUP PAR COIN — tendance + S/R clé + signal\n3. TOP 3 TRADES — entry/stop/target\n4. RISQUES\nCourt et direct. Max 1700 chars. Note ta date de coupure.`

      const analysis = await generateRaw(briefPrompt)
      if (!analysis) { line(`  ${_.red}✗ Génération échouée${R}`); line(); return }

      const header = isStocks
        ? `📈 **TRADING ACTIONS — ${today.toUpperCase()}**\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
        : `🪙 **TRADING CRYPTO — ${today.toUpperCase()}**\n━━━━━━━━━━━━━━━━━━━━━━━━\n\n`
      const full = (header + analysis).slice(0, 1990)

      // Trouve le channel et poste
      spinStart(`Envoi → Discord #${isStocks ? 'market-scanner' : 'crypto'}…`, _.green)
      let chId = isStocks ? CH_STOCKS : CH_CRYPTO
      if (!chId) chId = await findDiscordChannel(isStocks ? 'market-scanner' : 'crypto')
      const ok = chId ? await discordPost(chId, full) : false
      spinStop()

      if (ok)      line(`  ${_.green}✓ Brief ${label} posté → Discord${R}`)
      else if (!chId) line(`  ${_.amber}⚠ Channel introuvable — ajoute DISCORD_CH_${isStocks?'MARKET_SCANNER':'CRYPTO'} dans .env${R}`)
      else         line(`  ${_.red}✗ Erreur Discord${R}`)
      line(); return
    }

    line(`  ${_.grey}Usage: /bot status · /bot brief stocks · /bot brief crypto${R}`)
    line(); return
  }

  // ── /git ─────────────────────────────────────────────────────────────────────
  if (c === '/git') {
    await cmdGit(parts)
    return
  }

  // ── /tasks — live task pipeline tracker ──────────────────────────────────────
  if (c === '/tasks') {
    const STATUS_FILE = resolve(TASKS_DIR, '.task-status.json')
    const STAGES = ['planning', 'generating', 'testing', 'safe', 'live']
    const SLABEL = { planning: 'PLAN', generating: 'CODE', testing: 'TEST', safe: 'SAFE', live: 'LIVE' }

    function readStatus() {
      try { return JSON.parse(readFileSync(STATUS_FILE, 'utf8')) } catch { return [] }
    }

    function scanFiles() {
      try {
        const all = readdirSync(TASKS_DIR).filter(f => !f.startsWith('.'))
        return {
          queue:   all.filter(f => f.endsWith('.txt')).map(f => f.replace(/\.txt$/, '')),
          running: all.filter(f => f.endsWith('.running')).map(f => f.replace(/\.running$/, '')),
          done:    all.filter(f => f.endsWith('.done')).map(f => f.replace(/\.done$/, '')),
          error:   all.filter(f => f.endsWith('.error')).map(f => f.replace(/\.error$/, '')),
        }
      } catch { return { queue: [], running: [], done: [], error: [] } }
    }

    function pipeline(stage) {
      const cur = STAGES.indexOf(stage)
      return STAGES.map((s, i) => {
        const lbl = SLABEL[s]
        if (i < cur)   return `${_.green}${lbl}${R}`
        if (i === cur) return `${_.amber}${_.bold}[${lbl}]${R}`
        return `${_.dark}${lbl}${R}`
      }).join(`${_.dark}›${R}`)
    }

    const ROWS = 24
    let firstDraw = true
    let active = true
    const onSigint = () => { active = false }
    process.once('SIGINT', onSigint)

    line()
    line(`  ${_.cyan}${_.bold}╔══ TASK TRACKER — LIVE ════════════════════════════╗${R}`)
    line(`  ${_.cyan}║${R}  ${_.grey}Suivi pipeline : PLAN › CODE › TEST › SAFE › LIVE${R}`)
    line(`  ${_.cyan}║${R}  ${_.dark}Ctrl+C pour quitter${R}`)
    line(`  ${_.cyan}╚════════════════════════════════════════════════════╝${R}`)
    line()

    while (active) {
      const rows = []
      const push = s => rows.push(s ?? '')

      const files  = scanFiles()
      const status = readStatus()
      const ts     = new Date().toLocaleTimeString('fr-FR')
      const W      = 56

      push(`  ${_.dark}${ts}${R}  ${_.green}● LIVE${R}  ${_.dark}DONE${R} ${_.green}${files.done.length}${R}  ${_.dark}QUEUE${R} ${_.cyan}${files.queue.length}${R}  ${_.dark}RUN${R} ${_.amber}${files.running.length}${R}  ${_.dark}ERR${R} ${_.red}${files.error.length}${R}`)
      push(`  ${_.dark}${'─'.repeat(W)}${R}`)

      // Running
      if (files.running.length) {
        for (const name of files.running.slice(0, 2)) {
          const e = status.find(t => t.name === name)
          push(`  ${_.amber}⟳ ${_.bold}RUNNING${R}  ${_.silver}${name.slice(0, 34)}${R}`)
          push(`    ${pipeline(e?.stage || 'planning')}`)
          if (e?.desc) push(`    ${_.dark}${e.desc.slice(0, 52)}${R}`)
          else push('')
        }
      } else {
        push(`  ${_.dark}⟨◈⟩ Idle — aucune tâche en cours${R}`)
        push('')
        push('')
      }

      push(`  ${_.dark}${'─'.repeat(W)}${R}`)

      // Queue (next 3)
      if (files.queue.length) {
        push(`  ${_.cyan}QUEUE (${files.queue.length})${R}`)
        for (const name of files.queue.slice(0, 3))
          push(`  ${_.dark}· ${_.grey}${name.slice(0, 52)}${R}`)
        if (files.queue.length > 3) push(`  ${_.dark}  … +${files.queue.length - 3} de plus${R}`)
      } else {
        push(`  ${_.dark}Queue vide${R}`)
      }

      push(`  ${_.dark}${'─'.repeat(W)}${R}`)

      // Done (last 6) — fallback sur les fichiers si pas de status JSON
      const doneFromStatus = status.filter(t => t.status === 'DONE').slice(-6).reverse()
      const doneList = doneFromStatus.length
        ? doneFromStatus.map(t => ({ name: t.name, dur: t.dur ? `${t.dur}s` : '—', live: !!t.stages?.live }))
        : files.done.slice(-6).reverse().map(n => ({ name: n, dur: '—', live: true }))

      push(`  ${_.green}DONE (${files.done.length})${R}`)
      for (const t of doneList) {
        const liveCol = t.live ? _.green : _.amber
        const liveTag = t.live ? 'LIVE' : 'DONE'
        push(`  ${_.dark}✓ ${_.silver}${t.name.slice(0, 32).padEnd(32)}${R} ${_.dark}${t.dur.padStart(5)}${R}  ${liveCol}${liveTag}${R}`)
      }

      // Errors
      if (files.error.length) {
        push(`  ${_.dark}${'─'.repeat(W)}${R}`)
        push(`  ${_.red}ERRORS (${files.error.length})${R}`)
        const errs = status.filter(t => t.status === 'ERROR').slice(-3).reverse()
        for (const t of errs)
          push(`  ${_.red}✗ ${_.dark}${t.name.slice(0, 30).padEnd(30)}${R}  ${_.red}${(t.error || '').slice(0, 22)}${R}`)
      }

      // Render fixed-height panel
      if (!firstDraw) process.stdout.write(`\x1b[${ROWS}A\x1b[0J`)
      else firstDraw = false

      for (let i = 0; i < ROWS; i++)
        process.stdout.write(BG + (rows[i] ?? '') + '\x1b[K\n')

      if (active) await sl(2000)
    }

    process.removeListener('SIGINT', onSigint)
    line()
    line(`  ${_.dark}⟨◈⟩ Task tracker fermé.${R}`)
    line()
    return
  }

  // ── /watch — live server monitor ─────────────────────────────────────────────
  if (c === '/watch') {
    const DASH = `http://62.238.12.221:4000`
    const PASS = process.env.DASHBOARD_PASS || 'trackr2024'
    const authHeader = 'Basic ' + Buffer.from('admin:' + PASS).toString('base64')

    line()
    line(`  ${_.green}${_.bold}╔══ LIVE SERVER WATCH ═══════════════════════════════╗${R}`)
    line(`  ${_.green}║${R}  ${_.grey}Polling ${DASH} toutes les 4s${R}`)
    line(`  ${_.green}║${R}  ${_.dark}Ctrl+C pour quitter${R}`)
    line(`  ${_.green}╚════════════════════════════════════════════════════╝${R}`)
    line()

    const ROWS = 14  // lignes du panel à effacer à chaque refresh
    let firstDraw = true
    let running = true

    // Capture Ctrl+C
    const onSigint = () => { running = false }
    process.once('SIGINT', onSigint)

    const clearPanel = () => {
      if (firstDraw) { firstDraw = false; return }
      process.stdout.write(`\x1b[${ROWS}A\x1b[0J`)
    }

    const drawPanel = (status, logs) => {
      clearPanel()
      const procs = status?.processes || []
      const tasks = status?.tasks || []
      const done  = tasks.filter(t => t.endsWith('.done')).length
      const queue = tasks.filter(t => t.endsWith('.txt')).length
      const running_t = tasks.filter(t => t.endsWith('.running'))
      const errors = tasks.filter(t => t.endsWith('.error')).length
      const W = 52

      // Ligne 1 : timestamp
      const ts = new Date().toLocaleTimeString('fr-FR')
      out(`\n  ${_.dark}${ts}${R}  ${_.green}● LIVE${R}  ${_.dark}uptime: ${status?.uptime || '—'}  RAM: ${status?.mem || '—'}${R}\n`)

      // Ligne 2-3 : processes
      for (const p of procs) {
        const on = p.status === 'online'
        const col = on ? _.green : _.red
        const st  = on ? '● ONLINE ' : '○ OFFLINE'
        out(`  ${col}${st}${R}  ${_.silver}${p.name.padEnd(16)}${R}  ${_.dark}CPU ${String(p.cpu).padStart(3)}%  RAM ${p.mem}  ↺ ${p.restarts}${R}\n`)
      }

      // Ligne 4 : stats tâches
      out(`\n  ${_.dark}┌──────────────────────────────────────────────────┐${R}\n`)
      out(`  ${_.dark}│${R}  ${_.white}DONE${R} ${_.green}${String(done).padEnd(5)}${R}  ${_.white}QUEUE${R} ${_.cyan}${String(queue).padEnd(4)}${R}  ${_.white}RUN${R} ${_.amber}${String(running_t.length).padEnd(4)}${R}  ${_.white}ERR${R} ${_.red}${String(errors).padEnd(4)}${R}  ${_.dark}│${R}\n`)
      out(`  ${_.dark}└──────────────────────────────────────────────────┘${R}\n`)

      // Ligne 5 : tâche en cours
      if (running_t.length) {
        const t = running_t[0].replace(/\.running$/, '')
        out(`  ${_.amber}⟳ EN COURS :${R} ${_.silver}${t.slice(0, 46)}${R}\n`)
      } else if (queue) {
        const t = tasks.filter(f => f.endsWith('.txt'))[0].replace(/\.txt$/, '')
        out(`  ${_.cyan}⏳ PROCHAINE :${R} ${_.dark}${t.slice(0, 44)}${R}\n`)
      } else {
        out(`  ${_.dark}⟨◈⟩ Génération prochaine vague…${R}\n`)
      }

      // Lignes 6-12 : derniers logs
      out(`\n`)
      const lines = (logs || []).slice(-6)
      for (const l of lines) {
        const col = l.includes('pushed') ? _.green : l.includes('ERROR') ? _.red : l.includes('review') ? _.silver : l.includes('TASK') ? _.grey : _.dark
        out(`  ${col}${l.replace(/\x1b\[[0-9;]*m/g,'').slice(0,W)}${R}\n`)
      }
      // Padding pour avoir toujours ROWS lignes fixes
      const filled = 2 + procs.length + 5 + lines.length
      for (let i = filled; i < ROWS; i++) out('\n')
    }

    while (running) {
      try {
        const [sRes, lRes] = await Promise.all([
          fetch(`${DASH}/api/status`, { headers: { Authorization: authHeader }, signal: AbortSignal.timeout(5000) }).catch(() => null),
          fetch(`${DASH}/api/logs?which=daemon`, { headers: { Authorization: authHeader }, signal: AbortSignal.timeout(5000) }).catch(() => null),
        ])
        const status = sRes?.ok ? await sRes.json().catch(() => null) : null
        const logData = lRes?.ok ? await lRes.json().catch(() => null) : null

        if (!status) {
          clearPanel()
          out(`\n  ${_.red}✗ Dashboard inaccessible — vérifie que le serveur tourne${R}\n`)
          out(`  ${_.dark}Retry dans 4s… (Ctrl+C pour quitter)${R}\n\n`)
          firstDraw = false
        } else {
          drawPanel(status, logData?.lines)
        }
      } catch {}
      await sl(4000)
    }

    process.removeListener('SIGINT', onSigint)
    line()
    line(`  ${_.dark}⟨◈⟩ Watch terminé.${R}`)
    line()
    return
  }

  // ── /daemon ──────────────────────────────────────────────────────────────────
  if (c === '/daemon') {
    await startDaemon()
    return
  }

  // ── /feed [channel] ──────────────────────────────────────────────────────────
  if (c === '/feed') {
    await showFeed(arg || 'andy-chat')
    return
  }

  // ── /monitor ─────────────────────────────────────────────────────────────────
  if (c === '/monitor') {
    spinStart('Lancement monitor…', _.blue)
    try {
      const r = await fetch(`${APP_URL}/api/monitor?force=true`, {
        headers: CRON_SECRET ? { 'x-cron-secret': CRON_SECRET } : {},
        signal: AbortSignal.timeout(15000),
      })
      spinStop()
      const d = await r.json().catch(() => ({}))
      if (r.ok) {
        line(`  ${_.green}✓ Monitor lancé${R}  ${_.grey}${d.message || ''}${R}`)
        if (d.issues?.length) {
          line(`  ${_.amber}⚠ Issues détectées : ${d.issues.length}${R}`)
          for (const issue of d.issues.slice(0, 5))
            line(`  ${_.dark}  · ${_.silver}${String(issue).slice(0, 70)}${R}`)
        }
      } else {
        line(`  ${_.red}✗ Erreur ${r.status}${R}`)
      }
    } catch (e) { spinStop(); line(`  ${_.red}✗ ${e.message}${R}`) }
    line(); return
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

// ── Connexions au démarrage ───────────────────────────────────────────────────
async function showConnections() {
  // Check tout en parallèle
  const [vercelR, discordR, memR] = await Promise.allSettled([
    fetch(`${APP_URL}/api/memory?limit=1`, { signal: AbortSignal.timeout(5000) }),
    BOT_TOKEN && GUILD_ID
      ? fetch(`${DISCORD_API}/guilds/${GUILD_ID}`, { headers: { Authorization: `Bot ${BOT_TOKEN}` }, signal: AbortSignal.timeout(5000) })
      : Promise.resolve(null),
    fetch(`${APP_URL}/api/memory?type=improvement&limit=3`, { signal: AbortSignal.timeout(6000) }),
  ])

  const vercelOk  = vercelR.status === 'fulfilled' && vercelR.value?.ok
  const discordOk = discordR.status === 'fulfilled' && discordR.value?.ok
  const guild     = discordOk ? await discordR.value.json().catch(() => ({})) : null

  // Derniers updates IA
  const memData   = memR.status === 'fulfilled' ? await memR.value?.json().catch(() => null) : null
  const updates   = (memData?.entries || []).filter(e => e.applied).slice(0, 2)

  line(`  ${_.dark}╔══ CONNEXIONS ══════════════════════════════════════╗`)
  line(`  ${_.dark}║${R}  ${vercelOk ? _.green+'●' : _.red+'○'}${R} ${_.grey}Trackr App${R}       ${vercelOk ? _.green+'ONLINE' : _.red+'OFFLINE'}${R}  ${_.dark}${APP_URL.replace('https://','')}`)
  line(`  ${_.dark}║${R}  ${discordOk ? _.cyan+'●' : _.amber+'○'}${R} ${_.grey}Discord${R}          ${discordOk ? _.cyan+'CONNECTÉ' : _.amber+(BOT_TOKEN ? 'ERREUR' : 'non configuré')}${R}${guild ? `  ${_.dark}${guild.name}` : ''}`)
  if (discordOk) {
    line(`  ${_.dark}║${R}  ${_.dark}  └ ${CH_STOCKS ? _.green+'#market-scanner ✓' : _.grey+'market-scanner: ?'}  ${CH_CRYPTO ? _.cyan+'#crypto ✓' : _.grey+'crypto: ?'}${R}`)
  }
  line(`  ${_.dark}║${R}  ${_.purple}●${R} ${_.grey}Claude${R}           ${API_KEY ? _.green+'ONLINE' : _.red+'OFFLINE'}${R}  ${_.dark}${process.env._CLI_MODEL || 'claude-sonnet-4-6'}`)
  line(`  ${_.dark}╚════════════════════════════════════════════════════╝`)
  line()

  if (updates.length) {
    line(`  ${_.purple}${_.bold}╔══ DERNIERS UPDATES IA ═════════════════════════════╗`)
    for (const e of updates) {
      const ts = e.createdAt ? new Date(e.createdAt).toLocaleString('fr-FR', { day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit' }) : ''
      line(`  ${_.purple}║${R}  ${_.cyan}${_.bold}${(e.focus || 'fix').padEnd(12)}${R}  ${_.silver}${(e.problem || e.commit || '').slice(0, 38)}${R}`)
      if (ts) line(`  ${_.purple}║${R}  ${_.dark}${(e.file || '').slice(0,30).padEnd(30)}  ${ts}${R}`)
    }
    line(`  ${_.purple}╚═════════════════════════════════════════════════════╝`)
    line()
  }
}

// ── /feed — derniers messages Discord ────────────────────────────────────────
async function showFeed(channelName = 'andy-chat') {
  if (!BOT_TOKEN || !GUILD_ID) {
    line(`  ${_.amber}⚠ DISCORD_BOT_TOKEN / DISCORD_GUILD_ID manquants dans .env${R}`)
    return
  }
  spinStart(`Chargement #${channelName}…`, _.cyan)
  try {
    const chId = await findDiscordChannel(channelName)
    if (!chId) { spinStop(); line(`  ${_.amber}⚠ Channel #${channelName} introuvable${R}`); return }
    const r = await fetch(`${DISCORD_API}/channels/${chId}/messages?limit=8`, {
      headers: { Authorization: `Bot ${BOT_TOKEN}` },
      signal: AbortSignal.timeout(6000),
    })
    spinStop()
    if (!r.ok) { line(`  ${_.red}✗ Discord ${r.status}${R}`); return }
    const msgs = await r.json().catch(() => [])
    line()
    line(`  ${_.cyan}${_.bold}╔══ #${channelName.toUpperCase()} ════════════════════════════════`)
    for (const m of [...msgs].reverse()) {
      const ts  = new Date(m.timestamp).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
      const who = m.author?.bot ? `${_.purple}AnDy` : `${_.orange}${m.author?.username || '?'}`
      line(`  ${_.cyan}║${R}  ${who}${R}  ${_.dark}${ts}${R}`)
      line(`  ${_.cyan}║${R}  ${_.silver}${(m.content || '').slice(0, 70)}${R}`)
    }
    line(`  ${_.cyan}╚${'═'.repeat(52)}`)
    line()
  } catch (e) { spinStop(); line(`  ${_.red}✗ ${e.message}${R}`) }
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

  // Connexions + derniers updates IA
  await showConnections()

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
