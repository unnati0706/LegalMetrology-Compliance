import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from './LoginForm';
import { ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  return (
    <div
      style={{
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem'
      }}
    >
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '12px', background: 'var(--color-primary)', color: '#fff', marginBottom: '0.75rem' }}>
          <ShieldCheck size={28} />
        </div>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>
          Department of Consumer Affairs (DoCA)
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Statutory Legal Metrology (Packaged Commodities) Compliance Portal
        </p>
      </div>

      <LoginForm onSuccess={() => navigate(from, { replace: true })} />
    </div>
  );
};
