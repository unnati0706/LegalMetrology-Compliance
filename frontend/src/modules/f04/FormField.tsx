import React from 'react';
import { AlertCircle, HelpCircle } from 'lucide-react';

interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  tooltip?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  required,
  error,
  tooltip,
  children
}) => {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
        <label
          htmlFor={id}
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: error ? '#dc2626' : 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}
        >
          <span>{label}</span>
          {required && <span style={{ color: '#ef4444' }}>*</span>}
        </label>

        {tooltip && (
          <span
            title={tooltip}
            style={{ cursor: 'help', color: 'var(--color-text-secondary)', display: 'inline-flex', alignItems: 'center' }}
          >
            <HelpCircle size={14} />
          </span>
        )}
      </div>

      <div>{children}</div>

      {error && (
        <div
          id={`${id}-error`}
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            color: '#dc2626',
            fontSize: '0.75rem',
            marginTop: '0.35rem',
            fontWeight: 500
          }}
        >
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
