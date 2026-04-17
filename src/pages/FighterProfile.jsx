// src/pages/FighterProfile.jsx
import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
const FIGHTERS_DB = {
  "islam-makhachev": {
    id: "islam-makhachev",
    name: "Islam Makhachev",
    nickname: "The Eagle's Successor",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Islam_Makhachev_UFC_280.jpg/440px-Islam_Makhachev_UFC_280.jpg",
    flag: "🇷🇺",
    country: "Russia",
    weightClass: "Lightweight",
    age: 32,
    height: '5\'10"',
    reach: '70.5"',
    stance: "Southpaw",
    ranking: "#1 P4P / Champion",
    record: { wins: 25, losses: 1, draws: 0 },
    winMethods: { ko: 9, sub: 9, dec: 7 },
    lossMethods: { ko: 0, sub: 1, dec: 0 },
    team: "AKA / Anzhi",
    debut: "2012",
    titles: ["UFC Lightweight Champion"],
    recentFights: [
      { opponent: "Dustin Poirier", result: "W", method: "SUB", round: 2, event: "UFC 302", date: "Jun 2024" },
      { opponent: "Alexander Volkanovski", result: "W", method: "DEC", round: 5, event: "UFC 294", date: "Oct 2023" },
      { opponent: "Alexander Volkanovski", result: "W", method: "SUB", round: 2, event: "UFC 284", date: "Feb 2023" },
      { opponent: "Charles Oliveira", result: "W", method: "SUB", round: 2, event: "UFC 280", date: "Oct 2022" },
      { opponent: "Bobby Green", result: "W", method: "TKO", round: 2, event: "UFC 268", date: "Jun 2022" },
    ],
  },
  "leon-edwards": {
    id: "leon-edwards",
    name: "Leon Edwards",
    nickname: "Rocky",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Leon_Edwards_UFC_Fight_Night_London_2022.jpg/440px-Leon_Edwards_UFC_Fight_Night_London_2022.jpg",
    flag: "🇬🇧",
    country: "England",
    weightClass: "Welterweight",
    age: 32,
    height: '6\'0"',
    reach: '74"',
    stance: "Orthodox",
    ranking: "#3 WW",
    record: { wins: 22, losses: 3, draws: 0 },
    winMethods: { ko: 10, sub: 2, dec: 10 },
    lossMethods: { ko: 2, sub: 0, dec: 1 },
    team: "Birmingham Sports Academy",
    debut: "2011",
    titles: ["Former UFC Welterweight Champion"],
    recentFights: [
      { opponent: "Belal Muhammad", result: "L", method: "DEC", round: 5, event: "UFC 304", date: "Jul 2024" },
      { opponent: "Colby Covington", result: "W", method: "DEC", round: 5, event: "UFC 296", date: "Dec 2023" },
      { opponent: "Kamaru Usman", result: "W", method: "DEC", round: 5, event: "UFC 286", date: "Mar 2023" },
      { opponent: "Kamaru Usman", result: "W", method: "KO", round: 5, event: "UFC 278", date: "Aug 2022" },
      { opponent: "Nate Diaz", result: "W", method: "DEC", round: 5, event: "UFC Fight Night", date: "Jan 2021" },
    ],
  },
  "belal-muhammad": {
    id: "belal-muhammad",
    name: "Belal Muhammad",
    nickname: "Remember The Name",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Belal_Muhammad_UFC_Fight_Night_189.jpg/440px-Belal_Muhammad_UFC_Fight_Night_189.jpg",
    flag: "🇺🇸",
    country: "USA",
    weightClass: "Welterweight",
    age: 36,
    height: '5\'11"',
    reach: '74"',
    stance: "Orthodox",
    ranking: "Champion WW",
    record: { wins: 23, losses: 3, draws: 1 },
    winMethods: { ko: 5, sub: 5, dec: 13 },
    lossMethods: { ko: 1, sub: 1, dec: 1 },
    team: "Strong Style MMA",
    debut: "2013",
    titles: ["UFC Welterweight Champion"],
    recentFights: [
      { opponent: "Leon Edwards", result: "W", method: "DEC", round: 5, event: "UFC 304", date: "Jul 2024" },
      { opponent: "Gilbert Burns", result: "W", method: "DEC", round: 5, event: "UFC Fight Night", date: "Mar 2024" },
      { opponent: "Sean Brady", result: "W", method: "DEC", round: 5, event: "UFC 280", date: "Nov 2023" },
      { opponent: "Vicente Luque", result: "W", method: "DEC", round: 3, event: "UFC Fight Night", date: "Apr 2023" },
      { opponent: "Shavkat Rakhmonov", result: "NC", method: "NC", round: 1, event: "UFC Fight Night", date: "Oct 2022" },
    ],
  },
};

const FEATURED_FIGHTS = [
  {
    id: "ufc-304",
    event: "UFC 304",
    date: "July 27, 2024",
    venue: "Co-op Live, Manchester",
    fighter1: FIGHTERS_DB["belal-muhammad"],
    fighter2: FIGHTERS_DB["leon-edwards"],
    result: { winner: "belal-muhammad", method: "DEC", round: 5, time: "5:00" },
    odds: { fighter1: -145, fighter2: +120 },
    weightClass: "Welterweight",
    isTitleFight: true,
    rounds: 5,
  },
];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function avatarFallback(name) {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1e40af&color=fff&size=80`;
}

function formatOdds(value) {
  return value > 0 ? `+${value}` : `${value}`;
}

function oddsColor(value) {
  return value < 0 ? "text-emerald-400" : "text-blue-400";
}

function resultColor(r) {
  if (r === "W") return "bg-emerald-500 text-white";
  if (r === "L") return "bg-red-500 text-white";
  if (r === "D") return "bg-yellow-500 text-black";
  return "bg-gray-600 text-white";
}

// ─────────────────────────────────────────────
// WIN-METHOD BAR
// ─────────────────────────────────────────────
function WinMethodBar({ methods, total, label, colorClass }) {
  if (total === 0) return null;
  const segments = [
    { key: "KO/TKO", value: methods.ko, color: colorClass === "emerald" ? "bg-red-500" : "bg-red-800" },
    { key: "SUB", value: methods.sub, color: colorClass === "emerald" ? "bg-blue-500" : "bg-blue-800" },
    { key: "DEC", value: methods.dec, color: colorClass === "emerald" ? "bg-emerald-500" : "bg-gray-600" },
  ];

  return (
    <div className="mt-2">
      <p className="text-gray-400 text-xs mb-1">{label}</p>
      <div className="flex rounded-full overflow-hidden h-3 w-full bg-gray-800">
        {segments.map((s) =>
          s.value > 0 ? (
            <div
              key={s.key}
              className={`${s.color} transition-all`}
              style={{ width: `${(s.value / total) * 100}%` }}
              title={`${s.key}: ${s.value}`}
            />
          ) : null
        )}
      </div>
      <div className="flex gap-3 mt-1">
        {segments.map((s) => (
          <span key={s.key} className="text-gray-400 text-xs">
            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${s.color}`} />
            {s.key} {s.value}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FIGHT CARD (reusable)
// ─────────────────────────────────────────────
export function FightCard({ fight }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  const {
    fighter1, fighter2, result, odds,
    event, date, venue, weightClass, isTitleFight, rounds,
  } = fight;

  const getBadge = (fighterId) => {
    if (!result) return null;
    if (result.winner === fighterId) return { label: "W", cls: "bg-emerald-500 text-white" };
    if (result.winner === "draw") return { label: "D", cls: "bg-yellow-500 text-black" };
    return { label: "L", cls: "bg-red-500 text-white" };
  };

  const badge1 = getBadge(fighter1.id);
  const badge2 = getBadge(fighter2.id);

  const FighterSide = ({ fighter, badge, oddsValue, side }) => (
    <div
      className={`flex flex-col items-center cursor-pointer group ${side === "right" ? "items-center" : "items-center"}`}
      onClick={() => navigate(`/mma/fighter/${fighter.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/mma/fighter/${fighter.id}`)}
      aria-label={`Voir le profil de ${fighter.name}`}
    >
      <div className="relative">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border-2 border-gray-600 group-hover:border-blue-500 transition-colors">
          <img
            src={fighter.image}
            alt={fighter.name}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = avatarFallback(fighter.name); }}
          />
        </div>
        {badge && (
          <span
            className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${badge.cls}`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <p className="text-white text-xs font-semibold text-center mt-2 leading-tight group-hover:text-blue-400 transition-colors">
        {fighter.name.split(" ").map((n, i) => (
          <span key={i} className="block">{n}</span>
        ))}
      </p>
      <span className="text-gray-500 text-xs mt-0.5">{fighter.flag}</span>
      {odds && oddsValue !== undefined && (
        <span className={`text-sm font-bold mt-1 ${oddsColor(oddsValue)}`}>
          {formatOdds(oddsValue)}
        </span>
      )}
      <span className="text-gray-500 text-xs">
        {fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws}
      </span>
    </div>
  );

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden shadow-xl hover:border-blue-500 transition-all duration-300">
      {/* Event header */}
      <div className="bg-gradient-to-r from-blue-900/60 to-purple-900/60 px-4 py-3 flex items-center justify-between border-b border-gray-700">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-bold text-sm">{event}</span>
            {isTitleFight && (
              <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                🏆 TITLE
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-0.5">
            {date} • {venue}
          </p>
        </div>
        <div className="text-right shrink-0">
          <span className="text-gray-400 text-xs block">{weightClass}</span>
          <span className="text-gray-500 text-xs">{rounds}R</span>
        </div>
      </div>

      {/* Face-off */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2 items-center">
          <FighterSide fighter={fighter1} badge={badge1} oddsValue={odds?.fighter1} side="left" />

          {/* VS + result */}
          <div className="flex flex-col items-center justify-center gap-2">
            <span className="text-gray-500 font-black text-xl">VS</span>
            {result ? (
              <button
                onClick={() => setExpanded((p) => !p)}
                className="bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl px-3 py-2 text-center transition-colors w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={expanded}
                aria-label="Voir le détail du résultat"
              >
                <span className="text-white text-xs font-bold block">{result.method}</span>
                <span className="text-gray-400 text-xs">
                  R{result.round} {result.time}
                </span>
              </button>
            ) : (
              <div className="text-blue-400 text-xs font-semibold text-center">UPCOMING</div>
            )}
          </div>

          <FighterSide fighter={fighter2} badge={badge2} oddsValue={odds?.fighter2} side="right" />
        </div>

        {/* Expanded details */}
        {expanded && result && (
          <div className="mt-4 pt-4 border-t border-gray-700 text-center animate-fade-in">
            <p className="text-gray-300 text-sm">
              <span className="text-white font-semibold">
                {result.winner === fighter1.id ? fighter1.name : fighter2.name}
              </span>{" "}
              wins by{" "}
              <span className="text-blue-400 font-semibold">{result.method}</span>
            </p>
            <p className="text-gray-500 text-xs mt-1">
              Round {result.round} — {result.time}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// FIGHTER PROFILE PAGE (default export)
// ─────────────────────────────────────────────
export default function FighterProfile() {
  const { fighterId } = useParams();
  const navigate = useNavigate();
  const fighter = FIGHTERS_DB[fighterId];

  if (!fighter) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-white text-xl font-bold">Combattant introuvable</p>
        <p className="text-gray-400 text-sm">ID: {fighterId}</p>
        <button
          onClick={() => navigate("/mma")}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          ← Retour au dashboard
        </button>
      </div>
    );
  }

  const totalWins = fighter.record.wins;
  const totalLosses = fighter.record.losses;
  const finishRate =
    totalWins > 0
      ? Math.round(((fighter.winMethods.ko + fighter.winMethods.sub) / totalWins) * 100)
      : 0;

  const relatedFights = FEATURED_FIGHTS.filter(
    (f) => f.fighter1.id === fighterId || f.fighter2.id === fighterId
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Back nav ── */}
      <div className="sticky top-0 z-20 bg-gray-950/90 backdrop-blur border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
          aria-label="Retour"
        >
          ←
        </button>
        <span className="text-white font-semibold text-sm truncate">{fighter.name}</span>
        <Link
          to="/mma"
          className="ml-auto text-blue-400 hover:text-blue-300 text-xs transition-colors"
        >
          Dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto px-4 pb-10">
        {/* ── Hero ── */}
        <div className="relative mt-6 rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent" />
          <div className="relative flex flex-col items-center pt-8 pb-6 px-4 text-center">
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-4 border-blue-500 shadow-lg shadow-blue-500/30">
              <img
                src={fighter.image}
                alt={fighter.name}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = avatarFallback(fighter.name); }}
              />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black mt-4 tracking-tight">
              {fighter.name}
            </h1>
            {fighter.nickname && (
              <p className="text-blue-400 text-sm italic mt-1">"{fighter.nickname}"</p>
            )}
            <div className="flex items-center gap-2 mt-2 flex-wrap justify-center">
              <span className="text-lg" aria-label={fighter.country}>{fighter.flag}</span>
              <span className="text-gray-400 text-sm">{fighter.country}</span>
              <span className="text-gray-600">•</span>
              <span className="text-gray-400 text-sm">{fighter.weightClass}</span>
            </div>

            {/* Ranking badge */}
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="bg-blue-600/30 border border-blue-500/50 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                🏅 {fighter.ranking}
              </span>
              {fighter.titles.map((t) => (
                <span
                  key={t}
                  className="bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 text-xs font-semibold px-3 py-1 rounded-full"
                >
                  🏆 {t}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* ── Record W/L/D ── */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {[
            { label: "Victoires", value: fighter.record.wins, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/30" },
            { label: "Défaites", value: fighter.record.losses, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
            { label: "Nuls", value: fighter.record.draws, color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30" },
          ].map(({ label, value, color, bg }) => (
            <div
              key={label}
              className={`${bg} border rounded-xl p-3 text-center`}
            >
              <p className={`text-3xl font-black ${color}`}>{value}</p>
              <p className="text-gray-400 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>

        {/* ── Finish rate ── */}
        <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300 text-sm font-semibold">Finish Rate</span>
            <span className="text-white font-black text-lg">{finishRate}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
              style={{ width: `${finishRate}%` }}
              role="progressbar"
              aria-valuenow={finishRate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Finish rate ${finishRate}%`}
            />
          </div>
        </div>

        {/* ── Win methods ── */}
        <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h2 className="text-white font-bold text-sm mb-3">Méthodes de victoire</h2>
          <WinMethodBar
            methods={fighter.winMethods}
            total={totalWins}
            label="Victoires"
            colorClass="emerald"
          />
          {totalLosses > 0 && (
            <WinMethodBar
              methods={fighter.lossMethods}
              total={totalLosses}
              label="Défaites"
              colorClass="red"
            />
          )}
        </div>

        {/* ── Physical stats ── */}
        <div className="mt-4 bg-gray-900 border border-gray-700 rounded-xl p-4">
          <h2 className="text-white font-bold text-sm mb-3">Informations</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
            {[
              { label: "Âge", value: fighter.age },
              { label: "Taille", value: fighter.height },
              { label: "Allonge", value: fighter.reach },
              { label: "Garde", value: fighter.stance },
              { label: "Team", value: fighter.team },
              { label: "Début pro", value: fighter.debut },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="text-gray-500 text-xs">{label}</dt>
                <dd className="text-white text-sm font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* ── Recent fights ── */}
        <div className="mt-6">
          <h2 className="text-white font-bold text-base mb-3">Combats récents</h2>
          <div className="space-y-2">
            {fighter.recentFights.map((f, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 flex items-center justify-between gap-2 hover:border-gray-500 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={`w-7 h-7 shrink-0 rounded-full flex items-center justify-center text-xs font-black ${resultColor(f.result)}`}
                    aria-label={f.result === "W" ? "Victoire" : f.result === "L" ? "Défaite" : f.result}
                  >
                    {f.result}
                  </span>
                  <div className="min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{f.opponent}</p>
                    <p className="text-gray-500 text-xs truncate">
                      {f.event} • {f.date}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-gray-300 text-xs font-semibold">{f.method}</span>
                  <p className="text-gray-500 text-xs">R{f.round}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Related FightCards ── */}
        {relatedFights.length > 0 && (
          <div className="mt-8">
            <h2 className="text-white font-bold text-base mb-3">Combats en vedette</h2>
            <div className="space-y-4">
              {relatedFights.map((fight) => (
                <FightCard key={fight.id} fight={fight} />
              ))}
            </div>
          </div>
        )}

        {/* ── All fighters nav ── */}
        <div className="mt-8">
          <h2 className="text-white font-bold text-base mb-3">Autres profils</h2>
          <div className="flex flex-wrap gap-2">
            {Object.values(FIGHTERS_DB)
              .filter((f) => f.id !== fighterId)
              .map((f) => (
                <Link
                  key={f.id}
                  to={`/mma/fighter/${f.id}`}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-blue-500 rounded-xl px-3 py-2 transition-all text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <span>{f.flag}</span>
                  <span className="font-medium">{f.name}</span>
                </Link>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
```

```jsx
// src/pages/MMADashboard.jsx  — section routes à ajouter dans App.jsx ou router
// Exemple d'intégration dans App.jsx :
//
// import { BrowserRouter, Routes, Route } from "react-router-dom";
// import MMADashboard from "./pages/MMADashboard";
// import FighterProfile from "./pages/FighterProfile";
//
// <Routes>
//   <Route path="/mma" element={<MMADashboard />} />
//   <Route path="/mma/fighter/:fighterId" element={<FighterProfile />} />
// </Routes>
//
// Dans MMADashboard, lien vers un profil :
// import { Link } from "react-router-dom";
