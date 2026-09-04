import React from 'react';
import { ReadabilityMetrics } from '../../shared/types/index.js';

interface ReadabilityFontSizePanelProps {
  metrics: ReadabilityMetrics;
}

export const ReadabilityFontSizePanel: React.FC<ReadabilityFontSizePanelProps> = ({ metrics }) => {
  return (
    <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontFamily: 'monospace', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-700, #1d4ed8)', backgroundColor: 'rgba(59, 130, 246, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>
              RULE 7 & TABLE 1
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '12px', backgroundColor: metrics.isHeightCompliant ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: metrics.isHeightCompliant ? 'var(--success-700, #047857)' : 'var(--danger-700, #b91c1c)' }}>
              {metrics.isHeightCompliant ? 'COMPLIANT' : 'DEFECTIVE FONT HEIGHT'}
            </span>
          </div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            PDP Numeral Font Height & Readability Metrics
          </h3>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--surface-border, #e2e8f0)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Measured Numeral Height</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: metrics.isHeightCompliant ? 'var(--success-600, #059669)' : 'var(--danger-600, #dc2626)', marginTop: '0.25rem' }}>
            {metrics.numeralHeightMm} mm
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Statutory Min: <strong>{metrics.requiredMinHeightMm} mm</strong>
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--surface-border, #e2e8f0)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Contrast Ratio</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {metrics.contrastRatio}:1
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--success-600, #059669)', marginTop: '0.35rem' }}>
            ✓ Clear background contrast
          </div>
        </div>

        <div style={{ padding: '1rem', borderRadius: '8px', backgroundColor: 'var(--surface-subtle, #f8fafc)', border: '1px solid var(--surface-border, #e2e8f0)' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Principal Display Area</span>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
            {metrics.pdpAreaCm2} cm²
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
            Determines Table 1 bracket
          </div>
        </div>
      </div>
    </div>
  );
};
