import { Navigate, Outlet } from "react-router-dom";
import Roles from "../enum/roles.enum";
import { useAuth } from "../hooks/useAuth";

const AgentProtectedRoute = () => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  switch (user.role) {
    case Roles.AGENT:
      return <Outlet />;
    default:
      return <Navigate to={"/unauthorized"} replace />;
  }
};

export default AgentProtectedRoute;
