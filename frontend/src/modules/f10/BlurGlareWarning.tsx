import React from 'react';
import { Sun, AlertTriangle, Eye, ShieldAlert } from 'lucide-react';

interface BlurGlareWarningProps {
  hasBlur?: boolean;
  hasGlare?: boolean;
  skewAngle?: number;
}

export const BlurGlareWarning: React.FC<BlurGlareWarningProps> = ({
  hasBlur = false,
  hasGlare = false,
  skewAngle = 0
}) => {
  if (!hasBlur && !hasGlare && skewAngle < 3) return null;

  return (
    <div
      style={{
        padding: '0.875rem 1rem',
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: '8px',
        color: '#92400e',
        fontSize: '0.8125rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.35rem',
        margin: '0.75rem 0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
        <AlertTriangle size={16} color="#d97706" />
        <span>Image Evidentiary Warning</span>
      </div>

      {hasBlur && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Eye size={14} /> Text declarations appear slightly blurred. Optical character accuracy may degrade.
        </div>
      )}

      {hasGlare && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Sun size={14} /> Reflection / specular glare detected over price declaration block.
        </div>
      )}

      {skewAngle >= 3 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ShieldAlert size={14} /> Package surface is angled at {skewAngle}°. Hold camera parallel to Principal Display Panel.
        </div>
      )}
    </div>
  );
};
