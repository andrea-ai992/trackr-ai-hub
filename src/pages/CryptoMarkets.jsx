```jsx
// src/pages/CryptoMarkets.jsx
import { useState, useEffect, useCallback } from "react";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=true&price_change_percentage=24h";

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
      {/* Header row */}
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
              style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "15px" }}
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
            style={{ color: "#f1f5f9", fontWeight: "700", fontSize: "16px" }}
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

      {/* Sparkline */}
      <div style={{ marginBottom: "12px" }}>
        <SparklineChart
          data={coin.sparkline_in_7d?.price}
          isPositive={isPositive}
        />
      </div>

      {/* Stats row */}
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
            style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}
          >
            Market Cap
          </div>
          <div
            style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}
          >
            {formatLargeNumber(coin.market_cap)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div
            style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}
          >
            Volume 24h
          </div>
          <div
            style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}
          >
            {formatLargeNumber(coin.total_volume)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div
            style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}
          >
            ATH
          </div>
          <div
            style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}
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

export default function CryptoMarkets() {
  const [coins, setCoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown] = useState(REFRESH_INTERVAL / 1000);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchCoins = useCallback(async (isManual = false) => {
    if (isManual) setIsRefreshing(true);
    setError(null);

    try {
      const response = await fetch(COINGECKO_URL);
      if (!response.ok) {
        if (response.status === 429) {
          throw new Error(
            "Rate limit exceeded. Please wait a moment before refreshing."
          );
        }
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setCoins(data);
      setLastUpdated(new Date());
      setCountdown(REFRESH_INTERVAL / 1000);
    } catch (err) {
      setError(err.message || "Failed to fetch cryptocurrency data.");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchCoins();
  }, [fetchCoins]);

  // Auto-refresh every 60s
  useEffect(() => {
    const interval = setInterval(() => fetchCoins(), REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchCoins]);

  // Countdown timer
  useEffect(() => {
    if (loading || error) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? REFRESH_INTERVAL / 1000 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [loading, error]);

  const totalMarketCap = coins.reduce((sum, c) => sum + (c.market_cap ?? 0), 0);
  const gainers = coins.filter((c) => c.price_change_percentage_24h >= 0).length;

  const formatLargeNumber = (n) => {
    if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    return "$" + n.toLocaleString();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #020617 0%, #0f172a 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      }}
    >
      <div style={{ maxWidth: "600px", margin: "0 auto", padding: "16px" }}>

        {/* Header */}
        <div style={{ marginBottom: "20px", paddingTop: "8px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "4px",
            }}
          >
            <h1
              style={{
                color: "#f1f5f9",
                fontSize: "24px",
                fontWeight: "800",
                margin: 0,
                letterSpacing: "-0.5px",
              }}
            >
              Crypto Markets
            </h1>
            <button
              onClick={() => fetchCoins(true)}
              disabled={isRefreshing || loading}
              style={{
                background: isRefreshing ? "#334155" : "#1e40af",
                color: "#f1f5f9",
                border: "none",
                borderRadius: "10px",
                padding: "8px 14px",
                fontSize: "13px",
                fontWeight: "600",
                cursor: isRefreshing || loading ? "not-allowed" : "pointer",
                opacity: isRefreshing || loading ? 0.6 : 1,
                transition: "background 0.2s ease",
              }}
            >
              {isRefreshing ? "Refreshing…" : "↻ Refresh"}
            </button>
          </div>

          <p style={{ color: "#64748b", fontSize: "13px", margin: "4px 0 0" }}>
            Top 10 by market cap · auto-refresh in{" "}
            <span style={{ color: "#94a3b8", fontWeight: "600" }}>
              {countdown}s
            </span>
          </p>
        </div>

        {/* Summary bar */}
        {!loading && !error && coins.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "12px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            {[
              {
                label: "Total Market Cap",
                value: formatLargeNumber(totalMarketCap),
              },
              {
                label: "Gainers / Losers",
                value: `${gainers} / ${coins.length - gainers}`,
                valueColor: gainers >= coins.length - gainers ? "#22c55e" : "#ef4444",
              },
              {
                label: "Last updated",
                value: lastUpdated
                  ? lastUpdated.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    })
                  : "—",
              },
            ].map(({ label, value, valueColor }) => (
              <div
                key={label}
                style={{
                  flex: "1 1 120px",
                  background: "#0f172a",
                  border: "1px solid #1e293b",
                  borderRadius: "12px",
                  padding: "10px 12px",
                }}
              >
                <div
                  style={{
                    color: "#64748b",
                    fontSize: "11px",
                    marginBottom: "4px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    color: valueColor ?? "#f1f5f9",
                    fontSize: "13px",
                    fontWeight: "700",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && <LoadingSkeleton />}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "32px", marginBottom: "12px" }}>⚠️</div>
            <div
              style={{
                color: "#fca5a5",
                fontSize: "14px",
                marginBottom: "16px",
                lineHeight: "1.5",
              }}
            >
              {error}
            </div>
            <button
              onClick={() => fetchCoins(true)}
              style={{
                background: "#1e40af",
                color: "#f1f5f9",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Coin list */}
        {!loading && !error && coins.length > 0 && (
          <div>
            {coins.map((coin, i) => (
              <CoinCard key={coin.id} coin={coin} rank={i + 1} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && coins.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#64748b",
              padding: "48px 16px",
              fontSize: "14px",
            }}
          >
            No data available.
          </div>
        )}

        {/* Footer */}
        <div
          style={{
            textAlign: "center",
            color: "#334155",
            fontSize: "11px",
            marginTop: "24px",
            paddingBottom: "32px",
          }}
        >
          Data provided by CoinGecko API
        </div>
      </div>
    </div>
  );
}