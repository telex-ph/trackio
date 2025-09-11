import { Navigate, Outlet } from "react-router-dom";
import Roles from "../constants/roles";
import { useAuth } from "../hooks/useAuth";

const TeamLeaderProtectedRoutes = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  switch (user.role) {
    case Roles.TEAM_LEADER:
      return <Outlet />;
    default:
      return <Navigate to={"/unauthorized"} replace />;
  }
};

export default TeamLeaderProtectedRoutes;
