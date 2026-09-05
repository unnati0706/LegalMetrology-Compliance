import React from 'react';
import { Scan, Focus } from 'lucide-react';

interface FramingOverlayGuideProps {
  sideLabel: string;
}

export const FramingOverlayGuide: React.FC<FramingOverlayGuideProps> = ({ sideLabel }) => {
  return (
    <div
      style={{
        position: 'absolute',
        inset: '1.5rem',
        border: '2px dashed rgba(255, 255, 255, 0.7)',
        borderRadius: '12px',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        zIndex: 10
      }}
    >
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.65)',
          color: '#ffffff',
          padding: '0.25rem 0.75rem',
          borderRadius: '999px',
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          textTransform: 'uppercase'
        }}
      >
        Align {sideLabel} inside bounding box
      </div>

      <div style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
        <Focus size={48} strokeWidth={1} />
      </div>

      <div
        style={{
          background: 'rgba(0, 0, 0, 0.65)',
          color: '#ffffff',
          padding: '0.25rem 0.75rem',
          borderRadius: '6px',
          fontSize: '0.7rem'
        }}
      >
        Hold steady • Ensure MRP, Net Quantity & Date are visible
      </div>
    </div>
  );
};
