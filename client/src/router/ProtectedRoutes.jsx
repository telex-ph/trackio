import { Navigate, Outlet } from "react-router-dom";
import Roles from "../constants/roles";
import { useAuth } from "../hooks/useAuth";

const ProtectedRoutes = ({ role }) => {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <p>Loading...</p>;
  }

  switch (user.role) {
    case role:
      return <Outlet />;
    default:
      return <Navigate to={"/unauthorized"} replace />;
  }
};

export default ProtectedRoutes;
