import React, { useState } from 'react';

interface LegalReferenceTooltipProps {
  statutoryClause: string;
  statutoryText: string;
}

export const LegalReferenceTooltip: React.FC<LegalReferenceTooltipProps> = ({
  statutoryClause,
  statutoryText
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          background: 'none',
          border: 'none',
          padding: '2px 4px',
          color: 'var(--primary-600, #2563eb)',
          fontSize: '0.8rem',
          fontWeight: 600,
          cursor: 'pointer',
          textDecoration: 'underline'
        }}
      >
        § {statutoryClause}
      </button>

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '0',
            marginBottom: '6px',
            width: '280px',
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            padding: '0.75rem',
            borderRadius: '6px',
            fontSize: '0.8rem',
            lineHeight: 1.4,
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
            zIndex: 50
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: '0.25rem', color: '#93c5fd' }}>
            {statutoryClause}
          </div>
          <div>{statutoryText}</div>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              marginTop: '0.5rem',
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'block',
              textAlign: 'right',
              width: '100%'
            }}
          >
            Dismiss
          </button>
        </div>
      )}
    </span>
  );
};
