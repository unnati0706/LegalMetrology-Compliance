import React from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface SyncStatusIndicatorProps {
  isOnline: boolean;
  pendingCount: number;
  isSyncing: boolean;
  onSyncAll: () => void;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  isOnline,
  pendingCount,
  isSyncing,
  onSyncAll
}) => {
  return (
    <div
      className="card"
      style={{
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            background: isOnline ? '#ecfdf5' : '#fef2f2',
            color: isOnline ? '#059669' : '#dc2626'
          }}
        >
          {isOnline ? <Wifi size={24} /> : <WifiOff size={24} />}
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>
              {isOnline ? 'Online - Live Cloud Sync Connected' : 'Offline Mode Active'}
            </h4>
            <span className={`badge ${isOnline ? 'badge-success' : 'badge-danger'}`}>
              {isOnline ? 'Connected' : 'Disconnected'}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginTop: '0.2rem' }}>
            {pendingCount > 0
              ? `${pendingCount} offline inspection(s) queued for cloud sync.`
              : 'All field inspection records & evidence hashes are synchronized.'}
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <button
          onClick={onSyncAll}
          disabled={!isOnline || isSyncing || pendingCount === 0}
          className="btn btn-primary"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.625rem 1.25rem',
            fontWeight: 600,
            fontSize: '0.875rem'
          }}
        >
          {isSyncing ? (
            <>
              <RefreshCw size={16} className="spin" />
              Syncing Queue...
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              Sync All ({pendingCount})
            </>
          )}
        </button>
      </div>
    </div>
  );
};
