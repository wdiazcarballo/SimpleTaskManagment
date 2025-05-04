import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Show loading screen while checking authentication
  if (loading) {
    return <div className="loading">Loading...</div>;
  }
  
  // If authenticated, render the child route components
  // Otherwise, redirect to the login page
  return isAuthenticated() ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;