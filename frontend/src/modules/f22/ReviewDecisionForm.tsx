import React, { useState } from 'react';
import { CheckResult } from '../../shared/types/index.js';
import { OverrideReasonModal } from './OverrideReasonModal.js';
import { CheckCircle2, AlertOctagon, HelpCircle, ShieldAlert } from 'lucide-react';

interface ReviewDecisionFormProps {
  item: CheckResult;
  onDecisionSubmitted: (checkResultId: string, decision: 'CONFIRM_PASS' | 'CONFIRM_FLAG', reason: string) => Promise<void>;
}

export const ReviewDecisionForm: React.FC<ReviewDecisionFormProps> = ({
  item,
  onDecisionSubmitted,
}) => {
  const [modalDecision, setModalDecision] = useState<'CONFIRM_PASS' | 'CONFIRM_FLAG' | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleModalSubmit = async (reason: string) => {
    if (!modalDecision) return;
    try {
      setSubmitting(true);
      await onDecisionSubmitted(item.id, modalDecision, reason);
      setModalDecision(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ borderLeft: '4px solid var(--color-review-solid)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-review">CONFIDENCE GATE TRIGGERED</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-primary-600)' }}>{item.ruleCode}</span>
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)' }}>{item.ruleTitle}</h3>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>AI Extraction Confidence</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-review-solid)' }}>
            {Math.round(item.confidence * 100)}%
          </div>
        </div>
      </div>

      <div style={{ backgroundColor: 'var(--bg-app)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
          <HelpCircle size={14} /> Statutory Trigger Explanation:
        </div>
        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)' }}>
          {item.explanation}
        </p>
        <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Legal Rule: <strong style={{ color: 'var(--text-main)' }}>{item.legalReference}</strong>
        </div>
      </div>

      {/* Decision Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
        <button
          onClick={() => setModalDecision('CONFIRM_PASS')}
          className="btn btn-success"
          style={{ minWidth: '170px' }}
        >
          <CheckCircle2 size={16} /> Confirm PASS
        </button>

        <button
          onClick={() => setModalDecision('CONFIRM_FLAG')}
          className="btn btn-danger"
          style={{ minWidth: '170px' }}
        >
          <AlertOctagon size={16} /> Confirm FLAG
        </button>
      </div>

      {modalDecision && (
        <OverrideReasonModal
          item={item}
          decision={modalDecision}
          isOpen={true}
          onClose={() => setModalDecision(null)}
          onSubmit={handleModalSubmit}
          isSubmitting={submitting}
        />
      )}
    </div>
  );
};
