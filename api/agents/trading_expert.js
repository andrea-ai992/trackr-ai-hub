// TradingExpert — Analyse crypto/action niveau Goldman Sachs
// Triggered via /analyse <symbol> dans #trading-desk
import fetch from 'node-fetch';

const CHANNEL_ID = '1494157947780071425';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const YAHOO_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart';
const MEMORY_URL = 'https://raw.githubusercontent.com/trackr-app/andy-memory/main/ANDY_MEMORY.json';
const MEMORY_API = 'https://api.github.com/repos/trackr-app/andy-memory/contents/ANDY_MEMORY.json';

// --- Fetch market data ---
async function fetchCryptoData(symbol) {
  const id = symbol.toLowerCase().replace('usdt', '').replace('usd', '');
  const [market, ohlc] = await Promise.all([
    fetch(`${COINGECKO_BASE}/coins/${id}?localization=false&tickers=false&community_data=true&developer_data=false`).then(r => r.json()).catch(() => null),
    fetch(`${COINGECKO_BASE}/coins/${id}/ohlc?vs_currency=usd&days=30`).then(r => r.json()).catch(() => [])
  ]);
  return { market, ohlc };
}

async function fetchStockData(symbol) {
  const url = `${YAHOO_BASE}/${symbol}?interval=1d&range=3mo`;
  const data = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }).then(r => r.json()).catch(() => null);
  return data?.chart?.result?.[0] || null;
}

// --- Indicateurs techniques ---
function computeRSI(closes, period = 14) {
  if (closes.length < period + 1) return null;
  let gains = 0, losses = 0;
  for (let i = closes.length - period; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    diff >= 0 ? (gains += diff) : (losses -= diff);
  }
  const rs = gains / (losses || 1);
  return parseFloat((100 - 100 / (1 + rs)).toFixed(2));
}

function computeEMA(closes, period) {
  const k = 2 / (period + 1);
  let ema = closes.slice(0, period).reduce((a, b) => a + b, 0) / period;
  for (let i = period; i < closes.length; i++) ema = closes[i] * k + ema * (1 - k);
  return parseFloat(ema.toFixed(6));
}

function computeMACD(closes) {
  if (closes.length < 26) return null;
  const ema12 = computeEMA(closes, 12);
  const ema26 = computeEMA(closes, 26);
  return { macd: parseFloat((ema12 - ema26).toFixed(6)), ema12, ema26 };
}

function computeBollinger(closes, period = 20) {
  if (closes.length < period) return null;
  const slice = closes.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  const std = Math.sqrt(slice.reduce((a, b) => a + (b - sma) ** 2, 0) / period);
  return { upper: parseFloat((sma + 2 * std).toFixed(6)), mid: parseFloat(sma.toFixed(6)), lower: parseFloat((sma - 2 * std).toFixed(6)) };
}

function computeFibonacci(highs, lows) {
  const high = Math.max(...highs), low = Math.min(...lows);
  const diff = high - low;
  return {
    '0%': parseFloat(high.toFixed(6)), '23.6%': parseFloat((high - diff * 0.236).toFixed(6)),
    '38.2%': parseFloat((high - diff * 0.382).toFixed(6)), '50%': parseFloat((high - diff * 0.5).toFixed(6)),
    '61.8%': parseFloat((high - diff * 0.618).toFixed(6)), '100%': parseFloat(low.toFixed(6))
  };
}

// --- Mémoire GitHub ---
async function loadMemory(ghToken) {
  try {
    const res = await fetch(MEMORY_URL).then(r => r.json());
    return Array.isArray(res) ? res : [];
  } catch { return []; }
}

async function saveMemory(entries, ghToken) {
  if (!ghToken) return;
  try {
    const current = await fetch(MEMORY_API, { headers: { Authorization: `token ${ghToken}`, Accept: 'application/vnd.github.v3+json' } }).then(r => r.json());
    const existing = JSON.parse(Buffer.from(current.content, 'base64').toString());
    const merged = [...existing.filter(e => e.type !== 'trading_learning' || !entries.find(n => n.symbol === e.symbol && n.strategy === e.strategy)), ...entries];
    await fetch(MEMORY_API, {
      method: 'PUT',
      headers: { Authorization: `token ${ghToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'TradingExpert: update trading_learning', content: Buffer.from(JSON.stringify(merged, null, 2)).toString('base64'), sha: current.sha })
    });
  } catch { /* silently fail */ }
}

// --- Analyse IA via Anthropic ---
async function analyzeWithAI(symbol, indicators, marketInfo, pastLearnings, anthropicKey) {
  const systemPrompt = `Tu es un analyste expert niveau Goldman Sachs / Jane Street / Citadel.
Tu dois produire une analyse structurée en JSON avec les champs suivants:
{
  "resume": "1 phrase synthèse",
  "thesis_haussiere": "...",
  "thesis_baissiere": "...",
  "tendance": "HAUSSIER|BAISSIER|NEUTRE",
  "entree_zone": { "min": number, "max": number },
  "stop_loss": number,
  "targets": [t1, t2, t3],
  "risk_reward": number,
  "conviction_score": number (0-100),
  "strategie": "nom stratégie identifiée",
  "patterns": ["..."],
  "timeframe_recommande": "...",
  "risques_cles": ["..."]
}
Réponds UNIQUEMENT avec le JSON valide, aucun texte autour.`;

  const userPrompt = `Symbole: ${symbol}
Indicateurs techniques: ${JSON.stringify(indicators)}
Données marché: ${JSON.stringify(marketInfo)}
Apprentissages passés pertinents: ${JSON.stringify(pastLearnings.slice(0, 5))}
Effectue une analyse multi-timeframe complète et retourne le JSON demandé.`;

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'x-api-key': anthropicKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
    body: JSON.stringify({ model: 'claude-opus-4-5', max_tokens: 1024, system: systemPrompt, messages: [{ role: 'user', content: userPrompt }] })
  });
  const data = await res.json();
  const text = data.content?.[0]?.text || '{}';
  try { return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}'); } catch { return {}; }
}

// --- Fonction principale ---
export async function run(ctx) {
  const { discord, anthropicKey, symbol: rawSymbol, githubToken } = ctx;
  const symbol = (rawSymbol || ctx.params?.symbol || 'BTC').toUpperCase().replace(/[^A-Z0-9]/g, '');
  const isCrypto = !symbol.match(/^(AAPL|TSLA|NVDA|MSFT|GOOGL|AMZN|META|SPY|QQQ)$/);

  // 1. Fetch données
  let closes = [], highs = [], lows = [], volumes = [], marketInfo = {};
  if (isCrypto) {
    const { market, ohlc } = await fetchCryptoData(symbol);
    if (ohlc?.length) { closes = ohlc.map(c => c[4]); highs = ohlc.map(c => c[2]); lows = ohlc.map(c => c[3]); }
    if (market?.market_data) {
      const md = market.market_data;
      marketInfo = { price: md.current_price?.usd, marketCap: md.market_cap?.usd, volume24h: md.total_volume?.usd, change24h: md.price_change_percentage_24h, change7d: md.price_change_percentage_7d, ath: md.ath?.usd, atl: md.atl?.usd, circulatingSupply: md.circulating_supply, communityScore: market.community_score, liquidityScore: market.liquidity_score };
    }
  } else {
    const stock = await fetchStockData(symbol);
    if (stock) {
      closes = stock.indicators?.quote?.[0]?.close?.filter(Boolean) || [];
      highs = stock.indicators?.quote?.[0]?.high?.filter(Boolean) || [];
      lows = stock.indicators?.quote?.[0]?.low?.filter(Boolean) || [];
      volumes = stock.indicators?.quote?.[0]?.volume?.filter(Boolean) || [];
      const meta = stock.meta;
      marketInfo = { price: meta?.regularMarketPrice, previousClose: meta?.previousClose, fiftyTwoWeekHigh: meta?.fiftyTwoWeekHigh, fiftyTwoWeekLow: meta?.fiftyTwoWeekLow, currency: meta?.currency };
    }
  }

  if (!closes.length) {
    await discord(CHANNEL_ID, { embeds: [{ color: 0xff4444, title: `❌ Symbole introuvable: ${symbol}`, description: 'Vérifiez le symbole et réessayez.' }] });
    return { ok: false, result: 'Symbol not found' };
  }

  // 2. Calcul indicateurs
  const indicators = {
    rsi: computeRSI(closes), macd: computeMACD(closes), bollinger: computeBollinger(closes),
    fibonacci: computeFibonacci(highs, lows), ema20: computeEMA(closes, 20), ema50: computeEMA(closes, 50),
    ema200: closes.length >= 200 ? computeEMA(closes, 200) : null,
    sma20: parseFloat((closes.slice(-20).reduce((a, b) => a + b, 0) / 20).toFixed(6)),
    volumeMoy: volumes.length ? parseFloat((volumes.slice(-20).reduce((a, b) => a + b, 0) / 20).toFixed(0)) : null,
    prixActuel: closes[closes.length - 1], variation30j: parseFloat(((closes[closes.length - 1] / closes[0] - 1) * 100).toFixed(2))
  };

  // 3. Charger mémoire & apprentissages
  const memory = await loadMemory(githubToken);
  const pastLearnings = memory.filter(e => e.type === 'trading_learning');

  // 4. Analyse IA
  const analysis = await analyzeWithAI(symbol, indicators, marketInfo, pastLearnings, anthropicKey);

  // 5. Sauvegarder apprentissage
  const learning = { type: 'trading_learning', symbol, strategy: analysis.strategie || 'unknown', tendance: analysis.tendance, conviction: analysis.conviction_score, indicators: { rsi: indicators.rsi, macd: indicators.macd?.macd }, timestamp: Date.now(), tags: analysis.patterns || [] };
  await saveMemory([...pastLearnings.slice(-49), learning], githubToken);

  // 6. Construction embed Discord
  const convColor = (analysis.conviction_score || 0) >= 70 ? 0x00ff88 : (analysis.conviction_score || 0) >= 45 ? 0xffaa00 : 0xff4444;
  const tendanceEmoji = analysis.tendance === 'HAUSSIER' ? '🟢' : analysis.tendance === 'BAISSIER' ? '🔴' : '🟡';
  const embed = {
    embeds: [{
      color: convColor,
      title: `${tendanceEmoji} Analyse ${symbol} — Conviction ${analysis.conviction_score || '?'}/100`,
      description: `**${analysis.resume || 'Analyse en cours...'}**`,
      fields: [
        { name: '💰 Prix actuel', value: `$${indicators.prixActuel?.toLocaleString() || '—'}`, inline: true },
        { name: '📈 Variation 30j', value: `${indicators.variation30j}%`, inline: true },
        { name: '📊 RSI (14)', value: `${indicators.rsi || '—'}`, inline: true },
        { name: '🟢 Thèse haussière', value: analysis.thesis_haussiere || '—', inline: false },
        { name: '🔴 Thèse baissière', value: analysis.thesis_baissiere || '—', inline: false },
        { name: '🎯 Zone d\'entrée', value: analysis.entree_zone ? `$${analysis.entree_zone.min} — $${analysis.entree_zone.max}` : '—', inline: true },
        { name: '🛑 Stop-Loss', value: analysis.stop_loss ? `$${analysis.stop_loss}` : '—', inline: true },
        { name: '⚖️ Risk/Reward', value: analysis.risk_reward ? `${analysis.risk_reward}x` : '—', inline: true },
        { name: '🏆 Targets', value: analysis.targets?.map((t, i) => `T${i + 1}: $${t}`).join(' | ') || '—', inline: false },
        { name: '🕯️ Patterns', value: analysis.patterns?.join(', ') || '—', inline: true },
        { name: '⏱️ Timeframe', value: analysis.timeframe_recommande || '—', inline: true },
        { name: '⚠️ Risques clés', value: analysis.risques_cles?.map(r => `• ${r}`).join('\n') || '—', inline: false },
        { name: '📉 Bollinger', value: indicators.bollinger ? `↑${indicators.bollinger.upper?.toFixed(2)} | ≈${indicators.bollinger.mid?.toFixed(2)} | ↓${indicators.bollinger.lower?.toFixed(2)}` : '—', inline: false },
        { name: '📐 Fibonacci clés', value: indicators.fibonacci ? `38.2%: $${indicators.fibonacci['38.2%']} | 50%: $${indicators.fibonacci['50%']} | 61.8%: $${indicators.fibonacci['61.8%']}` : '—', inline: false }
      ],
      footer: { text: `TradingExpert • Stratégie: ${analysis.strategie || '—'} • Trackr` },
      timestamp: new Date().toISOString()
    }]
  };

  await discord(CHANNEL_ID, embed);
  return { ok: true, result: `Analyse ${symbol} postée (conviction: ${analysis.conviction_score}/100)`, metrics: { symbol, conviction: analysis.conviction_score, tendance: analysis.tendance, rsi: indicators.rsi } };
}