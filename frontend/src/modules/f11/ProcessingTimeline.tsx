import React from 'react';

export interface ProcessingStage {
  id: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  durationMs?: number;
  description?: string;
}

interface ProcessingTimelineProps {
  stages: ProcessingStage[];
  currentStageId?: string;
}

export const ProcessingTimeline: React.FC<ProcessingTimelineProps> = ({ stages, currentStageId }) => {
  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
        Multi-Stage Extraction Pipeline
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {stages.map((stage, idx) => {
          const isComplete = stage.status === 'COMPLETED';
          const isInProgress = stage.status === 'IN_PROGRESS' || stage.id === currentStageId;
          const isFailed = stage.status === 'FAILED';

          const iconColor = isComplete 
            ? 'var(--success-500, #10b981)' 
            : isInProgress 
            ? 'var(--primary-500, #3b82f6)' 
            : isFailed 
            ? 'var(--danger-500, #ef4444)' 
            : 'var(--text-muted, #94a3b8)';

          const badgeBg = isComplete 
            ? 'rgba(16, 185, 129, 0.1)' 
            : isInProgress 
            ? 'rgba(59, 130, 246, 0.1)' 
            : isFailed 
            ? 'rgba(239, 68, 68, 0.1)' 
            : 'rgba(148, 163, 184, 0.1)';

          return (
            <div 
              key={stage.id} 
              style={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: '1rem',
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: isInProgress ? 'var(--surface-hover, rgba(59, 130, 246, 0.05))' : 'transparent',
                border: isInProgress ? '1px solid var(--primary-300, #93c5fd)' : '1px solid transparent',
                transition: 'all 0.2s ease'
              }}
            >
              <div 
                style={{ 
                  width: '28px', 
                  height: '28px', 
                  borderRadius: '50%', 
                  backgroundColor: badgeBg, 
                  color: iconColor, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}
              >
                {isComplete ? '✓' : isFailed ? '✕' : idx + 1}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {stage.name}
                  </span>
                  <span 
                    style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 8px', 
                      borderRadius: '12px', 
                      backgroundColor: badgeBg, 
                      color: iconColor,
                      fontWeight: 600
                    }}
                  >
                    {isComplete ? 'Completed' : isInProgress ? 'Processing...' : isFailed ? 'Failed' : 'Pending'}
                  </span>
                </div>
                {stage.durationMs !== undefined && (
                  <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Execution time: {stage.durationMs}ms
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
