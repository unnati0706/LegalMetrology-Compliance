import React from 'react';

interface SeverityTagProps {
  severity: 'CRITICAL' | 'MAJOR' | 'MINOR';
}

export const SeverityTag: React.FC<SeverityTagProps> = ({ severity }) => {
  let bg = 'rgba(239, 68, 68, 0.12)';
  let color = 'var(--danger-700, #b91c1c)';
  let border = '1px solid rgba(239, 68, 68, 0.3)';

  if (severity === 'MAJOR') {
    bg = 'rgba(249, 115, 22, 0.12)';
    color = 'var(--warning-700, #c2410c)';
    border = '1px solid rgba(249, 115, 22, 0.3)';
  } else if (severity === 'MINOR') {
    bg = 'rgba(234, 179, 8, 0.12)';
    color = 'var(--warning-800, #854d0e)';
    border = '1px solid rgba(234, 179, 8, 0.3)';
  }

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '2px 8px',
        borderRadius: '12px',
        backgroundColor: bg,
        color: color,
        border: border,
        fontSize: '0.75rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.025em'
      }}
    >
      {severity}
    </span>
  );
};
