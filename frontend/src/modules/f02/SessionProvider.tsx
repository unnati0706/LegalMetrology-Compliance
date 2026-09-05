import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '../../shared/auth/AuthContext';
import { IdleSessionWarning } from './IdleSessionWarning';

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showIdleWarning, setShowIdleWarning] = useState(false);

  useEffect(() => {
    let idleTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      // Show warning after 25 minutes of inactivity
      idleTimer = setTimeout(() => {
        setShowIdleWarning(true);
      }, 25 * 60 * 1000);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    resetTimer();

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
    };
  }, []);

  return (
    <>
      {children}
      {showIdleWarning && (
        <IdleSessionWarning
          onExtendSession={() => setShowIdleWarning(false)}
          onLogout={() => {
            setShowIdleWarning(false);
          }}
        />
      )}
    </>
  );
};
