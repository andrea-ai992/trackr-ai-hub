// ─── Trackr AnDy — Discord Bot 24/7 ─────────────────────────────────────────
// Persistent bot on Render — handles direct messages + scheduled agent tasks
// Deploy: render.com (free tier, kept alive by GitHub Actions ping)

import { Client, GatewayIntentBits, ActivityType, EmbedBuilder } from 'discord.js'
import http from 'http'

const TOKEN      = process.env.DISCORD_BOT_TOKEN
const VERCEL_URL = process.env.VERCEL_URL || 'https://trackr-app-nu.vercel.app'
const PORT       = process.env.PORT || 3001

if (!TOKEN) { console.error('❌ Missing DISCORD_BOT_TOKEN'); process.exit(1) }

// ─── Discord client ───────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,   // Privileged — must be enabled in Dev Portal
  ],
})

// ─── Channel whitelist for direct chat ───────────────────────────────────────
// AnDy will respond to plain messages only in these channels
const CHAT_CHANNELS = new Set([
  'andy-chat',
  'nexus-hub',
])

// ─── Keyword → command suggestions (shown only when clearly relevant) ─────────
const COMMAND_HINTS = [
  { regex: /\b(prix|price|combien|coût|cours)\b/i,           hint: '> 💡 `/price symbol:BTC-USD` pour un prix rapide, ou `/scan` pour plusieurs actifs en une fois.' },
  { regex: /\b(analyse|analyser|technique|rsi|macd|signal)\b/i, hint: '> 💡 `/analyze symbol:AAPL interval:1h` pour une analyse technique complète.' },
  { regex: /\b(portfolio|p&l|gains|pertes|position)\b/i,     hint: '> 💡 `/portfolio` pour voir ton P&L et le risque de tes positions.' },
  { regex: /\b(alerte|alert|notif|quand .+ monte|quand .+ descend)\b/i, hint: '> 💡 `/alert symbol:BTC-USD price:70000 direction:above` pour une alerte automatique.' },
  { regex: /\b(code|bug|erreur|fix|refactor|performance)\b/i, hint: '> 💡 `/review focus:performance` pour que CodeReviewer analyse le code de l\'app.' },
  { regex: /\b(design|ui|ux|couleur|spacing|layout|composant)\b/i, hint: '> 💡 `/ui page:portfolio` pour que UIInspector inspecte l\'interface.' },
  { regex: /\b(rapport|report|résumé|marché aujourd'hui|semaine)\b/i, hint: '> 💡 `/report type:daily` pour un rapport complet du marché.' },
  { regex: /\b(aide|help|commande|que peux-tu|qu\'est-ce que tu|c\'est quoi)\b/i, hint: '> 💡 `/help` pour voir les 45 agents disponibles, ou `/guide` pour la progression.' },
]

function getCommandHint(text) {
  for (const { regex, hint } of COMMAND_HINTS) {
    if (regex.test(text)) return hint
  }
  return null
}

// ─── Call AnDy Vercel API ─────────────────────────────────────────────────────
async function callAnDy(userMessage) {
  try {
    const res = await fetch(`${VERCEL_URL}/api/andy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
        portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [],
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    return (data.text || '').replace(/\[CHART:[^\]]+\]/g, '').slice(0, 4000)
  } catch (e) {
    console.error('callAnDy error:', e.message)
    return null
  }
}

// ─── Message handler ──────────────────────────────────────────────────────────
client.on('messageCreate', async (message) => {
  // Ignore bots and webhooks
  if (message.author.bot || message.webhookId) return

  // Only respond in designated chat channels
  const channelName = message.channel.name || ''
  if (!CHAT_CHANNELS.has(channelName)) return

  // Ignore very short messages (reactions, "ok", "lol")
  const content = message.content.trim()
  if (content.length < 3) return

  // Show typing indicator
  await message.channel.sendTyping()

  const reply = await callAnDy(content)
  if (!reply) {
    await message.reply({ content: '❌ Erreur de connexion à AnDy. Réessaie dans quelques secondes.', allowedMentions: { repliedUser: false } })
    return
  }

  // Detect if a command hint would be useful
  const hint = getCommandHint(content)

  // Build embed
  const embed = new EmbedBuilder()
    .setAuthor({ name: '🧠 AnDy · Intelligence Centrale' })
    .setDescription(reply)
    .setColor(0x00daf3)
    .setFooter({ text: 'Trackr AI Hub · réponds directement ou utilise /andy' })
    .setTimestamp()

  // Add command hint as a field only when relevant
  if (hint) {
    embed.addFields({ name: '\u200b', value: hint })
  }

  await message.reply({ embeds: [embed], allowedMentions: { repliedUser: false } })
})

// ─── Bot ready ────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ AnDy bot online — ${client.user.tag}`)
  client.user.setPresence({
    activities: [{ name: 'Écris-moi dans #andy-chat · /guide', type: ActivityType.Watching }],
    status: 'online',
  })
  startScheduler()
})

// ─── Scheduled tasks ──────────────────────────────────────────────────────────
function startScheduler() {
  console.log('🕐 Scheduler démarré — scans toutes les 15 min')

  runCronTasks()
  setInterval(runCronTasks, 15 * 60 * 1000)

  // Rotate status every 5 min
  const statuses = [
    { name: 'Écris-moi dans #andy-chat', type: ActivityType.Watching },
    { name: 'les marchés · /scan',        type: ActivityType.Watching },
    { name: 'le code · /review',          type: ActivityType.Watching },
    { name: 'le design · /ui',            type: ActivityType.Watching },
    { name: '45 agents actifs · /guide',  type: ActivityType.Watching },
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
    console.log('✅ Cron done:', data)
  } catch (e) {
    console.error('❌ Cron failed:', e.message)
  }
}

// ─── HTTP health server (keeps Render free tier alive) ────────────────────────
const server = http.createServer((_req, res) => {
  const isReady = client.isReady()
  res.writeHead(isReady ? 200 : 503, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: isReady ? 'online' : 'connecting',
    bot: client.user?.tag || null,
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }))
})
server.listen(PORT, () => console.log(`🌐 Health server on :${PORT}`))

// ─── Graceful shutdown ────────────────────────────────────────────────────────
process.on('SIGTERM', () => { client.destroy(); server.close(); process.exit(0) })
process.on('SIGINT',  () => { client.destroy(); server.close(); process.exit(0) })

// ─── Login ────────────────────────────────────────────────────────────────────
client.login(TOKEN)
