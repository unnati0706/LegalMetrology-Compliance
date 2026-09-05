import React from 'react';
import { Database, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface DataSufficiencyBadgeProps {
  sufficiency: 'SUFFICIENT' | 'MODERATE' | 'SPARSE';
  auditsCount: number;
}

export const DataSufficiencyBadge: React.FC<DataSufficiencyBadgeProps> = ({
  sufficiency,
  auditsCount,
}) => {
  const isSufficient = sufficiency === 'SUFFICIENT';
  const isModerate = sufficiency === 'MODERATE';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.7rem',
        fontWeight: 600,
        padding: '0.15rem 0.45rem',
        borderRadius: '4px',
        backgroundColor: isSufficient ? 'rgba(34, 197, 94, 0.12)' : isModerate ? 'rgba(245, 158, 11, 0.12)' : 'rgba(148, 163, 184, 0.12)',
        color: isSufficient ? '#4ade80' : isModerate ? '#fbbf24' : '#94a3b8',
        border: `1px solid ${isSufficient ? 'rgba(34, 197, 94, 0.25)' : isModerate ? 'rgba(245, 158, 11, 0.25)' : 'rgba(148, 163, 184, 0.25)'}`
      }}
      title={`${auditsCount} historical audits indexed`}
    >
      <Database size={11} />
      <span>{sufficiency === 'SUFFICIENT' ? `Sufficient Data (${auditsCount} Audits)` : sufficiency === 'MODERATE' ? `Moderate History (${auditsCount} Audits)` : 'Sparse / Cold Start'}</span>
    </span>
  );
};
