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

// Human Resources
import HROffenses from "../pages/hr/HROffenses";
import HRReportedOffenses from "../pages/hr/HRReportedOffenses";

import SharedSettings from "../pages/shared/SharedSettings";
import AdminAccountManagement from "../pages/admin/AdminAccountManagement";
import SharedTicket from "../pages/shared/SharedTicket";

const COMPLIANCE_ROUTES = [
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
];

export default COMPLIANCE_ROUTES;
