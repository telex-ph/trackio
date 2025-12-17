// Agent Routes
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentRecognition from "../pages/agent/AgentRecognition";
import AgentCoaching from "../pages/agent/AgentCoaching";
import AgentOffences from "../pages/agent/AgentOffences";
import AgentCreateOffenses from "../pages/agent/AgentCreateOffenses";
import SharedAttendance from "../pages/shared/SharedAttendance";
import SharedSettings from "../pages/shared/SharedSettings";
import SharedTicket from "../pages/shared/SharedTicket";
import { Navigate } from "react-router-dom";
import SharedCourse from "../pages/shared/SharedCourse";

const TRAINER_QUALITY_ASSURANCE_ROUTES = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <AgentDashboard /> },
  { path: "recognition", element: <AgentRecognition /> },
  {
    path: "attendance",
    element: <SharedAttendance readOnly={true} />,
  },
  { path: "coaching", element: <AgentCoaching /> },
  { path: "offenses", element: <AgentOffences /> },

  { path: "ticket", element: <SharedTicket /> },
  { path: "courses", element: <SharedCourse /> },
  { path: "account-settings", element: <SharedSettings /> },

  { path: "createoffense", element: <AgentCreateOffenses /> },
];

export default TRAINER_QUALITY_ASSURANCE_ROUTES;
