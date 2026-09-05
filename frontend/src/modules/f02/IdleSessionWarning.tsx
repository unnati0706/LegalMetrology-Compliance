import React, { useState, useEffect } from 'react';
import { AlertTriangle, Clock, RefreshCw, LogOut } from 'lucide-react';
import { useAuth } from '../../shared/auth/AuthContext';

interface IdleSessionWarningProps {
  onExtendSession: () => void;
  onLogout: () => void;
}

export const IdleSessionWarning: React.FC<IdleSessionWarningProps> = ({
  onExtendSession,
  onLogout
}) => {
  const { logout } = useAuth();
  const [secondsRemaining, setSecondsRemaining] = useState(120);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          logout();
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [logout, onLogout]);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '16px',
          padding: '2rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}
      >
        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <Clock size={24} />
        </div>

        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: 700 }}>
          Session Inactivity Warning
        </h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
          To protect statutory evidence integrity and compliance dossiers, your session will automatically lock in:
        </p>

        <div style={{ fontSize: '2rem', fontWeight: 800, color: secondsRemaining < 30 ? '#dc2626' : '#d97706', marginBottom: '1.5rem', fontFamily: 'monospace' }}>
          {Math.floor(secondsRemaining / 60)}:{(secondsRemaining % 60).toString().padStart(2, '0')}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button
            onClick={() => {
              logout();
              onLogout();
            }}
            className="btn btn-outline"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            <LogOut size={16} /> Sign Out Now
          </button>
          <button
            onClick={onExtendSession}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            <RefreshCw size={16} /> Keep Working & Stay Logged In
          </button>
        </div>
      </div>
    </div>
  );
};
