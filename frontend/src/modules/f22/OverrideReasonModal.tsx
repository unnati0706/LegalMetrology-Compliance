import React, { useState } from 'react';
import { CheckResult } from '../../shared/types/index.js';
import { AlertTriangle, CheckCircle, X } from 'lucide-react';

interface OverrideReasonModalProps {
  item: CheckResult;
  decision: 'CONFIRM_PASS' | 'CONFIRM_FLAG';
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
  isSubmitting?: boolean;
}

export const OverrideReasonModal: React.FC<OverrideReasonModalProps> = ({
  item,
  decision,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting = false,
}) => {
  const [reason, setReason] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isPass = decision === 'CONFIRM_PASS';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim() || reason.trim().length < 8) {
      setError('Statutory audit rationale must be at least 8 characters long.');
      return;
    }
    setError(null);
    onSubmit(reason);
  };

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isPass ? 'var(--color-pass-bg)' : 'var(--color-flag-bg)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {isPass ? (
              <CheckCircle size={22} color="var(--color-pass-solid)" />
            ) : (
              <AlertTriangle size={22} color="var(--color-flag-solid)" />
            )}
            <h3 style={{ fontSize: '1.1rem', color: isPass ? 'var(--color-pass-text)' : 'var(--color-flag-text)' }}>
              {isPass ? 'Confirm Compliance (PASS)' : 'Confirm Non-Compliance (FLAG)'}
            </h3>
          </div>
          <button 
            onClick={onClose} 
            disabled={isSubmitting}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem', backgroundColor: 'var(--bg-app)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>{item.ruleTitle}</div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{item.legalReference}</div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Inspector / Supervisor Justification Reason <span style={{ color: 'var(--color-flag-solid)' }}>*</span>
            </label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder={isPass 
                ? "E.g., Verified physical packaging under magnification; declaration is clearly legible at 4.2mm height."
                : "E.g., Confirmed missing mandatory unit sale price on retail commodity exceeding 100g."
              }
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              disabled={isSubmitting}
            />
            {error && (
              <span style={{ color: 'var(--color-flag-solid)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                {error}
              </span>
            )}
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              This explanation is written to the immutable statutory audit log.
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} disabled={isSubmitting} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`btn ${isPass ? 'btn-success' : 'btn-danger'}`}
            >
              {isSubmitting ? 'Recording Audit...' : (isPass ? 'Confirm & Mark PASS' : 'Confirm & Mark FLAG')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
