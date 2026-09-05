import React from 'react';
import { OfflineQueueItem } from '../../shared/types';
import { formatDateTimeIST } from '../../shared/utils/dateUtils';
import { AlertTriangle, X, Server, Smartphone, Check } from 'lucide-react';

interface ConflictResolutionModalProps {
  item: OfflineQueueItem;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (itemId: string, strategy: 'SERVER_WINS' | 'LOCAL_WINS') => void;
}

export const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({
  item,
  isOpen,
  onClose,
  onResolve
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
    >
      <div
        className="card"
        style={{
          background: 'var(--color-surface)',
          borderRadius: '14px',
          padding: '1.75rem',
          maxWidth: '650px',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>Sync Conflict Detected</h3>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Inspection ID: {item.inspectionId}</div>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ padding: '0.4rem', borderRadius: '50%' }}>
            <X size={16} />
          </button>
        </div>

        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.25rem' }}>
          This record for <strong>{item.productName}</strong> was modified concurrently by another field officer or updated on the central registry server.
        </p>

        {/* Conflict Differences Box */}
        <div style={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '8px', padding: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text)' }}>
            Detected Divergences:
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
            {item.conflictDetails?.fieldDifferences.map((diff, index) => (
              <li key={index} style={{ marginBottom: '0.35rem' }}>{diff}</li>
            ))}
          </ul>
        </div>

        {/* Comparison columns */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <Smartphone size={16} color="var(--color-primary)" /> Local Device Version
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Captured: {formatDateTimeIST(item.capturedAt)}
            </div>
            <div style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
              Evidence items: <strong>{item.evidenceCount} photos ({item.localSize})</strong>
            </div>
          </div>

          <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', background: 'var(--color-surface)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              <Server size={16} color="#d97706" /> Central Registry Server
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              Updated by: {item.conflictDetails?.serverInspector || 'Central Node'}
            </div>
            <div style={{ fontSize: '0.8125rem', marginTop: '0.5rem' }}>
              Server Timestamp: <strong>{item.conflictDetails?.serverVersionDate ? formatDateTimeIST(item.conflictDetails.serverVersionDate) : 'N/A'}</strong>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => onResolve(item.id, 'SERVER_WINS')}
            className="btn btn-outline"
            style={{ fontSize: '0.875rem' }}
          >
            Overwrite with Server Version
          </button>
          <button
            onClick={() => onResolve(item.id, 'LOCAL_WINS')}
            className="btn btn-primary"
            style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Check size={16} /> Keep Local Version & Force Push
          </button>
        </div>
      </div>
    </div>
  );
};
