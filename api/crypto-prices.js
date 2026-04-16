export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const ids = 'bitcoin,ethereum,solana,binancecoin';
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=10&page=1&sparkline=false&price_change_percentage=24h`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TrackrApp/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({
        error: 'CoinGecko API error',
        status: response.status,
        detail: errorText
      });
    }

    const data = await response.json();

    const symbolMap = {
      bitcoin: 'BTC',
      ethereum: 'ETH',
      solana: 'SOL',
      binancecoin: 'BNB'
    };

    const result = {};

    for (const coin of data) {
      const symbol = symbolMap[coin.id];
      if (!symbol) continue;

      result[symbol] = {
        id: coin.id,
        symbol: symbol,
        name: coin.name,
        price: coin.current_price ?? null,
        change_24h: coin.price_change_percentage_24h ?? null,
        market_cap: coin.market_cap ?? null,
        volume_24h: coin.total_volume ?? null,
        image: coin.image ?? null,
        last_updated: coin.last_updated ?? null
      };
    }

    const ordered = {};
    for (const symbol of ['BTC', 'ETH', 'SOL', 'BNB']) {
      if (result[symbol]) ordered[symbol] = result[symbol];
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      source: 'coingecko',
      data: ordered
    });

  } catch (err) {
    return res.status(500).json({
      error: 'Internal server error',
      message: err.message
    });
  }
}