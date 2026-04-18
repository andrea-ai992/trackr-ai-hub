#!/usr/bin/env node
// ─── andy task — soumet une tâche au daemon depuis n'importe où ───────────────
// Usage:
//   node cli/task.js "description de la tâche"
//   node cli/task.js urgent "tâche urgente"
//   node cli/task.js status
//   node cli/task.js queue

import { existsSync, readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))
const ROOT  = resolve(__dir, '..')

for (const f of ['.env', '.env.local']) {
  const fp = resolve(ROOT, f)
  if (existsSync(fp)) {
    readFileSync(fp, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([^#=\s][^=]*)=(.*)$/)
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    })
  }
}

const DASH       = process.env.DASHBOARD_URL || 'http://62.238.12.221:4000'
const PASS       = process.env.DASHBOARD_PASS || 'LuckyGus123'
const TASKS_DIR  = resolve(ROOT, 'andy-tasks')
const AUTH       = { Authorization: `Bearer ${PASS}`, 'Content-Type': 'application/json' }

const R  = '\x1b[0m'
const G  = '\x1b[32m'
const C  = '\x1b[36m'
const Y  = '\x1b[33m'
const Re = '\x1b[31m'
const D  = '\x1b[90m'
const B  = '\x1b[1m'

async function post(path, body) {
  try {
    const r = await fetch(`${DASH}${path}`, { method: 'POST', headers: AUTH, body: JSON.stringify(body), signal: AbortSignal.timeout(8000) })
    return { ok: r.ok, data: await r.json().catch(() => ({})) }
  } catch { return { ok: false, local: true } }
}

async function get(path) {
  try {
    const r = await fetch(`${DASH}${path}`, { headers: AUTH, signal: AbortSignal.timeout(8000) })
    return await r.json()
  } catch { return null }
}

function localFallback(desc, priority) {
  try {
    const fname = `${priority}-${Date.now()}.txt`
    writeFileSync(resolve(TASKS_DIR, fname), desc, 'utf8')
    return fname
  } catch { return null }
}

const args = process.argv.slice(2)
const cmd  = args[0]?.toLowerCase()

// ── status ────────────────────────────────────────────────────────────────────
if (cmd === 'status' || cmd === 's') {
  const d = await get('/api/tasks')
  if (!d) { console.log(`${Re}❌ Serveur inaccessible${R}`); process.exit(1) }
  const f = d.files || {}
  console.log(`\n${B}⟨◈⟩ AnDy — Statut${R}`)
  console.log(`  ${G}✅ DONE    ${f.done?.length || 0}${R}`)
  console.log(`  ${C}⏳ QUEUE   ${f.queue?.length || 0}${R}`)
  console.log(`  ${Y}⟳  RUNNING ${f.running?.length || 0}${R}`)
  console.log(`  ${Re}❌ ERROR   ${f.error?.length || 0}${R}`)
  if (f.running?.length) console.log(`\n  ${Y}En cours: ${f.running[0].replace('.running','').slice(0,60)}${R}`)
  if (f.queue?.length)   console.log(`  ${D}Prochain: ${f.queue[0].replace('.txt','').slice(0,60)}${R}`)
  console.log()
  process.exit(0)
}

// ── queue ─────────────────────────────────────────────────────────────────────
if (cmd === 'queue' || cmd === 'q') {
  const d = await get('/api/tasks')
  if (!d) { console.log(`${Re}❌ Serveur inaccessible${R}`); process.exit(1) }
  const f = d.files || {}
  const all = [...(f.running||[]).map(n=>`${Y}⟳  ${n.replace('.running','')}${R}`), ...(f.queue||[]).map((n,i)=>`${D}${i+1}. ${n.replace('.txt','')}${R}`)]
  console.log(`\n${B}📋 Queue AnDy${R}`)
  if (!all.length) console.log(`  ${D}Queue vide — AnDy est idle${R}`)
  else all.forEach(l => console.log('  ' + l))
  console.log()
  process.exit(0)
}

// ── task / urgent ─────────────────────────────────────────────────────────────
let priority = 'manual'
let desc = ''

if (cmd === 'urgent' || cmd === 'u') {
  priority = 'urgent'
  desc = args.slice(1).join(' ').trim()
} else if (cmd === 'task' || cmd === 't') {
  desc = args.slice(1).join(' ').trim()
} else {
  // Tout le reste = description directe
  desc = args.join(' ').trim()
}

if (!desc) {
  console.log(`\n${B}Usage:${R}`)
  console.log(`  ${C}node cli/task.js "description de la tâche"${R}          ${D}→ tâche normale${R}`)
  console.log(`  ${C}node cli/task.js urgent "tâche urgente"${R}             ${D}→ priorité max${R}`)
  console.log(`  ${C}node cli/task.js status${R}                             ${D}→ voir le statut${R}`)
  console.log(`  ${C}node cli/task.js queue${R}                              ${D}→ voir la queue${R}`)
  console.log()
  process.exit(0)
}

// Envoie au serveur
const label = priority === 'urgent' ? `${Re}🚨 URGENT${R}` : `${G}✅ Tâche${R}`
console.log(`\n${label} ${B}${desc.slice(0,80)}${R}`)
console.log(`${D}Envoi au serveur...${R}`)

const { ok, local } = await post('/api/task', { desc, priority })

if (ok) {
  console.log(`${G}✅ Reçue par le serveur — AnDy va l'exécuter${priority === 'urgent' ? ' en priorité absolue' : ''}${R}`)
} else if (local) {
  // Fallback local si serveur inaccessible
  const fname = localFallback(desc, priority)
  if (fname) console.log(`${Y}⚠️  Serveur inaccessible — sauvegardée localement: ${fname}${R}`)
  else console.log(`${Re}❌ Échec — serveur inaccessible et dossier andy-tasks/ introuvable${R}`)
} else {
  console.log(`${Re}❌ Erreur serveur${R}`)
}
console.log()
