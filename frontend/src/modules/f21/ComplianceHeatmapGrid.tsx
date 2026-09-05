import React, { useState } from 'react';
import { CheckResult, Declaration, EvidenceItem } from '../../shared/types/index.js';
import { ZoomIn, ZoomOut, Eye, Layers, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ComplianceHeatmapGridProps {
  evidence: EvidenceItem[];
  checks: CheckResult[];
  declarations: Declaration[];
}

export const ComplianceHeatmapGrid: React.FC<ComplianceHeatmapGridProps> = ({
  evidence,
  checks,
  declarations,
}) => {
  const [selectedSide, setSelectedSide] = useState<string>(evidence[0]?.packageSide || 'BACK');
  const [zoom, setZoom] = useState<number>(1);
  const [overlayOpacity, setOverlayOpacity] = useState<number>(0.75);
  const [activeItem, setActiveItem] = useState<{ check?: CheckResult; dec?: Declaration } | null>(null);

  const currentEvidence = evidence.find(e => e.packageSide === selectedSide) || evidence[0];
  const sideChecks = checks.filter(c => c.packageSide === selectedSide || (!c.packageSide && selectedSide === 'BACK'));

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'PASS':
        return { border: '#10b981', fill: 'rgba(16, 185, 129, 0.25)', text: '#065f46', badge: 'badge-pass' };
      case 'FLAG':
        return { border: '#ef4444', fill: 'rgba(239, 68, 68, 0.35)', text: '#991b1b', badge: 'badge-flag' };
      case 'MANUAL_REVIEW':
        return { border: '#f59e0b', fill: 'rgba(245, 158, 11, 0.35)', text: '#92400e', badge: 'badge-review' };
      default:
        return { border: '#6366f1', fill: 'rgba(99, 102, 241, 0.25)', text: '#3730a3', badge: 'badge-neutral' };
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem', alignItems: 'start' }}>
      {/* Left Canvas Viewport */}
      <div className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {/* Controls Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {evidence.map((ev) => (
              <button
                key={ev.id}
                onClick={() => {
                  setSelectedSide(ev.packageSide);
                  setActiveItem(null);
                }}
                className={`btn btn-sm ${selectedSide === ev.packageSide ? 'btn-primary' : 'btn-secondary'}`}
              >
                <Layers size={14} />
                {ev.packageSide}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <Eye size={15} />
              <span>Opacity:</span>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                value={overlayOpacity}
                onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                style={{ width: '80px', cursor: 'pointer' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button 
                onClick={() => setZoom(Math.max(0.6, zoom - 0.2))} 
                className="btn btn-secondary btn-sm"
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <button 
                onClick={() => setZoom(1)} 
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.75rem', minWidth: '45px' }}
              >
                {Math.round(zoom * 100)}%
              </button>
              <button 
                onClick={() => setZoom(Math.min(2.5, zoom + 0.2))} 
                className="btn btn-secondary btn-sm"
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Visual Heatmap Canvas */}
        <div style={{
          position: 'relative',
          overflow: 'auto',
          minHeight: '480px',
          maxHeight: '620px',
          backgroundColor: '#0f172a',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
        }}>
          {currentEvidence ? (
            <div style={{
              position: 'relative',
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease',
              display: 'inline-block',
              maxWidth: '100%',
            }}>
              <img
                src={currentEvidence.imageUrl}
                alt={`${selectedSide} Package View`}
                style={{
                  display: 'block',
                  maxWidth: '520px',
                  maxHeight: '480px',
                  borderRadius: 'var(--radius-sm)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  objectFit: 'contain'
                }}
              />

              {/* Bounding Box Overlays */}
              {sideChecks.map((chk) => {
                const box = chk.boundingBox;
                if (!box) return null;
                const colors = getStatusColor(chk.status);
                const isSelected = activeItem?.check?.id === chk.id;

                const top = `${box.ymin * 100}%`;
                const left = `${box.xmin * 100}%`;
                const height = `${(box.ymax - box.ymin) * 100}%`;
                const width = `${(box.xmax - box.xmin) * 100}%`;

                return (
                  <div
                    key={chk.id}
                    onClick={() => setActiveItem({ check: chk })}
                    style={{
                      position: 'absolute',
                      top,
                      left,
                      height,
                      width,
                      border: `2px ${chk.status === 'PASS' ? 'solid' : 'dashed'} ${colors.border}`,
                      backgroundColor: colors.fill,
                      opacity: overlayOpacity,
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 0 0 3px #ffffff, 0 0 12px ${colors.border}` : 'none',
                      zIndex: isSelected ? 10 : 2,
                    }}
                    title={`${chk.ruleTitle} (${chk.status})`}
                  >
                    <div style={{
                      position: 'absolute',
                      top: '-18px',
                      left: 0,
                      backgroundColor: colors.border,
                      color: 'white',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '1px 5px',
                      borderRadius: '3px',
                      whiteSpace: 'nowrap',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }}>
                      {chk.ruleCode}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>No evidence image uploaded for {selectedSide}</div>
          )}
        </div>
      </div>

      {/* Right Information & Finding Inspector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Layers size={18} color="var(--color-primary-500)" />
            {selectedSide} Side Declarations ({sideChecks.length})
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {sideChecks.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No bounding checks assigned to this side.</div>
            ) : (
              sideChecks.map((chk) => {
                const isSelected = activeItem?.check?.id === chk.id;
                const colors = getStatusColor(chk.status);

                return (
                  <div
                    key={chk.id}
                    onClick={() => setActiveItem({ check: chk })}
                    style={{
                      padding: '0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--bg-app)',
                      border: isSelected ? '1.5px solid var(--color-primary-500)' : '1px solid var(--border-light)',
                      cursor: 'pointer',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{chk.ruleTitle}</span>
                      <span className={`badge ${colors.badge}`}>{chk.status}</span>
                    </div>

                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                      {chk.legalReference}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
                      <span>Confidence:</span>
                      <strong style={{ color: chk.confidence < 0.75 ? 'var(--color-review-solid)' : 'var(--color-pass-solid)' }}>
                        {Math.round(chk.confidence * 100)}%
                      </strong>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Finding Detail Drawer */}
        {activeItem?.check && (
          <div className="card" style={{ borderLeft: '4px solid var(--color-primary-500)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-primary-600)', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.5rem' }}>
              <Info size={16} /> Selected Finding Inspector
            </div>

            <h4 style={{ fontSize: '0.95rem', marginBottom: '0.35rem' }}>{activeItem.check.ruleTitle}</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '0.75rem' }}>
              {activeItem.check.explanation}
            </p>

            <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Statutory Reference:</div>
              <div style={{ fontWeight: 600 }}>{activeItem.check.legalReference}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
