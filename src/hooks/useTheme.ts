src/hooks/useTheme.ts

import { useState, useEffect, useCallback } from 'react';

type ThemeMode = 'light' | 'dark' | 'auto';

interface ThemeState {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'trackr-theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'auto') return getSystemTheme();
  return mode;
}

function getSavedTheme(): ThemeMode {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark' || saved === 'auto') return saved;
  } catch {}
  return 'auto';
}

export function useTheme(): ThemeState {
  const [mode, setMode] = useState<ThemeMode>(getSavedTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(() => resolveTheme(getSavedTheme()));

  useEffect(() => {
    const resolved = resolveTheme(mode);
    setResolvedTheme(resolved);

    const root = document.documentElement;
    root.setAttribute('data-theme', resolved);
    root.classList.remove('light', 'dark');
    root.classList.add(resolved);

    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  useEffect(() => {
    if (mode !== 'auto') return;

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      const resolved = e.matches ? 'dark' : 'light';
      setResolvedTheme(resolved);
      document.documentElement.setAttribute('data-theme', resolved);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(resolved);
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);

  const setTheme = useCallback((newMode: ThemeMode) => {
    setMode(newMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(prev => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'auto';
      return 'light';
    });
  }, []);

  return { mode, resolvedTheme, setTheme, toggleTheme };
}


src/hooks/useLayout.ts

import { useState, useEffect, useCallback } from 'react';

type Density = 'dense' | 'normal' | 'spacious';

interface LayoutState {
  density: Density;
  sidebarCollapsed: boolean;
  setDensity: (d: Density) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

const STORAGE_KEY = 'trackr-layout';

interface StoredLayout {
  density: Density;
  sidebarCollapsed: boolean;
}

function getStoredLayout(): StoredLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        density: ['dense', 'normal', 'spacious'].includes(parsed.density) ? parsed.density : 'normal',
        sidebarCollapsed: typeof parsed.sidebarCollapsed === 'boolean' ? parsed.sidebarCollapsed : false,
      };
    }
  } catch {}
  return { density: 'normal', sidebarCollapsed: false };
}

export function useLayout(): LayoutState {
  const [density, setDensityState] = useState<Density>(() => getStoredLayout().density);
  const [sidebarCollapsed, setSidebarCollapsedState] = useState<boolean>(() => getStoredLayout().sidebarCollapsed);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-density', density);
  }, [density]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ density, sidebarCollapsed }));
    } catch {}
  }, [density, sidebarCollapsed]);

  const setDensity = useCallback((d: Density) => {
    setDensityState(d);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsedState(prev => !prev);
  }, []);

  const setSidebarCollapsed = useCallback((v: boolean) => {
    setSidebarCollapsedState(v);
  }, []);

  return { density, sidebarCollapsed, setDensity, toggleSidebar, setSidebarCollapsed };
}


src/styles/theme.css

:root {
  --color-bg: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-bg-tertiary: #f1f5f9;
  --color-surface: #ffffff;
  --color-surface-elevated: #ffffff;
  --color-border: #e2e8f0;
  --color-border-subtle: #f1f5f9;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-text-muted: #94a3b8;
  --color-accent: #6366f1;
  --color-accent-hover: #4f46e5;
  --color-accent-subtle: #eef2ff;
  --color-success: #10b981;
  --color-success-subtle: #d1fae5;
  --color-warning: #f59e0b;
  --color-warning-subtle: #fef3c7;
  --color-error: #ef4444;
  --color-error-subtle: #fee2e2;
  --color-info: #3b82f6;
  --color-info-subtle: #dbeafe;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;
  --transition-theme: background-color 300ms ease, color 300ms ease, border-color 300ms ease, box-shadow 300ms ease;
}

[data-theme='dark'] {
  --color-bg: #0a0f1e;
  --color-bg-secondary: #111827;
  --color-bg-tertiary: #1e2433;
  --color-surface: #131929;
  --color-surface-elevated: #1a2235;
  --color-border: #2d3748;
  --color-border-subtle: #1e2433;
  --color-text-primary: #f1f5f9;
  --color-text-secondary: #94a3b8;
  --color-text-muted: #64748b;
  --color-accent: #818cf8;
  --color-accent-hover: #6366f1;
  --color-accent-subtle: #1e1b4b;
  --color-success: #34d399;
  --color-success-subtle: #064e3b;
  --color-warning: #fbbf24;
  --color-warning-subtle: #451a03;
  --color-error: #f87171;
  --color-error-subtle: #450a0a;
  --color-info: #60a5fa;
  --color-info-subtle: #1e3a5f;
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.3);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.4);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.6), 0 8px 10px -6px rgb(0 0 0 / 0.5);
}

[data-density='dense'] {
  --spacing-xs: 2px;
  --spacing-sm: 4px;
  --spacing-md: 8px;
  --spacing-lg: 12px;
  --spacing-xl: 16px;
  --spacing-2xl: 20px;
  --font-size-sm: 11px;
  --font-size-base: 13px;
  --font-size-lg: 15px;
  --font-size-xl: 18px;
  --font-size-2xl: 22px;
  --card-padding: 12px;
  --section-gap: 12px;
  --sidebar-width: 220px;
  --sidebar-collapsed-width: 52px;
}

[data-density='normal'] {
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 12px;
  --spacing-lg: 16px;
  --spacing-xl: 20px;
  --spacing-2xl: 28px;
  --font-size-sm: 12px;
  --font-size-base: 14px;
  --font-size-lg: 16px;
  --font-size-xl: 20px;
  --font-size-2xl: 24px;
  --card-padding: 16px;
  --section-gap: 16px;
  --sidebar-width: 260px;
  --sidebar-collapsed-width: 60px;
}

[data-density='spacious'] {
  --spacing-xs: 6px;
  --spacing-sm: 12px;
  --spacing-md: 18px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
  --spacing-2xl: 40px;
  --font-size-sm: 13px;
  --font-size-base: 15px;
  --font-size-lg: 18px;
  --font-size-xl: 22px;
  --font-size-2xl: 28px;
  --card-padding: 24px;
  --section-gap: 24px;
  --sidebar-width: 300px;
  --sidebar-collapsed-width: 72px;
}

*, *::before, *::after {
  box-sizing: border-box;
}

html {
  font-size: var(--font-size-base, 14px);
  transition: var(--transition-theme);
}

body {
  background-color: var(--color-bg);
  color: var(--color-text-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Inter', sans-serif;
  transition: var(--transition-theme);
  margin: 0;
  padding: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.theme-fade-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-bg);
  opacity: 0;
  pointer-events: none;
  z-index: 9999;
  transition: opacity 150ms ease;
}

.theme-fade-overlay.active {
  opacity: 1;
}

::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-full);
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-muted);
}


src/contexts/ThemeContext.tsx

import React, { createContext, useContext, ReactNode } from 'react';
import { useTheme } from '../hooks/useTheme';
import { useLayout } from '../hooks/useLayout';

type ThemeMode = 'light' | 'dark' | 'auto';
type Density = 'dense' | 'normal' | 'spacious';

interface ThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

interface LayoutContextValue {
  density: Density;
  sidebarCollapsed: boolean;
  setDensity: (d: Density) => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (v: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);
const LayoutContext = createContext<LayoutContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useTheme();
  const layout = useLayout();

  return (
    <ThemeContext.Provider value={theme}>
      <LayoutContext.Provider value={layout}>
        {children}
      </LayoutContext.Provider>
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useThemeContext must be used within ThemeProvider');
  return ctx;
}

export function useLayoutContext(): LayoutContextValue {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayoutContext must be used within ThemeProvider');
  return ctx;
}


src/components/ThemePreview.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { useThemeContext } from '../contexts/ThemeContext';

const THEMES = [
  {
    id: 'light',
    label: 'Light',
    icon: '☀️',
    preview: {
      bg: '#ffffff',
      surface: '#f8fafc',
      accent: '#6366f1',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
    },
  },
  {
    id: 'dark',
    label: 'Dark',
    icon: '🌙',
    preview: {
      bg: '#0a0f1e',
      surface: '#131929',
      accent: '#818cf8',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#2d3748',
    },
  },
  {
    id: 'auto',
    label: 'Auto',
    icon: '⚡',
    preview: {
      bg: 'linear-gradient(135deg, #ffffff 50%, #0a0f1e 50%)',
      surface: '#f8fafc',
      accent: '#6366f1',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
    },
  },
];

export default function ThemePreview() {
  const { mode, setTheme } = useThemeContext();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 'var(--spacing-md)',
      }}
    >
      {THEMES.map((theme) => (
        <motion.button
          key={theme.id}
          onClick={() => setTheme(theme.id)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'none',
            border: `2px solid ${mode === theme.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
            borderRadius: 'var(--radius-lg)',
            padding: '0',
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            transition: 'border-color 200ms ease',
            outline: 'none',
          }}
        >
          {/* Mini browser preview */}
          <div
            style={{
              background: typeof theme.preview.bg === 'string' && theme.preview.bg.startsWith('linear')
                ? theme.preview.bg
                : theme.preview.bg,
              padding: '10px 10px 0 10px',
              aspectRatio: '16/10',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Top bar */}
            <div
              style={{
                display: 'flex',
                gap: '3px',
                marginBottom: '6px',
              }}
            >
              {['#ff5f57', '#ffbd2e', '#28c840'].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: c,
                  }}
                />
              ))}
            </div>

            {/* Sidebar + content */}
            <div style={{ display: 'flex', gap: '4px', height: 'calc(100% - 16px)' }}>
              {/* Sidebar */}
              <div
                style={{
                  width: '28%',
                  background: theme.preview.surface,
                  borderRadius: '4px 4px 0 0',
                  padding: '4px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  border: `1px solid ${theme.preview.border}`,
                  borderBottom: 'none',
                }}
              >
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    style={{
                      height: 4,