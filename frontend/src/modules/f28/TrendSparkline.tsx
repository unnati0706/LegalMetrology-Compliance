import React from 'react';
import { TrendDataPoint } from '../../shared/types/index.js';
import { TrendingUp } from 'lucide-react';

interface TrendSparklineProps {
  data: TrendDataPoint[];
}

export const TrendSparkline: React.FC<TrendSparklineProps> = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.total), 1);

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <TrendingUp size={16} color="var(--color-primary-light)" />
            Inspection Velocity & Daily Throughput
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Daily completed audits vs violations flagged</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#4ade80', borderRadius: '2px' }} />
            <span>Compliant</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <div style={{ width: '10px', height: '10px', backgroundColor: '#f87171', borderRadius: '2px' }} />
            <span>Flagged</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Visualization */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        height: '160px',
        padding: '1rem 0.5rem 0.5rem 0.5rem',
        borderBottom: '1px solid var(--border-color)',
        gap: '0.75rem'
      }}>
        {data.map((item, idx) => {
          const totalHeightPercent = (item.total / maxVal) * 100;
          const compliantPercent = item.total > 0 ? (item.compliant / item.total) * 100 : 0;
          const flaggedPercent = item.total > 0 ? (item.flagged / item.total) * 100 : 0;

          return (
            <div 
              key={idx} 
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                height: '100%',
                justifyContent: 'flex-end',
                gap: '0.35rem'
              }}
            >
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.total}
              </div>

              {/* Stacked Bar */}
              <div style={{
                width: '100%',
                maxWidth: '40px',
                height: `${Math.max(totalHeightPercent, 12)}%`,
                borderRadius: '4px 4px 0 0',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column-reverse',
                backgroundColor: 'rgba(255,255,255,0.06)'
              }}>
                <div 
                  style={{
                    height: `${compliantPercent}%`,
                    backgroundColor: '#22c55e',
                    transition: 'height 0.3s ease'
                  }} 
                  title={`Compliant: ${item.compliant}`}
                />
                <div 
                  style={{
                    height: `${flaggedPercent}%`,
                    backgroundColor: '#ef4444',
                    transition: 'height 0.3s ease'
                  }} 
                  title={`Flagged: ${item.flagged}`}
                />
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {item.date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
