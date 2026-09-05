import React from 'react';
import { ArtworkVersion } from '../../shared/types';
import { History, Calendar, CheckCircle2, AlertCircle, FileText, ArrowUpRight } from 'lucide-react';

interface ProductComplianceHistoryTimelineProps {
  artworks: ArtworkVersion[];
  onSelectVersion?: (version: string) => void;
}

export const ProductComplianceHistoryTimeline: React.FC<ProductComplianceHistoryTimelineProps> = ({
  artworks,
  onSelectVersion
}) => {
  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
        <History size={20} color="var(--color-primary)" />
        <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Packaging Artwork & Compliance Timeline</h3>
      </div>

      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--color-border)' }}>
        {artworks.map((art, index) => {
          const isLatest = index === 0;
          const isApproved = art.status === 'APPROVED_FOR_PRINT';

          return (
            <div
              key={art.id}
              style={{
                position: 'relative',
                marginBottom: index === artworks.length - 1 ? 0 : '1.75rem',
                paddingLeft: '1rem'
              }}
            >
              {/* Bullet node */}
              <div
                style={{
                  position: 'absolute',
                  left: '-2.05rem',
                  top: '0.2rem',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: isApproved ? '#10b981' : isLatest ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                  border: '3px solid var(--color-surface)',
                  boxShadow: '0 0 0 2px var(--color-border)'
                }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700 }}>Version {art.version}</span>
                    <span className={`badge ${isApproved ? 'badge-success' : 'badge-primary'}`}>
                      {art.status}
                    </span>
                    {isLatest && <span className="badge badge-secondary">Active Batch</span>}
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={13} />
                    <span>Uploaded on {new Date(art.uploadedAt).toLocaleString()} by {art.uploadedBy}</span>
                  </div>
                </div>

                {onSelectVersion && (
                  <button
                    onClick={() => onSelectVersion(art.version)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
                  >
                    View Details <ArrowUpRight size={12} />
                  </button>
                )}
              </div>

              <div style={{ marginTop: '0.6rem', padding: '0.75rem', background: 'var(--color-background)', borderRadius: '6px', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 500, color: 'var(--color-text)' }}>{art.changeSummary}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                  Specifications: {art.dimensions} • {art.dpi} DPI • Side: {art.packageSide}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
