import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import api from '../utils/axios'; // adjust path based on your structure

const AdminProtectedRoute = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndRole = async () => {
      try {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        
        if (isIOS) {
          // For iOS, check localStorage first
          const storedUser = localStorage.getItem('user');
          const accessToken = localStorage.getItem('accessToken');
          
          if (storedUser && accessToken) {
            try {
              const user = JSON.parse(storedUser);
              console.log('iOS: Found stored user data:', user);
              
              if (user.role === 'admin') {
                console.log('iOS: Admin role verified');
                setIsAuthenticated(true);
                setIsAdmin(true);
              } else {
                console.log('iOS: User is not admin, role:', user.role);
                setIsAuthenticated(false);
                setIsAdmin(false);
              }
            } catch (parseError) {
              console.log('Error parsing stored user data:', parseError);
              localStorage.clear();
              setIsAuthenticated(false);
              setIsAdmin(false);
            }
          } else {
            console.log('iOS: No stored auth data found');
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        } else {
          // For non-iOS, check server session
          const response = await api.get('/auth/status');
          
          if (response.data.isValid && response.data.user) {
            console.log('Non-iOS: Valid session found:', response.data.user);
            setIsAuthenticated(true);
            setIsAdmin(response.data.user.role === 'admin');
          } else {
            console.log('Non-iOS: Invalid session');
            setIsAuthenticated(false);
            setIsAdmin(false);
          }
        }
      } catch (error) {
        console.log('Auth check failed:', error);
        setIsAuthenticated(false);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndRole();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    console.log('Not admin, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('Admin access granted');
  return <Outlet />;
};

export default AdminProtectedRoute;