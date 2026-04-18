src/api/markets.js
```javascript
// src/api/markets.js
// Endpoints: /stocks/live, /crypto/live
// Mobile-first, dark theme, Inter font
// CSS vars: --green #00ff88, --bg #080808, --bg2 #111, --t1 #f0f0f0, --t2 #888, --t3 #444, --border rgba(255,255,255,0.07)

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000/api';
const TIMEOUT_MS = 8000; // 8s timeout pour éviter les hangs

// AbortController générique pour tous les appels fetch
const createAbortController = () => {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), TIMEOUT_MS);
  return controller;
};

// Type pour les données de marché
export const MarketData = {
  stocks: 'stocks',
  crypto: 'crypto'
};

// Type pour les données live
export const LiveData = {
  stocks: 'stocks/live',
  crypto: 'crypto/live'
};

// Type pour les erreurs
export const MarketError = {
  TIMEOUT: 'TIMEOUT',
  NETWORK: 'NETWORK',
  PARSE: 'PARSE',
  UNKNOWN: 'UNKNOWN'
};

// Type pour les données de réponse
export const MarketResponse = {
  data: null,
  error: null,
  timestamp: null
};

// Fonction générique pour fetch avec timeout et gestion d'erreur
const fetchWithTimeout = async (endpoint, options = {}) => {
  const controller = createAbortController();
  const { signal, ...fetchOptions } = options;
  const mergedOptions = {
    ...fetchOptions,
    signal: controller.signal,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers
    }
  };

  try {
    const response = await fetch(`${API_BASE}/${endpoint}`, mergedOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(MarketError.TIMEOUT);
    }
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error(MarketError.NETWORK);
    }
    if (error instanceof SyntaxError) {
      throw new Error(MarketError.PARSE);
    }
    throw new Error(MarketError.UNKNOWN);
  }
};

// Fonction pour récupérer les données live des stocks
export const fetchStocksLive = async () => {
  try {
    const data = await fetchWithTimeout(LiveData.stocks);
    return { data, error: null, timestamp: Date.now() };
  } catch (error) {
    return { data: null, error: error.message, timestamp: null };
  }
};

// Fonction pour récupérer les données live des cryptos
export const fetchCryptoLive = async () => {
  try {
    const data = await fetchWithTimeout(LiveData.crypto);
    return { data, error: null, timestamp: Date.now() };
  } catch (error) {
    return { data: null, error: error.message, timestamp: null };
  }
};

// Fonction pour récupérer les données historiques des stocks (si besoin)
export const fetchStocksHistory = async (symbol, period = '1d') => {
  try {
    const data = await fetchWithTimeout(`stocks/history?symbol=${symbol}&period=${period}`);
    return { data, error: null, timestamp: Date.now() };
  } catch (error) {
    return { data: null, error: error.message, timestamp: null };
  }
};

// Fonction pour récupérer les données historiques des cryptos (si besoin)
export const fetchCryptoHistory = async (symbol, period = '1d') => {
  try {
    const data = await fetchWithTimeout(`crypto/history?symbol=${symbol}&period=${period}`);
    return { data, error: null, timestamp: null };
  } catch (error) {
    return { data: null, error: error.message, timestamp: null };
  }
};

// Export des types pour utilisation dans les composants
export const MarketTypes = {
  MarketData,
  LiveData,
  MarketError,
  MarketResponse
};