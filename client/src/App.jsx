import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

function App() {
  const { isLoading, user } = useAuth();

  if (isLoading) {
    return <p>Load...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default App;
