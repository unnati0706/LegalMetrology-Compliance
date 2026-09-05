import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client';
import { TimelineEvent } from '../../shared/types';
import { InspectionTimelineView } from './InspectionTimelineView';
import { ArrowLeft, Sparkles, ShieldCheck, FileText } from 'lucide-react';

export const InspectionTimelinePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const inspectionId = id || 'insp-sample-01';

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiClient.getInspectionTimeline(inspectionId);
        setEvents(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load timeline');
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
        <p style={{ color: 'var(--color-text-secondary)' }}>Verifying block seals and assembling timeline...</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <button
            onClick={() => navigate(`/inspections/${inspectionId}`)}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Inspection
          </button>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>
            Chain of Custody & Timeline
          </h1>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
            Inspection Record <strong>#{inspectionId}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link
            to={`/inspections/${inspectionId}/explainable-evidence`}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Sparkles size={16} /> Explainable Evidence
          </Link>
        </div>
      </div>

      <InspectionTimelineView
        events={events}
        inspectionId={inspectionId}
      />
    </div>
  );
};
