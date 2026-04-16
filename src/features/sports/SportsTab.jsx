```js
// src/features/sports/sportsApi.js — INCHANGÉ, correct
import axios from 'axios';

const RAPID_API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPID_API_HOST = 'api-football-v1.p.rapidapi.com';
export const PSG_TEAM_ID = 85;

const apiClient = axios.create({
  baseURL: 'https://api-football-v1.p.rapidapi.com/v3',
  headers: {
    'X-RapidAPI-Key': RAPID_API_KEY,
    'X-RapidAPI-Host': RAPID_API_HOST,
  },
});

export async function fetchPSGLiveFixtures() {
  try {
    const response = await apiClient.get('/fixtures', {
      params: { team: PSG_TEAM_ID, live: 'all' },
    });
    return response.data.response || [];
  } catch (error) {
    console.error('[sportsApi] fetchPSGLiveFixtures error:', error);
    return [];
  }
}

export async function fetchPSGRecentFixtures() {
  try {
    const today = new Date();
    const from = new Date(today);
    from.setDate(from.getDate() - 7);
    const to = new Date(today);
    to.setDate(to.getDate() + 7);
    const formatDate = (d) => d.toISOString().split('T')[0];

    const response = await apiClient.get('/fixtures', {
      params: {
        team: PSG_TEAM_ID,
        from: formatDate(from),
        to: formatDate(to),
        timezone: 'Europe/Paris',
      },
    });
    return response.data.response || [];
  } catch (error) {
    console.error('[sportsApi] fetchPSGRecentFixtures error:', error);
    return [];
  }
}

export function normalizeFixture(fixture) {
  return {
    id: fixture.fixture?.id,
    date: fixture.fixture?.date,
    status: fixture.fixture?.status?.short,
    statusLong: fixture.fixture?.status?.long,
    elapsed: fixture.fixture?.status?.elapsed ?? null,
    homeTeam: fixture.teams?.home?.name,
    homeTeamLogo: fixture.teams?.home?.logo,
    homeTeamId: fixture.teams?.home?.id,
    awayTeam: fixture.teams?.away?.name,
    awayTeamLogo: fixture.teams?.away?.logo,
    awayTeamId: fixture.teams?.away?.id,
    homeScore: fixture.goals?.home ?? null,
    awayScore: fixture.goals?.away ?? null,
    league: fixture.league?.name,
    leagueLogo: fixture.league?.logo,
    leagueRound: fixture.league?.round,
    venue: fixture.fixture?.venue?.name,
    isPSGHome: fixture.teams?.home?.id === PSG_TEAM_ID,
  };
}
```

```js
// src/features/sports/sportsService.js
import { supabase } from '../../lib/supabaseClient';
import {
  fetchPSGLiveFixtures,
  fetchPSGRecentFixtures,
  normalizeFixture,
} from './sportsApi';

export async function getLiveMatches() {
  const fixtures = await fetchPSGLiveFixtures();
  return fixtures.map(normalizeFixture);
}

export async function getRecentMatches() {
  const fixtures = await fetchPSGRecentFixtures();
  return fixtures.map(normalizeFixture);
}

export async function saveMatchToHistory(match) {
  if (!match?.id) return null;

  // Ne pas sauvegarder les matchs sans score (à venir, non commencés)
  const hasStarted = match.homeScore !== null && match.awayScore !== null;
  if (!hasStarted) return null;

  const record = {
    fixture_id: match.id,
    match_date: match.date,
    home_team: match.homeTeam,
    away_team: match.awayTeam,
    home_score: match.homeScore,
    away_score: match.awayScore,
    status: match.status,
    status_long: match.statusLong,
    elapsed: match.elapsed,
    league: match.league,
    venue: match.venue,
    home_team_logo: match.homeTeamLogo,
    away_team_logo: match.awayTeamLogo,
    league_logo: match.leagueLogo,
    league_round: match.leagueRound,
    is_psg_home: match.isPSGHome,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('matches_history')
    .upsert(record, { onConflict: 'fixture_id' })
    .select()
    .single();

  if (error) {
    console.error('[sportsService] saveMatchToHistory error:', error);
    return null;
  }
  return data;
}

export async function getMatchesHistory(limit = 20) {
  const { data, error } = await supabase
    .from('matches_history')
    .select('*')
    .order('match_date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[sportsService] getMatchesHistory error:', error);
    return [];
  }
  return data || [];
}

export async function getMatchById(fixtureId) {
  const { data, error } = await supabase
    .from('matches_history')
    .select('*')
    .eq('fixture_id', fixtureId)
    .single();

  if (error) return null;
  return data;
}
```

```js
// src/features/sports/notificationService.js
const SW_PATH = '/sw.js';

export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false;
  if (!('serviceWorker' in navigator)) return false;
  if (Notification.permission === 'granted') return true;
  if (Notification.permission === 'denied') return false;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const registration = await navigator.serviceWorker.register(SW_PATH, {
      scope: '/',
    });
    // Force activation immédiate si en attente
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
    return registration;
  } catch (error) {
    console.error('[notificationService] SW registration failed:', error);
    return null;
  }
}

export async function sendScoreChangeNotification({
  homeTeam,
  awayTeam,
  homeScore,
  awayScore,
  elapsed,
}) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;

  const elapsedStr = elapsed != null ? `${elapsed}'` : 'En cours';
  const title = '⚽ PSG — Changement de Score !';
  const body = `${homeTeam} ${homeScore} - ${awayScore} ${awayTeam} (${elapsedStr})`;

  const options = {
    body,
    icon: '/psg-icon.png',
    badge: '/psg-badge.png',
    tag: 'psg-score-update',
    renotify: true,
    vibrate: [200, 100, 200],
    data: { url: '/sports', homeTeam, awayTeam, homeScore, awayScore, elapsed },
  };

  try {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, options);
    } else {
      new Notification(title, options);
    }
  } catch (error) {
    console.error('[notificationService] showNotification error:', error);
    try {
      new Notification(title, options);
    } catch (fallbackError) {
      console.error('[notificationService] fallback notification error:', fallbackError);
    }
  }
}
```

```js
// src/features/sports/useSportsLive.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { getLiveMatches, getRecentMatches, saveMatchToHistory } from './sportsService';
import {
  sendScoreChangeNotification,
  requestNotificationPermission,
  registerServiceWorker,
} from './notificationService';

const POLLING_INTERVAL = 60_000;

// Score valide uniquement si les deux valeurs sont des nombres
function isValidScore(home, away) {
  return home !== null && away !== null && home !== undefined && away !== undefined;
}

export function useSportsLive() {
  const [liveMatches, setLiveMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [isLive, setIsLive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const previousScoresRef = useRef({});
  const pollingRef = useRef(null);
  const isMountedRef = useRef(true);
  // Flag pour ignorer la première passe (initialisation des scores de référence)
  const isFirstPollRef = useRef(true);

  const checkScoreChanges = useCallback((matches) => {
    matches.forEach((match) => {
      const key = match.id;
      const { homeScore, awayScore } = match;

      if (!isValidScore(homeScore, awayScore)) return;

      const currentScore = `${homeScore}-${awayScore}`;
      const prev = previousScoresRef.current[key];

      if (!isFirstPollRef.current && prev !== undefined && prev !== currentScore) {
        sendScoreChangeNotification({
          homeTeam: match.homeTeam,
          awayTeam: match.awayTeam,
          homeScore,
          awayScore,
          elapsed: match.elapsed,
        });
      }

      previousScoresRef.current[key] = currentScore;
    });

    // Après le premier poll, on marque comme initialisé
    if (isFirstPollRef.current) {
      isFirstPollRef.current = false;
    }
  }, []);

  const fetchLive = useCallback(async () => {
    try {
      const matches = await getLiveMatches();
      if (!isMountedRef.current) return;

      checkScoreChanges(matches);
      setLiveMatches(matches);
      setIsLive(matches.length > 0);
      setLastUpdated(new Date());

      // Sauvegarde en parallèle, erreurs non bloquantes
      await Promise.allSettled(matches.map((m) => saveMatchToHistory(m)));
    } catch (err) {
      if (isMountedRef.current) {
        setError(err.message);
      }
    }
  }, [checkScoreChanges]);

  const fetchRecent = useCallback(async () => {
    try {
      const matches = await getRecentMatches();
      if (isMountedRef.current) {
        setRecentMatches(matches);
      }
    } catch (err) {
      console.error('[useSportsLive] fetchRecent error:', err);
    }
  }, []);

  const initialize = useCallback(async () => {
    setLoading(true);
    setError(null);
    isFirstPollRef.current = true;

    // Enregistrer le SW d'abord, puis demander la permission
    await registerServiceWorker();
    await requestNotificationPermission();
    await Promise.allSettled([fetchLive(), fetchRecent()]);

    if (isMountedRef.current) {
      setLoading(false);
    }
  }, [fetchLive, fetchRecent]);

  useEffect(() => {
    isMountedRef.current = true;
    initialize();

    pollingRef.current = setInterval(() => {
      fetchLive();
    }, POLLING_INTERVAL);

    return () => {
      isMountedRef.current = false;
      clearInterval(pollingRef.current);
    };
  }, [initialize, fetchLive]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await Promise.allSettled([fetchLive(), fetchRecent()]);
    if (isMountedRef.current) setLoading(false);
  }, [fetchLive, fetchRecent]);

  return {
    liveMatches,
    recentMatches,
    isLive,
    loading,
    error,
    lastUpdated,
    refresh,
  };
}
```

```jsx
// src/features/sports/SportsTab.jsx
import React, { useEffect, useRef } from 'react';
import { useSportsLive } from './useSportsLive';
import './SportsTab.css';

// ─── Sous-composants ────────────────────────────────────────────────────────

function LiveBadge() {
  return (
    <span className="live-badge" aria-label="Match en cours" role="status">
      <span className="live-badge__dot" />
      LIVE
    </span>
  );
}

function ScoreCard({ match, isLive }) {
  const psgSide = match.isPSGHome ? 'home' : 'away';
  const psgScore = psgSide === 'home' ? match.homeScore : match.awayScore;
  const oppScore = psgSide === 'home' ? match.awayScore : match.homeScore;
  const isWinning = psgScore !== null && oppScore !== null && psgScore > oppScore;
  const isDrawing = psgScore !== null && oppScore !== null && psgScore === oppScore;

  const scoreDisplay =
    match.homeScore !== null && match.awayScore !== null
      ? `${match.homeScore} - ${match.awayScore}`
      : 'vs';

  return (
    <article
      className={`score-card ${isLive ? 'score-card--live' : ''} ${
        isWinning ? 'score-card--winning' : isDrawing ? 'score-card--drawing' : ''
      }`}
    >
      <header className="score-card__league">
        {match.leagueLogo && (
          <img
            src={match.leagueLogo}
            alt={match.league}
            className="score-card__league-logo"
            width={20}
            height={20}
          />
        )}
        <span>{match.league}</span>
        {match.leagueRound && (
          <span className="score-card__round"> — {match.leagueRound}</span>
        )}
      </header>

      <div className="score-card__teams">
        <div className="score-card__team">
          {match.homeTeamLogo && (
            <img
              src={match.homeTeamLogo}
              alt={match.homeTeam}
              className="score-card__team-logo"
              width={36}
              height={36}
            />
          )}
          <span className="score-card__team-name">{match.homeTeam}</span>
        </div>

        <div className="score-card__score-block">
          <span className="score-card__score">{scoreDisplay}</span>
          {isLive && match.elapsed != null && (
            <span className="score-card__elapsed">{match.elapsed}&apos;</span>
          )}
          {!isLive && (
            <span className="score-card__status">{match.statusLong}</span>
          )}
        </div>

        <div className="score-card__team score-card__team--away">
          {match.awayTeamLogo && (
            <img
              src={match.awayTeamLogo}
              alt={match.awayTeam}
              className="score-card__team-logo"
              width={36}
              height={36}
            />
          )}
          <span className="score-card__team-name">{match.awayTeam}</span>
        </div>
      </div>

      {match.venue && (
        <footer className="score-card__venue">📍 {match.venue}</footer>
      )}
    </article>
  );
}

function LastUpdatedBar({ lastUpdated, onRefresh, loading }) {
  if (!lastUpdated) return null;
  const time = lastUpdated.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  return (
    <div className="last-updated">
      <span>Mis à jour à {time}</span>
      <button
        className="last-updated__refresh"
        onClick={onRefresh}
        disabled={loading}
        aria-label="Rafraîchir les scores"
      >
        {loading ? '⟳' : '↻'}
      </button>
    </div>
  );
}

// ─── Composant principal ────────────────────────────────────────────────────

export default function SportsTab() {
  const { liveMatches, recentMatches, isLive, loading, error, lastUpdated, refresh } =
    useSportsLive();

  // Notifie le parent (TabBar) via un custom event pour le badge rouge
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('trackr:sports:live', { detail: { isLive } })
    );
  }, [isLive]);

  // ── Rendu états ──────────────────────────────────────────────────────────
  if (loading && liveMatches.length === 0 && recentMatches.length === 0) {
    return (
      <div className="sports-tab sports-tab--loading" role="status" aria-live="polite">
        <div className="sports-tab__spinner" aria-hidden="true" />
        <p>Chargement des scores PSG…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="sports-tab sports-tab--error" role="alert">
        <p>❌ Erreur : {error}</p>
        <button onClick={refresh} className="sports-tab__retry">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="sports-tab" aria-label="Scores PSG">
      {/* En-tête */}
      <div className="sports-tab__header">
        <h2 className="sports-tab__title">
          <img
            src="/psg-icon.png"
            alt="PSG"
            className="sports-tab__psg-logo"
            width={28}
            height={28}
          />
          Paris Saint-Germain
          {isLive && <LiveBadge />}
        </h2>
        <LastUpdatedBar
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          loading={loading}
        />
      </div>

      {/* Matchs en direct */}
      {isLive && (
        <section className="sports-tab__section" aria-label="Matchs en direct">
          <h3 className="sports-tab__section-title">
            🔴 En direct ({liveMatches.length})
          </h3>
          <div className="sports-tab__cards">
            {liveMatches.map((match) => (
              <ScoreCard key={match.id} match={match} isLive />
            ))}
          </div>
        </section>
      )}

      {/* Matchs récents / à venir */}
      {recentMatches.length > 0 && (
        <section className="sports-tab__section" aria-label="Matchs récents et à venir">
          <h3 className="sports-tab__section-title">📅 Calendrier (±7 jours)</h3>
          <div className="sports-tab__cards">
            {recentMatches.map((match) => (
              <ScoreCard key={match.id} match={match} isLive={false} />
            ))}
          </div>
        </section>
      )}

      {/* État vide */}
      {!isLive && recentMatches.length === 0 && (
        <div className="sports-tab__empty">
          <p>Aucun match PSG cette semaine.</p>
          <button onClick={refresh} className="sports-tab__retry">
            Rafraîchir
          </button>
        </div>
      )}
    </section>
  );
}
```

```css
/* src/features/sports/SportsTab.css */

/* ── Tab container ── */
.sports-tab {
  padding: 1rem;
  max-width: 600px;
  margin: 0 auto;
  font-family: var(--font-sans, system-ui, sans-serif);
}

.sports-tab--loading,
.sports-tab--error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 40vh;
  gap: 1rem;
  color: var(--color-muted, #888);
}

.sports-tab__spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.15);
  border-top-color: #e30613;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Header ── */
.sports-tab__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.sports-tab__title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--color-text, #fff);
}

.sports-tab__psg-logo {
  border-radius: 50%;
  object-fit: contain;
}

/* ── Live Badge (aussi utilisé sur TabBar via CSS global) ── */
.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: #e30613;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 2px 7px 2px 4px;
  border-radius: 999px;
  vertical-align: middle;
  animation: pulse-badge 1.5s ease-in-out infinite;
}

.live-badge__dot {
  width: 7px;
  height: 7px;
  background: #fff;
  border-radius: 50%;
  animation: blink-dot 1s ease-in-out infinite;
  flex-shrink: 0;
}

@keyframes pulse-badge {
  0%, 100% { box-shadow: 0 0 0 0 rgba(227, 6, 19, 0.7); }
  50%       { box-shadow: 0 0 0 6px rgba(227, 6, 19, 0); }
}

@keyframes blink-dot {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.3; }
}

/* ── Tab bar badge (classe appliquée depuis TabBar) ── */
.tab-sports-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 10px;
  height: 10px;
  background: #e30613;
  border-radius: 50%;
  border: 2px solid var(--color-bg, #0d0d0d);
  animation: pulse-badge 1.5s ease-in-out infinite;
  pointer-events: none;
}

/* ── Last updated bar ── */
.last-updated {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: var(--color-muted, #888);
}

.last-updated__refresh {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  color: var(--color-muted, #888);
  line-height: 1;
  padding: 2px 4px;
  border-radius: 4px;
  transition: color 0.2s;
}

.last-updated__refresh:hover:not(:disabled) {
  color: var(--color-text, #fff);
}

.last-updated__refresh:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* ── Sections ── */
.sports-tab__section {
  margin-bottom: 1.5rem;
}

.sports-tab__section-title {
  font-size: 0.9rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-muted, #888);
  margin: 0 0 0.75rem;
}

.sports-tab__cards {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* ── Score card ── */
.score-card {
  background: var(--color-surface, #1a1a1a);
  border-radius: 12px;
  padding: 0.875rem 1rem;
  border: 1px solid var(--color-border, #2a2a2a);
  transition: border-color 0.2s;
}

.score-card--live {
  border-color: #e30613;
  box-shadow: 0 0 0 1px rgba(227, 6, 19, 0.3), 0 4px 16px rgba(227, 6, 19, 0.15);
}

.score-card--winning {
  border-color: #22c55e;
}

.score-card--drawing {
  border-color: #f59e0b;
}

.score-card__league {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.72rem;
  color: var(--color-muted, #888);
  margin-bottom: 0.6rem;
}

.score-card__league-logo {
  border-radius: 2px;
  object-fit: contain;
}

.score-card__round {
  font-style: italic;
}

.score-card__teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 0.5rem;
}

.score-card__team {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
}

.score-card__team--away {
  /* identique, déclaré pour surcharge éventuelle */
}

.score-card__team-logo {
  border-radius: 4px;
  object-fit: contain;
}

.score-card__team-name {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text, #fff);
  line-height: 1.2;
  word-break: break-word;
}

.score-card__score-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  min-width: 72px;
}

.score-card__score {
  font-size: 1.6rem;
  font-weight: 800;
  color: var(--color-text, #fff);
  letter-spacing: 0.04em;
  font-variant-numeric: tabular-nums;
}

.score-card__elapsed {
  font-size: 0.7rem;
  font-weight: 700;
  color: #e30613;
  background: rgba(227, 6, 19, 0.1);
  padding: 1px 6px;
  border-radius: 999px;
}

.score-card__status {
  font-size: 0.68rem;
  color: var(--color-muted, #888);
  text-align: center;
}

.score-card__venue {
  font-size: 0.7rem;
  color: var(--color-muted, #888);
  margin-top: 0.6rem;
  text-align: center;
}

/* ── Empty state ── */
.sports-tab__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  padding: 2.5rem 1rem;
  color: var(--color-muted, #888);
  text-align: center;
}

/* ── Retry button ── */
.sports-tab__retry {
  padding: 0.5rem 1.25rem;
  background: #e30613;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.875rem;
  transition: opacity 0.2s;
}

.sports-tab__retry:hover {
  opacity: 0.85;
}
```

```js
// public/sw.js  — COMPLET
const CACHE_NAME = 'trackr-v2';
const STATIC_ASSETS