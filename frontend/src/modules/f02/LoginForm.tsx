import React, { useState } from 'react';
import { useAuth, UserRole } from '../../shared/auth/AuthContext';
import { Lock, Mail, UserCheck, LogIn, AlertCircle, Sparkles } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('amit.patel@doca.gov.in');
  const [password, setPassword] = useState('InspectSecure@2026');
  const [role, setRole] = useState<UserRole>('INSPECTOR');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) {
      setError('Please provide both statutory email and access key/password.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password, role);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickRole = (r: UserRole, em: string) => {
    setRole(r);
    setEmail(em);
    setPassword('InspectSecure@2026');
  };

  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '100%', margin: '0 auto', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.4rem', fontWeight: 700 }}>
          Departmental Sign-In
        </h2>
        <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Access statutory Legal Metrology inspection and enforcement consoles
        </p>
      </div>

      {/* Quick Role Fillers */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Sparkles size={12} /> Quick Demo Logins:
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={() => handleQuickRole('INSPECTOR', 'amit.patel@doca.gov.in')}
            className={`btn btn-sm ${role === 'INSPECTOR' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem' }}
          >
            Field Inspector
          </button>
          <button
            type="button"
            onClick={() => handleQuickRole('SUPERVISOR', 'controller@doca.gov.in')}
            className={`btn btn-sm ${role === 'SUPERVISOR' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem' }}
          >
            Supervisor (DoCA)
          </button>
          <button
            type="button"
            onClick={() => handleQuickRole('MANUFACTURER', 'qa@priyafoods.in')}
            className={`btn btn-sm ${role === 'MANUFACTURER' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem' }}
          >
            Manufacturer QA
          </button>
          <button
            type="button"
            onClick={() => handleQuickRole('ADMIN', 'admin@doca.gov.in')}
            className={`btn btn-sm ${role === 'ADMIN' ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.75rem' }}
          >
            System Admin
          </button>
        </div>
      </div>

      {error && (
        <div style={{ padding: '0.75rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.8125rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Officer / Manufacturer Email
          </label>
          <div style={{ position: 'relative' }}>
            <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="input-text"
              style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Password / Cryptographic Passcode
          </label>
          <div style={{ position: 'relative' }}>
            <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input-text"
              style={{ width: '100%', padding: '0.625rem 0.875rem 0.625rem 2.5rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Assigned Portal Role
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="input-select"
            style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
          >
            <option value="INSPECTOR">Field Inspector</option>
            <option value="SUPERVISOR">Supervisor / Controller</option>
            <option value="MANUFACTURER">Manufacturer Compliance Officer</option>
            <option value="ADMIN">System Administrator</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8125rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Keep session active</span>
          </label>

          <a href="/forgot-password" style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
            Forgot Key?
          </a>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
        >
          {loading ? 'Authenticating...' : (
            <>
              <LogIn size={18} /> Authenticate & Enter Console
            </>
          )}
        </button>
      </form>
    </div>
  );
};
