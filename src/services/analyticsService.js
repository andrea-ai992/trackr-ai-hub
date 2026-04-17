Je vais créer le fichier `src/services/analyticsService.js` complet et optimisé pour le tracking des Web Vitals avec Vercel Analytics.

<file_write path="src/services/analyticsService.js">
/**
 * analyticsService.js
 * Trackr AI Hub — Performance Analytics & Web Vitals Service
 * 
 * Tracks CLS, LCP, FID, INP, TTFB with Vercel Analytics integration
 * Target: LCP <1.2s, CLS <0.05 on mobile 4G throttled network
 */

import { onCLS, onFCP, onFID, onINP, onLCP, onTTFB } from 'web-vitals';

// ─── Constants ────────────────────────────────────────────────────────────────

const ANALYTICS_VERSION = '2.0.0';
const REPORT_ENDPOINT = '/api/analytics';
const VERCEL_SPEED_INSIGHTS_URL = 'https://vitals.vercel-insights.com/v1/vitals';
const BUFFER_FLUSH_INTERVAL = 5000; // 5s
const MAX_BUFFER_SIZE = 20;
const NETWORK_TIMEOUT = 3000;

const THRESHOLDS = {
  LCP: { good: 1200, needsImprovement: 2500 },   // ms — target <1.2s
  CLS: { good: 0.05, needsImprovement: 0.1 },     // score — target <0.05
  FID: { good: 100, needsImprovement: 300 },       // ms
  INP: { good: 200, needsImprovement: 500 },       // ms
  FCP: { good: 1800, needsImprovement: 3000 },     // ms
  TTFB: { good: 800, needsImprovement: 1800 },     // ms
};

const RATING = {
  GOOD: 'good',
  NEEDS_IMPROVEMENT: 'needs-improvement',
  POOR: 'poor',
};

// ─── Internal State ────────────────────────────────────────────────────────────

let _initialized = false;
let _metricsBuffer = [];
let _flushTimer = null;
let _sessionId = null;
let _pageLoadTime = null;
let _connectionInfo = null;
let _observers = new Map();
let _longTasksBuffer = [];
let _layoutShiftBuffer = [];
let _resourceTimingBuffer = [];

// ─── Utilities ────────────────────────────────────────────────────────────────

function generateSessionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

function getTimestamp() {
  return Date.now();
}

function getPerformanceNow() {
  return typeof performance !== 'undefined' ? Math.round(performance.now()) : 0;
}

function getRating(metricName, value) {
  const threshold = THRESHOLDS[metricName];
  if (!threshold) return RATING.GOOD;
  if (value <= threshold.good) return RATING.GOOD;
  if (value <= threshold.needsImprovement) return RATING.NEEDS_IMPROVEMENT;
  return RATING.POOR;
}

function getConnectionInfo() {
  if (typeof navigator === 'undefined') return null;
  const conn =
    navigator.connection ||
    navigator.mozConnection ||
    navigator.webkitConnection;

  if (!conn) return null;
  return {
    effectiveType: conn.effectiveType || 'unknown',
    downlink: conn.downlink || 0,
    rtt: conn.rtt || 0,
    saveData: conn.saveData || false,
  };
}

function getDeviceInfo() {
  if (typeof window === 'undefined') return {};
  return {
    devicePixelRatio: window.devicePixelRatio || 1,
    screenWidth: window.screen?.width || 0,
    screenHeight: window.screen?.height || 0,
    viewportWidth: window.innerWidth || 0,
    viewportHeight: window.innerHeight || 0,
    userAgent: navigator.userAgent || '',
    platform: navigator.platform || '',
    hardwareConcurrency: navigator.hardwareConcurrency || 0,
    deviceMemory: navigator.deviceMemory || 0,
    isMobile: /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent || ''),
  };
}

function getPageInfo() {
  if (typeof window === 'undefined') return {};
  return {
    url: window.location.href,
    pathname: window.location.pathname,
    referrer: document.referrer || '',
    title: document.title || '',
  };
}

function getNavigationTiming() {
  if (typeof performance === 'undefined') return null;
  const nav = performance.getEntriesByType('navigation')[0];
  if (!nav) return null;

  return {
    dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
    tcp: Math.round(nav.connectEnd - nav.connectStart),
    ssl: nav.secureConnectionStart > 0
      ? Math.round(nav.connectEnd - nav.secureConnectionStart)
      : 0,
    ttfb: Math.round(nav.responseStart - nav.requestStart),
    download: Math.round(nav.responseEnd - nav.responseStart),
    domInteractive: Math.round(nav.domInteractive),
    domComplete: Math.round(nav.domComplete),
    loadEvent: Math.round(nav.loadEventEnd - nav.loadEventStart),
    type: nav.type || 'navigate',
    redirectCount: nav.redirectCount || 0,
    transferSize: nav.transferSize || 0,
    encodedBodySize: nav.encodedBodySize || 0,
    decodedBodySize: nav.decodedBodySize || 0,
  };
}

function getMemoryInfo() {
  if (typeof performance === 'undefined' || !performance.memory) return null;
  const mem = performance.memory;
  return {
    usedJSHeapSize: mem.usedJSHeapSize,
    totalJSHeapSize: mem.totalJSHeapSize,
    jsHeapSizeLimit: mem.jsHeapSizeLimit,
    usageRatio: mem.usedJSHeapSize / mem.jsHeapSizeLimit,
  };
}

function buildMetricPayload(metric, additionalData = {}) {
  return {
    // Core metric data
    name: metric.name,
    value: metric.value,
    delta: metric.delta,
    id: metric.id,
    rating: getRating(metric.name, metric.value),
    navigationType: metric.navigationType,

    // Context
    sessionId: _sessionId,
    timestamp: getTimestamp(),
    pageLoadAge: getPerformanceNow(),
    version: ANALYTICS_VERSION,

    // Page
    ...getPageInfo(),

    // Device & Network
    connection: _connectionInfo || getConnectionInfo(),
    device: getDeviceInfo(),
    memory: getMemoryInfo(),

    // Navigation timing (only on first metric)
    navigationTiming: getNavigationTiming(),

    // Long tasks count
    longTasksCount: _longTasksBuffer.length,
    totalLongTaskDuration: _longTasksBuffer.reduce(
      (sum, t) => sum + t.duration,
      0
    ),

    // Extra layout shift entries for CLS
    ...(metric.name === 'CLS' && {
      layoutShiftEntries: _layoutShiftBuffer.slice(-10),
    }),

    // Custom data
    ...additionalData,
  };
}

// ─── Vercel Speed Insights Reporter ───────────────────────────────────────────

async function reportToVercel(metric) {
  try {
    const dsn = import.meta.env.VITE_VERCEL_ANALYTICS_ID || '';
    if (!dsn) return;

    const body = JSON.stringify({
      dsn,
      id: metric.id,
      page: getPageInfo().pathname,
      href: getPageInfo().url,
      event_name: metric.name,
      value: metric.value.toString(),
      speed: _connectionInfo?.effectiveType || 'unknown',
    });

    if (navigator.sendBeacon) {
      navigator.sendBeacon(VERCEL_SPEED_INSIGHTS_URL, body);
    } else {
      await fetch(VERCEL_SPEED_INSIGHTS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      });
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Vercel report failed:', err.message);
    }
  }
}

// ─── Internal API Reporter ─────────────────────────────────────────────────────

async function flushBuffer() {
  if (_metricsBuffer.length === 0) return;

  const payload = [..._metricsBuffer];
  _metricsBuffer = [];

  try {
    const body = JSON.stringify({
      metrics: payload,
      batchId: generateSessionId(),
      timestamp: getTimestamp(),
    });

    const sent = navigator.sendBeacon
      ? navigator.sendBeacon(REPORT_ENDPOINT, body)
      : false;

    if (!sent) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

      await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Analytics-Version': ANALYTICS_VERSION,
        },
        body,
        keepalive: true,
        signal: controller.signal,
      });

      clearTimeout(timeout);
    }
  } catch (err) {
    // Re-queue on failure (limited retry)
    if (payload.length <= MAX_BUFFER_SIZE / 2) {
      _metricsBuffer = [...payload, ..._metricsBuffer].slice(0, MAX_BUFFER_SIZE);
    }
    if (import.meta.env.DEV) {
      console.warn('[Analytics] Flush failed:', err.message);
    }
  }
}

function scheduleFlush() {
  if (_flushTimer) return;
  _flushTimer = setTimeout(() => {
    _flushTimer = null;
    flushBuffer();
  }, BUFFER_FLUSH_INTERVAL);
}

function enqueueMetric(payload) {
  _metricsBuffer.push(payload);
  if (_metricsBuffer.length >= MAX_BUFFER_SIZE) {
    if (_flushTimer) {
      clearTimeout(_flushTimer);
      _flushTimer = null;
    }
    flushBuffer();
  } else {
    scheduleFlush();
  }
}

// ─── Console Logger (DEV) ─────────────────────────────────────────────────────

function logMetricDev(metric, payload) {
  if (!import.meta.env.DEV) return;

  const rating = payload.rating;
  const colors = {
    [RATING.GOOD]: '#22c55e',
    [RATING.NEEDS_IMPROVEMENT]: '#f59e0b',
    [RATING.POOR]: '#ef4444',
  };
  const color = colors[rating] || '#6b7280';
  const unit = metric.name === 'CLS' ? '' : 'ms';
  const value = metric.name === 'CLS'
    ? metric.value.toFixed(4)
    : Math.round(metric.value);

  console.groupCollapsed(
    `%c[Trackr Vitals] %c${metric.name}%c ${value}${unit} — ${rating.toUpperCase()}`,
    'color: #6366f1; font-weight: bold',
    `color: ${color}; font-weight: bold`,
    'color: inherit',
  );
  console.table({
    value: `${value}${unit}`,
    delta: `${metric.name === 'CLS' ? metric.delta.toFixed(4) : Math.round(metric.delta)}${unit}`,
    rating,
    target: metric.name === 'LCP' ? '<1200ms' : metric.name === 'CLS' ? '<0.05' : `<${THRESHOLDS[metric.name]?.good}ms`,
    threshold_good: THRESHOLDS[metric.name]?.good,
    threshold_ni: THRESHOLDS[metric.name]?.needsImprovement,
    session: _sessionId?.slice(0, 8),
    connection: payload.connection?.effectiveType,
    isMobile: payload.device?.isMobile,
  });

  if (metric.name === 'CLS' && payload.layoutShiftEntries?.length) {
    console.log('Layout Shift Entries:', payload.layoutShiftEntries);
  }
  if (metric.name === 'LCP') {
    const lcpEntry = performance.getEntriesByType('largest-contentful-paint').at(-1);
    if (lcpEntry) {
      console.log('LCP Element:', lcpEntry.element);
      console.log('LCP URL:', lcpEntry.url || 'inline element');
    }
  }
  console.groupEnd();
}

// ─── Performance Observers ────────────────────────────────────────────────────

function observeLongTasks() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        _longTasksBuffer.push({
          duration: Math.round(entry.duration),
          startTime: Math.round(entry.startTime),
          name: entry.name,
        });
        // Keep last 50 long tasks
        if (_longTasksBuffer.length > 50) {
          _longTasksBuffer.shift();
        }
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
    _observers.set('longtask', observer);
  } catch (e) {
    // longtask not supported
  }
}

function observeLayoutShifts() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          _layoutShiftBuffer.push({
            value: entry.value,
            startTime: Math.round(entry.startTime),
            sources: entry.sources?.map((s) => ({
              node: s.node?.nodeName || 'unknown',
              currentRect: s.currentRect
                ? {
                    top: Math.round(s.currentRect.top),
                    left: Math.round(s.currentRect.left),
                    width: Math.round(s.currentRect.width),
                    height: Math.round(s.currentRect.height),
                  }
                : null,
            })) || [],
          });
          if (_layoutShiftBuffer.length > 100) {
            _layoutShiftBuffer.shift();
          }
        }
      }
    });
    observer.observe({ entryTypes: ['layout-shift'] });
    _observers.set('layout-shift', observer);
  } catch (e) {
    // layout-shift not supported
  }
}

function observeResourceTiming() {
  if (typeof PerformanceObserver === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        // Track large resources that could impact LCP/performance
        if (entry.transferSize > 50000 || entry.duration > 500) {
          _resourceTimingBuffer.push({
            name: entry.name.split('?')[0], // strip query params
            initiatorType: entry.initiatorType,
            duration: Math.round(entry.duration),
            transferSize: entry.transferSize,
            encodedBodySize: entry.encodedBodySize,
            startTime: Math.round(entry.startTime),
          });
          if (_resourceTimingBuffer.length > 30) {
            _resourceTimingBuffer.shift();
          }
        }
      }
    });
    observer.observe({ entryTypes: ['resource'] });
    _observers.set('resource', observer);
  } catch (e) {
    // resource timing not supported
  }
}

// ─── Core Web Vitals Handlers ─────────────────────────────────────────────────

function handleMetric(metric) {
  const payload = buildMetricPayload(metric);

  // Log in dev mode
  logMetricDev(metric, payload);

  // Report to Vercel Speed Insights
  reportToVercel(metric);

  // Enqueue for batch reporting
  enqueueMetric(payload);

  // Dispatch DOM event for dashboard components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('trackr:vital', {
        detail: {
          name: metric.name,
          value: metric.value,
          rating: payload.rating,
          delta: metric.delta,
        },
        bubbles: false,
        cancelable: false,
      })
    );
  }
}

// ─── Route Change Performance ─────────────────────────────────────────────────

let _routeChangeStart = null;
let _routeChangeName = null;

function markRouteChangeStart(routeName) {
  _routeChangeStart = performance.now();
  _routeChangeName = routeName;
  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`route-change-start:${routeName}`);
  }
}

function markRouteChangeEnd(routeName) {
  if (_routeChangeStart === null) return;

  const duration = Math.round(performance.now() - _routeChangeStart);
  const name = routeName || _routeChangeName || 'unknown';

  if (typeof performance !== 'undefined' && performance.mark) {
    performance.mark(`route-change-end:${name}`);
    performance.measure(
      `route-change:${name}`,
      `route-change-start:${name}`,
      `route-change-end:${name}`
    );
  }

  const payload = {
    name: 'ROUTE_CHANGE',
    value: duration,
    rating: duration < 300 ? RATING.GOOD : duration < 1000 ? RATING.NEEDS_IMPROVEMENT : RATING.POOR,
    routeName: name,
    sessionId: _sessionId,
    timestamp: getTimestamp(),
    connection: _connectionInfo,
    ...getPageInfo(),
  };

  if (import.meta.env.DEV) {
    console.log(
      `%c[Trackr Vitals] %cROUTE_CHANGE%c ${name} — ${duration}ms`,
      'color: #6366f1; font-weight: bold',
      'color: #a78bfa; font-weight: bold',
      'color: inherit'
    );
  }

  enqueueMetric(payload);

  _routeChangeStart = null;
  _routeChangeName = null;
}

// ─── Resource Hints (preload/prefetch helpers) ────────────────────────────────

function