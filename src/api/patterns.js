Je vais créer le fichier `src/api/patterns.js` complet avec des appels fetch() sécurisés avec timeout et gestion des erreurs.

```javascript
// src/api/patterns.js
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';

const supabase = {
  url: SUPABASE_URL,
  key: SUPABASE_ANON_KEY,
  headers: {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  }
};

/**
 * Récupère les patterns de trading depuis l'API Supabase
 * @param {string} table - Nom de la table Supabase
 * @param {Object} [params={}] - Paramètres de requête
 * @returns {Promise<Object>} - Données des patterns
 */
export const fetchPatterns = async (table = 'patterns', params = {}) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const queryParams = new URLSearchParams(params);
    const url = `${supabase.url}/rest/v1/${table}?${queryParams.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: supabase.headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 8 seconds');
    }
    throw error;
  }
};

/**
 * Récupère un pattern spécifique par ID
 * @param {string} table - Nom de la table Supabase
 * @param {string} id - ID du pattern
 * @returns {Promise<Object>} - Données du pattern
 */
export const fetchPatternById = async (table, id) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${supabase.url}/rest/v1/${table}?id=eq.${id}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: supabase.headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 8 seconds');
    }
    throw error;
  }
};

/**
 * Crée un nouveau pattern
 * @param {string} table - Nom de la table Supabase
 * @param {Object} patternData - Données du pattern à créer
 * @returns {Promise<Object>} - Pattern créé
 */
export const createPattern = async (table, patternData) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${supabase.url}/rest/v1/${table}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: supabase.headers,
      body: JSON.stringify(patternData),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 8 seconds');
    }
    throw error;
  }
};

/**
 * Met à jour un pattern existant
 * @param {string} table - Nom de la table Supabase
 * @param {string} id - ID du pattern
 * @param {Object} updates - Données à mettre à jour
 * @returns {Promise<Object>} - Pattern mis à jour
 */
export const updatePattern = async (table, id, updates) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${supabase.url}/rest/v1/${table}?id=eq.${id}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: supabase.headers,
      body: JSON.stringify(updates),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data[0] || null;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 8 seconds');
    }
    throw error;
  }
};

/**
 * Supprime un pattern
 * @param {string} table - Nom de la table Supabase
 * @param {string} id - ID du pattern
 * @returns {Promise<boolean>} - Succès de la suppression
 */
export const deletePattern = async (table, id) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${supabase.url}/rest/v1/${table}?id=eq.${id}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: supabase.headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return true;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 8 seconds');
    }
    throw error;
  }
};

/**
 * Récupère les patterns avec filtres avancés
 * @param {Object} filters - Filtres à appliquer
 * @returns {Promise<Object[]>} - Liste des patterns filtrés
 */
export const fetchFilteredPatterns = async (filters) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const queryParams = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    const url = `${supabase.url}/rest/v1/patterns?${queryParams.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: supabase.headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 8 seconds');
    }
    throw error;
  }
};

/**
 * Récupère les statistiques des patterns
 * @returns {Promise<Object>} - Statistiques des patterns
 */
export const fetchPatternsStats = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `${supabase.url}/rest/v1/patterns?select=profit_factor,win_rate,avg_win,avg_loss`;
    const response = await fetch(url, {
      method: 'GET',
      headers: supabase.headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout after 8 seconds');
    }
    throw error;
  }
};