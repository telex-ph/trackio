import App from "../App";
import AppLayout from "../layout/AppLayout";

// Routes Protection
import TeamLeaderProtectedRoutes from "./TeamLeaderProtectedRoutes";
import AgentProtectedRoute from "./AgentProtectedRoute";

// Agent Routes
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentAttendance from "../pages/agent/AgentAttendance";
import AgentCoaching from "../pages/agent/AgentCoaching";

// Team Leader Routes
import TeamLeaderDashboard from "../pages/team-leader/TeamLeaderDashboard";
import TeamLeaderBasicLogs from "../pages/team-leader/TeamLeaderBasicLogs";
import TeamLeaderLate from "../pages/team-leader/TeamLeaderLate";
import TeamLeaderOvertime from "../pages/team-leader/TeamLeaderOvertime";
import TeamLeaderUndertime from "../pages/team-leader/TeamLeaderUndertime";
import TeamLeaderSchedule from "../pages/team-leader/TeamLeaderSchedule";
import TeamLeaderPerformance from "../pages/team-leader/TeamLeaderPerformance";

// Global Routes
import NotFound from "../pages/global/NotFound";
import Login from "../pages/global/Login";
import Unauthorized from "../pages/global/Unauthorized";

import { createBrowserRouter, Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // Team Leader Routes
          {
            element: <TeamLeaderProtectedRoutes />,
            path: "team-leader",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <TeamLeaderDashboard /> },
              {
                path: "attendance",
                children: [
                  {
                    index: true,
                    element: <Navigate to="basic-logs" replace />,
                  },
                  { path: "basic-logs", element: <TeamLeaderBasicLogs /> },
                  { path: "late", element: <TeamLeaderLate /> },
                  { path: "overtime", element: <TeamLeaderOvertime /> },
                  { path: "undertime", element: <TeamLeaderUndertime /> },
                ],
              },
              { path: "schedule", element: <TeamLeaderSchedule /> },
              { path: "performance", element: <TeamLeaderPerformance /> },
            ],
          },
          // Agent Routes
          {
            element: <AgentProtectedRoute />,
            path: "agent",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <AgentDashboard /> },
              { path: "attendance", element: <AgentAttendance /> },
              { path: "coaching", element: <AgentCoaching /> },
            ],
          },
        ],
      },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
