// ─── Discord cron ping — keep-alive + agent status ────────────────────────────
// Called by GitHub Actions every 5-15 min to keep Vercel warm

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  const BOT_TOKEN  = process.env.DISCORD_BOT_TOKEN
  const DISCORD_API = 'https://discord.com/api/v10'

  let botStatus = 'unknown'
  if (BOT_TOKEN) {
    try {
      const r = await fetch(`${DISCORD_API}/users/@me`, {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      })
      botStatus = r.ok ? 'online' : `error-${r.status}`
    } catch { botStatus = 'unreachable' }
  }

  return res.status(200).json({
    ok: true,
    ts: new Date().toISOString(),
    bot: botStatus,
    app: process.env.APP_URL || 'https://trackr-app-nu.vercel.app',
  })
}
