import React, { useState } from 'react';
import { RefreshCw, CheckCircle, Sparkles } from 'lucide-react';

interface RescanButtonProps {
  onRescan: () => Promise<void>;
  disabled?: boolean;
}

export const RescanButton: React.FC<RescanButtonProps> = ({ onRescan, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await onRescan();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || loading}
      className="btn btn-primary"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.625rem 1.25rem',
        fontWeight: 600,
        fontSize: '0.9375rem',
        borderRadius: '8px'
      }}
    >
      {loading ? (
        <>
          <RefreshCw size={18} className="spin" />
          Computing Delta & Verifying...
        </>
      ) : (
        <>
          <Sparkles size={18} />
          Run Rescan & Verify Remediation
        </>
      )}
    </button>
  );
};
