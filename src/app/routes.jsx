import { createBrowserRouter } from "react-router";
import { DashboardLayout } from "./components/DashboardLayout";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import LearnerDashboard from "./pages/LearnerDashboard";
import LearningPath from "./pages/LearningPath";
import ProgressTracking from "./pages/ProgressTracking";
import Alerts from "./pages/Alerts";
import CounselorDashboard from "./pages/CounselorDashboard";
import TrainerDashboard from "./pages/TrainerDashboard";
import Settings from "./pages/Settings";
import ProtectedRoute from "./components/ProtectedRoute";
import DemoNavbar from "../components/ui/demo-navbar";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/demo-navbar",
    Component: DemoNavbar,
  },
  {
    path: "/dashboard",
    Component: DashboardLayout,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute allowedRoles={['learner']}>
            <LearnerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "learning-path",
        element: (
          <ProtectedRoute allowedRoles={['learner']}>
            <LearningPath />
          </ProtectedRoute>
        ),
      },
      {
        path: "progress",
        element: (
          <ProtectedRoute allowedRoles={['learner']}>
            <ProgressTracking />
          </ProtectedRoute>
        ),
      },
      {
        path: "alerts",
        element: (
          <ProtectedRoute allowedRoles={['learner', 'counselor', 'trainer']}>
            <Alerts />
          </ProtectedRoute>
        ),
      },
      {
        path: "counselor",
        element: (
          <ProtectedRoute allowedRoles={['counselor']}>
            <CounselorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "trainer",
        element: (
          <ProtectedRoute allowedRoles={['trainer']}>
            <TrainerDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "settings",
        element: (
          <ProtectedRoute allowedRoles={['learner', 'counselor', 'trainer']}>
            <Settings />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);