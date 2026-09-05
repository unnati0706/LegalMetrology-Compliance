import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, UserRole } from '../../shared/auth/AuthContext';

interface AuthGuardRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const AuthGuardRoute: React.FC<AuthGuardRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { isAuthenticated, role } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
