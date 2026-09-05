import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProcessingTimeline, ProcessingStage } from './ProcessingTimeline.js';
import { ProgressStepIndicator } from './ProgressStepIndicator.js';
import { ProcessingFailureRetry } from './ProcessingFailureRetry.js';
import { apiClient } from '../../shared/api/client.js';

const initialStages: ProcessingStage[] = [
  { id: 'stage-1', name: 'Multi-side Image Normalization & Dewarp', status: 'COMPLETED', durationMs: 420 },
  { id: 'stage-2', name: 'Glare & Blur Quality Assessment', status: 'COMPLETED', durationMs: 650 },
  { id: 'stage-3', name: 'Optical Character Recognition (OCR Engine)', status: 'COMPLETED', durationMs: 1280 },
  { id: 'stage-4', name: 'Legal Metrology Mandatory Field Extraction', status: 'IN_PROGRESS', durationMs: 910 },
  { id: 'stage-5', name: 'Deterministic Rule Engine Validation', status: 'PENDING' }
];

export const ProcessingPage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [stages, setStages] = useState<ProcessingStage[]>(initialStages);
  const [progress, setProgress] = useState(80);
  const [hasError, setHasError] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    // Auto-advance stages simulation for interactive fidelity
    const timer1 = setTimeout(() => {
      setStages(prev => prev.map(s => 
        s.id === 'stage-4' ? { ...s, status: 'COMPLETED' } :
        s.id === 'stage-5' ? { ...s, status: 'IN_PROGRESS' } : s
      ));
      setProgress(95);
    }, 1200);

    const timer2 = setTimeout(() => {
      setStages(prev => prev.map(s => ({ ...s, status: 'COMPLETED' })));
      setProgress(100);
    }, 2400);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await apiClient.retryProcessing(id);
      setHasError(false);
      setStages(initialStages);
      setProgress(85);
    } catch {
      setHasError(true);
    } finally {
      setIsRetrying(false);
    }
  };

  const activeStage = stages.find(s => s.status === 'IN_PROGRESS') || stages[stages.length - 1];

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '840px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 0.25rem 0' }}>
            Processing Inspection Evidence
          </h1>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Inspection ID: <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{id}</span>
          </p>
        </div>
        {progress === 100 && (
          <button 
            onClick={() => navigate(`/inspections/${id}/declarations`)}
            className="btn btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Review Declarations →
          </button>
        )}
      </div>

      <ProgressStepIndicator 
        progressPercent={progress}
        activeStageName={activeStage?.name || 'Complete'}
        estimatedRemainingSec={progress === 100 ? 0 : 1}
        totalEvidenceCount={4}
      />

      {hasError && (
        <ProcessingFailureRetry 
          onRetry={handleRetry}
          onManualReviewFallback={() => navigate(`/inspections/${id}/declarations`)}
          isRetrying={isRetrying}
        />
      )}

      <ProcessingTimeline 
        stages={stages}
        currentStageId={activeStage?.id}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button 
          onClick={() => navigate(`/inspections/${id}/capture`)}
          className="btn btn-secondary"
        >
          ← Back to Image Capture
        </button>

        <button 
          onClick={() => navigate(`/inspections/${id}/declarations`)}
          className="btn btn-secondary"
        >
          Skip to Extracted Declarations
        </button>
      </div>
    </div>
  );
};
