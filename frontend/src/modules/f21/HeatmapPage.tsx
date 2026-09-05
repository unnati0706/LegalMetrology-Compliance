import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client.js';
import { ComplianceHeatmapGrid } from './ComplianceHeatmapGrid.js';
import { Inspection, CheckResult, Declaration, EvidenceItem } from '../../shared/types/index.js';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

export const HeatmapPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inspectionId = id || 'insp-sample-01';

  const [data, setData] = useState<{
    inspection: Inspection;
    checks: CheckResult[];
    declarations: Declaration[];
    evidence: EvidenceItem[];
  } | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await apiClient.getInspectionHeatmapData(inspectionId);
        setData(res);
      } catch (err: any) {
        setError(err.message || 'Failed to load heatmap data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [inspectionId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ height: '40px', width: '300px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-md)', animation: 'pulse 1.5s infinite' }} />
        <div style={{ height: '500px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
        <AlertCircle size={40} color="var(--color-flag-solid)" style={{ margin: '0 auto 1rem' }} />
        <h3>Failed to Load Heatmap</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
        <button onClick={() => navigate('/inspections')} className="btn btn-primary">
          Back to Inspections
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <button 
            onClick={() => navigate('/inspections')} 
            className="btn btn-secondary btn-sm" 
            style={{ marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={14} /> Back to Inspections
          </button>
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
            Compliance Heatmap (F21)
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {data.inspection.productName} • {data.inspection.brand} • <span style={{ fontWeight: 600 }}>{data.inspection.category}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/inspections/${inspectionId}/manual-review`)} className="btn btn-secondary btn-sm">
            Manual Review Queue ({data.checks.filter(c => c.status === 'MANUAL_REVIEW').length})
          </button>
          <button onClick={() => navigate(`/inspections/${inspectionId}/finalize`)} className="btn btn-primary btn-sm">
            Finalize Disposition
          </button>
        </div>
      </div>

      {/* Grid Canvas & Finding Inspector */}
      <ComplianceHeatmapGrid 
        evidence={data.evidence}
        checks={data.checks}
        declarations={data.declarations}
      />
    </div>
  );
};
