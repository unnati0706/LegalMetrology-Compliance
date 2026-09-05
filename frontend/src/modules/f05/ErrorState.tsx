import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Failed to Load Statutory Data',
  message,
  onRetry
}) => {
  return (
    <div
      className="card"
      style={{
        padding: '2rem',
        textAlign: 'center',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '12px',
        margin: '1rem 0'
      }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: '#fee2e2',
          color: '#dc2626',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem'
        }}
      >
        <AlertCircle size={24} />
      </div>

      <h3 style={{ margin: '0 0 0.35rem', fontSize: '1.1rem', fontWeight: 600, color: '#991b1b' }}>
        {title}
      </h3>
      <p style={{ margin: '0 0 1.25rem', fontSize: '0.875rem', color: '#7f1d1d', maxWidth: '500px', marginInline: 'auto' }}>
        {message}
      </p>

      {onRetry && (
        <button
          onClick={onRetry}
          className="btn btn-outline"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', borderColor: '#fca5a5', color: '#991b1b', background: '#fff' }}
        >
          <RefreshCw size={14} /> Retry Operation
        </button>
      )}
    </div>
  );
};
