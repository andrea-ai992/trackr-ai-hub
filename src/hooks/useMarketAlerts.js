src/hooks/useMarketAlerts.js

import { useState, useEffect, useCallback, useRef } from 'react';

const MOCK_SYMBOLS = [
  { symbol: 'BTC', name: 'Bitcoin', basePrice: 67234.5, color: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', basePrice: 3456.78, color: '#627EEA' },
  { symbol: 'SOL', name: 'Solana', basePrice: 178.34, color: '#9945FF' },
  { symbol: 'AAPL', name: 'Apple Inc.', basePrice: 189.45, color: '#555555' },
  { symbol: 'TSLA', name: 'Tesla Inc.', basePrice: 242.67, color: '#CC0000' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', basePrice: 875.23, color: '#76B900' },
  { symbol: 'GOLD', name: 'Gold Spot', basePrice: 2341.5, color: '#FFD700' },
  { symbol: 'EUR', name: 'EUR/USD', basePrice: 1.0876, color: '#003399' },
];

function generateSparklineData(basePrice, points = 20) {
  const data = [];
  let current = basePrice;
  for (let i = 0; i < points; i++) {
    const change = (Math.random() - 0.49) * basePrice * 0.008;
    current = Math.max(current + change, basePrice * 0.85);
    data.push({
      index: i,
      value: parseFloat(current.toFixed(current < 10 ? 4 : 2)),
    });
  }
  return data;
}

function generateAlert(symbolData, id) {
  const priceVariation = (Math.random() - 0.48) * symbolData.basePrice * 0.025;
  const newPrice = parseFloat(
    (symbolData.basePrice + priceVariation).toFixed(
      symbolData.basePrice < 10 ? 4 : 2
    )
  );
  const changePercent = parseFloat(
    ((priceVariation / symbolData.basePrice) * 100).toFixed(2)
  );
  const isPositive = changePercent >= 0;
  const absChange = Math.abs(changePercent);

  let severity = 'low';
  if (absChange > 2) severity = 'critical';
  else if (absChange > 1) severity = 'high';
  else if (absChange > 0.5) severity = 'medium';

  return {
    id: id || `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    symbol: symbolData.symbol,
    name: symbolData.name,
    color: symbolData.color,
    price: newPrice,
    previousPrice: symbolData.basePrice,
    change: parseFloat(priceVariation.toFixed(newPrice < 10 ? 4 : 2)),
    changePercent,
    isPositive,
    severity,
    volume: Math.floor(Math.random() * 10000000 + 100000),
    marketCap: parseFloat(
      (newPrice * (Math.random() * 1000000000 + 100000000)).toFixed(0)
    ),
    sparklineData: generateSparklineData(symbolData.basePrice),
    timestamp: new Date(),
    isNew: true,
    dismissed: false,
    loaded: false,
  };
}

export function useMarketAlerts(options = {}) {
  const {
    maxAlerts = 15,
    refreshInterval = 3500,
    enableVibration = true,
    autoGenerate = true,
  } = options;

  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    positive: 0,
    negative: 0,
    critical: 0,
  });

  const intervalRef = useRef(null);
  const idCounterRef = useRef(0);
  const symbolPricesRef = useRef({});

  const triggerVibration = useCallback(
    (severity) => {
      if (!enableVibration || !navigator.vibrate) return;
      const patterns = {
        low: [30],
        medium: [50, 30, 50],
        high: [80, 40, 80],
        critical: [100, 50, 100, 50, 100],
      };
      try {
        navigator.vibrate(patterns[severity] || patterns.low);
      } catch (e) {
        // Vibration not supported silently
      }
    },
    [enableVibration]
  );

  const initializeSymbolPrices = useCallback(() => {
    const prices = {};
    MOCK_SYMBOLS.forEach((s) => {
      prices[s.symbol] = s.basePrice;
    });
    symbolPricesRef.current = prices;
  }, []);

  const addAlert = useCallback(
    (symbolData) => {
      idCounterRef.current += 1;
      const alert = generateAlert(symbolData, `alert-${idCounterRef.current}`);

      symbolPricesRef.current[symbolData.symbol] = alert.price;

      setAlerts((prev) => {
        const filtered = prev.filter((a) => !a.dismissed);
        const newAlerts = [alert, ...filtered].slice(0, maxAlerts);
        return newAlerts;
      });

      setStats((prev) => ({
        total: prev.total + 1,
        positive: alert.isPositive ? prev.positive + 1 : prev.positive,
        negative: !alert.isPositive ? prev.negative + 1 : prev.negative,
        critical:
          alert.severity === 'critical' ? prev.critical + 1 : prev.critical,
      }));

      triggerVibration(alert.severity);

      setTimeout(() => {
        setAlerts((prev) =>
          prev.map((a) => (a.id === alert.id ? { ...a, isNew: false } : a))
        );
      }, 600);
    },
    [maxAlerts, triggerVibration]
  );

  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, dismissed: true } : a))
    );
    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    }, 350);
  }, []);

  const dismissAll = useCallback(() => {
    setAlerts((prev) => prev.map((a) => ({ ...a, dismissed: true })));
    setTimeout(() => setAlerts([]), 400);
  }, []);

  const markLoaded = useCallback((alertId) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, loaded: true } : a))
    );
  }, []);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  const generateBatch = useCallback(() => {
    const count = Math.floor(Math.random() * 2) + 1;
    const shuffled = [...MOCK_SYMBOLS].sort(() => Math.random() - 0.5);
    for (let i = 0; i < count; i++) {
      const symbolData = {
        ...shuffled[i],
        basePrice:
          symbolPricesRef.current[shuffled[i].symbol] || shuffled[i].basePrice,
      };
      setTimeout(() => addAlert(symbolData), i * 120);
    }
  }, [addAlert]);

  useEffect(() => {
    initializeSymbolPrices();

    const initialAlerts = MOCK_SYMBOLS.slice(0, 5).map((s, i) => {
      idCounterRef.current += 1;
      const alert = generateAlert(
        { ...s, basePrice: symbolPricesRef.current[s.symbol] || s.basePrice },
        `alert-init-${i}`
      );
      symbolPricesRef.current[s.symbol] = alert.price;
      return { ...alert, isNew: false };
    });

    setTimeout(() => {
      setAlerts(initialAlerts);
      setStats({
        total: initialAlerts.length,
        positive: initialAlerts.filter((a) => a.isPositive).length,
        negative: initialAlerts.filter((a) => !a.isPositive).length,
        critical: initialAlerts.filter((a) => a.severity === 'critical').length,
      });
      setIsLoading(false);
    }, 800);
  }, [initializeSymbolPrices]);

  useEffect(() => {
    if (!autoGenerate || isLoading) return;

    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        generateBatch();
      }, refreshInterval);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoGenerate, isLoading, isPaused, refreshInterval, generateBatch]);

  return {
    alerts,
    isLoading,
    isPaused,
    stats,
    dismissAlert,
    dismissAll,
    markLoaded,
    pause,
    resume,
    addAlert,
  };
}

---

src/components/MarketAlert.jsx

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  memo,
  useMemo,
} from 'react';
import { useSpring, animated, config } from '@react-spring/web';
import { useDrag } from '@use-gesture/react';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  YAxis,
} from 'recharts';
import { useMarketAlerts } from '../hooks/useMarketAlerts';

// ─── Utility Helpers ────────────────────────────────────────────────────────

function formatPrice(price) {
  if (price >= 1000) return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

function formatVolume(vol) {
  if (vol >= 1e9) return `${(vol / 1e9).toFixed(1)}B`;
  if (vol >= 1e6) return `${(vol / 1e6).toFixed(1)}M`;
  if (vol >= 1e3) return `${(vol / 1e3).toFixed(1)}K`;
  return vol.toString();
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
}

function severityConfig(severity) {
  const map = {
    low: {
      bg: 'bg-slate-800/60',
      border: 'border-slate-600/40',
      badge: 'bg-slate-700 text-slate-300',
      glow: '',
      dot: 'bg-slate-400',
    },
    medium: {
      bg: 'bg-blue-950/60',
      border: 'border-blue-500/30',
      badge: 'bg-blue-900/80 text-blue-300',
      glow: 'shadow-blue-500/10',
      dot: 'bg-blue-400',
    },
    high: {
      bg: 'bg-amber-950/60',
      border: 'border-amber-500/30',
      badge: 'bg-amber-900/80 text-amber-300',
      glow: 'shadow-amber-500/15',
      dot: 'bg-amber-400',
    },
    critical: {
      bg: 'bg-red-950/60',
      border: 'border-red-500/40',
      badge: 'bg-red-900/80 text-red-300',
      glow: 'shadow-red-500/20',
      dot: 'bg-red-500',
    },
  };
  return map[severity] || map.low;
}

// ─── Skeleton ───────────────────────────────────────────────────────────────

const AlertSkeleton = memo(() => (
  <div
    className="relative overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4 backdrop-blur-sm"
    style={{ contain: 'layout style' }}
  >
    <div className="flex items-start gap-3">
      <div className="h-10 w-10 animate-pulse rounded-full bg-slate-700/60" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <div className="h-4 w-20 animate-pulse rounded-md bg-slate-700/60" />
          <div className="h-4 w-16 animate-pulse rounded-md bg-slate-700/60" />
        </div>
        <div className="h-3 w-32 animate-pulse rounded-md bg-slate-700/40" />
        <div className="mt-3 h-12 w-full animate-pulse rounded-lg bg-slate-700/30" />
        <div className="flex gap-2">
          <div className="h-3 w-24 animate-pulse rounded bg-slate-700/40" />
          <div className="h-3 w-16 animate-pulse rounded bg-slate-700/40" />
        </div>
      </div>
    </div>
    <div
      className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite]"
      style={{
        background:
          'linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent)',
      }}
    />
  </div>
));

// ─── Sparkline with IntersectionObserver ────────────────────────────────────

const SparklineChart = memo(({ data, isPositive, color, alertId, onLoaded }) => {
  const containerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasLoaded) {
          setIsVisible(true);
          setHasLoaded(true);
          observer.disconnect();
          if (onLoaded) onLoaded(alertId);
        }
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [alertId, hasLoaded, onLoaded]);

  const lineColor = isPositive ? '#22c55e' : '#ef4444';
  const gradientId = `spark-${alertId}`;

  return (
    <div
      ref={containerRef}
      className="mt-2.5 h-14 w-full"
      style={{ contain: 'layout size', willChange: 'contents' }}
    >
      {isVisible ? (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <YAxis domain={['dataMin', 'dataMax']} hide />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="rounded-lg border border-slate-600/60 bg-slate-900/95 px-2 py-1 text-xs text-slate-200 shadow-xl backdrop-blur-md">
                    {formatPrice(payload[0].value)}
                  </div>
                );
              }}
            />
            <Line
              type="monotoneX"
              dataKey="value"
              stroke={lineColor}
              strokeWidth={1.5}
              dot={false}
              activeDot={{ r: 3, fill: lineColor, strokeWidth: 0 }}
              isAnimationActive={true}
              animationDuration={600}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full animate-pulse rounded-lg bg-slate-700/25" />
      )}
    </div>
  );
});

// ─── Single Alert Card ───────────────────────────────────────────────────────

const AlertCard = memo(({ alert, onDismiss, onLoaded }) => {
  const cfg = severityConfig(alert.severity);
  const isDismissed = useRef(false);

  const [{ x, opacity, scale }, api] = useSpring(() => ({
    x: 0,
    opacity: 1,
    scale: 1,
    config: { tension: 280, friction: 26 },
  }));

  const [entryStyle, entryApi] = useSpring(() => ({
    from: { opacity: 0, y: -18, scale: 0.95 },
    to: { opacity: 1, y: 0, scale: 1 },
    config: { tension: 320, friction: 28 },
  }));

  useEffect(() => {
    if (alert.dismissed && !isDismissed.current) {
      isDismissed.current = true;
      api.start({
        opacity: 0,
        scale: 0.92,
        x: 80,
        config: { tension: 300, friction: 22 },
      });
    }
  }, [alert.dismissed, api]);

  const bind = useDrag(
    ({ active, movement: [mx], velocity: [vx], direction: [dx], cancel }) => {
      const swipeThreshold = 100;
      const velocityThreshold = 0.4;

      if (
        !active &&
        (Math.abs(mx) > swipeThreshold || Math.abs(vx) > velocityThreshold) &&
        !isDismissed.current
      ) {
        isDismissed.current = true;
        const direction = dx > 0 ? 1 : -1;
        api.start({
          x: direction * 420,
          opacity: 0,
          scale: 0.88,
          config: { tension: 300, friction: 20 },
        });
        setTimeout(() => onDismiss(alert.id), 280);