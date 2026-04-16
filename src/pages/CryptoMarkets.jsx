```jsx
import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h";

const REFRESH_INTERVAL = 60000;

const shimmerStyle = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

function SparklineChart({ data, isPositive }) {
  if (!data || data.length === 0) return null;
  const chartData = data.map((price, index) => ({ index, price }));
  return (
    <ResponsiveContainer width="100%" height={50}>
      <LineChart data={chartData}>
        <Line
          type="monotone"
          dataKey="price"
          stroke={isPositive ? "#22c55e" : "#ef4444"}
          strokeWidth={1.5}
          dot={false}
          isAnimationActive={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div
                  style={{
                    background: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    fontSize: "11px",
                    color: "#e2e8f0",
                  }}
                >
                  $
                  {Number(payload[0].value).toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
              );
            }
            return null;
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function CoinCard({ coin, rank }) {
  const isPositive = coin.price_change_percentage_24h >= 0;
  const changeColor = isPositive ? "#22c55e" : "#ef4444";
  const changeBg = isPositive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)";

  const formatPrice = (price) => {
    if (price == null) return "N/A";
    if (price >= 1)
      return (
        "$" +
        price.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    return (
      "$" +
      price.toLocaleString("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 6,
      })
    );
  };

  const formatLargeNumber = (n) => {
    if (n == null) return "N/A";
    if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    return "$" + n.toLocaleString();
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.4)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.3)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span
            style={{
              background: "#334155",
              color: "#94a3b8",
              borderRadius: "8px",
              padding: "2px 8px",
              fontSize: "11px",
              fontWeight: "600",
              minWidth: "28px",
              textAlign: "center",
            }}
          >
            #{rank}
          </span>
          <img
            src={coin.image}
            alt={coin.name}
            width={36}
            height={36}
            style={{ borderRadius: "50%", objectFit: "cover" }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
          <div>
            <div
              style={{
                color: "#f1f5f9",
                fontWeight: "700",
                fontSize: "15px",
              }}
            >
              {coin.name}
            </div>
            <div
              style={{
                color: "#64748b",
                fontSize: "12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {coin.symbol}
            </div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          <div
            style={{
              color: "#f1f5f9",
              fontWeight: "700",
              fontSize: "16px",
            }}
          >
            {formatPrice(coin.current_price)}
          </div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "3px",
              background: changeBg,
              color: changeColor,
              borderRadius: "8px",
              padding: "2px 8px",
              fontSize: "12px",
              fontWeight: "600",
              marginTop: "2px",
            }}
          >
            {isPositive ? "▲" : "▼"}{" "}
            {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <SparklineChart
          data={coin.sparkline_in_7d?.price}
          isPositive={isPositive}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: "1px solid #1e293b",
          paddingTop: "10px",
          gap: "8px",
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              color: "#64748b",
              fontSize: "11px",
              marginBottom: "2px",
            }}
          >
            Market Cap
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {formatLargeNumber(coin.market_cap)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{
              color: "#64748b",
              fontSize: "11px",
              marginBottom: "2px",
            }}
          >
            Volume 24h
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {formatLargeNumber(coin.total_volume)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div
            style={{
              color: "#64748b",
              fontSize: "11px",
              marginBottom: "2px",
            }}
          >
            ATH
          </div>
          <div
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              fontWeight: "600",
            }}
          >
            {formatPrice(coin.ath)}
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <>
      <style>{shimmerStyle}</style>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "12px",
            height: "160px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, transparent, rgba(148,163,184,0.05), transparent)",
              animation: `shimmer 1.5s infinite ${i * 0.2}s`,
            }}
          />
        </div>
      ))}
    </>
  );
}

const SORT_OPTIONS = [
  { value: "market_cap_desc", label: "Market Cap ↓" },
  { value: "market_cap_asc", label: "Market Cap ↑" },
  { value: "price_desc", label: "Price ↓" },
  { value: "price_asc", label: "Price ↑" },
  { value: "change_desc", label: "Change ↓" },
  { value: "change_asc", label: "Change ↑" },
];

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "gainers", label: "▲ Gainers" },
  { value: "losers", label: "▼ Losers" },
];

const inputStyle = {
  width: "100%",
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "10px",
  padding: "10px 12px 10px 36px",
  color: "#f1f5f9",
  fontSize: "14px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.2s ease",
};

const selectStyle = {
  flex: 1,
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: "10px",
  padding: "9px 10px",
  color: "#f1f5f9",
  fontSize: "13px",
  outline: "none",
  cursor: "pointer",
  appearance: "none",
  WebkitAppearance: "none",
};

function SearchAndFilter({ searchParams, setSearchParams }) {
  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";
  const sort = searchParams.get("sort") || "market_cap_desc";

  const update = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value === "" || value === null) {
        next.delete(key);
      } else {
        next.set(key, value);
      }
      return next;
    });
  };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "14px",
        marginBottom: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      {/* Search input */}
      <div style={{ position: "relative" }}>
        <span
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#64748b",
            fontSize: "15px",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          🔍
        </span>
        <input
          type="text"
          value={query}
          onChange={(e) => update("q", e.target.value)}
          placeholder="Search by name or symbol…"
          style={inputStyle}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#6366f1";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#334155";
          }}
        />
      </div>

      {/* Filter + Sort row */}
      <div style={{ display: "flex", gap: "8px" }}>
        {/* Variation filter */}
        <div style={{ position: "relative", flex: 1 }}>
          <select
            value={filter}
            onChange={(e) => update("filter", e.target.value)}
            style={selectStyle}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: "11px",
              pointerEvents: "none",
            }}
          >
            ▼
          </span>
        </div>

        {/* Sort select */}
        <div style={{ position: "relative", flex: 1 }}>
          <select
            value={sort}
            onChange={(e) => update("sort", e.target.value)}
            style={selectStyle}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <span
            style={{
              position: "absolute",
              right: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748b",
              fontSize: "11px",
              pointerEvents: "none",
            }}
          >
            ▼
          </span>
        </div>
      </div>
    </div>
  );
}

function applyFiltersAndSort(coins, query, filter, sort) {
  let result = [...coins];

  // Search filter
  if (query.trim()) {
    const q = query.trim().toLowerCase();
    result = result.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q)
    );
  }

  // Variation filter
  if (filter === "gainers") {
    result = result.filter((c) => c.price_change_percentage_24h >= 0);
  } else if (filter === "losers") {
    result = result.filter((c) => c.price_change_percentage_24h < 0);
  }

  // Sort
  switch (sort) {
    case "market_cap_desc":
      result.sort((a, b) => (b.market_cap ?? 0) - (a.market_cap ?? 0));
      break;
    case "market_cap_asc":
      result.sort((a, b) => (a.market_cap ?? 0) - (b.market_cap ?? 0));
      break;
    case "price_desc":
      result.sort((a, b) => (b.current_price ?? 0) - (a.current_price ?? 0));
      break;
    case "price_asc":
      result.sort((a, b) => (a.current_price ?? 0) - (b.current_price ?? 0));
      break;
    case "change_desc":
      result.sort(
        (a, b) =>
          (b.price_change_percentage_24h ?? 0) -
          (a.price_change_percentage_24h ?? 0)
      );
      break;
    case "change_asc":
      result.sort(
        (a, b) =>
          (a.price_change_percentage_24h ?? 0) -
          (b.price_change_percentage_24h ?? 0)
      );
      break;
    default:
      break;
  }

  return result;
}

export default function CryptoMarkets() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  const query = searchParams.get("q") || "";
  const filter = searchParams.get("filter") || "all";
  const sort = searchParams.get("sort") || "market_cap_desc";

  const fetchCoins = useCallback(async () => {
    try {
      const res = await fetch(COINGECKO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setCoins(data);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCoins]);

  const filteredCoins = useMemo(
    () => applyFiltersAndSort(coins, query, filter, sort),
    [coins, query, filter, sort]
  );

  const hasActiveFilters = query || filter !== "all" || sort !== "market_cap_desc";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020817",
        padding: "16px",
        maxWidth: "480px",
        margin: "0 auto",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h1
          style={{
            color: "#f1f5f9",
            fontSize: "22px",
            fontWeight: "800",
            margin: "0 0 4px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Crypto Markets
        </h1>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ color: "#64748b", fontSize: "13px", margin: 0 }}>
            Top 50 by market cap · auto-refresh 60s
          </p>
          {lastUpdated && (
            <span style={{ color: "#475569", fontSize: "11px" }}>
              {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>

      {/* Search & Filter */}
      <SearchAndFilter
        searchParams={searchParams}
        setSearchParams={setSearchParams}
      />

      {/* Results info */}
      {!loading && !error && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <span style={{ color: "#64748b", fontSize: "12px" }}>
            {filteredCoins.length} result{filteredCoins.length !== 1 ? "s" : ""}
            {hasActiveFilters ? " (filtered)" : ""}
          </span>
          {hasActiveFilters && (
            <button
              onClick={() => setSearchParams({})}
              style={{
                background: "none",
                border: "1px solid #334155",
                borderRadius: "8px",
                color: "#94a3b8",
                fontSize: "11px",
                padding: "3px 10px",
                cursor: "pointer",
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: "12px",
            padding: "14px",
            marginBottom: "16px",
            color: "#fca5a5",
            fontSize: "14px",
            textAlign: "center",
          }}
        >
          ⚠️ {error}
          <button
            onClick={fetchCoins}
            style={{
              display: "block",
              margin: "8px auto 0",
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "8px",
              color: "#fca5a5",
              fontSize: "12px",
              padding: "4px 14px",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton />}

      {/* Empty state */}
      {!loading && !error && filteredCoins.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "48px 16px",
            color: "#475569",
          }}
        >
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>🔍</div>
          <div style={{ fontSize: "15px", fontWeight: "600", color: "#64748b" }}>
            No results found
          </div>
          <div style={{ fontSize: "13px", marginTop: "4px" }}>
            Try a different search or filter
          </div>
        </div>
      )}

      {/* Coin list */}
      {!loading &&
        !error &&
        filteredCoins.map((coin, idx) => (
          <CoinCard
            key={coin.id}
            coin={coin}
            rank={coins.indexOf(coin) + 1}
          />
        ))}
    </div>
  );
}