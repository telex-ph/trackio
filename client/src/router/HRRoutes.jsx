import TrackingLayout from "../layout/TrackingLayout";
import MonitoringLayout from "../layout/MonitoringLayout";

// Operation Manager Routes
import OMDashboard from "../pages/om/OMDashboard";

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
import HROffenses from "../pages/hr/HROffense";
import HRReportedOffenses from "../pages/hr/HRReportedOffenses";
import SharedSettings from "../pages/shared/SharedSettings";
import SharedTeamViewMembers from "../pages/shared/SharedTeamViewMembers";
import SharedTicket from "../pages/shared/SharedTicket";
import TeamLeaderOffenses from "../pages/team-leader/TeamLeaderOffenses";

const HR_ROUTES = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <OMDashboard /> },
  { path: "attendance", element: <SharedAttendance /> },
  { path: "schedule", element: <SharedSchedule role={Roles.HR} /> },
  {
    path: "schedule/:id",
    element: <SharedViewSchedule role={Roles.HR} />,
  },
  { path: "ticket", element: <SharedTicket /> },
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
    path: "team",
    element: <SharedTeamViewMembers />,
  },
  {
    path: "createoffense",
    element: <HROffenses />,
  },
  {
    path: "offenses",
    element: <TeamLeaderOffenses />,
  },
  {
    path: "reported-ir",
    element: <HRReportedOffenses />,
  },
  { path: "account-settings", element: <SharedSettings /> },
];

export default HR_ROUTES;
