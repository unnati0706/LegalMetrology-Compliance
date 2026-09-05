import React from 'react';
import { ReportRecord } from '../../shared/types/index.js';
import { ReportDownloadLink } from '../f26/ReportDownloadLink.js';
import { History, FileCheck, Filter, ShieldCheck, AlertTriangle } from 'lucide-react';

interface ReportVersionListProps {
  reports: ReportRecord[];
  onSelectReport?: (report: ReportRecord) => void;
}

export const ReportVersionList: React.FC<ReportVersionListProps> = ({ reports, onSelectReport }) => {
  if (reports.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <History size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>No generated reports found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Generate a statutory inspection report from Module F26 to populate the tamper-evident archive.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="var(--color-primary-light)" />
          Statutory Report Archives & Versions ({reports.length})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {reports.map((report) => (
          <ReportDownloadLink key={report.id} report={report} />
        ))}
      </div>
    </div>
  );
};
