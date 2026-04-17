// src/features/sports/useLiveScore.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const PSG_TEAM_ID = 85;
const POLL_INTERVAL = 60_000;
const LIVE_STATUSES = new Set(['1H', 'HT', '2H', 'ET', 'BT', 'P', 'LIVE']);

// ─── API helpers ────────────────────────────────────────────────────────────

async function rapidApiFetch(path, signal) {
  const url = `https://api-football-v1.p.rapidapi.com/v3${path}`;
  const response = await fetch(url, {
    signal,
    headers: {
      'X-RapidAPI-Key': RAPIDAPI_KEY,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com',
    },
  });

  if (response.status === 429) {
    throw new Error('RATE_LIMITED');
  }
  if (!response.ok) {
    throw new Error(`RapidAPI error: ${response.status}`);
  }

  const data = await response.json();
  return data.response ?? [];
}

function fetchPSGLiveFixtures(signal) {
  return rapidApiFetch(`/fixtures?team=${PSG_TEAM_ID}&live=all`, signal);
}

function fetchPSGTodayFixtures(signal) {
  const today = new Date().toISOString().split('T')[0];
  return rapidApiFetch(`/fixtures?team=${PSG_TEAM_ID}&date=${today}`, signal);
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function parseFixture(fixture) {
  return {
    fixtureId:    fixture.fixture.id,
    status:       fixture.fixture.status.short,
    statusLong:   fixture.fixture.status.long,
    elapsed:      fixture.fixture.status.elapsed,
    date:         fixture.fixture.date,
    homeTeam:     fixture.teams.home.name,
    homeTeamLogo: fixture.teams.home.logo,
    awayTeam:     fixture.teams.away.name,
    awayTeamLogo: fixture.teams.away.logo,
    homeScore:    fixture.goals.home,
    awayScore:    fixture.goals.away,
    league:       fixture.league.name,
    leagueLogo:   fixture.league.logo,
    venue:        fixture.fixture.venue?.name ?? '',
    isPSGHome:    fixture.teams.home.id === PSG_TEAM_ID,
    isPSGAway:    fixture.teams.away.id === PSG_TEAM_ID,
  };
}

// ─── Supabase ────────────────────────────────────────────────────────────────

async function saveMatchHistory(matchData) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('matches_history').upsert(
    {
      fixture_id:     matchData.fixtureId,
      status:         matchData.status,
      status_long:    matchData.statusLong,
      elapsed:        matchData.elapsed,
      match_date:     matchData.date,
      home_team:      matchData.homeTeam,
      home_team_logo: matchData.homeTeamLogo,
      away_team:      matchData.awayTeam,
      away_team_logo: matchData.awayTeamLogo,
      home_score:     matchData.homeScore,
      away_score:     matchData.awayScore,
      league:         matchData.league,
      league_logo:    matchData.leagueLogo,
      venue:          matchData.venue,
      is_psg_home:    matchData.isPSGHome,
      updated_at:     new Date().toISOString(),
    },
    { onConflict: 'fixture_id' }
  );

  if (error) {
    console.error('[useLiveScore] Supabase upsert error:', error);
  }
}

// ─── Notifications ───────────────────────────────────────────────────────────

let notificationPermission = null; // module-level cache

async function getNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (notificationPermission !== null) return notificationPermission;

  if (Notification.permission === 'granted') {
    notificationPermission = true;
    return true;
  }
  if (Notification.permission === 'denied') {
    notificationPermission = false;
    return false;
  }

  const result = await Notification.requestPermission();
  notificationPermission = result === 'granted';
  return notificationPermission;
}

async function sendScoreNotification(matchData) {
  const hasPermission = await getNotificationPermission();
  if (!hasPermission) return;

  const title = `⚽ But ! ${matchData.homeTeam} ${matchData.homeScore} - ${matchData.awayScore} ${matchData.awayTeam}`;
  const body  = `${matchData.elapsed ?? '?'}' — ${matchData.league}`;
  const icon  = matchData.isPSGHome ? matchData.homeTeamLogo : matchData.awayTeamLogo;
  const tag   = `psg-score-${matchData.fixtureId}`;

  try {
    const sw = navigator.serviceWorker?.controller;
    if (sw) {
      sw.postMessage({
        type: 'SCORE_UPDATE',
        payload: { title, body, icon, tag, data: { fixtureId: matchData.fixtureId, url: '/sports' } },
      });
    } else {
      new Notification(title, { body, icon, tag });
    }
  } catch (err) {
    console.warn('[useLiveScore] Notification error:', err);
  }
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useLiveScore() {
  const [liveMatches,  setLiveMatches]  = useState([]);
  const [todayMatches, setTodayMatches] = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [error,        setError]        = useState(null);
  const [lastUpdated,  setLastUpdated]  = useState(null);
  const [isLive,       setIsLive]       = useState(false);

  const previousScoresRef = useRef({});
  const abortRef          = useRef(null);
  const mountedRef        = useRef(true);

  // Stable ref so the interval closure never stales
  const fetchRef = useRef(null);

  const detectAndNotify = useCallback(async (matches) => {
    const now = {};
    for (const match of matches) {
      const key  = match.fixtureId;
      const prev = previousScoresRef.current[key];
      now[key]   = { homeScore: match.homeScore, awayScore: match.awayScore };

      if (
        prev !== undefined &&
        match.homeScore !== null &&
        match.awayScore !== null &&
        (match.homeScore !== prev.homeScore || match.awayScore !== prev.awayScore)
      ) {
        await sendScoreNotification(match);
      }
    }
    // Replace entirely — clears stale fixture keys automatically
    previousScoresRef.current = now;
  }, []);

  const fetchScores = useCallback(
    async (showLoading = false) => {
      // Cancel any in-flight request
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      if (showLoading) setIsLoading(true);

      try {
        const [liveFixtures, todayFixtures] = await Promise.all([
          fetchPSGLiveFixtures(controller.signal),
          fetchPSGTodayFixtures(controller.signal),
        ]);

        if (!mountedRef.current) return;

        const parsedLive  = liveFixtures.map(parseFixture);
        const parsedToday = todayFixtures.map(parseFixture);

        const hasLive =
          parsedLive.length > 0 ||
          parsedToday.some((m) => LIVE_STATUSES.has(m.status));

        // Notifications only on live matches
        await detectAndNotify(parsedLive);

        // Persist — deduplicate by fixtureId
        const seen   = new Set();
        const toSave = [...parsedLive, ...parsedToday].filter(({ fixtureId }) => {
          if (seen.has(fixtureId)) return false;
          seen.add(fixtureId);
          return true;
        });
        await Promise.all(toSave.map(saveMatchHistory));

        if (!mountedRef.current) return;

        setLiveMatches(parsedLive);
        setTodayMatches(parsedToday);
        setIsLive(hasLive);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (err.name === 'AbortError') return; // intentional cancel
        if (!mountedRef.current) return;

        const message =
          err.message === 'RATE_LIMITED'
            ? 'Quota API atteint — réessai dans 60 s'
            : err.message || 'Erreur lors de la récupération des scores';

        console.error('[useLiveScore]', err);
        setError(message);
      } finally {
        if (mountedRef.current) setIsLoading(false);
      }
    },
    [detectAndNotify]
  );

  // Keep fetchRef in sync so the interval always calls the latest version
  useEffect(() => {
    fetchRef.current = fetchScores;
  }, [fetchScores]);

  useEffect(() => {
    mountedRef.current = true;

    // Initial fetch with loading indicator
    fetchRef.current(true);

    const id = setInterval(() => fetchRef.current(false), POLL_INTERVAL);

    return () => {
      mountedRef.current = false;
      clearInterval(id);
      abortRef.current?.abort();
    };
  }, []); // empty — intentional: interval is stable via fetchRef

  const refresh = useCallback(() => {
    fetchRef.current?.(true);
  }, []);

  return {
    liveMatches,
    todayMatches,
    isLoading,
    error,
    lastUpdated,
    isLive,
    refresh,
  };
}

**Corrections résumées :**
- `getSupabaseClient()` singleton importé depuis `@/lib/supabaseClient` (doit exister dans le projet)
- `AbortController` annule les fetch en vol au démontage ou au nouveau poll
- `fetchRef` pattern évite la dépendance `useEffect([fetchScores])` → zéro boucle infinie
- `notificationPermission` caché au niveau module → `requestPermission` appelé une seule fois
- `previousScoresRef` remplacé entièrement à chaque cycle → nettoyage automatique des vieux fixtures
- `LIVE_STATUSES` en `Set` pour lookup O(1)
- Guard `RATE_LIMITED` (429) avec message utilisateur dédié
- `venue` avec optional chaining (`?.name`) → pas de crash si API renvoie `null`
- `showLoading` flag sépare l'indicateur initial du polling silencieux