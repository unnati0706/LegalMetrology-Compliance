import React from 'react';
import { ViolationTrendData } from '../../shared/types/index.js';
import { LineChart, BarChart2 } from 'lucide-react';

interface ViolationTrendChartProps {
  data: ViolationTrendData[];
}

export const ViolationTrendChart: React.FC<ViolationTrendChartProps> = ({ data }) => {
  const maxTotal = Math.max(...data.map(d => d.mrpViolations + d.netQtyViolations + d.dateViolations + d.mfgViolations + d.consumerCareViolations), 1);

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <LineChart size={16} color="var(--color-primary-light)" />
            Violation Incidence by Statutory Clause Over Time
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Weekly aggregation of non-compliance detections under PCR 2011 Rule 6 clauses
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#ef4444', borderRadius: '2px' }} />
            <span>MRP (Rule 6.1.e)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#f97316', borderRadius: '2px' }} />
            <span>Net Qty (Rule 6.1.b)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#eab308', borderRadius: '2px' }} />
            <span>Date/Batch (Rule 6.1.d)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#8b5cf6', borderRadius: '2px' }} />
            <span>Mfg Address (Rule 6.1.a)</span>
          </div>
        </div>
      </div>

      {/* Grouped Stacked Visualization */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        height: '200px',
        padding: '1.25rem 0.5rem 0.5rem 0.5rem',
        borderBottom: '1px solid var(--border-color)',
        gap: '1rem'
      }}>
        {data.map((item, idx) => {
          const total = item.mrpViolations + item.netQtyViolations + item.dateViolations + item.mfgViolations + item.consumerCareViolations;
          const heightPct = (total / maxTotal) * 100;

          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
                {total}
              </div>

              {/* Stacked bar */}
              <div style={{
                width: '100%',
                maxWidth: '48px',
                height: `${Math.max(heightPct, 15)}%`,
                borderRadius: '6px 6px 0 0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
                backgroundColor: 'rgba(255,255,255,0.06)'
              }}>
                <div style={{ height: `${(item.mrpViolations / total) * 100}%`, backgroundColor: '#ef4444' }} title={`MRP: ${item.mrpViolations}`} />
                <div style={{ height: `${(item.netQtyViolations / total) * 100}%`, backgroundColor: '#f97316' }} title={`Net Qty: ${item.netQtyViolations}`} />
                <div style={{ height: `${(item.dateViolations / total) * 100}%`, backgroundColor: '#eab308' }} title={`Date/Batch: ${item.dateViolations}`} />
                <div style={{ height: `${(item.mfgViolations / total) * 100}%`, backgroundColor: '#8b5cf6' }} title={`Mfg: ${item.mfgViolations}`} />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '0.5rem' }}>
                {item.period}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
