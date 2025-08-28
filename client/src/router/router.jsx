import App from "../App";
import AppLayout from "../layout/AppLayout";
import BasicLogs from "../pages/BasicLogs";
import Dashboard from "../pages/Dashboard";
import Late from "../pages/Late";
import Login from "../pages/Login";
import Overtime from "../pages/Overtime";
import Performance from "../pages/Performance";
import Schedule from "../pages/Schedule";
import Tracking from "../pages/Tracking";
import Undertime from "../pages/Undertime";
import { createBrowserRouter, Navigate } from "react-router-dom";

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
        path: "/",
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="dashboard" replace /> },
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "attendance",
            children: [
              { index: true, element: <Navigate to="basic-logs" replace /> },
              { path: "basic-logs", element: <BasicLogs /> },
              { path: "late", element: <Late /> },
              { path: "overtime", element: <Overtime /> },
              { path: "undertime", element: <Undertime /> },
            ],
          },
          { path: "schedule", element: <Schedule /> },
          { path: "performance", element: <Performance /> },
        ],
      },
    ],
  },
]);

export default router;
