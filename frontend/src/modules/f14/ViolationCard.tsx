import React from 'react';
import { Violation } from '../../shared/types/index.js';
import { SeverityTag } from './SeverityTag.js';

interface ViolationCardProps {
  violation: Violation;
  onInspectEvidence?: () => void;
  onOverride?: () => void;
}

export const ViolationCard: React.FC<ViolationCardProps> = ({
  violation,
  onInspectEvidence,
  onOverride
}) => {
  return (
    <div 
      className="card" 
      style={{
        padding: '1.25rem',
        marginBottom: '1rem',
        borderLeft: '4px solid var(--danger-500, #ef4444)',
        backgroundColor: 'var(--surface-card, #ffffff)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span 
              style={{
                fontFamily: 'monospace',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: 'var(--danger-700, #b91c1c)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px'
              }}
            >
              {violation.ruleCode}
            </span>
            <SeverityTag severity={violation.severity} />
          </div>
          <h4 style={{ margin: '0.25rem 0', fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            {violation.violationType}
          </h4>
        </div>

        {violation.packageSide && (
          <span 
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-subtle, #f1f5f9)',
              color: 'var(--text-secondary)'
            }}
          >
            Side: {violation.packageSide}
          </span>
        )}
      </div>

      <div style={{ marginBottom: '0.75rem' }}>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Statutory Reference: <strong style={{ color: 'var(--text-secondary)' }}>{violation.legalReference}</strong>
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-primary)', lineHeight: 1.4, backgroundColor: 'rgba(239, 68, 68, 0.04)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
          {violation.explanation}
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.75rem' }}>
        {onOverride && (
          <button 
            onClick={onOverride}
            className="btn btn-secondary"
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            Inspector Override / Exception
          </button>
        )}
        {onInspectEvidence && (
          <button 
            onClick={onInspectEvidence}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '4px 10px' }}
          >
            Inspect Evidence Region →
          </button>
        )}
      </div>
    </div>
  );
};
