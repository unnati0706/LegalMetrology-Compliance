import React from 'react';
import { ArtworkVersion } from '../../shared/types/index.js';
import { History, ShieldCheck, AlertCircle, Clock, FileText, CheckCircle2 } from 'lucide-react';

interface ArtworkVersionListProps {
  artworks: ArtworkVersion[];
}

export const ArtworkVersionList: React.FC<ArtworkVersionListProps> = ({ artworks }) => {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
          <History size={16} color="var(--color-primary-light)" />
          <span>Packaging Artwork Version History ({artworks.length})</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {artworks.map((art) => {
          const isApproved = art.status === 'APPROVED_FOR_PRINT';
          const isRemediation = art.status === 'NEEDS_REMEDIATION';

          return (
            <div
              key={art.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#020617', flexShrink: 0 }}>
                  <img src={art.imageUrl} alt={art.version} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      {art.version}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      ({art.packageSide}) • {art.dimensions} • {art.dpi} DPI
                    </span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    {art.changeSummary}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.5rem',
                  borderRadius: '4px',
                  backgroundColor: isApproved ? 'rgba(34, 197, 94, 0.15)' : isRemediation ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isApproved ? '#4ade80' : isRemediation ? '#f87171' : '#fbbf24'
                }}>
                  {art.status.replace(/_/g, ' ')}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {new Date(art.uploadedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
