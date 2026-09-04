import React from 'react';
import { NetQuantityValidationResult } from '../../shared/types/index.js';

interface NetQuantityValidationCardProps {
  data: NetQuantityValidationResult;
  onEditQuantity?: () => void;
}

export const NetQuantityValidationCard: React.FC<NetQuantityValidationCardProps> = ({ data, onEditQuantity }) => {
  const isCompliant = data.status === 'COMPLIANT';

  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700, #1d4ed8)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              RULE 6(1)(h) & SCHEDULE II
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: isCompliant ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: isCompliant ? 'var(--success-700, #047857)' : 'var(--danger-700, #b91c1c)' }}>
              {data.status}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Net Quantity & Metric Standard Verification
          </h3>
        </div>

        {onEditQuantity && (
          <button onClick={onEditQuantity} className="btn btn-secondary" style={{ fontSize: '0.8rem' }}>
            Edit Quantity
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--surface-border, #e2e8f0)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Declared Net Quantity</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {data.declaredQuantity}
          </div>
          <div style={{ fontSize: '0.75rem', color: data.isStandardUnit ? 'var(--success-600, #059669)' : 'var(--danger-600, #dc2626)', marginTop: '0.35rem' }}>
            {data.isStandardUnit ? '✓ Standard SI Unit' : '✕ Non-standard unit'}
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--surface-border, #e2e8f0)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Schedule II & Tolerances</span>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            MPE: ±{data.maxPermissibleErrorPercentage || 1.5}%
          </div>
          <div style={{ fontSize: '0.75rem', color: data.isScheduleIICompliant ? 'var(--success-600, #059669)' : 'var(--warning-600, #d97706)', marginTop: '0.35rem' }}>
            {data.isScheduleIICompliant ? '✓ Standard Commodity Size' : '⚠ Non-standard package size'}
          </div>
        </div>
      </div>

      <div>
        <h4 style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)', margin: '0 0 0.5rem 0' }}>
          Statutory Verification Notes
        </h4>
        <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          {data.remarks.map((r, idx) => (
            <li key={idx} style={{ marginBottom: '0.25rem' }}>{r}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};
