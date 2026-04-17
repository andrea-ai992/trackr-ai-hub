// src/pages/MMADashboard.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const mockEvents = [
  {
    id: 1,
    name: "UFC 310",
    date: "2024-12-07",
    location: "T-Mobile Arena, Las Vegas, NV",
    status: "completed",
    mainCard: [
      {
        id: "c1",
        fighter1: { id: "f6", name: "Alexandre Pantoja", record: "27-5-0", country: "🇧🇷", rank: "C" },
        fighter2: { id: "f_asakura", name: "Kai Asakura", record: "21-4-0", country: "🇯🇵", rank: "#1" },
        weightClass: "Flyweight",
        odds: { fighter1: "-180", fighter2: "+155" },
        result: { winner: "Alexandre Pantoja", method: "Decision (Unanimous)", round: 5, time: "5:00" },
        isTitleFight: true,
      },
      {
        id: "c2",
        fighter1: { id: "f_rakhmonov", name: "Shavkat Rakhmonov", record: "18-0-0", country: "🇰🇿", rank: "#2" },
        fighter2: { id: "f_garry", name: "Ian Machado Garry", record: "15-0-0", country: "🇮🇪", rank: "#4" },
        weightClass: "Welterweight",
        odds: { fighter1: "-145", fighter2: "+125" },
        result: { winner: "Shavkat Rakhmonov", method: "Submission (Rear Naked Choke)", round: 3, time: "3:22" },
        isTitleFight: false,
      },
      {
        id: "c3",
        fighter1: { id: "f_umar", name: "Umar Nurmagomedov", record: "18-0-0", country: "🇷🇺", rank: "#3" },
        fighter2: { id: "f_horiguchi", name: "Kyoji Horiguchi", record: "30-5-0", country: "🇯🇵", rank: "#8" },
        weightClass: "Bantamweight",
        odds: { fighter1: "-220", fighter2: "+185" },
        result: { winner: "Umar Nurmagomedov", method: "TKO (Punches)", round: 2, time: "4:15" },
        isTitleFight: false,
      },
    ],
    prelimCard: [
      {
        id: "p1",
        fighter1: { id: "f_curtis", name: "Chris Curtis", record: "31-10-0", country: "🇺🇸", rank: "NR" },
        fighter2: { id: "f_allen", name: "Brendan Allen", record: "24-5-0", country: "🇺🇸", rank: "#11" },
        weightClass: "Middleweight",
        odds: { fighter1: "+110", fighter2: "-130" },
        result: { winner: "Brendan Allen", method: "Decision (Split)", round: 3, time: "5:00" },
        isTitleFight: false,
      },
      {
        id: "p2",
        fighter1: { id: "f_kopylov", name: "Roman Kopylov", record: "12-2-0", country: "🇷🇺", rank: "NR" },
        fighter2: { id: "f_pyfer", name: "Joe Pyfer", record: "11-2-0", country: "🇺🇸", rank: "NR" },
        weightClass: "Middleweight",
        odds: { fighter1: "-160", fighter2: "+140" },
        result: { winner: "Roman Kopylov", method: "KO (Punch)", round: 1, time: "2:44" },
        isTitleFight: false,
      },
    ],
  },
  {
    id: 2,
    name: "UFC Fight Night 248",
    date: "2024-12-14",
    location: "UFC APEX, Las Vegas, NV",
    status: "completed",
    mainCard: [
      {
        id: "c4",
        fighter1: { id: "f_borralho", name: "Caio Borralho", record: "17-1-0", country: "🇧🇷", rank: "#3" },
        fighter2: { id: "f_craig", name: "Paul Craig", record: "17-7-1", country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rank: "NR" },
        weightClass: "Middleweight",
        odds: { fighter1: "-280", fighter2: "+230" },
        result: { winner: "Caio Borralho", method: "Decision (Unanimous)", round: 5, time: "5:00" },
        isTitleFight: false,
      },
    ],
    prelimCard: [
      {
        id: "p3",
        fighter1: { id: "f_ulberg", name: "Carlos Ulberg", record: "10-1-0", country: "🇳🇿", rank: "#14" },
        fighter2: { id: "f_reyes", name: "Dominick Reyes", record: "13-5-0", country: "🇺🇸", rank: "NR" },
        weightClass: "Light Heavyweight",
        odds: { fighter1: "-190", fighter2: "+162" },
        result: { winner: "Carlos Ulberg", method: "KO (Punch)", round: 1, time: "1:08" },
        isTitleFight: false,
      },
    ],
  },
  {
    id: 3,
    name: "UFC 311",
    date: "2025-01-18",
    location: "Intuit Dome, Los Angeles, CA",
    status: "upcoming",
    mainCard: [
      {
        id: "c5",
        fighter1: { id: "f2", name: "Islam Makhachev", record: "26-1-0", country: "🇷🇺", rank: "C" },
        fighter2: { id: "f_tsarukyan", name: "Arman Tsarukyan", record: "22-3-0", country: "🇦🇲", rank: "#1" },
        weightClass: "Lightweight",
        odds: { fighter1: "-300", fighter2: "+250" },
        result: null,
        isTitleFight: true,
      },
      {
        id: "c6",
        fighter1: { id: "f_dvalishvili", name: "Merab Dvalishvili", record: "17-4-0", country: "🇬🇪", rank: "C" },
        fighter2: { id: "f_umar", name: "Umar Nurmagomedov", record: "18-0-0", country: "🇷🇺", rank: "#3" },
        weightClass: "Bantamweight",
        odds: { fighter1: "-175", fighter2: "+150" },
        result: null,
        isTitleFight: true,
      },
    ],
    prelimCard: [
      {
        id: "p4",
        fighter1: { id: "f_moicano", name: "Renato Moicano", record: "20-5-1", country: "🇧🇷", rank: "#7" },
        fighter2: { id: "f_dariush", name: "Beneil Dariush", record: "22-7-1", country: "🇺🇸", rank: "NR" },
        weightClass: "Lightweight",
        odds: { fighter1: "-135", fighter2: "+115" },
        result: null,
        isTitleFight: false,
      },
    ],
  },
  {
    id: 4,
    name: "UFC Fight Night 249",
    date: "2025-02-01",
    location: "UFC APEX, Las Vegas, NV",
    status: "upcoming",
    mainCard: [
      {
        id: "c7",
        fighter1: { id: "f_ankalaev", name: "Magomed Ankalaev", record: "20-1-1", country: "🇷🇺", rank: "#1" },
        fighter2: { id: "f_rakic", name: "Aleksandar Rakic", record: "14-4-0", country: "🇦🇹", rank: "#6" },
        weightClass: "Light Heavyweight",
        odds: { fighter1: "-200", fighter2: "+170" },
        result: null,
        isTitleFight: false,
      },
    ],
    prelimCard: [
      {
        id: "p5",
        fighter1: { id: "f_omalley", name: "Sean O'Malley", record: "18-2-0", country: "🇺🇸", rank: "#2" },
        fighter2: { id: "f_vera", name: "Marlon Vera", record: "22-9-1", country: "🇪🇨", rank: "#5" },
        weightClass: "Bantamweight",
        odds: { fighter1: "-155", fighter2: "+133" },
        result: null,
        isTitleFight: false,
      },
    ],
  },
];

export const mockFighters = [
  {
    id: "f1",
    name: "Jon Jones",
    nickname: "Bones",
    country: "🇺🇸",
    weightClass: "Heavyweight",
    rank: "C",
    record: { wins: 27, losses: 1, draws: 0, nc: 1 },
    winMethods: { ko: 10, submission: 6, decision: 11 },
    stats: { slpm: 4.28, stracc: "57%", sapm: 2.21, strdef: "64%", tdavg: 1.93, tdacc: "44%", tddeff: "95%", subavg: 0.5 },
    age: 36, height: "6'4\"", reach: "84.5\"", stance: "Orthodox",
    streak: { type: "win", count: 3 },
  },
  {
    id: "f2",
    name: "Islam Makhachev",
    nickname: "",
    country: "🇷🇺",
    weightClass: "Lightweight",
    rank: "C",
    record: { wins: 26, losses: 1, draws: 0, nc: 0 },
    winMethods: { ko: 4, submission: 12, decision: 10 },
    stats: { slpm: 4.09, stracc: "55%", sapm: 1.97, strdef: "70%", tdavg: 3.64, tdacc: "50%", tddeff: "86%", subavg: 1.5 },
    age: 32, height: "5'10\"", reach: "70\"", stance: "Southpaw",
    streak: { type: "win", count: 13 },
  },
  {
    id: "f3",
    name: "Alex Pereira",
    nickname: "Poatan",
    country: "🇧🇷",
    weightClass: "Light Heavyweight",
    rank: "C",
    record: { wins: 12, losses: 2, draws: 0, nc: 0 },
    winMethods: { ko: 9, submission: 1, decision: 2 },
    stats: { slpm: 5.12, stracc: "52%", sapm: 3.48, strdef: "55%", tdavg: 0.46, tdacc: "28%", tddeff: "82%", subavg: 0.2 },
    age: 36, height: "6'4\"", reach: "79\"", stance: "Orthodox",
    streak: { type: "win", count: 5 },
  },
  {
    id: "f4",
    name: "Leon Edwards",
    nickname: "Rocky",
    country: "🇬🇧",
    weightClass: "Welterweight",
    rank: "C",
    record: { wins: 22, losses: 3, draws: 0, nc: 1 },
    winMethods: { ko: 8, submission: 2, decision: 12 },
    stats: { slpm: 3.34, stracc: "52%", sapm: 2.48, strdef: "61%", tdavg: 1.39, tdacc: "43%", tddeff: "84%", subavg: 0.1 },
    age: 32, height: "6'0\"", reach: "74\"", stance: "Orthodox",
    streak: { type: "win", count: 1 },
  },
  {
    id: "f5",
    name: "Dricus Du Plessis",
    nickname: "Stillknocks",
    country: "🇿🇦",
    weightClass: "Middleweight",
    rank: "C",
    record: { wins: 22, losses: 2, draws: 0, nc: 0 },
    winMethods: { ko: 10, submission: 5, decision: 7 },
    stats: { slpm: 4.76, stracc: "49%", sapm: 3.21, strdef: "58%", tdavg: 0.98, tdacc: "33%", tddeff: "78%", subavg: 0.4 },
    age: 30, height: "6'1\"", reach: "76\"", stance: "Orthodox",
    streak: { type: "win", count: 6 },
  },
  {
    id: "f6",
    name: "Alexandre Pantoja",
    nickname: "The Cannibal",
    country: "🇧🇷",
    weightClass: "Flyweight",
    rank: "C",
    record: { wins: 27, losses: 5, draws: 0, nc: 0 },
    winMethods: { ko: 5, submission: 11, decision: 11 },
    stats: { slpm: 5.08, stracc: "50%", sapm: 4.25, strdef: "51%", tdavg: 2.87, tdacc: "42%", tddeff: "67%", subavg: 1.8 },
    age: 33, height: "5'5\"", reach: "67\"", stance: "Orthodox",
    streak: { type: "win", count: 4 },
  },
];

const WEIGHT_CLASSES = [
  "All", "Heavyweight", "Light Heavyweight", "Middleweight",
  "Welterweight", "Lightweight", "Bantamweight", "Flyweight",
];

const getMethodColor = (method) => {
  if (!method) return "#94a3b8";
  if (method.includes("KO") || method.includes("TKO")) return "#ef4444";
  if (method.includes("Submission")) return "#f59e0b";
  if (method.includes("Decision")) return "#3b82f6";
  return "#94a3b8";
};

const getMethodIcon = (method) => {
  if (!method) return "⏳";
  if (method.includes("KO") || method.includes("TKO")) return "💥";
  if (method.includes("Submission")) return "🔒";
  if (method.includes("Decision")) return "📋";
  return "🏆";
};

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("fr-FR", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

const getDaysUntil = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  if (diff > 1) return `Dans ${diff} jours`;
  return `Il y a ${Math.abs(diff)} jours`;
};

// ─── FightCard Component ──────────────────────────────────────────────────────
export function FightCard({ fight, eventStatus, onFighterClick }) {
  const { fighter1, fighter2, weightClass, odds, result, isTitleFight } = fight;
  const isUpcoming = eventStatus === "upcoming";
  const winner = result?.winner;

  const f1Won = winner === fighter1.name;
  const f2Won = winner === fighter2.name;

  return (
    <article
      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 mb-3"
      aria-label={`Combat: ${fighter1.name} vs ${fighter2.name}`}
    >
      {/* Weight class header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {weightClass}
        </span>
        {isTitleFight && (
          <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded-full">
            🏆 Title Fight
          </span>
        )}
      </div>

      {/* Fighters face-to-face */}
      <div className="flex items-stretch">
        {/* Fighter 1 */}
        <button
          onClick={() => onFighterClick?.(fighter1.id)}
          className={`flex-1 flex flex-col items-center gap-1 p-3 text-center transition-colors
            ${f1Won ? "bg-green-900/30" : f2Won ? "bg-red-900/10" : "bg-transparent"}
            hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset`}
          aria-label={`Voir profil de ${fighter1.name}`}
        >
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span>{fighter1.country}</span>
            <span className="font-mono bg-gray-700 px-1 rounded text-yellow-400">
              {fighter1.rank}
            </span>
          </div>
          <span className={`font-bold text-sm leading-tight ${f1Won ? "text-green-400" : f2Won ? "text-gray-500" : "text-white"}`}>
            {fighter1.name}
          </span>
          <span className="text-xs text-gray-500">{fighter1.record}</span>
          <span
            className={`text-sm font-bold mt-1 ${
              parseFloat(odds.fighter1) < 0 ? "text-blue-400" : "text-orange-400"
            }`}
          >
            {odds.fighter1}
          </span>
          {f1Won && (
            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full mt-1">
              Victoire
            </span>
          )}
        </button>

        {/* VS divider */}
        <div className="flex flex-col items-center justify-center px-2 bg-gray-900/50 min-w-[40px]">
          <span className="text-xs font-black text-gray-500 tracking-widest">VS</span>
        </div>

        {/* Fighter 2 */}
        <button
          onClick={() => onFighterClick?.(fighter2.id)}
          className={`flex-1 flex flex-col items-center gap-1 p-3 text-center transition-colors
            ${f2Won ? "bg-green-900/30" : f1Won ? "bg-red-900/10" : "bg-transparent"}
            hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset`}
          aria-label={`Voir profil de ${fighter2.name}`}
        >
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <span className="font-mono bg-gray-700 px-1 rounded text-yellow-400">
              {fighter2.rank}
            </span>
            <span>{fighter2.country}</span>
          </div>
          <span className={`font-bold text-sm leading-tight ${f2Won ? "text-green-400" : f1Won ? "text-gray-500" : "text-white"}`}>
            {fighter2.name}
          </span>
          <span className="text-xs text-gray-500">{fighter2.record}</span>
          <span
            className={`text-sm font-bold mt-1 ${
              parseFloat(odds.fighter2) < 0 ? "text-blue-400" : "text-orange-400"
            }`}
          >
            {odds.fighter2}
          </span>
          {f2Won && (
            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full mt-1">
              Victoire
            </span>
          )}
        </button>
      </div>

      {/* Result / Upcoming banner */}
      {result ? (
        <div
          className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold"
          style={{ backgroundColor: `${getMethodColor(result.method)}18`, color: getMethodColor(result.method) }}
        >
          <span>{getMethodIcon(result.method)}</span>
          <span>{result.method}</span>
          <span className="text-gray-500">·</span>
          <span>R{result.round} {result.time}</span>
        </div>
      ) : (
        <div className="flex items-center justify-center gap-1 px-3 py-2 text-xs text-gray-400 bg-gray-900/30">
          <span>⏳</span>
          <span>À venir</span>
        </div>
      )}
    </article>
  );
}

// ─── MMADashboard ─────────────────────────────────────────────────────────────
export default function MMADashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("events");
  const [selectedWeight, setSelectedWeight] = useState("All");
  const [expandedEvent, setExpandedEvent] = useState(1);
  const [showPrelims, setShowPrelims] = useState({});

  const filteredEvents = mockEvents.filter((e) =>
    selectedWeight === "All"
      ? true
      : [...e.mainCard, ...e.prelimCard].some(
          (f) => f.weightClass === selectedWeight
        )
  );

  const togglePrelims = (eventId) =>
    setShowPrelims((prev) => ({ ...prev, [eventId]: !prev[eventId] }));

  const handleFighterClick = (fighterId) => {
    if (mockFighters.find((f) => f.id === fighterId)) {
      navigate(`/mma/fighter/${fighterId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-gray-800 px-4 py-3">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <h1 className="text-xl font-black tracking-tight">
              <span className="text-red-500">MMA</span> Hub
            </h1>
            <p className="text-xs text-gray-500">UFC Events & Fighters</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("events")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "events"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              aria-pressed={activeTab === "events"}
            >
              Événements
            </button>
            <button
              onClick={() => setActiveTab("fighters")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === "fighters"
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              aria-pressed={activeTab === "fighters")}
            >
              Combattants
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4">
        {/* Weight class filter */}
        <div
          className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide"
          role="group"
          aria-label="Filtre par catégorie de poids"
        >
          {WEIGHT_CLASSES.map((wc) => (
            <button
              key={wc}
              onClick={() => setSelectedWeight(wc)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                selectedWeight === wc
                  ? "bg-red-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
              aria-pressed={selectedWeight === wc}
            >
              {wc === "All" ? "Toutes" : wc}
            </button>
          ))}
        </div>

        {/* Events tab */}
        {activeTab === "events" && (
          <section aria-label="Liste des événements UFC">
            {filteredEvents.map((event) => {
              const isExpanded = expandedEvent === event.id;
              const isUpcoming = event.status === "upcoming";
              const mainFights =
                selectedWeight === "All"
                  ? event.mainCard
                  : event.mainCard.filter((f) => f.weightClass === selectedWeight);
              const prelimFights =
                selectedWeight === "All"
                  ? event.prelimCard
                  : event.prelimCard.filter((f) => f.weightClass === selectedWeight);

              return (
                <div
                  key={event.id}
                  className="mb-4 bg-gray-900 rounded-2xl overflow-hidden border border-gray-800"
                >
                  {/* Event header */}
                  <button
                    onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                    className="w-full flex items-start justify-between p-4 text-left hover:bg-gray-800/50 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-inset"
                    aria-expanded={isExpanded}
                    aria-controls={`event-${event.id}-content`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            isUpcoming
                              ? "bg-green-500/20 text-green-400"
                              : "bg-gray-700 text-gray-400"
                          }`}
                        >
                          {isUpcoming ? "🟢 À venir" : "✅ Terminé"}
                        </span>
                        {isUpcoming && (
                          <span className="text-xs text-blue-400 font-semibold">
                            {getDaysUntil(event.date)}
                          </span>
                        )}
                      </div>
                      <h2 className="font-black text-white text-lg leading-tight">
                        {event.name}
                      </h2>
                      <p className="text-xs text-gray-500 mt-0.5">
                        📅 {formatDate(event.date)}
                      </p>
                      <p className="text-xs text-gray-500">
                        📍 {event.location}
                      </p>
                    </div>
                    <span className="text-gray-500 text-lg ml-3 mt-1">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </button>

                  {/* Event fights */}
                  {isExpanded && (
                    <div id={`event-${event.id}-content`} className="px-3 pb-3">
                      {/* Main card */}
                      {mainFights.length > 0 && (
                        <>
                          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 mt-1">
                            Main Card
                          </p>
                          {mainFights.map((fight) => (
                            <FightCard
                              key={fight.id}
                              fight={fight}
                              eventStatus={event.status}
                              onFighterClick={handleFighterClick}
                            />
                          ))}
                        </>
                      )}

                      {/* Prelims toggle */}
                      {prelimFights.length > 0 && (
                        <>
                          <button
                            onClick={() => togglePrelims(event.id)}
                            className="w-full text-xs font-semibold text-gray-400 hover:text-white py-2 flex items-center justify-center gap-1 transition-colors"
                            aria-expanded={!!showPrelims[event.id]}
                          >
                            {showPrelims[event.id] ? "▲ Masquer" : "▼ Afficher"} les Prelims
                            ({prelimFights.length})
                          </button>
                          {showPrelims[event.id] && (
                            <>
                              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                                Prelims
                              </p>
                              {prelimFights.map((fight) => (
                                <FightCard
                                  key={fight.id}
                                  fight={fight}
                                  eventStatus={event.status}
                                  onFighterClick={handleFighterClick}
                                />
                              ))}
