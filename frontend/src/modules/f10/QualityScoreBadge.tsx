import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';

interface QualityScoreBadgeProps {
  score: number; // 0 - 100
  label?: string;
}

export const QualityScoreBadge: React.FC<QualityScoreBadgeProps> = ({ score, label }) => {
  const isHigh = score >= 85;
  const isMed = score >= 65 && score < 85;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        padding: '0.35rem 0.75rem',
        borderRadius: '999px',
        background: isHigh ? '#ecfdf5' : isMed ? '#fffbeb' : '#fef2f2',
        border: `1px solid ${isHigh ? '#a7f3d0' : isMed ? '#fde68a' : '#fecaca'}`,
        color: isHigh ? '#065f46' : isMed ? '#92400e' : '#991b1b',
        fontSize: '0.75rem',
        fontWeight: 700
      }}
    >
      {isHigh ? <ShieldCheck size={14} color="#10b981" /> : isMed ? <AlertTriangle size={14} color="#f59e0b" /> : <XCircle size={14} color="#ef4444" />}
      <span>{label ? `${label}: ` : ''}{score}% Quality</span>
    </div>
  );
};
