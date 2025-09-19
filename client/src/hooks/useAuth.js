import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (data) => {
    try {
      const response = await api.post("/auth/log-in", data);
      const user = response.data;
      if (user) {
        const loginResponse = await api.post("/auth/create-token", user);
        if (loginResponse.status === 200) {
          navigate(`/${user.role}/dashboard`);
        }
      }
    } catch (error) {
      setError({
        message: error.response?.data
          ? "Oops! We couldn't log you in. Please check your email and password."
          : error.message,
        hasError: true,
      });
      console.error("Error: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const generateNewAccessToken = async () => {
      try {
        await api.post("/auth/create-new-token");
        return true;
      } catch (error) {
        setUser(null);
        // console.error("Error: ", error);
        return false;
      }
    };

    const fetchAuthUser = async () => {
      try {
        const response = await api.get("/auth/get-auth-user");
        setUser(response.data);
      } catch (error) {
        const code = error?.response?.data?.code;
        // If status is 403, the client will request a new access token to the server
        if (code === "ACCESS_TOKEN_EXPIRED") {
          const refreshed = await generateNewAccessToken();
          if (refreshed) {
            await fetchAuthUser();
          } else {
            setUser(null);
          }
        }
        // console.error("Error: ", error.response);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuthUser();
  }, []);

  return { user, login, isLoading, error };
};
