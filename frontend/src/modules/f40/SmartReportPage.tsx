import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { SmartReportNarrative, ScanQualityMetrics } from '../../shared/types';
import { ScanQualityCoachOverlay } from './ScanQualityCoachOverlay';
import { SmartReportSummaryPanel } from './SmartReportSummaryPanel';
import { ArrowLeft, Sparkles, FileText, Download, Share2, Printer } from 'lucide-react';

export const SmartReportPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [narrative, setNarrative] = useState<SmartReportNarrative | null>(null);
  const [qualityMetrics, setQualityMetrics] = useState<ScanQualityMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspectionId = id || 'insp-sample-01';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [narr, metrics] = await Promise.all([
          apiClient.getSmartReportNarrative(inspectionId),
          apiClient.getLiveScanQualityMetrics()
        ]);
        setNarrative(narr);
        setQualityMetrics(metrics);
      } catch (err: any) {
        setError(err.message || 'Failed to generate smart report');
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
        <p style={{ color: 'var(--color-text-secondary)' }}>Synthesizing smart report narrative & quality coaching metrics...</p>
      </div>
    );
  }

  if (error || !narrative || !qualityMetrics) {
    return (
      <div className="container" style={{ padding: '2rem 1rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h3>Unable to load Smart Report</h3>
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
            <FileText size={24} color="var(--color-primary)" />
            Smart Report & Evidentiary Coach
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Statutory Dossier for <strong>{narrative.productName}</strong> (Inspection #{inspectionId})
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => window.print()}
            className="btn btn-outline"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Printer size={16} /> Print / Export PDF
          </button>
        </div>
      </div>

      {/* Field Scan Quality Coach Overlay */}
      <ScanQualityCoachOverlay metrics={qualityMetrics} />

      {/* Smart Report Summary Panel */}
      <SmartReportSummaryPanel narrative={narrative} />
    </div>
  );
};
