import React from 'react';
import { useAuth } from '../../shared/auth/AuthContext';
import { useTheme } from './ThemeProvider';
import { Bell, ShieldCheck, Sun, Moon, LogOut, UserCheck, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopNavProps {
  onToggleSidebar?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleSidebar }) => {
  const { user, role, setRole, logout } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header
      style={{
        height: '60px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40
      }}
    >
      {/* Brand & Left cluster */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', textDecoration: 'none', color: 'inherit' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 2px 4px rgba(79, 70, 229, 0.3)'
            }}
          >
            <ShieldCheck size={20} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.95rem', lineHeight: '1.1', color: 'var(--color-text)' }}>
              Legal Metrology DoCA
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-secondary)', fontWeight: 500, letterSpacing: '0.04em' }}>
              AI Compliance & Verification
            </div>
          </div>
        </Link>
      </div>

      {/* Right controls: Role Selector, Dark Mode Toggle, Profile, Logout */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Role Switcher Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--color-background)', padding: '0.25rem 0.5rem', borderRadius: '6px', border: '1px solid var(--color-border)' }}>
          <UserCheck size={14} color="var(--color-primary)" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Role:</span>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as any)}
            style={{
              background: 'transparent',
              border: 'none',
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-primary)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="INSPECTOR">INSPECTOR</option>
            <option value="SUPERVISOR">SUPERVISOR</option>
            <option value="MANUFACTURER">MANUFACTURER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {/* Theme toggle button */}
        <button
          onClick={toggleTheme}
          className="btn btn-outline btn-sm"
          style={{ padding: '0.4rem', borderRadius: '6px' }}
          aria-label="Toggle dark/light theme"
        >
          {resolvedTheme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* User profile info & logout */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ textAlign: 'right', display: 'none', md: 'block' } as any}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>{user.email}</div>
            </div>
            <button
              onClick={logout}
              className="btn btn-outline btn-sm"
              style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem' }}
              title="Sign Out"
            >
              <LogOut size={14} /> Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm" style={{ fontSize: '0.8125rem' }}>
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
