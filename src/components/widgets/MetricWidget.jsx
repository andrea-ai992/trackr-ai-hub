src/components/widgets/MetricWidget.jsx

import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Maximize2,
  Minimize2,
  ChevronUp,
  ChevronDown,
  GripVertical,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Tooltip,
} from 'recharts';

// ─── Utility helpers ────────────────────────────────────────────────────────

const formatValue = (value, format = 'number', decimals = 2) => {
  if (value === null || value === undefined) return '—';
  const num = Number(value);
  if (isNaN(num)) return String(value);

  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
    case 'percent':
      return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
    case 'compact':
      return new Intl.NumberFormat('fr-FR', {
        notation: 'compact',
        maximumFractionDigits: decimals,
      }).format(num);
    case 'integer':
      return new Intl.NumberFormat('fr-FR').format(Math.round(num));
    default:
      return new Intl.NumberFormat('fr-FR', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }).format(num);
  }
};

const getTrendConfig = (change) => {
  if (change === null || change === undefined) return { icon: Minus, color: 'var(--w-neutral)', label: 'neutral' };
  const num = Number(change);
  if (num > 0) return { icon: TrendingUp, color: 'var(--w-positive)', label: 'positive' };
  if (num < 0) return { icon: TrendingDown, color: 'var(--w-negative)', label: 'negative' };
  return { icon: Minus, color: 'var(--w-neutral)', label: 'neutral' };
};

const generateSparkGradientId = (id) => `spark-gradient-${id}`;

// ─── Custom Sparkline Tooltip ────────────────────────────────────────────────

const SparkTooltip = ({ active, payload, format, decimals }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'var(--w-tooltip-bg)',
        border: '1px solid var(--w-border)',
        borderRadius: '6px',
        padding: '4px 8px',
        fontSize: '11px',
        color: 'var(--w-text-primary)',
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
      }}
    >
      {formatValue(payload[0].value, format, decimals)}
    </div>
  );
};

// ─── Sparkline sub-component ─────────────────────────────────────────────────

const Sparkline = ({ data = [], dataKey = 'value', trend, format, decimals, height = 56 }) => {
  const gradientId = generateSparkGradientId(Math.random().toString(36).slice(2));
  const color =
    trend === 'positive'
      ? 'var(--w-positive)'
      : trend === 'negative'
      ? 'var(--w-negative)'
      : 'var(--w-neutral)';

  if (!data.length) return null;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Tooltip
          content={<SparkTooltip format={format} decimals={decimals} />}
          cursor={{ stroke: color, strokeWidth: 1, strokeDasharray: '4 2' }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gradientId})`}
          dot={false}
          activeDot={{ r: 3, fill: color, strokeWidth: 0 }}
          animationDuration={800}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ─── Fullscreen Portal ────────────────────────────────────────────────────────

const FullscreenOverlay = ({ children, onClose }) => (
  <motion.div
    key="fullscreen-overlay"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
    onClick={onClose}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9998,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
    }}
  >
    <motion.div
      key="fullscreen-content"
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      onClick={(e) => e.stopPropagation()}
      style={{ width: '100%', maxWidth: '560px' }}
    >
      {children}
    </motion.div>
  </motion.div>
);

// ─── Main MetricWidget ────────────────────────────────────────────────────────

const MetricWidget = ({
  // Identity
  id = 'metric-widget',
  title = 'Metric',
  subtitle,
  description,

  // Data
  value,
  previousValue,
  change,
  changeLabel = '24h',
  sparklineData = [],
  sparklineDataKey = 'value',
  unit,

  // Formatting
  format = 'number',
  decimals = 2,

  // State
  loading = false,
  error = null,
  lastUpdated,

  // Behaviour
  collapsible = true,
  defaultCollapsed = false,
  draggable = true,
  refreshable = false,
  onRefresh,

  // Style overrides
  accentColor,
  className = '',
  style = {},
}) => {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [fullscreen, setFullscreen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const widgetRef = useRef(null);

  const trendConfig = getTrendConfig(change);
  const TrendIcon = trendConfig.icon;

  const handleRefresh = useCallback(async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setTimeout(() => setIsRefreshing(false), 600);
    }
  }, [onRefresh, isRefreshing]);

  const dynamicAccent = accentColor || trendConfig.color;

  // ── Card inner content (reused in normal + fullscreen) ──
  const CardContent = ({ isFullscreenMode = false }) => (
    <div className={`metric-widget__card ${collapsed && !isFullscreenMode ? 'metric-widget__card--collapsed' : ''}`}>
      {/* ── Header ── */}
      <div className="metric-widget__header">
        {draggable && (
          <div className="metric-widget__drag-handle" aria-label="Drag widget">
            <GripVertical size={14} />
          </div>
        )}

        <div className="metric-widget__title-group">
          <h3 className="metric-widget__title">{title}</h3>
          {subtitle && <span className="metric-widget__subtitle">{subtitle}</span>}
        </div>

        <div className="metric-widget__controls">
          {description && (
            <motion.button
              className={`metric-widget__icon-btn ${showInfo ? 'metric-widget__icon-btn--active' : ''}`}
              onClick={() => setShowInfo((v) => !v)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Widget info"
            >
              <Info size={13} />
            </motion.button>
          )}

          {refreshable && onRefresh && (
            <motion.button
              className="metric-widget__icon-btn"
              onClick={handleRefresh}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label="Refresh widget"
              disabled={isRefreshing}
            >
              <motion.span
                animate={{ rotate: isRefreshing ? 360 : 0 }}
                transition={{ repeat: isRefreshing ? Infinity : 0, duration: 0.7, ease: 'linear' }}
                style={{ display: 'flex' }}
              >
                <RefreshCw size={13} />
              </motion.span>
            </motion.button>
          )}

          <motion.button
            className="metric-widget__icon-btn"
            onClick={() => setFullscreen((v) => !v)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            aria-label={isFullscreenMode ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreenMode ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
          </motion.button>

          {collapsible && !isFullscreenMode && (
            <motion.button
              className="metric-widget__icon-btn"
              onClick={() => setCollapsed((v) => !v)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
            >
              {collapsed ? <ChevronDown size={13} /> : <ChevronUp size={13} />}
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Info tooltip ── */}
      <AnimatePresence>
        {showInfo && description && (
          <motion.div
            key="info-panel"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="metric-widget__info-panel"
          >
            {description}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Body ── */}
      <AnimatePresence initial={false}>
        {(!collapsed || isFullscreenMode) && (
          <motion.div
            key="body"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="metric-widget__body"
          >
            {loading ? (
              <div className="metric-widget__skeleton-wrap">
                <div className="metric-widget__skeleton metric-widget__skeleton--value" />
                <div className="metric-widget__skeleton metric-widget__skeleton--badge" />
                <div className="metric-widget__skeleton metric-widget__skeleton--spark" />
              </div>
            ) : error ? (
              <div className="metric-widget__error">
                <span>⚠ {error}</span>
              </div>
            ) : (
              <>
                {/* ── Value row ── */}
                <div className="metric-widget__value-row">
                  <motion.span
                    key={String(value)}
                    className="metric-widget__value"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35 }}
                    style={{ '--accent': dynamicAccent }}
                  >
                    {formatValue(value, format, decimals)}
                    {unit && <span className="metric-widget__unit">{unit}</span>}
                  </motion.span>

                  {change !== undefined && change !== null && (
                    <motion.div
                      key={String(change)}
                      className={`metric-widget__badge metric-widget__badge--${trendConfig.label}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    >
                      <TrendIcon size={11} strokeWidth={2.5} />
                      <span>{formatValue(Math.abs(Number(change)), 'percent', 2)}</span>
                      {changeLabel && <span className="metric-widget__badge-label">{changeLabel}</span>}
                    </motion.div>
                  )}
                </div>

                {/* ── Previous value row ── */}
                {previousValue !== undefined && previousValue !== null && (
                  <div className="metric-widget__prev-row">
                    <span className="metric-widget__prev-label">Précédent</span>
                    <span className="metric-widget__prev-value">
                      {formatValue(previousValue, format, decimals)}
                    </span>
                  </div>
                )}

                {/* ── Sparkline ── */}
                {sparklineData.length > 0 && (
                  <div className="metric-widget__sparkline">
                    <Sparkline
                      data={sparklineData}
                      dataKey={sparklineDataKey}
                      trend={trendConfig.label}
                      format={format}
                      decimals={decimals}
                      height={isFullscreenMode ? 100 : 56}
                    />
                  </div>
                )}

                {/* ── Footer ── */}
                {lastUpdated && (
                  <div className="metric-widget__footer">
                    <span className="metric-widget__updated">
                      Mis à jour {typeof lastUpdated === 'string' ? lastUpdated : lastUpdated.toLocaleTimeString('fr-FR')}
                    </span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Accent bottom bar ── */}
      <div
        className="metric-widget__accent-bar"
        style={{ background: `linear-gradient(90deg, ${dynamicAccent}99, ${dynamicAccent}22)` }}
      />
    </div>
  );

  return (
    <>
      {/* ── Normal card ── */}
      <motion.div
        ref={widgetRef}
        id={id}
        className={`metric-widget ${className}`}
        style={style}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        whileHover={{
          scale: 1.02,
          boxShadow: `0 8px 32px rgba(0,0,0,0.22), 0 0 0 1px var(--w-border-hover)`,
          transition: { duration: 0.2 },
        }}
      >
        <CardContent isFullscreenMode={false} />
      </motion.div>

      {/* ── Fullscreen overlay ── */}
      <AnimatePresence>
        {fullscreen && (
          <FullscreenOverlay onClose={() => setFullscreen(false)}>
            <motion.div
              className="metric-widget metric-widget--fullscreen"
              whileHover={{}}
            >
              <CardContent isFullscreenMode={true} />
            </motion.div>
          </FullscreenOverlay>
        )}
      </AnimatePresence>
    </>
  );
};

export default MetricWidget;