import TrackingLayout from "../layout/TrackingLayout";
import MonitoringLayout from "../layout/MonitoringLayout";
// Team Leader Routes
import TeamLeaderDashboard from "../pages/team-leader/TeamLeaderDashboard";
import TeamLeaderPerformance from "../pages/team-leader/TeamLeaderPerformance";
import TeamLeaderCoaching from "../pages/team-leader/TeamLeaderCoaching";
import TeamLeaderAgentRequest from "../pages/team-leader/TeamLeaderAgentRequest";
import TeamLeaderCreateOffense from "../pages/team-leader/TeamLeaderCreateOffense";
import TeamLeaderOffenses from "../pages/team-leader/TeamLeaderOffenses";

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
import SharedTicket from "../pages/shared/SharedTicket";

const OPERATIONS_ASSOCIATE_ROUTES = [
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
    path: "schedule",
    element: <SharedSchedule role={Roles.TEAM_LEADER} />,
  },
  {
    path: "schedule/:id",
    element: <SharedViewSchedule role={Roles.TEAM_LEADER} readOnly={false} />,
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
];

export default OPERATIONS_ASSOCIATE_ROUTES;
