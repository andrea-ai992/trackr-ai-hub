// ─── Deploy Notify — Vercel Webhook → Discord #annonces ───────────────────────
// Reçoit les événements de déploiement Vercel et notifie Discord
// Setup : Vercel → Project Settings → Webhooks → ajouter l'URL de cet endpoint
// Events à cocher : deployment.succeeded, deployment.error, deployment.canceled
//
// POST /api/deploy-notify  (appelé par Vercel automatiquement)

const DISCORD_API  = 'https://discord.com/api/v10'
const BOT_TOKEN    = process.env.DISCORD_BOT_TOKEN
const ANNONCES_CH  = process.env.DISCORD_CH_ANNONCES
const WEBHOOK_SECRET = process.env.VERCEL_WEBHOOK_SECRET  // optionnel mais recommandé

async function postToDiscord(embed) {
  if (!ANNONCES_CH || !BOT_TOKEN) return
  await fetch(`${DISCORD_API}/channels/${ANNONCES_CH}/messages`, {
    method: 'POST',
    headers: { Authorization: `Bot ${BOT_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ embeds: [embed] }),
  }).catch(e => console.error('Discord post error:', e.message))
}

export default async function handler(req, res) {
  // Accepte uniquement les POST
  if (req.method !== 'POST') return res.status(405).end()

  // Vérification du secret Vercel (optionnel)
  if (WEBHOOK_SECRET) {
    const provided = req.headers['x-vercel-signature'] || req.headers['authorization']?.replace('Bearer ', '')
    if (provided !== WEBHOOK_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const body = req.body || {}
  const type = body.type || 'unknown'
  const deployment = body.payload?.deployment || body.deployment || {}
  const project    = body.payload?.project    || body.project    || {}

  const projectName  = project.name || deployment.name || 'trackr-ai-hub'
  const deployUrl    = deployment.url ? `https://${deployment.url}` : 'https://trackr-app-nu.vercel.app'
  const commitMsg    = deployment.meta?.githubCommitMessage || deployment.meta?.gitMessage || ''
  const commitRef    = deployment.meta?.githubCommitRef || 'main'
  const commitAuthor = deployment.meta?.githubCommitAuthorName || 'AnDy'
  const duration     = deployment.buildingAt
    ? Math.round((Date.now() - deployment.buildingAt) / 1000)
    : null
  const now          = new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' })

  if (type === 'deployment.succeeded' || type === 'deployment.ready') {
    await postToDiscord({
      color: 0x00c853,
      author: { name: '🚀 Trackr — Déploiement réussi' },
      title: `✅ App mise à jour — ${now}`,
      description: [
        `**L'app est maintenant à jour et disponible !**`,
        `[Ouvrir l'app](${deployUrl})`,
      ].join('\n'),
      fields: [
        { name: '📝 Commit', value: commitMsg ? commitMsg.slice(0, 120) : 'Pas de message', inline: false },
        { name: '🌿 Branche', value: commitRef, inline: true },
        { name: '👤 Auteur', value: commitAuthor, inline: true },
        ...(duration ? [{ name: '⏱ Build', value: `${duration}s`, inline: true }] : []),
        { name: '🔗 Lien direct', value: deployUrl, inline: false },
      ],
      footer: { text: `${projectName} · Vercel · Déploiement automatique` },
      timestamp: new Date().toISOString(),
    })
    return res.status(200).json({ ok: true, event: 'deployment.succeeded' })
  }

  if (type === 'deployment.error' || type === 'deployment.failed') {
    const errorMsg = deployment.errorMessage || deployment.meta?.buildError || 'Erreur de build inconnue'
    await postToDiscord({
      color: 0xff1744,
      author: { name: '❌ Trackr — Erreur de déploiement' },
      title: `🔴 Build échoué — ${now}`,
      description: `**L'app n'a PAS été mise à jour.**\n\nUne erreur s'est produite pendant le build Vercel.`,
      fields: [
        { name: '❌ Erreur', value: errorMsg.slice(0, 500), inline: false },
        { name: '📝 Commit', value: commitMsg ? commitMsg.slice(0, 120) : '?', inline: false },
        { name: '🔧 Action', value: 'Vérifie les logs sur vercel.com/dashboard', inline: false },
      ],
      footer: { text: `${projectName} · Vercel` },
      timestamp: new Date().toISOString(),
    })
    return res.status(200).json({ ok: true, event: 'deployment.error' })
  }

  if (type === 'deployment.canceled') {
    await postToDiscord({
      color: 0xffa000,
      author: { name: '⚠️ Trackr — Déploiement annulé' },
      title: `🟡 Build annulé — ${now}`,
      description: `Le déploiement a été annulé (probablement remplacé par un nouveau commit).`,
      footer: { text: `${projectName} · Vercel` },
      timestamp: new Date().toISOString(),
    })
    return res.status(200).json({ ok: true, event: 'deployment.canceled' })
  }

  // Événement inconnu — on répond 200 quand même pour ne pas bloquer Vercel
  return res.status(200).json({ ok: true, event: type, ignored: true })
}
