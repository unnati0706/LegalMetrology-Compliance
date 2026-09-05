import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ImageAnnotationCanvas } from './ImageAnnotationCanvas.js';
import { EvidenceZoomViewer } from './EvidenceZoomViewer.js';
import { EvidenceItem, Declaration, CheckResult } from '../../shared/types/index.js';
import { apiClient } from '../../shared/api/client.js';

export const EvidencePage: React.FC = () => {
  const { id = 'insp-sample-01' } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [evidence, setEvidence] = useState<EvidenceItem[]>([]);
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [checks, setChecks] = useState<CheckResult[]>([]);
  const [viewMode, setViewMode] = useState<'ANNOTATION' | 'ZOOM_INSPECTOR'>('ANNOTATION');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchEvidenceData = async () => {
      setLoading(true);
      try {
        const data = await apiClient.getEvidenceAnnotations(id);
        setEvidence(data.evidence);
        setDeclarations(data.declarations);
        setChecks(data.checks);
      } catch (err) {
        console.error('Failed to load evidence annotations', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvidenceData();
  }, [id]);

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, margin: 0 }}>
              Evidence Highlighting & Pixel Inspection
            </h1>
            <span 
              style={{ 
                fontSize: '0.8rem', 
                backgroundColor: 'rgba(59, 130, 246, 0.1)', 
                color: 'var(--primary-700, #1d4ed8)', 
                padding: '3px 8px', 
                borderRadius: '6px', 
                fontWeight: 600 
              }}
            >
              Visual Studio
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>
            Inspect AI bounding box crops and verify compliance findings directly against high-resolution evidence images.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={() => setViewMode('ANNOTATION')}
            className={viewMode === 'ANNOTATION' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            Bounding Box Overlays
          </button>
          <button
            onClick={() => setViewMode('ZOOM_INSPECTOR')}
            className={viewMode === 'ZOOM_INSPECTOR' ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ fontSize: '0.85rem' }}
          >
            High-Res Pixel Lens
          </button>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading evidence panels and annotations...
        </div>
      ) : viewMode === 'ANNOTATION' ? (
        <ImageAnnotationCanvas 
          evidence={evidence}
          declarations={declarations}
          checks={checks}
        />
      ) : (
        <div className="card" style={{ padding: '1rem', height: '520px', marginBottom: '1.5rem' }}>
          <EvidenceZoomViewer 
            imageUrl={evidence[0]?.imageUrl || 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=1200&auto=format&fit=crop&q=80'}
            alt="Evidence Package Inspection"
          />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem' }}>
        <button 
          onClick={() => navigate(`/inspections/${id}/results`)}
          className="btn btn-secondary"
        >
          ← Back to Compliance Results
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(`/inspections/${id}/manual-review`)}
            className="btn btn-secondary"
          >
            Go to Manual Review Queue
          </button>
          <button 
            onClick={() => navigate(`/inspections/${id}/finalize`)}
            className="btn btn-primary"
          >
            Proceed to Finalize Inspection →
          </button>
        </div>
      </div>
    </div>
  );
};
