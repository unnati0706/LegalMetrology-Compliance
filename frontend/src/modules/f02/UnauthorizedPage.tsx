import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, UserCheck } from 'lucide-react';
import { useAuth } from '../../shared/auth/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const { role, setRole } = useAuth();

  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid #fecaca', borderRadius: '16px', padding: '2.5rem', maxWidth: '500px', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
          <ShieldAlert size={30} />
        </div>

        <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 800, color: '#991b1b' }}>
          403 - Restricted Access
        </h1>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
          Your current portal role (<strong>{role}</strong>) does not have statutory authorization to access this enforcement resource.
        </p>

        <div style={{ padding: '1rem', background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'left' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <UserCheck size={14} /> Quick Switch Role for Demo:
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button onClick={() => setRole('ADMIN')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>Switch to Admin</button>
            <button onClick={() => setRole('SUPERVISOR')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>Switch to Supervisor</button>
            <button onClick={() => setRole('INSPECTOR')} className="btn btn-outline btn-sm" style={{ fontSize: '0.75rem' }}>Switch to Inspector</button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}>
            <Home size={16} /> Return to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};
