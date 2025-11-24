import TrackingLayout from "../layout/TrackingLayout";
import MonitoringLayout from "../layout/MonitoringLayout";

// Admin Routes
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAnnouncement from "../pages/admin/AdminAnnouncement";
import AdminAgentRequest from "../pages/admin/AdminAgentRequest";
import AdminOffences from "../pages/admin/AdminOffences";
import AdminAccountManagement from "../pages/admin/AdminAccountManagement";

// Shared Routes
import SharedAttendance from "../pages/shared/SharedAttendance";
import SharedTrackingLists from "../pages/shared/SharedTrackingLists";
import SharedTrackingHistory from "../pages/shared/SharedTrackingHistory";
import SharedSchedule from "../pages/shared/SharedSchedule";
import SharedViewSchedule from "../pages/shared/SharedViewSchedule";
import SharedSettings from "../pages/shared/SharedSettings";
import SharedTeamViewMembers from "../pages/shared/SharedTeamViewMembers";
import SharedTicket from "../pages/shared/SharedTicket";

// Human Resources
import HROffenses from "../pages/hr/HROffense";
import HRReportedOffenses from "../pages/hr/HRReportedOffenses";

// Team Leader Routes
import TeamLeaderPerformance from "../pages/team-leader/TeamLeaderPerformance";
import TeamLeaderCoaching from "../pages/team-leader/TeamLeaderCoaching";

// Others
import { Navigate } from "react-router-dom";
import Roles from "../constants/roles";
import TicketLayout from "../layout/TicketLayout";
import SharedTicketList from "../pages/shared/SharedTicketList";
import SharedTicketAnalytics from "../pages/shared/SharedTicketAnalytics";

const PRESIDENT_ROUTES = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "attendance", element: <SharedAttendance /> },

  {
    path: "tracking",
    element: <TrackingLayout role={Roles.PRESIDENT} />,
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
    element: <SharedSchedule role={Roles.PRESIDENT} />,
  },
  {
    path: "schedule/:id",
    element: <SharedViewSchedule role={Roles.PRESIDENT} readOnly={false} />,
  },
  { path: "announcement", element: <AdminAnnouncement /> },
  { path: "agentrequest", element: <AdminAgentRequest /> },
  { path: "offences", element: <AdminOffences /> },
  {
    path: "team",
    element: <SharedTeamViewMembers />,
  },
  {
    path: "account-management",
    element: <AdminAccountManagement />,
  },
  { path: "performance", element: <TeamLeaderPerformance /> },
  { path: "coaching", element: <TeamLeaderCoaching /> },
  {
    path: "offenses",
    element: <HROffenses />,
  },
  {
    path: "createoffense",
    element: <HRReportedOffenses />,
  },
  {
    path: "ticket",
    element: <TicketLayout role={Roles.PRESIDENT} />,
    children: [
      { path: "list", element: <SharedTicketList /> },
      { path: "analytics", element: <SharedTicketAnalytics /> },
    ],
  },
  {
    path: "reported-ir",
    element: <HRReportedOffenses />,
  },
  { path: "account-settings", element: <SharedSettings /> },
];

export default PRESIDENT_ROUTES;
