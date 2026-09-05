import React from 'react';
import { TimelineEvent } from '../../shared/types';
import { ShieldCheck, User, Bot, Clock, Lock, Key, FileCheck } from 'lucide-react';

interface InspectionTimelineViewProps {
  events: TimelineEvent[];
  inspectionId: string;
}

export const InspectionTimelineView: React.FC<InspectionTimelineViewProps> = ({
  events,
  inspectionId
}) => {
  const getEventIcon = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'CAPTURE': return <User size={16} />;
      case 'OCR_EXTRACT':
      case 'RULE_EVALUATE': return <Bot size={16} />;
      case 'OVERRIDE': return <ShieldCheck size={16} />;
      case 'SEALED': return <Lock size={16} />;
      default: return <FileCheck size={16} />;
    }
  };

  const getEventBadge = (type: TimelineEvent['eventType']) => {
    switch (type) {
      case 'SEALED': return 'badge-success';
      case 'OVERRIDE': return 'badge-warning';
      case 'RULE_EVALUATE': return 'badge-primary';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="card" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
            Tamper-Evident Chain of Custody & Audit Timeline
          </h3>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            Statutory trail of evidence for Legal Metrology enforcement proceedings (Case #{inspectionId})
          </p>
        </div>
        <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
          <Lock size={12} /> Cryptographically Sealed
        </span>
      </div>

      <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--color-border)' }}>
        {events.map((evt, idx) => (
          <div
            key={evt.id}
            style={{
              position: 'relative',
              marginBottom: idx === events.length - 1 ? 0 : '1.75rem',
              paddingLeft: '1.25rem'
            }}
          >
            {/* Timeline node icon */}
            <div
              style={{
                position: 'absolute',
                left: '-2.25rem',
                top: '0.2rem',
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: 'var(--color-surface)',
                border: '2px solid var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary)'
              }}
            >
              {getEventIcon(evt.eventType)}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{evt.title}</span>
                  <span className={`badge ${getEventBadge(evt.eventType)}`}>{evt.eventType}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span>Actor: <strong>{evt.actorName}</strong> ({evt.actorRole})</span>
                  <span>•</span>
                  <span>{new Date(evt.timestamp).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--color-text)' }}>
              {evt.description}
            </div>

            {/* Cryptographic SHA-256 footprint */}
            <div
              style={{
                marginTop: '0.5rem',
                padding: '0.4rem 0.6rem',
                background: 'var(--color-background)',
                borderRadius: '4px',
                border: '1px solid var(--color-border)',
                fontFamily: 'monospace',
                fontSize: '0.7rem',
                color: 'var(--color-text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                overflowX: 'auto'
              }}
            >
              <Key size={12} />
              <span>SHA-256: {evt.sha256Hash}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
