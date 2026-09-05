import React, { useState } from 'react';
import { ExplainableRuleFinding } from '../../shared/types/index.js';

interface AskWhyPanelProps {
  findings: ExplainableRuleFinding[];
  onSelectFinding: (finding: ExplainableRuleFinding) => void;
}

export const AskWhyPanel: React.FC<AskWhyPanelProps> = ({ findings, onSelectFinding }) => {
  const [selectedCode, setSelectedCode] = useState<string>(findings[0]?.ruleCode || '');

  const active = findings.find(f => f.ruleCode === selectedCode) || findings[0];

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', marginBottom: '1.5rem' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--surface-border, #e2e8f0)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', fontWeight: 700 }}>
            "Ask Why?" AI & Deterministic Reasoning Engine
          </h3>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Plain-language explainability bridging OCR computer vision extractions to Gazette rules.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', minHeight: '380px' }}>
        {/* Rule selector list */}
        <div style={{ width: '280px', borderRight: '1px solid var(--surface-border, #e2e8f0)', backgroundColor: 'var(--surface-subtle, #f8fafc)', padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', paddingLeft: '0.5rem' }}>
            Evaluated Rules
          </span>
          {findings.map(f => {
            const isSelected = f.ruleCode === active?.ruleCode;
            const isPass = f.verdict === 'PASS';
            const isFlag = f.verdict === 'FLAG';

            return (
              <button
                key={f.ruleCode}
                onClick={() => {
                  setSelectedCode(f.ruleCode);
                  onSelectFinding(f);
                }}
                style={{
                  padding: '0.6rem 0.75rem',
                  borderRadius: '6px',
                  textAlign: 'left',
                  border: isSelected ? '2px solid var(--primary-500, #3b82f6)' : '1px solid var(--surface-border, #e2e8f0)',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {f.ruleCode}
                  </span>
                  <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '1px 6px', borderRadius: '10px', backgroundColor: isPass ? 'rgba(16, 185, 129, 0.12)' : isFlag ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)', color: isPass ? 'var(--success-700, #047857)' : isFlag ? 'var(--danger-700, #b91c1c)' : 'var(--warning-700, #b45309)' }}>
                    {f.verdict}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {f.ruleTitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Reason breakdown content */}
        <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {active ? (
            <>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                  <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {active.ruleTitle}
                  </h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ({active.statutoryClause})
                  </span>
                </div>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {active.verdictSummary}
                </p>
              </div>

              <div>
                <h5 style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Reasoning Trail & Verification Rules:
                </h5>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  {active.detailedLogic.map((logic, idx) => (
                    <li key={idx}>{logic}</li>
                  ))}
                </ul>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                <button
                  onClick={() => onSelectFinding(active)}
                  className="btn btn-primary"
                  style={{ fontSize: '0.85rem' }}
                >
                  Open Full Legal Drawer →
                </button>
              </div>
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)' }}>Select a rule to view reasoning.</div>
          )}
        </div>
      </div>
    </div>
  );
};
