```tsx
// src/App.tsx
import React, { Suspense, lazy, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  useLocation,
} from "react-router-dom";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Goals = lazy(() => import("./pages/Goals"));
const Settings = lazy(() => import("./pages/Settings"));
const Profile = lazy(() => import("./pages/Profile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PREFETCH_MAP: Record<string, () => Promise<unknown>> = {
  "/dashboard": () => import("./pages/Dashboard"),
  "/analytics": () => import("./pages/Analytics"),
  "/goals": () => import("./pages/Goals"),
  "/settings": () => import("./pages/Settings"),
  "/profile": () => import("./pages/Profile"),
  "/onboarding": () => import("./pages/Onboarding"),
};

function prefetchRoute(path: string) {
  const importer = PREFETCH_MAP[path];
  if (importer) {
    importer().catch(() => {});
  }
}

function Spinner() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        width: "100vw",
        background: "#0f0f0f",
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          border: "4px solid #333",
          borderTop: "4px solid #7c3aed",
          borderRadius: "50%",
          animation: "trackr-spin 0.75s linear infinite",
        }}
      />
      <style>{`
        @keyframes trackr-spin {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

interface NavItemProps {
  to: string;
  label: string;
  icon: React.ReactNode;
}

function NavItem({ to, label, icon }: NavItemProps) {
  return (
    <NavLink
      to={to}
      onMouseEnter={() => prefetchRoute(to)}
      onFocus={() => prefetchRoute(to)}
      onTouchStart={() => prefetchRoute(to)}
      style={({ isActive }) => ({
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        padding: "8px 12px",
        borderRadius: 12,
        textDecoration: "none",
        color: isActive ? "#7c3aed" : "#9ca3af",
        background: isActive ? "rgba(124,58,237,0.12)" : "transparent",
        fontWeight: isActive ? 600 : 400,
        fontSize: 11,
        transition: "color 0.2s, background 0.2s",
        minWidth: 56,
        justifyContent: "center",
      })}
      aria-label={label}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

function BottomNav() {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 64,
        background: "#1a1a1a",
        borderTop: "1px solid #2a2a2a",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        padding: "0 8px",
        zIndex: 100,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <NavItem
        to="/dashboard"
        label="Home"
        icon={
          <svg
            width={22}
            height={22}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0H4"
            />
          </svg>
        }
      />
      <NavItem
        to="/analytics"
        label="Analytics"
        icon={
          <svg
            width={22}
            height={22}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        }
      />
      <NavItem
        to="/goals"
        label="Goals"
        icon={
          <svg
            width={22}
            height={22}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle
              cx={12}
              cy={12}
              r={10}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={12}
              cy={12}
              r={6}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx={12}
              cy={12}
              r={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
      />
      <NavItem
        to="/profile"
        label="Profile"
        icon={
          <svg
            width={22}
            height={22}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
        }
      />
      <NavItem
        to="/settings"
        label="Settings"
        icon={
          <svg
            width={22}
            height={22}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        }
      />
    </nav>
  );
}

const HIDE_NAV_PATHS = ["/onboarding", "/"];

function AppShell() {
  const location = useLocation();
  const hideNav = HIDE_NAV_PATHS.includes(location.pathname);

  useEffect(() => {
    // Collect all timer IDs so we can clear them on cleanup
    const timers: ReturnType<typeof setTimeout>[] = [];

    const scheduleIdlePrefetch = () => {
      Object.keys(PREFETCH_MAP).forEach((path) => {
        if (path !== location.pathname) {
          const id = setTimeout(() => prefetchRoute(path), 2000);
          timers.push(id);
        }
      });
    };

    if (document.readyState === "complete") {
      scheduleIdlePrefetch();
    } else {
      window.addEventListener("load", scheduleIdlePrefetch, { once: true });
    }

    return () => {
      // Cancel every pending prefetch timer on route change or unmount
      timers.forEach((id) => clearTimeout(id));
      window.removeEventListener("load", scheduleIdlePrefetch);
    };
  }, [location.pathname]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f0f0f",
        color: "#f9fafb",
        fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
        paddingBottom: hideNav ? 0 : 80,
      }}
    >
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/" element={<Onboarding />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      {!hideNav && <BottomNav />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
```

```ts
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    target: "es2020",
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // React core runtime — loaded first, cached longest
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          // Routing
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }

          // UI / charting / animation libraries
          if (
            id.includes("node_modules/recharts") ||
            id.includes("node_modules/framer-motion") ||
            id.includes("node_modules/@radix-ui") ||
            id.includes("node_modules/lucide-react") ||
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/tailwind-merge")
          ) {
            return "vendor-ui";
          }

          // Everything else in node_modules → generic vendor chunk
          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }

          // Source pages → each gets its own async chunk (handled by lazy())
          // No explicit return → Rollup assigns them to their natural chunks
        },
      },
    },
  },
});