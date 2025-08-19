import App from "../App";
import MainLayout from "../layout/MainLayout";
import Dashboard from "../pages/Dashboard";
import Tracking from "../pages/Tracking";
import { createBrowserRouter, Navigate } from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true, // when path === "/"
        element: <Navigate to="dashboard" replace />, // redirect
      },
      { path: "dashboard", element: <Dashboard /> },
      { path: "tracking", element: <Tracking /> },
    ],
  },
]);

export default router;
