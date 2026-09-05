import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../shared/auth/AuthContext';
import {
  ShieldCheck,
  Search,
  Layers,
  Sparkles,
  BarChart3,
  HardDriveDownload,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileCheck
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user, role } = useAuth();

  const quickLinks = [
    {
      title: 'Field Inspections & OCR',
      description: 'Search, review, and initiate field packaging compliance inspections.',
      to: '/inspections',
      icon: <Search size={22} color="var(--color-primary)" />,
      badge: 'F25',
    },
    {
      title: 'Compliance Heatmap',
      description: 'Visual matrix of Rule 6(1) declarations across commodity categories.',
      to: '/heatmap',
      icon: <Layers size={22} color="#0ea5e9" />,
      badge: 'F21',
    },
    {
      title: 'Explainable AI & Audit',
      description: 'Walk through neural OCR extraction, bounding boxes, and statutory citations.',
      to: '/inspections/insp-sample-01/explainable-evidence',
      icon: <Sparkles size={22} color="#8b5cf6" />,
      badge: 'F39/40',
    },
    {
      title: 'Offline Sync Queue',
      description: 'Terminal queue for field inspections captured without connectivity.',
      to: '/inspections/offline-queue',
      icon: <HardDriveDownload size={22} color="#10b981" />,
      badge: 'F38',
    },
    {
      title: 'Enforcement Dashboard',
      description: 'National Metrology KPIs, violation trends, and recidivism analytics.',
      to: '/enforcement/dashboard',
      icon: <BarChart3 size={22} color="#f59e0b" />,
      badge: 'F28-F30',
    },
    {
      title: 'Manufacturer Self-Scan',
      description: 'Pre-compliance packaging artwork verification and remediation diffs.',
      to: '/manufacturer/products',
      icon: <Building2 size={22} color="#ec4899" />,
      badge: 'F34-F37',
    },
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
      {/* Welcome Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.1) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', background: '#dcfce7', color: '#15803d', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShieldCheck size={14} /> Ministry of Consumer Affairs (DoCA) • PCR 2011 Active
            </div>
            <h1 style={{ margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>
              Legal Metrology Compliance Platform
            </h1>
            <p style={{ margin: 0, fontSize: '0.9375rem', color: 'var(--color-text-secondary)', maxWidth: '650px' }}>
              Welcome back, <strong>{user?.name || 'Authorized Officer'}</strong> ({role}). AI assists declaration extraction; deterministic PCR 2011 rules enforce statutory compliance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <Link to="/inspections" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1.25rem' }}>
              <Search size={18} /> Launch Inspections
            </Link>
          </div>
        </div>
      </div>

      {/* Grid of Platform Capabilities */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem' }}>
        Core Metrology Workflows
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
        {quickLinks.map(link => (
          <Link
            key={link.to}
            to={link.to}
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div
              className="card"
              style={{
                background: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '1.5rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ padding: '0.6rem', borderRadius: '10px', background: 'var(--color-background)' }}>
                    {link.icon}
                  </div>
                  <span className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                    {link.badge}
                  </span>
                </div>
                <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.05rem', fontWeight: 600 }}>
                  {link.title}
                </h3>
                <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', lineHeight: '1.4' }}>
                  {link.description}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)' }}>
                <span>Open Module</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
