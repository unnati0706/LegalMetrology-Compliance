import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X } from 'lucide-react';

export const PwaRegistration: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // Register Service Worker in production
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((reg) => {
          console.log('Legal Metrology ServiceWorker registered:', reg.scope);
        })
        .catch((err) => {
          console.warn('ServiceWorker registration error:', err);
        });
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showInstallBanner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '1rem',
        left: '1rem',
        background: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
        zIndex: 9990,
        maxWidth: '360px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem'
      }}
    >
      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--color-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Smartphone size={20} />
      </div>

      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Install Field App</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>Install PWA for offline inspections</div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          onClick={handleInstallClick}
          className="btn btn-primary btn-sm"
          style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
        >
          Install
        </button>
        <button
          onClick={() => setShowInstallBanner(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)' }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
};
