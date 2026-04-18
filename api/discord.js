// api/discord.js
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
    async function safeJson(r) {
      if (!r.ok) { await r.body?.cancel().catch(() => {}); return null }
      const ct = r.headers.get('content-type') || ''
      if (!ct.includes('application/json') && !ct.includes('text/json') && !ct.includes('text/plain')) {
        console.warn(`CoinGecko unexpected content-type "${ct}", skipping .json()`)
        await r.body?.cancel().catch(() => {})
        return null
      }
      return r.json().catch(e => { console.warn('CoinGecko JSON parse error:', e.message); return null })
    }
    const [priceRes, ohlcRes] = await Promise.allSettled([
      fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true`, { signal: AbortSignal.timeout(4000) }).then(safeJson),
      fetch(`https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=14`, { signal: AbortSignal.timeout(4000) }).then(safeJson),
    ])
    if (priceRes.status === 'fulfilled') { const d = priceRes.value?.[id]; price = d?.usd; change24h = d?.usd_24h_change }
    if (ohlcRes.status === 'fulfilled' && Array.isArray(ohlcRes.value)) rsi = quickRSI(ohlcRes.value.map(c => c[4]))
  } else {
    const data = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=30d`, {
      headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
      signal: AbortSignal.timeout(5000)
    })
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

// ─── Discord SSE Stream Handler ───────────────────────────────────────────────
async function handleDiscordStream(res, streamUrl, timeoutMs = 10000) {
  const encoder = new TextEncoder()
  const decoder = new TextDecoder()

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(streamUrl, {
      headers: {
        'Authorization': `Bot ${BOT_TOKEN}`,
        'Accept': 'text/event-stream',
      },
      signal: controller.signal
    })

    if (!response.ok) {
      res.status(response.status).json({ error: `Discord API error: ${response.status}` })
      return
    }

    if (!response.body) {
      res.status(500).json({ error: 'No response body from Discord' })
      return
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    })

    const reader = response.body.getReader()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const text = decoder.decode(value, { stream: true })
      const lines = text.split('\n')

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6))
            res.write(`data: ${JSON.stringify(data)}\n\n`)
          } catch (e) {
            console.warn('Failed to parse Discord SSE data:', e.message)
          }
        }
      }
    }
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Discord SSE stream error:', error)
      res.status(500).json({ error: 'Stream processing failed' })
    }
  } finally {
    clearTimeout(timeoutId)
    res.end()
  }
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
  risk_metrics:    { name: 'RiskMetrics',    emoji: '⚖️', color: 0xfcd34d, cat