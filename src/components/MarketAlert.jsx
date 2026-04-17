
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  memo,
} from "react";
import { useDrag } from "@use-gesture/react";
import { useSpring, animated, config } from "@react-spring/web";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from "recharts";

// ─── Vibration helper ───────────────────────────────────────────────────────
const vibrate = (pattern = [10]) => {
  if (typeof navigator !== "undefined" && navigator.vibrate) {
    navigator.vibrate(pattern);
  }
};

// ─── Skeleton block ──────────────────────────────────────────────────────────
const Skeleton = memo(({ className = "" }) => (
  <div
    className={`animate-pulse rounded bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 bg-[length:200%_100%] ${className}`}
    style={{ backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite linear" }}
  />
));
Skeleton.displayName = "Skeleton";

// ─── Sparkline (lazy via IntersectionObserver) ───────────────────────────────
const SparklineChart = memo(({ data, color, isPositive }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1, rootMargin: "50px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className="w-20 h-10 flex-shrink-0"
      style={{ contain: "layout paint" }}
    >
      {visible ? (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id={`grad-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="v"
              stroke={color}
              strokeWidth={1.5}
              fill={`url(#grad-${color.replace("#", "")})`}
              dot={false}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{ display: "none" }}
              cursor={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <Skeleton className="w-full h-full" />
      )}
    </div>
  );
});
SparklineChart.displayName = "SparklineChart";

// ─── Single alert card ───────────────────────────────────────────────────────
const AlertCard = memo(({ alert, onDismiss, index }) => {
  const [dismissed, setDismissed] = useState(false);
  const prevPrice = useRef(alert.price);
  const [flash, setFlash] = useState(null); // "up" | "down" | null

  const isPositive = alert.change >= 0;
  const color = isPositive ? "#22d3ee" : "#f87171";

  // Price flash animation on update
  useEffect(() => {
    if (prevPrice.current === alert.price) return;
    const dir = alert.price > prevPrice.current ? "up" : "down";
    setFlash(dir);
    prevPrice.current = alert.price;
    vibrate([8]);
    const t = setTimeout(() => setFlash(null), 600);
    return () => clearTimeout(t);
  }, [alert.price]);

  // Spring for card entry / dismiss
  const [spring, api] = useSpring(() => ({
    x: 0,
    opacity: 1,
    scale: 1,
    config: config.stiff,
  }));

  // Entry animation on mount
  useEffect(() => {
    api.start({
      from: { opacity: 0, scale: 0.94 },
      to: { opacity: 1, scale: 1 },
      delay: index * 60,
    });
  }, []);

  const dismiss = useCallback(() => {
    vibrate([15, 5, 15]);
    api.start({
      x: 400,
      opacity: 0,
      config: { tension: 220, friction: 28 },
      onRest: () => {
        setDismissed(true);
        onDismiss(alert.id);
      },
    });
  }, [alert.id, api, onDismiss]);

  // Swipe gesture
  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx], cancel }) => {
      if (active && Math.abs(mx) > 120) {
        cancel();
        dismiss();
        return;
      }
      api.start({
        x: active ? mx : 0,
        scale: active ? 1 - Math.abs(mx) / 800 : 1,
        opacity: active ? 1 - Math.abs(mx) / 300 : 1,
        immediate: (key) => key === "x" && active,
        config: active ? { tension: 500, friction: 40 } : config.stiff,
      });
    },
    {
      axis: "x",
      filterTaps: true,
      pointer: { touch: true },
    }
  );

  if (dismissed) return null;

  return (
    <animated.div
      {...bind()}
      style={{
        x: spring.x,
        opacity: spring.opacity,
        scale: spring.scale,
        willChange: "transform, opacity",
        contain: "layout",
        touchAction: "pan-y",
      }}
      className="relative select-none cursor-grab active:cursor-grabbing"
    >
      <div
        className={`
          relative overflow-hidden rounded-2xl border border-slate-700/60
          bg-slate-900/80 backdrop-blur-md px-4 py-3
          shadow-[0_2px_20px_rgba(0,0,0,0.4)]
          transition-colors duration-300
          ${flash === "up" ? "bg-cyan-950/70" : ""}
          ${flash === "down" ? "bg-red-950/70" : ""}
        `}
        style={{ contain: "layout paint" }}
      >
        {/* Severity indicator strip */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl"
          style={{ backgroundColor: color }}
        />

        {/* Dismiss hint background */}
        <div className="absolute inset-0 flex items-center justify-end pr-4 opacity-0 group-hover:opacity-100 pointer-events-none">
          <span className="text-slate-500 text-xs">swipe →</span>
        </div>

        <div className="flex items-center gap-3 pl-2">
          {/* Icon + symbol */}
          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {/* Badge */}
              {alert.badge && (
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide"
                  style={{ backgroundColor: color + "22", color }}
                >
                  {alert.badge}
                </span>
              )}
              <span className="text-xs text-slate-400 font-medium tracking-widest uppercase truncate">
                {alert.symbol}
              </span>
            </div>

            <p className="text-slate-100 text-sm font-medium mt-0.5 leading-tight line-clamp-2">
              {alert.message}
            </p>

            <div className="flex items-center gap-3 mt-2">
              {/* Price */}
              <span
                className={`text-base font-bold tabular-nums transition-colors duration-300 ${
                  flash === "up"
                    ? "text-cyan-300"
                    : flash === "down"
                    ? "text-red-400"
                    : "text-slate-100"
                }`}
              >
                ${alert.price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>

              {/* Change badge */}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                  isPositive
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "bg-red-500/15 text-red-400"
                }`}
              >
                {isPositive ? "▲" : "▼"}{" "}
                {Math.abs(alert.change).toFixed(2)}%
              </span>

              {/* Volume */}
              {alert.volume && (
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Vol {alert.volume}
                </span>
              )}
            </div>
          </div>

          {/* Sparkline */}
          <SparklineChart
            data={alert.sparklineData}
            color={color}
            isPositive={isPositive}
          />

          {/* Dismiss button */}
          <button
            onClick={(e) => { e.stopPropagation(); dismiss(); }}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-slate-500 hover:text-slate-200 hover:bg-slate-700/50 transition-colors duration-150 -mr-1"
            aria-label="Dismiss alert"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-2 mt-2 pl-2">
          <div className={`w-1.5 h-1.5 rounded-full animate-pulse`} style={{ backgroundColor: color }} />
          <span className="text-[10px] text-slate-600 tabular-nums">
            {new Date(alert.timestamp).toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        </div>
      </div>
    </animated.div>
  );
});
AlertCard.displayName = "AlertCard";

// ─── Skeleton card ───────────────────────────────────────────────────────────
const SkeletonCard = memo(({ index }) => {
  const [spring] = useSpring(() => ({
    from: { opacity: 0, y: 12 },
    to: { opacity: 1, y: 0 },
    delay: index * 80,
    config: config.gentle,
  }));

  return (
    <animated.div style={{ ...spring, willChange: "transform, opacity" }}>
      <div className="rounded-2xl border border-slate-700/60 bg-slate-900/80 px-4 py-3 shadow-[0_2px_20px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-3">
          <div className="flex flex-col flex-1 gap-2">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-48" />
            <div className="flex gap-2 mt-1">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
          <Skeleton className="w-20 h-10 rounded-lg flex-shrink-0" />
          <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
        </div>
        <div className="flex gap-2 mt-2">
          <Skeleton className="w-1.5 h-1.5 rounded-full" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
    </animated.div>
  );
});
SkeletonCard.displayName = "SkeletonCard";

// ─── Timeline connector ──────────────────────────────────────────────────────
const TimelineConnector = memo(({ active }) => (
  <div className="flex flex-col items-center w-3 flex-shrink-0 mt-3">
    <div
      className={`w-px flex-1 transition-colors duration-500 ${
        active ? "bg-gradient-to-b from-cyan-500/60 to-transparent" : "bg-slate-700/40"
      }`}
    />
  </div>
));
TimelineConnector.displayName = "TimelineConnector";

// ─── Generate mock sparkline data ────────────────────────────────────────────
const genSparkline = (points = 20, base = 100, volatile = 5) => {
  const data = [];
  let v = base;
  for (let i = 0; i < points; i++) {
    v += (Math.random() - 0.49) * volatile;
    data.push({ v: Math.max(0, v) });
  }
  return data;
};

// ─── Mock data factory ───────────────────────────────────────────────────────
const MOCK_ALERTS = [
  {
    id: "btc-1",
    symbol: "BTC/USD",
    message: "Bitcoin breaks above key resistance at $68,000",
    price: 68432.10,
    change: 3.42,
    volume: "2.1B",
    badge: "BREAKOUT",
    sparklineData: genSparkline(20, 65000, 800),
    timestamp: Date.now() - 12000,
  },
  {
    id: "eth-1",
    symbol: "ETH/USD",
    message: "Ethereum RSI enters overbought territory — watch for correction",
    price: 3812.55,
    change: -1.18,
    volume: "980M",
    badge: "WARNING",
    sparklineData: genSparkline(20, 3900, 50),
    timestamp: Date.now() - 48000,
  },
  {
    id: "sol-1",
    symbol: "SOL/USD",
    message: "Solana +8% surge on record DEX volume — momentum strong",
    price: 182.30,
    change: 8.07,
    volume: "312M",
    badge: "PUMP",
    sparklineData: genSparkline(20, 165, 4),
    timestamp: Date.now() - 120000,
  },
  {
    id: "aapl-1",
    symbol: "AAPL",
    message: "Apple reports beat on EPS — raised guidance for Q4 2024",
    price: 219.86,
    change: 1.94,
    volume: "54.2M",
    badge: "EARNINGS",
    sparklineData: genSparkline(20, 215, 2),
    timestamp: Date.now() - 300000,
  },
  {
    id: "nvda-1",
    symbol: "NVDA",
    message: "NVDA drops 4.2% after analyst downgrade — support at $108",
    price: 112.40,
    change: -4.20,
    volume: "211M",
    badge: "ALERT",
    sparklineData: genSparkline(20, 118, 2),
    timestamp: Date.now() - 600000,
  },
];

// ─── Header ──────────────────────────────────────────────────────────────────
const MarketAlertHeader = memo(({ count, onClearAll }) => (
  <div className="flex items-center justify-between px-4 py-3 sticky top-0 z-10 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/60">
    <div className="flex items-center gap-2">
      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
      <h1 className="text-slate-100 font-semibold text-sm tracking-wide">
        Market Alerts
      </h1>
      {count > 0 && (
        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
    {count > 0 && (
      <button
        onClick={onClearAll}
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors duration-150"
      >
        Clear all
      </button>
    )}
  </div>
));
MarketAlertHeader.displayName = "MarketAlertHeader";

// ─── Empty state ─────────────────────────────────────────────────────────────
const EmptyState = memo(() => {
  const [spring] = useSpring(() => ({
    from: { opacity: 0, scale: 0.9 },
    to: { opacity: 1, scale: 1 },
    config: config.gentle,
  }));

  return (
    <animated.div
      style={{ ...spring, willChange: "transform, opacity" }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-slate-500">
          <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" stroke="currentColor" strokeWidth