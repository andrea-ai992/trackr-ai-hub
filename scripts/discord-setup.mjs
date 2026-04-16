#!/usr/bin/env node
// ─── Trackr AI Hub — Discord Server Setup (v2 — Idempotent) ──────────────────
// Safe to re-run at any time — never deletes channels/roles, only creates/updates
//
// Run: node scripts/discord-setup.mjs
//
// Required env vars:
//   DISCORD_BOT_TOKEN        — "Bot xxxxx" from Developer Portal
//   DISCORD_APPLICATION_ID   — your application ID
//   DISCORD_GUILD_ID         — your server ID (right-click server → Copy ID)
//
// Optional:
//   CREATE_WEBHOOKS=true     — also create channel webhooks for multi-bot feel

import { writeFileSync } from 'fs'

const BASE   = 'https://discord.com/api/v10'
const TOKEN  = process.env.DISCORD_BOT_TOKEN
const APP_ID = process.env.DISCORD_APPLICATION_ID
const GUILD  = process.env.DISCORD_GUILD_ID
const CREATE_WEBHOOKS = process.env.CREATE_WEBHOOKS === 'true'

if (!TOKEN || !APP_ID || !GUILD) {
  console.error('\n❌ Missing required env vars:\n')
  if (!TOKEN)  console.error('   export DISCORD_BOT_TOKEN="Bot yourtoken"')
  if (!APP_ID) console.error('   export DISCORD_APPLICATION_ID="yourid"')
  if (!GUILD)  console.error('   export DISCORD_GUILD_ID="yourserverid"')
  console.error('\nHow to get DISCORD_GUILD_ID:')
  console.error('   Discord → Settings → Advanced → Enable Developer Mode')
  console.error('   Right-click your server → Copy Server ID\n')
  process.exit(1)
}

// ─── Rate-limit aware API helper ──────────────────────────────────────────────
async function api(path, method = 'GET', body) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const r = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        Authorization: TOKEN.startsWith('Bot ') ? TOKEN : `Bot ${TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    })

    if (r.status === 429) {
      const data = await r.json()
      const wait = (data.retry_after || 1) * 1000 + 200
      console.log(`   ⏳ Rate limited — waiting ${Math.round(wait / 1000)}s...`)
      await sleep(wait)
      continue
    }

    if (r.status === 204) return null

    const data = await r.json()
    if (!r.ok) {
      const msg = data?.message || JSON.stringify(data)
      throw new Error(`Discord API ${method} ${path} → ${r.status}: ${msg}`)
    }
    return data
  }
  throw new Error(`Failed after 3 attempts: ${method} ${path}`)
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

// ─── Server structure ─────────────────────────────────────────────────────────
const STRUCTURE = [
  {
    name: '📋 INFO',
    channels: [
      { name: 'annonces',       topic: '📢 Annonces système, déploiements, alertes critiques' },
      { name: 'statut-agents',  topic: '🤖 Statut et activité des 45 agents en temps réel' },
      { name: 'bienvenue',      topic: '👋 Bienvenue sur Trackr AI Hub' },
    ],
  },
  {
    name: '🧠 ANDY CORE',
    channels: [
      { name: 'andy-chat',           topic: '🧠 /andy <message> — Parle à AnDy AI · Claude Sonnet 4.6' },
      { name: 'nexus-hub',           topic: '🔗 Coordination inter-agents · dispatching de tâches' },
      { name: 'app-pulse',           topic: '💓 Surveillance santé de l\'app en temps réel' },
      { name: 'oracle-predictions',  topic: '🔮 Analyses prédictives · probabilités de marché' },
      { name: 'synapse-relay',       topic: '⚡ Communication inter-agents · signaux importants' },
    ],
  },
  {
    name: '📈 MARCHÉS',
    channels: [
      { name: 'market-scanner',   topic: '🔭 /scan — MarketScanner · 50+ tickers toutes les heures' },
      { name: 'tech-analysis',    topic: '📈 /analyze — TechAnalyst · RSI MACD EMA Bollinger' },
      { name: 'crypto',           topic: '₿ /price — CryptoTracker · BTC ETH SOL et plus' },
      { name: 'trading-desk',     topic: '🎯 /analyse — TradingExpert · Goldman Sachs style · Haiku + Sonnet' },
      { name: 'price-alerts',     topic: '🔔 /alert — AlertBot · alertes prix automatiques' },
      { name: 'portfolio-watch',  topic: '🛡️ /portfolio — PortfolioGuard · P&L et risques' },
      { name: 'market-news',      topic: '📰 NewsDigest · actualités marché agrégées' },
      { name: 'sentiment',        topic: '🌡️ SentimentBot · Fear & Greed · sentiment social' },
      { name: 'macro',            topic: '🌍 MacroWatch · indicateurs économiques et taux' },
      { name: 'options-flow',     topic: '🌊 OptionsFlow · flux options inhabituels' },
    ],
  },
  {
    name: '💻 DÉVELOPPEMENT',
    channels: [
      { name: 'code-review',    topic: '👁️ /review — CodeReviewer · analyse code 4× par jour' },
      { name: 'bugs',           topic: '🐛 BugHunter · détection de bugs et erreurs' },
      { name: 'performance',    topic: '⚡ PerfOptimizer · bundle size, Core Web Vitals' },
      { name: 'security',       topic: '🔐 SecurityAudit · OWASP Top 10 · priorité max' },
      { name: 'deployments',    topic: '🚀 DeployWatch · statut déploiements Vercel' },
      { name: 'api-health',     topic: '🔌 APIMonitor · santé et latence des API' },
      { name: 'refactor',       topic: '🔧 RefactorBot · qualité code et patterns' },
      { name: 'dependencies',   topic: '📦 DependencyBot · dépendances obsolètes et CVEs' },
    ],
  },
  {
    name: '🎨 DESIGN',
    channels: [
      { name: 'ui-review',      topic: '🎨 /ui — UIInspector · revue composants et cohérence 2× par jour' },
      { name: 'ux-feedback',    topic: '👤 UXAnalyst · flux utilisateur et friction points' },
      { name: 'animations',     topic: '✨ AnimationBot · fluidité et micro-interactions' },
      { name: 'responsive',     topic: '📱 ResponsiveBot · mobile, breakpoints, layout' },
      { name: 'accessibility',  topic: '♿ AccessBot · WCAG 2.1, lecteurs d\'écran' },
    ],
  },
  {
    name: '📊 DONNÉES & RISK',
    channels: [
      { name: 'risk',           topic: '⚖️ RiskMetrics · VaR, Sharpe ratio, drawdown, beta' },
      { name: 'statistics',     topic: '📊 StatsBot · statistiques descriptives' },
      { name: 'correlations',   topic: '🔗 CorrelationBot · corrélations entre actifs' },
      { name: 'backtests',      topic: '⏪ BacktestBot · backtesting de stratégies' },
      { name: 'trends',         topic: '🎯 TrendSpotter · tendances émergentes' },
    ],
  },
  {
    name: '🔔 RAPPORTS',
    channels: [
      { name: 'morning-briefing', topic: '☀️ Briefing matinal automatique · marchés + IA + plan · 9h UTC' },
      { name: 'reports',          topic: '📋 /report — ReportBot · rapports quotidiens 8h UTC + hebdo dimanche' },
      { name: 'notifications',    topic: '🔔 Notifier · alertes intelligentes prioritisées' },
    ],
  },
  {
    name: '🧠 BRAIN AUTONOME',
    channels: [
      { name: 'brain-cycles',   topic: '🧠 Brain · cycles autonomes · décisions · améliorations appliquées' },
      { name: 'agent-forge',    topic: '🏭 Agent Forge · nouveaux agents créés automatiquement' },
    ],
  },
  {
    name: '🔐 ADMIN',
    channels: [
      { name: 'admin-tasks',    topic: '📋 /dev action:task — Tâches assignées à l\'IA par l\'admin' },
      { name: 'admin-logs',     topic: '🔑 Logs admin · commandes exécutées · accès système' },
    ],
  },
]

// Channels where we want webhooks (for multi-bot posting feel)
const WEBHOOK_CHANNELS = [
  'annonces', 'trading-desk', 'market-scanner', 'crypto', 'code-review',
  'brain-cycles', 'morning-briefing', 'reports', 'admin-tasks',
]

// ─── Slash commands (FULL LIST — atomic PUT replaces all) ─────────────────────
const COMMANDS = [
  {
    name: 'andy',
    description: '🧠 Parle directement à AnDy AI (Claude Sonnet 4.6)',
    options: [{ type: 3, name: 'message', description: 'Ton message pour AnDy', required: true }],
  },
  {
    name: 'analyse',
    description: '⚡ Analyse trading ultra-rapide — signal instantané + Goldman Sachs en background',
    options: [
      { type: 3, name: 'symbol', description: 'Symbole (ex: BTC, ETH, AAPL, NVDA)', required: true },
      { type: 3, name: 'type', description: 'Type d\'actif', required: false, choices: [
        { name: '📈 Action', value: 'stock' },
        { name: '₿ Crypto', value: 'crypto' },
      ]},
    ],
  },
  {
    name: 'scan',
    description: '🔭 Scanner le marché — prix et % de variation',
    options: [{ type: 3, name: 'symbols', description: 'Symboles séparés par virgule (ex: AAPL,BTC-USD,ETH-USD)', required: false }],
  },
  {
    name: 'price',
    description: '💱 Prix en temps réel d\'un actif',
    options: [{ type: 3, name: 'symbol', description: 'Ex: BTC-USD, AAPL, ETH-USD', required: true }],
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
    description: '📋 Générer un rapport de marché ou IA',
    options: [{ type: 3, name: 'type', description: 'Type de rapport', required: false, choices: [
      { name: 'Quotidien', value: 'daily' }, { name: 'Hebdomadaire', value: 'weekly' }, { name: 'Résumé', value: 'summary' },
    ]}],
  },
  {
    name: 'brain',
    description: '🧠 Déclencher un cycle autonome du Brain maintenant',
    options: [],
  },
  {
    name: 'dev',
    description: '🔐 Admin Control — Assigne des tâches, vérifie le statut, déclenche l\'IA',
    options: [
      {
        type: 3, name: 'action', description: 'Action à effectuer', required: true,
        choices: [
          { name: '📊 Statut système', value: 'status' },
          { name: '📋 Assigner une tâche à l\'IA', value: 'task' },
          { name: '⚡ Lancer self-improve maintenant', value: 'run' },
          { name: '📈 Générer rapport quotidien', value: 'report' },
        ],
      },
      { type: 3, name: 'description', description: 'Description de la tâche (pour action:task)', required: false },
      {
        type: 3, name: 'focus', description: 'Focus de l\'IA', required: false,
        choices: [
          { name: '🐛 Bugs', value: 'bugs' },
          { name: '🔐 Sécurité', value: 'security' },
          { name: '🎨 Frontend/Design', value: 'frontend' },
          { name: '⚡ Performance', value: 'performance' },
          { name: '✨ Nouvelles features', value: 'features' },
          { name: '📊 Trading', value: 'trading' },
          { name: '🤖 Système autonome', value: 'autonomous' },
        ],
      },
    ],
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
    name: 'guide',
    description: '🧭 Guide de progression — comment utiliser AnDy AI Hub',
    options: [{ type: 3, name: 'niveau', description: 'Niveau', required: false, choices: [
      { name: '🌱 Débutant', value: 'debutant' },
      { name: '🌿 Intermédiaire', value: 'intermediaire' },
      { name: '🌳 Avancé', value: 'avance' },
    ]}],
  },
  {
    name: 'help',
    description: '🌌 Liste tous les 45 agents disponibles',
    options: [],
  },
]

// ─── Main setup (safe upsert) ─────────────────────────────────────────────────
async function setup() {
  console.log('\n🚀 Trackr AI Hub — Discord Setup (Idempotent)\n')
  console.log(`   Server: ${GUILD}`)
  console.log(`   App:    ${APP_ID}\n`)

  // 1. Get existing channels
  console.log('1️⃣  Loading existing channels...')
  const existingChannels = await api(`/guilds/${GUILD}/channels`)
  const existingByName = {}
  for (const ch of existingChannels) {
    existingByName[ch.name] = ch
  }
  console.log(`   Found ${existingChannels.length} existing channels\n`)

  // 2. Create missing categories + channels (upsert)
  console.log('2️⃣  Upserting categories and channels...')
  const channelIds = {}
  let created = 0, skipped = 0

  for (const cat of STRUCTURE) {
    // Category
    let catId = existingByName[cat.name]?.id
    if (!catId) {
      const c = await api(`/guilds/${GUILD}/channels`, 'POST', { name: cat.name, type: 4 })
      catId = c.id
      console.log(`   ✅ Created category: ${cat.name}`)
      created++
      await sleep(300)
    } else {
      console.log(`   ⏭️  Exists: ${cat.name}`)
      skipped++
    }

    // Channels inside category
    for (const ch of cat.channels) {
      const existing = existingByName[ch.name]
      if (existing) {
        channelIds[ch.name] = existing.id
        skipped++
        continue
      }
      const c = await api(`/guilds/${GUILD}/channels`, 'POST', {
        name: ch.name,
        type: 0,
        parent_id: catId,
        topic: ch.topic || '',
      })
      channelIds[ch.name] = c.id
      console.log(`   ✅ Created #${ch.name}`)
      created++
      await sleep(250)
    }
  }
  console.log(`\n   ${created} created · ${skipped} already existed\n`)

  // 3. Register roles (upsert)
  console.log('3️⃣  Setting up roles...')
  const existingRoles = await api(`/guilds/${GUILD}/roles`)
  const roleNames = existingRoles.map(r => r.name)
  const rolesToCreate = [
    { name: '🔐 Admin', color: 0xef4444, hoist: true, mentionable: false },
    { name: '🤖 AnDy Bot', color: 0x00daf3, hoist: false, mentionable: false },
    { name: '📈 Trader', color: 0x10b981, hoist: false, mentionable: false },
  ]
  for (const role of rolesToCreate) {
    if (!roleNames.includes(role.name)) {
      await api(`/guilds/${GUILD}/roles`, 'POST', role)
      console.log(`   ✅ Created role: ${role.name}`)
      await sleep(300)
    } else {
      console.log(`   ⏭️  Role exists: ${role.name}`)
    }
  }
  console.log()

  // 4. Register ALL slash commands atomically via PUT (idempotent full replace)
  console.log('4️⃣  Registering slash commands (PUT — atomic replace)...')
  const result = await api(`/applications/${APP_ID}/guilds/${GUILD}/commands`, 'PUT', COMMANDS)
  console.log(`   ✅ ${result.length} commands registered: ${result.map(c => '/' + c.name).join(', ')}\n`)

  // 5. Create webhooks for key channels
  const webhookEnvVars = {}
  if (CREATE_WEBHOOKS) {
    console.log('5️⃣  Creating channel webhooks (multi-bot posting)...')
    for (const chName of WEBHOOK_CHANNELS) {
      const chId = channelIds[chName] || existingByName[chName]?.id
      if (!chId) { console.log(`   ⚠️  Channel #${chName} not found — skip webhook`); continue }
      try {
        // Check existing webhooks
        const existing = await api(`/channels/${chId}/webhooks`)
        const trackrWebhook = existing?.find(w => w.name === 'Trackr AI')
        if (trackrWebhook) {
          webhookEnvVars[chName] = `https://discord.com/api/webhooks/${trackrWebhook.id}/${trackrWebhook.token}`
          console.log(`   ⏭️  Webhook exists: #${chName}`)
        } else {
          const wh = await api(`/channels/${chId}/webhooks`, 'POST', { name: 'Trackr AI' })
          webhookEnvVars[chName] = `https://discord.com/api/webhooks/${wh.id}/${wh.token}`
          console.log(`   ✅ Webhook created: #${chName}`)
          await sleep(300)
        }
      } catch (e) {
        console.log(`   ❌ Webhook failed for #${chName}: ${e.message}`)
      }
    }
    console.log()
  }

  // 6. Output environment variables
  console.log('6️⃣  Channel IDs — add to Vercel env vars:\n')
  const allChannelIds = { ...channelIds }
  for (const ch of existingChannels) allChannelIds[ch.name] = allChannelIds[ch.name] || ch.id

  const envVarMap = {
    'annonces':       'DISCORD_CH_ANNONCES',
    'andy-chat':      'DISCORD_CH_ANDY',
    'trading-desk':   'DISCORD_CH_TRADING_DESK',
    'market-scanner': 'DISCORD_CH_MARKET_SCANNER',
    'crypto':         'DISCORD_CH_CRYPTO',
    'code-review':    'DISCORD_CH_CODE_REVIEW',
    'ui-review':      'DISCORD_CH_UI_REVIEW',
    'brain-cycles':   'DISCORD_CH_BRAIN',
    'morning-briefing': 'DISCORD_CH_MORNING',
    'reports':        'DISCORD_CH_REPORTS',
    'price-alerts':   'DISCORD_CH_PRICE_ALERTS',
    'app-pulse':      'DISCORD_CH_APP_PULSE',
    'portfolio-watch':'DISCORD_CH_PORTFOLIO',
    'admin-tasks':    'DISCORD_CH_ADMIN_TASKS',
    'security':       'DISCORD_CH_SECURITY',
    'performance':    'DISCORD_CH_PERFORMANCE',
    'deployments':    'DISCORD_CH_DEPLOYMENTS',
  }

  const envLines = []
  for (const [ch, envVar] of Object.entries(envVarMap)) {
    const id = allChannelIds[ch]
    if (id) {
      console.log(`   ${envVar}="${id}"`)
      envLines.push(`${envVar}="${id}"`)
    }
  }

  if (Object.keys(webhookEnvVars).length > 0) {
    console.log('\n   Webhook URLs:')
    const whMap = {
      'annonces':       'DISCORD_WEBHOOK_ANNONCES',
      'trading-desk':   'DISCORD_WEBHOOK_TRADING',
      'market-scanner': 'DISCORD_WEBHOOK_MARKETS',
      'code-review':    'DISCORD_WEBHOOK_DEV',
      'brain-cycles':   'DISCORD_WEBHOOK_BRAIN',
      'morning-briefing': 'DISCORD_WEBHOOK_MORNING',
      'reports':        'DISCORD_WEBHOOK_REPORTS',
      'admin-tasks':    'DISCORD_WEBHOOK_ADMIN',
    }
    for (const [ch, url] of Object.entries(webhookEnvVars)) {
      const envKey = whMap[ch] || `DISCORD_WEBHOOK_${ch.toUpperCase().replace(/-/g, '_')}`
      console.log(`   ${envKey}="${url}"`)
      envLines.push(`${envKey}="${url}"`)
    }
  }

  // Save to .env.discord for easy copy-paste
  writeFileSync('.env.discord', envLines.join('\n') + '\n')
  console.log('\n   💾 Saved to .env.discord — copy these to Vercel → Settings → Env Vars\n')

  // 7. Post welcome message in andy-chat
  const andyChatId = allChannelIds['andy-chat']
  if (andyChatId) {
    try {
      await api(`/channels/${andyChatId}/messages`, 'POST', {
        embeds: [{
          author: { name: '🌌 Trackr AI Hub — Setup complet' },
          title: 'AnDy AI est prêt',
          description: [
            '**45 agents spécialisés actifs 24/7.**',
            '',
            '**Chat IA :** tape simplement `/andy` suivi de ton message',
            '**Trading :** `/analyse BTC` · `/scan` · `/price AAPL`',
            '**Analyse :** `/analyze NVDA` · `/portfolio` · `/report`',
            '**Admin :** `/dev action:status` · `/dev action:task`',
            '**Guide :** `/guide` pour voir comment progresser',
          ].join('\n'),
          color: 0x00daf3,
          fields: [
            { name: '🤖 Agents actifs', value: '45 agents · MarketScanner, TechAnalyst, CodeReviewer, Brain...', inline: false },
            { name: '⏰ Cycles automatiques', value: 'Sécurité 4h · Bugs 6h · Marchés 8h · Performance 10h · Design 14h · Trading 16h', inline: false },
            { name: '🔐 Admin', value: '`/dev action:task description:Ta tâche focus:bugs`', inline: false },
          ],
          footer: { text: 'AnDy AI Hub · Claude Sonnet 4.6 · Vercel Serverless' },
          timestamp: new Date().toISOString(),
        }],
      })
      console.log('7️⃣  Welcome message posted in #andy-chat\n')
    } catch {}
  }

  console.log('✅ Setup complete!\n')
  console.log('Next steps:')
  console.log('  1. Copy the env vars above to: Vercel → Project → Settings → Environment Variables')
  console.log('  2. Redeploy (or push a commit) so Vercel picks up the new channel IDs')
  console.log('  3. Add Vercel webhook for deploy notifications:')
  console.log('     Vercel → Project → Settings → Webhooks → Add')
  console.log('     URL: https://trackr-app-nu.vercel.app/api/deploy-notify')
  console.log('     Events: deployment.succeeded, deployment.error, deployment.canceled\n')
}

setup().catch(e => {
  console.error('\n❌ Setup failed:', e.message)
  process.exit(1)
})
