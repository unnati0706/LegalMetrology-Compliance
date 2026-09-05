import React from 'react';
import { BoundingBox } from '../../shared/types/index.js';

interface SourceEvidenceThumbnailProps {
  packageSide?: string;
  imageUrl?: string;
  boundingBox?: BoundingBox;
  fieldLabel?: string;
  onClick?: () => void;
}

export const SourceEvidenceThumbnail: React.FC<SourceEvidenceThumbnailProps> = ({
  packageSide = 'BACK',
  imageUrl,
  boundingBox,
  fieldLabel,
  onClick
}) => {
  const defaultImage = 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=240&auto=format&fit=crop&q=80';
  const displayUrl = imageUrl || defaultImage;

  return (
    <div 
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '4px 8px',
        borderRadius: '6px',
        backgroundColor: 'var(--surface-subtle, #f8fafc)',
        border: '1px solid var(--surface-border, #e2e8f0)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'border-color 0.2s ease'
      }}
      title={`Source: ${packageSide} panel crop ${boundingBox ? `[${Math.round(boundingBox.xmin * 100)}%, ${Math.round(boundingBox.ymin * 100)}%]` : ''}`}
    >
      <div 
        style={{
          width: '32px',
          height: '24px',
          borderRadius: '4px',
          overflow: 'hidden',
          backgroundColor: '#334155',
          position: 'relative'
        }}
      >
        <img 
          src={displayUrl} 
          alt={fieldLabel || packageSide} 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
        {packageSide}
      </span>
    </div>
  );
};
