import React, { useState } from 'react';
import { CheckResult } from '../../shared/types/index.js';

interface ComplianceResultTableProps {
  checks: CheckResult[];
  onInspectCheck?: (check: CheckResult) => void;
}

export const ComplianceResultTable: React.FC<ComplianceResultTableProps> = ({
  checks,
  onInspectCheck
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FLAG' | 'MANUAL_REVIEW'>('ALL');

  const filtered = checks.filter(c => statusFilter === 'ALL' || c.status === statusFilter);

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--surface-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>
          Rule Evaluation Results ({filtered.length})
        </h3>
        
        <div style={{ display: 'flex', gap: '0.35rem' }}>
          {(['ALL', 'PASS', 'FLAG', 'MANUAL_REVIEW'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: statusFilter === st ? 700 : 500,
                backgroundColor: statusFilter === st ? 'var(--primary-600, #2563eb)' : 'var(--surface-subtle, #f1f5f9)',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                border: '1px solid var(--surface-border, #e2e8f0)',
                cursor: 'pointer'
              }}
            >
              {st.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-subtle, #f8fafc)', borderBottom: '1px solid var(--surface-border, #e2e8f0)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rule Code & Description</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Legal Reference</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Side</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confidence</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Verdict</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(check => {
              const isPass = check.status === 'PASS';
              const isFlag = check.status === 'FLAG';
              const isReview = check.status === 'MANUAL_REVIEW';

              const verdictBg = isPass ? 'rgba(16, 185, 129, 0.12)' : isFlag ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)';
              const verdictColor = isPass ? 'var(--success-700, #047857)' : isFlag ? 'var(--danger-700, #b91c1c)' : 'var(--warning-700, #b45309)';

              return (
                <tr 
                  key={check.id}
                  style={{ borderBottom: '1px solid var(--surface-border, #e2e8f0)', transition: 'background-color 0.15s ease' }}
                >
                  <td style={{ padding: '0.85rem 1rem', width: '30%' }}>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      {check.ruleCode}
                    </div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {check.ruleTitle}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', width: '25%' }}>
                    {check.legalReference}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', width: '10%' }}>
                    {check.packageSide || 'PDP'}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', width: '10%' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {Math.round(check.confidence * 100)}%
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', width: '15%' }}>
                    <span 
                      style={{
                        display: 'inline-flex',
                        padding: '3px 8px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        backgroundColor: verdictBg,
                        color: verdictColor
                      }}
                    >
                      {check.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', width: '10%', textAlign: 'right' }}>
                    {onInspectCheck && (
                      <button
                        onClick={() => onInspectCheck(check)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--primary-600, #2563eb)',
                          cursor: 'pointer',
                          fontSize: '0.8rem',
                          fontWeight: 600,
                          textDecoration: 'underline'
                        }}
                      >
                        Inspect
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
