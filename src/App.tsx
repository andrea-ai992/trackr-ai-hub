```tsx
// src/components/PSGMatchCard.tsx
import React, { useEffect, useState, useCallback, useRef } from "react";

const PSG_TEAM_ID = 524;
const REFRESH_INTERVAL = 30 * 60 * 1000;
const API_BASE = "https://api.football-data.org/v4";

// Remplacer par votre vraie URL Supabase Storage
const PSG_LOGO_SUPABASE =
  import.meta.env.VITE_PSG_LOGO_URL ||
  "https://crests.football-data.org/524.png";

const PSG_LOGO_FALLBACK = "https://crests.football-data.org/524.png";

interface Match {
  id: number;
  utcDate: string;
  competition: {
    name: string;
    emblem: string;
  };
  homeTeam: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };
  awayTeam: {
    id: number;
    name: string;
    shortName: string;
    crest: string;
  };
  status: string;
  score: {
    fullTime: {
      home: number | null;
      away: number | null;
    };
  };
}

interface ApiResponse {
  matches: Match[];
  errorCode?: number;
  message?: string;
}

const COMPETITION_COLORS: Record<string, string> = {
  "ligue 1": "#1a4fa0",
  "uefa champions league": "#0e1b4d",
  "coupe de france": "#c41e3a",
  "uefa europa league": "#f97316",
};

function getCompetitionColor(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(COMPETITION_COLORS)) {
    if (lower.includes(key)) {
      return COMPETITION_COLORS[key];
    }
  }
  return "#2d1b69";
}

function formatDate(utcDate: string): {
  date: string;
  time: string;
  relative: string;
} {
  const d = new Date(utcDate);
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  const date = d.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  let relative = "";
  if (diffDays === 0) relative = "Aujourd'hui";
  else if (diffDays === 1) relative = "Demain";
  else if (diffDays === -1) relative = "Hier";
  else if (diffDays > 1 && diffDays <= 7) relative = `Dans ${diffDays}j`;
  else if (diffDays < -1 && diffDays >= -7)
    relative = `Il y a ${Math.abs(diffDays)}j`;
  else relative = date;

  return { date, time, relative };
}

function isPSGHome(match: Match): boolean {
  return match.homeTeam.id === PSG_TEAM_ID;
}

function getOpponent(
  match: Match
): { name: string; shortName: string; crest: string } {
  // Sécurité: on retourne l'adversaire selon qui est PSG
  if (isPSGHome(match)) {
    return {
      name: match.awayTeam.name,
      shortName: match.awayTeam.shortName || match.awayTeam.name,
      crest: match.awayTeam.crest,
    };
  }
  return {
    name: match.homeTeam.name,
    shortName: match.homeTeam.shortName || match.homeTeam.name,
    crest: match.homeTeam.crest,
  };
}

// ─── Sous-composants ────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string; bg: string }> = {
    SCHEDULED: {
      label: "Programmé",
      color: "#9ca3af",
      bg: "rgba(156,163,175,0.15)",
    },
    LIVE: {
      label: "• EN DIRECT",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.15)",
    },
    IN_PLAY: {
      label: "• EN COURS",
      color: "#22c55e",
      bg: "rgba(34,197,94,0.15)",
    },
    PAUSED: {
      label: "Mi-temps",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.15)",
    },
    FINISHED: {
      label: "Terminé",
      color: "#6b7280",
      bg: "rgba(107,114,128,0.1)",
    },
    POSTPONED: {
      label: "Reporté",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
    },
    CANCELLED: {
      label: "Annulé",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.15)",
    },
    TIMED: {
      label: "Programmé",
      color: "#9ca3af",
      bg: "rgba(156,163,175,0.15)",
    },
  };
  const info = map[status] || {
    label: status,
    color: "#9ca3af",
    bg: "rgba(156,163,175,0.15)",
  };
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.05em",
        padding: "2px 8px",
        borderRadius: 20,
        color: info.color,
        background: info.bg,
        textTransform: "uppercase" as const,
        whiteSpace: "nowrap" as const,
      }}
    >
      {info.label}
    </span>
  );
}

function TeamCrest({
  src,
  alt,
  size = 36,
}: {
  src: string;
  alt: string;
  size?: number;
}) {
  const [error, setError] = useState(false);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      {error ? (
        <svg
          width={size * 0.55}
          height={size * 0.55}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#6b7280"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
      ) : (
        <img
          src={src}
          alt={alt}
          onError={() => setError(true)}
          style={{
            width: size * 0.75,
            height: size * 0.75,
            objectFit: "contain",
          }}
        />
      )}
    </div>
  );
}

function PSGLogoComponent({ size = 44 }: { size?: number }) {
  const [src, setSrc] = useState(PSG_LOGO_SUPABASE);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "rgba(0,40,130,0.25)",
        border: "2px solid rgba(0,40,130,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <img
        src={src}
        alt="PSG"
        onError={() => setSrc(PSG_LOGO_FALLBACK)}
        style={{
          width: size * 0.8,
          height: size * 0.8,
          objectFit: "contain",
        }}
      />
    </div>
  );
}

function MatchCardItem({ match }: { match: Match }) {
  const opponent = getOpponent(match);
  const isHome = isPSGHome(match);
  const { time, relative } = formatDate(match.utcDate);
  const isLive = ["LIVE", "IN_PLAY", "PAUSED"].includes(match.status);
  const isFinished = match.status === "FINISHED";
  const compColor = getCompetitionColor(match.competition.name);

  const score =
    isFinished || isLive
      ? `${match.score.fullTime.home ?? 0} - ${
          match.score.fullTime.away ?? 0
        }`
      : null;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #1e1e2e 0%, #16161f 100%)",
        borderRadius: 16,
        border: isLive
          ? "1px solid rgba(34,197,94,0.4)"
          : "1px solid rgba(255,255,255,0.06)",
        overflow: "hidden",
        position: "relative",
        boxShadow: isLive
          ? "0 0 20px rgba(34,197,94,0.1)"
          : "0 2px 8px rgba(0,0,0,0.3)",
        marginBottom: 12,
      }}
    >
      {/* Competition banner */}
      <div
        style={{
          background: compColor,
          padding: "6px 14px",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <TeamCrest
          src={match.competition.emblem}
          alt={match.competition.name}
          size={18}
        />
        <span
          style={{
            fontSize: 11,
            fontWeight: 600,
            color: "rgba(255,255,255,0.9)",
            letterSpacing: "0.03em",
            flex: 1,
          }}
        >
          {match.competition.name}
        </span>
        <StatusBadge status={match.status} />
      </div>

      {/* Match body */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* PSG side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flex: 1,
          }}
        >
          <PSGLogoComponent size={44} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#e2e8f0",
              textAlign: "center",
            }}
          >
            PSG
          </span>
          {isHome && (
            <span
              style={{
                fontSize: 9,
                color: "#7c3aed",
                fontWeight: 600,
                background: "rgba(124,58,237,0.12)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              DOMICILE
            </span>
          )}
          {!isHome && (
            <span
              style={{
                fontSize: 9,
                color: "#9ca3af",
                fontWeight: 600,
                background: "rgba(156,163,175,0.1)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              EXTÉRIEUR
            </span>
          )}
        </div>

        {/* Center: score or time */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
            minWidth: 70,
          }}
        >
          {score ? (
            <span
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: isLive ? "#22c55e" : "#f9fafb",
                letterSpacing: "0.05em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {score}
            </span>
          ) : (
            <>
              <span
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#7c3aed",
                  letterSpacing: "0.05em",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {time}
              </span>
              <span
                style={{
                  fontSize: 10,
                  color: "#6b7280",
                  fontWeight: 500,
                }}
              >
                VS
              </span>
            </>
          )}
          <span
            style={{
              fontSize: 10,
              color: "#9ca3af",
              fontWeight: 500,
              textAlign: "center",
            }}
          >
            {relative}
          </span>
        </div>

        {/* Opponent side */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 6,
            flex: 1,
          }}
        >
          <TeamCrest src={opponent.crest} alt={opponent.name} size={44} />
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#e2e8f0",
              textAlign: "center",
              maxWidth: 72,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {opponent.shortName || opponent.name}
          </span>
          {!isHome && (
            <span
              style={{
                fontSize: 9,
                color: "#7c3aed",
                fontWeight: 600,
                background: "rgba(124,58,237,0.12)",
                padding: "1px 6px",
                borderRadius: 4,
              }}
            >
              DOMICILE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Composant principal exporté ────────────────────────────────────────────

export default function PSGMatchCard() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchMatches = useCallback(async () => {
    const apiKey = import.meta.env.VITE_FOOTBALL_DATA_API_KEY;
    if (!apiKey) {
      setError("Clé API football-data.org manquante (VITE_FOOTBALL_DATA_API_KEY)");
      setLoading(false);
      return;
    }

    try {
      // Fenêtre: aujourd'hui → +60 jours + 10 derniers matchs terminés
      const today = new Date();
      const dateFrom = new Date(today);
      dateFrom.setDate(today.getDate() - 10);
      const dateTo = new Date(today);
      dateTo.setDate(today.getDate() + 60);

      const fmt = (d: Date) => d.toISOString().split("T")[0];

      const url = `${API_BASE}/teams/${PSG_TEAM_ID}/matches?dateFrom=${fmt(
        dateFrom
      )}&dateTo=${fmt(dateTo)}&status=SCHEDULED,TIMED,IN_PLAY,PAUSED,LIVE,FINISHED`;

      const res = await fetch(url, {
        headers: {
          "X-Auth-Token": apiKey,
        },
      });

      if (res.status === 429) {
        throw new Error("Limite API atteinte, réessai dans quelques minutes.");
      }
      if (res.status === 403) {
        throw new Error("Accès refusé: vérifiez votre clé API et les droits d'accès.");
      }
      if (!res.ok) {
        throw new Error(`Erreur API: ${res.status} ${res.statusText}`);
      }

      const data: ApiResponse = await res.json();

      if (data.errorCode) {
        throw new Error(data.message || `Erreur API code ${data.errorCode}`);
      }

      // Trier par date, limiter à 10 matchs
      const sorted = (data.matches || [])
        .sort(
          (a, b) =>
            new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime()
        )
        .slice(0, 10);

      setMatches(sorted);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Erreur de chargement des matchs"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch initial + rafraîchissement toutes les 30 minutes
  useEffect(() => {
    fetchMatches();

    intervalRef.current = setInterval(() => {
      fetchMatches();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [fetchMatches]);

  // ── Rendu états ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div
        style={{
          padding: 24,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 16,
        }}
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: "100%",
              height: 110,
              borderRadius: 16,
              background: "linear-gradient(90deg, #1e1e2e 25%, #2a2a3e 50%, #1e1e2e 75%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 1.4s infinite",
            }}
          />
        ))}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          margin: 16,
          padding: 20,
          borderRadius: 16,
          background: "rgba(239,68,68,0.08)",
          border: "1px solid rgba(239,68,68,0.2)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 12,
        }}
      >
        <svg
          width={32}
          height={32}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#ef4444"
          strokeWidth={1.5}
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 4h.01" strokeLinecap="round" />
        </svg>
        <p
          style={{
            color: "#fca5a5",
            fontSize: 13,
            textAlign: "center",
            margin: 0,
          }}
        >
          {error}
        </p>
        <button
          onClick={fetchMatches}
          style={{
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#fca5a5",
            borderRadius: 10,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div
        style={{
          padding: 40,
          textAlign: "center",
          color: "#6b7280",
          fontSize: 14,
        }}
      >
        Aucun match trouvé pour le PSG.
      </div>
    );
  }

  return (
    <div style={{ padding: "0 16px 24px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          paddingTop: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <PSGLogoComponent size={32} />
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 16,
                fontWeight: 700,
                color: "#f1f5f9",
              }}
            >
              Paris Saint-Germain
            </h2>
            <p style={{ margin: 0, fontSize: 11, color: "#6b7280" }}>
              Prochains matchs
            </p>
          </div>
        </div>
        <button
          onClick={fetchMatches}
          aria-label="Rafraîchir les matchs"
          style={{
            background: "rgba(124,58,237,0.12)",
            border: "1px solid rgba(124,58,237,0.25)",
            borderRadius: 10,
            padding: "6px 10px",
            cursor: "pointer",
            color: "#a78bfa",
            fontSize: 16,
            lineHeight: 1,
          }}
        >
          ↻
        </button>
      </div>

      {/* Dernière mise à jour */}
      {lastUpdated && (
        <p
          style={{
            fontSize: 10,
            color: "#4b5563",
            textAlign: "right",
            margin: "0 0 12px",
          }}
        >
          Mis à jour: {lastUpdated.toLocaleTimeString("fr-FR")} · Auto /{" "}
          {REFRESH_INTERVAL / 60000}min
        </p>
      )}

      {/* Liste des matchs */}
      {matches.map((match) => (
        <MatchCardItem key={match.id} match={match} />
      ))}
    </div>
  );
}