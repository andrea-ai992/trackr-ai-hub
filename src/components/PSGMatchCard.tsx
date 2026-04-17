// src/components/PSGMatchCard.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";

const PSG_TEAM_ID = 524;
const API_KEY = import.meta.env.VITE_FOOTBALL_DATA_API_KEY as string;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const PSG_LOGO_CACHE_PATH = `${SUPABASE_URL}/storage/v1/object/public/logos/psg-logo.png`;
const PSG_LOGO_FALLBACK =
  "https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/180px-Paris_Saint-Germain_F.C..svg.png";
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='36' height='36'%3E%3Crect width='36' height='36' fill='%23334155'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-size='14'%3E%3F%3C/text%3E%3C/svg%3E";
const REFRESH_INTERVAL_MS = 30 * 60 * 1000;

interface Match {
  id: number;
  utcDate: string;
  competition: {
    name: string;
    emblem?: string;
  };
  homeTeam: {
    id: number;
    name: string;
    crest?: string;
  };
  awayTeam: {
    id: number;
    name: string;
    crest?: string;
  };
  status: string;
}

interface MatchesResponse {
  matches: Match[];
}

function formatDate(utcDate: string): string {
  const date = new Date(utcDate);
  return date.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Paris",
  });
}

function getOpponent(
  match: Match
): { name: string; crest?: string; psgIsHome: boolean } {
  if (match.homeTeam.id === PSG_TEAM_ID) {
    return {
      name: match.awayTeam.name,
      crest: match.awayTeam.crest,
      psgIsHome: true,
    };
  }
  return {
    name: match.homeTeam.name,
    crest: match.homeTeam.crest,
    psgIsHome: false,
  };
}

// Inject keyframes once
const SPIN_STYLE_ID = "psg-spin-keyframes";
if (typeof document !== "undefined" && !document.getElementById(SPIN_STYLE_ID)) {
  const style = document.createElement("style");
  style.id = SPIN_STYLE_ID;
  style.textContent = `@keyframes psg-spin { to { transform: rotate(360deg); } }`;
  document.head.appendChild(style);
}

const PSGMatchCard: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [logoError, setLogoError] = useState<boolean>(false);
  const abortRef = useRef<AbortController | null>(null);

  const fetchMatches = useCallback(async (isBackground = false) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (isBackground) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const today = new Date();
      const future = new Date();
      future.setDate(today.getDate() + 90);
      const dateFrom = today.toISOString().split("T")[0];
      const dateTo = future.toISOString().split("T")[0];

      const response = await fetch(
        `https://api.football-data.org/v4/teams/${PSG_TEAM_ID}/matches?status=SCHEDULED&dateFrom=${dateFrom}&dateTo=${dateTo}`,
        {
          headers: { "X-Auth-Token": API_KEY },
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        if (response.status === 429)
          throw new Error("Limite de requêtes atteinte. Réessayez dans quelques instants.");
        if (response.status === 403)
          throw new Error("Clé API invalide ou accès refusé.");
        throw new Error(`Erreur API: ${response.status}`);
      }

      const data: MatchesResponse = await response.json();
      // Limit to 5 client-side
      setMatches((data.matches || []).slice(0, 5));
      setLastUpdated(new Date());
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(
        err instanceof Error ? err.message : "Une erreur inconnue est survenue."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches(false);
    const interval = setInterval(() => fetchMatches(true), REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      abortRef.current?.abort();
    };
  }, [fetchMatches]);

  const psgLogo = logoError ? PSG_LOGO_FALLBACK : PSG_LOGO_CACHE_PATH;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <img
          src={psgLogo}
          alt="Logo PSG"
          style={styles.psgLogo}
          onError={() => setLogoError(true)}
        />
        <div style={styles.headerText}>
          <h2 style={styles.title}>Prochains matchs du PSG</h2>
          {lastUpdated && (
            <span style={styles.lastUpdated}>
              Mis à jour : {lastUpdated.toLocaleTimeString("fr-FR")}
              {refreshing && " ↻"}
            </span>
          )}
        </div>
        <button
          onClick={() => fetchMatches(false)}
          style={styles.refreshButton}
          disabled={loading || refreshing}
          aria-label="Rafraîchir les matchs"
        >
          {loading || refreshing ? "⏳" : "🔄"}
        </button>
      </div>

      {loading && matches.length === 0 && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner} />
          <p style={styles.loadingText}>Chargement des matchs…</p>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer} role="alert">
          <span style={styles.errorIcon}>⚠️</span>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => fetchMatches(false)} style={styles.retryButton}>
            Réessayer
          </button>
        </div>
      )}

      {!loading && !error && matches.length === 0 && (
        <div style={styles.emptyContainer}>
          <p style={styles.emptyText}>
            Aucun match programmé dans les 90 prochains jours.
          </p>
        </div>
      )}

      <div style={styles.matchList}>
        {matches.map((match) => {
          const { name: opponentName, crest: opponentCrest, psgIsHome } = getOpponent(match);

          // PSG always left (home), opponent always right (away) — swap display if PSG is away
          const leftName = psgIsHome ? "PSG" : opponentName;
          const leftLogo = psgIsHome ? psgLogo : opponentCrest || PLACEHOLDER_IMG;
          const rightName = psgIsHome ? opponentName : "PSG";
          const rightLogo = psgIsHome ? opponentCrest || PLACEHOLDER_IMG : psgLogo;

          return (
            <div key={match.id} style={styles.matchCard}>
              <div style={styles.competitionRow}>
                {match.competition.emblem && (
                  <img
                    src={match.competition.emblem}
                    alt={match.competition.name}
                    style={styles.competitionLogo}
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
                <span style={styles.competitionName}>
                  {match.competition.name}
                </span>
              </div>

              <div style={styles.teamsRow}>
                <div style={styles.teamBlock}>
                  <img
                    src={leftLogo}
                    alt={leftName}
                    style={styles.teamLogo}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                    }}
                  />
                  <span style={styles.teamName}>{leftName}</span>
                </div>

                <div style={styles.vsBlock}>
                  <span style={styles.vsText}>VS</span>
                </div>

                <div style={styles.teamBlock}>
                  <img
                    src={rightLogo}
                    alt={rightName}
                    style={styles.teamLogo}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = PLACEHOLDER_IMG;
                    }}
                  />
                  <span style={styles.teamName}>{rightName}</span>
                </div>
              </div>

              <div style={styles.matchMeta}>
                <span style={styles.matchDate}>📅 {formatDate(match.utcDate)}</span>
                <span style={styles.matchVenue}>
                  {psgIsHome ? "🏟️ Domicile" : "✈️ Extérieur"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <span style={styles.footerText}>
          Données : football-data.org • Rafraîchissement auto toutes les 30 min
        </span>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: "#0a0a1a",
    borderRadius: "16px",
    padding: "16px",
    maxWidth: "480px",
    margin: "0 auto",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    boxShadow: "0 4px 24px rgba(0,60,135,0.4)",
    border: "1px solid rgba(0,60,135,0.3)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "16px",
    paddingBottom: "12px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  psgLogo: {
    width: "48px",
    height: "48px",
    objectFit: "contain",
    flexShrink: 0,
  },
  headerText: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  title: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 700,
    color: "#ffffff",
    lineHeight: 1.2,
  },
  lastUpdated: {
    fontSize: "11px",
    color: "rgba(255,255,255,0.4)",
  },
  refreshButton: {
    background: "rgba(0,60,135,0.3)",
    border: "1px solid rgba(0,60,135,0.6)",
    borderRadius: "8px",
    padding: "6px 10px",
    cursor: "pointer",
    fontSize: "16px",
    color: "#fff",
    flexShrink: 0,
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "32px 16px",
    gap: "12px",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid rgba(0,60,135,0.3)",
    borderTopColor: "#003C87",
    borderRadius: "50%",
    animation: "psg-spin 0.8s linear infinite",
  },
  loadingText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: "14px",
    margin: 0,
  },
  errorContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "24px 16px",
    gap: "8px",
    backgroundColor: "rgba(220,38,38,0.1)",
    borderRadius: "12px",
    border: "1px solid rgba(220,38,38,0.2)",
    margin: "8px 0",
  },
  errorIcon: { fontSize: "24px" },
  errorText: {
    color: "#f87171",
    fontSize: "13px",
    margin: 0,
    textAlign: "center",
  },
  retryButton: {
    marginTop: "8px",
    padding: "8px 20px",
    backgroundColor: "#003C87",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: 600,
  },
  emptyContainer: {
    padding: "24px 16px",
    textAlign: "center",
  },
  emptyText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: "14px",
    margin: 0,
  },
  matchList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "8px",
  },
  matchCard: {
    backgroundColor: "rgba(0,60,135,0.15)",
    borderRadius: "12px",
    padding: "12px",
    border: "1px solid rgba(0,60,135,0.25)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  competitionRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  competitionLogo: {
    width: "18px",
    height: "18px",
    objectFit: "contain",
  },
  competitionName: {
    fontSize: "11px",
    fontWeight: 600,
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  teamsRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  teamBlock: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    flex: 1,
  },
  teamLogo: {
    width: "36px",
    height: "36px",
    objectFit: "contain",
  },
  teamName: {
    fontSize: "12px",
    fontWeight: 600,
    color: "#ffffff",
    textAlign: "center",
    lineHeight: 1.2,
  },
  vsBlock: {
    flexShrink: 0,
    padding: "0 4px",
  },
  vsText: {
    fontSize: "13px",
    fontWeight: 800,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: "1px",
  },
  matchMeta: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "4px",
  },
  matchDate: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.7)",
  },
  matchVenue: {
    fontSize: "12px",
    color: "rgba(255,255,255,0.5)",
  },
  footer: {
    marginTop: "12px",
    paddingTop: "10px",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    textAlign: "center",
  },
  footerText: {
    fontSize: "10px",
    color: "rgba(255,255,255,0.25)",
  },
};

