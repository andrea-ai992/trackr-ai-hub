src/styles/theme.css

:root {
  --transition-theme: all 0.3s ease;
  
  /* Light theme */
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --bg-card: #ffffff;
  --bg-sidebar: #1e293b;
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  --border-color: #e2e8f0;
  --border-subtle: #f1f5f9;
  --accent-primary: #6366f1;
  --accent-secondary: #8b5cf6;
  --accent-success: #10b981;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.07);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.1);
  
  /* Density: normal (default) */
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 48px;
  --font-size-xs: 11px;
  --font-size-sm: 13px;
  --font-size-base: 15px;
  --font-size-lg: 17px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --font-size-3xl: 30px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-xl: 20px;
  --radius-full: 9999px;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 68px;
  --header-height: 64px;
  --card-padding: 20px;
  --list-item-padding: 12px 16px;
}

[data-density="dense"] {
  --spacing-xs: 2px;
  --spacing-sm: 4px;
  --spacing-md: 10px;
  --spacing-lg: 16px;
  --spacing-xl: 22px;
  --spacing-2xl: 32px;
  --font-size-xs: 10px;
  --font-size-sm: 12px;
  --font-size-base: 13px;
  --font-size-lg: 15px;
  --font-size-xl: 18px;
  --font-size-2xl: 21px;
  --font-size-3xl: 26px;
  --card-padding: 12px;
  --list-item-padding: 8px 12px;
  --header-height: 52px;
}

[data-density="spacious"] {
  --spacing-xs: 6px;
  --spacing-sm: 12px;
  --spacing-md: 22px;
  --spacing-lg: 32px;
  --spacing-xl: 44px;
  --spacing-2xl: 64px;
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 19px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;
  --font-size-3xl: 36px;
  --card-padding: 28px;
  --list-item-padding: 16px 22px;
  --header-height: 72px;
}

[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-tertiary: #334155;
  --bg-card: #1e293b;
  --bg-sidebar: #0f172a;
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #475569;
  --border-color: #334155;
  --border-subtle: #1e293b;
  --accent-primary: #818cf8;
  --accent-secondary: #a78bfa;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
  --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
  --shadow-xl: 0 20px 25px rgba(0,0,0,0.5);
}

* {
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-size: var(--font-size-base);
}

.theme-fade-enter {
  opacity: 0;
}
.theme-fade-enter-active {
  opacity: 1;
  transition: opacity 300ms ease;
}
.theme-fade-exit {
  opacity: 1;
}
.theme-fade-exit-active {
  opacity: 0;
  transition: opacity 300ms ease;
}

---

src/hooks/useTheme.ts

import { useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'light' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dark';

export interface ThemeState {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  toggle: () => void;
}

const STORAGE_KEY = 'trackr_theme_mode';

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): ResolvedTheme {
  if (mode === 'auto') return getSystemTheme();
  return mode;
}

function applyTheme(resolved: ResolvedTheme): void {
  const root = document.documentElement;
  root.setAttribute('data-theme', resolved);
  root.classList.remove('theme-light', 'theme-dark');
  root.classList.add(`theme-${resolved}`);
  
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  if (metaTheme) {
    metaTheme.setAttribute('content', resolved === 'dark' ? '#0f172a' : '#ffffff');
  }
}

export function useTheme(): ThemeState {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
      if (stored && ['light', 'dark', 'auto'].includes(stored)) return stored;
    } catch {}
    return 'auto';
  });

  const [resolved, setResolved] = useState<ResolvedTheme>(() => resolveTheme(
    (() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
        if (stored && ['light', 'dark', 'auto'].includes(stored)) return stored;
      } catch {}
      return 'auto';
    })()
  ));

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      localStorage.setItem(STORAGE_KEY, newMode);
    } catch {}
    const newResolved = resolveTheme(newMode);
    setResolved(newResolved);
    applyTheme(newResolved);
  }, []);

  const toggle = useCallback(() => {
    const next: ThemeMode = resolved === 'light' ? 'dark' : 'light';
    setMode(next);
  }, [resolved, setMode]);

  useEffect(() => {
    const currentResolved = resolveTheme(mode);
    setResolved(currentResolved);
    applyTheme(currentResolved);
  }, []);

  useEffect(() => {
    if (mode !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const newResolved: ResolvedTheme = e.matches ? 'dark' : 'light';
      setResolved(newResolved);
      applyTheme(newResolved);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  return { mode, resolved, setMode, toggle };
}

---

src/hooks/useLayout.ts

import { useState, useEffect, useCallback } from 'react';

export type Density = 'dense' | 'normal' | 'spacious';

export interface LayoutState {
  density: Density;
  sidebarCollapsed: boolean;
  setDensity: (density: Density) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const STORAGE_KEY_DENSITY = 'trackr_density';
const STORAGE_KEY_SIDEBAR = 'trackr_sidebar_collapsed';

function applyDensity(density: Density): void {
  document.documentElement.setAttribute('data-density', density);
}

function getStoredDensity(): Density {
  try {
    const stored = localStorage.getItem(STORAGE_KEY_DENSITY) as Density | null;
    if (stored && ['dense', 'normal', 'spacious'].includes(stored)) return stored;
  } catch {}
  return 'normal';
}

function getStoredSidebarCollapsed(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY_SIDEBAR) === 'true';
  } catch {}
  return false;
}

export function useLayout(): LayoutState {
  const [density, setDensityState] = useState<Density>(getStoredDensity);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(getStoredSidebarCollapsed);

  useEffect(() => {
    applyDensity(density);
  }, []);

  const setDensity = useCallback((newDensity: Density) => {
    setDensityState(newDensity);
    applyDensity(newDensity);
    try {
      localStorage.setItem(STORAGE_KEY_DENSITY, newDensity);
    } catch {}
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setSidebarCollapsedState(collapsed);
    try {
      localStorage.setItem(STORAGE_KEY_SIDEBAR, String(collapsed));
    } catch {}
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(!sidebarCollapsed);
  }, [sidebarCollapsed, setSidebarCollapsed]);

  return {
    density,
    sidebarCollapsed,
    setDensity,
    toggleSidebar,
    setSidebarCollapsed,
  };
}

---

src/context/ThemeContext.jsx

import { createContext, useContext } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLayout } from '../hooks/useLayout';

export const ThemeContext = createContext(null);
export const LayoutContext = createContext(null);

export function ThemeProvider({ children }) {
  const theme = useTheme();
  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function LayoutProvider({ children }) {
  const layout = useLayout();
  return (
    <LayoutContext.Provider value={layout}>
      {children}
    </LayoutContext.Provider>
  );
}

export function AppProvider({ children }) {
  return (
    <ThemeProvider>
      <LayoutProvider>
        {children}
      </LayoutProvider>
    </ThemeProvider>
  );
}

export function useThemeContext() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}

export function useLayoutContext() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayoutContext must be used within LayoutProvider');
  return ctx;
}

---

src/components/ThemePreview.jsx

import { motion } from 'framer-motion';

const previewConfig = {
  light: {
    bg: '#ffffff',
    sidebar: '#1e293b',
    card: '#f8fafc',
    text: '#0f172a',
    accent: '#6366f1',
    border: '#e2e8f0',
    label: 'Clair',
  },
  dark: {
    bg: '#0f172a',
    sidebar: '#0a0f1e',
    card: '#1e293b',
    text: '#f1f5f9',
    accent: '#818cf8',
    border: '#334155',
    label: 'Sombre',
  },
  auto: {
    bg: 'linear-gradient(135deg, #ffffff 50%, #0f172a 50%)',
    sidebar: '#1e293b',
    card: '#f8fafc',
    text: '#0f172a',
    accent: '#6366f1',
    border: '#e2e8f0',
    label: 'Auto',
    isGradient: true,
  },
};

function MiniUI({ config }) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: config.isGradient ? config.bg : config.bg,
        borderRadius: 8,
        overflow: 'hidden',
        display: 'flex',
        position: 'relative',
      }}
    >
      {config.isGradient && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, #ffffff 50%, #0f172a 50%)',
          }}
        />
      )}
      <div
        style={{
          width: 28,
          background: config.sidebar,
          height: '100%',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '6px 0',
          gap: 4,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            style={{
              width: 16,
              height: 3,
              borderRadius: 2,
              background: i === 0 ? config.accent : 'rgba(255,255,255,0.2)',
            }}
          />
        ))}
      </div>
      <div
        style={{
          flex: 1,
          padding: 6,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          position: 'relative',
          zIndex: 1,
          background: config.isGradient ? 'transparent' : config.bg,
        }}
      >
        <div
          style={{
            height: 10,
            background: config.isGradient ? 'rgba(128,128,128,0.2)' : config.card,
            borderRadius: 3,
            border: `1px solid ${config.border}`,
            display: 'flex',
            alignItems: 'center',
            padding: '0 4px',
            gap: 3,
          }}
        >
          <div style={{ width: 12, height: 3, borderRadius: 1, background: config.accent }} />
          <div style={{ width: 20, height: 3, borderRadius: 1, background: config.isGradient ? 'rgba(128,128,128,0.3)' : config.border }} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, flex: 1 }}>
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              style={{
                background: config.isGradient ? 'rgba(128,128,128,0.15)' : config.card,
                borderRadius: 3,
                border: `1px solid ${config.border}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  width: 8,
                  height: 3,
                  borderRadius: 1,
                  background: i === 0 ? config.accent : (config.isGradient ? 'rgba(128,128,128,0.4)' : config.border),
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ThemePreview({ selectedMode, onSelect, resolvedTheme }) {
  const modes = ['light', 'dark', 'auto'];

  return (
    <div
      style={{
        display: 'flex',
        gap: 16,
        flexWrap: 'wrap',
      }}
    >
      {modes.map((mode) => {
        const config = previewConfig[mode];
        const isSelected = selectedMode === mode;

        return (
          <motion.button
            key={mode}
            onClick={() => onSelect(mode)}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            style={{
              flex: '1 1 120px',
              minWidth: 120,
              maxWidth: 180,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              padding: 0,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <motion.div
              animate={{
                boxShadow: isSelected
                  ? '0 0 0 3px #6366f1, 0 8px 20px rgba(99,102,241,0.3)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
              }}
              transition={{ duration: 0.2 }}
              style={{