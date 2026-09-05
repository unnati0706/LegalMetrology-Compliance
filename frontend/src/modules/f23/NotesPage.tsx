import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiClient } from '../../shared/api/client.js';
import { NotesEditor } from './NotesEditor.js';
import { NoteTimeline } from './NoteTimeline.js';
import { InspectorNote } from '../../shared/types/index.js';
import { ArrowLeft, MessageSquarePlus } from 'lucide-react';

export const NotesPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const inspectionId = id || 'insp-sample-01';

  const [notes, setNotes] = useState<InspectorNote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const res = await apiClient.getNotes(inspectionId);
      setNotes(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [inspectionId]);

  const handleAddNote = async (text: string, ruleTags: string[]) => {
    try {
      setSubmitting(true);
      await apiClient.addNote(inspectionId, text, ruleTags);
      await loadNotes();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          {id && (
            <button 
              onClick={() => navigate(`/inspections/${id}/heatmap`)} 
              className="btn btn-secondary btn-sm" 
              style={{ marginBottom: '0.5rem' }}
            >
              <ArrowLeft size={14} /> Back to Heatmap
            </button>
          )}
          <h1 style={{ fontSize: '1.75rem', color: 'var(--text-main)' }}>
            Inspector Notes & Finding Annotations (F23)
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Chronological field log, legal annotations, and tagged rule observations for inspection <strong style={{ color: 'var(--text-main)' }}>{inspectionId}</strong>.
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate(`/inspections/${inspectionId}/finalize`)} className="btn btn-primary btn-sm">
            Proceed to Finalize
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 420px) 1fr', gap: '1.5rem', alignItems: 'start' }}>
        <NotesEditor onAddNote={handleAddNote} isSubmitting={submitting} />

        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            Annotation Timeline ({notes.length})
          </h3>
          {loading ? (
            <div style={{ height: '120px', backgroundColor: 'var(--border-light)', borderRadius: 'var(--radius-lg)', animation: 'pulse 1.5s infinite' }} />
          ) : (
            <NoteTimeline notes={notes} />
          )}
        </div>
      </div>
    </div>
  );
};
