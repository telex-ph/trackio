import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useStore } from "./store/useStore";
import { useEffect } from "react";

function App() {
  const { isLoading, user } = useAuth();
  // Will store the user to zustand
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    if (user) setUser(user);
  }, [user]);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default App;
