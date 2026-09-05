import React, { useState } from 'react';

interface EvidenceZoomViewerProps {
  imageUrl: string;
  alt: string;
  zoomLevel?: number;
  onZoomChange?: (newZoom: number) => void;
}

export const EvidenceZoomViewer: React.FC<EvidenceZoomViewerProps> = ({
  imageUrl,
  alt,
  zoomLevel = 1,
  onZoomChange
}) => {
  const [zoom, setZoom] = useState(zoomLevel);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = () => {
    const next = Math.min(zoom + 0.25, 3.0);
    setZoom(next);
    if (onZoomChange) onZoomChange(next);
  };

  const handleZoomOut = () => {
    const next = Math.max(zoom - 0.25, 0.75);
    setZoom(next);
    if (onZoomChange) onZoomChange(next);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    if (onZoomChange) onZoomChange(1);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoom > 1) {
      setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', backgroundColor: '#0f172a', borderRadius: '8px' }}>
      {/* Zoom Controls Overlay */}
      <div 
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '4px',
          backgroundColor: 'rgba(15, 23, 42, 0.85)',
          padding: '4px',
          borderRadius: '6px',
          zIndex: 30,
          backdropFilter: 'blur(4px)'
        }}
      >
        <button 
          onClick={handleZoomIn}
          style={{ background: 'none', border: 'none', color: '#ffffff', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
          title="Zoom In"
        >
          +
        </button>
        <button 
          onClick={handleZoomOut}
          style={{ background: 'none', border: 'none', color: '#ffffff', width: '28px', height: '28px', cursor: 'pointer', fontWeight: 'bold' }}
          title="Zoom Out"
        >
          -
        </button>
        <button 
          onClick={handleReset}
          style={{ background: 'none', border: 'none', color: '#ffffff', padding: '0 6px', fontSize: '0.75rem', cursor: 'pointer' }}
          title="Reset Zoom"
        >
          Reset ({Math.round(zoom * 100)}%)
        </button>
      </div>

      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default'
        }}
      >
        <img
          src={imageUrl}
          alt={alt}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transition: isDragging ? 'none' : 'transform 0.15s ease'
          }}
        />
      </div>
    </div>
  );
};
