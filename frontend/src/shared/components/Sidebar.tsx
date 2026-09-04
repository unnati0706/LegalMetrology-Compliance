import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Layers, 
  CheckCircle2, 
  FileText, 
  Lock, 
  Search, 
  HelpCircle,
  FileSpreadsheet,
  Archive,
  Shield,
  BarChart3,
  Network,
  Map,
  Briefcase,
  Sparkles,
  Building2,
  Package
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/inspections', label: 'Inspections & Search', icon: <Search size={18} />, module: 'F25' },
    { to: '/heatmap', label: 'Compliance Heatmap', icon: <Layers size={18} />, module: 'F21' },
    { to: '/manual-review', label: 'Manual Review Queue', icon: <CheckCircle2 size={18} />, module: 'F22' },
    { to: '/notes', label: 'Inspector Notes', icon: <FileText size={18} />, module: 'F23' },
    { to: '/finalize', label: 'Finalization & Sign-off', icon: <Lock size={18} />, module: 'F24' },
    { to: '/reports', label: 'Report Vault & Export', icon: <FileSpreadsheet size={18} />, module: 'F26/27' },
    { to: '/enforcement/dashboard', label: 'Enforcement KPIs', icon: <Shield size={18} />, module: 'F28' },
    { to: '/enforcement/analytics', label: 'Violation Analytics', icon: <BarChart3 size={18} />, module: 'F29' },
    { to: '/enforcement/patterns', label: 'Recidivism Patterns', icon: <Network size={18} />, module: 'F30' },
    { to: '/enforcement/map', label: 'Geographic Risk Map', icon: <Map size={18} />, module: 'F31' },
    { to: '/enforcement/cases', label: 'Cases & Assignments', icon: <Briefcase size={18} />, module: 'F32' },
    { to: '/enforcement/inspect-next', label: 'Inspect-Next Queue', icon: <Sparkles size={18} />, module: 'F33' },
    { to: '/manufacturer/dashboard', label: 'Manufacturer Portal', icon: <Building2 size={18} />, module: 'F34' },
    { to: '/manufacturer/products', label: 'Product & Artwork Library', icon: <Package size={18} />, module: 'F35' },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-sidebar)',
      color: 'var(--text-sidebar)',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
      borderRight: '1px solid rgba(255,255,255,0.06)'
    }}>
      <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-sidebar-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Compliance Modules
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem 0.75rem', flex: 1 }}>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.65rem 0.85rem',
              borderRadius: 'var(--radius-md)',
              color: isActive ? '#ffffff' : 'var(--text-sidebar-muted)',
              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.25)' : 'transparent',
              border: isActive ? '1px solid rgba(79, 70, 229, 0.4)' : '1px solid transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              transition: 'all 0.15s ease',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
            <span style={{
              fontSize: '0.65rem',
              padding: '0.15rem 0.4rem',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.08)',
              color: '#a5b4fc',
              fontWeight: 700
            }}>
              {item.module}
            </span>
          </NavLink>
        ))}
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-md)',
          padding: '0.75rem',
          fontSize: '0.75rem',
          color: 'var(--text-sidebar-muted)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 600, marginBottom: '0.25rem' }}>
            <HelpCircle size={14} /> Statutory Engine
          </div>
          <div>Rule 6(1) PCR 2011 & Legal Metrology Act, 2009 active.</div>
        </div>
      </div>
    </aside>
  );
};
