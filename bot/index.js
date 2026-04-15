// ─── Trackr AnDy — Discord Bot 24/7 ─────────────────────────────────────────
// Runs persistently on Railway — keeps bot online + scheduled agent tasks
// Deploy: railway up (from /bot directory)

import { Client, GatewayIntentBits, ActivityType } from 'discord.js'

const TOKEN = process.env.DISCORD_BOT_TOKEN
const VERCEL_URL = process.env.VERCEL_URL || 'https://trackr-app-nu.vercel.app'

if (!TOKEN) {
  console.error('❌ Missing DISCORD_BOT_TOKEN')
  process.exit(1)
}

// ─── Discord client ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [GatewayIntentBits.Guilds],
})

client.once('ready', () => {
  console.log(`✅ AnDy bot online — ${client.user.tag}`)

  // Set bot status
  client.user.setPresence({
    activities: [{ name: '45 agents actifs · /andy', type: ActivityType.Watching }],
    status: 'online',
  })

  // Start scheduled tasks
  startScheduler()
})

// ─── Scheduled tasks ──────────────────────────────────────────────────────────
function startScheduler() {
  console.log('🕐 Scheduler démarré — scans toutes les 15 min')

  // Run immediately on start
  runCronTasks()

  // Then every 15 minutes
  setInterval(runCronTasks, 15 * 60 * 1000)

  // Rotate bot status every 5 min
  const statuses = [
    { name: '45 agents actifs · /andy', type: ActivityType.Watching },
    { name: 'les marchés · /scan', type: ActivityType.Watching },
    { name: 'le code · /review', type: ActivityType.Watching },
    { name: 'le design · /ui', type: ActivityType.Watching },
    { name: 'ton portfolio · /portfolio', type: ActivityType.Watching },
  ]
  let si = 0
  setInterval(() => {
    si = (si + 1) % statuses.length
    client.user?.setActivity(statuses[si])
  }, 5 * 60 * 1000)
}

async function runCronTasks() {
  const now = new Date()
  console.log(`🤖 Cron run — ${now.toISOString()}`)

  try {
    const r = await fetch(`${VERCEL_URL}/api/discord-cron`, {
      method: 'GET',
      headers: { 'User-Agent': 'TrackrAndyBot/1.0' },
    })
    const data = await r.json()
    console.log(`✅ Cron done:`, data)
  } catch (e) {
    console.error(`❌ Cron failed:`, e.message)
  }
}

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => { client.destroy(); process.exit(0) })
process.on('SIGINT',  () => { client.destroy(); process.exit(0) })

// ─── Login ────────────────────────────────────────────────────────────────────
client.login(TOKEN)
