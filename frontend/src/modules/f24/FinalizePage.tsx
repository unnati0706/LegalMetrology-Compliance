import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client.js';
import { FinalizeInspectionPanel } from './FinalizeInspectionPanel.js';
import { DispositionType } from './DispositionSelector.js';
import { Inspection, CheckResult } from '../../shared/types/index.js';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';

export const FinalizePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inspectionId = id || 'insp-sample-01';

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const insp = await apiClient.getInspectionById(inspectionId);
      const heatmap = await apiClient.getInspectionHeatmapData(inspectionId);
      setInspection(insp);
      setChecks(heatmap.checks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [inspectionId]);

  const handleFinalize = async (disposition: DispositionType, notes?: string) => {
    try {
      setSubmitting(true);
      await apiClient.finalizeInspection(inspectionId, disposition, notes);
      setToastMessage(`Inspection ${inspectionId} successfully finalized as ${disposition.replace('_', ' ')}.`);
      setTimeout(() => {
        navigate('/inspections');
      }, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !inspection) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ height: '40px', width: '300px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '350px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Toast */}
      {toastMessage && (
        <div style={{
          backgroundColor: 'var(--color-pass-bg)',
          color: 'var(--color-pass-text)',
          border: '1px solid var(--color-pass-border)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          animation: 'fadeIn 0.2s ease',
          fontWeight: 600
        }}>
          <CheckCircle2 size={18} />
          {toastMessage}
        </div>
      )}

      {/* Header */}
      <div>
        <button 
          onClick={() => navigate(`/inspections/${inspectionId}/heatmap`)} 
          className="btn btn-secondary btn-sm" 
          style={{ marginBottom: '0.5rem' }}
        >
          <ArrowLeft size={14} /> Back to Heatmap
        </button>
        <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
          Inspection Finalization & Disposition (F24)
        </h1>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Locking examination record for <strong style={{ color: 'var(--text-main)' }}>{inspection.productName}</strong> ({inspection.category}).
        </div>
      </div>

      <FinalizeInspectionPanel
        inspection={inspection}
        checks={checks}
        onFinalize={handleFinalize}
        isSubmitting={submitting}
      />
    </div>
  );
};
