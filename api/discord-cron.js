// ─── Discord Cron — Scheduled Agent Tasks ────────────────────────────────────
// Runs every hour (Vercel Hobby free tier)
// Posts market updates, code/design reviews to Discord channels

import { AGENTS } from './discord.js'

const DISCORD_API = 'https://discord.com/api/v10'
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN

// Channel IDs — set after running discord-setup.mjs
const CHANNELS = {
  'market-scanner':   process.env.DISCORD_CH_MARKET_SCANNER,
  'crypto':           process.env.DISCORD_CH_CRYPTO,
  'portfolio-watch':  process.env.DISCORD_CH_PORTFOLIO,
  'code-review':      process.env.DISCORD_CH_CODE_REVIEW,
  'ui-review':        process.env.DISCORD_CH_UI_REVIEW,
  'reports':          process.env.DISCORD_CH_REPORTS,
  'price-alerts':     process.env.DISCORD_CH_PRICE_ALERTS,
  'app-pulse':        process.env.DISCORD_CH_APP_PULSE,
}

function discordPost(channelId, embed) {
  if (!channelId) return Promise.resolve()
  return fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  })
}

function makeEmbed(agentKey, description, fields = []) {
  const a = AGENTS[agentKey]
  return {
    author: { name: `${a.emoji} ${a.name}` },
    description,
    color: a.color,
    fields,
    footer: { text: `${a.role} · Auto-scan` },
    timestamp: new Date().toISOString(),
  }
}

async function fetchPrice(symbol) {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`)
    const d = await r.json()
    const q = d?.chart?.result?.[0]?.meta
    return q ? { price: q.regularMarketPrice, change: q.regularMarketChangePercent, name: q.shortName || symbol } : null
  } catch { return null }
}

async function fetchCrypto(coinId) {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`)
    const d = await r.json()
    return d[coinId] ? { price: d[coinId].usd, change: d[coinId].usd_24h_change } : null
  } catch { return null }
}

async function callAnDy(prompt) {
  try {
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/andy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [] }),
    })
    const data = await res.json()
    return (data.text || '').replace(/\[CHART:[^\]]+\]/g, '').slice(0, 1800)
  } catch { return null }
}

// ─── Market Scanner — runs every hour ────────────────────────────────────────
async function runMarketScanner() {
  const watchlist = [
    { sym: 'AAPL', label: 'Apple' },
    { sym: 'NVDA', label: 'NVIDIA' },
    { sym: 'TSLA', label: 'Tesla' },
    { sym: 'MSFT', label: 'Microsoft' },
    { sym: '^GSPC', label: 'S&P 500' },
  ]
  const cryptos = [
    { id: 'bitcoin', label: 'Bitcoin' },
    { id: 'ethereum', label: 'Ethereum' },
    { id: 'solana', label: 'Solana' },
  ]

  const [stockResults, cryptoResults] = await Promise.all([
    Promise.all(watchlist.map(async ({ sym, label }) => {
      const d = await fetchPrice(sym)
      if (!d) return null
      const chg = parseFloat(d.change || 0)
      const arrow = chg >= 1.5 ? '🚀' : chg >= 0.3 ? '🟢' : chg <= -1.5 ? '🔴' : chg <= -0.3 ? '🔻' : '🟡'
      return { name: label, value: `${arrow} **$${Number(d.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}** ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`, inline: true }
    })),
    Promise.all(cryptos.map(async ({ id, label }) => {
      const d = await fetchCrypto(id)
      if (!d) return null
      const chg = parseFloat(d.change || 0)
      const arrow = chg >= 3 ? '🚀' : chg >= 0.5 ? '🟢' : chg <= -3 ? '🔴' : chg <= -0.5 ? '🔻' : '🟡'
      return { name: label, value: `${arrow} **$${Number(d.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}** ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`, inline: true }
    })),
  ])

  const fields = [...stockResults, ...cryptoResults].filter(Boolean)
  const embed = makeEmbed('market_scanner',
    `📡 Scan automatique — ${new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' })} (Paris)`,
    fields
  )
  await discordPost(CHANNELS['market-scanner'], embed)
}

// ─── Crypto Tracker ───────────────────────────────────────────────────────────
async function runCryptoTracker() {
  const coins = ['bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin']
  const results = await Promise.all(coins.map(id => fetchCrypto(id)))
  const fields = results.map((d, i) => {
    if (!d) return null
    const name = ['Bitcoin', 'Ethereum', 'Solana', 'XRP', 'Dogecoin'][i]
    const chg = parseFloat(d.change || 0)
    return { name, value: `$${Number(d.price).toLocaleString('en-US', { maximumFractionDigits: 4 })} · ${chg >= 0 ? '🟢 +' : '🔴 '}${chg.toFixed(2)}%`, inline: true }
  }).filter(Boolean)

  await discordPost(CHANNELS['crypto'], makeEmbed('crypto_tracker', '**Marché crypto** — mise à jour horaire', fields))
}

// ─── Code Review — runs 4 times/day ──────────────────────────────────────────
async function runCodeReview() {
  const hour = new Date().getUTCHours()
  if (![8, 12, 16, 20].includes(hour)) return // only 4× per day

  const reply = await callAnDy(`Tu es CodeReviewer. Fais une revue rapide de l'application Trackr (React/Vite, api/andy.js, src/pages/Andy.jsx). Identifie: 1) Top 3 problèmes à corriger en priorité, 2) Une amélioration de performance rapide, 3) Un risque de sécurité potentiel. Sois très concis (max 400 mots).`)
  if (!reply) return

  await discordPost(CHANNELS['code-review'], makeEmbed('code_reviewer', reply, [
    { name: 'Fréquence', value: '4× par jour', inline: true },
    { name: 'Heure UTC', value: `${hour}h`, inline: true },
  ]))
}

// ─── UI Inspector — runs 2 times/day ─────────────────────────────────────────
async function runUIInspector() {
  const hour = new Date().getUTCHours()
  if (![9, 18].includes(hour)) return

  const reply = await callAnDy(`Tu es UIInspector. Analyse le design actuel de l'app Trackr (design system Stitch: #060a16, #00daf3, #6600ea, Space Grotesk). Donne 3 améliorations concrètes et rapides pour améliorer la cohérence visuelle, les contrastes, ou les micro-interactions. Format: titre court + explication 1-2 lignes.`)
  if (!reply) return

  await discordPost(CHANNELS['ui-review'], makeEmbed('ui_inspector', reply))
}

// ─── Daily Report — runs at 8h UTC ───────────────────────────────────────────
async function runDailyReport() {
  const hour = new Date().getUTCHours()
  if (hour !== 8) return

  const reply = await callAnDy('Génère un briefing marché matinal concis: 1) Résumé marchés la nuit/matin, 2) Top 3 actifs à surveiller aujourd\'hui, 3) Setup de trade du jour avec niveau d\'entrée précis, 4) Risque majeur à surveiller. Format court et actionnable.')
  if (!reply) return

  await discordPost(CHANNELS['reports'], makeEmbed('report_bot', reply, [
    { name: '📅 Date', value: new Date().toLocaleDateString('fr-FR'), inline: true },
    { name: '🕗 Type', value: 'Briefing matinal', inline: true },
  ]))
}

// ─── App Pulse — health check every hour ─────────────────────────────────────
async function runAppPulse() {
  const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
  if (!baseUrl) return

  const start = Date.now()
  let status = '🟢 Opérationnel'
  let latency = 0

  try {
    const r = await fetch(`${baseUrl}/api/andy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'ping' }], portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [] }),
    })
    latency = Date.now() - start
    if (!r.ok) status = `🔴 Erreur HTTP ${r.status}`
    else if (latency > 10000) status = '🟡 Lent'
  } catch (e) {
    status = `🔴 Hors ligne: ${e.message}`
    latency = Date.now() - start
  }

  // Only post if there's an issue or at 8h UTC
  const hour = new Date().getUTCHours()
  if (status.startsWith('🟢') && hour !== 8) return

  await discordPost(CHANNELS['app-pulse'], makeEmbed('pulse', `**Statut application Trackr**\n${status}`, [
    { name: 'Latence API', value: `${latency}ms`, inline: true },
    { name: 'URL', value: baseUrl, inline: true },
    { name: 'Heure', value: new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris' }), inline: true },
  ]))
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Verify internal cron call (Vercel sends Authorization header for crons)
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).end(); return
  }

  if (!BOT_TOKEN) {
    res.status(503).json({ error: 'Discord bot not configured' }); return
  }

  try {
    // Run all scheduled tasks in parallel
    await Promise.allSettled([
      runMarketScanner(),
      runCryptoTracker(),
      runCodeReview(),
      runUIInspector(),
      runDailyReport(),
      runAppPulse(),
    ])
    res.json({ ok: true, ran: new Date().toISOString() })
  } catch (e) {
    console.error('Cron error:', e)
    res.status(500).json({ error: e.message })
  }
}
