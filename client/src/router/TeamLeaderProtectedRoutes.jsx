import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useStore } from "../store/useStore";
import Roles from "../enum/roles.enum";

const TeamLeaderProtectedRoutes = () => {
  const user = useStore((state) => state.user);

  switch (user.role) {
    case Roles.TEAM_LEADER:
      return <Outlet />;
    default:
      return <Navigate to={"/unauthorized"} replace />;
  }
};

export default TeamLeaderProtectedRoutes;
