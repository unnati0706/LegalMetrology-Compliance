import React, { useState } from 'react';
import { UploadCloud, CheckCircle, AlertCircle, FileImage, ShieldCheck } from 'lucide-react';
import { ArtworkVersion } from '../../shared/types/index.js';

interface ArtworkUploadPanelProps {
  productId: string;
  onUpload: (versionData: Partial<ArtworkVersion>) => Promise<void>;
  disabled?: boolean;
}

export const ArtworkUploadPanel: React.FC<ArtworkUploadPanelProps> = ({
  productId,
  onUpload,
  disabled = false,
}) => {
  const [versionTag, setVersionTag] = useState('');
  const [packageSide, setPackageSide] = useState<ArtworkVersion['packageSide']>('PDP');
  const [dimensions, setDimensions] = useState('180 x 240 mm');
  const [dpi, setDpi] = useState(300);
  const [changeSummary, setChangeSummary] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading || disabled) return;
    setIsUploading(true);
    try {
      await onUpload({
        version: versionTag || undefined,
        packageSide,
        dimensions,
        dpi,
        changeSummary: changeSummary || 'Packaging artwork revision for pre-compliance screening.',
        status: 'DRAFT',
      });
      setVersionTag('');
      setChangeSummary('');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
        <UploadCloud size={16} color="var(--color-primary-light)" />
        <span>Upload Packaging Artwork Revision</span>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Version Code
            </label>
            <input
              type="text"
              placeholder="e.g. v2.2 (Auto if blank)"
              value={versionTag}
              onChange={(e) => setVersionTag(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Package Face Side
            </label>
            <select
              value={packageSide}
              onChange={(e) => setPackageSide(e.target.value as ArtworkVersion['packageSide'])}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            >
              <option value="PDP">Principal Display Panel (PDP)</option>
              <option value="FRONT">Front Face</option>
              <option value="BACK">Back Declarations Panel</option>
              <option value="TOP">Top Lid / Cap Face</option>
              <option value="ALL_SIDES">Flat Artwork Composite</option>
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Dimensions
            </label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
              Print Resolution (DPI)
            </label>
            <input
              type="number"
              value={dpi}
              onChange={(e) => setDpi(Number(e.target.value))}
              className="form-input"
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.5rem' }}
            />
          </div>
        </div>

        <div>
          <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
            Remediation / Change Log Summary
          </label>
          <textarea
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            rows={2}
            placeholder="Describe declarations adjusted (e.g., enlarged unit sale price font to 4.0mm)..."
            className="form-input"
            style={{ fontSize: '0.8rem', resize: 'vertical' }}
          />
        </div>

        <button
          type="submit"
          disabled={isUploading || disabled}
          className="btn btn-primary"
          style={{ fontSize: '0.8rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <UploadCloud size={14} />
          <span>Upload & Queue for AI Self-Scan</span>
        </button>
      </form>
    </div>
  );
};
