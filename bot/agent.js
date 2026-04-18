// ─── Agent factory — one instance per bot ─────────────────────────────────────
// Usage: startBot(config) — runs independently with its own polling loop

import { writeFileSync, mkdirSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dir    = dirname(fileURLToPath(import.meta.url))
const TASKS_DIR = resolve(__dir, '..', 'andy-tasks')
try { mkdirSync(TASKS_DIR, { recursive: true }) } catch {}

const DISCORD_API = 'https://discord.com/api/v10'
const GROQ_URL    = 'https://api.groq.com/openai/v1/chat/completions'

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

export function startBot(cfg) {
  const {
    name,          // display name e.g. "CryptoAnDy"
    token,         // Discord bot token
    guildId,       // Discord server ID
    groqKey,       // Groq API key
    channels,      // Set or Array of channel names this bot monitors (null = all)
    systemPrompt,  // string or function(channelName) => string
    pollInterval = 2500,
    port = null,   // optional keepalive HTTP port
  } = cfg

  const BOT_START = Date.now()
  const BOT_SNOWFLAKE = String((BigInt(BOT_START - 1420070400000) << 22n))

  const monitorOnly = channels ? new Set(Array.isArray(channels) ? channels : [...channels]) : null

  const headers = {
    Authorization: `Bot ${token}`,
    'Content-Type': 'application/json',
    'User-Agent': `TrackrBot/${name}/1.0`,
  }

  const processed    = new Set()
  const channelLock  = new Map()
  const lastSeen     = new Map()
  const deadChannels = new Set()
  const failCount    = new Map()
  const monitored    = new Map()
  const ADMIN_IDS    = new Set()

  function log(...a) { console.log(`[${name}]`, ...a) }

  async function dFetch(path, opts = {}) {
    const r = await fetch(`${DISCORD_API}${path}`, { headers, ...opts })
    if (r.status === 429) {
      const d = await r.json().catch(() => ({}))
      await sleep((d.retry_after || 1) * 1000 + 200)
      return dFetch(path, opts)
    }
    return r
  }

  async function dGet(path) {
    const r = await dFetch(path)
    if (!r.ok) throw new Error(`GET ${path} → ${r.status}`)
    return r.json()
  }

  async function dPost(path, body) {
    const r = await dFetch(path, { method: 'POST', body: JSON.stringify(body) })
    if (!r.ok) { const t = await r.text(); throw new Error(`POST ${path} → ${r.status}: ${t.slice(0,80)}`) }
    return r.json()
  }

  async function editMsg(chId, msgId, content) {
    try {
      await dFetch(`/channels/${chId}/messages/${msgId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: content.slice(0, 1990) }),
      })
    } catch {}
  }

  async function sendReply(chId, msgId, text) {
    try {
      return await dPost(`/channels/${chId}/messages`, {
        content: text.slice(0, 1990),
        message_reference: { message_id: msgId, channel_id: chId },
        allowed_mentions: { replied_user: true },
      })
    } catch (e) { log('sendReply:', e.message) }
  }

  async function callGroq(userMsg, chName) {
    const sys = typeof systemPrompt === 'function' ? systemPrompt(chName) : systemPrompt
    try {
      const r = await fetch(GROQ_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${groqKey}` },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: sys }, { role: 'user', content: userMsg }],
          max_tokens: 600,
          temperature: 0.5,
        }),
        signal: AbortSignal.timeout(30000),
      })
      if (!r.ok) { log(`Groq ${r.status}`); return null }
      const d = await r.json().catch(() => null)
      return d?.choices?.[0]?.message?.content?.trim()?.slice(0, 1990) || null
    } catch (e) { log('callGroq:', e.message); return null }
  }

  async function processMessage(msg, chName) {
    if (processed.has(msg.id)) return
    if (BigInt(msg.id) <= BigInt(BOT_SNOWFLAKE)) return
    processed.add(msg.id)
    setTimeout(() => processed.delete(msg.id), 60000)

    if (msg.author?.bot) return
    const content = msg.content?.trim() || ''
    if (content.length < 2) return

    const userId   = msg.author?.id || ''
    const username = msg.author?.username || 'user'
    const isAdmin  = ADMIN_IDS.has(userId)

    // !task / !urgent — admin only
    if (isAdmin && /^!(task|urgent)\s+/i.test(content)) {
      const isUrgent = /^!urgent/i.test(content)
      const desc = content.replace(/^!(task|urgent)\s+/i, '').trim()
      const priority = isUrgent ? 'urgent' : 'manual'
      const fname = `${priority}-${Date.now()}.txt`
      try { writeFileSync(resolve(TASKS_DIR, fname), desc, 'utf8') } catch (e) {
        await sendReply(msg.channel_id, msg.id, `❌ ${e.message}`); return
      }
      await sendReply(msg.channel_id, msg.id,
        `${isUrgent ? '🚨 **URGENT**' : '✅ **Tâche créée**'} — \`${fname}\`\n> ${desc.slice(0, 100)}`)
      return
    }

    // !status
    if (isAdmin && content.trim() === '!status') {
      const up = Math.floor(process.uptime())
      await sendReply(msg.channel_id, msg.id,
        `**🟢 ${name}**\n• Uptime: ${Math.floor(up/60)}m${up%60}s\n• Channels: ${monitored.size - deadChannels.size} actifs`)
      return
    }

    log(`💬 [#${chName}] ${username}: ${content.slice(0, 80)}`)

    let ph
    try { ph = await sendReply(msg.channel_id, msg.id, '…') } catch { return }

    const reply = await callGroq(content, chName)
    if (!reply) { if (ph?.id) await editMsg(msg.channel_id, ph.id, '…'); return }
    if (ph?.id) await editMsg(msg.channel_id, ph.id, reply)
    else        await sendReply(msg.channel_id, msg.id, reply)

    log(`✅ ${username} → ${reply.length} chars`)
  }

  async function discover() {
    try {
      const guild = await dGet(`/guilds/${guildId}`)
      if (guild.owner_id) { ADMIN_IDS.add(guild.owner_id); log(`👑 Owner: ${guild.owner_id}`) }
      const chs = await dGet(`/guilds/${guildId}/channels`)
      monitored.clear()
      for (const ch of chs.filter(c => c.type === 0)) {
        if (monitorOnly && !monitorOnly.has(ch.name)) continue
        if (!deadChannels.has(ch.id)) monitored.set(ch.id, ch)
      }
      log(`📡 Monitoring ${monitored.size} channels: ${[...monitored.values()].map(c => '#'+c.name).join(', ')}`)
    } catch (e) { log('discover:', e.message) }
  }

  async function initLastSeen() {
    const chs = [...monitored.values()]
    for (let i = 0; i < chs.length; i += 5) {
      await Promise.allSettled(chs.slice(i, i + 5).map(async ch => {
        lastSeen.set(ch.id, BOT_SNOWFLAKE)
        try {
          const msgs = await dGet(`/channels/${ch.id}/messages?limit=1`)
          if (msgs.length > 0) {
            const pick = BigInt(msgs[0].id) > BigInt(BOT_SNOWFLAKE) ? msgs[0].id : BOT_SNOWFLAKE
            lastSeen.set(ch.id, pick)
          }
        } catch (e) {
          if (e.message.includes('403')) { deadChannels.add(ch.id); monitored.delete(ch.id) }
        }
      }))
      await sleep(200)
    }
    log(`✅ Ready — ${monitored.size} channels actifs`)
  }

  let polling = false
  async function pollAll() {
    if (polling) return
    polling = true
    try {
      for (const ch of monitored.values()) {
        try {
          const after = lastSeen.get(ch.id)
          const msgs = await dGet(`/channels/${ch.id}/messages?limit=5${after ? `&after=${after}` : ''}`)
          const fresh = msgs.reverse().filter(m => !m.author?.bot && m.content?.trim().length >= 2)
          failCount.set(ch.id, 0)
          for (const msg of fresh) {
            lastSeen.set(ch.id, msg.id)
            if (!channelLock.get(ch.id)) {
              channelLock.set(ch.id, true)
              processMessage(msg, ch.name)
                .catch(e => log('processMessage:', e.message))
                .finally(() => channelLock.delete(ch.id))
            }
          }
        } catch (e) {
          const f = (failCount.get(ch.id) || 0) + 1
          failCount.set(ch.id, f)
          if (f >= 10 && e.message.includes('403')) {
            deadChannels.add(ch.id); monitored.delete(ch.id)
            log(`⚠️ Skipping #${ch.name}`)
          }
        }
        await sleep(40)
      }
    } finally { polling = false }
  }

  // ── Scheduler ─────────────────────────────────────────────────────────────
  // schedules = [{ hour, minute, channel, prompt, label }]
  const firedToday = new Set()

  async function postToChannel(chName, content) {
    const ch = [...monitored.values()].find(c => c.name === chName)
    if (!ch) { log(`⚠️ Channel #${chName} non trouvé`); return }
    try {
      await dPost(`/channels/${ch.id}/messages`, { content: content.slice(0, 1990) })
      log(`📤 Posted to #${chName}`)
    } catch (e) { log(`postToChannel #${chName}:`, e.message) }
  }

  function runScheduler() {
    const { schedules = [] } = cfg
    if (!schedules.length) return

    setInterval(async () => {
      const now = new Date()
      const hhmm = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`
      const key = `${hhmm}`

      for (const s of schedules) {
        const match = `${s.hour}:${String(s.minute).padStart(2,'0')}`
        if (hhmm !== match) continue
        if (firedToday.has(key + s.channel)) continue
        firedToday.add(key + s.channel)
        setTimeout(() => firedToday.delete(key + s.channel), 70000)

        log(`⏰ Scheduled: ${s.label || s.channel}`)
        const reply = await callGroq(s.prompt, s.channel)
        if (reply) await postToChannel(s.channel, reply)
      }
    }, 30000) // check every 30s
  }

  async function run() {
    log(`🚀 Démarrage...`)
    if (!token || !guildId || !groqKey) { log('❌ Config manquante'); return }
    await discover()
    await initLastSeen()
    setInterval(pollAll, pollInterval)
    setInterval(discover, 5 * 60 * 1000)
    runScheduler()
    log(`🟢 En ligne`)
  }

  run().catch(e => log('FATAL:', e.message))
}
