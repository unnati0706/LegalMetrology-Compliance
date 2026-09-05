import React, { useState } from 'react';
import { Download, Copy, Check, FileCheck, HardDrive } from 'lucide-react';
import { ReportRecord } from '../../shared/types/index.js';

interface ReportDownloadLinkProps {
  report: ReportRecord;
}

export const ReportDownloadLink: React.FC<ReportDownloadLinkProps> = ({ report }) => {
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(report.sha256Hash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const handleDownload = () => {
    // Create mock download trigger
    const blob = new Blob([
      JSON.stringify({
        reportId: report.id,
        inspectionId: report.inspectionId,
        productName: report.productName,
        sha256: report.sha256Hash,
        disposition: report.summaryDisposition,
        officerRemarks: report.officerRemarks,
        exportedAt: report.generatedAt
      }, null, 2)
    ], { type: 'application/json' });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statutory-Report-${report.inspectionId}-${report.version}.${report.format.toLowerCase()}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.85rem 1.15rem',
      backgroundColor: 'var(--bg-surface-elevated)',
      borderRadius: 'var(--radius-md)',
      border: '1px solid var(--border-color)',
      gap: '1rem',
      flexWrap: 'wrap'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          padding: '0.5rem',
          backgroundColor: 'rgba(99, 102, 241, 0.15)',
          color: '#818cf8',
          borderRadius: 'var(--radius-md)'
        }}>
          <FileCheck size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {report.productName} ({report.version})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <span>Format: <strong>{report.format}</strong></span>
            <span>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
              <HardDrive size={12} /> {report.fileSize}
            </span>
            <span>•</span>
            <span>By {report.generatedBy}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={handleCopyHash}
          className="btn btn-secondary"
          style={{ fontSize: '0.75rem', padding: '0.4rem 0.65rem' }}
          title="Copy SHA-256 Checksum"
        >
          {copiedHash ? <Check size={14} color="#4ade80" /> : <Copy size={14} />}
          <span>{copiedHash ? 'Hash Copied' : 'SHA-256'}</span>
        </button>

        <button
          type="button"
          onClick={handleDownload}
          className="btn btn-primary"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Download size={15} />
          <span>Download {report.format}</span>
        </button>
      </div>
    </div>
  );
};
