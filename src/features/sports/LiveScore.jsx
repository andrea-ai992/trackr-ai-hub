// src/features/sports/LiveScore.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com';
const PSG_TEAM_ID = 85;
const POLL_INTERVAL = 60000;

const STATUS_LIVE = ['1H', '2H', 'HT', 'ET', 'BT', 'P', 'LIVE'];
const STATUS_FINISHED = ['FT', 'AET', 'PEN'];

const PULSE_KEYFRAMES = `
  @keyframes pulse-badge {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.4; transform: scale(1.35); }
  }
`;

function injectGlobalStyles() {
  if (document.getElementById('livescore-styles')) return;
  const style = document.createElement('style');
  style.id = 'livescore-styles';
  style.textContent = PULSE_KEYFRAMES;
  document.head.appendChild(style);
}

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }
}

async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    await Notification.requestPermission();
  }
}

function sendPushNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.showNotification(title, {
          body,
          icon: '/psg-icon.png',
          badge: '/badge-icon.png',
          tag: 'psg-live-score',
          renotify: true,
        });
      });
    } else {
      new Notification(title, { body });
    }
  }
}

async function fetchPSGMatches() {
  const today = new Date().toISOString().split('T')[0];
  const url = `https://${RAPIDAPI_HOST}/v3/fixtures?team=${PSG_TEAM_ID}&date=${today}`;
  const response = await fetch(url, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
  });
  if (!response.ok) throw new Error(`API error: ${response.status}`);
  const data = await response.json();
  return data.response || [];
}

async function upsertMatchHistory(match) {
  const { fixture, teams, goals, league, score } = match;
  const record = {
    fixture_id: fixture.id,
    date: fixture.date,
    status: fixture.status.short,
    home_team: teams.home.name,
    home_logo: teams.home.logo,
    away_team: teams.away.name,
    away_logo: teams.away.logo,
    home_goals: goals.home,
    away_goals: goals.away,
    league_name: league.name,
    league_logo: league.logo,
    halftime_home: score?.halftime?.home ?? null,
    halftime_away: score?.halftime?.away ?? null,
    fulltime_home: score?.fulltime?.home ?? null,
    fulltime_away: score?.fulltime?.away ?? null,
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase
    .from('matches_history')
    .upsert(record, { onConflict: 'fixture_id' });
  if (error) console.error('Supabase upsert error:', error);
}

function ScoreBadge({ isLive }) {
  if (!isLive) return null;
  return (
    <span
      style={{
        display: 'inline-block',
        width: 10,
        height: 10,
        borderRadius: '50%',
        backgroundColor: '#ef4444',
        marginLeft: 6,
        animation: 'pulse-badge 1.2s infinite',
        verticalAlign: 'middle',
      }}
      aria-label="Match en cours"
    />
  );
}

function MatchCard({ match, prevGoals }) {
  const { fixture, teams, goals, league } = match;
  const isLive = STATUS_LIVE.includes(fixture.status.short);
  const isFinished = STATUS_FINISHED.includes(fixture.status.short);
  const homeGoals = goals.home ?? 0;
  const awayGoals = goals.away ?? 0;
  const prevHome = prevGoals?.home ?? null;
  const prevAway = prevGoals?.away ?? null;
  const homeScored = prevHome !== null && homeGoals > prevHome;
  const awayScored = prevAway !== null && awayGoals > prevAway;

  return (
    <div
      style={{
        background: isLive
          ? 'linear-gradient(135deg, #1e3a5f 0%, #0f2027 100%)'
          : '#1a1a2e',
        border: isLive ? '1.5px solid #ef4444' : '1px solid #2d2d4e',
        borderRadius: 16,
        padding: '18px 20px',
        marginBottom: 16,
        boxShadow: isLive ? '0 0 18px rgba(239,68,68,0.25)' : 'none',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 8,
        }}
      >
        <span
          style={{
            fontSize: 11,
            color: '#94a3b8',
            fontWeight: 600,
            letterSpacing: 0.5,
            textTransform: 'uppercase',
          }}
        >
          {league.name}
        </span>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: isLive ? '#ef4444' : isFinished ? '#22c55e' : '#94a3b8',
            background: isLive
              ? 'rgba(239,68,68,0.12)'
              : isFinished
              ? 'rgba(34,197,94,0.10)'
              : 'transparent',
            padding: '2px 8px',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          {isLive && <ScoreBadge isLive />}
          {fixture.status.long}
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <img
            src={teams.home.logo}
            alt={teams.home.name}
            style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 6 }}
            loading="lazy"
          />
          <span
            style={{
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {teams.home.name}
          </span>
        </div>

        <div style={{ textAlign: 'center', flexShrink: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              justifyContent: 'center',
            }}
          >
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: homeScored ? '#facc15' : '#f1f5f9',
                transition: 'color 0.5s ease',
                minWidth: 32,
                textAlign: 'center',
                textShadow: homeScored ? '0 0 12px rgba(250,204,21,0.7)' : 'none',
              }}
            >
              {goals.home ?? '-'}
            </span>
            <span style={{ fontSize: 22, color: '#475569', fontWeight: 700 }}>:</span>
            <span
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: awayScored ? '#facc15' : '#f1f5f9',
                transition: 'color 0.5s ease',
                minWidth: 32,
                textAlign: 'center',
                textShadow: awayScored ? '0 0 12px rgba(250,204,21,0.7)' : 'none',
              }}
            >
              {goals.away ?? '-'}
            </span>
          </div>
          {fixture.status.elapsed != null && (
            <span style={{ fontSize: 12, color: '#94a3b8', display: 'block' }}>
              {fixture.status.elapsed}&apos;
            </span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
          }}
        >
          <img
            src={teams.away.logo}
            alt={teams.away.name}
            style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: 6 }}
            loading="lazy"
          />
          <span
            style={{
              color: '#e2e8f0',
              fontSize: 13,
              fontWeight: 600,
              textAlign: 'center',
              lineHeight: 1.3,
            }}
          >
            {teams.away.name}
          </span>
        </div>
      </div>
    </div>
  );
}

function HistoryCard({ record }) {
  const isFinished = STATUS_FINISHED.includes(record.status);
  return (
    <div
      style={{
        background: '#12122a',
        border: '1px solid #2d2d4e',
        borderRadius: 12,
        padding: '12px 16px',
        marginBottom: 10,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 60 }}>
        {new Date(record.date).toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
        })}
      </span>
      <span
        style={{
          fontSize: 12,
          color: '#e2e8f0',
          fontWeight: 600,
          flex: 1,
          textAlign: 'center',
        }}
      >
        {record.home_team}
      </span>
      <span
        style={{
          fontSize: 14,
          fontWeight: 800,
          color: isFinished ? '#22c55e' : '#94a3b8',
          minWidth: 40,
          textAlign: 'center',
        }}
      >
        {record.home_goals ?? '-'} : {record.away_goals ?? '-'}
      </span>
      <span
        style={{
          fontSize: 12,
          color: '#e2e8f0',
          fontWeight: 600,
          flex: 1,
          textAlign: 'center',
        }}
      >
        {record.away_team}
      </span>
      <span
        style={{
          fontSize: 10,
          color: '#64748b',
          minWidth: 28,
          textAlign: 'right',
        }}
      >
        {record.status}
      </span>
    </div>
  );
}

export default function LiveScore({ onLiveStatusChange }) {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const prevMatchesRef = useRef({});
  const intervalRef = useRef(null);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const { data, error: sbError } = await supabase
        .from('matches_history')
        .select('*')
        .order('date', { ascending: false })
        .limit(20);
      if (sbError) throw sbError;
      setHistory(data || []);
    } catch (e) {
      console.error('History load error:', e);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  const pollMatches = useCallback(async () => {
    try {
      const fixtures = await fetchPSGMatches();
      const liveMatches = fixtures.filter((m) =>
        STATUS_LIVE.includes(m.fixture.status.short)
      );
      const hasLive = liveMatches.length > 0;

      if (onLiveStatusChange) onLiveStatusChange(hasLive);

      for (const match of fixtures) {
        const id = match.fixture.id;
        const prev = prevMatchesRef.current[id];
        const currHome = match.goals.home ?? 0;
        const currAway = match.goals.away ?? 0;

        if (prev && STATUS_LIVE.includes(match.fixture.status.short)) {
          const prevHome = prev.goals.home ?? 0;
          const prevAway = prev.goals.away ?? 0;

          if (currHome > prevHome) {
            sendPushNotification(
              `⚽ But de ${match.teams.home.name}!`,
              `${match.teams.home.name} ${currHome} - ${currAway} ${match.teams.away.name}`
            );
          }
          if (currAway > prevAway) {
            sendPushNotification(
              `⚽ But de ${match.teams.away.name}!`,
              `${match.teams.home.name} ${currHome} - ${currAway} ${match.teams.away.name}`
            );
          }
        }

        prevMatchesRef.current[id] = match;
        await upsertMatchHistory(match);
      }

      setMatches(fixtures);
      setLastUpdated(new Date());
      setError(null);
    } catch (e) {
      console.error('Poll error:', e);
      setError('Impossible de charger les matchs. Réessai dans 60s.');
    } finally {
      setLoading(false);
    }
  }, [onLiveStatusChange]);

  useEffect(() => {
    injectGlobalStyles();
    registerServiceWorker();
    requestNotificationPermission();
    pollMatches();
    loadHistory();

    intervalRef.current = setInterval(() => {
      pollMatches();
      loadHistory();
    }, POLL_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [pollMatches, loadHistory]);

  const hasLive = matches.some((m) => STATUS_LIVE.includes(m.fixture.status.short));

  return (
    <div
      style={{
        padding: '16px 16px 80px',
        maxWidth: 480,
        margin: '0 auto',
        minHeight: '100vh',
        background: '#0d0d1a',
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: '#f1f5f9' }}>
            PSG Live
          </span>
          <ScoreBadge isLive={hasLive} />
        </div>
        {lastUpdated && (
          <span style={{ fontSize: 11, color: '#475569' }}>
            MàJ{' '}
            {lastUpdated.toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        )}
      </div>

      {/* Matches */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#64748b',
            fontSize: 14,
          }}
        >
          Chargement…
        </div>
      ) : error ? (
        <div
          style={{
            background: 'rgba(239,68,68,0.10)',
            border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 12,
            padding: '14px 16px',
            color: '#fca5a5',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {error}
        </div>
      ) : matches.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '48px 0',
            color: '#475569',
            fontSize: 14,
          }}
        >
          Aucun match PSG aujourd'hui.
        </div>
      ) : (
        matches.map((match) => (
          <MatchCard
            key={match.fixture.id}
            match={match}
            prevGoals={
              prevMatchesRef.current[match.fixture.id]
                ? prevMatchesRef.current[match.fixture.id].goals
                : null
            }
          />
        ))
      )}

      {/* History toggle */}
      <button
        onClick={() => {
          setShowHistory((v) => !v);
        }}
        style={{
          width: '100%',
          background: 'transparent',
          border: '1px solid #2d2d4e',
          borderRadius: 10,
          padding: '10px 0',
          color: '#94a3b8',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
          marginTop: 8,
          marginBottom: 12,
          transition: 'background 0.2s',
        }}
      >
        {showHistory ? 'Masquer' : 'Voir'} l'historique des matchs
      </button>

      {/* History list */}
      {showHistory && (
        <div>
          {historyLoading ? (
            <div style={{ textAlign: 'center', color: '#64748b', fontSize: 13, padding: '16px 0' }}>
              Chargement historique…
            </div>
          ) : history.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#475569', fontSize: 13, padding: '16px 0' }}>
              Aucun historique disponible.
            </div>
          ) : (
            history.map((record) => (
              <HistoryCard key={record.fixture_id} record={record} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// public/sw.js
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'PSG Live';
  const options = {
    body: data.body || '',
    icon: '/psg-icon.png',
    badge: '/badge-icon.png',
    tag: 'psg-live-score',
    renotify: true,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return self.clients.openWindow('/');
    })
  );
});