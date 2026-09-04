import React from 'react';
import { Tag } from 'lucide-react';

export const PACKAGE_SIDES = ['PDP (Front)', 'Back Panel', 'Top Cap / Lid', 'Bottom / Base', 'Left Side', 'Right Side', 'Barcode Area'];

interface ImageSideTaggerProps {
  currentSide: string;
  onSelectSide: (side: string) => void;
}

export const ImageSideTagger: React.FC<ImageSideTaggerProps> = ({ currentSide, onSelectSide }) => {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
        <Tag size={14} color="var(--color-primary)" />
        <span>Active Package Face Tag:</span>
      </div>

      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
        {PACKAGE_SIDES.map(side => {
          const isSelected = side === currentSide;
          return (
            <button
              key={side}
              type="button"
              onClick={() => onSelectSide(side)}
              className={`btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              {side}
            </button>
          );
        })}
      </div>
    </div>
  );
};
