src/api/trading-expert.js
```javascript
// src/api/trading-expert.js
// Trading Expert API with AbortController.timeout() pattern for all fetch calls
// Mobile-first, dark theme, Inter font

const API_BASE = 'https://api.tradingexpert.io/v1';
const TIMEOUT_MS = 8000; // 8s timeout for all requests

// Helper to create abort controller with timeout
const createAbortController = () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return { controller, timeoutId };
};

// Helper to clean up timeout
const cleanupTimeout = (timeoutId) => {
  clearTimeout(timeoutId);
};

// Main Trading Expert API functions
export const fetchMarketOverview = async () => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/market/overview`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
};

export const fetchTechnicalAnalysis = async (symbol) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/analysis/technical/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Technical analysis request timed out');
    }
    throw error;
  }
};

export const fetchSentimentAnalysis = async (symbol) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/analysis/sentiment/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Sentiment analysis request timed out');
    }
    throw error;
  }
};

export const fetchTradingSignals = async (symbol, timeframe = '1d') => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/signals/${symbol}?timeframe=${timeframe}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Trading signals request timed out');
    }
    throw error;
  }
};

export const fetchPatternRecognition = async (symbol) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/patterns/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Pattern recognition request timed out');
    }
    throw error;
  }
};

export const fetchRiskAssessment = async (symbol) => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/risk/${symbol}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Risk assessment request timed out');
    }
    throw error;
  }
};

export const fetchTradingRecommendations = async (symbol, strategy = 'swing') => {
  const { controller, timeoutId } = createAbortController();

  try {
    const response = await fetch(`${API_BASE}/recommendations/${symbol}?strategy=${strategy}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      signal: controller.signal,
    });

    cleanupTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    cleanupTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Trading recommendations request timed out');
    }
    throw error;
  }
};

// Export all functions as default object for easy import
export default {
  fetchMarketOverview,
  fetchTechnicalAnalysis,
  fetchSentimentAnalysis,
  fetchTradingSignals,
  fetchPatternRecognition,
  fetchRiskAssessment,
  fetchTradingRecommendations,
};