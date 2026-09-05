import React from 'react';
import { ExplainableRuleFinding } from '../../shared/types/index.js';

interface ExplanationDrawerProps {
  finding: ExplainableRuleFinding | null;
  onClose: () => void;
}

export const ExplanationDrawer: React.FC<ExplanationDrawerProps> = ({ finding, onClose }) => {
  if (!finding) return null;

  const isPass = finding.verdict === 'PASS';
  const isFlag = finding.verdict === 'FLAG';

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '460px',
        maxWidth: '100%',
        backgroundColor: 'var(--surface-card, #ffffff)',
        boxShadow: '-10px 0 25px -5px rgba(0, 0, 0, 0.2)',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto'
      }}
    >
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--surface-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--primary-700, #1d4ed8)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
            {finding.ruleCode}
          </span>
          <h3 style={{ margin: '0.25rem 0 0 0', fontSize: '1.15rem', fontWeight: 700 }}>
            Explainable Statutory Logic
          </h3>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          ✕
        </button>
      </div>

      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Rule Title & Verdict
          </h4>
          <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {finding.ruleTitle}
          </div>
          <div 
            style={{ 
              padding: '0.75rem 1rem', 
              borderRadius: '6px', 
              backgroundColor: isPass ? 'rgba(16, 185, 129, 0.1)' : isFlag ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
              color: isPass ? 'var(--success-800, #065f46)' : isFlag ? 'var(--danger-800, #991b1b)' : 'var(--warning-800, #92400e)',
              fontSize: '0.9rem',
              fontWeight: 500
            }}
          >
            {finding.verdictSummary}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Step-by-Step Deterministic Evaluation Logic
          </h4>
          <ol style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {finding.detailedLogic.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Verbatim Statutory Clause
          </h4>
          <div style={{ backgroundColor: 'var(--surface-subtle, #f8fafc)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-primary)', border: '1px solid var(--surface-border, #e2e8f0)', fontStyle: 'italic' }}>
            "{finding.statutoryText}"
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--danger-600, #dc2626)' }}>
            Prescribed Compounding Penalty
          </h4>
          <div style={{ backgroundColor: 'var(--danger-50, #fef2f2)', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--danger-700, #b91c1c)', border: '1px solid var(--danger-200, #fecaca)' }}>
            {finding.compoundingPenalty}
          </div>
        </div>

        <div>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', textTransform: 'uppercase', color: 'var(--primary-600, #2563eb)' }}>
            Inspector Remediation Directive
          </h4>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            {finding.remediationAdvice}
          </div>
        </div>
      </div>
    </div>
  );
};
