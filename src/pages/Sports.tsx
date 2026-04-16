```tsx
// src/components/PSGMatchCard.tsx
import React, { useState, useEffect, useRef } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const FOOTBALL_API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY || '';
const PSG_TEAM_ID = 524;
const PSG_LOGO_BUCKET = 'sports-logos';
const PSG_LOGO_PATH = 'psg/logo.png';
const PSG_LOGO_ORIGIN = 'https://crests.football-data.org/524.png';
const REFRESH_INTERVAL = 30 * 60 * 1000;

// Lazy Supabase client — only created when env vars are present
function getSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface Team {
  id: number;
  name: string;
  shortName: string;
  tla: string;
  crest: string;
}

interface Match {
  id: number;
  utcDate: string;
  status: string;
  matchday: number | null;
  competition: {
    id: number;
    name: string;
    emblem: string;
  };
  homeTeam: Team;
  awayTeam: Team;
  score: {
    winner: string | null;
    fullTime: { home: number | null; away: number | null };
    halfTime: { home: number | null; away: number | null };
  };
}

interface ApiResponse {
  matches: Match[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programmé',
  TIMED: 'Programmé',
  LIVE: 'En direct',
  IN_PLAY: 'En cours',
  PAUSED: 'Pause',
  FINISHED: 'Terminé',
  POSTPONED: 'Reporté',
  SUSPENDED: 'Suspendu',
  CANCELLED: 'Annulé',
};

const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  TIMED: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  LIVE: 'bg-green-500/20 text-green-300 border border-green-500/30',
  IN_PLAY: 'bg-green-500/20 text-green-300 border border-green-500/30',
  PAUSED: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  FINISHED: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  POSTPONED: 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  SUSPENDED: 'bg-red-500/20 text-red-300 border border-red-500/30',
  CANCELLED: 'bg-red-500/20 text-red-400 border border-red-500/30',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(utcDate: string): { day: string; time: string } {
  const date = new Date(utcDate);
  const now = new Date();

  const toParisDate = (d: Date) =>
    d.toLocaleDateString('fr-FR', { timeZone: 'Europe/Paris' });

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const timeStr = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris',
  });

  let dayStr: string;
  if (toParisDate(date) === toParisDate(now)) {
    dayStr = "Aujourd'hui";
  } else if (toParisDate(date) === toParisDate(tomorrow)) {
    dayStr = 'Demain';
  } else {
    dayStr = date.toLocaleDateString('fr-FR', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      timeZone: 'Europe/Paris',
    });
  }

  return { day: dayStr, time: timeStr };
}

function getScoreColor(psgGoals: number, opponentGoals: number): string {
  if (psgGoals > opponentGoals) return 'text-green-400';
  if (psgGoals === opponentGoals) return 'text-yellow-400';
  return 'text-red-400';
}

// ─── Cache Supabase Storage ───────────────────────────────────────────────────

async function fetchPsgLogoWithCache(): Promise<string> {
  const supabase = getSupabase();

  // Try Supabase cache first
  if (supabase) {
    try {
      const { data } = supabase.storage
        .from(PSG_LOGO_BUCKET)
        .getPublicUrl(PSG_LOGO_PATH);

      if (data?.publicUrl) {
        // Verify the file exists with a HEAD-like probe
        const probe = await fetch(data.publicUrl, { method: 'HEAD' });
        if (probe.ok) return data.publicUrl;
      }

      // File not in cache — download and upload
      const res = await fetch(PSG_LOGO_ORIGIN);
      if (res.ok) {
        const blob = await res.blob();
        const { error } = await supabase.storage
          .from(PSG_LOGO_BUCKET)
          .upload(PSG_LOGO_PATH, blob, {
            contentType: 'image/png',
            upsert: true,
          });
        if (!error) {
          const { data: uploaded } = supabase.storage
            .from(PSG_LOGO_BUCKET)
            .getPublicUrl(PSG_LOGO_PATH);
          if (uploaded?.publicUrl) return uploaded.publicUrl;
        }
      }
    } catch {
      // Fall through to origin
    }
  }

  return PSG_LOGO_ORIGIN;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TeamCrest({
  src,
  alt,
  size = 32,
  highlighted = false,
}: {
  src: string;
  alt: string;
  size?: number;
  highlighted?: boolean;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      className={`p-2 rounded-xl flex items-center justify-center ${
        highlighted ? 'bg-blue-900/30 ring-2 ring-blue-500/30' : 'bg-gray-700/30'
      }`}
      style={{ width: size + 16, height: size + 16 }}
    >
      {imgError || !src ? (
        <span
          className="text-gray-400 font-bold"
          style={{ fontSize: size * 0.35 }}
        >
          {alt.slice(0, 3).toUpperCase()}
        </span>
      ) : (
        <img
          src={src}
          alt={alt}
          width={size}
          height={size}
          className="object-contain"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800/60 rounded-2xl border border-gray-700/30 p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="h-3 bg-gray-700 rounded w-32" />
        <div className="h-5 bg-gray-700 rounded-full w-20" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 rounded-xl bg-gray-700" />
          <div className="h-3 bg-gray-700 rounded w-12" />
        </div>
        <div className="flex flex-col items-center gap-1 min-w-[70px]">
          <div className="h-6 bg-gray-700 rounded w-16" />
          <div className="h-3 bg-gray-700 rounded w-10 mt-1" />
        </div>
        <div className="flex flex-col items-center gap-2 flex-1">
          <div className="w-14 h-14 rounded-xl bg-gray-700" />
          <div className="h-3 bg-gray-700 rounded w-12" />
        </div>
      </div>
    </div>
  );
}

function MatchCard({
  match,
  psgLogoUrl,
}: {
  match: Match;
  psgLogoUrl: string;
}) {
  const { day, time } = formatDate(match.utcDate);
  const isPsgHome = match.homeTeam.id === PSG_TEAM_ID;
  const opponent = isPsgHome ? match.awayTeam : match.homeTeam;
  const isLive = match.status === 'IN_PLAY' || match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';
  const hasScore =
    match.score.fullTime.home !== null &&
    match.score.fullTime.away !== null;

  const psgGoals = isPsgHome
    ? match.score.fullTime.home!
    : match.score.fullTime.away!;
  const opponentGoals = isPsgHome
    ? match.score.fullTime.away!
    : match.score.fullTime.home!;

  const leftTeam = {
    id: isPsgHome ? PSG_TEAM_ID : opponent.id,
    name: isPsgHome ? 'PSG' : opponent.shortName || opponent.name,
    crest: isPsgHome ? psgLogoUrl : opponent.crest,
    isPsg: isPsgHome,
  };
  const rightTeam = {
    id: !isPsgHome ? PSG_TEAM_ID : opponent.id,
    name: !isPsgHome ? 'PSG' : opponent.shortName || opponent.name,
    crest: !isPsgHome ? psgLogoUrl : opponent.crest,
    isPsg: !isPsgHome,
  };

  return (
    <div className="relative bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-4 hover:border-blue-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      {/* Live indicator */}
      {isLive && (
        <span className="absolute top-3 right-3 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping absolute" />
          <span className="w-2 h-2 rounded-full bg-green-400 relative" />
        </span>
      )}

      {/* Competition header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {match.competition.emblem && (
            <img
              src={match.competition.emblem}
              alt={match.competition.name}
              width={16}
              height={16}
              className="object-contain flex-shrink-0"
              loading="lazy"
            />
          )}
          <span className="text-xs text-gray-400 font-medium truncate">
            {match.competition.name}
          </span>
          {match.matchday != null && (
            <span className="text-xs text-gray-500 flex-shrink-0">
              J{match.matchday}
            </span>
          )}
        </div>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ml-2 ${
            STATUS_COLORS[match.status] ??
            'bg-gray-600/20 text-gray-400 border border-gray-600/30'
          }`}
        >
          {STATUS_LABELS[match.status] ?? match.status}
        </span>
      </div>

      {/* Teams + score row */}
      <div className="flex items-center justify-between gap-3">
        {/* Left team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamCrest
            src={leftTeam.crest}
            alt={leftTeam.name}
            size={40}
            highlighted={leftTeam.isPsg}
          />
          <span className="text-xs font-semibold text-white text-center leading-tight max-w-[80px]">
            {leftTeam.name}
          </span>
        </div>

        {/* Center: score or time */}
        <div className="flex flex-col items-center gap-1 min-w-[70px]">
          {(isFinished || isLive) && hasScore ? (
            <>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-2xl font-black ${
                    isPsgHome
                      ? getScoreColor(psgGoals, opponentGoals)
                      : 'text-gray-300'
                  }`}
                >
                  {isPsgHome ? psgGoals : opponentGoals}
                </span>
                <span className="text-gray-500 text-lg font-bold">-</span>
                <span
                  className={`text-2xl font-black ${
                    !isPsgHome
                      ? getScoreColor(psgGoals, opponentGoals)
                      : 'text-gray-300'
                  }`}
                >
                  {!isPsgHome ? psgGoals : opponentGoals}
                </span>
              </div>
              <div className="text-xs text-gray-500 text-center">
                {day} · {time}
              </div>
            </>
          ) : (
            <>
              <div className="text-sm font-bold text-white">{time}</div>
              <div className="text-xs text-gray-400">{day}</div>
              <div className="text-xs text-blue-400 font-medium mt-0.5">
                {isPsgHome ? 'Domicile' : 'Extérieur'}
              </div>
            </>
          )}
        </div>

        {/* Right team */}
        <div className="flex flex-col items-center gap-2 flex-1">
          <TeamCrest
            src={rightTeam.crest}
            alt={rightTeam.name}
            size={40}
            highlighted={rightTeam.isPsg}
          />
          <span className="text-xs font-semibold text-white text-center leading-tight max-w-[80px]">
            {rightTeam.name}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function PSGMatchCard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [psgLogoUrl, setPsgLogoUrl] = useState<string>(PSG_LOGO_ORIGIN);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatches = async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);

    try {
      if (!FOOTBALL_API_KEY) {
        throw new Error('Clé API football-data.org manquante (VITE_FOOTBALL_DATA_API_KEY)');
      }

      const today = new Date();
      const inTwoMonths = new Date(today);
      inTwoMonths.setMonth(inTwoMonths.getMonth() + 2);

      const dateFrom = today.toISOString().split('T')[0];
      const dateTo = inTwoMonths.toISOString().split('T')[0];

      const url = `https://api.football-data.org/v4/teams/${PSG_TEAM_ID}/matches?status=SCHEDULED,TIMED,LIVE,IN_PLAY,PAUSED,FINISHED&dateFrom=${dateFrom}&dateTo=${dateTo}&limit=10`;

      const res = await fetch(url, {
        headers: {
          'X-Auth-Token': FOOTBALL_API_KEY,
        },
      });

      if (!res.ok) {
        if (res.status === 429) throw new Error('Limite de requêtes API atteinte, réessayez plus tard');
        if (res.status === 403) throw new Error('Clé API invalide ou accès refusé');
        throw new Error(`Erreur API: ${res.status}`);
      }

      const data: ApiResponse = await res.json();
      setMatches(data.matches ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // Load PSG logo with Supabase cache on mount
  useEffect(() => {
    fetchPsgLogoWithCache().then(setPsgLogoUrl);
  }, []);

  // Initial fetch + auto-refresh every 30 min
  useEffect(() => {
    fetchMatches();

    intervalRef.current = setInterval(() => {
      fetchMatches(true); // silent refresh
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={psgLogoUrl}
            alt="PSG"
            width={32}
            height={32}
            className="object-contain"
          />
          <div>
            <h2 className="text-lg font-bold text-white">Paris Saint-Germain</h2>
            {lastUpdated && (
              <p className="text-xs text-gray-500">
                Mis à jour à{' '}
                {lastUpdated.toLocaleTimeString('fr-FR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={() => fetchMatches()}
          disabled={loading}
          className="p-2 rounded-xl bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Rafraîchir"
        >
          <svg
            className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-2xl p-4 text-center">
          <p className="text-red-400 text-sm">{error}</p>
          <button
            onClick={() => fetchMatches()}
            className="mt-2 text-xs text-red-300 underline hover:no-underline"
          >
            Réessayer
          </button>
        </div>
      )}

      {/* Skeleton loading */}
      {loading && !error && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {/* Match list */}
      {!loading && !error && matches.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p className="text-4xl mb-2">⚽</p>
          <p className="text-sm">Aucun match à venir trouvé</p>
        </div>
      )}

      {!loading && !error && matches.length > 0 && (
        <div className="space-y-3">
          {matches.map((match) => (
            <MatchCard key={match.id} match={match} psgLogoUrl={psgLogoUrl} />
          ))}
        </div>
      )}

      {/* Auto-refresh notice */}
      <p className="text-center text-xs text-gray-600">
        Rafraîchissement automatique toutes les 30 minutes
      </p>
    </div>
  );
}
```

```tsx
// src/pages/Sports.tsx
import React from 'react';
import PSGMatchCard from '../components/PSGMatchCard';

export default function Sports() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-black text-white tracking-tight">Sports</h1>
          <p className="text-sm text-gray-400 mt-0.5">Suivi des matchs en temps réel</p>
        </div>

        {/* PSG section */}
        <section>
          <PSGMatchCard />
        </section>
      </div>
    </div>
  );
}