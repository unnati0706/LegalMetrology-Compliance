import React from 'react';
import { CategoryPattern } from '../../shared/types/index.js';
import { Layers, AlertCircle } from 'lucide-react';

interface CategoryPatternChartProps {
  categories: CategoryPattern[];
}

export const CategoryPatternChart: React.FC<CategoryPatternChartProps> = ({ categories }) => {
  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Layers size={16} color="var(--color-primary-light)" />
            Category-Level Violation Density & Hotspots
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Comparing non-compliance prevalence across consumer commodity categories
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {categories.map((cat) => (
          <div 
            key={cat.category}
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem'
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
              {cat.category}
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem' }}>
              <span style={{
                fontSize: '1.4rem',
                fontWeight: 800,
                color: cat.violationRate >= 30 ? '#f87171' : cat.violationRate >= 15 ? '#fbbf24' : '#4ade80'
              }}>
                {cat.violationRate}%
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>violation rate</span>
            </div>

            <div style={{
              height: '6px',
              width: '100%',
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderRadius: '9999px',
              overflow: 'hidden'
            }}>
              <div
                style={{
                  height: '100%',
                  width: `${cat.violationRate}%`,
                  borderRadius: '9999px',
                  backgroundColor: cat.violationRate >= 30 ? '#ef4444' : cat.violationRate >= 15 ? '#f59e0b' : '#22c55e'
                }}
              />
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Top Defect: <strong style={{ color: 'var(--text-secondary)' }}>{cat.topViolation}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
