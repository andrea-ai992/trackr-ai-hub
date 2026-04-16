src/config/routes.js

import { lazy } from 'react';

// ─── Lazy-loaded page components with explicit chunk names ───────────────────
export const HomePage = lazy(() =>
  import(/* webpackChunkName: "page-home" */ '../pages/HomePage')
);

export const DashboardPage = lazy(() =>
  import(/* webpackChunkName: "page-dashboard" */ '../pages/DashboardPage')
);

export const TrackingPage = lazy(() =>
  import(/* webpackChunkName: "page-tracking" */ '../pages/TrackingPage')
);

export const AnalyticsPage = lazy(() =>
  import(/* webpackChunkName: "page-analytics" */ '../pages/AnalyticsPage')
);

export const SettingsPage = lazy(() =>
  import(/* webpackChunkName: "page-settings" */ '../pages/SettingsPage')
);

export const ProfilePage = lazy(() =>
  import(/* webpackChunkName: "page-profile" */ '../pages/ProfilePage')
);

export const NotFoundPage = lazy(() =>
  import(/* webpackChunkName: "page-404" */ '../pages/NotFoundPage')
);

// ─── Route definitions ───────────────────────────────────────────────────────
export const ROUTES = [
  {
    path: '/',
    component: HomePage,
    label: 'Home',
    icon: 'home',
    preload: true,
    cached: true,
    meta: {
      title: 'Trackr — Home',
      description: 'AI-powered tracking hub',
    },
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    label: 'Dashboard',
    icon: 'dashboard',
    preload: true,
    cached: true,
    meta: {
      title: 'Trackr — Dashboard',
      description: 'Your personal analytics dashboard',
    },
  },
  {
    path: '/tracking',
    component: TrackingPage,
    label: 'Tracking',
    icon: 'tracking',
    preload: false,
    cached: true,
    meta: {
      title: 'Trackr — Tracking',
      description: 'Real-time tracking data',
    },
  },
  {
    path: '/analytics',
    component: AnalyticsPage,
    label: 'Analytics',
    icon: 'analytics',
    preload: false,
    cached: false,
    meta: {
      title: 'Trackr — Analytics',
      description: 'Deep analytics insights',
    },
  },
  {
    path: '/settings',
    component: SettingsPage,
    label: 'Settings',
    icon: 'settings',
    preload: false,
    cached: false,
    meta: {
      title: 'Trackr — Settings',
      description: 'App configuration',
    },
  },
  {
    path: '/profile',
    component: ProfilePage,
    label: 'Profile',
    icon: 'profile',
    preload: false,
    cached: false,
    meta: {
      title: 'Trackr — Profile',
      description: 'Your profile',
    },
  },
  {
    path: '*',
    component: NotFoundPage,
    label: '404',
    icon: null,
    preload: false,
    cached: false,
    meta: {
      title: 'Trackr — Not Found',
      description: 'Page not found',
    },
  },
];

// ─── Nav cache key prefix ────────────────────────────────────────────────────
export const NAV_CACHE_PREFIX = 'trackr_nav_cache_v1_';
export const NAV_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// ─── localStorage nav cache helpers ─────────────────────────────────────────
export function getCachedRoute(path) {
  try {
    const key = `${NAV_CACHE_PREFIX}${path.replace(/\//g, '_')}`;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const { timestamp, data } = JSON.parse(raw);
    if (Date.now() - timestamp > NAV_CACHE_TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function setCachedRoute(path, data) {
  try {
    const key = `${NAV_CACHE_PREFIX}${path.replace(/\//g, '_')}`;
    localStorage.setItem(
      key,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // Storage quota exceeded or private mode — fail silently
  }
}

export function clearRouteCache(path) {
  try {
    if (path) {
      const key = `${NAV_CACHE_PREFIX}${path.replace(/\//g, '_')}`;
      localStorage.removeItem(key);
    } else {
      Object.keys(localStorage)
        .filter((k) => k.startsWith(NAV_CACHE_PREFIX))
        .forEach((k) => localStorage.removeItem(k));
    }
  } catch {
    // fail silently
  }
}

// ─── Preload a lazy component (fire-and-forget) ──────────────────────────────
export function preloadRoute(component) {
  try {
    // React.lazy wraps a thenable — calling ._payload or .__esModule
    // is fragile; the safest approach is to call the factory directly.
    // We retrieve the factory stored by React.lazy internals:
    const anyComp = component;
    if (anyComp && anyComp._payload && typeof anyComp._payload._result === 'function') {
      anyComp._payload._result();
    } else if (anyComp && anyComp._init && anyComp._payload) {
      // React 18+ internal — trigger the import
      try { anyComp._init(anyComp._payload); } catch { /* pending is fine */ }
    }
  } catch {
    // Silently ignore preload failures
  }
}

// ─── Preload all routes flagged as preload:true ──────────────────────────────
export function preloadCriticalRoutes() {
  ROUTES.filter((r) => r.preload).forEach((r) => preloadRoute(r.component));
}

// ─── Update document meta for current route ─────────────────────────────────
export function applyRouteMeta(path) {
  const route = ROUTES.find((r) => r.path === path) ?? ROUTES.find((r) => r.path === '*');
  if (!route) return;
  document.title = route.meta?.title ?? 'Trackr';
  const desc = document.querySelector('meta[name="description"]');
  if (desc) desc.setAttribute('content', route.meta?.description ?? '');
}

// ─── Resolve route config from path ─────────────────────────────────────────
export function resolveRoute(path) {
  return (
    ROUTES.find((r) => r.path !== '*' && r.path === path) ??
    ROUTES.find((r) => r.path === '*')
  );
}