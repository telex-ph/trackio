import App from "../App";
import AppLayout from "../layout/AppLayout";
import TeamLeaderDashboard from "../pages/team-leader/TeamLeaderDashboard";
import TeamLeaderBasicLogs from "../pages/team-leader/TeamLeaderBasicLogs";
import TeamLeaderLate from "../pages/team-leader/TeamLeaderLate";
import TeamLeaderOvertime from "../pages/team-leader/TeamLeaderOvertime";
import TeamLeaderUndertime from "../pages/team-leader/TeamLeaderUndertime";
import TeamLeaderSchedule from "../pages/team-leader/TeamLeaderSchedule";
import TeamLeaderPerformance from "../pages/team-leader/TeamLeaderPerformance";

import TeamLeaderProtectedRoutes from "./TeamLeaderProtectedRoutes";

import { createBrowserRouter, Navigate } from "react-router-dom";
import NotFound from "../pages/global/NotFound";
import Login from "../pages/global/Login";
import Unauthorized from "../pages/global/Unauthorized";

const router = createBrowserRouter([
  {
    path: "login",
    element: <Login />,
  },
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <AppLayout />,
        children: [
          {
            element: <TeamLeaderProtectedRoutes />,
            children: [
              { index: true, element: <Navigate to="dashboard" replace /> },
              { path: "dashboard", element: <TeamLeaderDashboard /> },
              {
                path: "attendance",
                children: [
                  {
                    index: true,
                    element: <Navigate to="basic-logs" replace />,
                  },
                  { path: "basic-logs", element: <TeamLeaderBasicLogs /> },
                  { path: "late", element: <TeamLeaderLate /> },
                  { path: "overtime", element: <TeamLeaderOvertime /> },
                  { path: "undertime", element: <TeamLeaderUndertime /> },
                ],
              },
              { path: "schedule", element: <TeamLeaderSchedule /> },
              { path: "performance", element: <TeamLeaderPerformance /> },
            ],
          },
        ],
      },
      { path: "/unauthorized", element: <Unauthorized /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
