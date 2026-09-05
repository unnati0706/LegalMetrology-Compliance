import React from 'react';
import { ArtworkDiffResult } from '../../shared/types';
import { CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, FileCheck, Layers } from 'lucide-react';

interface BeforeAfterComparisonViewProps {
  diffResult: ArtworkDiffResult;
  productName?: string;
}

export const BeforeAfterComparisonView: React.FC<BeforeAfterComparisonViewProps> = ({
  diffResult,
  productName
}) => {
  const scoreImprovement = diffResult.newScore - diffResult.oldScore;

  return (
    <div>
      {/* Metrics Banner */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              Prior Version ({diffResult.oldVersion})
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#dc2626' }}>
              {diffResult.oldScore}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#991b1b' }}>Non-Compliant / Flagged</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '50%', background: '#dcfce7', color: '#15803d' }}>
              <ArrowRight size={20} />
            </div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#15803d', marginTop: '0.25rem' }}>
              +{scoreImprovement}% Score Improvement
            </div>
          </div>

          <div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              New Rescan Version ({diffResult.newVersion})
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#059669' }}>
              {diffResult.newScore}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#065f46' }}>Statutory Compliant</div>
          </div>

          <div style={{ padding: '0.75rem 1rem', background: 'var(--color-surface)', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>Remediation Status:</div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <CheckCircle2 size={18} />
              {diffResult.resolvedIssuesCount} Issues Resolved
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
              {diffResult.remainingIssuesCount} Pending Issues
            </div>
          </div>
        </div>
      </div>

      {/* Side by side comparison changes */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Layers size={18} color="var(--color-primary)" />
        Declaration Diff Breakdown & Statutory Verification
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {diffResult.changes.map((change, idx) => (
          <div
            key={idx}
            className="card"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: '10px',
              padding: '1.25rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>{change.field}</h4>
              <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#15803d' }}>
                <CheckCircle2 size={14} /> Remediation Verified
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Before Block */}
              <div style={{ padding: '0.875rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  BEFORE ({diffResult.oldVersion})
                </div>
                <div style={{ fontSize: '0.875rem', color: '#7f1d1d', fontFamily: 'monospace' }}>
                  {change.before}
                </div>
              </div>

              {/* After Block */}
              <div style={{ padding: '0.875rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#166534', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                  AFTER RESCAN ({diffResult.newVersion})
                </div>
                <div style={{ fontSize: '0.875rem', color: '#14532d', fontFamily: 'monospace', fontWeight: 600 }}>
                  {change.after}
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <FileCheck size={14} />
              <span>Complies with: <strong>{change.legalRule}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
