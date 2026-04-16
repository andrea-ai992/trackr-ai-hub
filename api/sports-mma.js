import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const CACHE_KEY = 'ufc_events';
const CACHE_DURATION_MS = 60 * 60 * 1000;

async function fetchFromTheSportsDB() {
  const leagueId = '7980';
  const url = `https://www.thesportsdb.com/api/v1/json/${process.env.THESPORTSDB_API_KEY || '3'}/eventsseason.php?id=${leagueId}&s=2024-2025`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`TheSportsDB error: ${res.status}`);
  const data = await res.json();

  const now = new Date();
  const events = (data.events || [])
    .filter(e => new Date(e.dateEvent) >= now)
    .sort((a, b) => new Date(a.dateEvent) - new Date(b.dateEvent))
    .slice(0, 10)
    .map(e => ({
      id: e.idEvent,
      name: e.strEvent,
      date: e.dateEvent,
      time: e.strTime || null,
      venue: e.strVenue || null,
      city: e.strCity || null,
      country: e.strCountry || null,
      thumbnail: e.strThumb || null,
      description: e.strDescriptionEN || null,
      main_fights: [],
      source: 'thesportsdb'
    }));

  return events;
}

async function fetchFromSportsDataIO() {
  const apiKey = process.env.SPORTSDATA_API_KEY;
  if (!apiKey) throw new Error('SPORTSDATA_API_KEY not set');

  const url = `https://api.sportsdata.io/v3/mma/scores/json/Schedule/UFC/2025?key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`SportsDataIO error: ${res.status}`);
  const data = await res.json();

  const now = new Date();
  const events = (Array.isArray(data) ? data : [])
    .filter(e => new Date(e.DateTime || e.Day) >= now)
    .sort((a, b) => new Date(a.DateTime || a.Day) - new Date(b.DateTime || b.Day))
    .slice(0, 10)
    .map(e => ({
      id: String(e.EventId || e.ScoreId || ''),
      name: e.Name || e.ShortName || 'UFC Event',
      date: (e.DateTime || e.Day || '').split('T')[0],
      time: e.DateTime ? e.DateTime.split('T')[1]?.replace('Z', '') : null,
      venue: e.Stadium || null,
      city: e.City || null,
      country: e.Country || null,
      thumbnail: null,
      description: null,
      main_fights: (e.Fights || []).slice(0, 5).map(f => ({
        fighter1: f.Fighters?.[0]?.Name || f.Fighter1LastName || '',
        fighter2: f.Fighters?.[1]?.Name || f.Fighter2LastName || '',
        weightClass: f.WeightClass || null,
        isMainEvent: f.MainCard || false
      })),
      source: 'sportsdataio'
    }));

  return events;
}

async function getCachedData() {
  const { data, error } = await supabase
    .from('sports_cache')
    .select('payload, updated_at')
    .eq('cache_key', CACHE_KEY)
    .single();

  if (error || !data) return null;

  const age = Date.now() - new Date(data.updated_at).getTime();
  if (age > CACHE_DURATION_MS) return null;

  return data.payload;
}

async function setCachedData(payload) {
  const { error } = await supabase
    .from('sports_cache')
    .upsert(
      {
        cache_key: CACHE_KEY,
        payload,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'cache_key' }
    );

  if (error) console.error('Cache write error:', error.message);
}

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

  const forceRefresh = req.query.refresh === 'true';

  try {
    if (!forceRefresh) {
      const cached = await getCachedData();
      if (cached) {
        return res.status(200).json({
          success: true,
          cached: true,
          data: cached
        });
      }
    }

    let events = [];
    let sourceUsed = null;
    let fetchError = null;

    if (process.env.SPORTSDATA_API_KEY) {
      try {
        events = await fetchFromSportsDataIO();
        sourceUsed = 'sportsdataio';
      } catch (err) {
        fetchError = err.message;
        console.warn('SportsDataIO failed, falling back:', err.message);
      }
    }

    if (events.length === 0) {
      try {
        events = await fetchFromTheSportsDB();
        sourceUsed = 'thesportsdb';
        fetchError = null;
      } catch (err) {
        fetchError = err.message;
        console.error('TheSportsDB also failed:', err.message);
      }
    }

    if (events.length === 0 && fetchError) {
      return res.status(502).json({
        success: false,
        error: 'Failed to fetch UFC events from all sources',
        detail: fetchError
      });
    }

    const payload = {
      events,
      source: sourceUsed,
      fetched_at: new Date().toISOString(),
      count: events.length
    };

    await setCachedData(payload);

    return res.status(200).json({
      success: true,
      cached: false,
      data: payload
    });

  } catch (err) {
    console.error('sports-mma handler error:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      detail: err.message
    });
  }
}