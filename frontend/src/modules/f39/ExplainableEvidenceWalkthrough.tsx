import React, { useState } from 'react';
import { WalkthroughStep } from '../../shared/types';
import { CheckCircle2, AlertTriangle, ChevronRight, ChevronLeft, ShieldCheck, Scale, Cpu, Camera, FileText } from 'lucide-react';

interface ExplainableEvidenceWalkthroughProps {
  steps: WalkthroughStep[];
  inspectionId: string;
}

export const ExplainableEvidenceWalkthrough: React.FC<ExplainableEvidenceWalkthroughProps> = ({
  steps,
  inspectionId
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const currentStep = steps[currentStepIndex] || steps[0];

  const getStepIcon = (index: number) => {
    switch (index) {
      case 0: return <Camera size={18} />;
      case 1: return <Cpu size={18} />;
      case 2: return <Scale size={18} />;
      default: return <FileText size={18} />;
    }
  };

  return (
    <div>
      {/* Step Navigator Bar */}
      <div
        className="card"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          marginBottom: '1.5rem'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {steps.map((step, idx) => {
            const isActive = idx === currentStepIndex;
            const isCompleted = idx < currentStepIndex;

            return (
              <button
                key={step.stepNumber}
                onClick={() => setCurrentStepIndex(idx)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 0.875rem',
                  borderRadius: '8px',
                  background: isActive ? 'var(--color-primary)' : isCompleted ? '#ecfdf5' : 'transparent',
                  color: isActive ? '#fff' : isCompleted ? '#065f46' : 'var(--color-text-secondary)',
                  border: `1px solid ${isActive ? 'var(--color-primary)' : isCompleted ? '#a7f3d0' : 'transparent'}`,
                  cursor: 'pointer',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s'
                }}
              >
                {getStepIcon(idx)}
                <span>Step {step.stepNumber}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Walkthrough Card */}
      <div
        className="card"
        style={{
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: '12px',
          padding: '1.75rem'
        }}
      >
        {/* Step Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
          <div>
            <span className="badge badge-primary" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>
              Phase {currentStep.stepNumber} of {steps.length}
            </span>
            <h3 style={{ margin: '0 0 0.25rem', fontSize: '1.25rem', fontWeight: 700 }}>
              {currentStep.title}
            </h3>
            <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
              {currentStep.subtitle}
            </p>
          </div>

          <div>
            <span
              className={`badge ${
                currentStep.verdict === 'PASS'
                  ? 'badge-success'
                  : currentStep.verdict === 'VIOLATION'
                  ? 'badge-danger'
                  : 'badge-warning'
              }`}
              style={{ fontSize: '0.875rem', padding: '0.4rem 0.875rem' }}
            >
              Verdict: {currentStep.verdict}
            </span>
          </div>
        </div>

        {/* Content Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          {/* Visual Evidence with Bounding Box representation */}
          <div>
            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              Tamper-Evident Evidence Image Frame (Digital SHA-256 Hash Digest)
            </div>
            <div
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--color-border)',
                background: '#000',
                aspectRatio: '4/3',
                maxHeight: '320px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={currentStep.evidenceUrl}
                alt={currentStep.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Bounding Box overlay if present */}
              {currentStep.boundingBox && (
                <div
                  style={{
                    position: 'absolute',
                    top: `${currentStep.boundingBox.ymin * 100}%`,
                    left: `${currentStep.boundingBox.xmin * 100}%`,
                    height: `${(currentStep.boundingBox.ymax - currentStep.boundingBox.ymin) * 100}%`,
                    width: `${(currentStep.boundingBox.xmax - currentStep.boundingBox.xmin) * 100}%`,
                    border: '3px solid #ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.25)',
                    borderRadius: '4px',
                    boxShadow: '0 0 10px rgba(239, 68, 68, 0.6)'
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: '-22px',
                      left: '0',
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}
                  >
                    {currentStep.ruleCode}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reasoning & Statutory Logic */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Extracted Declaration Tensor
              </div>
              <div style={{ fontSize: '0.9375rem', fontFamily: 'monospace', fontWeight: 600, color: 'var(--color-text)' }}>
                "{currentStep.extractedText}"
              </div>
            </div>

            <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-text-secondary)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>
                Legal Metrology Rule Engine Reasoning
              </div>
              <div style={{ fontSize: '0.875rem', color: 'var(--color-text)', lineHeight: '1.5' }}>
                {currentStep.explanation}
              </div>
            </div>

            <div style={{ padding: '0.875rem 1rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', textTransform: 'uppercase', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Scale size={14} /> Statutory Authority & Section
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#0f172a', fontWeight: 600 }}>
                {currentStep.legalClause}
              </div>
            </div>
          </div>
        </div>

        {/* Step Navigation Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--color-border)', paddingTop: '1.25rem' }}>
          <button
            onClick={() => setCurrentStepIndex(prev => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            <ChevronLeft size={16} /> Previous Step
          </button>

          <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Step {currentStepIndex + 1} of {steps.length}
          </span>

          <button
            onClick={() => setCurrentStepIndex(prev => Math.min(steps.length - 1, prev + 1))}
            disabled={currentStepIndex === steps.length - 1}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem' }}
          >
            Next Step <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
