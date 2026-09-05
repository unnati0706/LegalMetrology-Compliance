import React, { ReactNode } from 'react';
import { useAuth } from './AuthContext.js';
import { UserRole } from '../types/index.js';

interface RoleGateProps {
  allowedRoles: UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ allowedRoles, children, fallback = null }) => {
  const { role } = useAuth();

  if (!allowedRoles.includes(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
