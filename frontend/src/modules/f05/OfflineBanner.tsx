import React, { useState, useEffect } from 'react';
import { WifiOff, HardDrive, RefreshCw } from 'lucide-react';

export const OfflineBanner: React.FC<{ pendingSyncCount?: number }> = ({ pendingSyncCount = 0 }) => {
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

  if (isOnline && pendingSyncCount === 0) return null;

  return (
    <div
      role="status"
      style={{
        background: isOnline ? '#eff6ff' : '#451a03',
        color: isOnline ? '#1e40af' : '#fef3c7',
        padding: '0.5rem 1rem',
        fontSize: '0.8125rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${isOnline ? '#bfdbfe' : '#78350f'}`,
        fontWeight: 500
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {!isOnline ? <WifiOff size={16} color="#fbbf24" /> : <HardDrive size={16} />}
        <span>
          {!isOnline
            ? 'Field Terminal Offline: New inspections & evidence photos are queued locally.'
            : `${pendingSyncCount} offline inspections ready for synchronization.`}
        </span>
      </div>

      <a
        href="/inspections/offline-queue"
        style={{
          color: 'inherit',
          textDecoration: 'underline',
          fontSize: '0.75rem',
          fontWeight: 600
        }}
      >
        View Offline Queue
      </a>
    </div>
  );
};
