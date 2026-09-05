import React from 'react';
import { PieChart, CheckCircle2, AlertOctagon, HelpCircle, Clock } from 'lucide-react';
import { KPISummary } from '../../shared/types/index.js';

interface StatusDistributionChartProps {
  kpis: KPISummary;
}

export const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({ kpis }) => {
  const total = kpis.totalInspections || 1;
  const compliantPct = Math.round((kpis.compliantCount / total) * 100);
  const flaggedPct = Math.round((kpis.flaggedCount / total) * 100);
  const manualPct = Math.round((kpis.manualReviewCount / total) * 100);
  const otherPct = Math.max(0, 100 - compliantPct - flaggedPct - manualPct);

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <PieChart size={16} color="var(--color-primary-light)" />
            Case Status & Disposition Distribution
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Proportional breakdown across national inspection docket</div>
        </div>
      </div>

      {/* Multi-segment Progress Bar */}
      <div style={{
        height: '18px',
        width: '100%',
        borderRadius: '9999px',
        overflow: 'hidden',
        display: 'flex',
        backgroundColor: 'rgba(255,255,255,0.06)',
        marginTop: '0.5rem'
      }}>
        <div style={{ width: `${compliantPct}%`, backgroundColor: '#22c55e' }} title={`Compliant: ${compliantPct}%`} />
        <div style={{ width: `${flaggedPct}%`, backgroundColor: '#ef4444' }} title={`Flagged: ${flaggedPct}%`} />
        <div style={{ width: `${manualPct}%`, backgroundColor: '#f59e0b' }} title={`Manual Review: ${manualPct}%`} />
        <div style={{ width: `${otherPct}%`, backgroundColor: '#6366f1' }} title={`In Progress: ${otherPct}%`} />
      </div>

      {/* Legend & Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#22c55e', borderRadius: '3px' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Compliant ({compliantPct}%)</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{kpis.compliantCount} cases</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '3px' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Flagged / Action ({flaggedPct}%)</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{kpis.flaggedCount} cases</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '3px' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Manual Review ({manualPct}%)</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{kpis.manualReviewCount} cases</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
          <div style={{ width: '12px', height: '12px', backgroundColor: '#6366f1', borderRadius: '3px' }} />
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Under Review / Draft</div>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{total - kpis.compliantCount - kpis.flaggedCount - kpis.manualReviewCount} cases</div>
          </div>
        </div>
      </div>
    </div>
  );
};
