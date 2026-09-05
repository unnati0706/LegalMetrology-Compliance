import React from 'react';
import { Link } from 'react-router-dom';
import { CheckSquare, AlertCircle, ArrowRight } from 'lucide-react';

interface PendingReviewWidgetProps {
  pendingCount: number;
}

export const PendingReviewWidget: React.FC<PendingReviewWidgetProps> = ({ pendingCount }) => {
  return (
    <div
      className="card"
      style={{
        background: 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)',
        border: '1px solid #fde68a',
        borderRadius: '12px',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f59e0b', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <CheckSquare size={20} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#92400e' }}>
            Confidence Review Gate ({pendingCount} Pending)
          </h4>
          <p style={{ margin: '0.15rem 0 0', fontSize: '0.8125rem', color: '#b45309' }}>
            Extracted declarations below 85% neural confidence require field officer sign-off.
          </p>
        </div>
      </div>

      <Link
        to="/manual-review"
        className="btn btn-primary"
        style={{
          background: '#d97706',
          borderColor: '#d97706',
          fontSize: '0.8125rem',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.5rem 1rem'
        }}
      >
        <span>Open Review Queue</span>
        <ArrowRight size={14} />
      </Link>
    </div>
  );
};
