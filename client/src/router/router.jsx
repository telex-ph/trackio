import App from "../App";
import AppLayout from "../layout/AppLayout";

// Global Routes
import NotFound from "../pages/global/NotFound";
import Login from "../pages/global/Login";
import Unauthorized from "../pages/global/Unauthorized";
import ForgotPassword from "../pages/global/ForgotPassword";

// Others
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoutes from "./ProtectedRoutes";
import Roles from "../constants/roles";
import ResetPassword from "../pages/global/ResetPassword";
import LiveMonitoring from "../pages/global/LiveMonitoring";
import AGENT_ROUTES from "./AgentRoutes";
import TEAM_LEADER_ROUTES from "./TeamLeaderRoutes";
import HR_ROUTES from "./HRRoutes";
import OM_ROUTES from "./OMRoutes";
import ADMIN_HR_HEAD_ROUTES from "./AdminHRHeadRoutes";
import ADMIN_ROUTES from "./AdminRoutes";
import COMPLIANCE_ROUTES from "./ComplianceRoutes";
import COMPLIANCE_HEAD_ROUTES from "./ComplianceHeadRoutes";
import PRESIDENT_ROUTES from "./PresidentRoutes";

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
          // Compliance Routes
          {
            element: <ProtectedRoutes role={Roles.PRESIDENT} />,
            path: "president",
            children: PRESIDENT_ROUTES,
          },
          // Compliance Routes
          {
            element: <ProtectedRoutes role={Roles.COMPLIANCE_HEAD} />,
            path: "compliance-head",
            children: COMPLIANCE_HEAD_ROUTES,
          },
          {
            element: <ProtectedRoutes role={Roles.COMPLIANCE} />,
            path: "compliance",
            children: COMPLIANCE_ROUTES,
          },
          // Admin Routes
          {
            element: <ProtectedRoutes role={Roles.ADMIN} />,
            path: "admin",
            children: ADMIN_ROUTES,
          },

          // Admin and HR Head Routes
          {
            element: <ProtectedRoutes role={Roles.ADMIN_HR_HEAD} />,
            path: "admin-hr-head",
            children: ADMIN_HR_HEAD_ROUTES,
          },

          // Operation Manager Routes
          {
            element: <ProtectedRoutes role={Roles.OM} />,
            path: "operations-manager",
            children: OM_ROUTES,
          },

          // HR Routes
          {
            element: <ProtectedRoutes role={Roles.HR} />,
            path: "human-resources",
            children: HR_ROUTES,
          },

          // Team Leader Routes
          {
            element: <ProtectedRoutes role={Roles.TEAM_LEADER} />,
            path: "team-leader",
            children: TEAM_LEADER_ROUTES,
          },

          // Agent Routes
          {
            element: <ProtectedRoutes role={Roles.AGENT} />,
            path: "agent",
            children: AGENT_ROUTES,
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
