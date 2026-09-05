import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client.js';
import { ManualReviewList } from './ManualReviewList.js';
import { CheckResult } from '../../shared/types/index.js';
import { ArrowLeft, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';

export const ManualReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadItems = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getManualReviewItems(id);
      setItems(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [id]);

  const handleDecisionSubmitted = async (checkResultId: string, decision: 'CONFIRM_PASS' | 'CONFIRM_FLAG', reason: string) => {
    await apiClient.submitManualReviewDecision(checkResultId, decision, reason);
    setToastMessage(`Decision recorded: ${decision === 'CONFIRM_PASS' ? 'PASS' : 'FLAG'} with audit rationale.`);
    setTimeout(() => setToastMessage(null), 4000);
    await loadItems();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          backgroundColor: 'var(--color-pass-bg)',
          color: 'var(--color-pass-text)',
          border: '1px solid var(--color-pass-border)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {id && (
            <button 
              onClick={() => navigate(`/inspections/${id}/heatmap`)} 
              className="btn btn-secondary btn-sm" 
              style={{ marginBottom: '0.5rem' }}
            >
              <ArrowLeft size={14} /> Back to Heatmap
            </button>
          )}
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
            Manual Review & Confidence Gate (F22)
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Triaging OCR / vision extractions with confidence score &lt; 75% or ambiguous legal declarations.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          {id ? (
            <button onClick={() => navigate(`/inspections/${id}/finalize`)} className="btn btn-primary btn-sm">
              Proceed to Finalize
            </button>
          ) : (
            <button onClick={() => navigate('/inspections')} className="btn btn-secondary btn-sm">
              View All Inspections
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ height: '140px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ height: '140px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
        </div>
      ) : (
        <ManualReviewList
          items={items}
          onDecisionSubmitted={handleDecisionSubmitted}
        />
      )}
    </div>
  );
};
