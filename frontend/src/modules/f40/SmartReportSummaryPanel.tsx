import React from 'react';
import { SmartReportNarrative } from '../../shared/types';
import { formatDateTimeIST } from '../../shared/utils/dateUtils';
import { FileText, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Gavel, Sparkles } from 'lucide-react';

interface SmartReportSummaryPanelProps {
  narrative: SmartReportNarrative;
}

export const SmartReportSummaryPanel: React.FC<SmartReportSummaryPanelProps> = ({ narrative }) => {
  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={22} color="var(--color-primary)" />
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>AI Smart Report Narrative Synthesis</h3>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
              Automated statutory report generated from computer vision findings & Legal Metrology Act, 2009
            </p>
          </div>
        </div>

        <div style={{ padding: '0.4rem 0.8rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Gavel size={16} /> Compounding Estimate: {narrative.compoundingPenaltyEstimate}
        </div>
      </div>

      {/* Executive Summary */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
          Executive Statutory Summary
        </div>
        <div style={{ fontSize: '0.9375rem', lineHeight: '1.6', color: 'var(--color-text)', background: 'var(--color-background)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--color-border)' }}>
          {narrative.executiveSummary}
        </div>
      </div>

      {/* Grid: Key Findings & Directives */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Key Findings */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            <FileText size={16} color="var(--color-primary)" /> Key Metrological Observations
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
            {narrative.keyFindings.map((finding, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{finding}</li>
            ))}
          </ul>
        </div>

        {/* Recommended Directives */}
        <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.9375rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>
            <Gavel size={16} color="#d97706" /> Recommended Enforcement Directives
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
            {narrative.recommendedDirectives.map((directive, idx) => (
              <li key={idx} style={{ marginBottom: '0.5rem' }}>{directive}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Legal Risk Assessment */}
      <div style={{ padding: '0.875rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ fontSize: '0.8125rem', color: '#334155' }}>
          <strong>Legal Risk Assessment:</strong> {narrative.legalRiskAssessment}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
          Generated: {formatDateTimeIST(narrative.generatedAt)}
        </div>
      </div>
    </div>
  );
};
