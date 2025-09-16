import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  withCredentials: true,
});

// Track if we're currently refreshing token to prevent loops
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

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

    // Prevent infinite loops: don't refresh token on login page or auth endpoints
    const isAuthEndpoint = originalRequest.url?.includes('/auth/');
    if (window.location.pathname === "/login" || 
        window.location.pathname === "/" || 
        isAuthEndpoint) {
      return Promise.reject(error);
    }

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    if ((code === "ACCESS_TOKEN_EXPIRED" || error.response?.status === 401) && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (isIOS) {
        // Handle token refresh for iOS
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          console.log("iOS: No refresh token found, redirecting to login");
          localStorage.clear();
          location.replace("/");
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then(() => {
            const newToken = localStorage.getItem('accessToken');
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return api(originalRequest);
          });
        }

        isRefreshing = true;

        try {
          console.log("iOS: Attempting token refresh");
          // Make direct HTTP request to avoid interceptor loop
          const refreshResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/create-new-token`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${refreshToken}`
            },
            credentials: 'include'
          });

          if (refreshResponse.ok) {
            const data = await refreshResponse.json();
            
            if (data.tokens?.accessToken) {
              console.log("iOS: Token refresh successful");
              localStorage.setItem('accessToken', data.tokens.accessToken);
              
              processQueue(null, data.tokens.accessToken);
              
              // Retry original request
              originalRequest.headers.Authorization = `Bearer ${data.tokens.accessToken}`;
              return api(originalRequest);
            }
          }
          
          throw new Error('Token refresh failed');
          
        } catch (refreshError) {
          console.error("iOS: Refresh token failed:", refreshError);
          processQueue(refreshError, null);
          
          // Clear iOS tokens and redirect
          localStorage.clear();
          location.replace("/");
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else {
        // Handle token refresh for non-iOS (original logic)
        if (code === "ACCESS_TOKEN_EXPIRED") {
          try {
            await api.post("/auth/create-new-token");
            return api(originalRequest);
          } catch (refreshError) {
            console.error("Refresh token failed:", refreshError);
            return Promise.reject(refreshError);
          }
        }
      }
    } else if (code === "REFRESH_TOKEN_EXPIRED") {
      if (isIOS) {
        localStorage.clear();
      }
      location.replace("/");
    }
    
    return Promise.reject(error);
  }
);

export default api;