import React from 'react';
import { KPISummary } from '../../shared/types/index.js';
import { ShieldCheck, AlertOctagon, HelpCircle, Activity, Clock, Layers } from 'lucide-react';

interface KPISummaryRowProps {
  kpis: KPISummary;
}

export const KPISummaryRow: React.FC<KPISummaryRowProps> = ({ kpis }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
      gap: '1.25rem'
    }}>
      {/* Total Inspections */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Total Inspections
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {kpis.totalInspections}
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(99, 102, 241, 0.15)',
            color: '#818cf8'
          }}>
            <Layers size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem', fontWeight: 600 }}>
          ↑ 14% vs previous cycle
        </div>
      </div>

      {/* Compliance Rate */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Compliance Rate
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#4ade80' }}>
              {kpis.complianceRate}%
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
          {kpis.compliantCount} Verified Compliant
        </div>
      </div>

      {/* Flagged Violations */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Flagged Violations
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#f87171' }}>
              {kpis.flaggedCount}
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171'
          }}>
            <AlertOctagon size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#f87171', marginTop: '0.5rem', fontWeight: 600 }}>
          Statutory action / notice issued
        </div>
      </div>

      {/* Manual Review Pending */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Manual Review Queue
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#fbbf24' }}>
              {kpis.manualReviewCount}
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24'
          }}>
            <HelpCircle size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Awaiting inspector override
        </div>
      </div>

      {/* Turnaround Time */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avg Field Resolution
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--text-primary)' }}>
              {kpis.avgResolutionTimeHours} hrs
            </div>
          </div>
          <div style={{
            padding: '0.6rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(14, 165, 233, 0.15)',
            color: '#38bdf8'
          }}>
            <Clock size={22} />
          </div>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#4ade80', marginTop: '0.5rem', fontWeight: 600 }}>
          3.2x faster than manual ledger
        </div>
      </div>
    </div>
  );
};
