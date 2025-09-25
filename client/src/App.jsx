import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useStore } from "./store/useStore";
import { useEffect } from "react";

function App() {
  const { isLoading, user } = useAuth();
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div>
        <p>Loading...</p>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default App;
