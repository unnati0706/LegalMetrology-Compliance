import React from 'react';

interface ProcessingFailureRetryProps {
  errorMessage?: string;
  onRetry: () => void;
  onManualReviewFallback: () => void;
  isRetrying?: boolean;
}

export const ProcessingFailureRetry: React.FC<ProcessingFailureRetryProps> = ({
  errorMessage = 'Optical character recognition pipeline encountered high glare on Back panel image.',
  onRetry,
  onManualReviewFallback,
  isRetrying = false
}) => {
  return (
    <div 
      className="card" 
      style={{ 
        padding: '1.5rem', 
        marginBottom: '1.5rem',
        border: '1px solid var(--danger-300, #fca5a5)',
        backgroundColor: 'var(--danger-50, #fef2f2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
        <div 
          style={{ 
            width: '36px', 
            height: '36px', 
            borderRadius: '50%', 
            backgroundColor: 'var(--danger-100, #fee2e2)',
            color: 'var(--danger-600, #dc2626)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: '1.2rem',
            flexShrink: 0
          }}
        >
          !
        </div>
        <div>
          <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--danger-800, #991b1b)', fontWeight: 600 }}>
            Processing Stalled or Incomplete
          </h4>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--danger-700, #b91c1c)' }}>
            {errorMessage}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
        <button 
          onClick={onManualReviewFallback}
          className="btn btn-secondary"
          style={{ fontSize: '0.85rem' }}
        >
          Skip to Manual Entry
        </button>
        <button 
          onClick={onRetry} 
          disabled={isRetrying}
          className="btn btn-primary"
          style={{ fontSize: '0.85rem' }}
        >
          {isRetrying ? 'Retrying OCR...' : 'Retry Pipeline'}
        </button>
      </div>
    </div>
  );
};
