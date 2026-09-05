import React from 'react';

interface ProgressStepIndicatorProps {
  progressPercent: number;
  activeStageName: string;
  estimatedRemainingSec?: number;
  totalEvidenceCount?: number;
}

export const ProgressStepIndicator: React.FC<ProgressStepIndicatorProps> = ({
  progressPercent,
  activeStageName,
  estimatedRemainingSec = 1,
  totalEvidenceCount = 4
}) => {
  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Processing {totalEvidenceCount} Evidence Panels
        </span>
        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--primary-600, #2563eb)' }}>
          {progressPercent}%
        </span>
      </div>

      <div 
        style={{ 
          width: '100%', 
          height: '10px', 
          borderRadius: '5px', 
          backgroundColor: 'var(--surface-border, #e2e8f0)',
          overflow: 'hidden',
          marginBottom: '1rem'
        }}
      >
        <div 
          style={{ 
            height: '100%', 
            width: `${progressPercent}%`, 
            backgroundColor: progressPercent === 100 ? 'var(--success-500, #10b981)' : 'var(--primary-500, #3b82f6)',
            borderRadius: '5px',
            transition: 'width 0.4s ease'
          }} 
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
          Current Task: <strong>{activeStageName}</strong>
        </span>
        <span style={{ color: 'var(--text-muted)' }}>
          {estimatedRemainingSec > 0 ? `~${estimatedRemainingSec}s remaining` : 'Finalizing...'}
        </span>
      </div>
    </div>
  );
};
