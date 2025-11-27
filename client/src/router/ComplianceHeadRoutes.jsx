import TrackingLayout from "../layout/TrackingLayout";
import MonitoringLayout from "../layout/MonitoringLayout";

// Admin Routes
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminAnnouncement from "../pages/admin/AdminAnnouncement";
import AdminAgentRequest from "../pages/admin/AdminAgentRequest";
import AdminOffences from "../pages/admin/AdminOffences";

// Shared Routes
import SharedAttendance from "../pages/shared/SharedAttendance";
import SharedTrackingLists from "../pages/shared/SharedTrackingLists";
import SharedTrackingHistory from "../pages/shared/SharedTrackingHistory";
import SharedSchedule from "../pages/shared/SharedSchedule";
import SharedViewSchedule from "../pages/shared/SharedViewSchedule";

// Others
import { Navigate } from "react-router-dom";
import Roles from "../constants/roles";

import SharedSettings from "../pages/shared/SharedSettings";
import SharedTeamViewMembers from "../pages/shared/SharedTeamViewMembers";
import AdminAccountManagement from "../pages/admin/AdminAccountManagement";
import SharedTicket from "../pages/shared/SharedTicket";
import SharedTicketList from "../pages/shared/SharedTicketList";
import SharedTicketAnalytics from "../pages/shared/SharedTicketAnalytics";
import TicketLayout from "../layout/TicketLayout";
import TeamLeaderOffenses from "../pages/team-leader/TeamLeaderOffenses";
import TeamLeaderCreateOffenses from "../pages/team-leader/TeamLeaderCreateOffense";
import HRReportedOffenses from "../pages/hr/HRReportedOffenses";

const COMPLIANCE_HEAD_ROUTES = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <AdminDashboard /> },
  { path: "attendance", element: <SharedAttendance /> },
  { path: "ticket", element: <SharedTicket /> },
  {
    path: "tracking",
    element: <TrackingLayout role={Roles.COMPLIANCE} />,
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
    element: <SharedSchedule role={Roles.COMPLIANCE} />,
  },
  {
    path: "schedule/:id",
    element: <SharedViewSchedule role={Roles.COMPLIANCE} readOnly={false} />,
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
  { path: "account-settings", element: <SharedSettings /> },
  {
    path: "offenses",
    element: <TeamLeaderOffenses />,
  },
  {
    path: "createoffense",
    element: <TeamLeaderCreateOffenses />,
  },
  {
    path: "ticket",
    element: <TicketLayout role={Roles.COMPLIANCE} />,
    children: [
      { path: "list", element: <SharedTicketList /> },
      { path: "analytics", element: <SharedTicketAnalytics /> },
    ],
  },
];

export default COMPLIANCE_HEAD_ROUTES;
