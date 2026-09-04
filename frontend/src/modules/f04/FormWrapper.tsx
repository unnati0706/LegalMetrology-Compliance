import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

interface FormWrapperProps {
  onSubmit: (e: React.FormEvent) => Promise<void> | void;
  children: React.ReactNode;
  submitLabel?: string;
  isSubmitting?: boolean;
  submitDisabled?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
}

export const FormWrapper: React.FC<FormWrapperProps> = ({
  onSubmit,
  children,
  submitLabel = 'Save & Submit Statutory Form',
  isSubmitting = false,
  submitDisabled = false,
  successMessage,
  errorMessage,
}) => {
  return (
    <form
      onSubmit={onSubmit}
      noValidate
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1.75rem'
      }}
    >
      {successMessage && (
        <div style={{ padding: '0.875rem 1rem', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <CheckCircle2 size={18} color="#059669" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div style={{ padding: '0.875rem 1rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
          <AlertTriangle size={18} color="#dc2626" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div>{children}</div>

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={isSubmitting || submitDisabled}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.5rem',
            fontWeight: 600,
            fontSize: '0.875rem',
            borderRadius: '8px'
          }}
        >
          {isSubmitting ? (
            <>
              <RefreshCw size={16} className="spin" /> Processing...
            </>
          ) : (
            submitLabel
          )}
        </button>
      </div>
    </form>
  );
};
