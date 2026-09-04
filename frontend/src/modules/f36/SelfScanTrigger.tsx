import React, { useState } from 'react';
import { Play, Sparkles, RefreshCw, CheckCircle2, AlertCircle } from 'lucide-react';
import { ArtworkVersion } from '../../shared/types';

interface SelfScanTriggerProps {
  artworks: ArtworkVersion[];
  selectedArtworkId?: string;
  onSelectArtwork: (artworkId: string) => void;
  onRunScan: (artworkId: string) => Promise<void>;
  isScanning: boolean;
  lastScore?: number;
}

export const SelfScanTrigger: React.FC<SelfScanTriggerProps> = ({
  artworks,
  selectedArtworkId,
  onSelectArtwork,
  onRunScan,
  isScanning,
  lastScore
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    selectedArtworkId || (artworks[0]?.id || '')
  );

  const handleSelect = (id: string) => {
    setSelectedId(id);
    onSelectArtwork(id);
  };

  const currentArtwork = artworks.find(a => a.id === selectedId) || artworks[0];

  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <Sparkles size={20} color="var(--color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>AI Pre-Compliance Self-Scan</h3>
          </div>
          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Run pre-release verification against statutory Legal Metrology PCR 2011 rules before printing.
          </p>
        </div>

        {lastScore !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 1rem', background: lastScore >= 90 ? '#ecfdf5' : '#fef2f2', borderRadius: '8px', border: `1px solid ${lastScore >= 90 ? '#a7f3d0' : '#fecaca'}` }}>
            {lastScore >= 90 ? <CheckCircle2 size={20} color="#059669" /> : <AlertCircle size={20} color="#dc2626" />}
            <div>
              <div style={{ fontSize: '0.75rem', color: lastScore >= 90 ? '#065f46' : '#991b1b', fontWeight: 500 }}>Previous Scan Score</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: lastScore >= 90 ? '#047857' : '#b91c1c' }}>{lastScore}%</div>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem', alignItems: 'center' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.4rem' }}>
            Select Artwork Version for Scan:
          </label>
          <select
            value={selectedId}
            onChange={(e) => handleSelect(e.target.value)}
            disabled={isScanning}
            className="input-select"
            style={{ width: '100%', padding: '0.625rem 0.75rem', borderRadius: '6px', border: '1px solid var(--color-border)', background: 'var(--color-background)', fontSize: '0.875rem' }}
          >
            {artworks.map(a => (
              <option key={a.id} value={a.id}>
                {a.version} - {a.packageSide} ({a.status})
              </option>
            ))}
          </select>
        </div>

        {currentArtwork && (
          <div style={{ padding: '0.625rem 0.875rem', background: 'var(--color-background)', borderRadius: '6px', border: '1px solid var(--color-border)', fontSize: '0.8125rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Specs: </span>
            <strong>{currentArtwork.dimensions}</strong> | {currentArtwork.dpi} DPI
            <div style={{ color: 'var(--color-text-secondary)', marginTop: '0.2rem', fontSize: '0.75rem' }}>
              Uploaded: {new Date(currentArtwork.uploadedAt).toLocaleDateString()}
            </div>
          </div>
        )}

        <div>
          <button
            onClick={() => onRunScan(selectedId)}
            disabled={isScanning}
            className="btn btn-primary"
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.9375rem',
              cursor: isScanning ? 'not-allowed' : 'pointer'
            }}
          >
            {isScanning ? (
              <>
                <RefreshCw size={18} className="spin" />
                Scanning Declarations...
              </>
            ) : (
              <>
                <Play size={18} />
                Run Pre-Compliance Scan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
