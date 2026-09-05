import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../shared/auth/AuthContext';
import {
  Layers,
  CheckCircle2,
  FileText,
  Lock,
  Search,
  FileSpreadsheet,
  Shield,
  BarChart3,
  Network,
  Map,
  Briefcase,
  Sparkles,
  Building2,
  Package,
  HardDriveDownload,
  ShieldCheck,
  LayoutDashboard
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: string[];
}

export const SideNav: React.FC = () => {
  const { role } = useAuth();

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Overview Dashboard', icon: <LayoutDashboard size={18} /> },
    { to: '/inspections', label: 'Inspections & Search', icon: <Search size={18} /> },
    { to: '/heatmap', label: 'Compliance Heatmap', icon: <Layers size={18} /> },
    { to: '/manual-review', label: 'Manual Review Queue', icon: <CheckCircle2 size={18} /> },
    { to: '/notes', label: 'Inspector Notes', icon: <FileText size={18} /> },
    { to: '/finalize', label: 'Finalization & Sign-off', icon: <Lock size={18} /> },
    { to: '/reports', label: 'Report Vault & Export', icon: <FileSpreadsheet size={18} /> },
    { to: '/inspections/offline-queue', label: 'Offline Sync Queue', icon: <HardDriveDownload size={18} /> },
    { to: '/inspections/insp-sample-01/explainable-evidence', label: 'Explainable AI & Audit', icon: <Sparkles size={18} /> },
    { to: '/enforcement/dashboard', label: 'Enforcement KPIs', icon: <Shield size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
    { to: '/enforcement/analytics', label: 'Violation Analytics', icon: <BarChart3 size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
    { to: '/enforcement/patterns', label: 'Recidivism Patterns', icon: <Network size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
    { to: '/enforcement/map', label: 'Geographic Risk Map', icon: <Map size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
    { to: '/enforcement/cases', label: 'Cases & Assignments', icon: <Briefcase size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
    { to: '/enforcement/inspect-next', label: 'Inspect-Next Queue', icon: <Sparkles size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
    { to: '/manufacturer/dashboard', label: 'Manufacturer Portal', icon: <Building2 size={18} />, allowedRoles: ['MANUFACTURER', 'ADMIN'] },
    { to: '/manufacturer/products', label: 'Product & Artwork Library', icon: <Package size={18} />, allowedRoles: ['MANUFACTURER', 'ADMIN'] },
    { to: '/manufacturer/products/prod-001/scan', label: 'Pre-Compliance & Diff', icon: <ShieldCheck size={18} />, allowedRoles: ['MANUFACTURER', 'ADMIN'] },
  ];

  const visibleItems = navItems.filter(item => {
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(role);
  });

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: 'var(--bg-sidebar, #1e1b4b)',
        color: 'var(--text-sidebar, #e0e7ff)',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        borderRight: '1px solid rgba(255,255,255,0.06)'
      }}
    >
      <div style={{ padding: '1.25rem 1.25rem 0.75rem 1.25rem' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-sidebar-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Platform Navigation
        </div>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.5rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        {visibleItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              padding: '0.65rem 0.85rem',
              borderRadius: '8px',
              color: isActive ? '#ffffff' : '#94a3b8',
              backgroundColor: isActive ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
              border: isActive ? '1px solid rgba(79, 70, 229, 0.5)' : '1px solid transparent',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.875rem',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {item.icon}
              <span>{item.label}</span>
            </div>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};
