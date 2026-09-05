import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, KeyRound } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
    }
  };

  return (
    <div style={{ minHeight: '75vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem' }}>
      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '16px', padding: '2rem', maxWidth: '440px', width: '100%', textAlign: 'center' }}>
        <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
          <KeyRound size={22} />
        </div>

        <h2 style={{ margin: '0 0 0.5rem', fontSize: '1.35rem', fontWeight: 700 }}>
          Credential Recovery
        </h2>
        <p style={{ margin: '0 0 1.5rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
          Enter your registered Departmental or Manufacturer email to receive recovery instructions.
        </p>

        {submitted ? (
          <div style={{ padding: '1.25rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px', color: '#065f46', marginBottom: '1.5rem', textAlign: 'left' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.35rem' }}>
              <CheckCircle2 size={18} /> Recovery Dispatch Sent
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem' }}>
              If an account matching <strong>{email}</strong> exists, a statutory verification token has been dispatched.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Officer / Organization Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="officer@doca.gov.in"
                className="input-text"
                style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: '8px', border: '1px solid var(--color-border)', fontSize: '0.875rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 600, fontSize: '0.875rem' }}
            >
              Send Recovery Token
            </button>
          </form>
        )}

        <Link
          to="/login"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary)', textDecoration: 'none', fontSize: '0.8125rem', fontWeight: 600 }}
        >
          <ArrowLeft size={14} /> Back to Sign-In
        </Link>
      </div>
    </div>
  );
};
