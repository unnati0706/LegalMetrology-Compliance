import React from 'react';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export type DispositionType = 'COMPLIANT' | 'NON_COMPLIANT' | 'REQUIRES_REINSPECTION';

interface DispositionSelectorProps {
  selectedDisposition: DispositionType;
  onChange: (disposition: DispositionType) => void;
  disabled?: boolean;
}

export const DispositionSelector: React.FC<DispositionSelectorProps> = ({
  selectedDisposition,
  onChange,
  disabled = false,
}) => {
  const options: Array<{
    type: DispositionType;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    border: string;
    bg: string;
  }> = [
    {
      type: 'COMPLIANT',
      title: 'Full Compliance (PASS)',
      description: 'Commodity strictly adheres to all mandatory declarations under Legal Metrology Rules, 2011.',
      icon: <CheckCircle2 size={24} color="var(--color-pass-solid)" />,
      color: 'var(--color-pass-solid)',
      border: 'var(--color-pass-border)',
      bg: 'var(--color-pass-bg)',
    },
    {
      type: 'NON_COMPLIANT',
      title: 'Non-Compliant (FLAGGED)',
      description: 'Defects or missing mandatory declarations detected. Triggers legal notice / compounding workflow.',
      icon: <AlertTriangle size={24} color="var(--color-flag-solid)" />,
      color: 'var(--color-flag-solid)',
      border: 'var(--color-flag-border)',
      bg: 'var(--color-flag-bg)',
    },
    {
      type: 'REQUIRES_REINSPECTION',
      title: 'Requires Re-Inspection',
      description: 'Inconclusive packaging condition, physical sample required, or merchant requested rectification window.',
      icon: <RefreshCw size={24} color="var(--color-review-solid)" />,
      color: 'var(--color-review-solid)',
      border: 'var(--color-review-border)',
      bg: 'var(--color-review-bg)',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
        Select Final Statutory Disposition <span style={{ color: 'var(--color-flag-solid)' }}>*</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
        {options.map((opt) => {
          const isSelected = selectedDisposition === opt.type;
          return (
            <div
              key={opt.type}
              onClick={() => !disabled && onChange(opt.type)}
              style={{
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: isSelected ? opt.bg : 'var(--bg-card)',
                border: isSelected ? `2px solid ${opt.color}` : '1px solid var(--border-light)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                transition: 'all var(--transition-fast)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  {opt.icon}
                  <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{opt.title}</span>
                </div>
                <input
                  type="radio"
                  name="disposition"
                  checked={isSelected}
                  onChange={() => onChange(opt.type)}
                  disabled={disabled}
                  style={{ accentColor: opt.color, width: '18px', height: '18px' }}
                />
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                {opt.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
