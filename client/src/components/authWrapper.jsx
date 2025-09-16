import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axios'; // adjust path accordingly

const AuthWrapper = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
          // For iOS, check localStorage
          const storedUser = localStorage.getItem('user');
          const accessToken = localStorage.getItem('accessToken');
          
          if (storedUser && accessToken) {
            console.log('iOS: Found stored auth data');
            setIsAuthenticated(true);
          } else {
            console.log('iOS: No stored auth data, redirecting to login');
            navigate('/', { replace: true });
          }
        } else {
          // For non-iOS, check server session
          const response = await api.get('/auth/status');
          if (response.data.isValid) {
            console.log('Non-iOS: Valid session found');
            setIsAuthenticated(true);
          } else {
            console.log('Non-iOS: Invalid session, redirecting to login');
            navigate('/', { replace: true });
          }
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        navigate('/', { replace: true });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Checking authentication...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : null;
};

export default AuthWrapper;