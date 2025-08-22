import App from "../App";
import AppLayout from "../layout/AppLayout";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Tracking from "../pages/Tracking";
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
          { path: "tracking", element: <Tracking /> },
        ],
      },
    ],
  },
]);

export default router;
