import React from 'react';
import { Palette, Layers, Type, Sliders } from 'lucide-react';

export const designTokens = {
  colors: {
    primary: '#4f46e5',
    primaryHover: '#4338ca',
    secondary: '#0ea5e9',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    background: '#f8fafc',
    surface: '#ffffff',
    text: '#0f172a',
    textSecondary: '#64748b',
    border: '#e2e8f0',
    sidebarBg: '#1e1b4b',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    xxl: '3rem',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    sizes: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem',
      hero: '2rem',
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    }
  },
  radii: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  }
};

export const DesignTokensViewer: React.FC = () => {
  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <Palette size={20} color="var(--color-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Legal Metrology Design Tokens</h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {Object.entries(designTokens.colors).map(([name, hex]) => (
          <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem', border: '1px solid var(--color-border)', borderRadius: '8px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: hex, border: '1px solid rgba(0,0,0,0.1)' }} />
            <div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>{hex}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
