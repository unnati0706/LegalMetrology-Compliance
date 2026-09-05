import React, { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/client.js';
import { ReportRecord } from '../../shared/types/index.js';
import { ReportVersionList } from './ReportVersionList.js';
import { FileCheck, RefreshCw, AlertCircle } from 'lucide-react';

export const ReportsHistoryPage: React.FC = () => {
  const [reports, setReports] = useState<ReportRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadReports = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await apiClient.getReports();
      setReports(data);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to load report history');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <FileCheck color="var(--color-primary-light)" />
            National Report Repository & Audit History
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', margin: '0.25rem 0 0 0' }}>
            Central repository of all generated statutory inspection reports, certificates, and compliance exports.
          </p>
        </div>

        <button
          type="button"
          onClick={loadReports}
          className="btn btn-secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.875rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
          <button type="button" onClick={loadReports} className="btn btn-secondary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}>
            Retry
          </button>
        </div>
      )}

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[1, 2, 3].map(k => (
            <div key={k} className="skeleton" style={{ height: '70px', borderRadius: 'var(--radius-md)' }} />
          ))}
        </div>
      ) : (
        <ReportVersionList reports={reports} />
      )}
    </div>
  );
};
