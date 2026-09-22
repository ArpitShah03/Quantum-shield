import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export default function ProtectedRoute({ allowedRoles }: { allowedRoles: string[] }) {
  const { token, role } = useContext(AuthContext);

  if (!token) return <Navigate to="/login" replace />;

  if (role && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />; 
  }

  return <Outlet />;
}
