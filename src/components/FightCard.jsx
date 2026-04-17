// src/components/FightCard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

const OddsDisplay = ({ odds }) => {
  if (odds == null) return null;
  const formatted =
    typeof odds === "number"
      ? odds > 0
        ? `+${odds}`
        : `${odds}`
      : odds;
  const isPositive =
    typeof odds === "number" ? odds > 0 : typeof odds === "string" && odds.startsWith("+");
  return (
    <span
      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
        isPositive
          ? "bg-green-500/20 text-green-400 border border-green-500/30"
          : "bg-red-500/20 text-red-400 border border-red-500/30"
      }`}
    >
      {formatted}
    </span>
  );
};

const FighterSide = ({ fighter, isWinner, navigate }) => {
  return (
    <button
      type="button"
      onClick={() => fighter?.id && navigate(`/fighter/${fighter.id}`)}
      className={`flex flex-col items-center gap-2 flex-1 min-w-0 p-3 rounded-xl transition-all duration-200 ${
        fighter?.id
          ? "cursor-pointer hover:bg-white/5 active:scale-95"
          : "cursor-default"
      } ${isWinner ? "ring-1 ring-yellow-400/40 bg-yellow-400/5" : ""}`}
      aria-label={`Voir le profil de ${fighter?.name ?? "Combattant inconnu"}`}
    >
      <div className="relative">
        <div
          className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 transition-all duration-200 ${
            isWinner
              ? "border-yellow-400 shadow-lg shadow-yellow-400/30"
              : "border-white/20"
          }`}
        >
          {fighter?.image ? (
            <img
              src={fighter.image}
              alt={fighter?.name ?? "Combattant"}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>
        {isWinner && (
          <span
            className="absolute -top-1 -right-1 text-yellow-400 text-sm"
            title="Vainqueur"
            aria-label="Vainqueur"
          >
            👑
          </span>
        )}
        {fighter?.country && (
          <span
            className="absolute -bottom-1 -right-1 text-base"
            title={fighter.country}
            role="img"
            aria-label={fighter.country}
          >
            {fighter.flag ?? "🌍"}
          </span>
        )}
      </div>

      <div className="flex flex-col items-center gap-1 min-w-0 w-full">
        <p
          className={`text-sm sm:text-base font-bold text-center truncate w-full ${
            isWinner ? "text-yellow-300" : "text-white"
          }`}
          title={fighter?.name}
        >
          {fighter?.name ?? "TBD"}
        </p>
        {fighter?.nickname && (
          <p className="text-xs text-slate-400 italic truncate w-full text-center">
            &ldquo;{fighter.nickname}&rdquo;
          </p>
        )}
        {fighter?.record && (
          <p className="text-xs font-mono text-slate-300 bg-white/5 px-2 py-0.5 rounded-full">
            {fighter.record.wins}-{fighter.record.losses}
            {fighter.record.draws > 0 ? `-${fighter.record.draws}` : ""}
          </p>
        )}
        {fighter?.ranking != null && (
          <p className="text-xs text-blue-400 font-semibold">
            #{fighter.ranking}
          </p>
        )}
        {fighter?.odds != null && <OddsDisplay odds={fighter.odds} />}
      </div>
    </button>
  );
};

const ResultBadge = ({ result }) => {
  if (!result) return null;
  const { method, round, time, status } = result;

  const statusConfig = {
    win: {
      bg: "bg-green-500/20",
      text: "text-green-400",
      border: "border-green-500/30",
      label: "Résultat final",
    },
    draw: {
      bg: "bg-yellow-500/20",
      text: "text-yellow-400",
      border: "border-yellow-500/30",
      label: "Match nul",
    },
    nc: {
      bg: "bg-slate-500/20",
      text: "text-slate-400",
      border: "border-slate-500/30",
      label: "No Contest",
    },
    upcoming: {
      bg: "bg-blue-500/20",
      text: "text-blue-400",
      border: "border-blue-500/30",
      label: "À venir",
    },
  };

  const cfg = statusConfig[status] ?? statusConfig.upcoming;

  return (
    <div
      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg border ${cfg.bg} ${cfg.border}`}
      role="region"
      aria-label={cfg.label}
    >
      {method && (
        <p className={`text-xs font-bold uppercase tracking-widest ${cfg.text}`}>
          {method}
        </p>
      )}
      {(round || time) && (
        <p className="text-xs text-slate-400">
          {round && `R${round}`}
          {round && time && " · "}
          {time && time}
        </p>
      )}
    </div>
  );
};

const FightCard = ({ fight, className = "", showEvent = false, compact = false }) => {
  const navigate = useNavigate();

  if (!fight) {
    return (
      <div
        className="bg-slate-800/50 rounded-2xl p-4 animate-pulse"
        aria-busy="true"
        aria-label="Chargement du combat"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-700" />
            <div className="h-4 w-20 bg-slate-700 rounded" />
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-6 w-10 bg-slate-700 rounded" />
          </div>
          <div className="flex-1 flex flex-col items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-slate-700" />
            <div className="h-4 w-20 bg-slate-700 rounded" />
          </div>
        </div>
      </div>
    );
  }

  const {
    fighter1,
    fighter2,
    result,
    event,
    weightClass,
    isTitleFight,
    isMainEvent,
    date,
    description,
  } = fight;

  const winner1 = result?.winnerId != null && result.winnerId === fighter1?.id;
  const winner2 = result?.winnerId != null && result.winnerId === fighter2?.id;
  const isUpcoming = !result || result.status === "upcoming";
  const statusText = isUpcoming ? "À venir" : "Terminé";

  return (
    <article
      className={`relative bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 hover:border-white/20 hover:shadow-xl hover:shadow-black/30 ${className}`}
      aria-label={`Combat: ${fighter1?.name ?? "TBD"} vs ${fighter2?.name ?? "TBD"}`}
    >
      {(isTitleFight || isMainEvent) && (
        <div
          className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent"
          aria-hidden="true"
        />
      )}

      {!compact && (
        <div className="px-4 pt-3 pb-0 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            {isTitleFight && (
              <span className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-0.5 rounded-full">
                🏆 Title Fight
              </span>
            )}
            {isMainEvent && !isTitleFight && (
              <span className="text-xs font-bold text-purple-400 bg-purple-400/10 border border-purple-400/30 px-2 py-0.5 rounded-full">
                Main Event
              </span>
            )}
            {weightClass && (
              <span className="text-xs text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                {weightClass}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                isUpcoming
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
              }`}
            >
              {statusText}
            </span>
            {showEvent && event && (
              <span
                className="text-xs text-slate-500 truncate max-w-[120px]"
                title={event}
              >
                {event}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-2">
          <FighterSide
            fighter={fighter1}
            isWinner={winner1}
            navigate={navigate}
          />

          <div className="flex flex-col items-center gap-2 flex-shrink-0">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 border border-white/10 shadow-inner">
              <span className="text-sm font-black text-white/80">VS</span>
            </div>
            {result && !isUpcoming && <ResultBadge result={result} />}
            {isUpcoming && date && !compact && (
              <p className="text-xs text-slate-500 text-center whitespace-nowrap">
                {new Date(date).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })}
              </p>
            )}
          </div>

          <FighterSide
            fighter={fighter2}
            isWinner={winner2}
            navigate={navigate}
          />
        </div>
      </div>

      {!compact && description && (
        <div className="px-4 pb-3 border-t border-white/5 pt-2">
          <p className="text-xs text-slate-400 leading-relaxed">{description}</p>
        </div>
      )}
    </article>
  );
};

