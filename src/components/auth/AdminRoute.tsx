import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}