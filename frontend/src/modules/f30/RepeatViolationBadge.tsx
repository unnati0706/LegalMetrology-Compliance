import React from 'react';
import { AlertTriangle, AlertOctagon, CheckCircle } from 'lucide-react';

interface RepeatViolationBadgeProps {
  repeatCount: number;
  riskLevel: 'HIGH' | 'MEDIUM' | 'LOW';
}

export const RepeatViolationBadge: React.FC<RepeatViolationBadgeProps> = ({
  repeatCount,
  riskLevel,
}) => {
  if (repeatCount === 0 && riskLevel === 'LOW') {
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        fontSize: '0.75rem',
        fontWeight: 600,
        padding: '0.2rem 0.5rem',
        borderRadius: '4px',
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
        color: '#4ade80'
      }}>
        <CheckCircle size={12} /> Clean Record
      </span>
    );
  }

  const isHigh = riskLevel === 'HIGH' || repeatCount >= 3;
  const isMed = riskLevel === 'MEDIUM' || repeatCount >= 1;

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      fontSize: '0.75rem',
      fontWeight: 700,
      padding: '0.2rem 0.55rem',
      borderRadius: '4px',
      backgroundColor: isHigh ? 'rgba(239, 68, 68, 0.18)' : 'rgba(245, 158, 11, 0.18)',
      color: isHigh ? '#f87171' : '#fbbf24',
      border: `1px solid ${isHigh ? 'rgba(239, 68, 68, 0.35)' : 'rgba(245, 158, 11, 0.35)'}`
    }}>
      {isHigh ? <AlertOctagon size={12} /> : <AlertTriangle size={12} />}
      <span>{repeatCount > 0 ? `${repeatCount}x Repeat Offender` : `${riskLevel} Risk`}</span>
    </span>
  );
};
