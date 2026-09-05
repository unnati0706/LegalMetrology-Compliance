import React from 'react';

interface FormatValidationBadgeProps {
  isValid: boolean;
  remarks?: string;
}

export const FormatValidationBadge: React.FC<FormatValidationBadgeProps> = ({ isValid, remarks }) => {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: isValid ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        color: isValid ? 'var(--success-700, #047857)' : 'var(--danger-700, #b91c1c)',
        border: isValid ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)'
      }}
      title={remarks || (isValid ? 'Format matches Rule 6(1) syntax' : 'Format syntax defective')}
    >
      <span>{isValid ? '✓ Valid Format' : '✕ Format Error'}</span>
    </span>
  );
};
