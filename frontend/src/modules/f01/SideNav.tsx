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

interface NavSection {
  title: string;
  items: NavItem[];
}

export const SideNav: React.FC = () => {
  const { role } = useAuth();

  const sections: NavSection[] = [
    {
      title: 'Inspections',
      items: [
        { to: '/dashboard', label: 'Overview Dashboard', icon: <LayoutDashboard size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'MANUFACTURER', 'ADMIN'] },
        { to: '/inspections', label: 'Inspections & Search', icon: <Search size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
        { to: '/inspections/offline-queue', label: 'Offline Sync Queue', icon: <HardDriveDownload size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
      ]
    },
    {
      title: 'Evidence & Reports',
      items: [
        { to: '/heatmap', label: 'Compliance Heatmap', icon: <Layers size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
        { to: '/manual-review', label: 'Manual Review Queue', icon: <CheckCircle2 size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
        { to: '/notes', label: 'Inspector Notes', icon: <FileText size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
        { to: '/finalize', label: 'Finalization & Sign-off', icon: <Lock size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
        { to: '/reports', label: 'Report Vault & Export', icon: <FileSpreadsheet size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'MANUFACTURER', 'ADMIN'] },
        { to: '/inspections/insp-sample-01/explainable-evidence', label: 'Explainable AI & Audit', icon: <Sparkles size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
      ]
    },
    {
      title: 'Enforcement',
      items: [
        { to: '/enforcement/dashboard', label: 'Enforcement KPIs', icon: <Shield size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
        { to: '/enforcement/inspect-next', label: 'Inspect-Next Queue', icon: <Sparkles size={18} />, allowedRoles: ['INSPECTOR', 'SUPERVISOR', 'ADMIN'] },
        { to: '/enforcement/analytics', label: 'Violation Analytics', icon: <BarChart3 size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
        { to: '/enforcement/map', label: 'Geographic Risk Map', icon: <Map size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
        { to: '/enforcement/patterns', label: 'Recidivism Patterns', icon: <Network size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
        { to: '/enforcement/cases', label: 'Cases & Assignments', icon: <Briefcase size={18} />, allowedRoles: ['SUPERVISOR', 'ADMIN'] },
      ]
    },
    {
      title: 'Manufacturer Portal',
      items: [
        { to: '/manufacturer/dashboard', label: 'Manufacturer Portal', icon: <Building2 size={18} />, allowedRoles: ['MANUFACTURER', 'ADMIN'] },
        { to: '/manufacturer/products', label: 'Product & Artwork Library', icon: <Package size={18} />, allowedRoles: ['MANUFACTURER', 'ADMIN'] },
        { to: '/manufacturer/products/prod-001/scan', label: 'Pre-Compliance & Diff', icon: <ShieldCheck size={18} />, allowedRoles: ['MANUFACTURER', 'ADMIN'] },
      ]
    }
  ];

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
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem 0.75rem', flex: 1, overflowY: 'auto' }}>
        {sections.map((sec) => {
          const visibleItems = sec.items.filter(item => !item.allowedRoles || item.allowedRoles.includes(role));
          if (visibleItems.length === 0) return null;

          return (
            <div key={sec.title} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <div style={{ padding: '0.25rem 0.6rem', fontSize: '0.65rem', fontWeight: 800, color: 'var(--text-sidebar-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {sec.title}
              </div>

              {visibleItems.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0.55rem 0.75rem',
                    borderRadius: '8px',
                    color: isActive ? '#ffffff' : '#94a3b8',
                    backgroundColor: isActive ? 'rgba(79, 70, 229, 0.35)' : 'transparent',
                    border: isActive ? '1px solid rgba(79, 70, 229, 0.5)' : '1px solid transparent',
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.85rem',
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
            </div>
          );
        })}
      </nav>
    </aside>
  );
};
