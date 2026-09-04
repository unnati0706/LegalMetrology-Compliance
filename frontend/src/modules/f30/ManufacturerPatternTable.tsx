import React from 'react';
import { ManufacturerPattern } from '../../shared/types/index.js';
import { RepeatViolationBadge } from './RepeatViolationBadge.js';
import { Building2, ShieldAlert, Send, FileWarning, Eye } from 'lucide-react';
import { RoleGate } from '../../shared/auth/RoleGate.js';

interface ManufacturerPatternTableProps {
  patterns: ManufacturerPattern[];
  onEscalate?: (id: string, status: ManufacturerPattern['escalationStatus']) => void;
}

export const ManufacturerPatternTable: React.FC<ManufacturerPatternTableProps> = ({
  patterns,
  onEscalate,
}) => {
  if (patterns.length === 0) {
    return (
      <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
        <Building2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
        <h3>No manufacturer pattern records found</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Try clearing your search query or adjusting the risk filter.
        </p>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={16} color="var(--color-primary-light)" />
            Manufacturer Recidivism & Risk Scoring ({patterns.length})
          </h3>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Track repeat violations under Section 36 of Legal Metrology Act, 2009 for escalated compounding/prosecution
          </div>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Manufacturer / Packer</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Category</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Audits / Violations</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Recidivism Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Risk Score</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Top Violated Rules</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)' }}>Enforcement Status</th>
              <th style={{ padding: '0.75rem 1rem', fontWeight: 600, color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patterns.map((mfg) => (
              <tr 
                key={mfg.id} 
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: mfg.riskLevel === 'HIGH' ? 'rgba(239, 68, 68, 0.03)' : 'transparent'
                }}
              >
                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{mfg.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ID: {mfg.id}</div>
                </td>

                <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                  {mfg.category}
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ fontWeight: 600 }}>{mfg.violationCount} / {mfg.totalInspections}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {Math.round((mfg.violationCount / mfg.totalInspections) * 100)}% non-compliant
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <RepeatViolationBadge repeatCount={mfg.repeatCount} riskLevel={mfg.riskLevel} />
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: mfg.riskScore >= 75 ? 'rgba(239, 68, 68, 0.15)' : mfg.riskScore >= 40 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                    color: mfg.riskScore >= 75 ? '#f87171' : mfg.riskScore >= 40 ? '#fbbf24' : '#4ade80',
                    fontWeight: 800,
                    fontSize: '0.85rem'
                  }}>
                    {mfg.riskScore}
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', maxWidth: '200px' }}>
                    {mfg.topViolatedRules.map(r => (
                      <span key={r} style={{
                        fontSize: '0.65rem',
                        padding: '0.1rem 0.35rem',
                        borderRadius: '3px',
                        backgroundColor: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-secondary)'
                      }}>
                        {r.replace('PCR-2011-', '')}
                      </span>
                    ))}
                  </div>
                </td>

                <td style={{ padding: '0.85rem 1rem' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    padding: '0.2rem 0.5rem',
                    borderRadius: '4px',
                    backgroundColor: mfg.escalationStatus === 'SHOW_CAUSE_PENDING' ? 'rgba(239, 68, 68, 0.2)' : mfg.escalationStatus === 'NOTICE_ISSUED' ? 'rgba(249, 115, 22, 0.2)' : 'rgba(99, 102, 241, 0.15)',
                    color: mfg.escalationStatus === 'SHOW_CAUSE_PENDING' ? '#f87171' : mfg.escalationStatus === 'NOTICE_ISSUED' ? '#fb923c' : '#a5b4fc'
                  }}>
                    {mfg.escalationStatus?.replace(/_/g, ' ') || 'MONITORING'}
                  </span>
                </td>

                <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                  <RoleGate allowedRoles={['SUPERVISOR', 'ADMIN']} fallback={<span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Read only</span>}>
                    <select
                      value={mfg.escalationStatus || 'MONITORING'}
                      onChange={(e) => onEscalate && onEscalate(mfg.id, e.target.value as any)}
                      className="form-input"
                      style={{ width: 'auto', fontSize: '0.75rem', padding: '0.3rem 0.5rem' }}
                      aria-label="Escalate enforcement status"
                    >
                      <option value="MONITORING">Monitoring</option>
                      <option value="NOTICE_ISSUED">Issue Statutory Notice</option>
                      <option value="SHOW_CAUSE_PENDING">Show Cause Notice</option>
                      <option value="RE_INSPECTION_SCHEDULED">Schedule Priority Re-Inspection</option>
                    </select>
                  </RoleGate>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
