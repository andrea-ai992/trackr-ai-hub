Je vais implémenter `useAbortableFetch` et créer `src/services/brain.js` selon les spécifications.

```javascript
// src/hooks/useAbortableFetch.js
import { useEffect, useRef } from 'react';

export const useAbortableFetch = () => {
  const abortControllerRef = useRef(null);

  const fetchData = async (url, options = {}, timeout = 10000) => {
    // Abort previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new AbortController with timeout
    abortControllerRef.current = new AbortController();
    const { signal } = abortControllerRef.current;

    // Add timeout signal
    const timeoutSignal = AbortSignal.timeout(timeout);
    const combinedSignal = new AbortController();
    const combinedSignalAbort = () => combinedSignal.abort();

    signal.addEventListener('abort', combinedSignalAbort);
    timeoutSignal.addEventListener('abort', combinedSignalAbort);

    try {
      const response = await fetch(url, {
        ...options,
        signal: combinedSignal.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.warn('Request aborted:', error.message);
        return null;
      }
      throw error;
    } finally {
      signal.removeEventListener('abort', combinedSignalAbort);
      timeoutSignal.removeEventListener('abort', combinedSignalAbort);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { fetchData };
};
```

```javascript
// src/services/brain.js
import { useAbortableFetch } from '../hooks/useAbortableFetch';

export const BrainService = () => {
  const { fetchData } = useAbortableFetch();

  const analyzeMarketTrends = async (symbol, timeframe = '1d', limit = 100) => {
    try {
      const response = await fetchData(
        `https://api.marketdata.app/v1/stocks/quotes/${symbol}/?timeframe=${timeframe}&limit=${limit}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_MARKETDATA_API_KEY}`,
          },
        },
        8000
      );

      if (!response) return null;

      // Basic trend analysis
      const prices = response.map(item => item.close);
      const changes = prices.slice(1).map((price, i) => ({
        value: price,
        change: ((price - prices[i]) / prices[i]) * 100,
        timestamp: response[i+1].timestamp,
      }));

      // Calculate moving averages
      const sma7 = calculateSMA(prices, 7);
      const sma21 = calculateSMA(prices, 21);
      const sma50 = calculateSMA(prices, 50);

      return {
        symbol,
        timeframe,
        prices,
        changes,
        sma7,
        sma21,
        sma50,
        trend: determineTrend(sma7, sma21, sma50),
        support: findSupportLevels(prices),
        resistance: findResistanceLevels(prices),
      };
    } catch (error) {
      console.error('Market trend analysis failed:', error);
      return null;
    }
  };

  const analyzePortfolio = async (portfolioData) => {
    try {
      const results = await Promise.all(
        portfolioData.map(async (asset) => {
          const trend = await analyzeMarketTrends(asset.symbol, '1d');
          return {
            ...asset,
            ...trend,
            currentPrice: asset.currentPrice,
            allocation: asset.allocation,
            value: asset.currentPrice * asset.quantity,
          };
        })
      );

      const totalValue = results.reduce((sum, asset) => sum + asset.value, 0);
      const totalAllocation = results.reduce((sum, asset) => sum + asset.allocation, 0);

      return {
        assets: results,
        totalValue,
        totalAllocation,
        riskLevel: calculateRiskLevel(results),
        recommendations: generateRecommendations(results),
      };
    } catch (error) {
      console.error('Portfolio analysis failed:', error);
      return null;
    }
  };

  const analyzeTradingSignal = async (signalData) => {
    try {
      const { symbol, entryPrice, stopLoss, takeProfit, strategy } = signalData;
      const trend = await analyzeMarketTrends(symbol, '1h', 50);

      if (!trend) return null;

      const currentPrice = trend.prices[trend.prices.length - 1];
      const rsi = calculateRSI(trend.prices);
      const macd = calculateMACD(trend.prices);

      const isValid = validateSignal(
        currentPrice,
        entryPrice,
        stopLoss,
        takeProfit,
        strategy,
        rsi,
        macd,
        trend.trend
      );

      return {
        symbol,
        currentPrice,
        entryPrice,
        stopLoss,
        takeProfit,
        strategy,
        trend: trend.trend,
        rsi,
        macd,
        isValid,
        riskRewardRatio: calculateRiskReward(entryPrice, stopLoss, takeProfit),
        confidence: calculateConfidence(isValid, rsi, macd),
      };
    } catch (error) {
      console.error('Signal analysis failed:', error);
      return null;
    }
  };

  // Helper functions
  const calculateSMA = (prices, period) => {
    const sma = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      sma.push(sum / period);
    }
    return sma;
  };

  const calculateRSI = (prices, period = 14) => {
    const gains = [];
    const losses = [];

    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1];
      if (change > 0) {
        gains.push(change);
        losses.push(0);
      } else {
        gains.push(0);
        losses.push(Math.abs(change));
      }
    }

    const avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
    const avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

    let rs = avgGain / avgLoss;
    const rsi = [];

    for (let i = period; i < prices.length; i++) {
      const currentGain = gains[i];
      const currentLoss = losses[i];

      const newAvgGain = ((avgGain * (period - 1)) + currentGain) / period;
      const newAvgLoss = ((avgLoss * (period - 1)) + currentLoss) / period;

      rs = newAvgGain / newAvgLoss;
      rsi.push(100 - (100 / (1 + rs)));

      avgGain = newAvgGain;
      avgLoss = newAvgLoss;
    }

    return rsi;
  };

  const calculateMACD = (prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) => {
    const emaFast = calculateEMA(prices, fastPeriod);
    const emaSlow = calculateEMA(prices, slowPeriod);

    const macdLine = emaFast.map((val, i) => val - emaSlow[i]);

    const signalLine = calculateEMA(macdLine.slice(slowPeriod - fastPeriod), signalPeriod);
    signalLine.unshift(...Array(slowPeriod - fastPeriod).fill(null));

    const histogram = macdLine.map((val, i) =>
      val && signalLine[i] ? val - signalLine[i] : null
    );

    return { macdLine, signalLine, histogram };
  };

  const calculateEMA = (prices, period) => {
    const ema = [];
    const multiplier = 2 / (period + 1);

    const firstEMA = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;
    ema.push(firstEMA);

    for (let i = period; i < prices.length; i++) {
      const currentPrice = prices[i];
      const prevEMA = ema[ema.length - 1];
      const newEMA = (currentPrice - prevEMA) * multiplier + prevEMA;
      ema.push(newEMA);
    }

    return ema;
  };

  const determineTrend = (sma7, sma21, sma50) => {
    if (!sma7.length || !sma21.length || !sma50.length) return 'neutral';

    const last7 = sma7[sma7.length - 1];
    const last21 = sma21[sma21.length - 1];
    const last50 = sma50[sma50.length - 1];

    if (last7 > last21 && last21 > last50) return 'bullish';
    if (last7 < last21 && last21 < last50) return 'bearish';
    return 'neutral';
  };

  const findSupportLevels = (prices) => {
    const levels = [];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;

    // Simple support levels at 25%, 50%, 75% of range
    levels.push(minPrice + range * 0.25);
    levels.push(minPrice + range * 0.5);
    levels.push(minPrice + range * 0.75);

    return levels;
  };

  const findResistanceLevels = (prices) => {
    const levels = [];
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice;

    // Simple resistance levels at 25%, 50%, 75% of range
    levels.push(maxPrice - range * 0.25);
    levels.push(maxPrice - range * 0.5);
    levels.push(maxPrice - range * 0.75);

    return levels;
  };

  const validateSignal = (currentPrice, entryPrice, stopLoss, takeProfit, strategy, rsi, macd, trend) => {
    // Basic validation - can be enhanced with more sophisticated logic
    const priceValid = currentPrice > 0;
    const entryValid = entryPrice > 0;
    const stopValid = stopLoss > 0 && stopLoss < entryPrice;
    const profitValid = takeProfit > entryPrice;

    const rsiValid = rsi && rsi[rsi.length - 1] > 0 && rsi[rsi.length - 1] < 100;
    const macdValid = macd && macd.macdLine && macd.macdLine.length > 0;

    return priceValid && entryValid && stopValid && profitValid && rsiValid && macdValid;
  };

  const calculateRiskReward = (entryPrice, stopLoss, takeProfit) => {
    const risk = entryPrice - stopLoss;
    const reward = takeProfit - entryPrice;
    return reward / risk;
  };

  const calculateConfidence = (isValid, rsi, macd) => {
    let confidence = 0;

    if (isValid) confidence += 30;
    if (rsi && rsi[rsi.length - 1] < 30) confidence += 20;
    if (rsi && rsi[rsi.length - 1] > 70) confidence += 20;
    if (macd && macd.macdLine && macd.macdLine.length > 0) {
      const lastMACD = macd.macdLine[macd.macdLine.length - 1];
      const lastSignal = macd.signalLine[macd.signalLine.length - 1];
      if (lastMACD > lastSignal) confidence += 20;
    }

    return Math.min(100, Math.max(0, confidence));
  };

  const generateRecommendations = (portfolio) => {
    const recommendations = [];

    portfolio.assets.forEach(asset => {
      if (asset.trend === 'bearish') {
        recommendations.push({
          asset: asset.symbol,
          type: 'warning',
          message: `Asset ${asset.symbol} is in a bearish trend. Consider reducing exposure.`,
          action: 'reduce',
        });
      }

      if (asset.allocation > 0.15) {
        recommendations.push({
          asset: asset.symbol,
          type: 'info',
          message: `Asset ${asset.symbol} has high allocation (${(asset.allocation * 100).toFixed(1)}%). Consider rebalancing.`,
          action: 'rebalance',
        });
      }

      if (asset.rsi && asset.rsi[asset.rsi.length - 1] > 70) {
        recommendations.push({
          asset: asset.symbol,
          type: 'danger',
          message: `Asset ${asset.symbol} RSI is overbought (${asset.rsi[asset.rsi.length - 1].toFixed(1)}). Consider taking profits.`,
          action: 'take-profit',
        });
      }

      if (asset.rsi && asset.rsi[asset.rsi.length - 1] < 30) {
        recommendations.push({
          asset: asset.symbol,
          type: 'success',
          message: `Asset ${asset.symbol} RSI is oversold (${asset.rsi[asset.rsi.length - 1].toFixed(1)}). Consider adding to position.`,
          action: 'add',
        });
      }
    });

    return recommendations;
  };

  const calculateRiskLevel = (assets) => {
    const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
    let riskScore = 0;

    assets.forEach(asset => {
      if (asset.trend === 'bearish') riskScore += 25;
      if (asset.allocation > 0.2) riskScore += 20;
      if (asset.value / totalValue > 0.3) riskScore += 15;
    });

    if (riskScore > 70) return 'high';
    if (riskScore > 40) return 'medium';
    return 'low';
  };

  return {
    analyzeMarketTrends,
    analyzePortfolio,
    analyzeTradingSignal,
  };
};