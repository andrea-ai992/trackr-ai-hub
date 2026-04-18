// src/api/espn.js
import { SUPABASE_URL, SUPABASE_KEY } from '../config/supabase';

const ESPN_API_BASE = 'https://site.api.espn.com/apis/site/v2';

const espnFetch = async (endpoint, signal) => {
  const url = `${ESPN_API_BASE}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(url, {
      signal: signal || controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`ESPN API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('ESPN API request timed out after 8 seconds');
    }
    throw error;
  }
};

// NBA Endpoints
export const getNBATeams = async (signal) => {
  return espnFetch('/sports/basketball/mens-college-basketball/teams', signal);
};

export const getNBAGames = async (teamId, signal) => {
  return espnFetch(`/sports/basketball/mens-college-basketball/teams/${teamId}/schedule`, signal);
};

export const getNBAGameDetails = async (gameId, signal) => {
  return espnFetch(`/sports/basketball/mens-college-basketball/scoreboard/${gameId}`, signal);
};

export const getNBAStandings = async (signal) => {
  return espnFetch('/sports/basketball/mens-college-basketball/standings', signal);
};

// NFL Endpoints
export const getNFLTeams = async (signal) => {
  return espnFetch('/sports/football/nfl/teams', signal);
};

export const getNFLGames = async (teamId, season, signal) => {
  return espnFetch(`/sports/football/nfl/teams/${teamId}/schedule?season=${season}`, signal);
};

export const getNFLGameDetails = async (gameId, signal) => {
  return espnFetch(`/sports/football/nfl/scoreboard/${gameId}`, signal);
};

export const getNFLStandings = async (season, signal) => {
  return espnFetch(`/sports/football/nfl/standings?season=${season}`, signal);
};

// PSG Endpoints
export const getPSGNews = async (signal) => {
  return espnFetch('/sports/soccer/fc-paris-saint-germain/news', signal);
};

export const getPSGFixtures = async (season, signal) => {
  return espnFetch(`/sports/soccer/fc-paris-saint-germain/fixtures?season=${season}`, signal);
};

export const getPSGStandings = async (season, signal) => {
  return espnFetch(`/sports/soccer/france.1/standings?season=${season}`, signal);
};

// UFC Endpoints
export const getUFCEvents = async (signal) => {
  return espnFetch('/sports/mma/ufc/events', signal);
};

export const getUFCEventDetails = async (eventId, signal) => {
  return espnFetch(`/sports/mma/ufc/events/${eventId}`, signal);
};

export const getUFCFighters = async (signal) => {
  return espnFetch('/sports/mma/ufc/fighters', signal);
};

export const getUFCRankings = async (signal) => {
  return espnFetch('/sports/mma/ufc/rankings', signal);
};

// Cache utilities
const cache = new Map();

export const clearESPNCache = () => {
  cache.clear();
};

export const getCachedESPNData = (key) => {
  return cache.get(key);
};

export const setCachedESPNData = (key, data) => {
  cache.set(key, data);
};

// Main fetch function with caching
export const fetchESPNData = async (key, endpoint, signal) => {
  const cachedData = getCachedESPNData(key);
  if (cachedData) {
    return cachedData;
  }

  const data = await espnFetch(endpoint, signal);
  setCachedESPNData(key, data);
  return data;
};