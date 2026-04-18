Je vais implémenter `AbortSignal.timeout()` pour tous les `fetch()` dans les fichiers demandés. Voici les modifications pour chaque fichier :

### api/brain.js
```javascript
// api/brain.js
// ─── Brain API — 45 AnDy Agents ────────────────────────────────────────────
// Receives requests from Trackr app, routes to agent logic
// Background processing: res.json() sends immediately, function continues up to 60s

import crypto from 'crypto'

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const APP_URL = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

// ─── Anthropic Helpers ─────────────────────────────────────────────────────
async function anthropicStream(prompt, max_tokens = 4000, timeoutMs = 30000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    if (!response.body) {
      throw new Error('No response body from Anthropic')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()

    return new ReadableStream({
      start(controller) {
        function pump() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close()
              clearTimeout(timeoutId)
              return
            }
            const text = decoder.decode(value, { stream: true })
            controller.enqueue(text)
            pump()
          }).catch(err => {
            controller.error(err)
            clearTimeout(timeoutId)
          })
        }
        pump()
      }
    })
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

async function anthropicComplete(prompt, max_tokens = 4000, timeoutMs = 30000) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: controller.signal
    })

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`)
    }

    const data = await response.json()
    return data.content[0].text
  } catch (error) {
    clearTimeout(timeoutId)
    throw error
  }
}

// ─── Agent Logic ───────────────────────────────────────────────────────────
async function handleAgentRequest(agent, payload) {
  switch (agent) {
    case 'andy':
    case 'nexus':
    case 'pulse':
    case 'synapse':
    case 'oracle':
      return await anthropicComplete(payload.prompt, 4000, 30000)
    case 'market_scanner':
    case 'tech_analyst':
    case 'crypto_tracker':
    case 'alert_bot':
    case 'portfolio_guard':
    case 'sector_spy':
    case 'news_digest':
    case 'sentiment_bot':
    case 'macro_watch':
    case 'options_flow':
      return await anthropicComplete(payload.prompt, 4000, 30000)
    case 'code_reviewer':
    case 'bug_hunter':
    case 'perf_optimizer':
    case 'security_audit':
    case 'refactor_bot':
    case 'test_coverage':
    case 'api_monitor':
    case 'deploy_watch':
    case 'dependency_bot':
    case 'doc_writer':
      return await anthropicComplete(payload.prompt, 4000, 30000)
    case 'ui_inspector':
    case 'ux_analyst':
    case 'color_master':
    case 'typography_bot':
    case 'animation_bot':
    case 'responsive_bot':
    case 'access_bot':
    case 'pixel_perfect':
      return await anthropicComplete(payload.prompt, 4000, 30000)
    case 'data_miner':
    case 'stats_bot':
    case 'correlation_bot':
    case 'backtest_bot':
    case 'risk_metrics':
      return await anthropicComplete(payload.prompt, 4000, 30000)
    default:
      throw new Error(`Unknown agent: ${agent}`)
  }
}

export { anthropicStream, anthropicComplete, handleAgentRequest }
```

### api/discord.js
```javascript
// api/discord.js
// ─── Discord Interaction Handler — 45 AnDy Agents ───────────────────────────
// Receives slash commands from Discord, routes to agent logic
// Background processing: res.json() sends immediately, function continues up to 60s

import crypto from 'crypto'

const DISCORD_API = 'https://discord.com/api/v10'
const APP_ID = process.env.DISCORD_APPLICATION_ID
const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const PUBLIC_KEY = process.env.DISCORD_PUBLIC_KEY
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY
const APP_URL = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

// ─── Crypto helpers ───────────────────────────────────────────────────────────
const CRYPTO_LIST = ['BTC','ETH','SOL','BNB','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','UNI','LTC','ATOM']
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
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=30d`, {
        headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' },
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      const ct = response.headers.get('content-type') || ''
      if (!response.ok) {
        console.warn(`Yahoo Finance ${symbol}: HTTP ${response.status}`)
        return null
      }
      if (
        !ct.includes('application/json') &&
        !ct.includes('text/json') &&
        !ct.includes('text/plain') &&
        !ct.includes('application/x-www-form-urlencoded')
      ) {
        console.warn(`Yahoo Finance ${symbol}: unexpected content-type "${ct}" (possible SSE/stream), skipping .json()`)
        await response.body?.cancel().catch(() => {})
        return null
      }
      const data = await response.json().catch(e => {
        console.warn(`Yahoo Finance ${symbol}: JSON parse error:`, e.message)
        return null
      })

      if (data?.chart?.result?.[0]) {
        const r = data.chart.result[0]
        const closes = (r.indicators?.quote?.[0]?.close || []).filter(Boolean)
        price = r.meta?.regularMarketPrice
        const prev = r.meta?.previousClose || r.meta?.chartPreviousClose
        if (prev && price) change24h = (price - prev) / prev * 100
        rsi = quickRSI(closes)
      }
    } catch (e) {
      console.warn(`Yahoo Finance ${symbol} fetch error:`, e.message)
      return null
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

    clearTimeout(timeoutId)

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
  code_reviewer:   { name: 'CodeReviewer',   emoji: '👁️', color: 0