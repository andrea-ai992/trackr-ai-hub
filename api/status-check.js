// ─── Status Check — Surveillance système en temps réel ───────────────────────
// Vérifie tous les endpoints, APIs externes, Discord, GitHub
// Poste dans #annonces : ce qui marche ✅, ce qui est cassé ❌, fixes en cours 🔧
// GET /api/status-check       — rapport complet
// GET /api/status-check?post=true — rapport + post Discord

const DISCORD_API   = 'https://discord.com/api/v10'
const BOT_TOKEN     = process.env.DISCORD_BOT_TOKEN
const ANNONCES_CH   = process.env.DISCORD_CH_ANNONCES
const GITHUB_TOKEN  = process.env.GITHUB_TOKEN
const GITHUB_REPO   = process.env.GITHUB_REPO || 'andrea-ai992/trackr-ai-hub'
const AV_KEY        = process.env.ALPHA_VANTAGE_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const APP_URL       = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

// ─── Discord helper ───────────────────────────────────────────────────────────
async function discordPost(channelId, embeds) {
  if (!channelId || !BOT_TOKEN) return false
  const r = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: embeds.map(e => ({ ...e, timestamp: new Date().toISOString() })) }),
  }).catch(() => null)
  return r?.ok || false
}

// ─── Checks ───────────────────────────────────────────────────────────────────
async function checkEndpoint(name, url, options = {}) {
  const start = Date.now()
  try {
    const r = await fetch(url, { signal: AbortSignal.timeout(8000), ...options })
    const latency = Date.now() - start
    return { name, ok: r.ok, latency, status: r.status }
  } catch (e) {
    return { name, ok: false, latency: Date.now() - start, error: e.message }
  }
}

async function checkGitHub() {
  try {
    const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, 'User-Agent': 'TrackrStatus/1.0' },
      signal: AbortSignal.timeout(6000),
    })
    const data = await r.json()
    return { name: 'GitHub Repo', ok: r.ok, repo: data.full_name, private: data.private }
  } catch (e) {
    return { name: 'GitHub Repo', ok: false, error: e.message }
  }
}

async function checkAlphaVantage() {
  if (!AV_KEY) return { name: 'Alpha Vantage', ok: false, error: 'Clé API manquante' }
  try {
    const r = await fetch(
      `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${AV_KEY}`,
      { signal: AbortSignal.timeout(8000) }
    )
    const data = await r.json()
    const hasData = !!data['Global Quote']?.['05. price']
    return { name: 'Alpha Vantage', ok: hasData, note: hasData ? `AAPL: $${data['Global Quote']['05. price']}` : 'Limite atteinte ou clé invalide' }
  } catch (e) {
    return { name: 'Alpha Vantage', ok: false, error: e.message }
  }
}

async function checkCoinGecko() {
  try {
    const r = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd',
      { signal: AbortSignal.timeout(6000) }
    )
    const data = await r.json()
    const price = data?.bitcoin?.usd
    return { name: 'CoinGecko', ok: !!price, note: price ? `BTC: $${price.toLocaleString('en-US')}` : 'Rate limit' }
  } catch (e) {
    return { name: 'CoinGecko', ok: false, error: e.message }
  }
}

async function checkDiscordBot() {
  if (!BOT_TOKEN) return { name: 'Discord Bot', ok: false, error: 'BOT_TOKEN manquant' }
  try {
    const r = await fetch('https://discord.com/api/v10/users/@me', {
      headers: { Authorization: BOT_TOKEN },
      signal: AbortSignal.timeout(5000),
    })
    const data = await r.json()
    return { name: 'Discord Bot', ok: r.ok, username: data.username }
  } catch (e) {
    return { name: 'Discord Bot', ok: false, error: e.message }
  }
}

async function checkAnthropic() {
  if (!ANTHROPIC_KEY) return { name: 'Anthropic API', ok: false, error: 'Clé API manquante' }
  return { name: 'Anthropic API', ok: true, note: 'Clé configurée' }
}

async function checkEnvVars() {
  const required = [
    'ANTHROPIC_API_KEY', 'DISCORD_BOT_TOKEN', 'DISCORD_APPLICATION_ID',
    'DISCORD_PUBLIC_KEY', 'GITHUB_TOKEN', 'GITHUB_REPO', 'CRON_SECRET', 'APP_URL',
    'ALPHA_VANTAGE_KEY', 'DISCORD_CH_BRAIN', 'DISCORD_CH_MORNING',
    'DISCORD_CH_ANNONCES', 'DISCORD_CH_TRADING_DESK',
  ]
  const missing = required.filter(k => !process.env[k])
  const present = required.filter(k => !!process.env[k])
  return { name: 'Variables d\'env', ok: missing.length === 0, present: present.length, missing, total: required.length }
}

// ─── Endpoints internes à vérifier ───────────────────────────────────────────
const INTERNAL_ENDPOINTS = [
  { name: 'Memory API',      url: `${APP_URL}/api/memory` },
  { name: 'Reports API',     url: `${APP_URL}/api/reports?type=summary` },
  { name: 'Morning API',     url: `${APP_URL}/api/morning` },
  { name: 'Brain API',       url: `${APP_URL}/api/brain`,       options: { method: 'GET' } },
]

// ─── Build Discord embeds ─────────────────────────────────────────────────────
function buildStatusEmbeds(results, envCheck, ts) {
  const ok    = results.filter(r => r.ok)
  const ko    = results.filter(r => !r.ok)
  const allOk = ko.length === 0 && envCheck.missing.length === 0

  const statusLine = allOk
    ? '🟢 **Tous les systèmes opérationnels**'
    : `⚠️ **${ko.length} service(s) dégradé(s)** · ${ok.length} OK`

  // Embed 1 — Vue globale
  const overviewEmbed = {
    color: allOk ? 0x00c853 : ko.length > 3 ? 0xff1744 : 0xffd740,
    author: { name: '📡 Statut Système — Trackr AI Hub' },
    title: statusLine,
    description: `**${ok.length}/${results.length}** services opérationnels · Vérifié à ${ts}`,
    fields: [],
  }

  // Embed 2 — Services OK
  if (ok.length > 0) {
    overviewEmbed.fields.push({
      name: `✅ Opérationnels (${ok.length})`,
      value: ok.map(r => {
        let line = `\`${r.name}\``
        if (r.latency) line += ` — ${r.latency}ms`
        if (r.note)    line += ` — *${r.note}*`
        if (r.username) line += ` — @${r.username}`
        return line
      }).join('\n'),
      inline: false,
    })
  }

  // Services KO
  if (ko.length > 0) {
    overviewEmbed.fields.push({
      name: `❌ Dégradés (${ko.length})`,
      value: ko.map(r => {
        let line = `\`${r.name}\``
        if (r.error)  line += ` — ${r.error.slice(0, 80)}`
        if (r.status) line += ` — HTTP ${r.status}`
        return line
      }).join('\n'),
      inline: false,
    })
  }

  // Env vars
  if (envCheck.missing.length > 0) {
    overviewEmbed.fields.push({
      name: `⚠️ Variables manquantes (${envCheck.missing.length}/${envCheck.total})`,
      value: envCheck.missing.map(k => `\`${k}\``).join(', '),
      inline: false,
    })
  } else {
    overviewEmbed.fields.push({
      name: `✅ Variables d'env (${envCheck.present}/${envCheck.total})`,
      value: 'Toutes les variables requises sont configurées',
      inline: false,
    })
  }

  overviewEmbed.footer = { text: `Trackr Autonomous · Prochain check dans 6h` }

  return [overviewEmbed]
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const post = req.query?.post === 'true' || req.headers['x-vercel-cron'] === '1'

  try {
    const ts = new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }) + ' (Paris)'

    // Lancer tous les checks en parallèle
    const [
      ...internalResults
    ] = await Promise.all([
      ...INTERNAL_ENDPOINTS.map(e => checkEndpoint(e.name, e.url, e.options)),
    ])

    const [github, alphavantage, coingecko, discord, anthropic, envCheck] = await Promise.all([
      checkGitHub(),
      checkAlphaVantage(),
      checkCoinGecko(),
      checkDiscordBot(),
      checkAnthropic(),
      checkEnvVars(),
    ])

    const allResults = [...internalResults, github, alphavantage, coingecko, discord, anthropic]

    const embeds = buildStatusEmbeds(allResults, envCheck, ts)

    if (post && ANNONCES_CH) {
      await discordPost(ANNONCES_CH, embeds)
    }

    const ok    = allResults.filter(r => r.ok)
    const ko    = allResults.filter(r => !r.ok)

    return res.status(200).json({
      ok: ko.length === 0,
      timestamp: new Date().toISOString(),
      services: { total: allResults.length, ok: ok.length, ko: ko.length },
      env: { ok: envCheck.missing.length === 0, missing: envCheck.missing },
      results: allResults,
      posted: post && !!ANNONCES_CH,
    })

  } catch (e) {
    console.error('[status-check]', e.message)
    return res.status(500).json({ error: e.message })
  }
}
