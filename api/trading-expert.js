// ─── TradingExpert — Analyse niveau Goldman Sachs / Citadel ──────────────────
// POST /api/trading-expert { symbol, type: 'crypto'|'stock', timeframe? }
// GET  /api/trading-expert?symbol=BTC&type=crypto
// Analyse technique + fondamentale + sentiment + apprentissage autonome

import { addMemoryEntry, getMemoryEntries } from './memory.js'

const ANTHROPIC_KEY  = process.env.ANTHROPIC_API_KEY
const AV_KEY         = process.env.ALPHA_VANTAGE_KEY
const DISCORD_API    = 'https://discord.com/api/v10'
const BOT_TOKEN      = process.env.DISCORD_BOT_TOKEN
const TRADING_CH     = process.env.DISCORD_CH_TRADING_DESK
const ANNONCES_CH    = process.env.DISCORD_CH_ANNONCES

// ─── Fetch helpers ────────────────────────────────────────────────────────────
async function fetchCryptoData(symbol) {
  const id = symbol.toLowerCase()
    .replace('btc', 'bitcoin').replace('eth', 'ethereum')
    .replace('sol', 'solana').replace('bnb', 'binancecoin')
    .replace('xrp', 'ripple').replace('ada', 'cardano')
    .replace('doge', 'dogecoin').replace('avax', 'avalanche-2')
    .replace('dot', 'polkadot').replace('matic', 'matic-network')
    .replace('link', 'chainlink').replace('uni', 'uniswap')
    .replace('ltc', 'litecoin').replace('atom', 'cosmos')

  const [price, ohlc] = await Promise.allSettled([
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`, { signal: AbortSignal.timeout(8000) }).then(r => r.json()),
    fetch(`https://api.coingecko.com/api/v3/coins/${id}/ohlc?vs_currency=usd&days=30`, { signal: AbortSignal.timeout(8000) }).then(r => r.json()),
  ])

  const priceData  = price.status === 'fulfilled' ? price.value?.[id] : null
  const ohlcData   = ohlc.status === 'fulfilled' && Array.isArray(ohlc.value) ? ohlc.value : []

  return { symbol: symbol.toUpperCase(), type: 'crypto', priceData, ohlcData, id }
}

async function fetchStockData(symbol) {
  const results = await Promise.allSettled([
    AV_KEY
      ? fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY_ADJUSTED&symbol=${symbol}&outputsize=compact&apikey=${AV_KEY}`, { signal: AbortSignal.timeout(10000) }).then(async r => {
          const ct = r.headers.get('content-type') || ''
          if (!r.ok) { console.warn(`Alpha Vantage ${symbol}: HTTP ${r.status}`); return null }
          if (!ct.includes('application/json') && !ct.includes('text/json') && !ct.includes('text/plain')) {
            console.warn(`Alpha Vantage ${symbol}: unexpected content-type "${ct}", skipping .json()`)
            return null
          }
          return r.json().catch(e => { console.warn(`Alpha Vantage ${symbol}: JSON parse error:`, e.message); return null })
        })
      : fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=60d`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }).then(async r => {
          const ct = r.headers.get('content-type') || ''
          if (!r.ok) { console.warn(`Yahoo Finance ${symbol} (60d): HTTP ${r.status}`); return null }
          if (!ct.includes('application/json') && !ct.includes('text/json') && !ct.includes('text/plain')) {
            console.warn(`Yahoo Finance ${symbol} (60d): unexpected content-type "${ct}", skipping .json()`)
            return null
          }
          return r.json().catch(e => { console.warn(`Yahoo Finance ${symbol} (60d): JSON parse error:`, e.message); return null })
        }),
    fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(6000) }).then(async r => {
      const ct = r.headers.get('content-type') || ''
      if (!r.ok) { console.warn(`Yahoo Finance ${symbol} (1d): HTTP ${r.status}`); return null }
      if (!ct.includes('application/json') && !ct.includes('text/json') && !ct.includes('text/plain')) {
        console.warn(`Yahoo Finance ${symbol} (1d): unexpected content-type "${ct}", skipping .json()`)
        return null
      }
      return r.json().catch(e => { console.warn(`Yahoo Finance ${symbol} (1d): JSON parse error:`, e.message); return null })
    }),
  ])

  const historicalRaw = results[0].status === 'fulfilled' ? results[0].value : null
  const quoteRaw      = results[1].status === 'fulfilled' ? results[1].value : null

  // Parse historical — supporte Alpha Vantage et Yahoo
  let closes = [], volumes = [], highs = [], lows = []
  if (historicalRaw?.['Time Series (Daily)']) {
    const ts = historicalRaw['Time Series (Daily)']
    const keys = Object.keys(ts).sort().slice(-60)
    closes  = keys.map(k => parseFloat(ts[k]['4. close'] || ts[k]['5. adjusted close']))
    volumes = keys.map(k => parseFloat(ts[k]['6. volume'] || ts[k]['5. volume'] || 0))
    highs   = keys.map(k => parseFloat(ts[k]['2. high']))
    lows    = keys.map(k => parseFloat(ts[k]['3. low']))
  } else if (historicalRaw?.chart?.result?.[0]) {
    const r = historicalRaw.chart.result[0]
    closes  = (r.indicators?.quote?.[0]?.close || []).filter(Boolean)
    volumes = (r.indicators?.quote?.[0]?.volume || []).filter(Boolean)
    highs   = (r.indicators?.quote?.[0]?.high || []).filter(Boolean)
    lows    = (r.indicators?.quote?.[0]?.low || []).filter(Boolean)
  }

  const meta = quoteRaw?.chart?.result?.[0]?.meta
  return { symbol: symbol.toUpperCase(), type: 'stock', closes, volumes, highs, lows, meta }
}

// ─── Indicateurs techniques ────────────────────────────────────────────────────
function computeRSI(closes, period = 14) {
  if (closes.length < period + 1) return null
  let gains = 0, losses = 0
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1]
    if (diff > 0) gains += diff; else losses -= diff
  }
  const avgGain = gains / period
  const avgLoss = losses / period
  if (avgLoss === 0) return 100
  const rs = avgGain / avgLoss
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2))
}

function computeEMA(closes, period) {
  if (closes.length < period) return null
  const k = 2 / (period + 1)
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period
  for (let i = period; i < closes.length; i++) ema = closes[i] * k + ema * (1 - k)
  return parseFloat(ema.toFixed(4))
}

function computeSMA(closes, period) {
  if (closes.length < period) return null
  const slice = closes.slice(-period)
  return parseFloat((slice.reduce((a, b) => a + b, 0) / period).toFixed(4))
}

function computeMACD(closes) {
  if (closes.length < 27) return null
  const ema12 = computeEMA(closes, 12)
  const ema26 = computeEMA(closes, 26)
  if (!ema12 || !ema26) return null
  const line = ema12 - ema26
  const prevSlice = closes.slice(0, -1)
  const prevEma12 = computeEMA(prevSlice, 12)
  const prevEma26 = computeEMA(prevSlice, 26)
  const prevLine = (prevEma12 !== null && prevEma26 !== null) ? prevEma12 - prevEma26 : null
  return {
    line: parseFloat(line.toFixed(4)),
    ema12: parseFloat(ema12.toFixed(2)),
    ema26: parseFloat(ema26.toFixed(2)),
    bullish: line > 0,
    crossingUp:   prevLine !== null && line > 0 && prevLine < 0,
    crossingDown: prevLine !== null && line < 0 && prevLine > 0,
  }
}

function computeBollinger(closes, period = 20, mult = 2) {
  if (closes.length < period) return null
  const slice = closes.slice(-period)
  const sma = slice.reduce((a, b) => a + b, 0) / period
  const std = Math.sqrt(slice.reduce((a, b) => a + (b - sma) ** 2, 0) / period)
  const price = closes[closes.length - 1]
  return {
    upper: parseFloat((sma + mult * std).toFixed(2)),
    mid:   parseFloat(sma.toFixed(2)),
    lower: parseFloat((sma - mult * std).toFixed(2)),
    bandwidth: parseFloat((mult * 2 * std / sma * 100).toFixed(2)),
    position: parseFloat(((price - (sma - mult * std)) / (mult * 2 * std) * 100).toFixed(1)),
  }
}

function computeFibonacci(closes, highs, lows) {
  const high = Math.max(...(highs?.length ? highs.slice(-20) : closes.slice(-20)))
  const low  = Math.min(...(lows?.length ? lows.slice(-20) : closes.slice(-20)))
  const diff = high - low
  return {
    r236: parseFloat((high - 0.236 * diff).toFixed(2)),
    r382: parseFloat((high - 0.382 * diff).toFixed(2)),
    r500: parseFloat((high - 0.500 * diff).toFixed(2)),
    r618: parseFloat((high - 0.618 * diff).toFixed(2)),
    r786: parseFloat((high - 0.786 * diff).toFixed(2)),
    high: parseFloat(high.toFixed(2)),
    low:  parseFloat(low.toFixed(2)),
  }
}

function computeVolumeAnalysis(volumes) {
  if (!volumes?.length) return null
  const recent = volumes.slice(-5)
  const avg20  = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20
  const avgRecent = recent.reduce((a, b) => a + b, 0) / recent.length
  return {
    ratio: parseFloat((avgRecent / avg20).toFixed(2)),
    trend: avgRecent > avg20 * 1.2 ? 'élevé' : avgRecent < avg20 * 0.8 ? 'faible' : 'normal',
    last: volumes[volumes.length - 1],
  }
}

function computeATR(highs, lows, closes, period = 14) {
  if (!highs?.length || highs.length < period + 1) return null
  const trs = []
  for (let i = 1; i < highs.length; i++) {
    trs.push(Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    ))
  }
  const atr = trs.slice(-period).reduce((a, b) => a + b, 0) / period
  return parseFloat(atr.toFixed(4))
}

function buildIndicators(closes, highs, lows, volumes) {
  const ind = {
    rsi14:   computeRSI(closes, 14),
    rsi7:    computeRSI(closes, 7),
    ema9:    computeEMA(closes, 9),
    ema21:   computeEMA(closes, 21),
    ema50:   computeEMA(closes, 50),
    sma200:  computeSMA(closes, Math.min(200, closes.length)),
    macd:    computeMACD(closes),
    bollinger: computeBollinger(closes),
    fibonacci: computeFibonacci(closes, highs, lows),
    volume:  computeVolumeAnalysis(volumes),
    atr:     computeATR(highs, lows, closes),
    roc10:   computeROC(closes, 10),
    stoch:   computeStochastic(closes, highs, lows, 14),
    williamsR: computeWilliamsR(closes, highs, lows, 14),
    price:   closes[closes.length - 1],
    change1d: closes.length > 1 ? parseFloat(((closes.at(-1) - closes.at(-2)) / closes.at(-2) * 100).toFixed(2)) : null,
    change7d: closes.length > 7 ? parseFloat(((closes.at(-1) - closes.at(-8)) / closes.at(-8) * 100).toFixed(2)) : null,
    change30d: closes.length > 30 ? parseFloat(((closes.at(-1) - closes.at(-31)) / closes.at(-31) * 100).toFixed(2)) : null,
  }
  ind.patterns = detectPatterns(closes, highs, lows, ind)
  return ind
}

// ─── Indicateurs supplémentaires (quantitatif) ───────────────────────────────
function computeROC(closes, period = 10) {
  if (closes.length < period + 1) return null
  const prev = closes[closes.length - 1 - period]
  const curr = closes[closes.length - 1]
  return parseFloat(((curr - prev) / prev * 100).toFixed(2))
}

function computeStochastic(closes, highs, lows, period = 14) {
  if (!highs?.length || highs.length < period) return null
  const recentHighs = highs.slice(-period)
  const recentLows  = lows.slice(-period)
  const highestHigh = Math.max(...recentHighs)
  const lowestLow   = Math.min(...recentLows)
  const current     = closes[closes.length - 1]
  if (highestHigh === lowestLow) return null
  return parseFloat(((current - lowestLow) / (highestHigh - lowestLow) * 100).toFixed(1))
}

function computeWilliamsR(closes, highs, lows, period = 14) {
  const stoch = computeStochastic(closes, highs, lows, period)
  return stoch != null ? parseFloat((stoch - 100).toFixed(1)) : null
}

function detectPatterns(closes, highs, lows, indicators) {
  const patterns = []
  const price = closes[closes.length - 1]

  // Doji / hammer candlestick patterns (approximation sur données OHLC)
  if (highs?.length && lows?.length) {
    const lastH = highs[highs.length - 1]
    const lastL = lows[lows.length - 1]
    const body = Math.abs(closes[closes.length - 1] - closes[closes.length - 2] || 0)
    const range = lastH - lastL
    if (range > 0 && body / range < 0.2) patterns.push('Doji (indécision)')
    const lowerShadow = (Math.min(closes.at(-1), closes.at(-2) || closes.at(-1)) - lastL)
    if (lowerShadow / range > 0.6 && body / range < 0.3) patterns.push('Hammer (reversal potentiel)')
  }

  // Bollinger squeeze (compression → explosion imminente)
  if (indicators.bollinger?.bandwidth < 5) patterns.push('Bollinger Squeeze (breakout imminent)')

  // MACD divergence bullish
  if (indicators.macd?.crossingUp) patterns.push('MACD Crossover Haussier ⚡')
  if (indicators.macd?.crossingDown) patterns.push('MACD Crossover Baissier ⚠️')

  // RSI divergence setup
  if (indicators.rsi14 < 35 && indicators.macd?.bullish) patterns.push('Setup: RSI survendu + MACD haussier 🎯')
  if (indicators.rsi14 > 68 && !indicators.macd?.bullish) patterns.push('Setup: RSI suracheté + MACD baissier ⚠️')

  // Prix au-dessus/en-dessous EMA50
  if (price && indicators.ema50) {
    const dist = ((price - indicators.ema50) / indicators.ema50 * 100).toFixed(1)
    patterns.push(`EMA50 ${price > indicators.ema50 ? `+${dist}%` : `${dist}%`} (${price > indicators.ema50 ? 'tendance haussière' : 'tendance baissière'})`)
  }

  // Volume confirmation
  if (indicators.volume?.ratio > 1.5 && indicators.macd?.bullish) patterns.push('Volume fort + momentum haussier 💪')
  if (indicators.volume?.ratio > 1.5 && !indicators.macd?.bullish) patterns.push('Volume fort + distribution baissière 📉')

  return patterns
}

// ─── Vérifier les prédictions passées (apprentissage auto) ───────────────────
async function verifyPastPredictions() {
  try {
    const entries = await getMemoryEntries(100)
    const pending = entries.filter(e =>
      e.type === 'trading_prediction' &&
      !e.verified &&
      e.targetDate &&
      new Date(e.targetDate) <= new Date()
    )

    for (const pred of pending.slice(0, 3)) {  // max 3 vérifications par run
      try {
        const isCrypto = ['BTC','ETH','SOL','BNB','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','UNI','LTC','ATOM'].includes(pred.symbol)
        let currentPrice = null

        if (isCrypto) {
          const id = pred.symbol.toLowerCase().replace('btc','bitcoin').replace('eth','ethereum').replace('sol','solana')
          const r = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${id}&vs_currencies=usd`).then(r => r.json())
          currentPrice = r[id]?.usd
        } else {
          const r = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${pred.symbol}?interval=1d&range=1d`, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json())
          currentPrice = r?.chart?.result?.[0]?.meta?.regularMarketPrice
        }

        if (!currentPrice || !pred.entryPrice) continue

        const actualReturn = ((currentPrice - pred.entryPrice) / pred.entryPrice * 100).toFixed(2)
        const verdictCorrect = (
          (pred.verdict?.includes('ACHAT') && currentPrice > pred.entryPrice) ||
          (pred.verdict?.includes('VENTE') && currentPrice < pred.entryPrice) ||
          (pred.verdict === 'NEUTRE' && Math.abs(currentPrice - pred.entryPrice) / pred.entryPrice < 0.02)
        )

        await addMemoryEntry({
          type: 'trading_result',
          symbol: pred.symbol,
          technique: pred.technique,
          verdict: pred.verdict,
          entryPrice: pred.entryPrice,
          currentPrice,
          actualReturn: parseFloat(actualReturn),
          verdictCorrect,
          conviction: pred.conviction,
          result: `Prédit ${pred.verdict} à $${pred.entryPrice}, prix actuel $${currentPrice} (${actualReturn >= 0 ? '+' : ''}${actualReturn}%) — ${verdictCorrect ? '✅ CORRECT' : '❌ INCORRECT'}`,
        }).catch(() => {})
      } catch {}
    }
  } catch {}
}

// ─── Charger les techniques apprises + performance ───────────────────────────
async function loadTradingLearnings() {
  try {
    const entries = await getMemoryEntries(100)
    const results = entries.filter(e => e.type === 'trading_result' && e.verdictCorrect !== undefined)
    const learnings = entries.filter(e => e.type === 'trading_learning')

    let perfText = ''
    if (results.length > 0) {
      const correct = results.filter(e => e.verdictCorrect).length
      const winRate = (correct / results.length * 100).toFixed(0)
      const avgReturn = (results.reduce((s, e) => s + (e.actualReturn || 0), 0) / results.length).toFixed(2)
      perfText = `\n**Performance historique :** ${winRate}% win rate sur ${results.length} prédictions vérifiées | Rendement moyen: ${avgReturn}%`

      // Top techniques par winrate
      const byTech = {}
      results.forEach(e => {
        if (!e.technique) return
        if (!byTech[e.technique]) byTech[e.technique] = { correct: 0, total: 0 }
        byTech[e.technique].total++
        if (e.verdictCorrect) byTech[e.technique].correct++
      })
      const topTechs = Object.entries(byTech)
        .map(([t, s]) => ({ t, wr: s.correct / s.total * 100 }))
        .sort((a, b) => b.wr - a.wr)
        .slice(0, 3)
      if (topTechs.length > 0) {
        perfText += `\n**Meilleures techniques :** ${topTechs.map(t => `${t.t} (${t.wr.toFixed(0)}%)`).join(', ')}`
      }
    }

    const learnText = learnings.length > 0
      ? `\n**Apprentissages récents :**\n${learnings.slice(-8).map(l => `- ${l.technique}: ${l.result}`).join('\n')}`
      : ''

    return perfText + learnText
  } catch { return '' }
}

// ─── Analyse Claude — niveau expert ──────────────────────────────────────────
async function analyzeWithClaude(symbol, type, indicators, marketData, learnings) {
  const price = indicators.price
  const fmtPct = v => v != null ? `${v > 0 ? '+' : ''}${v}%` : 'N/A'

  const prompt = `Tu es le Chief Investment Officer de Trackr, formé par Goldman Sachs, Citadel, Two Sigma et Renaissance Technologies. Tu analyses ${symbol} (${type === 'crypto' ? 'cryptomonnaie' : 'action'}) avec la précision d'un quant fund de premier rang. Ton objectif: identifier des setups à FORT RENDEMENT avec une gestion de risque rigoureuse.

**DONNÉES MARCHÉ :**
- Prix actuel : ${price ? `$${price.toLocaleString('en-US', { maximumFractionDigits: 4 })}` : 'N/A'}
- Variation 24h : ${fmtPct(indicators.change1d)} | 7j : ${fmtPct(indicators.change7d)} | 30j : ${fmtPct(indicators.change30d)}
${marketData ? `- Volume 24h : $${(marketData.volume24h / 1e6)?.toFixed(0) ?? 'N/A'}M\n- Market Cap : $${(marketData.marketCap / 1e9)?.toFixed(1) ?? 'N/A'}B` : ''}

**INDICATEURS TECHNIQUES COMPLETS :**
- RSI(14) : ${indicators.rsi14 ?? 'N/A'} ${indicators.rsi14 > 70 ? '⚠️ Suracheté' : indicators.rsi14 < 30 ? '🟢 Survendu' : '—'} | RSI(7) : ${indicators.rsi7 ?? 'N/A'}
- EMA 9 / 21 / 50 : ${indicators.ema9?.toFixed(2) ?? 'N/A'} / ${indicators.ema21?.toFixed(2) ?? 'N/A'} / ${indicators.ema50?.toFixed(2) ?? 'N/A'}
- SMA 200 : ${indicators.sma200?.toFixed(2) ?? 'N/A'} ${price && indicators.sma200 ? (price > indicators.sma200 ? '(au-dessus — tendance long terme haussière)' : '(en-dessous — tendance long terme baissière)') : ''}
- MACD : ligne ${indicators.macd?.line ?? 'N/A'} | EMA12=${indicators.macd?.ema12 ?? 'N/A'} EMA26=${indicators.macd?.ema26 ?? 'N/A'} ${indicators.macd?.crossingUp ? '🟢 CROISEMENT HAUSSIER' : indicators.macd?.crossingDown ? '🔴 CROISEMENT BAISSIER' : ''}
- Bollinger : position ${indicators.bollinger?.position ?? 'N/A'}% | bandwidth ${indicators.bollinger?.bandwidth ?? 'N/A'}% | upper=${indicators.bollinger?.upper ?? 'N/A'} lower=${indicators.bollinger?.lower ?? 'N/A'}
- Stochastique(14) : ${indicators.stoch ?? 'N/A'} ${indicators.stoch > 80 ? '⚠️ suracheté' : indicators.stoch < 20 ? '🟢 survendu' : ''} | Williams %R : ${indicators.williamsR ?? 'N/A'}
- ROC(10) : ${indicators.roc10 ?? 'N/A'}% (momentum 10j)
- Fibonacci (20j) : 23.6%=$${indicators.fibonacci?.r236 ?? 'N/A'} | 38.2%=$${indicators.fibonacci?.r382 ?? 'N/A'} | 61.8%=$${indicators.fibonacci?.r618 ?? 'N/A'}
- Volume : ${indicators.volume?.trend ?? 'N/A'} (ratio vs moy.20j : ${indicators.volume?.ratio ?? 'N/A'}x) | ATR(14) : ${indicators.atr ?? 'N/A'}

**PATTERNS DÉTECTÉS :**
${indicators.patterns?.length ? indicators.patterns.map(p => `- ${p}`).join('\n') : '- Aucun pattern fort détecté'}

${learnings}

**INSTRUCTIONS :**
Identifie le setup le plus performant possible. Produis une analyse JSON ultra-précise :
{
  "verdict": "ACHAT_FORT|ACHAT|NEUTRE|VENTE|VENTE_FORTE",
  "conviction": 1-100,
  "resume_executif": "2-3 phrases percutantes pour un CIO — va à l'essentiel",
  "thesis_haussiere": "Arguments techniques et fondamentaux pour la hausse avec niveaux précis",
  "thesis_baissiere": "Risques et arguments pour la baisse avec niveaux précis",
  "zones_entree": ["$X.XX — raison précise (support Fibonacci / rebond EMA)", "..."],
  "targets": [{"prix": X, "horizon": "X jours", "probabilite": "X%", "ratio_risque_rendement": "1:X"}, ...],
  "stop_loss": {"prix": X, "raison": "support/niveau clé", "risque_pct": X},
  "setup_haute_conviction": "Description du setup idéal si conviction >= 70 (ex: RSI survendu + MACD crossover + support EMA50 = triple confluence)",
  "signaux_cles": ["Signal 1", "Signal 2", "Signal 3"],
  "risques_majeurs": ["Risque 1", "Risque 2"],
  "catalyseurs": ["Événement ou niveau qui pourrait accélérer le mouvement"],
  "technique_validee": "Technique principale (ex: RSI_divergence, MACD_crossover, Bollinger_squeeze, EMA_crossover, Fibonacci_retracement)",
  "score_technique": 1-100,
  "horizon_optimal": "scalp|swing|position",
  "rendement_potentiel_pct": X,
  "note_apprise": "Pattern ou observation unique sur ce ticker pour améliorer les futures analyses"
}`

  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    }),
    signal: AbortSignal.timeout(45000),
  })

  if (!r.ok) throw new Error(`Claude API ${r.status}`)
  const data = await r.json()
  const text = data.content?.[0]?.text || ''
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) throw new Error('Pas de JSON dans la réponse Claude')
  return JSON.parse(match[0])
}

// ─── Post Discord — rapport complet ──────────────────────────────────────────
async function postAnalysis(channelId, symbol, type, indicators, analysis) {
  if (!channelId || !BOT_TOKEN) return
  const price = indicators.price

  const verdictColor = {
    ACHAT_FORT: 0x00c853, ACHAT: 0x69f0ae, NEUTRE: 0xffd740,
    VENTE: 0xff6e40, VENTE_FORTE: 0xff1744,
  }
  const verdictEmoji = {
    ACHAT_FORT: '🟢🟢', ACHAT: '🟢', NEUTRE: '🟡', VENTE: '🔴', VENTE_FORTE: '🔴🔴',
  }

  const color  = verdictColor[analysis.verdict] || 0x6600ea
  const emoji  = verdictEmoji[analysis.verdict] || '⬜'
  const conv   = analysis.conviction || 0
  const convBar = '█'.repeat(Math.round(conv / 10)) + '░'.repeat(10 - Math.round(conv / 10))

  const embeds = [
    // ── Embed 1 : Verdict & Résumé
    {
      color,
      author: { name: `📊 TradingExpert — Analyse ${type === 'crypto' ? '₿' : '📈'} ${symbol}` },
      title: `${emoji} ${analysis.verdict?.replace('_', ' ')} — Conviction ${conv}/100`,
      description: analysis.resume_executif,
      fields: [
        { name: '📊 Conviction', value: `\`${convBar}\` ${conv}%`, inline: true },
        { name: '⏱ Horizon optimal', value: analysis.horizon_optimal || '—', inline: true },
        { name: '💰 Prix actuel', value: `$${price?.toLocaleString('en-US', { maximumFractionDigits: 4 }) || '—'}`, inline: true },
        ...(analysis.rendement_potentiel_pct ? [{ name: '📈 Rendement potentiel', value: `+${analysis.rendement_potentiel_pct}%`, inline: true }] : []),
        ...(analysis.setup_haute_conviction && conv >= 70 ? [{ name: '🎯 Setup haute conviction', value: analysis.setup_haute_conviction.slice(0, 300), inline: false }] : []),
      ],
      timestamp: new Date().toISOString(),
    },
    // ── Embed 2 : Thesis + Signaux
    {
      color,
      fields: [
        { name: '🐂 Thesis haussière', value: analysis.thesis_haussiere?.slice(0, 400) || '—', inline: false },
        { name: '🐻 Thesis baissière', value: analysis.thesis_baissiere?.slice(0, 400) || '—', inline: false },
        { name: '⚡ Signaux clés', value: (analysis.signaux_cles || []).map(s => `• ${s}`).join('\n').slice(0, 500) || '—', inline: false },
        { name: '⚠️ Risques majeurs', value: (analysis.risques_majeurs || []).map(r => `• ${r}`).join('\n').slice(0, 300) || '—', inline: false },
      ],
    },
    // ── Embed 3 : Zones de trading
    {
      color,
      title: '🎯 Plan de trading',
      fields: [
        {
          name: '🟢 Zones d\'entrée',
          value: (analysis.zones_entree || []).map(z => `• ${z}`).join('\n').slice(0, 400) || '—',
          inline: false,
        },
        {
          name: '🎯 Objectifs de prix',
          value: (analysis.targets || []).map(t => `• **$${t.prix}** — ${t.horizon} (${t.probabilite}${t.ratio_risque_rendement ? ` · R/R ${t.ratio_risque_rendement}` : ''})`).join('\n').slice(0, 400) || '—',
          inline: false,
        },
        {
          name: '🛑 Stop-Loss',
          value: analysis.stop_loss ? `**$${analysis.stop_loss.prix}** — ${analysis.stop_loss.raison}` : '—',
          inline: true,
        },
        {
          name: '📐 Score technique',
          value: `${analysis.score_technique || '—'}/100 — ${analysis.technique_validee || '—'}`,
          inline: true,
        },
      ],
      footer: { text: `TradingExpert · ${symbol} · Apprentissage autonome actif` },
    },
  ]

  await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds }),
  }).catch(() => {})
}

// ─── Main handler ─────────────────────────────────────────────────────────────
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const symbol    = (req.query?.symbol || req.body?.symbol || 'BTC').toUpperCase()
  const type      = req.query?.type || req.body?.type || (
    ['BTC','ETH','SOL','BNB','XRP','ADA','DOGE','AVAX','DOT','MATIC','LINK','UNI','LTC','ATOM'].includes(symbol)
      ? 'crypto' : 'stock'
  )
  const channelId = req.query?.channel || req.body?.channel || TRADING_CH

  try {
    // 0. Vérifier les prédictions passées (apprentissage autonome)
    verifyPastPredictions().catch(() => {})

    // 1. Récupérer les données
    let closes = [], highs = [], lows = [], volumes = [], marketData = null

    if (type === 'crypto') {
      const data = await fetchCryptoData(symbol)
      if (data.ohlcData.length > 0) {
        closes  = data.ohlcData.map(c => c[4])  // close
        highs   = data.ohlcData.map(c => c[2])  // high
        lows    = data.ohlcData.map(c => c[3])  // low
        volumes = []
      }
      if (data.priceData) {
        closes.push(data.priceData.usd)
        marketData = {
          price:     data.priceData.usd,
          change24h: data.priceData.usd_24h_change,
          volume24h: data.priceData.usd_24h_vol,
          marketCap: data.priceData.usd_market_cap,
        }
      }
    } else {
      const data = await fetchStockData(symbol)
      closes  = data.closes
      highs   = data.highs
      lows    = data.lows
      volumes = data.volumes
      if (data.meta) marketData = { price: data.meta.regularMarketPrice }
    }

    if (closes.length < 5) {
      return res.status(400).json({ error: `Données insuffisantes pour ${symbol}. Vérifie le symbole.` })
    }

    // 2. Calculer les indicateurs
    const indicators = buildIndicators(closes, highs, lows, volumes)

    // 3. Charger les apprentissages passés
    const learnings = await loadTradingLearnings()

    // 4. Analyse Claude expert
    const analysis = await analyzeWithClaude(symbol, type, indicators, marketData, learnings)

    // 5. Sauvegarder l'apprentissage + la prédiction (pour vérification auto dans 7j)
    const targetDate = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString()
    await Promise.allSettled([
      analysis.technique_validee && analysis.note_apprise
        ? addMemoryEntry({
            type:       'trading_learning',
            symbol,
            assetType:  type,
            technique:  analysis.technique_validee,
            verdict:    analysis.verdict,
            conviction: analysis.conviction,
            result:     analysis.note_apprise,
            score:      analysis.score_technique,
          })
        : Promise.resolve(),
      // Enregistre la prédiction pour vérification dans 7 jours
      analysis.verdict && indicators.price
        ? addMemoryEntry({
            type:             'trading_prediction',
            symbol,
            assetType:        type,
            verdict:          analysis.verdict,
            conviction:       analysis.conviction,
            technique:        analysis.technique_validee,
            entryPrice:       indicators.price,
            rendementPredit:  analysis.rendement_potentiel_pct,
            targetDate,
            verified:         false,
          })
        : Promise.resolve(),
    ])

    // 6. Post sur Discord trading-desk
    await postAnalysis(channelId, symbol, type, indicators, analysis)

    return res.status(200).json({
      ok: true,
      symbol,
      type,
      verdict:    analysis.verdict,
      conviction: analysis.conviction,
      price:      indicators.price,
      rsi:        indicators.rsi14,
      macd:       indicators.macd,
      analysis,
    })

  } catch (e) {
    console.error('[trading-expert]', e.message)
    return res.status(500).json({ error: e.message, symbol })
  }
}
