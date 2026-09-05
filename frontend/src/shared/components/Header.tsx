import React from 'react';
import { useAuth } from '../auth/AuthContext.js';
import { UserRole } from '../types/index.js';
import { ShieldCheck, User as UserIcon, Bell, Moon, Sun } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, role, switchRole } = useAuth();
  const [darkMode, setDarkMode] = React.useState(false);

  const toggleTheme = () => {
    const next = !darkMode;
    setDarkMode(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  return (
    <header style={{
      height: '64px',
      backgroundColor: 'var(--bg-card)',
      borderBottom: '1px solid var(--border-light)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '38px',
          height: '38px',
          borderRadius: 'var(--radius-md)',
          background: 'linear-gradient(135deg, #0b1f3a 0%, #1e3a8a 100%)',
          color: '#fbbf24',
          boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
        }}>
          <ShieldCheck size={22} />
        </div>
        <div>
          <div style={{ fontSize: '1rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--color-gov-navy)', letterSpacing: '-0.01em' }}>
            LEGAL METROLOGY <span style={{ color: 'var(--color-primary-500)' }}>COMPLIANCE</span>
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Department of Consumer Affairs, Govt. of India | SIH26034
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* Role Switcher for seamless testing of RBAC */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--text-muted)', fontWeight: 500 }}>Active Role:</span>
          <select 
            value={role} 
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="form-select"
            style={{ width: 'auto', padding: '0.3rem 0.6rem', fontSize: '0.8rem', fontWeight: 600 }}
          >
            <option value="INSPECTOR">Inspector</option>
            <option value="SUPERVISOR">Supervisor</option>
            <option value="ADMIN">Administrator</option>
            <option value="MANUFACTURER">Manufacturer</option>
          </select>
        </div>

        <button 
          onClick={toggleTheme}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          padding: '0.35rem 0.75rem',
          backgroundColor: 'var(--bg-app)',
          borderRadius: 'var(--radius-full)',
          border: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-100)',
            color: 'var(--color-primary-700)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            {user?.name.charAt(0)}
          </div>
          <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{user?.name}</div>
        </div>
      </div>
    </header>
  );
};
