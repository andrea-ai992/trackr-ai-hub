// ─── Discord Interaction Handler — 45 AnDy Agents ───────────────────────────
// Receives slash commands from Discord, routes to agent logic
// Background processing: res.json() sends immediately, function continues up to 60s

import crypto from 'crypto'

const DISCORD_API    = 'https://discord.com/api/v10'
const APP_ID         = process.env.DISCORD_APPLICATION_ID
const BOT_TOKEN      = process.env.DISCORD_BOT_TOKEN
const PUBLIC_KEY     = process.env.DISCORD_PUBLIC_KEY
const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY
const APP_URL        = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

// ─── Crypto helpers ───────────────────────────────────────────────────────────
const CRYPTO_LIST   = ['BTC','ETH','SOL','BNB','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','UNI','LTC','ATOM']
const CRYPTO_ID_MAP = { BTC: 'bitcoin', ETH: 'ethereum', SOL: 'solana', BNB: 'binancecoin', XRP: 'ripple', ADA: 'cardano', DOGE: 'dogecoin', AVAX: 'avalanche-2', DOT: 'polkadot', MATIC: 'matic-network', LINK: 'chainlink', UNI: 'uniswap', LTC: 'litecoin', ATOM: 'cosmos' }

function quickRSI(closes, period = 14) {
  if (!closes || closes.length < period + 1) return null
  let gains = 0, losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
  }
  if (losses === 0) return 100
  const rs = (gains / period) / (losses / period)
  return parseFloat((100 - 100 / (1 + rs)).toFixed(1))
}

async function getQuickSignal(symbol, type) {
  let price = null, change24h = null, rsi = null
  if (type === 'crypto') {
    const id = CRYPTO_ID_MAP[symbol] || symbol.toLowerCase()
    const [priceRes, ohlcRes] = await Promise.allSettled([
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(4000) }).then(r => r.json()),
      fetch(`https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=14`, { signal: AbortSignal.timeout(4000) }).then(r => r.json()),
    ])
    if (priceRes.status === 'fulfilled') { const d = priceRes.value?.[id]; price = d?.usd; change24h = d?.usd_24h_change }
    if (ohlcRes.status === 'fulfilled' && Array.isArray(ohlcRes.value)) rsi = quickRSI(ohlcRes.value.map(c => c[4]))
  } else {
    const data = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=30d`, { headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }, signal: AbortSignal.timeout(5000) })
      .then(async r => {
        const ct = r.headers.get('content-type') || ''
        if (!r.ok) { console.warn(`Yahoo Finance ${symbol}: HTTP ${r.status}`); return null }
        if (
          !ct.includes('application/json') &&
          !ct.includes('text/json') &&
          !ct.includes('text/plain') &&
          !ct.includes('application/x-www-form-urlencoded')
        ) {
          console.warn(`Yahoo Finance ${symbol}: unexpected content-type "${ct}" (possible SSE/stream), skipping .json()`)
          // Consume and discard the body to avoid resource leaks
          await r.body?.cancel().catch(() => {})
          return null
        }
        try {
          return await r.json()
        } catch (parseErr) {
          console.warn(`Yahoo Finance ${symbol}: JSON parse error:`, parseErr.message)
          return null
        }
      })
      .catch(e => { console.warn(`Yahoo Finance ${symbol} fetch error:`, e.message); return null })
    if (data?.chart?.result?.[0]) {
      const r = data.chart.result[0]
      const closes = (r.indicators?.quote?.[0]?.close || []).filter(Boolean)
      price = r.meta?.regularMarketPrice
      const prev = r.meta?.previousClose || r.meta?.chartPreviousClose
      if (prev && price) change24h = (price - prev) / prev * 100
      rsi = quickRSI(closes)
    }
  }
  return { price, change24h, rsi }
}

// ─── 45 Agent definitions ────────────────────────────────────────────────────
export const AGENTS = {
  // AI Core (5)
  andy:            { name: 'AnDy',           emoji: '🧠', color: 0x00daf3, cat: 'ai-core',  ch: 'andy-chat',         role: 'Intelligence centrale' },
  nexus:           { name: 'Nexus',          emoji: '🔗', color: 0x6600ea, cat: 'ai-core',  ch: 'nexus-hub',         role: 'Coordinateur d\'agents' },
  pulse:           { name: 'Pulse',          emoji: '💓', color: 0xff006e, cat: 'ai-core',  ch: 'app-pulse',         role: 'Surveillance app temps-réel' },
  synapse:         { name: 'Synapse',        emoji: '⚡', color: 0xfbbf24, cat: 'ai-core',  ch: 'synapse-relay',     role: 'Communication inter-agents' },
  oracle:          { name: 'Oracle',         emoji: '🔮', color: 0x8b5cf6, cat: 'ai-core',  ch: 'oracle-predictions',role: 'Analyse prédictive' },
  // Market Agents (10)
  market_scanner:  { name: 'MarketScanner',  emoji: '🔭', color: 0x34d399, cat: 'markets', ch: 'market-scanner',    role: 'Scanner marché 50+ tickers' },
  tech_analyst:    { name: 'TechAnalyst',    emoji: '📈', color: 0x00daf3, cat: 'markets', ch: 'tech-analysis',     role: 'RSI MACD EMA Bollinger' },
  crypto_tracker:  { name: 'CryptoTracker',  emoji: '₿',  color: 0xfcd34d, cat: 'markets', ch: 'crypto',            role: 'Prix et tendances crypto' },
  alert_bot:       { name: 'AlertBot',       emoji: '🔔', color: 0xf97316, cat: 'markets', ch: 'price-alerts',      role: 'Alertes prix automatiques' },
  portfolio_guard: { name: 'PortfolioGuard', emoji: '🛡️', color: 0x10b981, cat: 'markets', ch: 'portfolio-watch',   role: 'P&L et risque portfolio' },
  sector_spy:      { name: 'SectorSpy',      emoji: '🏭', color: 0x06b6d4, cat: 'markets', ch: 'sectors',           role: 'Rotation sectorielle' },
  news_digest:     { name: 'NewsDigest',     emoji: '📰', color: 0xa78bfa, cat: 'markets', ch: 'market-news',       role: 'Actualités marché' },
  sentiment_bot:   { name: 'SentimentBot',   emoji: '🌡️', color: 0xf43f5e, cat: 'markets', ch: 'sentiment',         role: 'Fear & Greed, sentiment' },
  macro_watch:     { name: 'MacroWatch',     emoji: '🌍', color: 0x0891b2, cat: 'markets', ch: 'macro',             role: 'Indicateurs macro' },
  options_flow:    { name: 'OptionsFlow',    emoji: '🌊', color: 0xec4899, cat: 'markets', ch: 'options-flow',      role: 'Flux options inhabituels' },
  // Dev Agents (10)
  code_reviewer:   { name: 'CodeReviewer',   emoji: '👁️', color: 0x60a5fa, cat: 'dev',     ch: 'code-review',       role: 'Revue et suggestions code' },
  bug_hunter:      { name: 'BugHunter',      emoji: '🐛', color: 0xf87171, cat: 'dev',     ch: 'bugs',              role: 'Détection de bugs' },
  perf_optimizer:  { name: 'PerfOptimizer',  emoji: '⚡', color: 0xfbbf24, cat: 'dev',     ch: 'performance',       role: 'Performance bundle Core Vitals' },
  security_audit:  { name: 'SecurityAudit',  emoji: '🔐', color: 0xdc2626, cat: 'dev',     ch: 'security',          role: 'Audit sécurité OWASP' },
  refactor_bot:    { name: 'RefactorBot',    emoji: '🔧', color: 0x7c3aed, cat: 'dev',     ch: 'refactor',          role: 'Qualité code et patterns' },
  test_coverage:   { name: 'TestCoverage',   emoji: '✅', color: 0x16a34a, cat: 'dev',     ch: 'testing',           role: 'Couverture de tests' },
  api_monitor:     { name: 'APIMonitor',     emoji: '🔌', color: 0x0284c7, cat: 'dev',     ch: 'api-health',        role: 'Santé API et latence' },
  deploy_watch:    { name: 'DeployWatch',    emoji: '🚀', color: 0x4ade80, cat: 'dev',     ch: 'deployments',       role: 'Statut déploiements Vercel' },
  dependency_bot:  { name: 'DependencyBot',  emoji: '📦', color: 0xfb923c, cat: 'dev',     ch: 'dependencies',      role: 'Dépendances et vulnérabilités' },
  doc_writer:      { name: 'DocWriter',      emoji: '📝', color: 0x64748b, cat: 'dev',     ch: 'documentation',     role: 'Génération de docs' },
  // Design Agents (8)
  ui_inspector:    { name: 'UIInspector',    emoji: '🎨', color: 0xf9a8d4, cat: 'design',  ch: 'ui-review',         role: 'Revue composants UI' },
  ux_analyst:      { name: 'UXAnalyst',      emoji: '👤', color: 0xc4b5fd, cat: 'design',  ch: 'ux-feedback',       role: 'Analyse flux utilisateur' },
  color_master:    { name: 'ColorMaster',    emoji: '🌈', color: 0xff6b6b, cat: 'design',  ch: 'colors',            role: 'Palette couleurs et contrastes' },
  typography_bot:  { name: 'TypographyBot',  emoji: '🔤', color: 0xddd6fe, cat: 'design',  ch: 'typography',        role: 'Hiérarchie typographique' },
  animation_bot:   { name: 'AnimationBot',   emoji: '✨', color: 0x7dd3fc, cat: 'design',  ch: 'animations',        role: 'Fluidité et micro-interactions' },
  responsive_bot:  { name: 'ResponsiveBot',  emoji: '📱', color: 0x86efac, cat: 'design',  ch: 'responsive',        role: 'Mobile et breakpoints' },
  access_bot:      { name: 'AccessBot',      emoji: '♿', color: 0xfde68a, cat: 'design',  ch: 'accessibility',     role: 'Accessibilité WCAG 2.1' },
  pixel_perfect:   { name: 'PixelPerfect',   emoji: '🔍', color: 0xe9d5ff, cat: 'design',  ch: 'pixel-review',      role: 'Espacements et alignements' },
  // Data Agents (7)
  data_miner:      { name: 'DataMiner',      emoji: '⛏️', color: 0x6ee7b7, cat: 'data',    ch: 'data-patterns',     role: 'Patterns marché et portfolio' },
  stats_bot:       { name: 'StatsBot',       emoji: '📊', color: 0x93c5fd, cat: 'data',    ch: 'statistics',        role: 'Statistiques descriptives' },
  correlation_bot: { name: 'CorrelationBot', emoji: '🔗', color: 0xfca5a5, cat: 'data',    ch: 'correlations',      role: 'Corrélations entre actifs' },
  backtest_bot:    { name: 'BacktestBot',    emoji: '⏪', color: 0xa5b4fc, cat: 'data',    ch: 'backtests',         role: 'Backtesting stratégies' },
  risk_metrics:    { name: 'RiskMetrics',    emoji: '⚖️', color: 0xfcd34d, cat: 'data',    ch: 'risk',              role: 'VaR Sharpe drawdown beta' },
  flow_tracker:    { name: 'FlowTracker',    emoji: '💧', color: 0x22d3ee, cat: 'data',    ch: 'flow',              role: 'Money flow et volumes' },
  trend_spotter:   { name: 'TrendSpotter',   emoji: '🎯', color: 0xfb7185, cat: 'data',    ch: 'trends',            role: 'Tendances émergentes' },
  // Utility Agents (5)
  scheduler:       { name: 'Scheduler',      emoji: '⏰', color: 0x94a3b8, cat: 'utility', ch: 'scheduler',         role: 'Tâches planifiées' },
  report_bot:      { name: 'ReportBot',      emoji: '📋', color: 0x67e8f9, cat: 'utility', ch: 'reports',           role: 'Rapports quotidiens' },
  translator:      { name: 'Translator',     emoji: '🌐', color: 0x86efac, cat: 'utility', ch: 'translations',      role: 'Traduction multi-langues' },
  web_scraper:     { name: 'WebScraper',     emoji: '🕷️', color: 0xcbd5e1, cat: 'utility', ch: 'research',          role: 'Recherche web' },
  notifier:        { name: 'Notifier',       emoji: '🔔', color: 0xfda4af, cat: 'utility', ch: 'notifications',     role: 'Notifications intelligentes' },
}

// ─── Discord helpers ──────────────────────────────────────────────────────────
function discordFetch(path, method = 'GET', body) {
  return fetch(`${DISCORD_API}${path}`, {
    method,
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function agentEmbed(agentKey, description, fields = []) {
  const a = AGENTS[agentKey] || AGENTS.andy
  return {
    author: { name: `${a.emoji} ${a.name}` },
    description,
    color: a.color,
    fields,
    footer: { text: `${a.role} · Trackr AI Hub` },
    timestamp: new Date().toISOString(),
  }
}

// Patch the deferred Discord message
async function patchReply(token, content) {
  await discordFetch(`/webhooks/${APP_ID}/${token}/messages/@original`, 'PATCH', {
    embeds: [content],
  })
}

// ─── Ed25519 signature verification ──────────────────────────────────────────
// Node.js requires SPKI-wrapped Ed25519 key — prepend the OID header
function verifyDiscordSignature(rawBody, signature, timestamp) {
  try {
    const spkiHeader = Buffer.from('302a300506032b6570032100', 'hex')
    const pubKey = crypto.createPublicKey({
      key: Buffer.concat([spkiHeader, Buffer.from(PUBLIC_KEY, 'hex')]),
      format: 'der',
      type: 'spki',
    })
    return crypto.verify(
      null,
      Buffer.from(timestamp + rawBody),
      pubKey,
      Buffer.from(signature, 'hex')
    )
  } catch {
    return false
  }
}

// ─── Call AnDy API (reads SSE stream) ────────────────────────────────────────
async function callAnDy(userMessage) {
  try {
    const res = await fetch(`${APP_URL}/api/andy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: userMessage }],
        portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [],
      }),
      signal: AbortSignal.timeout(50000),
    })
    if (!res.ok) return `Erreur API AnDy (${res.status})`

    // /api/andy returns SSE text/event-stream — collect all token events
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buf = '', fullText = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n')
      buf = lines.pop()
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const ev = JSON.parse(line.slice(6))
          if (ev.type === 'token') fullText += ev.text
          if (ev.type === 'error') return `Erreur IA: ${ev.message}`
        } catch {}
      }
    }

    return fullText.replace(/\[CHART:[^\]]+\]/g, '').trim().slice(0, 2000) || 'Pas de réponse.'
  } catch (e) {
    return `Erreur connexion AnDy: ${e.message}`
  }
}

// ─── Fetch live price ─────────────────────────────────────────────────────────
async function fetchPrice(symbol) {
  try {
    const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`)
    const d = await r.json()
    const q = d?.chart?.result?.[0]?.meta
    if (!q) return null
    return { price: q.regularMarketPrice, change: q.regularMarketChangePercent, name: q.shortName || symbol }
  } catch { return null }
}

async function fetchCryptoPrice(coinId) {
  try {
    const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`)
    const d = await r.json()
    return d[coinId] ? { price: d[coinId].usd, change: d[coinId].usd_24h_change } : null
  } catch { return null }
}

// ─── Agent command handlers ───────────────────────────────────────────────────
async function handleAndyCommand(options, interactionToken) {
  const msg = options.find(o => o.name === 'message')?.value || 'Bonjour'
  const reply = await callAnDy(msg)
  await patchReply(interactionToken, agentEmbed('andy', reply || 'Pas de réponse.'))
}

async function handleScanCommand(options, interactionToken) {
  const symbolsRaw = options.find(o => o.name === 'symbols')?.value || 'BTC-USD,ETH-USD,AAPL,NVDA'
  const symbols = symbolsRaw.split(',').map(s => s.trim()).slice(0, 8)

  const results = await Promise.all(symbols.map(async sym => {
    const isCrypto = ['BTC-USD', 'ETH-USD', 'SOL-USD', 'BNB-USD', 'XRP-USD'].includes(sym.toUpperCase())
    let data
    if (isCrypto) {
      const coinMap = { 'BTC-USD': 'bitcoin', 'ETH-USD': 'ethereum', 'SOL-USD': 'solana', 'BNB-USD': 'binancecoin', 'XRP-USD': 'ripple' }
      data = await fetchCryptoPrice(coinMap[sym.toUpperCase()] || sym.toLowerCase())
    } else {
      data = await fetchPrice(sym)
    }
    if (!data) return null
    const chg = parseFloat(data.change || 0)
    const arrow = chg >= 2 ? '🚀' : chg >= 0.5 ? '🟢' : chg <= -2 ? '🔴' : chg <= -0.5 ? '🔻' : '🟡'
    return { name: sym, value: `${arrow} **$${Number(data.price).toLocaleString('en-US', { maximumFractionDigits: 2 })}** · ${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`, inline: true }
  }))

  const fields = results.filter(Boolean)
  await patchReply(interactionToken, agentEmbed('market_scanner',
    `Scan de **${fields.length}** actifs — ${new Date().toLocaleTimeString('fr-FR')}`,
    fields
  ))
}

async function handleAnalyzeCommand(options, interactionToken) {
  const symbol = options.find(o => o.name === 'symbol')?.value || 'AAPL'
  const interval = options.find(o => o.name === 'interval')?.value || '1d'
  const reply = await callAnDy(`Fais une analyse technique complète de ${symbol} sur le timeframe ${interval}. Donne RSI, MACD, supports/résistances, et niveau d'entrée recommandé.`)
  await patchReply(interactionToken, agentEmbed('tech_analyst', reply, [
    { name: 'Symbole', value: symbol, inline: true },
    { name: 'Timeframe', value: interval, inline: true },
  ]))
}

async function handlePriceCommand(options, interactionToken) {
  const symbol = options.find(o => o.name === 'symbol')?.value || 'BTC-USD'
  const data = await fetchPrice(symbol) || await fetchCryptoPrice(symbol.toLowerCase().replace('-usd', ''))
  if (!data) {
    await patchReply(interactionToken, agentEmbed('crypto_tracker', `❌ Symbole "${symbol}" introuvable.`))
    return
  }
  const chg = parseFloat(data.change || 0)
  await patchReply(interactionToken, agentEmbed('crypto_tracker',
    `**${data.name || symbol}**\n\n# $${Number(data.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    [{ name: 'Variation 24h', value: `${chg >= 0 ? '🟢 +' : '🔴 '}${chg.toFixed(2)}%`, inline: true }]
  ))
}

async function handleReviewCommand(options, interactionToken) {
  const focus = options.find(o => o.name === 'focus')?.value || 'général'
  const reply = await callAnDy(`Tu es CodeReviewer, agent de revue de code. Fais une analyse du code de l'application Trackr (React/Vite). Focus: ${focus}. Identifie les problèmes de performance, les bugs potentiels, les améliorations possibles. Sois concis et actionnable.`)
  await patchReply(interactionToken, agentEmbed('code_reviewer', reply))
}

async function handleUICommand(options, interactionToken) {
  const page = options.find(o => o.name === 'page')?.value || 'général'
  const reply = await callAnDy(`Tu es UIInspector et UXAnalyst. Analyse le design de l'application Trackr (page: ${page}). Design system: Stitch/Celestial — fond #060a16 navy, cyan #00daf3, violet #6600ea, Space Grotesk, verre glass. Identifie: 1) Incohérences visuelles, 2) Espacements à corriger, 3) Contrastes insuffisants, 4) Micro-interactions manquantes. Donne des suggestions concrètes.`)
  await patchReply(interactionToken, agentEmbed('ui_inspector', reply, [
    { name: 'Page analysée', value: page, inline: true },
    { name: 'Design System', value: 'Stitch/Celestial', inline: true },
  ]))
}

async function handlePortfolioCommand(_options, interactionToken) {
  const reply = await callAnDy('Analyse le portfolio de l\'utilisateur. Calcule le P&L total, identifie les positions à risque, les positions gagnantes et perdantes. Suggère des optimisations de portfolio (rééquilibrage, stop-loss, take-profit). Sois précis avec des niveaux de prix.')
  await patchReply(interactionToken, agentEmbed('portfolio_guard', reply))
}

async function handleAlertCommand(options, interactionToken) {
  const symbol = options.find(o => o.name === 'symbol')?.value
  const price = options.find(o => o.name === 'price')?.value
  const direction = options.find(o => o.name === 'direction')?.value || 'above'
  if (!symbol || !price) {
    await patchReply(interactionToken, agentEmbed('alert_bot', '❌ Symbole et prix requis.'))
    return
  }
  await patchReply(interactionToken, agentEmbed('alert_bot',
    `✅ Alerte configurée`,
    [
      { name: 'Actif', value: symbol, inline: true },
      { name: 'Niveau', value: `$${price}`, inline: true },
      { name: 'Direction', value: direction === 'above' ? '📈 Au-dessus' : '📉 En-dessous', inline: true },
    ]
  ))
}

async function handleReportCommand(options, interactionToken) {
  const type = options.find(o => o.name === 'type')?.value || 'daily'
  // Appelle l'endpoint reports dédié (avec mémoire + Claude Haiku)
  try {
    const r = await fetch(`${APP_URL}/api/reports?type=${type}`)
    const data = await r.json()
    await patchReply(interactionToken, agentEmbed('report_bot',
      `✅ Rapport **${type}** généré — ${data.stats?.improvements ?? 0} améliorations · ${data.stats?.successRate ?? 0}% succès`,
      [
        { name: 'Type',    value: type === 'weekly' ? 'Hebdomadaire 📅' : 'Quotidien 📆', inline: true },
        { name: 'Date',    value: new Date().toLocaleDateString('fr-FR'), inline: true },
        { name: 'Cycles',  value: `${data.stats?.brainCycles ?? '?'} cycles Brain`, inline: true },
      ]
    ))
  } catch {
    const reply = await callAnDy(`Génère un rapport ${type === 'weekly' ? 'hebdomadaire' : 'quotidien'} de marché. Inclus: 1) État général des marchés, 2) Top movers, 3) Crypto sentiment, 4) Setup de trade, 5) Risques.`)
    await patchReply(interactionToken, agentEmbed('report_bot', reply))
  }
}

async function handleBrainCommand(interactionToken) {
  await patchReply(interactionToken, agentEmbed('andy',
    '🧠 **Cycle Brain déclenché manuellement...**\n\nLe Brain va analyser la mémoire, décider des agents à activer, et potentiellement améliorer du code. Résultats dans #brain-cycles dans ~30s.',
    [{ name: '⚡ Statut', value: 'En cours d\'exécution', inline: true }]
  ))
  // Déclenche le brain en background
  fetch(`${APP_URL}/api/brain`).catch(() => {})
}

async function handleAskAgent(agentKey, options, interactionToken) {
  const question = options.find(o => o.name === 'question')?.value || 'Analyse la situation actuelle.'
  const a = AGENTS[agentKey]
  const reply = await callAnDy(`Tu es ${a.name}, agent spécialisé en: ${a.role}. Réponds à cette question dans ton domaine d'expertise: "${question}". Sois précis, actionnable, et concis.`)
  await patchReply(interactionToken, agentEmbed(agentKey, reply))
}

// ─── /dev — Admin control command ────────────────────────────────────────────
async function handleDevCommand(options, interactionToken) {
  const action = options.find(o => o.name === 'action')?.value || 'status'
  const description = options.find(o => o.name === 'description')?.value || ''
  const focus = options.find(o => o.name === 'focus')?.value || 'bugs'

  // ── status: show system health ────────────────────────────────────────────
  if (action === 'status') {
    try {
      const r = await fetch(`${APP_URL}/api/reports?type=status`, { signal: AbortSignal.timeout(20000) })
      const data = await r.json()
      const ok = data.services?.ok || 0
      const ko = data.services?.ko || 0
      await patchReply(interactionToken, {
        author: { name: '🔐 Admin — Statut Système' },
        color: ko === 0 ? 0x00c853 : ko > 2 ? 0xff1744 : 0xffa000,
        title: ko === 0 ? '✅ Tous les systèmes OK' : `⚠️ ${ko} service(s) en erreur`,
        description: `**${ok}** OK · **${ko}** KO · Variables: ${data.missing?.length === 0 ? 'Toutes ✅' : `${data.missing?.join(', ')} manquantes`}`,
        fields: (data.results || []).map(r => ({
          name: r.ok ? `✅ ${r.name}` : `❌ ${r.name}`,
          value: r.ok ? `${r.ms || '—'}ms${r.note ? ` — ${r.note}` : ''}` : (r.error || `HTTP ${r.status}`),
          inline: true,
        })),
        footer: { text: 'Admin Control · Trackr AI Hub' },
        timestamp: new Date().toISOString(),
      })
    } catch (e) {
      await patchReply(interactionToken, agentEmbed('pulse', `❌ Impossible de vérifier le statut: ${e.message}`))
    }
    return
  }

  // ── task: assign a task to the AI ────────────────────────────────────────
  if (action === 'task') {
    if (!description) {
      await patchReply(interactionToken, agentEmbed('nexus', '❌ Décris la tâche avec `description:...`'))
      return
    }
    // Store in memory as pending admin task
    try {
      await fetch(`${APP_URL}/api/memory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'admin_task', task: description, focus, status: 'pending', assignedBy: 'admin-discord' }),
        signal: AbortSignal.timeout(15000),
      })
    } catch {}
    await patchReply(interactionToken, {
      author: { name: '📋 Admin — Tâche assignée' },
      color: 0x6600ea,
      title: `✅ Tâche en file d'attente`,
      description: description,
      fields: [
        { name: '🎯 Focus', value: focus, inline: true },
        { name: '⏰ Exécution', value: 'Prochain cycle self-improve (~1-4h)', inline: true },
        { name: '🚀 Forcer maintenant', value: `\`/dev action:run focus:${focus}\``, inline: false },
      ],
      footer: { text: 'Tâche sauvegardée · L\'IA la traitera au prochain cycle' },
      timestamp: new Date().toISOString(),
    })
    return
  }

  // ── run: trigger immediate self-improve ──────────────────────────────────
  if (action === 'run' || action === 'improve') {
    await patchReply(interactionToken, {
      author: { name: '⚡ Admin — Self-Improve déclenché' },
      color: 0x00daf3,
      description: `🔄 **Focus \`${focus}\` lancé immédiatement...**\n\nL'IA lit le code, analyse et applique une amélioration. Résultats dans **#code-review** dans ~30s.`,
      fields: [{ name: '🎯 Focus actif', value: focus, inline: true }],
      footer: { text: 'AnDy Self-Improve · Cycle forcé par admin' },
      timestamp: new Date().toISOString(),
    })
    // Fire in background
    fetch(`${APP_URL}/api/self-improve?focus=${focus}`, { signal: AbortSignal.timeout(55000) }).catch(() => {})
    return
  }

  // ── report: generate and post report ─────────────────────────────────────
  if (action === 'report') {
    await patchReply(interactionToken, agentEmbed('report_bot',
      `📊 **Génération rapport quotidien...**\n\nLe rapport sera posté dans **#reports** dans ~10s.`
    ))
    fetch(`${APP_URL}/api/reports?type=daily&post=true`, { signal: AbortSignal.timeout(30000) }).catch(() => {})
    return
  }

  await patchReply(interactionToken, agentEmbed('nexus', `Action "${action}" inconnue. Options: status | task | run | report`))
}

async function handleGuideCommand(options, interactionToken) {
  const niveau = options.find(o => o.name === 'niveau')?.value || 'auto'

  const guides = {
    debutant: {
      title: '🌱 Phase 1 — Éveil de la Galaxie (0–50 échanges)',
      desc: 'L\'IA commence à apprendre qui tu es. La galaxie est petite mais elle grandit à chaque échange.',
      fields: [
        {
          name: '🚀 Premières commandes à essayer',
          value: [
            '`/andy message:Bonjour, présente-toi` — Rencontre AnDy',
            '`/price symbol:BTC-USD` — Premier prix en temps réel',
            '`/scan symbols:BTC-USD,AAPL,NVDA` — Scan multi-actifs',
            '`/help` — Voir tous les agents disponibles',
          ].join('\n'),
        },
        {
          name: '🌌 Ce qui se passe dans la galaxie',
          value: 'Chaque message dans `/andy` ajoute une étoile. Plus tu échanges, plus la galaxie se densifie et la couleur évolue. Tu peux **glisser pour explorer** et **pincer pour zoomer** dans l\'app.',
        },
        {
          name: '⏭️ Prochaine étape',
          value: 'Atteins 50 échanges pour déverrouiller les agents de marché et voir les scans automatiques s\'activer dans `#market-scanner`.',
        },
      ],
      color: 0x34d399,
    },
    intermediaire: {
      title: '🌿 Phase 2 — Intelligence Marchés (50–200 échanges)',
      desc: 'Les agents de marché sont actifs. Scans automatiques toutes les 15 min dans les canaux dédiés.',
      fields: [
        {
          name: '📈 Commandes marché déverrouillées',
          value: [
            '`/analyze symbol:NVDA interval:1h` — Analyse technique complète',
            '`/portfolio` — P&L et risque de ton portfolio',
            '`/alert symbol:BTC-USD price:70000 direction:above` — Alertes prix',
            '`/oracle question:Quelles actions surveiller?` — Analyse prédictive',
            '`/sentiment` — Fear & Greed + sentiment général',
          ].join('\n'),
        },
        {
          name: '🤖 Agents actifs en arrière-plan',
          value: [
            '`#market-scanner` — MarketScanner scan 50+ tickers toutes les 15 min',
            '`#crypto` — CryptoTracker BTC/ETH/SOL en continu',
            '`#market-news` — NewsDigest actualités marché',
            '`#app-pulse` — Pulse surveille l\'app 24/7',
          ].join('\n'),
        },
        {
          name: '⏭️ Prochaine étape',
          value: 'Atteins 200 échanges pour activer les agents Dev et Design. CodeReviewer et UIInspector analysent automatiquement ton code à 8h, 12h, 16h et 20h UTC.',
        },
      ],
      color: 0x00daf3,
    },
    avance: {
      title: '🌳 Phase 3 — Orchestration Complète (200+ échanges)',
      desc: 'Tous les 45 agents sont actifs. La galaxie est pleine, l\'IA optimise l\'app en temps réel.',
      fields: [
        {
          name: '💻 Agents Dev & Design actifs',
          value: [
            '`/review focus:performance` — CodeReviewer analyse le code',
            '`/ui page:portfolio` — UIInspector + UXAnalyst revue design',
            '`/report type:weekly` — Rapport hebdomadaire complet',
            '`/risk question:Quel est le drawdown max?` — RiskMetrics',
            '`/analyze symbol:TSLA interval:4h` — TechAnalyst multi-timeframe',
          ].join('\n'),
        },
        {
          name: '🔄 Scans automatiques planifiés',
          value: [
            '**Toutes les 15 min** — MarketScanner + CryptoTracker',
            '**8h, 12h, 16h, 20h UTC** — CodeReviewer revue code',
            '**9h et 18h UTC** — UIInspector revue design',
            '**8h UTC quotidien** — ReportBot rapport de marché',
          ].join('\n'),
        },
        {
          name: '🌌 Galaxie au maximum',
          value: 'La galaxie affiche jusqu\'à **1000 étoiles**, avec des étoiles filantes, un noyau multi-couches violet→cyan→blanc, et tu peux naviguer librement dans cet univers. Chaque agent contribue à un système qui s\'auto-améliore.',
        },
        {
          name: '🎯 Ce qui vient ensuite',
          value: 'Les agents apprennent de tes préférences. Plus tu utilises `/andy`, plus les réponses sont personnalisées. Les agents Dev et Design commencent à suggérer des améliorations proactives sans que tu demandes.',
        },
      ],
      color: 0x8b5cf6,
    },
  }

  // Auto-detect: default to debutant guide with all phases summarized
  if (niveau === 'auto') {
    await patchReply(interactionToken, {
      author: { name: '🧭 Guide AnDy — Progression de la Galaxie' },
      description: 'L\'IA évolue avec toi. Voici les 3 phases de développement de ton système d\'agents.',
      color: 0x6600ea,
      fields: [
        { name: '🌱 Phase 1 · Éveil (0–50 échanges)', value: 'Commence par `/andy`, `/price`, `/scan`. La galaxie grandit à chaque message. Glisse et explore dans l\'app.', inline: false },
        { name: '🌿 Phase 2 · Marchés (50–200 échanges)', value: 'Agents marché actifs : analyse technique, alertes, portfolio. Scans automatiques dans `#market-scanner` toutes les 15 min.', inline: false },
        { name: '🌳 Phase 3 · Orchestration (200+ échanges)', value: 'Tous les 45 agents actifs : code review auto, design inspection, rapports quotidiens. L\'IA s\'auto-améliore.', inline: false },
        { name: '📖 Voir le guide détaillé', value: '`/guide niveau:debutant` · `/guide niveau:intermediaire` · `/guide niveau:avance`', inline: false },
      ],
      footer: { text: 'AnDy · Intelligence Centrale · Trackr AI Hub' },
      timestamp: new Date().toISOString(),
    })
    return
  }

  const g = guides[niveau]
  if (!g) {
    await patchReply(interactionToken, agentEmbed('oracle', '❌ Niveau invalide. Utilise: `debutant`, `intermediaire`, ou `avance`.'))
    return
  }

  await patchReply(interactionToken, {
    author: { name: '🧭 Guide AnDy — ' + g.title },
    description: g.desc,
    color: g.color,
    fields: g.fields,
    footer: { text: 'AnDy · Trackr AI Hub · Tape /guide pour les autres phases' },
    timestamp: new Date().toISOString(),
  })
}

async function handleAnalyseCommand(options, interactionToken) {
  const symbol  = (options.find(o => o.name === 'symbol')?.value || 'BTC').toUpperCase()
  const typeOpt = options.find(o => o.name === 'type')?.value
  const type    = typeOpt || (CRYPTO_LIST.includes(symbol) ? 'crypto' : 'stock')

  // ── Phase 1 : Signal instantané en ~3s ───────────────────────────────────
  try {
    const { price, change24h, rsi } = await getQuickSignal(symbol, type)

    const priceStr = price ? `$${Number(price).toLocaleString('en-US', { maximumFractionDigits: 4 })}` : 'N/A'
    const chgStr   = change24h != null ? `${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%` : 'N/A'
    const chgEmoji = change24h == null ? '⬜' : change24h >= 2 ? '🚀' : change24h >= 0 ? '🟢' : change24h <= -2 ? '🔴' : '🔻'
    const rsiLabel = rsi != null ? `${rsi}${rsi > 70 ? ' ⚠️ suracheté' : rsi < 30 ? ' 🟢 survendu' : ''}` : null

    // Haiku verdict ultra-rapide
    let quickVerdict = '🔍 Collecte et analyse en cours...'
    if (ANTHROPIC_KEY && price) {
      try {
        const haikuData = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 220,
            messages: [{ role: 'user', content: `Expert senior Goldman Sachs. ${symbol} (${type}): Prix ${priceStr}, var 24h ${chgStr}${rsi ? `, RSI(14)=${rsi}` : ''}. En 2 phrases percutantes en français: verdict immédiat (ACHAT/NEUTRE/VENTE) + 1 niveau clé à surveiller maintenant. Direct, précis, professionnel.` }],
          }),
          signal: AbortSignal.timeout(6000),
        }).then(r => r.json())
        quickVerdict = haikuData.content?.[0]?.text || quickVerdict
      } catch {}
    }

    await patchReply(interactionToken, {
      author: { name: `⚡ TradingExpert — Signal ${symbol} (instantané)` },
      color: change24h == null ? 0x6600ea : change24h >= 0 ? 0x00c853 : 0xff1744,
      description: quickVerdict,
      fields: [
        { name: `${chgEmoji} Prix actuel`, value: priceStr, inline: true },
        { name: '📅 Variation 24h', value: chgStr, inline: true },
        ...(rsiLabel ? [{ name: '📊 RSI(14)', value: rsiLabel, inline: true }] : []),
        { name: '🔬 Analyse Goldman Sachs', value: 'Complète dans **#trading-desk** → ~15 secondes', inline: false },
      ],
      footer: { text: 'TradingExpert · Signal rapide Haiku · Analyse Sonnet en cours...' },
      timestamp: new Date().toISOString(),
    })
  } catch {
    await patchReply(interactionToken, agentEmbed('oracle',
      `🔍 **Analyse ${symbol} en cours...**\n\nRésultats complets dans **#trading-desk** dans ~15 secondes.`
    ))
  }

  // ── Phase 2 : Analyse complète Goldman Sachs en arrière-plan ─────────────
  fetch(`${APP_URL}/api/trading-expert?symbol=${symbol}&type=${type}`, {
    signal: AbortSignal.timeout(55000),
  }).catch(() => {})
}

async function handleHelpCommand(interactionToken) {
  const categories = {
    'ai-core': '🧠 Intelligence Centrale',
    'markets': '📈 Marché & Trading',
    'dev': '💻 Développement',
    'design': '🎨 Design',
    'data': '📊 Données',
    'utility': '🔧 Utilitaires',
  }
  const fields = Object.entries(categories).map(([cat, label]) => {
    const agents = Object.values(AGENTS).filter(a => a.cat === cat)
    return {
      name: label,
      value: agents.map(a => `${a.emoji} **${a.name}** — ${a.role}`).join('\n'),
    }
  })
  await patchReply(interactionToken, {
    author: { name: '🌌 Trackr AI Hub — 45 Agents actifs' },
    description: 'Tape `/andy` pour parler à l\'IA · `/scan` pour le marché · `/review` pour le code',
    color: 0x00daf3,
    fields,
    footer: { text: 'Trackr AI Hub · Claude Sonnet 4.6' },
  })
}

// ─── Slash command router ─────────────────────────────────────────────────────
async function processInteraction(body) {
  const { token, data } = body
  const cmd = data.name
  const opts = data.options || []

  switch (cmd) {
    case 'andy':      return handleAndyCommand(opts, token)
    case 'scan':      return handleScanCommand(opts, token)
    case 'analyze':   return handleAnalyzeCommand(opts, token)
    case 'price':     return handlePriceCommand(opts, token)
    case 'review':    return handleReviewCommand(opts, token)
    case 'ui':        return handleUICommand(opts, token)
    case 'portfolio': return handlePortfolioCommand(opts, token)
    case 'alert':     return handleAlertCommand(opts, token)
    case 'report':    return handleReportCommand(opts, token)
    case 'analyse':   return handleAnalyseCommand(opts, token)
    case 'brain':     return handleBrainCommand(token)
    case 'help':      return handleHelpCommand(token)
    case 'guide':     return handleGuideCommand(opts, token)
    case 'dev':       return handleDevCommand(opts, token)
    // Generic agent commands (oracle, risk_metrics, etc.)
    default:
      if (AGENTS[cmd]) return handleAskAgent(cmd, opts, token)
      return patchReply(token, agentEmbed('nexus', `Commande "${cmd}" non reconnue. Tape \`/help\` pour voir les commandes disponibles.`))
  }
}

// Disable Vercel body parser — we need the raw body for signature verification
export const config = { api: { bodyParser: false } }

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', chunk => { data += chunk })
    req.on('end', () => resolve(data))
    req.on('error', reject)
  })
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).end(); return }

  if (!PUBLIC_KEY) {
    res.status(503).json({ error: 'Discord not configured' }); return
  }

  const rawBody = await getRawBody(req)
  const signature = req.headers['x-signature-ed25519']
  const timestamp = req.headers['x-signature-timestamp']

  if (!signature || !timestamp || !verifyDiscordSignature(rawBody, signature, timestamp)) {
    res.status(401).json({ error: 'Invalid signature' }); return
  }

  const body = JSON.parse(rawBody)

  // Discord health check
  if (body.type === 1) {
    res.json({ type: 1 }); return
  }

  // Slash command
  if (body.type === 2) {
    // Send deferred "thinking..." response immediately (within 3s)
    res.json({ type: 5 })

    // Continue processing AFTER response is sent (function lives for maxDuration=60s)
    try {
      await processInteraction(body)
    } catch (e) {
      console.error('Agent error:', e)
      try {
        await discordFetch(`/webhooks/${APP_ID}/${body.token}/messages/@original`, 'PATCH', {
          embeds: [agentEmbed('nexus', `❌ Erreur agent: ${e.message}`)],
        })
      } catch {}
    }
    return
  }

  res.json({ type: 1 })
}
