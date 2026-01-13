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
import SharedSettings from "../pages/shared/SharedSettings";
import SharedTeamViewMembers from "../pages/shared/SharedTeamViewMembers";
import SharedTicket from "../pages/shared/SharedTicket";
import TeamLeaderOffenses from "../pages/team-leader/TeamLeaderOffenses";
import TeamLeaderCreateOffenses from "../pages/team-leader/TeamLeaderCreateOffense";
import SharedCourse from "../pages/shared/SharedCourse";

// Others
import { Navigate } from "react-router-dom";
import Roles from "../constants/roles";
import SharedCreateApplyLeave from "../pages/shared/SharedCreateApplyLeave";
import SharedMyTeamLeave from "../pages/shared/SharedMyTeamLeave";

const OM_ROUTES = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <OMDashboard /> },
  { path: "attendance", element: <SharedAttendance /> },
  { path: "schedule", element: <SharedSchedule role={Roles.OM} /> },
  {
    path: "schedule/:id",
    element: <SharedViewSchedule role={Roles.OM} readOnly={false} />,
  },
  { path: "ticket", element: <SharedTicket /> },
  {
    path: "team",
    element: <SharedTeamViewMembers />,
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
    path: "offenses",
    element: <TeamLeaderOffenses />,
  },
  {
    path: "createoffense",
    element: <TeamLeaderCreateOffenses />,
  },
    {
    path: "apply-leave",
    element: <SharedCreateApplyLeave />,
  },
  {
    path: "my-team-requests",
    element: <SharedMyTeamLeave />,
  },
  {
    path: "courses",
    element: <SharedCourse />,
  },
  {
    path: "monitoring",
    element: <MonitoringLayout />,
  },
  { path: "account-settings", element: <SharedSettings /> },
];

export default OM_ROUTES;
