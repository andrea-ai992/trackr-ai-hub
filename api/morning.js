// ─── Morning Briefing — 9h UTC daily ─────────────────────────────────────────
// Posts a rich multi-section announcement to Discord: market overview,
// AI status, agent activity, and daily plan. Triggered via Vercel cron.

const DISCORD_API  = 'https://discord.com/api/v10'
const BOT_TOKEN    = process.env.DISCORD_BOT_TOKEN
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const CRON_SECRET  = process.env.CRON_SECRET

// Channel IDs from Discord setup
const CH_MORNING   = process.env.DISCORD_CH_MORNING   // #morning-briefing
const CH_BRAIN     = process.env.DISCORD_CH_BRAIN     // #brain-cycles (fallback)
const CH_ANNONCES  = process.env.DISCORD_CH_ANNONCES  // #annonces (alertes crédits)

const GITHUB_TOKEN     = process.env.GITHUB_TOKEN
const GITHUB_REPO      = process.env.GITHUB_REPO          // owner/repo
const ALPHA_VANTAGE_KEY = process.env.ALPHA_VANTAGE_KEY   // free at alphavantage.co

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function discordPost(channelId, payload) {
  if (!channelId || !BOT_TOKEN) return null
  try {
    const r = await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    })
    return r.ok ? r.json() : null
  } catch (e) {
    console.warn('discordPost error:', e.message)
    return null
  }
}

async function githubGet(path) {
  if (!GITHUB_TOKEN || !GITHUB_REPO) return null
  let r
  try {
    r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
      headers: { Authorization: `token ${GITHUB_TOKEN}`, Accept: 'application/vnd.github.v3+json' },
      signal: AbortSignal.timeout(8000),
    })
  } catch (e) {
    console.warn(`githubGet ${path}: fetch error:`, e.message)
    return null
  }
  if (!r.ok) {
    console.warn(`githubGet ${path}: HTTP ${r.status}`)
    return null
  }
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json') && !ct.includes('text/json')) {
    console.warn(`githubGet ${path}: unexpected content-type "${ct}"`)
    return null
  }
  let data
  try {
    data = await r.json()
  } catch (e) {
    console.warn(`githubGet ${path}: JSON parse error:`, e.message)
    return null
  }
  if (!data?.content) return null
  try {
    return JSON.parse(Buffer.from(data.content, 'base64').toString('utf8'))
  } catch (e) {
    console.warn(`githubGet ${path}: base64/JSON decode error:`, e.message)
    return null
  }
}

// ─── Data Fetchers ────────────────────────────────────────────────────────────
async function fetchMarkets() {
  try {
    const ids = 'bitcoin,ethereum,solana'
    const r = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!r.ok) return null
    return r.json()
  } catch { return null }
}

// ─── Alpha Vantage (primary — reliable, real-time) ───────────────────────────
async function fetchStockQuoteAV(symbol) {
  const r = await fetch(
    `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_KEY}`,
    { signal: AbortSignal.timeout(8000) }
  )
  if (!r.ok) return null
  const data = await r.json()
  const q = data['Global Quote']
  if (!q || !q['05. price']) return null
  return {
    symbol,
    price:  parseFloat(q['05. price']),
    change: parseFloat(q['10. change percent']?.replace('%', '') || '0'),
    open:   parseFloat(q['02. open']),
    high:   parseFloat(q['03. high']),
    low:    parseFloat(q['04. low']),
    volume: parseInt(q['06. volume'], 10),
  }
}

// ─── Yahoo Finance (fallback — no key needed) ─────────────────────────────────
async function fetchStockQuoteYahoo(symbol) {
  const r = await fetch(
    `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=2d`,
    { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }
  )
  if (!r.ok) return null
  const ct = r.headers.get('content-type') || ''
  if (!ct.includes('application/json') && !ct.includes('text/json')) {
    console.warn(`Yahoo Finance ${symbol}: unexpected content-type "${ct}", skipping .json()`)
    return null
  }
  const data = await r.json()
  const meta = data?.chart?.result?.[0]?.meta
  if (!meta?.regularMarketPrice) return null
  return {
    symbol,
    price:  meta.regularMarketPrice,
    change: meta.regularMarketChangePercent,
    open:   meta.regularMarketOpen,
    high:   meta.regularMarketDayHigh,
    low:    meta.regularMarketDayLow,
    volume: meta.regularMarketVolume,
  }
}

async function fetchStockQuotes() {
  // SPY (S&P 500), QQQ (Nasdaq), NVDA, AAPL, TSLA
  const symbols = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA']

  // If Alpha Vantage key is set, use it sequentially (free tier: 25 req/day, 5 req/min)
  // Sequential with 12s gap keeps us under 5 req/min
  if (ALPHA_VANTAGE_KEY) {
    const results = []
    for (const sym of symbols) {
      try {
        const q = await fetchStockQuoteAV(sym)
        results.push(q || { symbol: sym, price: null, change: null })
      } catch {
        results.push({ symbol: sym, price: null, change: null })
      }
      // Respect 5 req/min limit (12s between calls)
      if (sym !== symbols[symbols.length - 1]) {
        await new Promise(r => setTimeout(r, 12500))
      }
    }
    return results
  }

  // Fallback: Yahoo Finance (parallel, no rate limit)
  const settled = await Promise.allSettled(symbols.map(fetchStockQuoteYahoo))
  return settled.map((r, i) =>
    r.status === 'fulfilled' && r.value ? r.value : { symbol: symbols[i], price: null, change: null }
  )
}

async function loadMemorySummary() {
  try {
    const entries = await githubGet('ANDY_MEMORY.json')
    if (!Array.isArray(entries)) return null
    const recent = entries.slice(-30)
    const improvements = recent.filter(e => e.type === 'improvement' && e.applied)
    const errors      = recent.filter(e => e.type === 'error')
    const brainCycles = recent.filter(e => e.type === 'brain_cycle')
    return { improvements: improvements.length, errors: errors.length, brainCycles: brainCycles.length, total: recent.length }
  } catch { return null }
}

async function loadAgentsRegistry() {
  try {
    const reg = await githubGet('AGENTS_REGISTRY.json')
    if (!reg?.agents) return { count: 45, forged: 0 }
    const forged = reg.agents.filter(a => a.status === 'active').length
    return { count: 45 + forged, forged }
  } catch { return { count: 45, forged: 0 } }
}

// ─── AI Briefing (Haiku — fast & cheap) ──────────────────────────────────────
async function generateAIBriefing(context) {
  if (!ANTHROPIC_KEY) return 'Briefing IA indisponible.'
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: `Tu es AnDy, l'IA autonome de Trackr. Rédige un briefing matinal court (3-4 phrases max, ton confiant et précis) basé sur ces données:
${JSON.stringify(context, null, 2)}
Mentionne les points clés: améliorations récentes, activité agents, focus du jour. Sois positif mais factuel. En français.`,
        }],
      }),
      signal: AbortSignal.timeout(15000),
    })
    const data = await r.json()
    return data.content?.[0]?.text || 'Briefing IA indisponible.'
  } catch { return 'Briefing IA indisponible.' }
}

// ─── Format helpers ────────────────────────────────────────────────────────────
function fmtChange(pct) {
  if (pct == null) return '—'
  const sign = pct >= 0 ? '+' : ''
  return `${sign}${pct.toFixed(2)}%`
}

function changeArrow(pct) {
  if (pct == null) return '➡️'
  return pct > 0 ? '🟢' : pct < 0 ? '🔴' : '⬜'
}

function fmtPrice(p) {
  if (p == null) return '—'
  return p >= 1000 ? `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}` : `$${p.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

// ─── Build Discord embeds ─────────────────────────────────────────────────────
function buildMorningEmbeds(data) {
  const { crypto, stocks, memory, agents, briefing, date } = data

  // ── Embed 1: Header ──────────────────────────────────────────────────────────
  const headerEmbed = {
    color: 0x6600ea,
    author: { name: 'AnDy AI • Briefing Matinal', icon_url: 'https://cdn.discordapp.com/emojis/🧠' },
    title: `☀️ Bonjour — ${date}`,
    description: briefing,

    footer: { text: 'Trackr Intelligence System • Briefing automatique — chaque matin à 9h00' },
    timestamp: new Date().toISOString(),
  }

  // ── Embed 2: Marchés ─────────────────────────────────────────────────────────
  const cryptoFields = []
  if (crypto) {
    const btcChg  = crypto.bitcoin?.usd_24h_change
    const ethChg  = crypto.ethereum?.usd_24h_change
    const solChg  = crypto.solana?.usd_24h_change
    cryptoFields.push(
      { name: `${changeArrow(btcChg)} Bitcoin`, value: `${fmtPrice(crypto.bitcoin?.usd)} · ${fmtChange(btcChg)}`, inline: true },
      { name: `${changeArrow(ethChg)} Ethereum`, value: `${fmtPrice(crypto.ethereum?.usd)} · ${fmtChange(ethChg)}`, inline: true },
      { name: `${changeArrow(solChg)} Solana`, value: `${fmtPrice(crypto.solana?.usd)} · ${fmtChange(solChg)}`, inline: true },
    )
  }

  const stockFields = (stocks || []).filter(s => s.price).map(s => {
    let value = `**${fmtPrice(s.price)}** · ${fmtChange(s.change)}`
    if (s.high && s.low) value += `\nHaut: ${fmtPrice(s.high)} · Bas: ${fmtPrice(s.low)}`
    return { name: `${changeArrow(s.change)} ${s.symbol}`, value, inline: true }
  })

  const marketEmbed = {
    color: 0x10b981,
    title: '📊 Marchés — Vue d\'ensemble',
    fields: [
      ...(cryptoFields.length ? cryptoFields : [{ name: 'Crypto', value: 'Données indisponibles', inline: false }]),
      { name: '\u200b', value: '\u200b', inline: false }, // divider
      ...(stockFields.length ? stockFields : [{ name: 'Actions', value: 'Données indisponibles', inline: false }]),
    ],
  }

  // ── Embed 3: IA Status ───────────────────────────────────────────────────────
  const iaEmbed = {
    color: 0x00daf3,
    title: '🤖 Statut IA Autonome',
    fields: [
      {
        name: '🧠 Brain Cycles (30 dernières entrées)',
        value: memory
          ? `**${memory.brainCycles}** cycles · **${memory.improvements}** améliorations · **${memory.errors}** erreurs`
          : 'Mémoire indisponible',
        inline: false,
      },
      {
        name: '⚡ Agents Actifs',
        value: `**${agents.count}** agents déployés${agents.forged > 0 ? ` (dont **${agents.forged}** forgés automatiquement)` : ''}`,
        inline: false,
      },
      {
        name: '🎯 Santé Système',
        value: memory
          ? `Taux de succès estimé: **${memory.improvements > 0 ? Math.round((memory.improvements / (memory.improvements + memory.errors)) * 100) : 100}%**`
          : 'Calcul en cours...',
        inline: false,
      },
    ],
  }

  // ── Embed 4: Plan du Jour ────────────────────────────────────────────────────
  const now = new Date()
  const hour = now.getUTCHours()

  const schedule = [
    { time: '09:00', label: '☀️ Briefing matinal (maintenant)', done: true },
    { time: '12:00', label: '🔐 Auto-audit sécurité',           done: hour >= 12 },
    { time: '15:00', label: '🎨 Revue frontend',                done: hour >= 15 },
    { time: '18:00', label: '⚡ Optimisation performance',       done: hour >= 18 },
    { time: '20:00', label: '📊 Rapport quotidien Discord',      done: hour >= 20 },
  ]

  const scheduleText = schedule
    .map(s => `${s.done ? '✅' : '⬜'} \`${s.time}\` ${s.label}`)
    .join('\n')

  const planEmbed = {
    color: 0x8b5cf6,
    title: '📅 Plan du Jour',
    description: scheduleText,
    fields: [
      {
        name: '🔗 Accès rapide',
        value: '`/agents` · `/brain` · `/report` · `/andy`',
        inline: false,
      },
    ],
  }

  return [headerEmbed, marketEmbed, iaEmbed, planEmbed]
}

// ─── Credit & API Health Check ───────────────────────────────────────────────
async function checkApiHealth() {
  const issues = []

  // 1. Anthropic API — test minimal (1 token)
  try {
    if (ANTHROPIC_KEY) {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1, messages: [{ role: 'user', content: 'ok' }] }),
        signal: AbortSignal.timeout(8000),
      })
      if (r.status === 402) issues.push({ name: 'Anthropic API', level: 'critique', msg: '💳 Crédits Anthropic épuisés — l\'IA ne peut plus fonctionner !' })
      else if (r.status === 529) issues.push({ name: 'Anthropic API', level: 'moyen', msg: '⚠️ Anthropic surchargé (529) — temporaire' })
      else if (r.status === 401) issues.push({ name: 'Anthropic API', level: 'critique', msg: '🔑 Clé API Anthropic invalide ou expirée !' })
      else if (!r.ok && r.status !== 400) issues.push({ name: 'Anthropic API', level: 'élevé', msg: `❌ Erreur Anthropic ${r.status}` })
    } else {
      issues.push({ name: 'Anthropic API', level: 'critique', msg: '🔑 ANTHROPIC_API_KEY manquante dans les variables d\'environnement !' })
    }
  } catch { issues.push({ name: 'Anthropic API', level: 'moyen', msg: '⏱️ Anthropic timeout — vérifie la connexion' }) }

  // 2. Alpha Vantage — vérifie si la clé est active
  try {
    if (ALPHA_VANTAGE_KEY) {
      const r = await fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=AAPL&apikey=${ALPHA_VANTAGE_KEY}`, { signal: AbortSignal.timeout(6000) })
      const d = await r.json().catch(() => ({}))
      if (d?.Note?.includes('API rate limit')) {
        issues.push({ name: 'Alpha Vantage', level: 'moyen', msg: '⏳ Alpha Vantage quota journalier atteint (25 req/jour) — reprend demain' })
      } else if (d?.['Error Message']) {
        issues.push({ name: 'Alpha Vantage', level: 'élevé', msg: `❌ Alpha Vantage erreur: ${d['Error Message']}` })
      }
    }
  } catch {}

  // 3. Discord Bot Token — vérifie si le bot est connecté
  try {
    if (BOT_TOKEN) {
      const r = await fetch('https://discord.com/api/v10/users/@me', {
        headers: { Authorization: `Bot ${BOT_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      })
      if (r.status === 401) issues.push({ name: 'Discord Bot', level: 'critique', msg: '🤖 Token Discord Bot invalide — toutes les notifs sont coupées !' })
      else if (!r.ok) issues.push({ name: 'Discord Bot', level: 'élevé', msg: `❌ Discord Bot erreur ${r.status}` })
    } else {
      issues.push({ name: 'Discord Bot', level: 'critique', msg: '🤖 DISCORD_BOT_TOKEN manquant — bot Discord non fonctionnel !' })
    }
  } catch {}

  // 4. GitHub Token — vérifie accès au repo
  try {
    if (GITHUB_TOKEN && GITHUB_REPO) {
      const r = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` },
        signal: AbortSignal.timeout(5000),
      })
      if (r.status === 401 || r.status === 403) {
        issues.push({ name: 'GitHub Token', level: 'critique', msg: '🔑 Token GitHub invalide — l\'IA ne peut plus se mettre à jour !' })
      }
    }
  } catch {}

  return issues
}

async function postCreditAlerts(issues) {
  if (!issues.length || !CH_ANNONCES || !BOT_TOKEN) return
  const critiques = issues.filter(i => i.level === 'critique')
  const autres    = issues.filter(i => i.level !== 'critique')
  const color     = critiques.length > 0 ? 0xff1744 : 0xffa000

  await discordPost(CH_ANNONCES, {
    embeds: [{
      color,
      author: { name: '⚠️ Trackr — Alerte Crédits & APIs' },
      title: critiques.length > 0 ? '🔴 ACTION REQUISE — Problème critique' : '🟡 Attention — Problème détecté',
      description: issues.map(i => {
        const emoji = i.level === 'critique' ? '🔴' : i.level === 'élevé' ? '🟠' : '🟡'
        return `${emoji} **${i.name}** — ${i.msg}`
      }).join('\n'),
      fields: critiques.length > 0 ? [{
        name: '💡 Que faire ?',
        value: [
          '• Anthropic crédits : recharge sur **console.anthropic.com**',
          '• GitHub token : renouvelle sur **github.com/settings/tokens**',
          '• Discord token : regénère sur **discord.com/developers**',
          '• Alpha Vantage : quota reset à minuit UTC',
        ].join('\n'),
        inline: false,
      }] : [],
      footer: { text: 'Surveillance automatique · Morning Check · Trackr AI' },
      timestamp: new Date().toISOString(),
    }],
  }).catch(() => {})
}

// ─── Main Handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  // Auth check for cron calls
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  // GET sans secret = autorisé (tests manuels, app)
  // Cron Vercel = autorisé via header x-vercel-cron
  const isVercelCron = req.headers['x-vercel-cron'] === '1'
  const provided = req.headers['authorization']?.replace('Bearer ', '')
    || req.headers['x-cron-secret']
    || req.query?.secret
  const isAuthorized = !CRON_SECRET || isVercelCron || provided === CRON_SECRET || req.method === 'GET'
  if (!isAuthorized) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    // Fetch all data in parallel
    const [crypto, stocks, memory, agents] = await Promise.all([
      fetchMarkets(),
      fetchStockQuotes(),
      loadMemorySummary(),
      loadAgentsRegistry(),
    ])

    // Build context for AI briefing
    const context = {
      improvements_last_30: memory?.improvements ?? 0,
      errors_last_30:       memory?.errors ?? 0,
      brain_cycles:         memory?.brainCycles ?? 0,
      agents_count:         agents.count,
      agents_forged:        agents.forged,
      btc_change_24h:       crypto?.bitcoin?.usd_24h_change ?? null,
      market_mood:          (crypto?.bitcoin?.usd_24h_change ?? 0) > 2
        ? 'haussier'
        : (crypto?.bitcoin?.usd_24h_change ?? 0) < -2
        ? 'baissier'
        : 'neutre',
    }

    // Vérification crédits & santé API (en parallèle, ne bloque pas le briefing)
    checkApiHealth().then(issues => {
      if (issues.length > 0) postCreditAlerts(issues).catch(() => {})
    }).catch(() => {})

    const briefing = await generateAIBriefing(context)

    // Format date in French
    const date = new Date().toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Europe/Paris',
    })
    // Capitalize first letter
    const dateStr = date.charAt(0).toUpperCase() + date.slice(1)

    const embeds = buildMorningEmbeds({ crypto, stocks, memory, agents, briefing, date: dateStr })

    // Post to Discord — prefer dedicated morning channel, fall back to brain channel
    const channelId = CH_MORNING || CH_BRAIN
    if (channelId) {
      // Post embeds in two messages (Discord max 10 embeds/message, we have 4 so one call is fine)
      await discordPost(channelId, { embeds })
    }

    return res.status(200).json({
      ok: true,
      posted: !!channelId,
      channel: channelId,
      date: dateStr,
      metrics: context,
    })
  } catch (err) {
    console.error('[morning] Error:', err)
    return res.status(500).json({ error: err.message })
  }
}
