```typescript
// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "esnext",
    minify: "esbuild",
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-is/") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "vendor-react";
          }

          if (
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/@remix-run/")
          ) {
            return "vendor-router";
          }

          if (
            id.includes("node_modules/@radix-ui/") ||
            id.includes("node_modules/lucide-react/") ||
            id.includes("node_modules/class-variance-authority/") ||
            id.includes("node_modules/clsx/") ||
            id.includes("node_modules/tailwind-merge/") ||
            id.includes("node_modules/cmdk/") ||
            id.includes("node_modules/vaul/") ||
            id.includes("node_modules/sonner/")
          ) {
            return "vendor-ui";
          }

          if (
            id.includes("node_modules/@tanstack/") ||
            id.includes("node_modules/zustand/") ||
            id.includes("node_modules/jotai/") ||
            id.includes("node_modules/immer/")
          ) {
            return "vendor-state";
          }

          if (
            id.includes("node_modules/date-fns/") ||
            id.includes("node_modules/dayjs/") ||
            id.includes("node_modules/luxon/")
          ) {
            return "vendor-date";
          }

          if (
            id.includes("node_modules/recharts/") ||
            id.includes("node_modules/victory/") ||
            id.includes("node_modules/d3") ||
            id.includes("node_modules/chart.js/")
          ) {
            return "vendor-charts";
          }

          if (
            id.includes("node_modules/firebase/") ||
            id.includes("node_modules/@firebase/") ||
            id.includes("node_modules/supabase/") ||
            id.includes("node_modules/@supabase/")
          ) {
            return "vendor-backend";
          }

          if (
            id.includes("node_modules/openai/") ||
            id.includes("node_modules/@anthropic") ||
            id.includes("node_modules/ai/")
          ) {
            return "vendor-ai";
          }

          if (id.includes("node_modules/")) {
            return "vendor-misc";
          }
        },
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name ?? "";
          if (/\.(png|jpe?g|gif|svg|webp|avif|ico)$/i.test(name)) {
            return "assets/images/[name]-[hash][extname]";
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(name)) {
            return "assets/fonts/[name]-[hash][extname]";
          }
          if (/\.css$/i.test(name)) {
            return "assets/css/[name]-[hash][extname]";
          }
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-dom/client",
      "react-router-dom",
    ],
  },
  server: {
    port: 5173,
    host: true,
    warmup: {
      clientFiles: [
        "./src/main.tsx",
        "./src/App.tsx",
        "./src/router/index.tsx",
      ],
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
```

```tsx
// src/components/ui/PageSpinner.tsx
import React from "react";

interface PageSpinnerProps {
  fullScreen?: boolean;
  message?: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap = {
  sm: { outer: 32, inner: 24, border: 3 },
  md: { outer: 48, inner: 36, border: 4 },
  lg: { outer: 64, inner: 48, border: 5 },
};

const PageSpinner: React.FC<PageSpinnerProps> = ({
  fullScreen = true,
  message,
  size = "md",
}) => {
  const { outer, inner, border } = sizeMap[size];

  const spinner = (
    <div
      role="status"
      aria-label={message ?? "Chargement en cours…"}
      aria-live="polite"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      <div style={{ position: "relative", width: outer, height: outer }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `${border}px solid rgba(99, 102, 241, 0.15)`,
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            border: `${border}px solid transparent`,
            borderTopColor: "#6366f1",
            borderRightColor: "#8b5cf6",
            animation:
              "trackr-spin 0.75s cubic-bezier(0.5, 0, 0.5, 1) infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: (outer - inner) / 2,
            borderRadius: "50%",
            border: `${border - 1}px solid transparent`,
            borderTopColor: "#a78bfa",
            animation:
              "trackr-spin 1.1s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse",
          }}
        />
      </div>

      {message && (
        <p
          style={{
            margin: 0,
            fontSize: "0.875rem",
            color: "#94a3b8",
            fontWeight: 500,
            letterSpacing: "0.02em",
            animation: "trackr-fade-pulse 1.5s ease-in-out infinite",
          }}
        >
          {message}
        </p>
      )}

      <style>{`
        @keyframes trackr-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes trackr-fade-pulse {
          0%, 100% { opacity: 0.5; }
          50%       { opacity: 1; }
        }
      `}</style>
    </div>
  );

  if (!fullScreen) return spinner;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(2, 6, 23, 0.85)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 9999,
      }}
    >
      {spinner}
    </div>
  );
};

export default PageSpinner;
```

```tsx
// src/components/ui/RouteSuspense.tsx
import React, { Suspense } from "react";
import PageSpinner from "./PageSpinner";

interface RouteSuspenseProps {
  children: React.ReactNode;
  message?: string;
}

const RouteSuspense: React.FC<RouteSuspenseProps> = ({
  children,
  message = "Chargement…",
}) => (
  <Suspense fallback={<PageSpinner fullScreen message={message} size="md" />}>
    {children}
  </Suspense>
);

export default RouteSuspense;
```

```tsx
// src/router/index.tsx
import React, { lazy, Suspense } from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
  Outlet,
} from "react-router-dom";
import PageSpinner from "@/components/ui/PageSpinner";

// ── Lazy pages ────────────────────────────────────────────────────────────────
const Dashboard   = lazy(() => import("@/pages/Dashboard"));
const Analytics   = lazy(() => import("@/pages/Analytics"));
const Habits      = lazy(() => import("@/pages/Habits"));
const Goals       = lazy(() => import("@/pages/Goals"));
const Journal     = lazy(() => import("@/pages/Journal"));
const Settings    = lazy(() => import("@/pages/Settings"));
const Profile     = lazy(() => import("@/pages/Profile"));
const Login       = lazy(() => import("@/pages/Login"));
const Register    = lazy(() => import("@/pages/Register"));
const NotFound    = lazy(() => import("@/pages/NotFound"));
const Onboarding  = lazy(() => import("@/pages/Onboarding"));
const AIAssistant = lazy(() => import("@/pages/AIAssistant"));

// ── Helper — une Suspense boundary par route ──────────────────────────────────
function lazySuspense(
  Component: React.LazyExoticComponent<React.ComponentType>,
  message?: string,
) {
  return (
    <Suspense fallback={<PageSpinner fullScreen message={message} size="md" />}>
      <Component />
    </Suspense>
  );
}

// ── Layout racine — pas de Suspense ici, chaque route gère le sien ────────────
const AppLayout: React.FC = () => <Outlet />;

// ── Router ────────────────────────────────────────────────────────────────────
const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: lazySuspense(Dashboard, "Tableau de bord…"),
      },
      {
        path: "analytics",
        element: lazySuspense(Analytics, "Analytiques…"),
      },
      {
        path: "habits",
        element: lazySuspense(Habits, "Habitudes…"),
      },
      {
        path: "goals",
        element: lazySuspense(Goals, "Objectifs…"),
      },
      {
        path: "journal",
        element: lazySuspense(Journal, "Journal…"),
      },
      {
        path: "ai-assistant",
        element: lazySuspense(AIAssistant, "Assistant IA…"),
      },
      {
        path: "settings",
        element: lazySuspense(Settings, "Paramètres…"),
      },
      {
        path: "profile",
        element: lazySuspense(Profile, "Profil…"),
      },
      {
        path: "onboarding",
        element: lazySuspense(Onboarding, "Bienvenue…"),
      },
      {
        path: "login",
        element: lazySuspense(Login),
      },
      {
        path: "register",
        element: lazySuspense(Register),
      },
      {
        path: "*",
        element: lazySuspense(NotFound),
      },
    ],
  },
]);

// ── Export ────────────────────────────────────────────────────────────────────
const AppRouter: React.FC = () => (
  <RouterProvider
    router={router}
    fallbackElement={<PageSpinner fullScreen message="Initialisation…" />}
  />
);

export default AppRouter;