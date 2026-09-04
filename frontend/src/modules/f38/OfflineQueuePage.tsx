import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client';
import { OfflineQueueItem } from '../../shared/types';
import { SyncStatusIndicator } from './SyncStatusIndicator';
import { OfflineQueueList } from './OfflineQueueList';
import { ConflictResolutionModal } from './ConflictResolutionModal';
import { HardDriveDownload, AlertCircle, RefreshCw, Layers } from 'lucide-react';

export const OfflineQueuePage: React.FC = () => {
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [activeConflictItem, setActiveConflictItem] = useState<OfflineQueueItem | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const fetchQueue = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getOfflineQueue();
      setQueue(data);
    } catch (err: any) {
      console.error('Failed to load offline queue:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleSyncAll = async () => {
    setIsSyncing(true);
    try {
      for (const item of queue.filter(q => q.syncStatus !== 'SYNCED' && !q.hasConflict)) {
        await apiClient.syncOfflineItem(item.id);
      }
      await fetchQueue();
    } catch (err: any) {
      alert(`Sync failed: ${err.message}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSyncSingle = async (itemId: string) => {
    try {
      const updated = await apiClient.syncOfflineItem(itemId);
      setQueue(prev => prev.map(item => item.id === itemId ? updated : item));
    } catch (err: any) {
      alert(`Sync error: ${err.message}`);
    }
  };

  const handleResolveConflict = async (itemId: string, strategy: 'SERVER_WINS' | 'LOCAL_WINS') => {
    try {
      const updated = await apiClient.resolveOfflineConflict(itemId, strategy);
      setQueue(prev => prev.map(item => item.id === itemId ? updated : item));
      setActiveConflictItem(null);
    } catch (err: any) {
      alert(`Conflict resolution error: ${err.message}`);
    }
  };

  const pendingCount = queue.filter(item => item.syncStatus !== 'SYNCED').length;

  return (
    <div className="container" style={{ padding: '1.5rem 1rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <HardDriveDownload size={26} color="var(--color-primary)" />
          Offline Inspection Queue & Cloud Synchronization
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
          Store inspections locally in indexed storage when field connectivity is unavailable. Automatically sync when connection restores.
        </p>
      </div>

      {/* Sync Status Banner */}
      <div style={{ marginBottom: '1.5rem' }}>
        <SyncStatusIndicator
          isOnline={isOnline}
          pendingCount={pendingCount}
          isSyncing={isSyncing}
          onSyncAll={handleSyncAll}
        />
      </div>

      {/* Queue List Table */}
      <div style={{ marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600 }}>
            Cached Inspections on This Terminal ({queue.length})
          </h2>
          <button
            onClick={fetchQueue}
            className="btn btn-outline btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <RefreshCw size={14} /> Refresh Cache
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner" style={{ margin: '2rem auto' }} />
        ) : (
          <OfflineQueueList
            items={queue}
            onSyncSingle={handleSyncSingle}
            onOpenConflict={(item) => setActiveConflictItem(item)}
          />
        )}
      </div>

      {/* Conflict Resolution Modal */}
      {activeConflictItem && (
        <ConflictResolutionModal
          item={activeConflictItem}
          isOpen={Boolean(activeConflictItem)}
          onClose={() => setActiveConflictItem(null)}
          onResolve={handleResolveConflict}
        />
      )}
    </div>
  );
};
