Je vais créer un fichier `src/server/routes/api/signals.js` complet avec des appels fetch() sécurisés par timeout, en utilisant AbortSignal.timeout(5000) pour toutes les requêtes vers les APIs externes.

```javascript
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

const router = express.Router();
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Configuration des timeouts et endpoints
const API_TIMEOUT = 5000; // 5 secondes
const YAHOO_FINANCE_API = 'https://yfapi.net/v6/finance/quote';
const BINANCE_API = 'https://api.binance.com/api/v3';
const COINGECKO_API = 'https://api.coingecko.com/api/v3';

// Middleware pour gérer les erreurs
const handleApiError = (res, error, endpoint) => {
  console.error(`[API ERROR] ${endpoint}:`, error.message);
  res.status(503).json({
    success: false,
    error: 'Service unavailable',
    details: error.message,
    timestamp: new Date().toISOString()
  });
};

// Fonction utilitaire pour les requêtes fetch avec timeout
const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'Content-Type': 'application/json'
      }
    });

    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Middleware pour logger les requêtes
const logRequest = (req, res, next) => {
  console.log(`[${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}] ${req.method} ${req.path}`);
  next();
};

// Route pour récupérer les signaux de trading
router.get('/signals', logRequest, async (req, res) => {
  try {
    // Récupérer les signaux depuis Supabase
    const { data: signals, error } = await supabase
      .from('signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    res.json({
      success: true,
      data: signals,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, '/signals');
  }
});

// Route pour les données Yahoo Finance
router.get('/signals/yahoo/:symbol', logRequest, async (req, res) => {
  const { symbol } = req.params;

  try {
    const response = await fetchWithTimeout(`${YAHOO_FINANCE_API}?symbols=${symbol}`, {
      headers: {
        'x-api-key': process.env.YAHOO_API_KEY || 'demo'
      }
    });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      data: data.quoteResponse.result[0],
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, `/yahoo/${symbol}`);
  }
});

// Route pour les données Binance
router.get('/signals/binance/:symbol', logRequest, async (req, res) => {
  const { symbol } = req.params;

  try {
    // Récupérer les données de prix
    const priceResponse = await fetchWithTimeout(`${BINANCE_API}/ticker/price?symbol=${symbol}USDT`);

    if (!priceResponse.ok) {
      throw new Error(`Binance price API error: ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();

    // Récupérer les données de volume
    const volumeResponse = await fetchWithTimeout(`${BINANCE_API}/klines?symbol=${symbol}USDT&interval=1h&limit=24`);

    if (!volumeResponse.ok) {
      throw new Error(`Binance volume API error: ${volumeResponse.status}`);
    }

    const volumeData = await volumeResponse.json();

    res.json({
      success: true,
      price: priceData,
      volume: volumeData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, `/binance/${symbol}`);
  }
});

// Route pour les données CoinGecko
router.get('/signals/coingecko/:id', logRequest, async (req, res) => {
  const { id } = req.params;

  try {
    const response = await fetchWithTimeout(`${COINGECKO_API}/coins/${id}?localization=false&tickers=false&market_data=true&community_data=false&sparkline=false`);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    res.json({
      success: true,
      data: {
        id: data.id,
        symbol: data.symbol,
        name: data.name,
        image: data.image?.large,
        current_price: data.market_data.current_price.usd,
        price_change_percentage_24h: data.market_data.price_change_percentage_24h,
        market_cap: data.market_data.market_cap.usd,
        total_volume: data.market_data.total_volume.usd,
        circulating_supply: data.market_data.circulating_supply,
        total_supply: data.market_data.total_supply
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, `/coingecko/${id}`);
  }
});

// Route pour les signaux techniques
router.get('/signals/technical/:symbol', logRequest, async (req, res) => {
  const { symbol } = req.params;
  const { interval = '1h', period = '1d' } = req.query;

  try {
    // Récupérer les données de prix
    const priceResponse = await fetchWithTimeout(`${BINANCE_API}/klines?symbol=${symbol}USDT&interval=${interval}&limit=100`);

    if (!priceResponse.ok) {
      throw new Error(`Technical data API error: ${priceResponse.status}`);
    }

    const priceData = await priceResponse.json();

    // Calculer les indicateurs techniques simples
    const closes = priceData.map(item => parseFloat(item[4]));
    const highs = priceData.map(item => parseFloat(item[2]));
    const lows = priceData.map(item => parseFloat(item[3]));

    // Calculer RSI (simplifié)
    const calculateRSI = (prices, period = 14) => {
      let gains = 0;
      let losses = 0;

      for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
      }

      const avgGain = gains / period;
      const avgLoss = losses / period;

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    };

    // Calculer SMA
    const calculateSMA = (prices, period = 20) => {
      if (prices.length < period) return null;
      const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
      return sum / period;
    };

    const rsi = calculateRSI(closes);
    const sma20 = calculateSMA(closes, 20);
    const sma50 = calculateSMA(closes, 50);

    // Déterminer les signaux
    let signal = 'neutral';
    let recommendation = 'hold';

    if (sma20 && sma50) {
      if (sma20 > sma50) {
        signal = 'bullish';
        recommendation = 'buy';
      } else {
        signal = 'bearish';
        recommendation = 'sell';
      }
    }

    if (rsi > 70) {
      signal = 'overbought';
      recommendation = 'sell';
    } else if (rsi < 30) {
      signal = 'oversold';
      recommendation = 'buy';
    }

    res.json({
      success: true,
      symbol,
      interval,
      period,
      indicators: {
        rsi: rsi.toFixed(2),
        sma20: sma20?.toFixed(2),
        sma50: sma50?.toFixed(2),
        current_price: closes[closes.length - 1]
      },
      signal,
      recommendation,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, `/technical/${symbol}`);
  }
});

// Route pour les alertes de prix
router.get('/signals/alerts', logRequest, async (req, res) => {
  try {
    const { data: alerts, error } = await supabase
      .from('price_alerts')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Vérifier chaque alerte
    const checkedAlerts = await Promise.all(
      alerts.map(async (alert) => {
        try {
          const priceResponse = await fetchWithTimeout(`${BINANCE_API}/ticker/price?symbol=${alert.symbol}USDT`);
          if (!priceResponse.ok) return alert;

          const priceData = await priceResponse.json();
          const currentPrice = parseFloat(priceData.price);
          const targetPrice = parseFloat(alert.target_price);

          let status = 'pending';
          if (alert.alert_type === 'above' && currentPrice >= targetPrice) {
            status = 'triggered';
          } else if (alert.alert_type === 'below' && currentPrice <= targetPrice) {
            status = 'triggered';
          }

          return { ...alert, current_price: currentPrice, status };
        } catch (error) {
          console.error(`Error checking alert ${alert.id}:`, error.message);
          return { ...alert, status: 'error' };
        }
      })
    );

    res.json({
      success: true,
      data: checkedAlerts,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, '/alerts');
  }
});

// Route pour les signaux sociaux
router.get('/signals/social/:symbol', logRequest, async (req, res) => {
  const { symbol } = req.params;

  try {
    // Récupérer les données sociales depuis CoinGecko
    const response = await fetchWithTimeout(`${COINGECKO_API}/coins/${symbol.toLowerCase()}/community-data`);

    if (!response.ok) {
      throw new Error(`Social data API error: ${response.status}`);
    }

    const data = await response.json();

    res.json({
      success: true,
      data: {
        symbol,
        twitter_followers: data.twitter_followers || 0,
        reddit_subscribers: data.reddit_subscribers || 0,
        reddit_active_users: data.reddit_active_users || 0,
        community_score: data.community_score || 0,
        sentiment_votes_up_percentage: data.sentiment_votes_up_percentage || 0,
        sentiment_votes_down_percentage: data.sentiment_votes_down_percentage || 0
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    handleApiError(res, error, `/social/${symbol}`);
  }
});

export default router;