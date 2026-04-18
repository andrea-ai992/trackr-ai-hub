Je vais créer le fichier `src/server/routes/api/trading-expert.js` avec un code complet et fonctionnel, en ajoutant `AbortSignal.timeout(5000)` sur tous les fetch() et en respectant les règles spécifiées.

```javascript
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_KEY } from '../../config.js';

const router = express.Router();
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Middleware pour gérer les erreurs
const handleError = (res, error) => {
  console.error('Trading Expert Error:', error.message);
  res.status(500).json({ error: 'Internal Server Error' });
};

// Route pour obtenir des recommandations de trading basées sur l'analyse de marché
router.get('/recommendations', async (req, res) => {
  try {
    const { signal } = req.query;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Récupérer les données de marché depuis Supabase
    const { data: marketData, error: marketError } = await supabase
      .from('market_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(10)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (marketError) throw marketError;
    if (!marketData || marketData.length === 0) {
      return res.status(404).json({ error: 'No market data available' });
    }

    // Récupérer les signaux de trading
    const { data: signals, error: signalsError } = await supabase
      .from('trading_signals')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (signalsError) throw signalsError;

    // Générer des recommandations basées sur les données
    const recommendations = generateRecommendations(marketData, signals || []);

    res.json({ recommendations });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    handleError(res, error);
  }
});

// Route pour obtenir une analyse technique d'un actif spécifique
router.get('/technical-analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { signal } = req.query;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Récupérer les données historiques de l'actif
    const { data: historicalData, error: historicalError } = await supabase
      .from('historical_data')
      .select('*')
      .eq('symbol', symbol)
      .order('date', { ascending: true })
      .limit(100)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (historicalError) throw historicalError;
    if (!historicalData || historicalData.length === 0) {
      return res.status(404).json({ error: 'No historical data available for this symbol' });
    }

    // Analyser les données
    const analysis = analyzeTechnicalData(historicalData);

    res.json({ symbol, analysis });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    handleError(res, error);
  }
});

// Route pour obtenir des insights de marché en temps réel
router.get('/market-insights', async (req, res) => {
  try {
    const { signal } = req.query;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Récupérer les données de marché en temps réel
    const { data: realtimeData, error: realtimeError } = await supabase
      .from('realtime_market_data')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(20)
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (realtimeError) throw realtimeError;
    if (!realtimeData || realtimeData.length === 0) {
      return res.status(404).json({ error: 'No realtime market data available' });
    }

    // Générer des insights
    const insights = generateMarketInsights(realtimeData);

    res.json({ insights });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    handleError(res, error);
  }
});

// Fonction pour générer des recommandations de trading
function generateRecommendations(marketData, signals) {
  const latestData = marketData[0];
  const recommendations = [];

  // Analyse de base
  if (latestData.sentiment_score > 0.6) {
    recommendations.push({
      type: 'bullish',
      confidence: latestData.sentiment_score,
      symbol: latestData.symbol,
      rationale: 'Strong positive sentiment detected',
      timestamp: latestData.timestamp
    });
  } else if (latestData.sentiment_score < 0.4) {
    recommendations.push({
      type: 'bearish',
      confidence: 1 - latestData.sentiment_score,
      symbol: latestData.symbol,
      rationale: 'Strong negative sentiment detected',
      timestamp: latestData.timestamp
    });
  }

  // Ajouter les signaux externes
  signals.forEach(signal => {
    recommendations.push({
      type: signal.signal_type,
      confidence: signal.confidence,
      symbol: signal.symbol,
      rationale: signal.rationale,
      timestamp: signal.created_at,
      source: 'external'
    });
  });

  // Trier par confiance
  return recommendations.sort((a, b) => b.confidence - a.confidence);
}

// Fonction pour analyser les données techniques
function analyzeTechnicalData(data) {
  if (data.length < 2) {
    return {
      status: 'insufficient_data',
      message: 'Not enough data points for analysis'
    };
  }

  // Calculer les métriques de base
  const closingPrices = data.map(d => d.close);
  const priceChange = ((closingPrices[closingPrices.length - 1] - closingPrices[0]) / closingPrices[0]) * 100;
  const avgVolume = data.reduce((sum, d) => sum + d.volume, 0) / data.length;

  // Déterminer la tendance
  let trend = 'neutral';
  if (priceChange > 5) trend = 'strong_uptrend';
  else if (priceChange > 2) trend = 'uptrend';
  else if (priceChange < -5) trend = 'strong_downtrend';
  else if (priceChange < -2) trend = 'downtrend';

  // Calculer le RSI simplifié
  const gains = [];
  const losses = [];
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i-1].close;
    if (change > 0) gains.push(change);
    else losses.push(Math.abs(change));
  }

  const avgGain = gains.length > 0 ? gains.reduce((a, b) => a + b, 0) / gains.length : 0;
  const avgLoss = losses.length > 0 ? losses.reduce((a, b) => a + b, 0) / losses.length : 0;
  const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));

  // Déterminer le signal RSI
  let rsiSignal = 'neutral';
  if (rsi > 70) rsiSignal = 'overbought';
  else if (rsi < 30) rsiSignal = 'oversold';

  return {
    trend,
    price_change: priceChange,
    volume: avgVolume,
    rsi: {
      value: rsi,
      signal: rsiSignal
    },
    support_resistance: {
      levels: calculateSupportResistance(data),
      strength: 'medium'
    },
    recommendation: getTechnicalRecommendation(trend, rsiSignal, priceChange)
  };
}

// Fonction pour calculer les niveaux de support et résistance
function calculateSupportResistance(data) {
  // Tri simple des prix pour trouver les zones denses
  const prices = data.map(d => d.close).sort((a, b) => a - b);
  const lowerQuartile = prices[Math.floor(prices.length * 0.25)];
  const upperQuartile = prices[Math.floor(prices.length * 0.75)];

  return {
    support: lowerQuartile,
    resistance: upperQuartile,
    pivot: (lowerQuartile + upperQuartile) / 2
  };
}

// Fonction pour générer une recommandation technique
function getTechnicalRecommendation(trend, rsiSignal, priceChange) {
  if (trend.includes('downtrend') && rsiSignal === 'oversold') {
    return {
      action: 'buy',
      confidence: 0.7,
      rationale: 'Oversold condition in downtrend suggests potential reversal'
    };
  } else if (trend.includes('uptrend') && rsiSignal === 'overbought') {
    return {
      action: 'sell',
      confidence: 0.65,
      rationale: 'Overbought condition in uptrend suggests potential pullback'
    };
  } else if (priceChange > 5) {
    return {
      action: 'hold',
      confidence: 0.5,
      rationale: 'Strong uptrend in progress, consider holding or adding to position'
    };
  } else if (priceChange < -5) {
    return {
      action: 'hold',
      confidence: 0.5,
      rationale: 'Strong downtrend in progress, consider holding or reducing exposure'
    };
  }

  return {
    action: 'wait',
    confidence: 0.4,
    rationale: 'Neutral conditions, waiting for clearer signals'
  };
}

// Route pour obtenir des données de portefeuille simulées
router.get('/portfolio-analysis', async (req, res) => {
  try {
    const { signal } = req.query;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Récupérer les données du portefeuille
    const { data: portfolioData, error: portfolioError } = await supabase
      .from('portfolio')
      .select('*')
      .abortSignal(controller.signal);

    clearTimeout(timeoutId);

    if (portfolioError) throw portfolioError;
    if (!portfolioData || portfolioData.length === 0) {
      return res.status(404).json({ error: 'No portfolio data available' });
    }

    // Calculer l'analyse du portefeuille
    const analysis = analyzePortfolio(portfolioData);

    res.json({ portfolio: portfolioData, analysis });
  } catch (error) {
    if (error.name === 'AbortError') {
      return res.status(408).json({ error: 'Request timeout' });
    }
    handleError(res, error);
  }
});

// Fonction pour analyser le portefeuille
function analyzePortfolio(portfolio) {
  let totalValue = 0;
  let totalGain = 0;
  const assetAnalysis = [];

  portfolio.forEach(asset => {
    const currentValue = asset.quantity * asset.current_price;
    const gain = currentValue - (asset.quantity * asset.entry_price);
    const gainPercent = (gain / (asset.quantity * asset.entry_price)) * 100;

    totalValue += currentValue;
    totalGain += gain;

    assetAnalysis.push({
      symbol: asset.symbol,
      quantity: asset.quantity,
      entry_price: asset.entry_price,
      current_price: asset.current_price,
      current_value: currentValue,
      gain: gain,
      gain_percent: gainPercent,
      allocation: (currentValue / totalValue) * 100
    });
  });

  const totalGainPercent = (totalGain / (totalValue - totalGain)) * 100;

  return {
    total_value: totalValue,
    total_gain: totalGain,
    total_gain_percent: totalGainPercent,
    asset_breakdown: assetAnalysis,
    risk_assessment: getPortfolioRisk(totalGainPercent),
    recommendations: generatePortfolioRecommendations(assetAnalysis, totalGainPercent)
  };
}

// Fonction pour évaluer le risque du portefeuille
function getPortfolioRisk(totalGainPercent) {
  if (totalGainPercent > 20) return 'high_risk';
  if (totalGainPercent > 10) return 'medium_risk';
  if (totalGainPercent > 0) return 'low_risk';
  if (totalGainPercent > -10) return 'conservative';
  return 'high_risk_loss';
}

// Fonction pour générer des recommandations de portefeuille
function generatePortfolioRecommendations(assets, totalGainPercent) {
  const recommendations = [];

  // Rééquilibrage si nécessaire
  const allocations = assets.map(a => a.allocation);
  const maxAllocation = Math.max(...allocations);
  const minAllocation = Math.min(...allocations);

  if (maxAllocation > 40) {
    const overAllocated = assets.find(a => a.allocation === maxAllocation);
    recommendations.push({
      type: 'rebalance',
      action: 'reduce_position',
      symbol: overAllocated.symbol,
      rationale: `Over-allocated (${overAllocated.allocation.toFixed(1)}%) - consider reducing position`
    });
  }

  // Gestion des pertes
  assets.forEach(asset => {
    if (asset.gain_percent < -15) {
      recommendations.push({
        type: 'risk_management',
        action: 'cut_losses',
        symbol: asset.symbol,
        rationale: `Significant loss (-${Math.abs(asset.gain_percent).toFixed(1)}%) - consider cutting losses`
      });
    }
  });

  // Si le portefeuille est en gain important
  if (totalGainPercent > 15) {
    recommendations.push({
      type: 'profit_taking',
      action: 'take_profits',
      rationale: 'Portfolio showing strong gains - consider taking some profits'
    });
  }

  return recommendations;
}

export default router;