// ─── Trigger Agent — dispatch a task to a specific agent on-demand ────────────
// POST /api/trigger-agent { agent, task, channelHint }
// AnDy calls this to assign work to any of the 45 agents

const DISCORD_API = 'https://discord.com/api/v10'
const BOT_TOKEN   = process.env.DISCORD_BOT_TOKEN

const CHANNELS = {
  'market-scanner':  process.env.DISCORD_CH_MARKET_SCANNER,
  'crypto':          process.env.DISCORD_CH_CRYPTO,
  'portfolio-watch': process.env.DISCORD_CH_PORTFOLIO,
  'code-review':     process.env.DISCORD_CH_CODE_REVIEW,
  'ui-review':       process.env.DISCORD_CH_UI_REVIEW,
  'reports':         process.env.DISCORD_CH_REPORTS,
  'price-alerts':    process.env.DISCORD_CH_PRICE_ALERTS,
  'app-pulse':       process.env.DISCORD_CH_APP_PULSE,
}

// Which channel each agent category posts to
const AGENT_CHANNEL = {
  // Market agents
  MarketScanner: 'market-scanner', MarketMaker: 'market-scanner', TrendDetector: 'market-scanner',
  Screener: 'market-scanner', MacroAnalyst: 'market-scanner', SentimentBot: 'market-scanner',
  VolumeTracker: 'market-scanner', PriceAction: 'market-scanner', SectorRotation: 'market-scanner',
  // Crypto agents
  CryptoTracker: 'crypto', DeFiScanner: 'crypto', NFTRadar: 'crypto', WhaleAlert: 'crypto',
  ChainAnalyst: 'crypto', GasOptimizer: 'crypto', AltcoinHunter: 'crypto', YieldFarmer: 'crypto',
  // Portfolio agents
  PortfolioGuard: 'portfolio-watch', RiskMetrics: 'portfolio-watch', RebalanceBot: 'portfolio-watch',
  DividendTracker: 'portfolio-watch', TaxOptimizer: 'portfolio-watch',
  // Dev agents
  CodeReviewer: 'code-review', BugHunter: 'code-review', PerfOptimizer: 'code-review',
  SecurityAudit: 'code-review', RefactorBot: 'code-review', TestWriter: 'code-review',
  DocWriter: 'code-review', DependencyBot: 'code-review',
  // Design agents
  UIInspector: 'ui-review', UXAnalyst: 'ui-review', ResponsiveBot: 'ui-review',
  AnimationBot: 'ui-review', AccessibilityBot: 'ui-review',
  // Analytics
  DataMiner: 'reports', PatternRecognizer: 'reports', BacktestEngine: 'reports',
  ReportGenerator: 'reports', InsightBot: 'reports',
  // Automation
  AlertBot: 'price-alerts', SchedulerBot: 'app-pulse', Pulse: 'app-pulse',
  ErrorTracker: 'app-pulse', DeployBot: 'app-pulse', BackupBot: 'app-pulse',
  // AI
  TechAnalyst: 'reports', Oracle: 'reports', NewsAnalyst: 'reports',
  MLPredictor: 'reports', StrategyBot: 'reports',
}

// Agent emoji map
const AGENT_EMOJI = {
  MarketScanner:'🔭', CryptoTracker:'₿', PortfolioGuard:'🛡️', CodeReviewer:'👁️',
  UIInspector:'🎨', AlertBot:'🔔', Pulse:'💓', TechAnalyst:'📈', Oracle:'🔮',
  BugHunter:'🐛', PerfOptimizer:'⚡', SecurityAudit:'🔐', UXAnalyst:'👤',
  ResponsiveBot:'📱', DeFiScanner:'🌐', WhaleAlert:'🐋', RiskMetrics:'⚖️',
  ReportGenerator:'📊', NewsAnalyst:'📰', MLPredictor:'🤖',
}

async function postToDiscord(channelId, agentName, task, result) {
  if (!channelId || !BOT_TOKEN) return
  const emoji = AGENT_EMOJI[agentName] || '🤖'
  await fetch(`${DISCORD_API}/channels/${channelId}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      embeds: [{
        author: { name: `${emoji} ${agentName} — Tâche assignée par AnDy` },
        description: result,
        color: 0x8b5cf6,
        fields: [{ name: 'Mission', value: task.slice(0, 200), inline: false }],
        footer: { text: 'Trackr Agent Network · On-demand' },
        timestamp: new Date().toISOString(),
      }]
    }),
  }).catch(() => {})
}

import { securityCheck } from './_security.js'

export default async function handler(req, res) {
  const blocked = securityCheck(req, res, { route: '/api/trigger-agent', rateMax: 20, maxBodyKB: 10 })
  if (blocked) return
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { agent, task, channelHint } = req.body || {}
  if (!agent || !task) return res.status(400).json({ error: 'Missing agent or task' })

  const startedAt = new Date().toISOString()

  // Route to right Discord channel
  const channelKey = channelHint || AGENT_CHANNEL[agent] || 'reports'
  const channelId  = CHANNELS[channelKey]

  // Call AnDy to actually execute the task
  let result = ''
  try {
    const apiUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'https://trackr-app-nu.vercel.app'

    const r = await fetch(`${apiUrl}/api/andy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: `[AGENT TASK — ${agent}]: ${task}` }],
        portfolio: [], crypto: [], sneakers: [], alerts: [], watchlist: [],
      }),
    })

    if (r.ok) {
      const raw = await r.text()
      for (const line of raw.split('\n')) {
        if (!line.startsWith('data: ')) continue
        try {
          const ev = JSON.parse(line.slice(6))
          if (ev.type === 'token') result += ev.text
        } catch {}
      }
      result = result.trim().slice(0, 3000)
    }
  } catch (e) {
    result = `Erreur lors de l'exécution: ${e.message}`
  }

  if (!result) result = `✅ ${agent} a bien reçu la tâche : "${task}". Exécution en cours...`

  // Post result to Discord
  await postToDiscord(channelId, agent, task, result)

  res.status(200).json({
    ok: true,
    agent,
    task,
    channel: channelKey,
    resultLength: result.length,
    startedAt,
    completedAt: new Date().toISOString(),
  })
}
