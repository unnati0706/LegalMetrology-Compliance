import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '../types/index.js';

export type { UserRole };

export interface AuthContextType {
  user: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  switchRole: (role: UserRole) => void;
  setRole: (role: UserRole) => void;
  login: (email: string, password?: string, role?: UserRole) => Promise<void>;
  logout: () => void;
}

const defaultUser: User = {
  id: 'usr-inspector-01',
  email: 'amit.patel@legalmetrology.gov.in',
  name: 'Amit Patel',
  role: 'INSPECTOR',
  organization: 'Enforcement Wing, Zone 2, Maharashtra',
};

const AuthContext = createContext<AuthContextType>({
  user: defaultUser,
  role: 'INSPECTOR',
  isAuthenticated: true,
  switchRole: () => {},
  setRole: () => {},
  login: async () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(defaultUser);

  const switchRole = (newRole: UserRole) => {
    const names: Record<UserRole, { name: string; email: string; org: string }> = {
      ADMIN: { name: 'Rajesh Sharma', email: 'admin@legalmetrology.gov.in', org: 'DoCA Central HQ, New Delhi' },
      SUPERVISOR: { name: 'Sunita Verma', email: 'supervisor@legalmetrology.gov.in', org: 'Legal Metrology Maharashtra Controller' },
      INSPECTOR: { name: 'Amit Patel', email: 'inspector@legalmetrology.gov.in', org: 'Enforcement Wing Zone 2' },
      MANUFACTURER: { name: 'Priya Foods Compliance Officer', email: 'compliance@priyafoods.in', org: 'Priya Foods Ltd' },
    };
    setUser({
      id: user?.id || 'usr-01',
      role: newRole,
      name: names[newRole].name,
      email: names[newRole].email,
      organization: names[newRole].org,
    });
  };

  const login = async (email: string, password?: string, preferredRole: UserRole = 'INSPECTOR') => {
    switchRole(preferredRole);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'INSPECTOR',
        isAuthenticated: Boolean(user),
        switchRole,
        setRole: switchRole,
        login,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

