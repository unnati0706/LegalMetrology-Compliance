import React from 'react';
import { DateDeclarationDetails } from '../../shared/types/index.js';

interface DateDeclarationCardProps {
  data: DateDeclarationDetails;
  onEdit?: () => void;
}

export const DateDeclarationCard: React.FC<DateDeclarationCardProps> = ({ data, onEdit }) => {
  const isCompliant = data.status === 'COMPLIANT';

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700, #1d4ed8)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              RULE 6(1)(d)
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: isCompliant ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: isCompliant ? 'var(--success-700, #047857)' : 'var(--danger-700, #b91c1c)' }}>
              {data.status}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Month & Year of Manufacture / Packaging
          </h3>
        </div>

        {onEdit && (
          <button onClick={onEdit} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            Edit Date
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--surface-border, #e2e8f0)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Declared Date</span>
          <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {data.declaredDateString}
          </div>
          <div style={{ fontSize: '0.75rem', color: data.isFormatCompliant ? 'var(--success-600, #059669)' : 'var(--danger-600, #dc2626)', marginTop: '0.35rem' }}>
            {data.isFormatCompliant ? '✓ Compliant MM/YYYY format' : '✕ Non-standard date pattern'}
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--surface-border, #e2e8f0)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Future Date Check</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: data.isFutureDate ? 'var(--danger-600, #dc2626)' : 'var(--success-600, #059669)', marginTop: '0.25rem' }}>
            {data.isFutureDate ? '⚠ Flagged Future Date' : '✓ Valid Historical / Current Date'}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Month: {data.month}, Year: {data.year}
          </div>
        </div>
      </div>
    </div>
  );
};
