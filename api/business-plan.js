// ─── Business Plan AI Generator ───────────────────────────────────────────────
// POST /api/business-plan  → Generate full business plan sections with Claude
// GET  /api/business-plan?action=ideas  → Generate business ideas
// GET  /api/business-plan?action=validate&idea=...  → Quick validation

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const action = req.query?.action
    if (action === 'ideas') return generateIdeas(req, res)
    if (action === 'validate') return validateIdea(req, res)
    if (action === 'market') return marketAnalysis(req, res)
    return res.status(400).json({ error: 'Missing action' })
  }

  if (req.method === 'POST') return generatePlan(req, res)
  res.status(405).json({ error: 'Method not allowed' })
}

// ─── Full business plan generation (SSE streaming) ───────────────────────────
async function generatePlan(req, res) {
  const {
    idea = '', industry = '', target = '', budget = '',
    revenue = '', timeline = '', location = 'France',
    section = 'full', // 'full' | 'executive' | 'market' | 'financial' | 'operations'
  } = req.body || {}

  if (!idea) return res.status(400).json({ error: 'Missing idea' })

  const SECTION_PROMPTS = {
    executive: `Rédige un résumé exécutif percutant (Executive Summary) pour ce business:`,
    market: `Rédige une analyse de marché détaillée pour ce business:`,
    financial: `Crée des projections financières réalistes sur 3 ans pour ce business:`,
    operations: `Décris le plan opérationnel et go-to-market pour ce business:`,
    full: `Crée un business plan complet et professionnel pour ce business:`,
  }

  const context = `
Idée: ${idea}
Secteur: ${industry || 'À définir'}
Cible client: ${target || 'À définir'}
Budget de démarrage: ${budget || 'À définir'}
Modèle de revenus: ${revenue || 'À définir'}
Horizon: ${timeline || '12-24 mois'}
Localisation: ${location}
`

  const sectionInstruction = SECTION_PROMPTS[section] || SECTION_PROMPTS.full

  const FULL_PLAN_PROMPT = section === 'full' ? `
${sectionInstruction}
${context}

Structure le business plan avec ces sections (utilise des titres markdown ##):
## 1. Résumé Exécutif
## 2. Le Problème & La Solution
## 3. Analyse de Marché (TAM/SAM/SOM, concurrents)
## 4. Produit/Service (différenciateurs clés)
## 5. Go-to-Market (acquisition clients, canaux)
## 6. Modèle Financier (coûts, revenus, seuil de rentabilité, projections 3 ans)
## 7. Équipe & Organisation
## 8. Risques & Mitigation
## 9. Plan d'Action 90 jours

Sois concret, avec des chiffres réalistes. Mentionne des acteurs français du marché quand pertinent.
` : `
${sectionInstruction}
${context}

Sois concret, chiffré et actionnable. Format markdown. Max 500 mots.
`

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-beta': 'interleaved-thinking-2025-05-14',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: section === 'full' ? 4000 : 1500,
        stream: true,
        thinking: section === 'full' ? { type: 'enabled', budget_tokens: 2000 } : undefined,
        messages: [{ role: 'user', content: FULL_PLAN_PROMPT }],
        system: `Tu es un expert en création d'entreprise, investissement et business development. Tu as aidé à lancer des dizaines d'entreprises en France et en Europe. Tu es direct, pragmatique et tu donnes des conseils concrets avec des chiffres réalistes.`,
      }),
      signal: AbortSignal.timeout(90000),
    })

    if (!r.ok) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: `Claude error ${r.status}` })}\n\n`)
      return res.end()
    }

    const reader = r.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const lines = buf.split('\n'); buf = lines.pop()

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        try {
          const ev = JSON.parse(line.slice(6))
          if (ev.type === 'content_block_delta') {
            const delta = ev.delta
            if (delta.type === 'text_delta') {
              res.write(`data: ${JSON.stringify({ type: 'token', text: delta.text })}\n\n`)
            }
            // Skip thinking blocks
          }
          if (ev.type === 'message_stop') {
            res.write(`data: ${JSON.stringify({ type: 'done' })}\n\n`)
          }
        } catch {}
      }
    }
  } catch (e) {
    res.write(`data: ${JSON.stringify({ type: 'error', message: e.message })}\n\n`)
  }

  res.end()
}

// ─── Business idea generator ──────────────────────────────────────────────────
async function generateIdeas(req, res) {
  const skills = req.query?.skills || ''
  const budget = req.query?.budget || '10000'
  const interests = req.query?.interests || ''
  const risk = req.query?.risk || 'medium' // low | medium | high

  const prompt = `Tu es un expert business. Génère 5 idées de business concrètes et rentables pour 2025:

Profil:
- Compétences: ${skills || 'polyvalent'}
- Budget disponible: ${budget}€
- Intérêts: ${interests || 'finance, tech, investissement'}
- Tolérance au risque: ${risk === 'low' ? 'faible (revenus stables)' : risk === 'high' ? 'élevée (forte croissance)' : 'moyenne'}

Pour chaque idée, donne:
1. **Nom & concept** (1 phrase)
2. **Investissement initial** (€)
3. **Revenu potentiel** (mensuel en 12 mois)
4. **Temps pour breakeven**
5. **Pourquoi maintenant** (tendance de marché)

Format JSON array avec les clés: name, concept, investment, monthlyRevenue, breakeven, why, risk (low/medium/high)`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(20000),
    })

    const d = await r.json()
    const text = d.content?.[0]?.text || '[]'

    // Extract JSON from response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    const ideas = jsonMatch ? JSON.parse(jsonMatch[0]) : []

    res.status(200).json({ ideas })
  } catch (e) {
    res.status(500).json({ error: e.message, ideas: [] })
  }
}

// ─── Quick idea validation ────────────────────────────────────────────────────
async function validateIdea(req, res) {
  const idea = req.query?.idea || ''
  if (!idea) return res.status(400).json({ error: 'Missing idea' })

  const prompt = `Valide rapidement cette idée business en 60 secondes de lecture:

IDÉE: ${idea}

Réponds en JSON avec:
{
  "score": 0-10,
  "verdict": "FORT|MOYEN|FAIBLE",
  "pros": ["...", "...", "..."],
  "cons": ["...", "...", "..."],
  "biggest_risk": "...",
  "key_success_factor": "...",
  "recommended_action": "Lancer | Pivoter | Abandonner",
  "alternative": "suggestion si verdict négatif"
}`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    })

    const d = await r.json()
    const text = d.content?.[0]?.text || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : {}

    res.status(200).json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

// ─── Market analysis ──────────────────────────────────────────────────────────
async function marketAnalysis(req, res) {
  const industry = req.query?.industry || ''
  if (!industry) return res.status(400).json({ error: 'Missing industry' })

  const prompt = `Analyse rapide du marché français/européen pour: ${industry}

Réponds en JSON:
{
  "marketSize": "TAM en €",
  "growth": "% croissance annuelle",
  "mainPlayers": ["acteur1", "acteur2", "acteur3"],
  "entryBarriers": "faibles|moyennes|élevées",
  "trends": ["tendance1", "tendance2"],
  "opportunity": "description de l'opportunité principale",
  "recommendation": "conseil d'entrée sur ce marché"
}`

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    })

    const d = await r.json()
    const text = d.content?.[0]?.text || '{}'
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    res.status(200).json(jsonMatch ? JSON.parse(jsonMatch[0]) : {})
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}
