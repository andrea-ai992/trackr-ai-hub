code corrigé complet ci-dessous.

```jsx
import { useState, useEffect } from 'react';

const PSG_TEAM_ID = 524;
const API_BASE = 'https://api.football-data.org/v4';

const COLORS = {
  blue: '#004170',
  red: '#DA291C',
  gold: '#FFD700',
  white: '#FFFFFF',
  lightBlue: '#E8F4FD',
  gray: '#6B7280',
  lightGray: '#F3F4F6',
  border: '#E5E7EB',
};

const COMPETITION_LABELS = {
  CL: 'Ligue des Champions',
  FL1: 'Ligue 1',
  CDF: 'Coupe de France',
  UEFA: 'UEFA',
  FIFA: 'Mondial des Clubs',
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const isToday = date.toDateString() === now.toDateString();
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const timeStr = date.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isToday) return { label: "Aujourd'hui", time: timeStr, isToday: true };
  if (isTomorrow) return { label: 'Demain', time: timeStr, isTomorrow: true };

  const dayStr = date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return { label: dayStr, time: timeStr };
}

function getDaysUntil(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  return Math.ceil((date - now) / (1000 * 60 * 60 * 24));
}

function CompetitionBadge({ code, name }) {
  const label = COMPETITION_LABELS[code] || name || code;
  const isCL = code === 'CL';
  const isFL1 = code === 'FL1';

  return (
    <span
      style={{
        fontSize: '10px',
        fontWeight: '700',
        padding: '2px 7px',
        borderRadius: '10px',
        backgroundColor: isCL ? COLORS.gold : isFL1 ? COLORS.red : COLORS.blue,
        color: isCL ? '#1a1a1a' : COLORS.white,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        whiteSpace: 'nowrap',
        flexShrink: 0,
      }}
    >
      {isCL ? '★ UCL' : isFL1 ? 'L1' : label.slice(0, 6)}
    </span>
  );
}

function MatchCard({ match, index }) {
  const isHome = match.homeTeam?.id === PSG_TEAM_ID;
  const opponent = isHome ? match.awayTeam : match.homeTeam;
  const dateInfo = formatDate(match.utcDate);
  const daysUntil = getDaysUntil(match.utcDate);
  const isUrgent = daysUntil <= 1;
  const isNext = index === 0;

  return (
    <div
      style={{
        background: COLORS.white,
        borderRadius: '12px',
        padding: '14px 16px',
        marginBottom: '10px',
        border: `1.5px solid ${isNext ? COLORS.blue : COLORS.border}`,
        boxShadow: isNext
          ? '0 2px 12px rgba(0,65,112,0.13)'
          : '0 1px 4px rgba(0,0,0,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {isNext && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.red})`,
          }}
        />
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '6px',
            }}
          >
            <CompetitionBadge
              code={match.competition?.code}
              name={match.competition?.name}
            />
            {isNext && (
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: COLORS.blue,
                  background: COLORS.lightBlue,
                  padding: '2px 7px',
                  borderRadius: '10px',
                }}
              >
                Prochain
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '4px',
            }}
          >
            <span style={{ fontSize: '20px' }}>
              {opponent?.crest ? (
                <img
                  src={opponent.crest}
                  alt={opponent.shortName || opponent.name}
                  style={{
                    width: '28px',
                    height: '28px',
                    objectFit: 'contain',
                    borderRadius: '4px',
                  }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              ) : (
                '⚽'
              )}
            </span>
            <div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#111827',
                  lineHeight: 1.2,
                }}
              >
                {isHome ? 'PSG' : opponent?.shortName || opponent?.name || '?'}{' '}
                <span style={{ color: COLORS.gray, fontWeight: '400' }}>vs</span>{' '}
                {isHome ? opponent?.shortName || opponent?.name || '?' : 'PSG'}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: COLORS.gray,
                  marginTop: '1px',
                }}
              >
                {isHome ? '🏠 Domicile' : '✈️ Extérieur'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '700',
              color: isUrgent ? COLORS.red : COLORS.blue,
              lineHeight: 1.2,
            }}
          >
            {dateInfo.label}
          </div>
          <div style={{ fontSize: '12px', color: COLORS.gray, marginTop: '2px' }}>
            {dateInfo.time}
          </div>
          {daysUntil > 1 && (
            <div style={{ fontSize: '10px', color: COLORS.gray, marginTop: '2px' }}>
              dans {daysUntil}j
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PSGLogo() {
  return (
    <div
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: COLORS.blue,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: '0 2px 8px rgba(0,65,112,0.3)',
      }}
    >
      <span style={{ fontSize: '18px' }}>⚽</span>
    </div>
  );
}

export default function PSGWidget() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const apiKey = import.meta.env.VITE_FOOTBALL_API_KEY;

  const fetchMatches = async () => {
    if (!apiKey) {
      setError('Clé API manquante (VITE_FOOTBALL_API_KEY)');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await fetch(
        `${API_BASE}/teams/${PSG_TEAM_ID}/matches?status=SCHEDULED&limit=5`,
        { headers: { 'X-Auth-Token': apiKey } }
      );

      if (!res.ok) {
        if (res.status === 429) throw new Error('Limite API atteinte, réessayez plus tard');
        if (res.status === 403) throw new Error('Clé API invalide ou accès refusé');
        throw new Error(`Erreur API: ${res.status}`);
      }

      const data = await res.json();
      const sorted = (data.matches || [])
        .filter((m) => new Date(m.utcDate) > new Date())
        .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
        .slice(0, 5);

      setMatches(sorted);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        background: COLORS.lightGray,
        borderRadius: '16px',
        padding: '16px',
        width: '100%',
        maxWidth: '420px',
        margin: '0 auto',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <PSGLogo />
          <div>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '800',
                color: COLORS.blue,
                lineHeight: 1.1,
              }}
            >
              Paris Saint-Germain
            </div>
            <div style={{ fontSize: '11px', color: COLORS.gray, marginTop: '1px' }}>
              Prochains matchs
            </div>
          </div>
        </div>

        <button
          onClick={fetchMatches}
          disabled={loading}
          style={{
            background: 'none',
            border: `1.5px solid ${COLORS.border}`,
            borderRadius: '8px',
            padding: '6px 8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            color: COLORS.gray,
            fontSize: '14px',
            opacity: loading ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}
          aria-label="Rafraîchir"
        >
          🔄
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 0',
            color: COLORS.gray,
            fontSize: '13px',
          }}
        >
          Chargement des matchs…
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div
          style={{
            background: '#FEF2F2',
            border: `1px solid #FECACA`,
            borderRadius: '10px',
            padding: '14px',
            color: COLORS.red,
            fontSize: '13px',
            textAlign: 'center',
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Matches list */}
      {!loading && !error && matches.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '32px 0',
            color: COLORS.gray,
            fontSize: '13px',
          }}
        >
          Aucun match programmé pour le moment.
        </div>
      )}

      {!loading && !error && matches.map((match, index) => (
        <MatchCard key={match.id} match={match} index={index} />
      ))}

      {/* Footer */}
      {lastUpdated && (
        <div
          style={{
            fontSize: '10px',
            color: COLORS.gray,
            textAlign: 'right',
            marginTop: '4px',
          }}
        >
          Mis à jour à{' '}
          {lastUpdated.toLocaleTimeString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      )}
    </div>
  );
}