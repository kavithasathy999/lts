import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
  const isAdminLoggedIn = localStorage.getItem("admin");

  return isAdminLoggedIn ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
