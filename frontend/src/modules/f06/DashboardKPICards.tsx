import React from 'react';
import { ClipboardList, CheckCircle2, AlertTriangle, Clock, TrendingUp } from 'lucide-react';

interface InspectorKPIs {
  todayInspections: number;
  compliantCount: number;
  flaggedCount: number;
  pendingReviews: number;
  complianceRate: number;
}

interface DashboardKPICardsProps {
  kpis: InspectorKPIs;
}

export const DashboardKPICards: React.FC<DashboardKPICardsProps> = ({ kpis }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
      {/* Today's Inspections */}
      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Today's Field Audits
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#eff6ff', color: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ClipboardList size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text)' }}>
          {kpis.todayInspections}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
          <TrendingUp size={12} /> Target: 10 per squad / shift
        </div>
      </div>

      {/* Compliant Packages */}
      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Compliant Packages
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#059669' }}>
          {kpis.compliantCount}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          {kpis.complianceRate}% Field Compliance Rate
        </div>
      </div>

      {/* Flagged Violations */}
      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Flagged Violations
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#dc2626' }}>
          {kpis.flaggedCount}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#991b1b', marginTop: '0.25rem' }}>
          Rule 6 & Rule 9 notices required
        </div>
      </div>

      {/* Pending Manual Review */}
      <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            Pending Manual Review
          </span>
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Clock size={18} />
          </div>
        </div>
        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#d97706' }}>
          {kpis.pendingReviews}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
          Low OCR confidence thresholds
        </div>
      </div>
    </div>
  );
};
