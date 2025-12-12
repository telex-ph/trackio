// Agent Routes
import AgentDashboard from "../pages/agent/AgentDashboard";
import AgentRecognition from "../pages/agent/AgentRecognition";
import AgentCoaching from "../pages/agent/AgentCoaching";
import AgentOffences from "../pages/agent/AgentOffences";
import AgentCreateOffenses from "../pages/agent/AgentCreateOffenses";
import SharedAttendance from "../pages/shared/SharedAttendance";
import SharedSettings from "../pages/shared/SharedSettings";
import SharedTicket from "../pages/shared/SharedTicket";
// import AgentCourses from "../pages/agent/AgentCourses";
import { Navigate } from "react-router-dom";
import SharedCreateApplyLeave from "../pages/shared/SharedCreateApplyLeave";
import SharedCourse from "../pages/shared/SharedCourse";

const AGENT_ROUTES = [
  { index: true, element: <Navigate to="dashboard" replace /> },
  { path: "dashboard", element: <AgentDashboard /> },
  { path: "recognition", element: <AgentRecognition /> },
  {
    path: "attendance",
    element: <SharedAttendance readOnly={true} />,
  },
  { path: "coaching", element: <AgentCoaching /> },
  { path: "offenses", element: <AgentOffences /> },

  {
    path: "course",
    element: <SharedCourse />,
  },
  { path: "ticket", element: <SharedTicket /> },
  { path: "account-settings", element: <SharedSettings /> },

  { path: "createoffense", element: <AgentCreateOffenses /> },

  { path: "apply-leave", element: <SharedCreateApplyLeave /> },
  // { path: "courses", element: <AgentCourses /> },
];

export default AGENT_ROUTES;
