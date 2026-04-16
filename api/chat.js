// ─── /api/chat — Fast Discord chat endpoint ───────────────────────────────────
// Uses Claude Haiku, returns JSON (no SSE), no tool overhead
// Designed for sub-5s total response time
// POST { message, channelName, mode, systemNote }

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const APP_URL = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

const BASE_SYSTEM = `Tu es AnDy, l'IA personnelle d'Andrea. Tu réponds dans Discord.

Règles absolues:
- Réponse COURTE: max 3-4 paragraphes ou bullets. Discord n'est pas un doc Word.
- Directement utile: pas d'intro, pas de "Bien sûr je vais...", vas droit au but.
- Langue: français sauf si on te parle anglais.
- Tu réponds à TOUT: finance, crypto, immobilier, business, vie quotidienne, questions random, faits en live.
- Si tu ne sais pas quelque chose de récent, dis-le clairement en une phrase.`

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' })

  const { message = '', channelName = '', mode = 'default', systemNote = '' } = req.body || {}
  if (!message) return res.status(400).json({ error: 'Missing message' })
  if (!ANTHROPIC_API_KEY) return res.status(500).json({ error: 'No API key' })

  const CHANNEL_CONTEXT = {
    crypto: `\nContexte: channel #crypto — finance/trading. Sois analytique et chiffré.`,
    trading: `\nContexte: channel #trading — focus marchés. Donne des infos concrètes.`,
    portfolio: `\nContexte: channel #portfolio — P&L et positions. Parle finance.`,
    'real-estate': `\nContexte: immobilier — parle rendements, prix marché, cashflow.`,
    business: `\nContexte: business — parle stratégie, chiffres, go-to-market.`,
  }

  const channelCtx = CHANNEL_CONTEXT[channelName?.toLowerCase()] || `\nChannel: #${channelName || 'discord'}`

  const modePrefix = {
    think: `DEEP THINKING MODE: Raisonne étape par étape, montre ton analyse avant de conclure.\n`,
    web: `RECHERCHE MODE: L'user veut des infos récentes. Sois précis sur ce que tu sais vs ce qui pourrait avoir changé.\n`,
  }[mode] || ''

  const systemPrompt = systemNote || (modePrefix + BASE_SYSTEM + channelCtx)

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: mode === 'think' ? 'claude-sonnet-4-6' : 'claude-haiku-4-5-20251001',
        max_tokens: mode === 'think' ? 2000 : 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: message }],
      }),
      signal: AbortSignal.timeout(mode === 'think' ? 55000 : 9000),
    })

    if (!r.ok) {
      const err = await r.text()
      return res.status(200).json({ reply: `❌ Erreur Claude (${r.status})`, error: err })
    }

    const d = await r.json()
    const reply = d.content?.[0]?.text?.trim() || null

    res.status(200).json({
      reply: reply?.slice(0, 1950),
      model: d.model,
      tokens: d.usage?.output_tokens,
    })
  } catch (e) {
    const isTimeout = e.name === 'TimeoutError' || e.name === 'AbortError'
    res.status(200).json({
      reply: isTimeout
        ? '⏱️ Timeout — essaie avec moins de contexte ou `!think` pour une réponse plus longue.'
        : `❌ Erreur: ${e.message}`,
    })
  }
}
