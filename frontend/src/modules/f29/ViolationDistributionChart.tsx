import React from 'react';
import { RuleDistributionData } from '../../shared/types/index.js';
import { Scale, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ViolationDistributionChartProps {
  data: RuleDistributionData[];
}

export const ViolationDistributionChart: React.FC<ViolationDistributionChartProps> = ({ data }) => {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Scale size={16} color="var(--color-primary-light)" />
            Statutory Rule Violation Distribution & Severity
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Breakdown across Legal Metrology (Packaged Commodities) Rules, 2011 clauses
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {data.map((item) => (
          <div key={item.ruleCode} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{
                  fontSize: '0.65rem',
                  padding: '0.1rem 0.35rem',
                  borderRadius: '3px',
                  fontWeight: 700,
                  backgroundColor: item.severity === 'CRITICAL' ? 'rgba(239, 68, 68, 0.2)' : item.severity === 'MAJOR' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                  color: item.severity === 'CRITICAL' ? '#f87171' : item.severity === 'MAJOR' ? '#fb923c' : '#facc15'
                }}>
                  {item.severity}
                </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.ruleTitle}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({item.ruleCode})</span>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.count} cases ({item.percentage}%)
              </div>
            </div>

            {/* Progress bar */}
            <div style={{
              height: '8px',
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${item.percentage}%`,
                  borderRadius: '9999px',
                  backgroundColor: item.severity === 'CRITICAL' ? '#ef4444' : item.severity === 'MAJOR' ? '#f97316' : '#eab308'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
