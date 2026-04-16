#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
//  Trackr Server Dashboard — GUI web pour gérer le serveur
//  Usage: node deploy/dashboard.js
//  Accès: http://SERVER_IP:4000  (mot de passe: trackr2024)
// ─────────────────────────────────────────────────────────────────────────────

import http from 'http'
import { exec } from 'child_process'
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir   = dirname(fileURLToPath(import.meta.url))
const ROOT    = resolve(__dir, '..')
const PORT    = process.env.DASHBOARD_PORT || 4000
const PASS    = process.env.DASHBOARD_PASS || 'trackr2024'
const TASKS   = resolve(ROOT, 'andy-tasks')
const LOG_D   = '/root/logs/andy-daemon.log'
const LOG_B   = '/root/logs/discord-bot.log'

const run = cmd => new Promise(r => exec(cmd, (e, o) => r(o?.trim() || '')))

const HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Trackr Server</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:#080808;color:#e0e0e0;font-family:'SF Mono',monospace;font-size:13px}
  .header{background:#0f0f0f;border-bottom:1px solid #1a1a1a;padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
  .logo{color:#00ff88;font-weight:700;font-size:16px;letter-spacing:.1em}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;padding:16px;max-width:1400px;margin:0 auto}
  .card{background:#0f0f0f;border:1px solid #1a1a1a;border-radius:12px;padding:16px}
  .card-title{color:#00ff88;font-size:11px;letter-spacing:.15em;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px}
  .process{display:flex;align-items:center;justify-content:space-between;padding:10px 12px;background:#111;border-radius:8px;margin-bottom:8px}
  .proc-name{color:#e0e0e0;font-weight:600}
  .status{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700;letter-spacing:.1em}
  .online{background:rgba(0,255,136,.15);color:#00ff88;border:1px solid rgba(0,255,136,.3)}
  .offline{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3)}
  .btn{padding:6px 14px;border-radius:6px;border:none;cursor:pointer;font-size:11px;font-weight:600;transition:.15s}
  .btn-green{background:rgba(0,255,136,.15);color:#00ff88;border:1px solid rgba(0,255,136,.3)}
  .btn-green:hover{background:rgba(0,255,136,.25)}
  .btn-red{background:rgba(239,68,68,.15);color:#ef4444;border:1px solid rgba(239,68,68,.3)}
  .btn-red:hover{background:rgba(239,68,68,.25)}
  .btn-grey{background:#1a1a1a;color:#888;border:1px solid #222}
  .btn-grey:hover{background:#222;color:#aaa}
  .log-box{background:#060606;border:1px solid #1a1a1a;border-radius:8px;height:220px;overflow-y:auto;padding:10px;font-size:11px;line-height:1.6;color:#555}
  .log-line{color:#444}
  .log-line.push{color:#00ff88}
  .log-line.error{color:#ef4444}
  .log-line.task{color:#888}
  .log-line.review{color:#00cc66}
  .task-item{display:flex;align-items:center;justify-content:space-between;padding:8px 10px;background:#111;border-radius:6px;margin-bottom:6px;gap:8px}
  .task-name{color:#888;font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .task-badge{padding:2px 8px;border-radius:10px;font-size:9px;font-weight:700;white-space:nowrap}
  .done{background:rgba(0,255,136,.1);color:#00ff88}
  .running{background:rgba(251,191,36,.1);color:#fbbf24}
  .error-b{background:rgba(239,68,68,.1);color:#ef4444}
  .txt{background:rgba(99,102,241,.1);color:#818cf8}
  .stat{text-align:center;padding:12px;background:#111;border-radius:8px}
  .stat-val{font-size:24px;font-weight:700;color:#00ff88}
  .stat-label{font-size:10px;color:#555;margin-top:4px;letter-spacing:.1em;text-transform:uppercase}
  .stats-row{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}
  .input-row{display:flex;gap:8px;margin-top:10px}
  input[type=text]{flex:1;background:#111;border:1px solid #222;border-radius:6px;padding:8px 12px;color:#e0e0e0;font-family:inherit;font-size:12px;outline:none}
  input[type=text]:focus{border-color:rgba(0,255,136,.4)}
  .full{grid-column:1/-1}
  .dot{width:6px;height:6px;border-radius:50%;background:#00ff88;box-shadow:0 0 6px #00ff88;display:inline-block}
  .dot.off{background:#ef4444;box-shadow:0 0 6px #ef4444}
  @media(max-width:768px){.grid{grid-template-columns:1fr}.stats-row{grid-template-columns:1fr 1fr}}
</style>
</head>
<body>
<div class="header">
  <div class="logo">⟨◈⟩ TRACKR SERVER</div>
  <div style="color:#333;font-size:11px">62.238.12.221 · Hetzner CX22</div>
</div>

<div class="grid" id="app">
  <div class="card full">
    <div class="stats-row" id="stats">
      <div class="stat"><div class="stat-val" id="s-tasks">—</div><div class="stat-label">Tâches faites</div></div>
      <div class="stat"><div class="stat-val" id="s-queue">—</div><div class="stat-label">En queue</div></div>
      <div class="stat"><div class="stat-val" id="s-uptime">—</div><div class="stat-label">Uptime</div></div>
      <div class="stat"><div class="stat-val" id="s-mem">—</div><div class="stat-label">Mémoire</div></div>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><span class="dot" id="dot-d"></span> Andy Daemon</div>
    <div id="proc-daemon"></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn btn-green" onclick="action('restart','andy-daemon')">↺ Restart</button>
      <button class="btn btn-grey" onclick="showLog('daemon')">Logs</button>
      <button class="btn btn-red" onclick="action('stop','andy-daemon')">■ Stop</button>
    </div>
  </div>

  <div class="card">
    <div class="card-title"><span class="dot" id="dot-b"></span> Discord Bot</div>
    <div id="proc-bot"></div>
    <div style="display:flex;gap:8px;margin-top:10px">
      <button class="btn btn-green" onclick="action('restart','discord-bot')">↺ Restart</button>
      <button class="btn btn-grey" onclick="showLog('bot')">Logs</button>
      <button class="btn btn-red" onclick="action('stop','discord-bot')">■ Stop</button>
    </div>
  </div>

  <div class="card">
    <div class="card-title">📋 File de tâches</div>
    <div id="task-list" style="max-height:200px;overflow-y:auto"></div>
    <div class="input-row">
      <input type="text" id="new-task" placeholder="Nouvelle tâche pour Andy...">
      <button class="btn btn-green" onclick="addTask()">+ Ajouter</button>
    </div>
  </div>

  <div class="card">
    <div class="card-title">📊 Logs live</div>
    <div style="display:flex;gap:6px;margin-bottom:8px">
      <button class="btn btn-grey" id="btn-d" onclick="showLog('daemon')">Daemon</button>
      <button class="btn btn-grey" id="btn-b" onclick="showLog('bot')">Discord</button>
    </div>
    <div class="log-box" id="log-box"><span style="color:#333">Sélectionne un log...</span></div>
  </div>

  <div class="card full" style="display:flex;gap:8px;flex-wrap:wrap">
    <button class="btn btn-green" onclick="action('restart','all')">↺ Restart ALL</button>
    <button class="btn btn-grey" onclick="action('start','all')">▶ Start ALL</button>
    <button class="btn btn-grey" onclick="refresh()">⟳ Refresh</button>
    <button class="btn btn-red" style="margin-left:auto" onclick="if(confirm('Arrêter tout ?'))action('stop','all')">■ Stop ALL</button>
  </div>
</div>

<script>
let currentLog = 'daemon'

async function api(path, body) {
  const r = await fetch(path, body ? {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)} : {})
  return r.json().catch(() => ({}))
}

async function refresh() {
  const d = await api('/api/status')
  if (!d.processes) return

  // Stats
  const done = d.tasks?.filter(t => t.endsWith('.done')).length || 0
  const queue = d.tasks?.filter(t => t.endsWith('.txt')).length || 0
  document.getElementById('s-tasks').textContent = done
  document.getElementById('s-queue').textContent = queue
  document.getElementById('s-uptime').textContent = d.uptime || '—'
  document.getElementById('s-mem').textContent = d.mem || '—'

  // Processes
  for (const p of d.processes) {
    const isD = p.name === 'andy-daemon'
    const el = document.getElementById(isD ? 'proc-daemon' : 'proc-bot')
    const dot = document.getElementById(isD ? 'dot-d' : 'dot-b')
    const online = p.status === 'online'
    if (dot) { dot.className = 'dot' + (online ? '' : ' off') }
    if (el) el.innerHTML = \`
      <div class="process">
        <div>
          <div class="proc-name">\${p.name}</div>
          <div style="color:#444;font-size:10px;margin-top:2px">CPU: \${p.cpu}% · RAM: \${p.mem} · Restarts: \${p.restarts}</div>
        </div>
        <span class="status \${online ? 'online' : 'offline'}">\${p.status.toUpperCase()}</span>
      </div>\`
  }

  // Tasks
  const tl = document.getElementById('task-list')
  if (d.tasks?.length) {
    tl.innerHTML = d.tasks.slice(-15).reverse().map(t => {
      const ext = t.split('.').pop()
      const badge = ext === 'done' ? 'done' : ext === 'running' ? 'running' : ext === 'error' ? 'error-b' : 'txt'
      const label = ext === 'done' ? 'DONE' : ext === 'running' ? 'RUN' : ext === 'error' ? 'ERR' : 'QUEUE'
      return \`<div class="task-item"><span class="task-name">\${t.replace(/\\.(txt|done|running|error)$/,'')}</span><span class="task-badge \${badge}">\${label}</span></div>\`
    }).join('')
  } else {
    tl.innerHTML = '<div style="color:#333;padding:10px">Queue vide</div>'
  }
}

async function showLog(which) {
  currentLog = which
  document.getElementById('btn-d').className = 'btn ' + (which==='daemon' ? 'btn-green' : 'btn-grey')
  document.getElementById('btn-b').className = 'btn ' + (which==='bot' ? 'btn-green' : 'btn-grey')
  const d = await api('/api/logs?which=' + which)
  const box = document.getElementById('log-box')
  box.innerHTML = (d.lines || []).map(l => {
    const cls = l.includes('pushed') ? 'push' : l.includes('ERROR') ? 'error' : l.includes('TASK') ? 'task' : l.includes('review') ? 'review' : 'log-line'
    return \`<div class="log-line \${cls}">\${l.replace(/</g,'&lt;')}</div>\`
  }).join('')
  box.scrollTop = box.scrollHeight
}

async function action(act, name) {
  await api('/api/action', {action: act, name})
  setTimeout(refresh, 1500)
}

async function addTask() {
  const inp = document.getElementById('new-task')
  const val = inp.value.trim()
  if (!val) return
  await api('/api/task', {desc: val})
  inp.value = ''
  setTimeout(refresh, 500)
}

refresh()
showLog('daemon')
setInterval(refresh, 5000)
setInterval(() => showLog(currentLog), 8000)
</script>
</body>
</html>`

function auth(req) {
  const h = req.headers['authorization'] || ''
  if (!h.startsWith('Basic ')) return false
  const [, b64] = h.split(' ')
  const [, pass] = Buffer.from(b64, 'base64').toString().split(':')
  return pass === PASS
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost`)

  if (!auth(req)) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Trackr"', 'Content-Type': 'text/plain' })
    return res.end('Mot de passe requis')
  }

  const json = (d) => { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(d)) }

  // Status
  if (url.pathname === '/api/status') {
    const pm2Raw = await run('pm2 jlist')
    let processes = []
    try {
      processes = JSON.parse(pm2Raw).map(p => ({
        name: p.name,
        status: p.pm2_env.status,
        cpu: p.monit?.cpu ?? 0,
        mem: Math.round((p.monit?.memory ?? 0) / 1024 / 1024) + 'MB',
        restarts: p.pm2_env.restart_time,
      }))
    } catch {}
    const memRaw = await run("free -m | awk 'NR==2{printf \"%s/%sMB\", $3,$2}'")
    const uptimeRaw = await run("uptime -p | sed 's/up //'")
    let tasks = []
    try { tasks = readdirSync(TASKS).filter(f => !f.startsWith('.')).sort() } catch {}
    return json({ processes, tasks, mem: memRaw, uptime: uptimeRaw })
  }

  // Logs
  if (url.pathname === '/api/logs') {
    const which = url.searchParams.get('which') || 'daemon'
    const file  = which === 'bot' ? LOG_B : LOG_D
    let lines = []
    try {
      const raw = readFileSync(file, 'utf8')
      lines = raw.split('\n').filter(Boolean).slice(-80)
    } catch {}
    return json({ lines })
  }

  // Action PM2
  if (url.pathname === '/api/action' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', async () => {
      const { action, name } = JSON.parse(body || '{}')
      if (['restart','start','stop'].includes(action)) {
        await run(`pm2 ${action} ${name}`)
      }
      json({ ok: true })
    })
    return
  }

  // Add task
  if (url.pathname === '/api/task' && req.method === 'POST') {
    let body = ''
    req.on('data', c => body += c)
    req.on('end', () => {
      const { desc } = JSON.parse(body || '{}')
      if (desc) {
        const fname = resolve(TASKS, `manual-${Date.now()}.txt`)
        writeFileSync(fname, desc, 'utf8')
      }
      json({ ok: true })
    })
    return
  }

  // HTML
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(HTML)
}).listen(PORT, () => console.log(`Dashboard: http://62.238.12.221:${PORT}  (pass: ${PASS})`))
