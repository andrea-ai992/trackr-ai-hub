// ─── Keep-alive — pings Vercel API every 4 minutes ───────────────────────────
// Prevents cold starts on Vercel free tier
// Runs as separate PM2 process: pm2 start keepalive.js --name keepalive

const VERCEL_URL = 'https://trackr-app-nu.vercel.app'

const ENDPOINTS = [
  { url: `${VERCEL_URL}/api/agents-log`, label: 'agents-log' },
]

async function ping() {
  const ts = new Date().toISOString().slice(11, 19)
  for (const { url, label } of ENDPOINTS) {
    try {
      const start = Date.now()
      const r = await fetch(url, { method: 'GET', headers: { 'User-Agent': 'TrackrKeepAlive/1.0' } })
      console.log(`[${ts}] ✅ ${label} — ${r.status} in ${Date.now() - start}ms`)
    } catch (e) {
      console.log(`[${ts}] ❌ ${label} — ${e.message}`)
    }
  }
}

console.log('🔄 Keep-alive started — pinging every 4 min')
ping()
setInterval(ping, 4 * 60 * 1000)
