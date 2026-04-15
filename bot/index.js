// ─── Trackr AnDy — Discord Bot (REST Polling) ────────────────────────────────
// No privileged intents needed — uses REST API polling instead of Gateway
// Runs locally with PM2, polls #andy-chat every 5 seconds

import http from 'http'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import dotenv from 'dotenv'

const __dir = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: `${__dir}/.env` })

const BOT_TOKEN  = process.env.DISCORD_BOT_TOKEN
const GUILD_ID   = process.env.DISCORD_GUILD_ID
const VERCEL_URL = process.env.VERCEL_URL || 'https://trackr-app-nu.vercel.app'
const PORT       = process.env.PORT || 3001
const API        = 'https://discord.com/api/v10'

if (!BOT_TOKEN || !GUILD_ID) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID')
  process.exit(1)
}

// ─── Discord REST helpers ─────────────────────────────────────────────────────
const headers = {
  Authorization: `Bot ${BOT_TOKEN}`,
  'Content-Type': 'application/json',
  'User-Agent': 'TrackrAndyBot/2.0',
}

async function discordGet(path) {
  const r = await fetch(`${API}${path}`, { headers })
  if (!r.ok) throw new Error(`Discord GET ${path} → ${r.status}`)
  return r.json()
}

async function discordPost(path, body) {
  const r = await fetch(`${API}${path}`, { method: 'POST', headers, body: JSON.stringify(body) })
  if (!r.ok) {
    const t = await r.text()
    throw new Error(`Discord POST ${path} → ${r.status}: ${t}`)
  }
  return r.json()
}

// ─── Find channels to monitor ─────────────────────────────────────────────────
const CHAT_CHANNEL_NAMES = new Set(['andy-chat', 'nexus-hub'])
let chatChannels = []   // { id, name }

async function discoverChannels() {
  try {
    const channels = await discordGet(`/guilds/${GUILD_ID}/channels`)
    chatChannels = channels.filter(c => CHAT_CHANNEL_NAMES.has(c.name))
    console.log(`📡 Monitoring channels: ${chatChannels.map(c => '#' + c.name).join(', ')}`)
  } catch (e) {
    console.error('❌ discoverChannels:', e.message)
  }
}

// ─── Track last seen message per channel ─────────────────────────────────────
const lastSeen = new Map()   // channelId → lastMessageId

async function initLastSeen() {
  for (const ch of chatChannels) {
    try {
      const msgs = await discordGet(`/channels/${ch.id}/messages?limit=1`)
      if (msgs.length > 0) lastSeen.set(ch.id, msgs[0].id)
    } catch {}
  }
  console.log('✅ Initialized — watching for new messages...')
}

// ─── Keyword → command hints ──────────────────────────────────────────────────
const COMMAND_HINTS = [
  { regex: /\b(prix|price|combien|cours)\b/i,                hint: '> 💡 `/price symbol:BTC-USD` pour un prix rapide.' },
  { regex: /\b(analyse|technique|rsi|macd|signal)\b/i,       hint: '> 💡 `/analyze symbol:AAPL` pour une analyse technique.' },
  { regex: /\b(portfolio|p&l|gains|position)\b/i,            hint: '> 💡 `/portfolio` pour voir ton P&L.' },
  { regex: /\b(alerte|alert|quand .+ monte)\b/i,             hint: '> 💡 `/alert symbol:BTC-USD price:70000 direction:above`' },
  { regex: /\b(rapport|report|résumé|marché aujourd'hui)\b/i, hint: '> 💡 `/report type:daily` pour un rapport complet.' },
  { regex: /\b(aide|help|commande|que peux-tu)\b/i,          hint: '> 💡 `/guide` pour voir tout ce que je peux faire.' },
]

function getCommandHint(text) {
  for (const { regex, hint } of COMMAND_HINTS) {
    if (regex.test(text)) return hint
  }
  return null
}

// ─── Call AnDy (SSE streaming → collect full text) ───────────────────────────
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

    // Collect SSE tokens into full text
    const raw = await res.text()
    let fullText = ''
    for (const line of raw.split('\n')) {
      if (!line.startsWith('data: ')) continue
      try {
        const ev = JSON.parse(line.slice(6))
        if (ev.type === 'token') fullText += ev.text
      } catch {}
    }
    return fullText.replace(/\[CHART:[^\]]+\]/g, '').trim().slice(0, 4000) || null
  } catch (e) {
    console.error('callAnDy error:', e.message)
    return null
  }
}

// ─── Show typing indicator ────────────────────────────────────────────────────
async function sendTyping(channelId) {
  try { await discordPost(`/channels/${channelId}/typing`, {}) } catch {}
}

// ─── Reply to a message ───────────────────────────────────────────────────────
async function replyTo(channelId, messageId, text) {
  const hint = getCommandHint(text)

  // Split into 2000-char chunks if needed
  const chunks = []
  let remaining = text
  while (remaining.length > 0) {
    chunks.push(remaining.slice(0, 1990))
    remaining = remaining.slice(1990)
  }

  for (let i = 0; i < chunks.length; i++) {
    const body = {
      content: chunks[i],
      message_reference: i === 0 ? { message_id: messageId } : undefined,
      allowed_mentions: { replied_user: false },
    }
    // Add hint as extra message on last chunk
    if (i === chunks.length - 1 && hint) {
      body.content += `\n\n${hint}`
    }
    await discordPost(`/channels/${channelId}/messages`, body)
  }
}

// ─── Poll a single channel ────────────────────────────────────────────────────
async function pollChannel(ch) {
  try {
    const after = lastSeen.get(ch.id)
    const url = `/channels/${ch.id}/messages?limit=10${after ? `&after=${after}` : ''}`
    const msgs = await discordGet(url)

    // Messages come newest-first, reverse for chronological order
    const newMsgs = msgs.reverse().filter(m => !m.author.bot && m.content?.trim().length >= 3)

    for (const msg of newMsgs) {
      lastSeen.set(ch.id, msg.id)
      console.log(`💬 [#${ch.name}] ${msg.author.username}: ${msg.content.slice(0, 60)}`)

      // Send typing, call AnDy, reply
      await sendTyping(ch.id)
      const reply = await callAnDy(msg.content)
      if (reply) {
        await replyTo(ch.id, msg.id, reply)
        console.log(`✅ Replied to ${msg.author.username}`)
      } else {
        await discordPost(`/channels/${ch.id}/messages`, {
          content: '❌ Erreur de connexion à AnDy. Réessaie dans quelques secondes.',
          message_reference: { message_id: msg.id },
          allowed_mentions: { replied_user: false },
        })
      }
    }
  } catch (e) {
    if (!e.message.includes('50013')) // ignore missing permissions
      console.error(`❌ pollChannel #${ch.name}:`, e.message)
  }
}

// ─── Main poll loop ───────────────────────────────────────────────────────────
let polling = false
async function pollAll() {
  if (polling) return  // prevent overlap
  polling = true
  try {
    for (const ch of chatChannels) {
      await pollChannel(ch)
    }
  } finally {
    polling = false
  }
}

// ─── Cron — call discord-cron every 15 min ───────────────────────────────────
async function runCron() {
  try {
    const r = await fetch(`${VERCEL_URL}/api/discord-cron`, {
      headers: { 'User-Agent': 'TrackrAndyBot/2.0' }
    })
    const d = await r.json()
    console.log('🤖 Cron done:', JSON.stringify(d).slice(0, 80))
  } catch (e) {
    console.error('❌ Cron failed:', e.message)
  }
}

// ─── HTTP health server ───────────────────────────────────────────────────────
const server = http.createServer((_req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify({
    status: 'online',
    channels: chatChannels.map(c => '#' + c.name),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  }))
})
server.listen(PORT, () => console.log(`🌐 Health server on :${PORT}`))

// ─── Startup ──────────────────────────────────────────────────────────────────
console.log('🧠 AnDy Bot starting (REST polling mode)...')
await discoverChannels()
await initLastSeen()
await runCron()

// Poll every 5 seconds
setInterval(pollAll, 5000)

// Cron every 15 minutes
setInterval(runCron, 15 * 60 * 1000)

process.on('SIGTERM', () => { server.close(); process.exit(0) })
process.on('SIGINT',  () => { server.close(); process.exit(0) })
