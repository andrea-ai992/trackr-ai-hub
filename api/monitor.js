// ─── Trackr Live Monitor ───────────────────────────────────────────────────────
// Watches ALL critical endpoints and memory patterns in real-time
// Posts alerts to #app-pulse Discord channel on degradation
// Runs every minute via Vercel cron
// Can also be triggered manually: GET /api/monitor?force=true

const APP_URL = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const GUILD_ID  = process.env.DISCORD_GUILD_ID

const DISCORD_CH = {
  pulse:   process.env.DISCORD_CH_APP_PULSE   || '',
  alerts:  process.env.DISCORD_CH_ANNONCES    || '',
  adminLog: process.env.DISCORD_CH_ADMIN_LOGS || '',
}

// ─── Endpoints to monitor ────────────────────────────────────────────────────
// All checks run in parallel with tight timeouts to fit within the 10s default
const WATCH_ENDPOINTS = [
  { name: 'AnDy API',     path: '/api/andy',         method: 'POST',
    body: { messages: [{ role: 'user', content: 'ping' }], portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [] },
    expectStream: true, timeout: 8000, critical: true },
  { name: 'Memory API',   path: '/api/memory',        method: 'GET',  timeout: 4000,  critical: true },
  { name: 'Reports API',  path: '/api/reports',       method: 'GET',  timeout: 4000,  critical: false },
  { name: 'Brain API',    path: '/api/brain',         method: 'GET',  timeout: 4000,  critical: false },
]

// ─── Incident state (in-memory, resets on cold start) ──────────────────────
const incidentTracker = {}  // endpointName → { failCount, alerted, lastError }

// ─── Discord helper ──────────────────────────────────────────────────────────
async function postDiscord(channelId, content) {
  if (!BOT_TOKEN || !channelId) return
  try {
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'TrackrMonitor/1.0',
      },
      body: JSON.stringify({ content }),
    })
  } catch {}
}

// ─── Check a single endpoint ─────────────────────────────────────────────────
async function checkEndpoint(ep) {
  const start = Date.now()
  const result = { name: ep.name, ok: false, latency: 0, error: null }

  try {
    const opts = {
      method: ep.method,
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'TrackrMonitor/1.0' },
      signal: AbortSignal.timeout(ep.timeout),
    }
    if (ep.body) opts.body = JSON.stringify(ep.body)

    const res = await fetch(`${APP_URL}${ep.path}`, opts)
    result.latency = Date.now() - start
    result.status = res.status

    if (ep.expectStream) {
      // Just check that we get an OK status + a bit of content
      result.ok = res.status === 200
      // Drain the first chunk to confirm streaming works
      const reader = res.body?.getReader()
      if (reader) {
        const { value } = await reader.read()
        result.ok = result.ok && value?.length > 0
        reader.cancel()
      }
    } else {
      result.ok = res.status >= 200 && res.status < 500
      if (!result.ok) result.error = `HTTP ${res.status}`
    }
  } catch (e) {
    result.latency = Date.now() - start
    result.error = e.name === 'TimeoutError' ? `Timeout (${ep.timeout}ms)` : e.message
    result.ok = false
  }

  return result
}

// ─── Scan recent memory for error spikes (fast version) ──────────────────────
async function checkErrorSpike(memoryEntries) {
  try {
    if (!Array.isArray(memoryEntries)) return null
    const cutoff = Date.now() - 15 * 60 * 1000
    const recent = memoryEntries.filter(e =>
      e.type === 'error' && new Date(e.createdAt || e.timestamp || 0).getTime() > cutoff
    )
    return recent.length >= 5 ? { count: recent.length } : null
  } catch { return null }
}

// ─── Check if self-improve is stuck (uses cached memory result) ──────────────
function checkSelfImproveStuck(memoryEntries) {
  try {
    if (!Array.isArray(memoryEntries)) return false
    const last = memoryEntries.find(e => e.type === 'self_improve')
    if (!last) return false
    const hoursSince = (Date.now() - new Date(last.createdAt || 0).getTime()) / 3600000
    return hoursSince > 4
  } catch { return false }
}

// ─── Auto-trigger self-improve if issues found ────────────────────────────────
async function triggerSelfImprove(focus = 'bugs') {
  try {
    await fetch(`${APP_URL}/api/self-improve?focus=${focus}`, {
      signal: AbortSignal.timeout(5000),
    })
  } catch {}
}

// ─── Main monitor handler ─────────────────────────────────────────────────────
export default async function handler(req, res) {
  const force = req.query?.force === 'true'
  const silent = req.query?.silent === 'true'

  const results = []
  const failures = []
  const criticalFailures = []

  // 1. All checks in parallel — must complete within ~8s total
  const [checksResult, memResult] = await Promise.allSettled([
    Promise.allSettled(WATCH_ENDPOINTS.map(checkEndpoint)),
    fetch(`${APP_URL}/api/memory?limit=20`, { signal: AbortSignal.timeout(3000) }).then(r => r.json()).catch(() => []),
  ])

  const checks = checksResult.status === 'fulfilled' ? checksResult.value : []
  const memoryEntries = memResult.status === 'fulfilled' ? memResult.value?.entries || memResult.value || [] : []

  for (let i = 0; i < checks.length; i++) {
    const ep = WATCH_ENDPOINTS[i]
    const r = checks[i]?.status === 'fulfilled' ? checks[i].value : { name: ep.name, ok: false, error: 'check crashed' }
    results.push(r)

    if (!r.ok) {
      failures.push(r)
      if (ep.critical) criticalFailures.push(r)
      if (!incidentTracker[r.name]) incidentTracker[r.name] = { failCount: 0, alerted: false }
      incidentTracker[r.name].failCount++
      incidentTracker[r.name].lastError = r.error
    } else {
      if (incidentTracker[r.name]?.alerted) {
        await postDiscord(DISCORD_CH.pulse, `✅ **Récupération**: ${r.name} de nouveau OK (${r.latency}ms)`)
      }
      incidentTracker[r.name] = { failCount: 0, alerted: false }
    }
  }

  // 2. Error spike + stuck check using cached memory data (no extra fetch)
  const spike = checkErrorSpike(memoryEntries)
  const stuck = checkSelfImproveStuck(memoryEntries)

  // 4. Build status summary
  const status = {
    ok: failures.length === 0 && !spike && !stuck,
    timestamp: new Date().toISOString(),
    endpoints: results.map(r => ({
      name: r.name,
      ok: r.ok,
      latency: r.latency,
      error: r.error || null,
    })),
    errorSpike: spike ? spike.count : 0,
    selfImproveStuck: stuck,
    criticalDown: criticalFailures.map(f => f.name),
  }

  // 5. Alert logic
  const alertLines = []

  for (const failure of criticalFailures) {
    const tracker = incidentTracker[failure.name]
    // Alert after 2 consecutive failures, then don't repeat until recovery
    if (tracker.failCount >= 2 && !tracker.alerted) {
      tracker.alerted = true
      alertLines.push(`🔴 **${failure.name}** DOWN — ${failure.error || `HTTP ${failure.status}`}`)
      // Auto-trigger self-improve for bugs
      await triggerSelfImprove('bugs')
    }
  }

  if (spike) {
    alertLines.push(`⚠️ **Spike d'erreurs**: ${spike.count} erreurs en 15 min`)
    await triggerSelfImprove('bugs')
  }

  if (stuck) {
    alertLines.push(`⏸️ **Auto-amélioration bloquée** — pas de cycle depuis 4h+`)
    await triggerSelfImprove('full')
  }

  // 6. Post alerts if any
  if (alertLines.length > 0 && !silent) {
    const msg = [
      `🚨 **Monitor Trackr — Alerte**`,
      ...alertLines,
      `\`${new Date().toLocaleTimeString('fr-FR')}\``,
    ].join('\n')
    await postDiscord(DISCORD_CH.alerts || DISCORD_CH.pulse, msg)
  }

  // 7. Post daily pulse summary (when forced or on schedule)
  if (force || (new Date().getMinutes() === 0 && !silent)) {
    const okCount = results.filter(r => r.ok).length
    const avgLatency = Math.round(results.filter(r => r.latency).reduce((a, r) => a + r.latency, 0) / results.length)
    const pulse = [
      `📡 **Trackr Live Monitor** — ${okCount}/${results.length} endpoints OK`,
      failures.length > 0
        ? failures.map(f => `  • ❌ ${f.name}: ${f.error}`).join('\n')
        : `  • Tous les endpoints répondent`,
      spike ? `  • ⚠️ ${spike.count} erreurs récentes` : '',
      stuck ? `  • ⏸️ Auto-amélioration inactive` : '',
      `  • Latence moyenne: ${avgLatency}ms`,
      `\`${new Date().toISOString()}\``,
    ].filter(Boolean).join('\n')

    await postDiscord(DISCORD_CH.pulse, pulse)
  }

  res.status(status.ok ? 200 : 207).json(status)
}
