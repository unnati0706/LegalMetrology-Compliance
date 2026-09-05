import React from 'react';
import { Link } from 'react-router-dom';
import { Inspection } from '../../shared/types';
import { formatDateTimeIST } from '../../shared/utils/dateUtils';
import { CheckCircle2, AlertTriangle, Clock, ArrowRight } from 'lucide-react';

interface RecentInspectionsListProps {
  inspections: Inspection[];
}

export const RecentInspectionsList: React.FC<RecentInspectionsListProps> = ({ inspections }) => {
  const getDispositionBadge = (disp?: string, violations?: number) => {
    if (disp === 'COMPLIANT' || violations === 0) {
      return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><CheckCircle2 size={13} /> Compliant</span>;
    }
    if (disp === 'NON_COMPLIANT' || (violations && violations > 0)) {
      return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={13} /> {violations || 1} Violation(s)</span>;
    }
    return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Clock size={13} /> In Review</span>;
  };

  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Recent Field Inspections</h3>
        <Link to="/inspections" style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          View All <ArrowRight size={14} />
        </Link>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {inspections.slice(0, 5).map(item => (
          <Link
            key={item.id}
            to={`/inspections/${item.id}`}
            style={{
              textDecoration: 'none',
              color: 'inherit',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.875rem 1rem',
              background: 'var(--color-background)',
              borderRadius: '8px',
              border: '1px solid var(--color-border)',
              transition: 'all 0.15s ease'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--color-text)' }}>
                {item.productName}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
                {item.manufacturerName || item.brand || 'Unknown'} • ID: {item.id}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {getDispositionBadge(item.overallDisposition, item.violationsCount)}
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {formatDateTimeIST(item.createdAt)}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
