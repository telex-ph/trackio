// File: src/utils/iosAuthUtils.js

import api from './axios';

// iOS Detection
export const isIOSDevice = () => {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
};

// Check if user is authenticated (cookies + localStorage fallback)
export const checkAuthenticationStatus = async () => {
  try {
    // First try cookie-based auth
    const response = await api.get("/auth/status");
    
    if (response.data.isValid) {
      return {
        isAuthenticated: true,
        user: response.data.user,
        method: 'cookies'
      };
    }
  } catch (error) {
    console.log('Cookie auth failed, checking localStorage fallback...');
  }
  
  // Fallback to localStorage for iOS
  const fallbackAuth = localStorage.getItem('fallbackAuth');
  if (fallbackAuth) {
    try {
      const authData = JSON.parse(fallbackAuth);
      
      // Check if token is still valid
      if (Date.now() < authData.expiresAt) {
        return {
          isAuthenticated: true,
          user: authData.user,
          method: 'localStorage'
        };
      } else {
        // Token expired, clear it
        localStorage.removeItem('fallbackAuth');
      }
    } catch (parseError) {
      console.log('Error parsing localStorage auth:', parseError);
      localStorage.removeItem('fallbackAuth');
    }
  }
  
  return {
    isAuthenticated: false,
    user: null,
    method: null
  };
};

// Logout function that clears both cookies and localStorage
export const logout = async () => {
  try {
    // Try to logout via API (clears cookies)
    await api.post('/auth/logout');
  } catch (error) {
    console.log('API logout failed:', error);
  } finally {
    // Always clear localStorage fallback
    localStorage.removeItem('fallbackAuth');
    
    // Redirect to login
    window.location.href = '/';
  }
};

// Get current user from either cookies or localStorage
export const getCurrentUser = async () => {
  const authStatus = await checkAuthenticationStatus();
  
  if (authStatus.isAuthenticated) {
    return authStatus.user;
  }
  
  return null;
};

// Utility to handle protected route access
export const requireAuth = async (navigate) => {
  const authStatus = await checkAuthenticationStatus();
  
  if (!authStatus.isAuthenticated) {
    navigate('/');
    return false;
  }
  
  return authStatus.user;
};