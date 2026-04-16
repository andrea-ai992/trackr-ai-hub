src/components/crypto/CryptoSearchBar.jsx

import { useSearchParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Search, TrendingUp, TrendingDown, List, ArrowUpDown, DollarSign, BarChart2, X } from "lucide-react";

const VARIATION_OPTIONS = [
  { value: "all", label: "Tous", icon: List },
  { value: "up", label: "Hausses", icon: TrendingUp },
  { value: "down", label: "Baisses", icon: TrendingDown },
];

const SORT_OPTIONS = [
  { value: "market_cap", label: "Market Cap", icon: BarChart2 },
  { value: "price", label: "Prix", icon: DollarSign },
  { value: "change", label: "Variation", icon: ArrowUpDown },
];

export default function CryptoSearchBar({ coins = [], onFiltered }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [variation, setVariation] = useState(searchParams.get("variation") || "all");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "market_cap");
  const [sortDir, setSortDir] = useState(searchParams.get("dir") || "desc");

  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (variation !== "all") params.variation = variation;
    if (sortBy !== "market_cap") params.sort = sortBy;
    if (sortDir !== "desc") params.dir = sortDir;
    setSearchParams(params, { replace: true });
  }, [query, variation, sortBy, sortDir]);

  useEffect(() => {
    const q = (query || "").toLowerCase().trim();

    let filtered = coins.filter((coin) => {
      const matchSearch =
        !q ||
        (coin.name || "").toLowerCase().includes(q) ||
        (coin.symbol || "").toLowerCase().includes(q);

      const change = parseFloat(coin.price_change_percentage_24h ?? coin.change24h ?? 0);
      const matchVariation =
        variation === "all" ||
        (variation === "up" && change >= 0) ||
        (variation === "down" && change < 0);

      return matchSearch && matchVariation;
    });

    filtered = [...filtered].sort((a, b) => {
      let valA, valB;

      if (sortBy === "market_cap") {
        valA = parseFloat(a.market_cap ?? a.marketCap ?? 0);
        valB = parseFloat(b.market_cap ?? b.marketCap ?? 0);
      } else if (sortBy === "price") {
        valA = parseFloat(a.current_price ?? a.price ?? 0);
        valB = parseFloat(b.current_price ?? b.price ?? 0);
      } else if (sortBy === "change") {
        valA = parseFloat(a.price_change_percentage_24h ?? a.change24h ?? 0);
        valB = parseFloat(b.price_change_percentage_24h ?? b.change24h ?? 0);
      } else {
        valA = 0;
        valB = 0;
      }

      return sortDir === "desc" ? valB - valA : valA - valB;
    });

    if (typeof onFiltered === "function") {
      onFiltered(filtered);
    }
  }, [coins, query, variation, sortBy, sortDir]);

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  const toggleSortDir = () => {
    setSortDir((prev) => (prev === "desc" ? "asc" : "desc"));
  };

  const handleSortBy = (value) => {
    if (sortBy === value) {
      toggleSortDir();
    } else {
      setSortBy(value);
      setSortDir("desc");
    }
  };

  return (
    <div className="w-full space-y-3">
      <div className="relative flex items-center">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher par nom ou symbole..."
          className="
            w-full pl-10 pr-10 py-2.5
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl text-sm text-gray-800 dark:text-gray-100
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500
            transition-all duration-200
          "
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Effacer la recherche"
          >
            <X size={16} />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">
          Filtre:
        </span>
        <div className="flex gap-1.5">
          {VARIATION_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setVariation(value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200 border
                ${
                  variation === value
                    ? value === "up"
                      ? "bg-green-500 text-white border-green-500 shadow-sm"
                      : value === "down"
                      ? "bg-red-500 text-white border-red-500 shadow-sm"
                      : "bg-blue-500 text-white border-blue-500 shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide shrink-0">
          Tri:
        </span>
        <div className="flex gap-1.5">
          {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => handleSortBy(value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium
                transition-all duration-200 border
                ${
                  sortBy === value
                    ? "bg-indigo-500 text-white border-indigo-500 shadow-sm"
                    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                }
              `}
            >
              <Icon size={13} />
              {label}
              {sortBy === value && (
                <span className="ml-0.5 text-[10px] font-bold">
                  {sortDir === "desc" ? "↓" : "↑"}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}