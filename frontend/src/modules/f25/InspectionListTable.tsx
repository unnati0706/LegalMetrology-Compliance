import React from 'react';
import { Inspection } from '../../shared/types/index.js';
import { Layers, CheckCircle2, AlertTriangle, Clock, ArrowRight, Eye, ChevronRight } from 'lucide-react';

interface InspectionListTableProps {
  inspections: Inspection[];
  onSelectInspection: (inspection: Inspection) => void;
}

export const InspectionListTable: React.FC<InspectionListTableProps> = ({
  inspections,
  onSelectInspection,
}) => {
  const getStatusBadge = (status: string, disposition?: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="badge badge-pass">COMPLIANT</span>;
      case 'FLAGGED':
        return <span className="badge badge-flag">{disposition || 'NON-COMPLIANT'}</span>;
      case 'MANUAL_REVIEW_REQUIRED':
        return <span className="badge badge-review">REVIEW REQUIRED</span>;
      case 'IN_REVIEW':
        return <span className="badge badge-review">IN REVIEW</span>;
      default:
        return <span className="badge badge-neutral">{status}</span>;
    }
  };

  if (inspections.length === 0) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '3.5rem', color: 'var(--text-muted)' }}>
        <Clock size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.5 }} />
        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>No Inspections Found</h3>
        <p style={{ fontSize: '0.85rem' }}>Try adjusting your search criteria or filter tags.</p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
        <thead>
          <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-light)', color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <th style={{ padding: '0.85rem 1.25rem' }}>Product & Brand</th>
            <th style={{ padding: '0.85rem 1rem' }}>Category</th>
            <th style={{ padding: '0.85rem 1rem' }}>Manufacturer & Location</th>
            <th style={{ padding: '0.85rem 1rem' }}>Status</th>
            <th style={{ padding: '0.85rem 1rem' }}>Findings Summary</th>
            <th style={{ padding: '0.85rem 1.25rem', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inspections.map((insp) => (
            <tr
              key={insp.id}
              onClick={() => onSelectInspection(insp)}
              style={{
                borderBottom: '1px solid var(--border-light)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-primary-50)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <td style={{ padding: '1rem 1.25rem' }}>
                <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                  {insp.productName}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Brand: {insp.brand || 'N/A'} • Rule Version: {insp.ruleVersion}
                </div>
              </td>

              <td style={{ padding: '1rem' }}>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.8rem',
                  fontWeight: 600
                }}>
                  {insp.category}
                </span>
              </td>

              <td style={{ padding: '1rem' }}>
                <div style={{ fontWeight: 600 }}>{insp.manufacturerName}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{insp.location}</div>
              </td>

              <td style={{ padding: '1rem' }}>
                {getStatusBadge(insp.status, insp.overallDisposition)}
              </td>

              <td style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--color-pass-solid)', fontWeight: 600 }}>
                    ✓ {insp.declarationsCount} Decs
                  </span>
                  {insp.violationsCount > 0 && (
                    <span style={{ color: 'var(--color-flag-solid)', fontWeight: 600 }}>
                      ⚠️ {insp.violationsCount} Flags
                    </span>
                  )}
                  {insp.manualReviewCount > 0 && (
                    <span style={{ color: 'var(--color-review-solid)', fontWeight: 600 }}>
                      ⏳ {insp.manualReviewCount} Review
                    </span>
                  )}
                </div>
              </td>

              <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectInspection(insp);
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '0.35rem 0.65rem' }}
                >
                  <Eye size={14} /> Open
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
