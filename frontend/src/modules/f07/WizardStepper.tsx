import React from 'react';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  subtitle: string;
}

interface WizardStepperProps {
  currentStep: number;
  steps: Step[];
  onStepClick?: (step: number) => void;
}

export const WizardStepper: React.FC<WizardStepperProps> = ({
  currentStep,
  steps,
  onStepClick
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        marginBottom: '2rem',
        padding: '0 1rem'
      }}
    >
      {/* Connecting line */}
      <div
        style={{
          position: 'absolute',
          top: '20px',
          left: '3rem',
          right: '3rem',
          height: '2px',
          background: 'var(--color-border)',
          zIndex: 1
        }}
      />

      {steps.map((step) => {
        const isCompleted = step.id < currentStep;
        const isActive = step.id === currentStep;

        return (
          <div
            key={step.id}
            onClick={() => isCompleted && onStepClick && onStepClick(step.id)}
            style={{
              position: 'relative',
              zIndex: 2,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: isCompleted ? 'pointer' : 'default'
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: isCompleted ? '#10b981' : isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                color: isCompleted || isActive ? '#ffffff' : 'var(--color-text-secondary)',
                border: `2px solid ${isCompleted ? '#10b981' : isActive ? 'var(--color-primary)' : 'var(--color-border)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem',
                boxShadow: isActive ? '0 0 0 4px rgba(79, 70, 229, 0.2)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isCompleted ? <Check size={18} /> : step.id}
            </div>

            <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--color-text)' : 'var(--color-text-secondary)' }}>
                {step.title}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)' }}>
                {step.subtitle}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
