import React from 'react';
import { DispositionType } from './DispositionSelector.js';
import { Lock, AlertOctagon, CheckCircle2, RefreshCw, X } from 'lucide-react';

interface FinalizeConfirmModalProps {
  productName: string;
  disposition: DispositionType;
  remarks: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
}

export const FinalizeConfirmModal: React.FC<FinalizeConfirmModalProps> = ({
  productName,
  disposition,
  remarks,
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-app)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Lock size={20} color="var(--color-primary-500)" />
            <h3 style={{ fontSize: '1.1rem' }}>Finalize & Lock Inspection Record</h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{
            backgroundColor: disposition === 'COMPLIANT' ? 'var(--color-pass-bg)' : (disposition === 'NON_COMPLIANT' ? 'var(--color-flag-bg)' : 'var(--color-review-bg)'),
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${disposition === 'COMPLIANT' ? 'var(--color-pass-border)' : (disposition === 'NON_COMPLIANT' ? 'var(--color-flag-border)' : 'var(--color-review-border)')}`,
          }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Selected Final Disposition</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              {disposition.replace('_', ' ')}
            </div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.35rem', color: 'var(--text-main)' }}>
              Product: <strong>{productName}</strong>
            </div>
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Warning: Once finalized, all declaration findings, OCR extractions, and violation determinations will be cryptographically locked with an immutable SHA-256 audit seal.
          </p>

          {remarks && (
            <div style={{ backgroundColor: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.2rem' }}>Officer Sign-off Remarks:</div>
              <div style={{ fontStyle: 'italic' }}>"{remarks}"</div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-secondary">
              Go Back
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              disabled={isSubmitting}
              className="btn btn-primary"
            >
              {isSubmitting ? 'Signing & Locking...' : 'Authorize & Sign-off'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
