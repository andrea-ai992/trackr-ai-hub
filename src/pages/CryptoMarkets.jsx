import { useState, useEffect, useRef, useCallback } from "react";

const useVirtualScroll = ({
  itemCount,
  itemHeight,
  containerHeight,
  overscan = 3,
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const rafRef = useRef(null);
  const scrollElementRef = useRef(null);

  const handleScroll = useCallback((e) => {
    const currentScrollTop = e.target.scrollTop;
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
    }
    rafRef.current = requestAnimationFrame(() => {
      setScrollTop(currentScrollTop);
      rafRef.current = null;
    });
  }, []);

  useEffect(() => {
    const el = scrollElementRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", handleScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [handleScroll]);

  const totalHeight = itemCount * itemHeight;

  const startIndex = Math.max(
    0,
    Math.floor(scrollTop / itemHeight) - overscan
  );
  const visibleCount = Math.ceil(containerHeight / itemHeight) + 2 * overscan;
  const endIndex = Math.min(itemCount - 1, startIndex + visibleCount);

  const offsetY = startIndex * itemHeight;

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(i);
  }

  return {
    scrollElementRef,
    visibleItems,
    totalHeight,
    offsetY,
    scrollTop,
  };
};

export default useVirtualScroll;


src/pages/CryptoMarkets.jsx
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { LineChart, Line, ResponsiveContainer, Tooltip } from "recharts";
import useVirtualScroll from "../hooks/useVirtualScroll";

const COINGECKO_URL =
  "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h";

const REFRESH_INTERVAL = 60000;
const ITEM_HEIGHT = 220;
const CONTAINER_HEIGHT = typeof window !== "undefined" ? window.innerHeight - 160 : 600;

const globalStyles = `
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  .crypto-scroll-container {
    -webkit-overflow-scrolling: touch;
    overflow-y: scroll;
    overscroll-behavior: contain;
    overscroll-behavior-y: contain;
    scroll-behavior: auto;
    will-change: scroll-position;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
  }

  .coin-card {
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    will-change: auto;
  }

  .coin-card:active {
    transform: scale(0.99) translateZ(0);
    -webkit-transform: scale(0.99) translateZ(0);
  }

  @media (hover: hover) {
    .coin-card:hover {
      transform: translateY(-2px) translateZ(0);
      -webkit-transform: translateY(-2px) translateZ(0);
      box-shadow: 0 8px 16px rgba(0,0,0,0.4) !important;
    }
  }

  .filter-btn {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
    user-select: none;
    -webkit-user-select: none;
  }

  .search-input:focus {
    border-color: #6366f1 !important;
  }
`;

function SparklineChart({ data, isPositive }) {
  if (!data || data.length === 0) return null;
  const chartData = useMemo(
    () => data.map((price, index) => ({ index, price })),
    [data]
  );

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

const CoinCard = ({ coin, rank, style }) => {
  const isPositive = coin.price_change_percentage_24h >= 0;
  const changeColor = isPositive ? "#22c55e" : "#ef4444";
  const changeBg = isPositive ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)";

  const formatPrice = useCallback((price) => {
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
  }, []);

  const formatLargeNumber = useCallback((n) => {
    if (n == null) return "N/A";
    if (n >= 1e12) return "$" + (n / 1e12).toFixed(2) + "T";
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    return "$" + n.toLocaleString();
  }, []);

  const sparklineData = useMemo(
    () => coin.sparkline_in_7d?.price,
    [coin.sparkline_in_7d]
  );

  return (
    <div
      className="coin-card"
      style={{
        ...style,
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid #334155",
        borderRadius: "16px",
        padding: "16px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
        cursor: "pointer",
        transition: "box-shadow 0.2s ease",
        boxSizing: "border-box",
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
            loading="lazy"
            decoding="async"
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
        <SparklineChart data={sparklineData} isPositive={isPositive} />
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
          <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}>
            Market Cap
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>
            {formatLargeNumber(coin.market_cap)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}>
            Volume 24h
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>
            {formatLargeNumber(coin.total_volume)}
          </div>
        </div>
        <div style={{ flex: 1, textAlign: "right" }}>
          <div style={{ color: "#64748b", fontSize: "11px", marginBottom: "2px" }}>
            ATH
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px", fontWeight: "600" }}>
            {formatPrice(coin.ath)}
          </div>
        </div>
      </div>
    </div>
  );
};

function LoadingSkeleton() {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          style={{
            background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
            border: "1px solid #334155",
            borderRadius: "16px",
            padding: "16px",
            marginBottom: "12px",
            height: `${ITEM_HEIGHT - 12}px`,
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

  const update = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value === "" || value === null) {
          next.delete(key);
        } else {
          next.set(key, value);
        }
        return next;
      });
    },
    [setSearchParams]
  );

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "#0a0f1e",
        paddingBottom: "12px",
        paddingTop: "4px",
      }}
    >
      <div style={{ position: "relative", marginBottom: "10px" }}>
        <span
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            fontSize: "16px",
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          🔍
        </span>
        <input
          className="search-input"
          type="search"
          placeholder="Search coins..."
          value={query}
          onChange={(e) => update("q", e.target.value)}
          style={inputStyle}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
        />
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <div
          style={{
            display: "flex",
            gap: "6px",
            flex: 1,
            overflowX: "auto",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              className="filter-btn"
              onClick={() => update("filter", opt.value === "all" ? null : opt.value)}
              style={{
                whiteSpace: "nowrap",
                padding: "7px 14px",
                borderRadius: "20px",
                border: "1px solid",
                borderColor: filter === opt.value ? "#6366f1" : "#334155",
                background:
                  filter === opt.value
                    ? "rgba(99,102,241,0.15)"
                    : "transparent",
                color: filter === opt.value ? "#818cf8" : "#64748b",
                fontSize: "13px",
                fontWeight: filter === opt.value ? "600" : "400",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div style={{ position: "relative", minWidth: "120px" }}>
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
              right: "8px",
              top: "50%",
              transform: "translateY(-50%)",
              pointerEvents: "none",
              fontSize: "10px",
              color: "#64748b",
            }}
          >
            ▼
          </span>
        </div>
      </div>
    </div>
  );
}

function VirtualCoinList({ coins }) {
  const [containerHeight, setContainerHeight] = useState(CONTAINER_HEIGHT);
  const containerRef = useRef(null);

  useEffect(() => {
    const updateHeight = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const { scrollElementRef, visibleItems, totalHeight, offsetY } =
    useVirtualScroll({
      itemCount: coins.length,
      itemHeight: ITEM_HEIGHT,