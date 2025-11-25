import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 20000,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const code = error.response?.data?.code;

    // Prevent infinite loops: don't refresh token on login page
    if (window.location.pathname === "/login") {
      return Promise.reject(error);
    }

    if (code === "ACCESS_TOKEN_EXPIRED") {
      try {
        await api.post("/auth/create-new-token");
        return api(error.config);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        return Promise.reject(refreshError);
      }
    } else if (code === "REFRESH_TOKEN_EXPIRED") {
      location.replace("/login");
    }
    return Promise.reject(error);
  }
);

export default api;
