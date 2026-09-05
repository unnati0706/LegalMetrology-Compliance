import React from 'react';
import { InspectorNote } from '../../shared/types/index.js';
import { formatDateTimeIST } from '../../shared/utils/dateUtils.js';
import { MessageSquare, Clock, User, Tag } from 'lucide-react';

interface NoteTimelineProps {
  notes: InspectorNote[];
}

export const NoteTimeline: React.FC<NoteTimelineProps> = ({ notes }) => {
  if (notes.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
        <MessageSquare size={32} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
        <p style={{ fontSize: '0.9rem' }}>No inspector notes or observations recorded yet.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {notes.map((note) => (
        <div key={note.id} className="card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-100)',
                color: 'var(--color-primary-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.8rem',
                fontWeight: 700
              }}>
                <User size={14} />
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{note.authorName}</span>
                <span className="badge badge-neutral" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                  {note.authorRole}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
              <Clock size={13} />
              <span>{formatDateTimeIST(note.timestamp)}</span>
            </div>
          </div>

          <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            {note.text}
          </p>

          {note.ruleTags && note.ruleTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {note.ruleTags.map((tag) => (
                <span 
                  key={tag} 
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    fontSize: '0.7rem',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-light)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-primary-600)',
                    fontWeight: 600
                  }}
                >
                  <Tag size={10} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
