import { createBrowserRouter } from "react-router";
import React, { Suspense, lazy } from "react";
import { DashboardLayout } from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// ─── Route-level code splitting ─────────────────────────────────────
// Each page is lazy-loaded so the initial bundle stays slim (~200kB).
// Heavy deps like recharts only load when their page is visited.
const Login = lazy(() => import("./pages/Login"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const LearnerDashboard = lazy(() => import("./pages/LearnerDashboard"));
const LearningPath = lazy(() => import("./pages/LearningPath"));
const ProgressTracking = lazy(() => import("./pages/ProgressTracking"));
const Alerts = lazy(() => import("./pages/Alerts"));
const CounselorDashboard = lazy(() => import("./pages/CounselorDashboard"));
const TrainerDashboard = lazy(() => import("./pages/TrainerDashboard"));
const Settings = lazy(() => import("./pages/Settings"));

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

export const router = createBrowserRouter([
  {
    path: "/",
    element: <LazyRoute><LandingPage /></LazyRoute>,
  },
  {
    path: "/login",
    element: <LazyRoute><Login /></LazyRoute>,
  },

  {
    path: "/dashboard",
    Component: DashboardLayout,
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