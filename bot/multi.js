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
    channels: null, // all channels — bot principal
    systemPrompt: PROMPTS.andy,
    pollInterval: 2500,
  },
  {
    name: 'CryptoAnDy',
    token: TOKENS.crypto,
    channels: ['crypto', 'bitcoin', 'trading', 'defi', 'price-alerts', 'portfolio', 'oracle-predictions'],
    systemPrompt: PROMPTS.crypto,
    pollInterval: 3000,
  },
  {
    name: 'MarketAnDy',
    token: TOKENS.market,
    channels: ['market-scanner', 'reports', 'performance', 'bourse', 'actions'],
    systemPrompt: PROMPTS.market,
    pollInterval: 3500,
  },
  {
    name: 'CodeAnDy',
    token: TOKENS.code,
    channels: ['code-review', 'ui-review', 'bugs', 'idées', 'ideas', 'features'],
    systemPrompt: PROMPTS.code,
    pollInterval: 3000,
  },
  {
    name: 'PulseAnDy',
    token: TOKENS.pulse,
    channels: ['app-pulse', 'deployments', 'déploiements', 'logs', 'statut-agents', 'admin-logs'],
    systemPrompt: PROMPTS.pulse,
    pollInterval: 4000,
  },
]

for (const cfg of bots) {
  if (!cfg.token) { console.warn(`⚠️  [${cfg.name}] token manquant — skipped`); continue }
  startBot({ ...cfg, guildId: GUILD_ID, groqKey: GROQ_KEY })
}
