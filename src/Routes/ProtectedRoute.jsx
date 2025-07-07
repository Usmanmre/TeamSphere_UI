// routes/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../Global_State/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const user = useAuth();
  if (!user || !allowedRoles.includes(user.auth.user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
