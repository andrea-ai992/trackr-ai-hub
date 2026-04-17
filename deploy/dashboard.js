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

const CHAT_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="AnDy">
<meta name="theme-color" content="#080808">
<title>AnDy — IA</title>
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
        <div class="hdr-title">AnDy</div>
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

  // API — Chat (proxy Anthropic, histoire par session)
  if (url.pathname === '/api/chat' && req.method === 'POST') {
    if (!ANTHROPIC_KEY) return json({ error: 'ANTHROPIC_API_KEY manquante sur le serveur' })
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

        const SYSTEM = `Tu es AnDy, l'IA personnelle d'Andrea Matlega.
App Trackr : React 19 + Vite, mobile-first, déployée sur Vercel. Repo: ${GITHUB_REPO}. App: ${APP_URL}.
Réponds en français. Direct, concis, sans intro inutile.
Tu peux aussi recevoir des commandes de tâche — si le message commence par /task, crée une tâche dans andy-tasks/.`

        const apiRes = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
          body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1024, system: SYSTEM, stream: false, messages: history.slice(-20) }),
          signal: AbortSignal.timeout(60000),
        }).catch(e => ({ ok: false, _err: e.message }))

        if (!apiRes.ok) {
          const errBody = await apiRes.json?.().catch(() => ({}))
          return json({ error: errBody?.error?.message || `API ${apiRes.status}` })
        }

        const d = await apiRes.json().catch(() => null)
        const reply = d?.content?.[0]?.text?.trim() || ''
        history.push({ role: 'assistant', content: reply })
        if (sess) sess.session.history = history.slice(-40)

        // /task dans le chat → injecte directement dans andy-tasks/
        if (message.trim().toLowerCase().startsWith('/task ')) {
          const desc = message.trim().slice(6).trim()
          if (desc) writeFileSync(resolve(TASKS, `chat-${Date.now()}.txt`), desc, 'utf8')
        }

        return json({ reply, historyLen: history.length })
      } catch (e) { return json({ error: e.message }) }
    })
    return
  }

  // Chat page (mobile-first, ajout écran d'accueil iOS)
  if (url.pathname === '/chat') return html(200, CHAT_HTML)

  // Dashboard
  html(200, DASH_HTML)
}).listen(PORT, () => {
  console.log(`Dashboard: http://62.238.12.221:${PORT}`)
  console.log(`Chat:      http://62.238.12.221:${PORT}/chat`)
  console.log(`Password: ${PASS}`)
})
