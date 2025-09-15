import App from "../App";
import AppLayout from "../layout/AppLayout";

// Routes Protection
import TeamLeaderProtectedRoutes from "./TeamLeaderProtectedRoutes";
import AgentProtectedRoute from "./AgentProtectedRoute";
import AdminProtectedRoute from "./AdminProtectedRoutes";

// Agent Routes
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentAttendance from "../pages/agent/AgentAttendance";
import AgentCoaching from "../pages/agent/AgentCoaching";
import AgentAccountSettings from "../pages/agent/AgentAccountSettings";
import AgentRequest from "../pages/agent/AgentRequest";

// Team Leader Routes
import TeamLeaderDashboard from "../pages/team-leader/TeamLeaderDashboard";
import TeamLeaderBasicLogs from "../pages/team-leader/TeamLeaderBasicLogs";
import TeamLeaderLate from "../pages/team-leader/TeamLeaderLate";
import TeamLeaderOvertime from "../pages/team-leader/TeamLeaderOvertime";
import TeamLeaderUndertime from "../pages/team-leader/TeamLeaderUndertime";
import TeamLeaderSchedule from "../pages/team-leader/TeamLeaderSchedule";
import TeamLeaderPerformance from "../pages/team-leader/TeamLeaderPerformance";
import TeamLeaderBioBreak from "../pages/team-leader/TeamLeaderBioBreak";
import TeamLeaderCoaching from "../pages/team-leader/TeamLeaderCoaching";
import TeamLeaderAnnouncement from "../pages/team-leader/TeamLeaderAnnouncement";
import TeamLeaderAccountSettings from "../pages/team-leader/TeamLeaderAccountSettings";

// Admin Routes
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminTimeIn from "../pages/admin/AdminTimeIn";
import AdminTimeOut from "../pages/admin/AdminTimeOut";
import AdminAbsentees from "../pages/admin/AdminAbsentees";
import AdminStatus from "../pages/admin/AdminStatus";
import AdminLate from "../pages/admin/AdminLate";
import AdminOnBreak from "../pages/admin/AdminOnBreak";
import AdminOnLunch from "../pages/admin/AdminOnLunch";
import AdminUndertime from "../pages/admin/AdminUndertime";
import AdminBioBreak from "../pages/admin/AdminBioBreak";
import AdminMeeting from "../pages/admin/AdminMeeting";
import AdminHistory from "../pages/admin/AdminHistory";
import AdminSchedule from "../pages/admin/AdminSchedule";
import AdminAnnouncement from "../pages/admin/AdminAnnouncement";
import AdminAccountSettings from "../pages/admin/AdminAccountSettings";

// Global Routes
import NotFound from "../pages/global/NotFound";
import Login from "../pages/global/Login";
import Unauthorized from "../pages/global/Unauthorized";
import ForgotPassword from "../pages/global/ForgotPassword";

import { createBrowserRouter, Navigate } from "react-router-dom";

const router = createBrowserRouter([
  // Public Routes
  { path: "login", element: <Login /> },
  { path: "forgot-password", element: <ForgotPassword /> },

  // Protected App Routes
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      {
        element: <AppLayout />,
        children: [
          {
            element: <AdminProtectedRoute />,
            path: "admin",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <AdminDashboard /> },
              {
                path: "tracking",
                children: [
                  { index: true, element: <Navigate to="time-in" replace /> },
                  { path: "time-in", element: <AdminTimeIn /> },
                  { path: "time-out", element: <AdminTimeOut /> },
                  { path: "late", element: <AdminLate /> },
                  { path: "undertime", element: <AdminUndertime /> },
                  { path: "absentees", element: <AdminAbsentees /> },
                ],
              },
              {
                path: "monitoring",
                children: [
                  { path: "status", element: <AdminStatus /> },
                  { path: "on-break", element: <AdminOnBreak /> },
                  { path: "on-lunch", element: <AdminOnLunch /> },
                  { path: "bio-break", element: <AdminBioBreak /> },
                  { path: "meeting", element: <AdminMeeting /> },
                ],
              },

              { path: "history", element: <AdminHistory /> },
              { path: "schedule", element: <AdminSchedule /> },
              { path: "announcement", element: <AdminAnnouncement /> },
              { path: "account-settings", element: <AdminAccountSettings /> },
            ],
          },

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
              { path: "bio-break", element: <TeamLeaderBioBreak /> },
              { path: "coaching", element: <TeamLeaderCoaching /> },
              { path: "announcement", element: <TeamLeaderAnnouncement /> },
              {
                path: "account-settings",
                element: <TeamLeaderAccountSettings />,
              },
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
              { path: "request", element: <AgentRequest /> },
              { path: "account-settings", element: <AgentAccountSettings /> },
            ],
          },
        ],
      },

      // Misc Routes
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
