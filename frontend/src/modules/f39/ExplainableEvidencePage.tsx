import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { WalkthroughStep } from '../../shared/types';
import { ExplainableEvidenceWalkthrough } from './ExplainableEvidenceWalkthrough';
import { ArrowLeft, Clock, ShieldCheck, Sparkles, FileText } from 'lucide-react';

export const ExplainableEvidencePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [steps, setSteps] = useState<WalkthroughStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspectionId = id || 'insp-sample-01';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getExplainableEvidenceWalkthrough(inspectionId);
        setSteps(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load explainable evidence breakdown');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [inspectionId]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <div className="loading-spinner" style={{ margin: '2rem auto' }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Reconstructing explainable neural evidence pipeline...</p>
      </div>
    );
  }

  if (error || steps.length === 0) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Unable to load evidence walkthrough</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>{error}</p>
          <button onClick={() => navigate(-1)} className="btn btn-primary" style={{ marginTop: '1rem' }}>
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <button
            onClick={() => navigate(`/inspections/${inspectionId}`)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Inspection
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} color="var(--color-primary)" />
            Explainable AI Evidence Mode
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Step-by-step visual verification audit trail for Inspection <strong>#{inspectionId}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to={`/inspections/${inspectionId}/timeline`}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Clock size={16} /> Full Chain of Custody
          </Link>
          <Link
            to={`/inspections/${inspectionId}/smart-report`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <FileText size={16} /> Smart Report
          </Link>
        </div>
      </div>

      <ExplainableEvidenceWalkthrough
        steps={steps}
        inspectionId={inspectionId}
      />
    </div>
  );
};
