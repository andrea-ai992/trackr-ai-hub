// ─── Setup Discord Server — Run once ──────────────────────────────────────────
// node bot/setup-server.js
// Crée toutes les catégories + channels + poste le guide

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

async function api(method, path, body) {
  const r = await fetch(`${API}${path}`, {
    method, headers: H,
    ...(body ? { body: JSON.stringify(body) } : {})
  })
  const text = await r.text()
  try { return JSON.parse(text) } catch { return { _raw: text, status: r.status } }
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Structure du serveur ─────────────────────────────────────────────────────
const STRUCTURE = [
  {
    category: '📋 GUIDE',
    channels: [
      { name: 'guide-andy',  topic: 'Guide complet — commandes & statut live · mis à jour auto' },
      { name: 'bienvenue',   topic: 'Bienvenue sur le serveur AnDy' },
    ]
  },
  {
    category: '🧠 ANDY IA',
    channels: [
      { name: 'andy-chat',   topic: 'Chat IA général — pose n\'importe quelle question' },
      { name: 'andy-voice',  topic: 'Commandes vocales & transcriptions' },
    ]
  },
  {
    category: '📊 FINANCE',
    channels: [
      { name: 'crypto',          topic: 'Crypto, Bitcoin, altcoins — analyses AnDy' },
      { name: 'trading',         topic: 'Trading, positions, thèses' },
      { name: 'market-scanner',  topic: 'Scanner marchés — signaux auto' },
      { name: 'oracle-predictions', topic: 'Prédictions IA — ne pas utiliser comme conseil' },
    ]
  },
  {
    category: '🔧 DÉVELOPPEMENT',
    channels: [
      { name: 'dev',          topic: 'Développement Trackr — questions, idées, code' },
      { name: 'tasks',        topic: '!task, !urgent, !status, !queue' },
      { name: 'deployments',  topic: 'Déploiements Vercel — commits & releases' },
      { name: 'code-review',  topic: 'Reviews de code — output AnDy' },
      { name: 'bugs',         topic: 'Bugs détectés — issues à résoudre' },
      { name: 'performance',  topic: 'Métriques & optimisations' },
    ]
  },
  {
    category: '📡 MONITORING',
    channels: [
      { name: 'brain-cycles', topic: 'IA autonome — cycles d\'amélioration' },
      { name: 'agent-forge',  topic: 'Agents IA en action' },
      { name: 'app-pulse',    topic: 'Statut app & alertes auto' },
      { name: 'andy-logs',    topic: 'Logs daemon — notifications secondaires' },
    ]
  },
  {
    category: '🔒 ADMIN',
    channels: [
      { name: 'admin',        topic: 'Commandes admin — accès restreint' },
      { name: 'admin-tasks',  topic: 'Tâches admin — !task, !run, !status' },
      { name: 'admin-logs',   topic: 'Logs admin — output only' },
    ]
  },
]

const GUIDE_CONTENT = `# ⟨◈⟩ AnDy — Guide & Statut

## 🧠 AnDy (bot principal)
Parle normalement dans n'importe quel canal.

| Commande | Action |
|---------|--------|
| \`!think <question>\` | Analyse approfondie |
| \`!web <question>\` | Mode infos récentes |
| \`!task <desc>\` | Créer une tâche IA (admin) |
| \`!status\` | Statut du bot |
| \`!help\` | Aide complète |

---

## 🔧 AnDy Dev (bot développement)
Actif dans : \`#dev\` \`#tasks\` \`#deployments\` \`#bugs\`

| Commande | Action |
|---------|--------|
| \`!task <desc>\` | Tâche manuelle (priorité haute) |
| \`!urgent <desc>\` | Tâche urgente — interruption immédiate |
| \`!status\` | DONE / QUEUE / RUNNING / ERROR |
| \`!queue\` | Liste complète de la queue |
| \`!logs [n]\` | Derniers logs daemon |
| \`!deploy\` | Derniers commits GitHub |

---

## 📡 Channels
| Canal | Rôle |
|-------|------|
| \`#andy-chat\` | 🧠 Chat IA général |
| \`#crypto\` \`#trading\` | 📊 Finance & marchés |
| \`#dev\` \`#tasks\` | 🔧 Développement |
| \`#deployments\` | 🚀 Commits & releases |
| \`#brain-cycles\` | 🤖 IA autonome |
| \`#bugs\` \`#performance\` | 🐛 Issues |

*Se rafraîchit automatiquement toutes les 5 min*`

async function setup() {
  console.log('🚀 Setup serveur Discord...\n')

  // Récupère les channels existants
  const existing = await api('GET', `/guilds/${GUILD_ID}/channels`)
  if (!Array.isArray(existing)) {
    console.error('❌ Impossible de récupérer les channels:', existing)
    process.exit(1)
  }

  const existingNames = new Set(existing.map(c => c.name.toLowerCase()))
  const existingCats  = new Map(existing.filter(c => c.type === 4).map(c => [c.name, c.id]))

  let guideChannelId = null

  for (const { category, channels } of STRUCTURE) {
    await sleep(500)

    // Crée ou trouve la catégorie
    let catId = existingCats.get(category)
    if (!catId) {
      const cat = await api('POST', `/guilds/${GUILD_ID}/channels`, { name: category, type: 4 })
      catId = cat.id
      console.log(`📁 Catégorie créée: ${category}`)
      await sleep(400)
    } else {
      console.log(`📁 Catégorie existante: ${category}`)
    }

    // Crée les channels
    for (const ch of channels) {
      if (existingNames.has(ch.name.toLowerCase())) {
        console.log(`  ✓ #${ch.name} existe déjà`)
        const found = existing.find(c => c.name.toLowerCase() === ch.name.toLowerCase())
        if (ch.name === 'guide-andy' && found) guideChannelId = found.id
        continue
      }

      const created = await api('POST', `/guilds/${GUILD_ID}/channels`, {
        name: ch.name,
        type: 0,
        parent_id: catId,
        topic: ch.topic,
      })
      console.log(`  ✅ #${ch.name} créé`)
      if (ch.name === 'guide-andy') guideChannelId = created.id
      await sleep(600)
    }
  }

  // Poste le guide dans #guide-andy
  if (guideChannelId) {
    console.log('\n📋 Posting guide dans #guide-andy...')

    // Cherche un message existant du bot
    const msgs = await api('GET', `/channels/${guideChannelId}/messages?limit=10`)
    const botMsg = Array.isArray(msgs) ? msgs.find(m => m.author?.bot && m.content?.includes('⟨◈⟩ AnDy')) : null

    if (botMsg) {
      await api('PATCH', `/channels/${guideChannelId}/messages/${botMsg.id}`, { content: GUIDE_CONTENT })
      console.log('✅ Guide mis à jour')
      // Sauvegarde l'ID pour andy-dev.js
      writeFileSync(resolve(__dir, '.guide-state.json'), JSON.stringify({ channelId: guideChannelId, messageId: botMsg.id }), 'utf8')
    } else {
      const msg = await api('POST', `/channels/${guideChannelId}/messages`, { content: GUIDE_CONTENT })
      console.log('✅ Guide posté')
      if (msg?.id) {
        await api('PUT', `/channels/${guideChannelId}/pins/${msg.id}`, {})
        writeFileSync(resolve(__dir, '.guide-state.json'), JSON.stringify({ channelId: guideChannelId, messageId: msg.id }), 'utf8')
        console.log('📌 Guide épinglé')
      }
    }
  }

  console.log('\n✅ Setup terminé !')
  console.log('💡 Lance maintenant: pm2 restart andy-dev-bot')
}

setup().catch(e => { console.error('❌ Erreur:', e.message); process.exit(1) })
