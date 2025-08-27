import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  // TODO: uncomment if using cookiess
  withCredentials: true,
});

// TODO: Implement later
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log(error.response);
    const code = error.response?.data?.code;

    if (code === "ACCESS_TOKEN_EXPIRED") {
      try {
        await api.post("/auth/create-new-token");
        return api(error.config);
      } catch (refreshError) {
        console.error("Refresh token failed:", refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
