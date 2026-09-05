import React from 'react';
import { OfflineQueueItem } from '../../shared/types';
import { formatDateTimeIST } from '../../shared/utils/dateUtils';
import { CheckCircle2, AlertTriangle, RefreshCw, HardDrive, Camera, ArrowRight, ShieldCheck } from 'lucide-react';

interface OfflineQueueListProps {
  items: OfflineQueueItem[];
  onSyncSingle: (id: string) => Promise<void>;
  onOpenConflict: (item: OfflineQueueItem) => void;
}

export const OfflineQueueList: React.FC<OfflineQueueListProps> = ({
  items,
  onSyncSingle,
  onOpenConflict
}) => {
  const getStatusBadge = (item: OfflineQueueItem) => {
    switch (item.syncStatus) {
      case 'SYNCED':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#dcfce7', color: '#15803d' }}>
            <CheckCircle2 size={13} /> Synced to Cloud
          </span>
        );
      case 'CONFLICT':
        return (
          <span className="badge badge-danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: '#fee2e2', color: '#b91c1c' }}>
            <AlertTriangle size={13} /> Sync Conflict
          </span>
        );
      case 'SYNCING':
        return (
          <span className="badge badge-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <RefreshCw size={13} className="spin" /> Syncing
          </span>
        );
      default:
        return (
          <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Pending Sync
          </span>
        );
    }
  };

  if (items.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-secondary)', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
        <CheckCircle2 size={40} color="#10b981" style={{ margin: '0 auto 0.75rem' }} />
        <h4 style={{ margin: 0, color: 'var(--color-text)', fontSize: '1.1rem' }}>Offline Queue is Empty</h4>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem' }}>All local records and evidence files have been fully synchronized with the cloud backend.</p>
      </div>
    );
  }

  return (
    <div className="table-container" style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '12px', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ background: 'var(--color-background)', borderBottom: '1px solid var(--color-border)' }}>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Product & Manufacturer</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Captured Sides</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Local Size</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Capture Time</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)' }}>Sync Status</th>
            <th style={{ padding: '0.875rem 1rem', fontWeight: 600, color: 'var(--color-text-secondary)', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600, color: 'var(--color-text)' }}>{item.productName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>{item.manufacturerName} • ID: {item.inspectionId}</div>
              </td>
              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                  {item.packageSidesCaptured.map(side => (
                    <span key={side} className="badge badge-secondary" style={{ fontSize: '0.7rem' }}>
                      {side}
                    </span>
                  ))}
                </div>
              </td>
              <td style={{ padding: '1rem', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.8125rem' }}>
                  <HardDrive size={14} /> {item.localSize} ({item.evidenceCount} files)
                </div>
              </td>
              <td style={{ padding: '1rem', fontSize: '0.8125rem', color: 'var(--color-text-secondary)' }}>
                {formatDateTimeIST(item.capturedAt)}
              </td>
              <td style={{ padding: '1rem' }}>
                {getStatusBadge(item)}
              </td>
              <td style={{ padding: '1rem', textAlign: 'right' }}>
                {item.hasConflict ? (
                  <button
                    onClick={() => onOpenConflict(item)}
                    className="btn btn-primary btn-sm"
                    style={{ background: '#dc2626', borderColor: '#dc2626', fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    Resolve Conflict
                  </button>
                ) : item.syncStatus !== 'SYNCED' ? (
                  <button
                    onClick={() => onSyncSingle(item.id)}
                    className="btn btn-outline btn-sm"
                    style={{ fontSize: '0.75rem', padding: '0.35rem 0.75rem' }}
                  >
                    Sync Now
                  </button>
                ) : (
                  <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 500 }}>Completed</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
