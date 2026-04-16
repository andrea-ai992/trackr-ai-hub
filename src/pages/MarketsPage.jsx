```jsx
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, RefreshCw, Wifi, WifiOff } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

const COINS = ["bitcoin", "ethereum", "solana", "cardano", "polkadot", "chainlink", "avalanche-2", "polygon"];

const COIN_SYMBOLS = {
  bitcoin: "BTC",
  ethereum: "ETH",
  solana: "SOL",
  cardano: "ADA",
  polkadot: "DOT",
  chainlink: "LINK",
  "avalanche-2": "AVAX",
  polygon: "MATIC",
};

const COIN_NAMES = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  solana: "Solana",
  cardano: "Cardano",
  polkadot: "Polkadot",
  chainlink: "Chainlink",
  "avalanche-2": "Avalanche",
  polygon: "Polygon",
};

const COIN_COLORS = {
  bitcoin: "#F7931A",
  ethereum: "#627EEA",
  solana: "#9945FF",
  cardano: "#0033AD",
  polkadot: "#E6007A",
  chainlink: "#375BD2",
  "avalanche-2": "#E84142",
  polygon: "#8247E5",
};

function formatPrice(price) {
  if (price === null || price === undefined) return "—";
  if (price >= 1000) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  }
  if (price >= 1) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price);
  }
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 4,
    maximumFractionDigits: 6,
  }).format(price);
}

function formatMarketCap(value) {
  if (!value) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${value.toFixed(0)}`;
}

function SparklineChart({ data, color, isPositive }) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          width: "100%",
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#4b5563",
          fontSize: 11,
        }}
      >
        No data
      </div>
    );
  }

  const chartData = data.map((price, index) => ({ index, price }));
  const gradientId = `gradient-${color.replace("#", "")}`;

  return (
    <ResponsiveContainer width="100%" height={56}>
      <AreaChart data={chartData} margin={{ top: 4, right: 0, left: 0, bottom: 4 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
            <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div
                  style={{
                    background: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: 6,
                    padding: "4px 8px",
                    fontSize: 11,
                    color: "#f9fafb",
                  }}
                >
                  {formatPrice(payload[0].value)}
                </div>
              );
            }
            return null;
          }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke={isPositive ? "#10b981" : "#ef4444"}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 3, fill: isPositive ? "#10b981" : "#ef4444" }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function CryptoCard({ coin, data, sparkline, loading }) {
  const symbol = COIN_SYMBOLS[coin];
  const name = COIN_NAMES[coin];
  const color = COIN_COLORS[coin];

  const price = data?.current_price ?? null;
  const change24h = data?.price_change_percentage_24h ?? null;
  const marketCap = data?.market_cap ?? null;
  const volume = data?.total_volume ?? null;
  const isPositive = change24h !== null && change24h >= 0;

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #111827 0%, #1f2937 100%)",
        border: "1px solid #374151",
        borderRadius: 16,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 12,
        transition: "border-color 0.2s, transform 0.15s",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "#374151";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: color,
          opacity: 0.05,
          pointerEvents: "none",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              background: color + "22",
              border: `2px solid ${color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 700, color }}>{symbol.slice(0, 3)}</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb", lineHeight: 1.2 }}>{symbol}</div>
            <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.2 }}>{name}</div>
          </div>
        </div>

        <div style={{ textAlign: "right" }}>
          {loading && price === null ? (
            <div
              style={{
                width: 80,
                height: 18,
                background: "#374151",
                borderRadius: 4,
                animation: "pulse 1.5s infinite",
              }}
            />
          ) : (
            <div style={{ fontSize: 15, fontWeight: 700, color: "#f9fafb" }}>{formatPrice(price)}</div>
          )}
          {loading && change24h === null ? (
            <div
              style={{
                width: 50,
                height: 14,
                background: "#374151",
                borderRadius: 4,
                marginTop: 3,
                animation: "pulse 1.5s infinite",
              }}
            />
          ) : change24h !== null ? (
            <div
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: isPositive ? "#10b981" : "#ef4444",
                display: "flex",
                alignItems: "center",
                gap: 3,
                justifyContent: "flex-end",
                marginTop: 2,
              }}
            >
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? "+" : ""}{change24h.toFixed(2)}%
            </div>
          ) : null}
        </div>
      </div>

      <SparklineChart data={sparkline} color={color} isPositive={isPositive} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          paddingTop: 8,
          borderTop: "1px solid #374151",
        }}
      >
        <div>
          <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
            Market Cap
          </div>
          <div style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600 }}>{formatMarketCap(marketCap)}</div>
        </div>
        <div>
          <div style={{ fontSize: 10, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
            Volume 24h
          </div>
          <div style={{ fontSize: 12, color: "#d1d5db", fontWeight: 600 }}>{formatMarketCap(volume)}</div>
        </div>
      </div>
    </div>
  );
}

const SORT_OPTIONS = [
  { value: "market_cap", label: "Market Cap" },
  { value: "price_change_percentage_24h", label: "24h %" },
  { value: "current_price", label: "Prix" },
];

export default function MarketsPage() {
  const [prices, setPrices] = useState({});
  const [sparklines, setSparklines] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("market_cap");

  const fetchPrices = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      setError(null);
      const ids = COINS.join(",");

      let res;
      try {
        res = await fetch(`/api/crypto-prices?ids=${ids}&sparkline=true`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
      } catch {
        res = await fetch(
          `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=true&price_change_percentage=24h`
        );
        if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
      }

      const data = await res.json();
      const items = Array.isArray(data) ? data : data.data || [];

      const pricesMap = {};
      const sparklinesMap = {};

      items.forEach((item) => {
        if (COINS.includes(item.id)) {
          pricesMap[item.id] = {
            current_price: item.current_price,
            price_change_percentage_24h: item.price_change_percentage_24h,
            market_cap: item.market_cap,
            total_volume: item.total_volume,
          };
          const sparkData = item.sparkline_in_7d?.price ?? [];
          // Réduire à ~50 points pour les perfs recharts
          const step = Math.max(1, Math.floor(sparkData.length / 50));
          sparklinesMap[item.id] = sparkData.filter((_, i) => i % step === 0);
        }
      });

      setPrices(pricesMap);
      setSparklines(sparklinesMap);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err.message ?? "Erreur de chargement");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Polling 30s
  useEffect(() => {
    fetchPrices();
    const interval = setInterval(() => fetchPrices(), 30_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  // Online/offline
  useEffect(() => {
    const onOnline = () => { setIsOnline(true); fetchPrices(); };
    const onOffline = () => setIsOnline(false);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [fetchPrices]);

  const sortedCoins = [...COINS].sort((a, b) => {
    const aVal = prices[a]?.[sortBy] ?? 0;
    const bVal = prices[b]?.[sortBy] ?? 0;
    if (sortBy === "price_change_percentage_24h") return bVal - aVal;
    return bVal - aVal;
  });

  const formatLastUpdate = (date) => {
    if (!date) return null;
    return date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "#030712", color: "#f9fafb", padding: "16px" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", margin: 0 }}>Markets</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isOnline ? (
              <Wifi size={16} color="#10b981" />
            ) : (
              <WifiOff size={16} color="#ef4444" />
            )}
            <button
              onClick={() => fetchPrices(true)}
              disabled={refreshing}
              style={{
                background: "none",
                border: "1px solid #374151",
                borderRadius: 8,
                padding: "6px 10px",
                color: "#9ca3af",
                cursor: refreshing ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
              }}
            >
              <RefreshCw
                size={13}
                style={{ animation: refreshing ? "spin 1s linear infinite" : "none" }}
              />
              {refreshing ? "..." : "Refresh"}
            </button>
          </div>
        </div>
        {lastUpdate && (
          <div style={{ fontSize: 11, color: "#6b7280" }}>
            Mis à jour à {formatLastUpdate(lastUpdate)} · auto 30s
          </div>
        )}
        {!isOnline && (
          <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>
            Hors ligne — données en cache
          </div>
        )}
      </div>

      {/* Sort */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSortBy(opt.value)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: "1px solid",
              borderColor: sortBy === opt.value ? "#6366f1" : "#374151",
              background: sortBy === opt.value ? "#6366f122" : "transparent",
              color: sortBy === opt.value ? "#818cf8" : "#9ca3af",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div
          style={{
            background: "#7f1d1d22",
            border: "1px solid #ef4444",
            borderRadius: 10,
            padding: "10px 14px",
            color: "#fca5a5",
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: 14,
        }}
      >
        {sortedCoins.map((coin) => (
          <CryptoCard
            key={coin}
            coin={coin}
            data={prices[coin] ?? null}
            sparkline={sparklines[coin] ?? []}
            loading={loading}
          />
        ))}
      </div>

      {/* keyframes inline */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
```

**Problèmes corrigés :**
1. **Code tronqué** — `price_change_p` complété, tout le corps de `MarketsPage` reconstruit
2. **Double try/catch fetch** — le fallback CoinGecko avait son `res.ok` non vérifié
3. **`sparkline_in_7d.price`** — accès correct à la propriété CoinGecko + réduction à 50 points pour éviter un recharts lent
4. **`gradientId` dupliqué** — extrait en variable dans `SparklineChart` (évite le `color.replace` inline répété dans `fill`)
5. **Polling + cleanup** — `setInterval` avec `clearInterval` au unmount
6. **Listeners online/offline** — correctement cleanés
7. **`@keyframes`** — ajoutés via `<style>` tag (pulse skeleton + spin refresh)