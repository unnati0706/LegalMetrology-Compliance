import React from 'react';
import { RemediationItem } from '../../shared/types';
import { CheckCircle2, AlertTriangle, XCircle, FileText, Wrench, ShieldAlert } from 'lucide-react';

interface IssueDetailCardProps {
  item: RemediationItem;
  onToggleResolved: (id: string) => void;
}

export const IssueDetailCard: React.FC<IssueDetailCardProps> = ({ item, onToggleResolved }) => {
  const getSeverityBadge = () => {
    switch (item.severity) {
      case 'CRITICAL':
        return <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><ShieldAlert size={14} /> Critical Risk</span>;
      case 'MAJOR':
        return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><AlertTriangle size={14} /> Major Discrepancy</span>;
      default:
        return <span className="badge badge-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>Minor Guidance</span>;
    }
  };

  const getStatusIcon = () => {
    if (item.isResolved) {
      return <CheckCircle2 size={22} color="#059669" />;
    }
    if (item.status === 'FAIL') {
      return <XCircle size={22} color="#dc2626" />;
    }
    if (item.status === 'WARNING') {
      return <AlertTriangle size={22} color="#d97706" />;
    }
    return <CheckCircle2 size={22} color="#059669" />;
  };

  return (
    <div
      className="card"
      style={{
        background: item.isResolved ? '#f0fdf4' : 'var(--color-surface)',
        border: `1px solid ${item.isResolved ? '#bbf7d0' : 'var(--color-border)'}`,
        borderRadius: '10px',
        padding: '1.25rem',
        marginBottom: '1rem',
        transition: 'all 0.2s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {getStatusIcon()}
          <div>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: item.isResolved ? '#166534' : 'var(--color-text)' }}>
              {item.field}
            </h4>
            <div style={{ marginTop: '0.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              {getSeverityBadge()}
              {item.isResolved && (
                <span className="badge badge-success" style={{ background: '#dcfce7', color: '#15803d' }}>
                  Marked Resolved
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={() => onToggleResolved(item.id)}
          className={item.isResolved ? "btn btn-secondary btn-sm" : "btn btn-outline btn-sm"}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.8125rem',
            padding: '0.4rem 0.75rem',
            borderRadius: '6px'
          }}
        >
          {item.isResolved ? 'Re-open Issue' : 'Mark as Fixed'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginTop: '1rem', padding: '0.875rem', background: 'var(--color-background)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
            Detected Value in Artwork
          </div>
          <div style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: 'var(--color-text)' }}>
            {item.currentValue}
          </div>
        </div>

        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#059669', textTransform: 'uppercase', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Wrench size={13} /> Recommended Remediation Action
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text)' }}>
            {item.suggestedFix}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        <FileText size={14} />
        <span>Statutory Authority: <strong>{item.legalRef}</strong></span>
      </div>
    </div>
  );
};
