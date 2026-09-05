import React, { useState } from 'react';
import { Inspection, CheckResult } from '../../shared/types/index.js';
import { DispositionSelector, DispositionType } from './DispositionSelector.js';
import { FinalizeConfirmModal } from './FinalizeConfirmModal.js';
import { ShieldCheck, AlertCircle, CheckCircle, FileCheck, Lock } from 'lucide-react';

interface FinalizeInspectionPanelProps {
  inspection: Inspection;
  checks: CheckResult[];
  onFinalize: (disposition: DispositionType, notes?: string) => Promise<void>;
  isSubmitting?: boolean;
}

export const FinalizeInspectionPanel: React.FC<FinalizeInspectionPanelProps> = ({
  inspection,
  checks,
  onFinalize,
  isSubmitting = false,
}) => {
  const pendingReviews = checks.filter(c => c.status === 'MANUAL_REVIEW');
  const flaggedChecks = checks.filter(c => c.status === 'FLAG');
  const passedChecks = checks.filter(c => c.status === 'PASS');

  const defaultDisp: DispositionType = flaggedChecks.length > 0 ? 'NON_COMPLIANT' : 'COMPLIANT';
  const [disposition, setDisposition] = useState<DispositionType>(defaultDisp);
  const [remarks, setRemarks] = useState<string>('');
  const [showModal, setShowModal] = useState<boolean>(false);

  const hasUnresolvedReview = pendingReviews.length > 0;

  const handleConfirm = async () => {
    await onFinalize(disposition, remarks);
    setShowModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Pre-Flight Health Check Card */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="var(--color-primary-500)" />
          Pre-Flight Statutory Check Summary
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ backgroundColor: 'var(--color-pass-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-pass-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-pass-text)', fontWeight: 600 }}>PASSED CHECKS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-pass-solid)' }}>{passedChecks.length}</div>
          </div>

          <div style={{ backgroundColor: 'var(--color-flag-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-flag-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-flag-text)', fontWeight: 600 }}>FLAGGED VIOLATIONS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-flag-solid)' }}>{flaggedChecks.length}</div>
          </div>

          <div style={{ backgroundColor: 'var(--color-review-bg)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-review-border)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--color-review-text)', fontWeight: 600 }}>MANUAL REVIEWS</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-review-solid)' }}>{pendingReviews.length}</div>
          </div>
        </div>

        {/* Blocking Warning if manual reviews are pending */}
        {hasUnresolvedReview && (
          <div style={{
            backgroundColor: 'var(--color-review-bg)',
            border: '1.5px solid var(--color-review-border)',
            color: 'var(--color-review-text)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'start',
            gap: '0.75rem',
            marginBottom: '1rem',
          }}>
            <AlertCircle size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Unresolved Manual Reviews Pending</div>
              <div style={{ fontSize: '0.8rem', marginTop: '0.2rem' }}>
                There are {pendingReviews.length} confidence-gate items requiring reviewer confirmation before this inspection can be finalized as Compliant.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disposition Selection */}
      <div className="card">
        <DispositionSelector
          selectedDisposition={disposition}
          onChange={setDisposition}
          disabled={isSubmitting}
        />

        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label className="form-label">Final Inspector Sign-off Remarks (Optional)</label>
          <textarea
            className="form-textarea"
            rows={3}
            placeholder="Add concluding notes for official compliance record, compounding recommendation, or seizure memo..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            disabled={isSubmitting}
            className="btn btn-primary btn-lg"
          >
            <Lock size={18} />
            Finalize & Sign Inspection
          </button>
        </div>
      </div>

      {showModal && (
        <FinalizeConfirmModal
          productName={inspection.productName}
          disposition={disposition}
          remarks={remarks}
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={handleConfirm}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};
