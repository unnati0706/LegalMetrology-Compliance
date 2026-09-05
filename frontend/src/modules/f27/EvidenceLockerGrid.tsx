import React, { useState } from 'react';
import { EvidenceLockerFile } from '../../shared/types/index.js';
import { Image as ImageIcon, Eye, HardDrive, Hash, CheckCircle, Tag, Maximize2, X, Download } from 'lucide-react';

interface EvidenceLockerGridProps {
  files: EvidenceLockerFile[];
}

export const EvidenceLockerGrid: React.FC<EvidenceLockerGridProps> = ({ files }) => {
  const [activePreview, setActivePreview] = useState<EvidenceLockerFile | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {files.map((file) => (
          <div 
            key={file.id} 
            className="card"
            style={{
              padding: 0,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              border: '1px solid var(--border-color)'
            }}
          >
            {/* Image Container with overlay */}
            <div style={{ position: 'relative', height: '180px', backgroundColor: '#020617' }}>
              <img
                src={file.imageUrl}
                alt={file.fileName}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
              />
              <div style={{
                position: 'absolute',
                top: '0.5rem',
                left: '0.5rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(15, 23, 42, 0.85)',
                color: '#38bdf8',
                fontSize: '0.75rem',
                fontWeight: 700,
                backdropFilter: 'blur(4px)'
              }}>
                {file.packageSide}
              </div>

              <div style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                padding: '0.2rem 0.5rem',
                borderRadius: '4px',
                backgroundColor: 'rgba(22, 101, 52, 0.85)',
                color: '#86efac',
                fontSize: '0.75rem',
                fontWeight: 700,
                backdropFilter: 'blur(4px)'
              }}>
                Quality: {Math.round(file.qualityScore * 100)}%
              </div>

              <button
                type="button"
                onClick={() => setActivePreview(file)}
                style={{
                  position: 'absolute',
                  bottom: '0.5rem',
                  right: '0.5rem',
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(15, 23, 42, 0.85)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.2)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backdropFilter: 'blur(4px)'
                }}
              >
                <Maximize2 size={13} /> View Full Res
              </button>
            </div>

            {/* Metadata Section */}
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>
                {file.fileName}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>{file.resolution}</span>
                <span>{file.fileSize}</span>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.25rem' }}>
                {file.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.7rem',
                      padding: '0.1rem 0.4rem',
                      borderRadius: '4px',
                      backgroundColor: 'rgba(99, 102, 241, 0.1)',
                      color: '#a5b4fc',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.2rem'
                    }}
                  >
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>

              {/* SHA-256 snippet */}
              <div style={{
                marginTop: 'auto',
                paddingTop: '0.5rem',
                borderTop: '1px solid var(--border-color)',
                fontSize: '0.7rem',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                fontFamily: 'monospace'
              }}>
                <Hash size={12} color="var(--color-primary-light)" />
                <span title={file.sha256Hash}>{file.sha256Hash.substring(0, 18)}...</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Full Resolution Modal Preview */}
      {activePreview && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem'
          }}
          onClick={() => setActivePreview(null)}
        >
          <div 
            style={{
              backgroundColor: 'var(--bg-surface-elevated)',
              borderRadius: 'var(--radius-lg)',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-xl)',
              border: '1px solid var(--border-color)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>
                  Evidence Locker: {activePreview.fileName}
                </h3>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Captured: {new Date(activePreview.capturedAt).toLocaleString()} • {activePreview.resolution} • {activePreview.fileSize}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActivePreview(null)}
                className="btn btn-secondary"
                style={{ padding: '0.35rem 0.5rem' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{
              padding: '1rem',
              backgroundColor: '#020617',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'auto',
              maxHeight: '60vh'
            }}>
              <img
                src={activePreview.imageUrl}
                alt={activePreview.fileName}
                style={{ maxWidth: '100%', maxHeight: '55vh', objectFit: 'contain', borderRadius: '4px' }}
              />
            </div>

            <div style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                SHA-256 Digest: {activePreview.sha256Hash}
              </div>
              <a
                href={activePreview.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
              >
                <Download size={14} /> Open Original Asset
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
