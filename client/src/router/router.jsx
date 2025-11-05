import App from "../App";
import AppLayout from "../layout/AppLayout";
import TrackingLayout from "../layout/TrackingLayout";
import MonitoringLayout from "../layout/MonitoringLayout";

// Agent Routes
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentCoaching from "../pages/agent/AgentCoaching";
import AgentAccountSettings from "../pages/agent/AgentAccountSettings";
import AgentRequest from "../pages/agent/AgentRequest";
import AgentOffences from "../pages/agent/AgentOffences";
import AgentCreateOffenses from "../pages/agent/AgentCreateOffenses";

// Team Leader Routes
import TeamLeaderDashboard from "../pages/team-leader/TeamLeaderDashboard";
import TeamLeaderPerformance from "../pages/team-leader/TeamLeaderPerformance";
import TeamLeaderBioBreak from "../pages/team-leader/TeamLeaderBioBreak";
import TeamLeaderCoaching from "../pages/team-leader/TeamLeaderCoaching";
import TeamLeaderAgentRequest from "../pages/team-leader/TeamLeaderAgentRequest";
import TeamLeaderAccountSettings from "../pages/team-leader/TeamLeaderAccountSettings";
import TeamLeaderCreateOffense from "../pages/team-leader/TeamLeaderCreateOffense";
import TeamLeaderOffenses from "../pages/team-leader/TeamLeaderOffenses";
// -------------------

// Operation Manager Routes
import OMDashboard from "../pages/om/OMDashboard";

// Admin Routes
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminSchedule from "../pages/admin/AdminSchedule";
import AdminAnnouncement from "../pages/admin/AdminAnnouncement";
import AdminAccountSettings from "../pages/admin/AdminAccountSettings";
import AdminAgentRequest from "../pages/admin/AdminAgentRequest";
import AdminOffences from "../pages/admin/AdminOffences";

// Shared Routes
import SharedAttendance from "../pages/shared/SharedAttendance";
import SharedTrackingLists from "../pages/shared/SharedTrackingLists";
import SharedTrackingHistory from "../pages/shared/SharedTrackingHistory";
import SharedSchedule from "../pages/shared/SharedSchedule";
import SharedViewSchedule from "../pages/shared/SharedViewSchedule";

// Global Routes
import NotFound from "../pages/global/NotFound";
import Login from "../pages/global/Login";
import Unauthorized from "../pages/global/Unauthorized";
import ForgotPassword from "../pages/global/ForgotPassword";

// Others
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import Roles from "../constants/roles";

// Human Resources
import HROffenses from "../pages/hr/HROffenses";
import HRReportedOffenses from "../pages/hr/HRReportedOffenses";

// TODO: After unit test remove this routes including the files ---
import OMSchedule from "../pages/om/OMSchedule";
import OMViewSchedule from "../pages/om/OMViewSchedule";

import TeamLeaderSchedule from "../pages/team-leader/TeamLeaderSchedule";

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
import SharedSettings from "../pages/shared/SharedSettings";
import ResetPassword from "../pages/global/ResetPassword";
import SharedTeamManagement from "../pages/shared/SharedTeamManagement";
import SharedTeamViewMembers from "../pages/shared/SharedTeamViewMembers";
import AdminAccountManagement from "../pages/admin/AdminAccountManagement";
import LiveMonitoring from "../pages/global/LiveMonitoring";
import SharedTicket from "../pages/shared/SharedTicket";
// TODO: After unit test remove this routes including the files ---

const router = createBrowserRouter([
  // Public Routes
  { path: "login", element: <Login /> },
  { path: "forgot-password", element: <ForgotPassword /> },
  { path: "reset-password", element: <ResetPassword /> },
  { path: "live-monitoring", element: <LiveMonitoring /> },

  // Protected App Routes
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Navigate to="login" replace /> },
      {
        element: <AppLayout />,
        children: [
          // Admin Routes
          {
            element: <ProtectedRoutes role={Roles.ADMIN} />,
            path: "admin",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <AdminDashboard /> },
              { path: "attendance", element: <SharedAttendance /> },
              {
                path: "tracking",
                element: <TrackingLayout role={Roles.ADMIN} />,
                children: [
                  { path: "list", element: <SharedTrackingLists /> },
                  { path: "history", element: <SharedTrackingHistory /> },
                ],
              },
              {
                path: "monitoring",
                element: <MonitoringLayout />,
              },
              {
                path: "schedule",
                element: <SharedSchedule role={Roles.ADMIN} />,
              },
              {
                path: "schedule/:id",
                element: (
                  <SharedViewSchedule role={Roles.ADMIN} readOnly={true} />
                ),
              },
              { path: "announcement", element: <AdminAnnouncement /> },
              { path: "agentrequest", element: <AdminAgentRequest /> },
              { path: "offences", element: <AdminOffences /> },
              {
                path: "account-management",
                element: <AdminAccountManagement />,
              },
              { path: "account-settings", element: <SharedSettings /> },
              {
                path: "offenses",
                element: <HROffenses />,
              },
              {
                path: "createoffense",
                element: <HRReportedOffenses />,
              },
            ],
          },

          // Operation Manager Routes
          {
            element: <ProtectedRoutes role={Roles.OM} />,
            path: "operation-manager",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <OMDashboard /> },
              { path: "attendance", element: <SharedAttendance /> },
              { path: "schedule", element: <SharedSchedule role={Roles.OM} /> },
              {
                path: "schedule/:id",
                element: <SharedViewSchedule role={Roles.OM} />,
              },
              {
                path: "tracking",
                element: <TrackingLayout role={Roles.OM} />,
                children: [
                  { path: "list", element: <SharedTrackingLists /> },
                  { path: "history", element: <SharedTrackingHistory /> },
                ],
              },
              {
                path: "monitoring",
                element: <MonitoringLayout />,
              },
              { path: "account-settings", element: <SharedSettings /> },
            ],
          },

          // HR Routes
          {
            element: <ProtectedRoutes role={Roles.HR} />,
            path: "human-resources",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <OMDashboard /> },
              { path: "attendance", element: <SharedAttendance /> },
              { path: "schedule", element: <SharedSchedule role={Roles.HR} /> },
              {
                path: "schedule/:id",
                element: <SharedViewSchedule role={Roles.HR} />,
              },
              {
                path: "tracking",
                element: <TrackingLayout role={Roles.HR} />,
                children: [
                  { path: "list", element: <SharedTrackingLists /> },
                  { path: "history", element: <SharedTrackingHistory /> },
                ],
              },
              {
                path: "monitoring",
                element: <MonitoringLayout />,
              },
              {
                path: "offenses",
                element: <HROffenses />,
              },
              {
                path: "reported-ir",
                element: <HRReportedOffenses />,
              },
              { path: "account-settings", element: <SharedSettings /> },
            ],
          },

          // Team Leader Routes
          {
            element: <ProtectedRoutes role={Roles.TEAM_LEADER} />,
            path: "team-leader",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <TeamLeaderDashboard /> },
              {
                path: "attendance",
                element: <SharedAttendance readOnly={true} />,
              },
              {
                path: "tracking",
                element: <TrackingLayout role={Roles.TEAM_LEADER} />,
                children: [
                  { path: "list", element: <SharedTrackingLists /> },
                  { path: "history", element: <SharedTrackingHistory /> },
                ],
              },
              {
                path: "monitoring",
                element: <MonitoringLayout />,
              },
              {
                path: "team",
                element: <SharedTeamViewMembers />,
              },
              {
                path: "schedule",
                element: <SharedSchedule role={Roles.TEAM_LEADER} />,
              },
              {
                path: "schedule/:id",
                element: (
                  <SharedViewSchedule
                    role={Roles.TEAM_LEADER}
                    readOnly={false}
                  />
                ),
              },
              { path: "performance", element: <TeamLeaderPerformance /> },
              // { path: "bio-break", element: <TeamLeaderBioBreak /> },
              { path: "coaching", element: <TeamLeaderCoaching /> },
              { path: "agentrequest", element: <TeamLeaderAgentRequest /> },
              { path: "ticket", element: <SharedTicket /> },
              { path: "account-settings", element: <SharedSettings /> },
              {
                path: "offenses",
                element: <TeamLeaderOffenses />,
              },
              {
                path: "createoffense",
                element: <TeamLeaderCreateOffense />,
              },
              // ------------------------------------
            ],
          },

          // Agent Routes
          {
            element: <ProtectedRoutes role={Roles.AGENT} />,
            path: "agent",
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <AgentDashboard /> },
              {
                path: "attendance",
                element: <SharedAttendance readOnly={true} />,
              },
              { path: "coaching", element: <AgentCoaching /> }, 
              { path: "offenses", element: <AgentOffences /> },

              { path: "ticket", element: <SharedTicket /> },
              { path: "account-settings", element: <SharedSettings /> },

              { path: "createoffense", element: <AgentCreateOffenses /> },
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
