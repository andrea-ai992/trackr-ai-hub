// ─── Setup Discord Server — Full Reset & Rebuild ──────────────────────────────
// node bot/setup-server.js
// Supprime tout, recrée proprement, poste le guide

import { readFileSync, writeFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir = dirname(fileURLToPath(import.meta.url))

try {
  const raw = readFileSync(`${__dir}/.env`, 'utf8')
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').replace(/[\r\n\\]+$/, '').trim()
  }
} catch {}

const TOKEN    = process.env.DISCORD_DEV_BOT_TOKEN
const GUILD_ID = process.env.DISCORD_GUILD_ID
const API      = 'https://discord.com/api/v10'
const H        = { Authorization: `Bot ${TOKEN}`, 'Content-Type': 'application/json', 'User-Agent': 'AndySetup/1.0' }

if (!TOKEN || !GUILD_ID) { console.error('❌ TOKEN ou GUILD_ID manquant'); process.exit(1) }

async function req(method, path, body) {
  await sleep(350) // respect rate limits
  const r = await fetch(`${API}${path}`, {
    method, headers: H,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  })
  if (r.status === 429) {
    const d = await r.json().catch(() => ({}))
    const wait = (d.retry_after || 2) * 1000 + 500
    console.log(`  ⏳ Rate limit — attente ${wait}ms`)
    await sleep(wait)
    return req(method, path, body)
  }
  const text = await r.text()
  try { return { ok: r.ok, status: r.status, data: JSON.parse(text) } }
  catch { return { ok: r.ok, status: r.status, data: text } }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Nouvelle structure consumer-friendly ────────────────────────────────────
const STRUCTURE = [
  {
    name: '🏠 Accueil',
    channels: [
      { name: 'bienvenue',  topic: 'Bienvenue sur le serveur AnDy · Trackr Intelligence' },
      { name: 'guide',      topic: 'Guide complet AnDy — commandes & statut live · mis à jour automatiquement', isGuide: true },
      { name: 'annonces',   topic: 'Annonces importantes — output seulement' },
    ]
  },
  {
    name: '🤖 AnDy',
    channels: [
      { name: 'aide',         topic: '🧠 Décris ce que tu veux faire — AnDy comprend et crée la tâche automatiquement' },
      { name: 'chat',         topic: 'Chat libre avec AnDy — questions, conseils, analyses' },
      { name: 'tâches',       topic: '!task <desc> · !urgent <desc> · !status · !queue · !logs · !deploy' },
      { name: 'mémoire',      topic: 'Ce qu\'AnDy a appris et retenu — log automatique' },
    ]
  },
  {
    name: '📊 Marchés',
    channels: [
      { name: 'crypto',     topic: 'Bitcoin, altcoins, DeFi — analyses & discussions' },
      { name: 'trading',    topic: 'Positions, niveaux, thèses de trading' },
      { name: 'signaux',    topic: 'Signaux automatiques — output AnDy' },
      { name: 'actus',      topic: 'Actualités financières — flux auto' },
    ]
  },
  {
    name: '🏗️ Trackr',
    channels: [
      { name: 'déploiements', topic: 'Commits GitHub & déploiements Vercel — !deploy' },
      { name: 'bugs',         topic: 'Bugs & issues — !task fix: description' },
      { name: 'idées',        topic: 'Idées de features — envoie tes suggestions' },
    ]
  },
  {
    name: '📡 Statut',
    channels: [
      { name: 'live',       topic: 'Statut daemon IA en direct — tasks running, queue, done' },
      { name: 'logs',       topic: 'Logs système — output seulement' },
    ]
  },
  {
    name: '🔐 Admin',
    channels: [
      { name: 'admin',      topic: 'Commandes admin — accès restreint' },
    ]
  },
]

// ─── Guide content ────────────────────────────────────────────────────────────
function buildGuide() {
  const now = new Date().toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
  return `# ⟨◈⟩ AnDy — Guide

## 💬 Parler à AnDy
Va dans **#chat** et écris ce que tu veux — AnDy répond à tout.

\`!think <question>\` → analyse approfondie
\`!web <question>\` → infos récentes

---

## ✅ Donner une tâche
Va dans **#tâches** :

\`!task redesign la page dashboard\` → tâche normale
\`!urgent fix le bug de login\` → priorité max, interrompt tout

\`!status\` → voir ce qu'AnDy est en train de faire
\`!queue\` → voir toutes les tâches en attente
\`!logs\` → voir les derniers logs
\`!deploy\` → voir les derniers commits

---

## 📊 Finance
**#crypto** et **#trading** → parle à AnDy de tes positions, il analyse comme un trader pro.

---

## 🏗️ Trackr App
**#déploiements** → chaque commit GitHub apparaît ici automatiquement
**#bugs** → signale un bug avec \`!task fix: description du bug\`
**#idées** → tes suggestions de features

---

## 📡 Statut en direct
**#live** → daemon IA online/offline, tâche en cours, queue

---

*Mis à jour le ${now} · Se rafraîchit toutes les 5 min*`
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function setup() {
  console.log('🚀 Reset & Setup serveur Discord...\n')

  // 1. Récupère tous les channels existants
  const { data: existing } = await req('GET', `/guilds/${GUILD_ID}/channels`)
  if (!Array.isArray(existing)) {
    console.error('❌ Impossible de récupérer les channels. Vérifie que le bot a la permission ADMIN.')
    console.error(existing)
    process.exit(1)
  }

  console.log(`📋 ${existing.length} channels trouvés\n`)

  // 2. Supprime tous les channels/catégories existants (sauf ceux gérés par Discord)
  console.log('🗑️  Suppression des channels existants...')
  for (const ch of existing) {
    if (ch.type === 4 || ch.type === 0 || ch.type === 2) {
      const { ok } = await req('DELETE', `/channels/${ch.id}`)
      console.log(`  ${ok ? '✅' : '❌'} Supprimé: #${ch.name} (${ch.type === 4 ? 'catégorie' : 'channel'})`)
    }
  }

  console.log('\n🏗️  Création de la nouvelle structure...\n')
  let guideChannelId = null

  // 3. Crée la nouvelle structure
  for (const { name: catName, channels } of STRUCTURE) {
    // Crée la catégorie
    const { data: cat } = await req('POST', `/guilds/${GUILD_ID}/channels`, { name: catName, type: 4 })
    console.log(`📁 ${catName}`)

    // Crée les channels
    for (const ch of channels) {
      const { data: created, ok } = await req('POST', `/guilds/${GUILD_ID}/channels`, {
        name: ch.name,
        type: 0,
        parent_id: cat.id,
        topic: ch.topic,
      })
      console.log(`  ${ok ? '✅' : '❌'} #${ch.name}`)
      if (ch.isGuide && created?.id) guideChannelId = created.id
    }
    console.log()
  }

  // 4. Poste le guide
  if (guideChannelId) {
    console.log('📋 Posting le guide dans #guide...')
    const { data: msg } = await req('POST', `/channels/${guideChannelId}/messages`, { content: buildGuide() })
    if (msg?.id) {
      await req('PUT', `/channels/${guideChannelId}/pins/${msg.id}`, {})
      writeFileSync(resolve(__dir, '.guide-state.json'), JSON.stringify({ channelId: guideChannelId, messageId: msg.id }), 'utf8')
      console.log('✅ Guide posté et épinglé\n')
    }
  }

  console.log('🎉 Setup terminé ! Serveur réorganisé au propre.')
  console.log('💡 Relance: pm2 restart andy-dev-bot discord-bot')
}

setup().catch(e => { console.error('❌ Erreur fatale:', e.message); process.exit(1) })
