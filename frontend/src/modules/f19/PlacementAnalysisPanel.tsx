import React from 'react';

interface PlacementItem {
  field: string;
  declaredSide: string;
  statutoryRequiredSide: string;
  isCompliant: boolean;
}

interface PlacementAnalysisPanelProps {
  items: PlacementItem[];
}

export const PlacementAnalysisPanel: React.FC<PlacementAnalysisPanelProps> = ({ items }) => {
  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
        Declaration Placement Analysis (Rule 6 & Rule 7)
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map((it, idx) => (
          <div 
            key={idx}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              borderRadius: '6px',
              backgroundColor: 'var(--surface-subtle, #f8fafc)',
              border: '1px solid var(--surface-border, #e2e8f0)'
            }}
          >
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                {it.field}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Required Placement: <strong>{it.statutoryRequiredSide}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span 
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: it.isCompliant ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                  color: it.isCompliant ? 'var(--success-700, #047857)' : 'var(--danger-700, #b91c1c)'
                }}
              >
                {it.isCompliant ? `✓ On ${it.declaredSide}` : `✕ On ${it.declaredSide} (Expected ${it.statutoryRequiredSide})`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
