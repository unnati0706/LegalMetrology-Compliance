import React from 'react';
import { Inspection, CheckResult, Declaration, ReportRecord } from '../../shared/types/index.js';
import { formatDateTimeIST } from '../../shared/utils/dateUtils.js';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle2, QrCode, Hash, Calendar, MapPin, User, Building } from 'lucide-react';

interface ReportPreviewProps {
  inspection: Inspection;
  checks: CheckResult[];
  declarations: Declaration[];
  report?: ReportRecord;
  customOptions?: {
    includeEvidenceThumbnails?: boolean;
    legalNoticeHeader?: boolean;
    officerRemarks?: string;
  };
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({
  inspection,
  checks,
  declarations,
  report,
  customOptions,
}) => {
  const isCompliant = (inspection.overallDisposition === 'COMPLIANT') || (checks.every(c => c.status === 'PASS'));
  const violations = checks.filter(c => c.status === 'FLAG');
  const manualReviews = checks.filter(c => c.status === 'MANUAL_REVIEW');

  return (
    <div 
      className="card"
      style={{
        backgroundColor: '#ffffff',
        color: '#0f172a',
        padding: '2.5rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid #e2e8f0',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      {/* Official Watermark & Header */}
      {customOptions?.legalNoticeHeader !== false && (
        <div style={{
          borderBottom: '2px solid #0f172a',
          paddingBottom: '1.25rem',
          marginBottom: '1.75rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#64748b' }}>
              Government of India • Ministry of Consumer Affairs, Food & Public Distribution
            </div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.25rem 0', color: '#0f172a' }}>
              Legal Metrology Statutory Compliance Report
            </h1>
            <div style={{ fontSize: '0.825rem', color: '#475569' }}>
              Enforced under Legal Metrology Act, 2009 & Packaged Commodities Rules (PCR), 2011
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: 700,
              backgroundColor: isCompliant ? '#dcfce7' : '#fee2e2',
              color: isCompliant ? '#15803d' : '#b91c1c'
            }}>
              {isCompliant ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
              {isCompliant ? 'VERIFIED COMPLIANT' : 'STATUTORY VIOLATION FLAGGED'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.35rem' }}>
              Report Version: {report?.version || 'v1.0 (Draft Preview)'}
            </div>
          </div>
        </div>
      )}

      {/* Target Subject Details */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        backgroundColor: '#f8fafc',
        padding: '1.25rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '1.5rem',
        border: '1px solid #e2e8f0'
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Inspection ID</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{inspection.id}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Product Subject</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{inspection.productName}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Manufacturer / Packer</div>
          <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#0f172a' }}>{inspection.manufacturerName}</div>
        </div>
        <div>
          <div style={{ fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Location & Jurisdiction</div>
          <div style={{ fontSize: '0.85rem', color: '#334155' }}>{inspection.location || 'Maharashtra Zone'}</div>
        </div>
      </div>

      {/* Declarations Extraction Breakdown */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={16} color="#4f46e5" />
          1. Mandatory Rule 6 Declarations Assessment
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', textAlign: 'left', borderBottom: '1px solid #cbd5e1' }}>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#475569' }}>Field Name</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#475569' }}>Extracted Value</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#475569' }}>Package Side</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#475569' }}>OCR Confidence</th>
              <th style={{ padding: '0.5rem 0.75rem', fontWeight: 600, color: '#475569' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {declarations.map((d) => (
              <tr key={d.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>{d.field.toUpperCase().replace(/_/g, ' ')}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>{d.value}</td>
                <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{d.packageSide || 'PDP'}</td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <span style={{
                    color: d.confidence >= 0.85 ? '#16a34a' : '#d97706',
                    fontWeight: 600
                  }}>
                    {Math.round(d.confidence * 100)}%
                  </span>
                </td>
                <td style={{ padding: '0.5rem 0.75rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: d.status === 'VERIFIED' ? '#dcfce7' : '#e0e7ff',
                    color: d.status === 'VERIFIED' ? '#166534' : '#3730a3',
                    fontWeight: 600
                  }}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Statutory Violations & Rule Checks */}
      <div style={{ marginBottom: '1.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} color="#059669" />
          2. Statutory Rule Compliance Findings
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {checks.map((chk) => (
            <div 
              key={chk.id}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: chk.status === 'PASS' ? '#f0fdf4' : chk.status === 'FLAG' ? '#fef2f2' : '#fffbeb',
                border: `1px solid ${chk.status === 'PASS' ? '#bbf7d0' : chk.status === 'FLAG' ? '#fecaca' : '#fde68a'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{chk.ruleTitle}</span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b' }}>({chk.ruleCode})</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#475569', marginTop: '0.2rem' }}>{chk.explanation}</div>
                {chk.isOverridden && (
                  <div style={{ fontSize: '0.75rem', color: '#d97706', marginTop: '0.25rem', fontWeight: 600 }}>
                    Override Note: {chk.overrideReason} (By {chk.overriddenBy})
                  </div>
                )}
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.25rem 0.6rem',
                borderRadius: '4px',
                backgroundColor: chk.status === 'PASS' ? '#16a34a' : chk.status === 'FLAG' ? '#dc2626' : '#d97706',
                color: '#ffffff'
              }}>
                {chk.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Officer Remarks */}
      <div style={{
        padding: '1rem',
        backgroundColor: '#f8fafc',
        borderRadius: 'var(--radius-md)',
        border: '1px solid #e2e8f0',
        marginBottom: '1.75rem'
      }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
          Officer Assessment & Directions:
        </div>
        <div style={{ fontSize: '0.85rem', color: '#1e293b', fontStyle: 'italic' }}>
          "{customOptions?.officerRemarks || report?.officerRemarks || 'Inspection conducted with computerized optical recognition and rule verification engine. All findings stand certified under statutory authority.'}"
        </div>
      </div>

      {/* Cryptographic Hash & Digital Verification Sign-off */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: '1.25rem',
        borderTop: '1px dashed #cbd5e1',
        fontSize: '0.75rem',
        color: '#64748b'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            padding: '0.5rem',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <QrCode size={32} />
          </div>
          <div>
            <div style={{ fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Hash size={12} /> SHA-256 Tamper-Evident Digest
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: '0.65rem', color: '#475569', wordBreak: 'break-all', maxWidth: '340px' }}>
              {report?.sha256Hash || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: '#0f172a' }}>{inspection.inspectorName}</div>
          <div>Legal Metrology Officer (Inspector Grade I)</div>
          <div>Generated: {formatDateTimeIST(report?.generatedAt || Date.now())}</div>
        </div>
      </div>
    </div>
  );
};
