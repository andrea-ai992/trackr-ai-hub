#!/usr/bin/env node
import http from 'http'
import { exec } from 'child_process'
import { readdirSync, readFileSync, writeFileSync } from 'fs'
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

const run = cmd => new Promise(r => exec(cmd, (_e, o) => r(o?.trim() || '')))

// ── Sessions ──────────────────────────────────────────────────────────────────
const sessions = new Map()
function newSession() {
  const token = randomBytes(32).toString('hex')
  sessions.set(token, Date.now())
  return token
}
function validSession(req) {
  const cookie = req.headers.cookie || ''
  const m = cookie.match(/session=([a-f0-9]{64})/)
  if (!m) return false
  const ts = sessions.get(m[1])
  if (!ts) return false
  if (Date.now() - ts > 8 * 60 * 60 * 1000) { sessions.delete(m[1]); return false }
  sessions.set(m[1], Date.now()) // refresh
  return true
}

// ── HTML ──────────────────────────────────────────────────────────────────────
const LOGIN_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trackr — Login</title>
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
    <div class="logo-text">TRACKR SERVER</div>
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

const DASH_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trackr Dashboard</title>
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
  <div class="logo"><div class="pulse"></div>TRACKR SERVER</div>
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

http.createServer(async (req, res) => {
  const url  = new URL(req.url, 'http://localhost')
  const html = (s, body, h={}) => { res.writeHead(s, {'Content-Type':'text/html',...h}); res.end(body) }
  const json = (d) => { res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify(d)) }

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

  // Dashboard
  html(200, DASH_HTML)
}).listen(PORT, () => {
  console.log(`Dashboard: http://62.238.12.221:${PORT}`)
  console.log(`Password: ${PASS}`)
})
