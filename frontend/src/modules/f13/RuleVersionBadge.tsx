import React from 'react';

interface RuleVersionBadgeProps {
  version?: string;
  gazetteNotification?: string;
  effectiveDate?: string;
}

export const RuleVersionBadge: React.FC<RuleVersionBadgeProps> = ({
  version = 'PCR-2011-v2.0 (Amended 2022)',
  gazetteNotification = 'G.S.R. 779(E) dated 02/11/2021',
  effectiveDate = '01/01/2022'
}) => {
  return (
    <div 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '6px 12px',
        borderRadius: '8px',
        backgroundColor: 'rgba(59, 130, 246, 0.08)',
        border: '1px solid rgba(59, 130, 246, 0.25)'
      }}
    >
      <div 
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: 'var(--primary-600, #2563eb)'
        }} 
      />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--primary-800, #1e40af)' }}>
          {version}
        </span>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Statutory Gazette: {gazetteNotification} | In Effect: {effectiveDate}
        </span>
      </div>
    </div>
  );
};
