// ─── Multi-bot launcher — 5 agents spécialisés ────────────────────────────────
// Usage: node bot/multi.js
// PM2:  pm2 start bot/multi.js --name andy-bots

import { readFileSync, existsSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { startBot } from './agent.js'

const __dir = dirname(fileURLToPath(import.meta.url))

// Load both .env files
for (const f of ['.env', '../.env']) {
  const fp = resolve(__dir, f)
  if (!existsSync(fp)) continue
  for (const line of readFileSync(fp, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').replace(/[\r\n\\]+$/, '').trim()
  }
}

const GUILD_ID  = process.env.DISCORD_GUILD_ID
const GROQ_KEY  = process.env.GROQ_API_KEY

if (!GUILD_ID || !GROQ_KEY) {
  console.error('❌ DISCORD_GUILD_ID ou GROQ_API_KEY manquant')
  process.exit(1)
}

// ── Tokens ────────────────────────────────────────────────────────────────────
const TOKENS = {
  andy:    process.env.DISCORD_BOT_TOKEN,         // Bot 1 — existant
  crypto:  process.env.BOT_TOKEN_CRYPTO,
  market:  process.env.BOT_TOKEN_MARKET,
  code:    process.env.BOT_TOKEN_CODE,
  pulse:   process.env.BOT_TOKEN_PULSE,
}

// ── System prompts ─────────────────────────────────────────────────────────────
const PROMPTS = {
  andy: (ch) => `Tu es AnDy, l'IA personnelle d'Andrea Matlega. Tu réponds dans Discord (#${ch}).
Règles: COURT (2-3 para max), direct, pas d'intro. Français sauf si anglais reçu.
Tu réponds à tout: finance, crypto, business, tech, vie quotidienne.`,

  crypto: () => `Tu es CryptoAnDy, expert trading/crypto d'Andrea.
Tu analyses comme les meilleurs traders (Druckenmiller, Tudor Jones, Livermore).
Focus: analyse technique, macro, niveaux précis, catalyseurs.
COURT et direct. Pas de disclaimers — Andrea sait que c'est de l'analyse.`,

  market: () => `Tu es MarketAnDy, analyste marchés financiers d'Andrea.
Tu couvres: actions, ETF, secteurs, macro globale, rapports économiques.
Format: bullet points concis, chiffres précis, tendances clés.
Inclus toujours: sentiment actuel + catalyseur principal + niveau clé à surveiller.`,

  code: (ch) => `Tu es CodeAnDy, expert développement pour Andrea (app Trackr — React/Vite/Vercel).
Stack: React 18, Vite, Tailwind, Vercel, Node.js, PM2, VPS Linux.
Dans #${ch}: analyse le code, détecte les bugs, suggère des améliorations.
Réponds avec du code concret. Court et précis.`,

  pulse: () => `Tu es PulseAnDy, agent de monitoring pour l'app Trackr d'Andrea.
Tu surveilles: uptime, performances, erreurs, déploiements Vercel, daemon VPS.
App: https://trackr-app-nu.vercel.app — VPS: 62.238.12.221
Alerte si anomalie détectée. Format: statut emoji + problème + action recommandée.`,
}

// ── Lancer les 5 bots ─────────────────────────────────────────────────────────
const bots = [
  {
    name: 'AnDy',
    token: TOKENS.andy,
    channels: null,
    systemPrompt: PROMPTS.andy,
    pollInterval: 2500,
    schedules: [
      {
        hour: 8, minute: 0, channel: 'morning', label: 'Morning briefing',
        prompt: `Tu es AnDy. Génère un briefing matinal pour Andrea (18 avril 2025).
Format Discord, max 200 mots:
🌅 **Bonjour Andrea**
• 1 insight business/tech du moment
• 1 rappel ou priorité du jour
• 1 citation motivante courte
Reste bref, percutant, positif.`,
      },
    ],
  },
  {
    name: 'CryptoAnDy',
    token: TOKENS.crypto,
    channels: ['crypto', 'bitcoin', 'trading', 'defi', 'price-alerts', 'portfolio', 'oracle-predictions'],
    systemPrompt: PROMPTS.crypto,
    pollInterval: 3000,
    schedules: [
      {
        hour: 9, minute: 0, channel: 'crypto', label: 'Crypto morning scan',
        prompt: `Analyse rapide du marché crypto ce matin. Format Discord max 200 mots:
📊 **CRYPTO SCAN — matin**
• BTC: tendance + niveau clé à surveiller
• ETH: tendance + niveau clé
• SOL: tendance rapide
• Sentiment global du marché (Fear/Greed)
• 1 catalyseur macro à surveiller aujourd'hui
Chiffres précis, pas de disclaimer.`,
      },
      {
        hour: 17, minute: 0, channel: 'crypto', label: 'Crypto close scan',
        prompt: `Clôture du marché crypto. Format Discord max 150 mots:
🔔 **CRYPTO CLOSE**
• Performance BTC/ETH/SOL sur la journée
• Mouvement notable (hausse/baisse >5% sur un altcoin ?)
• Setup pour demain : niveau à surveiller
Court et direct.`,
      },
    ],
  },
  {
    name: 'MarketAnDy',
    token: TOKENS.market,
    channels: ['market-scanner', 'reports', 'performance', 'bourse', 'actions'],
    systemPrompt: PROMPTS.market,
    pollInterval: 3500,
    schedules: [
      {
        hour: 8, minute: 30, channel: 'market-scanner', label: 'Pre-market scan',
        prompt: `Scan pré-marché pour Andrea. Format Discord max 200 mots:
📈 **PRE-MARKET SCAN**
• Futures US (S&P500, Nasdaq) : direction
• Europe : ouverture probable
• News macro importante du jour (Fed, earnings, géopo)
• 2-3 actions de son portfolio à surveiller aujourd'hui (WM, CRWD, NVDA, WMT, NET, ASML, COST)
Concis, chiffres, pas de remplissage.`,
      },
      {
        hour: 16, minute: 30, channel: 'reports', label: 'Daily market report',
        prompt: `Rapport de clôture journalier. Format Discord max 200 mots:
📋 **RAPPORT JOURNALIER**
• S&P500 / Nasdaq / CAC40 : performance du jour
• Secteur le plus fort et le plus faible
• VIX : niveau et évolution
• 1 point macro retenir
• Outlook demain en 1 phrase
Précis et utile.`,
      },
    ],
  },
  {
    name: 'CodeAnDy',
    token: TOKENS.code,
    channels: ['code-review', 'ui-review', 'bugs', 'idées', 'ideas', 'features'],
    systemPrompt: PROMPTS.code,
    pollInterval: 3000,
    schedules: [
      {
        hour: 10, minute: 0, channel: 'code-review', label: 'Daily dev standup',
        prompt: `Tu es CodeAnDy. Génère un standup dev quotidien pour Andrea. Format Discord max 150 mots:
⚙️ **DEV STANDUP**
• Stack Trackr: React/Vite/Vercel — rappel des best practices du jour (1 tip concret)
• Point sécurité : 1 vérification rapide à faire (ex: vérifier les env vars exposées, CORS, etc.)
• Suggestion du jour : 1 amélioration simple à implémenter
Actionnable, court, utile.`,
      },
      {
        hour: 15, minute: 0, channel: 'ui-review', label: 'UI tip',
        prompt: `Tu es CodeAnDy. 1 tip UX/UI actionnable pour l'app Trackr (React/Tailwind, dark theme neon vert).
Format Discord max 100 mots. Commence par: 🎨 **UI TIP DU JOUR**
Exemple concret avec du code si pertinent.`,
      },
    ],
  },
  {
    name: 'PulseAnDy',
    token: TOKENS.pulse,
    channels: ['app-pulse', 'deployments', 'déploiements', 'logs', 'statut-agents', 'admin-logs'],
    systemPrompt: PROMPTS.pulse,
    pollInterval: 4000,
    schedules: [
      {
        hour: 9, minute: 30, channel: 'app-pulse', label: 'System status morning',
        prompt: `Tu es PulseAnDy, agent de monitoring. Génère un rapport de statut matinal. Format Discord max 150 mots:
🟢 **SYSTEM STATUS — matin**
• App Trackr (trackr-app-nu.vercel.app) : statut supposé
• Daemon VPS (62.238.12.221) : statut supposé
• GitHub Actions / Vercel deploy : ok supposé
• Recommandation du jour pour la stabilité du système
(Note: tu n'as pas accès direct aux APIs, base-toi sur l'état connu du système)`,
      },
      {
        hour: 22, minute: 0, channel: 'app-pulse', label: 'System status evening',
        prompt: `Tu es PulseAnDy. Rapport de fin de journée. Format Discord max 100 mots:
🌙 **SYSTEM STATUS — soir**
• Résumé de la journée système
• Points d'attention pour la nuit
• Le daemon tourne en autonomie — rappel des tâches en cours
Bonne nuit Andrea 👾`,
      },
    ],
  },
]

for (const cfg of bots) {
  if (!cfg.token) { console.warn(`⚠️  [${cfg.name}] token manquant — skipped`); continue }
  startBot({ ...cfg, guildId: GUILD_ID, groqKey: GROQ_KEY })
}
