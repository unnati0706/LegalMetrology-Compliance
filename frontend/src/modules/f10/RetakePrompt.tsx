import React from 'react';
import { Camera, RefreshCw, CheckCircle2, AlertOctagon } from 'lucide-react';

interface RetakePromptProps {
  onRetake: () => void;
  onAcceptAnyway?: () => void;
  reason?: string;
}

export const RetakePrompt: React.FC<RetakePromptProps> = ({
  onRetake,
  onAcceptAnyway,
  reason = 'Image quality score is below 70%. Retake is strongly advised for statutory compounding admissibility.'
}) => {
  return (
    <div
      style={{
        padding: '1rem 1.25rem',
        background: '#fef2f2',
        border: '1px solid #fecaca',
        borderRadius: '10px',
        color: '#991b1b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        margin: '1rem 0'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <AlertOctagon size={20} color="#dc2626" />
        <div style={{ fontSize: '0.8125rem', maxWidth: '480px' }}>
          <strong>Retake Recommended:</strong> {reason}
        </div>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={onRetake}
          className="btn btn-primary btn-sm"
          style={{ background: '#dc2626', borderColor: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.75rem' }}
        >
          <Camera size={14} /> Retake Photo
        </button>

        {onAcceptAnyway && (
          <button
            type="button"
            onClick={onAcceptAnyway}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.75rem', borderColor: '#fca5a5', color: '#991b1b' }}
          >
            Accept As-Is
          </button>
        )}
      </div>
    </div>
  );
};
