import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Add request interceptor to include Authorization header for iOS
api.interceptors.request.use(
  (config) => {
    // Check if iOS device
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Get token from localStorage for iOS
      const token = localStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("iOS: Added Authorization header to request");
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const code = error.response?.data?.code;
    const originalRequest = error.config;

    // Prevent infinite loops: don't refresh token on login page
    if (window.location.pathname === "/login" || window.location.pathname === "/") {
      return Promise.reject(error);
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if (code === "ACCESS_TOKEN_EXPIRED" || (error.response?.status === 401 && !originalRequest._retry)) {
      originalRequest._retry = true;
      
      if (isIOS) {
        // Handle token refresh for iOS
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          try {
            console.log("iOS: Attempting token refresh");
            const refreshResponse = await api.post("/auth/create-new-token", {}, {
              headers: { Authorization: `Bearer ${refreshToken}` }
            });
            
            if (refreshResponse.data.tokens) {
              // Update stored tokens
              localStorage.setItem('accessToken', refreshResponse.data.tokens.accessToken);
              if (refreshResponse.data.tokens.refreshToken) {
                localStorage.setItem('refreshToken', refreshResponse.data.tokens.refreshToken);
              }
              
              // Retry original request with new token
              originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.tokens.accessToken}`;
              return api(originalRequest);
            }
          } catch (refreshError) {
            console.error("iOS: Refresh token failed:", refreshError);
            // Clear iOS tokens and redirect
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            location.replace("/");
          }
        } else {
          console.log("iOS: No refresh token found");
          location.replace("/");
        }
      } else {
        // Handle token refresh for non-iOS (original logic)
        try {
          await api.post("/auth/create-new-token");
          return api(originalRequest);
        } catch (refreshError) {
          console.error("Refresh token failed:", refreshError);
          return Promise.reject(refreshError);
        }
      }
    } else if (code === "REFRESH_TOKEN_EXPIRED") {
      if (isIOS) {
        // Clear iOS tokens
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
      location.replace("/");
    }
    
    return Promise.reject(error);
  }
);

export default api;