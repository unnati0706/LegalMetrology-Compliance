import React from 'react';

interface ConfidenceBadgeProps {
  confidence: number; // 0.0 - 1.0 or 0 - 100
  showLabel?: boolean;
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ confidence, showLabel = true }) => {
  // Normalize to 0-100
  const normalized = confidence <= 1.0 ? Math.round(confidence * 100) : Math.round(confidence);

  let bg = 'rgba(16, 185, 129, 0.12)';
  let color = 'var(--success-700, #047857)';
  let border = '1px solid rgba(16, 185, 129, 0.3)';
  let level = 'High';

  if (normalized < 70) {
    bg = 'rgba(239, 68, 68, 0.12)';
    color = 'var(--danger-700, #b91c1c)';
    border = '1px solid rgba(239, 68, 68, 0.3)';
    level = 'Low';
  } else if (normalized < 85) {
    bg = 'rgba(245, 158, 11, 0.12)';
    color = 'var(--warning-700, #b45309)';
    border = '1px solid rgba(245, 158, 11, 0.3)';
    level = 'Medium';
  }

  return (
    <span 
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: '3px 8px',
        borderRadius: '12px',
        backgroundColor: bg,
        color: color,
        border: border,
        fontSize: '0.75rem',
        fontWeight: 600,
        whiteSpace: 'nowrap'
      }}
      title={`AI Extraction Confidence: ${normalized}% (${level})`}
    >
      <span 
        style={{ 
          width: '6px', 
          height: '6px', 
          borderRadius: '50%', 
          backgroundColor: color 
        }} 
      />
      {normalized}% {showLabel && `(${level})`}
    </span>
  );
};
