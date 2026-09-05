import React, { useState } from 'react';
import { FileText, Loader2, Check, Sparkles } from 'lucide-react';

interface ReportGenerateButtonProps {
  inspectionId: string;
  onGenerate: (format: 'PDF' | 'JSON' | 'CSV') => Promise<void>;
  disabled?: boolean;
}

export const ReportGenerateButton: React.FC<ReportGenerateButtonProps> = ({
  inspectionId,
  onGenerate,
  disabled = false,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<'PDF' | 'JSON' | 'CSV'>('PDF');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating || disabled) return;
    setIsGenerating(true);
    setIsSuccess(false);
    try {
      await onGenerate(selectedFormat);
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate report', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
      <select
        value={selectedFormat}
        onChange={(e) => setSelectedFormat(e.target.value as 'PDF' | 'JSON' | 'CSV')}
        disabled={isGenerating || disabled}
        className="form-input"
        style={{
          width: 'auto',
          padding: '0.5rem 0.75rem',
          fontSize: '0.875rem',
          fontWeight: 600,
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--bg-surface)'
        }}
        aria-label="Select report format"
      >
        <option value="PDF">PDF (Statutory Notice)</option>
        <option value="JSON">JSON (DoCA Machine Feed)</option>
        <option value="CSV">CSV (Audit Row Export)</option>
      </select>

      <button
        type="button"
        onClick={handleGenerate}
        disabled={isGenerating || disabled}
        className="btn btn-primary"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontWeight: 600
        }}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="spin-animation" />
            <span>Compiling {selectedFormat}...</span>
          </>
        ) : isSuccess ? (
          <>
            <Check size={16} color="#4ade80" />
            <span>Generated!</span>
          </>
        ) : (
          <>
            <FileText size={16} />
            <span>Generate & Sign {selectedFormat}</span>
          </>
        )}
      </button>
    </div>
  );
};
