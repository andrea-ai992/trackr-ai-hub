#!/usr/bin/env node
import http from 'http'
import { exec } from 'child_process'
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { randomBytes } from 'crypto'

const __dir  = dirname(fileURLToPath(import.meta.url))
const ROOT   = resolve(__dir, '..')
const PORT   = process.env.DASHBOARD_PORT || 4000
const PASS   = process.env.DASHBOARD_PASS || 'trackr2024'
const TASKS  = resolve(ROOT, 'andy-tasks')
const LOG_D  = '/root/logs/andy-daemon.log'
const LOG_B  = '/root/logs/discord-bot.log'

// Charge .env si ANTHROPIC_API_KEY pas encore définie
if (!process.env.ANTHROPIC_API_KEY) {
  for (const f of ['.env', '.env.local']) {
    const fp = resolve(ROOT, f)
    if (existsSync(fp)) {
      readFileSync(fp, 'utf8').split('\n').forEach(l => {
        const m = l.match(/^([^#=\s][^=]*)=(.*)$/)
        if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
      })
    }
  }
}

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || ''
const GITHUB_REPO   = process.env.GITHUB_REPO || 'andrea-ai992/trackr-ai-hub'
const APP_URL       = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

const run = cmd => new Promise(r => exec(cmd, (_e, o) => r(o?.trim() || '')))

// ── Sessions + historique chat ────────────────────────────────────────────────
const sessions = new Map()  // token → { ts, history: [] }
function newSession() {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, { ts: Date.now(), history: [] })
  return token
}
function getSession(req) {
  const cookie = req.headers.cookie || ''
  const m = cookie.match(/session=([a-f0-9]{64})/)
  if (!m) return null
  const s = sessions.get(m[1])
  if (!s) return null
  if (Date.now() - s.ts > 8 * 60 * 60 * 1000) { sessions.delete(m[1]); return null }
  s.ts = Date.now()
  return { token: m[1], session: s }
}
function validSession(req) { return !!getSession(req) }

// ── HTML ──────────────────────────────────────────────────────────────────────
const LOGIN_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AnDy Dev — Login</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080808;color:#e0e0e0;font-family:'SF Mono',monospace;min-height:100vh;display:flex;align-items:center;justify-content:center}
.box{width:100%;max-width:360px;padding:40px;background:#0f0f0f;border:1px solid #1a1a1a;border-radius:16px}
.logo{text-align:center;margin-bottom:32px}
.logo-icon{font-size:32px;margin-bottom:8px}
.logo-text{color:#00ff88;font-size:18px;font-weight:700;letter-spacing:.15em}
.logo-sub{color:#333;font-size:11px;margin-top:4px;letter-spacing:.1em}
.field{margin-bottom:16px}
label{display:block;color:#555;font-size:10px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:6px}
input{width:100%;background:#111;border:1px solid #1a1a1a;border-radius:8px;padding:12px 14px;color:#e0e0e0;font-size:14px;font-family:inherit;outline:none;transition:.2s}
input:focus{border-color:rgba(0,255,136,.4);box-shadow:0 0 0 3px rgba(0,255,136,.06)}
.btn{width:100%;padding:13px;background:#00ff88;color:#080808;border:none;border-radius:8px;font-size:13px;font-weight:700;cursor:pointer;letter-spacing:.05em;margin-top:8px;transition:.15s}
.btn:hover{background:#00cc66;transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.error{color:#ef4444;font-size:11px;text-align:center;margin-top:12px;display:none}
.info{color:#333;font-size:10px;text-align:center;margin-top:20px}
</style>
</head>
<body>
<div class="box">
  <div class="logo">
    <div class="logo-icon">⟨◈⟩</div>
    <div class="logo-text">ANDY DEV</div>
    <div class="logo-sub">Hetzner CX22 · 62.238.12.221</div>
  </div>
  <form method="POST" action="/login" onsubmit="document.querySelector('.btn').textContent='...'">
    <div class="field">
      <label>Mot de passe</label>
      <input type="password" name="pass" placeholder="••••••••••" autofocus autocomplete="current-password">
    </div>
    <button class="btn" type="submit">Accéder au dashboard</button>
    <div class="error" id="err">Mot de passe incorrect</div>
  </form>
  <div class="info">Session 8h · Connexion chiffrée</div>
</div>
</body>
</html>`

const VIBE_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AnDy Dev">
<meta name="theme-color" content="#050505">
<title>AnDy Dev</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{--bg:#050505;--bg2:#0d0d0d;--bg3:#141414;--border:#1e1e1e;--green:#00ff88;--cyan:#00d4ff;--purple:#a78bfa;--amber:#fbbf24;--red:#ef4444;--text:#efefef;--dim:#3a3a3a;--dim2:#555}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,'SF Pro Text',ui-sans-serif,sans-serif;overflow:hidden}
.app{display:flex;flex-direction:column;height:100dvh;max-width:430px;margin:0 auto;position:relative}

/* ── Header ── */
.hdr{padding:calc(env(safe-area-inset-top,0px) + 14px) 20px 14px;background:rgba(5,5,5,.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-bottom:1px solid var(--border);flex-shrink:0;display:flex;align-items:center;justify-content:space-between;position:relative;z-index:10}
.hdr-l{display:flex;align-items:center;gap:10px}
.pulse{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 10px var(--green);animation:pulse 2s infinite;flex-shrink:0}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.35;transform:scale(.75)}}
.hdr-title{font-size:16px;font-weight:700;color:var(--green);letter-spacing:.04em}
.hdr-sub{font-size:11px;color:var(--dim2);margin-top:2px;font-variant-numeric:tabular-nums}
.hdr-badge{background:rgba(0,255,136,.12);border:1px solid rgba(0,255,136,.2);color:var(--green);font-size:10px;padding:3px 8px;border-radius:20px;font-weight:600;letter-spacing:.04em}

/* ── Scrollable content ── */
.view{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;display:none;scroll-padding-bottom:24px;min-height:0}
.view.on{display:flex;flex-direction:column}
.pad{padding:16px 16px 24px}

/* ── Cards ── */
.card{background:var(--bg2);border:1px solid var(--border);border-radius:18px;padding:16px;margin-bottom:12px}
.card-hd{font-size:10px;color:var(--dim2);letter-spacing:.12em;text-transform:uppercase;font-weight:600;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center}
.card-hd span{color:var(--text);font-size:13px;font-weight:600;letter-spacing:0;text-transform:none}
.rbtn{background:transparent;border:none;color:var(--dim2);cursor:pointer;font-size:15px;line-height:1;padding:2px 4px;border-radius:6px;transition:.15s}
.rbtn:active{background:var(--border);color:var(--text)}

/* ── Stats ── */
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:4px}
.stat{background:var(--bg3);border-radius:14px;padding:12px 6px;text-align:center;border:1px solid var(--border)}
.stat-n{font-size:24px;font-weight:700;line-height:1;font-variant-numeric:tabular-nums}
.stat-l{font-size:9px;color:var(--dim2);margin-top:4px;letter-spacing:.08em;font-weight:500}

/* ── Pipeline ── */
.pipeline{display:flex;align-items:center;gap:3px;flex-wrap:wrap;margin-top:8px}
.stage{padding:4px 9px;border-radius:8px;background:var(--bg3);color:var(--dim2);font-size:9px;letter-spacing:.05em;font-weight:600;border:1px solid var(--border)}
.stage.done{color:var(--green);background:rgba(0,255,136,.07);border-color:rgba(0,255,136,.15)}
.stage.cur{color:var(--amber);background:rgba(251,191,36,.08);border-color:rgba(251,191,36,.2);font-weight:700}
.arrow{color:var(--dim);font-size:10px}

/* ── Queue items ── */
.q-item{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--border)}
.q-item:last-child{border-bottom:none}
.q-dot{width:6px;height:6px;border-radius:50%;background:var(--purple);flex-shrink:0}
.q-name{font-size:12px;color:var(--dim2);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}

/* ── Commits ── */
.commit{display:flex;gap:10px;padding:12px 0;border-bottom:1px solid var(--border);align-items:flex-start}
.commit:last-child{border-bottom:none}
.sha{font-size:10px;color:var(--cyan);font-family:'SF Mono',monospace;flex-shrink:0;background:rgba(0,212,255,.07);padding:3px 7px;border-radius:6px;margin-top:1px}
.commit-msg{font-size:13px;color:var(--text);line-height:1.4;flex:1;overflow:hidden}
.commit-meta{font-size:10px;color:var(--dim2);margin-top:3px}

/* ── Logs ── */
.log-wrap{background:var(--bg3);border-radius:12px;padding:10px;font-family:'SF Mono',ui-monospace,monospace;max-height:420px;overflow-y:auto}
.log-line{font-size:10px;padding:2px 0;line-height:1.7;border-bottom:1px solid rgba(255,255,255,.025);color:var(--dim2);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.log-line.push{color:var(--green)}
.log-line.err{color:var(--red)}
.log-line.task{color:var(--purple)}
.log-line.rev{color:var(--cyan)}

/* ── Task form ── */
.task-card{background:var(--bg2);border:1px solid rgba(0,255,136,.15);border-radius:18px;padding:16px;margin-bottom:12px}
.task-card textarea{width:100%;background:var(--bg3);border:1px solid var(--border);border-radius:14px;padding:12px 14px;color:var(--text);font-size:14px;font-family:inherit;resize:none;outline:none;min-height:90px;transition:.2s;-webkit-overflow-scrolling:touch;line-height:1.5}
.task-card textarea:focus{border-color:rgba(0,255,136,.35);box-shadow:0 0 0 3px rgba(0,255,136,.05)}
.task-card textarea::placeholder{color:var(--dim2)}
.send-btn{margin-top:10px;width:100%;padding:14px;background:var(--green);color:#050505;border:none;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:.15s;letter-spacing:.03em}
.send-btn:active{background:#00cc66;transform:scale(.98)}

/* ── Quick chips ── */
.chips{display:flex;gap:7px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;padding-bottom:2px;margin-bottom:12px}
.chips::-webkit-scrollbar{display:none}
.chip{background:var(--bg2);border:1px solid var(--border);color:var(--dim2);font-size:11px;padding:7px 13px;border-radius:20px;white-space:nowrap;cursor:pointer;flex-shrink:0;font-family:inherit;transition:.15s}
.chip:active{background:rgba(0,255,136,.08);border-color:rgba(0,255,136,.2);color:var(--green)}

/* ── Bottom nav ── */
.bnav{flex-shrink:0;padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));background:rgba(5,5,5,.9);backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border-top:1px solid var(--border)}
.bnav-inner{display:flex;gap:6px;background:var(--bg2);border:1px solid var(--border);border-radius:22px;padding:5px}
.btab{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;padding:8px 6px;border-radius:17px;background:transparent;border:none;cursor:pointer;transition:.2s;font-family:inherit}
.btab.on{background:rgba(0,255,136,.1)}
.btab:active{background:rgba(0,255,136,.06)}
.btab-icon{font-size:18px;line-height:1}
.btab-lbl{font-size:9px;letter-spacing:.06em;color:var(--dim2);font-weight:500;transition:.15s}
.btab.on .btab-lbl{color:var(--green)}

/* ── Misc ── */
.empty{text-align:center;padding:48px 20px;color:var(--dim2);font-size:13px}
.running-pill{display:inline-flex;align-items:center;gap:6px;background:rgba(251,191,36,.08);border:1px solid rgba(251,191,36,.18);border-radius:10px;padding:6px 10px;font-size:11px;color:var(--amber);margin-bottom:10px;width:100%;overflow:hidden}
.running-pill span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1}
</style>
</head>
<body>
<div class="app">

  <!-- Header -->
  <div class="hdr">
    <div class="hdr-l">
      <div class="pulse"></div>
      <div>
        <div class="hdr-title">⟨◈⟩ AnDy Dev</div>
        <div class="hdr-sub" id="hdr-sub">Chargement…</div>
      </div>
    </div>
    <div class="hdr-badge" id="hdr-badge">LIVE</div>
  </div>

  <!-- LIVE -->
  <div class="view on pad" id="v-live">
    <div class="card">
      <div class="card-hd">Statut <button class="rbtn" onclick="loadLive()">↺</button></div>
      <div class="stats">
        <div class="stat"><div class="stat-n" id="v-done" style="color:var(--green)">—</div><div class="stat-l">DONE</div></div>
        <div class="stat"><div class="stat-n" id="v-queue" style="color:var(--purple)">—</div><div class="stat-l">QUEUE</div></div>
        <div class="stat"><div class="stat-n" id="v-run" style="color:var(--amber)">—</div><div class="stat-l">RUN</div></div>
        <div class="stat"><div class="stat-n" id="v-err" style="color:var(--red)">—</div><div class="stat-l">ERR</div></div>
      </div>
    </div>

    <div class="card">
      <div class="card-hd">Pipeline</div>
      <div id="v-pipeline"><div style="color:var(--dim2);font-size:12px">Idle…</div></div>
    </div>

    <div class="card">
      <div class="card-hd">Queue <span id="v-qcount" style="color:var(--purple);font-size:12px"></span></div>
      <div id="v-queuelist"><div style="color:var(--dim);font-size:12px">Vide</div></div>
    </div>
  </div>

  <!-- COMMITS -->
  <div class="view pad" id="v-commits">
    <div class="card">
      <div class="card-hd">Commits récents <button class="rbtn" onclick="loadCommits()">↺</button></div>
      <div id="commits-list"><div class="empty">Chargement…</div></div>
    </div>
  </div>

  <!-- TASK -->
  <div class="view pad" id="v-task">
    <!-- Chips -->
    <div class="chips">
      <button class="chip" onclick="setTask('Redesign page Sports style ESPN dark stadium, scores animés')">🏟 Sports</button>
      <button class="chip" onclick="setTask('Redesign page Markets style Bloomberg terminal, candlestick charts')">📈 Markets</button>
      <button class="chip" onclick="setTask('Redesign Dashboard — hero portfolio neon, movers scroll, Fear&Greed gauge')">🏠 Dashboard</button>
      <button class="chip" onclick="setTask('Optimiser les performances — code splitting, LCP < 1.5s')">⚡ Perf</button>
      <button class="chip" onclick="setTask('Redesign page News style Apple News, cards avec image cover')">📰 News</button>
      <button class="chip" onclick="setTask('Audit sécurité complet — XSS, CSRF, headers HTTP')">🔒 Sécu</button>
      <button class="chip" onclick="setTask('Améliore le design global — dark neon #00ff88, animations fluides')">✨ Design</button>
    </div>

    <!-- Form -->
    <div class="task-card">
      <div class="card-hd" style="margin-bottom:10px">Nouvelle tâche pour AnDy</div>
      <textarea id="task-txt" placeholder="Décris ce qu'AnDy doit développer ou améliorer…"></textarea>
      <button class="send-btn" id="send-btn" onclick="submitTask()">Envoyer à AnDy →</button>
      <!-- Confirmation réception -->
      <div id="task-confirm" style="display:none;margin-top:10px;padding:10px 14px;border-radius:12px;font-size:12px;text-align:center"></div>
    </div>

    <!-- Statut des tâches reçues -->
    <div class="card" style="margin-top:4px">
      <div class="card-hd">Statut des tâches <button class="rbtn" onclick="loadTaskStatus()">↺</button></div>
      <div id="task-status-list"><div class="empty" style="padding:16px 0">Chargement…</div></div>
    </div>

    <!-- Logs en dessous -->
    <div class="card" style="margin-top:4px">
      <div class="card-hd">Logs daemon <button class="rbtn" onclick="loadTaskLogs()">↺</button></div>
      <div class="log-wrap" id="task-logs-list" style="max-height:220px"><div style="color:var(--dim2);font-size:10px;font-family:monospace">Chargement…</div></div>
    </div>
  </div>

  <!-- LOGS -->
  <div class="view pad" id="v-logs">
    <div class="card">
      <div class="card-hd">Logs daemon <button class="rbtn" onclick="loadLogs()">↺</button></div>
      <div class="log-wrap" id="logs-list"><div class="empty">Chargement…</div></div>
    </div>
  </div>

  <!-- Bottom nav -->
  <div class="bnav">
    <div class="bnav-inner">
      <button class="btab on" id="bt-live" onclick="tab('live')"><div class="btab-icon">⚡</div><div class="btab-lbl">LIVE</div></button>
      <button class="btab" id="bt-commits" onclick="tab('commits')"><div class="btab-icon">📦</div><div class="btab-lbl">COMMITS</div></button>
      <button class="btab" id="bt-task" onclick="tab('task')"><div class="btab-icon">➕</div><div class="btab-lbl">TÂCHE</div></button>
      <button class="btab" id="bt-logs" onclick="tab('logs')"><div class="btab-icon">📋</div><div class="btab-lbl">LOGS</div></button>
    </div>
  </div>

</div>
<script>
let curTab = 'live'
const STAGES = ['planning','generating','testing','safe','live']

async function loadLive() {
  try {
    const r = await fetch('/api/tasks')
    const d = await r.json()
    const f = d.files||{}, s = d.status||[]
    const done=(f.done||[]).length, queue=(f.queue||[]).length, run=(f.running||[]).length, err=(f.error||[]).length
    document.getElementById('v-done').textContent = done
    document.getElementById('v-queue').textContent = queue
    document.getElementById('v-run').textContent = run
    document.getElementById('v-err').textContent = err
    document.getElementById('hdr-sub').textContent = 'DONE '+done+' · QUEUE '+queue+' · '+new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})
    document.getElementById('hdr-badge').textContent = run > 0 ? '● ACTIF' : 'IDLE'
    document.getElementById('hdr-badge').style.color = run > 0 ? 'var(--green)' : 'var(--dim2)'

    const running = f.running||[]
    const pipeEl = document.getElementById('v-pipeline')
    if (running.length) {
      const e = s.find(t=>t.name===running[0])
      const curIdx = STAGES.indexOf(e?.stage||'planning')
      const pipe = STAGES.map((st,i)=>{
        const cls=i<curIdx?'done':i===curIdx?'cur':''
        return \`<span class="stage \${cls}">\${st}</span>\`
      }).join('<span class="arrow"> › </span>')
      pipeEl.innerHTML = \`<div class="running-pill"><span>⟳ \${running[0].replace('.running','').slice(0,50)}</span></div><div class="pipeline">\${pipe}</div>\`
      if (e?.desc) pipeEl.innerHTML += \`<div style="font-size:11px;color:var(--dim2);margin-top:8px;line-height:1.5">\${e.desc.slice(0,80)}</div>\`
    } else {
      pipeEl.innerHTML = '<div style="color:var(--dim2);font-size:12px">⟨◈⟩ Idle — en attente de tâches…</div>'
    }

    const q = f.queue||[]
    document.getElementById('v-qcount').textContent = q.length ? q.length : ''
    document.getElementById('v-queuelist').innerHTML = q.length
      ? q.slice(0,6).map(n=>\`<div class="q-item"><div class="q-dot"></div><div class="q-name">\${n.replace('.txt','').slice(0,52)}</div></div>\`).join('')+(q.length>6?'<div style="color:var(--dim2);font-size:11px;padding:8px 0 0">+\${q.length-6} de plus</div>':'')
      : '<div style="color:var(--dim);font-size:12px">Queue vide</div>'
  } catch(e) {
    document.getElementById('hdr-sub').textContent = '⚠ Serveur inaccessible'
  }
}

async function loadCommits() {
  const el = document.getElementById('commits-list')
  el.innerHTML = '<div class="empty">Chargement…</div>'
  try {
    const r = await fetch('/api/commits')
    const commits = await r.json()
    el.innerHTML = commits.map(c => {
      const msg = c.commit.message.split('\\n')[0]
      const sha = c.sha.slice(0,7)
      const date = new Date(c.commit.author.date).toLocaleString('fr-FR',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})
      const isAndy = msg.includes('[AnDy]')
      return \`<div class="commit">
        <div class="sha">\${sha}</div>
        <div style="flex:1;min-width:0">
          <div class="commit-msg" style="color:\${isAndy?'var(--green)':'var(--text)'}">\${msg.slice(0,68).replace(/</g,'&lt;')}</div>
          <div class="commit-meta">\${date}\${isAndy?' · AnDy':''}</div>
        </div>
      </div>\`
    }).join('')
  } catch(e) { el.innerHTML = '<div class="empty">Erreur GitHub</div>' }
}

async function loadLogs() {
  const el = document.getElementById('logs-list')
  el.innerHTML = '<div style="color:var(--dim2);font-size:10px;font-family:monospace;padding:4px">Chargement…</div>'
  try {
    const r = await fetch('/api/logs?which=daemon')
    const d = await r.json()
    const lines = (d.lines||[]).slice(-60).reverse()
    el.innerHTML = lines.map(l => {
      const cls = l.includes('pushed')||l.includes('DONE')?'push':l.includes('ERROR')?'err':l.includes('TASK')||l.includes('tâche')?'task':l.includes('review')||l.includes('commit')?'rev':''
      return \`<div class="log-line \${cls}">\${l.replace(/</g,'&lt;').slice(0,100)}</div>\`
    }).join('')
  } catch(e) { el.innerHTML = '<div style="color:var(--red);font-size:11px;font-family:monospace">Logs inaccessibles</div>' }
}

function setTask(text) {
  document.getElementById('task-txt').value = text
  tab('task')
  document.getElementById('task-txt').focus()
}

async function submitTask() {
  const v = document.getElementById('task-txt').value.trim()
  if (!v) return
  const btn = document.getElementById('send-btn')
  const confirm = document.getElementById('task-confirm')
  btn.textContent = '…'; btn.disabled = true
  try {
    const r = await fetch('/api/task',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({desc:v})})
    document.getElementById('task-txt').value = ''
    btn.textContent = '✅ Envoyée !'; btn.style.background = '#00cc66'
    confirm.style.display = 'block'
    confirm.style.background = 'rgba(0,255,136,.08)'
    confirm.style.color = 'var(--green)'
    confirm.style.border = '1px solid rgba(0,255,136,.2)'
    confirm.textContent = r.ok ? '✅ Tâche reçue par le serveur — AnDy va la traiter en priorité' : '⚠ Serveur a répondu avec une erreur'
    setTimeout(()=>{ btn.textContent='Envoyer à AnDy →'; btn.style.background='var(--green)'; btn.disabled=false; confirm.style.display='none'; loadTaskStatus() }, 2500)
  } catch(e) {
    btn.textContent = '⚠ Serveur inaccessible'; btn.disabled = false
    confirm.style.display = 'block'
    confirm.style.background = 'rgba(239,68,68,.08)'
    confirm.style.color = 'var(--red)'
    confirm.style.border = '1px solid rgba(239,68,68,.2)'
    confirm.textContent = '❌ Serveur inaccessible — vérifie que le daemon tourne'
    setTimeout(()=>{ btn.textContent='Envoyer à AnDy →'; confirm.style.display='none' }, 3000)
  }
}

function sIcon(s){ return s==='DONE'?'✅':s==='ERROR'?'❌':s==='RUNNING'?'⟳':s==='QUEUED'?'⏳':'·' }
function sColor(s){ return s==='DONE'?'var(--green)':s==='ERROR'?'var(--red)':s==='RUNNING'?'var(--amber)':'var(--dim2)' }

async function loadTaskStatus() {
  const el = document.getElementById('task-status-list')
  try {
    const r = await fetch('/api/tasks')
    const d = await r.json()
    const f = d.files||{}, s = d.status||[]
    const running = (f.running||[]).map(n=>s.find(x=>x.name===n.replace('.running',''))||{name:n.replace('.running',''),status:'RUNNING'})
    const queued  = (f.queue||[]).map(n=>({name:n.replace('.txt',''),status:'QUEUED'}))
    const done    = s.filter(x=>x.status==='DONE'||x.status==='ERROR').slice(-8).reverse()
    const all = [...running,...queued,...done]
    if (!all.length) { el.innerHTML='<div class="empty" style="padding:12px 0">Aucune tâche</div>'; return }
    el.innerHTML = all.map(t=>\`<div style="display:flex;align-items:flex-start;gap:8px;padding:9px 0;border-bottom:1px solid var(--border)">
      <span style="font-size:13px;flex-shrink:0;margin-top:1px">\${sIcon(t.status)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-size:11px;color:var(--text);font-family:monospace;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${t.name}</div>
        \${t.desc?\`<div style="font-size:10px;color:var(--dim2);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">\${t.desc.slice(0,60)}</div>\`:''}
        \${(t.files||[]).length?\`<div style="margin-top:3px">\${t.files.map(f=>\`<span style="font-size:9px;background:rgba(0,212,255,.07);color:#00d4ff;padding:1px 5px;border-radius:4px;margin-right:3px">\${f.split('/').pop()}</span>\`).join('')}</div>\`:''}
      </div>
      <div style="font-size:10px;font-weight:700;color:\${sColor(t.status)};letter-spacing:.04em;flex-shrink:0">\${t.status}\${t.dur>0?' '+t.dur+'s':''}</div>
    </div>\`).join('')
  } catch(e){ el.innerHTML='<div class="empty" style="padding:12px 0;color:var(--red)">Serveur inaccessible</div>' }
}

async function loadTaskLogs() {
  const el = document.getElementById('task-logs-list')
  try {
    const r = await fetch('/api/logs?which=daemon')
    const d = await r.json()
    const lines = (d.lines||[]).slice(-30).reverse()
    el.innerHTML = lines.map(l=>{
      const col=l.includes('DONE')||l.includes('pushed')?'var(--green)':l.includes('ERROR')?'var(--red)':l.includes('TASK')||l.includes('tâche')?'var(--purple)':l.includes('build')?'var(--cyan)':'var(--dim2)'
      return \`<div class="log-line" style="color:\${col}">\${l.replace(/</g,'&lt;').slice(0,100)}</div>\`
    }).join('')
  } catch(e){ el.innerHTML='<div style="font-size:10px;color:var(--red);font-family:monospace">Logs inaccessibles</div>' }
}

loadLive()
setInterval(()=>{
  if(curTab==='live') loadLive()
  else if(curTab==='task'){ loadTaskStatus(); loadTaskLogs() }
}, 6000)

function tab(name) {
  curTab = name
  document.querySelectorAll('.btab').forEach(b => b.classList.remove('on'))
  document.querySelectorAll('.view').forEach(v => v.classList.remove('on'))
  document.getElementById('bt-'+name).classList.add('on')
  document.getElementById('v-'+name).classList.add('on')
  if (name==='live') loadLive()
  else if (name==='commits') loadCommits()
  else if (name==='logs') loadLogs()
  else if (name==='task') { loadTaskStatus(); loadTaskLogs() }
}
</script>
</body>
</html>`

const CHAT_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AnDy Chat">
<meta name="theme-color" content="#080808">
<title>AnDy Chat</title>
<style>
*{box-sizing:border-box;margin:0;padding:0;-webkit-tap-highlight-color:transparent}
:root{--bg:#080808;--bg2:#0f0f0f;--border:#1a1a1a;--green:#00ff88;--text:#e0e0e0;--dim:#555;--red:#ef4444}
html,body{height:100%;background:var(--bg);color:var(--text);font-family:-apple-system,'SF Pro Text',sans-serif;font-size:15px;overflow:hidden}
.app{display:flex;flex-direction:column;height:100%;height:100dvh;max-width:700px;margin:0 auto}
/* Header */
.hdr{background:rgba(8,8,8,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid var(--border);padding:env(safe-area-inset-top,12px) 16px 12px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;position:sticky;top:0;z-index:10}
.hdr-left{display:flex;align-items:center;gap:10px}
.pulse{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:p 2s infinite;flex-shrink:0}
@keyframes p{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.5;transform:scale(.8)}}
.hdr-title{font-weight:700;font-size:16px;letter-spacing:.05em;color:var(--green)}
.hdr-sub{font-size:11px;color:var(--dim);margin-top:1px}
.hdr-btns{display:flex;gap:8px}
.hdr-btn{background:transparent;border:1px solid var(--border);color:var(--dim);font-size:11px;padding:5px 10px;border-radius:8px;cursor:pointer;font-family:inherit}
.hdr-btn:active{background:var(--border)}
/* Messages */
.msgs{flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 12px;display:flex;flex-direction:column;gap:12px;scroll-behavior:smooth}
.msg{display:flex;flex-direction:column;max-width:82%}
.msg.user{align-self:flex-end;align-items:flex-end}
.msg.andy{align-self:flex-start;align-items:flex-start}
.bubble{padding:11px 14px;border-radius:18px;line-height:1.5;word-break:break-word;font-size:14px;white-space:pre-wrap}
.msg.user .bubble{background:var(--green);color:#080808;border-bottom-right-radius:4px;font-weight:500}
.msg.andy .bubble{background:var(--bg2);border:1px solid var(--border);color:var(--text);border-bottom-left-radius:4px}
.msg-time{font-size:10px;color:var(--dim);margin-top:3px;padding:0 4px}
/* Typing indicator */
.typing{display:flex;align-items:center;gap:4px;padding:12px 14px;background:var(--bg2);border:1px solid var(--border);border-radius:18px;border-bottom-left-radius:4px;width:fit-content}
.dot-t{width:6px;height:6px;border-radius:50%;background:var(--dim);animation:dt .8s infinite}
.dot-t:nth-child(2){animation-delay:.15s}
.dot-t:nth-child(3){animation-delay:.3s}
@keyframes dt{0%,60%,100%{transform:scale(1);opacity:.4}30%{transform:scale(1.3);opacity:1}}
/* Input bar */
.bar{background:rgba(8,8,8,.95);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-top:1px solid var(--border);padding:10px 12px;padding-bottom:calc(10px + env(safe-area-inset-bottom,0px));display:flex;gap:8px;align-items:flex-end;flex-shrink:0}
textarea{flex:1;background:var(--bg2);border:1px solid var(--border);border-radius:20px;padding:10px 14px;color:var(--text);font-size:15px;font-family:inherit;resize:none;outline:none;max-height:120px;min-height:42px;line-height:1.4;transition:.2s;overflow-y:auto;-webkit-overflow-scrolling:touch}
textarea:focus{border-color:rgba(0,255,136,.4)}
textarea::placeholder{color:var(--dim)}
.send{width:42px;height:42px;border-radius:50%;background:var(--green);border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:.15s;color:#080808}
.send:active{transform:scale(.9);background:#00cc66}
.send svg{width:18px;height:18px}
/* Quick actions */
.quick{display:flex;gap:6px;padding:8px 12px 0;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none;flex-shrink:0}
.quick::-webkit-scrollbar{display:none}
.chip{background:var(--bg2);border:1px solid var(--border);color:var(--dim);font-size:11px;padding:5px 12px;border-radius:20px;white-space:nowrap;cursor:pointer;flex-shrink:0;font-family:inherit;transition:.15s}
.chip:active{background:var(--border);color:var(--text)}
/* Welcome */
.welcome{text-align:center;padding:32px 20px;color:var(--dim)}
.welcome-icon{font-size:40px;margin-bottom:12px}
.welcome-title{color:var(--green);font-size:18px;font-weight:700;margin-bottom:6px}
.welcome-sub{font-size:13px;line-height:1.6}
</style>
</head>
<body>
<div class="app">
  <div class="hdr">
    <div class="hdr-left">
      <div class="pulse"></div>
      <div>
        <div class="hdr-title">AnDy Chat</div>
        <div class="hdr-sub" id="hdr-sub">IA · Trackr</div>
      </div>
    </div>
    <div class="hdr-btns">
      <button class="hdr-btn" id="tab-chat" onclick="switchTab('chat')" style="color:var(--green);border-color:rgba(0,255,136,.3)">💬 Chat</button>
      <button class="hdr-btn" id="tab-tasks" onclick="switchTab('tasks')">📋 Tâches</button>
      <a href="/" class="hdr-btn" style="text-decoration:none">⚙️</a>
    </div>
  </div>

  <!-- TAB: CHAT -->
  <div id="view-chat" style="display:flex;flex-direction:column;flex:1;overflow:hidden">
    <div class="quick">
      <button class="chip" onclick="send('Statut du serveur et tâches en cours ?')">📊 Statut</button>
      <button class="chip" onclick="send('Qu\\'a fait AnDy ces dernières heures ?')">🕐 Récent</button>
      <button class="chip" onclick="send('Updates déployés aujourd\\'hui ?')">✅ Today</button>
      <button class="chip" onclick="send('Queue et prochaines tâches ?')">⏳ Queue</button>
      <button class="chip" onclick="send('Top 3 améliorations urgentes pour l\\'app ?')">🎯 Priorités</button>
    </div>
    <div class="msgs" id="msgs">
      <div class="welcome">
        <div class="welcome-icon">⟨◈⟩</div>
        <div class="welcome-title">AnDy est là</div>
        <div class="welcome-sub">Pose une question ou donne une tâche.<br>Accessible depuis n'importe où.</div>
      </div>
    </div>
    <div class="bar">
      <textarea id="inp" placeholder="Message ou /task description…" rows="1" onkeydown="onKey(event)" oninput="resize(this)"></textarea>
      <button class="send" onclick="sendInput()" aria-label="Envoyer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
  </div>

  <!-- TAB: TÂCHES -->
  <div id="view-tasks" style="display:none;flex-direction:column;flex:1;overflow:hidden">
    <div style="flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:16px 12px">
      <!-- Nouvelle tâche -->
      <div style="background:var(--bg2);border:1px solid rgba(0,255,136,.25);border-radius:16px;padding:16px;margin-bottom:16px">
        <div style="font-size:11px;color:var(--green);letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px">➕ Nouvelle tâche</div>
        <textarea id="task-inp" placeholder="Décris la tâche à donner à AnDy…" rows="3" style="width:100%;background:#111;border:1px solid var(--border);border-radius:10px;padding:10px 12px;color:var(--text);font-size:14px;font-family:inherit;resize:none;outline:none;transition:.2s;-webkit-overflow-scrolling:touch" onfocus="this.style.borderColor='rgba(0,255,136,.4)'" onblur="this.style.borderColor='var(--border)'"></textarea>
        <button onclick="submitTask()" style="margin-top:10px;width:100%;padding:12px;background:var(--green);color:#080808;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit">Donner la tâche à AnDy →</button>
      </div>
      <!-- Statut live -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:16px;margin-bottom:16px">
        <div style="font-size:11px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase;margin-bottom:12px;display:flex;justify-content:space-between;align-items:center">
          <span>📊 Statut live</span>
          <button onclick="loadTasks()" style="background:transparent;border:none;color:var(--dim);font-size:12px;cursor:pointer">↺</button>
        </div>
        <div id="task-stats" style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
          <div style="text-align:center;padding:10px;background:#111;border-radius:10px"><div style="font-size:22px;font-weight:700;color:var(--green)" id="ts-done">—</div><div style="font-size:9px;color:var(--dim);margin-top:2px">DONE</div></div>
          <div style="text-align:center;padding:10px;background:#111;border-radius:10px"><div style="font-size:22px;font-weight:700;color:#818cf8" id="ts-queue">—</div><div style="font-size:9px;color:var(--dim);margin-top:2px">QUEUE</div></div>
          <div style="text-align:center;padding:10px;background:#111;border-radius:10px"><div style="font-size:22px;font-weight:700;color:#fbbf24" id="ts-run">—</div><div style="font-size:9px;color:var(--dim);margin-top:2px">RUN</div></div>
          <div style="text-align:center;padding:10px;background:#111;border-radius:10px"><div style="font-size:22px;font-weight:700;color:var(--red)" id="ts-err">—</div><div style="font-size:9px;color:var(--dim);margin-top:2px">ERR</div></div>
        </div>
        <div id="task-running" style="font-size:12px;color:var(--dim)">Chargement…</div>
      </div>
      <!-- Liste queue -->
      <div style="background:var(--bg2);border:1px solid var(--border);border-radius:16px;padding:16px">
        <div style="font-size:11px;color:var(--dim);letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px">⏳ Queue</div>
        <div id="task-queue-list" style="font-size:13px;color:var(--dim)">—</div>
      </div>
    </div>
  </div>
</div>

<script>
const msgs   = document.getElementById('msgs')
const inp    = document.getElementById('inp')
let loading  = false
let curTab   = 'chat'
let taskPoll = null

function ts() { return new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) }

function switchTab(tab) {
  curTab = tab
  document.getElementById('view-chat').style.display  = tab==='chat'  ? 'flex' : 'none'
  document.getElementById('view-tasks').style.display = tab==='tasks' ? 'flex' : 'none'
  document.getElementById('tab-chat').style.cssText   = tab==='chat'  ? 'color:var(--green);border-color:rgba(0,255,136,.3)' : ''
  document.getElementById('tab-tasks').style.cssText  = tab==='tasks' ? 'color:var(--green);border-color:rgba(0,255,136,.3)' : ''
  if (tab==='tasks') loadTasks()
}

async function loadTasks() {
  try {
    const r = await fetch('/api/tasks')
    const d = await r.json()
    const f = d.files || {}
    document.getElementById('ts-done').textContent  = (f.done||[]).length
    document.getElementById('ts-queue').textContent = (f.queue||[]).length
    document.getElementById('ts-run').textContent   = (f.running||[]).length
    document.getElementById('ts-err').textContent   = (f.error||[]).length
    document.getElementById('hdr-sub').textContent  = \`DONE \${(f.done||[]).length} · QUEUE \${(f.queue||[]).length}\`
    const running = f.running||[]
    const status  = d.status||[]
    if (running.length) {
      const e = status.find(t=>t.name===running[0])
      const stages = ['planning','generating','testing','safe','live']
      const cur = stages.indexOf(e?.stage)
      const pipe = stages.map((s,i)=>i<cur?'<span style="color:var(--green)">'+s.toUpperCase()+'</span>':i===cur?'<span style="color:#fbbf24;font-weight:700">['+s.toUpperCase()+']</span>':'<span style="color:#222">'+s.toUpperCase()+'</span>').join('<span style="color:#333"> › </span>')
      document.getElementById('task-running').innerHTML = \`<div style="color:#fbbf24;margin-bottom:6px">⟳ \${running[0].slice(0,40)}</div><div style="font-size:11px">\${pipe}</div>\`
    } else {
      document.getElementById('task-running').textContent = 'Idle — en attente de tâches…'
    }
    const q = f.queue||[]
    document.getElementById('task-queue-list').innerHTML = q.length
      ? q.slice(0,6).map(n=>\`<div style="padding:6px 0;border-bottom:1px solid var(--border);color:#666">\${n.slice(0,50)}</div>\`).join('')+(q.length>6?'<div style="color:#333;font-size:11px;padding-top:6px">+\${q.length-6} de plus…</div>':'')
      : '<div style="color:#222">Queue vide</div>'
  } catch(e) {
    document.getElementById('task-running').textContent = 'Serveur inaccessible'
  }
}

async function submitTask() {
  const v = document.getElementById('task-inp').value.trim()
  if (!v) return
  try {
    const r = await fetch('/api/task',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({desc:v})})
    if (r.ok) {
      document.getElementById('task-inp').value = ''
      await loadTasks()
      // Feedback visuel
      const btn = document.querySelector('#view-tasks button[onclick="submitTask()"]')
      const orig = btn.textContent
      btn.textContent = '✅ Tâche envoyée !'
      btn.style.background = '#00cc66'
      setTimeout(()=>{ btn.textContent=orig; btn.style.background='var(--green)' }, 2000)
    }
  } catch(e) { alert('Erreur: '+e.message) }
}

function addMsg(role, text) {
  const w = msgs.querySelector('.welcome'); if(w) w.remove()
  const div = document.createElement('div')
  div.className = 'msg ' + role
  const escaped = text.replace(/</g,'&lt;')
  div.innerHTML = \`<div class="bubble">\${escaped}</div><div class="msg-time">\${ts()}</div>\`
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight
}

function showTyping() {
  const div = document.createElement('div')
  div.className='msg andy'; div.id='typing'
  div.innerHTML='<div class="typing"><div class="dot-t"></div><div class="dot-t"></div><div class="dot-t"></div></div>'
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight
}
function hideTyping() { document.getElementById('typing')?.remove() }

async function send(text) {
  if (!text?.trim() || loading) return
  // Si on est sur l'onglet tâches, switch vers chat
  if (curTab !== 'chat') switchTab('chat')
  loading = true
  addMsg('user', text)
  inp.value = ''; resize(inp)
  showTyping()
  try {
    const r = await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text})})
    const d = await r.json()
    hideTyping()
    if (d.error) addMsg('andy','⚠️ '+d.error)
    else addMsg('andy', d.reply||'…')
  } catch(e) { hideTyping(); addMsg('andy','⚠️ Erreur réseau') }
  loading = false
}

function sendInput() { const v=inp.value.trim(); if(v) send(v) }

function onKey(e) {
  if (e.key==='Enter' && !e.shiftKey && window.innerWidth>600) { e.preventDefault(); sendInput() }
}

function resize(el) { el.style.height='auto'; el.style.height=Math.min(el.scrollHeight,120)+'px' }

async function resetChat() {
  await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({reset:true})})
  msgs.innerHTML='<div class="welcome"><div class="welcome-icon">⟨◈⟩</div><div class="welcome-title">Conversation effacée</div><div class="welcome-sub">Prêt.</div></div>'
}

// Auto-refresh statut toutes les 30s si onglet tâches
setInterval(()=>{ if(curTab==='tasks') loadTasks() }, 30000)
</script>
</body>
</html>`

const DASH_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AnDy HQ</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080808;color:#e0e0e0;font-family:'SF Mono',monospace;font-size:13px;min-height:100vh}
.header{background:#0a0a0a;border-bottom:1px solid #151515;padding:0 24px;height:56px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;backdrop-filter:blur(20px)}
.logo{color:#00ff88;font-weight:700;font-size:14px;letter-spacing:.12em;display:flex;align-items:center;gap:10px}
.pulse{width:8px;height:8px;border-radius:50%;background:#00ff88;box-shadow:0 0 8px #00ff88;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.6;transform:scale(.85)}}
.header-right{display:flex;align-items:center;gap:12px}
.server-info{color:#333;font-size:10px;letter-spacing:.08em}
.logout{color:#333;font-size:10px;text-decoration:none;padding:4px 10px;border:1px solid #1a1a1a;border-radius:6px;transition:.15s}
.logout:hover{color:#ef4444;border-color:rgba(239,68,68,.3)}
.main{padding:20px;max-width:1400px;margin:0 auto}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}
.stat{background:#0f0f0f;border:1px solid #151515;border-radius:12px;padding:16px;text-align:center;position:relative;overflow:hidden}
.stat::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(0,255,136,.4),transparent)}
.stat-val{font-size:28px;font-weight:700;color:#00ff88;line-height:1}
.stat-label{font-size:9px;color:#333;margin-top:6px;letter-spacing:.15em;text-transform:uppercase}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
.card{background:#0f0f0f;border:1px solid #151515;border-radius:12px;padding:18px}
.card-title{font-size:10px;color:#555;letter-spacing:.15em;text-transform:uppercase;margin-bottom:14px;display:flex;align-items:center;gap:8px}
.dot{width:6px;height:6px;border-radius:50%}
.dot.on{background:#00ff88;box-shadow:0 0 6px #00ff88}
.dot.off{background:#ef4444;box-shadow:0 0 6px #ef4444}
.proc{background:#111;border:1px solid #151515;border-radius:8px;padding:12px 14px;margin-bottom:8px;display:flex;align-items:center;justify-content:space-between}
.proc-name{font-weight:600;font-size:13px}
.proc-meta{color:#333;font-size:10px;margin-top:3px}
.badge{padding:3px 10px;border-radius:20px;font-size:9px;font-weight:700;letter-spacing:.1em}
.badge.on{background:rgba(0,255,136,.12);color:#00ff88;border:1px solid rgba(0,255,136,.2)}
.badge.off{background:rgba(239,68,68,.12);color:#ef4444;border:1px solid rgba(239,68,68,.2)}
.btns{display:flex;gap:8px;margin-top:12px}
.btn{padding:7px 14px;border-radius:7px;border:none;cursor:pointer;font-size:11px;font-weight:600;font-family:inherit;transition:.15s;letter-spacing:.05em}
.btn:hover{transform:translateY(-1px)}
.btn:active{transform:translateY(0)}
.btn-g{background:rgba(0,255,136,.12);color:#00ff88;border:1px solid rgba(0,255,136,.2)}
.btn-g:hover{background:rgba(0,255,136,.2)}
.btn-r{background:rgba(239,68,68,.1);color:#ef4444;border:1px solid rgba(239,68,68,.2)}
.btn-r:hover{background:rgba(239,68,68,.18)}
.btn-d{background:#111;color:#555;border:1px solid #1a1a1a}
.btn-d:hover{color:#888;background:#151515}
.log-tabs{display:flex;gap:6px;margin-bottom:10px}
.tab{padding:5px 12px;border-radius:6px;border:1px solid #1a1a1a;background:transparent;color:#444;font-size:10px;cursor:pointer;font-family:inherit;letter-spacing:.08em;transition:.15s}
.tab.active{background:rgba(0,255,136,.1);color:#00ff88;border-color:rgba(0,255,136,.25)}
.logs{background:#060606;border:1px solid #111;border-radius:8px;height:200px;overflow-y:auto;padding:10px 12px;font-size:10.5px;line-height:1.7}
.l{color:#2a2a2a}
.l.push{color:#00ff88}
.l.err{color:#ef4444}
.l.task{color:#555}
.l.rev{color:#00cc66}
.l.gen{color:#818cf8}
.task-list{max-height:180px;overflow-y:auto}
.task-row{display:flex;align-items:center;gap:8px;padding:8px 10px;background:#111;border-radius:7px;margin-bottom:6px}
.task-name{flex:1;color:#666;font-size:10.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.tb{padding:2px 8px;border-radius:10px;font-size:8px;font-weight:700;letter-spacing:.08em;white-space:nowrap}
.tb.done{background:rgba(0,255,136,.1);color:#00ff88}
.tb.run{background:rgba(251,191,36,.1);color:#fbbf24}
.tb.err{background:rgba(239,68,68,.1);color:#ef4444}
.tb.q{background:rgba(129,140,248,.1);color:#818cf8}
.add-task{display:flex;gap:8px;margin-top:12px}
.inp{flex:1;background:#111;border:1px solid #1a1a1a;border-radius:7px;padding:8px 12px;color:#e0e0e0;font-size:11px;font-family:inherit;outline:none;transition:.2s}
.inp:focus{border-color:rgba(0,255,136,.35)}
.full{grid-column:1/-1}
.actions-bar{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
@media(max-width:768px){.stats{grid-template-columns:1fr 1fr}.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="header">
  <div class="logo"><div class="pulse"></div>ANDY HQ</div>
  <div class="header-right">
    <span class="server-info" id="htime">—</span>
    <a href="/logout" class="logout">Déconnexion</a>
  </div>
</div>

<div class="main">
  <div class="stats">
    <div class="stat"><div class="stat-val" id="s-done">—</div><div class="stat-label">Tâches done</div></div>
    <div class="stat"><div class="stat-val" id="s-queue">—</div><div class="stat-label">En queue</div></div>
    <div class="stat"><div class="stat-val" id="s-uptime">—</div><div class="stat-label">Uptime</div></div>
    <div class="stat"><div class="stat-val" id="s-mem">—</div><div class="stat-label">RAM utilisée</div></div>
  </div>

  <div class="grid">
    <div class="card">
      <div class="card-title"><div class="dot" id="d-dot"></div>Andy Daemon — IA autonome</div>
      <div id="d-proc"></div>
      <div class="btns">
        <button class="btn btn-g" onclick="act('restart','andy-daemon')">↺ Restart</button>
        <button class="btn btn-d" onclick="log('daemon')">Logs</button>
        <button class="btn btn-r" onclick="if(confirm('Arrêter Andy ?'))act('stop','andy-daemon')">■ Stop</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title"><div class="dot" id="b-dot"></div>Discord Bot</div>
      <div id="b-proc"></div>
      <div class="btns">
        <button class="btn btn-g" onclick="act('restart','discord-bot')">↺ Restart</button>
        <button class="btn btn-d" onclick="log('bot')">Logs</button>
        <button class="btn btn-r" onclick="if(confirm('Arrêter le bot ?'))act('stop','discord-bot')">■ Stop</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📋 File de tâches</div>
      <div class="task-list" id="tasks"></div>
      <div class="add-task">
        <input class="inp" id="task-inp" placeholder="Donner une tâche à Andy..." onkeydown="if(event.key==='Enter')addTask()">
        <button class="btn btn-g" onclick="addTask()">+ Ajouter</button>
      </div>
    </div>

    <div class="card">
      <div class="card-title">📊 Logs</div>
      <div class="log-tabs">
        <button class="tab active" id="tab-d" onclick="log('daemon')">Daemon</button>
        <button class="tab" id="tab-b" onclick="log('bot')">Discord</button>
      </div>
      <div class="logs" id="log-box"></div>
    </div>

    <div class="card full">
      <div class="card-title">⚡ Actions rapides</div>
      <div class="actions-bar">
        <button class="btn btn-g" onclick="act('restart','all')">↺ Restart ALL</button>
        <button class="btn btn-d" onclick="refresh()">⟳ Actualiser</button>
        <button class="btn btn-d" onclick="log('daemon')">Voir logs daemon</button>
        <button class="btn btn-d" onclick="log('bot')">Voir logs Discord</button>
        <button class="btn btn-r" style="margin-left:auto" onclick="if(confirm('Arrêter TOUT ?'))act('stop','all')">■ Stop ALL</button>
      </div>
    </div>
  </div>
</div>

<script>
let curLog = 'daemon'

async function api(url, body) {
  const r = await fetch(url, body ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)} : {})
  return r.json().catch(()=>({}))
}

async function refresh() {
  const d = await api('/api/status')
  if (!d.processes) return
  document.getElementById('s-done').textContent = d.tasks?.filter(t=>t.endsWith('.done')).length ?? '—'
  document.getElementById('s-queue').textContent = d.tasks?.filter(t=>t.endsWith('.txt')).length ?? '—'
  document.getElementById('s-uptime').textContent = d.uptime || '—'
  document.getElementById('s-mem').textContent = d.mem || '—'
  document.getElementById('htime').textContent = new Date().toLocaleTimeString('fr-FR')

  for (const p of d.processes) {
    const isD = p.name === 'andy-daemon'
    const el = document.getElementById(isD ? 'd-proc' : 'b-proc')
    const dot = document.getElementById(isD ? 'd-dot' : 'b-dot')
    const on = p.status === 'online'
    if (dot) dot.className = 'dot ' + (on ? 'on' : 'off')
    if (el) el.innerHTML = \`<div class="proc">
      <div><div class="proc-name">\${p.name}</div><div class="proc-meta">CPU \${p.cpu}% · RAM \${p.mem} · \${p.restarts} restart(s)</div></div>
      <span class="badge \${on?'on':'off'}">\${p.status.toUpperCase()}</span>
    </div>\`
  }

  const tl = document.getElementById('tasks')
  if (d.tasks?.length) {
    tl.innerHTML = [...d.tasks].reverse().slice(0,20).map(t => {
      const ext = t.split('.').pop()
      const cls = ext==='done'?'done':ext==='running'?'run':ext==='error'?'err':'q'
      const lbl = ext==='done'?'DONE':ext==='running'?'RUN':ext==='error'?'ERR':'QUEUE'
      return \`<div class="task-row"><span class="task-name">\${t.replace(/\\.(txt|done|running|error)$/,'')}</span><span class="tb \${cls}">\${lbl}</span></div>\`
    }).join('')
  } else {
    tl.innerHTML = '<div style="color:#222;padding:8px">Queue vide — Andy génère la prochaine vague...</div>'
  }
}

async function log(which) {
  curLog = which
  document.getElementById('tab-d').className = 'tab' + (which==='daemon'?' active':'')
  document.getElementById('tab-b').className = 'tab' + (which==='bot'?' active':'')
  const d = await api('/api/logs?which='+which)
  const box = document.getElementById('log-box')
  box.innerHTML = (d.lines||[]).map(l => {
    const cls = l.includes('pushed')?'push':l.includes('ERROR')?'err':l.includes('TASK')?'task':l.includes('review')?'rev':l.includes('GEN')?'gen':'l'
    return \`<div class="l \${cls}">\${l.replace(/</g,'&lt;')}</div>\`
  }).join('')
  box.scrollTop = box.scrollHeight
}

async function act(action, name) {
  await api('/api/action', {action, name})
  setTimeout(refresh, 1500)
}

async function addTask() {
  const inp = document.getElementById('task-inp')
  const val = inp.value.trim()
  if (!val) return
  await api('/api/task', {desc: val})
  inp.value = ''
  setTimeout(refresh, 400)
}

refresh()
log('daemon')
setInterval(refresh, 5000)
setInterval(() => log(curLog), 8000)
</script>
</body>
</html>`

// ── Server ────────────────────────────────────────────────────────────────────
function parseCookies(req) {
  return Object.fromEntries((req.headers.cookie||'').split(';').map(c=>c.trim().split('=')).filter(([k])=>k))
}

const BRAIN_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>AnDy Brain</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#080808;color:#e0e0e0;font-family:'SF Mono',Menlo,monospace;min-height:100vh}
:root{--g:#00ff88;--g2:#00cc66;--bg2:#111;--bg3:#161616;--bd:rgba(255,255,255,0.07);--red:#ff4d4d;--amber:#fbbf24;--blue:#38bdf8}
header{position:sticky;top:0;z-index:99;background:#080808;border-bottom:1px solid var(--bd);padding:14px 20px;display:flex;align-items:center;gap:12px}
.logo{color:var(--g);font-size:16px;font-weight:800;letter-spacing:.08em}
.live-dot{width:7px;height:7px;border-radius:50%;background:var(--g);box-shadow:0 0 8px var(--g);animation:ping 2s infinite}
@keyframes ping{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(1.3)}}
.htime{margin-left:auto;color:#333;font-size:11px}
.grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:16px}
@media(max-width:640px){.grid{grid-template-columns:1fr}}
.card{background:var(--bg2);border:1px solid var(--bd);border-radius:14px;padding:16px}
.card-title{font-size:9px;color:#444;letter-spacing:.12em;text-transform:uppercase;font-weight:700;margin-bottom:12px}
.stat-row{display:flex;gap:10px;flex-wrap:wrap}
.stat{flex:1;min-width:60px;text-align:center;background:var(--bg3);border-radius:10px;padding:10px 8px}
.stat-n{font-size:24px;font-weight:800;line-height:1}
.stat-l{font-size:8px;color:#444;letter-spacing:.1em;text-transform:uppercase;margin-top:4px}
.workers{display:flex;flex-direction:column;gap:8px}
.worker{display:flex;align-items:center;gap:10px;background:var(--bg3);border-radius:10px;padding:10px 12px}
.w-id{font-size:10px;color:#444;width:24px;flex-shrink:0}
.w-bar{flex:1;height:4px;background:#1a1a1a;border-radius:2px;overflow:hidden}
.w-fill{height:100%;border-radius:2px;transition:width .4s ease,background .3s}
.w-label{font-size:10px;color:#555;flex-shrink:0;max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.stage-pill{font-size:8px;padding:2px 7px;border-radius:999px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;flex-shrink:0}
.s-idle{background:#1a1a1a;color:#333}
.s-planning{background:rgba(167,139,250,.15);color:#a78bfa}
.s-generating{background:rgba(56,189,248,.15);color:var(--blue)}
.s-testing{background:rgba(251,191,36,.15);color:var(--amber)}
.s-safe{background:rgba(0,204,102,.15);color:var(--g2)}
.s-live{background:rgba(0,255,136,.12);color:var(--g)}
.log{font-size:10px;line-height:1.6;max-height:240px;overflow-y:auto;display:flex;flex-direction:column-reverse;gap:2px}
.log-entry{display:flex;gap:8px;padding:2px 0;border-bottom:1px solid rgba(255,255,255,.03)}
.log-ts{color:#2a2a2a;flex-shrink:0}
.log-msg{color:#555;word-break:break-all}
.log-msg.ok{color:#00cc66}
.log-msg.err{color:var(--red)}
.log-msg.start{color:var(--blue)}
.log-msg.gen{color:var(--amber)}
.tasks{display:flex;flex-direction:column;gap:6px;max-height:300px;overflow-y:auto}
.task-item{padding:10px 12px;background:var(--bg3);border-radius:10px;border-left:3px solid var(--bd);display:flex;align-items:flex-start;gap:8px}
.task-item.done{border-left-color:var(--g2)}
.task-item.err{border-left-color:var(--red)}
.task-item.run{border-left-color:var(--blue)}
.task-desc{font-size:11px;color:#888;flex:1;line-height:1.35;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical}
.task-dur{font-size:9px;color:#333;flex-shrink:0;margin-top:2px}
.cost-badge{display:inline-flex;align-items:center;gap:5px;background:rgba(0,255,136,.06);border:1px solid rgba(0,255,136,.15);border-radius:8px;padding:6px 12px;color:var(--g);font-size:13px;font-weight:700}
.full{grid-column:1/-1}
</style>
</head>
<body>
<header>
  <span class="logo">⬡ AnDy Brain</span>
  <span class="live-dot" id="dot"></span>
  <span id="updAt" style="font-size:10px;color:#333;margin-left:4px">—</span>
  <span class="htime" id="clock"></span>
</header>

<div class="grid" id="grid">
  <!-- Stats -->
  <div class="card">
    <div class="card-title">Stats session</div>
    <div class="stat-row" id="stats">
      <div class="stat"><div class="stat-n" style="color:var(--g)" id="s-done">—</div><div class="stat-l">Done</div></div>
      <div class="stat"><div class="stat-n" style="color:var(--red)" id="s-err">—</div><div class="stat-l">Errors</div></div>
      <div class="stat"><div class="stat-n" style="color:var(--amber)" id="s-queue">—</div><div class="stat-l">Queue</div></div>
      <div class="stat"><div class="stat-n" style="color:var(--blue)" id="s-run">—</div><div class="stat-l">Running</div></div>
    </div>
    <div style="margin-top:14px;display:flex;align-items:center;gap:10px">
      <span class="cost-badge">💸 <span id="s-cost">$0</span></span>
      <span style="font-size:10px;color:#333">🔁 cycle <span id="s-cycle">0</span></span>
    </div>
  </div>

  <!-- Workers -->
  <div class="card">
    <div class="card-title">Workers</div>
    <div class="workers" id="workers-list">
      <div style="color:#333;font-size:11px">En attente de données…</div>
    </div>
  </div>

  <!-- Live Log -->
  <div class="card full">
    <div class="card-title">Log en direct</div>
    <div class="log" id="log-box">
      <div class="log-entry"><span class="log-msg">En attente du daemon…</span></div>
    </div>
  </div>

  <!-- Recent done -->
  <div class="card">
    <div class="card-title">Dernières tâches terminées</div>
    <div class="tasks" id="done-list"><div style="color:#333;font-size:11px">Aucune</div></div>
  </div>

  <!-- Recent errors -->
  <div class="card">
    <div class="card-title">Erreurs récentes</div>
    <div class="tasks" id="err-list"><div style="color:#333;font-size:11px">Aucune erreur</div></div>
  </div>
</div>

<script>
const STAGE_CLASS = {idle:'s-idle',planning:'s-planning',generating:'s-generating',testing:'s-testing',safe:'s-safe',live:'s-live',starting:'s-planning',started:'s-planning',error:'s-idle'}
const STAGE_BAR   = {idle:0,starting:10,planning:25,generating:55,testing:75,safe:88,live:100,error:0}
const STAGE_COL   = {idle:'#1a1a1a',planning:'#a78bfa',generating:'#38bdf8',testing:'#fbbf24',safe:'#00cc66',live:'#00ff88',starting:'#a78bfa',error:'#ff4d4d'}

function timeAgo(ts){
  if(!ts) return ''
  const s = Math.floor((Date.now()-new Date(ts))/1000)
  if(s<60) return s+'s'
  if(s<3600) return Math.floor(s/60)+'min'
  return Math.floor(s/3600)+'h'
}

function msgClass(msg){
  const m = msg.toLowerCase()
  if(m.includes('done')||m.includes('pushed')||m.includes('envoyé')) return 'ok'
  if(m.includes('error')||m.includes('erreur')||m.includes('fatal')||m.includes('échec')) return 'err'
  if(m.includes('start')||m.includes('démarré')||m.includes('worker')) return 'start'
  if(m.includes('auto-gen')||m.includes('new task')||m.includes('generating')) return 'gen'
  return ''
}

let lastUpdate = 0

async function refresh(){
  try {
    const r = await fetch('/api/live', {headers:{Authorization:'Bearer trackr2024'}})
    if(!r.ok) return
    const d = await r.json()
    if(!d.updatedAt) return

    // Staleness indicator
    const age = Math.floor((Date.now()-new Date(d.updatedAt))/1000)
    document.getElementById('updAt').textContent = age < 10 ? '● live' : age+'s'
    document.getElementById('updAt').style.color = age < 30 ? '#00ff88' : '#ff4d4d'

    // Stats
    const st = d.stats || {}
    document.getElementById('s-done').textContent  = st.done   ?? '—'
    document.getElementById('s-err').textContent   = st.errors ?? '—'
    document.getElementById('s-queue').textContent = st.queue  ?? '—'
    document.getElementById('s-run').textContent   = st.running?? '—'
    document.getElementById('s-cost').textContent  = '$'+(st.cost||'0')
    document.getElementById('s-cycle').textContent = st.cycles ?? '0'

    // Workers
    const ws = d.workers || {}
    const wEl = document.getElementById('workers-list')
    const ids = Object.keys(ws).filter(k=>k!=='_current').sort()
    if(ids.length){
      wEl.innerHTML = ids.map(id=>{
        const w = ws[id]
        const stg = w.stage || 'idle'
        const pct = STAGE_BAR[stg] || 0
        const col = STAGE_COL[stg] || '#1a1a1a'
        const cls = STAGE_CLASS[stg] || 's-idle'
        const desc = w.task ? w.task.replace(/^(auto|manual|chat|NUIT|v2)-[0-9]+-?/, '').replace(/-/g,' ').slice(0,40) : 'idle'
        return \`<div class="worker">
          <span class="w-id">#\${id}</span>
          <div class="w-bar"><div class="w-fill" style="width:\${pct}%;background:\${col}"></div></div>
          <span class="stage-pill \${cls}">\${stg}</span>
          <span class="w-label">\${desc}</span>
        </div>\`
      }).join('')
    } else {
      wEl.innerHTML = '<div style="color:#333;font-size:11px">Daemon pas encore démarré</div>'
    }

    // Log (newest at top)
    const logs = (d.log||[]).slice().reverse()
    if(logs.length){
      document.getElementById('log-box').innerHTML = logs.map(l=>{
        const ts = l.ts ? l.ts.slice(11,19) : ''
        const cls = msgClass(l.msg||'')
        const msg = (l.msg||'').replace(/\[[\d\-T:.Z]+\]\s*/,'')
        return \`<div class="log-entry"><span class="log-ts">\${ts}</span><span class="log-msg \${cls}">\${msg}</span></div>\`
      }).join('')
    }

    // Done tasks
    const doneEl = document.getElementById('done-list')
    const done = (d.recentDone||[]).slice(0,12)
    doneEl.innerHTML = done.length ? done.map(t=>\`<div class="task-item done">
      <div style="flex:1"><div class="task-desc">\${t.desc||t.name||''}</div><div class="task-dur">\${timeAgo(t.startedAt)} · \${t.dur||0}s · \${(t.files||[]).map(f=>f.split('/').pop()).join(' ')}</div></div>
    </div>\`).join('') : '<div style="color:#333;font-size:11px">Aucune tâche terminée</div>'

    // Errors
    const errEl = document.getElementById('err-list')
    const errs = (d.recentErrors||[]).slice(0,8)
    errEl.innerHTML = errs.length ? errs.map(t=>\`<div class="task-item err">
      <div style="flex:1"><div class="task-desc">\${t.desc||t.name||''}</div><div class="task-dur" style="color:#ff4d4d">\${(t.error||'').slice(0,60)}</div></div>
    </div>\`).join('') : '<div style="color:#333;font-size:11px">Aucune erreur ✓</div>'

    lastUpdate = Date.now()
  } catch(e){
    document.getElementById('updAt').textContent = 'erreur réseau'
    document.getElementById('updAt').style.color = '#ff4d4d'
  }
}

// Clock
setInterval(()=>{
  document.getElementById('clock').textContent = new Date().toLocaleTimeString('fr-FR')
}, 1000)

// Refresh every 3s
refresh()
setInterval(refresh, 3000)
</script>
</body>
</html>`

http.createServer(async (req, res) => {
  const url  = new URL(req.url, 'http://localhost')
  const CORS = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Authorization,Content-Type' }
  const html = (s, body, h={}) => { res.writeHead(s, {'Content-Type':'text/html',...h}); res.end(body) }
  const json = (d) => { res.writeHead(200, {'Content-Type':'application/json',...CORS}); res.end(JSON.stringify(d)) }

  // CORS preflight
  if (req.method === 'OPTIONS') { res.writeHead(204, CORS); return res.end() }

  // Logout
  if (url.pathname === '/logout') {
    const { session } = parseCookies(req)
    if (session) sessions.delete(session)
    res.writeHead(302, { Location: '/', 'Set-Cookie': 'session=; Max-Age=0; Path=/' })
    return res.end()
  }

  // Login POST
  if (url.pathname === '/login' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      const params = new URLSearchParams(body)
      if (params.get('pass') === PASS) {
        const token = newSession()
        res.writeHead(302, { Location: '/', 'Set-Cookie': `session=${token}; HttpOnly; Max-Age=28800; Path=/; SameSite=Strict` })
        return res.end()
      }
      html(200, LOGIN_HTML.replace('display:none', 'display:block'))
    })
    return
  }

  // Auth check — session cookie (browser) OU Bearer token (CLI)
  const bearerOk = (req.headers.authorization || '') === `Bearer ${PASS}`
  if (!validSession(req) && !bearerOk) return html(200, LOGIN_HTML)

  // API — Status
  if (url.pathname === '/api/status') {
    const pm2Raw = await run('pm2 jlist')
    let processes = []
    try { processes = JSON.parse(pm2Raw).map(p => ({ name: p.name, status: p.pm2_env.status, cpu: p.monit?.cpu??0, mem: Math.round((p.monit?.memory??0)/1024/1024)+'MB', restarts: p.pm2_env.restart_time })) } catch {}
    const mem    = await run("free -m | awk 'NR==2{printf \"%sMB / %sMB\", $3,$2}'")
    const uptime = await run("uptime -p | sed 's/up //'")
    let tasks = []
    try { tasks = readdirSync(TASKS).filter(f => !f.startsWith('.')).sort() } catch {}
    return json({ processes, tasks, mem, uptime })
  }

  // API — Logs
  if (url.pathname === '/api/logs') {
    const which = url.searchParams.get('which') || 'daemon'
    const file  = which === 'bot' ? LOG_B : LOG_D
    let lines = []
    try { lines = readFileSync(file,'utf8').split('\n').filter(Boolean).slice(-100) } catch {}
    return json({ lines })
  }

  // API — Action
  if (url.pathname === '/api/action' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', async () => {
      const { action, name } = JSON.parse(body||'{}')
      if (['restart','start','stop'].includes(action) && /^[a-z-]+$/.test(name||'all'))
        await run(`pm2 ${action} ${name}`)
      json({ ok: true })
    })
    return
  }

  // API — Tasks status (CLI /tasks command)
  if (url.pathname === '/api/tasks') {
    let taskStatus = [], files = { queue: [], running: [], done: [], error: [] }
    try {
      const all = readdirSync(TASKS).filter(f => !f.startsWith('.'))
      files = {
        queue:   all.filter(f => f.endsWith('.txt')).map(f => f.replace(/\.txt$/, '')),
        running: all.filter(f => f.endsWith('.running')).map(f => f.replace(/\.running$/, '')),
        done:    all.filter(f => f.endsWith('.done')).map(f => f.replace(/\.done$/, '')),
        error:   all.filter(f => f.endsWith('.error')).map(f => f.replace(/\.error$/, '')),
      }
    } catch {}
    try { taskStatus = JSON.parse(readFileSync(resolve(TASKS, '.task-status.json'), 'utf8')) } catch {}
    return json({ files, status: taskStatus })
  }

  // API — Add task
  if (url.pathname === '/api/task' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      const { desc } = JSON.parse(body||'{}')
      if (desc?.trim()) writeFileSync(resolve(TASKS, `manual-${Date.now()}.txt`), desc.trim(), 'utf8')
      json({ ok: true })
    })
    return
  }

  // API — Chat (Groq primary → Anthropic fallback)
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    const sess = getSession(req)
    let body = ''
    req.on('data', c => body += c)
    req.on('end', async () => {
      try {
        const { message, reset } = JSON.parse(body || '{}')
        const history = sess?.session?.history || []
        if (reset) { if (sess) sess.session.history = []; return json({ ok: true }) }
        if (!message?.trim()) return json({ error: 'message vide' })

        history.push({ role: 'user', content: message.trim() })

        const CHAT_SYSTEM = `Tu es AnDy, l'IA personnelle d'Andrea Matlega.
App Trackr : React 19 + Vite, mobile-first, déployée sur Vercel. Repo: ${GITHUB_REPO}. App: ${APP_URL}.
Réponds en français. Direct, concis, sans intro inutile.
Tu peux aussi recevoir des commandes de tâche — si le message commence par /task, crée une tâche dans andy-tasks/.`

        const msgs20 = history.slice(-20)
        let reply = null
        let providerUsed = ''

        // 1) Groq (gratuit)
        const GROQ_KEY = process.env.GROQ_API_KEY || ''
        if (GROQ_KEY && !reply) {
          try {
            const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${GROQ_KEY}` },
              body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: CHAT_SYSTEM }, ...msgs20], max_tokens: 1024, temperature: 0.5 }),
              signal: AbortSignal.timeout(30000),
            })
            if (r.ok) {
              const d = await r.json().catch(() => null)
              reply = d?.choices?.[0]?.message?.content?.trim() || null
              if (reply) providerUsed = 'groq'
            }
          } catch {}
        }

        // 2) Anthropic fallback
        if (!reply && ANTHROPIC_KEY) {
          try {
            const r = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
              body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, system: CHAT_SYSTEM, stream: false, messages: msgs20 }),
              signal: AbortSignal.timeout(60000),
            })
            if (r.ok) {
              const d = await r.json().catch(() => null)
              reply = d?.content?.[0]?.text?.trim() || null
              if (reply) providerUsed = 'anthropic'
            } else {
              const errBody = await r.json().catch(() => ({}))
              if (!reply) reply = `⚠️ API ${r.status}: ${errBody?.error?.message || 'erreur inconnue'}`
            }
          } catch (e) { if (!reply) reply = `⚠️ Erreur réseau: ${e.message}` }
        }

        if (!reply) return json({ error: 'Aucun provider IA disponible (GROQ_API_KEY ou ANTHROPIC_API_KEY requis)' })

        history.push({ role: 'assistant', content: reply })
        if (sess) sess.session.history = history.slice(-40)

        // /task dans le chat → injecte directement dans andy-tasks/
        if (message.trim().toLowerCase().startsWith('/task ')) {
          const desc = message.trim().slice(6).trim()
          if (desc) writeFileSync(resolve(TASKS, `chat-${Date.now()}.txt`), desc, 'utf8')
        }

        return json({ reply, historyLen: history.length, provider: providerUsed })
      } catch (e) { return json({ error: e.message }) }
    })
    return
  }

  // API — GitHub commits proxy (token reste côté serveur)
  if (url.pathname === '/api/commits') {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN || ''
    const headers = { 'User-Agent': 'trackr-dashboard' }
    if (GITHUB_TOKEN) headers['Authorization'] = `Bearer ${GITHUB_TOKEN}`
    try {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/commits?per_page=15`, { headers, signal: AbortSignal.timeout(10000) })
      const data = await r.json()
      return json(Array.isArray(data) ? data : [])
    } catch (e) { return json([]) }
  }

  // API — Live state (daemon .live-state.json)
  if (url.pathname === '/api/live') {
    try {
      const raw = readFileSync(resolve(TASKS, '.live-state.json'), 'utf8')
      res.writeHead(200, { 'Content-Type': 'application/json', ...CORS })
      return res.end(raw)
    } catch { return json({ updatedAt: null, stats: {}, workers: {}, recentDone: [], log: [] }) }
  }

  // API — Memory (ANDY_MEMORY.json entries)
  if (url.pathname === '/api/memory') {
    try {
      const mem = JSON.parse(readFileSync(resolve(ROOT, 'ANDY_MEMORY.json'), 'utf8'))
      return json({ entries: (mem.entries || []).slice(-30) })
    } catch { return json({ entries: [] }) }
  }

  // Brain — live YouTube-style viewer
  if (url.pathname === '/brain') return html(200, BRAIN_HTML)

  // Chat page
  if (url.pathname === '/chat') return html(200, CHAT_HTML)

  // Vibe page — dev experience sur mobile
  if (url.pathname === '/vibe') return html(200, VIBE_HTML)

  // Dashboard
  html(200, DASH_HTML)
}).listen(PORT, () => {
  console.log(`Dashboard: http://62.238.12.221:${PORT}`)
  console.log(`Chat:      http://62.238.12.221:${PORT}/chat`)
  console.log(`Password: ${PASS}`)
})
