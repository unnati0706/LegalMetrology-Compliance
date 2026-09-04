import React from 'react';
import { ManufacturerKPIs } from '../../shared/types/index.js';
import { Package, ShieldCheck, AlertTriangle, Layers, Calendar } from 'lucide-react';

interface ManufacturerKPICardsProps {
  kpis: ManufacturerKPIs;
}

export const ManufacturerKPICards: React.FC<ManufacturerKPICardsProps> = ({ kpis }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '1.25rem'
    }}>
      {/* Total Products */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Registered SKUs
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {kpis.totalProducts}
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8'
          }}>
            <Package size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Active catalog entries
        </div>
      </div>

      {/* Compliance Rate */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Pre-Market Readiness
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#4ade80' }}>
              {kpis.overallComplianceRate}%
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            color: '#4ade80'
          }}>
            <ShieldCheck size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          {kpis.compliantProducts} of {kpis.totalProducts} verified compliant
        </div>
      </div>

      {/* Pending Remediations */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Open Remediations
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#fbbf24' }}>
              {kpis.pendingRemediations}
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24'
          }}>
            <AlertTriangle size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: '0.5rem', fontWeight: 600 }}>
          Artwork font / USP fixes required
        </div>
      </div>

      {/* Active Artwork Versions */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Packaging Artworks
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {kpis.activeArtworks}
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(14, 165, 233, 0.15)',
            color: '#38bdf8'
          }}>
            <Layers size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Indexed multi-side graphics
        </div>
      </div>
    </div>
  );
};
