import React from 'react';

interface A11yLiveRegionProps {
  message?: string;
  politeness?: 'polite' | 'assertive' | 'off';
}

export const A11yLiveRegion: React.FC<A11yLiveRegionProps> = ({
  message,
  politeness = 'polite'
}) => {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0
      }}
    >
      {message}
    </div>
  );
};
