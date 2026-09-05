import React, { createContext, useContext, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

export interface ToastNotification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
  timestamp: string;
}

interface NotificationContextType {
  notifications: ToastNotification[];
  addNotification: (notification: Omit<ToastNotification, 'id' | 'timestamp'>) => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<ToastNotification[]>([]);

  const addNotification = (n: Omit<ToastNotification, 'id' | 'timestamp'>) => {
    const newNotif: ToastNotification = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      ...n,
    };

    setNotifications(prev => [newNotif, ...prev]);

    // Auto-dismiss success and info toasts after 5 seconds
    if (n.type === 'success' || n.type === 'info') {
      setTimeout(() => {
        dismissNotification(newNotif.id);
      }, 5000);
    }
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <NotificationContext.Provider value={{ notifications, addNotification, dismissNotification, clearAll }}>
      {children}
      <ToastContainer notifications={notifications} onDismiss={dismissNotification} />
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) {
    return {
      notifications: [],
      addNotification: () => {},
      dismissNotification: () => {},
      clearAll: () => {},
    };
  }
  return context;
};

const ToastContainer: React.FC<{ notifications: ToastNotification[]; onDismiss: (id: string) => void }> = ({
  notifications,
  onDismiss
}) => {
  if (notifications.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '380px',
        width: '100%',
        pointerEvents: 'none'
      }}
    >
      {notifications.slice(0, 4).map(toast => {
        const getIcon = () => {
          switch (toast.type) {
            case 'success': return <CheckCircle2 size={18} color="#10b981" />;
            case 'warning': return <AlertTriangle size={18} color="#f59e0b" />;
            case 'error': return <XCircle size={18} color="#ef4444" />;
            default: return <Info size={18} color="#3b82f6" />;
          }
        };

        const getBorderColor = () => {
          switch (toast.type) {
            case 'success': return '#a7f3d0';
            case 'warning': return '#fde68a';
            case 'error': return '#fecaca';
            default: return '#bfdbfe';
          }
        };

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              background: 'var(--color-surface)',
              border: `1px solid ${getBorderColor()}`,
              borderRadius: '8px',
              padding: '0.875rem 1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem',
              animation: 'fadeIn 0.2s ease-in-out'
            }}
          >
            {getIcon()}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text)' }}>
                {toast.title}
              </div>
              {toast.message && (
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.15rem' }}>
                  {toast.message}
                </div>
              )}
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', padding: '0.2rem' }}
              aria-label="Close notification"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
