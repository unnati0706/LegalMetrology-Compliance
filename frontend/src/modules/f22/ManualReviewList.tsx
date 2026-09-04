import React from 'react';
import { CheckResult } from '../../shared/types/index.js';
import { ReviewDecisionForm } from './ReviewDecisionForm.js';
import { CheckCircle, Inbox } from 'lucide-react';

interface ManualReviewListProps {
  items: CheckResult[];
  onDecisionSubmitted: (checkResultId: string, decision: 'CONFIRM_PASS' | 'CONFIRM_FLAG', reason: string) => Promise<void>;
}

export const ManualReviewList: React.FC<ManualReviewListProps> = ({
  items,
  onDecisionSubmitted,
}) => {
  if (items.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-pass-bg)',
          color: 'var(--color-pass-solid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem',
        }}>
          <CheckCircle size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>All Confidence Gates Cleared</h3>
        <p style={{ color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          There are no pending low-confidence extractions or ambiguous declarations awaiting manual inspection for this target.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {items.map((item) => (
        <ReviewDecisionForm
          key={item.id}
          item={item}
          onDecisionSubmitted={onDecisionSubmitted}
        />
      ))}
    </div>
  );
};
