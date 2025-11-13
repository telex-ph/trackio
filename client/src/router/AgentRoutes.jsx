// Agent Routes
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentCoaching from "../pages/agent/AgentCoaching";
import AgentOffences from "../pages/agent/AgentOffences";
import AgentCreateOffenses from "../pages/agent/AgentCreateOffenses";
import SharedAttendance from "../pages/shared/SharedAttendance";
import SharedSettings from "../pages/shared/SharedSettings";
import SharedTicket from "../pages/shared/SharedTicket";
import { Navigate } from "react-router-dom";

const AGENT_ROUTES = [
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
];

export default AGENT_ROUTES;
