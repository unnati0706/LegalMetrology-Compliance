import React, { useState } from 'react';
import { EnforcementCase, FollowUpStatus } from '../../shared/types/index.js';
import { FollowUpStatusTag } from './FollowUpStatusTag.js';
import { AssignmentSelector } from './AssignmentSelector.js';
import { Briefcase, Calendar, ShieldCheck, FileText, Send, CheckCircle2, AlertOctagon, User } from 'lucide-react';
import { formatDateIST } from '../../shared/utils/dateUtils.js';
import { RoleGate } from '../../shared/auth/RoleGate.js';

interface CaseDetailPanelProps {
  caseItem: EnforcementCase;
  onUpdateStatus: (caseId: string, status: FollowUpStatus, note?: string) => Promise<void>;
  onAssign: (inspectorId: string, inspectorName: string, priority: EnforcementCase['priority']) => Promise<void>;
}

export const CaseDetailPanel: React.FC<CaseDetailPanelProps> = ({
  caseItem,
  onUpdateStatus,
  onAssign,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<FollowUpStatus>(caseItem.status);
  const [statusNote, setStatusNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(caseItem.id, selectedStatus, statusNote);
      setStatusNote('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-light)' }}>
            {caseItem.caseNumber}
          </div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0.25rem 0', color: 'var(--text-primary)' }}>
            {caseItem.title}
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Inspection ID: {caseItem.inspectionId} • Section: {caseItem.statutorySection}
          </div>
        </div>
        <FollowUpStatusTag status={caseItem.status} />
      </div>

      {/* Case Details Summary */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '0.75rem',
        padding: '0.85rem',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderRadius: 'var(--radius-md)',
        fontSize: '0.8rem'
      }}>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Manufacturer</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{caseItem.manufacturerName}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Category</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{caseItem.category}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Assigned Officer</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{caseItem.assignedInspectorName}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-muted)' }}>Resolution Due Date</div>
          <div style={{ fontWeight: 600, color: '#f87171' }}>{formatDateIST(caseItem.deadline)}</div>
        </div>
      </div>

      {/* Latest Note */}
      {caseItem.latestNote && (
        <div style={{ padding: '0.75rem', backgroundColor: 'rgba(99, 102, 241, 0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-primary-light)', marginBottom: '0.25rem' }}>
            Latest Case Officer Log:
          </div>
          <div style={{ fontSize: '0.825rem', color: 'var(--text-primary)' }}>
            "{caseItem.latestNote}"
          </div>
        </div>
      )}

      {/* Assignment Control */}
      <RoleGate allowedRoles={['SUPERVISOR', 'ADMIN']}>
        <AssignmentSelector
          currentInspectorId={caseItem.assignedInspectorId}
          currentPriority={caseItem.priority}
          onAssign={(id, name, priority) => onAssign(id, name, priority)}
        />
      </RoleGate>

      {/* Update Follow-up Status Form */}
      <RoleGate allowedRoles={['INSPECTOR', 'SUPERVISOR', 'ADMIN']}>
        <form onSubmit={handleStatusSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
          <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Advance Enforcement Milestone</div>
          
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as FollowUpStatus)}
            className="form-input"
            style={{ fontSize: '0.85rem' }}
          >
            <option value="NOTICE_PENDING">Statutory Rectification Notice Draft</option>
            <option value="HEARING_SCHEDULED">Compounding Hearing Scheduled</option>
            <option value="RE_INSPECTION_ASSIGNED">Re-Inspection / Batch Sampling Assigned</option>
            <option value="RESOLVED_COMPLIANT">Resolved Compliant & Compounded</option>
            <option value="ESCALATED_PROSECUTION">Escalate to Judicial Prosecution (Court Case)</option>
          </select>

          <textarea
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            rows={2}
            placeholder="Add follow-up notes, compounding payment ref, or hearing remarks..."
            className="form-input"
            style={{ fontSize: '0.8rem', resize: 'vertical' }}
          />

          <button
            type="submit"
            disabled={isUpdating}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Send size={14} />
            <span>Update Case Milestone</span>
          </button>
        </form>
      </RoleGate>
    </div>
  );
};
