import { createBrowserRouter, useRouteError } from "react-router";
import React, { Suspense, lazy } from "react";
import { DashboardLayout } from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Stale-chunk auto-reload ─────────────────────────────────────────
// When Vercel redeploys, chunk filenames change. Browsers with cached
// HTML try to fetch old chunk URLs (now 404) causing:
//   "Failed to fetch dynamically imported module"
// Fix: intercept the import error and hard-reload (once per session)
// so the browser picks up the new index.html with correct chunk refs.
const CHUNK_RELOAD_KEY = "__skillup_chunk_reloaded__";

function isChunkError(err) {
  return (
    err?.name === "ChunkLoadError" ||
    err?.message?.includes("dynamically imported module") ||
    err?.message?.includes("Failed to fetch") ||
    err?.message?.includes("Importing a module script failed")
  );
}

function triggerChunkReload() {
  if (!sessionStorage.getItem(CHUNK_RELOAD_KEY)) {
    sessionStorage.setItem(CHUNK_RELOAD_KEY, "1");
    window.location.reload();
    return true;
  }
  return false;
}

function lazyWithChunkReload(importFn) {
  return lazy(() =>
    importFn().catch((err) => {
      if (isChunkError(err)) {
        triggerChunkReload();
        // Return a no-op component while reload is in flight
        return { default: () => null };
      }
      throw err;
    })
  );
}

// ─── Route-level code splitting ──────────────────────────────────────
const Login             = lazyWithChunkReload(() => import("./pages/Login"));
const LandingPage       = lazyWithChunkReload(() => import("./pages/LandingPage"));
const LearnerDashboard  = lazyWithChunkReload(() => import("./pages/LearnerDashboard"));
const LearningPath      = lazyWithChunkReload(() => import("./pages/LearningPath"));
const ProgressTracking  = lazyWithChunkReload(() => import("./pages/ProgressTracking"));
const Alerts            = lazyWithChunkReload(() => import("./pages/Alerts"));
const CounselorDashboard = lazyWithChunkReload(() => import("./pages/CounselorDashboard"));
const TrainerDashboard  = lazyWithChunkReload(() => import("./pages/TrainerDashboard"));
const Settings          = lazyWithChunkReload(() => import("./pages/Settings"));
const TestVideoPlayer   = lazyWithChunkReload(() => import("./pages/TestVideoPlayer"));

// Shared loading fallback — minimal spinner that doesn't flash for fast loads
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
        <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">Loading…</span>
      </div>
    </div>
  );
}

// Wraps a lazy component in Suspense
function LazyRoute({ children }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

// Route-level error boundary — silently reloads on stale-chunk errors,
// shows friendly UI for genuine application errors.
function RouteErrorBoundary() {
  const error = useRouteError();

  if (isChunkError(error)) {
    const didReload = triggerChunkReload();
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-400 rounded-full animate-spin" />
          <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
            {didReload ? "Updating app, please wait…" : "Reload the page to continue."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
      <div className="max-w-md w-full glass-elevated p-8 rounded-2xl border border-white/60 dark:border-white/10 space-y-4 shadow-xl backdrop-blur-xl">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-600 dark:text-rose-400 font-bold text-xl">
          !
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Something went wrong</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          An error occurred while loading this view. You can reload the page to restore the latest session.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md active:scale-95"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LazyRoute><LandingPage /></LazyRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/login",
    element: <LazyRoute><Login /></LazyRoute>,
    errorElement: <RouteErrorBoundary />,
  },
  {
    path: "/test-video-player",
    element: <LazyRoute><TestVideoPlayer /></LazyRoute>,
    errorElement: <RouteErrorBoundary />,
  },

  {
    path: "/dashboard",
    Component: DashboardLayout,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <LazyRoute>
            <ProtectedRoute allowedRoles={['learner']}>
              <LearnerDashboard />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: "learning-path",
        element: (
          <LazyRoute>
            <ProtectedRoute allowedRoles={['learner']}>
              <LearningPath />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: "progress",
        element: (
          <LazyRoute>
            <ProtectedRoute allowedRoles={['learner']}>
              <ProgressTracking />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: "alerts",
        element: (
          <LazyRoute>
            <ProtectedRoute allowedRoles={['learner', 'counselor', 'trainer']}>
              <Alerts />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: "counselor",
        element: (
          <LazyRoute>
            <ProtectedRoute allowedRoles={['counselor']}>
              <CounselorDashboard />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: "trainer",
        element: (
          <LazyRoute>
            <ProtectedRoute allowedRoles={['trainer']}>
              <TrainerDashboard />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <LazyRoute>
            <ProtectedRoute allowedRoles={['learner', 'counselor', 'trainer']}>
              <Settings />
            </ProtectedRoute>
          </LazyRoute>
        ),
      },
    ],
  },
]);