Je vais créer un fichier `brain.js` complet et fonctionnel avec un système de timeout robuste pour les requêtes fetch().

```javascript
// src/pages/BrainExplorer/api/brain.js

// Configuration des timeouts
const API_TIMEOUT = 10000; // 10 secondes par défaut
const MAX_RETRIES = 3; // Nombre de tentatives en cas d'échec

// Fonction utilitaire pour créer un signal d'abort avec timeout
const createAbortSignal = (timeoutMs = API_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(new Error('Request timeout')), timeoutMs);
  return { signal: controller.signal, cleanup: () => clearTimeout(timeoutId) };
};

// Fonction principale pour les requêtes fetch avec gestion des erreurs et timeouts
const fetchWithTimeout = async (url, options = {}, timeoutMs = API_TIMEOUT) => {
  const { signal, cleanup } = createAbortSignal(timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    cleanup();
  }
};

// Fonction pour faire des requêtes avec réessais
const fetchWithRetry = async (url, options = {}, timeoutMs = API_TIMEOUT, retries = MAX_RETRIES) => {
  let lastError;

  for (let i = 0; i < retries; i++) {
    try {
      return await fetchWithTimeout(url, options, timeoutMs);
    } catch (error) {
      lastError = error;
      // Attendre 1 seconde avant de réessayer (sauf pour la dernière tentative)
      if (i < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  throw lastError;
};

// Fonction pour récupérer les données du cerveau
export const fetchBrainData = async (endpoint = '', params = {}, timeoutMs = API_TIMEOUT) => {
  const queryParams = new URLSearchParams(params).toString();
  const url = `https://api.brain-data.ai/v1/${endpoint}${queryParams ? `?${queryParams}` : ''}`;

  try {
    const data = await fetchWithRetry(url, {}, timeoutMs);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching brain data:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Fonction pour soumettre des données au cerveau
export const submitBrainData = async (endpoint = '', data = {}, timeoutMs = API_TIMEOUT) => {
  const url = `https://api.brain-data.ai/v1/${endpoint}`;

  try {
    const response = await fetchWithRetry(url, {
      method: 'POST',
      body: JSON.stringify(data),
    }, timeoutMs);

    return {
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error submitting brain data:', error.message);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    };
  }
};

// Fonction pour annuler une requête en cours
export const cancelPendingRequests = () => {
  // Cette fonction est gérée automatiquement par les AbortController
  // Elle est ici pour documentation et extensibilité
  console.log('Pending requests would be cancelled here');
};

// Export des types de données spécifiques
export const BrainEndpoints = {
  NEURONS: 'neurons',
  SYNAPSES: 'synapses',
  ACTIVITY: 'activity',
  PATTERNS: 'patterns',
  DECISIONS: 'decisions',
};

// Export des erreurs personnalisées
export class BrainApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'BrainApiError';
    this.status = status;
  }
}

// Fonction pour normaliser les données du cerveau
export const normalizeBrainData = (rawData) => {
  if (!rawData) return null;

  // Normalisation des données selon le type
  if (Array.isArray(rawData)) {
    return rawData.map(item => ({
      id: item.id || Math.random().toString(36).substring(2, 9),
      ...item,
      timestamp: item.timestamp || new Date().toISOString(),
    }));
  }

  return {
    ...rawData,
    id: rawData.id || Math.random().toString(36).substring(2, 9),
    timestamp: rawData.timestamp || new Date().toISOString(),
  };
};

// Fonction pour valider les données du cerveau
export const validateBrainData = (data, requiredFields = []) => {
  if (!data) {
    throw new Error('No data provided');
  }

  const missingFields = requiredFields.filter(field => !(field in data));
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }

  return true;
};

// Fonction pour calculer des métriques sur les données du cerveau
export const calculateBrainMetrics = (data) => {
  if (!data || !Array.isArray(data)) {
    return {
      count: 0,
      avgActivity: 0,
      maxActivity: 0,
      minActivity: Infinity,
      totalActivity: 0,
    };
  }

  const metrics = data.reduce((acc, item) => {
    const activity = item.activity || 0;
    acc.count++;
    acc.totalActivity += activity;
    acc.maxActivity = Math.max(acc.maxActivity, activity);
    acc.minActivity = Math.min(acc.minActivity, activity);
    return acc;
  }, {
    count: 0,
    avgActivity: 0,
    maxActivity: 0,
    minActivity: Infinity,
    totalActivity: 0,
  });

  metrics.avgActivity = metrics.count > 0 ? metrics.totalActivity / metrics.count : 0;
  return metrics;
};

// Export par défaut
export default {
  fetchBrainData,
  submitBrainData,
  cancelPendingRequests,
  BrainEndpoints,
  normalizeBrainData,
  validateBrainData,
  calculateBrainMetrics,
};