import React from 'react';
import { QualityScoreBadge } from '../f10/QualityScoreBadge';
import { CheckCircle2, Trash2, Image as ImageIcon, Eye } from 'lucide-react';

export interface CapturedPhoto {
  id: string;
  side: string;
  url: string;
  size: string;
  qualityScore: number;
  timestamp: string;
}

interface UploadProgressListProps {
  photos: CapturedPhoto[];
  onRemovePhoto: (id: string) => void;
  onPreviewPhoto?: (photo: CapturedPhoto) => void;
}

export const UploadProgressList: React.FC<UploadProgressListProps> = ({
  photos,
  onRemovePhoto,
  onPreviewPhoto
}) => {
  if (photos.length === 0) {
    return (
      <div style={{ padding: '1.5rem', textAlign: 'center', background: 'var(--color-background)', border: '1px dashed var(--color-border)', borderRadius: '10px', color: 'var(--color-text-secondary)', fontSize: '0.8125rem' }}>
        No photos captured yet. Capture PDP (Front) and Back Panel to proceed with AI analysis.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {photos.map(photo => (
        <div
          key={photo.id}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: '8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={photo.url}
              alt={photo.side}
              style={{ width: '48px', height: '48px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--color-border)' }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{photo.side}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
                {photo.size} • {new Date(photo.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <QualityScoreBadge score={photo.qualityScore} />

            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626', padding: '0.3rem' }}
              title="Remove photo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
