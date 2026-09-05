import React from 'react';
import { CompletenessItem } from '../../shared/types/index.js';
import { FormatValidationBadge } from './FormatValidationBadge.js';

interface CompletenessChecklistProps {
  items: CompletenessItem[];
  onCorrectItem?: (item: CompletenessItem) => void;
}

export const CompletenessChecklist: React.FC<CompletenessChecklistProps> = ({ items, onCorrectItem }) => {
  const presentCount = items.filter(i => i.status === 'PRESENT').length;
  const missingCount = items.filter(i => i.status === 'MISSING').length;
  const defectiveCount = items.filter(i => i.status === 'DEFECTIVE').length;

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 600 }}>
            Mandatory Declarations Completeness Audit
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Statutory Checklist according to Legal Metrology (Packaged Commodities) Rules, 2011 — Rule 6(1)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.8rem', fontWeight: 600 }}>
          <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.12)', color: 'var(--success-700, #047857)' }}>
            {presentCount} Present
          </span>
          {missingCount > 0 && (
            <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.12)', color: 'var(--danger-700, #b91c1c)' }}>
              {missingCount} Missing
            </span>
          )}
          {defectiveCount > 0 && (
            <span style={{ padding: '3px 8px', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.12)', color: 'var(--warning-700, #b45309)' }}>
              {defectiveCount} Format Errors
            </span>
          )}
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-subtle, #f8fafc)', borderBottom: '1px solid var(--surface-border, #e2e8f0)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Statutory Requirement</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Rule Clause</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Extracted Evidence Value</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Format Check</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => {
              const isPresent = item.status === 'PRESENT';
              const isMissing = item.status === 'MISSING';
              const isDefective = item.status === 'DEFECTIVE';

              const badgeBg = isPresent ? 'rgba(16, 185, 129, 0.12)' : isMissing ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)';
              const badgeColor = isPresent ? 'var(--success-700, #047857)' : isMissing ? 'var(--danger-700, #b91c1c)' : 'var(--warning-700, #b45309)';

              return (
                <tr key={item.field} style={{ borderBottom: '1px solid var(--surface-border, #e2e8f0)' }}>
                  <td style={{ padding: '0.85rem 1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {item.label}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                    {item.legalClause}
                  </td>
                  <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', color: isMissing ? 'var(--danger-600, #dc2626)' : 'var(--text-primary)' }}>
                    {item.extractedValue || <em>Missing from packaging</em>}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <FormatValidationBadge isValid={item.formatCompliant} remarks={item.formatRemarks} />
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: badgeBg, color: badgeColor }}>
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    {onCorrectItem && (
                      <button
                        onClick={() => onCorrectItem(item)}
                        style={{ background: 'none', border: 'none', color: 'var(--primary-600, #2563eb)', cursor: 'pointer', fontSize: '0.8rem', textDecoration: 'underline' }}
                      >
                        {isMissing ? 'Add Field' : 'Correct'}
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
