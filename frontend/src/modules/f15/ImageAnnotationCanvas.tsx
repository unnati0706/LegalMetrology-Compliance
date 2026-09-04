import React, { useState } from 'react';
import { EvidenceItem, Declaration, CheckResult } from '../../shared/types/index.js';
import { BoundingBoxOverlay } from './BoundingBoxOverlay.js';

interface ImageAnnotationCanvasProps {
  evidence: EvidenceItem[];
  declarations: Declaration[];
  checks: CheckResult[];
  onSelectSide?: (side: string) => void;
}

export const ImageAnnotationCanvas: React.FC<ImageAnnotationCanvasProps> = ({
  evidence,
  declarations,
  checks,
  onSelectSide
}) => {
  const [selectedSide, setSelectedSide] = useState<string>(evidence[0]?.packageSide || 'PDP');
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const activeEvidence = evidence.find(e => e.packageSide === selectedSide) || evidence[0];

  const sideDeclarations = declarations.filter(d => (d.packageSide || 'PDP') === selectedSide && d.boundingBox);
  const sideChecks = checks.filter(c => (c.packageSide || 'PDP') === selectedSide && c.boundingBox);

  const handleSideClick = (side: string) => {
    setSelectedSide(side);
    setSelectedItemId(null);
    if (onSelectSide) onSelectSide(side);
  };

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      {/* Side Selector Tabs */}
      <div 
        style={{ 
          padding: '0.75rem 1.25rem', 
          borderBottom: '1px solid var(--surface-border, #e2e8f0)',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'var(--surface-subtle, #f8fafc)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {evidence.map(e => (
            <button
              key={e.id}
              onClick={() => handleSideClick(e.packageSide)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                fontSize: '0.85rem',
                fontWeight: selectedSide === e.packageSide ? 700 : 500,
                backgroundColor: selectedSide === e.packageSide ? 'var(--primary-600, #2563eb)' : '#ffffff',
                color: selectedSide === e.packageSide ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--surface-border, #e2e8f0)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {e.packageSide} Panel
            </button>
          ))}
        </div>

        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Quality Score: <strong>{activeEvidence?.qualityScore || 90}/100</strong>
        </div>
      </div>

      {/* Main Interactive Canvas & Annotation Area */}
      <div style={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', minHeight: '440px' }}>
        <div 
          style={{ 
            flex: 1, 
            position: 'relative', 
            backgroundColor: '#0f172a', 
            minHeight: '400px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden'
          }}
        >
          {activeEvidence ? (
            <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img
                src={activeEvidence.imageUrl}
                alt={`${selectedSide} Panel Evidence`}
                style={{ maxWidth: '100%', maxHeight: '440px', objectFit: 'contain', display: 'block' }}
              />

              {/* Declaration Bounding Boxes */}
              {sideDeclarations.map(d => (
                d.boundingBox && (
                  <BoundingBoxOverlay
                    key={d.id}
                    boundingBox={d.boundingBox}
                    label={d.field.replace(/_/g, ' ').toUpperCase()}
                    status={d.status}
                    isSelected={selectedItemId === d.id}
                    onClick={() => setSelectedItemId(d.id)}
                  />
                )
              ))}

              {/* Check Findings Bounding Boxes */}
              {sideChecks.map(c => (
                c.boundingBox && (
                  <BoundingBoxOverlay
                    key={c.id}
                    boundingBox={c.boundingBox}
                    label={c.ruleCode}
                    status={c.status}
                    isSelected={selectedItemId === c.id}
                    onClick={() => setSelectedItemId(c.id)}
                  />
                )
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>No evidence image uploaded for this side.</div>
          )}
        </div>

        {/* Sidebar Inspector Findings for Current Side */}
        <div 
          style={{ 
            width: '320px', 
            borderLeft: '1px solid var(--surface-border, #e2e8f0)', 
            padding: '1rem',
            backgroundColor: 'var(--surface-card, #ffffff)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            overflowY: 'auto',
            maxHeight: '440px'
          }}
        >
          <h4 style={{ margin: 0, fontSize: '0.9rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Detected Elements on {selectedSide}
          </h4>

          {sideDeclarations.length === 0 && sideChecks.length === 0 && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              No annotations linked to this package side.
            </p>
          )}

          {sideDeclarations.map(d => (
            <div
              key={d.id}
              onClick={() => setSelectedItemId(d.id)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: selectedItemId === d.id ? '2px solid var(--primary-500, #3b82f6)' : '1px solid var(--surface-border, #e2e8f0)',
                backgroundColor: selectedItemId === d.id ? 'rgba(59, 130, 246, 0.05)' : 'var(--surface-subtle, #f8fafc)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 600 }}>
                <span>{d.field.replace(/_/g, ' ').toUpperCase()}</span>
                <span style={{ color: 'var(--primary-600, #2563eb)' }}>{Math.round(d.confidence * 100)}%</span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                {d.value}
              </p>
            </div>
          ))}

          {sideChecks.map(c => (
            <div
              key={c.id}
              onClick={() => setSelectedItemId(c.id)}
              style={{
                padding: '0.5rem 0.75rem',
                borderRadius: '6px',
                border: selectedItemId === c.id ? '2px solid var(--danger-500, #ef4444)' : '1px solid var(--surface-border, #e2e8f0)',
                backgroundColor: c.status === 'FLAG' ? 'rgba(239, 68, 68, 0.05)' : 'var(--surface-subtle, #f8fafc)',
                cursor: 'pointer'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700 }}>
                <span style={{ color: c.status === 'FLAG' ? 'var(--danger-700, #b91c1c)' : 'var(--text-primary)' }}>
                  {c.ruleCode}
                </span>
                <span>{c.status}</span>
              </div>
              <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {c.explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
