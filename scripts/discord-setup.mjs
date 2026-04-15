#!/usr/bin/env node
// ─── Trackr AI Hub — Discord Server Setup ────────────────────────────────────
// Run once: node scripts/discord-setup.mjs
// Creates the server, all channels, roles, and registers slash commands.
//
// Prerequisites:
//   1. Go to https://discord.com/developers/applications
//   2. Create a new application → Bot → copy TOKEN, APPLICATION_ID, PUBLIC_KEY
//   3. Set env vars in your shell before running:
//      export DISCORD_BOT_TOKEN="Bot xxx"
//      export DISCORD_APPLICATION_ID="your_app_id"
//   4. Run: node scripts/discord-setup.mjs
//   5. Copy the output env vars to Vercel dashboard → Settings → Environment Variables

const BASE = 'https://discord.com/api/v10'
const TOKEN = process.env.DISCORD_BOT_TOKEN
const APP_ID = process.env.DISCORD_APPLICATION_ID

if (!TOKEN || !APP_ID) {
  console.error('❌ Missing DISCORD_BOT_TOKEN or DISCORD_APPLICATION_ID')
  console.error('   export DISCORD_BOT_TOKEN="Bot yourtoken"')
  console.error('   export DISCORD_APPLICATION_ID="yourid"')
  process.exit(1)
}

function api(path, method = 'GET', body) {
  return fetch(`${BASE}${path}`, {
    method,
    headers: { Authorization: TOKEN, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async r => {
    const data = await r.json()
    if (!r.ok) throw new Error(`Discord API ${r.status}: ${JSON.stringify(data)}`)
    return data
  })
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Server structure ─────────────────────────────────────────────────────────
const STRUCTURE = [
  {
    name: '📋 INFO',
    channels: [
      { name: 'bienvenue',       type: 0, topic: 'Bienvenue sur Trackr AI Hub — 45 agents IA à votre service' },
      { name: 'statut-agents',   type: 0, topic: 'Statut et activité des agents en temps réel' },
    ],
  },
  {
    name: '🧠 ANDY CORE',
    channels: [
      { name: 'andy-chat',          type: 0, topic: '/andy <message> — Parle directement à AnDy AI (Claude Sonnet 4.6)' },
      { name: 'nexus-hub',          type: 0, topic: 'Coordination inter-agents et dispatching de tâches' },
      { name: 'app-pulse',          type: 0, topic: 'Surveillance santé de l\'application en temps réel' },
      { name: 'oracle-predictions', type: 0, topic: 'Analyses prédictives et probabilités de marché' },
    ],
  },
  {
    name: '📈 MARCHÉS',
    channels: [
      { name: 'market-scanner',  type: 0, topic: '/scan — MarketScanner scanne 50+ tickers toutes les heures' },
      { name: 'tech-analysis',   type: 0, topic: '/analyze <symbol> <interval> — RSI MACD EMA Bollinger' },
      { name: 'crypto',          type: 0, topic: '/price — CryptoTracker : Bitcoin Ethereum Solana et plus' },
      { name: 'price-alerts',    type: 0, topic: '/alert — AlertBot : alertes prix automatiques' },
      { name: 'portfolio-watch', type: 0, topic: '/portfolio — PortfolioGuard : P&L et risques' },
      { name: 'market-news',     type: 0, topic: 'NewsDigest : actualités marché agrégées' },
      { name: 'sentiment',       type: 0, topic: 'SentimentBot : Fear & Greed, sentiment social' },
      { name: 'macro',           type: 0, topic: 'MacroWatch : indicateurs économiques et taux' },
    ],
  },
  {
    name: '💻 DÉVELOPPEMENT',
    channels: [
      { name: 'code-review',   type: 0, topic: '/review — CodeReviewer analyse le code 4× par jour' },
      { name: 'bugs',          type: 0, topic: 'BugHunter : détection de bugs et erreurs' },
      { name: 'performance',   type: 0, topic: 'PerfOptimizer : bundle size, Core Web Vitals' },
      { name: 'security',      type: 0, topic: 'SecurityAudit : OWASP Top 10, vulnérabilités' },
      { name: 'deployments',   type: 0, topic: 'DeployWatch : statut déploiements Vercel' },
      { name: 'api-health',    type: 0, topic: 'APIMonitor : santé et latence des API' },
      { name: 'dependencies',  type: 0, topic: 'DependencyBot : dépendances obsolètes et CVEs' },
    ],
  },
  {
    name: '🎨 DESIGN',
    channels: [
      { name: 'ui-review',     type: 0, topic: '/ui — UIInspector revue composants et cohérence visuelle 2× par jour' },
      { name: 'ux-feedback',   type: 0, topic: 'UXAnalyst : flux utilisateur et friction points' },
      { name: 'responsive',    type: 0, topic: 'ResponsiveBot : mobile, breakpoints, layout' },
      { name: 'accessibility', type: 0, topic: 'AccessBot : WCAG 2.1, lecteurs d\'écran' },
      { name: 'pixel-review',  type: 0, topic: 'PixelPerfect : espacements, alignements, shadows' },
    ],
  },
  {
    name: '📊 DONNÉES & RISK',
    channels: [
      { name: 'risk',          type: 0, topic: 'RiskMetrics : VaR, Sharpe ratio, drawdown, beta' },
      { name: 'correlations',  type: 0, topic: 'CorrelationBot : corrélations entre actifs' },
      { name: 'backtests',     type: 0, topic: 'BacktestBot : backtesting de stratégies' },
      { name: 'trends',        type: 0, topic: 'TrendSpotter : tendances émergentes' },
    ],
  },
  {
    name: '🔔 RAPPORTS',
    channels: [
      { name: 'reports',       type: 0, topic: '/report — ReportBot : briefing matinal quotidien à 8h UTC' },
      { name: 'notifications', type: 0, topic: 'Notifier : alertes intelligentes prioritisées' },
      { name: 'scheduler',     type: 0, topic: 'Scheduler : tâches planifiées et automatisations' },
    ],
  },
]

// ─── Slash commands ───────────────────────────────────────────────────────────
const COMMANDS = [
  {
    name: 'andy',
    description: '🧠 Parle directement à AnDy AI (Claude Sonnet 4.6)',
    options: [{ type: 3, name: 'message', description: 'Ton message pour AnDy', required: true }],
  },
  {
    name: 'scan',
    description: '🔭 Scanner le marché — prix et % de variation',
    options: [{ type: 3, name: 'symbols', description: 'Symboles séparés par virgule (ex: AAPL,BTC-USD,ETH-USD)', required: false }],
  },
  {
    name: 'analyze',
    description: '📈 Analyse technique complète (RSI MACD EMA Bollinger)',
    options: [
      { type: 3, name: 'symbol', description: 'Symbole (ex: AAPL, BTC-USD, TSLA)', required: true },
      { type: 3, name: 'interval', description: 'Timeframe', required: false, choices: [
        { name: '5 minutes', value: '5m' }, { name: '15 minutes', value: '15m' },
        { name: '1 heure', value: '1h' }, { name: '4 heures', value: '4h' }, { name: '1 jour', value: '1d' },
      ]},
    ],
  },
  {
    name: 'price',
    description: '💱 Prix en temps réel d\'un actif',
    options: [{ type: 3, name: 'symbol', description: 'Ex: BTC-USD, AAPL, ETH-USD', required: true }],
  },
  {
    name: 'portfolio',
    description: '🛡️ Analyse P&L et risques de ton portfolio',
    options: [],
  },
  {
    name: 'alert',
    description: '🔔 Créer une alerte prix',
    options: [
      { type: 3, name: 'symbol', description: 'Symbole (ex: AAPL, BTC-USD)', required: true },
      { type: 10, name: 'price', description: 'Prix cible', required: true },
      { type: 3, name: 'direction', description: 'Direction', required: false, choices: [
        { name: 'Au-dessus ↑', value: 'above' }, { name: 'En-dessous ↓', value: 'below' },
      ]},
    ],
  },
  {
    name: 'review',
    description: '👁️ CodeReviewer analyse le code de l\'app',
    options: [{ type: 3, name: 'focus', description: 'Focus (performance, sécurité, bugs, général)', required: false }],
  },
  {
    name: 'ui',
    description: '🎨 UIInspector revue design et UX',
    options: [{ type: 3, name: 'page', description: 'Page à analyser (andy, markets, portfolio, général)', required: false }],
  },
  {
    name: 'report',
    description: '📋 Générer un rapport de marché',
    options: [{ type: 3, name: 'type', description: 'Type de rapport', required: false, choices: [
      { name: 'Quotidien', value: 'daily' }, { name: 'Hebdomadaire', value: 'weekly' },
    ]}],
  },
  {
    name: 'oracle',
    description: '🔮 Oracle — analyse prédictive et probabilités',
    options: [{ type: 3, name: 'question', description: 'Ta question prédictive', required: true }],
  },
  {
    name: 'risk',
    description: '⚖️ RiskMetrics — VaR, Sharpe ratio, drawdown',
    options: [{ type: 3, name: 'question', description: 'Analyse de risque souhaitée', required: true }],
  },
  {
    name: 'sentiment',
    description: '🌡️ SentimentBot — Fear & Greed, sentiment marché',
    options: [{ type: 3, name: 'question', description: 'Actif ou marché à analyser', required: false }],
  },
  {
    name: 'help',
    description: '🌌 Liste tous les 45 agents disponibles',
    options: [],
  },
]

// ─── Main setup ───────────────────────────────────────────────────────────────
async function setup() {
  console.log('🚀 Setting up Trackr AI Hub on Discord...\n')

  // 1. Create guild
  console.log('1️⃣  Creating server "Trackr AI Hub"...')
  const guild = await api('/guilds', 'POST', {
    name: 'Trackr AI Hub',
    verification_level: 0,
    default_message_notifications: 1,
    explicit_content_filter: 0,
  })
  const guildId = guild.id
  console.log(`   ✅ Server created: ${guildId}\n`)

  await sleep(1000)

  // 2. Delete default channels
  console.log('2️⃣  Removing default channels...')
  const defaultChannels = await api(`/guilds/${guildId}/channels`)
  for (const ch of defaultChannels) {
    await api(`/channels/${ch.id}`, 'DELETE').catch(() => {})
    await sleep(200)
  }
  console.log('   ✅ Done\n')

  // 3. Create categories + channels
  console.log('3️⃣  Creating categories and channels...')
  const channelIds = {}
  for (const cat of STRUCTURE) {
    const category = await api(`/guilds/${guildId}/channels`, 'POST', {
      name: cat.name, type: 4,
    })
    await sleep(300)
    for (const ch of cat.channels) {
      const created = await api(`/guilds/${guildId}/channels`, 'POST', {
        name: ch.name, type: 0,
        topic: ch.topic,
        parent_id: category.id,
        rate_limit_per_user: 3,
      })
      channelIds[ch.name] = created.id
      console.log(`   ✅ #${ch.name} → ${created.id}`)
      await sleep(300)
    }
  }
  console.log()

  // 4. Register slash commands (guild-scoped = instant, global = 1h delay)
  console.log('4️⃣  Registering slash commands...')
  for (const cmd of COMMANDS) {
    await api(`/applications/${APP_ID}/guilds/${guildId}/commands`, 'POST', cmd)
    console.log(`   ✅ /${cmd.name}`)
    await sleep(200)
  }
  console.log()

  // 5. Set bot permissions in guild
  console.log('5️⃣  Configuring bot...')
  await api(`/guilds/${guildId}/members/@me`, 'PATCH', { nick: 'AnDy Hub' }).catch(() => {})

  // 6. Post welcome message in andy-chat
  if (channelIds['andy-chat']) {
    await api(`/channels/${channelIds['andy-chat']}/messages`, 'POST', {
      embeds: [{
        author: { name: '🧠 AnDy AI — Trackr Intelligence' },
        title: '🌌 Trackr AI Hub opérationnel',
        description: [
          '**45 agents IA** prêts à t\'assister.',
          '',
          '**Commandes principales :**',
          '`/andy <message>` — Parle à AnDy AI directement',
          '`/scan` — Scanner le marché en temps réel',
          '`/analyze AAPL 1h` — Analyse technique complète',
          '`/price BTC-USD` — Prix live',
          '`/portfolio` — P&L et risques',
          '`/review` — Revue de code automatique',
          '`/ui` — Analyse design et UX',
          '`/report` — Briefing marché',
          '`/help` — Liste tous les agents',
          '',
          '📡 Les agents scannent le marché toutes les heures.',
          '🔵 Connecté à l\'app Trackr en temps réel.',
        ].join('\n'),
        color: 0x00daf3,
        footer: { text: 'Trackr AI Hub · Claude Sonnet 4.6 · Vercel' },
        timestamp: new Date().toISOString(),
      }],
    })
  }

  // 7. Generate invite link
  if (channelIds['andy-chat']) {
    const invite = await api(`/channels/${channelIds['andy-chat']}/invites`, 'POST', {
      max_age: 0, max_uses: 0,
    })
    console.log(`\n✅ Server ready!\n`)
    console.log('🔗 INVITE LINK (share with yourself):')
    console.log(`   https://discord.gg/${invite.code}\n`)
  }

  // 8. Print env vars to copy to Vercel
  console.log('─'.repeat(60))
  console.log('📋 ADD THESE TO VERCEL → Settings → Environment Variables:')
  console.log('─'.repeat(60))
  console.log(`DISCORD_GUILD_ID=${guildId}`)
  console.log(`DISCORD_CH_MARKET_SCANNER=${channelIds['market-scanner'] || ''}`)
  console.log(`DISCORD_CH_CRYPTO=${channelIds['crypto'] || ''}`)
  console.log(`DISCORD_CH_PORTFOLIO=${channelIds['portfolio-watch'] || ''}`)
  console.log(`DISCORD_CH_CODE_REVIEW=${channelIds['code-review'] || ''}`)
  console.log(`DISCORD_CH_UI_REVIEW=${channelIds['ui-review'] || ''}`)
  console.log(`DISCORD_CH_REPORTS=${channelIds['reports'] || ''}`)
  console.log(`DISCORD_CH_PRICE_ALERTS=${channelIds['price-alerts'] || ''}`)
  console.log(`DISCORD_CH_APP_PULSE=${channelIds['app-pulse'] || ''}`)
  console.log('─'.repeat(60))
  console.log('\n🎯 Next steps:')
  console.log('   1. Click the invite link above to join your server')
  console.log('   2. Add the env vars above to Vercel')
  console.log('   3. In Discord Developer Portal → Bot → set Interactions Endpoint URL:')
  console.log('      https://trackr-app-nu.vercel.app/api/discord')
  console.log('   4. Also set: DISCORD_BOT_TOKEN, DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY in Vercel')
  console.log('\n✨ Done! Your 45-agent Discord server is ready.')
}

setup().catch(e => {
  console.error('❌ Setup failed:', e.message)
  process.exit(1)
})
