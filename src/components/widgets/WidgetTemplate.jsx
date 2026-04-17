src/components/widgets/WidgetTemplate.jsx

import { useState, useRef, useCallback, useContext, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GripVertical, ChevronDown, ChevronUp, Maximize2, Minimize2, X, MoreVertical } from 'lucide-react';

export const WidgetContext = createContext(null);

export function useWidget() {
  const ctx = useContext(WidgetContext);
  if (!ctx) throw new Error('useWidget must be used inside WidgetTemplate');
  return ctx;
}

const THEMES = {
  default: {
    bg: 'rgba(15, 23, 42, 0.72)',
    border: 'rgba(99, 102, 241, 0.18)',
    headerBg: 'rgba(99, 102, 241, 0.08)',
    titleColor: '#e2e8f0',
    subtitleColor: '#94a3b8',
    iconColor: '#6366f1',
    shadowBase: '0 4px 24px rgba(0,0,0,0.32)',
    shadowHover: '0 8px 40px rgba(99,102,241,0.22)',
    backdrop: 'blur(18px) saturate(180%)',
  },
  success: {
    bg: 'rgba(15, 42, 23, 0.72)',
    border: 'rgba(34, 197, 94, 0.18)',
    headerBg: 'rgba(34, 197, 94, 0.08)',
    titleColor: '#e2e8f0',
    subtitleColor: '#94a3b8',
    iconColor: '#22c55e',
    shadowBase: '0 4px 24px rgba(0,0,0,0.32)',
    shadowHover: '0 8px 40px rgba(34,197,94,0.22)',
    backdrop: 'blur(18px) saturate(180%)',
  },
  warning: {
    bg: 'rgba(42, 32, 15, 0.72)',
    border: 'rgba(245, 158, 11, 0.18)',
    headerBg: 'rgba(245, 158, 11, 0.08)',
    titleColor: '#e2e8f0',
    subtitleColor: '#94a3b8',
    iconColor: '#f59e0b',
    shadowBase: '0 4px 24px rgba(0,0,0,0.32)',
    shadowHover: '0 8px 40px rgba(245,158,11,0.22)',
    backdrop: 'blur(18px) saturate(180%)',
  },
  danger: {
    bg: 'rgba(42, 15, 15, 0.72)',
    border: 'rgba(239, 68, 68, 0.18)',
    headerBg: 'rgba(239, 68, 68, 0.08)',
    titleColor: '#e2e8f0',
    subtitleColor: '#94a3b8',
    iconColor: '#ef4444',
    shadowBase: '0 4px 24px rgba(0,0,0,0.32)',
    shadowHover: '0 8px 40px rgba(239,68,68,0.22)',
    backdrop: 'blur(18px) saturate(180%)',
  },
  info: {
    bg: 'rgba(15, 30, 42, 0.72)',
    border: 'rgba(14, 165, 233, 0.18)',
    headerBg: 'rgba(14, 165, 233, 0.08)',
    titleColor: '#e2e8f0',
    subtitleColor: '#94a3b8',
    iconColor: '#0ea5e9',
    shadowBase: '0 4px 24px rgba(0,0,0,0.32)',
    shadowHover: '0 8px 40px rgba(14,165,233,0.22)',
    backdrop: 'blur(18px) saturate(180%)',
  },
};

const widgetVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 260, damping: 22 },
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.96,
    transition: { duration: 0.22 },
  },
};

const contentVariants = {
  open: {
    height: 'auto',
    opacity: 1,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
  collapsed: {
    height: 0,
    opacity: 0,
    transition: { type: 'spring', stiffness: 300, damping: 28 },
  },
};

const fullscreenVariants = {
  normal: {
    position: 'relative',
    top: 'auto',
    left: 'auto',
    right: 'auto',
    bottom: 'auto',
    zIndex: 1,
    borderRadius: '16px',
    transition: { type: 'spring', stiffness: 220, damping: 26 },
  },
  fullscreen: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    borderRadius: '0px',
    transition: { type: 'spring', stiffness: 220, damping: 26 },
  },
};

function WidgetMenuDropdown({ items, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: '6px',
        background: 'rgba(15, 23, 42, 0.96)',
        border: '1px solid rgba(99,102,241,0.22)',
        borderRadius: '10px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.48)',
        backdropFilter: 'blur(20px)',
        minWidth: '160px',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {items.map((item, idx) => (
        <button
          key={idx}
          onClick={() => { item.onClick?.(); onClose(); }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            padding: '10px 16px',
            background: 'transparent',
            border: 'none',
            color: item.danger ? '#ef4444' : '#e2e8f0',
            fontSize: '13px',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.12)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          {item.icon && <span style={{ opacity: 0.7 }}>{item.icon}</span>}
          {item.label}
        </button>
      ))}
    </motion.div>
  );
}

export default function WidgetTemplate({
  id,
  title,
  subtitle,
  icon: Icon,
  theme = 'default',
  children,
  defaultCollapsed = false,
  collapsible = true,
  fullscreenable = true,
  removable = false,
  onRemove,
  menuItems = [],
  loading = false,
  error = null,
  badge = null,
  headerActions = null,
  minHeight = 120,
  className = '',
  style = {},
  dragHandleProps = {},
  testId,
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const menuRef = useRef(null);
  const t = THEMES[theme] || THEMES.default;

  const toggleCollapse = useCallback(() => setCollapsed(c => !c), []);
  const toggleFullscreen = useCallback(() => setIsFullscreen(f => !f), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const allMenuItems = [
    ...(collapsible ? [{
      label: collapsed ? 'Expand' : 'Collapse',
      onClick: toggleCollapse,
    }] : []),
    ...(fullscreenable ? [{
      label: isFullscreen ? 'Exit Fullscreen' : 'Fullscreen',
      onClick: toggleFullscreen,
    }] : []),
    ...menuItems,
    ...(removable ? [{
      label: 'Remove Widget',
      danger: true,
      onClick: () => onRemove?.(id),
    }] : []),
  ];

  const contextValue = {
    id,
    theme,
    themeTokens: t,
    collapsed,
    isFullscreen,
    toggleCollapse,
    toggleFullscreen,
  };

  return (
    <WidgetContext.Provider value={contextValue}>
      <motion.div
        data-testid={testId || `widget-${id}`}
        className={`widget-template ${className}`}
        variants={widgetVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        layout
        style={{
          background: t.bg,
          border: `1px solid ${hovered ? t.iconColor + '44' : t.border}`,
          borderRadius: isFullscreen ? '0px' : '16px',
          boxShadow: hovered ? t.shadowHover : t.shadowBase,
          backdropFilter: t.backdrop,
          WebkitBackdropFilter: t.backdrop,
          overflow: 'hidden',
          position: isFullscreen ? 'fixed' : 'relative',
          top: isFullscreen ? 0 : 'auto',
          left: isFullscreen ? 0 : 'auto',
          right: isFullscreen ? 0 : 'auto',
          bottom: isFullscreen ? 0 : 'auto',
          zIndex: isFullscreen ? 9999 : 1,
          width: isFullscreen ? '100vw' : '100%',
          height: isFullscreen ? '100vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          ...style,
        }}
        whileHover={{ scale: isFullscreen ? 1 : 1.012 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
      >
        {/* ── HEADER ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '14px 16px 12px',
            background: t.headerBg,
            borderBottom: collapsed ? 'none' : `1px solid ${t.border}`,
            userSelect: 'none',
          }}
        >
          {/* Drag Handle */}
          <motion.div
            {...dragHandleProps}
            className="widget-drag-handle"
            whileHover={{ opacity: 1 }}
            style={{
              cursor: 'grab',
              opacity: 0.4,
              color: t.subtitleColor,
              display: 'flex',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <GripVertical size={16} />
          </motion.div>

          {/* Icon */}
          {Icon && (
            <motion.div
              initial={{ rotate: -8, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
              style={{
                color: t.iconColor,
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <Icon size={18} strokeWidth={2} />
            </motion.div>
          )}

          {/* Title + Subtitle */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  color: t.titleColor,
                  fontSize: '14px',
                  fontWeight: 600,
                  letterSpacing: '0.01em',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {title}
              </span>
              {badge !== null && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    background: t.iconColor,
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '1px 7px',
                    borderRadius: '999px',
                    letterSpacing: '0.02em',
                    flexShrink: 0,
                  }}
                >
                  {badge}
                </motion.span>
              )}
            </div>
            {subtitle && (
              <span
                style={{
                  color: t.subtitleColor,
                  fontSize: '11px',
                  opacity: 0.8,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: 'block',
                  marginTop: '1px',
                }}
              >
                {subtitle}
              </span>
            )}
          </div>

          {/* Header Actions slot */}
          {headerActions && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
              {headerActions}
            </div>
          )}

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
            {/* Fullscreen toggle */}
            {fullscreenable && (
              <WidgetIconButton
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                color={t.subtitleColor}
                hoverColor={t.iconColor}
              >
                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
              </WidgetIconButton>
            )}

            {/* Collapse toggle */}
            {collapsible && (
              <WidgetIconButton
                onClick={toggleCollapse}
                title={collapsed ? 'Expand' : 'Collapse'}
                color={t.subtitleColor}
                hoverColor={t.iconColor}
              >
                {collapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </WidgetIconButton>
            )}

            {/* Menu */}
            {allMenuItems.length > 0 && (
              <div ref={menuRef} style={{ position: 'relative' }}>
                <WidgetIconButton
                  onClick={() => setMenuOpen(o => !o)}
                  title="Widget options"
                  color={t.subtitleColor}
                  hoverColor={t.iconColor}
                >
                  <MoreVertical size={14} />
                </WidgetIconButton>
                <AnimatePresence>
                  {menuOpen && (
                    <WidgetMenuDropdown items={allMenuItems} onClose={closeMenu} />
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Remove */}
            {removable && (
              <WidgetIconButton
                onClick={() => onRemove?.(id)}
                title="Remove widget"
                color={t.subtitleColor}
                hoverColor="#ef4444"
              >
                <X size={14} />
              </WidgetIconButton>
            )}
          </div>
        </div>

        {/* ── BODY ── */}
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.div
              key="widget-content"
              variants={contentVariants}
              initial="collapsed"
              animate="open"
              exit="collapsed"
              style={{
                overflow: isFullscreen ? 'auto' : 'hidden',
                flex: 1,
                minHeight: collapsed ? 0 : minHeight,
              }}
            >
              <div
                style={{
                  padding: '16px',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                }}
              >
                {/* Loading overlay */}
                <AnimatePresence>
                  {loading && (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'rgba(15,23,42,0.6)',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10,
                        borderRadius: '0 0 16px 16px',
                      }}
                    >
                      <WidgetSpinner color={t.iconColor} />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Error state */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.28)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        color: '#fca5a5',
                        fontSize: '13px',
                        marginBottom: '12px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '8px',
                      }}
                    >
                      <span style={{ fontSize: '16px', lineHeight: