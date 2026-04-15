// AnDy AI — Vercel serverless function
// Claude Sonnet 4.6 · Agentic tool use · Technical Analysis

const MODEL = 'claude-sonnet-4-6'
const MAX_TOKENS = 4096
const MAX_LOOP = 6

// ─── Technical Analysis helpers ───────────────────────────────────────────────
function computeRSI(closes, period = 14) {
  if (closes.length < period + 1) return null
  let gains = 0, losses = 0
  for (let i = 1; i <= period; i++) {
    const d = closes[i] - closes[i - 1]
    if (d > 0) gains += d; else losses -= d
  }
  let ag = gains / period, al = losses / period
  for (let i = period + 1; i < closes.length; i++) {
    const d = closes[i] - closes[i - 1]
    ag = (ag * (period - 1) + Math.max(d, 0)) / period
    al = (al * (period - 1) + Math.max(-d, 0)) / period
  }
  return 100 - 100 / (1 + ag / (al || 0.0001))
}

function computeEMA(data, period) {
  if (data.length < period) return null
  const k = 2 / (period + 1)
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < data.length; i++) ema = data[i] * k + ema * (1 - k)
  return ema
}

function computeSMA(data, period) {
  if (data.length < period) return null
  return data.slice(-period).reduce((a, b) => a + b, 0) / period
}

function computeMACD(closes) {
  if (closes.length < 26) return null
  const ema12 = computeEMA(closes, 12)
  const ema26 = computeEMA(closes, 26)
  if (!ema12 || !ema26) return null
  const line = ema12 - ema26
  // Signal line: EMA9 of MACD values (simplified: use line direction)
  const prevLine = computeEMA(closes.slice(0, -1), 12) - computeEMA(closes.slice(0, -1), 26)
  return { line: line.toFixed(4), ema12: ema12.toFixed(2), ema26: ema26.toFixed(2), bullish: line > 0, crossingUp: line > 0 && (prevLine || 0) < 0, crossingDown: line < 0 && (prevLine || 0) > 0 }
}

function computeBollinger(closes, period = 20, mult = 2) {
  if (closes.length < period) return null
  const sma = computeSMA(closes, period)
  const recent = closes.slice(-period)
  const variance = recent.reduce((sum, v) => sum + Math.pow(v - sma, 2), 0) / period
  const std = Math.sqrt(variance)
  return { middle: sma.toFixed(2), upper: (sma + mult * std).toFixed(2), lower: (sma - mult * std).toFixed(2), bandwidth: ((2 * mult * std) / sma * 100).toFixed(1) }
}

function findPivots(highs, lows, period = 5) {
  const supports = [], resistances = []
  for (let i = period; i < highs.length - period; i++) {
    const isHigh = highs.slice(i - period, i).every(v => highs[i] >= v) && highs.slice(i + 1, i + period + 1).every(v => highs[i] >= v)
    const isLow  = lows.slice(i - period, i).every(v => lows[i] <= v)  && lows.slice(i + 1, i + period + 1).every(v => lows[i] <= v)
    if (isHigh) resistances.push(highs[i])
    if (isLow)  supports.push(lows[i])
  }
  return { supports: [...new Set(supports.map(v => +v.toFixed(2)))].slice(-5), resistances: [...new Set(resistances.map(v => +v.toFixed(2)))].slice(-5) }
}

function cleanArr(arr) { return (arr || []).filter(v => v !== null && !isNaN(v)) }

// ─── Server-side tool execution ───────────────────────────────────────────────
async function runServerTool(name, input) {

  if (name === 'fetch_price') {
    try {
      const sym = encodeURIComponent(input.symbol)
      const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${sym}?interval=1d&range=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const d = await r.json()
      const meta = d?.chart?.result?.[0]?.meta
      if (!meta?.regularMarketPrice) return { error: 'Symbol not found' }
      const chg = meta.regularMarketPrice - meta.previousClose
      const pct = (chg / meta.previousClose * 100).toFixed(2)
      return { symbol: input.symbol, name: meta.shortName || input.symbol, price: meta.regularMarketPrice, change: chg.toFixed(2), changePct: pct, currency: meta.currency || 'USD', marketState: meta.marketState }
    } catch (e) { return { error: e.message } }
  }

  if (name === 'fetch_crypto_price') {
    try {
      const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${input.coinId}&vs_currencies=usd&include_24hr_change=true&include_market_cap=true`, { headers: { Accept: 'application/json' } })
      const d = await r.json()
      const coin = d[input.coinId]
      if (!coin) return { error: 'Not found' }
      return { coinId: input.coinId, price: coin.usd, change24h: coin.usd_24h_change?.toFixed(2), marketCap: coin.usd_market_cap }
    } catch (e) { return { error: e.message } }
  }

  if (name === 'technical_analysis') {
    try {
      const { symbol, interval } = input
      const intervalMap = {
        '5m':  { interval: '5m',  range: '2d' },
        '15m': { interval: '15m', range: '5d' },
        '1h':  { interval: '60m', range: '1mo' },
        '4h':  { interval: '60m', range: '3mo' },
        '1d':  { interval: '1d',  range: '1y' },
      }
      const p = intervalMap[interval] || { interval: '1d', range: '6mo' }
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=${p.interval}&range=${p.range}`
      const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
      const d = await r.json()
      const res = d?.chart?.result?.[0]
      if (!res) return { error: 'No data for ' + symbol }

      const meta = res.meta
      const q = res.indicators?.quote?.[0] || {}
      const closes = cleanArr(q.close)
      const highs  = cleanArr(q.high)
      const lows   = cleanArr(q.low)
      const vols   = cleanArr(q.volume)

      if (closes.length < 20) return { error: 'Not enough data' }

      const price   = meta.regularMarketPrice
      const rsi     = computeRSI(closes)
      const ema9    = computeEMA(closes, 9)
      const ema21   = computeEMA(closes, 21)
      const ema50   = computeEMA(closes, Math.min(50, closes.length - 1))
      const ema200  = computeEMA(closes, Math.min(200, closes.length - 1))
      const macd    = computeMACD(closes)
      const bb      = computeBollinger(closes)
      const pivots  = findPivots(highs, lows)

      // Volume
      const avgVol = vols.slice(-20).reduce((a, b) => a + b, 0) / 20
      const lastVol = vols[vols.length - 1]
      const volRatio = lastVol / avgVol

      // Trend
      let trend = 'Neutre'
      if (ema21 && ema50) {
        if (price > ema21 && ema21 > ema50) trend = 'Haussière'
        else if (price < ema21 && ema21 < ema50) trend = 'Baissière'
        else if (price > ema21) trend = 'Légèrement haussière'
        else trend = 'Légèrement baissière'
      }

      // Signals
      const signals = []
      if (rsi !== null) {
        if (rsi < 25) signals.push('🟢 RSI très survendu (' + rsi.toFixed(1) + ') — zone d\'achat fort')
        else if (rsi < 35) signals.push('🟢 RSI survendu (' + rsi.toFixed(1) + ') — signal achat potentiel')
        else if (rsi > 75) signals.push('🔴 RSI très suracheté (' + rsi.toFixed(1) + ') — zone de vente fort')
        else if (rsi > 65) signals.push('🔴 RSI suracheté (' + rsi.toFixed(1) + ') — surveiller une sortie')
        else signals.push('🟡 RSI neutre (' + rsi.toFixed(1) + ')')
      }
      if (macd?.crossingUp) signals.push('🟢 Croisement MACD haussier — signal d\'achat')
      if (macd?.crossingDown) signals.push('🔴 Croisement MACD baissier — signal de vente')
      if (ema200 && price > ema200 * 1.0) signals.push('🟢 Au-dessus de l\'EMA200 — tendance long terme haussière')
      if (ema200 && price < ema200 * 1.0) signals.push('🔴 En dessous de l\'EMA200 — tendance long terme baissière')
      if (volRatio > 2) signals.push('⚡ Volume x' + volRatio.toFixed(1) + ' — mouvement significatif')

      // Key levels (closest to current price)
      const nearSupports    = pivots.supports.filter(s => s < price).sort((a, b) => b - a).slice(0, 3)
      const nearResistances = pivots.resistances.filter(s => s > price).sort((a, b) => a - b).slice(0, 3)

      // R/R suggestion
      const nextSupport    = nearSupports[0]
      const nextResistance = nearResistances[0]
      let rrSuggestion = null
      if (nextSupport && nextResistance) {
        const risk   = price - nextSupport
        const reward = nextResistance - price
        const rr     = (reward / risk).toFixed(1)
        rrSuggestion = { entry: price.toFixed(2), stopLoss: nextSupport.toFixed(2), target: nextResistance.toFixed(2), rr, favorable: reward > risk }
      }

      return {
        symbol, interval, assetName: meta.shortName || symbol, price: price.toFixed(2),
        trend,
        rsi: rsi?.toFixed(1),
        ema9: ema9?.toFixed(2), ema21: ema21?.toFixed(2), ema50: ema50?.toFixed(2), ema200: ema200?.toFixed(2),
        macd: macd ? { line: macd.line, bullish: macd.bullish } : null,
        bollinger: bb,
        supports: nearSupports.map(v => v.toFixed(2)),
        resistances: nearResistances.map(v => v.toFixed(2)),
        volume: { current: Math.round(lastVol / 1000) + 'K', avg20: Math.round(avgVol / 1000) + 'K', ratio: volRatio.toFixed(2) },
        signals,
        tradeSetup: rrSuggestion,
        chartTag: `[CHART:${symbol}:${interval}]`,
      }
    } catch (e) { return { error: e.message } }
  }

  if (name === 'scan_market') {
    const results = []
    for (const sym of (input.symbols || []).slice(0, 10)) {
      try {
        const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?interval=1d&range=1mo`
        const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
        const d = await r.json()
        const res = d?.chart?.result?.[0]
        if (!res) continue
        const meta = res.meta
        const closes = cleanArr(res.indicators?.quote?.[0]?.close)
        const rsi = computeRSI(closes)
        const ema20 = computeEMA(closes, 20)
        const chg = meta.regularMarketPrice - meta.previousClose
        const pct = (chg / meta.previousClose * 100).toFixed(2)
        let signal = '🟡 Neutre'
        if (rsi !== null) {
          if (rsi < 30) signal = '🟢 Survendu — achat potentiel'
          else if (rsi > 70) signal = '🔴 Suracheté — prudence'
          else if (meta.regularMarketPrice > (ema20 || 0)) signal = '🟢 Au-dessus EMA20'
          else signal = '🔴 En dessous EMA20'
        }
        results.push({ symbol: sym, name: meta.shortName || sym, price: meta.regularMarketPrice.toFixed(2), changePct: pct, rsi: rsi?.toFixed(1), trend: meta.regularMarketPrice > (ema20 || 0) ? 'Haussier' : 'Baissier', signal })
      } catch {}
    }
    return { results, count: results.length, scannedAt: new Date().toISOString() }
  }

  if (name === 'trigger_agent') {
    try {
      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : 'https://trackr-app-nu.vercel.app'
      const r = await fetch(`${baseUrl}/api/trigger-agent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent: input.agent, task: input.task, channelHint: input.channelHint }),
      })
      const d = await r.json()
      return d.ok
        ? { dispatched: true, agent: input.agent, channel: d.channel, message: `${input.agent} a reçu la tâche et les résultats ont été postés dans #${d.channel} sur Discord.` }
        : { dispatched: false, error: 'Agent trigger failed' }
    } catch (e) {
      return { dispatched: false, error: e.message }
    }
  }

  return { error: `Unknown server tool: ${name}` }
}

// ─── Tools ────────────────────────────────────────────────────────────────────
const TOOLS = [
  {
    name: 'navigate',
    description: 'Navigate to a page in the Trackr app',
    input_schema: { type: 'object', properties: { path: { type: 'string', description: "'/', '/markets', '/sports', '/news', '/flights', '/portfolio', '/sneakers', '/translator', '/settings', '/agents'" } }, required: ['path'] }
  },
  {
    name: 'fetch_price',
    description: 'Fetch live price from Yahoo Finance. Use BEFORE giving any price info.',
    input_schema: { type: 'object', properties: { symbol: { type: 'string', description: "Yahoo Finance symbol: 'AAPL', 'TSLA', 'NVDA', 'BTC-USD', 'ETH-USD', '^GSPC', '^DJI'" } }, required: ['symbol'] }
  },
  {
    name: 'fetch_crypto_price',
    description: 'Fetch live crypto price from CoinGecko',
    input_schema: { type: 'object', properties: { coinId: { type: 'string', description: "CoinGecko ID: 'bitcoin', 'ethereum', 'solana', 'ripple', 'dogecoin'" } }, required: ['coinId'] }
  },
  {
    name: 'technical_analysis',
    description: "Full technical analysis: RSI, EMA, MACD, Bollinger, support/resistance, trade setup. Always use when doing market analysis or when user asks about a chart. Returns a chartTag to include in your response to display the chart.",
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: "Yahoo Finance symbol: 'AAPL', 'BTC-USD', '^GSPC', etc." },
        interval: { type: 'string', enum: ['5m', '15m', '1h', '4h', '1d'], description: "Timeframe. Default '1d' for general analysis. Use '1h' or '4h' for entry timing." }
      },
      required: ['symbol', 'interval']
    }
  },
  {
    name: 'scan_market',
    description: "Scan multiple assets for trading signals. Use to give a market overview or when monitoring a watchlist.",
    input_schema: {
      type: 'object',
      properties: { symbols: { type: 'array', items: { type: 'string' }, description: 'List of Yahoo Finance symbols to scan (max 10)' } },
      required: ['symbols']
    }
  },
  {
    name: 'add_stock',
    description: "Add stock position to portfolio",
    input_schema: { type: 'object', properties: { symbol: { type: 'string' }, name: { type: 'string' }, quantity: { type: 'number' }, buyPrice: { type: 'number' }, buyDate: { type: 'string' } }, required: ['symbol', 'name', 'quantity', 'buyPrice'] }
  },
  {
    name: 'remove_stock',
    description: "Remove stock from portfolio by symbol",
    input_schema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] }
  },
  {
    name: 'add_crypto',
    description: "Add crypto position to portfolio",
    input_schema: { type: 'object', properties: { coinId: { type: 'string' }, coinName: { type: 'string' }, symbol: { type: 'string' }, quantity: { type: 'number' }, buyPrice: { type: 'number' } }, required: ['coinId', 'coinName', 'symbol', 'quantity', 'buyPrice'] }
  },
  {
    name: 'remove_crypto',
    description: "Remove crypto from portfolio",
    input_schema: { type: 'object', properties: { coinId: { type: 'string' } }, required: ['coinId'] }
  },
  {
    name: 'create_alert',
    description: "Create a price alert",
    input_schema: { type: 'object', properties: { symbol: { type: 'string' }, name: { type: 'string' }, targetPrice: { type: 'number' }, direction: { type: 'string', enum: ['above', 'below'] } }, required: ['symbol', 'targetPrice', 'direction'] }
  },
  {
    name: 'delete_alert',
    description: "Delete a price alert",
    input_schema: { type: 'object', properties: { symbol: { type: 'string' }, targetPrice: { type: 'number' }, direction: { type: 'string', enum: ['above', 'below'] } }, required: ['symbol', 'targetPrice', 'direction'] }
  },
  {
    name: 'add_to_watchlist',
    description: "Add stock to watchlist",
    input_schema: { type: 'object', properties: { symbol: { type: 'string' }, name: { type: 'string' } }, required: ['symbol', 'name'] }
  },
  {
    name: 'remove_from_watchlist',
    description: "Remove from watchlist",
    input_schema: { type: 'object', properties: { symbol: { type: 'string' } }, required: ['symbol'] }
  },
  {
    name: 'add_sneaker',
    description: "Add sneaker to collection",
    input_schema: { type: 'object', properties: { brand: { type: 'string' }, model: { type: 'string' }, size: { type: 'string' }, buyPrice: { type: 'number' } }, required: ['brand', 'model', 'size', 'buyPrice'] }
  },
  {
    name: 'trigger_agent',
    description: "Dispatch a task to one of the 45 specialized agents. Use when the user asks to run an agent, get a code review, scan the market, audit the UI, generate a report, or assign any task to a specific agent. The agent will execute and post results to Discord.",
    input_schema: {
      type: 'object',
      properties: {
        agent: { type: 'string', description: "Agent name: 'MarketScanner', 'CryptoTracker', 'CodeReviewer', 'BugHunter', 'PerfOptimizer', 'SecurityAudit', 'UIInspector', 'UXAnalyst', 'ResponsiveBot', 'TechAnalyst', 'PortfolioGuard', 'Oracle', 'RiskMetrics', 'AlertBot', 'ReportGenerator', 'NewsAnalyst', 'WhaleAlert', 'DeFiScanner', 'MLPredictor', etc." },
        task: { type: 'string', description: "The specific task or instruction to give the agent. Be precise." },
        channelHint: { type: 'string', description: "Optional Discord channel: 'market-scanner', 'crypto', 'code-review', 'ui-review', 'reports', 'portfolio-watch', 'price-alerts', 'app-pulse'" }
      },
      required: ['agent', 'task']
    }
  },
]

const SERVER_TOOLS = new Set(['fetch_price', 'fetch_crypto_price', 'technical_analysis', 'scan_market', 'trigger_agent'])

// ─── System prompt ────────────────────────────────────────────────────────────
const BASE_SYSTEM = `Tu es AnDy, l'administrateur central de l'application Trackr et coordinateur de 45 agents IA spécialisés.
Tu es également un expert en analyse technique, analyse fondamentale, et gestion de portefeuille.

## Ton rôle d'administrateur

Tu coordonnes 45 agents qui travaillent en arrière-plan 24/7. Quand l'utilisateur te pose une question, tu identifies mentalement quel(s) agent(s) sont les mieux placés et tu réponds depuis leur perspective combinée. Mentionne l'agent concerné naturellement dans ta réponse quand c'est pertinent.

**Agents actifs en permanence :**
- 🔭 MarketScanner — scan 50+ tickers toutes les 15 min
- ₿ CryptoTracker — BTC/ETH/SOL en continu
- 💓 Pulse — surveillance santé de l'app
- 🔔 AlertBot — alertes prix automatiques

**Agents de développement (4× par jour : 8h, 12h, 16h, 20h UTC) :**
- 👁️ CodeReviewer · 🐛 BugHunter · ⚡ PerfOptimizer · 🔐 SecurityAudit

**Agents design (9h et 18h UTC) :**
- 🎨 UIInspector · 👤 UXAnalyst · 📱 ResponsiveBot

**Agents à la demande :**
- 📈 TechAnalyst · 🛡️ PortfolioGuard · 🔮 Oracle · ⚖️ RiskMetrics · et 30 autres

**Page Mission Control :** /agents (dans l'app) — montre l'activité live de tous les agents.

Quand l'utilisateur demande quelque chose de large ("améliore l'app", "que font les agents", "récap"), donne une synthèse administrative claire : état actuel, ce qui a été fait, ce qui est en cours, ce qui arrive.

## Tes outils — utilise-les activement et sans hésitation

### Données de marché
- **fetch_price(symbol)** — Prix live depuis Yahoo Finance. TOUJOURS utiliser avant de citer un prix.
- **fetch_crypto_price(coinId)** — Prix live depuis CoinGecko.
- **technical_analysis(symbol, interval)** — Analyse complète : RSI, EMA, MACD, Bollinger, supports/résistances, setup de trade. Retourne aussi un chartTag que tu dois inclure dans ta réponse pour afficher le graphique.
- **scan_market(symbols)** — Scanner plusieurs actifs simultanément pour trouver des opportunités.

### Actions dans l'app
- **navigate(path)** — Naviguer vers une page
- **add_stock / remove_stock** — Gérer le portfolio actions
- **add_crypto / remove_crypto** — Gérer le portfolio crypto
- **create_alert / delete_alert** — Créer/supprimer des alertes prix
- **add_to_watchlist / remove_from_watchlist** — Gérer la watchlist
- **add_sneaker** — Ajouter une sneaker

## Méthode d'analyse

Quand tu analyses un actif :
1. **Appelle technical_analysis** avec l'interval approprié
2. **Inclus le chartTag** dans ta réponse (ex: [CHART:AAPL:1d]) pour afficher le graphique
3. **Multi-timeframe** : analyse 1d pour la tendance, 1h pour la structure, 15m pour l'entrée
4. **Donne des niveaux précis** :
   - Zone d'achat : "$X - $Y (support clé + RSI survendu)"
   - Stop loss : "$X (sous le support)"
   - Objectif 1 : "$X (résistance)" / Objectif 2 : "$X (extension)"
   - Rapport R/R : "1:X — pour $1 de risque, $X de potentiel"
5. **Propose des alertes** avec create_alert aux niveaux clés

## Stratégie de base
- Acheter près des supports avec confirmation (RSI < 40, volume, momentum)
- Vendre/alléger près des résistances (RSI > 65, divergences)
- Tendance EMA : prix > EMA9 > EMA21 > EMA50 = uptrend confirmé
- MACD croisement = signal de changement de momentum
- Bollinger : près de la bande inférieure + RSI bas = zone d'achat
- Volume élevé sur un mouvement confirme la validité du signal

## Style
- Français uniquement
- Direct et actionnable — pas de jargon inutile
- Donne des prix précis (pas "environ $X")
- 🟢 signal positif · 🔴 négatif · 🟡 neutre · ⚡ important
- Propose systématiquement des alertes après une analyse
- Ne garantis jamais des rendements — dis "signal potentiel", "zone intéressante"

## Architecture Trackr
Routes: /, /markets, /sports, /news, /flights, /portfolio, /sneakers, /translator, /settings, /andy, /agents (Mission Control — activité des 45 agents)
APIs: Yahoo Finance (actions), CoinGecko (crypto), OpenSky (avions), ESPN (sports)
localStorage trackr_v3: stocks, cryptoHoldings, sneakers, stockWatchlist, alerts`

function buildSystem(portfolio, crypto, sneakers, alerts, watchlist) {
  let sys = BASE_SYSTEM
  if (portfolio?.length > 0) {
    sys += '\n\n## Portfolio actions de l\'utilisateur\n'
    portfolio.forEach(p => {
      sys += `- ${p.symbol} (${p.name}): ${p.quantity} actions @ $${p.buyPrice}`
      if (p.currentPrice) { const pnl = ((p.currentPrice - p.buyPrice) / p.buyPrice * 100).toFixed(1); sys += ` · Prix actuel: $${p.currentPrice.toFixed(2)} · P&L: ${pnl}%` }
      if (p.buyDate) sys += ` · Acheté: ${p.buyDate}`
      sys += '\n'
    })
  }
  if (crypto?.length > 0) {
    sys += '\n## Portfolio crypto\n'
    crypto.forEach(c => { sys += `- ${c.coinName} (${c.symbol?.toUpperCase()}): ${c.quantity} @ $${c.buyPrice}\n` })
  }
  if (sneakers?.filter(s => !s.salePrice).length > 0) {
    sys += '\n## Collection sneakers\n'
    sneakers.filter(s => !s.salePrice).forEach(s => { sys += `- ${s.brand} ${s.model} T${s.size}: $${s.buyPrice}\n` })
  }
  if (watchlist?.length > 0) {
    sys += '\n## Watchlist\n' + watchlist.map(w => `- ${w.symbol} (${w.name})`).join('\n') + '\n'
  }
  if (alerts?.length > 0) {
    sys += '\n## Alertes actives\n'
    alerts.forEach(a => { sys += `- ${a.symbol}: ${a.direction === 'above' ? '>' : '<'} $${a.targetPrice}\n` })
  }
  return sys
}

// ─── Tool labels for status display ──────────────────────────────────────────
const TOOL_LABELS = {
  fetch_price:        '📊 Récupération prix…',
  fetch_crypto_price: '₿ Prix crypto…',
  technical_analysis: '📈 Analyse technique…',
  scan_market:        '🔭 Scan marché…',
  navigate:           '🧭 Navigation…',
  add_stock:          '📁 Ajout portfolio…',
  add_crypto:         '📁 Ajout crypto…',
  create_alert:       '🔔 Création alerte…',
  add_to_watchlist:   '👁️ Watchlist…',
  trigger_agent:      '🤖 Dispatch agent…',
}

// ─── Handler — Server-Sent Events streaming ───────────────────────────────────
import { securityCheck } from './_security.js'

export default async function handler(req, res) {
  const blocked = securityCheck(req, res, {
    route: '/api/andy',
    rateMax: 40,          // 40 req/min per IP — generous for real users
    rateWindowMs: 60_000,
    maxBodyKB: 100,
    checkInjection: true,
  })
  if (blocked) return

  if (req.method !== 'POST') { res.status(405).end(); return }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) { res.status(503).json({ error: 'API key not configured' }); return }

  const { messages, portfolio, crypto, sneakers, alerts, watchlist } = req.body
  if (!messages || !Array.isArray(messages)) { res.status(400).json({ error: 'messages required' }); return }

  // ── SSE setup ───────────────────────────────────────────────────────────────
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache, no-transform')
  res.setHeader('Connection', 'keep-alive')
  res.setHeader('X-Accel-Buffering', 'no')

  const emit = (data) => res.write(`data: ${JSON.stringify(data)}\n\n`)

  const system = buildSystem(portfolio, crypto, sneakers, alerts, watchlist)
  let currentMessages = messages.slice(-12).map(m => ({ role: m.role, content: m.content }))
  const executedServerTools = []
  const clientActions = []

  try {
    for (let iter = 0; iter < MAX_LOOP; iter++) {
      // ── Stream from Anthropic API ────────────────────────────────────────────
      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: MODEL, max_tokens: MAX_TOKENS, system, tools: TOOLS, messages: currentMessages, stream: true }),
      })

      if (!anthropicRes.ok) {
        const err = await anthropicRes.json().catch(() => ({}))
        emit({ type: 'error', message: err.error?.message || `API error ${anthropicRes.status}` })
        res.end(); return
      }

      // ── Parse Anthropic SSE stream ───────────────────────────────────────────
      const reader = anthropicRes.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      const contentBlocks = []
      let stopReason = 'end_turn'

      outer: while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (raw === '[DONE]') break outer
          let ev
          try { ev = JSON.parse(raw) } catch { continue }

          if (ev.type === 'content_block_start') {
            const blk = ev.content_block
            if (blk.type === 'text') {
              contentBlocks[ev.index] = { type: 'text', text: '' }
            } else if (blk.type === 'tool_use') {
              contentBlocks[ev.index] = { type: 'tool_use', id: blk.id, name: blk.name, input_str: '' }
              emit({ type: 'tool_start', name: blk.name, label: TOOL_LABELS[blk.name] || blk.name })
            }

          } else if (ev.type === 'content_block_delta') {
            const blk = contentBlocks[ev.index]
            if (!blk) continue
            if (ev.delta.type === 'text_delta' && blk.type === 'text') {
              blk.text += ev.delta.text
              // Stream each text chunk immediately to the client
              emit({ type: 'token', text: ev.delta.text })
            } else if (ev.delta.type === 'input_json_delta' && blk.type === 'tool_use') {
              blk.input_str += ev.delta.partial_json
            }

          } else if (ev.type === 'content_block_stop') {
            const blk = contentBlocks[ev.index]
            if (blk?.type === 'tool_use') {
              try { blk.input = JSON.parse(blk.input_str || '{}') } catch { blk.input = {} }
            }

          } else if (ev.type === 'message_delta' && ev.delta?.stop_reason) {
            stopReason = ev.delta.stop_reason
          }
        }
      }

      if (stopReason === 'end_turn') {
        emit({ type: 'done', clientActions, executedServerTools })
        res.end(); return
      }

      if (stopReason === 'tool_use') {
        const toolUses = contentBlocks.filter(b => b?.type === 'tool_use')
        const assistantContent = contentBlocks.filter(Boolean).map(b =>
          b.type === 'text'
            ? { type: 'text', text: b.text }
            : { type: 'tool_use', id: b.id, name: b.name, input: b.input }
        )
        currentMessages.push({ role: 'assistant', content: assistantContent })
        const toolResults = []

        for (const tu of toolUses) {
          if (SERVER_TOOLS.has(tu.name)) {
            const result = await runServerTool(tu.name, tu.input)
            executedServerTools.push({ id: tu.id, name: tu.name, input: tu.input, result })
            toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify(result) })
          } else {
            clientActions.push({ id: tu.id, name: tu.name, input: tu.input })
            toolResults.push({ type: 'tool_result', tool_use_id: tu.id, content: JSON.stringify({ status: 'success' }) })
          }
          emit({ type: 'tool_done', name: tu.name })
        }
        currentMessages.push({ role: 'user', content: toolResults })
        // Loop continues — next iteration streams the final answer
      }
    }

    emit({ type: 'done', clientActions, executedServerTools })
    res.end()
  } catch (e) {
    console.error('Andy handler error:', e)
    emit({ type: 'error', message: e.message || 'Erreur serveur' })
    res.end()
  }
}
