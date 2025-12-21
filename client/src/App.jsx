import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { useStore } from "./store/useStore";
import { useEffect } from "react";
import Spinner from "./assets/loaders/Spinner";

function App() {
  const { isLoading, user } = useAuth();
  const setUser = useStore((state) => state.setUser);

  useEffect(() => {
    if (user) setUser(user);
  }, [user, setUser]);

  if (isLoading) {
    return (
      <div className="w-full h-screen grid place-items-center">
        <div className="flex flex-col gap-3">
          <Spinner size={30} />
          <p className="text-light">We're loading the page. Please wait.</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}

export default App;
