import React from 'react';

interface ConfidenceMeterProps {
  score: number; // 0 - 100
  title?: string;
  subtitle?: string;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  title = 'Compliance Confidence Score',
  subtitle = 'Deterministic Rule Engine Result'
}) => {
  const isHigh = score >= 85;
  const isMedium = score >= 60 && score < 85;

  const strokeColor = isHigh ? '#10b981' : isMedium ? '#f59e0b' : '#ef4444';
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ position: 'relative', width: '90px', height: '90px', flexShrink: 0 }}>
        <svg width="90" height="90" viewBox="0 0 90 90" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke="var(--surface-border, #e2e8f0)"
            strokeWidth="8"
            fill="transparent"
          />
          <circle
            cx="45"
            cy="45"
            r={radius}
            stroke={strokeColor}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column'
          }}
        >
          <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {score}%
          </span>
        </div>
      </div>

      <div>
        <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {subtitle}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
          <span 
            style={{ 
              fontWeight: 600, 
              color: strokeColor,
              backgroundColor: isHigh ? 'rgba(16, 185, 129, 0.1)' : isMedium ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              padding: '2px 8px',
              borderRadius: '12px'
            }}
          >
            {isHigh ? 'HIGH FIDELITY' : isMedium ? 'MODERATE CERTAINTY' : 'REQUIRES INSPECTION REVIEW'}
          </span>
        </div>
      </div>
    </div>
  );
};
