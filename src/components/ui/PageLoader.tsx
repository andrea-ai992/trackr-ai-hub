// src/components/ui/PageLoader.tsx
import React, { useEffect, useRef } from "react";

const STYLES = `
  @keyframes trackr-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  @keyframes trackr-pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.6; transform: scale(0.92); }
  }
  @keyframes trackr-fadein {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes trackr-bounce {
    0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
    40% { transform: translateY(-8px); opacity: 1; }
  }
  .trackr-dot-1 { animation: trackr-bounce 1.2s ease-in-out infinite 0s; }
  .trackr-dot-2 { animation: trackr-bounce 1.2s ease-in-out infinite 0.2s; }
  .trackr-dot-3 { animation: trackr-bounce 1.2s ease-in-out infinite 0.4s; }
`;

const STYLE_ID = "trackr-pageloader-styles";

const PageLoader: React.FC = () => {
  // Inject styles once into <head>, never duplicate
  const injected = useRef(false);
  useEffect(() => {
    if (injected.current) return;
    if (document.getElementById(STYLE_ID)) {
      injected.current = true;
      return;
    }
    const el = document.createElement("style");
    el.id = STYLE_ID;
    el.textContent = STYLES;
    document.head.appendChild(el);
    injected.current = true;
    // No cleanup — styles are global and reused across mounts
  }, []);

  return (
    <div
      role="status"
      aria-label="Chargement de la page"
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        width: "100%",
        background: "linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)",
        gap: "24px",
      }}
    >
      {/* Spinner ring container */}
      <div style={{ position: "relative", width: "64px", height: "64px" }}>
        {/* Outer ring */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#6366f1",
            borderRightColor: "#8b5cf6",
            animation:
              "trackr-spin 0.9s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite",
          }}
        />
        {/* Inner ring */}
        <div
          style={{
            position: "absolute",
            inset: "8px",
            borderRadius: "50%",
            border: "3px solid transparent",
            borderTopColor: "#a78bfa",
            borderLeftColor: "#c4b5fd",
            animation:
              "trackr-spin 1.3s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite reverse",
          }}
        />
        {/* Core dot */}
        <div
          style={{
            position: "absolute",
            inset: "20px",
            borderRadius: "50%",
            background: "radial-gradient(circle, #6366f1 0%, #8b5cf6 100%)",
            animation: "trackr-pulse 1.8s ease-in-out infinite",
            boxShadow:
              "0 0 16px rgba(99,102,241,0.6), 0 0 32px rgba(139,92,246,0.3)",
          }}
        />
      </div>

      {/* Label + bouncing dots */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px",
          animation: "trackr-fadein 0.5s ease-out forwards",
        }}
      >
        <span
          style={{
            fontSize: "22px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            background: "linear-gradient(90deg, #6366f1, #a78bfa, #8b5cf6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          }}
        >
          Trackr
        </span>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          {(
            [
              { cls: "trackr-dot-1", bg: "#6366f1" },
              { cls: "trackr-dot-2", bg: "#8b5cf6" },
              { cls: "trackr-dot-3", bg: "#a78bfa" },
            ] as const
          ).map(({ cls, bg }) => (
            <span
              key={cls}
              className={cls}
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: bg,
                display: "inline-block",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageLoader;

// src/App.tsx
import React, {
  Suspense,
  lazy,
  useEffect,
  useCallback,
  useRef,
} from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Link,
} from "react-router-dom";
import PageLoader from "./components/ui/PageLoader";

// ─── Lazy pages ────────────────────────────────────────────────────────────────
const lazyPage = (importer: () => Promise<{ default: React.ComponentType }>
) =>
  lazy(() =>
    importer().catch(() => import("./pages/NotFound"))
  );

const Home      = lazyPage(() => import("./pages/Home"));
const Dashboard = lazyPage(() => import("./pages/Dashboard"));
const Habits    = lazyPage(() => import("./pages/Habits"));
const Goals     = lazyPage(() => import("./pages/Goals"));
const Analytics = lazyPage(() => import("./pages/Analytics"));
const Profile   = lazyPage(() => import("./pages/Profile"));
const Settings  = lazyPage(() => import("./pages/Settings"));
const NotFound  = lazy(() => import("./pages/NotFound"));

// ─── Prefetch map ───────────────────────────────────────────────────────────────
const ROUTE_PREFETCH_MAP: Record<string, () => Promise<unknown>> = {
  "/":          () => import("./pages/Home"),
  "/dashboard": () => import("./pages/Dashboard"),
  "/habits":    () => import("./pages/Habits"),
  "/goals":     () => import("./pages/Goals"),
  "/analytics": () => import("./pages/Analytics"),
  "/profile":   () => import("./pages/Profile"),
  "/settings":  () => import("./pages/Settings"),
};

const prefetchRoute = (path: string): void => {
  ROUTE_PREFETCH_MAP[path]?.().catch(() => {});
};

// Prefetch all idle — guarded so it only runs once per session
let prefetchDone = false;
const prefetchAllRoutes = (): void => {
  if (prefetchDone) return;
  prefetchDone = true;

  const run = () =>
    Object.values(ROUTE_PREFETCH_MAP).forEach((fn) => fn().catch(() => {}));

  if (typeof requestIdleCallback !== "undefined") {
    requestIdleCallback(run, { timeout: 3000 });
  } else {
    setTimeout(run, 2000);
  }
};

// ─── Route change handler ───────────────────────────────────────────────────────
const RouteChangeHandler: React.FC = () => {
  const location = useLocation();
  const isFirst = useRef(true);

  useEffect(() => {
    // Skip scroll on initial load
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);

  useEffect(() => {
    prefetchAllRoutes();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
};

// ─── PrefetchLink ───────────────────────────────────────────────────────────────
export interface PrefetchLinkProps
  extends React.ComponentPropsWithoutRef<typeof Link> {
  to: string;
  prefetch?: boolean;
}

export const PrefetchLink: React.FC<PrefetchLinkProps> = ({
  to,
  prefetch = true,
  onMouseEnter,
  onFocus,
  onTouchStart,
  children,
  ...rest
}) => {
  const triggerPrefetch = useCallback(() => {
    if (prefetch) prefetchRoute(to);
  }, [to, prefetch]);

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onMouseEnter?.(e);
    },
    [triggerPrefetch, onMouseEnter]
  );

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onFocus?.(e);
    },
    [triggerPrefetch, onFocus]
  );

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLAnchorElement>) => {
      triggerPrefetch();
      onTouchStart?.(e);
    },
    [triggerPrefetch, onTouchStart]
  );

  return (
    <Link
      to={to}
      onMouseEnter={handleMouseEnter}
      onFocus={handleFocus}
      onTouchStart={handleTouchStart}
      {...rest}
    >
      {children}
    </Link>
  );
};

// ─── App routes ────────────────────────────────────────────────────────────────
const AppRoutes: React.FC = () => (
  <>
    <RouteChangeHandler />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/habits"    element={<Habits />} />
        <Route path="/goals"     element={<Goals />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/profile"   element={<Profile />} />
        <Route path="/settings"  element={<Settings />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </Suspense>
  </>
);

// ─── Root ───────────────────────────────────────────────────────────────────────
const App: React.FC = () => (
  <BrowserRouter>
    <AppRoutes />
  </BrowserRouter>
);

export default App;

// vite.config.ts
import { defineConfig, splitVendorChunkPlugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    splitVendorChunkPlugin(), // baseline vendor split
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    target: "es2020",
    sourcemap: false,       // disable in prod for perf; enable for staging
    chunkSizeWarningLimit: 500,

    rollupOptions: {
      output: {
        // Fine-grained manual chunks
        manualChunks(id) {
          // React core — smallest possible chunk, loaded first
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // Router
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }

          // UI / animation libs (extend as deps grow)
          if (
            id.includes("node_modules/framer-motion") ||
            id.includes("node_modules/@radix-ui") ||
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/class-variance-authority") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge")
          ) {
            return "vendor-ui";
          }

          // Data / state (add zustand, react-query, etc. as needed)
          if (
            id.includes("node_modules/zustand") ||
            id.includes("node_modules/@tanstack")
          ) {
            return "vendor-data";
          }

          // Chart / analytics heavy libs
          if (
            id.includes("node_modules/recharts") ||
            id.includes("node_modules/d3")
          ) {
            return "vendor-charts";
          }

          // Remaining node_modules → generic vendor chunk
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }

          // App shared UI components → one chunk, always cached
          if (id.includes("/src/components/")) {
            return "app-components";
          }

          // App shared utilities / hooks
          if (
            id.includes("/src/hooks/") ||
            id.includes("/src/utils/") ||
            id.includes("/src/lib/") ||
            id.includes("/src/store/")
          ) {
            return "app-shared";
          }

          // Pages are left to Rollup's default → each gets its own lazy chunk
          // (no explicit return → Rollup decides)
        },

        // Deterministic file names for long-term caching
        entryFileNames:  "assets/[name]-[hash].js",
        chunkFileNames:  "assets/[name]-[hash].js",
        assetFileNames:  "assets/[name]-[hash].[ext]",
      },
    },
  },

  // Dev server
  server: {
    port: 5173,
    strictPort: false,
    open: false,
  },
});