import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/axios";

export const useAuth = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const bearerToken =
    "Bearer standard_077ed3b9b01c0863d40827030797f5e602b32b89fe2f3f94cc495b475802c16512013466aaf82efa0d966bff7d6cf837d00e0bfdc9e91f4f290e893ba28c4d6330310f6428f7befc9ad39cd5a55f3b3ba09822aed74a922bf1e6ca958b2f844fab5259c0d69318160bb91d4ab2bf2bec0c72f6d94bf0666a59559c3992aa8b47";

  const createAccountTicket = async (name, email) => {
    try {
      const url =
        "https://ticketing-system-2u0k.onrender.com/api/auth/register/trackio";

      const body = {
        name: name,
        email: email,
        password: "password",
        role: "MANAGEMENT",
      };

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: bearerToken,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Account created:", data);
      return data;
    } catch (error) {
      console.error("Error creating account ticket:", error);
    }
  };

  const login = async (data) => {
    try {
      const response = await api.post("/auth/log-in", data);
      // await createAccountTicket(data);
      const user = response.data;
      if (user) {
        const name = `${user.firstName} ${user.lastName}`;
        const email = user.email;
        await createAccountTicket(name, email);
        const loginResponse = await api.post("/auth/create-token", user);
        if (loginResponse.status === 200) {
          navigate(`/${user.role}/dashboard`);
        }
      }
    } catch (error) {
      // Issue a verification code
      if (error.response.data.code === "SESSION_EXPIRED") {
        const pendingToken = error.response.data.pendingToken;
        return navigate(`/verify?token=${pendingToken}`);
      }

      setError({
        message:
          "Oops! We couldn't log you in. Please check your email and password.",
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
