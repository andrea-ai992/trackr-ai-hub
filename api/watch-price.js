// ─── Watch Price API ───────────────────────────────────────────────────────────
// Fetches live watch prices from Chrono24 and WatchCharts
// GET /api/watch-price?q=126610LN&brand=Rolex

export default async function handler(req, res) {
  const query = req.query?.q || ''
  const brand = req.query?.brand || ''

  if (!query) return res.status(400).json({ error: 'Missing q parameter' })

  // Try multiple sources in order
  const price = await fetchChrono24Price(query, brand)
    || await fetchWatchChartsPrice(query, brand)

  if (!price) return res.status(200).json({ price: null, source: null, currency: 'EUR' })

  res.status(200).json(price)
}

// ─── Chrono24 search ──────────────────────────────────────────────────────────
async function fetchChrono24Price(query, brand) {
  try {
    const q = [brand, query].filter(Boolean).join(' ').trim()
    const url = `https://www.chrono24.com/api/market-price/v1/search?query=${encodeURIComponent(q)}&language=fr&currencyId=EUR`

    const r = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json',
        Referer: 'https://www.chrono24.com/',
      },
      signal: AbortSignal.timeout(8000),
    })

    if (!r.ok) return null
    const data = await r.json()

    // Try to extract price from various possible response shapes
    const price = data?.marketPrice?.value
      || data?.priceStatistics?.median
      || data?.medianPrice
      || data?.items?.[0]?.price
      || data?.watchModels?.[0]?.averagePrice

    if (!price) return null

    return {
      price: Math.round(price),
      source: 'chrono24',
      currency: data?.currencyId || 'EUR',
      url: `https://www.chrono24.com/search/index.htm?query=${encodeURIComponent(q)}`,
    }
  } catch {
    return null
  }
}

// ─── WatchCharts fallback ─────────────────────────────────────────────────────
async function fetchWatchChartsPrice(query, brand) {
  try {
    const q = [brand, query].filter(Boolean).join(' ').trim()
    const r = await fetch(`https://watchcharts.com/api/v1/search?query=${encodeURIComponent(q)}`, {
      headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' },
      signal: AbortSignal.timeout(8000),
    })
    if (!r.ok) return null
    const data = await r.json()

    const watch = data?.results?.[0] || data?.[0]
    const price = watch?.market_price || watch?.retail_price || watch?.price

    if (!price) return null

    return {
      price: Math.round(price),
      source: 'watchcharts',
      currency: 'USD',  // WatchCharts uses USD
      url: `https://watchcharts.com/watches/search?query=${encodeURIComponent(q)}`,
    }
  } catch {
    return null
  }
}
