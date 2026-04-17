Je vais analyser le repo et générer tous les fichiers nécessaires.

<function_calls>
<invoke name="github_get_repo_info">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">package.json</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">vite.config.js</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_list_files">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_list_files">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_list_files">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/components</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/App.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/main.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages/Dashboard.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages/Home.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages/Settings.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages/Analytics.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages/Login.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages/Profile.jsx</parameter>
</invoke>
</function_calls>
<function_calls>
<invoke name="github_get_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/pages/AIHub.jsx</parameter>
</invoke>
</function_calls>

Maintenant j'ai une vision complète du projet. Je génère tous les fichiers.

**1. src/utils/performanceMetrics.ts**
<function_calls>
<invoke name="github_create_file">
<parameter name="repo">andrea-ai992/trackr-ai-hub</parameter>
<parameter name="path">src/utils/performanceMetrics.ts</parameter>
<parameter name="content">/**
 * performanceMetrics.ts
 * Trackr — Core Web Vitals tracking via web-vitals lib
 * Tracks CLS, LCP, FID, INP, TTFB with localStorage history + Vercel Analytics
 */

import type { Metric, CLSMetric, LCPMetric, FIDMetric, INPMetric, TTFBMetric } from 'web-vitals';

// ─── Types ────────────────────────────────────────────────────────────────────

export type VitalName = 'CLS' | 'LCP' | 'FID' | 'INP' | 'TTFB';

export interface VitalEntry {
  name: VitalName;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
  timestamp: number;
  url: string;
  sessionId: string;
}

export interface VitalHistory {
  entries: VitalEntry[];
  lastUpdated: number;
  version: string;
}

export interface PerformanceSummary {
  CLS: VitalEntry | null;
  LCP: VitalEntry | null;
  FID: VitalEntry | null;
  INP: VitalEntry | null;
  TTFB: VitalEntry | null;
  overallScore: number;
  timestamp: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'trackr_web_vitals';
const MAX_HISTORY_ENTRIES = 100;
const HISTORY_VERSION = '2.0.0';

// Thresholds per web.dev/articles/vitals
const THRESHOLDS: Record<VitalName, { good: number; poor: number }> = {
  CLS:  { good: 0.1,  poor: 0.25   },
  LCP:  { good: 2500, poor: 4000   },
  FID:  { good: 100,  poor: 300    },
  INP:  { good: 200,  poor: 500    },
  TTFB: { good: 800,  poor: 1800   },
};

// Weight for overall score calculation
const SCORE_WEIGHTS: Record<VitalName, number> = {
  LCP:  0.30,
  CLS:  0.25,
  INP:  0.20,
  FID:  0.15,
  TTFB: 0.10,
};

// Console colors for dev logs
const COLORS: Record<'good' | 'needs-improvement' | 'poor', string> = {
  good:              '#00C48C',
  'needs-improvement': '#FFA500',
  poor:              '#FF4D4F',
};

// ─── Session ID ───────────────────────────────────────────────────────────────

function getSessionId(): string {
  const key = 'trackr_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
}

// ─── Rating helper ────────────────────────────────────────────────────────────

function getRating(name: VitalName, value: number): 'good' | 'needs-improvement' | 'poor' {
  const { good, poor } = THRESHOLDS[name];
  if (value <= good) return 'good';
  if (value <= poor) return 'needs-improvement';
  return 'poor';
}

// ─── localStorage helpers ─────────────────────────────────────────────────────

function readHistory(): VitalHistory {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { entries: [], lastUpdated: Date.now(), version: HISTORY_VERSION };
    const parsed = JSON.parse(raw) as VitalHistory;
    // Migrate old format
    if (!parsed.version || parsed.version !== HISTORY_VERSION) {
      return { entries: [], lastUpdated: Date.now(), version: HISTORY_VERSION };
    }
    return parsed;
  } catch {
    return { entries: [], lastUpdated: Date.now(), version: HISTORY_VERSION };
  }
}

function writeHistory(history: VitalHistory): void {
  try {
    // Trim to max entries (FIFO)
    if (history.entries.length > MAX_HISTORY_ENTRIES) {
      history.entries = history.entries.slice(-MAX_HISTORY_ENTRIES);
    }
    history.lastUpdated = Date.now();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    // localStorage quota exceeded — clear and retry once
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...history,
        entries: history.entries.slice(-20),
      }));
    } catch {
      // silent fail — never throw in metrics code
    }
  }
}

function appendEntry(entry: VitalEntry): void {
  const history = readHistory();
  // Deduplicate by metric id (web-vitals sends same id on updates)
  const idx = history.entries.findIndex(e => e.id === entry.id && e.name === entry.name);
  if (idx !== -1) {
    history.entries[idx] = entry; // update in-place
  } else {
    history.entries.push(entry);
  }
  writeHistory(history);
}

// ─── Score calculation ────────────────────────────────────────────────────────

function vitalScore(name: VitalName, value: number): number {
  const { good, poor } = THRESHOLDS[name];
  if (value <= good) return 100;
  if (value >= poor) return 0;
  // Linear interpolation between good and poor → 100 to 0
  return Math.round(100 - ((value - good) / (poor - good)) * 100);
}

export function computeOverallScore(entries: Partial<Record<VitalName, number>>): number {
  let totalWeight = 0;
  let weightedScore = 0;
  (Object.keys(SCORE_WEIGHTS) as VitalName[]).forEach(name => {
    if (entries[name] !== undefined) {
      weightedScore += vitalScore(name, entries[name]!) * SCORE_WEIGHTS[name];
      totalWeight += SCORE_WEIGHTS[name];
    }
  });
  if (totalWeight === 0) return 0;
  return Math.round(weightedScore / totalWeight);
}

// ─── Console logger ───────────────────────────────────────────────────────────

function logVital(entry: VitalEntry): void {
  const color = COLORS[entry.rating];
  const unit = entry.name === 'CLS' ? '' : 'ms';
  const value = entry.name === 'CLS'
    ? entry.value.toFixed(4)
    : Math.round(entry.value).toString();

  // Always log in production for monitoring (visible in Vercel function logs)
  console.groupCollapsed(
    `%c⚡ Trackr Vitals %c${entry.name} %c${value}${unit} %c[${entry.rating.toUpperCase()}]`,
    'color:#6C63FF;font-weight:bold',
    'color:#fff;background:#333;padding:2px 6px;border-radius:3px;font-weight:bold',
    `color:${color};font-weight:bold`,
    `color:${color};font-style:italic`
  );
  console.log('Value:   ', value + unit);
  console.log('Delta:   ', entry.delta + unit);
  console.log('Rating:  ', entry.rating);
  console.log('Nav Type:', entry.navigationType);
  console.log('URL:     ', entry.url);
  console.log('ID:      ', entry.id);
  console.log('Session: ', entry.sessionId);
  console.groupEnd();
}

// ─── Vercel Analytics integration ─────────────────────────────────────────────

function sendToVercelAnalytics(entry: VitalEntry): void {
  // Vercel Speed Insights uses window.va — send if available
  try {
    const va = (window as any).va;
    if (typeof va === 'function') {
      va('vitals', {
        metric: entry.name,
        value:  entry.value,
        rating: entry.rating,
        id:     entry.id,
      });
    }
  } catch {
    // silent
  }

  // Also send via sendBeacon for reliability on page unload
  try {
    if (navigator.sendBeacon && import.meta.env.PROD) {
      const payload = JSON.stringify({
        name:  entry.name,
        value: entry.value,
        rating: entry.rating,
        id:    entry.id,
        url:   entry.url,
        ts:    entry.timestamp,
      });
      // Vercel Analytics endpoint (if custom endpoint configured)
      const endpoint = import.meta.env.VITE_ANALYTICS_ENDPOINT;
      if (endpoint) {
        navigator.sendBeacon(endpoint, payload);
      }
    }
  } catch {
    // silent
  }
}

// ─── Core handler ─────────────────────────────────────────────────────────────

function handleMetric(metric: Metric): void {
  const name = metric.name as VitalName;
  const rating = getRating(name, metric.value);

  const entry: VitalEntry = {
    name,
    value:          metric.value,
    rating,
    delta:          metric.delta,
    id:             metric.id,
    navigationType: metric.navigationType ?? 'navigate',
    timestamp:      Date.now(),
    url:            window.location.href,
    sessionId:      getSessionId(),
  };

  appendEntry(entry);
  logVital(entry);
  sendToVercelAnalytics(entry);

  // Emit custom DOM event for any listener (e.g. debug overlay)
  window.dispatchEvent(
    new CustomEvent('trackr:vital', { detail: entry, bubbles: false })
  );
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Initialize all Core Web Vitals tracking.
 * Call once from main.tsx / App entry point.
 */
export async function initPerformanceMetrics(): Promise<void> {
  try {
    const { onCLS, onLCP, onFID, onINP, onTTFB } = await import('web-vitals');

    onCLS( (m: CLSMetric)  => handleMetric(m), { reportAllChanges: true });
    onLCP( (m: LCPMetric)  => handleMetric(m), { reportAllChanges: true });
    onFID( (m: FIDMetric)  => handleMetric(m));
    onINP( (m: INPMetric)  => handleMetric(m), { reportAllChanges: true });
    onTTFB((m: TTFBMetric) => handleMetric(m));

    if (import.meta.env.DEV) {
      console.log(
        '%c⚡ Trackr performanceMetrics initialized',
        'color:#6C63FF;font-weight:bold;font-size:12px'
      );
    }
  } catch (err) {
    // web-vitals not available (e.g. old browser) — fail silently
    if (import.meta.env.DEV) {
      console.warn('[Trackr] web-vitals init failed:', err);
    }
  }
}

/**
 * Get current vitals history from localStorage
 */
export function getVitalsHistory(): VitalHistory {
  return readHistory();
}

/**
 * Get latest entry per metric name
 */
export function getLatestVitals(): Partial<Record<VitalName, VitalEntry>> {
  const { entries } = readHistory();
  const latest: Partial<Record<VitalName, VitalEntry>> = {};
  // Iterate in reverse to get most recent
  for (let i = entries.length - 1; i >= 0; i--) {
    const e = entries[i];
    if (!latest[e.name]) {
      latest[e.name] = e;
    }
  }
  return latest;
}

/**
 * Get overall performance score (0-100) from latest vitals
 */
export function getPerformanceScore(): number {
  const latest = getLatestVitals();
  const values: Partial<Record<VitalName, number>> = {};
  (Object.keys(latest) as VitalName[]).forEach(name => {
    if (latest[name]) values[name] = latest[name]!.value;
  });
  return computeOverallScore(values);
}

/**
 * Get a full summary of current perf state
 */
export function getPerformanceSummary(): PerformanceSummary {
  const latest = getLatestVitals();
  return {
    CLS:          latest.CLS  ?? null,
    LCP:          latest.LCP  ?? null,
    FID:          latest.FID  ?? null,
    INP:          latest.INP  ?? null,
    TTFB:         latest.TTFB ?? null,
    overallScore: getPerformanceScore(),
    timestamp:    Date.now(),
  };