import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import {
  Trophy, TrendingUp, Clock, CheckCircle, XCircle, PlusCircle, RefreshCw
} from "lucide-react";

// ── PSGWidget ──────────────────────────────────────────────────────────────
const PSGWidget = () => {
  const psgStats = {
    nom: "Paris Saint-Germain",
    ligue: "Ligue 1",
    saison: "2024-2025",
    classement: 1,
    points: 72,
    victoires: 22,
    nuls: 6,
    defaites: 4,
    butsMarques: 68,
    butsEncaisses: 28,
    formeRecente: ["V", "V", "N", "V", "V"],
  };

  const formeColor = (r) => {
    if (r === "V") return "bg-green-500";
    if (r === "N") return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-red-800 rounded-2xl p-5 text-white shadow-xl mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow">
          <span className="text-blue-900 font-black text-lg">PSG</span>
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">{psgStats.nom}</h2>
          <p className="text-blue-200 text-sm">{psgStats.ligue} · {psgStats.saison}</p>
        </div>
        <div className="ml-auto text-right">
          <div className="text-3xl font-black">{psgStats.points}</div>
          <div className="text-blue-200 text-xs">points</div>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold">#{psgStats.classement}</div>
          <div className="text-xs text-blue-200">Classement</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-green-400">{psgStats.victoires}</div>
          <div className="text-xs text-blue-200">Victoires</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-yellow-400">{psgStats.nuls}</div>
          <div className="text-xs text-blue-200">Nuls</div>
        </div>
        <div className="bg-white/10 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-red-400">{psgStats.defaites}</div>
          <div className="text-xs text-blue-200">Défaites</div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="text-sm text-blue-200">
          ⚽ {psgStats.butsMarques} buts marqués · {psgStats.butsEncaisses} encaissés
        </div>
        <div className="flex gap-1">
          {psgStats.formeRecente.map((r, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-full ${formeColor(r)} flex items-center justify-center text-xs font-bold`}
            >
              {r}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── StatCard ───────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow flex items-center gap-3">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      <Icon size={20} className="text-white" />
    </div>
    <div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-xl font-bold text-gray-800 dark:text-white">{value}</div>
    </div>
  </div>
);

// ── BetCard ────────────────────────────────────────────────────────────────
const BetCard = ({ bet, onDelete }) => {
  const statutConfig = {
    en_cours: {
      label: "En cours",
      color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      icon: Clock,
    },
    gagne: {
      label: "Gagné",
      color: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      icon: CheckCircle,
    },
    perdu: {
      label: "Perdu",
      color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      icon: XCircle,
    },
  };
  const config = statutConfig[bet.statut] ?? statutConfig.en_cours;
  const Icon = config.icon;
  const gain = (bet.mise * bet.cote).toFixed(2);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow mb-3">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <p className="font-semibold text-gray-800 dark:text-white text-sm leading-tight">
            {bet.match}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(bet.created_at).toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${config.color}`}>
          <Icon size={12} />
          {config.label}
        </span>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex gap-4">
          <div>
            <div className="text-xs text-gray-400">Mise</div>
            <div className="font-bold text-gray-700 dark:text-gray-200">{bet.mise}€</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Cote</div>
            <div className="font-bold text-blue-600 dark:text-blue-400">{bet.cote}</div>
          </div>
          <div>
            <div className="text-xs text-gray-400">Gain potentiel</div>
            <div
              className={`font-bold ${
                bet.statut === "gagne"
                  ? "text-green-600"
                  : bet.statut === "perdu"
                  ? "text-red-500"
                  : "text-gray-700 dark:text-gray-200"
              }`}
            >
              {bet.statut === "perdu" ? `-${bet.mise}€` : `${gain}€`}
            </div>
          </div>
        </div>
        <button
          onClick={() => onDelete(bet.id)}
          className="text-gray-300 hover:text-red-500 transition-colors ml-2"
          title="Supprimer"
        >
          <XCircle size={18} />
        </button>
      </div>
    </div>
  );
};

// ── AddBetModal ────────────────────────────────────────────────────────────
const AddBetModal = ({ onClose, onAdd }) => {
  const [form, setForm] = useState({ match: "", mise: "", cote: "", statut: "en_cours" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.match || !form.mise || !form.cote) {
      setError("Tous les champs sont requis.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("sports_bets")
        .insert([
          {
            match: form.match,
            mise: parseFloat(form.mise),
            cote: parseFloat(form.cote),
            statut: form.statut,
          },
        ])
        .select()
        .single();
      if (err) throw err;
      onAdd(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800 dark:text-white text-lg">Nouveau pari PSG</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <XCircle size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Match</label>
            <input
              type="text"
              placeholder="Ex: PSG vs Real Madrid"
              value={form.match}
              onChange={(e) => setForm({ ...form, match: e.target.value })}
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Mise (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="50"
                value={form.mise}
                onChange={(e) => setForm({ ...form, mise: e.target.value })}
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Cote</label>
              <input
                type="number"
                step="0.01"
                min="1"
                placeholder="1.85"
                value={form.cote}
                onChange={(e) => setForm({ ...form, cote: e.target.value })}
                className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Statut</label>
            <select
              value={form.statut}
              onChange={(e) => setForm({ ...form, statut: e.target.value })}
              className="w-full bg-gray-100 dark:bg-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en_cours">En cours</option>
              <option value="gagne">Gagné</option>
              <option value="perdu">Perdu</option>
            </select>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl py-3 text-sm transition-colors disabled:opacity-50"
          >
            {loading ? "Enregistrement..." : "Ajouter le pari"}
          </button>
        </form>
      </div>
    </div>
  );
};

// ── SportsPage (default export) ────────────────────────────────────────────
export default function SportsPage() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const fetchBets = async () => {
    setLoading(true);
    setError("");
    try {
      const { data, error: err } = await supabase
        .from("sports_bets")
        .select("*")
        .order("created_at", { ascending: false });
      if (err) throw err;
      setBets(data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBets();
  }, []);

  const handleDelete = async (id) => {
    try {
      const { error: err } = await supabase.from("sports_bets").delete().eq("id", id);
      if (err) throw err;
      setBets((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAdd = (newBet) => {
    setBets((prev) => [newBet, ...prev]);
  };

  // Stats calculées
  const totalMise = bets.reduce((s, b) => s + b.mise, 0);
  const gains = bets
    .filter((b) => b.statut === "gagne")
    .reduce((s, b) => s + b.mise * b.cote, 0);
  const pertes = bets
    .filter((b) => b.statut === "perdu")
    .reduce((s, b) => s + b.mise, 0);
  const enCours = bets.filter((b) => b.statut === "en_cours").length;
  const roi = totalMise > 0 ? (((gains - pertes) / totalMise) * 100).toFixed(1) : "0.0";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-2">
          <Trophy size={24} className="text-blue-600" />
          Sports &amp; Paris
        </h1>
        <div className="flex gap-2">
          <button
            onClick={fetchBets}
            className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow text-gray-500 hover:text-blue-600 transition-colors"
            title="Rafraîchir"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors shadow"
          >
            <PlusCircle size={16} />
            Nouveau pari
          </button>
        </div>
      </div>

      {/* PSG Widget */}
      <PSGWidget />

      {/* Stats globales */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard
          icon={TrendingUp}
          label="ROI"
          value={`${roi}%`}
          color={parseFloat(roi) >= 0 ? "bg-green-500" : "bg-red-500"}
        />
        <StatCard
          icon={Trophy}
          label="Gains totaux"
          value={`${gains.toFixed(2)}€`}
          color="bg-blue-500"
        />
        <StatCard
          icon={XCircle}
          label="Pertes totales"
          value={`${pertes.toFixed(2)}€`}
          color="bg-red-500"
        />
        <StatCard
          icon={Clock}
          label="En cours"
          value={enCours}
          color="bg-yellow-500"
        />
      </div>

      {/* Liste des paris */}
      <div>
        <h2 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
          Paris PSG
        </h2>
        {error && (
          <p className="text-red-500 text-sm mb-3 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2">
            {error}
          </p>
        )}
        {loading ? (
          <div className="flex justify-center py-12">
            <RefreshCw size={28} className="text-blue-400 animate-spin" />
          </div>
        ) : bets.length === 0 ? (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500">
            <Trophy size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Aucun pari enregistré</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-blue-500 text-sm hover:underline"
            >
              Ajouter votre premier pari
            </button>
          </div>
        ) : (
          bets.map((bet) => (
            <BetCard key={bet.id} bet={bet} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddBetModal onClose={() => setShowModal(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
```

**Route à ajouter dans `src/App.jsx` :**
```jsx
import SportsPage from "./pages/SportsPage";
// dans le <Routes> :
<Route path="/sports" element={<SportsPage />} />
```

**Corrections appliquées :**
1. `AddBetModal` — JSX tronqué → fermé proprement, try/catch/finally remplace le pattern `error: err` nu
2. `SportsPage` — composant principal entièrement absent → créé avec fetch Supabase, stats calculées (ROI, gains, pertes, en cours), états `loading`/`error`/`bets`, delete fonctionnel
3. `handleDelete` — wrappé dans try/catch (fetch sans catch corrigé)
4. `statutConfig[bet.statut] || ...` → `??` pour éviter falsy bug
