import React from 'react';
import { BoundingBox, CheckResult, Declaration } from '../../shared/types/index.js';

interface BoundingBoxOverlayProps {
  boundingBox: BoundingBox;
  label: string;
  status?: 'PASS' | 'FLAG' | 'MANUAL_REVIEW' | 'DETECTED' | 'VERIFIED' | 'CORRECTED' | 'MISSING' | 'REJECTED';
  isSelected?: boolean;
  onClick?: () => void;
}

export const BoundingBoxOverlay: React.FC<BoundingBoxOverlayProps> = ({
  boundingBox,
  label,
  status = 'DETECTED',
  isSelected = false,
  onClick
}) => {
  const isFlag = status === 'FLAG';
  const isReview = status === 'MANUAL_REVIEW';
  const isPass = status === 'PASS';

  const borderColor = isFlag 
    ? '#ef4444' 
    : isReview 
    ? '#f59e0b' 
    : isPass 
    ? '#10b981' 
    : isSelected 
    ? '#3b82f6' 
    : '#60a5fa';

  const bgColor = isFlag 
    ? 'rgba(239, 68, 68, 0.18)' 
    : isReview 
    ? 'rgba(245, 158, 11, 0.18)' 
    : isPass 
    ? 'rgba(16, 185, 129, 0.18)' 
    : 'rgba(59, 130, 246, 0.15)';

  const top = `${boundingBox.ymin * 100}%`;
  const left = `${boundingBox.xmin * 100}%`;
  const width = `${(boundingBox.xmax - boundingBox.xmin) * 100}%`;
  const height = `${(boundingBox.ymax - boundingBox.ymin) * 100}%`;

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
      style={{
        position: 'absolute',
        top,
        left,
        width,
        height,
        border: `2px solid ${borderColor}`,
        backgroundColor: bgColor,
        borderRadius: '4px',
        cursor: 'pointer',
        boxShadow: isSelected ? `0 0 0 2px #ffffff, 0 0 0 4px ${borderColor}` : 'none',
        zIndex: isSelected ? 20 : 10,
        transition: 'all 0.15s ease'
      }}
    >
      <span
        style={{
          position: 'absolute',
          top: '-22px',
          left: '0',
          backgroundColor: borderColor,
          color: '#ffffff',
          fontSize: '0.7rem',
          fontWeight: 700,
          padding: '2px 6px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
          pointerEvents: 'none'
        }}
      >
        {label} {status !== 'DETECTED' && `(${status})`}
      </span>
    </div>
  );
};
