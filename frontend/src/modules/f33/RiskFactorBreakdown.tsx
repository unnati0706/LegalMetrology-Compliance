import React from 'react';
import { RiskFactor } from '../../shared/types/index.js';
import { Sliders, PlusCircle, MinusCircle, Info } from 'lucide-react';

interface RiskFactorBreakdownProps {
  factors: RiskFactor[];
}

export const RiskFactorBreakdown: React.FC<RiskFactorBreakdownProps> = ({ factors }) => {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700, fontSize: '0.95rem' }}>
          <Sliders size={16} color="var(--color-primary-light)" />
          <span>Explainable AI Risk Feature Attribution</span>
        </div>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SHAP & Recidivism Weights</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {factors.map((f, idx) => {
          const isIncrease = f.direction === 'INCREASE';

          return (
            <div
              key={idx}
              style={{
                padding: '0.75rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  {isIncrease ? <PlusCircle size={14} color="#f87171" /> : <MinusCircle size={14} color="#4ade80" />}
                  <span>{f.factor}</span>
                </div>
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  color: isIncrease ? '#f87171' : '#4ade80'
                }}>
                  {isIncrease ? `+${f.impactScore} pts` : `${f.impactScore} pts`}
                </span>
              </div>

              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {f.description}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
