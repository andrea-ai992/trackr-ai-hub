// src/api/flight-tracker.js
import { SUPABASE_URL, SUPABASE_KEY } from '../config/supabase';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const FLIGHT_API_TIMEOUT = 5000; // 5s timeout pour les appels API externes
const CACHE_TTL = 300000; // 5min cache en mémoire

const flightCache = new Map();

export const fetchFlightData = async (flightNumber, signal) => {
  const cacheKey = `flight_${flightNumber}`;

  // Vérifier le cache
  if (flightCache.has(cacheKey)) {
    const cachedData = flightCache.get(cacheKey);
    if (Date.now() - cachedData.timestamp < CACHE_TTL) {
      return cachedData.data;
    }
  }

  try {
    // Appel API avec timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FLIGHT_API_TIMEOUT);

    const response = await fetch(
      `https://aviation-edge.com/v2/public/flights?flightIcao=${flightNumber}`,
      {
        signal: signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Mettre à jour le cache
    flightCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Flight API timeout:', flightNumber);
      throw new Error('Timeout: Service indisponible');
    }
    console.error('Flight API error:', error);
    throw error;
  }
};

export const fetchFlightPosition = async (flightIcao, signal) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FLIGHT_API_TIMEOUT);

    const response = await fetch(
      `https://aviation-edge.com/v2/public/flights?flightIcao=${flightIcao}`,
      {
        signal: signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      throw new Error('Aucune position trouvée');
    }

    return data[0];
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Flight position timeout:', flightIcao);
      throw new Error('Timeout: Position indisponible');
    }
    console.error('Flight position error:', error);
    throw error;
  }
};

export const searchFlights = async (query, signal) => {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FLIGHT_API_TIMEOUT);

    const response = await fetch(
      `https://aviation-edge.com/v2/public/flights?search=${encodeURIComponent(query)}`,
      {
        signal: signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    // Filtrer les résultats pour éviter les doublons
    const uniqueFlights = [];
    const seen = new Set();

    data.forEach(flight => {
      if (!seen.has(flight.flight.icaoNumber)) {
        seen.add(flight.flight.icaoNumber);
        uniqueFlights.push(flight);
      }
    });

    return uniqueFlights.slice(0, 20); // Limiter à 20 résultats
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Flight search timeout:', query);
      throw new Error('Timeout: Recherche indisponible');
    }
    console.error('Flight search error:', error);
    throw error;
  }
};

export const getFlightHistory = async (flightIcao, signal) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FLIGHT_API_TIMEOUT);

    const response = await fetch(
      `https://aviation-edge.com/v2/public/flights?flightIcao=${flightIcao}&history=true`,
      {
        signal: signal || controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.length === 0) {
      return [];
    }

    return data[0].history || [];
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Flight history timeout:', flightIcao);
      throw new Error('Timeout: Historique indisponible');
    }
    console.error('Flight history error:', error);
    throw error;
  }
};

export const clearFlightCache = () => {
  flightCache.clear();
};