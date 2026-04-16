// ─── Real Estate Intelligence API ────────────────────────────────────────────
// Market prices, rental yield, ROI, mortgage calculator
// GET /api/real-estate?action=price&city=Paris&arrondissement=75011
// GET /api/real-estate?action=analyze&address=...&price=...&rent=...
// POST /api/real-estate  → AI analysis with Claude

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
const APP_URL = process.env.APP_URL || 'https://trackr-app-nu.vercel.app'

export default async function handler(req, res) {
  const action = req.query?.action || (req.method === 'POST' ? 'analyze' : 'price')

  if (action === 'price') return handlePrice(req, res)
  if (action === 'analyze') return handleAnalyze(req, res)
  if (action === 'mortgage') return handleMortgage(req, res)
  if (action === 'trends') return handleTrends(req, res)

  res.status(400).json({ error: 'Unknown action' })
}

// ─── Market price per m² from MeilleursAgents ────────────────────────────────
async function handlePrice(req, res) {
  const city = req.query?.city || 'Paris'
  const cp = req.query?.cp || ''
  const type = req.query?.type || 'apartment' // apartment | house

  try {
    // MeilleursAgents public price data
    const url = `https://www.meilleursagents.com/prix-immobilier/${encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'))}-${cp}/`

    // Try DVF (Demandes de Valeurs Foncières) open data — government open data
    const dvfData = await fetchDVFPrice(city, cp)

    // Try MeilleursAgents estimator API
    const maData = await fetchMAPrice(city, cp, type)

    const result = maData || dvfData

    if (!result) {
      return res.status(200).json({
        city, cp, type,
        avgPriceM2: null,
        source: null,
        url: `https://www.meilleursagents.com/prix-immobilier/`,
        note: 'Prix non disponible — consultez directement MeilleursAgents',
      })
    }

    res.status(200).json(result)
  } catch (e) {
    res.status(200).json({ error: e.message, city, avgPriceM2: null })
  }
}

async function fetchDVFPrice(city, cp) {
  try {
    // DVF API — transactions immobilières françaises (open data)
    const codeCommune = cp || ''
    const url = `https://api.data.gouv.fr/api/1/datasets/5c4ae55a634f4117716d5656/` // DVF dataset
    // Use the DVF search endpoint
    const searchUrl = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(city)}&limit=1`
    const r = await fetch(searchUrl, { signal: AbortSignal.timeout(5000) })
    if (!r.ok) return null
    const d = await r.json()
    const feature = d.features?.[0]
    if (!feature) return null

    // Get price from Etalab DVF
    const inseeCode = feature.properties?.citycode
    if (!inseeCode) return null

    const dvfUrl = `https://api.cquest.org/dvf?code_commune=${inseeCode}&nature_mutation=Vente`
    const dvfR = await fetch(dvfUrl, { signal: AbortSignal.timeout(8000) })
    if (!dvfR.ok) return null
    const dvfData = await dvfR.json()

    const transactions = dvfData.resultats || []
    if (transactions.length === 0) return null

    // Filter apartments, compute median price/m²
    const prices = transactions
      .filter(t => t.surface_reelle_bati > 0 && t.valeur_fonciere > 0)
      .map(t => t.valeur_fonciere / t.surface_reelle_bati)
      .filter(p => p > 1000 && p < 30000)
      .sort((a, b) => a - b)

    if (prices.length === 0) return null

    const median = prices[Math.floor(prices.length / 2)]

    return {
      city, cp,
      avgPriceM2: Math.round(median),
      source: 'DVF (Données gouvernementales)',
      sampleSize: prices.length,
      min: Math.round(prices[0]),
      max: Math.round(prices[prices.length - 1]),
    }
  } catch {
    return null
  }
}

async function fetchMAPrice(city, cp, type) {
  try {
    // MeilleursAgents has a public JSON endpoint
    const slug = city.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
    const url = `https://www.meilleursagents.com/prix-immobilier/${slug}-${cp || '75000'}/json/`

    const r = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      signal: AbortSignal.timeout(6000),
    })
    if (!r.ok) return null
    const d = await r.json()

    const apt = d?.apartment || d?.appartement
    const house = d?.house || d?.maison
    const data = type === 'house' ? house : apt

    if (!data?.price_m2) return null

    return {
      city, cp, type,
      avgPriceM2: Math.round(data.price_m2),
      min: data.price_m2_low ? Math.round(data.price_m2_low) : null,
      max: data.price_m2_high ? Math.round(data.price_m2_high) : null,
      trend1y: data.evolution_1y || null,
      source: 'MeilleursAgents',
    }
  } catch {
    return null
  }
}

// ─── AI-powered property analysis ────────────────────────────────────────────
async function handleAnalyze(req, res) {
  const body = req.method === 'POST' ? req.body : req.query

  const {
    city = 'Paris', price = 0, surface = 0, rent = 0,
    charges = 0, taxeFonciere = 0, travaux = 0,
    loanAmount = 0, loanRate = 2.5, loanDuration = 20,
    type = 'apartment', floors = '', description = '',
  } = body

  const priceNum = parseFloat(price) || 0
  const surfaceNum = parseFloat(surface) || 1
  const rentNum = parseFloat(rent) || 0
  const chargesNum = parseFloat(charges) || 0
  const taxeNum = parseFloat(taxeFonciere) || 0

  // Core calculations
  const priceM2 = surfaceNum > 0 ? Math.round(priceNum / surfaceNum) : 0
  const annualRent = rentNum * 12
  const annualCharges = chargesNum * 12 + taxeNum
  const netRent = annualRent - annualCharges
  const grossYield = priceNum > 0 ? ((annualRent / priceNum) * 100).toFixed(2) : 0
  const netYield = priceNum > 0 ? ((netRent / (priceNum + parseFloat(travaux || 0))) * 100).toFixed(2) : 0

  // Mortgage
  let monthlyPayment = 0, totalCost = 0, totalInterest = 0
  if (loanAmount > 0 && loanRate > 0) {
    const r = parseFloat(loanRate) / 100 / 12
    const n = parseInt(loanDuration) * 12
    monthlyPayment = Math.round(loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1))
    totalCost = monthlyPayment * n
    totalInterest = totalCost - loanAmount
  }

  const cashflow = rentNum - monthlyPayment - chargesNum - (taxeNum / 12)

  const analysis = {
    priceM2, grossYield, netYield,
    annualRent, annualCharges, netRent,
    monthlyPayment, totalInterest, cashflow: Math.round(cashflow),
  }

  // AI analysis (optional, fire if ANTHROPIC key available)
  let aiAnalysis = null
  if (ANTHROPIC_API_KEY && priceNum > 0) {
    aiAnalysis = await getAIPropertyAnalysis({ city, priceNum, surfaceNum, priceM2, rentNum, grossYield, netYield, cashflow, description, type })
  }

  res.status(200).json({ analysis, aiAnalysis })
}

async function getAIPropertyAnalysis({ city, priceNum, surfaceNum, priceM2, rentNum, grossYield, netYield, cashflow, description, type }) {
  try {
    const prompt = `Tu es un expert immobilier français. Analyse ce bien d'investissement de façon concise et directe:

BIEN: ${type === 'apartment' ? 'Appartement' : 'Maison'} à ${city}
- Prix: ${priceNum.toLocaleString('fr-FR')}€ (${priceM2.toLocaleString('fr-FR')}€/m²)
- Surface: ${surfaceNum}m²
- Loyer mensuel: ${rentNum}€
- Rendement brut: ${grossYield}%
- Rendement net: ${netYield}%
- Cashflow mensuel: ${cashflow}€
${description ? `- Description: ${description}` : ''}

Donne en 3-4 points:
1. Verdict rapide (bon/moyen/mauvais investissement et pourquoi)
2. Le principal risque
3. Le principal avantage
4. Recommandation action (acheter / négocier / passer)

Sois direct, pas de blabla. Max 200 mots.`

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
      signal: AbortSignal.timeout(15000),
    })
    if (!r.ok) return null
    const d = await r.json()
    return d.content?.[0]?.text || null
  } catch {
    return null
  }
}

// ─── Mortgage calculator ──────────────────────────────────────────────────────
async function handleMortgage(req, res) {
  const amount = parseFloat(req.query?.amount || 0)
  const rate = parseFloat(req.query?.rate || 3.5)
  const duration = parseInt(req.query?.duration || 20)

  if (!amount) return res.status(400).json({ error: 'Missing amount' })

  const r = rate / 100 / 12
  const n = duration * 12
  const monthly = Math.round(amount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1))
  const total = monthly * n
  const interest = total - amount

  res.status(200).json({ monthly, total, interest, amount, rate, duration })
}

// ─── Price trends ─────────────────────────────────────────────────────────────
async function handleTrends(req, res) {
  const city = req.query?.city || 'Paris'
  // Return curated market data for major French cities
  const MARKET_DATA = {
    paris: { avgM2: 9800, trend1y: -3.2, trend3y: +8.1, avgRent: 32, grossYield: 3.9 },
    lyon: { avgM2: 4500, trend1y: -2.1, trend3y: +12.4, avgRent: 14, grossYield: 3.7 },
    bordeaux: { avgM2: 4100, trend1y: -4.8, trend3y: +15.2, avgRent: 13, grossYield: 3.8 },
    marseille: { avgM2: 2800, trend1y: +1.2, trend3y: +10.5, avgRent: 12, grossYield: 5.1 },
    nice: { avgM2: 5100, trend1y: -1.5, trend3y: +9.8, avgRent: 17, grossYield: 4.0 },
    nantes: { avgM2: 3500, trend1y: -5.1, trend3y: +18.2, avgRent: 12, grossYield: 4.1 },
    toulouse: { avgM2: 3200, trend1y: -2.3, trend3y: +14.6, avgRent: 11, grossYield: 4.1 },
    strasbourg: { avgM2: 3400, trend1y: -1.8, trend3y: +11.3, avgRent: 12, grossYield: 4.2 },
    montpellier: { avgM2: 3300, trend1y: -3.1, trend3y: +16.7, avgRent: 12, grossYield: 4.4 },
    rennes: { avgM2: 3800, trend1y: -4.2, trend3y: +20.1, avgRent: 13, grossYield: 4.1 },
  }

  const key = city.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').split(' ')[0]
  const data = MARKET_DATA[key]

  res.status(200).json({
    city,
    data: data || null,
    allCities: Object.entries(MARKET_DATA).map(([k, v]) => ({ city: k, ...v })),
  })
}
