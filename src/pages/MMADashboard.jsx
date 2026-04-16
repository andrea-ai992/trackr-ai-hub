```jsx
// src/pages/MMADashboard.jsx
import { useState } from "react";

/* ─────────────────────────────────────────
   MOCK DATA  — remplacer par un appel API
   sécurisé côté serveur (ex: /api/ufc-events)
───────────────────────────────────────── */
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
        fighter1: { name: "Alexandre Pantoja", record: "27-5-0", country: "🇧🇷", rank: "C" },
        fighter2: { name: "Kai Asakura",        record: "21-4-0", country: "🇯🇵", rank: "#1" },
        weightClass: "Flyweight",
        result: { winner: "Alexandre Pantoja", method: "Decision (Unanimous)", round: 5, time: "5:00" },
        isTitleFight: true,
      },
      {
        id: "c2",
        fighter1: { name: "Shavkat Rakhmonov", record: "18-0-0", country: "🇰🇿", rank: "#2" },
        fighter2: { name: "Ian Machado Garry",  record: "15-0-0", country: "🇮🇪", rank: "#4" },
        weightClass: "Welterweight",
        result: { winner: "Shavkat Rakhmonov", method: "Submission (Rear Naked Choke)", round: 3, time: "3:22" },
        isTitleFight: false,
      },
      {
        id: "c3",
        fighter1: { name: "Umar Nurmagomedov", record: "18-0-0", country: "🇷🇺", rank: "#3" },
        fighter2: { name: "Kyoji Horiguchi",   record: "30-5-0", country: "🇯🇵", rank: "#8" },
        weightClass: "Bantamweight",
        result: { winner: "Umar Nurmagomedov", method: "TKO (Punches)", round: 2, time: "4:15" },
        isTitleFight: false,
      },
    ],
    prelimCard: [
      {
        id: "p1",
        fighter1: { name: "Chris Curtis",   record: "31-10-0", country: "🇺🇸", rank: "NR" },
        fighter2: { name: "Brendan Allen",  record: "24-5-0",  country: "🇺🇸", rank: "#11" },
        weightClass: "Middleweight",
        result: { winner: "Brendan Allen", method: "Decision (Split)", round: 3, time: "5:00" },
        isTitleFight: false,
      },
      {
        id: "p2",
        fighter1: { name: "Roman Kopylov", record: "12-2-0", country: "🇷🇺", rank: "NR" },
        fighter2: { name: "Joe Pyfer",      record: "11-2-0", country: "🇺🇸", rank: "NR" },
        weightClass: "Middleweight",
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
        fighter1: { name: "Caio Borralho", record: "17-1-0", country: "🇧🇷", rank: "#3" },
        fighter2: { name: "Paul Craig",    record: "17-7-1", country: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", rank: "NR" },
        weightClass: "Middleweight",
        result: { winner: "Caio Borralho", method: "Decision (Unanimous)", round: 5, time: "5:00" },
        isTitleFight: false,
      },
    ],
    prelimCard: [
      {
        id: "p3",
        fighter1: { name: "Carlos Ulberg",   record: "10-1-0", country: "🇳🇿", rank: "#14" },
        fighter2: { name: "Dominick Reyes",  record: "13-5-0", country: "🇺🇸", rank: "NR" },
        weightClass: "Light Heavyweight",
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
        fighter1: { name: "Islam Makhachev",  record: "26-1-0", country: "🇷🇺", rank: "C" },
        fighter2: { name: "Arman Tsarukyan",  record: "22-3-0", country: "🇦🇲", rank: "#1" },
        weightClass: "Lightweight",
        result: null,
        isTitleFight: true,
      },
      {
        id: "c6",
        fighter1: { name: "Merab Dvalishvili",  record: "17-4-0", country: "🇬🇪", rank: "C" },
        fighter2: { name: "Umar Nurmagomedov",  record: "18-0-0", country: "🇷🇺", rank: "#3" },
        weightClass: "Bantamweight",
        result: null,
        isTitleFight: true,
      },
    ],
    prelimCard: [
      {
        id: "p4",
        fighter1: { name: "Renato Moicano", record: "20-5-1", country: "🇧🇷", rank: "#7" },
        fighter2: { name: "Beneil Dariush", record: "22-7-1", country: "🇺🇸", rank: "NR" },
        weightClass: "Lightweight",
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
        fighter1: { name: "Magomed Ankalaev", record: "20-1-1", country: "🇷🇺", rank: "#1" },
        fighter2: { name: "Aleksandar Rakic",  record: "14-4-0", country: "🇦🇹", rank: "#6" },
        weightClass: "Light Heavyweight",
        result: null,
        isTitleFight: false,
      },
    ],
    prelimCard: [
      {
        id: "p5",
        fighter1: { name: "Sean O'Malley", record: "18-2-0", country: "🇺🇸", rank: "#2" },
        fighter2: { name: "Marlon Vera",   record: "22-9-1", country: "🇪🇨", rank: "#5" },
        weightClass: "Bantamweight",
        result: null,
        isTitleFight: false,
      },
    ],
  },
];

const mockFighters = [
  {
    id: "f1",
    name: "Jon Jones",
    nickname: "Bones",
    country: "🇺🇸",
    weightClass: "Heavyweight",
    rank: "C",
    record: { wins: 27, losses: 1, draws: 0, nc: 1 },
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
    stats: { slpm: 5.08, stracc: "50%", sapm: 4.25, strdef: "51%", tdavg: 2.87, tdacc: "42%", tddeff: "67%", subavg: 1.8 },
    age: 33, height: "5'5\"", reach: "67\"", stance: "Orthodox",
    streak: { type: "win", count: 4 },
  },
];

const WEIGHT_CLASSES = [
  "All", "Heavyweight", "Light Heavyweight", "Middleweight",
  "Welterweight", "Lightweight", "Bantamweight", "Flyweight",
];

/* ─── Helpers ─── */
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

const getDaysUntil = (dateStr) =>
  Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));

/* ─── Sub-components ─── */
const StatBar = ({ value, max = 100, color = "#ef4444" }) => {
  const pct = Math.min((parseFloat(value) / max) * 100, 100);
  return (
    <div style={{ background: "#1e293b", borderRadius: 4, height: 6, overflow: "hidden", flex: 1 }}>
      <div
        style={{
          width: `${pct}%`, height: "100%", background: color,
          borderRadius: 4, transition: "width 0.6s ease",
        }}
      />
    </div>
  );
};

const FightCard = ({ fight }) => {
  const [expanded, setExpanded] = useState(false);
  const methodColor = getMethodColor(fight.result?.method);

  return (
    <div
      onClick={() => setExpanded((p) => !p)}
      style={{
        background: "#0f172a",
        border: `1px solid ${fight.isTitleFight ? "#f59e0b40" : "#1e293b"}`,
        borderRadius: 12,
        padding: "14px 16px",
        marginBottom: 10,
        cursor: "pointer",
        transition: "all 0.2s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Title-fight gold stripe */}
      {fight.isTitleFight && (
        <div
          style={{
            position: "absolute", top: 0, left: 0, right: 0, height: 2,
            background: "linear-gradient(90deg, #f59e0b, #ef4444, #f59e0b)",
          }}
        />
      )}

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
        <span style={{ fontSize: 11, color: "#64748b", fontWeight: 600, letterSpacing: 1, textTransform: "uppercase" }}>
          {fight.weightClass} {fight.isTitleFight && "🏆 Title"}
        </span>
        <span style={{ fontSize: 11, color: methodColor, fontWeight: 700 }}>
          {getMethodIcon(fight.result?.method)}
          {fight.result ? ` ${fight.result.method}` : " À venir"}
        </span>
      </div>

      {/* Fighters row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
        {/* Fighter 1 */}
        <div style={{ flex: 1, textAlign: "left" }}>
          <div style={{
            fontWeight: 700, fontSize: 14, color: fight.result?.winner === fight.fighter1.name ? "#ffffff" : "#64748b",
          }}>
            {fight.fighter1.country} {fight.fighter1.name}
            {fight.result?.winner === fight.fighter1.name && (
              <span style={{ marginLeft: 6, color: "#22c55e", fontSize: 12 }}>W</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            {fight.fighter1.rank} · {fight.fighter1.record}
          </div>
        </div>

        {/* VS */}
        <div style={{ fontSize: 12, fontWeight: 800, color: "#334155", padding: "0 4px" }}>VS</div>

        {/* Fighter 2 */}
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{
            fontWeight: 700, fontSize: 14, color: fight.result?.winner === fight.fighter2.name ? "#ffffff" : "#64748b",
          }}>
            {fight.fighter2.country} {fight.fighter2.name}
            {fight.result?.winner === fight.fighter2.name && (
              <span style={{ marginLeft: 6, color: "#22c55e", fontSize: 12 }}>W</span>
            )}
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>
            {fight.fighter2.rank} · {fight.fighter2.record}
          </div>
        </div>
      </div>

      {/* Expanded detail */}
      {expanded && fight.result && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1e293b" }}>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {[
              { label: "Vainqueur", value: fight.result.winner },
              { label: "Méthode",  value: fight.result.method },
              { label: "Round",    value: `R${fight.result.round}` },
              { label: "Temps",    value: fight.result.time },
            ].map(({ label, value }) => (
              <div key={label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginTop: 2 }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EventCard = ({ event }) => {
  const [showPrelims, setShowPrelims] = useState(false);
  const daysUntil = getDaysUntil(event.date);
  const isUpcoming = event.status === "upcoming";

  return (
    <div style={{
      background: "#0f172a",
      border: `1px solid ${isUpcoming ? "#3b82f620" : "#1e293b"}`,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
    }}>
      {/* Event header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "#f1f5f9" }}>{event.name}</h3>
            <span style={{
              padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700,
              background: isUpcoming ? "#3b82f620" : "#22c55e20",
              color: isUpcoming ? "#3b82f6" : "#22c55e",
              border: `1px solid ${isUpcoming ? "#3b82f640" : "#22c55e40"}`,
            }}>
              {isUpcoming ? "À VENIR" : "TERMINÉ"}
            </span>
          </div>
          <div style={{ fontSize: 13, color: "#64748b" }}>📅 {formatDate(event.date)}</div>
          <div style={{ fontSize: 13, color: "#64748b", marginTop: 2 }}>📍 {event.location}</div>
        </div>
        {isUpcoming && daysUntil > 0 && (
          <div style={{
            background: "#3b82f610", border: "1px solid #3b82f630",
            borderRadius: 12, padding: "8px 14px", textAlign: "center",
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#3b82f6" }}>{daysUntil}</div>
            <div style={{ fontSize: 10, color: "#475569", textTransform: "uppercase" }}>jours</div>
          </div>
        )}
      </div>

      {/* Main card */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
          🥊 Carte Principale
        </div>
        {event.mainCard.map((fight) => <FightCard key={fight.id} fight={fight} />)}
      </div>

      {/* Prelims toggle */}
      <button
        onClick={() => setShowPrelims((p) => !p)}
        style={{
          background: "none", border: "1px solid #1e293b", borderRadius: 8,
          padding: "8px 14px", color: "#64748b", fontSize: 12, cursor: "pointer",
          width: "100%", textAlign: "center", transition: "all 0.2s",
        }}
      >
        {showPrelims ? "▲ Masquer les" : "▼ Voir les"} préliminaires ({event.prelimCard.length})
      </button>

      {showPrelims && (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Préliminaires
          </div>
          {event.prelimCard.map((fight) => <FightCard key={fight.id} fight={fight} />)}
        </div>
      )}
    </div>
  );
};

const FighterCard = ({ fighter }) => {
  const [expanded, setExpanded] = useState(false);
  const totalFights = fighter.record.wins + fighter.record.losses + fighter.record.draws;
  const winRate = totalFights > 0 ? Math.round((fighter.record.wins / totalFights) * 100) : 0;

  return (
    <div
      onClick={() => setExpanded((p) => !p)}
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 14,
        padding: 16,
        cursor: "pointer",
        transition: "all 0.2s ease",
        marginBottom: 12,
      }}
    >
      {/* Fighter header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "linear-gradient(135deg, #ef4444, #991b1b)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontWeight: 800, color: "#fff", flexShrink: 0,
          }}>
            {fighter.name.charAt(0)}
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#f1f5f9" }}>
              {fighter.country} {fighter.name}
              {fighter.nickname && (
                <span style={{ fontSize: 12, color: "#64748b", fontWeight: 400 }}> "{fighter.nickname}"</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
              {fighter.weightClass} · {fighter.rank === "C" ? "🏆 Champion" : `Rang ${fighter.rank}`}
            </div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: "#22c55e" }}>
            {fighter.record.wins}-{fighter.record.losses}-{fighter.record.draws}
          </div>
          <div style={{ fontSize: 11, color: "#475569" }}>{winRate}% victoires</div>
        </div>
      </div>

      {/* Streak badge */}
      <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <span style={{
          padding: "3px 10px", borderRadius: 6, fontSize: 11, fontWeight: 700,
          background: fighter.streak.type === "win" ? "#22c55e20" : "#ef444420",
          color: fighter.streak.type === "win" ? "#22c55e" : "#ef4444",
          border: `1px solid ${fighter.streak.type === "win" ? "#22c55e40" : "#ef444440"}`,
        }}>
          {fighter.streak.count} victoires consécutives
        </span>
        <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, color: "#64748b", background: "#1e293b" }}>
          {fighter.age} ans · {fighter.height} · {fighter.reach} reach · {fighter.stance}
        </span>
      </div>

      {/* Expanded stats */}
      {expanded && (
        <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid #1e293b" }}>
          <div style={{ fontSize: 11, color: "#475569", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>
            Statistiques
          </div>
          {[
            { label: "Frappes/min",    value: fighter.stats.slpm,   max: 8,   color: "#ef4444" },
            { label: "Précision frappe", value: parseFloat(fighter.stats.stracc), max: 100, color: "#f59e0b" },
            { label: "Takedowns/15min", value: fighter.stats.tdavg, max: 6,   color: "#3b82f6" },
            { label: "Déf. takedown",  value: parseFloat(fighter.stats.tddeff), max: 100, color: "#22c55e" },
            { label: "Soumissions/15min", value: fighter.stats.subavg, max: 3, color: "#a855f7" },
          ].map(({ label, value, max, color }) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ fontSize: 11, color: "#64748b", width: 130, flexShrink: 0 }}>{label}</div>
              <StatBar value={value} max={max} color={color} />
              <div style={{ fontSize: 11, fontWeight: 700, color, width: 40, textAlign: "right", flexShrink: 0 }}>
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Main Dashboard ─── */
export default function MMADashboard() {
  const [activeTab, setActiveTab]         = useState("events");   // "events" | "fighters"
  const [eventFilter, setEventFilter]     = useState("all");      // "all" | "upcoming" | "completed"
  const [weightFilter, setWeightFilter]   = useState("All");

  const filteredEvents = mockEvents.filter((e) => {
    if (eventFilter === "upcoming")  return e.status === "upcoming";
    if (eventFilter === "completed") return e.status === "completed";
    return true;
  });

  const filteredFighters = mockFighters.filter((f) =>
    weightFilter === "All" ? true : f.weightClass === weightFilter,
  );

  /* ── Quick stats ── */
  const completedEvents  = mockEvents.filter((e) => e.status === "completed").length;
  const upcomingEvents   = mockEvents.filter((e) => e.status === "upcoming").length;
  const totalFights      = mockEvents.reduce(
    (acc, e) => acc + e.mainCard.length + e.prelimCard.length, 0,
  );
  const koCount = mockEvents.reduce((acc, e) => {
    const all = [...e.mainCard, ...e.prelimCard];
    return acc + all.filter((f) => f.result?.method?.includes("KO") || f.result?.method?.includes("TKO")).length;
  }, 0);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0", fontFamily: "system-ui, sans-serif" }}>
      {/* ── Header ── */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1a0505 50%, #0f172a 100%)",
        padding: "24px 20px 20px",
        borderBottom: "1px solid #1e293b",
      }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <div style={{ display: "flex", align