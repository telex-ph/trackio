import { useEffect, useState } from "react";
import api from "../utils/axios";
import { useNavigate } from "react-router-dom";

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

  return { isLoading, user };
};
